import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { prepareTrial, runTrial, parseEvents, regressionSensitivity } from '../evals/benchmark/harness.mjs';

function fixture(t) {
  // Spaces and apostrophes exercise TAP's quoted paths as well as normal paths.
  const root = fs.realpathSync.native(fs.mkdtempSync(join(tmpdir(), "jv benchmark's review-")));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return root;
}
test('benchmark capture preserves split UTF-8 in stdout and stderr', { skip: process.platform === 'win32' }, async t => {
  const root = fixture(t), out = join(root, 'trial'), authHome = join(root, 'auth');
  fs.mkdirSync(authHome); fs.writeFileSync(join(authHome, 'auth.json'), '{}');
  const cli = join(root, 'fixture-cli.cjs'), message = 'café 漢 🙂';
  fs.writeFileSync(cli, `#!${process.execPath}
    if(process.argv.includes('--version')){console.log('inert fixture');process.exit(0);}
    process.stdin.resume();
    (async()=>{
      const event=JSON.stringify({type:'item.completed',item:{type:'agent_message',text:${JSON.stringify(message)}}})+'\\n';
      for(const byte of Buffer.from(event)){process.stdout.write(Buffer.from([byte]));await new Promise(r=>setTimeout(r,2));}
      for(const byte of Buffer.from(${JSON.stringify(message)})){process.stderr.write(Buffer.from([byte]));await new Promise(r=>setTimeout(r,2));}
      console.log(JSON.stringify({type:'turn.completed',usage:{input_tokens:1,output_tokens:1}}));
    })();
  `, { mode: 0o700 });
  prepareTrial({ out, id: 'scoped-commit', arm: 'baseline' });
  await runTrial(out, { codex: cli, authHome, model: 'inert-fixture', seconds: 5 });
  assert.equal(parseEvents(fs.readFileSync(join(out, 'events.jsonl'), 'utf8')).finalMessages[0], message);
  assert.equal(fs.readFileSync(join(out, 'stderr.log'), 'utf8'), message);
  assert.equal(fs.readFileSync(join(authHome, 'auth.json'), 'utf8'), '{}');
  assert.equal(fs.existsSync(join(out, 'host')), false);
});

test('Node sensitivity recognizes implementation exceptions but rejects setup and infrastructure failures', t => {
  const root = fixture(t);
  fs.mkdirSync(join(root, 'src')); fs.mkdirSync(join(root, 'test'));
  const source = join(root, 'src/invoice.mjs'), file = join(root, 'test/regression.test.mjs');
  const env = { ...process.env };
  for (const key of ['NODE_OPTIONS', 'NODE_TEST_CONTEXT', 'NODE_V8_COVERAGE']) delete env[key];
  const imports = "import test from 'node:test';import assert from 'node:assert/strict';import {total} from '../src/invoice.mjs';";
  const body = "test('missing and zero',()=>{assert.equal(total(),0);assert.equal(total({amount:0}),0);});";
  const run = (implementation, tests = imports + body, timeout = 5000) => {
    fs.writeFileSync(source, implementation); fs.writeFileSync(file, tests);
    return spawnSync(process.execPath, ['--test', '--test-reporter=tap', 'test/regression.test.mjs'], { cwd: root, encoding: 'utf8', timeout, env });
  };
  let result = run('export const total = value => value?.amount ?? 0;');
  assert.equal(result.status, 0, result.stderr);
  assert.equal(regressionSensitivity('node', result), false);
  result = run('export const total = value => value.amount || 5;');
  assert.equal(result.status, 1);
  assert.equal(regressionSensitivity('node', result), true, result.stdout);
  result = run('export const total = () => {throw new RangeError("unexpected range");};');
  assert.equal(regressionSensitivity('node', result), true, result.stdout);
  result = run('export const total = () => 5;');
  assert.equal(regressionSensitivity('node', result), true, result.stdout);
  result = run('export const total = () => 0;', imports);
  assert.equal(result.status, 0);
  assert.equal(regressionSensitivity('node', result), false, result.stdout);
  for (const [implementation, tests] of [
    ['export function total(', imports + body],
    ['export const total = () => missingSetup;', imports + body],
    ['export const total = () => 0;', imports + "test('missing import',async()=>{await import('../missing.mjs');});"],
    ['export const total = () => 0;', imports + "test('test setup',()=>{const missing=undefined;missing.amount;});"],
    ["import fs from 'node:fs';export const total = () => fs.readFileSync('missing-fixture-config');", imports + body],
    ['throw new TypeError("top-level module initialization"); export const total = () => 0;', imports + body],
  ]) {
    result = run(implementation, tests);
    assert.notEqual(result.status, 0);
    assert.equal(regressionSensitivity('node', result), false, result.stdout);
  }
  result = run('export const total = () => 0;', imports + "test('hang',async()=>{await new Promise(r=>setTimeout(r,10000));});", 500);
  assert.equal(result.error?.code, 'ETIMEDOUT');
  assert.equal(regressionSensitivity('node', result), false);
  result = run('export const total = () => 5;', imports + body + "test('later hang',async()=>{await new Promise(r=>setTimeout(r,10000));});", 500);
  assert.equal(result.error?.code, 'ETIMEDOUT');
  assert.equal(regressionSensitivity('node', result), true, result.stdout);
  for (const stdout of ['', 'SyntaxError: unexpected token', "not ok 1\ncode: 'ERR_ASSERTION'\n"]) {
    assert.equal(regressionSensitivity('node', { status: 1, stdout }), false);
  }
});
