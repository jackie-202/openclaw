---
title: "Keep acceptance evidence self-contained and byte-verifiable"
date: 2026-07-24
category: tooling
component: tooling
tags: [acceptance, evidence, diff, provenance]
---

Acceptance remained blocked even though the preserved source diff was valid, complete, and reverse-applicable because reviewers could not inspect the opaque external artifact directly. The resolution was to embed the entire diff in a review-visible Markdown artifact and verify it byte-for-byte against the canonical source, count all 13 `diff --git` paths, and reject truncation markers. Reuse this pattern for acceptance retries: provide immutable source provenance plus complete inline review material rather than references to artifacts the reviewer cannot inspect.