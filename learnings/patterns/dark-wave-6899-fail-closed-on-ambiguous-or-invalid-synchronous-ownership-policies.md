---
title: "Fail closed on ambiguous or invalid synchronous ownership policies"
date: 2026-08-23
category: patterns
component: shared
tags: [fail-closed, sync-hooks, ambiguity, async, privacy]
---

The inbound policy hook is intentionally synchronous because channel debounce can irreversibly merge events. Multiple exclusive claimants produce an ambiguous decision, while thrown errors or accidental Promise returns disable aggregation and keep events separate. Exclusive ambiguity and owner failures remain silent rather than falling through to ordinary dispatch. Reuse attributed decisions such as `ordinary`, `separate`, `exclusive`, and `ambiguous` instead of collapsing policy results into a boolean.
