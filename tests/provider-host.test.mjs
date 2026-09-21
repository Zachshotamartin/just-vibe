import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
test('optional Python provider native request, privacy, stream and endpoint contracts', (t) => {
  const python = process.env.JUST_VIBE_TEST_PYTHON || 'python3';
  const probe = spawnSync(python, ['--version'], { encoding: 'utf8', timeout: 5000 });
  if (probe.status !== 0) {
    t.skip(
      'A working Python 3 interpreter is unavailable; set JUST_VIBE_TEST_PYTHON to test the optional provider host.',
    );
    return;
  }
  const result = spawnSync(
    python,
    [fileURLToPath(new URL('./provider-host-fixtures.py', import.meta.url))],
    { encoding: 'utf8', timeout: 10000, env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1' } },
  );
  assert.equal(result.status, 0, result.stdout + result.stderr);
});
