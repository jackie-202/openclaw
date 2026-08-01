---
title: "Residue audits require activation proof"
date: 2026-07-28
category: architecture
component: tooling
tags: [audit, plugins, activation, authority, compatibility]
file_type: rules
---

# Residue audits require activation proof

When auditing a retired plugin or authority path, literal search results are only the inventory. A defensible verdict requires tracing each match through manifest/package discovery, registration, imports, and runtime callers.

Use one ledger with these fields: match, owning path and symbol, importer/registration chain, activation status, classification, and evidence. Shared SDK hooks or send helpers count as generic capability only after proving that no retired plugin id, config alias, marker, route, state path, or fallback wires them to the old authority.

For a clean verdict, independently enumerate production sender imports and calls rather than relying on a static ownership test with a fixed file list. Preserve external authority gaps as unknowns when the audit is repository-local; do not cross the scope boundary to turn an unknown into an unsupported clean claim.
