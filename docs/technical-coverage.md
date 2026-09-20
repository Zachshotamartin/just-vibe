# Technical guidance coverage

Generated from the canonical catalog. This is an inventory of authored guidance and its routes, not evidence that an agent followed it or that a vulnerability was detected. Each canonical workflow has evidence to inspect, a method, a misdiagnosis to avoid and a discriminating check. Aliases inherit the entire contract. See [audit findings and validation](technical-audit.md).

## General

| Workflow | Specific failure or ambiguity addressed | Conditional references |
|---|---|---|
| [orient](../plugins/just-vibe/skills/orient/SKILL.md) | A package script's name does not prove it works, and importing configuration can execute code during inspection. | Technical method and pack guide in entry point |
| [explain](../plugins/just-vibe/skills/explain/SKILL.md) | Plausible business intent cannot be inferred solely from a function name; configuration-dependent behavior remains conditional. | Technical method and pack guide in entry point |
| [teach](../plugins/just-vibe/skills/teach/SKILL.md) | Teaching a command does not authorize running it; overwhelming prerequisite lists can obscure the actual concept. | [Project exercises](../plugins/just-vibe/references/practice.md) |
| [teach-test](../plugins/just-vibe/skills/teach-test/SKILL.md) | Inline questions or an early answer key defeat native assessment; if the host forbids quiz dialogs, explain the limit and stop the quiz without disguising it as clarification. | Technical method and pack guide in entry point |
| [trace](../plugins/just-vibe/skills/trace/SKILL.md) | A static call graph does not prove which branch executed; queue handoffs can change identity and ordering. | Technical method and pack guide in entry point |
| [map](../plugins/just-vibe/skills/map/SKILL.md) | A large unlabeled graph hides ownership and can imply nonexistent deployed services. | Technical method and pack guide in entry point |
| [research](../plugins/just-vibe/skills/research/SKILL.md) | Current documentation may describe a different major than the project; search snippets alone can omit decisive conditions. | Technical method and pack guide in entry point |
| [compare](../plugins/just-vibe/skills/compare/SKILL.md) | Unequal feature completeness or different datasets can manufacture a winner; human preference remains attributed judgment. | [Working alternatives](../plugins/just-vibe/references/working-alternatives.md) |
| [brainstorm](../plugins/just-vibe/skills/brainstorm/SKILL.md) | Renaming the same architecture repeatedly is not useful diversity; brainstorming does not select or implement an option. | Technical method and pack guide in entry point |
| [spec](../plugins/just-vibe/skills/spec/SKILL.md) | Implementation detail can prematurely constrain a product requirement; vague adjectives cannot establish completion. | Technical method and pack guide in entry point |
| [plan](../plugins/just-vibe/skills/plan/SKILL.md) | A list of filenames or tool names is not an implementation plan; invented repo structure produces unusable tasks. | Technical method and pack guide in entry point |
| [scope](../plugins/just-vibe/skills/scope/SKILL.md) | Dropping error recovery or required authorization can make a smaller release unusable rather than merely simpler. | Technical method and pack guide in entry point |
| [challenge](../plugins/just-vibe/skills/challenge/SKILL.md) | Contrarian preferences or speculative catastrophes without a mechanism add noise. | Technical method and pack guide in entry point |
| [tasks](../plugins/just-vibe/skills/tasks/SKILL.md) | Marking a task complete because its code exists overlooks unrun verification or blocked integration. | Technical method and pack guide in entry point |
| [build](../plugins/just-vibe/skills/build/SKILL.md) | Building isolated components without connecting the actual entry point leaves the feature unusable. | [Language and runtime review methods](../plugins/just-vibe/references/scenarios/language-review.md) |
| [fix](../plugins/just-vibe/skills/fix/SKILL.md) | Editing the last visible exception or weakening the assertion can hide the root defect. | [Language and runtime review methods](../plugins/just-vibe/references/scenarios/language-review.md) |
| [debug](../plugins/just-vibe/skills/debug/SKILL.md) | Correlation with a recent edit or a noisy downstream stack trace does not establish causality. | [Language and runtime review methods](../plugins/just-vibe/references/scenarios/language-review.md) |
| [refactor](../plugins/just-vibe/skills/refactor/SKILL.md) | Renaming a pure helper differs from moving async ownership or transaction boundaries; both cannot use the same evidence bar. | [Language and runtime review methods](../plugins/just-vibe/references/scenarios/language-review.md) |
| [integrate](../plugins/just-vibe/skills/integrate/SKILL.md) | A mock success does not prove provider configuration, and retrying after timeout can duplicate a remote effect. | [Language and runtime review methods](../plugins/just-vibe/references/scenarios/language-review.md) |
| [migrate](../plugins/just-vibe/skills/migrate/SKILL.md) | Updating a version string does not migrate runtime semantics; code rollback may not read new persisted data. | [Language and runtime review methods](../plugins/just-vibe/references/scenarios/language-review.md) |
| [automate](../plugins/just-vibe/skills/automate/SKILL.md) | A script that retries uncertain mutations or interpolates user text into shell source can amplify failures. | Technical method and pack guide in entry point |
| [cleanup](../plugins/just-vibe/skills/cleanup/SKILL.md) | Static search can miss reflection, routing conventions, plugins or public consumers. | Technical method and pack guide in entry point |
| [design](../plugins/just-vibe/skills/design/SKILL.md) | Attractive static composition can conceal inaccessible controls, content overflow or missing recovery states. | Technical method and pack guide in entry point |
| [polish](../plugins/just-vibe/skills/polish/SKILL.md) | Arbitrary token changes can improve one screen while breaking sibling components or dense content. | Technical method and pack guide in entry point |
| [match](../plugins/just-vibe/skills/match/SKILL.md) | A different viewport or unloaded font can masquerade as implementation error; screenshot similarity does not prove behavior. | Technical method and pack guide in entry point |
| [copy](../plugins/just-vibe/skills/copy/SKILL.md) | Friendly copy that says a failed operation succeeded or hides irreversible consequences misleads users. | Technical method and pack guide in entry point |
| [review](../plugins/just-vibe/skills/review/SKILL.md) | Style preferences, file length or theoretical edge cases without a trigger are not automatically defects. | [Review selection and evidence](../plugins/just-vibe/references/security/review.md); [Language and runtime review methods](../plugins/just-vibe/references/scenarios/language-review.md) |
| [test](../plugins/just-vibe/skills/test/SKILL.md) | Mock call assertions or tests mirroring helper logic can pass while behavior is wrong. | Technical method and pack guide in entry point |
| [verify](../plugins/just-vibe/skills/verify/SKILL.md) | A green command on another revision or a screenshot of one state cannot establish all acceptance criteria. | [Requirement evidence](../plugins/just-vibe/references/proofs.md) |
| [security](../plugins/just-vibe/skills/security/SKILL.md) | A suspicious API or generic checklist entry is not proof of exploitability; unseen deployment defenses remain unknown. | [Review selection and evidence](../plugins/just-vibe/references/security/review.md); [Security methods](../plugins/just-vibe/references/packs/security.md); [Scanner selection and evidence](../plugins/just-vibe/references/security/scanners.md) |
| [perf](../plugins/just-vibe/skills/perf/SKILL.md) | Lower allocation or fewer renders may not improve observed latency; averages hide regressions in tails or errors. | Technical method and pack guide in entry point |
| [repro](../plugins/just-vibe/skills/repro/SKILL.md) | A smaller program with a different failure does not reproduce the original bug. | Technical method and pack guide in entry point |
| [coverage](../plugins/just-vibe/skills/coverage/SKILL.md) | Executed lines do not establish meaningful assertions; mocks can leave the real boundary untested. | Technical method and pack guide in entry point |
| [pr](../plugins/just-vibe/skills/pr/SKILL.md) | Local PR drafting does not authorize pushing or posting, and unrun checks cannot appear as passed. | Technical method and pack guide in entry point |
| [release](../plugins/just-vibe/skills/release/SKILL.md) | Source version changes do not publish a package; a rebuilt archive differs from the one previously tested. | Technical method and pack guide in entry point |
| [ci](../plugins/just-vibe/skills/ci/SKILL.md) | Disabling tests or broadening secrets access can make CI green while weakening correctness or security. | Technical method and pack guide in entry point |
| [docs](../plugins/just-vibe/skills/docs/SKILL.md) | Copying stale examples or generated output without rebuilding its source creates drift. | Technical method and pack guide in entry point |
| [deps](../plugins/just-vibe/skills/deps/SKILL.md) | Forced audit fixes or ignored peer conflicts can replace one issue with a runtime incompatibility. | [Dependency and execution provenance](../plugins/just-vibe/references/security/supply-chain.md); [Scanner selection and evidence](../plugins/just-vibe/references/security/scanners.md) |
| [deploy](../plugins/just-vibe/skills/deploy/SKILL.md) | Deploying from a dirty tree or checking a moving alias can disconnect observed success from the intended artifact. | Technical method and pack guide in entry point |
| [checkpoint](../plugins/just-vibe/skills/checkpoint/SKILL.md) | Saving notes does not capture every external effect or guarantee another host will load them. | [Project continuity](../plugins/just-vibe/references/daily-workflows.md); [Selective task undo](../plugins/just-vibe/references/task-undo.md) |
| [undo](../plugins/just-vibe/skills/undo/SKILL.md) | Whole-repository reset destroys unrelated work; matching a filename alone does not prove the task still owns its contents. | [Selective task undo](../plugins/just-vibe/references/task-undo.md) |
| [handoff](../plugins/just-vibe/skills/handoff/SKILL.md) | A conversational narrative without current state forces rediscovery; claiming unavailable checks passed misleads the next session. | [Project continuity](../plugins/just-vibe/references/daily-workflows.md) |
| [resume](../plugins/just-vibe/skills/resume/SKILL.md) | A checkpoint is stale evidence, not renewed authorization; replaying an uncertain submission can create duplicates. | [Project continuity](../plugins/just-vibe/references/daily-workflows.md) |
| [remember](../plugins/just-vibe/skills/remember/SKILL.md) | Saving a rule in the wrong directory or confusing a proposal with a user decision can silently change behavior. | [Instruction memory](../plugins/just-vibe/references/instruction-memory.md); [Project continuity](../plugins/just-vibe/references/daily-workflows.md); [Rules, provenance and guards](../plugins/just-vibe/references/memory-checks.md) |
| [learn](../plugins/just-vibe/skills/learn/SKILL.md) | Generalizing one incident into an unconditional global rule can harm unrelated work. | Technical method and pack guide in entry point |
| [skill](../plugins/just-vibe/skills/skill/SKILL.md) | Long generic checklists dilute useful detail, and a linked guide that is never loaded cannot improve behavior. | [Dependency and execution provenance](../plugins/just-vibe/references/security/supply-chain.md) |
| [doctor](../plugins/just-vibe/skills/doctor/SKILL.md) | Finding an executable or directory does not prove the plugin is enabled or the current session loaded its latest skills. | Technical method and pack guide in entry point |
| [help](../plugins/just-vibe/skills/help/SKILL.md) | Dumping every command creates search burden; a lexical match does not establish capability availability. | [Discovery and daily utilities](../plugins/just-vibe/references/daily-workflows.md) |
| [tools](../plugins/just-vibe/skills/tools/SKILL.md) | An installed CLI is not authenticated access; a skill description is not an executable scanner. | [Discovery and daily utilities](../plugins/just-vibe/references/daily-workflows.md) |
| [auto](../plugins/just-vibe/skills/auto/SKILL.md) | Lexical routing is a suggestion, not authorization or a reason to execute every matching command. | [Daily workflow paths](../plugins/just-vibe/references/daily-workflows.md); [Intent and evidence workflows](../plugins/just-vibe/references/intent-workflows.md) |
| [profiles](../plugins/just-vibe/skills/profiles/SKILL.md) | A job title is neither a credential nor evidence that all specialty checks were performed. | Technical method and pack guide in entry point |
| [profile](../plugins/just-vibe/skills/profile/SKILL.md) | Agent inference cannot clear a user pin, and a principal role does not authorize broader architecture changes. | [Project continuity](../plugins/just-vibe/references/daily-workflows.md) |

