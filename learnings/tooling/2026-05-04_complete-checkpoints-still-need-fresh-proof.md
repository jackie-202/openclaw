---
title: "Acceptance Retry: Complete Checkpoints Still Need Fresh Proof"
date: 2026-05-04
category: tooling
component: tooling
tags: [acceptance, checkpoint, verification, investigation]
---

# Acceptance Retry: Complete Checkpoints Still Need Fresh Proof

When an acceptance-fix task resumes from its own checkpoint and the checkpoint is already marked `COMPLETE`, do not reopen unrelated investigation work by default. Follow the resume protocol narrowly: rerun the planned lightweight verifier, capture the exact completed output in the final response, then save a new learning for the current session.

This matters for investigation-only Markdown tasks because acceptance can fail even when files were already updated if the handoff did not include self-contained proof. A clean `git diff --check` with no output is valid proof for markdown/checkpoint-only changes, but the final response must say that it completed and include the no-output result explicitly.
