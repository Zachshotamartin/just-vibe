import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RULE_PACKS } from './rule-packs.mjs';
import { runCommand, redact } from './process.mjs';
import { trustedCommand } from './trusted-runners.mjs';
import { boundedList, integer } from './capability-io.mjs';
import { within, privateName, projectRoot } from './storage.mjs';
import { cleanText, object } from './runtime-store.mjs';

// Structural rules are the mechanically checkable subset of the prose rule packs, written for
// ast-grep. Each file is JSON (valid YAML) so validation needs no YAML parser, and names the prose
// rule it checks by pack and 1-based index.
const RULES_DIR = fileURLToPath(new URL('../../rules/structural/', import.meta.url));
export const SCANNER_RUNNER = 'ast-grep';

export function structuralRules(directory = RULES_DIR) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).filter(d => d.isDirectory()).flatMap(pack =>
    readdirSync(join(directory, pack.name)).filter(name => name.endsWith('.yml')).sort().map(name => {
      const path = join(directory, pack.name, name), rule = JSON.parse(readFileSync(path, 'utf8'));
      const prose = RULE_PACKS.find(p => p.id === rule.metadata?.pack)?.rules[rule.metadata?.rule - 1];
      return { id: rule.id, pack: pack.name, language: rule.language, severity: rule.severity, message: rule.message, prose: prose || null, path, source: rule };
    }));
}

function scanTargets(root, paths) {
  return boundedList(paths, 'paths', 200).map(value => {
    const path = within(root, cleanText(value, 'path', 1000));
    if (privateName(basename(path))) throw Error('Private files are not scanned.');
    if (!existsSync(path)) throw Error(`No such path: ${value}`);
    return path;
  });
}

// ast-grep is also published as sg, a name Linux distributions use for shadow-utils' sg; a
// trusted binary must identify itself as ast-grep before it scans anything.
async function scanner(root, options) {
  const trusted = trustedCommand(root, SCANNER_RUNNER, options);
  if (!trusted) return { unavailable: `Configure and trust ast-grep first: runners configure {"id":"${SCANNER_RUNNER}","revision":<current>,"config":{"command":["ast-grep"],"purpose":"structural rules"}}, review it, then runners trust with its hash. just-vibe appends the scan arguments to the trusted command.` };
  const run = options.runCommand || runCommand;
  const version = await run([...trusted.command, '--version'], { cwd: root, timeoutMs: 5000, maxBytes: 4096 });
  if (version.status !== 0 || !/ast-grep/i.test(version.stdout)) return { unavailable: 'The trusted ast-grep runner did not identify itself as ast-grep (sg may be a different program on this system).' };
  return { command: trusted.command, hash: trusted.hash, version: version.stdout.trim().slice(0, 100), run };
}

export async function structuralScan(root, payload, options = {}) {
  object(payload, ['paths', 'packs', 'timeoutMs']);
  root = projectRoot(root);
  const packs = boundedList(payload.packs ?? [...new Set(structuralRules().map(r => r.pack))], 'packs', 30);
  const rules = structuralRules().filter(r => packs.includes(r.pack));
  if (!rules.length) throw Error(`No structural rules for ${packs.join(', ') || 'the selected packs'}. Packs with rules: ${[...new Set(structuralRules().map(r => r.pack))].join(', ')}.`);
  const targets = scanTargets(root, payload.paths ?? ['.']), tool = await scanner(root, options);
  if (tool.unavailable) return { status: 'unavailable', reason: tool.unavailable };
  // One multi-document rule file keeps quoted rule text off the command line (Windows shims).
  const directory = mkdtempSync(join(tmpdir(), 'jv-structural-')), ruleFile = join(directory, 'rules.yml');
  let result;
  try {
    writeFileSync(ruleFile, rules.map(r => JSON.stringify(r.source)).join('\n---\n') + '\n');
    result = await tool.run([...tool.command, 'scan', '--rule', ruleFile, '--json=stream', ...targets], { cwd: root, timeoutMs: integer(payload.timeoutMs ?? 30000, 'timeoutMs', 1000, 120000), maxBytes: 2 * 1024 * 1024 });
  } finally { rmSync(directory, { recursive: true, force: true }); }
  // ast-grep exits 1 when an error-severity rule matches; other failures leave no usable stream.
  if (result.error || result.timedOut || result.truncated || ![0, 1].includes(result.status)) return { status: 'failed', reason: redact(result.error || (result.timedOut ? 'ast-grep timed out.' : result.truncated ? 'ast-grep output exceeded 2 MiB.' : result.stderr.trim() || `ast-grep exited ${result.status}.`)).slice(0, 1000) };
  const byId = new Map(rules.map(r => [r.id, r])), findings = [];
  for (const line of result.stdout.split('\n')) {
    if (!line.trim()) continue;
    let match;
    try { match = JSON.parse(line); } catch { return { status: 'failed', reason: 'ast-grep returned output that is not its JSON stream.' }; }
    const rule = byId.get(match.ruleId);
    if (!rule) continue;
    const file = within(root, match.file);
    findings.push({ path: relative(root, file).replaceAll('\\', '/'), line: match.range.start.line + 1, column: match.range.start.column + 1, ruleId: rule.id, pack: rule.pack,
      severity: match.severity || rule.severity, message: rule.message, prose: rule.prose, text: redact(String(match.text || '')).slice(0, 200) });
  }
  return { status: 'ok', scanner: tool.version, runnerHash: tool.hash, rules: rules.map(r => r.id), findings: findings.slice(0, 200), truncated: findings.length > 200,
    method: 'ast-grep structural rules: syntax patterns, not type or data-flow analysis. A finding is a review prompt, not proof of a defect.' };
}

export async function structural(root, operation, payload = {}, options = {}) {
  if (operation === 'rules') {
    object(payload, ['pack']);
    return { rules: structuralRules().filter(r => !payload.pack || r.pack === payload.pack).map(({ source, path, ...rule }) => rule) };
  }
  if (operation === 'status') {
    object(payload, []);
    const trusted = trustedCommand(root, SCANNER_RUNNER, options);
    return { runner: SCANNER_RUNNER, trusted: Boolean(trusted), ...(trusted ? { hash: trusted.hash } : {}), packs: [...new Set(structuralRules().map(r => r.pack))] };
  }
  if (operation === 'scan') return structuralScan(root, payload, options);
  throw Error('Unknown structural operation.');
}
