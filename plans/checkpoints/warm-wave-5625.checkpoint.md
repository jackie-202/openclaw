# Checkpoint: warm-wave-5625

## Steps

- ✅ Step 1: Inspect the original plan, parent implementation, and existing evidence
- ✅ Step 2: Capture and classify every `modelByChannel` match under `src/`
- ✅ Step 3: Run scoped verification and record fresh GREEN evidence
- ✅ Step 4: Save at least one session learning

## Last completed

COMPLETE: exhaustive evidence persisted, verification passed, and the mandatory session learning was saved.

## Context for resume

All steps complete. Production and test files were left unchanged during this evidence-only follow-up.

## Exhaustive source-search evidence

Command: `git grep -n modelByChannel src/`

Verbatim output (112 lines):

```text
src/agents/agent-command.live-model-switch.test.ts:949:        cfg?: { channels?: { modelByChannel?: Record<string, Record<string, string>> } };
src/agents/agent-command.live-model-switch.test.ts:955:      const entries = channel ? input.cfg?.channels?.modelByChannel?.[channel] : undefined;
src/agents/agent-command.live-model-switch.test.ts:1177:        modelByChannel: {
src/agents/agent-command.live-model-switch.test.ts:1221:        modelByChannel: {
src/agents/agent-command.live-model-switch.test.ts:1255:        modelByChannel: {
src/agents/agent-command.live-model-switch.test.ts:1301:        modelByChannel: {
src/agents/agent-command.live-model-switch.test.ts:1346:        modelByChannel: {
src/agents/agent-command.live-model-switch.test.ts:1391:        modelByChannel: {
src/agents/agent-command.live-model-switch.test.ts:1431:        modelByChannel: {
src/agents/agent-command.live-model-switch.test.ts:1471:        modelByChannel: {
src/agents/agent-command.ts:1336:      cfg.channels?.modelByChannel && !hasExplicitRunOverride
src/auto-reply/reply/get-reply.fast-path.test.ts:414:            ? { modelByChannel: { discord: { [target]: testCase.legacyModel } } }
src/auto-reply/status.test.ts:802:          modelByChannel: {
src/auto-reply/status.test.ts:832:          modelByChannel: {
src/channels/config-presence.ts:21:const IGNORED_CHANNEL_CONFIG_KEYS = new Set(["defaults", "modelByChannel", "runtimeByChannel"]);
src/channels/model-overrides.test.ts:21:            modelByChannel: {
src/channels/model-overrides.test.ts:38:            modelByChannel: {
src/channels/model-overrides.test.ts:56:            modelByChannel: {
src/channels/model-overrides.test.ts:115:          modelByChannel: {
src/channels/model-overrides.test.ts:169:          modelByChannel: {
src/channels/model-overrides.test.ts:189:          modelByChannel: {
src/channels/model-overrides.test.ts:209:          modelByChannel: {
src/channels/model-overrides.test.ts:229:        modelByChannel: {
src/channels/model-overrides.test.ts:270:  it("does not inherit legacy modelByChannel when runtime profile has no model", () => {
src/channels/model-overrides.test.ts:274:          modelByChannel: {
src/channels/model-overrides.ts:239:  const modelByChannel = params.cfg.channels?.modelByChannel as
src/channels/model-overrides.ts:242:  const providerEntries = resolveProviderEntry(modelByChannel, channel);
src/cli/update-cli.test.ts:4174:        modelByChannel: {
src/cli/update-cli.test.ts:4188:        modelByChannel: {
src/cli/update-cli.test.ts:4236:            modelByChannel?: Record<string, Record<string, string>>;
src/cli/update-cli.test.ts:4244:              modelByChannel?: Record<string, Record<string, string>>;
src/cli/update-cli.test.ts:4249:    expect(syncConfig?.channels?.modelByChannel?.openai?.whatsapp).toBe("openai/gpt-5.5");
src/cli/update-cli.test.ts:4250:    expect(syncConfig?.channels?.modelByChannel?.openai?.telegram).toBe("openai/gpt-5.4");
src/cli/update-cli.test.ts:4251:    expect(lastWrite?.nextConfig?.channels?.modelByChannel?.openai?.whatsapp).toBe(
src/cli/update-cli.test.ts:4254:    expect(lastWrite?.nextConfig?.channels?.modelByChannel?.openai?.telegram).toBe(
src/cli/update-cli/update-command.ts:283:    params.preUpdateChannels.modelByChannel,
src/cli/update-cli/update-command.ts:288:  const currentModelByChannel = normalizeChannelConfigMap(params.channels.modelByChannel) ?? {};
src/cli/update-cli/update-command.ts:315:    ? { channels: { ...params.channels, modelByChannel: restoredModelByChannel }, changed: true }
src/cli/update-cli/update-command.ts:344:    if (channelId !== "modelByChannel") {
src/commands/configure.channels.test.ts:109:          modelByChannel: { openai: { telegram: "gpt-5.4" } },
src/commands/configure.channels.test.ts:179:          modelByChannel: { openai: { telegram: "gpt-5.4" } },
src/commands/configure.channels.test.ts:188:      modelByChannel: { openai: { telegram: "gpt-5.4" } },
src/commands/configure.channels.ts:29:const RESERVED_CHANNEL_CONFIG_KEYS = new Set(["defaults", "modelByChannel", "runtimeByChannel"]);
src/commands/doctor-state-integrity.ts:605:      channelId === "modelByChannel" ||
src/commands/doctor/shared/allowfrom-fallback-migration.ts:10:const PSEUDO_CHANNEL_KEYS = new Set(["defaults", "modelByChannel", "tools"]);
src/commands/doctor/shared/codex-route-warnings.test.ts:1886:          modelByChannel: {
src/commands/doctor/shared/codex-route-warnings.test.ts:1927:        "- channels.modelByChannel.telegram.default: openai-codex/gpt-5.4 -> openai/gpt-5.4.",
src/commands/doctor/shared/codex-route-warnings.test.ts:1968:    expect(result.cfg.channels?.modelByChannel?.telegram?.default).toBe("openai/gpt-5.4");
src/commands/doctor/shared/codex-route-warnings.test.ts:2622:          modelByChannel: {
src/commands/doctor/shared/codex-route-warnings.test.ts:3674:          modelByChannel: {
src/commands/doctor/shared/codex-route-warnings.test.ts:3698:    expect(result.cfg.channels?.modelByChannel?.telegram?.default).toBe("openai/gpt-5.5");
src/commands/doctor/shared/codex-route-warnings.ts:964:  const channelsModelByChannel = asMutableRecord(cfg.channels?.modelByChannel);
src/commands/doctor/shared/codex-route-warnings.ts:974:          path: `channels.modelByChannel.${channelId}.${targetId}`,
src/commands/doctor/shared/codex-route-warnings.ts:1080:  const channelsModelByChannel = asMutableRecord(cfg.channels?.modelByChannel);
src/commands/doctor/shared/codex-route-warnings.ts:1089:        path: `channels.modelByChannel.${channelId}.${targetId}`,
src/commands/doctor/shared/codex-route-warnings.ts:2547:  const channelsModelByChannel = asMutableRecord(nextConfig.channels?.modelByChannel);
src/commands/doctor/shared/codex-route-warnings.ts:2560:          path: `channels.modelByChannel.${channelId}.${targetId}`,
src/commands/doctor/shared/config-flow-steps.test.ts:457:          modelByChannel: {
src/commands/doctor/shared/config-flow-steps.test.ts:477:            modelByChannel: {
src/commands/doctor/shared/legacy-config-migrate.test.ts:2313:        modelByChannel: {
src/commands/doctor/shared/legacy-config-migrate.test.ts:2386:    expect(res.config?.channels?.modelByChannel?.telegram?.["*"]).toBe("anthropic/claude-opus-4-7");
src/commands/doctor/shared/legacy-config-migrate.test.ts:2414:      'config.channels.modelByChannel.telegram.* from "anthropic/claude-opus-4-5" to "anthropic/claude-opus-4-7"',
src/commands/doctor/shared/legacy-config-migrations.runtime.models.ts:811:  return path.includes(".modelByChannel.");
src/commands/doctor/shared/release-configured-plugin-installs.test.ts:219:          modelByChannel: {
src/commands/doctor/shared/release-configured-plugin-installs.test.ts:246:          modelByChannel: {
src/commands/doctor/shared/release-configured-plugin-installs.ts:121:        channelId === "modelByChannel" ||
src/commands/doctor/shared/release-configured-plugin-installs.ts:161:  const modelByChannel = asObjectRecord(cfg.channels?.modelByChannel);
src/commands/doctor/shared/release-configured-plugin-installs.ts:162:  for (const [providerId, channelMap] of Object.entries(modelByChannel ?? {})) {
src/commands/doctor/shared/stale-plugin-config.test.ts:230:        modelByChannel: {
src/commands/doctor/shared/stale-plugin-config.test.ts:266:      "- channels.modelByChannel: removed 1 stale channel model override (missing-chat-plugin)",
src/commands/doctor/shared/stale-plugin-config.test.ts:274:    expect(result.config.channels?.modelByChannel).toEqual({
src/commands/doctor/shared/stale-plugin-config.ts:13:const CHANNEL_CONFIG_META_KEYS = new Set(["defaults", "modelByChannel", "runtimeByChannel"]);
src/commands/doctor/shared/stale-plugin-config.ts:22:  | "modelByChannel";
src/commands/doctor/shared/stale-plugin-config.ts:272:  const modelByChannel = asObjectRecord(cfg.channels?.modelByChannel);
src/commands/doctor/shared/stale-plugin-config.ts:273:  if (modelByChannel) {
src/commands/doctor/shared/stale-plugin-config.ts:274:    for (const [providerId, channelMap] of Object.entries(modelByChannel)) {
src/commands/doctor/shared/stale-plugin-config.ts:285:          pathLabel: `channels.modelByChannel.${providerId}.${channelId}`,
src/commands/doctor/shared/stale-plugin-config.ts:286:          surface: "modelByChannel",
src/commands/doctor/shared/stale-plugin-config.ts:443:    const modelByChannelCount = hits.filter((hit) => hit.surface === "modelByChannel").length;
src/commands/doctor/shared/stale-plugin-config.ts:444:    if (modelByChannelCount > 0) {
src/commands/doctor/shared/stale-plugin-config.ts:446:        `- channels.modelByChannel: removed ${modelByChannelCount} stale channel model override${modelByChannelCount === 1 ? "" : "s"} (${channelIds.join(", ")})`,
src/commands/doctor/shared/stale-plugin-config.ts:467:    const modelByChannel = asObjectRecord(channels.modelByChannel);
src/commands/doctor/shared/stale-plugin-config.ts:468:    if (modelByChannel) {
src/commands/doctor/shared/stale-plugin-config.ts:469:      for (const [providerId, channelMap] of Object.entries(modelByChannel)) {
src/commands/doctor/shared/stale-plugin-config.ts:480:          delete modelByChannel[providerId];
src/commands/doctor/shared/stale-plugin-config.ts:483:      if (Object.keys(modelByChannel).length === 0) {
src/commands/doctor/shared/stale-plugin-config.ts:484:        delete channels.modelByChannel;
src/commands/status.scan.fast-json.ts:16:const IGNORED_CHANNEL_CONFIG_KEYS = new Set(["defaults", "modelByChannel"]);
src/commands/status.test.ts:511:      (key) => key !== "defaults" && key !== "modelByChannel" && key !== "runtimeByChannel",
src/commands/status.test.ts:515:      .filter((key) => key !== "defaults" && key !== "modelByChannel" && key !== "runtimeByChannel")
src/config/config.plugin-validation.test.ts:1689:        modelByChannel: {
src/config/plugin-auto-enable.core.test.ts:880:  it("ignores channels.modelByChannel for plugin auto-enable", () => {
src/config/plugin-auto-enable.core.test.ts:884:          modelByChannel: {
src/config/plugin-auto-enable.core.test.ts:894:    expect(result.config.plugins?.entries?.modelByChannel).toBeUndefined();
src/config/plugin-auto-enable.shared.ts:532:    if (key === "defaults" || key === "modelByChannel" || key === "runtimeByChannel") {
src/config/schema.help.ts:1957:  "channels.modelByChannel":
src/config/schema.hints.ts:99:  "channels.modelByChannel",
src/config/schema.labels.ts:1030:  "channels.modelByChannel": "Channel Model Overrides",
src/config/types.channels.ts:144:  modelByChannel?: ChannelModelByChannelConfig;
src/config/validation.ts:1491:  const allowedChannels = new Set<string>(["defaults", "modelByChannel", "runtimeByChannel", ...bundledChannelIds]);
src/config/zod-schema.channels-config.ts:78:    modelByChannel: ChannelModelByChannelSchema,
src/config/zod-schema.providers.lazy-runtime.test.ts:35:      modelByChannel: {
src/gateway/model-pricing-cache.test.ts:139:        modelByChannel: {
src/gateway/model-pricing-cache.ts:1000:  for (const channelMap of Object.values(config.channels?.modelByChannel ?? {})) {
src/plugins/channel-presence-policy.ts:30:const IGNORED_CHANNEL_CONFIG_KEYS = new Set(["defaults", "modelByChannel", "runtimeByChannel"]);
src/plugins/gateway-startup-plugin-ids.ts:767:    .filter((channelId) => channelId !== "defaults" && channelId !== "modelByChannel")
src/plugins/uninstall.test.ts:289:        channelIds: ["defaults", "discord", "discord", "modelByChannel", "slack"],
src/plugins/uninstall.test.ts:631:      name: "preserves shared channel keys (defaults, modelByChannel)",
src/plugins/uninstall.test.ts:641:          modelByChannel: { timbot: "gpt-3.5" } as Record<string, string>,
src/plugins/uninstall.test.ts:648:        modelByChannel: { timbot: "gpt-3.5" },
src/plugins/uninstall.ts:334:const SHARED_CHANNEL_CONFIG_KEYS = new Set(["defaults", "modelByChannel", "runtimeByChannel"]);
src/routing/channel-route-targets.ts:17:const CHANNELS_CONFIG_META_KEYS = new Set(["defaults", "modelByChannel"]);
```

