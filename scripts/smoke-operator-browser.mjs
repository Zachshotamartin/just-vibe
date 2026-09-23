import { preferences } from '../plugins/just-vibe/scripts/lib/preferences.mjs';
import { assistantRuntime } from '../plugins/just-vibe/scripts/lib/assistant-runtime.mjs';
import { loadCatalog } from '../plugins/just-vibe/scripts/lib/catalog.mjs';
import { loadMethods } from '../plugins/just-vibe/scripts/lib/method-library.mjs';
import { createRequire } from 'node:module';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { startOperatorServer } from '../plugins/just-vibe/scripts/lib/operator-http.mjs';
import { operator } from '../plugins/just-vibe/scripts/lib/operator.mjs';
import { runtimeStore } from '../plugins/just-vibe/scripts/lib/runtime-store.mjs';
const require = createRequire(new URL('../website/package.json', import.meta.url));
const { chromium } = require('playwright'),
  AxeBuilder = require('@axe-core/playwright').default;
const temp = mkdtempSync(join(tmpdir(), 'jv-browser-')),
  root = join(temp, 'project'),
  home = join(temp, 'home');
mkdirSync(root);
const directory = resolve('.tmp/operator-browser');
mkdirSync(directory, { recursive: true });
await operator(
  root,
  'message',
  {
    revision: 0,
    id: 'review',
    recipient: 'owner',
    message: 'Review the current implementation evidence.',
  },
  { home },
);
const task = assistantRuntime(root, 'start', { brief: 'Always check drawer behavior in this project.', host: 'codex', sessionId: 'operator-fixture' }, {home});
assistantRuntime(root, 'feedback', { taskId:task.id, revision:0, scope:'project', kind:'correction', workflow:'ui-states', excerpt:task.userMessage, instruction:'Check drawer behavior.', triggers:['drawer behavior'] }, {home});
const catalogSize = loadCatalog().commands.length + loadMethods().length;
const app = await startOperatorServer(root, { home, allowInstall: true });
const store = runtimeStore(root, { home }),
  initial = store.get('operator');
store.put(
  'operator',
  {
    ...initial,
    dispatch: [
      {
        id: 'completed',
        requestId: 'completed-request',
        job: 'fixture',
        status: 'finished',
        outcome: 'completed',
        at: new Date().toISOString(),
      },
    ],
  },
  initial.revision,
);
let browser;
const checks = [],
  errors = [];
