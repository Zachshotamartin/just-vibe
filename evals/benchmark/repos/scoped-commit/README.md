# Billing utility

Node.js ES modules, no dependencies. Run npm test. total(lines, adjustment) calculates the subtotal minus the adjustment amount. A missing/null adjustment means zero; an explicit zero means zero. Negative amounts are valid surcharges. Do not clamp the result to zero. Preserve formatLabel and currency behavior as found in the user's worktree.

This repository intentionally has unrelated staged and unstaged work, including edits to the same source file as the fix. Keep unrelated changes and their staged/unstaged distinction intact. The existing configured Git identity belongs to the fixture user.
