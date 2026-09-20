# Files, uploads and resource limits

## Path traversal and link races — CWE-22 / CWE-59

Follow decoding and normalization through the actual filesystem call. A raw prefix check accepts sibling paths such as `/srv/uploads-other` and may miss platform separators, drive roots or symlinks. Prefer opaque object IDs mapped to server-owned storage keys. If user-relative paths are required, compare path components after supported resolution and verify containment at the operation boundary. A pre-check followed by a separate open still has a race when an attacker can change links or directories.

```javascript
// Lexical containment only: still requires a policy for filesystem links/races.
const candidate = path.resolve(root, requestedRelativePath);
const rel = path.relative(root, candidate);
const escapes = path.isAbsolute(rel) || rel === '..' || rel.startsWith(`..${path.sep}`);
if (escapes) throw new Error('outside storage root');
```

Do not present this snippet as a complete secure file-open implementation. Use trusted immutable directories, supported no-follow/handle-relative mechanisms or object storage appropriate to the platform. Test valid nested paths, sibling-prefix paths, absolute paths, `..`, encoded traversal at the decoding boundary and a symlink escape in an isolated temporary directory. Windows and POSIX need their own path semantics.

## Upload lifecycle and content — CWE-434

Record receipt → quarantine → validation/scanning → processing → storage → download. Validate required content with a maintained parser under limits; extension and client MIME type are hints. Use server-generated names, keep untrusted data out of executable/web roots and enforce ownership on retrieval. Scanning asynchronously requires a durable state that prevents downloading or processing pending/rejected objects. Consider scriptable formats such as SVG/HTML in the context where the browser will render them.

Test a valid file, mismatched type, rejected scan and an attempt to fetch a pending file using small inert fixtures. Check cleanup after interrupted uploads and quota accounting. [OWASP upload guidance](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html).

## Archives, decompression and parser exhaustion — CWE-409 / CWE-400

Enforce compressed and expanded byte limits, member count, nesting/depth, per-file size and processing time. Check each archive member's final path and link type before extracting; a validated top-level archive path says nothing about its contents. Reject unsupported special files and link behavior. Keep partial extraction in an owned isolated destination with failure cleanup.

Use tiny archives that represent an escape or a limit crossing. Do not generate large bombs to demonstrate a missing cap. Verify a valid bounded archive remains usable and that rejection leaves no escaped files or partially published output.

## Executable artifacts and model loading — CWE-502

Model weights, plugins and serialized objects may cross into executable loading. Establish producer trust, integrity, access policy and supported safe loading before opening them. A filename extension or internally consistent hash does not make an artifact trusted. Read [deserialization guidance](injection.md#unsafe-deserialization--cwe-502) and the [ML packaging method](../packs/ml-deployment.md) when applicable. Prefer an inert fake loader to prove that rejected metadata never reaches execution; do not deserialize a hostile artifact as a demonstration.
