---
title: "Generic host tests avoid retired plugin discovery"
date: 2026-10-06
category: architecture
component: general
tags: [plugin-retirement, host-tests, exclusive-ownership, tdd]
---

Generic host-handler tests should create the hook registry directly with the public test seam (`createMockPluginRegistry` and `initializeGlobalHookRunner`) and use an opaque owner ID. Loader-backed plugin tests otherwise couple native Discord/Slack behavior to retired plugin discovery and configuration. Keep producer-owned wire/config assertions in producer-owned tests; preserve host routing, dedupe, and terminal side-effect assertions in native adapter tests.

For acceptance repairs, create proof with the TDD helper from actual commands. A focused assertion that expects an owner without registering it produces a genuine RED that identifies the missing seam; the replacement fixture should register policy and claim handlers, not merely change the expected string.
