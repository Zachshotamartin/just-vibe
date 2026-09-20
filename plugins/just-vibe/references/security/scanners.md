# Scanner selection and evidence

This is an executable workflow for the host agent using available tools. just-vibe does not bundle these scanners or a live advisory database. Do not claim they ran because this guide was read. Choose a scanner based on the actual ecosystem and review question; source tracing and business-logic tests remain necessary.

## Before execution

Resolve the exact project/revision and whether uncommitted files are included. Inspect installed tool version/help and the trusted local configuration first. Set time/output bounds and choose a private output location outside tracked source. Do not silently install a tool, fetch rule packs, submit source, enable a hosted service or run package scripts to make a capability available. Package advisories can send dependency metadata to a registry; use the configured registry and existing authorization, or explain the specific missing prerequisite.

Treat project scanner configs as untrusted until reviewed. Suppressions and excluded paths are part of coverage. Record their identity. Never interpolate project-controlled strings into shell source; use an argument-array execution API and capture the individual status/stdout/stderr.

## Available-tool recipes

These examples require checking the installed version, reviewed input and actual paths. Execute from the target project, not the plugin cache.

| Question | Example argv | Interpretation and limits |
|---|---|---|
| npm locked dependency advisories | `npm audit --json` | Sends a dependency audit request. Inspect structured findings and error fields; nonzero may mean vulnerabilities or operational failure. Do not append `fix` during inspection. |
| Existing pinned Python requirements | `pip-audit --requirement requirements-audit.txt --no-deps --disable-pip --format json` | Input must already list the complete resolved dependency set in a supported form. Skipping resolution cannot establish omitted transitive coverage. No `--fix`. |
| Source patterns with reviewed local rules | `semgrep scan --config /absolute/reviewed-rules.yml --metrics=off --disable-version-check --json --output /private/report.json .` | Inspect both results and errors plus skipped/unsupported files. Default exit success does not mean zero findings. Local rules avoid implicitly fetching registry configurations. |
| Scoped working files for secrets | `gitleaks dir --redact=100 --report-format json --report-path /private/report.json .` | Redaction is required; verify installed command support and inspect report handling without printing matching values. |
| Authorized Git-history secret review | `gitleaks git --redact=100 --report-format json --report-path /private/history.json .` | History scope is distinct from working files; inspect configured log range and ignore rules. |
| Existing CodeQL or hosted scanner result | Read the existing check/SARIF for the exact head via available tooling | Confirm analyzed revision, language/database build, rule suite and completion. Reading a result does not authorize provisioning or uploading code. |

For pnpm, Yarn, Cargo, Go, JVM and container projects, use the project's installed native audit mechanism or existing scanner integration and its current help. Do not run npm against a different ecosystem's lockfile and call coverage complete. Advisory matching cannot identify arbitrary new logic flaws.

Tool references: [npm audit](https://docs.npmjs.com/cli/v11/commands/npm-audit/), [pip-audit](https://github.com/pypa/pip-audit), [Semgrep CLI](https://docs.semgrep.dev/cli-reference), [Gitleaks](https://github.com/gitleaks/gitleaks). Consult current releases/support when selecting a tool; these recipes are not an instruction to install a particular product.

## Classify every run

Record tool/version, exact argv with secret values omitted, root/revision or working-tree identity, input/config identity, start/end, exit status, timeout/truncation, analyzed/skipped scope and redacted report path. Choose one of:

- **Completed with findings:** the requested analysis finished and returned candidates; triage reachability, existing controls, affected versions and legitimate controls.
- **Completed without findings in analyzed scope:** supported inputs were analyzed without findings. State exclusions and that this does not prove absence of vulnerabilities.
- **Partial:** some files/ecosystems/advisory sources failed or were skipped; preserve findings from completed portions and name missing coverage.
- **Unavailable/failed:** missing tool, unsupported input, parse/network/auth failure, timeout or truncated report. Never convert this to a clean scan.

Keep tool severity separate from application impact until prerequisites and deployed paths are checked. For a dependency fix, verify the new resolved version and relevant compatibility behavior, then rerun the affected available check. For a source fix, reproduce the original path with an isolated regression and a valid control; do not merely add a suppression.

## Repeatable checks

Use a tiny known finding and a benign control with the exact rule/config version before relying on a new integration. Include malformed reports and failed/offline runs in the integration's tests. Preserve exact evidence using the existing proof/check facilities when requested. Hook execution remains opt-in and tied to reviewed argv/config trust; merely adding this guidance does not enable hooks or background scans.
