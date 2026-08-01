---
title: "Contract-gated plans should name absent audit artifacts"
date: 2026-07-29
category: architecture
component: tooling
tags: [deliberation, planning, wire-contract, audit, fail-closed]
file_type: rules
---

# Contract-gated plans should name absent audit artifacts

When a task designates an authoritative audit path but that file is absent from the repository, do not silently replace it with older investigations.

For Deliberation planning, first record the missing canonical path as a contract gate, then use only repository-local task quotes, current fixtures, provenance, and prior checkpoints to decide whether work can continue. If canonical KM paths, headers, schemas, control semantics, or provenance cannot be reconstructed without guessing, the implementation task should write a checkpoint naming the missing immutable input and stop before product edits.

This is especially important when older audits classify `/v1/*` as the current wire version: that evidence can prevent false v1-residue findings, but it does not by itself authorize a competing `/v1/*` versus `/deliberation/v1/*` route choice for a later readiness repair.
