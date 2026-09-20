import { mkdirSync, writeFileSync, readFileSync, lstatSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import {
  object,
  text,
  name,
  strings,
  fileSet,
  identities,
  changed,
  safePath,
  readRecord,
  saveRecord,
  expectRevision,
  locked,
  now,
  checkCommand,
  digest,
  within,
  reportPage,
  escapeHtml,
} from "./workbench.mjs";
import { collectEvidence } from "./evidence.mjs";

function artifact(root, path) {
  const full = safePath(root, path, { managed: true }),
    s = lstatSync(full);
  if (!s.isFile() || s.size > 4 * 1024 * 1024)
    throw Error("Artifact must be a regular file up to 4 MiB.");
  return { path, sha256: digest(readFileSync(full)), bytes: s.size };
}
export function proofStatus(root, record) {
  const criteria = record.criteria.map((c) => {
    const evidence = [...record.evidence]
      .reverse()
      .find((e) => e.criterion === c.id);
    let currentFiles = null,
      currentError = null;
    try {
      currentFiles = identities(fileSet(root, c.files));
    } catch (error) {
      currentError = error.message;
    }
    if (!evidence)
      return { ...c, currentFiles, currentError, result: "missing" };
    let differences = currentError ? [currentError] : [];
    try {
      differences = changed(
        evidence.files,
        identities(fileSet(root, Object.keys(evidence.files))),
      );
    } catch (error) {
      differences.push(error.message);
    }
    for (const a of evidence.artifacts) {
      try {
        if (artifact(root, a.path).sha256 !== a.sha256)
          differences.push(a.path);
      } catch {
        differences.push(a.path);
      }
    }
    const expired =
      evidence.maxAgeMinutes !== null &&
      Date.now() - Date.parse(evidence.observedAt) >
        evidence.maxAgeMinutes * 60000;
    const result = differences.length || expired ? "stale" : evidence.result;
    return {
      ...c,
      currentFiles,
      currentError,
      result,
      evidence: { ...evidence, staleFiles: differences, expired },
    };
  });
  const result = criteria.every((c) =>
    ["passed", "accepted"].includes(c.result),
  )
    ? "verified"
    : criteria.some((c) => c.result === "failed" || c.result === "rejected")
      ? "failed"
      : criteria.some((c) => c.result === "stale")
        ? "stale"
        : "incomplete";
  return {
    id: record.id,
    revision: record.revision,
    title: record.title,
    result,
    criteria,
    observedAt: now(),
    limitation:
      "Evidence covers declared files, interactions and target identity only. Human acceptance is attributed, not independently authenticated. A report does not establish every user experience or unobserved environment.",
  };
}
export function writeProofReport(root, status) {
  const sections = status.criteria
    .map((c) => {
      const e = c.evidence;
      const pictures = (e?.artifacts || [])
        .filter((a) => a.path.endsWith(".png"))
        .map((a) => {
          try {
            if (artifact(root, a.path).sha256 !== a.sha256) return "";
            return `<figure><img alt="${escapeHtml(c.text)}" src="data:image/png;base64,${readFileSync(within(root, a.path)).toString("base64")}"><figcaption>${escapeHtml(a.path)}</figcaption></figure>`;
          } catch {
            return "";
          }
        })
        .filter(Boolean);
      const latest = pictures.at(-1) || "",
        earlier = pictures.slice(0, -1);
      const summary = e
        ? `<p>${escapeHtml(e.method === "attach" ? e.observation.summary : `${e.method === "run" ? "Local check" : "Evidence collection"} recorded ${e.observedAt}`)}</p><p>${Object.keys(e.files).length} declared files · ${escapeHtml(e.observation.result || e.result)}${e.expired ? " · observation expired" : ""}</p>${e.staleFiles.length ? `<p>Changed or unavailable: ${escapeHtml(e.staleFiles.join(", "))}</p>` : ""}`
        : "<p>No evidence recorded.</p>";
      return `<section><h2>${escapeHtml(c.text)}</h2><p><strong>${escapeHtml(c.result)}</strong> · ${escapeHtml(c.kind === "human" ? "Human review" : "Automated assertion")}</p>${summary}${latest}${earlier.length ? `<details><summary>Earlier captures (${earlier.length})</summary>${earlier.join("")}</details>` : ""}${e ? `<details><summary>Check output, identities and provenance</summary><pre>${escapeHtml(JSON.stringify(e, null, 2))}</pre></details>` : ""}</section>`;
    })
    .join("");
  const file = `.just-vibe/reports/proof-${name(status.id)}.html`,
    full = within(root, file);
  mkdirSync(join(full, ".."), { recursive: true });
  writeFileSync(
    full,
    reportPage(
      status.title,
      `<p>${escapeHtml(status.result)} · ${escapeHtml(status.observedAt)}</p><p>${escapeHtml(status.limitation)}</p>${sections}`,
    ),
    { mode: 0o600 },
  );
  return { path: full, ...status };
}
export async function proofs(root, op, id, input = {}) {
  name(id);
  if (["show", "report"].includes(op)) {
    object(input, []);
    const status = proofStatus(root, readRecord(root, "proofs", id));
    return op === "report" ? writeProofReport(root, status) : status;
  }
  return locked(root, async () => {
    const record = readRecord(root, "proofs", id, true);
    expectRevision(record, input.revision);
    if (op === "create") {
      object(input, ["revision", "title", "criteria"]);
      if (record) throw Error("Use a new proof name.");
      text(input.title);
      if (
        !Array.isArray(input.criteria) ||
        !input.criteria.length ||
        input.criteria.length > 30
      )
        throw Error("Provide 1–30 acceptance criteria.");
      const ids = new Set();
      for (const c of input.criteria) {
        object(c, ["id", "text", "kind", "files"]);
        name(c.id);
        text(c.text);
        if (ids.has(c.id) || !["automated", "human"].includes(c.kind))
          throw Error("Duplicate criterion or invalid kind.");
        ids.add(c.id);
        strings(c.files, "files", 100, true);
        fileSet(root, c.files);
      }
      return saveRecord(
        root,
        "proofs",
        id,
        { title: input.title, criteria: input.criteria, evidence: [] },
        0,
      );
    }
    if (!record) throw Error("Create the proof first.");
    const allowed = {
      run: ["revision", "criterion", "command", "timeoutMs"],
      collect: [
        "revision",
        "criterion",
        "collector",
        "options",
        "maxAgeMinutes",
      ],
      attach: [
        "revision",
        "criterion",
        "source",
        "summary",
        "artifacts",
        "observedAt",
        "verdict",
        "files",
      ],
    }[op];
    if (!allowed) throw Error(`Unknown proof operation: ${op}`);
    object(input, allowed);
    const criterion = record.criteria.find((c) => c.id === input.criterion);
    if (!criterion) throw Error("Unknown criterion.");
    const before = identities(fileSet(root, criterion.files));
    let observation,
      result,
      artifacts = [],
      maxAgeMinutes = null,
      observedAt = now();
    if (op === "run") {
      if (criterion.kind !== "automated")
        throw Error(
          "Human criteria need attributed acceptance, not command exit codes.",
        );
      observation = await checkCommand(
        root,
        input.command,
        input.timeoutMs ?? 15000,
      );
      result = observation.result;
    } else if (op === "collect") {
      if (criterion.kind !== "automated")
        throw Error("Collectors cannot accept a human-review criterion.");
      const allowedOptions = {
        github: ["repo", "pr"],
        vercel: ["deployment", "team"],
        browser: ["url", "steps", "screenshots"],
        migrations: ["directory", "applied"],
      }[input.collector];
      if (!allowedOptions) throw Error("Unknown evidence collector.");
      object(input.options, allowedOptions);
      const options = { ...input.options, root, scope: input.options.team };
      if (input.collector === "browser" && options.screenshots)
        options.artifactDirectory = `.just-vibe/proofs/${id}/artifacts/${randomUUID()}`;
      delete options.screenshots;
      maxAgeMinutes = input.maxAgeMinutes ?? 15;
      if (
        !Number.isFinite(maxAgeMinutes) ||
        maxAgeMinutes <= 0 ||
        maxAgeMinutes > 1440
      )
        throw Error("Evidence freshness must be 0–1440 minutes.");
      observation = await collectEvidence(input.collector, options);
      result =
        observation.result === "passed"
          ? "passed"
          : ["failed", "drift"].includes(observation.result)
            ? "failed"
            : "review-needed";
      artifacts = (observation.artifacts || []).map((a) => artifact(root, a));
    } else {
      text(input.source);
      text(input.summary);
      strings(input.artifacts || [], "artifacts", 10, true);
      if (
        !Number.isFinite(Date.parse(input.observedAt)) ||
        Date.parse(input.observedAt) > Date.now()
      )
        throw Error("Supply an actual, non-future observation time.");
      observedAt = input.observedAt;
      if (!["accepted", "rejected", "observed"].includes(input.verdict))
        throw Error("verdict must be accepted, rejected or observed.");
      if (criterion.kind === "automated" && input.verdict !== "observed")
        throw Error(
          "An attached claim cannot pass an automated criterion; run a check or collector.",
        );
      if (
        input.verdict !== "observed" &&
        (!input.files || changed(before, input.files).length)
      )
        throw Error(
          "Acceptance requires the exact file identities observed by the reviewer; read current criterion hashes and review those files first.",
        );
      observation = {
        source: input.source,
        summary: input.summary,
        reviewedFiles: input.files || null,
        attribution: "user-supplied observation",
      };
      result = input.verdict === "observed" ? "review-needed" : input.verdict;
      artifacts = (input.artifacts || []).map((p) => artifact(root, p));
    }
    const after = identities(fileSet(root, criterion.files)),
      mutations = changed(before, after);
    if (mutations.length) result = "stale";
    if (record.evidence.length >= 200)
      throw Error(
        "Proof history reached 200 observations; archive it explicitly.",
      );
    const evidence = {
      id: randomUUID(),
      criterion: criterion.id,
      observedAt,
      method: op,
      files: before,
      result,
      observation,
      artifacts,
      maxAgeMinutes,
      mutations,
    };
    const updated = saveRecord(
      root,
      "proofs",
      id,
      { ...record, evidence: [...record.evidence, evidence] },
      record.revision,
    );
    return proofStatus(root, updated);
  });
}
