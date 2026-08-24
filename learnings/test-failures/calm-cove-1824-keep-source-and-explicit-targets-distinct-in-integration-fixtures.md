---
title: "Keep source and explicit targets distinct in integration fixtures"
date: 2026-08-22
category: test-failures
component: e2e
tags: [routing, fixtures, delivery-target, integration-tests]
---

An explicit-target integration case accidentally asserted the source and override as the same durable envelope target, so it could not prove that configured targets override source-default routing. Use visibly different source and destination identities in routing tests. This ensures the fixture detects accidental source inheritance, target drift, and thread propagation.
