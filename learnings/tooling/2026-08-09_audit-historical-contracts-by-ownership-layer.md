---
title: "Audit historical contracts by ownership layer"
date: 2026-08-09
category: tooling
component: general
tags: [investigation, git-history, contract-audit, testing]
file_type: rules
---

# Audit historical contracts by ownership layer

When comparing a forked writer implementation with upstream, do not compare only the similarly named writer files. Build the evidence in three layers:

1. Generic writer: ordering, buffering, byte limits, backpressure, diagnostics, and failure propagation.
2. Integration adapter: cache ownership, same-path coordination, event ordering, and flush/close behavior.
3. Lifecycle caller: normal cleanup, timeout handling, process signals, and abrupt termination.

Use `git show <sha>:<path>` for each named revision rather than assuming a branch tip represents the requested base. Inventory tests by exact name and map each test to one contract; comments, types, and fire-and-forget calls are not behavioral proof. This prevents lifecycle guarantees from being incorrectly credited to the writer and makes weaker upstream guarantees explicit without overstating untested behavior.
