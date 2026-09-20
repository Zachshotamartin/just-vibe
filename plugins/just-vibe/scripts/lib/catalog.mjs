import { readFileSync, existsSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

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

export function validateCatalog(catalog, packs) {
  if (catalog.schemaVersion !== 1 || packs.schemaVersion !== 1) throw new Error('Unsupported catalog version.');
  if (!Array.isArray(catalog.commands) || !Array.isArray(packs.packs)) throw new Error('Invalid catalog collections.');
  const ids = new Set();
  const groups = new Set(packs.packs.map(p => p.id));
  if (groups.size !== packs.packs.length) throw new Error('Duplicate pack.');
  for (const pack of packs.packs) {
    validateInputPolicy(pack.inputPolicy, pack.id);
    if (pack.workedExample !== `references/examples/${pack.id}.md`) throw Error(`Invalid worked example: ${pack.id}`);
  }
  for (const c of catalog.commands) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(c.id) || ids.has(c.id)) throw new Error(`Invalid/duplicate command: ${c.id}`);
    ids.add(c.id);
    if (!groups.has(c.pack) || !MODES.includes(c.defaultMode)) throw new Error(`Invalid pack/mode: ${c.id}`);
    for (const key of ['summary', 'modePolicy', 'readScope', 'writeScope', 'skillPath']) {
      if (typeof c[key] !== 'string' || !c[key].trim()) throw new Error(`Missing ${key}: ${c.id}`);
    }
    for (const key of ['requiredInputs', 'procedure', 'outputs', 'verification', 'stopConditions']) {
      if (!Array.isArray(c[key]) || !c[key].length || c[key].some(s => typeof s !== 'string' || !s.trim())) throw new Error(`Invalid ${key}: ${c.id}`);
    }
    if (typeof c.selection !== 'string' || !c.selection.trim()) throw new Error(`Missing selection boundary: ${c.id}`);
    validateInputPolicy(c.inputPolicy, c.id);
    if (c.runtimeSteps !== undefined && (!Array.isArray(c.runtimeSteps) || c.runtimeSteps.length)) throw Error(`Use one canonical procedure, not parallel runtime steps: ${c.id}`);
    if (!c.technical || typeof c.technical !== 'object' || Array.isArray(c.technical)
      || Object.keys(c.technical).sort().join(',') !== 'check,evidence,method,pitfall'
      || Object.values(c.technical).some(value => typeof value !== 'string' || !value.trim())) throw new Error(`Invalid technical method: ${c.id}`);
    if (!Array.isArray(c.branches) || !c.branches.length || c.branches.some(b => !b.when?.trim() || !b.then?.trim())) throw new Error(`Invalid decision branches: ${c.id}`);
    if (c.guides !== undefined && (!Array.isArray(c.guides) || c.guides.some(g => !g.title?.trim() || !g.when?.trim() || !/^references\/(?:[a-z0-9-]+\/)*[a-z0-9-]+\.md$/.test(g.path)))) throw Error(`Invalid conditional guide: ${c.id}`);
    if (c.validation?.structural !== 'automated' || !['fixtures-tested', 'not-applicable'].includes(c.validation.runtime)
        || !['not-evaluated', 'passed-fixtures', 'partial-fixtures'].includes(c.validation.behavioral)) throw new Error(`Invalid validation dimensions: ${c.id}`);
    if (c.validation.behavioral !== 'not-evaluated' && !c.validation.record?.trim()) throw new Error(`Behavioral results require an evidence record: ${c.id}`);
    if (c.validation.priorBehavioral && (!['passed-fixtures', 'partial-fixtures'].includes(c.validation.priorBehavioral.status)
      || !c.validation.priorBehavioral.record?.trim() || !Array.isArray(c.validation.priorBehavioral.cases)
      || !c.validation.priorBehavioral.cases.length || !c.validation.priorBehavioral.note?.trim())) throw new Error(`Invalid historical behavioral evidence: ${c.id}`);
    if (!Array.isArray(c.capabilities) || c.capabilities.some(s => !CAPABILITIES.includes(s))) throw new Error(`Unknown capability: ${c.id}`);
    if (!Array.isArray(c.examples) || !c.examples.length || c.examples.some(e => !e.brief?.trim() || !MODES.includes(e.mode))) throw new Error(`Missing example: ${c.id}`);
    if (!Array.isArray(c.hostSupport) || !c.hostSupport.length || c.hostSupport.some(h => !HOSTS.includes(h))) throw new Error(`Unknown host: ${c.id}`);
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
  const name = id.replace(/^\/just-vibe:/, '').replace(/^\$/, '');
  let command = catalog.commands.find(c => c.id === name);
  if (!command) throw new Error(`Unknown workflow: ${name}. Use tools to search the catalog.`);
  if (canonical && command.aliasOf) command = catalog.commands.find(c => c.id === command.aliasOf);
  return command;
}

