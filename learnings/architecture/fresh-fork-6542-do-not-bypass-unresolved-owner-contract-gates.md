---
title: "Do not bypass unresolved owner-contract gates"
date: 2026-08-16
category: architecture
component: backend
tags: [contracts, tdd, provenance, acceptance]
---

When an implementation depends on an owner-authored wire contract, existing tests passing does not authorize inventing the missing schema. Here, the accepted KM contract still represented targets as strings and provided no `threadId`, structured target fields, object-equality semantics, or matching provenance hashes. The task correctly stopped rather than fabricating a behavioral RED test and implementation against an unaccepted shape.

Reuse this pattern: inspect both the canonical contract and provenance artifacts, run the focused contract tests to establish current behavior, and record a precise blocker. Resume TDD only after the owner-authored fixtures and hashes are accepted. Avoid treating acceptance feedback or a desired downstream API as permission to override an explicit contract gate.