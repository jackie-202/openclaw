---
title: "Separate verification blockers from implementation failures"
date: 2026-08-17
category: tooling
component: ci-cd
tags: [verification, blacksmith, lint, autoreview]
---

Core behavior verification succeeded, but broader gates failed for unrelated infrastructure reasons: `check:changed` could not launch because the explicitly selected Blacksmith provider required a missing `blacksmith` executable; scoped lint failed while preparing Slack boundary artifacts because `primeChannelOutboundSendMock` was not exported; and autoreview exceeded its worktree-wide input limit.

Record these as explicit blockers alongside successful focused tests, typechecks, builds, and formatting. Do not modify unrelated code merely to make a scoped task appear fully green. Where possible, run a scoped fallback review and preserve the exact failing command and cause.