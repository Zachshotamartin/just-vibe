---
layout: ../../layouts/Doc.astro
title: Agent QA
description: Check whether a visitor can complete the outcome you requested, with browser evidence and retained retests.
---

Ask: “Verify that a visitor can upload a recording, hear the result, and use the controls on mobile. Fix confirmed issues and verify again.” You can also select [agent-qa](/commands/agent-qa/) or use `/jv agent-qa` in Claude.

The agent translates your request into observable criteria, inspects the app's actual controls, and runs browser checks. An upload component in the code is not enough: the requested processing must complete and playback must advance. Unsupported input needs a visible useful error. Mobile checks look for page overflow and clipping or overlap among the specified controls; screenshots support your visual judgment.

## What you receive

- The acceptance criteria and the request text behind them.
- Actual assertions, screenshots, failed steps and reproduction instructions.
- Earlier failures alongside repaired retests, with a bounded attempt budget.
- Explicit blocked, stale, missing and human-review outcomes.

When the target project has Playwright and Chromium, `just-vibe qa` provides a bounded browser runner. Otherwise the workflow can use your host's browser tools and retain their observations as reported evidence. It does not install dependencies or start another model service silently.

The runner uses fresh browser contexts and same-origin HTTP requests. Use a local or staging app with synthetic fixtures. Apps requiring other API origins, authenticated sessions, or subjective audio/design judgments need additional host or human checks. Local source hashes cannot prove which version a remote server serves.

A separate runner is not a separate AI reviewer. The workflow labels self-review honestly and uses another verifier only when delegation is available and authorized. Repairs require your requested scope; QA does not grant permission to change production data or deploy.

Read the [runtime schema and complete example](https://github.com/Zachshotamartin/just-vibe/blob/main/plugins/just-vibe/references/agent-qa.md).
