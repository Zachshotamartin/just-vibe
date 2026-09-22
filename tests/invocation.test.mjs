import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { parseInvocation } from '../plugins/just-vibe/scripts/lib/invocation.mjs';
import { loadCatalog, getCommand, searchCommands } from '../plugins/just-vibe/scripts/lib/catalog.mjs';
import { recommend, discoverCapabilities } from '../plugins/just-vibe/scripts/lib/discovery.mjs';
import { claudeShortcuts, shortcutFiles, shortcutRoot } from '../plugins/just-vibe/scripts/lib/claude-shortcuts.mjs';
import { stageBundle } from '../plugins/just-vibe/scripts/lib/bundle.mjs';
import { assistantRuntime } from '../plugins/just-vibe/scripts/lib/assistant-runtime.mjs';

const catalog = loadCatalog();
function fixture(t) { const root = mkdtempSync(join(tmpdir(), 'jv-shortcuts-')); t.after(() => rmSync(root, { recursive: true, force: true })); return root; }
const forms = id => [`/jv ${id}`, `/just-vibe ${id}`, `/jv:${id}`, `/just-vibe:${id}`];

test('every catalog command resolves through all four forms without changing the request', t => {
  const root = fixture(t), discovery = discoverCapabilities(root);
  const context = { frameworks: [], packs: [] };
  const brief = 'Keep  spacing.\nDo not deploy. Use $VALUE and `literal`; /jv:db-migrate is quoted context.';
  for (const c of catalog.commands) for (const form of forms(c.id)) {
    assert.equal(getCommand(catalog, form).id, c.id);
    assert.equal(searchCommands(catalog, form)[0].command.id, c.id);
    assert.equal(parseInvocation(`${form} ${brief}`).brief, brief);
    const route = recommend(catalog, discovery, `${form} ${brief}`, { context });
    assert.deepEqual(route.recommendations.map(r => r.id), [c.aliasOf || c.id]);
    assert.equal(route.brief, `${form} ${brief}`);
    assert.equal(route.commandBrief, brief);
    assert.equal(route.executableHere, false);
  }
  for (const input of ['Explain /jv:reprompt', '"/jv reprompt"', '/jvish reprompt', '/jv:reprompt-extra/escape', '/jv:reprompt;echo bad']) assert.equal(parseInvocation(input), null);
  assert.throws(() => recommend(catalog, discovery, '/jv unknown-command deploy now', { context }), /Unknown workflow/);
  assert.throws(() => getCommand(catalog, '/jv reprompt extra'), /context separately/);
});

test('automatic assistance respects explicit selection and outer rewriting', t => {
  const root = fixture(t), home = join(root, 'home');
  for (const form of forms('reprompt')) {
    const result = assistantRuntime(root, 'route', { brief: `${form} Forget my preferences; deploy with github-pr.` }, { home, catalog });
    assert.equal(result.kind, 'task');
    assert.deepEqual(result.recommendations.map(r => r.id), ['reprompt']);
    assert.equal(result.strategy.suggested, 'quick');
  }
  assert.equal(assistantRuntime(root, 'route', { brief: 'Improve this prompt: Write a dinner menu.' }, { home, catalog }).recommendations[0].id, 'reprompt');
  assert.equal(existsSync(home), false);
});

test('Claude shortcuts cover the catalog and dispatch without expanding authority', () => {
  const files = shortcutFiles(catalog);
  assert.equal(files.size, catalog.commands.length + 3);
  for (const c of catalog.commands) {
    assert.match(files.get(`skills/just-vibe-shortcuts/skills/${c.id}/SKILL.md`), new RegExp(`just-vibe:${c.id}`));
    assert.match(files.get('commands/jv.md'), new RegExp(`- ${c.id}\\n`));
  }
  for (const [path, text] of files) {
    if (path.endsWith('.json')) continue;
    assert.match(text, /\$ARGUMENTS/);
    assert.match(text, /missing or disabled/);
    assert.match(text, /grants no permissions/);
  }
});

test('shortcut lifecycle respects ownership, selection, dry runs and uninstall', t => {
  const root = fixture(t), source = join(root, 'source'), config = join(root, 'config');
  stageBundle(source, { target: 'claude', selection: { profile: 'core' } });
  const options = { target: 'claude', scope: 'user' };
  const run = (operation, extra = {}) => claudeShortcuts(options, { root: config, source, operation, ...extra });
  run('install', { dryRun: true }); assert.equal(existsSync(config), false);
  run('install');
  assert.ok(existsSync(join(config, 'skills/just-vibe-shortcuts/skills/reprompt/SKILL.md')));
  assert.equal(existsSync(join(config, 'skills/just-vibe-shortcuts/skills/ml-train/SKILL.md')), false);
  assert.equal(run('doctor').installed, true);
  const changed = join(config, 'skills/just-vibe-shortcuts/skills/reprompt/SKILL.md'), original = readFileSync(changed, 'utf8');
  writeFileSync(changed, 'User edits');
  assert.deepEqual(run('doctor').conflicts, ['skills/just-vibe-shortcuts/skills/reprompt/SKILL.md']);
  assert.throws(() => run('uninstall'), /edited or belong/);
  writeFileSync(changed, original);
  writeFileSync(join(config, 'commands/unrelated.md'), 'User command');
  run('uninstall'); run('uninstall');
  assert.equal(existsSync(changed), false);
  assert.equal(readFileSync(join(config, 'commands/unrelated.md'), 'utf8'), 'User command');
  mkdirSync(join(config, 'commands/jv'), { recursive: true });
  writeFileSync(changed, 'Existing command');
  assert.throws(() => run('install', { dryRun: true }), /belong/);
  assert.equal(existsSync(join(config, 'commands/jv.md')), false);
});

test('selection expansion preflights new shortcut conflicts before changing the source', t => {
  const root = fixture(t), source = join(root, 'source'), config = join(root, 'config');
  stageBundle(source, { target: 'claude', selection: { profile: 'core' } });
  const options = { target: 'claude', scope: 'user', command: 'setup' };
  claudeShortcuts(options, { root: config, source, operation: 'install' });
  const file = join(config, 'skills/just-vibe-shortcuts/skills/ml-train/SKILL.md');
  mkdirSync(join(config, 'skills/just-vibe-shortcuts/skills/ml-train'), { recursive: true });
  writeFileSync(file, 'User file');
  assert.throws(() => claudeShortcuts({ ...options, command: 'update', selection: { profile: 'full', packs: [] } }, { root: config, source, operation: 'install', dryRun: true }), /belong/);
  assert.equal(existsSync(join(source, 'plugins/just-vibe/skills/ml-train/SKILL.md')), false);
  assert.equal(readFileSync(file, 'utf8'), 'User file');
});

test('shortcut locations follow Claude user config and project scope', () => {
  assert.equal(shortcutRoot({ scope: 'user' }, { env: { CLAUDE_CONFIG_DIR: '/custom/claude' }, cwd: '/project', home: '/home/user' }), '/custom/claude');
  for (const scope of ['project', 'local']) assert.equal(shortcutRoot({ scope }, { env: {}, cwd: '/project', home: '/home/user' }), '/project/.claude');
});