## Architecture

| Workflow | Specific failure or ambiguity addressed | Conditional references |
|---|---|---|
| [arch-map](../plugins/just-vibe/skills/arch-map/SKILL.md) | A package dependency does not prove a network call or independently deployed service; missing infrastructure leaves deployment unknown. | Technical method and pack guide in entry point |
| [arch-boundaries](../plugins/just-vibe/skills/arch-boundaries/SKILL.md) | Folder moves can conceal unchanged coupling; a shared type is not inherently a boundary violation. | Technical method and pack guide in entry point |
| [arch-feature](../plugins/just-vibe/skills/arch-feature/SKILL.md) | A new service adds network failure and consistency work even when its code is small. | Technical method and pack guide in entry point |
| [arch-contracts](../plugins/just-vibe/skills/arch-contracts/SKILL.md) | Adding an enum or tightening validation may break existing consumers despite being schema-additive. | Technical method and pack guide in entry point |
| [arch-event-flow](../plugins/just-vibe/skills/arch-event-flow/SKILL.md) | Delivery ordering on one partition does not order all entities, and broker acknowledgment does not prove a business effect committed. | Technical method and pack guide in entry point |
| [arch-tenancy](../plugins/just-vibe/skills/arch-tenancy/SKILL.md) | An isolated HTTP route can still enqueue a job or populate a shared cache without tenant scope. | [Identity and authorization](../plugins/just-vibe/references/security/identity.md) |
| [arch-scale](../plugins/just-vibe/skills/arch-scale/SKILL.md) | Adding replicas can exhaust a database connection budget or amplify retries before increasing throughput. | Technical method and pack guide in entry point |
| [arch-modernize](../plugins/just-vibe/skills/arch-modernize/SKILL.md) | Dual writes without recovery can diverge; code rollback cannot recover discarded data. | Technical method and pack guide in entry point |

