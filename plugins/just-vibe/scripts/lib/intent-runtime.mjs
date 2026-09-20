import { memory, guards } from "./memory.mjs";
import { tasks } from "./tasks.mjs";
import { labs } from "./workspaces.mjs";
import { proofs } from "./proof.mjs";
import { practices } from "./practice.mjs";
import { experiments } from "./experiments.mjs";
import { decisions } from "./decisions.mjs";
import { listRecords, recoverLock, projectRoot } from "./workbench.mjs";

// [name required, input: required/optional/none]. Keep CLI errors ahead of side effects.
export const INTENT_OPERATIONS = {
  memory: {
    save: [true, "required"],
    retire: [true, "required"],
    recover: [true, "required"],
    inspect: [false, "optional"],
  },
  guard: {
    create: [true, "required"],
    check: [true, "none"],
    show: [true, "none"],
  },
  task: {
    begin: [true, "required"],
    capture: [true, "required"],
    preview: [true, "none"],
    undo: [true, "required"],
    recover: [true, "required"],
    show: [true, "none"],
  },
  lab: {
    recover: [true, "required"],
    create: [true, "required"],
    check: [true, "required"],
    preview: [true, "required"],
    stop: [true, "required"],
    select: [true, "required"],
    cleanup: [true, "required"],
    show: [true, "none"],
    report: [true, "none"],
  },
  proof: {
    create: [true, "required"],
    run: [true, "required"],
    collect: [true, "required"],
    attach: [true, "required"],
    show: [true, "none"],
    report: [true, "none"],
  },
  practice: {
    create: [true, "required"],
    validate: [true, "required"],
    submit: [true, "required"],
    hint: [true, "required"],
    cleanup: [true, "required"],
    show: [true, "none"],
  },
  experiment: {
    import: [true, "required"],
    compare: [true, "required"],
    show: [true, "none"],
  },
  decision: {
    save: [true, "required"],
    revisit: [true, "required"],
    show: [true, "none"],
  },
  workbench: { list: [false, "none"], recover: [false, "none"] },
};
export function validateIntentArgs(options) {
  const spec = INTENT_OPERATIONS[options.operation]?.[options.positionals[0]];
  if (!spec || options.positionals.length !== (spec[0] ? 2 : 1))
    throw Error(
      "Unknown operation or wrong number of names; see the intent workflow guide.",
    );
  if (spec[1] === "required" && !options.stdin)
    throw Error("This operation requires --stdin JSON.");
  if (spec[1] === "none" && options.stdin)
    throw Error("--stdin does not apply to this operation.");
}
export async function intentRuntime(operation, root, op, id, input = {}) {
  root = projectRoot(root);
  if (operation === "workbench")
    return op === "recover"
      ? recoverLock(root)
      : Object.fromEntries(
          [
            "memory",
            "guards",
            "tasks",
            "labs",
            "proofs",
            "practice",
            "experiments",
            "decisions",
          ].map((c) => [c, listRecords(root, c)]),
        );
  const handlers = {
    memory,
    guard: guards,
    task: tasks,
    lab: labs,
    proof: proofs,
    practice: practices,
    experiment: experiments,
    decision: decisions,
  };
  return handlers[operation](root, op, id, input);
}
