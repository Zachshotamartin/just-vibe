# Django and Django REST Framework

Use for implementation, debugging, review or tests in a confirmed Django project. Read the installed Django/DRF versions, settings entrypoints, URL configuration, models, migrations, serializers, permissions and test database configuration before choosing a change. Preserve the existing app boundaries and dependency manager.

## Implementation decisions

Trace URL → middleware → view/viewset action → serializer → queryset/service → database. Authentication identifies the caller; filter list, detail, export and nested relation queries by the actual tenant/ownership policy. A serializer's writable foreign key queryset must enforce the same policy. Reject fields that clients must not control, such as owner, tenant, roles and computed prices.

Place atomicity around the complete business invariant, including the ownership lookup when concurrent updates could change it. Use a unique/check constraint for database-enforced invariants. Use select_for_update only inside a real transaction on a database that supports the intended lock. A read-then-create sequence without a constraint still races. Translate expected constraint conflicts at the service boundary; preserve unexpected exceptions.

Schedule external side effects with transaction.on_commit when they depend on a successful commit. For delivery that must survive a worker crash, use the project's durable outbox/job pattern; on_commit alone is not durable messaging. Make retries idempotent with a business key and bounded failure handling. Do not hold a transaction across a remote HTTP call.

Choose select_related for appropriate single-valued relations and prefetch_related for collections. Measure query counts on realistic list sizes and inspect pagination. Keep a bounded number of queries and avoid converting an entire queryset into a list to paginate it. Cache keys and invalidation must include tenant and authorization-sensitive context.

## Migration recipe

Read the graph and existing data invariants. Separate nullable column addition, bounded backfill, constraint validation and removal of compatibility code when a one-step migration would lock a large table or break mixed application versions. Data migrations use historical models from apps.get_model and the intended database alias. Demonstrate rollback or document why the operation is forward-only before running against shared data. Generated migration files alone are not evidence that the migration ran.

## Tests that distinguish the failure

- Build two independent tenants. Exercise list, detail, mutation and foreign-key assignment with the other tenant's IDs; denied responses must not reveal private fields.
- Use transaction-aware tests and the production database engine for locking/race behavior. Django TestCase's enclosing transaction can hide missing atomic blocks. Use TransactionTestCase when real commits are required, or captureOnCommitCallbacks for a focused callback test.
- Reproduce duplicate concurrent submissions; one logical result should remain after retries. Cover database rollback and the absence of premature side effects.
- Use assertNumQueries or equivalent around the actual rendered/serialized collection. Include enough objects to reveal N+1 behavior.
- Test CSRF on the real session-authenticated write path. Default test-client convenience does not establish CSRF protection; enable its checks for that test.

## Review and delivery

Inspect effective DEBUG, ALLOWED_HOSTS, proxy trust, secure cookies, CSRF origins and escaping under the deployment settings. Do not add obsolete settings from older Django releases. Check raw SQL, mark_safe and serializer fields at reachable call sites. Run the repository's test command, targeted migration checks and deployment checks only with appropriate settings and credentials. Report the exercised database backend and any production-only behavior left unverified.

References: [transactions](https://docs.djangoproject.com/en/5.2/topics/db/transactions/), [testing tools](https://docs.djangoproject.com/en/5.2/topics/testing/tools/), [migrations](https://docs.djangoproject.com/en/5.2/topics/migrations/), [deployment checklist](https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/). Select the documentation version matching the project.
