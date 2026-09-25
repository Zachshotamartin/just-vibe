import test from 'node:test';
import assert from 'node:assert/strict';
import { countClaims } from '../scripts/lib/doc-counts.mjs';
import { compareVersions, publishedVersions } from '../scripts/lib/releases.mjs';

const actual = { mcpTools: 48, skillNames: 221, workflows: 218, profiles: 113 };

test('current-count claims must match the catalog; release-scoped sentences are history (R1-18, R2-05)', () => {
  assert.deepEqual(countClaims('The MCP catalog has 45 tools. It lists 221 skill names.', actual).map(c => c.stated), [45]);
  assert.deepEqual(countClaims('The payload contains 216 skill names and 213 canonical workflows.', actual).map(c => c.key), ['skillNames', 'workflows']);
  assert.deepEqual(countClaims('Version 0.10.0 contains 45 MCP tools. At v0.8 there were 213 canonical workflows.', actual), []);
  assert.deepEqual(countClaims('113 engineering profiles and 48 MCP tools ship today.', actual), []);
});

test('versions order numerically and publication records define what is published (R2-02)', () => {
  assert.ok(compareVersions('0.10.0', '0.9.0') > 0);
  assert.ok(compareVersions('0.12.0-rc.1', '0.12.0') < 0);
  assert.equal(compareVersions('0.12.0', '0.12.0'), 0);
  const published = publishedVersions(new URL('..', import.meta.url).pathname);
  assert.ok(published.includes('0.12.0'));
  assert.deepEqual(published, [...published].sort(compareVersions));
});
