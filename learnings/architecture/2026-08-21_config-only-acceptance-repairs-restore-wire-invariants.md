---
title: "Konfigurační acceptance opravy musí obnovit odmítnutý wire drift end-to-end"
date: 2026-08-21
category: architecture
component: shared
tags: [configuration, acceptance, wire-contracts, tdd, deliberation]
file_type: rules
---

# Configuration-only acceptance repairs must restore rejected wire drift end-to-end

When a configuration task explicitly defers producer behavior, inspect the full diff for incidental wire changes rather than reviewing only the parser and manifest. Fixture conversions can hide an out-of-scope contract change by updating every assertion to agree with the new behavior.

If acceptance rejects that drift, restore the entire invariant together: runtime types, route normalization, producer serialization, wire schemas, mirrored fixtures, provenance hashes, and tests. Restoring only the reported JSON field leaves the implementation internally inconsistent even if the cited assertion passes.

For follow-up TDD evidence after implementation already exists, preserve and link the genuine parent RED instead of fabricating a new failure. Capture a fresh GREEN under the follow-up task ID with the identical focused command, and keep the parent provenance explicit in the canonical artifact.
