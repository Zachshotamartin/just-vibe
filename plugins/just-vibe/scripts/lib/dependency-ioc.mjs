import { runtimeStore, object, cleanText, timestamp } from './runtime-store.mjs';
import { boundedText, walkFiles, boundedList, httpUrl } from './capability-io.mjs';
import { digest } from './storage.mjs';

export function dependencyInventory(
  root,
  paths = ['package-lock.json', 'npm-shrinkwrap.json', 'requirements.txt', 'Cargo.lock'],
) {
  const packages = [],
    issues = [];
  for (const path of paths) {
    let source;
    try {
      source = boundedText(root, path, 2 * 1024 * 1024);
    } catch {
      issues.push({ path, reason: 'missing-or-unreadable' });
      continue;
    }
    try {
      if (/(?:package-lock|npm-shrinkwrap)\.json$/.test(path)) {
        const lock = JSON.parse(source);
        if (!lock.packages) throw Error('Unsupported lockfile version');
        for (const [location, p] of Object.entries(lock.packages)) {
          if (!location || !p.version) continue;
          const name = p.name || location.split('node_modules/').at(-1);
          packages.push({
            ecosystem: 'npm',
            name,
            version: p.version,
            path,
            location,
            integrity: p.integrity || null,
            source:
              typeof p.resolved === 'string' && /^https?:/.test(p.resolved)
                ? new URL(p.resolved).origin
                : null,
          });
        }
      } else if (/requirements.*\.txt$/.test(path)) {
        for (const line of source.split(/\r?\n/)) {
          if (!line.trim() || line.trim().startsWith('#')) continue;
          const m = line.match(/^([\w.-]+)==([\w.+-]+)(?:\s*(?:#|;).*)?$/);
          if (m)
            packages.push({
              ecosystem: 'PyPI',
              name: m[1].toLowerCase().replaceAll('_', '-'),
              version: m[2],
              path,
            });
          else issues.push({ path, reason: 'unpinned-or-unsupported-requirement' });
        }
      } else if (/Cargo\.lock$/.test(path)) {
        for (const block of source.split('[[package]]').slice(1)) {
          const name = block.match(/^name = "([^"]+)"/m)?.[1],
            version = block.match(/^version = "([^"]+)"/m)?.[1];
          if (name && version)
            packages.push({
              ecosystem: 'crates.io',
              name,
              version,
              path,
              integrity: block.match(/^checksum = "([^"]+)"/m)?.[1] || null,
            });
        }
      } else issues.push({ path, reason: 'unsupported-lockfile' });
    } catch {
      issues.push({ path, reason: 'malformed-or-unsupported-lockfile' });
    }
  }
  if (packages.length > 10000) throw Error('Dependency inventory exceeds 10,000 entries.');
  return { packages, issues, partial: issues.length > 0 };
}
function feed(value) {
  object(value, ['id', 'source', 'retrievedAt', 'expiresAt', 'advisories']);
  const source = httpUrl(value.source);
  if (source.protocol !== 'https:' || source.search)
    throw Error('Use a credential-free HTTPS advisory source.');
  const retrieved = Date.parse(value.retrievedAt),
    expires = Date.parse(value.expiresAt);
  if (
    !Number.isFinite(retrieved) ||
    !Number.isFinite(expires) ||
    retrieved > Date.now() + 60000 ||
    expires <= retrieved ||
    expires - retrieved > 90 * 86400000
  )
    throw Error('Advisory feed dates must describe a bounded snapshot of at most 90 days.');
  const advisories = boundedList(value.advisories, 'advisories', 500).map((a) => {
    object(a, ['id', 'ecosystem', 'package', 'versions', 'sha256', 'reference', 'reason']);
    if (!['npm', 'PyPI', 'crates.io'].includes(a.ecosystem))
      throw Error('Unsupported advisory ecosystem.');
    const reference = httpUrl(a.reference);
    if (reference.protocol !== 'https:' || reference.search)
      throw Error('Use a credential-free HTTPS advisory reference.');
    return {
      id: cleanText(a.id, 'advisory ID', 120),
      ecosystem: a.ecosystem,
      package: cleanText(a.package, 'package', 200),
      versions: boundedList(a.versions, 'exact versions', 100).map((v) =>
        cleanText(v, 'exact version', 100),
      ),
      sha256: a.sha256
        ? boundedList(a.sha256, 'hashes', 50).map((h) => {
            if (!/^[a-f0-9]{64}$/.test(h)) throw Error('Invalid SHA256.');
            return h;
          })
        : [],
      reference: reference.href,
      reason: cleanText(a.reason, 'reason', 1000),
    };
  });
  return {
    id: cleanText(value.id, 'feed ID', 100),
    source: source.href,
    retrievedAt: new Date(retrieved).toISOString(),
    expiresAt: new Date(expires).toISOString(),
    advisories,
  };
}
export function dependencyIoc(root, operation, payload = {}, options = {}) {
  const store = runtimeStore(root, options),
    state = store.get('dependency-ioc') || { revision: 0 };
  if (operation === 'status')
    return { ...state, stale: state.feed ? Date.parse(state.feed.expiresAt) < Date.now() : true };
  if (operation === 'import') {
    object(payload, ['revision', 'feed']);
    const data = feed(payload.feed);
    return store.put(
      'dependency-ioc',
      {
        feed: data,
        hash: digest(JSON.stringify(data)),
        importedAt: timestamp(),
        provenance:
          'User-supplied advisory snapshot; source authenticity requires independent verification.',
      },
      payload.revision,
    );
  }
  if (operation !== 'scan') throw Error('Unknown dependency IOC operation.');
  object(payload, ['paths', 'sourcePaths']);
  const dependencies = dependencyInventory(root, payload.paths),
    findings = [],
    stale = !state.feed || Date.parse(state.feed.expiresAt) < Date.now();
  for (const p of dependencies.packages)
    for (const a of state.feed?.advisories || [])
      if (p.ecosystem === a.ecosystem && p.name === a.package && a.versions.includes(p.version))
        findings.push({
          rule: 'exact-version-indicator',
          package: p.name,
          version: p.version,
          path: p.path,
          advisory: a.id,
          reference: a.reference,
          stale,
        });
  let sourcePartial = false;
  if (payload.sourcePaths) {
    const scan = walkFiles(root, {
      paths: boundedList(payload.sourcePaths, 'sourcePaths', 30),
      maxFiles: 1000,
    });
    sourcePartial = scan.partial;
    for (const f of scan.files) {
      if (f.bytes > 512 * 1024) {
        sourcePartial = true;
        continue;
      }
      let text;
      try {
        text = boundedText(root, f.path);
      } catch {
        sourcePartial = true;
        continue;
      }
      const hash = digest(text);
      for (const a of state.feed?.advisories || [])
        if (a.sha256.includes(hash))
          findings.push({
            rule: 'exact-file-indicator',
            path: f.path,
            advisory: a.id,
            reference: a.reference,
            stale,
          });
    }
  }
  return {
    ...dependencies,
    findings,
    sourcePartial,
    feedHash: state.hash || null,
    stale,
    conclusion: !state.feed
      ? 'inconclusive-no-feed'
      : stale
        ? 'inconclusive-stale-feed'
        : findings.length
          ? 'indicators-found'
          : 'no-matching-indicators',
    note: 'Exact snapshot matches only. No code executed or dependencies installed. A hash or package-version match is an indicator, not an independently established exploit or a clean bill of health.',
  };
}