### Exhaustive classification

- Upstream contract/schema (2): `src/config/types.channels.ts:144`; `src/config/zod-schema.channels-config.ts:78`.
- Standalone upstream legacy resolver or caller (3): `src/agents/agent-command.ts:1336`; `src/channels/model-overrides.ts:239,242`.
- Config migration, maintenance, or metadata (45): `src/channels/config-presence.ts:21`; `src/cli/update-cli/update-command.ts:283,288,315,344`; `src/commands/configure.channels.ts:29`; `src/commands/doctor-state-integrity.ts:605`; `src/commands/doctor/shared/allowfrom-fallback-migration.ts:10`; `src/commands/doctor/shared/codex-route-warnings.ts:964,974,1080,1089,2547,2560`; `src/commands/doctor/shared/legacy-config-migrations.runtime.models.ts:811`; `src/commands/doctor/shared/release-configured-plugin-installs.ts:121,161,162`; `src/commands/doctor/shared/stale-plugin-config.ts:13,22,272,273,274,285,286,443,444,446,467,468,469,480,483,484`; `src/commands/status.scan.fast-json.ts:16`; `src/config/plugin-auto-enable.shared.ts:532`; `src/config/schema.help.ts:1957`; `src/config/schema.hints.ts:99`; `src/config/schema.labels.ts:1030`; `src/config/validation.ts:1491`; `src/gateway/model-pricing-cache.ts:1000`; `src/plugins/channel-presence-policy.ts:30`; `src/plugins/gateway-startup-plugin-ids.ts:767`; `src/plugins/uninstall.ts:334`; `src/routing/channel-route-targets.ts:17`.
- Test coverage (62): `src/agents/agent-command.live-model-switch.test.ts:949,955,1177,1221,1255,1301,1346,1391,1431,1471`; `src/auto-reply/reply/get-reply.fast-path.test.ts:414`; `src/auto-reply/status.test.ts:802,832`; `src/channels/model-overrides.test.ts:21,38,56,115,169,189,209,229,270,274`; `src/cli/update-cli.test.ts:4174,4188,4236,4244,4249,4250,4251,4254`; `src/commands/configure.channels.test.ts:109,179,188`; `src/commands/doctor/shared/codex-route-warnings.test.ts:1886,1927,1968,2622,3674,3698`; `src/commands/doctor/shared/config-flow-steps.test.ts:457,477`; `src/commands/doctor/shared/legacy-config-migrate.test.ts:2313,2386,2414`; `src/commands/doctor/shared/release-configured-plugin-installs.test.ts:219,246`; `src/commands/doctor/shared/stale-plugin-config.test.ts:230,266,274`; `src/commands/status.test.ts:511,515`; `src/config/config.plugin-validation.test.ts:1689`; `src/config/plugin-auto-enable.core.test.ts:880,884,894`; `src/config/zod-schema.providers.lazy-runtime.test.ts:35`; `src/gateway/model-pricing-cache.test.ts:139`; `src/plugins/uninstall.test.ts:289,631,641,648`.
- Reconciliation: 2 + 3 + 45 + 62 = 112 raw matches. Every output line is listed once.

