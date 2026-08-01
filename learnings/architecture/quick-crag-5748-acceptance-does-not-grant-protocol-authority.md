---
title: "Acceptance follow-up nenahrazuje autoritu wire kontraktu"
date: 2026-07-27
category: architecture
component: shared
tags: [openclaw, plugins, external-authority, tdd, acceptance]
file_type: rules
---

# Acceptance follow-up does not grant protocol authority

An acceptance finding that says to supply a missing external-system contract does not itself define that contract. If the implementation plan still says the owner-approved wire protocol is absent, an agent must not turn architectural invariants into invented HTTP endpoints or reconciliation semantics merely to obtain a GREEN result.

## Practical check

Before writing an external-authority client, require repository-local owner material for:

- missing identifier behavior
- methods, paths, authentication, and headers
- closed request and response schemas
- cursor, lease, and CAS conflict behavior
- completion and reconciliation transitions
- the proof that permits a fresh delivery attempt

When these remain absent, preserve truthful TDD evidence: cite historical missing-target output only as provenance, create the current proof artifact before production code, and state that behavioral RED and production GREEN are blocked. Never relabel adjacent baseline tests as GREEN for an unimplemented target.
