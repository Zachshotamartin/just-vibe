import { readdirSync } from "node:fs";
import { join, relative, dirname, resolve, sep } from "node:path";
import {
  object,
  text,
  name,
  strings,
  safePath,
  within,
  fileState,
  fromText,
  inheritMode,
  readRecord,
  saveRecord,
  listRecords,
  expectRevision,
  locked,
  applyTransaction,
  recoverTransaction,
  now,
} from "./workbench.mjs";
import { privateName } from "./storage.mjs";

const instructionName = /^(?:AGENTS(?:\.override)?|CLAUDE(?:\.local)?)\.md$/;
const normalize = (s) => s.trim().replace(/\s+/g, " ").toLowerCase();
export function walkFiles(root) {
  const files = [],
    issues = [];
  let count = 0;
  function walk(path) {
    for (const entry of readdirSync(path, { withFileTypes: true }).sort(
      (a, b) => a.name.localeCompare(b.name),
    )) {
      if (++count > 10000) {
        issues.push("File scan exceeded 10000 entries.");
        return;
      }
      if (
        [
          ".git",
          ".just-vibe",
          "node_modules",
          ".venv",
          "venv",
          "dist",
          "build",
          "coverage",
          ".next",
          ".tmp",
          ".cache",
        ].includes(entry.name) ||
        privateName(entry.name)
      )
        continue;
      const full = join(path, entry.name),
        p = relative(root, full).split("\\").join("/");
      if (entry.isSymbolicLink()) {
        issues.push(`Skipped symlink: ${p}`);
        continue;
      }
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile()) files.push(p);
    }
  }
  walk(root);
  return { files, issues };
}
function source(value) {
  object(value, ["kind", "excerpt", "reference"]);
  if (!["user-instruction", "accepted-decision"].includes(value.kind))
    throw Error(
      "Memory requires an explicit user instruction or accepted decision.",
    );
  text(value.excerpt, "source excerpt", 4000);
  if (value.reference !== undefined) text(value.reference, "reference", 1000);
  return value;
}
function block(id, rule) {
  return `<!-- just-vibe:rule:${id}:start -->\n${rule}\n<!-- just-vibe:rule:${id}:end -->`;
}
function editedText(id, previous, original, nextRule) {
  if (previous?.status === "active") {
    const old = block(id, previous.renderedRule || previous.rule),
      parts = original.split(old);
    if (parts.length !== 2)
      throw Error(
        "The saved rule was edited or its markers are ambiguous; inspect and reconcile it first.",
      );
    return parts.join(nextRule === null ? "" : block(id, nextRule));
  }
  if (original.includes(`just-vibe:rule:${id}:`))
    throw Error("A rule marker already exists without matching provenance.");
  return `${original}${original && !original.endsWith("\n") ? "\n" : ""}${original ? "\n" : ""}${block(id, nextRule)}\n`;
}
function validateFile(file) {
  if (!instructionName.test(file.split("/").at(-1)))
    throw Error(
      "Choose an AGENTS.md/AGENTS.override.md or CLAUDE.md/CLAUDE.local.md instruction file.",
    );
}
export async function memory(root, op, id, input = {}) {
  if (op === "inspect") return inspectMemory(root, input);
  name(id);
  return locked(root, async () => {
    const previous = readRecord(root, "memory", id, true);
    if (op === "recover") {
      object(input, ["revision"]);
      expectRevision(previous, input.revision);
      if (!previous) throw Error("No memory record.");
      return recoverTransaction(root, previous);
    }
    object(
      input,
      op === "save"
        ? [
            "revision",
            "rule",
            "source",
            "scope",
            "file",
            "expectedFileHash",
            "key",
            "value",
          ]
        : ["revision", "expectedFileHash", "reason"],
    );
    expectRevision(previous, input.revision);
    if (previous?.pending)
      throw Error("Recover the pending memory edit first.");
    if (!["save", "retire"].includes(op))
      throw Error(`Unknown memory operation: ${op}`);
    if (op === "retire" && previous?.status !== "active")
      throw Error("Only active rules can be retired.");
    const file =
      op === "save" ? text(input.file, "instruction file", 500) : previous.file;
    validateFile(file);
    safePath(root, file);
    if (previous?.status === "active" && previous.file !== file)
      throw Error("Retire the old rule before moving it to another file.");
    const before = fileState(root, file);
    if (input.expectedFileHash !== (before?.sha256 ?? null))
      throw Error(
        "Instruction file changed; supply its current SHA-256 (null for a new file).",
      );
    let next;
    if (op === "save") {
      text(input.rule, "rule", 4000);
      source(input.source);
      if (/<!--\s*just-vibe:/.test(input.rule))
        throw Error("Rule text cannot contain managed markers.");
      const scope = input.scope || ".";
      if (scope !== ".") safePath(root, scope);
      const directory = dirname(file).split("\\").join("/");
      if (
        directory !== "." &&
        scope !== directory &&
        !scope.startsWith(directory + "/")
      )
        throw Error(
          "Rule scope must fall within the instruction file directory.",
        );
      const renderedRule =
        scope === "."
          ? input.rule
          : `Applies only to project-relative scope: ${scope}.\n\n${input.rule}`;
      if ((input.key === undefined) !== (input.value === undefined))
        throw Error("Provide key and value together for conflict detection.");
      if (input.key !== undefined) {
        name(input.key);
        text(input.value, "value", 500);
      }
      if (
        previous?.status === "active" &&
        previous.rule === input.rule &&
        previous.scope === scope &&
        JSON.stringify(previous.source) === JSON.stringify(input.source) &&
        previous.key === input.key &&
        previous.value === input.value
      ) {
        const body = before
          ? Buffer.from(before.data, "base64").toString("utf8")
          : "";
        if (!body.includes(block(id, previous.renderedRule || previous.rule)))
          throw Error(
            "The saved rule is missing or edited; reconcile before saving.",
          );
        return { ...previous, unchanged: true };
      }
      next = {
        rule: input.rule,
        renderedRule,
        source: input.source,
        scope,
        file,
        status: "active",
        ...(input.key ? { key: input.key, value: input.value } : {}),
      };
    } else {
      text(input.reason, "retirement reason");
      next = { ...previous, status: "retired", retiredReason: input.reason };
    }
    const original = before
      ? Buffer.from(before.data, "base64").toString("utf8")
      : "";
    const after = inheritMode(
      fromText(
        editedText(
          id,
          previous,
          original,
          op === "retire" ? null : next.renderedRule,
        ),
        before?.executable || false,
      ),
      before,
    );
    const history = [
      ...(previous?.history || []),
      ...(previous
        ? [
            {
              rule: previous.rule,
              source: previous.source,
              scope: previous.scope,
              file: previous.file,
              status: previous.status,
              revision: previous.revision,
              replacedAt: now(),
            },
          ]
        : []),
    ];
    if (history.length > 100)
      throw Error("Rule history reached 100 revisions; archive it explicitly.");
    const state = {
      ...(previous || {}),
      collection: "memory",
      id,
      revision: input.revision,
      status: previous?.status || "pending",
    };
    return applyTransaction(
      root,
      state,
      { [file]: before },
      { [file]: after },
      { ...next, history, fileHash: after.sha256 },
    );
  });
}
export function inspectMemory(root, input = {}) {
  object(input, ["host", "scope", "loaded"]);
  const host = input.host || "codex",
    scope = input.scope || ".";
  if (!["codex", "claude"].includes(host))
    throw Error("host must be codex or claude.");
  const target = scope === "." ? resolve(root) : safePath(root, scope);
  const loaded = input.loaded || [];
  if (!Array.isArray(loaded) || loaded.length > 100)
    throw Error("Invalid loading observations.");
  for (const o of loaded) {
    object(o, ["file", "sha256", "session", "evidence", "observedAt"]);
    text(o.session);
    text(o.evidence);
    safePath(root, o.file);
    if (
      !/^[a-f0-9]{64}$/.test(o.sha256) ||
      !Number.isFinite(Date.parse(o.observedAt))
    )
      throw Error("Loading observation needs a SHA-256 and time.");
  }
  const scan = walkFiles(root),
    files = [],
    diagnostics = [...scan.issues],
    contents = new Map();
  for (const file of scan.files.filter((p) =>
    instructionName.test(p.split("/").at(-1)),
  )) {
    try {
      const state = fileState(root, file),
        body = Buffer.from(state.data, "base64").toString("utf8");
      contents.set(file, body);
      const directory = dirname(resolve(root, file)),
        applicable = target === directory || target.startsWith(directory + sep);
      const observed = loaded.find(
        (o) =>
          o.file === file &&
          o.sha256 === state.sha256 &&
          Date.now() - Date.parse(o.observedAt) >= 0 &&
          Date.now() - Date.parse(o.observedAt) <= 15 * 60 * 1000,
      );
      files.push({
        file,
        sha256: state.sha256,
        lines: body.split("\n").length,
        applicable,
        loading: observed ? "host-reported-loaded" : "unknown",
        observation: observed || null,
      });
    } catch (error) {
      diagnostics.push(`${file}: ${error.message}`);
    }
  }
  const candidates = files.filter((f) => f.applicable);
  for (const f of files) {
    f.candidate =
      f.applicable &&
      (host === "claude"
        ? /CLAUDE(?:\.local)?\.md$/.test(f.file)
        : /AGENTS(?:\.override)?\.md$/.test(f.file));
    if (host === "codex" && f.file.endsWith("AGENTS.md")) {
      const override = f.file.replace(/AGENTS\.md$/, "AGENTS.override.md");
      if (contents.get(override)?.trim()) {
        f.candidate = false;
        f.shadowedBy = override;
      }
    }
  }
  const imports = [],
    visit = (file, chain = []) => {
      if (chain.includes(file) || chain.length > 4) {
        diagnostics.push(
          `Import cycle/depth limit: ${[...chain, file].join(" -> ")}`,
        );
        return;
      }
      let fenced = false;
      for (const line of (contents.get(file) || "").split("\n")) {
        if (/^\s*(?:```|~~~)/.test(line)) {
          fenced = !fenced;
          continue;
        }
        if (fenced || !/^@\S+\s*$/.test(line)) continue;
        const p = relative(
          root,
          resolve(root, dirname(file), line.trim().slice(1)),
        )
          .split("\\")
          .join("/");
        try {
          safePath(root, p);
          if (!contents.has(p)) {
            const state = fileState(root, p);
            if (!state) throw Error("missing import");
            contents.set(p, Buffer.from(state.data, "base64").toString("utf8"));
          }
          imports.push({ from: file, to: p, candidate: host === "claude" });
          visit(p, [...chain, file]);
        } catch (error) {
          diagnostics.push(`${file}: unresolved import ${p}: ${error.message}`);
        }
      }
    };
  candidates.filter((f) => f.candidate).forEach((f) => visit(f.file));
  const rules = listRecords(root, "memory").map((id) => {
    const rule = readRecord(root, "memory", id),
      body = contents.get(rule.file);
    return {
      ...rule,
      persisted:
        rule.status === "active" &&
        !!body?.includes(block(id, rule.renderedRule || rule.rule)),
      applicable:
        rule.scope === "." ||
        scope === rule.scope ||
        scope.startsWith(`${rule.scope}/`),
      loading: files.find((f) => f.file === rule.file)?.loading || "unknown",
    };
  });
  const duplicates = [],
    conflicts = [];
  for (let a = 0; a < rules.length; a++)
    for (let b = a + 1; b < rules.length; b++) {
      const x = rules[a],
        y = rules[b];
      if (x.status !== "active" || y.status !== "active") continue;
      if (normalize(x.rule) === normalize(y.rule))
        duplicates.push([x.id, y.id]);
      const overlap =
        x.scope === "." ||
        y.scope === "." ||
        x.scope === y.scope ||
        x.scope.startsWith(y.scope + "/") ||
        y.scope.startsWith(x.scope + "/");
      if (
        overlap &&
        x.key &&
        x.key === y.key &&
        normalize(x.value) !== normalize(y.value)
      )
        conflicts.push({
          rules: [x.id, y.id],
          key: x.key,
          reason:
            "Different values in overlapping scopes; review precedence and user intent.",
        });
    }
  return {
    host,
    scope,
    files,
    imports,
    rules,
    duplicates,
    conflicts,
    diagnostics,
    result: diagnostics.length
      ? "incomplete"
      : conflicts.length
        ? "review-needed"
        : "inspected",
    limitation:
      "Project files only; global/ancestor settings and host exclusions are not inferred. Import discovery covers standalone @path lines. Unmanaged prose needs semantic review. Candidate loading is not observed loading; supplied observations remain host-reported.",
  };
}

export function glob(pattern) {
  text(pattern, "glob", 300);
  if (
    pattern.includes("..") ||
    pattern.includes("\\") ||
    pattern.startsWith("/") ||
    /[\[\]{}?]/.test(pattern)
  )
    throw Error("Globs support only literal paths, * and **.");
  let result = "^";
  for (let i = 0; i < pattern.length; i++) {
    if (pattern.slice(i, i + 3) === "**/") {
      result += "(?:.*/)?";
      i += 2;
    } else if (pattern.slice(i, i + 2) === "**") {
      result += ".*";
      i++;
    } else if (pattern[i] === "*") result += "[^/]*";
    else result += pattern[i].replace(/[.+^$()|\\]/g, "\\$&");
  }
  return new RegExp(result + "$");
}
function violations(config, content) {
  const values =
    config.adapter === "imports"
      ? [
          ...content.matchAll(
            /(?:\b(?:import|export)\s+(?:[^;\n]*?\sfrom\s*)?|\b(?:require|import)\s*\(\s*)["']([^"']+)["']/g,
          ),
        ].map((m) => m[1])
      : [content];
  return [
    ...config.forbidden
      .filter((v) =>
        values.some((s) =>
          config.adapter === "imports"
            ? s === v || s.startsWith(v + "/")
            : s.includes(v),
        ),
      )
      .map((v) => ({ kind: "forbidden", value: v })),
    ...config.required
      .filter(
        (v) =>
          !values.some((s) =>
            config.adapter === "imports" ? s === v : s.includes(v),
          ),
      )
      .map((v) => ({ kind: "required", value: v })),
  ];
}
export async function guards(root, op, id, input = {}) {
  name(id);
  if (op === "create")
    return locked(root, async () => {
      object(input, [
        "revision",
        "ruleId",
        "adapter",
        "include",
        "forbidden",
        "required",
        "samples",
      ]);
      const old = readRecord(root, "guards", id, true);
      expectRevision(old, input.revision);
      const rule = readRecord(root, "memory", name(input.ruleId));
      if (rule.status !== "active" || rule.pending)
        throw Error("Guard requires an active saved rule.");
      if (!["literal", "imports"].includes(input.adapter))
        throw Error("adapter must be literal or imports.");
      strings(input.include, "include", 20).forEach(glob);
      strings(input.forbidden || [], "forbidden", 30, true);
      strings(input.required || [], "required", 30, true);
      if (!(input.forbidden?.length || input.required?.length))
        throw Error("At least one assertion is required.");
      object(input.samples, ["valid", "invalid"]);
      const config = {
        ruleId: rule.id,
        ruleRevision: rule.revision,
        adapter: input.adapter,
        include: input.include,
        forbidden: input.forbidden || [],
        required: input.required || [],
      };
      for (const [type, samples] of Object.entries(input.samples)) {
        if (!Array.isArray(samples) || !samples.length || samples.length > 20)
          throw Error("Supply positive and negative samples.");
        for (const sample of samples) {
          object(sample, ["path", "content"]);
          safePath(root, sample.path);
          if (
            rule.scope !== "." &&
            sample.path !== rule.scope &&
            !sample.path.startsWith(rule.scope + "/")
          )
            throw Error("Every control must match the rule scope.");
          text(sample.content, "sample", 12000);
          if (!config.include.some((p) => glob(p).test(sample.path)))
            throw Error("Every control must match the scope.");
          if (
            !!violations(config, sample.content).length !==
            (type === "invalid")
          )
            throw Error(`Guard did not distinguish its ${type} control.`);
        }
      }
      if (!input.samples.valid || !input.samples.invalid)
        throw Error("Supply positive and negative samples.");
      return saveRecord(
        root,
        "guards",
        id,
        { ...config, controls: input.samples, controlsVerifiedAt: now() },
        input.revision,
      );
    });
  object(input, []);
  const guard = readRecord(root, "guards", id);
  if (op === "show") return guard;
  if (op !== "check") throw Error(`Unknown guard operation: ${op}`);
  const rule = readRecord(root, "memory", guard.ruleId);
  if (
    rule.status !== "active" ||
    rule.pending ||
    rule.revision !== guard.ruleRevision
  )
    return {
      result: "stale",
      reason: "The supporting rule changed; review and revalidate the guard.",
    };
  const persisted = fileState(root, rule.file);
  if (
    !persisted ||
    !Buffer.from(persisted.data, "base64")
      .toString("utf8")
      .includes(block(rule.id, rule.renderedRule || rule.rule))
  )
    return {
      result: "stale",
      reason: "The supporting instruction block is missing or edited.",
    };
  const scan = walkFiles(root),
    selected = scan.files.filter(
      (p) =>
        (rule.scope === "." ||
          p === rule.scope ||
          p.startsWith(rule.scope + "/")) &&
        guard.include.some((g) => glob(g).test(p)),
    ),
    findings = [],
    issues = [...scan.issues];
  for (const p of selected) {
    try {
      const s = fileState(root, p);
      const body = Buffer.from(s.data, "base64").toString("utf8");
      for (const v of violations(guard, body)) findings.push({ file: p, ...v });
    } catch (error) {
      issues.push(`${p}: ${error.message}`);
    }
  }
  return {
    result: issues.length
      ? "incomplete"
      : !selected.length
        ? "unverified"
        : findings.length
          ? "failed"
          : "passed",
    checked: selected,
    findings,
    issues,
    ruleId: rule.id,
    observedAt: now(),
    limitation:
      guard.adapter === "imports"
        ? "Static string import scanner, not a language parser or runtime dependency proof."
        : "Literal text assertions, not semantic enforcement.",
  };
}
