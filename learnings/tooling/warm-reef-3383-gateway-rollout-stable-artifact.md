---
title: "Gateway rollout needs a stable artifact"
date: 2026-08-18
category: tooling
component: ci-cd
tags: [gateway, rollout, dist, test-lock]
file_type: checklist
---

# Gateway rollout must use a stable artifact

When checking a live Gateway that serves `dist/index.js`, do not run multiple source-CLI commands in parallel while the working tree is dirty. Each invocation may rebuild `dist`; overlapping postbuild work can leave one CLI invocation unable to import hashed chunks even though the already-running Gateway remains healthy.

For an operational delivery repair, preserve the active process and obtain the host owner's canonical deploy verifier and restart authorization. A stale service-version audit plus a READY_TO_SEND record is evidence of rollout drift, not authority to restart, reserve, or send manually. Wait for the repository test lock rather than terminating its owner; only a completed isolated test and post-restart read-only evidence can establish the delivery transition.
