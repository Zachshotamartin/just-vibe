// Closed-schema checks shared by the command, pack, profile and method catalogs.
// Every error names the record and the field, so a malformed bulk edit fails at
// validation time instead of crashing search or rendering "undefined" later.
export const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function fail(label, field, problem) {
  throw new Error(`${label}: ${field} ${problem}`);
}

export function record(value, label, required, optional = []) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label}: expected an object.`);
  const allowed = new Set([...required, ...optional]);
  for (const key of Object.keys(value)) if (!allowed.has(key)) fail(label, key, 'is not a known field.');
  for (const key of required) if (value[key] === undefined) fail(label, key, 'is required.');
  return value;
}

// Catalog text is rendered into Markdown, YAML frontmatter and tables: one trimmed line.
export function line(value, label, field, { table = false } = {}) {
  if (typeof value !== 'string' || !value.trim()) fail(label, field, 'must be a non-empty string.');
  if (/[\r\n]/.test(value) || value !== value.trim()) fail(label, field, 'must be a single trimmed line.');
  if (table && value.includes('|')) fail(label, field, 'must not contain "|" because it is rendered in a table.');
  return value;
}

export function lines(value, label, field, { min = 1, max = 1000, each = line } = {}) {
  if (!Array.isArray(value) || value.length < min || value.length > max) fail(label, field, `must be an array of ${min}-${max} entries.`);
  value.forEach((item, index) => each(item, label, `${field}[${index}]`));
  const keys = value.map(item => (typeof item === 'string' ? item.toLowerCase() : JSON.stringify(item)));
  if (new Set(keys).size !== keys.length) fail(label, field, 'must not repeat entries.');
  return value;
}

export function oneOf(value, label, field, allowed) {
  if (!allowed.includes(value)) fail(label, field, `must be one of: ${allowed.join(', ')}.`);
  return value;
}

export function identifier(value, label, field) {
  if (typeof value !== 'string' || !ID.test(value)) fail(label, field, 'must be a lowercase hyphenated identifier.');
  return value;
}
