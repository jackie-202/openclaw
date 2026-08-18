---
title: "Scoped lint can fail before target files are analyzed"
date: 2026-08-18
category: tooling
component: ci-cd
tags: [oxlint, typescript, sdk-boundary, concurrent-work]
---

The scoped `run-oxlint.mjs` path first prepares extension package boundary artifacts. An unrelated Slack DTS failure caused by a missing `primeChannelOutboundSendMock` export can therefore stop lint before the requested files are linted. Record this as an environmental blocker and do not modify concurrent Slack work; use independent focused tests, build, formatting, and runtime checks for task evidence.