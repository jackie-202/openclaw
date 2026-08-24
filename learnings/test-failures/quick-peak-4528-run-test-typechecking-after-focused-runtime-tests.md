---
title: "Run test typechecking after focused runtime tests"
date: 2026-08-21
category: test-failures
component: tooling
tags: [typescript, vitest, mocks, typecheck]
---

Focused Vitest suites passed while `pnpm check:test-types` still found invalid test code: destructured callback parameters had implicit `any`, fixtures supplied fields absent from helper types, and zero-argument mocks made `mock.calls[0][0]` an impossible tuple access.

Runtime tests do not validate the complete TypeScript contract of test harnesses. After changing typed hooks or SDK surfaces, run the dedicated test typecheck and explicitly type callback parameters, fixture boundaries, and mocks whose calls are inspected.
