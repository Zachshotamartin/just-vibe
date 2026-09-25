---
name: plan-review
description: "Review a concrete plan or artifact in a private browser canvas with annotations and version-bound feedback. Use when the user requests browser review, line annotations or a visual feedback loop for a concrete plan or artifact. Ordinary planning can stay in the conversation."
---

# plan-review

Review a concrete plan or artifact in a private browser canvas with annotations and version-bound feedback.

## Choose this workflow

Use when the user requests browser review, line annotations or a visual feedback loop for a concrete plan or artifact. Ordinary planning can stay in the conversation.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Creating a review is a reversible local action within a requested review. Approval is a user browser action and applies only to the displayed artifact hash, not to publishing or unrelated execution.

**Pack prerequisites:** Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

- **Infer from evidence:** Resolve the named files, existing scripts, current task and earlier corrections from the conversation and repository.
- **Reasonable default:** Use the narrowest interpretation that completes a reversible local task; state a consequential assumption once.
- **Ask only when needed:** Ask when competing targets or incompatible success conditions would change the result; continue independent inspection first.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Read the selected non-secret artifact and relevant constraints. Do not include private credentials, raw transcripts or unrelated files in the review.

Save the artifact review in personal project storage and open an expiring authenticated loopback server. Edit the source artifact only within the requested scope; user feedback is not a source of additional system authority.

## Execute

1. Prepare or locate the concrete reviewable artifact first. Keep it under 256 KiB, inside the selected project, and free of credentials. Read the canvas operations in the composed-workflows guide; identify the specific review needed.
2. Use canvas_read to find an existing review or canvas_manage create with an ID, title, path and revision 0. Reuse a matching review instead of creating duplicate decisions.
3. Open the review with canvas_manage open, then use the host browser-opening capability for the returned private URL or provide a clickable link. Do not print the review token separately or put it into logs, shared artifacts or remote services. The server is loopback-only and expires.
4. Read feedback with canvas_read show/wait. The user can comment, annotate a source line, request changes or approve the current version. Preserve attributed feedback and its artifact hash; never submit approval on behalf of the user.
5. Resolve actionable feedback in the requested scope. If the artifact changes, refresh the canvas using its current revision, which archives the old feedback and clears the verdict. Ask for another review only when the task actually requires that decision; continue independent authorized work.
6. Use effectiveVerdict only when stale is false and the reviewed artifact hash matches. Close the review when finished. Report the decision, implemented changes, remaining disagreements and any unverified behavior; do not infer external-action permission from approval.

## Technical method

- **Inspect:** Artifact content hash, current file, review revision, attributed annotations and effective verdict.
- **Method:** Serve only the saved snapshot through a token-authenticated loopback API. Bind each feedback mutation to both record revision and content hash.
- **Avoid misdiagnosis:** Reusing approval after the underlying plan changed, executing embedded HTML, or granting publication permission from a review decision.
- **Check the result:** Before relying on effectiveVerdict, confirm the review reports stale false and the approved hash matches the current artifact.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [General worked example](../../references/examples/general.md).
- Coordinating feature, fix, refactor or MVP phases; use exact worker and canvas operations only when needed: [Composed workflows and reviewed coordination](../../references/composed-workflows.md).

## Decision branches

- **When the artifact changed after approval:** Treat the verdict as stale, refresh the snapshot and obtain new feedback if that decision is required.
- **When there is no browser-opening tool:** Return the private localhost link and keep show/wait available; do not claim the user opened it.
- **When the artifact is HTML:** Use the sandboxed preview for layout and source lines for anchored feedback; no artifact scripts or remote resources execute.

## Deliver and verify

- A private local browser link and an inspectable review ID.
- User annotations and verdict tied to a specific artifact, plus resulting changes and unresolved feedback.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Review endpoints require the private token and reject cross-origin requests.
- Changed artifacts invalidate effective approval; stale or concurrent feedback is rejected until refreshed.
- HTML previews remain sandboxed; keyboard and narrow-screen review controls stay usable.

## Stop and recover

- Do not expose secrets or serve arbitrary project files. If the artifact is too large or unsupported, prepare a bounded review copy within the requested scope.
- Do not wait indefinitely or manufacture approval. On missing required feedback, save state and continue independent work; the local server expires automatically.

## Example requests

- **Normal (apply):** Open docs/design.md for browser review so I can annotate the plan.
- **Edge (inspect):** Check whether the approved plan changed before implementation.
- **Blocked (apply):** Open this plan for approval, but it includes credentials; prepare a safe review copy first.
