---
title: Audit speech-core runtime export compatibility
type: investigation
---
# Audit speech-core runtime export compatibility

Compare fork commit `2c030c303aba` and the documented previous Gateway boot incident with current package exports, plugin SDK surface and bundled plugin loader at base `4b85d834ed1586062f31bded2f358fc5192d1674`.

## Required analysis
- Map every historical import path to a supported current path or prove it is unreferenced.
- Inspect source references, package export declarations, build/export checks and existing boot tests.
- Explain whether removal of the old package architecture is sufficient or whether a compatibility alias remains necessary.

## Deliverable
Markdown report under `plans/` with import/export map, proof gaps requiring later implementation verification, and exactly one proposal verdict plus confidence.

## Scope boundary
Repository, proposal and existing workspace audit documents explicitly cited by the proposal only. No edits, tests, live Gateway action, external repos or Git lifecycle operations.
