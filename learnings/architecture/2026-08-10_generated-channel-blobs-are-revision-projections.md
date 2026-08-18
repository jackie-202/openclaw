---
title: "Generated channel blobs are revision-specific projections"
date: 2026-08-10
category: architecture
component: tooling
tags: [generated-metadata, compatibility, plugins, investigation]
file_type: rules
---

# Generated channel blobs are revision-specific projections

When auditing a generated channel metadata commit across divergent revisions, do not compare or transplant the minified generated line as if it were canonical source.

Trace each semantic field through the owning schema and metadata chain. In OpenClaw, the WhatsApp path is `src/config/zod-schema.providers-whatsapp.ts` through the bundled-channel Plugin SDK facade and `extensions/whatsapp/src/config-schema.ts` into `scripts/generate-bundled-channel-config-metadata.ts`. The generated artifact must be recreated after upstream and retained source changes are combined.

Keep plugin manifest config separate from channel metadata. A plugin such as Deliberation that has `configSchema` but no `channels` declaration is intentionally absent from `bundled-channel-config-metadata.generated.ts`; its promotion proof belongs to manifest parsing/copying and runtime-parser parity instead.

For divergent history, compare the generated commit to its own parent to identify its original semantic delta, then compare canonical inputs at the target base and retained baseline. Use the generator's `--check` mode after one write as the idempotence proof.