export function skillFile(catalog, command) {
  const path = resolve(catalog.root, command.skillPath);
  if (!path.startsWith(resolve(catalog.root) + sep)) throw new Error('Skill path escapes plugin.');
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
  if (!existsSync(skillFile(catalog, command))) return { status: 'uninstalled', reasons: ['Skill file is absent from this payload.'] };
  if (command.aliasOf) return availability(catalog, getCommand(catalog, command.aliasOf, { canonical: true }), capabilities, host);
  const checks = command.capabilities.map(id => ({ id, ...(capabilities[id] || { status: 'unknown', reason: 'Not observed in this session.' }) }));
  const blocked = checks.filter(c => ['missing', 'disabled'].includes(c.status));
  const unknown = checks.filter(c => c.status !== 'available');
  return { status: blocked.length ? 'blocked' : unknown.length ? 'unknown' : 'available',
    reasons: unknown.map(c => `${c.id}: ${c.reason}`), capabilities: checks };
}

const stopWords = new Set('the a an and or to for of in on with my this that it is are be can please me do how what why i we our'.split(' '));
const synonyms = { 'ci': ['checks', 'actions', 'pipeline'], 'ml': ['model', 'training', 'dataset'],
  'a11y': ['accessibility', 'keyboard', 'focus'], 'db': ['database', 'sql', 'postgres', 'sqlite'],
  'rerenders': ['rendering', 'renders', 'freezes'], 'leakage': ['contamination', 'leak', 'future'],
  'recovery': ['recover', 'restore'], 'pr': ['pull', 'request'], 'env': ['environment', 'variables'] };
function tokens(text) {
  return (text.toLowerCase().match(/[a-z0-9]+/g) || []).filter(w => !stopWords.has(w));
}

export function searchCommands(catalog, query = '', { pack, limit = 1000 } = {}) {
  if (pack && !catalog.packs.some(p => p.id === pack)) throw new Error(`Unknown pack: ${pack}`);
  if (!Number.isInteger(limit) || limit < 1 || limit > 1000) throw new Error('limit must be between 1 and 1000.');
  const exact = query.trim().toLowerCase().replace(/^\/just-vibe:/, '');
  const exactCommand = catalog.commands.find(c => c.id === exact && (!pack || c.pack === pack));
  if (exactCommand) return [{ command: exactCommand, score: 100 }];
  const exactPack = catalog.packs.find(p => p.id === exact.replace(/\s+/g, '-') || p.name.toLowerCase() === exact);
  if (exactPack && !pack) pack = exactPack.id;
  const queryTokens = tokens(query);
  const expanded = new Set(queryTokens);
  for (const token of queryTokens) for (const word of synonyms[token] || []) expanded.add(word);
  const scored = catalog.commands.filter(c => !pack || c.pack === pack).map(command => {
    const id = new Set(tokens(command.id));
    const summary = new Set(tokens(command.summary));
    const detail = new Set(tokens([command.pack, ...command.procedure, ...command.examples.map(e => e.brief)].join(' ')));
    const scenarios = new Set(tokens((command.searchTerms || []).join(' ')));
    let score = command.id === query.toLowerCase().trim() ? 100 : 0;
    if (command.pack === query.toLowerCase().trim()) score += 40;
    for (const token of expanded) score += id.has(token) ? 8 : scenarios.has(token) ? 5 : summary.has(token) ? 4 : detail.has(token) ? 1 : 0;
    return { command, score };
  }).filter(c => !queryTokens.length || c.score > 0 || (exactPack && c.command.pack === exactPack.id));
  return scored.sort((a, b) => b.score - a.score || a.command.id.localeCompare(b.command.id)).slice(0, limit);
}
