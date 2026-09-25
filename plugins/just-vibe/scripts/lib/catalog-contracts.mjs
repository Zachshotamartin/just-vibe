// Contract agreement rules. A workflow's mode policy, write scope, examples and default input
// text must describe the same authority: a workflow that cannot apply must not promise writes,
// and one that can apply needs a write scope for that mode. Text rules target the phrasings
// that previously contradicted their own write scope.
import { fail } from './catalog-schema.mjs';

export const INSPECT_ONLY_SCOPE = 'No source changes in inspect/plan. Save only requested planning artifacts. A separately requested repair uses the relevant implementation workflow.';

// A workflow can apply when it applies by default or its mode policy grants apply ("apply for
// requested fixes", "uses apply mode"). "A separately scoped apply run" names another run.
const APPLY_CLAUSE = /\bapply\s+(?:for|to|when|on|by\s+default|within)\b|\buses?\s+apply\s+mode\b/i;
export const canApply = command => command.defaultMode === 'apply' || APPLY_CLAUSE.test(command.modePolicy || '');

const SELF_WRITE = /\bapply\s+(?:for|to|on|when|requested|changes|the\s+selected|and\s+validate|a\s+focused)\b|\bexecute\s+within\s+authorization\b|\bpropose\s+or\s+(?:apply|run)\b|\b(?:execute|run)\s+(?:bounded\s+)?authorized\b|\b(?:optional\s+)?authorized\s+(?:patch|implementation|restore|restoration|grouping)\b|\bimplement\s+only\s+(?:when|within)\b|\bminimal\s+corrective\s+change\b|\bchanges?\s+if\s+authorized\b/i;
// "Execution authorization" is not a mode or effect class; cite bounded local execution or a mode.
const UNDEFINED_TERM = /\bexecution\s+authori[sz]ation\b|\bauthorized\s+(?:browser\s+)?execution\b/i;
const MODE_CLAUSE = /^(?:inspect|plan|apply)\b|\b(?:inspect|plan|apply)\s+mode\b|\bapply\s+(?:for|only|when)\b/i;
const UNCONDITIONAL_EDIT = /\b(?:make|implement|edit|write|modify|patch)\s+(?:(?:a|an|the|local|focused|requested)\s+)*(?:changes?|code|fix(?:es)?|patch(?:es)?|implementation)\b|\bimplementation\s+can\s+proceed\b/i;

const described = c => [['modePolicy', c.modePolicy], ['readScope', c.readScope], ['selection', c.selection],
  ...['procedure', 'outputs', 'verification', 'stopConditions'].flatMap(key => c[key].map((text, i) => [`${key}[${i}]`, text])),
  ['technical.check', c.technical.check], ...(c.branches || []).map((b, i) => [`branches[${i}].then`, b.then])];

export function validateContracts(c) {
  const label = `Command ${c.id}`;
  for (const [field, text] of [...described(c), ['writeScope', c.writeScope]]) {
    if (UNDEFINED_TERM.test(text)) fail(label, field, 'uses undefined "execution authorization"; cite bounded local execution or name the mode.');
  }
  c.requiredInputs.forEach((text, i) => { if (MODE_CLAUSE.test(text)) fail(label, `requiredInputs[${i}]`, 'must list inputs, not a mode clause.'); });
  if (canApply(c)) {
    if (c.writeScope === INSPECT_ONLY_SCOPE) fail(label, 'writeScope', 'forbids all source changes, but the mode policy grants apply; state the apply write boundary.');
    return;
  }
  for (const [field, text] of described(c)) {
    if (SELF_WRITE.test(text)) fail(label, field, 'promises a write, but the workflow has no apply mode; add an apply clause or name the implementing workflow.');
  }
  c.examples.forEach((e, i) => { if (e.mode === 'apply') fail(label, `examples[${i}].mode`, 'is apply, but the workflow has no apply mode.'); });
  for (const key of ['infer', 'assume', 'ask']) {
    const text = c.inputPolicy?.[key];
    if (text && UNCONDITIONAL_EDIT.test(text) && !/\bapply\s+mode\b/i.test(text)) fail(label, `inputPolicy.${key}`, 'tells a workflow without apply mode to make changes; make it conditional on apply mode.');
  }
}
