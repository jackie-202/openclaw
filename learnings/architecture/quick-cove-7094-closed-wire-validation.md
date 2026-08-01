---
title: "Closed wire mirrors must validate optional data"
date: 2026-08-01
category: architecture
component: backend
tags: [wire-contract, closed-schema, acceptance, git-index]
file_type: rules
---

# Closed wire mirrors must validate optional data, not only required fields

When a plugin mirrors an authoritative closed JSON contract, checking top-level keys and required fields is insufficient. Every optional field that appears in a response must also be validated, including nested objects, arrays, nullable fields, bounds, and pagination syntax. Otherwise malformed dependency responses cross a boundary that the implementation claims is closed.

For the Deliberation KM client, the practical pattern was:

- Keep immutable contract and fixture files byte-identical to their authority and pin their hashes.
- Mirror complex optional response structures with strict Zod objects while retaining narrow manual validation where detailed domain errors are useful.
- Validate outgoing pagination parameters as well as returned cursors against the authority's bounds and syntax.
- Remove configuration left without a runtime consumer when deleting a service. An unshipped required setting such as a polling interval should not survive after polling is removed.
- Use route-aware residue expressions. A raw `/control` substring scan falsely matches canonical schema references such as `#/schemas/controls`.

Acceptance systems based on Git diffs also cannot prove completely untracked implementations. When the requested outcome is a commit-ready working tree, add the intended implementation to the index so the task-scoped diff contains the actual source and documentation, while leaving unrelated untracked files untouched.
