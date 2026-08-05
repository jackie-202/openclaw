---
title: "Mirror GREEN is not listener GREEN"
date: 2026-08-02
category: tooling
component: shared
tags: [external-contract, tdd, live-verification, autoreview]
file_type: rules
---

# Mirror GREEN Is Not Listener GREEN

For a hash-pinned mirror of an externally owned HTTP contract, a focused test that builds its fake listener from the edited mirror is only synchronization proof. It cannot prove the owner listener implements the same allowlist.

Before accepting a transport compatibility fix:

1. Patch and test the owner listener first.
2. Run the real supported client transport against that listener.
3. Keep a negative control for unknown application headers.
4. Copy the resulting canonical owner artifact into the consumer repository and pin its real hash/revision.
5. Run consumer tests only after the live owner behavior is green.

In this case, repository tests passed after adding `Sec-Fetch-Mode`, but an authenticated Node global-fetch health probe still returned HTTP 400. Autoreview correctly rejected the self-authorized mirror change. A permission denial on the external KM workspace is a hard implementation blocker, not a reason to relabel local GREEN as production proof.
