# Teaching method

Teach for understanding and practical use. Adapt to the requested topic, background, time and language; an unknown skill level is a reason to explain terms plainly, not to make the user fill out a questionnaire. Start with the point of the topic and a concrete example. Introduce only prerequisites needed for that example, then build toward implementation and tradeoffs.

## Topic lesson

Explain what the idea does, when it helps, and how it behaves. Define unfamiliar terms when first used. Use connected prose with short code or a simple diagram when that makes the mechanism easier to follow. Walk through the example's state changes, not just its final answer. Separate conceptual costs from implementation/language details.

For linked lists, a useful progression is:

1. A node stores a value and a link to another node; the head identifies the first node and a missing link ends a basic singly linked list.
2. Trace a short list such as A → B → C. Finding C from the head visits earlier nodes; array-style direct indexing is unavailable.
3. Insert X after B when the successor is accessible only through B.next: first set X.next = B.next, then B.next = X. Reversing these assignments makes X point to itself and loses the original successor through B. If a separate reference to C was saved beforehand, explain that B.next = X followed by X.next = C can also work; pointer-order claims depend on which references are available.
4. Explain head insertion/deletion, empty and single-node cases, and the role of a tail pointer. Distinguish singly linked lists from lists with both previous and next links.
5. State complexity with assumptions: insertion after an already-known node can take constant time; locating that position can take linear time. Dynamic-array amortization, allocation overhead and cache locality matter when comparing practical performance.
6. Offer a small exercise, such as deleting the middle node while preserving access to the suffix, without withholding the main explanation until the user answers.

Do not force this exact sequence onto unrelated topics. Choose the example and prerequisites that explain the requested mechanism.

## Tool implementation lesson

Read the target workflow's catalog, skill, pack runbook, and relevant executable source. Distinguish what the agent decides from what utilities enforce. An instruction to verify evidence is different from a utility that records evidence, and neither independently proves a model claim.

Build a concept-to-implementation map: concept, why this tool needs it, where it appears in the current design/code, and how to check it. Show the smallest worked case that exercises the central invariant. For `ml-split`, this includes prediction time and label horizon, dependent observations, temporal/group separation, deterministic membership, and overlap/leakage tests. Explain why a convenient random split can be inappropriate before discussing implementation options.

Use actual file links when source is available. If the command is unknown or its source is unavailable, say what you can explain generally and ask only for the missing target information. Do not invent implementation details or claim future work exists.

## Depth and completion

For a beginner, define terms, reduce the number of simultaneous concepts, and prefer a concrete trace. For an experienced user, focus on invariants, tradeoffs, implementation details and failure cases. A request for a short lesson should remain short; deeper requests can include an ordered learning path.

Use an optional question or exercise to reveal a common misconception. Do not automatically claim mastery, grade the user without an answer, or force an interactive quiz. Save notes, write example files or execute demonstrations only when requested. Naming an operational tool in a lesson does not authorize its external actions.

When the user asks to be quizzed or tested, follow [teach-test](teach-test.md) and use the native question dialog. Carry the lesson's topic, covered concepts and experience level into the quiz so the user does not have to repeat them.
