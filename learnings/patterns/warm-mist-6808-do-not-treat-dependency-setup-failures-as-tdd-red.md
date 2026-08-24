---
title: "Do not treat dependency setup failures as TDD RED"
date: 2026-08-23
category: patterns
component: shared
tags: [tdd, contracts, provenance, fail-closed]
---

The task required RED-GREEN evidence against owner-defined contract fields, but the available contract mirror was known to be semantically mismatched and the authoritative artifacts were inaccessible. A failing test under those conditions would only prove broken setup or guessed wire fields, not missing production behavior. Reuse this rule for cross-repository TDD: verify the authoritative contract, fixtures, provenance hashes, and required runtime entry points before writing RED tests. If the dependency gate is not satisfied, checkpoint the blocker and stop rather than fabricating a RED phase.
