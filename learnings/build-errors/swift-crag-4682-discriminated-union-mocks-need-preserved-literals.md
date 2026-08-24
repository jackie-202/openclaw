---
title: "Discriminated-union mocks need preserved literals"
date: 2026-08-23
category: build-errors
component: tooling
tags: [typescript, vitest, mocks, literal-types]
---

The extension test typecheck reported mocks returning `{ provider: string }` where the store contract required a discriminated identity such as `{ provider: "discord" }`. Other mocks were inferred as ordinary-only policies and then rejected when returning `exclusive`.

For mocked discriminated unions, annotate the mock return type or preserve discriminants with `as const`/`satisfies`; otherwise TypeScript widens object literals and produces misleading incompatibilities. Keep production and test typecheck lanes separate so unrelated pre-existing test typing failures do not obscure verification of touched production code.
