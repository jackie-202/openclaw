---
title: "Passing consumer tests do not close an external listener contract gate"
date: 2026-08-02
category: architecture
component: shared
tags: [external-contract, verification, node-fetch, deliberation]
file_type: rules
---

# Passing consumer tests do not close an external listener contract gate

When a failure occurs at an externally owned HTTP listener, a green consumer suite proves only the unchanged local baseline. It does not prove the reported integration is fixed if mocked fetch tests cannot observe runtime-generated headers and the external listener has not changed.

For Deliberation, the focused client, contract, fail-closed intake, full plugin, and TypeScript checks all pass while the live Node global-fetch request still has supplied evidence of HTTP 400. Record those checks as baseline evidence, not as implementation GREEN.

The gate closes only after the listener owner supplies:

- a canonical contract classifying `Sec-Fetch-Mode` as transport metadata;
- a listener test accepting the supported Node value `cors`;
- a listener test retaining rejection of an unknown application header;
- the immutable artifact and provenance needed for consumer mirror synchronization.

This distinction prevents a hash-pinned consumer fixture from being edited speculatively and prevents passing local tests from overstating cross-repository compatibility.
