---
title: "External suite commands are evidence provenance"
date: 2026-08-09
category: tooling
component: ci-cd
tags: [acceptance, test-gate, cross-repository, provenance]
file_type: rules
---

# External suite commands are evidence provenance

When an acceptance goal spans two repositories, a checkpoint test count is not enough to reconstruct the canonical gate. The evidence must preserve the exact maintained command for each checkout together with the revision, gate owner/run ID, timestamp, exit code, and named test counts.

If an earlier run recorded only `90 passed` for an external suite, do not infer a pytest path or copy that count into a follow-up. Discover the command from the external owner's maintained test configuration inside the canonical runner, then keep the goal blocked until an inspectable caller-owned run exposes both command and outcome.

Historical RED/GREEN artifacts remain implementation provenance. They do not replace fresh canonical GREEN evidence for unchanged sibling suites, and a local rerun must not be relabeled as caller-owned evidence.
