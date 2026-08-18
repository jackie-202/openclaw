---
title: "Validate thread provenance and chronology at admission"
date: 2026-08-16
category: security-issues
component: backend
tags: [slack, thread-identity, provenance, timestamps]
---

Slack replies were initially accepted without `thread_ts`, allowing rows with no proof of membership in the requested thread. Admission also accepted a `thread_ts` later than the reply timestamp, creating an impossible child-to-root relationship.

Permit an omitted thread identity only for the root message itself. Replies must carry an exact matching thread identity, and the root timestamp must be less than or equal to the child timestamp. Apply these checks before persistence or history normalization.