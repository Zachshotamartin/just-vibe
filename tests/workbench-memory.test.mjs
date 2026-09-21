import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  writeFileSync,
  readFileSync,
  rmSync,
  mkdirSync,
  symlinkSync,
  existsSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn, execFileSync } from "node:child_process";
import { once } from "node:events";
import {
  memory,
  guards,
  inspectMemory,
} from "../plugins/just-vibe/scripts/lib/memory.mjs";
import {
  fileState,
  readRecord,
  fromText,
  applyTransaction,
  saveRecord,
  recoverTransaction,
  locked,
  recoverLock,
  git,
  repoIdentity,
} from "../plugins/just-vibe/scripts/lib/workbench.mjs";
import { withFileLock } from "../plugins/just-vibe/scripts/lib/file-lock.mjs";
const fixture = (t) => {
  const p = mkdtempSync(join(tmpdir(), "jv-memory-"));
  t.after(() => rmSync(p, { recursive: true, force: true }));
  return p;
};
const instruction = {
  revision: 0,
  rule: "Do not fetch in UI components.",
  file: "AGENTS.md",
  expectedFileHash: null,
  source: { kind: "user-instruction", excerpt: "Never fetch from the UI." },
  scope: "src/ui",
};
test("memory merges, records provenance, updates and retires without changing unrelated guidance", async (t) => {
  const root = fixture(t);
  writeFileSync(join(root, "AGENTS.md"), "# Existing\nPreserve this.\n");
  const a = await memory(root, "save", "ui", {
    ...instruction,
    expectedFileHash: fileState(root, "AGENTS.md").sha256,
  });
  assert.equal(a.status, "active");
  assert.match(readFileSync(join(root, "AGENTS.md"), "utf8"), /Preserve this/);
  const b = await memory(root, "save", "ui", {
    ...instruction,
    revision: a.revision,
    expectedFileHash: fileState(root, "AGENTS.md").sha256,
  });
  assert.equal(b.unchanged, true);
  assert.equal(b.revision, a.revision);
  await assert.rejects(
    memory(root, "save", "ui", { ...instruction, revision: 0 }),
    /revision changed/,
  );
  const c = await memory(root, "save", "ui", {
    ...instruction,
    rule: "Fetch only through the API layer.",
    revision: a.revision,
    expectedFileHash: fileState(root, "AGENTS.md").sha256,
  });
  assert.equal(c.history[0].rule, instruction.rule);
  assert.doesNotMatch(
    readFileSync(join(root, "AGENTS.md"), "utf8"),
    /Do not fetch/,
  );
  const retired = await memory(root, "retire", "ui", {
    revision: c.revision,
    expectedFileHash: fileState(root, "AGENTS.md").sha256,
    reason: "Architecture changed.",
  });
  assert.equal(retired.status, "retired");
  assert.match(readFileSync(join(root, "AGENTS.md"), "utf8"), /Preserve this/);
});
test("memory rejects stale files, unaccepted sources and symlinks", async (t) => {
  const root = fixture(t);
  await assert.rejects(
    memory(root, "save", "a", {
      ...instruction,
      source: { kind: "inferred", excerpt: "I guessed" },
    }),
    /explicit user/,
  );
  writeFileSync(join(root, "AGENTS.md"), "Unrelated content");
  await assert.rejects(memory(root, "save", "a", instruction), /file changed/);
  symlinkSync(join(root, "AGENTS.md"), join(root, "CLAUDE.md"));
  await assert.rejects(
    memory(root, "save", "a", { ...instruction, file: "CLAUDE.md" }),
    /Symlink/,
  );
});
test("inspector distinguishes overrides, conflicts, imports and actual loading observations", async (t) => {
  const root = fixture(t);
  const a = await memory(root, "save", "npm", {
    ...instruction,
    scope: ".",
    rule: "Use npm.",
    key: "package-manager",
    value: "npm",
  });
  await memory(root, "save", "pnpm", {
    ...instruction,
    scope: ".",
    rule: "Use pnpm.",
    key: "package-manager",
    value: "pnpm",
    expectedFileHash: fileState(root, "AGENTS.md").sha256,
  });
  writeFileSync(join(root, "AGENTS.override.md"), "Override");
  writeFileSync(join(root, "CLAUDE.md"), "@AGENTS.md\n");
  let report = inspectMemory(root);
  assert.equal(report.conflicts.length, 1);
  assert.equal(
    report.files.find((f) => f.file === "AGENTS.md").shadowedBy,
    "AGENTS.override.md",
  );
  assert.ok(report.rules.every((r) => r.loading === "unknown"));
  report = inspectMemory(root, {
    host: "claude",
    loaded: [
      {
        file: "AGENTS.md",
        sha256: fileState(root, "AGENTS.md").sha256,
        session: "session-1",
        evidence: "Host context listing",
        observedAt: new Date().toISOString(),
      },
    ],
  });
  assert.ok(report.imports.some((i) => i.to === "AGENTS.md"));
  assert.equal(report.rules[0].loading, "host-reported-loaded");
  writeFileSync(join(root, "CLAUDE.md"), "@../outside.md\n");
  assert.equal(inspectMemory(root, { host: "claude" }).result, "incomplete");
});
test("guards require discriminating controls and fail on actual violations", async (t) => {
  const root = fixture(t);
  await memory(root, "save", "ui", instruction);
  mkdirSync(join(root, "src/ui"), { recursive: true });
  const config = {
    revision: 0,
    ruleId: "ui",
    adapter: "imports",
    include: ["src/ui/**/*.js"],
    forbidden: ["axios"],
    samples: {
      valid: [{ path: "src/ui/a.js", content: 'import api from "../api.js";' }],
      invalid: [{ path: "src/ui/a.js", content: 'import axios from "axios";' }],
    },
  };
  await assert.rejects(
    guards(root, "create", "ui", {
      ...config,
      samples: { ...config.samples, invalid: config.samples.valid },
    }),
    /distinguish/,
  );
  await guards(root, "create", "ui", config);
  assert.equal((await guards(root, "check", "ui")).result, "unverified");
  writeFileSync(join(root, "src/ui/a.js"), 'import axios from "axios";');
  assert.equal((await guards(root, "check", "ui")).result, "failed");
  writeFileSync(join(root, "src/ui/a.js"), 'import api from "../api.js";');
  assert.equal((await guards(root, "check", "ui")).result, "passed");
  const rule = readRecord(root, "memory", "ui");
  await memory(root, "retire", "ui", {
    revision: rule.revision,
    expectedFileHash: fileState(root, "AGENTS.md").sha256,
    reason: "Obsolete",
  });
  assert.equal((await guards(root, "check", "ui")).result, "stale");
});
test("journal recovery completes only known before/after states and preserves unknown edits", (t) => {
  const root = fixture(t);
  writeFileSync(join(root, "a.txt"), "before");
  const before = { "a.txt": fileState(root, "a.txt") },
    after = { "a.txt": fromText("after") };
  let record = saveRecord(
    root,
    "tasks",
    "recovery",
    {
      status: "prepared",
      pending: { before, after, completed: { status: "done" }, options: {} },
    },
    0,
  );
  writeFileSync(join(root, "a.txt"), "someone else");
  assert.throws(() => recoverTransaction(root, record), /Concurrent edit/);
  assert.equal(readFileSync(join(root, "a.txt"), "utf8"), "someone else");
  writeFileSync(join(root, "a.txt"), "after");
  record = recoverTransaction(root, record);
  assert.equal(record.status, "done");
  assert.equal(record.pending, undefined);
});

