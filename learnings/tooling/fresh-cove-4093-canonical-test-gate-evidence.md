---
title: "Canonical Test Gate evidence is separate from local output"
date: 2026-08-19
category: tooling
component: ci-cd
tags: [acceptance, test-gate, vitest, evidence]
file_type: rules
---

# Canonical Test Gate Evidence Is Separate From Local Output

An acceptance result that names a Test Gate as `not-run` cannot be repaired by
repeating its local Vitest summary in a checkpoint. Record the exact command,
the caller-owned non-`not-run` run reference, exit code, and complete suite
totals in a dedicated gate artifact, then verify the retry result consumes it.
