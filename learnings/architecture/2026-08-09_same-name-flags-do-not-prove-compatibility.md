---
title: "Same-name flags do not prove compatibility"
date: 2026-08-09
category: architecture
component: shared
tags: [compatibility, audit, activation, cron, trajectory]
file_type: rules
---

# Same-name flags do not prove compatibility

When comparing a fork feature with an upstream replacement, finding a similarly named runner flag is only an inventory result. Prove compatibility through an activation ledger that starts at the public or persisted input, follows every normalization and dispatch boundary, covers retries and alternate harnesses, and ends at the side effect.

For cron trajectory suppression, the fork's `trajectory?: boolean` payload and upstream's generic `disableTrajectory?: boolean` occupy different contract layers. The audit must separately establish whether cron can source the upstream flag, whether fallback and model-switch retries preserve it, where each harness creates a recorder, and how old persisted payloads are accepted or rejected. A recorder-level unit test cannot prove cron-level equivalence when the cron caller never supplies the flag.

Use a scenario matrix with source/default, propagation, retry behavior, enforcement point, persisted/API compatibility, and final side effect. Keep absent repository-only evidence as a stated gap rather than inferring equivalence from types, tests, or names.
