import { createHash } from 'node:crypto';
export function releaseManifest(pkg, catalog, profiles, packs) {
  const counts = { commands: catalog.commands.length, workflows: catalog.commands.filter(c => !c.aliasOf).length, profiles: profiles.profiles.length, packs: packs.packs.length };
  return validateReleaseManifest({ schemaVersion: 1, name: 'just-vibe', version: pkg.version, counts,
    catalogSha256: createHash('sha256').update(JSON.stringify(catalog)).digest('hex'),
    license: pkg.license, node: pkg.engines.node,
    links: { website: 'https://just-vibe-tools.vercel.app/', repository: 'https://github.com/Zachshotamartin/just-vibe', npm: `https://www.npmjs.com/package/just-vibe/v/${pkg.version}` },
    install: { codex: `npx just-vibe@${pkg.version} setup --target codex`, claude: `npx just-vibe@${pkg.version} setup --target claude` },
    note: 'Generated package metadata. Registry publication and runtime compatibility require their separate release evidence.' });
}
export function validateReleaseManifest(value, minimumVersion) {
  if (!value || value.schemaVersion !== 1 || value.name !== 'just-vibe' || !/^\d+\.\d+\.\d+$/.test(value.version || '') || value.license !== 'MIT' || value.node !== '>=22') throw Error('Unsupported release manifest.');
  for (const key of ['commands', 'workflows', 'profiles', 'packs']) if (!Number.isSafeInteger(value.counts?.[key]) || value.counts[key] < 1 || value.counts[key] > 10000) throw Error('Invalid release counts.');
  if (value.counts.workflows > value.counts.commands || !/^[a-f0-9]{64}$/.test(value.catalogSha256 || '')) throw Error('Invalid catalog identity.');
  if (value.links?.website !== 'https://just-vibe-tools.vercel.app/' || value.links?.repository !== 'https://github.com/Zachshotamartin/just-vibe' || value.links?.npm !== `https://www.npmjs.com/package/just-vibe/v/${value.version}`) throw Error('Unexpected release links.');
  for (const host of ['codex', 'claude']) if (value.install?.[host] !== `npx just-vibe@${value.version} setup --target ${host}`) throw Error('Unexpected installation command.');
  if (minimumVersion) {
    if (!/^\d+\.\d+\.\d+$/.test(minimumVersion)) throw Error('Invalid minimum version.');
    const a=value.version.split('.').map(Number), b=minimumVersion.split('.').map(Number);
    for (let i=0;i<3;i++) { if(a[i]>b[i])break; if(a[i]<b[i])throw Error('Release manifest is older than the checked-in fallback.'); }
  }
  return value;
}
