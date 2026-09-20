import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync, readFileSync, statSync, chmodSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

// Evaluator-only behavior expectations; never copied into model workspaces.
export const files = ['cleanup', 'privacy', 'transcript', 'atomic', 'fingerprint', 'browser', 'rules'];
export async function evaluate(workspace) {
  const results = [];
  for (const id of files) {
    const temp = mkdtempSync(join(tmpdir(), 'jv-conversation-oracle-'));
    try {
      const m = await import(pathToFileURL(join(workspace, 'src', `${id}.mjs`)).href + `?trial=${Date.now()}-${Math.random()}`);
      if (id === 'cleanup') {
        const git = (...args) => execFileSync('git', args, { cwd: temp, stdio: 'pipe' });
        git('init', '-q'); writeFileSync(join(temp, 'note'), 'base'); git('add', 'note');
        const before = m.cleanupToken(temp); assert.equal(m.cleanupToken(temp), before);
        writeFileSync(join(temp, 'note'), 'staged'); git('add', 'note'); writeFileSync(join(temp, 'note'), 'base');
        assert.notEqual(m.cleanupToken(temp), before, 'Index-only changes must invalidate approval');
        const indexed = m.cleanupToken(temp); writeFileSync(join(temp, 'note'), 'changed');
        assert.notEqual(m.cleanupToken(temp), indexed, 'Working-tree changes must invalidate approval');
      } else if (id === 'privacy') {
        const input = { ok: true, count: 2, rows: [{ ToKeN: 'private-alpha', nested: { password: 'private-beta' } }], secret: null, note: 'public' };
        const actual = m.redactEvidence(input);
        assert.deepEqual(actual, { ok: true, count: 2, rows: [{ ToKeN: '[REDACTED]', nested: { password: '[REDACTED]' } }], secret: '[REDACTED]', note: 'public' });
        assert.equal(input.rows[0].ToKeN, 'private-alpha', 'Do not mutate source evidence');
      } else if (id === 'transcript') {
        const secret = 'line\n"quoted"\\end';
        const input = { messages: [secret, `before ${secret} after`], count: 2, ok: true, empty: null };
        assert.deepEqual(m.roundTrip(input, [secret, '']), { messages: ['[REDACTED]', 'before [REDACTED] after'], count: 2, ok: true, empty: null });
        assert.equal(input.messages[0], secret);
        assert.deepEqual(m.roundTrip({ note: 'hello' }, []), { note: 'hello' });
      } else if (id === 'atomic') {
        if (process.platform === 'win32') { results.push({ id, status: 'skipped', reason: 'POSIX permission fixture' }); continue; }
        const path = join(temp, 'script'); writeFileSync(path, 'old'); chmodSync(path, 0o751);
        m.atomicSave(path, 'new'); assert.equal(readFileSync(path, 'utf8'), 'new');
        assert.equal(statSync(path).mode & 0o777, 0o751, 'Replacement must preserve access mode');
        const fresh = join(temp, 'fresh'); m.atomicSave(fresh, 'private');
        assert.equal(statSync(fresh).mode & 0o077, 0, 'New file must remain private');
      } else if (id === 'fingerprint') {
        writeFileSync(join(temp, 'data'), 'original');
        const before = m.fingerprint(temp); assert.equal(before.complete, true); assert.equal(m.fingerprint(temp).digest, before.digest);
        writeFileSync(join(temp, 'data'), 'changed'); assert.notEqual(m.fingerprint(temp).digest, before.digest);
        try { symlinkSync('missing-target', join(temp, 'link')); }
        catch (error) {
          if (process.platform !== 'win32' || !['EPERM', 'EACCES'].includes(error.code)) throw error;
          results.push({ id, status: 'skipped', reason: 'Windows symlink creation unavailable' }); continue;
        }
        assert.equal(m.fingerprint(temp).complete, false, 'Omitted link targets make coverage partial');
      } else if (id === 'browser') {
        assert.equal(await m.assertEventually(async () => 'ready', 'ready', 300), true);
        const start = Date.now(); let reads = 0;
        assert.equal(await m.assertEventually(async () => { reads++; return Date.now() - start >= 35 ? 'ready' : 'pending'; }, 'ready', 500), true);
        assert.ok(reads > 1);
        await assert.rejects(m.assertEventually(async () => 'pending', 'ready', 30));
        const readerError = new Error('reader disconnected');
        await assert.rejects(m.assertEventually(async () => { throw readerError; }, 'ready', 30), e => e === readerError);
        let timer;
        try {
          const bounded = await Promise.race([
            assert.rejects(m.assertEventually(() => new Promise(() => {}), 'ready', 30)).then(() => true),
            new Promise(resolve => { timer = setTimeout(() => resolve(false), 500); }),
          ]);
          assert.equal(bounded, true, 'A pending reader must not bypass the assertion deadline');
        } finally { clearTimeout(timer); }
      } else if (id === 'rules') {
        const rules = [{ id: 'retired', active: false, destination: 'CLAUDE.md', text: 'old convention' }, { id: 'live', active: true, destination: 'CLAUDE.md', text: 'current' }];
        const result = m.moveRule(rules, 'retired', 'AGENTS.md');
        assert.deepEqual(result, [{ ...rules[0], destination: 'AGENTS.md' }, rules[1]]);
        assert.equal(rules[0].destination, 'CLAUDE.md'); assert.notEqual(result[1], rules[1]);
        assert.equal(m.moveRule(rules, 'live', 'AGENTS.md')[1].destination, 'AGENTS.md');
        assert.throws(() => m.moveRule(rules, 'missing', 'AGENTS.md'));
        assert.throws(() => m.moveRule(rules, 'live', '../outside'));
      }
      results.push({ id, status: 'passed' });
    } catch (error) { results.push({ id, status: 'failed', error: error.message, code: error.code || error.name }); }
    finally { rmSync(temp, { recursive: true, force: true }); }
  }
  return results;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify(await evaluate(resolve(process.argv[2]))));
}
