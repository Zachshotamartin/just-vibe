import test from 'node:test';
import assert from 'node:assert/strict';
import { checkImplementation } from '../scripts/check-ecc-implementation.mjs';
import { checkLocalizations } from '../scripts/check-localizations.mjs';
import { readFileSync } from 'node:fs';
test('every frozen backlog group has current source evidence and explicit validation limits', () => {
  assert.equal(checkImplementation().groups, 49);
  assert.deepEqual(checkLocalizations().languages, ['es', 'ja']);
});
test('implementation accounting rejects completed acceptance with outstanding or unrun checks', () => {
  const implementation = JSON.parse(readFileSync(new URL('../docs/audits/ecc-implementation.json', import.meta.url)));
  assert.ok(checkImplementation().acceptance.partial > 0);
  implementation.items[0].acceptanceReview.status = 'verified';
  assert.throws(() => checkImplementation({ implementation }), /Acceptance/);
  implementation.items[0].acceptanceReview.remaining = [];
  implementation.items[0].acceptanceReview.checks[0].result = 'pending';
  assert.throws(() => checkImplementation({ implementation }), /acceptance evidence/);
});
