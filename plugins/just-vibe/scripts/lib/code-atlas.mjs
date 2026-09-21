import { existsSync, writeFileSync, readFileSync, renameSync, unlinkSync } from 'node:fs';
import { dirname, relative } from 'node:path';
import { runtimeStore, object, requireId, cleanText, timestamp } from './runtime-store.mjs';
import { boundedText, boundedList, walkFiles, integer } from './capability-io.mjs';
import { within, digest, privateName } from './storage.mjs';

export function codeAtlas(root, operation, payload = {}, options = {}) {
  const store = runtimeStore(root, options);
  if (operation === 'map') {
    object(payload, ['paths']);
    const walk = walkFiles(root, { paths: payload.paths || ['.'], maxFiles: 2000 }),
      files = [],
      edges = [];
    let partial = walk.partial;
    for (const file of walk.files.filter((f) =>
      /\.(?:[cm]?[jt]sx?|py|go|rs|java|kt|cs|rb|php|swift|vue|svelte)$/.test(f.path),
    )) {
      if (file.bytes > 256 * 1024) {
        partial = true;
        continue;
      }
      let text;
      try {
        text = boundedText(root, file.path);
      } catch {
        partial = true;
        continue;
      }
      const lines = text.split('\n'),
        symbols = [];
      for (let i = 0; i < lines.length; i++) {
        const m = lines[i].match(
          /^\s*(?:export\s+)?(?:async\s+)?(?:function|class|def|fn|func|interface|type|struct|enum)\s+([\w$]+)/,
        );
        if (m) symbols.push({ name: m[1], line: i + 1 });
        const imp = lines[i].match(/(?:from\s+|import\s*\(?|require\s*\()(['"])([^'"]+)\1/);
        if (imp) edges.push({ from: file.path, specifier: imp[2], line: i + 1 });
      }
      files.push({
        path: file.path,
        hash: digest(text),
        lines: lines.length,
        symbols: symbols.slice(0, 100),
      });
    }
    return {
      generatedAt: timestamp(),
      files,
      edges: edges.slice(0, 5000),
      partial: partial || edges.length > 5000,
      method: 'Bounded lexical map, not compiler-resolved call or dependency analysis.',
    };
  }
  if (operation === 'list')
    return {
      tours: store
        .list(store.prefix)
        .filter((p) => p.startsWith('tour-'))
        .map((p) => store.get(p.replace('.json', '')))
        .map(({ id, title, revision, updatedAt }) => ({ id, title, revision, updatedAt })),
    };
  object(payload, ['id', 'revision', 'title', 'description', 'steps', 'path', 'expectedHash']);
  const id = requireId(payload.id),
    name = `tour-${id}`,
    previous = store.get(name);
  if (operation === 'create') {
    const steps = boundedList(payload.steps, 'steps', 80).map((step) => {
      object(step, ['file', 'line', 'description']);
      if (privateName(step.file)) throw Error('Private files are not tour material.');
      const text = boundedText(root, step.file),
        lines = text.split('\n'),
        line = integer(step.line, 'line', 1, lines.length);
      return {
        file: relative(store.root, within(root, step.file)).replaceAll('\\', '/'),
        line,
        description: cleanText(step.description, 'step description', 3000),
        sourceHash: digest(text),
        anchorHash: digest(lines[line - 1]),
      };
    });
    if (!steps.length) throw Error('Add at least one tour step.');
    return store.put(
      name,
      {
        id,
        title: cleanText(payload.title, 'title', 200),
        description: cleanText(payload.description, 'description', 1000),
        steps,
        updatedAt: timestamp(),
      },
      payload.revision,
    );
  }
  if (!previous) throw Error('Unknown tour.');
  const steps = previous.steps.map((step) => {
    try {
      const text = boundedText(root, step.file),
        lines = text.split('\n');
      return {
        ...step,
        stale: digest(text) !== step.sourceHash,
        anchorValid: step.line <= lines.length && digest(lines[step.line - 1]) === step.anchorHash,
      };
    } catch {
      return { ...step, stale: true, anchorValid: false };
    }
  });
  const tour = { ...previous, steps, stale: steps.some((s) => s.stale) };
  if (operation === 'show' || operation === 'validate') return tour;
  if (operation === 'export') {
    const artifact = {
      $schema: 'https://aka.ms/codetour-schema',
      title: previous.title,
      description: previous.description,
      steps: previous.steps.map(({ file, line, description }) => ({ file, line, description })),
    };
    if (tour.stale) throw Error('Refresh tour anchors against current sources before exporting.');
    if (!payload.path) return { artifact, hash: digest(JSON.stringify(artifact, null, 2) + '\n') };
    if (payload.revision !== previous.revision) throw Error('Tour revision changed.');
    const path = within(root, payload.path);
    if (!path.endsWith('.tour')) throw Error('Choose a .tour artifact path.');
    const current = existsSync(path) ? digest(boundedText(root, path)) : null;
    if (current !== (payload.expectedHash ?? null))
      throw Error('Destination changed; review the exact artifact before replacing.');
    const content = JSON.stringify(artifact, null, 2) + '\n',
      temp = within(root, `${payload.path}.just-vibe-tmp`);
    writeFileSync(temp, content, { flag: 'wx', mode: 0o600 });
    try {
      if ((existsSync(path) ? digest(boundedText(root, path)) : null) !== current)
        throw Error('Destination changed during export.');
      renameSync(temp, path);
    } finally {
      if (existsSync(temp)) unlinkSync(temp);
    }
    return { path, hash: digest(content), steps: steps.length };
  }
  throw Error('Unknown atlas operation.');
}
