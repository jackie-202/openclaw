---
title: "Durable targets must distinguish thread anchors from exact threads"
date: 2026-08-21
category: architecture
component: shared
tags: [deliberation, routing, threads, contracts, discord]
file_type: rules
---

# Durable targets must distinguish thread anchors from exact threads

A destination shaped only as `{ provider, account, channel, threadId? }` is insufficient when one workflow supports both source-default replies and explicit target threads.

For Discord, a source-default root message uses the inbound message as an anchor from which a thread must be created or reused. An explicit `threadId` instead names an already existing target thread and must never manufacture one. Both cases can otherwise serialize to the same fields, so a final adapter cannot choose safely without consulting mutable config or guessing from source equality.

The durable owner contract must carry a closed discriminator for anchor versus exact-thread semantics from authenticated admission through ready, reservation, invocation, completion, and attempt evidence. Provider adapters may then resolve/create an anchor before their sole text send while explicit roots and threads remain exact. If the repository-local contract lacks this distinction, record a contract mismatch and stop rather than infer behavior from pipeline IDs or current config.
