---
title: "Cron admission needs two guards and prompt handoff"
date: 2026-09-15
category: architecture
component: backend
tags: [cron, admission, concurrency, lease-timeout]
file_type: rules
---

# Cron admission needs two guards and prompt handoff

Independent cron admission needs both durable and process-local protection. A
persisted `runningAtMs` marker prevents collisions across reloads, while
`scheduledJobIds` prevents duplicate admission if maintenance clears a marker
for a legitimate long-running job. Add a job to the local set only after the
reservation write succeeds, and always release it in finalization.

When a slot is released, trigger a normal admission pass rather than relying on
the timer's overdue-job floor. Otherwise a large batch of quick jobs becomes
artificially serial with a multi-second delay between each result. Admission
must also order due work by its oldest `nextRunAtMs` so recurring jobs cannot
starve older overdue work.

For a lease-bound pre-send authorization, calculate an absolute deadline before
credential resolution, then derive the transport timeout only immediately
before `fetch`. A duration computed before an asynchronous secret lookup can
otherwise allow authorization to complete after the reservation expires.
