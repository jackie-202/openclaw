---
title: "Ověřuj owner artefakty a owner assertiony odděleně"
date: 2026-08-24
category: test-failures
component: e2e
tags: [cross-repository, contract-provenance, sha256, e2e, acceptance]
file_type: rules
---

# Verify owner artifacts and owner assertions separately

In cross-repository convergence work, matching authoritative artifact hashes proves the contract bundle but does not guarantee every test in the owner checkout has been updated to that bundle.

When a composed owner E2E assertion conflicts with the verified contract:

1. Record the current owner HEAD as non-blocking provenance.
2. Verify every authoritative file hash before interpreting behavior.
3. Run the consumer's owner-backed integration against isolated state.
4. Compare the failing assertion with both the verified schema and the owner's current persistence output.
5. Do not weaken the consumer wire format merely to satisfy an owner test that expects fields the verified owner contract requires.
6. Preserve the exact failing command and result as an external-test gap.

For acceptance evidence, repeat all authoritative hashes in the run-specific ledger rather than relying only on a generic `ownerFiles` map. This makes it possible to verify contract, fixtures, wire implementation, and lifecycle implementation independently of a moving repository revision.
