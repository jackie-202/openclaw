---
title: "Acceptance evidence: inline verbatim diffs and formatter boundaries"
date: 2026-07-24
category: tooling
component: tooling
tags: [acceptance, evidence, diff, formatting, tdd]
file_type: rules
---

# Acceptance retries must expose opaque artifacts inline

When acceptance reports that a referenced `.diff` exists but was absent from caller-supplied semantic material, regenerating the same file or adding another checksum does not fix the evidence boundary.

Create a task-scoped Markdown evidence artifact containing the complete diff verbatim, then link that Markdown file from the current checkpoint and semantic evidence map. Validate the embedded payload against the preserved source artifact byte-for-byte and reject truncation markers.

Keep this repair evidence-only. Do not alter production code unless direct inspection finds a real defect, and do not fabricate a new RED after implementation exists; link the historical RED and capture only fresh focused GREEN.

## Verbatim diff formatting gotcha

Markdown formatters can remove the single-space blank context lines inside a fenced unified diff. Those spaces are valid patch bytes, so formatting can preserve visible semantics while breaking byte-for-byte equality and the recorded checksum.

Exclude the verbatim artifact from Markdown rewriting. Format the surrounding evidence files normally, and validate the fenced payload with an exact byte comparison, path-header count, and truncation-marker check instead.
