---
title: "Preserve discriminant literals in typed test mocks"
date: 2026-08-22
category: test-failures
component: shared
tags: [typescript, mocks, discriminated-unions, literal-widening]
---

Extension test typechecking rejected history-store mocks because `{ provider: "discord" }` was inferred as `{ provider: string }`, which is incompatible with the `DiscordHistoryIdentity` discriminated union. When mocks implement interfaces returning discriminated unions, contextually type the factory or returned value so discriminator fields retain their literal types. Avoid broad assertions that merely hide widening.
