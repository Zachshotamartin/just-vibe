import { object, cleanText, textList } from './runtime-store.mjs';
import { redact } from './process.mjs';
export const preferenceFields = ['triggers', 'avoid', 'tools', 'checks', 'conditions', 'exceptions'];
export function preferenceChange(input) {
  object(input, ['instruction', 'setting', ...preferenceFields]);
  const change = { instruction: cleanText(input.instruction, 'instruction', 2000), ...Object.fromEntries(preferenceFields.map(key => [key, textList(input[key] || [], key, 12)])) };
  if (input.setting !== undefined) {
    object(input.setting, ['key', 'value']);
    const key = cleanText(input.setting.key, 'Setting key', 80), value = cleanText(input.setting.value, 'Setting value', 200);
    if (!/^[a-z][a-z0-9-]*$/.test(key)) throw Error('Setting keys use lowercase letters, numbers and hyphens');
    change.setting = { key, value };
  }
  if (redact(JSON.stringify(change)) !== JSON.stringify(change)) throw Error('Do not save secrets in preferences.');
  return change;
}
