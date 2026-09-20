import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { tasks } from "../plugins/just-vibe/scripts/lib/tasks.mjs";
const original =
  Array.from({ length: 20 }, (_, i) => `line ${i}`).join("\n") + "\n";
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), "jv-task-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const a of [
    ["init"],
    ["config", "user.name", "Fixture"],
    ["config", "user.email", "fixture@example.invalid"],
  ])
    execFileSync("git", a, { cwd: root, stdio: "ignore" });
  writeFileSync(join(root, ".gitignore"), ".just-vibe/\n");
  writeFileSync(join(root, "a.txt"), original);
  execFileSync("git", ["add", "."], { cwd: root });
  execFileSync("git", ["commit", "-m", "fixture"], {
    cwd: root,
    stdio: "ignore",
  });
  return root;
}
test("task undo preserves later unrelated edits in the same file and keeps the index", async (t) => {
  const root = fixture(t);
  let r = await tasks(root, "begin", "feature", {
    revision: 0,
    purpose: "Change line 2",
    paths: ["a.txt"],
  });
  writeFileSync(join(root, "a.txt"), original.replace("line 2\n", "feature\n"));
  r = await tasks(root, "capture", "feature", { revision: r.revision });
  writeFileSync(
    join(root, "a.txt"),
    readFileSync(join(root, "a.txt"), "utf8").replace(
      "line 17\n",
      "later user change\n",
    ),
  );
  const preview = await tasks(root, "preview", "feature");
  assert.equal(preview.result, "ready");
  r = await tasks(root, "undo", "feature", { revision: r.revision });
  assert.equal(r.status, "undone");
  assert.equal(
    readFileSync(join(root, "a.txt"), "utf8"),
    original.replace("line 17\n", "later user change\n"),
  );
  assert.equal(
    execFileSync("git", ["diff", "--cached"], { cwd: root, encoding: "utf8" }),
    "",
  );
});
test("task overlap and staged modifications cannot be overwritten", async (t) => {
  const root = fixture(t);
  let r = await tasks(root, "begin", "feature", {
    revision: 0,
    purpose: "Change line 2",
    paths: ["a.txt"],
    externalEffects: ["Preview deployed manually."],
  });
  writeFileSync(join(root, "a.txt"), original.replace("line 2\n", "feature\n"));
  r = await tasks(root, "capture", "feature", { revision: r.revision });
  writeFileSync(
    join(root, "a.txt"),
    original.replace("line 2\n", "user rewrite\n"),
  );
  assert.equal(
    (await tasks(root, "undo", "feature", { revision: r.revision })).result,
    "conflict",
  );
  assert.match(readFileSync(join(root, "a.txt"), "utf8"), /user rewrite/);
  execFileSync("git", ["add", "a.txt"], { cwd: root });
  await assert.rejects(
    tasks(root, "undo", "feature", { revision: r.revision }),
    /Staged changes/,
  );
});

test("journal recovery refuses a changed Git branch before writing source", async (t) => {
  const { readRecord, saveRecord, fileSet, fromText } =
    await import("../plugins/just-vibe/scripts/lib/workbench.mjs");
  const root = fixture(t);
  // Use an existing tracked file from this fixture without assuming its name.
  const names = execFileSync("git", ["ls-files"], {
    cwd: root,
    encoding: "utf8",
  })
    .trim()
    .split(/\r?\n/);
  const path = names[0];
  let r = await tasks(root, "begin", "recover-branch", {
    revision: 0,
    purpose: "Recover bounded edit",
    paths: [path],
  });
  const before = fileSet(root, [path]),
    after = { [path]: fromText("new content") };
  r = saveRecord(
    root,
    "tasks",
    "recover-branch",
    {
      ...r,
      status: "prepared",
      after,
      pending: {
        before,
        after,
        completed: { status: "captured" },
        options: {},
      },
    },
    r.revision,
  );
  execFileSync("git", ["checkout", "-b", "different-branch"], {
    cwd: root,
    stdio: "ignore",
  });
  await assert.rejects(
    tasks(root, "recover", "recover-branch", { revision: r.revision }),
    /Git identity/,
  );
  assert.deepEqual(fileSet(root, [path]), before);
  assert.ok(readRecord(root, "tasks", "recover-branch").pending);
});
