import { readFileSync, existsSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { commandName } from './invocation.mjs';
import { fail, identifier, line, lines, oneOf, record } from './catalog-schema.mjs';
import { normalize } from './search.mjs';
import { validateContracts } from './catalog-contracts.mjs';

export const pluginRoot = fileURLToPath(new URL('../../', import.meta.url));
export const MODES = ['inspect', 'plan', 'apply'];
export const HOSTS = ['codex', 'claude'];
export const CAPABILITIES = ['project.read', 'git.repo', 'github.context', 'vercel.context',
  'browser.inspect', 'database.context', 'data.read', 'ml.artifacts', 'telemetry.read',
  'web.research', 'container.context', 'user.questions'];

const aliasIdentity = new Set(['id', 'pack', 'summary', 'aliasOf', 'aliases', 'skillPath', 'searchTerms']);

export function validateInputPolicy(policy, label) {
  if (!policy || typeof policy !== 'object' || Array.isArray(policy)
      || Object.keys(policy).sort().join(',') !== 'ask,assume,infer'
      || Object.values(policy).some(value => typeof value !== 'string' || !value.trim()))
    throw Error(`Invalid input policy: ${label}`);
}

export function materializeAliases(catalog) {
  return { ...catalog, commands: catalog.commands.map(command => {
    if (!command.aliasOf) return structuredClone(command);
    const target = catalog.commands.find(c => c.id === command.aliasOf && !c.aliasOf);
    if (!target) throw new Error(`Invalid alias target: ${command.id}`);
    for (const key of Object.keys(command)) if (!aliasIdentity.has(key)) throw new Error(`Alias must inherit ${key}: ${command.id}`);
    return { ...structuredClone(target), ...structuredClone(command), aliases: [] };
  }) };
}

const commandFields = ['id', 'pack', 'summary', 'aliases', 'aliasOf', 'defaultMode', 'modePolicy', 'requiredInputs', 'optionalInputs',
  'capabilities', 'readScope', 'writeScope', 'procedure', 'outputs', 'verification', 'stopConditions', 'examples', 'hostSupport',
  'executionModel', 'implementationStatus', 'validation', 'skillPath', 'searchTerms', 'selection', 'branches', 'technical', 'inputPolicy'];
export const EXAMPLE_KINDS = ['normal', 'edge', 'blocked', 'repository', 'files'];
const guidePath = /^references\/(?:[a-z0-9-]+\/)*[a-z0-9-]+\.md$/;

function validatePack(pack) {
  const label = `Pack ${pack?.id}`;
  record(pack, label, ['id', 'name', 'prerequisites', 'inputPolicy', 'workedExample']);
  identifier(pack.id, label, 'id');
  line(pack.name, label, 'name', { table: true });
  line(pack.prerequisites, label, 'prerequisites');
  validateInputPolicy(pack.inputPolicy, pack.id);
  if (pack.workedExample !== `references/examples/${pack.id}.md`) throw Error(`Invalid worked example: ${pack.id}`);
}

// Discovery terms must add distinguishing evidence. A term that normalizes to nothing, or only to
// everyday words the workflow does not own, would pull unrelated requests toward it.
const EVERYDAY_TERMS = new Set(normalize('work keep local production missing server client account data change fix check error move another '
  + 'improve rewrite retry memory context code file app page test issue problem bug update add new make build run use help review plan '
  + 'thing way start set show find create write remove delete open go come look').map(t => t.stem));
function validateSearchTerms(c, label) {
  const owned = new Set(normalize(c.id.replace(/-/g, ' ')).map(t => t.stem));
  c.searchTerms.forEach((term, index) => {
    const words = normalize(term).map(t => t.stem);
    if (!words.length) fail(label, `searchTerms[${index}]`, 'has no searchable words.');
    if (words.every(w => EVERYDAY_TERMS.has(w) && !owned.has(w))) fail(label, `searchTerms[${index}]`, 'needs a distinctive word, not only everyday words.');
  });
}

// Field types, closed key sets and table-safe text; semantic rules follow in validateCatalog.
function validateCommandShape(c) {
  const label = `Command ${c?.id}`;
  record(c, label, commandFields, ['guides', 'runtimeSteps']);
  line(c.summary, label, 'summary', { table: true });
  for (const key of ['modePolicy', 'readScope', 'writeScope', 'selection']) line(c[key], label, key);
  for (const key of ['requiredInputs', 'procedure', 'outputs', 'verification', 'stopConditions']) lines(c[key], label, key);
  lines(c.optionalInputs, label, 'optionalInputs', { min: 0 });
  lines(c.searchTerms, label, 'searchTerms', { min: 0 });
  validateSearchTerms(c, label);
  lines(c.aliases, label, 'aliases', { min: 0, each: identifier });
  if (c.aliasOf !== null) identifier(c.aliasOf, label, 'aliasOf');
  lines(c.capabilities, label, 'capabilities', { min: 0, each: (v, l, f) => oneOf(v, l, f, CAPABILITIES) });
  lines(c.hostSupport, label, 'hostSupport', { each: (v, l, f) => oneOf(v, l, f, HOSTS) });
  lines(c.examples, label, 'examples', { each: (e, l, f) => {
    record(e, `${l} ${f}`, ['brief', 'mode'], ['kind']);
    line(e.brief, l, `${f}.brief`);
    oneOf(e.mode, l, `${f}.mode`, MODES);
    if (e.kind !== undefined) oneOf(e.kind, l, `${f}.kind`, EXAMPLE_KINDS);
  } });
  lines(c.branches, label, 'branches', { each: (b, l, f) => {
    record(b, `${l} ${f}`, ['when', 'then']);
    line(b.when, l, `${f}.when`); line(b.then, l, `${f}.then`);
  } });
  if (c.guides !== undefined) {
    lines(c.guides, label, 'guides', { min: 0, each: (g, l, f) => {
      record(g, `${l} ${f}`, ['title', 'when', 'path']);
      line(g.title, l, `${f}.title`); line(g.when, l, `${f}.when`);
      if (typeof g.path !== 'string' || !guidePath.test(g.path)) fail(l, `${f}.path`, 'must be a references/*.md path.');
    } });
    if (new Set(c.guides.map(g => g.path)).size !== c.guides.length) fail(label, 'guides', 'must not link the same path twice.');
  }
  record(c.validation, `${label} validation`, ['structural', 'runtime', 'behavioral'], ['record', 'host', 'priorBehavioral']);
  if (c.validation.host !== undefined) line(c.validation.host, label, 'validation.host');
  if (c.validation.priorBehavioral !== undefined) record(c.validation.priorBehavioral, `${label} validation.priorBehavioral`, ['status', 'record', 'cases', 'note']);
}

export function validateCatalog(catalog, packs) {
  if (catalog.schemaVersion !== 1 || packs.schemaVersion !== 1) throw new Error('Unsupported catalog version.');
  if (!Array.isArray(catalog.commands) || !Array.isArray(packs.packs)) throw new Error('Invalid catalog collections.');
  const ids = new Set();
  const groups = new Set(packs.packs.map(p => p.id));
  if (groups.size !== packs.packs.length) throw new Error('Duplicate pack.');
  for (const pack of packs.packs) validatePack(pack);
  if (new Set(packs.packs.map(p => p.name.toLowerCase())).size !== packs.packs.length) throw new Error('Duplicate pack name.');
  for (const c of catalog.commands) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(c?.id) || ids.has(c.id)) throw new Error(`Invalid/duplicate command: ${c?.id}`);
    ids.add(c.id);
    if (!groups.has(c.pack) || !MODES.includes(c.defaultMode)) throw new Error(`Invalid pack/mode: ${c.id}`);
    if (c.runtimeSteps !== undefined && (!Array.isArray(c.runtimeSteps) || c.runtimeSteps.length)) throw Error(`Use one canonical procedure, not parallel runtime steps: ${c.id}`);
    if (!c.technical || typeof c.technical !== 'object' || Array.isArray(c.technical)
      || Object.keys(c.technical).sort().join(',') !== 'check,evidence,method,pitfall'
      || Object.values(c.technical).some(value => typeof value !== 'string' || !value.trim())) throw new Error(`Invalid technical method: ${c.id}`);
    validateInputPolicy(c.inputPolicy, c.id);
    validateCommandShape(c);
    if (!c.aliasOf) validateContracts(c);
    if (c.validation.structural !== 'automated' || !['fixtures-tested', 'not-applicable'].includes(c.validation.runtime)
        || !['not-evaluated', 'passed-fixtures', 'partial-fixtures'].includes(c.validation.behavioral)) throw new Error(`Invalid validation dimensions: ${c.id}`);
    if (c.validation.behavioral !== 'not-evaluated' && !c.validation.record?.trim()) throw new Error(`Behavioral results require an evidence record: ${c.id}`);
    if (c.validation.priorBehavioral && (!['passed-fixtures', 'partial-fixtures'].includes(c.validation.priorBehavioral.status)
      || !c.validation.priorBehavioral.record?.trim() || !Array.isArray(c.validation.priorBehavioral.cases)
      || !c.validation.priorBehavioral.cases.length || !c.validation.priorBehavioral.note?.trim())) throw new Error(`Invalid historical behavioral evidence: ${c.id}`);
    if (!['implemented', 'planned'].includes(c.implementationStatus)) throw new Error(`Unknown implementation status: ${c.id}`);
    if (c.executionModel !== 'host-agent' || c.skillPath !== `skills/${c.id}/SKILL.md`) throw new Error(`Invalid execution path: ${c.id}`);
  }
  for (const c of catalog.commands) {
    if (c.aliasOf) {
      const target = catalog.commands.find(t => t.id === c.aliasOf);
      if (!target || target.aliasOf || !target.aliases.includes(c.id)) throw new Error(`Invalid alias: ${c.id}`);
      for (const key of new Set([...Object.keys(c), ...Object.keys(target)])) {
        if (!aliasIdentity.has(key) && JSON.stringify(c[key]) !== JSON.stringify(target[key])) throw new Error(`Alias contract drift (${key}): ${c.id}`);
      }
    }
    for (const a of c.aliases) if (!catalog.commands.some(t => t.id === a && t.aliasOf === c.id)) throw new Error(`Missing alias: ${a}`);
  }
  return catalog;
}

