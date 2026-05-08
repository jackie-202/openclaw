---
title: "Complete checkpoints still need fresh verifier proof"
date: 2026-05-04
category: tooling
component: tooling
tags: [acceptance, checkpoint, verification, resume-protocol, evidence]
---

A task checkpoint marked `COMPLETE` is not sufficient evidence for an acceptance retry by itself. In this case, the correct resume path was to rerun a lightweight verifier (`git diff --check`) and report fresh output, instead of reopening the investigation or trying to clean up unrelated pre-existing worktree noise.

Reuse this pattern when resuming completed investigation or acceptance tasks:

- treat the checkpoint as prior context, not final proof
- collect one or more fresh, low-cost verification commands relevant to the acceptance criteria
- keep scope narrow if no code changed during the resume
- avoid getting pulled into unrelated untracked files or historical state unless they block verification

This keeps acceptance retries auditable and cheap while preventing unnecessary re-debugging.
