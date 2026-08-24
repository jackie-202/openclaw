---
title: "Discord intake fixtures separate message and thread identities"
date: 2026-08-19
category: test-failures
component: tooling
tags: [deliberation, discord, source-thread-id, vitest]
file_type: rules
---

# Discord intake fixtures must distinguish message and thread identities

When a Deliberation Discord fixture has no explicit inbound `threadId`, its
`messageId` is only `providerEventId`. Assert that the serialized intake body
omits `sourceThreadId`; do not infer it from the message id. Keep configured
delivery targets out of the source-intake assertion, because destination
configuration is independent of inbound source provenance.
