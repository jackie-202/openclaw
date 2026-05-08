---
title: "Defensive handling for malformed plugin runtime outcomes"
date: 2026-05-04
category: runtime-errors
component: general
tags: [plugins, login, error-handling, whatsapp]
file_type: rules
---

# Defensive handling for malformed plugin runtime outcomes

When a plugin helper has a declared discriminated union, callers at runtime can still receive malformed values from mocked seams, dependency edge cases, or unexpected rejection paths. Do not read `result.outcome`, `result.message`, or `result.error` directly in the same path that is trying to report a recoverable error.

For login and connection error paths, normalize the value first as `unknown`, extract only object fields behind guards, and build the thrown `Error` through one safe helper. The helper should provide a default message like `WhatsApp login failed: unknown` or include the guarded status code, and should only attach `cause` when it can read it safely.

Regression tests can target the safe builder directly with `undefined`, partial objects like `{ outcome: "failed" }`, and well-formed results. This covers the crash class without needing a live Baileys 408 disconnect.
