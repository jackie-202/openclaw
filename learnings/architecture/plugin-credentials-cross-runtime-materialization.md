---
title: "Plugin credentials cross source and materialized runtime config"
date: 2026-07-28
category: architecture
component: general
tags: [openclaw, plugins, secretref, redaction, workers]
file_type: rules
---

# Plugin credentials cross two config representations

Bundled plugin credential fields are validated as SecretRefs in source config, but the active secrets runtime materializes those fields to strings before normal runtime use. A plugin client that always calls a SecretRef-only resolver with its already-materialized `pluginConfig` value will receive `undefined` and fail despite successful preflight resolution.

At request time, use the public resolver that accepts both representations, such as `resolveConfiguredSecretInputString`, while keeping the manifest contract restricted to the intended SecretRef source shape. Test both paths: an unresolved/ref-backed input and an already-materialized runtime string.

Worker diagnostics at external delivery boundaries must also avoid interpolating caught error messages. Provider errors can contain response bodies, destinations, or credential diagnostics. Persist the closed KM outcome, then log a fixed payload-free message and prove the sensitive marker is absent from captured logs.
