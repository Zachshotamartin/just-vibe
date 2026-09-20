import { readFileSync, lstatSync } from "node:fs";
import {
  object,
  text,
  name,
  safePath,
  digest,
  readJson,
  readRecord,
  saveRecord,
  expectRevision,
  locked,
  now,
  stableJson,
} from "./workbench.mjs";

function boundedFile(root, path) {
  const full = safePath(root, path),
    stat = lstatSync(full);
  if (!stat.isFile() || stat.size > 8 * 1024 * 1024)
    throw Error("Experiment exports must be regular files up to 8 MiB.");
  return {
    path,
    sha256: digest(readFileSync(full)),
    data: readJson(full, 8 * 1024 * 1024),
  };
}
function featureMap(value) {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.keys(value).length > 1000
  )
    throw Error("Provide a feature map.");
  for (const [k, v] of Object.entries(value)) {
    text(k, "feature", 200);
    object(v, ["dtype", "transform"]);
    text(v.dtype, "dtype", 100);
    text(v.transform, "transform identifier", 500);
  }
  return value;
}
function metrics(rows, task, threshold) {
  if (!rows.length) return { count: 0 };
  if (task === "regression") {
    const errors = rows.map((r) => Math.abs(r.prediction - r.target));
    if (errors.some((e) => !Number.isFinite(e)))
      throw Error("Regression error exceeds finite numeric range.");
    const scale = Math.max(...errors),
      normalized = scale ? errors.map((e) => e / scale) : errors;
    return {
      count: rows.length,
      mae: scale * (normalized.reduce((s, e) => s + e, 0) / rows.length),
      rmse:
        scale *
        Math.sqrt(normalized.reduce((s, e) => s + e * e, 0) / rows.length),
    };
  }
  let tp = 0,
    tn = 0,
    fp = 0,
    fn = 0;
  for (const r of rows) {
    const prediction = r.prediction >= threshold;
    if (prediction && r.target === 1) tp++;
    else if (prediction) fp++;
    else if (r.target === 1) fn++;
    else tn++;
  }
  return {
    count: rows.length,
    accuracy: (tp + tn) / rows.length,
    precision: tp + fp ? tp / (tp + fp) : null,
    recall: tp + fn ? tp / (tp + fn) : null,
    f1: 2 * tp + fp + fn ? (2 * tp) / (2 * tp + fp + fn) : null,
    confusion: { tp, tn, fp, fn },
  };
}
function validateRows(rows, task) {
  if (!Array.isArray(rows) || !rows.length || rows.length > 50000)
    throw Error("Provide 1–50000 prediction rows.");
  const ids = new Set();
  for (const r of rows) {
    object(r, [
      "id",
      "target",
      "prediction",
      "slices",
      "predictionTime",
      "featureAvailableAt",
    ]);
    text(r.id, "row id", 200);
    if (ids.has(r.id)) throw Error("Duplicate prediction row id.");
    ids.add(r.id);
    if (
      !Number.isFinite(r.target) ||
      !Number.isFinite(r.prediction) ||
      (task === "binary" &&
        (![0, 1].includes(r.target) || r.prediction < 0 || r.prediction > 1))
    )
      throw Error("Invalid target or prediction for this task.");
    if (
      r.slices !== undefined &&
      (!r.slices ||
        typeof r.slices !== "object" ||
        Array.isArray(r.slices) ||
        Object.keys(r.slices).length > 20)
    )
      throw Error("Invalid slice dimensions.");
    for (const [k, v] of Object.entries(r.slices || {})) {
      text(k, "slice dimension", 100);
      text(v, "slice value", 200);
    }
    if (
      (r.predictionTime === undefined) !==
      (r.featureAvailableAt === undefined)
    )
      throw Error(
        "Temporal checks need both predictionTime and featureAvailableAt.",
      );
    if (
      r.predictionTime !== undefined &&
      ![r.predictionTime, r.featureAvailableAt].every(
        (v) => typeof v === "string" && Number.isFinite(Date.parse(v)),
      )
    )
      throw Error("Invalid temporal timestamp.");
  }
}
function normalizeProvider(format, exported) {
  if (format === "json") {
    const values = exported.metrics || {};
    if (!values || typeof values !== "object" || Array.isArray(values))
      throw Error("Reported metrics must be an object.");
    return {
      runId: text(exported.runId, "runId"),
      reportedMetrics: Object.fromEntries(
        Object.entries(values).filter(([, v]) => Number.isFinite(v)),
      ),
    };
  }
  if (format === "mlflow") {
    const run = exported.run;
    if (!run?.info || !Array.isArray(run?.data?.metrics))
      throw Error("Expected an MLflow Get Run JSON response.");
    return {
      runId: text(run.info.run_id, "MLflow run_id"),
      reportedMetrics: Object.fromEntries(
        run.data.metrics
          .filter((m) => typeof m.key === "string" && Number.isFinite(m.value))
          .map((m) => [m.key, m.value]),
      ),
      reference: "MLflow Get Run export",
    };
  }
  if (format === "wandb") {
    if (!exported || typeof exported !== "object" || Array.isArray(exported))
      throw Error("Expected a W&B summary JSON object.");
    return {
      reportedMetrics: Object.fromEntries(
        Object.entries(exported).filter(([, v]) => Number.isFinite(v)),
      ),
      reference: "W&B summary export; run identity supplied explicitly",
    };
  }
  throw Error("format must be json, mlflow or wandb.");
}
export async function experiments(root, op, id, input = {}) {
  name(id);
  if (op === "import")
    return locked(root, async () => {
      object(input, [
        "revision",
        "format",
        "exportFile",
        "predictionsFile",
        "runId",
        "task",
        "dataset",
        "model",
        "codeRevision",
        "seed",
        "preprocessing",
        "trainingFeatures",
        "servingFeatures",
        "threshold",
      ]);
      expectRevision(readRecord(root, "experiments", id, true), input.revision);
      if (!["binary", "regression"].includes(input.task))
        throw Error(
          "Supported tasks: binary probability classification and regression.",
        );
      object(input.dataset, ["id", "fingerprint", "split"]);
      text(input.dataset.id);
      text(input.dataset.fingerprint);
      text(input.dataset.split);
      text(input.model);
      text(input.codeRevision);
      text(input.preprocessing);
      if (!Number.isInteger(input.seed))
        throw Error("Provide the experiment seed.");
      featureMap(input.trainingFeatures);
      featureMap(input.servingFeatures);
      const threshold = input.threshold ?? 0.5;
      if (!Number.isFinite(threshold) || threshold < 0 || threshold > 1)
        throw Error("threshold must be between zero and one.");
      const exported = boundedFile(root, input.exportFile),
        predictions = boundedFile(root, input.predictionsFile),
        provider = normalizeProvider(input.format, exported.data);
      const rows = predictions.data.rows || predictions.data;
      validateRows(rows, input.task);
      if (input.runId && provider.runId && input.runId !== provider.runId)
        throw Error("Run identity conflicts with the export.");
      const runId = text(input.runId || provider.runId, "run id");
      const dimensions = [
        ...new Set(rows.flatMap((r) => Object.keys(r.slices || {}))),
      ].sort();
      const groups = new Map();
      for (const r of rows)
        for (const dimension of dimensions) {
          const value = r.slices?.[dimension] ?? null,
            key = JSON.stringify([dimension, value]);
          if (!groups.has(key)) groups.set(key, []);
          groups.get(key).push(r);
          if (groups.size > 200)
            throw Error(
              "More than 200 slices; narrow the exported dimensions.",
            );
        }
      const slices = [...groups].map(([key, group]) => {
        const [dimension, value] = JSON.parse(key);
        return {
          dimension,
          value,
          metrics: metrics(group, input.task, threshold),
        };
      });
      const parity = [
        ...new Set([
          ...Object.keys(input.trainingFeatures),
          ...Object.keys(input.servingFeatures),
        ]),
      ]
        .sort()
        .filter(
          (k) =>
            stableJson(input.trainingFeatures[k]) !==
            stableJson(input.servingFeatures[k]),
        )
        .map((feature) => ({
          feature,
          training: input.trainingFeatures[feature] ?? null,
          serving: input.servingFeatures[feature] ?? null,
        }));
      const timed = rows.filter((r) => r.predictionTime !== undefined),
        temporalViolations = timed.filter(
          (r) =>
            Date.parse(r.featureAvailableAt) > Date.parse(r.predictionTime),
        );
      const evaluationIdentity = digest(
        stableJson(
          [...rows]
            .sort((a, b) => a.id.localeCompare(b.id))
            .map((r) => [r.id, r.target, r.slices || {}]),
        ),
      );
      const { revision, exportFile, predictionsFile, ...metadata } = input;
      return saveRecord(
        root,
        "experiments",
        id,
        {
          metadata: { ...metadata, threshold, runId },
          provider,
          inputs: [
            { path: exported.path, sha256: exported.sha256 },
            { path: predictions.path, sha256: predictions.sha256 },
          ],
          evaluationIdentity,
          overall: metrics(rows, input.task, threshold),
          slices,
          parity,
          temporal: {
            checked: timed.length,
            total: rows.length,
            violations: temporalViolations.length,
          },
          observedAt: now(),
          limitation:
            "Metrics recomputed from supplied predictions; dataset/model fingerprints and metadata are caller-supplied identities. No training, provider login, causal attribution or deployment occurred. Raw prediction rows are not copied into the record.",
        },
        revision,
      );
    });
  if (op === "show") {
    object(input, []);
    return readRecord(root, "experiments", id);
  }
  if (op !== "compare") throw Error(`Unknown experiment operation: ${op}`);
  object(input, ["candidate", "minSliceSize"]);
  name(input.candidate);
  const minimum = input.minSliceSize ?? 20;
  if (!Number.isInteger(minimum) || minimum < 1)
    throw Error("minSliceSize must be positive.");
  const baseline = readRecord(root, "experiments", id),
    candidate = readRecord(root, "experiments", input.candidate),
    stale = [];
  for (const run of [baseline, candidate])
    for (const f of run.inputs) {
      try {
        if (boundedFile(root, f.path).sha256 !== f.sha256)
          stale.push({ run: run.id, path: f.path });
      } catch {
        stale.push({ run: run.id, path: f.path });
      }
    }
  const incompatible = [];
  if (baseline.metadata.task !== candidate.metadata.task)
    incompatible.push("task");
  if (
    stableJson(baseline.metadata.dataset) !==
    stableJson(candidate.metadata.dataset)
  )
    incompatible.push("dataset identity or split");
  if (baseline.evaluationIdentity !== candidate.evaluationIdentity)
    incompatible.push("evaluation row identities, targets or slice membership");
  function delta(a, b) {
    return Object.fromEntries(
      Object.keys(a)
        .filter(
          (k) =>
            k !== "count" &&
            typeof a[k] === "number" &&
            typeof b[k] === "number",
        )
        .map((k) => [k, b[k] - a[k]]),
    );
  }
  const comparable = !stale.length && !incompatible.length;
  const slices = baseline.slices.map((a) => {
    const b = candidate.slices.find(
      (s) => s.dimension === a.dimension && s.value === a.value,
    );
    return {
      dimension: a.dimension,
      value: a.value,
      baseline: a.metrics,
      candidate: b?.metrics ?? null,
      smallSample: a.metrics.count < minimum || !b || b.metrics.count < minimum,
      delta: comparable && b ? delta(a.metrics, b.metrics) : null,
    };
  });
  const metric = baseline.metadata.task === "binary" ? "accuracy" : "mae",
    direction = metric === "accuracy" ? 1 : -1;
  const regressions = comparable
    ? slices
        .filter((s) => s.delta && direction * s.delta[metric] < 0)
        .map((s) => ({
          dimension: s.dimension,
          value: s.value,
          delta: s.delta[metric],
          smallSample: s.smallSample,
        }))
    : [];
  return {
    result: stale.length
      ? "stale"
      : incompatible.length
        ? "incomparable"
        : "compared",
    baseline: id,
    candidate: input.candidate,
    stale,
    incompatible,
    overall: {
      baseline: baseline.overall,
      candidate: candidate.overall,
      delta: comparable ? delta(baseline.overall, candidate.overall) : null,
    },
    slices,
    regressions,
    parity: { baseline: baseline.parity, candidate: candidate.parity },
    temporal: { baseline: baseline.temporal, candidate: candidate.temporal },
    metadataChanges: [
      "model",
      "codeRevision",
      "seed",
      "preprocessing",
      "threshold",
    ].filter((k) => baseline.metadata[k] !== candidate.metadata[k]),
    interpretation: comparable
      ? "Investigate slice regressions alongside coverage, uncertainty and parity. Observed differences do not identify their cause."
      : "Resolve identity and freshness before ranking runs.",
  };
}
