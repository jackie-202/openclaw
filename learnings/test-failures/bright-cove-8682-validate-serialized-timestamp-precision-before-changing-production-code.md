---
title: "Validate serialized timestamp precision before changing production code"
date: 2026-08-09
category: test-failures
component: backend
tags: [timestamps, wire-contract, regression-test, tdd, deliberation]
---

A reported timestamp precision defect was reproduced at the real serialized KM request boundary using a live-shaped Discord timestamp. The existing formatter already converted `.816Z` to `.816000Z` and normalized `.000Z` to whole-second `Z`, so a production rewrite would have been behavior-neutral churn.

When investigating timestamp defects, first assert the exact outbound wire value and explicitly reject seven-or-more fractional digits. If the regression probe passes before production edits, preserve the implementation and add focused regression coverage rather than manufacturing a failing RED phase or changing correct code.
