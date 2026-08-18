---
title: "Audity chyb prikazu musi sledovat projekce a retry politiku"
date: 2026-08-09
category: architecture
component: backend
tags: [cron, command-runner, error-handling, retries, redaction, truncation]
file_type: checklist
---

# Cron failure contracts require projection audits

A bounded command error string is not a bounded failure contract when the same process output is carried independently as `summary` and `diagnostics`.

## Audit rule

When reviewing a command-runner error convention, trace these fields separately through every consumer:

- Process metadata: exit code, signal, termination reason, killed state, and truncation counts.
- Outcome fields: status, error, summary, diagnostics, and delivery error.
- Durable state: last error, normalized diagnostics, counters, delivery state, and run/task history.
- Policy: error-reason inference, retry classification, backoff, disable, and alert thresholds.
- External projections: announce, primary webhook, completion webhook, failure destination, hooks, Gateway events, CLI, and UI.

Do not infer secrecy from a cap or from a test that checks only one field. Verify where known-pattern redaction is applied and list every raw sibling projection.

## Truncation gotcha

Parsing a marker after tail capture makes the marker contract depend on retained bytes rather than original output. Truncation can remove a real marker, expose a prefix at a synthetic line boundary, or reduce multiple original markers to one accepted marker. Cardinality and line-start guarantees must therefore be evaluated before and after capture.

## Dependency evolution gotcha

Re-check process-result normalization at the target revision. A gate such as `code !== 0` can change meaning when a newer process runner normalizes timeout `null` to `124`; a marker that previously skipped timeout results can then override canonical timeout errors.

## Evidence discipline

Label composed conclusions as source-derived unless one fixture directly asserts the complete behavior. A runner fixture that asserts only `error` does not prove summary redaction, persisted state, delivery payloads, or retry behavior.
