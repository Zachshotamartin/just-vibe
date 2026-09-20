---
name: deploy
description: "Prepare or perform deployment within the requested authorization"
---

# deploy

Prepare or perform deployment within the requested authorization

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

## Deliver and verify

- Deployment plan or actual deployment ID/URL, health evidence, and recovery information.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Successful upload without healthy startup is not completion; an ambiguous production target blocks execution.

## Stop and recover

- Do not create paid resources, alter DNS, or promote previews implicitly. Report partial deployment state before retrying.

## Example request

Prepare a staging deployment plan; identify the exact revision and rollback.
