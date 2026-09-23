---
layout: ../../layouts/Doc.astro
title: Agent QA
description: Check whether a visitor can complete the outcome you requested, with browser evidence and retained retests.
---

Ask: “Verify that a visitor can upload a recording, hear the result, and use the controls on mobile. Fix confirmed issues and verify again.” You can also select [agent-qa](/commands/agent-qa/) or use `/jv agent-qa` in Claude.

The agent translates your request into observable criteria, inspects the app's actual controls, and runs browser checks. An upload component in the code is not enough: the requested processing must complete and playback must advance. Unsupported input needs a visible useful error. Mobile checks look for page overflow and clipping or overlap among the specified controls; screenshots support your visual judgment.

## What you receive

- A reviewed map from each declared request requirement to its criteria, including explicit uncovered requirements. Unreviewed or uncovered acceptance remains incomplete even if every browser assertion passes.
- Actual assertions, screenshots, failed steps and reproduction instructions.
- Earlier failures alongside repaired retests, with a bounded attempt budget.
- Explicit blocked, stale, missing and human-review outcomes.

When the target project has Playwright and Chromium, `just-vibe qa` provides a bounded browser runner. Otherwise the workflow can use your host's browser tools and retain their observations as reported evidence. It does not install dependencies or start another model service silently.

The runner requires Playwright 1.48 or newer and Chromium. It uses fresh contexts, blocks service workers and WebSockets, and enforces approved HTTP(S) origins through a local authenticated proxy, including redirects. The primary target is allowed; additional API or CDN origins must be declared in the plan and explicitly authorized for each run. Blocked optional requests are recorded separately and never erase a failed assertion.

Layout checks follow clipping through web-component shadow hosts and slots. Fully transparent selected elements or their ancestors do not count as visible; normal fade-ins may finish within the configured timeout. Contrast, perceptual quality and other visual details still need screenshot review.

Text assertions also reject completion messages supplied only by invisible or zero-size descendants, including slotted text. Visible text beside hidden content and ordinary nested markup remain supported. Mixed-visibility content with an unsupported text transform or an oversized DOM needs a narrower selector or human review.

For login-gated apps, use a dedicated test account and a private Playwright storage-state file under `.just-vibe/qa-auth/`. Explicitly authorize its use for the run. State is supplied to the browser, filtered to approved origins and never copied into plans, reports or exports. Keep this directory out of Git. Configure screenshot masks for private content; password inputs and fields filled by the runner are masked automatically. Masks only cover identified elements, so review screenshots before sharing.

Successful journeys with fresh evidence and reviewed coverage can be exported with `qa export-test` into a new project directory. The export contains runnable Node tests, the plan and bounded assertion/network helpers. It uses the project's Playwright installation, requires the app to be running, and never copies session credentials. This is useful as a regression check, not a proof of overall correctness.

For scripted gates, `qa run`, `qa show` and `qa report` exit `0` for current passing acceptance, `2` for failed or incomplete acceptance, and `1` for command errors. Exports retain the passing run's step timeout.

Use local or staging apps with synthetic fixtures. Apps needing WebSockets and subjective audio/design judgments still require additional host or human checks. Source hashes cannot prove which version a remote server serves.

A separate runner is not a separate AI reviewer. The workflow labels self-review honestly and uses another verifier only when delegation is available and authorized. Repairs require your requested scope; QA does not grant permission to change production data or deploy.

Read the [runtime schema and complete example](https://github.com/Zachshotamartin/just-vibe/blob/main/plugins/just-vibe/references/agent-qa.md).
