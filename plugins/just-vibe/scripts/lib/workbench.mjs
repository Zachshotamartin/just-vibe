import {
  existsSync,
  lstatSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  renameSync,
  unlinkSync,
  openSync,
  closeSync,
  readdirSync,
  mkdtempSync,
  rmSync,
  realpathSync,
  chmodSync,
} from "node:fs";
import { dirname, relative, join } from "node:path";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  atomicJson,
  within,
  projectRoot,
  readJson,
  digest,
  privateName,
} from "./storage.mjs";
import { runCommand, redact, redactValue, redactCommand } from "./process.mjs";

export { within, projectRoot, digest, readJson };
export const MAX_STATE = 8 * 1024 * 1024;
export const now = () => new Date().toISOString();
export function object(value, allowed, label = "input") {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.keys(value).some((k) => !allowed.includes(k))
  )
    throw Error(`Unknown or malformed ${label} fields.`);
}
export function text(value, label = "text", max = 12000) {
  if (
    typeof value !== "string" ||
    !value.trim() ||
    value.length > max ||
    value.includes("\0")
  )
    throw Error(`${label} must be nonempty text up to ${max} characters.`);
  return value;
}
export function name(value) {
  if (!/^[a-z0-9][a-z0-9-]{0,63}$/.test(text(value, "name", 64)))
    throw Error("Use a lowercase name up to 64 characters.");
  return value;
}
export function revision(value) {
  if (!Number.isInteger(value) || value < 0)
    throw Error("Provide the current revision (0 for a new record).");
  return value;
}
export function strings(value, label, max = 100, empty = false) {
  if (!Array.isArray(value) || (!empty && !value.length) || value.length > max)
    throw Error(`${label} must contain ${empty ? "0" : "1"}–${max} strings.`);
  value.forEach((v) => text(v, label));
  return value;
}
export function safePath(root, path, { managed = false } = {}) {
  text(path, "relative path", 500);
  if (
    path.includes("\\") ||
    path.startsWith("/") ||
    /^[A-Za-z]:/.test(path) ||
    path.split("/").some((p) => !p || p === ".." || p === ".")
  )
    throw Error("Use a normalized project-relative path.");
  if (
    path
      .split("/")
      .some(
        (p) =>
          p === ".git" || (!managed && p === ".just-vibe") || privateName(p),
      )
  )
    throw Error("Private or managed paths are not eligible.");
  return within(root, path);
}
export function fileState(root, path, options = {}) {
  const full = safePath(root, path, options);
  if (!existsSync(full)) return null;
  const stat = lstatSync(full);
  if (!stat.isFile() || stat.size > 128 * 1024)
    throw Error(`Expected a regular file up to 128 KiB: ${path}`);
  const content = readFileSync(full);
  return {
    sha256: digest(content),
    executable: !!(stat.mode & 0o111),
    ...(process.platform !== "win32" ? { mode: stat.mode & 0o777 } : {}),
    data: content.toString("base64"),
  };
}
export const identity = (state) =>
  state ? { sha256: state.sha256, executable: state.executable } : null;
export const same = (a, b) =>
  JSON.stringify(identity(a)) === JSON.stringify(identity(b)) &&
  (a?.mode === undefined || b?.mode === undefined || a.mode === b.mode);

// Preserve access permissions while applying the requested executable flag.
// Git blobs/old records know only that flag; existing files supply the rest.
export function inheritMode(state, previous) {
  if (!state || previous?.mode === undefined) return state;
  const execute = state.executable
    ? (previous.mode & 0o111) || ((previous.mode & 0o444) >> 2) || 0o100
    : 0;
  return { ...state, mode: (previous.mode & ~0o111) | execute };
}
export function fileSet(root, paths, options = {}) {
  strings(paths, "paths", 100, true);
  if (new Set(paths).size !== paths.length) throw Error("Duplicate paths.");
  const result = Object.create(null);
  let bytes = 0;
  for (const path of [...paths].sort()) {
    const state = fileState(root, path, options);
    bytes += state ? Buffer.byteLength(state.data, "base64") : 0;
    if (bytes > 512 * 1024)
      throw Error("Selected files exceed 512 KiB; narrow the scope.");
    result[path] = state;
  }
  return result;
}
export const identities = (files) =>
  Object.fromEntries(Object.entries(files).map(([p, s]) => [p, identity(s)]));
export const fileSetHash = (files) => digest(JSON.stringify(identities(files)));
export function changed(saved, current) {
  return [...new Set([...Object.keys(saved), ...Object.keys(current)])].filter(
    (p) => !same(saved[p], current[p]),
  );
}
export function fromBytes(value, executable = false) {
  if (!Buffer.isBuffer(value) || value.length > 128 * 1024)
    throw Error("File exceeds 128 KiB.");
  return { data: value.toString("base64"), sha256: digest(value), executable };
}
export const stableJson = (value) =>
  JSON.stringify(value, function (_, v) {
    return v && typeof v === "object" && !Array.isArray(v)
      ? Object.fromEntries(
          Object.keys(v)
            .sort()
            .map((k) => [k, v[k]]),
        )
      : v;
  });
