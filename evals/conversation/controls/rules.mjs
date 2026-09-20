export function moveRule(rules, id, destination) {
  if (!['AGENTS.md', 'CLAUDE.md'].includes(destination)) throw Error('Invalid destination');
  if (!rules.some(rule => rule.id === id)) throw Error('Unknown rule');
  return rules.map(rule => ({ ...rule, ...(rule.id === id ? { destination } : {}) }));
}