try {
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  for (const [name, width, height] of [
    ['desktop', 1440, 1000],
    ['mobile', 390, 844],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto(app.url.replace('/#', '/?viewport=' + name + '#'));
    await page.getByRole('button', { name: 'Acknowledge', exact: true }).count();
    await page.getByRole('button', { name: 'Tool catalog', exact: true }).click();
    await page.waitForFunction(
      size => document.querySelector('#status').textContent === size + ' records', catalogSize,
    );
    await page.locator('#search').fill('pytorch');
    await page.waitForFunction(() => document.querySelectorAll('#rows article').length === 1);
    await page.locator('#rows summary').focus();
    await page.keyboard.press('Enter');
    if (!(await page.locator('#rows pre').isVisible())) throw Error('Keyboard expansion failed');
    await page.evaluate(() =>
      Promise.all(document.getAnimations().map((a) => a.finished.catch(() => {}))),
    );
    await page.screenshot({ path: join(directory, `operator-${name}.png`), fullPage: true });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    if (overflow) throw Error('Horizontal overflow');
    const axe = await new AxeBuilder({ page }).analyze();
    if (axe.violations.length)
      throw Error(
        JSON.stringify(
          axe.violations.map((v) => ({
            id: v.id,
            nodes: v.nodes.map((n) => ({ html: n.html, summary: n.failureSummary })),
          })),
        ),
      );
    await page.locator('#search').fill('nothing-will-match-this');
    if (await page.locator('#rows article').count()) throw Error('Empty filter failed');
    await page.locator('#search').fill('');
    await page.getByRole('button', {name:'Preferences',exact:true}).click();
    await page.getByText('Edit and preview',{exact:true}).click();
    await page.locator('article').getByLabel('Instruction',{exact:true}).fill('Check drawer behavior and Escape.');
    await page.locator('#search').fill('ui-states');
    if (await page.locator('article').getByLabel('Instruction',{exact:true}).inputValue() !== 'Check drawer behavior and Escape.') throw Error('Filtering discarded draft');
    await page.getByRole('button',{name:'Workspace',exact:true}).click();
    await page.getByRole('button',{name:'Preferences',exact:true}).click();
    await page.locator('article').getByLabel('Instruction',{exact:true}).waitFor();
    if (await page.locator('article').getByLabel('Instruction',{exact:true}).inputValue() !== 'Check drawer behavior and Escape.') throw Error('Switching views discarded draft');
    await page.locator('#search').fill('');
    if (name === 'desktop') {
      const lesson=preferences(root,'list',{}, {home}).lessons[0];
      preferences(root,'edit',{id:lesson.id,revision:lesson.revision,draft:{instruction:'An intervening saved change.'}},{home});
      await page.getByRole('button',{name:'Refresh',exact:true}).click();
      await page.getByRole('button',{name:'Keep draft against current version',exact:true}).waitFor();
      if(await page.getByRole('button',{name:'Save new version',exact:true}).isEnabled())throw Error('Stale draft was silently rebased');
      await page.getByRole('button',{name:'Keep draft against current version',exact:true}).click();
      await page.getByRole('button',{name:'Keep draft against current version',exact:true}).waitFor({state:'hidden'});
      if(await page.locator('article').getByLabel('Instruction',{exact:true}).inputValue()!=='Check drawer behavior and Escape.')throw Error('Stale draft was discarded');
    }
    await page.getByLabel('Request that should select this workflow',{exact:true}).fill('Check drawer behavior');
    await page.getByLabel('Request that should not select this workflow',{exact:true}).fill('Explain database indexes');
    await page.getByRole('button',{name:'Preview examples',exact:true}).click();
    await page.locator('#rows pre').filter({hasText:'Matches expectation'}).waitFor();
    if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Preference editor overflows');
    const preferencesAxe=await new AxeBuilder({page}).analyze();
    if(preferencesAxe.violations.length)throw Error(JSON.stringify(preferencesAxe.violations));
    await page.screenshot({path:join(directory,'preferences-'+name+'.png'),fullPage:true});
    await page.getByRole('button',{name:'Save new version',exact:true}).click();
    await page.locator('article > p').filter({hasText:'Explicit local preference'}).waitFor();
    await page.getByRole('button',{name:'Disable',exact:true}).click();
    await page.getByRole('button',{name:'Enable',exact:true}).waitFor();
    await page.getByText('Version history and undo',{exact:true}).click();
    await page.getByRole('button',{name:'Restore version 1',exact:true}).click();
    await page.locator('article > p').filter({hasText:'version 1 · Enabled'}).waitFor();
    checks.push({ preferences: true,
      name,
      width,
      overflow,
      axeViolations: axe.violations.length,
      keyboard: true,
      methodSearch: true,
    });
  }
  await page.getByText('Create a preference',{exact:true}).click();
  const create=page.locator('#rows > details');
  await create.getByLabel('Workflow ID',{exact:true}).fill('fix');
  await create.getByLabel('Instruction',{exact:true}).fill('Reproduce a bug before fixing it.');
  await create.getByRole('button',{name:'Create preference',exact:true}).click();
  await page.locator('article').filter({hasText:'Reproduce a bug before fixing it.'}).waitFor();
  assistantRuntime(root,'select',{taskId:task.id,workflows:['ui-states'],mode:'apply',reason:'Test preference delivery'},{home});
  assistantRuntime(root,'load',{taskId:task.id,workflow:'ui-states'},{home});
  await page.getByRole('button',{name:'Preference activity',exact:true}).click();
  await page.locator('article').filter({hasText:'Behavior: not independently verified'}).waitFor();
  await page.getByText('Ignore preferences for this task only',{exact:true}).click();
  await page.locator('article input[type=checkbox]').check();
  const exclusionsLoaded = page.waitForResponse('**/api/preferences-activity');
  await page.getByRole('button',{name:'Save task exclusions',exact:true}).click();
  await exclusionsLoaded;
  if(assistantRuntime(root,'load',{taskId:task.id,workflow:'ui-states'},{home}).lessons.length)throw Error('Task exclusion did not affect delivery');
  await page.getByRole('button',{name:'Backup and transfer',exact:true}).click();
  await page.getByRole('button',{name:'Review export',exact:true}).click();
  await page.getByRole('button',{name:'Download reviewed backup',exact:true}).waitFor();
  const backup=JSON.parse(await page.locator('#rows > pre').first().textContent());
  await page.getByLabel('Or paste a project context bundle',{exact:true}).fill(JSON.stringify(backup));
  await page.getByRole('button',{name:'Preview import',exact:true}).click();
  await page.getByRole('button',{name:'Apply reviewed import',exact:true}).click();
  await page.getByText('Project context imported.',{exact:false}).waitFor();
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Transfer view overflows');
  const transferAxe=await new AxeBuilder({page}).analyze();if(transferAxe.violations.length)throw Error(JSON.stringify(transferAxe.violations));
  await page.screenshot({path:join(directory,'transfer-mobile.png'),fullPage:true});
  await page.reload();
  await page.waitForFunction(() => document.querySelector('#status').textContent === '2 records');
  await page.getByRole('button', { name: 'Tool catalog', exact: true }).click();
  await page.locator('#target').selectOption('pi');
  let releasePreview, previewArrived;
  const arrived = new Promise((resolve) => {
    previewArrived = resolve;
  });
  const held = new Promise((resolve) => {
    releasePreview = resolve;
  });
  await page.route('**/api/install-preview', async (route) => {
    const response = await route.fetch();
    previewArrived();
    await held;
    await route.fulfill({ response });
  });
  await page.locator('#preview').click();
  await arrived;
  await page.locator('#target').selectOption('gemini');
  const oldResponse = page.waitForResponse('**/api/install-preview');
  releasePreview();
  await (await oldResponse).finished();
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
  if ((await page.locator('#apply').isVisible()) || (await page.locator('#plan').textContent()))
    throw Error('A stale install response replaced the current editor selection.');
  await page.unroute('**/api/install-preview');
  await page.locator('#target').selectOption('pi');
  await page.getByRole('button', { name: 'Preview changes', exact: true }).click();
  await page.getByRole('button', { name: 'Apply reviewed changes', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Apply reviewed changes', exact: true }).click();
  await page.waitForFunction(() =>
    document.querySelector('#plan').textContent.startsWith('Owned project files updated'),
  );
  await page.locator('#search').fill('pytorch');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  if (
    (await page.locator('#rows article').evaluate((e) => getComputedStyle(e).animationName)) !==
    'none'
  )
    throw Error('Reduced motion failed');
  await page.getByRole('button', { name: 'Workspace', exact: true }).click();
  await page.locator('#search').fill('');
  await page.getByRole('button', { name: 'Acknowledge', exact: true }).click();
  await page.waitForFunction(
    () =>
      !Array.from(document.querySelectorAll('button')).some((b) => b.textContent === 'Acknowledge'),
  );
  await page.getByRole('button', { name: 'Retire finished request', exact: true }).click();
  await page
    .getByRole('button', { name: 'Retire finished request', exact: true })
    .waitFor({ state: 'hidden' });
  if (store.get('operator').dispatch.length) throw Error('Dispatch retirement failed');
  if (errors.length) throw Error(errors.join('\n'));
  writeFileSync(
    join(directory, 'results.json'),
    JSON.stringify(
      {
        browser: await browser.version(),
        checks,
        installation: true,
        acknowledgement: true,
        dispatchRetirement: true,
        privateReload: true,
        staleInstallPreviewRejected: true,
        reducedMotion: true,
        errors,
      },
      null,
      2,
    ) + '\n',
  );
  console.log(
    'Operator browser: desktop/mobile search, keyboard, reduced motion, zero accessibility violations, reviewed fixture installation and local coordination passed.',
  );
} finally {
  await browser?.close();
  await app.close();
  rmSync(temp, { recursive: true, force: true });
}
