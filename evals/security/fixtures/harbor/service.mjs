import { createHmac, timingSafeEqual } from 'node:crypto';
import path from 'node:path';

export function invoiceFor(actor, id, invoices) {
  if (!actor.authenticated) return null;
  return invoices.find(invoice => invoice.id === id && invoice.tenant === actor.tenant) ?? null;
}

// This fixture uses an immutable, link-free storage tree. Filesystem races are out of scope.
export function storagePath(root, userPath) {
  const candidate = path.resolve(root, userPath);
  const rel = path.relative(path.resolve(root), candidate);
  if (path.isAbsolute(rel) || rel === '..' || rel.startsWith(`..${path.sep}`)) throw Error('outside storage');
  return candidate;
}

export function profilePatch(current, input) {
  if (typeof input.displayName !== 'string' || input.displayName.length > 100) throw Error('name');
  return { ...current, displayName: input.displayName };
}

export async function readUpstream(item, transport) {
  if (typeof item.id !== 'string' || !/^[a-z0-9-]{1,30}$/.test(item.id)) throw Error('item');
  return transport(`https://api.example.test/items/${item.id}`, { redirect: 'error' });
}

// Synchronous in-memory fixture: production requires durable, atomic effect deduplication.
export function processWebhook(rawBody, signature, key, seen, ledger) {
  const expected = createHmac('sha256', key).update(rawBody).digest();
  const supplied = Buffer.from(signature, 'hex');
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) throw Error('signature');
  const event = JSON.parse(rawBody);
  if (seen.has(event.id)) return 'duplicate';
  ledger.push(event.id);
  seen.add(event.id);
  return 'applied';
}
