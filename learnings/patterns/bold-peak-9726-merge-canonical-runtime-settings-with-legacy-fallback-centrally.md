---
title: "Merge canonical runtime settings with legacy fallback centrally"
date: 2026-07-13
category: patterns
component: shared
tags: [configuration, fallback, migration, single-resolver]
---

The effective channel profile was made responsible for composing `runtimeByChannel` with legacy `modelByChannel` fallback. This kept precedence consistent across model selection, thinking, reasoning, and text verbosity while allowing session and directive overrides to remain stronger.

Reuse a single effective resolver during configuration migrations. Callers should consume the resolved profile rather than independently checking canonical and legacy fields, because local compatibility gates create partial rollouts and inconsistent behavior.
