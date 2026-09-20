Determine whether a new PR is needed for the requested fork branch. Return {"existingPr":number|null,"headSha":string,"createNeeded":boolean,"unsubmittedLocalFiles":string[]}. Do not contact GitHub.

Use only supplied local artifacts. No network, installations, external services, commits, or subagents. Preserve all inputs except explicitly requested implementation files. Return the requested JSON report in your final answer.
