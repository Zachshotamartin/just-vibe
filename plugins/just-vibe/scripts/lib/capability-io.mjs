import { readFileSync, lstatSync, readdirSync, existsSync } from 'node:fs';
import { basename, relative, resolve } from 'node:path';
import { within, digest, privateName, projectRoot } from './storage.mjs';
import { redact } from './process.mjs';
import { object, cleanText } from './runtime-store.mjs';

export function boundedText(root, path, limit = 512 * 1024) {
  const full = within(root, path),
    stat = lstatSync(full);
  if (!stat.isFile() || stat.size > limit) throw Error('Expected a bounded regular file.');
  const bytes = readFileSync(full);
  if (bytes.length > limit) throw Error('File grew beyond its read limit.');
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}

export function walkFiles(
  root,
  { paths = ['.'], maxFiles = 2000, maxDepth = 8, includePrivate = false } = {},
) {
  const files = [],
    skipped = [];
  let visited = 0,
    partial = false;
  const seen = new Set();
  function visit(path, depth) {
    if (++visited > maxFiles || depth > maxDepth) {
      partial = true;
      return;
    }
    let full;
    try {
      full = within(root, path);
    } catch {
      skipped.push({ path, reason: 'symlink-or-outside-root' });
      partial = true;
      return;
    }
    if (!existsSync(full) || seen.has(full)) return;
    seen.add(full);
    const stat = lstatSync(full);
    if (stat.isDirectory()) {
      for (const entry of readdirSync(full).sort()) {
        if (
          [
            '.git',
            'node_modules',
            '.venv',
            'venv',
            'dist',
            'build',
            '.next',
            '.tmp',
            '.cache',
          ].includes(entry)
        )
          continue;
        if (!includePrivate && privateName(entry)) {
          skipped.push({ path: `${path}/${entry}`, reason: 'private-name' });
          continue;
        }
        if (visited >= maxFiles) {
          partial = true;
          break;
        }
        visit(relative(root, resolve(full, entry)), depth + 1);
      }
    } else if (stat.isFile())
      files.push({
        path: relative(root, full).replaceAll('\\', '/'),
        bytes: stat.size,
        modifiedAt: stat.mtime.toISOString(),
      });
  }
  for (const path of paths) visit(path, 0);
  return { files, skipped, partial, visited };
}

export function safeUrl(value) {
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    return `${url.origin}${url.pathname}`;
  } catch {
    return null;
  }
}
export function httpUrl(value) {
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.hash)
    throw Error('Use an HTTP(S) URL without credentials or a fragment.');
  if (url.href.length > 4000) throw Error('URL is too long.');
  return url;
}
export function integer(value, label, min, max) {
  if (!Number.isSafeInteger(value) || value < min || value > max)
    throw Error(`${label} must be between ${min} and ${max}.`);
  return value;
}
export function boundedList(value, label, max = 100) {
  if (!Array.isArray(value) || value.length > max)
    throw Error(`${label} must contain at most ${max} items.`);
  return value;
}
export function checkedLocation(root, item, options = {}) {
  object(item, ['root', 'host', 'scope', 'paths']);
  const location = projectRoot(item.root || root),
    scope = item.scope || 'project';
  if (!['project', 'user'].includes(scope)) throw Error('Choose project or user scope.');
  if (scope === 'project') within(root, location);
  else if (options.allowUser === false) throw Error('User configuration access is disabled.');
  return {
    root: location,
    host: cleanText(item.host || 'project', 'host', 80),
    scope,
    paths:
      item.paths === undefined
        ? undefined
        : boundedList(item.paths, 'paths', 50).map((p) => cleanText(p, 'path', 1000)),
  };
}
export const identity = (value) => digest(JSON.stringify(value));
export const displayName = (value) => redact(basename(String(value))).slice(0, 200);

// Only transport-visible messages are extracted. Reasoning/thinking and tool
// arguments are deliberately not traversed by this helper.
export function visibleText(content, maxCharacters = 12000) {
  if (typeof content === 'string') return redact(content).slice(0, maxCharacters);
  if (!Array.isArray(content)) return '';
  return content
    .filter(
      (c) =>
        c && ['text', 'input_text', 'output_text'].includes(c.type) && typeof c.text === 'string',
    )
    .map((c) => redact(c.text))
    .join('\n')
    .slice(0, maxCharacters);
}