export function loadCatalog(root = pluginRoot) {
  const packs = JSON.parse(readFileSync(resolve(root, 'catalog/packs.json'), 'utf8'));
  const source = JSON.parse(readFileSync(resolve(root, 'catalog/commands.json'), 'utf8'));
  // Resolve defaults before materializing aliases so CLI contracts and generated
  // skills expose exactly the same effective policy.
  const catalog = materializeAliases({ ...source, commands: source.commands.map(c => c.aliasOf ? c : {
    ...c, inputPolicy: c.inputPolicy ?? packs.packs.find(p => p.id === c.pack)?.inputPolicy,
  }) });
  validateCatalog(catalog, packs);
  return { ...catalog, packs: packs.packs, root };
}

export function getCommand(catalog, id, { canonical = false } = {}) {
  const name = commandName(id);
  let command = catalog.commands.find(c => c.id === name);
  if (!command) throw new Error(`Unknown workflow: ${name}. Use tools to search the catalog.`);
  if (canonical && command.aliasOf) command = catalog.commands.find(c => c.id === command.aliasOf);
  return command;
}

export function skillFile(catalog, command) {
  const path = resolve(catalog.root, command.skillPath);
  if (!path.startsWith(resolve(catalog.root) + sep)) throw new Error('Skill path escapes plugin.');
  if (!existsSync(path) && existsSync(path.replace(/SKILL\.md$/, 'REFERENCE.md'))) return path.replace(/SKILL\.md$/, 'REFERENCE.md');
  return path;
}

