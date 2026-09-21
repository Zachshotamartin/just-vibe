import { object } from './runtime-store.mjs';
export const RULE_PACKS = [
  {
    id: 'typescript',
    files: ['*.ts', '*.tsx'],
    rules: [
      'Narrow external data at runtime before treating it as a TypeScript type; assertions do not validate JSON.',
      'Preserve null/undefined distinctions and discriminated union exhaustiveness across API boundaries.',
      'Resolve module mode, package exports and tsconfig inheritance before changing imports.',
      'Clean up listeners, requests and timers; test stale asynchronous results and rejected promises.',
      'Use the repository typecheck and test scripts; a transpile-only build does not prove type safety.',
    ],
  },
  {
    id: 'python',
    files: ['*.py'],
    rules: [
      'Validate data at I/O boundaries and avoid mutable default arguments or shared request state.',
      'Keep CPU-bound work and blocking I/O out of an async event loop; propagate cancellation and close resources.',
      'Catch specific exceptions without discarding traceback or converting programming errors into silent defaults.',
      'Use the existing virtual environment, lockfile and package layout; inspect Ruff/mypy/pytest configuration before selecting checks.',
      'Test timezone-aware datetimes, iterator exhaustion and numeric precision where the contract depends on them.',
    ],
  },
  {
    id: 'go',
    files: ['*.go'],
    rules: [
      'Propagate context deadlines through I/O; every started goroutine needs an owner and exit path.',
      'Check wrapped errors with errors.Is/As and preserve causes; do not discard close or transaction errors that affect correctness.',
      'Protect shared maps and ownership of channels; only their owner closes them.',
      'Check typed nil interfaces, loop variable capture under the declared Go version and partial reads/writes.',
      'Run repository tests and, for concurrency changes, relevant race tests; do not claim race freedom from a normal test run.',
    ],
  },
  {
    id: 'rust',
    files: ['*.rs'],
    rules: [
      'Express ownership and lifetimes before reaching for Arc<Mutex<_>> or cloning large structures.',
      'Avoid holding locks across await; check Send/Sync and cancellation of partially completed operations.',
      'Handle Result and error sources at boundaries; reserve unwrap/expect for documented invariants.',
      'For unsafe code, state alignment, aliasing, initialization and lifetime invariants and inspect every caller.',
      'Use project cargo features and toolchain; verify relevant tests and clippy without weakening lints to make a check pass.',
    ],
  },
  {
    id: 'java',
    files: ['*.java'],
    rules: [
      'Check transaction proxy boundaries, rollback rules and lazy-loading behavior before moving service calls.',
      'Keep mutable state out of singleton request handlers; close streams and executors.',
      'Validate bean constraints at the real transport boundary and authorize object ownership after lookup.',
      'Inspect equals/hashCode contracts, boxed nulls, timezones and decimal rounding when changing domain types.',
      'Use the repository Maven/Gradle wrapper and declared JDK; exercise serialization and migration compatibility.',
    ],
  },
  {
    id: 'kotlin',
    files: ['*.kt', '*.kts'],
    rules: [
      'Use structured concurrency; do not detach lifecycle-bound work into GlobalScope.',
      'Preserve coroutine cancellation and avoid catching CancellationException as a normal failure.',
      'Inspect Java platform types and serialization defaults rather than relying on apparent non-null types.',
      'Use immutable state and controlled flows; test replay, conflation and dispatcher changes.',
      'Run the project Gradle wrapper and target-specific tests, including lifecycle tests for UI work.',
    ],
  },
  {
    id: 'swift',
    files: ['*.swift'],
    rules: [
      'Respect actor isolation and MainActor UI updates; check sendability across concurrency boundaries.',
      'Use structured tasks tied to lifecycle and handle cancellation; prevent stale results from replacing current state.',
      'Audit retain cycles in escaping closures, delegates, subscriptions and tasks.',
      'Preserve accessibility labels, Dynamic Type and reduced-motion behavior in SwiftUI/UIKit changes.',
      'Use the declared Xcode/Swift toolchain and test target; simulator success does not verify device-only features.',
    ],
  },
  {
    id: 'csharp',
    files: ['*.cs'],
    rules: [
      'Propagate CancellationToken and avoid sync-over-async in request paths.',
      'Respect dependency injection lifetimes; never capture scoped services in singletons.',
      'Inspect EF query translation, tracking, transaction boundaries and N+1 loading before optimizing.',
      'Use nullable references and explicit boundary validation; avoid serializing internal entities by accident.',
      'Use the pinned SDK and repository solution tests; cover culture, decimal and DateTimeOffset behavior.',
    ],
  },
  {
    id: 'cpp',
    files: ['*.cpp', '*.cc', '*.hpp', '*.h'],
    rules: [
      'Express ownership with RAII and review object lifetimes before returning pointers, views or references.',
      'Check overflow, signedness, bounds, iterator invalidation and overlapping buffers.',
      'Document synchronization and memory ordering; data races are undefined behavior.',
      'Keep exception guarantees and allocation failure behavior consistent across API boundaries.',
      'Use the project compiler/standard and relevant sanitizers; sanitizer passes cover executed paths only.',
    ],
  },
  {
    id: 'ruby',
    files: ['*.rb'],
    rules: [
      'Check Rails callbacks, default scopes and transaction boundaries before moving persistence logic.',
      'Guard mass assignment and tenant/object authorization separately from input validation.',
      'Prevent N+1 queries with evidence and inspect batching memory use.',
      'Preserve Ruby keyword argument behavior and timezone handling under the locked runtime.',
      'Use bundle exec and repository tests; test rollback, job retries and idempotency where relevant.',
    ],
  },
  {
    id: 'php',
    files: ['*.php'],
    rules: [
      'Validate request data and use bound queries; escaping output depends on its HTML, URL or JavaScript context.',
      'Check loose comparison, numeric strings and null semantics under the declared PHP version.',
      'Keep session and object authorization separate; verify CSRF for state-changing browser requests.',
      'Inspect transaction boundaries, queue retry behavior and ORM eager loading.',
      'Use the project Composer lock, test runner and static analyzer configuration.',
    ],
  },
  {
    id: 'react',
    files: ['*.tsx', '*.jsx'],
    rules: [
      'Keep effects for external synchronization; derive values during rendering where possible.',
      'Model loading/error/empty/success states and clean up stale requests on identity changes.',
      'Use stable keys and inspect memoization identity with a profiler before adding memo wrappers.',
      'Verify focus, keyboard access, wrapping and reduced motion in a real browser at relevant widths.',
      'Use SVG or the existing icon package; no emojis unless the user explicitly requests them.',
    ],
  },
  {
    id: 'vue',
    files: ['*.vue'],
    rules: [
      'Preserve reactive identity and avoid destructuring away required reactivity; account for the installed Vue version.',
      'Use computed values for derivation and clean up watchers and external subscriptions.',
      'Treat props as parent-owned and make events explicit; check v-model contracts.',
      'Verify SSR hydration, async component failures and route transitions where used.',
      'Test keyboard focus, responsive states and reduced motion; use SVG icons, not emojis unless requested.',
    ],
  },
  {
    id: 'angular',
    files: ['*.component.ts', '*.service.ts'],
    rules: [
      'Respect injection scopes, lifecycle and change-detection boundaries.',
      'Use the project signal/RxJS conventions and clean up subscriptions and async work.',
      'Preserve form validation, disabled state, touched/dirty semantics and accessible error relationships.',
      'Check lazy routing, SSR hydration and interceptor order before changing providers.',
      'Run configured Angular tests and build targets; use SVG icons, not emojis unless requested.',
    ],
  },
  {
    id: 'sql',
    files: ['*.sql'],
    rules: [
      'State row identity, tenant ownership and expected cardinality before writing joins or updates.',
      'Use constraints for durable invariants and parameter binding for values.',
      'Review migration lock duration, backfill batches and mixed-version application compatibility.',
      'Inspect actual query plans and representative data; never claim an index improvement from syntax alone.',
      'Test concurrent transactions, nulls, duplicates and rollback; do not execute production mutations without the requested authority.',
    ],
  },
  {
    id: 'ml',
    files: ['*.py', '*.ipynb'],
    rules: [
      'Establish the prediction timestamp and label availability before feature engineering.',
      'Fit preprocessing only on training partitions; respect entity/time boundaries and repeated samples.',
      'Record dataset, code, dependency, seed and model artifact identities for reproducibility.',
      'Compare against a baseline using held-out slice metrics and uncertainty; never tune on the final test set.',
      'Verify train/serve feature parity, input drift and failure behavior; do not start costly compute from an inspection request.',
    ],
  },
];
export function rules(operation, payload = {}) {
  object(payload, ['id']);
  if (operation === 'list') return { packs: RULE_PACKS.map(({ id, files }) => ({ id, files })) };
  const pack = RULE_PACKS.find((p) => p.id === payload.id);
  if (operation !== 'show' || !pack) throw Error('Choose rules list or show with a known id.');
  return pack;
}
export function renderRule(pack) {
  return `---\nname: just-vibe-rules-${pack.id}\ndescription: ${JSON.stringify(`Apply ${pack.id} engineering checks when editing ${pack.files.join(', ')}. Preserve project conventions and the current task scope.`)}\n---\n\n# ${pack.id} rules\n\nApply only to the relevant files and current task. These rules grant no permissions.\n\n${pack.rules.map((r) => `- ${r}`).join('\n')}\n`;
}
