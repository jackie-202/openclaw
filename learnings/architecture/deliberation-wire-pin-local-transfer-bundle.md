---
title: "Deliberation wire pin requires the local transfer bundle"
date: 2026-09-10
category: architecture
component: shared
tags: [deliberation, wire-contract, artifact-pin, task-gate]
file_type: rules
---

# Deliberation Wire Pin Requires the Local Transfer Bundle

The consumer pin task must not infer the producer contract from a provenance
summary or recreate it by hand. It is blocked until the repository contains
`plans/checkpoints/deliberation-wire-publication/` with the transferred
contract, fixtures, and manifest.

The accompanying publication checkpoint can establish operator approval and
expected SHA-256 values, but it cannot substitute for the exact local bytes
needed to validate the pin and prove fixture compatibility. Record the missing
bundle in the task checkpoint and stop before reading or changing consumer
production code. This preserves the no-sibling-import and no-hand-maintained
mirror boundary.
