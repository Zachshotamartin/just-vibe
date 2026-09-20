export function roundTrip(value, secrets) {
  if (typeof value === 'string') return secrets.filter(Boolean).reduce((text, secret) => text.split(secret).join('[REDACTED]'), value);
  if (Array.isArray(value)) return value.map(item => roundTrip(item, secrets));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, roundTrip(item, secrets)]));
  return value;
}
