---
title: "Cross-repository GREEN requires a complete authority handoff"
date: 2026-08-23
category: tooling
component: tooling
tags: [cross-repository, tdd, provenance, authority-gate]
file_type: rules
---

# Cross-repository GREEN requires a complete authority handoff

When a consumer task must regenerate contracts and execute an owner runtime at an accepted immutable revision, a repository URL or a clean current checkout is not enough. The handoff must bind the full commit SHA, all contract and runtime file hashes, the exact named scenario assignment, and exact owner test selectors into one coherent bundle.

If historical task evidence truncates commands or omits any of those values, local passing tests cannot substitute for owner-backed GREEN. Record the genuine historical behavioral RED, run local tests only as explicitly scoped supporting evidence, and stop before production edits rather than selecting a plausible owner revision or inferring missing scenario names.

For Deliberation specifically, owner revisions retaining burst aggregation or incompatible unknown-delivery recovery are setup mismatches. They must not be used to regenerate OpenClaw mirrors even when their checkout is clean and their hashes are known.
