# Architecture methods

Inspect manifests, dependency injection/composition roots, network clients, data schemas, worker registration and deployment definitions. Build an inventory of responsibilities, interfaces, data owners and runtime boundaries. A source import graph alone is not a deployment topology.

Trace one normal request and one failure/recovery path. For events, mark the database commit, publication, acknowledgement and deduplication boundaries; explicitly walk crashes between each pair. For tenancy, carry identity through caches, jobs, exports and support access, not just request handlers.

For proposed changes, show the current boundary, the target boundary, affected consumers and transitional compatibility. Prefer incremental seams with measurable phase exits. For capacity, state workload and SLO assumptions and identify the serial/shared bottleneck before suggesting replicas or a new service.

Produce evidence-linked diagrams/tables and a migration/verification sequence when applicable. Mark inferred or inaccessible components. Do not invent traffic, ownership or live infrastructure observations.
