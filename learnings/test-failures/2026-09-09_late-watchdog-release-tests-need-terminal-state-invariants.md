---
title: "Pozdni uvolneni watchdogu musi overit terminalni stav"
date: 2026-09-09
category: test-failures
component: backend
tags: [cron, watchdog, cancellation, regression-tests]
file_type: rules
---

# Late watchdog release invariants

For a timeout race where setup resumes after the watchdog has finalized the
cron job, test the detached continuation as well as the initial timeout.

The regression should prove that the runner observed its abort signal, cannot
reach model dispatch after release, invokes cleanup once, emits one terminal
event, and leaves `lastStatus`, `lastError`, and `lastDiagnostics` unchanged.
Checking only the timeout message and an event count can miss a late
continuation that mutates durable state after the timeout result was reported.
