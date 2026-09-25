export const CAPABILITY_GUIDANCE = {
  'project.read': 'Use the host file/search tools to inspect the relevant implementation and project instructions.',
  'git.repo': 'Use local Git to inspect the selected repository, index and working tree; preserve existing changes.',
  'github.context': 'Discover connected GitHub tools first; otherwise check gh access for the exact repository. Read the requested PR, reviews or checks. A gh executable alone is not authentication.',
  'vercel.context': 'Discover Vercel tools or its CLI; verify the selected account, team, project and deployment before reading logs or performing authorized deployment actions.',
  'browser.inspect': 'Discover the available browser or computer-use tools and applicable browser skill. Open the relevant app and inspect/interact with the changed states at relevant viewport sizes. A build is not browser evidence.',
  'database.context': 'Inspect schema and migrations; discover the configured database tools. Verify the environment and use local/fixture data unless live access is authorized.',
  'data.read': 'Inspect supplied data/schema using available file or analysis tools; record sampling and missing data limitations.',
  'ml.artifacts': 'Inspect available training configuration, logs, metrics, dataset splits and checkpoints. Discover experiment integrations when relevant; do not launch expensive training from a diagnostic request.',
  'telemetry.read': 'Discover available logs, traces or metrics tools; select the correct environment and time window.',
  'web.research': 'Use available official documentation/search tools when current external facts are needed.',
  'container.context': 'Inspect the relevant container configuration and runtime availability before bounded checks.',
  'user.questions': 'Use the host native question dialog when an answer materially changes the task; continue independent work while awaiting it.',
};

// General-pack workflows whose result is visual need rendered evidence when they change the UI.
const VISUAL = ['design', 'polish', 'match'];

export function workflowCapabilities(command, mode, brief = '') {
  const capabilities = new Set(command.capabilities);
  if ((['ui', 'react', 'vite'].includes(command.pack) || VISUAL.includes(command.id)) && mode === 'apply') capabilities.add('browser.inspect');
  if (command.id.startsWith('github-')) capabilities.add('github.context');
  if (command.id.startsWith('vercel-')) capabilities.add('vercel.context');
  if (command.id.startsWith('ml-') && /train|evaluat|parity|reproduce|debug/.test(command.id)) capabilities.add('ml.artifacts');
  const text = brief.replace(/[\u2018\u2019\u02bc]/g, "'");
  if (/\b(?:no browser|without (?:using |opening )?(?:a |the )?browser|(?:do not|don't|dont|never|avoid|skip)\s+(?:using |use |opening |open )?(?:a |the )?browser)\b/i.test(text)) capabilities.delete('browser.inspect');
  return [...capabilities];
}

export function workflowRequirements(command, mode, brief) {
  if (mode !== 'apply') return [{ id: 'result', description: 'Support the requested explanation, plan or findings with relevant inspected evidence.' }];
  const requirements = [{ id: 'verification', description: 'Verify the requested behavior with relevant checks; record actual results and remaining limitations.' }];
  const caps = workflowCapabilities(command, mode, brief);
  if (caps.includes('browser.inspect')) requirements.push({ id: 'browser', description: 'Inspect the changed UI in a browser, covering relevant sizes and interaction states.' });
  if (caps.includes('github.context')) requirements.push({ id: 'github', description: 'Read the exact requested GitHub issue, PR comments or checks before addressing them.' });
  if (caps.includes('ml.artifacts')) requirements.push({ id: 'ml', description: 'Inspect the relevant ML artifacts and validate the diagnostic conclusion or change.' });
  return requirements;
}
