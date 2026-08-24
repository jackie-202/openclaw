---
title: "Omezene overeni opravy auth a compaction"
date: 2026-08-20
category: tooling
component: ci-cd
tags: [vitest, auth, compaction, verification, oxlint]
file_type: checklist
---

# Narrow Auth Repair Verification

For an auth/compaction repair, the explicit regression file proves the resolver
contract, while the smallest useful broader suite should include the related
model-auth and compaction runtime-context tests. This preserves a cheap,
reviewable gate even when unrelated repository changes make `check:changed`
expand to every lane.

If the core Oxlint wrapper is blocked in its extension-boundary artifact
preparation, run the same repository wrapper with
`OPENCLAW_OXLINT_SKIP_PREPARE=1` and the changed core files. Record the
unrelated preparation failure separately rather than claiming the broad lint
gate passed.
