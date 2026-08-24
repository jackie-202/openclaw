---
title: "Přímý owner gate musí vykonat caller boundary"
date: 2026-08-24
category: patterns
component: e2e
tags: [cross-repository, owner-runtime, acceptance, sqlite, tdd]
file_type: rules
---

# Direct owner gates must exercise the caller boundary

Cross-repository acceptance names are not evidence by themselves. A harness that maps OR labels to upstream pytest selectors can report every leaf green while never exercising the OpenClaw producer, client parser, or final adapter against the owner runtime.

For owner-backed convergence gates:

1. Start the verified owner listener on loopback with sentinel-protected disposable SQLite state.
2. Drive the real caller boundary for each leaf: producer for intake, KM client for lifecycle parsing, and final adapter for provider ordering.
3. Pass source history and cutoffs explicitly. Never reconstruct history authority from canonical intake messages.
4. For malformed historical state, create the fixture through bounded owner-side test setup, project it through the owner, then feed that projection through the real caller parser.
5. Prove migration rollback by comparing the complete logical SQLite dump before and after an injected failure, not a small sample of columns or metadata.
6. Keep canonical reporter names stable even when assertions become stronger; exact-selector ledgers otherwise lose the leaf.

The useful distinction is between owner behavior, caller interpretation, and reporter accounting. A trustworthy gate binds all three in one executable scenario.
