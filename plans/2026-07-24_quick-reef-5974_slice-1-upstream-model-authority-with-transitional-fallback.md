# Plan 2026-07-24: Slice 1: Upstream model authority with transitional fallback

*Status: DRAFT*
*Created: 2026-07-24*

## Analysis

### Codebase Context

- `src/channels/model-overrides.ts`: owns provider normalization and direct/parent/name/wildcard target candidates. `resolveChannelModelOverride()` reads only `modelByChannel`; `resolveChannelRuntimeProfile()` independently reads the fork profile.
- Runtime-only model consumers: regular/fresh execution in `src/auto-reply/reply/get-reply.ts`, native slash in `src/auto-reply/reply/get-reply-native-slash-fast-path.ts`, first-turn harness selection in `src/auto-reply/reply/dispatch-from-config.ts`, and reconstructed Gateway rows in `src/gateway/session-utils.ts`.
- Canonical consumers: `src/status/status-message.ts` already calls `resolveChannelModelOverride()`; `src/agents/agent-command.ts` calls it only behind a `cfg.channels?.modelByChannel` guard that blocks transitional fallback.
- Non-model profile ownership remains separate: reply directives consume thinking/reasoning, prepared runs consume text verbosity, and Gateway rows project thinking/reasoning.
- `435059f7d634a3300dd7533b707e8ccfe73008e0` split the earlier composite resolver and redirected reply/harness paths to runtime-only models, creating the current divergence; do not restore the old composite API because it obscures model authority.

### Relevant Documentation

- `docs/proposals/proposal-20260724-083714-6c9e68_minimize-channel-runtime-divergence-from-upstream.md`: Option A makes upstream `modelByChannel` authoritative, keeps fork runtime profiles for non-model fields, and requires code-first dual-read through one removable fallback seam before config migration.
- Required history to inspect: `9c09c259528500e0ac015589f2cb3c5a979d70b7` introduced composite runtime profiles; `435059f7d634a3300dd7533b707e8ccfe73008e0` partially separated model resolvers and left path-dependent consumers.

### Knowledge Base

- `learnings/architecture/bold-peak-9726-channel-runtime-profiles-must-reach-every-execution-path.md`: audit bypasses and legacy-presence guards; test runtime-only configuration explicitly.
- `learnings/architecture/channel-runtime-profile-execution-precedence.md`: keep target matching centralized and preserve session/heartbeat precedence plus independent non-model field propagation.
- `learnings/architecture/auto-fallback-origin-must-match-current-primary.md`: channel authority defines the auto-fallback primary, but explicit session overrides remain authoritative.
- `learnings/architecture/calm-fork-4679-manual-feature-removal-with-evolved-upstream.md`: use feature history as the change ledger while preserving later unrelated behavior.
- Recall used local fallback because QMD collection `openclaw-fork-learnings` was absent; the other returned cron/provider learnings were unrelated to this slice.

## Available Skills

- `compound-plan`: build and persist this implementation plan.
- `recall-knowledge`: recover relevant architecture rules before synthesis.
- `tdd`: implementation must capture RED/GREEN proof for focused behavior tests.
- `save-learning`: record planning findings as the final action of this planning task.

## Approach

Keep the current upstream-compatible `resolveChannelModelOverride()` behavior as the canonical first read. Wrap it with one proposal-marked fallback that reads `resolveChannelRuntimeProfile()?.model`, warns once for that resolution, and returns the same `ChannelModelOverride` shape. Model consumers call this resolver; supplemental runtime consumers continue calling `resolveChannelRuntimeProfile()` independently.

Do not import unrelated changes from current `upstream/main`: its resolver has since added direct-user matching that is outside this slice. Preserve the fork's current target candidates and session/heartbeat override precedence.

## Implementation

1. In `src/channels/model-overrides.test.ts`, add RED coverage for canonical precedence, runtime-only fallback, and exactly one deprecation warning containing `proposal-20260724-083714-6c9e68` plus both migration paths.
2. In `src/channels/model-overrides.ts`, extract the existing `modelByChannel` resolver body as the canonical read, then export a wrapper that returns the canonical match or calls one private `runtimeByChannel[*][*].model` fallback helper. Put the proposal comment and warning inside that helper so Slice 3 removes one helper and one call.
3. In `src/auto-reply/reply/get-reply.ts`, build the channel/target params once; resolve the model through `resolveChannelModelOverride()` and resolve the supplemental profile separately. Keep heartbeat, stored-session, stale-auto-fallback, thinking, reasoning, and text-verbosity precedence unchanged.
4. In `src/auto-reply/reply/get-reply-native-slash-fast-path.ts`, replace its model-only runtime-profile read with `resolveChannelModelOverride()`. Do not add non-model profile behavior to this path because it does not consume those fields today.
5. In `src/auto-reply/reply/dispatch-from-config.ts`, switch first-turn/cached harness model selection from `resolveChannelRuntimeProfile().model` to `resolveChannelModelOverride().model` without changing turn override, stored override, or harness fallback order.
6. In `src/agents/agent-command.ts`, remove the `cfg.channels?.modelByChannel` presence guard; call the canonical resolver whenever no explicit run override exists so runtime-only deployed config reaches the transitional fallback.
7. In `src/gateway/session-utils.ts`, resolve reconstructed row model identity through `resolveChannelModelOverride()` while continuing to project thinking/reasoning from the runtime profile. Leave selected and persisted runtime model precedence intact.
8. Keep `src/status/status-message.ts` unchanged because it already uses `resolveChannelModelOverride()`; add fallback and conflict attribution tests against the shared resolver behavior.
9. Update focused caller tests with the same channel target and model pair: conflicting config must select `modelByChannel`, runtime-only config must select the transitional fallback, and supplemental non-model fields must remain unchanged across regular/fresh replies, native slash, agent-command, status, and Gateway projection.

