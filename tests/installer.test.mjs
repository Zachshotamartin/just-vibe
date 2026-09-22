import test from 'node:test';
import assert from 'node:assert/strict';
import { install, parseArgs, main, execute, marketplaceMatches, REPOSITORY, PLUGIN } from '../plugins/just-vibe/scripts/installer.mjs';

function hostFixture(target = 'codex', initial = {}) {
  const state = { registered: false, installed: false, enabled: true, scope: 'user', ...initial };
  const calls = [];
  const writes = [];
  const run = (binary, args) => {
    calls.push([binary, ...args]);
    if (state.fail?.(args)) throw new Error('Simulated host failure');
    if (args.includes('--version')) return `${binary} test-version`;
    if (args.includes('--help')) return 'supported';
    if (args.join(' ') === 'plugin marketplace list --json') {
      const entry = target === 'codex'
        ? { name: 'just-vibe', marketplaceSource: { sourceType: 'git', source: state.source || REPOSITORY } }
        : { name: 'just-vibe', source: 'github', repo: state.source || REPOSITORY };
      const entries = state.registered ? [entry] : [];
      return JSON.stringify(target === 'codex' ? { marketplaces: entries } : entries);
    }
    if (args.join(' ') === 'plugin list --json') {
      const entry = target === 'codex'
        ? { pluginId: PLUGIN, enabled: state.enabled, version: '0.1.0' }
        : { id: PLUGIN, enabled: state.enabled, scope: state.scope, version: '0.1.0' };
      const entries = state.installed ? [entry] : [];
      return JSON.stringify(target === 'codex' ? { installed: entries } : entries);
    }
    writes.push([binary, ...args]);
    if (args[1] === 'marketplace') state.registered = true;
    else if (['remove', 'uninstall'].includes(args[1])) state.installed = false;
    else {
      state.installed = true;
      state.enabled = true;
      if (args.includes('--scope')) state.scope = args[args.indexOf('--scope') + 1];
    }
    return 'ok';
  };
  return { state, calls, writes, run, log: () => {}, source: REPOSITORY,
    shortcuts: () => ({ installed: true, conflicts: [], missing: [], outdated: [], interrupted: false, files: 222 }) };
}

for (const target of ['codex', 'claude']) {
  test(`${target}: setup, repeat, doctor, update and uninstall preserve marketplace`, () => {
    const host = hostFixture(target);
    const options = parseArgs(['setup', '--target', target, '--github']);
    install(options, host);
    assert.equal(host.writes.length, 2);
    assert.equal(host.state.installed, true);
    const writes = host.writes.length;
    install(options, host);
    install({ ...options, command: 'doctor' }, host);
    assert.equal(host.writes.length, writes);
    install({ ...options, command: 'update' }, host);
    assert.deepEqual(host.writes.at(-2).slice(1), ['plugin', 'marketplace', target === 'codex' ? 'upgrade' : 'update', 'just-vibe']);
    install({ ...options, command: 'uninstall' }, host);
    assert.equal(host.state.installed, false);
    assert.equal(host.state.registered, true);
    if (target === 'claude') assert.ok(host.writes.at(-1).includes('--keep-data'));
    const afterRemoval = host.writes.length;
    install({ ...options, command: 'uninstall' }, host);
    assert.equal(host.writes.length, afterRemoval);
  });

  test(`${target}: unexpected marketplace source is not overwritten`, () => {
    const host = hostFixture(target, { registered: true, source: 'another-owner/just-vibe' });
    assert.throws(() => install(parseArgs(['setup', '--target', target, '--github']), host), /different or unrecognized source/);
    assert.equal(host.writes.length, 0);
  });

  test(`${target}: disabled plugin is enabled`, () => {
    const host = hostFixture(target, { registered: true, installed: true, enabled: false });
    install(parseArgs(['setup', '--target', target, '--github']), host);
    assert.equal(host.state.enabled, true);
    assert.equal(host.writes.length, 1);
  });

  test(`${target}: partial install can be retried without re-registering marketplace`, () => {
    const host = hostFixture(target, { fail: args => ['add', 'install'].includes(args[1]) && !args.includes('--help') });
    const options = parseArgs(['setup', '--target', target, '--github']);
    assert.throws(() => install(options, host), /Earlier native steps may have completed/);
    assert.equal(host.state.registered, true);
    assert.equal(host.state.installed, false);
    host.state.fail = undefined;
    install(options, host);
    assert.equal(host.state.installed, true);
    assert.equal(host.writes.filter(args => args.includes('marketplace')).length, 1);
  });
}

