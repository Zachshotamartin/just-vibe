---
name: agent-qa
description: "Verify requested web-app outcomes through browser assertions, screenshots and bounded retests Use after implementation when a user wants evidence that a visitor can complete the requested journey, including upload, playback, invalid input and mobile behavior."
---

# agent-qa

Verify requested web-app outcomes through browser assertions, screenshots and bounded retests

## Choose this workflow

Use after implementation when a user wants evidence that a visitor can complete the requested journey, including upload, playback, invalid input and mobile behavior.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Testing methods](../../references/packs/testing.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply runs the requested browser verification and records local evidence. Inspect derives criteria and examines existing evidence without interacting with the target.

defined behavior, existing test conventions/runners, isolated fixtures, and relevant dependencies. Requested bounded verification may use owned isolated fixtures without authorizing product edits or live-system tests. Never test destructive behavior against production by default; distinguish mocked behavior from real integration evidence.

- **Infer from evidence:** Read behavior contracts, existing runners and test conventions; distinguish fixture setup failure from a behavioral failure.
- **Reasonable default:** Use the smallest existing local runner and isolated synthetic fixtures that distinguish the requested behavior.
- **Ask only when needed:** Ask about an unresolved contract that changes the expected result, or the target/load limits before external testing; do not ask the user to choose a runner already configured.

Declared evidence requirements: `project.read`, `browser.inspect`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Original user request, relevant source and fixtures, running target app, prior QA attempts and screenshots.

Create local QA plans, isolated browser sessions and evidence artifacts. Interact only with the authorized target using synthetic fixtures. Fix product code only when the user has authorized repairs; do not submit purchases, publish, delete real data or upload private recordings.

## Execute

1. Read the original request before implementation details. Translate each requested visitor outcome into observable acceptance criteria, quoting the relevant request text. Include successful completion, an invalid-input path and the requested viewport. Separate subjective design judgments from assertions. Do not silently treat inferred criteria as user requirements; mark assumptions in criterion text. Record a reviewed request-to-criterion coverage map with explicit uncovered reasons. Unreviewed or uncovered requirements prevent a complete acceptance claim even when assertions pass.
2. Read the Agent QA guide. Discover browser tools and inspect the app to select actual controls; never invent selectors. Prefer the bounded QA runtime when the target project already has Playwright and Chromium; otherwise use available host browser tools with proof records. Missing tools, authentication, fixture data or a running server make dependent checks blocked, not passed.
3. Create a QA plan with exact target, request-linked criteria, viewport and ordered actions/assertions. For an upload, assert processing completion and advancing media playback, not merely the existence of an upload element. For invalid files, assert visible understandable error content. For mobile, check horizontal overflow, specified control clipping and overlap; retain a screenshot for human visual review. Declare required additional origins; obtain explicit per-run authorization for them and any private test-account storage state. Mask identified private UI in screenshots; never persist passwords in steps.
4. Run verification in a fresh browser context against the authorized target. Prefer a separate verifier only when delegation is permitted; otherwise label this self-review with independent executable assertions. Do not describe running tests in the implementation session as an independent agent review. Keep code inspection and browser results separate.
5. When a check fails, preserve the actual/expected result, viewport, target URL, failed step, screenshot and reproduction sequence. Verify that it is a product defect rather than a missing prerequisite. If repairs are authorized, fix the smallest relevant cause and rerun the same criteria within the configured attempt budget. Never delete the first failure or weaken a criterion to turn the report green. Keep network restrictions separate from assertion failures: an unrelated blocked request must not erase a failure.
6. Recompute evidence freshness and produce the report including all attempts. Disclose unchecked request clauses, subjective judgments, blocked environments and source/build identity uncertainty. Stop on the attempt limit and report remaining work. A successful fixture run or isolated browser assertion cannot prove the entire app is correct. Offer an export of fresh, passing, reviewed journeys as runnable project regression tests, without credentials; do not export stale or incomplete acceptance as passing.
## Technical method

- **Inspect:** Original request quotes, observed controls, synthetic fixtures, target URL, source snapshot, failed step and hashed screenshots.
- **Method:** Use bounded executable browser actions and assertions in fresh contexts; retain every attempt and compare evidence identities after repairs.
- **Avoid misdiagnosis:** Component presence, HTTP success or a screenshot alone does not establish a successful visitor journey. Remote servers may serve a different revision.
- **Check the result:** Exercise a deliberately broken flow and a repaired retest; preserve failures, flag changed evidence, and leave subjective or unavailable checks unresolved.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [Testing worked example](../../references/examples/testing.md).
- Planning, executing or reporting request-derived browser acceptance checks: [Agent QA for web apps](../../references/agent-qa.md).

## Decision branches

- **When a required check is unavailable or fails before exercising behavior:** Mark that criterion unverified and report the prerequisite separately from product failure.
- **When automated behavior is correct but a subjective criterion is unresolved:** Report the automated evidence and leave human acceptance pending rather than manufacturing a pass.

## Deliver and verify

- Request-linked acceptance plan with explicit assumptions and human-only criteria.
- Browser assertion results, screenshots, failure reproduction steps and complete retest history.
- Current evidence freshness and remaining limitations.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A broken processing flow must fail even when the upload control is visible.
- Changed source or modified screenshots invalidate previously passing evidence.
- Unavailable browser dependencies remain blocked; subjective criteria remain needs-human.
- Redirects never contact an unapproved origin; allowed API origins require explicit authorization.
- A clipped ancestor must fail layout verification, and an unrelated blocked request must not mask a failed assertion.

## Stop and recover

- Stop at the attempt budget; do not weaken expectations or erase failures.
- Do not interact with unapproved production data or claim remote build identity from local source hashes.

## Example requests

- **Normal (apply):** Verify that visitors can upload a sample audio file, hear the processed result, and use the mobile controls at http://127.0.0.1:3000.
- **edge (apply):** The upload component exists but processing never completes. Reproduce the failure, preserve evidence, fix it and rerun the same checks.
- **blocked (inspect):** Plan QA for a login-gated app with no test account or recording fixture; identify blocked checks without fabricating results.
