---
title: "Integration fixtures must use canonical target shapes"
date: 2026-08-21
category: build-errors
component: tooling
tags: [typescript, fixtures, target-shape, contract-drift]
---

Production tests passed while `tsgo:extensions` exposed a stale cross-repository listener fixture: it supplied `{ account, channel }` where the integration client required `{ accountId, channelId }`. Contract changes must include scripts and integration harnesses, not only runtime sources and unit tests. Use canonical target constructors or shared types in fixtures to make field-name drift fail close to the change.
