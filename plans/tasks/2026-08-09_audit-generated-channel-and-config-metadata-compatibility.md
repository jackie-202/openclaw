---
title: Audit generated channel and config metadata compatibility
type: investigation
---
# Audit generated channel and config metadata compatibility

Analyze old generated commit `e904c5b752d8` against current upstream source-of-truth files and generation scripts at base `4b85d834ed1586062f31bded2f358fc5192d1674`, including effects of the retained WhatsApp and Deliberation baseline.

## Required analysis
Identify canonical inputs, outputs, generation/check commands, ownership, idempotence expectations, and semantic deltas that retained schemas require. Distinguish stale generated blobs from metadata that must be regenerated before promotion.

## Deliverable
Markdown report under `plans/` with source→generator→artifact map, required later verification commands, and exactly one proposal verdict plus confidence.

## Scope boundary
Read-only repository/proposal analysis. Do not regenerate files, run code/tests, edit production artifacts, access live config/other repos, or perform Git lifecycle operations.
