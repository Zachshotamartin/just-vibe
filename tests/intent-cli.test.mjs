import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const cli = fileURLToPath(new URL("../bin/just-vibe.mjs", import.meta.url));
test("real CLI validates intent inputs, returns actionable result codes and renders evidence", (t) => {
  const root = mkdtempSync(join(tmpdir(), "jv-intent-cli-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  writeFileSync(join(root, "value.txt"), "fixture");
  const run = (args, input) =>
    spawnSync(
      process.execPath,
      [
        cli,
        ...args,
        "--root",
        root,
        "--json",
        ...(input === undefined ? [] : ["--stdin"]),
      ],
      {
        encoding: "utf8",
        input: input === undefined ? undefined : JSON.stringify(input),
      },
    );
  assert.equal(run(["lab", "create", "wrong"]).status, 1);
  assert.equal(existsSync(join(root, ".just-vibe")), false);
  assert.equal(run(["memory", "inspect"], { host: "unknown" }).status, 1);
  let out = run(["proof", "create", "cli"], {
    revision: 0,
    title: "CLI evidence",
    criteria: [
      {
        id: "check",
        text: "Expected bytes",
        kind: "automated",
        files: ["value.txt"],
      },
    ],
  });
  assert.equal(out.status, 0, out.stderr);
  let r = JSON.parse(out.stdout);
  assert.equal(run(["proof", "show", "cli"]).status, 2);
  out = run(["proof", "run", "cli"], {
    revision: r.revision,
    criterion: "check",
    command: [
      process.execPath,
      "-e",
      'require("node:assert/strict").equal(require("node:fs").readFileSync("value.txt","utf8"),"fixture")',
    ],
  });
  assert.equal(out.status, 0, out.stderr);
  assert.equal(JSON.parse(out.stdout).result, "verified");
  out = run(["proof", "report", "cli"]);
  assert.equal(out.status, 0, out.stderr);
  assert.equal(existsSync(JSON.parse(out.stdout).path), true);
  writeFileSync(join(root, "value.txt"), "different");
  assert.equal(run(["proof", "show", "cli"]).status, 2);
  const names = JSON.parse(run(["workbench", "list"]).stdout);
  assert.deepEqual(names.proofs, ["cli"]);
  assert.equal(run(["workbench", "list"], {}).status, 1);
});
