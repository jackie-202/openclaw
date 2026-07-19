# Plan 2026-07-19: Remove legacy channels.modelByChannel runtime fallback

Keep upstream `modelByChannel` compatibility while removing it from the fork-only runtime-profile selection path.

## Analysis

### Upstream Ownership

- `git show upstream/main:src/config/types.channels.ts` defines `ChannelModelByChannelConfig` and `ChannelsConfig.modelByChannel`.
- `git show upstream/main:src/config/zod-schema.channels-config.ts` validates `modelByChannel`; `docs/gateway/config-channels.md` documents it.
- `git show upstream/main:src/channels/model-overrides.ts` reads the key in `resolveChannelModelOverride()`.
- Therefore preserve the schema, types, docs, validation, doctor/update handling, plugin metadata-key handling, and upstream legacy resolver behavior.

### Runtime Path

- Fork commit `f7d039a357` renamed the upstream resolver to `resolveLegacyChannelModelOverride()` and merged its result into `resolveChannelRuntimeProfile()` when `runtimeByChannel` omitted `model`.
- `src/auto-reply/reply/get-reply.ts` and `src/auto-reply/reply/get-reply-native-slash-fast-path.ts` already consume `resolveChannelRuntimeProfile()` for normal and native-slash inbound execution.
- `src/gateway/session-utils.ts` also consumes the runtime profile for fresh session projection. Restoring the resolver split removes the fallback from these fork paths without caller-specific filtering.
- Existing upstream consumers of `resolveChannelModelOverride()` remain on the upstream-owned compatibility path and must not be rewritten as part of this fork simplification.

### Knowledge

- `learnings/architecture/distinguish-session-runtime-history-from-model-selection-overrides.md`: preserve explicit `providerOverride`/`modelOverride`; persisted `modelProvider`/`model` are history, not selection inputs.
- `learnings/architecture/swift-cove-8585-validate-auto-fallback-pins-against-the-current-primary.md`: retain the existing stale auto-fallback cleanup and same-session user override behavior.
- `learnings/architecture/channel-runtime-profile-execution-precedence.md`: test normal and native-slash execution; this task intentionally revises its legacy fallback step to `session override > runtimeByChannel > agent/global default`.
- The task-cited `knowledge/workflows/openclaw-channel-model-switching.md` is absent from this checkout; commits `9c09c25952`, `f7d039a357`, and `0529559822` plus the repository learnings provide the available evidence.

## Available Skills

- `tdd`: record the resolver precedence RED/GREEN cycle.
- `openclaw-testing`: select and run focused tests and build proof.
- `autoreview`: perform the mandatory fresh closeout review before handoff.

## Implementation

1. In `src/channels/model-overrides.test.ts`, first change the fork-added fallback test to assert that a thinking-only `runtimeByChannel` profile does not inherit a model from `modelByChannel`; retain tests proving the runtime model wins when both maps exist and the upstream legacy resolver still works independently.
2. Run the focused resolver test and capture the expected RED failure showing the current legacy model merge.
3. In `src/channels/model-overrides.ts`, restore the upstream split: export the legacy `resolveChannelModelOverride()` directly, make `resolveChannelRuntimeProfile()` return only the matched `runtimeByChannel` profile, and delete the fork-added merge/wrapper logic. Reuse the existing generic target matcher; do not add caller filters or change target matching.
4. In `src/auto-reply/reply/get-reply.fast-path.test.ts`, replace the fresh-session `legacy channel model` expectation with agent/global default while retaining the thinking-only runtime profile. Keep the session override, complete runtime profile, global default, native-slash profile, and existing-session stale-pin cases.
5. Do not edit `src/config/**`, `docs/gateway/config-channels.md`, doctor/update code, or upstream consumers of `resolveChannelModelOverride()`; their remaining `modelByChannel` references are upstream-owned compatibility.
6. Run focused tests, build, live-config doctor, grep classification, diff checks, and `autoreview`; resolve accepted findings before handoff.

## Files to Modify

| File                                               | Change                                                                                                                        |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `src/channels/model-overrides.ts`                  | Remove the fork-added legacy merge and restore separate upstream legacy/runtime resolvers.                                    |
| `src/channels/model-overrides.test.ts`             | Prove runtime profiles no longer inherit a legacy model while preserving upstream resolver coverage.                          |
| `src/auto-reply/reply/get-reply.fast-path.test.ts` | Prove fresh-session precedence is session override, runtime profile, then default; retain existing-session re-entry coverage. |

## TDD

Implement the RED/GREEN cycle with `skill:tdd` and record evidence in `plans/checkpoints/warm-cove-7515.red-green-proof.md`.

**Test file:** `src/channels/model-overrides.test.ts`  
**Run command:** `pnpm test src/channels/model-overrides.test.ts`  
**Edit:** Replace the existing legacy-fallback test in `describe("resolveChannelModelOverride")`.

```ts
import { expect, it } from "vitest";
import type { OpenClawConfig } from "../config/config.js";
import { resolveChannelRuntimeProfile } from "./model-overrides.js";

it("does not merge modelByChannel into a runtime profile", () => {
  const resolved = resolveChannelRuntimeProfile({
    cfg: {
      channels: {
        modelByChannel: { discord: { channel: "openai/gpt-5.4" } },
        runtimeByChannel: { discord: { channel: { thinkingLevel: "xhigh" } } },
      },
    } as unknown as OpenClawConfig,
    channel: "discord",
    groupId: "channel",
  });

  expect(resolved).toEqual(expect.objectContaining({ thinkingLevel: "xhigh" }));
  expect(resolved).not.toHaveProperty("model");
});
```

| Test                                        | RED                                    | GREEN                                                            |
| ------------------------------------------- | -------------------------------------- | ---------------------------------------------------------------- |
| Runtime profile ignores `modelByChannel`    | `resolved.model` is `openai/gpt-5.4`   | `resolved` contains thinking only and no `model`                 |
| Fresh session with legacy-only model source | Existing table selects legacy model    | Updated table selects agent/global default                       |
| Existing session re-entry                   | Existing `0529559822` case stays green | Runtime profile wins; explicit session override remains stronger |

## Verification

1. `pnpm test src/channels/model-overrides.test.ts src/auto-reply/reply/get-reply.fast-path.test.ts src/auto-reply/reply/model-selection.test.ts`
2. `pnpm build`
3. `pnpm openclaw doctor --non-interactive` against the live migrated config using the new build; record the config source without printing secrets.
4. `git grep -n modelByChannel src/`; classify every remaining match as upstream-owned schema/docs-equivalent compatibility, upstream legacy resolver/caller, or test/metadata handling. There must be no match in `resolveChannelRuntimeProfile()` or its fork execution tests.
5. `git diff --check` and `git diff --numstat`; confirm no config/docs surface changed and production LOC does not grow.
6. Run `skill:autoreview` until no accepted/actionable findings remain.

---

_Status: DRAFT_
