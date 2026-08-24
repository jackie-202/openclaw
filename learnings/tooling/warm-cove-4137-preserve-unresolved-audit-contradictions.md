---
title: "Preserve unresolved contradictions in final audit plans"
date: 2026-08-22
category: tooling
component: shared
tags: [audit, deliberation, evidence, planning, rollout-safety]
file_type: checklist
---

# Preserve unresolved contradictions in final audit plans

When a final safety audit follows several completed remediation slices, completion checkpoints are historical evidence rather than proof that the original blocker is closed.

Build the plan from the original blocker ledger and trace each invariant through current source, callers, sibling paths, tests, and exact recorded commands. Carry any contradiction forward as a named diagnosis gate. In particular, a locally green mirror or fixture suite cannot close a still-RED owner-runtime integration, and one channel intake call per provider event cannot close separate-item semantics while the mirrored owner contract still permits burst aggregation.

Rerun only evidence that is missing, stale, unreadable, or contradictory. This keeps a read-only audit bounded while preventing a `SAFE` verdict from being inferred from checkpoint summaries, hashes, or mocked wrapper counts.
