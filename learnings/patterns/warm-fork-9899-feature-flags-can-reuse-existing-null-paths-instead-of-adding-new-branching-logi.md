---
title: "Feature flags can reuse existing null-paths instead of adding new branching logic"
date: 2026-05-03
category: patterns
component: backend
tags: [trajectory, feature-flag, cron, runner, no-op]
---

The `trajectory` opt-out for cron `agentTurn` payloads was implemented by threading a `trajectoryEnabled` boolean through the cron executor into `runEmbeddedPiAgent`, then skipping the trajectory recorder factory when the flag is `false`. This reused the runner's existing `null` no-op path instead of inventing a separate disabled-mode implementation.

This is a good pattern to reuse: when adding an opt-out flag to a deep execution path, prefer propagating a single boolean and plugging it into an already-supported no-op boundary. It keeps the call graph simple, minimizes new behavior branches, and makes focused tests straightforward.
