export function redactEvidence(value) {
  const serialized = JSON.stringify(value);
  return JSON.parse(serialized.replace(/\b(token|password|secret)=([^\s,]+)/gi, '$1=[REDACTED]'));
}
