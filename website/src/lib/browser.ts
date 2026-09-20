export async function copyText(text: string) {
  if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
  throw new Error('Clipboard unavailable; select the visible text to copy it.');
}
