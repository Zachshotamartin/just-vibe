#!/usr/bin/env node
import { startOperatorServer } from './lib/operator-http.mjs';
import { isDirectRun } from './lib/entrypoint.mjs';
export async function operatorMain(args = process.argv.slice(2)) {
  if (
    ![2, 3].includes(args.length) ||
    args[0] !== '--root' ||
    (args[2] && args[2] !== '--allow-install')
  )
    throw Error('Usage: node operator-server.mjs --root /absolute/project [--allow-install]');
  const app = await startOperatorServer(args[1], { allowInstall: args[2] === '--allow-install' });
  console.log(
    JSON.stringify({
      url: app.url,
      note: 'Private loopback URL. Stop this process to close the board. Use SSH local forwarding for remote access; never expose the token in shared logs.',
    }),
  );
  let closing = false;
  const stop = async () => {
    if (closing) return;
    closing = true;
    await app.close();
  };
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
  return app;
}
if (isDirectRun(import.meta.url)) await operatorMain();
