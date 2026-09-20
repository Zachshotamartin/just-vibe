import { existsSync, mkdirSync, writeFileSync, realpathSync } from "node:fs";
import { resolve, join } from "node:path";
import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { fileURLToPath } from "node:url";
import {
  object,
  text,
  name,
  within,
  git,
  repoIdentity,
  fileSet,
  writeState,
  same,
  changed,
  fromBytes,
  readRecord,
  saveRecord,
  expectRevision,
  locked,
  argv,
  checkCommand,
  identities,
  reportPage,
  escapeHtml,
  now,
  readJson,
  stableJson,
} from "./workbench.mjs";
import { fingerprint, compareSnapshot, privateName } from "./storage.mjs";
import { applyOwnedTask, recoverOwnedTask } from "./tasks.mjs";

export function deltaPaths(root, head) {
  const paths = [
    ...new Set(
      [
        ...git(root, ["diff", "--name-only", "-z", head, "--"]).split("\0"),
        ...git(root, [
          "ls-files",
          "--others",
          "--exclude-standard",
          "-z",
        ]).split("\0"),
      ].filter(Boolean),
    ),
  ];
  return paths
    .filter(
      (p) =>
        !p
          .split("/")
          .some(
            (s) =>
              [".just-vibe", "node_modules", ".tmp", "dist", "build"].includes(
                s,
              ) || privateName(s),
          ),
    )
    .sort();
}
export function baseProject(root, extraPaths = []) {
  const repo = repoIdentity(root),
    paths = [...new Set([...deltaPaths(root, repo.head), ...extraPaths])],
    overlay = fileSet(root, paths);
  const index = git(root, ["ls-files", "--stage", "-z"]);
  if (index.split("\0").some((s) => s && !/^\d+ [a-f0-9]+ 0\t/.test(s)))
    throw Error("Resolve the conflicted Git index before creating workspaces.");
  return { repo, overlay, index };
}
export function assertWorkspace(root, record, variant) {
  const prefix =
    record.collection === "labs"
      ? "lab"
      : record.collection === "practice"
        ? "practice"
        : null;
  if (
    !prefix ||
    variant.path !==
      `.just-vibe/workspaces/${prefix}-${name(record.id)}-${name(variant.id)}`
  )
    throw Error("Workspace path does not belong to this record.");
  const path = within(root, variant.path),
    common = realpathSync(
      resolve(root, git(root, ["rev-parse", "--git-common-dir"]).trim()),
    );
  const actual = realpathSync(
    resolve(path, git(path, ["rev-parse", "--git-common-dir"]).trim()),
  );
  if (
    actual !== common ||
    git(path, ["rev-parse", "HEAD"]).trim() !== record.base.repo.head
  )
    throw Error("Workspace identity or revision changed; inspect manually.");
  return path;
}
export function createWorkspace(root, record, variant) {
  const path = within(root, variant.path);
  if (existsSync(path))
    throw Error(`Workspace already exists: ${variant.path}`);
  mkdirSync(join(path, ".."), { recursive: true });
  git(root, ["worktree", "add", "--detach", path, record.base.repo.head]);
  // Preserve current source edits without committing or modifying the user's index.
  for (const [p, state] of Object.entries(record.base.overlay))
    writeState(path, p, state);
  return path;
}
function initialFile(root, record, path) {
  if (Object.hasOwn(record.base.overlay, path))
    return record.base.overlay[path];
  const tree = git(root, ["ls-tree", record.base.repo.head, "--", path]).trim();
  if (!tree) return null;
  if (!/^100(?:644|755) blob /.test(tree))
    throw Error(`Only regular files can be selected: ${path}`);
  return fromBytes(
    git(root, ["show", `${record.base.repo.head}:${path}`], { encoding: null }),
    tree.startsWith("100755"),
  );
}
export function workspaceStatus(root, record) {
  return record.variants.map((v) => {
    if (!existsSync(within(root, v.path)))
      return { ...v, exists: false, preview: null, checks: null };
    const path = assertWorkspace(root, record, v),
      candidates = [
        ...new Set([
          ...deltaPaths(path, record.base.repo.head),
          ...Object.keys(record.base.overlay),
        ]),
      ],
      allFiles = fileSet(path, candidates),
      paths = candidates.filter(
        (p) => !same(initialFile(root, record, p), allFiles[p]),
      ),
      files = Object.fromEntries(paths.map((p) => [p, allFiles[p]])),
      snapshot = fingerprint(path),
      freshness = v.checks
        ? compareSnapshot(v.checks.snapshot, snapshot)
        : null;
    return {
      ...v,
      exists: true,
      files: identities(files),
      snapshot,
      changes: paths,
      preview: v.preview ? previewStatus(root, v.preview) : null,
      checks: v.checks
        ? {
            ...v.checks,
            ...freshness,
            result: freshness.stale ? "stale" : v.checks.result,
          }
        : null,
    };
  });
}
export function validateChecks(checks) {
  if (!Array.isArray(checks) || !checks.length || checks.length > 8)
    throw Error("Provide 1–8 shared checks.");
  const ids = new Set();
  for (const c of checks) {
    object(c, ["id", "command", "timeoutMs"]);
    name(c.id);
    argv(c.command);
    if (ids.has(c.id)) throw Error("Duplicate check id.");
    ids.add(c.id);
    if (
      c.timeoutMs !== undefined &&
      (!Number.isInteger(c.timeoutMs) ||
        c.timeoutMs < 1 ||
        c.timeoutMs > 120000)
    )
      throw Error("Check timeout must be 1–120000 ms.");
  }
}
export async function runChecks(path, checks) {
  const before = fingerprint(path),
    results = [];
  for (const check of checks)
    results.push({
      id: check.id,
      ...(await checkCommand(path, check.command, check.timeoutMs ?? 15000)),
    });
  const snapshot = fingerprint(path),
    stale = compareSnapshot(before, snapshot).stale;
  return {
    snapshot,
    results,
    result: stale
      ? "stale"
      : results.every((r) => r.result === "passed")
        ? "passed"
        : "failed",
    observedAt: now(),
  };
}
function validatePreview(preview) {
  if (
    !/^[a-f0-9-]{36}$/.test(preview.token) ||
    preview.directory !== `.just-vibe/previews/${preview.token}` ||
    !/^http:\/\/127\.0\.0\.1:[0-9]{1,5}$/.test(preview.url)
  )
    throw Error("Invalid preview identity.");
}
export function previewStatus(root, preview) {
  validatePreview(preview);
  try {
    const result = readJson(within(root, `${preview.directory}/status.json`));
    if (result.token !== preview.token)
      throw Error("Preview identity mismatch.");
    return {
      ...result,
      url: preview.url,
      stale: Date.now() - Date.parse(result.updatedAt) > 5000,
    };
  } catch {
    return { state: "unknown", url: preview.url, stale: true };
  }
}
export async function startPreview(root, path, command, minutes = 15) {
  argv(command);
  if (!Number.isInteger(minutes) || minutes < 1 || minutes > 60)
    throw Error("Preview lease must be 1–60 minutes.");
  if (!command.some((a) => a.includes("{port}")))
    throw Error("Preview command must include a literal {port} placeholder.");
  const server = createServer();
  await new Promise((ok, fail) => {
    server.once("error", fail);
    server.listen(0, "127.0.0.1", ok);
  });
  const port = server.address().port;
  await new Promise((ok) => server.close(ok));
  const token = randomUUID(),
    directory = `.just-vibe/previews/${token}`,
    full = within(root, directory);
  mkdirSync(full, { recursive: true });
  const url = `http://127.0.0.1:${port}`,
    config = {
      token,
      cwd: path,
      command: command.map((a) => a.replaceAll("{port}", String(port))),
      port,
      minutes,
    };
  writeFileSync(join(full, "config.json"), JSON.stringify(config), {
    mode: 0o600,
  });
  const worker = spawn(
    process.execPath,
    [
      fileURLToPath(new URL("../preview-worker.mjs", import.meta.url)),
      join(full, "config.json"),
    ],
    { detached: true, stdio: "ignore", env: process.env },
  );
  await new Promise((ok, fail) => {
    worker.once("spawn", ok);
    worker.once("error", fail);
  });
  worker.unref();
  return {
    token,
    directory,
    url,
    expiresAt: new Date(Date.now() + minutes * 60000).toISOString(),
  };
}
export async function stopPreview(root, preview) {
  if (!preview) return;
  validatePreview(preview);
  writeFileSync(within(root, `${preview.directory}/stop`), preview.token, {
    mode: 0o600,
  });
  for (let n = 0; n < 30; n++) {
    const s = previewStatus(root, preview);
    if (["stopped", "exited", "failed"].includes(s.state)) return;
    if (s.stale && n > 20)
      throw Error(
        "Preview worker is unresponsive; inspect its process before removing the workspace.",
      );
    await new Promise((r) => setTimeout(r, 100));
  }
  throw Error("Preview has not stopped; retry status before cleanup.");
}
function cleanupCoverage(path, head) {
  const excluded = git(path, [
    "ls-files",
    "--others",
    "--ignored",
    "--exclude-standard",
    "-z",
  ])
    .split("\0")
    .filter(Boolean)
    .filter(
      (p) =>
        !p
          .split("/")
          .some((s) =>
            [
              "node_modules",
              ".venv",
              "venv",
              "dist",
              "build",
              "coverage",
              ".next",
              ".tmp",
              ".cache",
            ].includes(s),
          ),
    );
  const represented = new Set(deltaPaths(path, head));
  const omitted = git(path, ["diff", "--name-only", "-z", head, "--"])
    .split("\0")
    .filter((p) => p && !represented.has(p));
  if (excluded.length || omitted.length)
    throw Error(
      "Workspace contains ignored/private changes outside cleanup coverage; preserve them manually before cleanup.",
    );
}
export async function cleanupWorkspaces(root, record, expected) {
  if (!expected || typeof expected !== "object" || Array.isArray(expected))
    throw Error(
      "Provide expected snapshot content hashes from status for every existing workspace.",
    );
  const states = workspaceStatus(root, record);
  for (const s of states.filter((s) => s.exists))
    if (expected[s.id] !== s.snapshot.content || s.snapshot.partial)
      throw Error(`Workspace changed or incomplete coverage: ${s.id}`);
  for (const v of record.variants)
    if (v.preview) await stopPreview(root, v.preview);
  for (const s of states.filter((s) => s.exists)) {
    const path = assertWorkspace(root, record, s),
      current = fingerprint(path);
    cleanupCoverage(path, record.base.repo.head);
    if (current.content !== expected[s.id] || current.partial)
      throw Error("Workspace changed during cleanup.");
    git(root, ["worktree", "remove", "--force", path]);
  }
}
export function labReport(root, record) {
  const states = workspaceStatus(root, record),
    path = within(root, `.just-vibe/reports/lab-${record.id}.html`);
  mkdirSync(join(path, ".."), { recursive: true });
  const sections = states
    .map(
      (v) =>
        `<section><h2>${escapeHtml(v.id)}</h2><p>${escapeHtml(v.brief)}</p>${v.preview ? `<p>Preview: <a href="${escapeHtml(v.preview.url)}">${escapeHtml(v.preview.url)}</a> (${escapeHtml(v.preview.state)})</p>` : ""}<p>Checks: <strong>${escapeHtml(v.checks?.result || "not run")}</strong> · ${(v.changes || []).length} changed files</p><ul>${(v.changes || []).map((p) => `<li>${escapeHtml(p)}</li>`).join("")}</ul><details><summary>Check output and source identity</summary><pre>${escapeHtml(JSON.stringify({ changes: v.changes, checks: v.checks }, null, 2))}</pre></details></section>`,
    )
    .join("");
  writeFileSync(
    path,
    reportPage(
      record.title,
      `<p>Working alternatives from ${escapeHtml(record.base.repo.head)}. Choose using the same requirements and your judgment; checks do not score design taste.</p>${sections}`,
    ),
    { mode: 0o600 },
  );
  return { path, variants: states };
}
function resumeSelection(root, r) {
  const s = r.selection;
  if (r.status !== "selecting" || !s) throw Error("No interrupted selection.");
  let task = readRecord(root, "tasks", s.task, true);
  if (task) {
    if (
      task.purpose !== s.purpose ||
      stableJson(task.before) !== stableJson(s.before) ||
      stableJson(task.after) !== stableJson(s.after)
    )
      throw Error("Selection task identity changed.");
    if (task.pending) task = recoverOwnedTask(root, task);
    if (task.status !== "captured")
      throw Error("Selection task already changed; reconcile it manually.");
  } else {
    const repo = repoIdentity(root);
    if (
      repo.head !== r.base.repo.head ||
      repo.branch !== r.base.repo.branch ||
      git(root, ["ls-files", "--stage", "-z"]) !== s.index
    )
      throw Error("Git identity changed during selection recovery.");
    task = applyOwnedTask(root, s.task, s.purpose, s.before, s.after);
  }
  const { selection: _, ...next } = r;
  return {
    ...saveRecord(
      root,
      "labs",
      r.id,
      { ...next, status: "selected", selected: s.variant, task: task.id },
      r.revision,
    ),
    undoTask: task,
  };
}
export async function labs(root, op, id, input = {}) {
  name(id);
  if (["show", "report"].includes(op)) {
    object(input, []);
    const r = readRecord(root, "labs", id);
    return op === "report"
      ? labReport(root, r)
      : { ...r, variants: workspaceStatus(root, r) };
  }
  return locked(root, async () => {
    let r = readRecord(root, "labs", id, true);
    expectRevision(r, input.revision);
    if (op === "create") {
      object(input, ["revision", "title", "variants", "checks"]);
      if (r) throw Error("Use a new lab name.");
      text(input.title);
      validateChecks(input.checks);
      if (
        !Array.isArray(input.variants) ||
        input.variants.length < 2 ||
        input.variants.length > 3
      )
        throw Error("Provide two or three variants.");
      const ids = new Set();
      const variants = input.variants.map((v) => {
        object(v, ["id", "brief"]);
        name(v.id);
        text(v.brief);
        if (ids.has(v.id)) throw Error("Duplicate variant.");
        ids.add(v.id);
        return { ...v, path: `.just-vibe/workspaces/lab-${id}-${v.id}` };
      });
      r = saveRecord(
        root,
        "labs",
        id,
        {
          title: input.title,
          base: baseProject(root),
          variants,
          checks: input.checks,
          status: "creating",
        },
        0,
      );
      for (const v of variants) createWorkspace(root, r, v);
      return saveRecord(
        root,
        "labs",
        id,
        { ...r, status: "active" },
        r.revision,
      );
    }
    if (!r) throw Error("Create the lab first.");
    const allowed = {
      recover: ["revision"],
      check: ["revision"],
      preview: ["revision", "variant", "command", "minutes"],
      stop: ["revision", "variant"],
      select: ["revision", "variant", "task"],
      cleanup: ["revision", "expected"],
    }[op];
    if (!allowed) throw Error(`Unknown lab operation: ${op}`);
    object(input, allowed);
    if (op === "recover") return resumeSelection(root, r);
    if (op === "cleanup" && r.status === "selecting")
      throw Error("Recover selection before cleaning its workspaces.");
    if (op === "cleanup") {
      await cleanupWorkspaces(root, r, input.expected);
      return saveRecord(
        root,
        "labs",
        id,
        { ...r, status: "cleaned" },
        r.revision,
      );
    }
    if (
      r.status !== "active" &&
      !(["preview", "stop"].includes(op) && r.status === "selected")
    )
      throw Error(
        "Lab is not active; inspect and clean up interrupted creation before retrying with a new name.",
      );
    if (op === "check") {
      for (const v of r.variants)
        v.checks = await runChecks(assertWorkspace(root, r, v), r.checks);
      const saved = saveRecord(root, "labs", id, r, r.revision);
      return {
        ...saved,
        result: r.variants.some((v) => v.checks.result === "stale")
          ? "stale"
          : r.variants.every((v) => v.checks.result === "passed")
            ? "passed"
            : "failed",
      };
    }

    const v = r.variants.find((v) => v.id === input.variant);
    if (!v) throw Error("Unknown variant.");
    const path = assertWorkspace(root, r, v);
    if (op === "preview") {
      if (v.preview) await stopPreview(root, v.preview);
      v.preview = await startPreview(root, path, input.command, input.minutes);
      return saveRecord(root, "labs", id, r, r.revision);
    }
    if (op === "stop") {
      await stopPreview(root, v.preview);
      return saveRecord(root, "labs", id, r, r.revision);
    }
    if (op === "select") {
      name(input.task);
      const repo = repoIdentity(root);
      if (repo.head !== r.base.repo.head || repo.branch !== r.base.repo.branch)
        throw Error(
          "Original Git revision/branch changed; reconcile before selecting.",
        );
      if (
        !v.checks ||
        v.checks.result !== "passed" ||
        compareSnapshot(v.checks.snapshot, fingerprint(path)).stale
      )
        throw Error("Selected variant needs fresh passing shared checks.");
      const candidates = [
          ...new Set([
            ...deltaPaths(path, r.base.repo.head),
            ...Object.keys(r.base.overlay),
          ]),
        ],
        candidateAfter = fileSet(path, candidates),
        candidateBefore = Object.fromEntries(
          candidates.map((p) => [p, initialFile(root, r, p)]),
        ),
        paths = changed(candidateBefore, candidateAfter),
        before = Object.fromEntries(paths.map((p) => [p, candidateBefore[p]])),
        after = Object.fromEntries(paths.map((p) => [p, candidateAfter[p]]));
      if (changed(before, fileSet(root, paths)).length)
        throw Error(
          "Original files overlap the variant; reconcile before applying.",
        );
      const index = git(root, ["ls-files", "--stage", "-z"]);
      for (const p of paths) {
        const entry = (s) =>
          s
            .split("\0")
            .filter((v) => v.endsWith(`\t${p}`))
            .join("\0");
        if (entry(index) !== entry(r.base.index))
          throw Error("Original staged entries changed in the selected scope.");
      }
      if (!changed(before, after).length)
        throw Error(
          "Selected variant has no changes beyond the starting tree.",
        );
      if (readRecord(root, "tasks", input.task, true))
        throw Error("Use a new undo task name.");
      r = saveRecord(
        root,
        "labs",
        id,
        {
          ...r,
          status: "selecting",
          selection: {
            variant: v.id,
            task: input.task,
            purpose: `Selected ${id}/${v.id}: ${v.brief}`,
            before,
            after,
            index,
          },
        },
        r.revision,
      );
      return resumeSelection(root, r);
    }
  });
}
