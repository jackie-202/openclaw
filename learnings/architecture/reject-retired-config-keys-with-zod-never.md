---
title: "Reject retired config keys without retaining them in types"
date: 2026-07-24
category: architecture
component: backend
tags: [openclaw, zod, config-validation, migration, typescript]
file_type: rules
---

# Reject retired config keys without retaining them in TypeScript types

When a strict Zod object must reject one retired key with a migration-specific message, removing the key from the object shape produces only a generic `Unrecognized key` issue. Keeping it as an accepted `z.unknown()` field plus refinement also makes the accepted schema look broader than the runtime contract.

Use an impossible, rejection-only field in the validation schema while removing the field from the exported TypeScript type:

```ts
const ProfileSchema = z
  .object({
    model: z
      .never({
        error:
          "channels.runtimeByChannel profiles cannot contain model; use channels.modelByChannel instead.",
      })
      .optional(),
    thinkingLevel: z.string().optional(),
  })
  .strict();
```

For a supplied `model`, Zod reports the exact nested path with the custom message. Omitted `model` remains valid, unrelated unknown fields are still rejected by `.strict()`, and the exported runtime-profile type no longer exposes `model` as supported configuration.

Pair this with a validation test that asserts both the full path and migration destination. Also keep a raw-object resolver test when deleting a fallback, because the type/schema rejection alone does not prove production code stopped reading malformed or prevalidated input.
