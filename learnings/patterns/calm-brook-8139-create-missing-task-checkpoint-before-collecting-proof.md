---
title: "Create missing task checkpoint before collecting proof"
date: 2026-06-10
category: patterns
component: tooling
tags: [checkpoint, proof-artifacts, task-resume, acceptance]
---

When resuming a verification task, the expected checkpoint file may not exist yet. In this case, the run failed on `plans/checkpoints/calm-brook-8139.checkpoint.md`, and progress only continued after creating the checkpoint first and then appending evidence.

Reuse this pattern: before replaying plan steps or gathering acceptance proof, verify that the task checkpoint artifact exists and create it if missing. This avoids a dead start on resume and keeps later evidence updates scoped to the required proof files.
