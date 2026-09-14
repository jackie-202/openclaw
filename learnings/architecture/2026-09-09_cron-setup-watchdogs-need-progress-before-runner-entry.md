---
title: "Cron setup watchdogs need progress before runner entry"
date: 2026-09-09
category: architecture
component: backend
tags: [openclaw, cron, watchdog, cancellation, diagnostics, testing]
file_type: rules
---

# Cron setup watchdogs need progress before runner entry

An isolated cron setup watchdog cannot diagnose preparation stalls if its first progress callback is emitted only after the complete preparation function returns. In this code path, workspace/bootstrap, plugin loading, model/provider preflight, catalog lookup, delivery resolution, skills persistence, session persistence, cleanup, and auth resolution all precede runner entry.

Keep setup progress in the existing cron watchdog owner. Emit only closed stage names, job/run identifiers, and bounded elapsed milliseconds immediately before meaningful awaits; never include prompts, paths, credential details, or arbitrary exception text. Preserve the stable timeout prefix so persistence, alerts, and retry classification do not change.

Timeout abort does not interrupt an arbitrary in-flight promise. Check the existing signal after each awaited stage and once before executor dispatch, then test a deferred stage that resolves after timeout. The proof must show one service-owned terminal failure, retained stage evidence, cleanup cardinality, and no model dispatch or second terminal event after late release.
