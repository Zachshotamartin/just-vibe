export function roundTrip(value, secrets) {
  let serialized = JSON.stringify(value);
  for (const secret of secrets) if (secret) serialized = serialized.replaceAll(secret, '[REDACTED]');
  return JSON.parse(serialized);
}
