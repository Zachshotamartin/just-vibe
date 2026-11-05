import { readFileSync, statSync } from 'node:fs';
import { gitRead } from './project.mjs';
import { within, projectRoot } from './storage.mjs';

// Changed lines are the new-side line ranges of a zero-context diff: what a change added or
// rewrote. Pure deletions leave no new lines; renamed files report their new path.
const HUNK = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/;

// Git quotes paths containing control characters, quotes or backslashes in C style.
function unquote(path) {
  if (!path.startsWith('"')) return path;
  const escapes = { n: '\n', t: '\t', r: '\r', b: '\b', f: '\f', a: '\x07', v: '\v', '"': '"', '\\': '\\' };
  const bytes = [];
  for (let i = 1; i < path.length - 1; i++) {
    if (path[i] !== '\\') { bytes.push(...Buffer.from(path[i], 'utf8')); continue; }
    const next = path[++i];
    if (/[0-7]/.test(next)) { bytes.push(parseInt(path.slice(i, i + 3), 8)); i += 2; }
    else bytes.push(...Buffer.from(escapes[next] ?? next, 'utf8'));
  }
  return Buffer.from(bytes).toString('utf8');
}
const side = (line, prefix) => {
  const path = unquote(line.slice(4));
  return path === '/dev/null' ? null : path.startsWith(prefix) ? path.slice(prefix.length) : path;
};

export function parseZeroContextDiff(diff) {
  const files = {}, deleted = [], binary = [];
  let current = null, oldPath = null;
  for (const line of diff.split('\n')) {
    if (line.startsWith('diff --git ')) { current = null; oldPath = null; continue; }
    if (line.startsWith('--- ')) { oldPath = side(line, 'a/'); continue; }
    if (line.startsWith('+++ ')) {
      current = side(line, 'b/');
      if (current === null && oldPath) deleted.push(oldPath);
      else files[current] ??= [];
      continue;
    }
    const binaryMatch = /^Binary files (.+) and (.+) differ$/.exec(line);
    if (binaryMatch) { const path = side(`+++ ${binaryMatch[2]}`, 'b/'); if (path) binary.push(path); continue; }
    const hunk = HUNK.exec(line);
    if (hunk && current) {
      const start = Number(hunk[1]), count = hunk[2] === undefined ? 1 : Number(hunk[2]);
      if (count > 0) files[current].push([start, start + count - 1]);
    }
  }
  for (const path of Object.keys(files)) if (!files[path].length) delete files[path];
  return { files, deleted, binary };
}

const DIFF = ['-c', 'core.quotePath=false', 'diff', '-U0', '--no-color', '--no-ext-diff', '--no-textconv', '-M', '--src-prefix=a/', '--dst-prefix=b/'];

// The working tree against HEAD by default, or against a base (its merge base with HEAD when
// mergeBase is set). Untracked files count as wholly changed; ignored files do not.
export function changedLines(root, { base, mergeBase = false } = {}) {
  root = projectRoot(root);
  if (base !== undefined && (typeof base !== 'string' || !/^[\w./@^~-]{1,200}$/.test(base) || base.startsWith('-'))) throw Error('base must be a branch, tag or commit.');
  let against = base ?? 'HEAD';
  if (mergeBase) {
    against = gitRead(root, ['merge-base', base ?? 'HEAD', 'HEAD']);
    if (!against) throw Error(`No merge base between ${base} and HEAD.`);
  }
  const diff = gitRead(root, [...DIFF, against, '--'], { maxBuffer: 16 * 1024 * 1024, timeout: 15000, trim: false });
  if (diff === null) throw Error(`Git could not diff against ${against}; check that this is a repository and the base exists.`);
  const parsed = parseZeroContextDiff(diff);
  const untracked = (gitRead(root, ['ls-files', '--others', '--exclude-standard', '-z'], { maxBuffer: 4 * 1024 * 1024, trim: false }) || '').split('\0').filter(Boolean);
  for (const path of untracked.slice(0, 500)) {
    try {
      const file = within(root, path);
      if (statSync(file).size > 1024 * 1024) continue;
      const text = readFileSync(file, 'utf8');
      if (text.includes('\0')) { parsed.binary.push(path); continue; }
      const lines = text.split('\n').length - (text.endsWith('\n') ? 1 : 0);
      if (lines > 0) parsed.files[path] = [[1, lines]];
    } catch { /* unreadable or escaped; not a change we can attribute */ }
  }
  return { against, ...parsed };
}

export const touches = (ranges, line) => ranges.some(([start, end]) => line >= start && line <= end);
