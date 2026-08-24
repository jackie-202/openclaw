---
title: "Test ownership through loader-backed channel paths"
date: 2026-08-23
category: test-failures
component: e2e
tags: [integration-tests, plugin-loader, channel-side-effects, routing]
---

Hook-level tests alone were insufficient to prove the ownership boundary. Loader-backed Discord and Slack tests were needed to verify that the authenticated owner is targeted before generic claim broadcast and before channel side effects. Future ownership changes should combine focused hook tests for ambiguity, exceptions, and accidental async handlers with production dispatch-path tests that assert forbidden side effects never occur.
