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

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan deployment when asked for a plan; apply for requested deployment preparation or submission to a resolved environment.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

- **Infer from evidence:** Resolve the named files, existing scripts, current task and earlier corrections from the conversation and repository.
- **Reasonable default:** Use the narrowest interpretation that completes a reversible local task; state a consequential assumption once.
- **Ask only when needed:** Ask when competing targets or incompatible success conditions would change the result; continue independent inspection first.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Prepare deployment; execute only the deployment explicitly requested and authorized, including promotion separately when needed.

Inspect/plan: inspect or propose; save requested artifacts only. Apply: make the requested changes or execute the requested operation within its resolved target and limits. Local preparation does not authorize live, remote, destructive or paid actions; existing explicit session authorization still applies.

## Execute

1. Resolve target, inspect prerequisites and checks, identify recovery, execute authorized steps, and verify the deployed revision and health.
2. Confirm immutable artifact/revision, environment and health criteria; resolve schema compatibility and the previous usable target before execution.
## Technical method

- **Inspect:** Resolve provider, project/environment, immutable candidate revision, authorization and current live identity.
- **Method:** Prepare artifact, environment/schema compatibility and rollback target before the requested deployment action.
- **Avoid misdiagnosis:** Deploying from a dirty tree or checking a moving alias can disconnect observed success from the intended artifact.
- **Check the result:** Verify the resulting deployment identity and health at that revision; code rollback limits from data changes remain explicit.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [General worked example](../../references/examples/general.md).


## Decision branches

- **When submission times out with uncertain provider state:** Look up the operation by revision or deployment ID before creating another deployment.
- **When the request is for local preparation or implementation:** Prepare the requested build/configuration locally; a deployment request authorizes its named submission, while unresolved account, target or paid-resource choices must be settled first.

## Deliver and verify

- Deployment plan or actual deployment ID/URL, health evidence, and recovery information.
- Target, revision, deployment identity, health results and recoverability limits.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Successful upload without healthy startup is not completion; an ambiguous production target blocks execution.

## Stop and recover

- Do not create paid resources, alter DNS, or promote previews implicitly. Report partial deployment state before retrying.

## Example requests

- **Normal (plan):** Prepare a staging deployment plan; identify the exact revision and rollback.
- **edge (apply):** Deploy a preview whose build succeeds but startup health fails.
- **blocked (inspect):** Plan deployment without provider access; do not claim a URL or deployed revision.
