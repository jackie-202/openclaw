---
title: "Generic host tests must not depend on retired plugin discovery"
date: 2026-10-06
category: architecture
component: general
tags: [plugin-retirement, host-tests, exclusive-ownership]
---

Native adapter tests should inject an opaque exclusive owner through the generic hook test seam and continue exercising the real Discord/Slack handlers. A test that loads a retired bundled plugin can fail before reaching the host behavior it was meant to protect; an assertion expecting a synthetic owner first exposes that coupling. Keep producer-owned config and wire serialization assertions at the producer boundary, and describe source-suite evidence separately from installed-package parity.
