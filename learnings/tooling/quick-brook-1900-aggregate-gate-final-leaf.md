---
title: "Make the aggregate gate a real final leaf"
date: 2026-08-23
category: tooling
component: ci-cd
tags: [acceptance, test-gate, evidence-ledger, fail-closed, deliberation]
file_type: rules
---

# Make the aggregate gate a real final leaf

When an acceptance matrix reserves its last ID for full-gate integrity, do not append a synthetic PASS after child commands finish. Build a candidate ledger from fresh machine-readable results for the preceding leaves and supporting commands, then run the final ID as an actual named test selector against that candidate. Only its reporter result may complete the ledger.

The ledger validator should bind one run ID, immutable command arguments, checkout revisions, dependency hashes, timestamps, and transcript/report hashes. It must reject missing, duplicate, skipped, red, contradictory, stale, or wrong-authority records before writing output, and the writer should refuse overwrites.

Prove fail-closed behavior through the same CLI: feed malformed or missing input, require a specific nonzero diagnostic, and assert that no result artifact was created. This avoids a false negative test that passes merely because the verifier executable itself is missing.