## Decisions

| Workflow | Specific failure or ambiguity addressed | Conditional references |
|---|---|---|
| [decide](../plugins/just-vibe/skills/decide/SKILL.md) | More criteria do not compensate for an unresolved mandatory requirement. | [Decision history](../plugins/just-vibe/references/decision-history.md) |
| [decision-matrix](../plugins/just-vibe/skills/decision-matrix/SKILL.md) | Double-counting correlated criteria can manufacture a winner; unknown evidence is not a neutral numeric score. | Technical method and pack guide in entry point |
| [decision-adr](../plugins/just-vibe/skills/decision-adr/SKILL.md) | An agent recommendation is not an adopted organizational decision. | Technical method and pack guide in entry point |
| [decision-premortem](../plugins/just-vibe/skills/decision-premortem/SKILL.md) | Generic risks with no mechanism or observable warning cannot guide implementation. | Technical method and pack guide in entry point |
| [decision-reversible](../plugins/just-vibe/skills/decision-reversible/SKILL.md) | A reversible code change may already have sent messages or transformed data irreversibly. | Technical method and pack guide in entry point |
| [decision-buy-build](../plugins/just-vibe/skills/decision-buy-build/SKILL.md) | Vendor feature lists do not prove compatibility with the actual identity, offline or data-residency requirements. | Technical method and pack guide in entry point |
| [decision-spike](../plugins/just-vibe/skills/decision-spike/SKILL.md) | Building a polished prototype can consume the budget without testing the disputed assumption. | Technical method and pack guide in entry point |
| [decision-revisit](../plugins/just-vibe/skills/decision-revisit/SKILL.md) | A hindsight rewrite loses the information needed to understand why the earlier choice was reasonable. | Technical method and pack guide in entry point |

## Git

| Workflow | Specific failure or ambiguity addressed | Conditional references |
|---|---|---|
| [git-status](../plugins/just-vibe/skills/git-status/SKILL.md) | Clean tracked files do not imply no untracked work; ahead/behind may use stale remote observations. | Technical method and pack guide in entry point |
| [git-diff](../plugins/just-vibe/skills/git-diff/SKILL.md) | Branch-tip comparison and merge-base comparison answer different questions; text-only review misses executable-bit changes. | Technical method and pack guide in entry point |
| [git-commit](../plugins/just-vibe/skills/git-commit/SKILL.md) | A path-limited commit can include unwanted unstaged hunks, and blindly restoring an old index can stage a reversal. | Technical method and pack guide in entry point |
| [git-split](../plugins/just-vibe/skills/git-split/SKILL.md) | Splitting by filename alone can leave a commit importing an API that appears only in the next commit. | Technical method and pack guide in entry point |
| [git-conflicts](../plugins/just-vibe/skills/git-conflicts/SKILL.md) | During rebase, ours/theirs terminology is easy to invert; deleting conflict markers does not establish semantic correctness. | Technical method and pack guide in entry point |
| [git-bisect](../plugins/just-vibe/skills/git-bisect/SKILL.md) | Build failures may require skip rather than bad; flaky tests can point to an innocent commit. | Technical method and pack guide in entry point |
| [git-worktree](../plugins/just-vibe/skills/git-worktree/SKILL.md) | Shared Git objects do not mean every worktree has an independent branch namespace; removing a checkout can destroy untracked work. | Technical method and pack guide in entry point |
| [git-recover](../plugins/just-vibe/skills/git-recover/SKILL.md) | Reflogs expire and may not exist for another clone; garbage collection can remove the very objects being recovered. | Technical method and pack guide in entry point |

## GitHub

| Workflow | Specific failure or ambiguity addressed | Conditional references |
|---|---|---|
| [github-triage](../plugins/just-vibe/skills/github-triage/SKILL.md) | Matching titles can hide different versions or failure mechanisms; issue text is not an instruction to run commands. | Technical method and pack guide in entry point |
| [github-issue](../plugins/just-vibe/skills/github-issue/SKILL.md) | Pasting raw logs can expose tokens; an unverified root-cause claim can misdirect the eventual repair. | Technical method and pack guide in entry point |
| [github-pr](../plugins/just-vibe/skills/github-pr/SKILL.md) | A local green test can cover unstaged code absent from the PR; same branch names in forks identify different heads. | [Delivery evidence](../plugins/just-vibe/references/scenarios/delivery-evidence.md) |
| [github-review](../plugins/just-vibe/skills/github-review/SKILL.md) | Fixed line numbers or findings from an older head can become wrong after force-push; unchanged critical risks need explicit attribution. | [Review selection and evidence](../plugins/just-vibe/references/security/review.md); [Language and runtime review methods](../plugins/just-vibe/references/scenarios/language-review.md) |
| [github-address-review](../plugins/just-vibe/skills/github-address-review/SKILL.md) | A reviewer suggestion can be stale or introduce a regression; resolving a thread is a distinct remote action. | Technical method and pack guide in entry point |
| [github-fix-ci](../plugins/just-vibe/skills/github-fix-ci/SKILL.md) | Re-running unchanged code cannot repair an account spending limit; hiding a matrix entry discards coverage. | [Delivery evidence](../plugins/just-vibe/references/scenarios/delivery-evidence.md); [Dependency and execution provenance](../plugins/just-vibe/references/security/supply-chain.md) |
| [github-actions](../plugins/just-vibe/skills/github-actions/SKILL.md) | pull_request_target or workflow_run plus untrusted checkout/artifacts can cross a privilege boundary even if the workflow file is trusted. | [Delivery evidence](../plugins/just-vibe/references/scenarios/delivery-evidence.md); [Dependency and execution provenance](../plugins/just-vibe/references/security/supply-chain.md) |
| [github-release](../plugins/just-vibe/skills/github-release/SKILL.md) | Reusing an asset name for different bytes or moving a tag silently changes what users receive. | [Dependency and execution provenance](../plugins/just-vibe/references/security/supply-chain.md) |

