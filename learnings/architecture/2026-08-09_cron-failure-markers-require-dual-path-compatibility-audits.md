---
title: "Cron failure markers require dual-path compatibility audits"
date: 2026-08-09
category: architecture
component: backend
tags: [openclaw, cron, command-runner, compatibility, redaction, retries]
file_type: checklist
---

# Cron failure markers require dual-path compatibility audits

A command runner can expose process output through two independent fields: a compact `error` used by persistence, alerts, classification, and retries, and a `summary` used by announce, hooks, diagnostics, and webhooks. Changing only `error` does not make adjacent stderr private; the unchanged summary may still deliver the full marker line and following output.

When auditing a failure marker, trace all of these separately:

- recognition by exit mode, stream, marker count, and truncation position;
- error classification and retry/disable consequences after replacing generic text;
- summary selection for stdout-only, stderr-only, mixed, empty, and oversized output;
- diagnostics, logs, persisted task state, failure alerts, hooks, announce, and webhook projections;
- redaction at each external boundary, including whether the marker participates in existing preservation/redaction predicates.

A marker-length assertion on `error` is not secret-redaction proof. Require assertions or static evidence for every external `summary` projection and for downstream classification behavior.
