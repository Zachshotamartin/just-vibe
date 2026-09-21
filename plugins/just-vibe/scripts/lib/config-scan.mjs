import { existsSync, lstatSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { within, projectRoot } from './storage.mjs';
import { object } from './runtime-store.mjs';
import { structuredConfigurations, unsafeHttp, unpinnedRunner } from './configuration-values.mjs';
import { PROJECT_HOST_PATHS } from './host-paths.mjs';

const configRoots = PROJECT_HOST_PATHS;
export function scanConfiguration(root, payload = {}) {
  root = projectRoot(root);
  object(payload, ['paths']);
  const paths = payload.paths ?? configRoots;
  if (
    !Array.isArray(paths) ||
    paths.length > 30 ||
    paths.some((p) => typeof p !== 'string' || p.length > 300)
  )
    throw Error('paths must contain at most 30 project-relative configuration paths.');
  const findings = [],
    skipped = [],
    files = [];
  let bytes = 0,
    visited = 0;
  const add = (rule, severity, file, line, message, remediation) =>
    findings.push({
      rule,
      severity,
      file,
      line,
      message,
      remediation,
      confidence:
        /(?:^|\/)(?:docs|examples|templates|references)\//.test(file) || /\.md$/.test(file)
          ? 'document-indicator'
          : 'configuration-indicator',
    });
  function inspect(path) {
    if (++visited > 2000) {
      if (!skipped.includes('file-count-limit')) skipped.push('file-count-limit');
      return;
    }
    let full;
    try {
      full = within(root, path);
    } catch {
      skipped.push({ path, reason: 'outside root or symlink' });
      return;
    }
    if (!existsSync(full)) return;
    const stat = lstatSync(full);
    if (stat.isDirectory()) {
      for (const name of readdirSync(full).sort())
        if (!['node_modules', '.git', 'cache'].includes(name)) inspect(join(path, name));
      return;
    }
    if (!stat.isFile() || !/\.(md|mdc|json|jsonc|toml|yaml|yml|sh|mjs|js)$/i.test(path)) return;
    if (stat.size > 256 * 1024 || bytes + stat.size > 4 * 1024 * 1024) {
      skipped.push({ path, reason: 'byte-limit' });
      return;
    }
    bytes += stat.size;
    const text = readFileSync(full, 'utf8'),
      file = relative(root, full).replaceAll('\\', '/');
    if (files.includes(file)) return;
    files.push(file);
    const extension = path.split('.').at(-1).toLowerCase();
    try {
      const structured = structuredConfigurations(text, extension);
      if (structured.partial)
        skipped.push({
          path: file,
          reason: 'Structured parsing is partial for this format; text indicators were checked.',
        });
      const queue = structured.values.map((value) => ({ value, depth: 0 }));
      let nodes = 0;
      while (queue.length) {
        const { value, depth } = queue.pop();
        if (!value || typeof value !== 'object') continue;
        if (++nodes > 10000 || depth > 100) {
          skipped.push({
            path: file,
            reason: 'Structured traversal limit; text indicators were checked.',
          });
          break;
        }
        if (typeof value.command === 'string' && unpinnedRunner(value.command, value.args || []))
          add(
            'unpinned-runner',
            'medium',
            file,
            Math.max(1, text.slice(0, text.indexOf(value.command)).split('\n').length),
            'Structured package runner uses an unpinned package.',
            'Pin the package in args to a reviewed exact version.',
          );
        for (const [key, child] of Object.entries(value)) {
          if (
            ['url', 'endpoint', 'baseUrl', 'base_url'].includes(key) &&
            typeof child === 'string' &&
            unsafeHttp(child)
          )
            add(
              'insecure-mcp-url',
              'medium',
              file,
              Math.max(1, text.slice(0, text.indexOf(child)).split('\n').length),
              'Non-loopback endpoint uses plaintext HTTP.',
              'Use HTTPS; only exact loopback hostnames are exempt.',
            );
          if (child && typeof child === 'object') queue.push({ value: child, depth: depth + 1 });
        }
      }
    } catch {
      add(
        extension === 'jsonc' ? 'invalid-jsonc' : 'invalid-json',
        'high',
        file,
        1,
        'Configuration cannot be parsed in its declared format.',
        'Fix syntax before enabling this configuration.',
      );
    }
    const patterns = [
      [
        'tls-verification-disabled',
        'high',
        /(?:NODE_TLS_REJECT_UNAUTHORIZED["']?\s*[:=]\s*["']?0|verify_ssl["']?\s*[:=]\s*false|rejectUnauthorized["']?\s*:\s*false)/i,
        'TLS certificate verification appears disabled.',
        'Keep certificate validation enabled and configure the intended certificate authority.',
      ],
      [
        'public-bind',
        'medium',
        /(?:0\.0\.0\.0|\[::\])(?::\d+)?/,
        'A service may bind to all network interfaces.',
        'Confirm authentication and network exposure; use loopback for private local tools.',
      ],
      [
        'container-privilege',
        'high',
        /--privileged\b|--pid(?:=|\s+)host\b|(?:-v|--volume)\s+\/:/,
        'Container arguments grant host-level access.',
        'Scope mounts, namespaces and privileges to the required resources.',
      ],
      [
        'credential-store-access',
        'high',
        /(?:security\s+find-(?:generic|internet)-password|\/etc\/shadow|\.ssh\/id_(?:rsa|ed25519))/,
        'Configuration references sensitive credential storage.',
        'Review the exact need and prevent credential extraction or logging.',
      ],
      [
        'hook-network-upload',
        'high',
        /(?:curl|wget)[^\n]*(?:--data(?:-binary)?|-d\s|--upload-file|-T\s)/,
        'A configured command can upload data.',
        'Inspect destination and payload; do not send private files or credentials.',
      ],
      [
        'shell-input-interpolation',
        'high',
        /(?:sh|bash)\s+-c[^\n]*(?:\$\{?(?:file|command|prompt|tool_input)|\{\{)/i,
        'Shell code appears to interpolate external hook input.',
        'Pass validated values as argv or stdin; never turn untrusted filenames or prompts into shell code.',
      ],
      [
        'hidden-instruction',
        'medium',
        /[\u200b\u200c\u200d\u202a-\u202e\u2066-\u2069]/,
        'Invisible or bidirectional control characters appear in agent configuration.',
        'Inspect the original text and remove deceptive controls where unintended.',
      ],
      [
        'suppressed-security-result',
        'medium',
        /(?:always report (?:success|ok)|hide (?:security )?(?:warnings|failures)|suppress (?:all )?security findings)/i,
        'Text asks to conceal failures or security findings.',
        'Keep actual results and limitations visible.',
      ],
      [
        'permission-bypass',
        'high',
        /dangerously[-_]skip[-_]permissions|dangerously[-_]bypass[-_]approvals|bypassPermissions|danger-full-access/,
        'Configuration mentions disabled permission or sandbox checks.',
        'Inspect whether this is active configuration or explanatory text; use scoped permissions.',
      ],
      [
        'broad-tool-access',
        'medium',
        /(?:"(?:allow|allowedTools)"\s*:\s*\[\s*"\*"|Bash\(\*\)|(?:permissions|permission)\s*[:=]\s*"allow")/,
        'Unrestricted tool access is declared.',
        'Replace blanket grants with the necessary commands and resources.',
      ],
      [
        'remote-shell',
        'high',
        /(?:curl|wget)[^\n]*\|\s*(?:ba)?sh\b/,
        'Remote content is piped into a shell.',
        'Download, pin and inspect scripts before execution.',
      ],
      [
        'unpinned-runner',
        'medium',
        /\b(?:npx|pnpm\s+dlx|bunx)\s+(?:-[\w-]+\s+)*(?:@[\w.-]+\/)?[\w.-]+(?:@(?:latest|next))?(?=\s|["']|$)/,
        'Package runner appears to use an unpinned package.',
        'Pin a reviewed version; this check does not resolve registry metadata.',
      ],
      [
        'insecure-mcp-url',
        'medium',
        /http:\/\/[^\s"'<>]+/,
        'A non-loopback endpoint uses plaintext HTTP.',
        'Use HTTPS or a verified local transport.',
      ],
      [
        'embedded-secret',
        'high',
        /(?:sk-[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9]{20,}|npm_[A-Za-z0-9]{20,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|(?:api[_-]?key|token|password|secret)["']?\s*[:=]\s*["'][^$\s"'][^"']{10,}["'])/i,
        'Possible embedded credential (value omitted).',
        'Remove the literal; use an environment reference and rotate if it was exposed.',
      ],
      [
        'instruction-override',
        'medium',
        /(?:ignore|override)\s+(?:all\s+)?(?:previous|system|developer|higher.priority)\s+(?:instructions|rules)/i,
        'Text attempts to override instruction authority.',
        'Inspect the source; do not treat retrieved content as higher-priority instructions.',
      ],
    ];
    text.split('\n').forEach((line, index) => {
      for (const [rule, severity, regex, message, remediation] of patterns)
        if (
          regex.test(line) &&
          (rule !== 'insecure-mcp-url' ||
            [...line.matchAll(/http:\/\/[^\s"'<>]+/g)].some((m) => unsafeHttp(m[0])))
        ) {
          if (!findings.some((f) => f.rule === rule && f.file === file && f.line === index + 1))
            add(rule, severity, file, index + 1, message, remediation);
        }
    });
  }
  for (const path of paths) inspect(path);
  return {
    schemaVersion: 1,
    files,
    findings,
    skipped,
    coverage: skipped.length ? 'partial' : 'selected-files',
    scannedBytes: bytes,
    note: 'Static indicators only. Findings may describe examples rather than active settings. No config, hook, package or MCP server was executed. A clean scan is not a security guarantee.',
  };
}