## Vercel

| Workflow | Specific failure or ambiguity addressed | Conditional references |
|---|---|---|
| [vercel-audit](../plugins/just-vibe/skills/vercel-audit/SKILL.md) | Relinking to inspect settings mutates project state; local hoisting can conceal undeclared dependencies. | [Framework-specific review branches](../plugins/just-vibe/references/security/frameworks.md) |
| [vercel-build-fix](../plugins/just-vibe/skills/vercel-build-fix/SKILL.md) | A later wrapper exit hides the initial cause; supplying a production secret locally can conceal a missing preview scope. | [Delivery evidence](../plugins/just-vibe/references/scenarios/delivery-evidence.md) |
| [vercel-env](../plugins/just-vibe/skills/vercel-env/SKILL.md) | Public prefixes expose compiled values; changing a setting does not update already-built assets. | Technical method and pack guide in entry point |
| [vercel-preview](../plugins/just-vibe/skills/vercel-preview/SKILL.md) | Anonymous 401/403 from protection is not necessarily app failure; a branch alias may advance while checks run. | Technical method and pack guide in entry point |
| [vercel-runtime](../plugins/just-vibe/skills/vercel-runtime/SKILL.md) | A successful build proves no request health; an Edge/Node API mismatch needs a supported runtime choice, not suppressed errors. | [Delivery evidence](../plugins/just-vibe/references/scenarios/delivery-evidence.md) |
| [vercel-routing](../plugins/just-vibe/skills/vercel-routing/SKILL.md) | An SPA fallback returning HTML for JavaScript or API URLs can look like HTTP success while breaking clients. | Technical method and pack guide in entry point |
| [vercel-performance](../plugins/just-vibe/skills/vercel-performance/SKILL.md) | Comparing a cold miss before with a warm hit after does not demonstrate an improvement. | Technical method and pack guide in entry point |
| [vercel-release-check](../plugins/just-vibe/skills/vercel-release-check/SKILL.md) | Code rollback may fail once the schema or external effects have changed. | Technical method and pack guide in entry point |

## Vite

| Workflow | Specific failure or ambiguity addressed | Conditional references |
|---|---|---|
| [vite-setup](../plugins/just-vibe/skills/vite-setup/SKILL.md) | Copying a config for another major or adding a second package manager can create a setup that only works on one machine. | Technical method and pack guide in entry point |
| [vite-config](../plugins/just-vibe/skills/vite-config/SKILL.md) | A config file can execute arbitrary imports; read-only inspection should not evaluate it just to discover values. | Technical method and pack guide in entry point |
| [vite-hmr](../plugins/just-vibe/skills/vite-hmr/SKILL.md) | Full page reload and preserved hot state are different outcomes; disabling host checks is not a generic websocket repair. | Technical method and pack guide in entry point |
| [vite-env](../plugins/just-vibe/skills/vite-env/SKILL.md) | Prefixing a secret with VITE_ makes it public; booleans read from env may be strings with surprising truthiness. | [Framework-specific review branches](../plugins/just-vibe/references/security/frameworks.md) |
| [vite-bundle](../plugins/just-vibe/skills/vite-bundle/SKILL.md) | Removing a named import or counting source file sizes does not prove tree-shaking or network improvement. | Technical method and pack guide in entry point |
| [vite-chunks](../plugins/just-vibe/skills/vite-chunks/SKILL.md) | A smaller entry chunk can add serial requests or cause a stale HTML document to reference a deleted old chunk. | Technical method and pack guide in entry point |
| [vite-assets](../plugins/just-vibe/skills/vite-assets/SKILL.md) | A leading slash can escape a subpath deployment; a concatenated filename may never enter the build graph. | Technical method and pack guide in entry point |
| [vite-upgrade](../plugins/just-vibe/skills/vite-upgrade/SKILL.md) | A passing install with ignored peer conflicts does not establish refresh or production compatibility. | Technical method and pack guide in entry point |

## React

| Workflow | Specific failure or ambiguity addressed | Conditional references |
|---|---|---|
| [react-audit](../plugins/just-vibe/skills/react-audit/SKILL.md) | Missing memoization is not automatically a defect, and ordinary JSX text is escaped by React. | [Framework-specific review branches](../plugins/just-vibe/references/security/frameworks.md) |
| [react-rerenders](../plugins/just-vibe/skills/react-rerenders/SKILL.md) | Render counts include harmless work and development checks; memoization can retain stale behavior or cost more than recomputation. | Technical method and pack guide in entry point |
| [react-effects](../plugins/just-vibe/skills/react-effects/SKILL.md) | Suppressing dependency warnings conceals stale closures; aborting a request cannot undo a completed server mutation. | Technical method and pack guide in entry point |
| [react-state](../plugins/just-vibe/skills/react-state/SKILL.md) | Copying props into state on every update can erase user edits; a module variable can leak state between instances or server requests. | Technical method and pack guide in entry point |
| [react-component](../plugins/just-vibe/skills/react-component/SKILL.md) | ARIA labels alone do not implement keyboard behavior, focus management or controlled value semantics. | [dialog interaction](../plugins/just-vibe/references/scenarios/dialog.md); [combobox interaction](../plugins/just-vibe/references/scenarios/combobox.md); [date-picker interaction](../plugins/just-vibe/references/scenarios/date-picker.md) |
| [react-forms](../plugins/just-vibe/skills/react-forms/SKILL.md) | A disabled button alone does not prevent retries or duplicate server effects; number parsing can turn an empty field into zero. | Technical method and pack guide in entry point |
| [react-async](../plugins/just-vibe/skills/react-async/SKILL.md) | Canceling one waiter must not cancel shared work still owned by another; late rejection can delete a newer cache entry. | Technical method and pack guide in entry point |
| [react-hydration](../plugins/just-vibe/skills/react-hydration/SKILL.md) | Suppressing hydration warnings does not repair invalid markup or mismatched event/state attachment. | Technical method and pack guide in entry point |

