// Parse only a leading invocation. References inside a prompt are source text.
// Keep the argument body intact; never split it into flags or shell arguments.
export function parseInvocation(value) {
  if (typeof value !== 'string') return null;
  const match = /^\s*\/(jv|just-vibe)(?::([a-z0-9]+(?:-[a-z0-9]+)*)|[ \t]+([a-z0-9]+(?:-[a-z0-9]+)*))(?=\s|$)(?:[ \t]|\r?\n)?/.exec(value);
  if (!match) return null;
  return { namespace: match[1], id: match[2] || match[3], brief: value.slice(match[0].length), invocation: match[0].trim() };
}

export function commandName(value) {
  const parsed = parseInvocation(value);
  if (parsed) {
    if (parsed.brief.trim()) throw Error('Pass workflow context separately from its command name.');
    return parsed.id;
  }
  return value.replace(/^\$/, '');
}
