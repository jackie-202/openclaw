---
title: "Fresh owner main is evidence, not approval"
date: 2026-08-23
category: tooling
component: ci-cd
tags: [deliberation, cross-repository, provenance, tdd, packaging]
file_type: checklist
---

# Fresh owner main is evidence, not approval

For cross-repository rollout gates, cloning the latest owner `main` is a useful preflight but does not make that revision approved or semantically converged.

In the Deliberation gate, fresh owner revision `9ad21d9670eb3178cfcfe4c222b10b288b2b601a` reproduced the exact hashes already marked as mismatched in OpenClaw provenance. Direct inspection also showed three incompatible behaviors: fixed 60-second burst aggregation, delivery targets without `mode`, and invoked-without-receipt recovery that terminalizes as failure. The owner-backed integration therefore remained 12 passing and 11 failing scenarios with positive intake rejected as `SCHEMA_INVALID`.

The safe sequence is:

1. Record the immutable owner revision and hashes.
2. Inspect schema and lifecycle semantics, not hashes alone.
3. Run the real listener against isolated SQLite state.
4. Treat setup, provenance, and schema mismatch as a hard rollout blocker.
5. Never rename a failing identical-command GREEN attempt as passing evidence; preserve the helper's refusal.

Supporting local tests and a successful generic package integrity check remain separate evidence. A package can pass generic integrity while omitting an untracked plugin artifact because bundled plugin build inventory is derived from `git ls-files`; the installed product-specific test is the decisive check.