## UI and frontend

| Workflow | Specific failure or ambiguity addressed | Conditional references |
|---|---|---|
| [ui-audit](../plugins/just-vibe/skills/ui-audit/SKILL.md) | A screenshot cannot establish keyboard behavior, contrast in every state or successful end-to-end completion. | Technical method and pack guide in entry point |
| [ui-system](../plugins/just-vibe/skills/ui-system/SKILL.md) | Renaming colors without updating focus, disabled, dark-mode or data-visualization states leaves an incomplete system. | Technical method and pack guide in entry point |
| [ui-states](../plugins/just-vibe/skills/ui-states/SKILL.md) | Replacing failed data with an empty-state message misrepresents the result and can encourage destructive user action. | Technical method and pack guide in entry point |
| [ui-responsive](../plugins/just-vibe/skills/ui-responsive/SKILL.md) | Hiding overflow can conceal controls; hover-only affordances fail on touch or keyboard. | Technical method and pack guide in entry point |
| [ui-accessibility](../plugins/just-vibe/skills/ui-accessibility/SKILL.md) | Passing an automated checker does not prove keyboard or screen-reader usability; positive tabindex creates fragile ordering. | Technical method and pack guide in entry point |
| [ui-motion](../plugins/just-vibe/skills/ui-motion/SKILL.md) | A smooth animation can still hide focus, block input or cause discomfort; reduced motion must preserve outcome and feedback. | Technical method and pack guide in entry point |
| [ui-visual-diff](../plugins/just-vibe/skills/ui-visual-diff/SKILL.md) | Approving a new screenshot merely because it differs converts a regression into the expected result. | Technical method and pack guide in entry point |
| [ui-flow](../plugins/just-vibe/skills/ui-flow/SKILL.md) | Optimizing one screen can break cross-screen state or erase work when users navigate backward. | Technical method and pack guide in entry point |

## Backend

| Workflow | Specific failure or ambiguity addressed | Conditional references |
|---|---|---|
| [backend-service](../plugins/just-vibe/skills/backend-service/SKILL.md) | Broad catch-and-success fallbacks can report an order created when its durable write failed. | [Framework-specific review branches](../plugins/just-vibe/references/security/frameworks.md); [Language and runtime review methods](../plugins/just-vibe/references/scenarios/language-review.md) |
| [backend-auth](../plugins/just-vibe/skills/backend-auth/SKILL.md) | Decoding a JWT is not signature/issuer/audience validation; accepting an access token as identity can cross protocol boundaries. | [Authentication scenarios](../plugins/just-vibe/references/scenarios/auth.md); [Identity and authorization](../plugins/just-vibe/references/security/identity.md); [Framework-specific review branches](../plugins/just-vibe/references/security/frameworks.md) |
| [backend-permissions](../plugins/just-vibe/skills/backend-permissions/SKILL.md) | A hidden button or unguessable identifier does not enforce permission; an admin in one tenant is not automatically a global admin. | [Identity and authorization](../plugins/just-vibe/references/security/identity.md) |
| [backend-jobs](../plugins/just-vibe/skills/backend-jobs/SKILL.md) | Acknowledging before durable progress loses work; assuming a timed-out worker stopped can duplicate an effect. | Technical method and pack guide in entry point |
| [backend-idempotency](../plugins/just-vibe/skills/backend-idempotency/SKILL.md) | An in-memory map fails across processes; deleting a pending key after a timeout can permit a second charge. | Technical method and pack guide in entry point |
| [backend-concurrency](../plugins/just-vibe/skills/backend-concurrency/SKILL.md) | A process mutex does not protect multiple servers, and a pre-transaction balance read can become stale. | [Language and runtime review methods](../plugins/just-vibe/references/scenarios/language-review.md) |
| [backend-cache](../plugins/just-vibe/skills/backend-cache/SKILL.md) | Old completion can resurrect invalidated data; treating zero or an empty list as a miss changes semantics. | Technical method and pack guide in entry point |
| [backend-resilience](../plugins/just-vibe/skills/backend-resilience/SKILL.md) | Retrying at every layer multiplies traffic; a timeout does not prove the remote operation failed. | Technical method and pack guide in entry point |

## APIs

| Workflow | Specific failure or ambiguity addressed | Conditional references |
|---|---|---|
| [api-design](../plugins/just-vibe/skills/api-design/SKILL.md) | Consistent JSON shape alone does not establish consistent business meaning or access control. | [Identity and authorization](../plugins/just-vibe/references/security/identity.md) |
| [api-openapi](../plugins/just-vibe/skills/api-openapi/SKILL.md) | OpenAPI 3.0 and 3.1 null/schema semantics differ; a valid schema can still document behavior the server never emits. | Technical method and pack guide in entry point |
| [api-breaking](../plugins/just-vibe/skills/api-breaking/SKILL.md) | An additive enum value or new required permission can break clients even without deleting a field. | Technical method and pack guide in entry point |
| [api-contract-test](../plugins/just-vibe/skills/api-contract-test/SKILL.md) | A provider-generated mock validating itself is circular evidence of compatibility. | Technical method and pack guide in entry point |
| [api-errors](../plugins/just-vibe/skills/api-errors/SKILL.md) | Returning 200 with an error-shaped body or retryable status for a permanent denial misleads clients. | Technical method and pack guide in entry point |
| [api-pagination](../plugins/just-vibe/skills/api-pagination/SKILL.md) | Offset shifts under writes and nonunique sort keys can skip or duplicate records; base64 is not tamper protection. | Technical method and pack guide in entry point |
| [api-webhooks](../plugins/just-vibe/skills/api-webhooks/SKILL.md) | Re-serialized JSON changes signed bytes; a valid signature does not prevent replay or duplicate processing. | [Identity and authorization](../plugins/just-vibe/references/security/identity.md) |
| [api-client](../plugins/just-vibe/skills/api-client/SKILL.md) | Static types disappear at runtime; automatically retrying every POST can repeat an external effect. | Technical method and pack guide in entry point |

## Databases

