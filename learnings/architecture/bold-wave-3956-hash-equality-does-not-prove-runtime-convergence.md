---
title: "Hash equality does not prove executable owner convergence"
date: 2026-08-22
category: architecture
component: shared
tags: [deliberation, contracts, provenance, integration-testing, cross-repository]
file_type: rules
---

# Hash equality does not prove executable owner convergence

A cross-repository consumer gate can pass its pinned file-hash preflight and still fail every positive runtime path when the pinned files do not describe the producer's actual extended contract.

For Deliberation, OpenClaw required `pipelineId`, an intake `deliveryTarget`, and a mode-bearing target. The approved KM revision matched the two pinned owner hashes exactly, but its listener's closed intake schema accepted neither `pipelineId` nor `deliveryTarget`, and its target schema had no `mode`. The expanded integration harness therefore reached the real listener and returned `400 SCHEMA_INVALID` for every positive setup.

When this happens:

1. Preserve the runtime failure as genuine RED from the canonical cross-repository command.
2. Inspect the dependency's contract and executable validator at the pinned revision, not only copied schemas or hashes.
3. Search dependency history to establish whether a hash-matched executable revision can exist.
4. Do not strip producer fields, patch the approved checkout, or refresh hashes to a semantically different revision to manufacture GREEN.
5. Leave live convergence unknown and require one approved owner revision whose tracked contract and runtime implement the same closed shape.

Provenance needs both byte identity and executable scenario success. Neither substitutes for the other.
