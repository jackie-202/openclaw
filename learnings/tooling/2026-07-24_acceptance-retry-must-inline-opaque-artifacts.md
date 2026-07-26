---
title: "Acceptance retry musí zpřístupnit neprůhledný artefakt přímo"
date: 2026-07-24
category: tooling
component: ci-cd
tags: [acceptance, evidence, diff, semantic-review]
file_type: rules
---

# Acceptance retries must expose opaque artifacts inline

When acceptance reports that a referenced `.diff` exists but was absent from caller-supplied semantic material, regenerating the same file or adding another checksum does not fix the evidence boundary.

Create a task-scoped Markdown evidence artifact containing the complete diff verbatim, then link that Markdown file from the current checkpoint and semantic evidence map. Validate the embedded payload against the preserved source artifact byte-for-byte and reject truncation markers.

Keep this repair evidence-only. Do not alter production code unless direct inspection finds a real defect, and do not fabricate a new RED after implementation exists; link the historical RED and capture only fresh focused GREEN.