| Workflow | Specific failure or ambiguity addressed | Conditional references |
|---|---|---|
| [db-schema](../plugins/just-vibe/skills/db-schema/SKILL.md) | Application-only uniqueness races under concurrency; nullable columns can alter uniqueness semantics by engine/version. | Technical method and pack guide in entry point |
| [db-migrate](../plugins/just-vibe/skills/db-migrate/SKILL.md) | ORM migration generation does not establish safe production locking; a down migration cannot recreate discarded values. | [Delivery evidence](../plugins/just-vibe/references/scenarios/delivery-evidence.md) |
| [db-query](../plugins/just-vibe/skills/db-query/SKILL.md) | Two one-to-many joins can multiply totals; NOT IN with null values can produce unexpected exclusion. | Technical method and pack guide in entry point |
| [db-explain](../plugins/just-vibe/skills/db-explain/SKILL.md) | Abstract cost is not milliseconds; EXPLAIN ANALYZE executes the statement and may mutate data or consume production resources. | Technical method and pack guide in entry point |
| [db-index](../plugins/just-vibe/skills/db-index/SKILL.md) | More indexes increase write/storage cost; an index on a low-selectivity column may not improve the actual workload. | Technical method and pack guide in entry point |
| [db-integrity](../plugins/just-vibe/skills/db-integrity/SKILL.md) | Automatically deleting orphans can erase legitimate records awaiting asynchronous completion. | Technical method and pack guide in entry point |
| [db-locks](../plugins/just-vibe/skills/db-locks/SKILL.md) | The busiest blocked query may be a victim; terminating a session is an operational mutation with rollback consequences. | Technical method and pack guide in entry point |
| [db-access](../plugins/just-vibe/skills/db-access/SKILL.md) | Table owners or bypass roles can make policy tests pass incorrectly; pooled session tenant state can leak into the next request. | [Identity and authorization](../plugins/just-vibe/references/security/identity.md); [Framework-specific review branches](../plugins/just-vibe/references/security/frameworks.md) |

## Data engineering

| Workflow | Specific failure or ambiguity addressed | Conditional references |
|---|---|---|
| [data-profile](../plugins/just-vibe/skills/data-profile/SKILL.md) | Converting numeric-looking IDs or imputing during profiling silently changes evidence. | Technical method and pack guide in entry point |
| [data-contract](../plugins/just-vibe/skills/data-contract/SKILL.md) | Type-valid data can still be wrong in units, timezone or row grain. | Technical method and pack guide in entry point |
| [data-pipeline](../plugins/just-vibe/skills/data-pipeline/SKILL.md) | Advancing a checkpoint before committing output silently loses records after a crash. | Technical method and pack guide in entry point |
| [data-incremental](../plugins/just-vibe/skills/data-incremental/SKILL.md) | A maximum event timestamp alone skips equal-timestamp rows and late arrivals; updates and tombstones need semantics. | Technical method and pack guide in entry point |
| [data-backfill](../plugins/just-vibe/skills/data-backfill/SKILL.md) | A successful batch counter does not prove all rows were covered, and retrying non-idempotent transforms can corrupt values. | Technical method and pack guide in entry point |
| [data-reconcile](../plugins/just-vibe/skills/data-reconcile/SKILL.md) | Equal counts or totals can hide missing and duplicated rows that cancel out. | Technical method and pack guide in entry point |
| [data-lineage](../plugins/just-vibe/skills/data-lineage/SKILL.md) | An import graph or column-name match does not prove runtime provenance. | Technical method and pack guide in entry point |
| [data-quality](../plugins/just-vibe/skills/data-quality/SKILL.md) | A green dashboard can reflect a query that stopped receiving rows rather than healthy data. | Technical method and pack guide in entry point |

## ML data

| Workflow | Specific failure or ambiguity addressed | Conditional references |
|---|---|---|
| [ml-frame](../plugins/just-vibe/skills/ml-frame/SKILL.md) | Optimizing an available label can answer a different question from the real decision; missing follow-up is not a negative outcome. | Technical method and pack guide in entry point |
| [ml-dataset](../plugins/just-vibe/skills/ml-dataset/SKILL.md) | More rows do not remove survivor bias or dependence between observations. | Technical method and pack guide in entry point |
| [ml-labels](../plugins/just-vibe/skills/ml-labels/SKILL.md) | Majority vote can erase systematic ambiguity; labels recorded after prediction may be valid outcomes but unavailable for historical fitting. | Technical method and pack guide in entry point |
| [ml-split](../plugins/just-vibe/skills/ml-split/SKILL.md) | Random splits can leak repeated entities, while universal group holdout can test a different task than the intended deployment. | Technical method and pack guide in entry point |
| [ml-leakage](../plugins/just-vibe/skills/ml-leakage/SKILL.md) | Correlation or overlapping metadata alone does not prove leakage; filtering versions before selecting the visible revision can resurrect stale data. | Technical method and pack guide in entry point |
| [ml-features](../plugins/just-vibe/skills/ml-features/SKILL.md) | Target encoding or imputation fitted outside the training fold contaminates validation; feature importance is not causal effect. | Technical method and pack guide in entry point |
| [ml-imbalance](../plugins/just-vibe/skills/ml-imbalance/SKILL.md) | Accuracy can hide zero minority recall; resampling changes prevalence and can distort uncorrected probabilities. | Technical method and pack guide in entry point |
| [ml-dataset-version](../plugins/just-vibe/skills/ml-dataset-version/SKILL.md) | A filename, seed or hash of only a sample cannot identify the full dataset. | Technical method and pack guide in entry point |

## ML experimentation

| Workflow | Specific failure or ambiguity addressed | Conditional references |
|---|---|---|
| [ml-baseline](../plugins/just-vibe/skills/ml-baseline/SKILL.md) | A strong model with a different split is not a fair baseline; test-set selection makes later comparisons optimistic. | Technical method and pack guide in entry point |
| [ml-train](../plugins/just-vibe/skills/ml-train/SKILL.md) | Restoring weights alone is not exact resume; a seed alone does not guarantee deterministic kernels or data order. | [Training scenarios](../plugins/just-vibe/references/scenarios/training.md) |
| [ml-debug-training](../plugins/just-vibe/skills/ml-debug-training/SKILL.md) | Switching architecture can conceal a detached graph, wrong target scale or optimizer that never updates parameters. | [Language and runtime review methods](../plugins/just-vibe/references/scenarios/language-review.md) |
| [ml-tune](../plugins/just-vibe/skills/ml-tune/SKILL.md) | More trials can overfit the validation set; dropping failed runs understates cost and instability. | Technical method and pack guide in entry point |
| [ml-ablation](../plugins/just-vibe/skills/ml-ablation/SKILL.md) | A changed preprocessing pipeline or compute budget can confound a claimed component improvement. | Technical method and pack guide in entry point |
| [ml-experiments](../plugins/just-vibe/skills/ml-experiments/SKILL.md) | Same metric names may hide different denominators, positive classes or evaluation populations. | [Recorded experiment comparisons](../plugins/just-vibe/references/experiments.md) |
| [ml-reproduce](../plugins/just-vibe/skills/ml-reproduce/SKILL.md) | Matching a seed or top-line metric does not establish the same data, selection process or training trajectory. | Technical method and pack guide in entry point |
| [ml-training-cost](../plugins/just-vibe/skills/ml-training-cost/SKILL.md) | GPU utilization alone can hide pipeline stalls; mixed precision or larger batches can change convergence and effective optimization. | Technical method and pack guide in entry point |

