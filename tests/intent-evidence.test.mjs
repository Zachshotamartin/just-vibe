import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  fileSet,
  identities,
} from "../plugins/just-vibe/scripts/lib/workbench.mjs";
import { proofs } from "../plugins/just-vibe/scripts/lib/proof.mjs";
import { decisions } from "../plugins/just-vibe/scripts/lib/decisions.mjs";
import { experiments } from "../plugins/just-vibe/scripts/lib/experiments.mjs";
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), "jv-evidence-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}
test("proof connects real execution to criteria, separates human acceptance and invalidates changed evidence", async (t) => {
  const root = fixture(t);
  writeFileSync(join(root, "a.txt"), "correct");
  let r = await proofs(root, "create", "checkout", {
    revision: 0,
    title: "Checkout <script>",
    criteria: [
      {
        id: "behavior",
        text: "Correct behavior",
        kind: "automated",
        files: ["a.txt"],
      },
      { id: "usability", text: "Readable UI", kind: "human", files: ["a.txt"] },
    ],
  });
  r = await proofs(root, "run", "checkout", {
    revision: r.revision,
    criterion: "behavior",
    command: [process.execPath, "-e", "process.exit(1)"],
  });
  assert.equal(r.result, "failed");
  r = await proofs(root, "run", "checkout", {
    revision: r.revision,
    criterion: "behavior",
    command: [process.execPath, "-e", "process.exit(0)"],
  });
  assert.equal(r.result, "incomplete");
  await assert.rejects(
    proofs(root, "attach", "checkout", {
      revision: r.revision,
      criterion: "behavior",
      source: "guess",
      summary: "Works",
      verdict: "accepted",
      observedAt: new Date().toISOString(),
    }),
    /cannot pass an automated/,
  );
  r = await proofs(root, "attach", "checkout", {
    revision: r.revision,
    criterion: "usability",
    files: identities(fileSet(root, ["a.txt"])),
    source: "User review",
    summary: "Reviewed the preview",
    verdict: "accepted",
    observedAt: new Date().toISOString(),
  });
  assert.equal(r.result, "verified");
  const report = await proofs(root, "report", "checkout");
  assert.match(readFileSync(report.path, "utf8"), /&lt;script&gt;/);
  assert.doesNotMatch(readFileSync(report.path, "utf8"), /<script>/);
  writeFileSync(join(root, "a.txt"), "changed");
  assert.equal((await proofs(root, "show", "checkout")).result, "stale");
});
test("a verification command that edits covered source never certifies its result", async (t) => {
  const root = fixture(t);
  writeFileSync(join(root, "a.txt"), "before");
  const r = await proofs(root, "create", "mutation", {
    revision: 0,
    title: "Mutation",
    criteria: [
      {
        id: "check",
        text: "Check source",
        kind: "automated",
        files: ["a.txt"],
      },
    ],
  });
  const out = await proofs(root, "run", "mutation", {
    revision: r.revision,
    criterion: "check",
    command: [
      process.execPath,
      "-e",
      'require("node:fs").writeFileSync("a.txt","after")',
    ],
  });
  assert.equal(out.result, "stale");
});
test("decision revisit evaluates predeclared thresholds, freshness and preserved history", async (t) => {
  const root = fixture(t);
  writeFileSync(join(root, "architecture.md"), "No queue");
  let r = await decisions(root, "save", "queue", {
    revision: 0,
    decision: "No queue yet",
    rationale: "Traffic is small",
    alternatives: ["Add a queue"],
    assumptions: [
      {
        id: "traffic",
        statement: "Low load",
        trigger: {
          metric: "jobs-per-minute",
          operator: "gte",
          value: 100,
          maxAgeHours: 24,
        },
        files: ["architecture.md"],
      },
    ],
  });
  r = await decisions(root, "revisit", "queue", {
    revision: r.revision,
    observations: [],
  });
  assert.equal(r.result, "unknown");
  r = await decisions(root, "revisit", "queue", {
    revision: r.revision,
    observations: [
      {
        metric: "jobs-per-minute",
        value: 120,
        observedAt: new Date().toISOString(),
        source: "Staging load report",
      },
    ],
  });
  assert.equal(r.result, "reconsider");
  assert.equal(r.decision, "No queue yet");
  r = await decisions(root, "save", "queue", {
    revision: r.revision,
    decision: "Use a queue",
    rationale: "Measured load passed the threshold",
    alternatives: [],
    assumptions: [
      {
        id: "design",
        statement: "Current implementation",
        files: ["architecture.md"],
      },
    ],
  });
  assert.equal(r.history[0].decision, "No queue yet");
  writeFileSync(join(root, "architecture.md"), "Queue added");
  assert.equal(
    (
      await decisions(root, "revisit", "queue", {
        revision: r.revision,
        observations: [],
      })
    ).result,
    "reconsider",
  );
});
const metadata = {
  task: "binary",
  dataset: { id: "users", fingerprint: "dataset-v1", split: "held-out" },
  model: "model-v1",
  codeRevision: "abc123",
  seed: 42,
  preprocessing: "v1",
  trainingFeatures: { age: { dtype: "number", transform: "v1" } },
  servingFeatures: { age: { dtype: "number", transform: "v1" } },
};
test("ML adapters compute paired metrics and expose regressions hidden by the aggregate", async (t) => {
  const root = fixture(t);
  writeFileSync(
    join(root, "mlflow.json"),
    JSON.stringify({
      run: {
        info: { run_id: "old" },
        data: { metrics: [{ key: "accuracy", value: 1 }] },
      },
    }),
  );
  writeFileSync(join(root, "wandb-summary.json"), '{"accuracy":0.99}');
  const rows = Array.from({ length: 10 }, (_, i) => ({
    id: String(i),
    target: 1,
    prediction: i < 2 ? 0 : 1,
    slices: { cohort: i < 2 ? "new" : "existing" },
  }));
  writeFileSync(join(root, "old.json"), JSON.stringify(rows));
  const candidate = rows.map((r, i) => ({
    ...r,
    prediction: i === 0 ? 1 : i === 2 ? 0 : 1,
    slices: r.slices,
  }));
  // Baseline new users are poor; candidate fixes new users but regresses an existing user.
  writeFileSync(join(root, "new.json"), JSON.stringify(candidate));
  await experiments(root, "import", "old", {
    ...metadata,
    revision: 0,
    format: "mlflow",
    exportFile: "mlflow.json",
    predictionsFile: "old.json",
  });
  const imported = await experiments(root, "import", "new", {
    ...metadata,
    revision: 0,
    format: "wandb",
    runId: "new",
    exportFile: "wandb-summary.json",
    predictionsFile: "new.json",
  });
  assert.equal(imported.overall.accuracy, 0.9);
  assert.equal(imported.provider.reportedMetrics.accuracy, 0.99);
  const out = await experiments(root, "compare", "old", {
    candidate: "new",
    minSliceSize: 3,
  });
  assert.equal(out.result, "compared");
  assert.ok(Math.abs(out.overall.delta.accuracy - 0.1) < 1e-10);
  assert.ok(out.regressions.some((r) => r.value === "existing"));
  assert.ok(out.slices.find((s) => s.value === "new").smallSample);
  writeFileSync(join(root, "new.json"), "[]");
  assert.equal(
    (await experiments(root, "compare", "old", { candidate: "new" })).result,
    "stale",
  );
});
test("ML comparison refuses mismatched evaluation identities and surfaces temporal/parity failures", async (t) => {
  const root = fixture(t);
  writeFileSync(join(root, "export.json"), '{"runId":"run"}');
  const a = [
    {
      id: "1",
      target: 1,
      prediction: 0.9,
      predictionTime: "2026-01-01T00:00:00Z",
      featureAvailableAt: "2026-01-02T00:00:00Z",
    },
  ];
  writeFileSync(join(root, "a.json"), JSON.stringify(a));
  writeFileSync(join(root, "b.json"), JSON.stringify([{ ...a[0], target: 0 }]));
  let r = await experiments(root, "import", "a", {
    ...metadata,
    revision: 0,
    format: "json",
    exportFile: "export.json",
    predictionsFile: "a.json",
    servingFeatures: {},
  });
  assert.equal(r.temporal.violations, 1);
  assert.equal(r.parity.length, 1);
  await experiments(root, "import", "b", {
    ...metadata,
    revision: 0,
    format: "json",
    exportFile: "export.json",
    predictionsFile: "b.json",
  });
  const out = await experiments(root, "compare", "a", { candidate: "b" });
  assert.equal(out.result, "incomparable");
  assert.equal(out.overall.delta, null);
});

