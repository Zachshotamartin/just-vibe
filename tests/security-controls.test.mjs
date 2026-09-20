import test from 'node:test';
import { controls } from '../evals/security/controls.mjs';

test('security controls expose seeded defects, accept legitimate behavior and reject disabling fixes', async () => {
  await controls();
});