## ML evaluation

| Workflow | Specific failure or ambiguity addressed | Conditional references |
|---|---|---|
| [ml-evaluate](../plugins/just-vibe/skills/ml-evaluate/SKILL.md) | Treating every correlated row as independent can make confidence intervals artificially narrow. | [Recorded experiment comparisons](../plugins/just-vibe/references/experiments.md) |
| [ml-error-analysis](../plugins/just-vibe/skills/ml-error-analysis/SKILL.md) | Anecdotal errors or explanation scores do not establish a causal pattern across the population. | Technical method and pack guide in entry point |
| [ml-slices](../plugins/just-vibe/skills/ml-slices/SKILL.md) | Tiny slices and many comparisons can produce dramatic noise; aggregate improvement can hide a harmed cohort. | [Recorded experiment comparisons](../plugins/just-vibe/references/experiments.md) |
| [ml-calibrate](../plugins/just-vibe/skills/ml-calibrate/SKILL.md) | Ranking quality does not imply probability accuracy; coarse bins or shifted prevalence can conceal miscalibration. | Technical method and pack guide in entry point |
| [ml-threshold](../plugins/just-vibe/skills/ml-threshold/SKILL.md) | A threshold maximizing F1 may violate a daily capacity or false-positive budget. | Technical method and pack guide in entry point |
| [ml-robustness](../plugins/just-vibe/skills/ml-robustness/SKILL.md) | Arbitrary corruption may not represent deployment, and invariance is wrong when the perturbation should change the answer. | Technical method and pack guide in entry point |
| [ml-explain](../plugins/just-vibe/skills/ml-explain/SKILL.md) | Attributions are not causal effects; correlated inputs or impossible counterfactuals can make an explanation misleading. | Technical method and pack guide in entry point |
| [ml-report](../plugins/just-vibe/skills/ml-report/SKILL.md) | Omitting failed runs or weak slices produces a misleading model story even if the best metric is correct. | Technical method and pack guide in entry point |

## ML deployment

| Workflow | Specific failure or ambiguity addressed | Conditional references |
|---|---|---|
| [ml-package](../plugins/just-vibe/skills/ml-package/SKILL.md) | Pickle-style loading can execute code; matching a model filename does not establish trusted provenance or preprocessing parity. | [Files and resource limits](../plugins/just-vibe/references/security/files.md) |
| [ml-serving](../plugins/just-vibe/skills/ml-serving/SKILL.md) | Unbounded batches or concurrent model copies can exhaust memory; returning a default prediction hides infrastructure failure. | Technical method and pack guide in entry point |
| [ml-batch](../plugins/just-vibe/skills/ml-batch/SKILL.md) | Restarting with a different model under the same output partition silently mixes incompatible predictions. | Technical method and pack guide in entry point |
| [ml-parity](../plugins/just-vibe/skills/ml-parity/SKILL.md) | Equal tensor shape does not imply equal feature meaning; silently reordered columns can produce plausible wrong scores. | Technical method and pack guide in entry point |
| [ml-inference-perf](../plugins/just-vibe/skills/ml-inference-perf/SKILL.md) | Timing asynchronous GPU dispatch without synchronization underreports work; throughput gains may violate tail-latency requirements. | Technical method and pack guide in entry point |
| [ml-drift](../plugins/just-vibe/skills/ml-drift/SKILL.md) | A small p-value on a huge sample can flag irrelevant change, while missing labels prevent conclusions about accuracy. | Technical method and pack guide in entry point |
| [ml-monitor](../plugins/just-vibe/skills/ml-monitor/SKILL.md) | Missing outcomes can bias observed accuracy; unchanged inputs do not prove unchanged target relationships. | Technical method and pack guide in entry point |
| [ml-rollout](../plugins/just-vibe/skills/ml-rollout/SKILL.md) | Shadow requests must not duplicate real effects; early unlabeled traffic only establishes operational behavior. | Technical method and pack guide in entry point |

## LLMs and retrieval

| Workflow | Specific failure or ambiguity addressed | Conditional references |
|---|---|---|
| [llm-evals](../plugins/just-vibe/skills/llm-evals/SKILL.md) | A fluent answer or a judge score alone does not prove task completion; reused development cases invite overfitting. | Technical method and pack guide in entry point |
| [llm-prompt](../plugins/just-vibe/skills/llm-prompt/SKILL.md) | Adding every past exception can create conflicting instructions and regress ordinary tasks. | Technical method and pack guide in entry point |
| [llm-structured](../plugins/just-vibe/skills/llm-structured/SKILL.md) | Valid JSON can contain fabricated IDs or inconsistent totals; filling required fields with invented defaults corrupts meaning. | Technical method and pack guide in entry point |
| [llm-rag](../plugins/just-vibe/skills/llm-rag/SKILL.md) | A relevant unauthorized chunk is still a data leak; quoted text may contain hostile instructions that must remain data. | Technical method and pack guide in entry point |
| [llm-retrieval](../plugins/just-vibe/skills/llm-retrieval/SKILL.md) | Improving final prose cannot recover a passage never retrieved; aggregate recall can hide access-filter leaks. | Technical method and pack guide in entry point |
| [llm-tools](../plugins/just-vibe/skills/llm-tools/SKILL.md) | A schema-valid request can still target the wrong account; model text cannot grant permission to execute it. | Technical method and pack guide in entry point |
| [llm-injection](../plugins/just-vibe/skills/llm-injection/SKILL.md) | A refusal in the final response does not prove no unsafe tool call occurred; keyword blocking is not a general defense. | Technical method and pack guide in entry point |
| [llm-cost](../plugins/just-vibe/skills/llm-cost/SKILL.md) | Lower price per call can raise cost per completed task through retries or quality failures. | Technical method and pack guide in entry point |

## Testing

