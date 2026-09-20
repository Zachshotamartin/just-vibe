import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  writeFileSync,
  readFileSync,
  rmSync,
  existsSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { labs } from "../plugins/just-vibe/scripts/lib/workspaces.mjs";
import { practices } from "../plugins/just-vibe/scripts/lib/practice.mjs";
import { tasks } from "../plugins/just-vibe/scripts/lib/tasks.mjs";
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), "jv-workspaces-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const a of [
    ["init"],
    ["config", "user.name", "Fixture"],
    ["config", "user.email", "fixture@example.invalid"],
  ])
    execFileSync("git", a, { cwd: root, stdio: "ignore" });
  writeFileSync(join(root, ".gitignore"), ".just-vibe/\n");
  writeFileSync(join(root, "value.mjs"), "export const value=2;\n");
  writeFileSync(
    join(root, "check.mjs"),
    'import {value} from "./value.mjs"; import assert from "node:assert/strict"; assert.equal(value,2);\n',
  );
  writeFileSync(
    join(root, "server.mjs"),
    'import http from "node:http"; http.createServer((q,r)=>r.end("preview")).listen(Number(process.argv[2]),"127.0.0.1");\n',
  );
  execFileSync("git", ["add", "."], { cwd: root });
  execFileSync("git", ["commit", "-m", "fixture"], {
    cwd: root,
    stdio: "ignore",
  });
  return root;
}
const checks = [
  { id: "behavior", command: [process.execPath, "check.mjs"], timeoutMs: 5000 },
];
const create = {
  revision: 0,
  title: "Compare implementations",
  variants: [
    { id: "a", brief: "First implementation" },
    { id: "b", brief: "Second implementation" },
  ],
  checks,
};
test("lab preserves starting edits, runs equal checks, selects one and records undo", async (t) => {
  const root = fixture(t);
  writeFileSync(
    join(root, "value.mjs"),
    "// existing user edit\nexport const value=2;\n",
  );
  writeFileSync(join(root, "notes.txt"), "Existing user notes");
  let r = await labs(root, "create", "layout", create);
  const a = join(root, r.variants[0].path),
    b = join(root, r.variants[1].path);
  assert.match(
    readFileSync(join(a, "value.mjs"), "utf8"),
    /existing user edit/,
  );
  writeFileSync(
    join(a, "value.mjs"),
    "// existing user edit\nexport const value=1+1;\n",
  );
  writeFileSync(join(b, "value.mjs"), "export const value=0;\n");
  r = await labs(root, "check", "layout", { revision: r.revision });
  assert.equal(r.variants[0].checks.result, "passed");
  assert.equal(r.variants[1].checks.result, "failed");
  await assert.rejects(
    labs(root, "select", "layout", {
      revision: r.revision,
      variant: "b",
      task: "selected",
    }),
    /fresh passing/,
  );
  writeFileSync(join(root, "unrelated.txt"), "Keep this");
  writeFileSync(join(root, "notes.txt"), "Later user notes");
  r = await labs(root, "select", "layout", {
    revision: r.revision,
    variant: "a",
    task: "selected",
  });
  assert.equal(r.status, "selected");
  assert.equal(r.result, undefined);
  assert.equal(
    readFileSync(join(root, "notes.txt"), "utf8"),
    "Later user notes",
  );
  assert.match(readFileSync(join(root, "value.mjs"), "utf8"), /1\+1/);
  assert.equal(readFileSync(join(root, "unrelated.txt"), "utf8"), "Keep this");
  await tasks(root, "undo", "selected", { revision: r.undoTask.revision });
  assert.equal(
    readFileSync(join(root, "value.mjs"), "utf8"),
    "// existing user edit\nexport const value=2;\n",
  );
  const status = await labs(root, "show", "layout");
  await assert.rejects(
    labs(root, "cleanup", "layout", {
      revision: r.revision,
      expected: { a: "wrong", b: "wrong" },
    }),
    /Workspace changed/,
  );
  r = await labs(root, "cleanup", "layout", {
    revision: r.revision,
    expected: Object.fromEntries(
      status.variants.map((v) => [v.id, v.snapshot]),
    ),
  });
  assert.equal(r.status, "cleaned");
  assert.equal(existsSync(a), false);
  assert.equal(existsSync(b), false);
});
test("lab refuses a stale check or an overlapping original edit", async (t) => {
  const root = fixture(t);
  let r = await labs(root, "create", "overlap", create);
  writeFileSync(
    join(root, r.variants[0].path, "value.mjs"),
    "export const value=1+1;\n",
  );
  r = await labs(root, "check", "overlap", { revision: r.revision });
  writeFileSync(
    join(root, r.variants[0].path, "value.mjs"),
    "export const value=3;\n",
  );
  await assert.rejects(
    labs(root, "select", "overlap", {
      revision: r.revision,
      variant: "a",
      task: "selected",
    }),
    /fresh passing/,
  );
  writeFileSync(
    join(root, r.variants[0].path, "value.mjs"),
    "export const value=1+1;\n",
  );
  writeFileSync(join(root, "value.mjs"), "export const value=4;\n");
  await assert.rejects(
    labs(root, "select", "overlap", {
      revision: r.revision,
      variant: "a",
      task: "selected",
    }),
    /overlap/,
  );
});
test("preview starts a real isolated HTTP server and stops its owned process", async (t) => {
  const root = fixture(t);
  let r = await labs(root, "create", "preview", create);
  r = await labs(root, "preview", "preview", {
    revision: r.revision,
    variant: "a",
    command: [process.execPath, "server.mjs", "{port}"],
    minutes: 1,
  });
  t.after(async () => {
    try {
      const current = await labs(root, "show", "preview");
      await labs(root, "stop", "preview", {
        revision: current.revision,
        variant: "a",
      });
    } catch {}
  });
  let body;
  for (let n = 0; n < 40; n++) {
    try {
      body = await (
        await fetch(r.variants[0].preview.url, {
          signal: AbortSignal.timeout(500),
        })
      ).text();
      break;
    } catch {
      await new Promise((ok) => setTimeout(ok, 100));
    }
  }
  assert.equal(body, "preview");
  r = await labs(root, "stop", "preview", {
    revision: r.revision,
    variant: "a",
  });
  const status = await labs(root, "show", "preview");
  assert.equal(status.variants[0].preview.state, "stopped");
  await labs(root, "cleanup", "preview", {
    revision: r.revision,
    expected: Object.fromEntries(
      status.variants.map((v) => [v.id, v.snapshot]),
    ),
  });
});
test("practice validates controls, protects tests, provides hints and grades actual code", async (t) => {
  const root = fixture(t);
  let r = await practices(root, "create", "addition", {
    revision: 0,
    lesson: {
      title: "Addition",
      objective: "Compute two",
      explanation: "Practice an equivalent expression.",
      sourceFiles: ["value.mjs"],
    },
    edits: [{ path: "value.mjs", content: "export const value=0;\n" }],
    checks,
    checkFiles: ["check.mjs"],
    hints: ["Use addition.", "Try two ones."],
    saveProgress: true,
  });
  r = await practices(root, "validate", "addition", { revision: r.revision });
  assert.equal(r.result, "validated");
  const workspace = join(root, r.variants[1].path);
  let hint = await practices(root, "hint", "addition", {
    revision: r.revision,
    level: 1,
  });
  assert.equal(hint.hint, "Use addition.");
  r = await practices(root, "submit", "addition", { revision: hint.revision });
  assert.equal(r.result, "failed");
  writeFileSync(join(workspace, "value.mjs"), "export const value=1+1;\n");
  r = await practices(root, "submit", "addition", { revision: r.revision });
  assert.equal(r.result, "passed");
  assert.equal(r.progressSaved, true);
  writeFileSync(join(workspace, "check.mjs"), "// bypass");
  await assert.rejects(
    practices(root, "submit", "addition", { revision: r.revision }),
    /Protected exercise tests changed/,
  );
});
test("practice rejects vacuous controls and leaves the original worktree untouched", async (t) => {
  const root = fixture(t);
  let r = await practices(root, "create", "vacuous", {
    revision: 0,
    lesson: {
      title: "Example",
      objective: "Exercise",
      explanation: "Example",
      sourceFiles: ["value.mjs"],
    },
    edits: [{ path: "value.mjs", content: "export const value=2;\n" }],
    checks,
    checkFiles: ["check.mjs"],
    hints: ["No hint"],
  });
  r = await practices(root, "validate", "vacuous", { revision: r.revision });
  assert.equal(r.result, "failed");
  assert.equal(r.status, "invalid-controls");
  assert.equal(
    readFileSync(join(root, "value.mjs"), "utf8"),
    "export const value=2;\n",
  );
});

