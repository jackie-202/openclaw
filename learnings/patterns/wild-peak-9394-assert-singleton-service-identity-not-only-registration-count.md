---
title: "Assert singleton service identity, not only registration count"
date: 2026-08-24
category: patterns
component: backend
tags: [service-registration, singleton, boundary-test, assertions]
---

A registration-count assertion proved only that one service was registered, not that it was the intended lifecycle owner. The boundary test was strengthened to compare registered service IDs exactly against `deliberation-final-delivery`, while retaining disabled-mode and CLI registration checks. For singleton ownership boundaries, assert both cardinality and exact identity so an unrelated or replacement service cannot satisfy the test accidentally.
