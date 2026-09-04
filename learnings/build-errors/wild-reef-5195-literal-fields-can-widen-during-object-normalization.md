---
title: "Literal fields can widen during object normalization"
date: 2026-08-31
category: build-errors
component: backend
tags: [typescript, literal-types, normalization, typecheck]
---

Extension typechecking failed because an intermediate normalized-message object widened `eventType: "message"` to `string`, making it incompatible with the `NormalizedMessage` literal union. Preserve discriminants with an explicit return/object type or `as const`; passing runtime tests does not expose this class of error, so run both production and test TypeScript lanes.
