import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  object,
  text,
  strings,
  revision,
  name,
  fileSet,
  same,
  changed,
  readRecord,
  saveRecord,
  expectRevision,
  locked,
  git,
  repoIdentity,
  digest,
  fromText,
  inheritMode,
  applyTransaction,
  recoverTransaction,
  identities,
} from "./workbench.mjs";

function indexFor(root, paths) {
  return digest(
    git(root, [
      "diff",
      "--cached",
      "--no-ext-diff",
      "--no-textconv",
      "--binary",
      "--",
      ...paths,
    ]),
  );
}
function inverseMerge(before, after, current, path) {
  if (same(after, current)) return before;
  if (same(before, after)) return current;
  if (!before || !after || !current)
    throw Error(`Later creation/deletion overlaps this task: ${path}`);
  const values = [current, after, before].map((s) =>
    Buffer.from(s.data, "base64"),
  );
  if (
    values.some(
      (b) => b.includes(0) || !Buffer.from(b.toString("utf8")).equals(b),
    )
  )
    throw Error(`Binary overlap requires manual recovery: ${path}`);
  let executable = current.executable;
  let mode = current.mode;
  if (before.mode !== undefined && after.mode !== undefined && before.mode !== after.mode) {
    if (current.mode !== after.mode)
      throw Error(`File permissions overlap this task: ${path}`);
    mode = before.mode;
  }
  if (before.executable !== after.executable) {
    if (current.executable !== after.executable)
      throw Error(`File mode overlaps this task: ${path}`);
    executable = before.executable;
  }
  const dir = mkdtempSync(join(tmpdir(), "jv-undo-"));
  try {
    const paths = values.map((v, i) => {
      const p = join(dir, String(i));
      writeFileSync(p, v);
      return p;
    });
    let output;
    try {
      output = git(dir, ["merge-file", "-p", ...paths]);
    } catch {
      throw Error(`Overlapping edits require manual resolution: ${path}`);
    }
    return inheritMode(fromText(output, executable), { mode });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
export function recoverOwnedTask(root, task) {
  if (task.pending) {
    const repo = repoIdentity(root);
    if (
      repo.head !== task.repo.head ||
      repo.branch !== task.repo.branch ||
      indexFor(root, Object.keys(task.after)) !== task.index
    )
      throw Error("Task Git identity or scoped index changed before recovery.");
  }
  return recoverTransaction(root, task);
}
export function undoPlan(root, task) {
  if (task.pending)
    throw Error("Recover the interrupted task transaction first.");
  if (task.status !== "captured")
    throw Error("Only a captured task can be undone.");
  const paths = Object.keys(task.after),
    repo = repoIdentity(root);
  if (repo.head !== task.repo.head || repo.branch !== task.repo.branch)
    throw Error(
      "Git revision/branch changed; review the task on its original revision before undo.",
    );
  if (indexFor(root, paths) !== task.index)
    throw Error(
      "Staged changes overlap the task scope; preserve the index and resolve explicitly.",
    );
  const current = fileSet(root, paths),
    desired = Object.create(null),
    conflicts = [];
  for (const p of paths) {
    try {
      desired[p] = inverseMerge(task.before[p], task.after[p], current[p], p);
    } catch (error) {
      conflicts.push({ path: p, reason: error.message });
    }
  }
  return {
    result: conflicts.length ? "conflict" : "ready",
    task: task.id,
    revision: task.revision,
    conflicts,
    changes: changed(current, desired).filter((p) => p in desired),
    externalEffects: task.externalEffects,
    current,
    desired,
  };
}
// Used by lab selection: records ownership before changing the original tree.
export function applyOwnedTask(
  root,
  id,
  purpose,
  before,
  after,
  externalEffects = [],
) {
  if (readRecord(root, "tasks", id, true))
    throw Error(`Task already exists: ${id}`);
  const task = {
    collection: "tasks",
    id,
    revision: 0,
    purpose,
    before,
    after,
    externalEffects,
    repo: repoIdentity(root),
    index: indexFor(root, Object.keys(after)),
    status: "prepared",
  };
  return applyTransaction(root, task, before, after, { status: "captured" });
}
export async function tasks(root, op, id, input = {}) {
  name(id);
  if (op === "show") {
    object(input, []);
    return readRecord(root, "tasks", id);
  }
  if (op === "preview") {
    object(input, []);
    const plan = undoPlan(root, readRecord(root, "tasks", id));
    const { current, desired, ...publicPlan } = plan;
    return {
      ...publicPlan,
      before: identities(current),
      after: identities(desired),
    };
  }
  return locked(root, async () => {
    if (op === "begin") {
      object(input, ["revision", "purpose", "paths", "externalEffects"]);
      const previous = readRecord(root, "tasks", id, true);
      expectRevision(previous, input.revision);
      if (previous) throw Error("Use a new task name.");
      strings(input.paths, "paths");
      strings(input.externalEffects || [], "externalEffects", 100, true);
      return saveRecord(
        root,
        "tasks",
        id,
        {
          purpose: text(input.purpose),
          before: fileSet(root, input.paths),
          repo: repoIdentity(root),
          index: indexFor(root, input.paths),
          status: "recording",
          externalEffects: input.externalEffects || [],
        },
        0,
      );
    }
    const task = readRecord(root, "tasks", id);
    object(
      input,
      op === "capture" ? ["revision", "externalEffects"] : ["revision"],
    );
    expectRevision(task, input.revision);
    if (op === "recover") return recoverOwnedTask(root, task);
    if (task.pending)
      throw Error("Recover the pending task transaction first.");
    if (op === "capture") {
      if (task.status !== "recording")
        throw Error("Only a recording task can be captured.");
      const repo = repoIdentity(root),
        paths = Object.keys(task.before);
      if (
        repo.head !== task.repo.head ||
        repo.branch !== task.repo.branch ||
        indexFor(root, paths) !== task.index
      )
        throw Error(
          "Task branch, revision or scoped index changed; review before capturing ownership.",
        );
      strings(input.externalEffects || [], "externalEffects", 100, true);
      return saveRecord(
        root,
        "tasks",
        id,
        {
          ...task,
          after: fileSet(root, paths),
          status: "captured",
          externalEffects: [
            ...task.externalEffects,
            ...(input.externalEffects || []),
          ],
        },
        task.revision,
      );
    }
    if (op === "undo") {
      const plan = undoPlan(root, task);
      if (plan.conflicts.length)
        return {
          result: "conflict",
          conflicts: plan.conflicts,
          externalEffects: plan.externalEffects,
        };
      return applyTransaction(root, task, plan.current, plan.desired, {
        status: "undone",
        undoneAt: new Date().toISOString(),
      });
    }
    throw Error(`Unknown task operation: ${op}`);
  });
}
