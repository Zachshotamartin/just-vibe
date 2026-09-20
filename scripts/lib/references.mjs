import { readdirSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';

// Validate the complete shipped Markdown graph, including conditional references.
// Code fences contain examples, not active document links.
export function validateReferences(root) {
  root = realpathSync(root);
  let files = 0, links = 0;
  function visit(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const file = resolve(directory, entry.name);
      if (entry.isSymbolicLink()) throw Error(`Symlink in shipped reference tree: ${file}`);
      if (entry.isDirectory()) { visit(file); continue; }
      if (!entry.name.endsWith('.md')) continue;
      files++;
      const content = readFileSync(file, 'utf8').replace(/^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1\s*$/gm, '');
      for (const match of content.matchAll(/\]\(([^)]+)\)/g)) {
        const href = match[1].replace(/^<|>$/g, '');
        if (/^[a-z][a-z\d+.-]*:/i.test(href) || href.startsWith('#')) continue;
        const pathname = href.split('#')[0];
        if (!pathname) continue;
        const target = resolve(dirname(file), pathname);
        const rel = relative(root, target);
        if (isAbsolute(pathname) || isAbsolute(rel) || rel === '..' || rel.startsWith(`..${sep}`)) throw Error(`Reference escapes plugin: ${file} -> ${href}`);
        try {
          const actual = realpathSync(target), actualRel = relative(root, actual);
          if (isAbsolute(actualRel) || actualRel === '..' || actualRel.startsWith(`..${sep}`) || !statSync(actual).isFile()) throw Error('invalid target');
        } catch { throw Error(`Broken shipped reference: ${file} -> ${href}`); }
        links++;
      }
    }
  }
  visit(root);
  return { files, links };
}
