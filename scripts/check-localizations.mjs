import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
export function checkLocalizations() {
  const manifest = JSON.parse(readFileSync(resolve(root, 'docs/locales/manifest.json'))),
    source = readFileSync(resolve(root, manifest.source), 'utf8');
  const hash = createHash('sha256').update(source).digest('hex');
  const commands = (text) =>
    [...text.matchAll(/npx just-vibe@latest [a-z-]+(?: --[a-z-]+ [a-z.]+)*/g)]
      .map((m) => m[0])
      .sort();
  for (const locale of manifest.locales) {
    if (locale.sourceHash !== hash) throw Error(`Stale translation: ${locale.language}`);
    const translated = readFileSync(resolve(root, locale.path), 'utf8');
    if (JSON.stringify(commands(source)) !== JSON.stringify(commands(translated)))
      throw Error(`Translated command changed: ${locale.language}`);
  }
  return {
    languages: manifest.locales.map((l) => l.language),
    sourceHash: hash,
    scope: 'getting-started only; wording has not received independent native-speaker review',
  };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  console.log(JSON.stringify(checkLocalizations()));