test("a missing saved block cannot produce an unchanged success and scope is rendered", async (t) => {
  const root = fixture(t);
  const rule = await memory(root, "save", "scope", instruction);
  assert.match(
    readFileSync(join(root, "AGENTS.md"), "utf8"),
    /Applies only to project-relative scope: src\/ui/,
  );
  writeFileSync(join(root, "AGENTS.md"), "User replacement\n");
  await assert.rejects(
    memory(root, "save", "scope", {
      ...instruction,
      revision: rule.revision,
      expectedFileHash: fileState(root, "AGENTS.md").sha256,
    }),
    /missing or edited/,
  );
  assert.equal(inspectMemory(root).rules[0].persisted, false);
  mkdirSync(join(root, "nested"));
  await assert.rejects(
    memory(root, "save", "bad-scope", {
      ...instruction,
      file: "nested/AGENTS.md",
      scope: ".",
    }),
    /within the instruction file/,
  );
});

test("lock recovery removes dead operation and record locks but preserves live owners", async (t) => {
  const { spawnSync } = await import("node:child_process");
  const { recoverLock } =
    await import("../plugins/just-vibe/scripts/lib/workbench.mjs");
  const root = fixture(t),
    directory = join(root, ".just-vibe/memory");
  mkdirSync(directory, { recursive: true });
  const child = spawnSync(
    process.execPath,
    ["-e", "process.stdout.write(String(process.pid))"],
    { encoding: "utf8" },
  );
  assert.equal(child.status, 0);
  const dead = { pid: Number(child.stdout) };
  writeFileSync(join(root, ".just-vibe/workbench.lock"), JSON.stringify(dead));
  writeFileSync(join(directory, "rule.json.lock"), JSON.stringify(dead));
  const recovered = recoverLock(root);
  assert.equal(recovered.removed.length, 2);
  writeFileSync(
    join(root, ".just-vibe/workbench.lock"),
    JSON.stringify({ pid: process.pid }),
  );
  assert.throws(() => recoverLock(root), /still running/);
});