## Compatibility decision

Upstream `main` still defines and validates `channels.modelByChannel` in `src/config/types.channels.ts` and `src/config/zod-schema.channels-config.ts`, and implements `resolveChannelModelOverride()` in `src/channels/model-overrides.ts`. This fork therefore retains those compatibility, maintenance, metadata, caller, and test surfaces. Only the fork-specific runtime-profile composition was removed: `resolveChannelRuntimeProfile()` reads `runtimeByChannel` only.

Under `src/auto-reply/reply/`, the exhaustive search returns exactly one test-only match at `src/auto-reply/reply/get-reply.fast-path.test.ts:414`. That fixture proves legacy input is ignored and the global default wins; there are no production `modelByChannel` reads in that subtree.

## Verification

- Fresh GREEN: `pnpm test src/channels/model-overrides.test.ts src/auto-reply/reply/get-reply.fast-path.test.ts src/auto-reply/reply/model-selection.test.ts -- --reporter=verbose` -> exit 0; 83 tests passed across 3 files and 2 Vitest shards.
- Build: `pnpm build` -> exit 0.
- Format: `pnpm exec oxfmt --check --threads=1 src/channels/model-overrides.ts src/channels/model-overrides.test.ts src/auto-reply/reply/get-reply.fast-path.test.ts src/auto-reply/reply/dispatch-from-config.ts src/auto-reply/reply/dispatch-from-config.test.ts src/config/schema.help.ts` -> exit 0; 6 files correctly formatted.
- Normal scoped lint preparation was blocked by an unrelated pre-existing Slack boundary declaration error: `primeChannelOutboundSendMock` is not exported from `openclaw/plugin-sdk/channel-contract-testing`.
- Scoped lint retry: `OPENCLAW_OXLINT_SKIP_PREPARE=1 node scripts/run-oxlint.mjs src/channels/model-overrides.ts src/channels/model-overrides.test.ts src/auto-reply/reply/get-reply.fast-path.test.ts src/auto-reply/reply/dispatch-from-config.ts src/auto-reply/reply/dispatch-from-config.test.ts src/config/schema.help.ts` -> exit 0.
- `git diff --check` -> exit 0.
- Production delta in `src/channels/model-overrides.ts`: 35 additions, 83 deletions. Across the six preserved source/test files: 49 additions, 100 deletions.
- Final `git grep -n modelByChannel src/` reproduced the same 112 lines classified above.

Historical genuine TDD proof remains at `plans/checkpoints/warm-cove-7515.red-green-proof.md:5` (RED, exit 1: expected `gpt-5.5`, received legacy `gpt-5.4`) and `plans/checkpoints/warm-cove-7515.red-green-proof.md:69` (GREEN, exit 0). The lineage artifact at `plans/checkpoints/bright-brook-6161.evidence.md:27` reports the historical command strings as truncated and their outcomes unavailable; this follow-up does not fabricate replacements.
