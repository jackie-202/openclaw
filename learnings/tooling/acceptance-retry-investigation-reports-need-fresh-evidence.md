---
title: "Acceptance retry investigation reports need fresh evidence"
date: 2026-05-04
category: tooling
component: tooling
tags: [acceptance, retry, investigation, logs, checkpoints]
file_type: checklist
---

# Acceptance retry investigation reports need fresh evidence, not just source tracing

When an acceptance retry says the previous source-only investigation was incomplete because log evidence was missing, do not preserve the original "no external logs inspected" conclusion. Re-run the log inspection exactly from the retry scope and update the final report/checkpoint with the observed evidence.

## Pattern

- Read only the retry checkpoint first, then the referenced plan.
- If logs live outside the repo, use `bash` for `~/.openclaw/logs/...`; `Read` and `Glob` will not access those paths.
- Capture bounded, redacted evidence: match counts, representative stack lines, stability bundle names, and parsed non-secret fields.
- Correct stale checkpoint wording from the previous attempt, especially claims like "external logs were not accessed".
- Remove unrelated files named by acceptance feedback from the task scope, but do not touch other unrelated untracked files.

## Example

For the WhatsApp 408 crash retry, `gateway.err.log` showed 65 matching unhandled rejections and stability bundles showed repeated `reason: unhandled_rejection` / `error.name: TypeError`. That evidence belonged in `plans/investigations/wild-reef-6230_whatsapp-408-unhandled-rejection.md`, while unrelated `scripts/bench` files were removed from the retry scope.
