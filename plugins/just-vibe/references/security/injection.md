# Injection and interpreter boundaries

Choose only the sinks present in the task. CWE identifiers categorize mechanisms; they are not proof that a line is vulnerable. Locate source, transformations, actual sink, controlling guard and reachable caller. Use the review procedure's legitimate control with every regression.

## SQL and NoSQL injection — CWE-89 / CWE-943

A bound value stays data. A selected column, operator or sort direction changes query structure and usually cannot be repaired by putting it in a value placeholder. Map those choices to trusted constants. Inspect raw ORM fragments separately. In document databases, constructing an operator object from untrusted input can change a predicate even without a query string.

```python
# Unsafe: the value becomes SQL syntax.
rows = connection.execute("SELECT id FROM invoices WHERE owner = '" + owner + "'")
# sqlite3 example: value binding; other drivers use different placeholders.
rows = connection.execute("SELECT id FROM invoices WHERE owner = ?", (owner,))
```

Check ordinary quoted text as a legitimate value and a synthetic predicate-altering input against an isolated database. A parameterized query can still have a missing tenant predicate; injection and authorization are different checks. [OWASP injection guidance](https://cheatsheetseries.owasp.org/cheatsheets/Injection_Prevention_Cheat_Sheet.html).

## Shell and argument injection — CWE-78 / CWE-88

Prefer a library API. If a process is necessary, use an executable plus an argument array with no shell. Validate meaning as well as quoting: an input starting with a dash may become a dangerous program option. Use an option terminator only when that executable supports it, or map user choices to fixed arguments.

```javascript
// Unsafe: request text becomes shell source.
exec(`convert ${request.file} output.png`);
// Safer boundary for an approved converter: fixed arguments and server-owned paths.
execFile(converterPath, [validatedInputPath, serverOwnedOutputPath], { shell: false });
```

The second line still requires a trusted binary, safe path/option policy, processing limits and version-appropriate parser protections. Check literal spaces/metacharacters with a fake executable recording argv; do not run attack strings through a real shell. [Node child-process API](https://nodejs.org/api/child_process.html).

## HTML, DOM and template injection — CWE-79 / CWE-1336

Distinguish HTML text, attribute, URL, CSS and JavaScript contexts. Rendering untrusted text as data is preferable to interpreting it as HTML. Rich HTML requires a maintained sanitizer configured for intended elements/attributes before the HTML sink; later concatenation can invalidate sanitization. Server template source must remain trusted.

```javascript
// Unsafe when comment is untrusted.
node.innerHTML = comment;
// Correct for a plain-text comment.
node.textContent = comment;
```

Test that inert markup is displayed as text in the real DOM and legitimate Unicode remains intact. React escaping does not make `dangerouslySetInnerHTML` or arbitrary `href` schemes safe. CSP is additional protection, not evidence that unsafe rendering is fixed. [OWASP DOM XSS guidance](https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html).

## Server-side request forgery — CWE-918

Trace attacker influence over scheme, hostname, port, credentials, redirects and resolution. For a fixed upstream, accept a resource identifier and construct the destination server-side. Where arbitrary public URLs are a requirement, use reviewed destination validation plus connection-time address enforcement/egress controls. Resolve IPv4/IPv6 and every redirect target; a preflight DNS check alone has a rebinding/time-of-check gap. Bound redirects, response bytes and duration; do not forward credentials to a new origin.

Bad pattern: `fetch(request.body.url)` with privileged network access and no destination contract. Safer fixed-destination design: validate an external item ID, construct an HTTPS URL at the configured upstream, and reject redirects unless explicitly required and revalidated. Test with fake resolver/transport results for loopback, private/link-local addresses, mixed DNS answers and public-to-private redirects. Never contact cloud metadata or real internal services as a casual proof. [OWASP SSRF guidance](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html).

## XML external entities — CWE-611

Identify the parser/version and whether DTDs, external entities, XInclude or network access are enabled by the actual API. Use a supported hardened parser configuration or reject unsupported document features. A generic input schema does not prevent entity expansion during parsing. Check a small inert document referencing a synthetic local/network resource with a fake resolver and verify the resolver is never called; keep normal XML as a control. Do not use expansion bombs or real local secrets. [OWASP XML guidance](https://cheatsheetseries.owasp.org/cheatsheets/XML_External_Entity_Prevention_Cheat_Sheet.html).

## Unsafe deserialization — CWE-502

Trace who can write or replace serialized bytes and what happens during loading. Pickle, unsafe YAML constructors and polymorphic object loaders can execute behavior before field validation. Use a data-only format plus schema validation when possible; where model serialization is unavoidable, require trusted provenance and the installed framework's supported safe loading mode. A content hash only identifies bytes; it does not establish a trusted producer. Inspect unsafe fixtures as text rather than loading hostile objects. [OWASP deserialization guidance](https://cheatsheetseries.owasp.org/cheatsheets/Deserialization_Cheat_Sheet.html).

## Prototype pollution and mass assignment — CWE-1321 / CWE-915

Do not recursively merge arbitrary input into configuration or persist the entire request object as a privileged model. Select allowed fields with type validation; use `Map` or own-property access for dictionaries where appropriate. Reject dangerous keys at every recursive boundary in a generic merge and understand `__proto__`, `constructor` and `prototype` paths; filtering one top-level spelling is insufficient. Test JSON-parsed hostile keys and an ordinary nested value, verifying both the target and unrelated object prototypes. Assignment of a server-owned `role`, `tenantId` or `price` is also an authorization problem. [OWASP prototype guidance](https://cheatsheetseries.owasp.org/cheatsheets/Prototype_Pollution_Prevention_Cheat_Sheet.html).

## Open redirects and resource exhaustion — CWE-601 / CWE-400 / CWE-1333

For return URLs, prefer server-owned destination IDs or validated local paths; parse using the same URL semantics as the final redirect and account for scheme-relative URLs and normalization. A same-site redirect still needs product-specific route restrictions.

Bound request/response sizes, parse depth, query complexity and expensive operations before large allocations. For suspicious regular expressions, establish a reachable attacker-controlled input and review engine behavior; use safe small boundary fixtures and timeouts rather than launching a large denial-of-service sample. A long input rejected before the costly operation is a useful negative control. Resource caps must retain legitimate requests within the documented contract.
