import {
  object,
  text,
  name,
  strings,
  fileSet,
  identities,
  changed,
  readRecord,
  saveRecord,
  expectRevision,
  locked,
  now,
} from "./workbench.mjs";
const operators = {
  gt: (a, b) => a > b,
  gte: (a, b) => a >= b,
  lt: (a, b) => a < b,
  lte: (a, b) => a <= b,
  eq: (a, b) => a === b,
  ne: (a, b) => a !== b,
};
export async function decisions(root, op, id, input = {}) {
  name(id);
  if (op === "show") {
    object(input, []);
    return readRecord(root, "decisions", id);
  }
  return locked(root, async () => {
    const old = readRecord(root, "decisions", id, true);
    expectRevision(old, input.revision);
    if (op === "save") {
      object(input, [
        "revision",
        "decision",
        "rationale",
        "alternatives",
        "assumptions",
      ]);
      text(input.decision);
      text(input.rationale);
      strings(input.alternatives || [], "alternatives", 30, true);
      if (
        !Array.isArray(input.assumptions) ||
        !input.assumptions.length ||
        input.assumptions.length > 30
      )
        throw Error(
          "Provide 1–30 assumptions with explicit reconsideration triggers.",
        );
      const ids = new Set();
      const assumptions = input.assumptions.map((a) => {
        object(a, ["id", "statement", "trigger", "files"]);
        name(a.id);
        text(a.statement);
        if (ids.has(a.id)) throw Error("Duplicate assumption id.");
        ids.add(a.id);
        if (!a.trigger && !a.files?.length)
          throw Error(
            "Each assumption needs a numeric trigger or watched files.",
          );
        if (a.trigger) {
          object(a.trigger, ["metric", "operator", "value", "maxAgeHours"]);
          name(a.trigger.metric);
          if (
            !Object.hasOwn(operators, a.trigger.operator) ||
            !Number.isFinite(a.trigger.value) ||
            !Number.isFinite(a.trigger.maxAgeHours) ||
            a.trigger.maxAgeHours <= 0 ||
            a.trigger.maxAgeHours > 8760
          )
            throw Error("Invalid numeric trigger or evidence age.");
        }
        return { ...a, files: identities(fileSet(root, a.files || [])) };
      });
      const history = [
        ...(old?.history || []),
        ...(old
          ? [
              {
                revision: old.revision,
                decision: old.decision,
                rationale: old.rationale,
                alternatives: old.alternatives,
                assumptions: old.assumptions,
                replacedAt: now(),
              },
            ]
          : []),
      ];
      if (history.length > 50)
        throw Error(
          "Decision history reached 50 revisions; archive it explicitly.",
        );
      return saveRecord(
        root,
        "decisions",
        id,
        {
          decision: input.decision,
          rationale: input.rationale,
          alternatives: input.alternatives || [],
          assumptions,
          history,
          revisits: old?.revisits || [],
        },
        input.revision,
      );
    }
    if (op !== "revisit" || !old)
      throw Error("Unknown operation or missing decision.");
    object(input, ["revision", "observations"]);
    if (!Array.isArray(input.observations) || input.observations.length > 100)
      throw Error("observations must be a bounded list.");
    const metrics = new Set();
    for (const o of input.observations) {
      object(o, ["metric", "value", "observedAt", "source"]);
      name(o.metric);
      text(o.source);
      if (
        metrics.has(o.metric) ||
        !Number.isFinite(o.value) ||
        !Number.isFinite(Date.parse(o.observedAt))
      )
        throw Error("Invalid or duplicate metric observation.");
      metrics.add(o.metric);
      if (!old.assumptions.some((a) => a.trigger?.metric === o.metric))
        throw Error("Observation does not match a defined trigger.");
    }
    const findings = old.assumptions.map((a) => {
      const changes = changed(
        a.files,
        identities(fileSet(root, Object.keys(a.files))),
      );
      const o = input.observations.find((o) => o.metric === a.trigger?.metric);
      const age = o ? (Date.now() - Date.parse(o.observedAt)) / 3600000 : null;
      const fresh = o && age >= 0 && age <= a.trigger.maxAgeHours;
      return {
        assumption: a.id,
        changedFiles: changes,
        observation: o || null,
        result: changes.length
          ? "reconsider"
          : a.trigger && !fresh
            ? "unknown"
            : a.trigger &&
                operators[a.trigger.operator](o.value, a.trigger.value)
              ? "reconsider"
              : "no-trigger",
        reason: changes.length
          ? "Watched evidence changed; review the assumption."
          : a.trigger && !fresh
            ? "Evidence missing, stale or future-dated."
            : "Evaluated the previously defined trigger.",
      };
    });
    const result = findings.some((f) => f.result === "reconsider")
      ? "reconsider"
      : findings.some((f) => f.result === "unknown")
        ? "unknown"
        : "no-trigger";
    const report = {
      decisionRevision: old.revision,
      observedAt: now(),
      result,
      findings,
      limitation:
        "Supplied metric observations are attributed claims. No trigger firing does not prove the architecture is optimal; reconsideration never changes the implementation automatically.",
    };
    if ((old.revisits?.length || 0) >= 100)
      throw Error(
        "Revisit history reached 100 entries; archive it explicitly.",
      );
    return {
      ...saveRecord(
        root,
        "decisions",
        id,
        { ...old, revisits: [...(old.revisits || []), report] },
        old.revision,
      ),
      result,
      report,
    };
  });
}
