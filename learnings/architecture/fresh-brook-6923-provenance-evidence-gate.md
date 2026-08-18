---
title: "Deliberation provenance needs two independent proofs"
date: 2026-08-17
category: architecture
component: backend
tags: [deliberation, provenance, contract-gate, rollout]
file_type: rules
---

# Deliberation provenance needs two independent proofs

For Deliberation contract rollout gates, a local mirror hash proves only that the checked-in artifact has not drifted. It does not identify the KM owner revision or prove which owner files the external listener accepted.

Before replacing `ownerPin.status: "follow-up-required"`, inspect every manifest consumer. The local cross-repository listener gate requires `ownerFiles` with owner-relative paths and SHA-256 values, while the contract test verifies local mirror hashes and semantic fields. Do not infer either the revision or owner file paths from a green E2E result, task id, or local hashes.

If the allowed handoff omits the exact revision or owner-file map, leave the provenance unresolved and record the missing fields. Keep semantic and hash evidence distinct in the rollout note; a full gateway restart and live smoke remain separate deployment work.
