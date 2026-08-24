---
title: "Verify immutable authority before behavioral TDD"
date: 2026-08-23
category: tooling
component: general
tags: [immutable-inputs, provenance, revision-gate, tdd]
---

The authority checkout contained clean files with the expected SHA-256 hashes, but its repository revision differed from the explicitly approved commit. File hashes alone were therefore insufficient to pass the immutable-input gate. Reuse a two-part verification: confirm the exact authority revision and independently confirm scoped cleanliness and artifact hashes before editing tests or production code. If the revision fails and the task is prohibited from changing the authority checkout, stop and record the blocker rather than silently resetting it or proceeding from apparently identical files.