| Workflow | Specific failure or ambiguity addressed | Conditional references |
|---|---|---|
| [test-unit](../plugins/just-vibe/skills/test-unit/SKILL.md) | Asserting internal helper calls or computing expected results with the implementation repeats its mistakes. | Technical method and pack guide in entry point |
| [test-integration](../plugins/just-vibe/skills/test-integration/SKILL.md) | An in-memory substitute may not match transaction isolation, collation or permission behavior of the deployed engine. | Technical method and pack guide in entry point |
| [test-e2e](../plugins/just-vibe/skills/test-e2e/SKILL.md) | A screenshot or HTTP 200 alone does not prove a completed transaction or accessible interaction. | Technical method and pack guide in entry point |
| [test-regression](../plugins/just-vibe/skills/test-regression/SKILL.md) | A missing import or setup timeout on the old revision does not establish regression sensitivity. | Technical method and pack guide in entry point |
| [test-flaky](../plugins/just-vibe/skills/test-flaky/SKILL.md) | Increasing timeouts, retries or skips can hide nondeterminism rather than repair it. | Technical method and pack guide in entry point |
| [test-fixtures](../plugins/just-vibe/skills/test-fixtures/SKILL.md) | A globally shared mutable fixture can make tests order-dependent; overly permissive mocks erase real constraints. | Technical method and pack guide in entry point |
| [test-load](../plugins/just-vibe/skills/test-load/SKILL.md) | Closed-loop clients can hide overload by slowing request generation; averages conceal long tails and errors. | Technical method and pack guide in entry point |
| [test-property](../plugins/just-vibe/skills/test-property/SKILL.md) | A round-trip property can pass when encoder and decoder share the same defect; excessive filtering hides hard inputs. | Technical method and pack guide in entry point |

## Security

| Workflow | Specific failure or ambiguity addressed | Conditional references |
|---|---|---|
| [security-threat-model](../plugins/just-vibe/skills/security-threat-model/SKILL.md) | A generic OWASP list is not a project threat model, and a hypothetical deployment must not become an observed exposure. | [Review selection and evidence](../plugins/just-vibe/references/security/review.md) |
| [security-authz](../plugins/just-vibe/skills/security-authz/SKILL.md) | Authentication middleware proves identity, not ownership; an admin test can bypass the same controls being evaluated. | [Identity and authorization](../plugins/just-vibe/references/security/identity.md) |
| [security-secrets](../plugins/just-vibe/skills/security-secrets/SKILL.md) | Testing a suspected credential against its provider exposes it and exceeds source review; deletion does not revoke an exposed credential. | [Dependency and execution provenance](../plugins/just-vibe/references/security/supply-chain.md); [Scanner selection and evidence](../plugins/just-vibe/references/security/scanners.md) |
| [security-inputs](../plugins/just-vibe/skills/security-inputs/SKILL.md) | A dangerous-looking API with trusted constants is not automatically exploitable; input validation alone does not make every interpreter safe. | [Injection and interpreter boundaries](../plugins/just-vibe/references/security/injection.md); [Scanner selection and evidence](../plugins/just-vibe/references/security/scanners.md) |
| [security-uploads](../plugins/just-vibe/skills/security-uploads/SKILL.md) | Filename extension and client MIME type do not establish content; archive members and symlinks can escape a checked top-level path. | [Files and resource limits](../plugins/just-vibe/references/security/files.md) |
| [security-dependencies](../plugins/just-vibe/skills/security-dependencies/SKILL.md) | An audit error or unsupported lockfile is unknown, not clean; a CVE match alone does not prove the vulnerable function is reachable. | [Dependency and execution provenance](../plugins/just-vibe/references/security/supply-chain.md); [Scanner selection and evidence](../plugins/just-vibe/references/security/scanners.md) |
| [security-config](../plugins/just-vibe/skills/security-config/SKILL.md) | Debug defaults, broad proxy trust or client-visible secrets can invalidate otherwise safe code; development settings are not production evidence. | [Dependency and execution provenance](../plugins/just-vibe/references/security/supply-chain.md); [Framework-specific review branches](../plugins/just-vibe/references/security/frameworks.md) |
| [security-fix](../plugins/just-vibe/skills/security-fix/SKILL.md) | Hiding a scanner warning or adding client validation can leave the server exploit path intact. | [Review selection and evidence](../plugins/just-vibe/references/security/review.md); [Injection and interpreter boundaries](../plugins/just-vibe/references/security/injection.md); [Scanner selection and evidence](../plugins/just-vibe/references/security/scanners.md) |

## Operations

| Workflow | Specific failure or ambiguity addressed | Conditional references |
|---|---|---|
| [ops-incident](../plugins/just-vibe/skills/ops-incident/SKILL.md) | A nearby deployment is correlation, not proof; missing telemetry cannot establish no impact. | Technical method and pack guide in entry point |
| [ops-logs](../plugins/just-vibe/skills/ops-logs/SKILL.md) | Repeated downstream errors can all stem from one upstream failure; log absence can reflect sampling. | Technical method and pack guide in entry point |
| [ops-observability](../plugins/just-vibe/skills/ops-observability/SKILL.md) | User IDs in metric labels cause unbounded cardinality; logging full payloads can expose credentials or private data. | Technical method and pack guide in entry point |
| [ops-alerts](../plugins/just-vibe/skills/ops-alerts/SKILL.md) | A threshold without a responder action creates noise; no samples must not silently become healthy. | Technical method and pack guide in entry point |
| [ops-runbook](../plugins/just-vibe/skills/ops-runbook/SKILL.md) | A plausible command copied from another version or environment can be dangerous; documentation is not evidence it was exercised. | Technical method and pack guide in entry point |
| [ops-container](../plugins/just-vibe/skills/ops-container/SKILL.md) | Deleting a secret in a later layer leaves it in earlier layers; a running process does not prove readiness or graceful shutdown. | Technical method and pack guide in entry point |
| [ops-restore](../plugins/just-vibe/skills/ops-restore/SKILL.md) | A readable archive or backup job success does not prove restoration; testing on production can overwrite current data. | Technical method and pack guide in entry point |
| [ops-postmortem](../plugins/just-vibe/skills/ops-postmortem/SKILL.md) | Invented certainty, blame or assigned owners hides uncertainty and cannot support useful prevention. | Technical method and pack guide in entry point |

## Installation

| Workflow | Specific failure or ambiguity addressed | Conditional references |
|---|---|---|
| [setup](../plugins/just-vibe/skills/setup/SKILL.md) | A package-manager install alone does not register a native plugin; deleting package cache must not break the managed payload. | Technical method and pack guide in entry point |
