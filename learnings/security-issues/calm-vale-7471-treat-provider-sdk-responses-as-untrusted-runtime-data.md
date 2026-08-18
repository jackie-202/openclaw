---
title: "Treat provider SDK responses as untrusted runtime data"
date: 2026-08-16
category: security-issues
component: backend
tags: [sdk-boundary, runtime-validation, wire-contract, fail-closed]
---

Static SDK types did not guarantee the runtime response shape. A truthiness check allowed malformed sender values such as numbers or objects into normalized history despite the closed wire contract requiring a string.

Validate provider response fields at runtime before constructing internal or wire objects. Selected sender identities and similar required fields should be non-empty strings; malformed rows should fail closed rather than relying on TypeScript declarations.