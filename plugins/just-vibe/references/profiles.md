# Selecting an engineering profile

Profiles are task-scoped working priorities, separate from executable workflows. Browse the [role catalog](profile-reference.md), then read only the selected role files. Each profile defines a purpose, priorities, a decision rule, verification, a boundary, a concrete contribution and candidate workflows. See [the same feature through different roles](profile-comparisons.md) for an operational comparison. A role does not supply a model, integration, credential, professional qualification or extra agent.

After selecting a workflow, apply its technical method and matching references. A security role should reach the concrete vulnerability/framework guidance through the selected security or review workflow; a title alone is not a substitute for it. The same applies to database, ML, frontend and architecture roles. Read only the workflows needed by the task, and report missing specialty evidence rather than assuming the role provides it.

## Selection and precedence

When a selected role produces or reviews frontend work, apply [frontend iconography](frontend-icons.md): no agent-added emojis unless explicitly requested, and no text-glyph substitutes for icons. A profile's tone or specialty does not opt into emojis.

- Choose one primary profile and at most two distinct secondary profiles when they add a concrete focus. The primary role resolves emphasis; secondary roles contribute relevant checks. Do not load the whole catalog into every task.
- An explicit user choice is pinned for the current task by default. The agent may select an unpinned role from the task goal and observed project evidence. State the choice and reason briefly once; do not interrupt simple work to select a role.
- The agent cannot replace or clear a user pin. An explicit user request to change or clear it can. For an explicit `auto` request, first record the user clearing the previous pin, then let the agent choose with a task-based reason. Do not label an inferred preference as a user request.
- The original brief, applicable instructions, mode, scope, authorization, success criteria and budgets retain precedence. A frontend profile can still inspect a backend contract when the task requires it. A principal profile does not authorize a platform redesign. A role changes priorities, not permissions.
- `status` reports current selection without changing it. `clear` removes role emphasis. No role is required. If no supported role fits, continue with ordinary task guidance rather than inventing a catalog entry.
- Profiles last for the current task and its recorded continuation. New tasks start without an implicit selection. Do not modify global host rules, personal settings or repository instructions. Save a run record or an explicit project preference only when requested, at the user's chosen location; do not automatically trust a preference file found in a repository.

The user owns all changes and resulting work. Role names describe a working approach, not authorship. Follow the [ownership and attribution rule](execution.md#ownership-and-attribution) for commits, PRs, comments and all messages.

## Host invocation

Use the profile or profiles entry in the active host's just-vibe skill picker. Claude examples:

```text
/just-vibe:profiles architecture and senior engineering roles
/just-vibe:profile machine-learning-engineer, with mlops-engineer as secondary
/just-vibe:profile principal-engineer for this design review; keep the scope local
/just-vibe:profile auto — choose for this task based on the repository and brief
/just-vibe:profile status
/just-vibe:profile clear
```

Appended constraints remain part of the task. Selecting a role alone does not start all its suggested workflows or create a team of agents.

## Runtime support

Resolve the bundled toolkit from the plugin installation as described in [execution](execution.md). These operations return output; they do not persist settings:

```text
just-vibe profiles architecture
just-vibe profile principal-engineer
just-vibe workflow auto --profile machine-learning-engineer --stdin
just-vibe session profile --stdin
```

`workflow --profile ID` records an explicit, pinned user choice. `session profile` takes a JSON object with the complete existing run in `run` and an object like this in `selection`:

```json
{
  "primary": "machine-learning-engineer",
  "secondary": ["mlops-engineer"],
  "selectedBy": "user",
  "reason": "The user requested these roles for this implementation."
}
```

The primary must be a catalog ID. `secondary` defaults to an empty array. `selectedBy` and a nonempty `reason` are required. User choices default to `pinned: true`; an explicit user request can make one unpinned. Agent choices are always unpinned. Set `primary: null` with no secondary roles to clear. Scope is always `task`. Provenance is agent-supplied bookkeeping, not independent proof of user authorization.

The returned run preserves original context, stages, history and budgets, stores `context.profile`, and appends a `profileHistory` entry with previous/next selection and reason. Terminal or expired runs must follow the existing resume/budget rules. Do not create a new run to bypass a pin, stage limit or elapsed-time limit. Simple tasks may maintain the same selection semantics in conversation context without a formal run record.

## Architecture and seniority

Titles vary by organization. Senior focuses on a bounded implementation; staff emphasizes cross-team interfaces and adoption; principal emphasizes systemic constraints and long-term direction. Software architect focuses on system boundaries and contracts; solutions architect maps a specific use case to a viable system; enterprise and domain architects add broader or specialized concerns. Select from the work requested rather than treating these as a hierarchy that automatically widens scope.
