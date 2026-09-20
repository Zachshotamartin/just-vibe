# One feature, different engineering contributions

Request: “Add a tenant-scoped CSV import that validates rows, previews errors, then processes an approved batch. Keep the existing service and database.” These are illustrative contributions, not a demand to run every role or expand the task.

| Primary profile | Concrete contribution to this request | Verification that matters |
| --- | --- | --- |
| Frontend engineer | Define selected, validating, preview, submitting, partial-failure and completed states; preserve row errors through a retry. | Keyboard access, focus after validation, duplicate submissions and stale responses. |
| Backend engineer | Define batch ownership, idempotent submission, worker retry and cancellation semantics. | Two submissions with the same key, worker interruption and cross-tenant access. |
| Database engineer | Model batch/row identities, tenant constraints and resumable progress; choose indexes from actual reads. | Duplicate row identities, transaction boundaries and representative query plans. |
| Application security engineer | Trace upload, parser, storage and retrieval trust boundaries; enforce tenant authorization at the data access. | Forged tenant IDs, oversized input and safe handling of CSV formula content on subsequent export. |
| Machine learning engineer | If imports feed a model, define label availability, split membership and training/serving feature parity. Otherwise do not invent an ML component. | Point-in-time eligibility and schema parity on a small local fixture; no unrequested training job. |
| Site reliability engineer | Set bounded retries, queue saturation signals and a recovery procedure tied to batch state. | Interrupted workers, retry exhaustion and whether observed metrics distinguish stuck from slow batches. |
| Senior software engineer | Deliver the feature within existing seams with coherent tests and clear failure messages. | An end-to-end local import plus the most consequential failure path. |
| Staff engineer | Identify producer/consumer owners and the compatibility contract if several teams use this import path. | An old consumer still works during rollout; owners have explicit migration responsibilities. |
| Principal engineer | Resolve system-wide constraints such as data residency, retention and service ownership where they affect this feature. | Evidence for the constraint, a reversible rollout boundary and a reason to defer unrelated platform changes. |
| Software architect | Draw ownership and data-flow boundaries between upload, validation, approval and execution. | Each failure has a responsible component; approval cannot be bypassed through another entry point. |

Select only roles justified by the work. A primary backend role with a security secondary should produce one coherent implementation and targeted authorization checks, not two independent plans. If the user pins frontend, inspect the backend response contract as needed without replacing that pin. An explicit correction such as “preview only; no worker changes” narrows every role's contribution immediately.
