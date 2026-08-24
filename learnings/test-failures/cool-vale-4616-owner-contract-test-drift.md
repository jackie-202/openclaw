---
title: "Ověřené owner artefakty mohou odhalit zastaralé owner testy"
date: 2026-08-24
category: test-failures
component: e2e
tags: [cross-repository, contract-provenance, sha256, e2e, deliberation]
file_type: rules
---

# Verified owner artifacts can expose stale owner tests

For cross-repository integration, verify the exact contract, fixtures, wire implementation, and lifecycle-contract hashes before judging behavior. Repository HEAD is useful provenance but must not override matching accepted artifacts when unrelated commits keep moving it.

After replacing a consumer's hybrid mirror byte-for-byte from the verified owner contract, an owner E2E assertion can itself become stale. In this case the accepted schema required `pipelineId` and `deliveryTarget` in each singular persisted message, and the owner runtime correctly emitted both, while one unchanged owner test still compared against the earlier message shape without those fields.

The safe response is not to strip required producer authority or weaken persistence to satisfy the stale assertion. Preserve all three facts separately:

- artifact hashes and exact mirror equality;
- current isolated runtime behavior and named integration leaves;
- the precise stale assertion and its remaining failure.

This separation prevents a moving checkout or outdated test from manufacturing a false contract rollback while still keeping the unresolved owner-side proof gap visible.
