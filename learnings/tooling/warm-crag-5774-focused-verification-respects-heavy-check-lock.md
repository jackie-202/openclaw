---
title: "Focused verification respects the heavy-check lock"
date: 2026-08-17
category: tooling
component: ci-cd
tags: [vitest, verification, heavy-check-lock, openclaw]
file_type: rules
---

OpenClaw's focused Vitest wrapper serializes behind the local heavy-check lock. When the lock belongs to another active test process, do not terminate it to obtain task proof.

For an implementation that is blocked at an authority boundary and makes no production changes, record the waiting command, lock owner, and timeout in the task checkpoint. Run non-conflicting checks such as `git diff --check`, then leave the focused test for a later resume once the unrelated process completes.
