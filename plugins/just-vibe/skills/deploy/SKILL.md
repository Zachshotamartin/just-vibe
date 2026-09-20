---
name: deploy
description: "Prepare or perform deployment within the requested authorization Use for an explicitly targeted deployment or its plan; vercel-preview is the Vercel preview specialization."
---

# deploy

Prepare or perform deployment within the requested authorization

## Choose this workflow

Use for an explicitly targeted deployment or its plan; vercel-preview is the Vercel preview specialization.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; application, environment/account, artifact/revision, and desired deployment action.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Prepare deployment; execute only the deployment explicitly requested and authorized, including promotion separately when needed.

None by default. Plan artifacts may be saved when requested.

## Execute

- Resolve target, inspect prerequisites and checks, identify recovery, execute authorized steps, and verify the deployed revision and health.
- Confirm immutable artifact/revision, environment and health criteria; resolve schema compatibility and the previous usable target before execution.

## Decision branches

- **When submission times out with uncertain provider state:** Look up the operation by revision or deployment ID before creating another deployment.

## Deliver and verify

- Deployment plan or actual deployment ID/URL, health evidence, and recovery information.
- Target, revision, deployment identity, health results and recoverability limits.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Successful upload without healthy startup is not completion; an ambiguous production target blocks execution.

## Stop and recover

- Do not create paid resources, alter DNS, or promote previews implicitly. Report partial deployment state before retrying.

## Example requests

- **Normal (plan):** Prepare a staging deployment plan; identify the exact revision and rollback.
- **edge (plan):** Deploy a preview whose build succeeds but startup health fails.
- **blocked (inspect):** Plan deployment without provider access; do not claim a URL or deployed revision.
