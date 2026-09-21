import { readFileSync, statSync, realpathSync, mkdtempSync, rmSync, lstatSync } from 'node:fs';
import { isAbsolute, relative, join } from 'node:path';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';
import { scanConfiguration } from './config-scan.mjs';
import { runtimeStore, object, cleanText } from './runtime-store.mjs';
import { runCommand, requireResult, redact } from './process.mjs';

const levels = { info: 0, low: 1, medium: 2, high: 3, critical: 4 };
const safe = (value, limit = 1000) =>
  redact(String(value || ''))
    .replace(/\b(?:sk-|xox[bprs]-|AIza|AKIA)[A-Za-z0-9_-]{12,}/g, '[REDACTED]')
    .replace(/\u001b\[[0-?]*[ -/]*[@-~]/g, '')
    .slice(0, limit);
const hashBinary = (path) => {
  if (!isAbsolute(path)) throw Error('Use an absolute reviewed executable path.');
  const full = realpathSync(path),
    stat = statSync(full);
  if (!stat.isFile() || stat.size > 32 * 1024 * 1024)
    throw Error('Executable must be a regular file below 32 MiB.');
  return { binary: full, sha256: createHash('sha256').update(readFileSync(full)).digest('hex') };
};
export function auditReport(
  scan,
  { format = 'json', failOn = 'high', requireComplete = false } = {},
) {
  if (
    !['json', 'markdown', 'sarif'].includes(format) ||
    !Object.hasOwn(levels, failOn) ||
    typeof requireComplete !== 'boolean'
  )
    throw Error('Invalid report controls.');
  const failed =
    scan.findings.some((f) => levels[f.severity] >= levels[failOn]) ||
    (requireComplete && scan.coverage === 'partial') ||
    scan.deepAnalysis?.status === 'incomplete';
  let report = scan;
  if (format === 'markdown') {
    const escape = (value) => String(value).replaceAll('|', '\\|').replaceAll('\n', ' ');
    report =
      `# Agent configuration audit\n\nCoverage: ${scan.coverage}. ${scan.note}\n\n| Severity | File | Rule | Finding | Remediation |\n| --- | --- | --- | --- | --- |\n` +
      scan.findings
        .map(
          (f) =>
            `| ${f.severity} | ${escape(f.file)}:${f.line || 1} | ${escape(f.rule)} | ${escape(f.message)} | ${escape(f.remediation || '')} |`,
        )
        .join('\n') +
      `\n\nSkipped: ${JSON.stringify(scan.skipped || [])}\n`;
    if (scan.deepAnalysis)
      report +=
        `\n## External model analysis (${scan.deepAnalysis.status})\n\nUntrusted external output; requires review.\n\n` +
        scan.deepAnalysis.text
          .split('\n')
          .map((line) => `> ${line}`)
          .join('\n') +
        '\n';
  }
  if (format === 'sarif')
    report = {
      version: '2.1.0',
      $schema: 'https://json.schemastore.org/sarif-2.1.0.json',
      runs: [
        {
          tool: {
            driver: {
              name: 'just-vibe',
              rules: [...new Set(scan.findings.map((f) => f.rule))].map((id) => ({ id })),
            },
          },
          results: scan.findings.map((f) => ({
            ruleId: f.rule,
            level: levels[f.severity] >= 3 ? 'error' : levels[f.severity] >= 1 ? 'warning' : 'note',
            message: { text: `${f.message} ${f.remediation || ''}`.trim() },
            locations: [
              {
                physicalLocation: {
                  artifactLocation: { uri: f.file.split('/').map(encodeURIComponent).join('/') },
                  region: { startLine: f.line || 1 },
                },
              },
            ],
            properties: { severity: f.severity, confidence: f.confidence || 'static-indicator' },
          })),
          invocations: [
            {
              executionSuccessful:
                scan.coverage !== 'partial' && scan.deepAnalysis?.status !== 'incomplete',
              properties: {
                coverage: scan.coverage,
                skipped: scan.skipped,
                deepAnalysis: scan.deepAnalysis,
              },
            },
          ],
        },
      ],
    };
  return { format, failed, exitCode: failed ? 2 : 0, report };
}
export async function securityAudit(root, operation, payload = {}, options = {}) {
  if (operation === 'report') {
    object(payload, ['paths', 'format', 'failOn', 'requireComplete']);
    const { paths, ...controls } = payload;
    return auditReport(scanConfiguration(root, paths ? { paths } : {}), controls);
  }
  const store = runtimeStore(root, options),
    state = store.get('security-runner') || { revision: 0, runner: null, trusted: false };
  if (operation === 'status')
    return {
      ...state,
      note: 'AgentShield is optional and separately installed. Trust pins the entrypoint bytes and declared version, not the transitive dependency tree or an audit certification. Review its installation provenance and dependencies separately.',
    };
  if (operation === 'configure') {
    object(payload, ['revision', 'binary', 'sha256', 'version', 'source']);
    const identity = hashBinary(payload.binary);
    if (identity.sha256 !== payload.sha256 || !/^\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(payload.version))
      throw Error('Supply the reviewed executable SHA-256 and exact version.');
    const source = cleanText(payload.source, 'reviewed source', 1000);
    if (!source.startsWith('https://'))
      throw Error('Record the reviewed HTTPS source or release URL.');
    return store.put(
      'security-runner',
      { runner: { ...identity, version: payload.version, source }, trusted: false },
      payload.revision,
    );
  }
  if (['trust', 'untrust'].includes(operation)) {
    object(payload, ['revision', 'sha256']);
    if (
      !state.runner ||
      (operation === 'trust' &&
        (payload.sha256 !== state.runner.sha256 ||
          hashBinary(state.runner.binary).sha256 !== state.runner.sha256))
    )
      throw Error('Inspect and confirm the configured executable hash.');
    return store.put(
      'security-runner',
      { ...state, trusted: operation === 'trust' },
      payload.revision,
    );
  }
  if (operation !== 'run') throw Error('Unknown security audit operation.');
  object(payload, ['deep', 'format', 'failOn']);
  // Reject invalid controls before invoking an optional external process.
  auditReport({ findings: [], coverage: 'external-tool' }, payload);
  if (payload.deep !== undefined && typeof payload.deep !== 'boolean')
    throw Error('deep must be boolean.');
  if (!state.trusted || !state.runner)
    throw Error(
      'No trusted AgentShield runner. Configure and trust a separately reviewed installation first.',
    );
  if (hashBinary(state.runner.binary).sha256 !== state.runner.sha256)
    throw Error('AgentShield executable changed; review and trust the new identity.');
  const run = options.run || runCommand;
  const version = requireResult(
    await run([state.runner.binary, '--version'], { cwd: root, timeoutMs: 5000, maxBytes: 4000 }),
  ).trim();
  if (
    !new RegExp(
      `(?:^|\\s)v?${state.runner.version.replaceAll('.', '\\.').replaceAll('-', '\\-')}(?:$|\\s)`,
    ).test(version)
  )
    throw Error('Installed AgentShield version differs from the reviewed version.');
  const temporary = payload.deep ? mkdtempSync(join(tmpdir(), 'just-vibe-audit-')) : null;
  const argv = [
    state.runner.binary,
    'scan',
    '--path',
    store.root,
    '--format',
    'json',
    ...(payload.deep
      ? [
          '--opus',
          '--output',
          join(temporary, 'report.json'),
          '--log',
          join(temporary, 'log.json'),
          '--log-format',
          'json',
        ]
      : []),
  ];
  let result, deepAnalysis;
  try {
    const execution = await run(argv, {
      cwd: root,
      timeoutMs: payload.deep ? 120000 : 30000,
      maxBytes: 1024 * 1024,
    });
    const raw = requireResult(execution, [0, 2]);
    const boundedJson = (file) => {
      const stat = lstatSync(file);
      if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 1024 * 1024)
        throw Error('Invalid external report artifact.');
      return JSON.parse(readFileSync(file, 'utf8'));
    };
    result = temporary ? boundedJson(join(temporary, 'report.json')) : JSON.parse(raw);
    if (temporary) {
      const log = boundedJson(join(temporary, 'log.json'));
      if (!Array.isArray(log) || log.length > 5000) throw Error('Invalid external analysis log.');
      const completed = log.some(
        (entry) =>
          entry.phase === 'opus' &&
          entry.level === 'info' &&
          entry.message === 'Opus analysis complete',
      );
      const failed = log.some((entry) => entry.phase === 'opus' && entry.level === 'error');
      deepAnalysis = {
        status: completed && !failed ? 'completed' : 'incomplete',
        text: safe(raw + '\n' + (execution.stderr || ''), 16000),
        note: 'Vendor-reported execution status and redacted terminal analysis. Untrusted model output; not independent verification. The severity gate evaluates static findings, not model judgment.',
      };
    }
  } finally {
    if (temporary) rmSync(temporary, { recursive: true, force: true });
  }
  if (!Array.isArray(result.findings) || result.findings.length > 5000)
    throw Error('Unsupported or oversized AgentShield report.');
  // Omit evidence snippets and redact recognizable credentials in bounded external descriptions.
  const findings = result.findings.map((f, i) => {
    const file =
      typeof f.file === 'string'
        ? (isAbsolute(f.file) ? relative(store.root, f.file) : f.file).replaceAll('\\', '/')
        : 'external-report';
    return {
      rule: `agentshield-${safe(f.ruleId || f.rule || f.id || i)
        .replace(/[^a-zA-Z0-9_-]/g, '')
        .slice(0, 80)}`,
      severity: String(f.severity || 'info').toLowerCase(),
      file: file.startsWith('../') || isAbsolute(file) ? 'external-report' : safe(file),
      line: Number.isInteger(f.line) && f.line > 0 ? f.line : 1,
      message: safe(f.title || f.message || 'External configuration finding.'),
      remediation: safe(f.remediation || f.fix?.description || ''),
      confidence: 'external-tool',
    };
  });
  if (findings.some((f) => !Object.hasOwn(levels, f.severity)))
    throw Error('Unknown external severity.');
  return {
    ...auditReport(
      {
        findings,
        skipped: [],
        coverage: 'external-tool',
        ...(deepAnalysis ? { deepAnalysis } : {}),
        note: 'External tool output, not independently verified. Source snippets omitted. Deep analysis may use a paid model account.',
      },
      payload,
    ),
    runner: { version: state.runner.version, sha256: state.runner.sha256 },
    deep: !!payload.deep,
  };
}
