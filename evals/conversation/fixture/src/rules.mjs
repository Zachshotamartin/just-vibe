export function moveRule(rules, id, destination) {
  if (!['AGENTS.md', 'CLAUDE.md'].includes(destination)) throw Error('Invalid destination');
  const index = rules.findIndex(rule => rule.id === id && rule.active);
  if (index < 0) throw Error('Unknown rule');
  return rules.map((rule, i) => i === index ? { ...rule, destination } : { ...rule });
}
