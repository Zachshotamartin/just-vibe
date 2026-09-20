import {
  object,
  text,
  name,
  strings,
  fileSet,
  identities,
  changed,
  fromText,
  inheritMode,
  writeState,
  readRecord,
  saveRecord,
  expectRevision,
  locked,
  now,
} from "./workbench.mjs";
import { fingerprint, compareSnapshot } from "./storage.mjs";
import {
  baseProject,
  createWorkspace,
  assertWorkspace,
  validateChecks,
  runChecks,
  workspaceStatus,
  cleanupWorkspaces,
} from "./workspaces.mjs";

export async function practices(root, op, id, input = {}) {
  name(id);
  if (op === "show") {
    object(input, []);
    const r = readRecord(root, "practice", id);
    return {
      id,
      revision: r.revision,
      lesson: r.lesson,
      status: r.status,
      workspace: r.variants.find((v) => v.id === "exercise").path,
      controls: r.controls || null,
      progress: r.progress || null,
      variants: workspaceStatus(root, r).map((v) => ({
        id: v.id,
        path: v.path,
        exists: v.exists,
        snapshot: v.snapshot,
      })),
    };
  }
  return locked(root, async () => {
    let r = readRecord(root, "practice", id, true);
    expectRevision(r, input.revision);
    if (op === "create") {
      object(input, [
        "revision",
        "lesson",
        "edits",
        "checks",
        "checkFiles",
        "hints",
        "saveProgress",
      ]);
      if (r) throw Error("Use a new practice name.");
      object(input.lesson, [
        "title",
        "objective",
        "explanation",
        "sourceFiles",
      ]);
      text(input.lesson.title);
      text(input.lesson.objective);
      text(input.lesson.explanation);
      strings(input.lesson.sourceFiles, "source files");
      fileSet(root, input.lesson.sourceFiles);
      validateChecks(input.checks);
      strings(input.checkFiles, "checkFiles");
      strings(input.hints, "hints", 10);
      if (
        input.saveProgress !== undefined &&
        typeof input.saveProgress !== "boolean"
      )
        throw Error("saveProgress must be boolean.");
      if (
        !Array.isArray(input.edits) ||
        !input.edits.length ||
        input.edits.length > 20
      )
        throw Error("Provide 1–20 starter edits.");
      const paths = new Set();
      for (const edit of input.edits) {
        object(edit, ["path", "content"]);
        if (paths.has(edit.path) || input.checkFiles.includes(edit.path))
          throw Error("Duplicate starter edit or protected test edit.");
        paths.add(edit.path);
        fromText(edit.content);
      }
      const protectedFiles = identities(fileSet(root, input.checkFiles));
      if (Object.values(protectedFiles).some((v) => v === null))
        throw Error("Every protected test must exist in the source project.");
      const base = baseProject(root, [
          ...input.lesson.sourceFiles,
          ...input.checkFiles,
        ]),
        variants = ["solution", "exercise"].map((v) => ({
          id: v,
          path: `.just-vibe/workspaces/practice-${id}-${v}`,
        }));
      r = saveRecord(
        root,
        "practice",
        id,
        {
          base,
          variants,
          lesson: input.lesson,
          checks: input.checks,
          protectedFiles,
          hints: input.hints,
          saveProgress: input.saveProgress || false,
          status: "creating",
        },
        0,
      );
      for (const v of variants) createWorkspace(root, r, v);
      const exercise = assertWorkspace(root, r, variants[1]);
      for (const edit of input.edits) {
        const before = fileSet(exercise, [edit.path])[edit.path];
        writeState(
          exercise,
          edit.path,
          inheritMode(fromText(edit.content, before?.executable || false), before),
        );
      }
      return saveRecord(
        root,
        "practice",
        id,
        {
          ...r,
          status: "needs-validation",
          starterSnapshot: fingerprint(exercise),
          solutionSnapshot: fingerprint(assertWorkspace(root, r, variants[0])),
        },
        r.revision,
      );
    }
    if (!r) throw Error("Create the exercise first.");
    const allowed = {
      validate: ["revision"],
      submit: ["revision"],
      hint: ["revision", "level"],
      cleanup: ["revision", "expected"],
    }[op];
    if (!allowed) throw Error(`Unknown practice operation: ${op}`);
    object(input, allowed);
    if (op === "cleanup") {
      await cleanupWorkspaces(root, r, input.expected);
      return saveRecord(
        root,
        "practice",
        id,
        { ...r, status: "cleaned" },
        r.revision,
      );
    }
    if (op === "hint") {
      if (
        !Number.isInteger(input.level) ||
        input.level < 1 ||
        input.level > r.hints.length
      )
        throw Error("Choose an available hint level.");
      if (r.saveProgress)
        r = saveRecord(
          root,
          "practice",
          id,
          {
            ...r,
            progress: {
              ...(r.progress || {}),
              hintsViewed: [
                ...new Set([...(r.progress?.hintsViewed || []), input.level]),
              ],
            },
          },
          r.revision,
        );
      return {
        revision: r.revision,
        level: input.level,
        hint: r.hints[input.level - 1],
      };
    }
    const exercise = assertWorkspace(root, r, r.variants[1]),
      testPaths = Object.keys(r.protectedFiles);
    if (
      changed(r.protectedFiles, identities(fileSet(exercise, testPaths))).length
    )
      throw Error(
        "Protected exercise tests changed; restore them before assessment.",
      );
    if (op === "validate") {
      if (r.status !== "needs-validation")
        throw Error("Controls already validated or exercise not ready.");
      const solution = assertWorkspace(root, r, r.variants[0]);
      if (
        compareSnapshot(r.starterSnapshot, fingerprint(exercise)).stale ||
        compareSnapshot(r.solutionSnapshot, fingerprint(solution)).stale
      )
        throw Error(
          "Control workspaces changed; create a fresh exercise without overwriting learner work.",
        );
      const positive = await runChecks(solution, r.checks),
        negative = await runChecks(exercise, r.checks);
      const valid =
        positive.result === "passed" &&
        negative.result === "failed" &&
        negative.results.some(
          (c) => c.status !== 0 && !c.error && !c.timedOut && !c.truncated,
        );
      r = saveRecord(
        root,
        "practice",
        id,
        {
          ...r,
          status: valid ? "ready" : "invalid-controls",
          controls: { positive, negative, valid },
          checkFingerprint: identities(fileSet(exercise, testPaths)),
        },
        r.revision,
      );
      return {
        ...r,
        result: valid ? "validated" : "failed",
        limitation:
          "Controls establish sensitivity to the seeded exercise, not complete assessment quality. Review that the failure concerns the taught behavior.",
      };
    }
    if (r.status !== "ready")
      throw Error(
        "Validate positive and negative controls before accepting submissions.",
      );
    const assessment = await runChecks(exercise, r.checks);
    const tampered = changed(
      r.protectedFiles,
      identities(fileSet(exercise, testPaths)),
    ).length;
    if (tampered) assessment.result = "invalid";
    if (r.saveProgress) {
      if ((r.progress?.submissions?.length || 0) >= 100)
        throw Error("Practice submission limit reached.");
      r = saveRecord(
        root,
        "practice",
        id,
        {
          ...r,
          progress: {
            ...(r.progress || {}),
            submissions: [
              ...(r.progress?.submissions || []),
              { observedAt: now(), result: assessment.result },
            ],
          },
        },
        r.revision,
      );
    }
    return {
      id,
      revision: r.revision,
      result: assessment.result,
      assessment,
      progressSaved: r.saveProgress,
      limitation:
        "Behavioral checks against the supplied exercise. This is a learning workspace, not a tamper-proof examination or a complete measure of understanding.",
    };
  });
}
