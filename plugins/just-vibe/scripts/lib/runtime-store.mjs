import { adaptiveStore, requireId, textField } from './adaptive-store.mjs';
import { redact } from './process.mjs';

export { requireId };
export function object(value, keys) {
  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value) ||
    Object.keys(value).some((k) => !keys.includes(k))
  )
    throw Error(`Expected an object with only: ${keys.join(', ')}.`);
  return value;
}
export function revision(value) {
  if (!Number.isSafeInteger(value) || value < 0)
    throw Error('Supply the current revision (0 for a new record).');
  return value;
}
export function cleanText(value, label, max = 4000) {
  const text = textField(value, label, max).trim();
  const redacted = redact(text);
  let normalized = text;
  try {
    normalized = JSON.stringify(JSON.parse(text));
  } catch {}
  if (
    (redacted !== text && redacted !== normalized) ||
    /-----BEGIN [A-Z ]*PRIVATE KEY-----|\bsk-[A-Za-z0-9_-]{20,}/.test(text)
  )
    throw Error(`Secrets are not allowed in ${label}.`);
  return text;
}
export function textList(value = [], label = 'items', max = 20) {
  if (!Array.isArray(value) || value.length > max)
    throw Error(`${label} must be an array with at most ${max} items.`);
  return [...new Set(value.map((v) => cleanText(v, label, 200)))];
}
export function runtimeStore(root, options = {}) {
  const store = adaptiveStore(root, options);
  const prefix = `${store.project}/runtime`;
  const path = (name) => `${prefix}/${requireId(name)}.json`;
  return {
    ...store,
    prefix,
    get: (name) => store.read(path(name)),
    put: (name, value, expected) =>
      store.write(path(name), { ...value, root: store.root }, revision(expected)),
  };
}
export const timestamp = () => new Date().toISOString();