export function invocation(command, host = 'claude') {
  if (!HOSTS.includes(host)) throw new Error(`Unsupported host: ${host}`);
  return host === 'claude' ? `/just-vibe:${command.id}` : `Select just-vibe → ${command.id} in the skill picker`;
}

export function availability(catalog, command, capabilities = {}, host = 'claude') {
  if (!HOSTS.includes(host)) throw new Error(`Unsupported host: ${host}`);
  if (command.implementationStatus === 'planned') return { status: 'planned', reasons: ['Workflow is not implemented.'] };
  if (!command.hostSupport.includes(host)) return { status: 'unsupported', reasons: [`No ${host} mapping.`] };
  if (!existsSync(resolve(catalog.root, command.skillPath))) return { status: 'uninstalled', reasons: ['Skill is excluded from this installation; its reference method may still be readable.'] };
  if (command.aliasOf) return availability(catalog, getCommand(catalog, command.aliasOf, { canonical: true }), capabilities, host);
  const checks = command.capabilities.map(id => ({ id, ...(capabilities[id] || { status: 'unknown', reason: 'Not observed in this session.' }) }));
  const blocked = checks.filter(c => ['missing', 'disabled'].includes(c.status));
  const unknown = checks.filter(c => c.status !== 'available');
  return { status: blocked.length ? 'blocked' : unknown.length ? 'unknown' : 'available',
    reasons: unknown.map(c => `${c.id}: ${c.reason}`), capabilities: checks };
}

// Lexical search lives in search.mjs; re-exported here for existing callers.
export { searchCommands } from './search.mjs';
