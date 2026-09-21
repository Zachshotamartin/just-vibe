# Python packaging and Celery delivery semantics

Use when: celery, python packaging, task redelivery.

Implement a task or Python runtime change with the project’s pinned interpreter, broker and database.

## Inspect first

- Interpreter/lock/environment and import path
- Celery broker, acknowledgement and retry settings
- Database transaction boundaries and idempotency key

## Method

1. Make task inputs serializable identifiers rather than live ORM instances. Publish after commit when a worker depends on newly written rows; use an outbox when the publish/database gap must be recoverable.
2. Assume duplicate delivery and crashes around acknowledgement. Enforce a durable idempotency constraint around the actual effect, not only an in-memory flag.
3. Distinguish transient retryable failures from invalid input. Bound retry count, delay and execution time; preserve cancellation and worker shutdown semantics.
4. Test installed-package imports in a clean environment and asynchronous code under its actual loop owner.

## Failure cases

- The worker reads a row before the request transaction commits.
- A retry charges twice after a crash following a successful provider call.
- Tests pass only because the source checkout shadows the installed wheel.

## Verification

- Test duplicate delivery before and after the effect boundary.
- Use a real broker fixture for acknowledgement guarantees; eager mode is a narrower test.
- Build and import the wheel outside the source directory.

## Worked scenario

Create an order and enqueue its task with transaction.on_commit; separately test recovery when message publication fails.

## Version-sensitive primary references

- [docs.celeryq.dev](https://docs.celeryq.dev/en/stable/userguide/tasks.html) — Read the official source for the installed version before relying on a version-sensitive API.
- [docs.djangoproject.com](https://docs.djangoproject.com/en/stable/topics/db/transactions/) — Read the official source for the installed version before relying on a version-sensitive API.

This is a host-agent method, not an installed vendor service. Inspect versions and available tools, preserve the requested scope, and report unavailable live checks. Do not treat a checklist as proof of correctness or compliance.