test("lock recovery preserves a replacement owner for operation and record locks", (t) => {
  const root = fixture(t);
  mkdirSync(join(root, ".just-vibe/memory"), { recursive: true });
  const originalKill = process.kill;
  try {
    for (const name of ["workbench.lock", "memory/rule.json.lock"]) {
      const path = join(root, ".just-vibe", name);
      writeFileSync(path, JSON.stringify({ pid: 2147483647 }));
      process.kill = (pid, signal) => {
        if (pid !== 2147483647) return originalKill(pid, signal);
        // Another recoverer finished and a new writer acquired the path.
        rmSync(path);
        writeFileSync(path, JSON.stringify({ pid: process.pid, token: "replacement" }));
        throw Object.assign(Error("Dead owner"), { code: "ESRCH" });
      };
      assert.throws(() => recoverLock(root), /changed during recovery/);
      assert.equal(JSON.parse(readFileSync(path, "utf8")).token, "replacement");
      rmSync(path);
    }
  } finally {
    process.kill = originalKill;
  }
});

test("async workbench cleanup preserves a replacement lock owner", async (t) => {
  const root = fixture(t), path = join(root, ".just-vibe/workbench.lock");
  const result = await locked(root, async () => {
    assert.equal(typeof JSON.parse(readFileSync(path, "utf8")).token, "string");
    await Promise.resolve();
    rmSync(path);
    writeFileSync(path, JSON.stringify({ pid: process.pid, token: "replacement" }));
    return "finished";
  });
  assert.equal(result, "finished");
  assert.equal(JSON.parse(readFileSync(path, "utf8")).token, "replacement");
});

test("explicit recovery shares the atomic JSON recovery mutex", async (t) => {
  const root = fixture(t), directory = join(root, ".just-vibe/memory");
  mkdirSync(directory, { recursive: true });
  const path = join(directory, "rule.json.lock");
  writeFileSync(path, JSON.stringify({ pid: 2147483647 }));
  withFileLock(`${path}.recovery`, () => {
    assert.throws(() => recoverLock(root), { code: "STATE_LOCKED" });
  });
  assert.equal(JSON.parse(readFileSync(path, "utf8")).pid, 2147483647);
  let pending;
  withFileLock(join(root, ".just-vibe/workbench.lock.recovery"), () => {
    pending = locked(root, async () => assert.fail("Recovery still owns the mutex"));
  });
  await assert.rejects(pending, /Workbench operation in progress/);
});

