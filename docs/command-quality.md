# Command contracts and quality

The catalog owns each canonical command's scope, mode, required inputs, selection boundary, procedure, decision branches, outputs, observable verification, recovery conditions and examples. Pack references add reusable methods and worked scenarios. Generated SKILL.md files expose all examples and link the applicable guide; they are not independently edited.

215 names resolve to 212 canonical workflows. `do` inherits `auto`, `responsive` inherits `ui-responsive`, and `a11y` inherits `ui-accessibility`. Alias source records contain identity/search metadata only. Loading materializes the canonical behavior; validation rejects scope, mode, method, evidence or other behavioral drift. Routing collapses matching aliases to one canonical recommendation while preserving matched names.

## Writing useful guidance

Selection should distinguish a nearby workflow: explain versus teach, debug versus fix, local pr drafting versus remote github-pr identity/actions. A task-specific procedure should name the evidence to inspect and the decision it informs. A branch should cover a situation that changes the method, such as a partial external operation, incompatible old consumer, stale request completion or missing evaluation labels.

Outputs need enough structure to assess correctness: a comparison needs assumptions and decisive evidence; a migration needs ordered phases, compatibility and recovery boundaries; an audit needs observed/conditional/unknown findings. Normal, edge and missing-evidence requests demonstrate scope and input handling. They do not count as successful evaluations by existing in the catalog.

Keep generic execution rules in the shared guide. Use current primary documentation when behavior depends on framework/provider version. Do not copy a full manual into every command or turn a particular incident into a universal rule. Short commands are acceptable when the task is simple and the contract is clear.

## Change process

1. Edit `plugins/just-vibe/catalog/commands.json` and the relevant pack guide.
2. For an alias, edit its canonical target; keep only identity fields in the alias source.
3. Run `npm run build:skills` and `npm run check`.
4. Add or revise a raw-artifact behavioral fixture for a meaningful new decision or failure mode. Keep its expected result in evaluator-only files.
5. Run a fresh independent agent trial, inspect its actions and grade the actual result. Preserve failures and record instruction/input identities.
6. Update behavioral validation only for the named commands and fixtures actually evaluated. Keep native-host, browser, external-service and model-quality claims separate.

The schema verifies the presence and shape of this contract, not the quality of its prose. The independent fixtures and review of actual agent decisions provide the stronger evidence.

## Profiles and ownership

`catalog/profiles.json` owns role guidance independently of action contracts. Maintain a distinct purpose, priorities, a decision rule, relevant verification, a boundary and valid canonical workflow links for each role. Generate the profile index and individual references with the same build command. A title alone is not a useful profile; nearby roles must change emphasis in an explainable way.

Test profile state transitions for pin protection, scope and budget preservation. Keep role discovery separate from activation. Do not claim that structural validation proves role expertise or that previous workflow trials evaluate newly added role guidance.

All generated work belongs to the user. Shared execution and Git/GitHub guidance prohibit agent self-attribution in commits, PRs and messages while preserving human credits and required third-party notices.
