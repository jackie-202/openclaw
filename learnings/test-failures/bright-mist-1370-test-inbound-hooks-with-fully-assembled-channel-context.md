---
title: "Test inbound hooks with fully assembled channel context"
date: 2026-08-02
category: test-failures
component: shared
tags: [integration-testing, discord, plugins, deliberation]
---

Isolated hook tests passed even though live Discord intake was skipped because the production dispatch context lacked canonical `SenderId`. The defect appeared only when a realistic Discord event was passed through context assembly, the plugin loader, and the actual hook dispatcher. For channel-to-plugin integrations, keep focused unit tests but add one composed production-path test that verifies canonical context fields, hook ordering, external request shape, claim behavior, and cleanup.
