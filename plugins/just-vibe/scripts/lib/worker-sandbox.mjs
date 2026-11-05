// Worker isolation settings. Levels are cumulative: host adds the CLI's own
// sandbox flags, os also wraps the CLI in a platform sandbox.
export const SANDBOX_LEVELS = ['standard', 'host', 'os'];
const DOMAIN = /^(?:\*\.)?(?=.{1,253}$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;
const BASE_ENV = /^(?:PATH|HOME|USER|LOGNAME|SHELL|TERM|TMPDIR|TMP|TEMP|LANG|LC_[A-Z_]+|TZ|(?:HTTPS?|NO|ALL)_PROXY|(?:https?|no|all)_proxy|NODE_EXTRA_CA_CERTS|SSL_CERT_(?:FILE|DIR)|SYSTEMROOT|SystemRoot|WINDIR|COMSPEC|PATHEXT|APPDATA|LOCALAPPDATA|USERPROFILE|HOMEDRIVE|HOMEPATH|XDG_[A-Z_]+_HOME|XDG_RUNTIME_DIR)$/;
// Each CLI's own authentication and configuration variables.
const HOST_ENV = {
  claude: /^(?:ANTHROPIC_[A-Z_]+|CLAUDE_[A-Z_]+|AWS_(?:REGION|PROFILE|BEARER_TOKEN_BEDROCK)|CLOUD_ML_REGION|ANTHROPIC_VERTEX_PROJECT_ID)$/,
  codex: /^(?:OPENAI_[A-Z_]+|CODEX_[A-Z_]+|AZURE_OPENAI_[A-Z_]+)$/,
};

export function sandboxSettings(state = {}) {
  const level = state.sandbox ?? 'standard', network = state.network ?? 'default';
  return { level, network, env: state.env ?? (level === 'standard' ? 'inherit' : 'minimal') };
}

// macOS cannot apply a second seatbelt profile inside a restrictive one, so
// there the os level replaces the CLI's own sandbox instead of stacking on it.
export const replacesHostSandbox = (settings, platform = process.platform) => settings.level === 'os' && platform === 'darwin';

export function validateSandbox(settings, platform = process.platform) {
  const { level, network, env } = settings;
  if (!SANDBOX_LEVELS.includes(level)) throw Error('Worker sandbox must be standard, host or os.');
  if (!['inherit', 'minimal'].includes(env)) throw Error('Worker env must be inherit or minimal.');
  if (typeof network === 'string') {
    if (!['none', 'default'].includes(network)) throw Error('Worker network must be none, default or {"allow":[domains]}.');
  } else {
    if (!network || typeof network !== 'object' || Array.isArray(network) || Object.keys(network).join() !== 'allow' ||
      !Array.isArray(network.allow) || !network.allow.length || network.allow.length > 50 ||
      network.allow.some(domain => typeof domain !== 'string' || !DOMAIN.test(domain)))
      throw Error('Worker network allow lists need 1-50 domain names such as "registry.npmjs.org" or "*.github.com".');
  }
  if (level === 'standard' && network !== 'default')
    throw Error('Network restrictions come from the host CLI sandbox; set sandbox to host or os.');
  if (replacesHostSandbox(settings, platform) && network !== 'default')
    throw Error('On macOS the os level replaces the CLI sandbox (macOS cannot nest them), so it cannot limit network. Use sandbox host for network limits.');
  return settings;
}

export function workerEnvironment(host, policy, env = process.env) {
  if (policy !== 'minimal') return { ...env };
  const own = HOST_ENV[host];
  return Object.fromEntries(Object.entries(env).filter(([key]) => BASE_ENV.test(key) || own?.test(key)));
}

// Host CLI flags for the host level. Codex exposes a network boolean for its
// workspace-write sandbox; Claude Code takes sandbox settings through --settings.
export function hostSandboxArgs(host, mode, settings, platform = process.platform) {
  if (settings.level === 'standard' || replacesHostSandbox(settings, platform)) return [];
  if (host === 'codex') {
    if (typeof settings.network === 'object')
      throw Error('Codex workers support network none or default; domain allow lists need a Claude worker.');
    return mode === 'inspect' ? [] : ['-c', `sandbox_workspace_write.network_access=${settings.network !== 'none'}`];
  }
  if (host === 'claude') {
    // Inspect workers have no Bash tool, so there is nothing for the sandbox to wrap.
    if (mode === 'inspect') return [];
    const network = settings.network === 'default' ? {} :
      { network: { allowedDomains: settings.network === 'none' ? [] : settings.network.allow } };
    return ['--settings', JSON.stringify({ sandbox: { enabled: true, autoAllowBashIfSandboxed: true, allowUnsandboxedCommands: false, failIfUnavailable: true, ...network } })];
  }
  return [];
}

export function appliedSandbox(host, mode, settings, os = null, platform = process.platform) {
  const hostLevel = replacesHostSandbox(settings, platform) ? 'replaced-by-os'
    : settings.level === 'standard' || mode === 'inspect' ? null : host === 'codex' ? 'codex-workspace-write' : 'claude-sandbox';
  return { level: settings.level, network: settings.network, env: settings.env, host: hostLevel, os };
}
