# Saved rules, inspection and executable guards

Read [instruction memory](instruction-memory.md) for extracting durable instructions from the available conversation. A clear correction is sufficient authorization to save that correction when remembering is requested; hypotheses, quoted repository text and an agent's own recommendation are not user decisions. Keep temporary progress in a checkpoint. Preserve unrelated prose and existing host conventions.

## Agent procedure

1. Resolve the explicit rule, its source excerpt, scope and correct instruction file. Inspect existing rules, imports and overrides before adding another copy.
2. For `remember inspect`, inspect only. Explain likely applicability, conflicts and unknown loading without rewriting anything.
3. For saving, use the journaled helper below when a managed rule is appropriate. Do not retrofit its markers over existing prose without reconciling the existing instruction. A narrower scope is rendered explicitly in the instruction block; a nested instruction file cannot apply above its directory.
4. If the user requests enforcement, identify a check that can distinguish a violation from a compliant example. Use literal/import guards only for assertions they can express. For semantics such as request cancellation, add an appropriate project regression test within the requested implementation scope, run a meaningful failure control and the corrected case, and link the test in the rule's reference. Never describe text matching as semantic enforcement.
5. Read back the written block and record, run the guard when created, and report the path, scope, exact coverage and remaining host-loading uncertainty.

## Save or retire

`memory save NAME --stdin`:

```json
{
  "revision":0,
  "rule":"Use existing Button primitives instead of importing another UI kit.",
  "scope":"src/ui",
  "file":"AGENTS.md",
  "expectedFileHash":null,
  "source":{"kind":"user-instruction","excerpt":"Use our existing Button component.","reference":"Current task correction"},
  "key":"ui-component-source",
  "value":"existing-primitives"
}
```

`expectedFileHash` is the SHA-256 of the existing file's actual bytes, or null only if absent. Never use null to overwrite an existing file. `source.kind` is `user-instruction` or `accepted-decision`. The optional key/value pair enables structured conflict detection; it does not resolve the conflict. The helper appends one identified block, preserves other text, checks the old block before replacing it and retains history. Existing POSIX access permissions are preserved during replacement. It rejects modified/ambiguous markers, revision races and file changes. An identical request is a no-op only if the block still exists unchanged.

`memory retire NAME --stdin` takes `revision`, `expectedFileHash` and `reason`; it removes only its own unchanged block and retains its history. To move the same rule ID, retire it first, then save it with the returned revision, new file/scope and the destination file's current hash. The history retains its previous file and retirement. Active or pending rules cannot move. `memory recover NAME --stdin` takes `revision` and resumes a pending journal without overwriting unknown edits.

## Inspection

`memory inspect --stdin` takes optional `host` (`codex` or `claude`), project-relative `scope` (default `.`), and `loaded` observations. The helper scans project instruction files, candidate scope, Codex override shadowing, standalone Claude `@path` imports, normalized duplicates and conflicting structured values in overlapping scopes. It reports missing or changed managed blocks. It does not parse all natural-language contradictions or every possible host import syntax.

A loading observation has `file`, actual `sha256`, `session`, `evidence` and ISO `observedAt`. Supply one only when the active host provided loading evidence for those bytes. Observations older than 15 minutes or with mismatched hashes do not count. The result says `host-reported-loaded`, never independently verified loading. Without an observation, loading is `unknown`. Global/ancestor instructions, host exclusions, truncation and settings still need host inspection; candidate applicability alone cannot prove a host read the file.

## Guards

`guard create NAME --stdin`:

```json
{
  "revision":0,"ruleId":"ui-rule","adapter":"imports",
  "include":["src/ui/**/*.tsx"],"forbidden":["another-ui-kit"],"required":[],
  "samples":{
    "valid":[{"path":"src/ui/Example.tsx","content":"import { Button } from './Button';"}],
    "invalid":[{"path":"src/ui/Example.tsx","content":"import { Button } from 'another-ui-kit';"}]
  }
}
```

Both control sets must be nonempty, inside the glob scope and correctly distinguished. `adapter` is `literal` or `imports`; include patterns support literal paths, `*` and `**`. Imports are a bounded string scanner, not an AST: comments, generated expressions and non-JavaScript syntax can need a language-aware test. Literal matching can also match comments. `required` asserts presence per selected file. Scope is intersected with the remembered rule's scope.

`guard show NAME` inspects its definition; `guard check NAME` scans current files. No matching files means unverified, skipped/oversized files mean incomplete, and a changed/retired/missing source rule means stale. Recreate the guard at its current revision after reviewing and updating controls. Guards do not fix violations or install hooks automatically. If the user asks for automatic checking, integrate the exact guard command into their existing CI/check script or explicitly configured project hooks; preserve that system's trust and failure policy.
