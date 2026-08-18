---
title: "Config metadata promotions have second-order projections"
date: 2026-08-10
category: architecture
component: tooling
tags: [generated-metadata, config-schema, plugin-manifests, promotion]
file_type: rules
---

# Config metadata promotions have second-order projections

Promoting a retained config surface onto a newer base requires more than regenerating the direct schema blob. Trace every consumer that materializes or fingerprints that schema.

For bundled channel config in OpenClaw, the direct projection is `src/config/bundled-channel-config-metadata.generated.ts`, but the same canonical inputs also affect built plugin manifests and the config documentation baseline. After combining source changes, regenerate channel metadata, regenerate `docs/.generated/config-baseline.sha256` and `config-baseline.counts.json`, then build so `dist/extensions/*/openclaw.plugin.json` is copied or augmented from the fresh projection.

Keep channel and plugin config axes separate. A plugin manifest with `configSchema` but no `channels` declaration must not appear in bundled channel metadata, yet it still changes the plugin config-doc baseline and its complete manifest must be copied into build output. Manifest JSON Schema validation runs before plugin runtime parsing, so runtime-only cross-field checks form an additional contract rather than metadata the channel generator should encode.

Use this verification order in a promotion workspace:

1. Port canonical source semantics onto the target base.
2. Regenerate direct channel and config-doc projections.
3. Run immediate no-drift checks to prove idempotence.
4. Build and inspect copied/augmented plugin metadata.
5. Run release generated-artifact checks to discover any further base-owned projection.
