#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { startOperatorServer } from './lib/operator-http.mjs';
import { preferences } from './lib/preferences.mjs';
import { projectRoot } from './lib/storage.mjs';

export async function dashboardMain(args, { log = console.log, open = openBrowser } = {}) {
  let root = process.cwd(), noOpen = false, demo = false, allowInstall = false, explicitRoot = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--root' && args[i + 1] && !args[i + 1].startsWith('--')) { root = args[++i]; explicitRoot = true; }
    else if (args[i] === '--no-open') noOpen = true;
    else if (args[i] === '--demo') demo = true;
    else if (args[i] === '--allow-install') allowInstall = true;
    else throw Error('Usage: just-vibe dashboard [--root PATH] [--no-open] [--demo] [--allow-install]');
  }
  if (demo && (explicitRoot || allowInstall)) throw Error('Demo uses an isolated sample project; omit --root and --allow-install.');
  let directory, app;
  const options = { allowInstall, demo };
  try {
    if (demo) {
      directory = mkdtempSync(join(tmpdir(), 'just-vibe-demo-'));
      root = join(directory, 'sample-project'); mkdirSync(root);
      options.home = join(directory, 'sample-preferences');
      writeFileSync(join(root, 'README.md'), '# Dashboard sample\nThis disposable project is not your real workspace.\n');
      preferences(root, 'create', { workflow: 'ui-states', scope: 'project', draft: { instruction: 'Check drawer focus and mobile overflow in a browser.', triggers: ['drawer behavior'] } }, options);
    }
    root = projectRoot(root);
    app = await startOperatorServer(root, options);
    const close = app.close;
    let closed;
    app.close = () => closed ||= close().finally(() => { if (directory) rmSync(directory, { recursive: true, force: true }); process.removeListener('SIGINT', stop); process.removeListener('SIGTERM', stop); });
    function stop() { app.close().catch(error => log(error.message)); }
    process.once('SIGINT', stop); process.once('SIGTERM', stop);
    log(JSON.stringify({ url: app.url, project: root, demo, note: 'Private local URL. Keep this process running; stop it to close the dashboard. Real preferences persist on disk. Demo data is discarded when stopped.' }));
    if (!noOpen) try { await open(app.url); } catch { log('Could not open a browser. Open the private URL above on this computer.'); }
    return app;
  } catch (error) { if (app) await app.close(); else if (directory) rmSync(directory, { recursive: true, force: true }); throw error; }
}
function openBrowser(url) {
  const command = process.platform === 'darwin' ? ['open', [url]] : process.platform === 'win32' ? ['rundll32.exe', ['url.dll,FileProtocolHandler', url]] : ['xdg-open', [url]];
  return new Promise((done, fail) => { const child = spawn(command[0], command[1], { stdio: 'ignore', shell: false }); child.once('error', fail); child.once('exit', code => code === 0 ? done() : fail(Error('Browser launch failed'))); });
}
