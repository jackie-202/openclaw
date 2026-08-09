---
title: "Evidence-only plans need an explicit external-gate stop"
date: 2026-08-09
category: tooling
component: ci-cd
tags: [acceptance, test-gate, evidence, planning, cross-repository]
file_type: rules
---

# Evidence-only plans need an explicit external-gate stop

When acceptance requires a caller-owned Test Gate, the implementation agent cannot close the finding by repeating local tests. The plan must make the missing gate a hard stop, name the exact metadata the caller must supply, and preserve any nonzero aggregate result even when focused selections pass.

For cross-repository goals, require the canonical runner to discover the external suite command from that checkout's maintained configuration. A historical test count or truncated command is provenance, not enough information to reconstruct or certify the gate.
