Inspect checkpoint metadata for requested exact continuation. Return {"exactResumeEstablished":boolean,"missingRequiredState":string[],"safeClaim":string}. Use safeClaim = "restart-or-approximate" or "exact-resume".

Use only supplied local artifacts. No network, installations, external services, commits, or subagents. Preserve all inputs except explicitly requested implementation files. Return the requested JSON report in your final answer.