test("ML identities ignore object ordering and regression metrics avoid square overflow", async (t) => {
  const root = fixture(t);
  writeFileSync(join(root, "export.json"), '{"runId":"run"}');
  writeFileSync(
    join(root, "a.json"),
    JSON.stringify([
      { id: "one", target: 0, prediction: 1e200, slices: { a: "x", b: "y" } },
    ]),
  );
  writeFileSync(
    join(root, "b.json"),
    JSON.stringify([
      { id: "one", target: 0, prediction: 1e200, slices: { b: "y", a: "x" } },
    ]),
  );
  const shared = {
    ...metadata,
    revision: 0,
    format: "json",
    task: "regression",
    exportFile: "export.json",
  };
  const a = await experiments(root, "import", "a", {
    ...shared,
    predictionsFile: "a.json",
  });
  assert.equal(a.overall.rmse, 1e200);
  const b = await experiments(root, "import", "b", {
    ...shared,
    predictionsFile: "b.json",
    dataset: { split: "held-out", fingerprint: "dataset-v1", id: "users" },
    servingFeatures: { age: { transform: "v1", dtype: "number" } },
  });
  assert.equal(b.parity.length, 0);
  const result = await experiments(root, "compare", "a", { candidate: "b" });
  assert.equal(result.result, "compared");
  assert.equal(result.overall.delta.rmse, 0);
});

test("human acceptance requires the actually reviewed version, not a bare success claim", async (t) => {
  const root = fixture(t);
  writeFileSync(join(root, "ui.txt"), "version one");
  let r = await proofs(root, "create", "review", {
    revision: 0,
    title: "Review",
    criteria: [
      {
        id: "design",
        text: "Design preference",
        kind: "human",
        files: ["ui.txt"],
      },
    ],
  });
  const shown = await proofs(root, "show", "review");
  const files = shown.criteria[0].currentFiles;
  assert.ok(files["ui.txt"].sha256);
  writeFileSync(join(root, "ui.txt"), "version two");
  await assert.rejects(
    proofs(root, "attach", "review", {
      revision: r.revision,
      criterion: "design",
      source: "User",
      summary: "Accepted version one",
      verdict: "accepted",
      observedAt: new Date().toISOString(),
      files,
    }),
    /exact file identities/,
  );
  assert.equal((await proofs(root, "show", "review")).result, "incomplete");
});
