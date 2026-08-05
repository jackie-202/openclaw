---
title: "Recover missing task checkpoints from parent artifacts"
date: 2026-08-02
category: patterns
component: tooling
tags: [checkpoints, task-resume, provenance, artifacts]
---

The run-scoped checkpoint for `fresh-fork-4718` did not exist when the task resumed. The useful state was instead preserved under the parent task's plan, checkpoint, and RED/GREEN proof. When a child or follow-up checkpoint is missing, inspect parent artifacts before assuming implementation context is lost. Create a new run-scoped checkpoint and proof that cite the parent evidence rather than duplicating or reconstructing production work.
