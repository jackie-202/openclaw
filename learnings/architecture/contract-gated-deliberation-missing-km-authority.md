---
title: "Contract-gated Deliberation work stops on missing KM authority"
date: 2026-07-29
category: architecture
component: general
tags: [deliberation, contracts, km, fail-closed]
file_type: rules
---

# Contract-gated Deliberation work must stop on missing immutable KM authority

When a Deliberation task asks to reconcile OpenClaw wire paths, headers, schemas, control operations, reservation semantics, or reconciliation behavior against a KM-owner contract, do not proceed from sparse repository summaries alone.

If the task-named audit or accepted KM-owner bundle is absent, treat that as a hard contract gate. Record the exact missing immutable inputs in the checkpoint and keep production code unchanged. Passing existing Deliberation tests can prove current fail-closed behavior, but it is not authority to update fixtures or encode new expectations.

Useful local evidence to check before stopping:

- The task plan may name the authoritative audit and state whether it is present.
- Prior task checkpoints can identify whether accepted fixtures were self-accepted or externally owned.
- `extensions/deliberation/contracts/provenance.json` proves only the scope it names; repository-local provenance is not equivalent to KM-owner approval.

For this pattern, the safe closeout is: create the required red/green proof before production edits, fail closed in RED with the missing contract input named, run focused tests/docs/build to prove no regression in the current state, then record GREEN as verification of the non-edit stop state.
