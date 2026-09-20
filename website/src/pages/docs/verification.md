---
layout: ../../layouts/Doc.astro
title: Evidence and verification
description: Tie the work to the requirement. Make passing, missing, and stale evidence visible.
---

## Ask for the checks that matter

```text
/just-vibe:verify Checkout against these requirements:
prevent duplicate submissions, preserve the cart after a failed payment,
and keep the flow usable by keyboard. Show the evidence and gaps.
```

The [verify](/commands/verify/) workflow identifies relevant checks, runs authorized commands where possible, and reports what those checks establish. The proof helpers can organize requirements, evidence, and unresolved coverage into a local report.

A test exit code does not prove visual quality, business correctness, or production behavior. Reports should distinguish automated tests, rendered browser observations, supplied artifacts, and assumptions.

## Use the right evidence source

- **Browser checks:** require project-installed Playwright and Chromium, a runnable target, and authorized interactions.
- **GitHub checks:** require authenticated access and the exact repository, PR, and revision.
- **Vercel evidence:** needs the project, environment, and deployment identity.
- **Database migration review:** can inspect SQL and supplied history without connecting to a live database.
- **ML comparisons:** need local experiment exports and a defensible evaluation protocol.

No optional provider dependencies or service credentials are installed for you.

## Re-check when the target changes

Evidence belongs to the version and environment it inspected. A later source edit can make earlier evidence stale. Partial file coverage or a matching source snapshot cannot certify environment variables, dependencies, or external services.

Use [review](/commands/review/) for defects and regressions, then request the fixes you want. Use verify to establish what the resulting change actually passed.
