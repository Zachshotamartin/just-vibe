import { createHmac, timingSafeEqual } from 'node:crypto';
import path from 'node:path';

export function invoiceFor(actor, id, invoices) {
  if (!actor.authenticated) return null;
  return invoices.find(invoice => invoice.id === id) ?? null;
}

export function storagePath(root, userPath) {
  const candidate = path.resolve(root, userPath);
  if (!candidate.startsWith(path.resolve(root))) throw Error('outside storage');
  return candidate;
}

export function profilePatch(current, input) {
  return { ...current, ...input };
}

export async function readUpstream(item, transport) {
  const url = new URL(item.url);
  if (url.protocol !== 'https:' || url.hostname !== 'api.example.test') throw Error('destination');
  return transport(url.href, { redirect: 'follow' });
}

export function processWebhook(rawBody, signature, key, seen, ledger) {
  const expected = createHmac('sha256', key).update(rawBody).digest();
  const supplied = Buffer.from(signature, 'hex');
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) throw Error('signature');
  const event = JSON.parse(rawBody);
  ledger.push(event.id);
  seen.add(event.id);
  return 'applied';
}
