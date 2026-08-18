---
title: "Treat provider hook metadata as unknown at runtime"
date: 2026-08-16
category: patterns
component: shared
tags: [provider-hooks, fail-closed, runtime-validation, slack, routing]
file_type: rules
---

# Treat provider hook metadata as unknown at runtime

TypeScript hook interfaces do not validate events arriving from plugins or transports. Admission code that calls string methods directly on typed route fields can throw on malformed values, while predicates written as if values were strings can accidentally coerce numbers into configured identities.

At a fail-closed provider boundary, accept route and identity fields as `unknown` in the local normalization layer. Require `typeof value === "string"` before prefix parsing, agreement checks, timestamp validation, or canonical identity encoding. Test non-string account and target values explicitly, not only malformed strings.

Keep transport envelope normalization distinct from provider identity. OpenClaw uses `channel:<id>` as a canonical host target for Slack as well as Discord, so stripping that host prefix is valid when the resulting bare channel is validated and persisted. Do not reject a shared host envelope merely because it resembles a provider-specific syntax; prove the convention from callers and channel tests first.
