---
title: "Follow-up wire-pin TDD must be genuine"
date: 2026-09-10
category: tooling
component: tooling
tags: [deliberation, wire-contract, tdd, acceptance]
file_type: rules
---

# Follow-Up Wire-Pin TDD Must Be Genuine

An acceptance retry may inherit a blocked parent proof, but a statement that RED
was not run is not RED evidence. When no implementation was completed before
the retry, add the new focused test before local pin artifacts and capture a
real failing run under the follow-up task ID. Link the parent blocker only as
provenance, then use the same focused command for GREEN after the pin exists.

The verification checkpoint should separately record source-only coverage and
the deployment checks intentionally left unrun. This avoids claiming runtime
cutover proof from repository-local fake tests.