test('all dry-run operations execute zero host commands', () => {
  for (const command of ['setup', 'update', 'doctor', 'uninstall']) {
    install(parseArgs([command, '--dry-run']), { run: () => assert.fail('Executed a host command'), log: () => {} });
  }
});

test('unknown options, invalid targets, duplicate flags, missing values and Codex scope are rejected', () => {
  for (const args of [
    ['setup', '--typo'], ['destroy'], ['setup', '--target', 'other'], ['setup', '--target'],
    ['setup', '--dry-run', '--dry-run'], ['setup', '--scope', 'user'],
    ['setup', '--target', 'claude', '--scope', 'global'], ['setup', 'unexpected'],
  ]) assert.throws(() => parseArgs(args));
});

test('another Claude scope is detected before any mutations', () => {
  const host = hostFixture('claude', { registered: true, installed: true, scope: 'project' });
  assert.throws(() => install(parseArgs(['setup', '--target', 'claude', '--github']), host), /another Claude scope/);
  assert.equal(host.writes.length, 0);
});

test('requested Claude scope is passed to the native install', () => {
  const host = hostFixture('claude');
  install(parseArgs(['setup', '--target', 'claude', '--scope', 'local', '--github']), host);
  assert.equal(host.state.scope, 'local');
});

test('all planned native commands are checked before marketplace registration', () => {
  const host = hostFixture('codex', { fail: args => args[1] === 'add' && args.includes('--help') });
  assert.throws(() => install(parseArgs(['setup', '--github']), host), /Simulated/);
  assert.equal(host.writes.length, 0);
});

test('malformed inventory stops before any write', () => {
  const host = hostFixture();
  const run = (binary, args) => args.includes('--json') ? '{}' : host.run(binary, args);
  assert.throws(() => install(parseArgs(['setup', '--github']), { ...host, run }), /Unsupported host inventory/);
  assert.equal(host.writes.length, 0);
});

test('invalid JSON produces actionable diagnostics', () => {
  assert.throws(() => install(parseArgs(['setup', '--github']), {
    run: () => 'not json', log: () => {},
  }), /did not return valid JSON/);
});

test('missing and disabled installations fail doctor without mutation', () => {
  for (const initial of [{}, { registered: true, installed: true, enabled: false }]) {
    const host = hostFixture('codex', initial);
    assert.throws(() => install(parseArgs(['doctor', '--github']), host), /not fully installed|disabled/);
    assert.equal(host.writes.length, 0);
  }
});

test('host claiming success without installation is not reported as ready', () => {
  const host = hostFixture();
  const run = (binary, args) => {
    if (args[1] === 'add' && !args.includes('--help')) return 'success';
    return host.run(binary, args);
  };
  assert.throws(() => install(parseArgs(['setup', '--github']), { ...host, run }), /did not report an enabled/);
});

test('GitHub URL forms normalize but other hosts are rejected', () => {
  for (const source of [REPOSITORY, `https://github.com/${REPOSITORY}.git`, `git@github.com:${REPOSITORY}.git`]) {
    assert.equal(marketplaceMatches({ marketplaceSource: { sourceType: 'git', source } }, { target: 'codex', github: true }, REPOSITORY), true);
  }
  assert.equal(marketplaceMatches({ marketplaceSource: { sourceType: 'git', source: `https://example.com/${REPOSITORY}` } }, { target: 'codex', github: true }, REPOSITORY), false);
});

test('executor passes shell metacharacters as literal arguments', () => {
  const value = 'a space; $(echo NOT_EXECUTED) `echo NOT_EXECUTED`';
  assert.equal(execute(process.execPath, ['-e', 'console.log(process.argv[1])', value]), value);
});

test('missing executable has a clear error', () => {
  assert.throws(() => execute('just-vibe-nonexistent-binary-for-test', []), /not found on PATH/);
});

test('CLI exits nonzero on errors and zero for help', () => {
  const messages = [];
  assert.equal(main(['setup', '--bad'], { error: message => messages.push(message) }), 1);
  assert.match(messages[0], /Unexpected argument/);
  assert.equal(main(['--help'], { log: () => {} }), 0);
});
