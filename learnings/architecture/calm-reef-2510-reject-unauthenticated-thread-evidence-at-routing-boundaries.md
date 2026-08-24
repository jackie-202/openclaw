---
title: "Reject unauthenticated thread evidence at routing boundaries"
date: 2026-08-21
category: architecture
component: shared
tags: [routing, discord, thread-identity, fail-closed, provenance]
---

Discord admission originally ignored a supplied `threadId` when `parentConversationId` was absent, allowing a contradictory child-shaped event to be treated as a root. Thread evidence must only be accepted when it is supported by authenticated parent or child conversation identity. Reject orphaned or mismatched thread IDs before normalization, and add negative tests for each contradictory combination.
