---
title: "Validate the complete canonical result after migration"
date: 2026-08-22
category: patterns
component: shared
tags: [migration, configuration, validation, fail-closed]
---

Legacy-to-canonical migration initially validated only the legacy input fields. That allowed the migration to construct output that could violate canonical routing invariants. The repair validates the complete migrated object with the canonical parser before permitting writeback. Reuse this pattern for configuration migrations: transform once, validate the full destination schema, and refuse partial writeback when any canonical invariant fails.
