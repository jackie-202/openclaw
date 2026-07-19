---
title: "Test runtime and legacy resolvers independently"
date: 2026-07-19
category: test-failures
component: shared
tags: [vitest, precedence, regression-tests, configuration]
---

A model-override test expected the runtime resolver to return `openai/gpt-5.5`, but received the legacy `modelByChannel` value `openai/gpt-5.4`. The fixture combined both configuration mechanisms and therefore exposed that the implementation still coupled them.

The tests were changed to assert that runtime and legacy model resolution remain separate, including the edge case where a runtime profile has no model and must not inherit one from `modelByChannel`. Dispatch tests also covered both fresh sessions and cached Codex runtime metadata.

For configuration migrations, use deliberately conflicting values in fixtures. This makes accidental fallback and precedence inversions visible. Include a missing-new-value case to prove that absence does not silently reactivate the legacy source.
