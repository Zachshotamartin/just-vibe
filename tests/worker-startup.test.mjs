import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

for (const [worker, cancelled, completed] of [
  ['agent-worker', 'cancelled', 'completed'],
  ['preview-worker', 'stopped', 'exited'],
]) {
  for (const matching of [true, false]) {
    test(`${worker} ${matching ? 'honors an owned' : 'ignores a foreign'} stop request before startup`, (t) => {
      const directory = mkdtempSync(join(tmpdir(), 'jv-worker-startup-'));
      t.after(() => rmSync(directory, { recursive: true, force: true }));
      const marker = join(directory, 'executed');
      const config = {
        token: 'owned-fixture-token',
        cwd: directory,
        command: [process.execPath, '-e',
          `require('node:fs').writeFileSync(${JSON.stringify(marker)}, 'inert fixture')`],
        prompt: 'Inert local fixture',
        timeoutSeconds: 5,
        minutes: 1,
        port: 12345,
      };
      writeFileSync(join(directory, 'config.json'), JSON.stringify(config));
      writeFileSync(join(directory, 'stop'), matching ? config.token : 'foreign-fixture-token');
      const result = spawnSync(process.execPath, [
        fileURLToPath(new URL(`../plugins/just-vibe/scripts/${worker}.mjs`, import.meta.url)),
        join(directory, 'config.json'),
      ], { encoding: 'utf8', timeout: 10000 });
      assert.equal(result.error, undefined);
      assert.equal(result.status, 0, result.stderr);
      const status = JSON.parse(readFileSync(join(directory, 'status.json'), 'utf8'));
      assert.equal(status.token, config.token);
      assert.equal(status.state, matching ? cancelled : completed);
      assert.equal(existsSync(marker), !matching);
      if (worker === 'agent-worker' && matching) assert.equal(status.childPid, null);
    });
  }
}
