---
title: "Canonical wire mirrors require closed parsing and precise residue scans"
date: 2026-08-01
category: architecture
component: backend
tags: [deliberation, wire-contract, closed-schema, residue-audit, fail-closed]
file_type: rules
---

# Canonical wire mirrors need semantic residue scans

When a repository mirrors an external JSON contract byte-for-byte, verify the source hashes before implementation and pin the mirrored hashes in a contract test. Runtime parsers should enforce the same closed response boundary, including known optional field types, rather than checking only top-level discriminants.

Residue scans must target retired route tokens precisely. A broad search for `/control` can falsely match the canonical JSON Schema reference `#/schemas/controls`; scan for the retired route terminator or separator while still searching old header names and route families broadly.

If the authority omits data required for safe activation, remove the activation owner instead of inventing local state. For Deliberation, ready and reservation responses lacked an authorized Discord destination, so retaining fail-closed intake while removing the outbound worker preserved safety and allowed wire convergence.
