export function redactEvidence(value) {
  if (Array.isArray(value)) return value.map(redactEvidence);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, /^(token|password|secret)$/i.test(key) ? '[REDACTED]' : redactEvidence(item)]));
  return value;
}