test("binary selection preserves bytes and cleanup refuses ignored private changes", async (t) => {
  const root = fixture(t);
  const original = Buffer.from([0, 255, 128, 1]);
  writeFileSync(join(root, "asset.bin"), original);
  execFileSync("git", ["add", "asset.bin"], { cwd: root });
  execFileSync("git", ["commit", "-m", "binary fixture"], {
    cwd: root,
    stdio: "ignore",
  });
  let r = await labs(root, "create", "binary", create);
  const a = join(root, r.variants[0].path);
  writeFileSync(join(a, "asset.bin"), Buffer.from([0, 255, 129, 2]));
  r = await labs(root, "check", "binary", { revision: r.revision });
  r = await labs(root, "select", "binary", {
    revision: r.revision,
    variant: "a",
    task: "binary-change",
  });
  assert.deepEqual(
    readFileSync(join(root, "asset.bin")),
    Buffer.from([0, 255, 129, 2]),
  );
  await tasks(root, "undo", "binary-change", { revision: r.undoTask.revision });
  assert.deepEqual(readFileSync(join(root, "asset.bin")), original);
  writeFileSync(join(a, ".gitignore"), ".just-vibe/\n.env\n");
  writeFileSync(join(a, ".env"), "PRIVATE_FIXTURE=keep");
  const status = await labs(root, "show", "binary");
  await assert.rejects(
    labs(root, "cleanup", "binary", {
      revision: r.revision,
      expected: Object.fromEntries(
        status.variants.map((v) => [v.id, v.snapshot]),
      ),
    }),
    /outside cleanup coverage/,
  );
  assert.equal(existsSync(join(a, ".env")), true);
});