test("release gate contention preserves async results and callback errors", { timeout: 10000 }, async (t) => {
  const module = new URL("../plugins/just-vibe/scripts/lib/file-lock.mjs", import.meta.url).href;
  for (const shouldThrow of [false, true]) {
    const root = fixture(t), path = join(root, ".just-vibe/workbench.lock");
    const originalError = Error("Original operation failure");
    let child, closed;
    try {
      const result = locked(root, async () => {
        const code = `import {withFileLock} from ${JSON.stringify(module)}; import {readSync} from 'node:fs'; withFileLock(process.argv[1],()=>{process.stdout.write('ready');readSync(0,Buffer.alloc(1),0,1,null);});`;
        child = spawn(process.execPath, ["--input-type=module", "-e", code, `${path}.recovery`], { stdio: ["pipe", "pipe", "pipe"] });
        closed = once(child, "close");
        const [output] = await once(child.stdout, "data");
        assert.equal(output.toString(), "ready");
        if (shouldThrow) throw originalError;
        return "finished";
      });
      if (shouldThrow) await assert.rejects(result, (error) => error === originalError);
      else assert.equal(await result, "finished");
      assert.equal(existsSync(path), false);
    } finally {
      if (child) {
        child.stdin.end("x");
        await closed;
      }
    }
  }
});

test("project Git ignores inherited repository, index and configuration redirection", (t) => {
  const directory = fixture(t), selected = join(directory, "selected"), foreign = join(directory, "foreign");
  const hooks = join(directory, "empty-hooks");
  mkdirSync(hooks);
  const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith("GIT_")));
  const direct = (root, args, options = {}) => execFileSync("git", ["-C", root, ...args], {
    env, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"], ...options,
  });
  for (const [root, text] of [[selected, "selected"], [foreign, "foreign"]]) {
    mkdirSync(root);
    direct(root, ["init", "--quiet"]);
    direct(root, ["config", "user.name", "Fixture User"]);
    direct(root, ["config", "user.email", "fixture@example.invalid"]);
    writeFileSync(join(root, "value.txt"), text);
    direct(root, ["add", "value.txt"]);
    direct(root, ["-c", `core.hooksPath=${hooks}`, "-c", "commit.gpgSign=false", "commit", "--quiet", "-m", "Fixture"]);
    writeFileSync(join(root, "value.txt"), `${text} staged`);
    direct(root, ["add", "value.txt"]);
  }
  const initial = repoIdentity(selected), foreignIdentity = repoIdentity(foreign);
  const foreignIndex = readFileSync(join(foreign, ".git/index"));
  const selectedIndex = direct(selected, ["ls-files", "--stage"]);
  const overrides = {
    GIT_DIR: join(foreign, ".git"), GIT_WORK_TREE: selected,
    GIT_INDEX_FILE: join(foreign, ".git/index"),
    GIT_CONFIG_COUNT: "1", GIT_CONFIG_KEY_0: "user.name", GIT_CONFIG_VALUE_0: "Redirected Identity",
  };
  const previous = Object.fromEntries(Object.keys(overrides).map(key => [key, process.env[key]]));
  try {
    Object.assign(process.env, overrides);
    assert.deepEqual(repoIdentity(selected), initial);
    assert.equal(git(selected, ["ls-files", "--stage"]), selectedIndex);
    assert.equal(git(selected, ["config", "--get", "user.name"]).trim(), "Fixture User");
    writeFileSync(join(selected, "value.txt"), "selected changed");
    git(selected, ["add", "value.txt"]);
    assert.equal(direct(selected, ["show", ":value.txt"]), "selected changed");
    assert.equal(repoIdentity(selected).head, initial.head);
    assert.equal(direct(foreign, ["rev-parse", "HEAD"]).trim(), foreignIdentity.head);
    assert.deepEqual(readFileSync(join(foreign, ".git/index")), foreignIndex);
    assert.equal(readFileSync(join(foreign, "value.txt"), "utf8"), "foreign staged");
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});

test("project Git ignores replacement objects and preserves binary input/output", (t) => {
  const root = fixture(t);
  git(root, ["init", "--quiet"]);
  const original = git(root, ["hash-object", "-w", "--stdin"], { input: "original" }).trim();
  const replacement = git(root, ["hash-object", "-w", "--stdin"], { input: "replacement" }).trim();
  git(root, ["replace", original, replacement]);
  assert.equal(git(root, ["cat-file", "blob", original]), "original");
  const bytes = Buffer.from([0, 255, 127, 10]);
  const id = git(root, ["hash-object", "-w", "--stdin"], { input: bytes }).trim();
  assert.deepEqual(git(root, ["cat-file", "blob", id], { encoding: null }), bytes);
});
