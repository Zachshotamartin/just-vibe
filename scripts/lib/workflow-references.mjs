import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

// Compound adjectives such as "security-relevant" share a family prefix but are not workflow names.
const adjective = /-(?:relevant|related|sensitive|specific|based|aware|only|free|safe|owned|level|wide|facing|driven|side|like|style)$/;

// A family-prefixed token that is not a known id, written in the same sentence as a
// real hyphenated workflow id, is almost certainly a mistyped or removed workflow.
export function workflowReferenceChecker({ commands, known }) {
  const escape = id => id.replace(/-/g, '\\-');
  const prefixes = [...new Set(commands.filter(id => id.includes('-')).map(id => id.split('-')[0]))];
  const candidate = new RegExp(`(?<![\\w./:-])((?:${prefixes.join('|')})-[a-z0-9]+(?:-[a-z0-9]+)*)(?![\\w/-]|\\.(?:md|mjs|json|com))`, 'g');
  const workflow = new RegExp(`(?<![\\w./:-])(?:${commands.filter(id => id.includes('-')).map(escape).join('|')})(?![\\w/-])`);
  return text => {
    const found = [];
    for (const sentence of text.replace(/```[\s\S]*?```/g, '').split(/(?<=[.!?])\s+|\n/)) {
      for (const match of sentence.matchAll(candidate)) {
        const id = match[1];
        if (!known.has(id) && !adjective.test(id) && workflow.test(sentence.replace(id, ''))) found.push({ id, sentence: sentence.trim() });
      }
    }
    return found;
  };
}

const markdown = directory => readdirSync(directory).flatMap(name => {
  const path = join(directory, name);
  return statSync(path).isDirectory() ? markdown(path) : path.endsWith('.md') ? [path] : [];
});

const strings = (value, where, out = []) => {
  if (typeof value === 'string') out.push([where, value]);
  else if (Array.isArray(value)) value.forEach((item, index) => strings(item, `${where}[${index}]`, out));
  else if (value && typeof value === 'object') for (const [key, item] of Object.entries(value)) strings(item, `${where}.${key}`, out);
  return out;
};

// Shipped references and catalog prose must only name workflows that exist.
export function unresolvedWorkflowReferences(pluginRoot, { commands, methods, profiles, packs }) {
  const ids = commands.map(c => c.id);
  const known = new Set([...ids, ...methods.map(m => m.id), ...profiles.map(p => p.id), ...packs.map(p => p.id)]);
  const check = workflowReferenceChecker({ commands: ids, known });
  const problems = [];
  for (const file of markdown(join(pluginRoot, 'references'))) {
    for (const hit of check(readFileSync(file, 'utf8'))) problems.push({ where: relative(pluginRoot, file), ...hit });
  }
  const identity = /\.(?:id|path|skillPath|aliasOf|pack)$|\.(?:aliases|workflows|searchTerms)\[/;
  for (const [where, value] of [...strings(commands, 'commands'), ...strings(profiles, 'profiles')]) {
    if (!identity.test(where)) for (const hit of check(value)) problems.push({ where, ...hit });
  }
  return problems;
}