test("interrupted lab selection recovers its one owned task without duplicate application", async (t) => {
  const { readRecord, saveRecord, fileSet, fromText, git } =
    await import("../plugins/just-vibe/scripts/lib/workbench.mjs");
  const root = fixture(t);
  let r = await labs(root, "create", "recover", create);
  const before = fileSet(root, ["value.mjs"]),
    after = { "value.mjs": fromText("export const value=1+1;\n") };
  r = saveRecord(
    root,
    "labs",
    "recover",
    {
      ...r,
      status: "selecting",
      selection: {
        task: "recovered",
        variant: "a",
        purpose: "Selected recovery",
        before,
        after,
        index: git(root, ["ls-files", "--stage", "-z"]),
      },
    },
    r.revision,
  );
  r = await labs(root, "recover", "recover", { revision: r.revision });
  assert.equal(r.status, "selected");
  assert.match(readFileSync(join(root, "value.mjs"), "utf8"), /1\+1/);
  const task = readRecord(root, "tasks", "recovered");
  assert.equal(task.status, "captured");
  await assert.rejects(
    labs(root, "recover", "recover", { revision: r.revision }),
    /No interrupted/,
  );
  assert.equal(readRecord(root, "tasks", "recovered").revision, task.revision);
});

test("a tampered workspace location cannot remove the original project", async (t) => {
  const { saveRecord } =
    await import("../plugins/just-vibe/scripts/lib/workbench.mjs");
  const root = fixture(t);
  let r = await labs(root, "create", "ownership", create);
  r.variants[0].path = ".";
  saveRecord(root, "labs", "ownership", r, r.revision);
  await assert.rejects(labs(root, "show", "ownership"), /does not belong/);
  assert.equal(existsSync(join(root, "value.mjs")), true);
});

test("selection detects deletion of a file that was untracked at lab creation", async (t) => {
  const root = fixture(t);
  writeFileSync(join(root, "user-draft.txt"), "Original draft");
  let r = await labs(root, "create", "delete-draft", create);
  rmSync(join(root, r.variants[0].path, "user-draft.txt"));
  const shown = await labs(root, "show", "delete-draft");
  assert.deepEqual(shown.variants[0].changes, ["user-draft.txt"]);
  assert.deepEqual(shown.variants[1].changes, []);
  r = await labs(root, "check", "delete-draft", { revision: r.revision });
  r = await labs(root, "select", "delete-draft", {
    revision: r.revision,
    variant: "a",
    task: "delete-draft",
  });
  assert.equal(existsSync(join(root, "user-draft.txt")), false);
  await tasks(root, "undo", "delete-draft", { revision: r.undoTask.revision });
  assert.equal(
    readFileSync(join(root, "user-draft.txt"), "utf8"),
    "Original draft",
  );
});