## Files to Modify

| File | Change |
| --- | --- |
| `src/channels/model-overrides.ts` | Add canonical-first wrapper and the sole warned fallback seam. |
| `src/channels/model-overrides.test.ts` | Prove precedence, fallback, warning count, and preserved matching metadata. |
| `src/auto-reply/reply/get-reply.ts` | Separate canonical model resolution from supplemental runtime resolution. |
| `src/auto-reply/reply/get-reply-native-slash-fast-path.ts` | Replace its model-only runtime-profile read with canonical resolution. |
| `src/auto-reply/reply/dispatch-from-config.ts` | Use canonical model resolution for fresh-session harness selection. |
| `src/agents/agent-command.ts` | Remove the canonical-config presence guard. |
| `src/gateway/session-utils.ts` | Use canonical model resolution for reconstructed rows. |
| `src/auto-reply/reply/get-reply.fast-path.test.ts` | Cover regular/fresh and native canonical/fallback parity. |
| `src/auto-reply/reply/dispatch-from-config.test.ts` | Cover first-turn canonical precedence and runtime fallback. |
| `src/agents/agent-command.live-model-switch.test.ts` | Prove runtime-only config invokes the resolver and uses its fallback result. |
| `src/auto-reply/status.test.ts` | Prove canonical/fallback status attribution uses the selected model. |
| `src/gateway/session-utils.test.ts` | Prove model authority changed while non-model projection did not. |

## TDD

Implement the RED/GREEN cycle with `skill:tdd`; record evidence in `plans/checkpoints/quick-reef-5974.red-green-proof.md`.

**Primary test file:** `src/channels/model-overrides.test.ts`  
**Run command:** `pnpm test src/channels/model-overrides.test.ts -- --reporter=dot`  
**Edit:** add the hoisted logger mock near imports and append this case to the existing resolver suite.

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockLogWarn } = vi.hoisted(() => ({ mockLogWarn: vi.fn() }));

vi.mock("../logging/subsystem.js", () => ({
  createSubsystemLogger: () => {
    const logger = {
      subsystem: "channels/model-overrides",
      isEnabled: vi.fn(() => true),
      trace: vi.fn(),
      debug: vi.fn(),
      info: vi.fn(),
      warn: mockLogWarn,
      error: vi.fn(),
      fatal: vi.fn(),
      raw: vi.fn(),
      child: vi.fn(),
    };
    logger.child.mockReturnValue(logger);
    return logger;
  },
}));

it("falls back to the runtime profile model and warns once", () => {
  const resolved = resolveChannelModelOverride({
    cfg: {
      channels: {
        runtimeByChannel: {
          discord: {
            "1494790764134273195": { model: "openai/gpt-5.5", thinkingLevel: "xhigh" },
          },
        },
      },
    } as unknown as OpenClawConfig,
    channel: "discord",
    groupId: "1494790764134273195",
  });

  expect(resolved).toMatchObject({
    model: "openai/gpt-5.5",
    matchKey: "1494790764134273195",
  });
  expect(mockLogWarn).toHaveBeenCalledOnce();
  expect(mockLogWarn).toHaveBeenCalledWith(
    expect.stringContaining("channels.modelByChannel"),
    expect.objectContaining({ proposalId: "proposal-20260724-083714-6c9e68" }),
  );
});
```

| Test | RED before implementation | GREEN after implementation |
| --- | --- | --- |
| Runtime-only resolver fallback | Resolver returns `null`; warning count is `0`. | Runtime model and match metadata return; one warning is emitted. |
| Conflicting resolver values | Existing test already returns canonical; no warning assertion exists. | Canonical model wins and warning count remains `0`. |
| Regular/fresh/native paths | Runtime-only consumers choose the conflicting runtime model or ignore canonical-only config. | All choose the canonical model and retain runtime non-model fields; fallback-only cases keep working. |
| Agent-command | Runtime-only config skips the resolver due to the presence guard. | Resolver is called and its fallback result seeds the run. |
| Status/Gateway | Status cannot attribute runtime fallback; Gateway chooses the conflicting runtime model. | Both report the same canonical/fallback result as execution. |

### Focused Verification

1. Run `pnpm test src/channels/model-overrides.test.ts src/auto-reply/reply/get-reply.fast-path.test.ts src/auto-reply/reply/dispatch-from-config.test.ts src/agents/agent-command.live-model-switch.test.ts src/auto-reply/status.test.ts src/gateway/session-utils.test.ts -- --reporter=dot`.
2. Run `pnpm check:changed` for formatting, lint, types, and affected lanes.
3. Run the repository-wide `pnpm test` and `pnpm build` gates in Testbox/Crabbox rather than fanning them out on the Mac; record provider and run IDs.
4. Run a fresh autoreview before handoff and resolve every accepted actionable finding.

## Dependencies

- Keep `runtimeByChannel[*][*].model` in types/schema/validation until Slice 3; do not edit config metadata, plugin SDK exports, workspace tooling, session storage, cron/global routing, or live config.
- Slice 2 must deploy and migrate live config before Slice 3 deletes the fallback helper.
- The warning is intentionally per resolver invocation, not process-deduplicated; canonical hits and model-free runtime profiles emit no warning.
