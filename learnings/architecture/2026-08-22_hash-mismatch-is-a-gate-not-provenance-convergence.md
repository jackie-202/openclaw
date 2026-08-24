---
title: "Hash mismatch is a gate, not provenance convergence"
date: 2026-08-22
category: architecture
component: shared
tags: [deliberation, contracts, provenance, doctor, migration, integration]
file_type: rules
---

# Hash mismatch is a gate, not provenance convergence

When a mirrored external contract changes, do not refresh provenance from hashes alone. First compare the owner files semantically and run the same runtime gate. A current checkout can be newer while still being incompatible with the repository-local contract.

In the Deliberation integration gate, the configured KM checkout had new owner-file hashes, but direct comparison showed that it removed the durable target `mode`, changed pipeline bounds, and used a different lifecycle projection. Updating the pinned hashes would have hidden a real contract split and allowed provenance text to overstate external compatibility.

Keep three evidence classes separate:

- Repository-local schema/runtime proof: executable fixtures and focused tests can establish this independently.
- Configured checkout proof: require both the accepted owner hashes and a passing isolated runtime harness.
- External/live deployment status: keep this `unknown` unless the deployed system was actually inspected and exercised.

The same principle applies to doctor migrations: `changes` must describe actual writeback. Mixed or malformed authority should remain unchanged with `changes: []`; warning rules provide diagnostics without pretending a repair occurred. Before returning a migrated config, parse the complete canonical result so duplicate routes, processing-source overlap, and other cross-field invariants cannot be written back.
