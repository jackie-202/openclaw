---
title: "Reject retired configuration keys explicitly"
date: 2026-07-25
category: patterns
component: shared
tags: [zod, configuration, migration, validation]
---

Removing `model` from the TypeScript type for `runtimeByChannel` was insufficient because persisted or manually authored configuration could still contain it. The schema retained the key as optional `z.never(...)`, producing a precise error that directs users to `channels.modelByChannel`. When retiring a configuration field, reject it explicitly at runtime instead of relying on static types or silently ignoring it.