export function fromText(value, executable = false) {
  if (typeof value !== "string" || Buffer.byteLength(value) > 128 * 1024)
    throw Error("File text exceeds 128 KiB.");
  return {
    data: Buffer.from(value).toString("base64"),
    sha256: digest(value),
    executable,
  };
}
export function writeState(root, path, state, options = {}) {
  const full = safePath(root, path, options);
  if (!state) {
    if (existsSync(full)) unlinkSync(full);
    return;
  }
  const bytes = Buffer.from(state.data, "base64");
  if (digest(bytes) !== state.sha256 || bytes.length > 128 * 1024)
    throw Error("Invalid stored file content.");
  if (
    state.mode !== undefined &&
    (!Number.isInteger(state.mode) || state.mode < 0 || state.mode > 0o777 ||
      !!(state.mode & 0o111) !== state.executable)
  )
    throw Error("Invalid stored file permissions.");
  // Legacy records retain existing permissions. If the file is gone and no
  // mode was recorded, restore user-only access rather than guessing broadly.
  const current = existsSync(full) ? { mode: lstatSync(full).mode & 0o777 } : null;
  const mode = state.mode ?? inheritMode(state, current).mode ??
    (state.executable ? 0o700 : 0o600);
  mkdirSync(dirname(full), { recursive: true });
  const temp = `${full}.${randomUUID()}.tmp`;
  try {
    writeFileSync(temp, bytes, {
      flag: "wx",
      mode,
    });
    if (process.platform !== "win32") chmodSync(temp, mode);
    renameSync(temp, full);
  } finally {
    if (existsSync(temp)) unlinkSync(temp);
  }
}
export function readRecord(root, collection, id, optional = false) {
  name(collection);
  name(id);
  root = projectRoot(root);
  const path = within(root, `.just-vibe/${collection}/${id}.json`);
  if (optional && !existsSync(path)) return null;
  const record = readJson(path, MAX_STATE);
  if (
    record.schemaVersion !== 1 ||
    record.root !== root ||
    record.collection !== collection ||
    record.id !== id ||
    !Number.isInteger(record.revision) ||
    record.revision < 1
  )
    throw Error("Record identity is invalid or belongs to another project.");
  return record;
}
export function saveRecord(root, collection, id, value, expectedRevision) {
  root = projectRoot(root);
  name(collection);
  name(id);
  revision(expectedRevision);
  return atomicJson(
    root,
    `.just-vibe/${collection}/${id}.json`,
    { ...value, schemaVersion: 1, root, collection, id, updatedAt: now() },
    expectedRevision,
    MAX_STATE,
  );
}
export function listRecords(root, collection) {
  name(collection);
  const path = within(root, `.just-vibe/${collection}`);
  return existsSync(path)
    ? readdirSync(path)
        .filter((p) => /^[a-z0-9][a-z0-9-]{0,63}\.json$/.test(p))
        .sort()
        .map((p) => p.slice(0, -5))
    : [];
}
export function expectRevision(record, rev) {
  if ((record?.revision || 0) !== revision(rev))
    throw Error("State revision changed. Read it again before updating.");
}
export async function locked(root, operation) {
  const directory = within(root, ".just-vibe");
  mkdirSync(directory, { recursive: true });
  const path = within(root, ".just-vibe/workbench.lock");
  let handle;
  try {
    handle = openSync(path, "wx", 0o600);
  } catch {
    throw Error(
      "Workbench operation in progress. Inspect the lock owner before recovery.",
    );
  }
  writeFileSync(handle, JSON.stringify({ pid: process.pid, createdAt: now() }));
  try {
    return await operation();
  } finally {
    closeSync(handle);
    unlinkSync(path);
  }
}
export function recoverLock(root) {
  const removed = [];
  function recover(path) {
    if (!existsSync(path)) return;
    const lock = readJson(path);
    if (!Number.isInteger(lock.pid) || lock.pid <= 0)
      throw Error("Malformed lock: inspect manually.");
    try {
      process.kill(lock.pid, 0);
    } catch (error) {
      if (error.code !== "ESRCH") throw error;
      unlinkSync(path);
      removed.push(relative(projectRoot(root), path));
      return;
    }
    throw Error(
      "The lock owner is still running; do not interrupt it by removing the lock.",
    );
  }
  recover(within(root, ".just-vibe/workbench.lock"));
  for (const collection of [
    "memory",
    "guards",
    "tasks",
    "labs",
    "proofs",
    "practice",
    "experiments",
    "decisions",
  ]) {
    const directory = within(root, `.just-vibe/${collection}`);
    if (existsSync(directory))
      for (const file of readdirSync(directory).filter((p) =>
        /^[a-z0-9-]+\.json\.lock$/.test(p),
      ))
        recover(within(root, `.just-vibe/${collection}/${file}`));
  }
  return { recovered: !!removed.length, removed };
}
// A durable journal makes an interrupted multi-file edit recoverable. Unknown
// edits stop recovery; it never resets the index or overwrites a third version.
export function applyTransaction(
  root,
  record,
  before,
  after,
  completed,
  options = {},
) {
  if (record.pending) throw Error("Recover the pending transaction first.");
  const paths = Object.keys(after);
  if (changed(before, fileSet(root, paths, options)).length)
    throw Error("Files changed before application.");
  let state = saveRecord(
    root,
    record.collection,
    record.id,
    { ...record, pending: { before, after, completed, options } },
    record.revision,
  );
  return recoverTransaction(root, state);
}
export function recoverTransaction(root, record) {
  const pending = record.pending;
  if (!pending) return record;
  const paths = Object.keys(pending.after),
    current = fileSet(root, paths, pending.options);
  for (const p of paths)
    if (
      !same(current[p], pending.before[p]) &&
      !same(current[p], pending.after[p])
    )
      throw Error(`Concurrent edit blocks transaction recovery: ${p}`);
  for (const p of paths) {
    const latest = fileState(root, p, pending.options);
    if (!same(latest, pending.before[p]) && !same(latest, pending.after[p]))
      throw Error(`Concurrent edit blocks transaction recovery: ${p}`);
    if (!same(latest, pending.after[p]))
      writeState(root, p, pending.after[p], pending.options);
  }
  const { pending: _, ...next } = record;
  return saveRecord(
    root,
    record.collection,
    record.id,
    { ...next, ...pending.completed },
    record.revision,
  );
}
export function git(
  root,
  args,
  { input, accepted = [0], encoding = "utf8" } = {},
) {
  const hooks = mkdtempSync(join(tmpdir(), "jv-no-hooks-"));
  try {
    return execFileSync(
      "git",
      ["-c", `core.hooksPath=${hooks}`, "-c", "core.fsmonitor=false", ...args],
      {
        cwd: root,
        encoding,
        input,
        timeout: 15000,
        maxBuffer: 4 * 1024 * 1024,
        stdio: ["pipe", "pipe", "pipe"],
        env: {
          ...process.env,
          GIT_TERMINAL_PROMPT: "0",
          GIT_OPTIONAL_LOCKS: "0",
        },
      },
    );
  } catch (error) {
    if (accepted.includes(error.status)) return String(error.stdout || "");
    throw Error(redact(String(error.stderr || error.message)).trim());
  } finally {
    rmSync(hooks, { recursive: true, force: true });
  }
}
// Windows Git can report a different drive-letter case or an 8.3 alias.
// Compare existing directories by filesystem identity, not path spelling.
export function sameDirectory(a, b) {
  const left = lstatSync(realpathSync(a), { bigint: true }),
    right = lstatSync(realpathSync(b), { bigint: true });
  return (
    left.isDirectory() &&
    right.isDirectory() &&
    left.dev === right.dev &&
    left.ino === right.ino &&
    (left.ino !== 0n || realpathSync(a) === realpathSync(b))
  );
}
export function repoIdentity(root) {
  const top = git(root, ["rev-parse", "--show-toplevel"]).trim();
  if (!sameDirectory(top, projectRoot(root)))
    throw Error(
      `Select the Git worktree root: Git reported ${top}, selected ${projectRoot(root)}.`,
    );
  return {
    head: git(root, ["rev-parse", "--verify", "HEAD"]).trim(),
    branch: git(root, ["symbolic-ref", "--quiet", "--short", "HEAD"], {
      accepted: [0, 1],
    }).trim(),
    index: digest(
      git(root, [
        "diff",
        "--cached",
        "--no-ext-diff",
        "--no-textconv",
        "--binary",
      ]),
    ),
  };
}
export function argv(value) {
  strings(value, "command arguments", 60);
  return value;
}
export async function checkCommand(root, command, timeoutMs = 15000) {
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 120000)
    throw Error("Check timeout must be 1–120000 ms.");
  const result = await runCommand(argv(command), {
    cwd: root,
    timeoutMs,
    maxBytes: 128 * 1024,
  });
  return {
    command: redactCommand(command),
    observedAt: now(),
    ...redactValue(result),
    result:
      result.status === 0 &&
      !result.timedOut &&
      !result.truncated &&
      !result.error
        ? "passed"
        : "failed",
  };
}
export const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export function reportPage(title, content) {
  return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'unsafe-inline'"><title>${escapeHtml(title)}</title><style>body{font:16px/1.6 system-ui;max-width:1000px;margin:40px auto;padding:0 24px;color:#18222b;background:#fafafa}h1{line-height:1.2}section{border-top:1px solid #ccc;margin-top:24px;padding-top:16px}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#eee;padding:16px}img{max-width:100%;border:1px solid #ddd}figure{margin:20px 0}figcaption{font-size:12px;overflow-wrap:anywhere;color:#53616b}details{margin:16px 0}summary{cursor:pointer;font-weight:600}a{color:#164f8f}</style><h1>${escapeHtml(title)}</h1>${content}</html>`;
}
