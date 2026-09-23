import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { startOperatorServer } from '../plugins/just-vibe/scripts/lib/operator-http.mjs';
import { preferences } from '../plugins/just-vibe/scripts/lib/preferences.mjs';
import { portableContext } from '../plugins/just-vibe/scripts/lib/portable-context.mjs';
import { assistantRuntime } from '../plugins/just-vibe/scripts/lib/assistant-runtime.mjs';
import { adaptiveStore } from '../plugins/just-vibe/scripts/lib/adaptive-store.mjs';
import { changeLesson } from '../plugins/just-vibe/scripts/lib/adaptive-learning.mjs';
import { runtimeStore } from '../plugins/just-vibe/scripts/lib/runtime-store.mjs';

const { chromium } = createRequire(new URL('../website/package.json', import.meta.url))('playwright');
const directory = mkdtempSync(join(tmpdir(), 'jv-dashboard-races-'));
const root = join(directory, 'project'), home = join(directory, 'home');
mkdirSync(root);
const lesson = preferences(root, 'create', { workflow: 'fix', scope: 'project', draft: { instruction: 'Reproduce the bug first.' } }, { home });
const app = await startOperatorServer(root, { home });
let browser;
const releases = [];
const deferred = () => { let resolve; const promise = new Promise(done => resolve = done); return { promise, resolve }; };
try {
  browser = await chromium.launch();
  const page = await browser.newPage(), errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const button = name => page.getByRole('button', { name, exact: true });
  const settled = () => page.evaluate(() => new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done))));
  async function holdResponse(pattern) {
    const arrived = deferred(), release = deferred(); releases.push(release.resolve);
    await page.route(pattern, async route => {
      const response = await route.fetch(); arrived.resolve();
      await release.promise; await route.fulfill({ response });
    });
    return { arrived: arrived.promise, release: async () => { release.resolve(); await page.unrouteAll({ behavior: 'wait' }); } };
  }

  await page.goto(app.url);
  await button('Tool catalog').click();
  await page.getByRole('heading', { name: 'orient', exact: true }).waitFor();
  const loading = await holdResponse('**/api/preferences*');
  await button('Preferences').click();
  await loading.arrived;
  await page.getByRole('searchbox').fill('fix');
  await settled();
  assert.deepEqual(errors, [], 'Filtering while preferences load must not render catalog records as lessons');
  assert.equal(await page.locator('#rows article').count(), 0);
  await loading.release();
  await page.getByRole('heading', { name: 'fix', exact: true }).waitFor();

  // Task recency can differ from instruction-delivery recency.
  await page.route('**/api/preferences-activity', async route => {
    const response = await route.fetch(), activity = await response.json();
    activity.tasks = [
      { id: 'recently-edited-task', loads: [{ at: '2026-09-20T12:00:00.000Z', lessons: [{ id: lesson.id, version: 1 }] }] },
      { id: 'recently-loaded-task', loads: [{ at: '2026-09-21T12:00:00.000Z', lessons: [{ id: lesson.id, version: 2 }] }] },
    ];
    await route.fulfill({ response, json: activity });
  });
  await button('Refresh').click();
  await page.getByText('Latest retained load used version 2 at 2026-09-21T12:00:00.000Z.', { exact: false }).waitFor();
  await page.unrouteAll({ behavior: 'wait' });

  // Saving without changing the draft is still a mutation and must remain locked.
  await page.getByText('Edit and preview', { exact: true }).click();
  const editing = await holdResponse('**/api/preferences-action');
  await button('Save new version').click(); await editing.arrived;
  await button('Refresh').click();
  await page.getByText('project scope · version 2 · Enabled', { exact: true }).waitFor();
  for (const name of ['Save new version', 'Disable', 'Discard draft', 'Restore version 1']) {
    if (name.startsWith('Restore')) await page.getByText('Version history and undo', { exact: true }).click();
    assert.equal(await button(name).isEnabled(), false, `${name} must stay locked across renders while this lesson is saving`);
  }
  await page.locator('article').getByLabel('Instruction', { exact: true }).fill('Newer unsaved edit during submission');
  await editing.release();
  await page.waitForFunction(() => [...document.querySelectorAll('button')].some(b => b.textContent === 'Save new version' && !b.disabled));
  assert.equal(await page.locator('article').getByLabel('Instruction', { exact: true }).inputValue(), 'Newer unsaved edit during submission');
  assert.equal(preferences(root, 'list', {}, { home }).lessons[0].history.length, 2);
  await button('Discard draft').click();
  await page.getByText('Edit and preview', { exact: true }).click();
  await page.locator('article').getByLabel('Instruction', { exact: true }).fill('Retry this retained draft after a failed save.');
  await page.route('**/api/preferences-action', route => route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'Synthetic save failure' }) }));
  await button('Save new version').click();
  await page.getByText('Synthetic save failure', { exact: true }).waitFor();
  assert.equal(await button('Save new version').isEnabled(), true);
  assert.equal(await page.locator('article').getByLabel('Instruction', { exact: true }).inputValue(), 'Retry this retained draft after a failed save.');
  assert.equal(preferences(root, 'list', {}, { home }).lessons[0].history.length, 2);
  await page.unrouteAll({ behavior: 'wait' });
  await button('Save new version').click();
  await page.getByText('project scope · version 3 · Enabled', { exact: true }).waitFor();

  await page.getByText('Create a preference', { exact: true }).click();
  const form = page.locator('#rows > details');
  await form.getByLabel('Workflow ID', { exact: true }).fill('fix');
  await form.getByLabel('Instruction', { exact: true }).fill('New explicit instruction');
  const creating = await holdResponse('**/api/preferences-action');
  await button('Create preference').click(); await creating.arrived;
  await page.getByRole('searchbox').fill('');
  assert.equal(await button('Create preference').isEnabled(), false, 'Rerender must preserve the pending mutation');
  await form.getByLabel('Instruction', { exact: true }).fill('Next unsaved instruction');
  await creating.release();
  await page.locator('article').filter({ hasText: 'New explicit instruction' }).waitFor();
  assert.equal(preferences(root, 'list', {}, { home }).lessons.filter(l => l.history[0].change.instruction === 'New explicit instruction').length, 1);
  assert.equal(await form.getByLabel('Instruction', { exact: true }).inputValue(), 'Next unsaved instruction');
  assert.equal(await button('Create preference').isEnabled(), true);

  await button('Backup and transfer').click();
  const store = runtimeStore(root, { home });
  const memory = id => ({ entries: [{ id, title: id, body: 'Synthetic ' + id, source: 'user', tags: [] }] });
  store.put('memory', memory('reviewed-a'), 0);
  await button('Review export').click();
  await button('Download reviewed backup').waitFor();
  store.put('memory', memory('changed-b'), store.get('memory').revision);
  const exporting = await holdResponse('**/api/context-export');
  await button('Review export').click(); await exporting.arrived;
  await button('Refresh').click();
  assert.equal(await button('Download reviewed backup').isEnabled(), false);
  assert.equal(await button('Review export').isEnabled(), false);
  await exporting.release();
  await page.waitForFunction(() => document.querySelector('#rows > pre').textContent.includes('changed-b'));
  const downloading = page.waitForEvent('download');
  await button('Download reviewed backup').click();
  const download = await downloading, stream = await download.createReadStream();
  let downloaded = ''; for await (const chunk of stream) downloaded += chunk;
  assert.deepEqual(JSON.parse(downloaded), JSON.parse(await page.locator('#rows > pre').first().textContent()), 'Downloaded backup must match the displayed review');
  // A valid export near the byte limit must remain importable as a downloaded file.
  store.put('memory', { entries: Array.from({ length: 180 }, (_, i) => ({ id: `near-limit-${i}`, title: `Note ${i}`, body: 'x'.repeat(2800), source: 'user', tags: [] })) }, store.get('memory').revision);
  const largeBundle = portableContext(root, 'export', {}, { home });
  assert.ok(Buffer.byteLength(JSON.stringify(largeBundle)) <= 524288);
  assert.ok(Buffer.byteLength(JSON.stringify(largeBundle, null, 2)) > 524288, 'Fixture must expose formatting overhead at the limit');
  await button('Review export').click();
  await page.waitForFunction(() => document.querySelector('#rows > pre').textContent.includes('near-limit-0'));
  const largeDownloading = page.waitForEvent('download');
  await button('Download reviewed backup').click();
  const largeDownload = await largeDownloading, largeStream = await largeDownload.createReadStream(), chunks = [];
  for await (const chunk of largeStream) chunks.push(chunk);
  const backup = Buffer.concat(chunks);
  assert.deepEqual(JSON.parse(backup.toString()), JSON.parse(await page.locator('#rows > pre').first().textContent()));
  await page.getByLabel('Import JSON file').setInputFiles({ name: 'large-backup.json', mimeType: 'application/json', buffer: backup });
  await page.waitForFunction(() => document.querySelector('textarea').value.includes('near-limit-0') || document.querySelector('#status').textContent.includes('Choose a bundle up to 512 KiB'));
  assert.equal(await page.getByLabel('Or paste a project context bundle', { exact: true }).inputValue(), backup.toString(), 'A downloaded valid backup must be accepted by the file picker');
  assert.ok(backup.length <= 524288);
  await button('Preview import').click();
  await button('Apply reviewed import').waitFor();
  store.put('memory', { entries: [] }, store.get('memory').revision);
  const input = page.getByLabel('Or paste a project context bundle', { exact: true });
  const bundle = portableContext(root, 'export', {}, { home });
  bundle.lessons = [];
  bundle.memories = [{ id: 'reviewed-note', title: 'Reviewed note', body: 'This exact import was reviewed.', source: 'user', tags: [] }];
  await input.fill(JSON.stringify(bundle));
  await button('Preview import').click();
  await button('Apply reviewed import').waitFor();
  const applying = await holdResponse('**/api/context-apply');
  await button('Apply reviewed import').click(); await applying.arrived;
  await button('Refresh').click();
  for (const control of [input, page.getByLabel('Import JSON file'), button('Preview import'), button('Apply reviewed import')]) {
    assert.equal(await control.isEnabled(), false, 'The reviewed bundle must stay fixed until its import completes');
  }
  await button('Workspace').click();
  await button('Backup and transfer').click();
  assert.equal(await input.isEnabled(), false, 'Switching views must not unlock a pending import');
  assert.equal(JSON.parse(await input.inputValue()).memories[0].id, 'reviewed-note');
  await applying.release();
  await page.getByText('Project context imported.', { exact: false }).waitFor();
  assert.equal(await input.isEnabled(), true);
  assert.deepEqual(portableContext(root, 'export', {}, { home }).memories.map(m => m.id), ['reviewed-note']);

  // A slow file read must not let Preview import reuse the previous textarea value.
  await page.evaluate(() => {
    const read = File.prototype.text;
    File.prototype.text = async function () {
      await new Promise(done => { window.releaseFileRead = done; });
      return read.call(this);
    };
  });
  bundle.memories[0].id = 'next-note';
  await page.getByLabel('Import JSON file').setInputFiles({ name: 'next.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(bundle)) });
  await page.waitForFunction(() => typeof window.releaseFileRead === 'function');
  assert.equal(await input.inputValue(), '');
  assert.equal(await button('Preview import').isEnabled(), false);
  await button('Refresh').click();
  assert.equal(await button('Preview import').isEnabled(), false);
  await page.evaluate(() => window.releaseFileRead());
  await page.waitForFunction(() => document.querySelector('textarea').value.includes('next-note'));
  assert.equal(await button('Preview import').isEnabled(), true);

  const task = assistantRuntime(root, 'start', { brief: 'Fix a bug', host: 'codex', sessionId: 'forgotten-preference' }, { home });
  assistantRuntime(root, 'select', { taskId: task.id, workflows: ['fix'], mode: 'apply', reason: 'Check exclusions after forgetting' }, { home });
  const current = preferences(root, 'activity', {}, { home }).tasks.find(t => t.id === task.id);
  preferences(root, 'exclude', { taskId: task.id, revision: current.revision, lessonIds: [lesson.id] }, { home });
  changeLesson(adaptiveStore(root, { home }), 'forget', { id: lesson.id, revision: preferences(root, 'list', {}, { home }).lessons.find(l => l.id === lesson.id).revision });
  await button('Preference activity').click();
  await page.getByText('Ignore preferences for this task only', { exact: true }).click();
  await page.locator('article input[type=checkbox]').check();
  await button('Workspace').click();
  await button('Preference activity').click();
  await page.locator('article input[type=checkbox]').waitFor({ state: 'attached' });
  assert.equal(await page.locator('article input[type=checkbox]').isChecked(), true, 'An unsaved task exclusion must survive switching views');
  assert.equal(await page.locator('article details').evaluate(details => details.open), true);
  const excluded = page.waitForResponse('**/api/preferences-action');
  await button('Save task exclusions').click();
  assert.equal((await excluded).status(), 200, 'An invisible forgotten ID must not prevent future exclusion changes');
  const retained = preferences(root, 'activity', {}, { home }).tasks.find(t => t.id === task.id).ignoredLessons;
  assert.equal(retained.length, 1);
  assert.ok(!retained.includes(lesson.id));

  // Keep edits made during a save; refreshing must not enable a duplicate write.
  await page.locator('article input[type=checkbox]').uncheck();
  const excluding = await holdResponse('**/api/preferences-action');
  await button('Save task exclusions').click(); await excluding.arrived;
  await button('Refresh').click();
  await page.getByText('This task changed.', { exact: false }).waitFor();
  assert.equal(await button('Save task exclusions').isEnabled(), false);
  assert.equal(await button('Discard exclusion draft').isEnabled(), false);
  await page.locator('article input[type=checkbox]').check();
  await excluding.release();
  await page.waitForFunction(() => [...document.querySelectorAll('button')].some(b => b.textContent === 'Save task exclusions' && !b.disabled));
  assert.equal(await page.locator('article input[type=checkbox]').isChecked(), true);
  assert.deepEqual(preferences(root, 'activity', {}, { home }).tasks.find(t => t.id === task.id).ignoredLessons, []);
  let savedExclusions = page.waitForResponse('**/api/preferences-action');
  await button('Save task exclusions').click(); assert.equal((await savedExclusions).status(), 200);
  await page.waitForFunction(() => [...document.querySelectorAll('button')].some(b => b.textContent === 'Save task exclusions' && !b.disabled));

  // A concurrent task update requires explicit rebasing and retains the draft.
  await page.locator('article input[type=checkbox]').uncheck();
  const taskStore = adaptiveStore(root, { home }), before = taskStore.task(task.id);
  taskStore.saveTask({ ...before, updatedAt: new Date().toISOString() });
  await button('Refresh').click();
  await page.getByText('This task changed.', { exact: false }).waitFor();
  assert.equal(await page.locator('article input[type=checkbox]').isChecked(), false);
  assert.equal(await button('Save task exclusions').isEnabled(), false);
  await button('Keep exclusions against current task').click();
  await page.waitForFunction(() => [...document.querySelectorAll('button')].some(b => b.textContent === 'Save task exclusions' && !b.disabled));
  savedExclusions = page.waitForResponse('**/api/preferences-action');
  await button('Save task exclusions').click(); assert.equal((await savedExclusions).status(), 200);
  assert.deepEqual(taskStore.task(task.id).ignoredLessons, []);
  assert.deepEqual(errors, []);
  console.log('Dashboard races passed: loading/filtering, delivery order, exclusive preference saves and retry, duplicate creation, retained drafts, exact backup download, near-limit backup round trip, exact pending import, slow file reads and retained/rebased task exclusions.');
} catch (error) {
  const page = browser?.contexts()[0]?.pages()[0];
  if (page) console.error('Dashboard status at failure:', await page.locator('#status').textContent().catch(() => 'unavailable'));
  throw error;
} finally {
  for (const release of releases) release();
  await browser?.close(); await app.close();
  rmSync(directory, { recursive: true, force: true });
}
