import { readFileSync, existsSync } from 'node:fs';
import { within } from './storage.mjs';
import { object, requireId } from './runtime-store.mjs';
import { httpUrl } from './capability-io.mjs';
import { managedFragment } from './managed-fragment.mjs';
const data = JSON.parse(readFileSync(new URL('../../catalog/connectors.json', import.meta.url)));
export function connectors(root, operation, payload = {}) {
  object(payload, ['id', 'target', 'url', 'dryRun']);
  if (operation === 'list') return data;
  const recipe = data.recipes.find((r) => r.id === payload.id);
  if (!recipe) throw Error('Unknown connector recipe.');
  if (operation === 'show') return recipe;
  const target = payload.target;
  if (!['claude', 'cursor', 'opencode', 'codex'].includes(target))
    throw Error('Choose a documented connector target.');
  let endpoint = payload.url || recipe.endpoint;
  if (['doctor', 'uninstall'].includes(operation) && target !== 'codex') {
    const recordPath = within(
      root,
      `.just-vibe/installations/connector-${target}-${recipe.id}-fragment.json`,
    );
    if (existsSync(recordPath)) {
      const fragment = JSON.parse(readFileSync(recordPath, 'utf8')).fragment;
      endpoint =
        fragment?.[target === 'opencode' ? 'mcp' : 'mcpServers']?.[`just-vibe-${recipe.id}`]?.url ||
        endpoint;
    }
  }
  if (!endpoint)
    throw Error(
      'This recipe has no verified built-in endpoint. Read its documentation and provide the exact credential-free HTTP endpoint, or use the host’s installed connector.',
    );
  const url = httpUrl(endpoint);
  if (url.protocol !== 'https:' || url.search)
    throw Error('Use a credential-free HTTPS endpoint without query parameters.');
  const name = `just-vibe-${recipe.id}`;
  const entry =
    target === 'opencode'
      ? { type: 'remote', url: url.href, enabled: true }
      : { type: 'http', url: url.href };
  const path =
    target === 'claude'
      ? '.mcp.json'
      : target === 'cursor'
        ? '.cursor/mcp.json'
        : target === 'opencode'
          ? 'opencode.json'
          : '.codex/config.toml';
  const preview = {
    recipe: recipe.id,
    target,
    path,
    endpoint: url.href,
    authentication: recipe.authentication,
    availability: recipe.availability,
    ...(target === 'codex'
      ? { toml: `[mcp_servers.${name}]\nurl = ${JSON.stringify(url.href)}\n` }
      : { configuration: { [target === 'opencode' ? 'mcp' : 'mcpServers']: { [name]: entry } } }),
    note: 'Configuration declares a connection only. Complete host authentication and discover actual tools separately. Endpoint choice does not grant action authority.',
  };
  if (operation === 'preview') return preview;
  if (target === 'codex')
    throw Error(
      'Codex TOML is preview-only; merge the reviewed server table with the host config tools to preserve all existing settings.',
    );
  if (!['install', 'update', 'uninstall', 'doctor'].includes(operation))
    throw Error('Unknown connector operation.');
  return {
    ...preview,
    result: managedFragment(
      root,
      `connector-${target}-${recipe.id}`,
      path,
      'mcp',
      preview.configuration,
      operation,
      { dryRun: payload.dryRun === true },
    ),
  };
}
