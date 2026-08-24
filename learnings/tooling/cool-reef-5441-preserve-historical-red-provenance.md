---
title: "Evidence repairs preserve historical RED provenance"
date: 2026-08-21
category: tooling
component: tooling
tags: [tdd, acceptance, evidence, documentation, deliberation]
file_type: rules
---

# Evidence repairs must preserve historical RED provenance

When an acceptance follow-up starts after the production behavior already exists, creating a new failing test by reverting or weakening implementation is false TDD evidence. Reuse the parent task's genuine RED record with its exact command, timestamp, failure, and artifact path, then run that identical command fresh for GREEN under the follow-up task.

The standard proof helper rejects manually imported historical RED metadata because it only trusts RED files it created itself. In an evidence-repair task, record that limitation explicitly rather than fabricating a new RED. The follow-up proof should remain independently auditable: include the parent artifact path, the original failing assertion and counts, the exact command in both phases, and fresh successful output.

Documentation repair must also follow the current producer boundary rather than stale slice language. For Deliberation, authenticated admission selects one normalized pipeline, derives an omitted target from the authenticated source and source thread, converts explicit targets exactly, and sends `pipelineId` plus `deliveryTarget` at intake. There is no global common-target projection or reservation-time override. KM adoption remains a separate rollout gate and must not be presented as already complete.
