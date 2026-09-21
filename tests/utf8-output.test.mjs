import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { runCommand } from '../plugins/just-vibe/scripts/lib/process.mjs';
import { runners } from '../plugins/just-vibe/scripts/lib/trusted-runners.mjs';
import { runtimeStore } from '../plugins/just-vibe/scripts/lib/runtime-store.mjs';
import { supervise } from '../plugins/just-vibe/scripts/service-supervisor.mjs';

const command = [
  process.execPath,
  '-e',
  `process.stdout.write(Buffer.from([0x63,0x61,0x66,0xc3]));process.stderr.write(Buffer.from([0xe6]));setTimeout(()=>{process.stdout.write(Buffer.from([0xa9]));process.stderr.write(Buffer.from([0xbc,0xa2]));},60)`,
];
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'jv-utf8-output-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}
function intact(output) {
  assert.match(output, /café/);
  assert.match(output, /漢/);
  assert.ok(!output.includes('\uFFFD'));
}

test('bounded command evidence decodes stdout and stderr independently across chunks', async () => {
  const result = await runCommand(command);
  assert.equal(result.status, 0);
  assert.equal(result.stdout, 'café');
  assert.equal(result.stderr, '漢');
  assert.equal(result.truncated, false);
  const limited = await runCommand(command, { maxBytes: 5 });
  assert.equal(limited.truncated, true);
});
for (const worker of ['agent-worker', 'preview-worker']) {
  test(`${worker} retains complete Unicode characters from both output streams`, (t) => {
    const root = fixture(t);
    writeFileSync(
      join(root, 'config.json'),
      JSON.stringify({
        token: 'fixture',
        cwd: root,
        command,
        prompt: 'Fixture',
        timeoutSeconds: 5,
        minutes: 1,
        port: 12345,
      }),
    );
    const result = spawnSync(
      process.execPath,
      [
        fileURLToPath(new URL(`../plugins/just-vibe/scripts/${worker}.mjs`, import.meta.url)),
        join(root, 'config.json'),
      ],
      { encoding: 'utf8', timeout: 10000 },
    );
    assert.equal(result.status, 0, result.stderr);
    intact(JSON.parse(readFileSync(join(root, 'status.json'), 'utf8')).output);
  });
}

test('service supervisor preserves split Unicode in bounded logs', async (t) => {
  const root = fixture(t),
    options = { home: join(root, 'home') };
  let state = await runners(
    root,
    'configure',
    { id: 'fixture', revision: 0, config: { command, purpose: 'Inert Unicode output' } },
    options,
  );
  state = await runners(
    root,
    'trust',
    { id: 'fixture', revision: state.revision, hash: state.runners[0].hash },
    options,
  );
  const store = runtimeStore(root, options);
  store.put('service-fixture', { run: 'fixture' }, 0);
  store.put(
    'service-run-fixture',
    {
      state: 'starting',
      service: 'fixture',
      runner: 'fixture',
      hash: state.runners[0].hash,
      deadline: new Date(Date.now() + 10000).toISOString(),
    },
    0,
  );
  await supervise(['--root', root, '--home', options.home, '--run', 'fixture']);
  const result = store.get('service-run-fixture');
  assert.equal(result.state, 'completed');
  intact(result.output);
});
