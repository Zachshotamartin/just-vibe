import { patternLearning } from './pattern-learning.mjs';
import { inspectCanvas, submitCanvasFeedback } from './plan-canvas.mjs';
import { runtimeStore } from './runtime-store.mjs';

const EXCERPT = 3000;
export const ELICITED = 'user-elicitation';

// Form-mode elicitation. An empty elicitation capability predates modes and means form.
export function supportsElicitation(capabilities) {
  const elicitation = capabilities?.elicitation;
  if (!elicitation || typeof elicitation !== 'object') return false;
  return Object.hasOwn(elicitation, 'form') || !Object.hasOwn(elicitation, 'url');
}

const clip = (text, limit) => (text.length > limit ? `${text.slice(0, limit)}\n[... ${text.length - limit} more characters not shown]` : text);

async function ask(client, message, properties, required) {
  const answer = await client.peer.request('elicitation/create', {
    ...(client.protocolVersion === '2025-11-25' ? { mode: 'form' } : {}),
    message,
    requestedSchema: { type: 'object', properties, required },
  });
  if (answer?.action !== 'accept') return { action: answer?.action || 'cancel' };
  const content = answer.content && typeof answer.content === 'object' && !Array.isArray(answer.content) ? answer.content : {};
  return { action: 'accept', content };
}
function optionalText(value) {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, 1000) : null;
}

// The user's dialog answer decides the review; the agent's own reason is shown
// as context only. Declining or cancelling records nothing.
export async function elicitLearningReview(root, args, options, client) {
  const state = await patternLearning(root, 'status', {}, options);
  const candidate = state.candidates.find(c => c.id === args.id && c.status === 'pending');
  if (!candidate) throw Error('Choose a pending candidate.');
  const change = args.change || candidate.change;
  const answer = await ask(client, [
    `Approve this just-vibe lesson for the ${change.workflow} workflow?`,
    candidate.source?.excerpt ? `From your message: "${clip(candidate.source.excerpt, 600)}"` : null,
    `Instruction: ${clip(change.instruction || JSON.stringify(change), 1200)}`,
    `Agent's reason: ${clip(args.reason, 600)}`,
  ].filter(Boolean).join('\n\n'), {
    decision: { type: 'string', title: 'Decision', enum: ['approve', 'reject'], enumNames: ['Approve the lesson', 'Reject it'] },
    reason: { type: 'string', title: 'Your reason (optional)', maxLength: 1000 },
  }, ['decision']);
  if (answer.action !== 'accept') return { recorded: false, action: answer.action, note: 'The user did not answer the review dialog; nothing was approved or rejected.' };
  const decision = answer.content.decision;
  if (!['approve', 'reject'].includes(decision)) throw Error('The review dialog returned no decision.');
  const reason = optionalText(answer.content.reason) || (decision === 'approve' ? 'Approved by the user in the host review dialog.' : 'Rejected by the user in the host review dialog.');
  const { operation, ...payload } = args;
  const result = await patternLearning(root, decision, { ...payload, reason }, { ...options, reviewSource: ELICITED });
  return { recorded: true, decision, source: ELICITED, revision: result.revision };
}

export async function elicitCanvasReview(root, args, options, client) {
  const store = runtimeStore(root, options), record = inspectCanvas(store, args.id);
  if (record.closed) throw Error('Canvas is closed.');
  if (record.stale) throw Error('Artifact changed; refresh the canvas before asking for review.');
  const answer = await ask(client, [
    `Review "${record.title}" (${record.artifact.path}, version ${record.artifact.hash.slice(0, 12)}).`,
    clip(record.artifact.content, EXCERPT),
  ].join('\n\n'), {
    verdict: { type: 'string', title: 'Verdict', enum: ['approve', 'changes', 'comment'], enumNames: ['Approve this version', 'Request changes', 'Comment only'] },
    feedback: { type: 'string', title: 'Feedback or reason', maxLength: 4000 },
  }, ['verdict']);
  if (answer.action !== 'accept') return { recorded: false, action: answer.action, note: 'The user did not answer the review dialog; no verdict was recorded.' };
  const kind = answer.content.verdict;
  if (!['approve', 'changes', 'comment'].includes(kind)) throw Error('The review dialog returned no verdict.');
  const text = optionalText(answer.content.feedback) || (kind === 'approve' ? 'Approved in the host review dialog.' : null);
  if (!text) throw Error('Requesting changes or commenting needs feedback text; ask again.');
  // The hash read before the dialog binds the verdict to the version the user saw.
  const saved = submitCanvasFeedback(store, args.id, { revision: record.revision, artifactHash: record.artifact.hash, kind, text }, ELICITED);
  return { recorded: true, kind, source: ELICITED, revision: saved.revision, verdict: saved.verdict };
}
