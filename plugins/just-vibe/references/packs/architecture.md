# Architecture methods

Inspect manifests, dependency injection/composition roots, network clients, data schemas, worker registration and deployment definitions. Build an inventory of responsibilities, interfaces, data owners and runtime boundaries. A source import graph alone is not a deployment topology.

Trace one normal request and one failure/recovery path. For events, mark the database commit, publication, acknowledgement and deduplication boundaries; explicitly walk crashes between each pair. For tenancy, carry identity through caches, jobs, exports and support access, not just request handlers.

For proposed changes, show the current boundary, the target boundary, affected consumers and transitional compatibility. Prefer incremental seams with measurable phase exits. For capacity, state workload and SLO assumptions and identify the serial/shared bottleneck before suggesting replicas or a new service.

Produce evidence-linked diagrams/tables and a migration/verification sequence when applicable. Mark inferred or inaccessible components. Do not invent traffic, ownership or live infrastructure observations.

## Applied methods

### A usable architecture record

Use a boundary table: component, responsibility, owned data, inbound contract, outbound dependency, failure mode, evidence. A source import proves code coupling; it does not prove a deployed network edge. A diagram should label both.

For a checkout service publishing an OrderPlaced event, draw these points separately: validate request, commit order, publish event, acknowledge processing, send receipt. Place a crash after each durable step. A database commit followed by an independent publish leaves a missing-event window; a consumer effect followed by acknowledgment leaves a duplicate-effect window. Choose mechanisms against those windows, not against a slogan such as exactly-once.

### Feature and modernization decisions

Map acceptance criteria to existing owners first. Compare extending a module, extracting an interface, and creating a service by deployment independence, data ownership, latency and operational burden. A service split is justified by demonstrated needs, not file count.

For a staged replacement, specify which version reads/writes each field at every phase. Include reconciliation while two implementations coexist, the evidence needed to move traffic, and the moment when old data or APIs become unsafe to remove. Keep the previous implementation until exit criteria actually hold.

### Scale and tenancy checks

Scale plans need workload shape and a limiting resource: requests per unit time, service-time distribution, concurrency, queue age and shared constraints. Missing measurements produce a measurement task, not fabricated capacity.

For tenancy, follow an example tenant ID through request context, database predicate/role, cache key, queue payload and object download. An isolated API handler does not prove that its worker or cache preserves isolation.
