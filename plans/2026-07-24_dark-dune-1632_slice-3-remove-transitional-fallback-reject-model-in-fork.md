# Plan 2026-07-24: Remove transitional channel-model fallback

Delete the temporary runtime-profile model read while preserving `runtimeByChannel` as a non-model supplement.

## Analysis

- `src/channels/model-overrides.ts` contains the only proposal-marked fallback: `resolveChannelModelOverride()` reads `modelByChannel`, then `resolveRuntimeChannelModelFallback()` reads `resolveChannelRuntimeProfile()?.model` and warns.
- `src/config/types.channels.ts` and `src/config/zod-schema.channels-config.ts` still accept profile `model`; `src/config/schema.help.ts` still documents it.
- `src/auto-reply/reply/get-reply.ts`, native slash, dispatch, agent-command, status, and Gateway projection already call `resolveChannelModelOverride()` unconditionally. They need no production rerouting after the fallback is removed.
- `src/auto-reply/reply/get-reply.ts` and `src/gateway/session-utils.ts` independently resolve the runtime profile for thinking/reasoning/text verbosity. Keep that split.
- Doctor's `runtimeByChannel` pseudo-channel exclusions must remain because the supplement remains. Update code already preserves upstream `modelByChannel`; no update or Plugin SDK model-authority code remains to remove.
- Live precondition inspection on 2026-07-24 found zero `runtimeByChannel[*][*].model` entries. Re-run the check immediately before implementation and stop if the count is nonzero.

## Knowledge

- `docs/proposals/proposal-20260724-083714-6c9e68_minimize-channel-runtime-divergence-from-upstream.md`: Slice 3 removes permanent dual-read only after migration and keeps non-model fields fresh-session capable.
- `learnings/architecture/canonical-channel-model-fallback-seam.md`: preserve the model-facing API and remove only the marked fallback helper/call.
- `learnings/architecture/calm-fork-4679-manual-feature-removal-with-evolved-upstream.md`: use feature commits as deletion ledgers, preserve later unrelated behavior, and classify the remaining upstream diff.
- `learnings/architecture/auto-fallback-origin-must-match-current-primary.md`: retain stale automatic-fallback pin validation and explicit session-override precedence.
- Knowledge search used local fallback because QMD collection `openclaw-fork-learnings` was absent.

## Available Skills

- `tdd`: record RED/GREEN evidence for resolver and validation behavior.
- `openclaw-testing`: run focused Vitest first, then delegated changed/full gates.
- `autoreview`: run the mandatory fresh review before handoff.
- `save-learning`: record implementation findings as the final task action.

## Implementation

1. Re-run the read-only live-config precondition without printing config values:
   `python3 -c 'import json,pathlib; p=pathlib.Path.home()/".openclaw/openclaw.json"; d=json.loads(p.read_text()); r=d.get("channels",{}).get("runtimeByChannel",{}); hits=[f"{c}.{t}" for c,v in r.items() if isinstance(v,dict) for t,x in v.items() if isinstance(x,dict) and "model" in x]; print({"count":len(hits),"locations":hits}); raise SystemExit(bool(hits))'`.
   Stop without editing if it exits nonzero; never write `~/.openclaw/openclaw.json`.
2. Capture the before baseline with `git diff --stat upstream/main --` over the files in the table below. Preserve all unrelated dirty Slice 1 worktree changes.
3. Apply `skill:tdd`: first rewrite the fallback tests to require a `null` model result from runtime-only input and add the config rejection test; run the focused files and save RED evidence to `plans/checkpoints/dark-dune-1632.red-green-proof.md`.
4. In `src/channels/model-overrides.ts`, delete the logger import/instance and `resolveRuntimeChannelModelFallback()`. Export the current configured resolver directly as `resolveChannelModelOverride()` so it reads only `modelByChannel`; keep generic target matching and `resolveChannelRuntimeProfile()` unchanged.
5. In `src/config/types.channels.ts`, remove `model` from `ChannelRuntimeProfileConfig`. In `src/config/zod-schema.channels-config.ts`, replace the accepted string with a rejection-only `z.never({ error: "channels.runtimeByChannel profiles cannot contain model; use channels.modelByChannel instead." }).optional()` sentinel so validation reports the exact nested `.model` path and migration destination while other unknown keys remain strict.
6. In `src/config/schema.help.ts`, describe runtime profiles as `thinkingLevel`, `reasoningLevel`, and `textVerbosity` only. Keep labels/hints and doctor pseudo-key exclusions because `runtimeByChannel` itself remains supported.
7. Rewrite affected tests instead of preserving dual-authority fixtures. Remove logger/fallback assertions from `src/channels/model-overrides.test.ts`; add valid-profile and exact rejection coverage to `src/config/config.plugin-validation.test.ts`; make `src/auto-reply/reply/get-reply.fast-path.test.ts` explicitly prove fresh-session model/thinking ownership; delete or convert transitional cases in dispatch, Gateway, agent-command, and status tests without duplicating canonical coverage.
8. Run focused GREEN proof, changed gates, build/full test proof, autoreview, and the after `upstream/main` stat. Do not commit, push, branch, open a PR, or touch workspace tooling.
9. In the final task note, report the before/after stat and the commit dispositions in the table below.

| Commit | Disposition |
| --- | --- |
| `9c09c25952` | Retain narrowly for profile matching and non-model persistence; replace profile-model ownership with `modelByChannel`. |
| `435059f7d6` | Replace its runtime-profile model-authority direction; retain the separated supplemental resolver and unrelated changes. |
| `0529559822` | Retain narrowly; stale automatic-fallback pins remain checked against the canonical `modelByChannel` primary. |

## Files to Modify

| File | Change |
| --- | --- |
| `src/channels/model-overrides.ts` | Delete the sole transitional fallback and logger; keep canonical and supplemental resolvers separate. |
| `src/channels/model-overrides.test.ts` | Replace fallback/precedence tests with single-authority coverage. |
| `src/config/types.channels.ts` | Remove profile `model`. |
| `src/config/zod-schema.channels-config.ts` | Reject profile `model` with an exact migration message. |
| `src/config/schema.help.ts` | Remove `model` from runtime-profile help. |
| `src/config/config.plugin-validation.test.ts` | Prove valid non-model profiles and rejected `model`. |
| `src/auto-reply/reply/get-reply.fast-path.test.ts` | Prove fresh-session model/thinking ownership and trim conflict fixtures. |
| `src/auto-reply/reply/dispatch-from-config.test.ts` | Remove transitional runtime-model delivery-default coverage. |
| `src/gateway/session-utils.test.ts` | Keep canonical model plus supplemental thinking/reasoning projection. |
| `src/agents/agent-command.live-model-switch.test.ts` | Remove transitional fallback-only case. |
| `src/auto-reply/status.test.ts` | Remove transitional fallback attribution case. |

## TDD

Implement the cycle with `skill:tdd`; record evidence in `plans/checkpoints/dark-dune-1632.red-green-proof.md`.

**Test files:** `src/channels/model-overrides.test.ts`, `src/config/config.plugin-validation.test.ts`, `src/auto-reply/reply/get-reply.fast-path.test.ts`  
**Run command:** `pnpm test src/channels/model-overrides.test.ts src/config/config.plugin-validation.test.ts src/auto-reply/reply/get-reply.fast-path.test.ts -- --reporter=dot`

Append/replace cases inside the existing describe blocks using their current imports and helpers:

```ts
it("does not resolve a model from runtimeByChannel", () => {
  const cfg = {
    channels: {
      runtimeByChannel: {
        discord: { "channel-123": { model: "openai/gpt-5.5", thinkingLevel: "xhigh" } },
      },
    },
  } as unknown as OpenClawConfig;

  expect(
    resolveChannelModelOverride({ cfg, channel: "discord", groupId: "channel-123" }),
  ).toBeNull(); // RED: transitional fallback currently returns openai/gpt-5.5.
  expect(
    resolveChannelRuntimeProfile({ cfg, channel: "discord", groupId: "channel-123" }),
  ).toEqual(expect.objectContaining({ thinkingLevel: "xhigh" }));
});

it("rejects model in a channel runtime profile", () => {
  const res = validateInSuite({
    channels: { runtimeByChannel: { discord: { "channel-123": { model: "openai/gpt-5.5" } } } },
  });

  expect(res.ok).toBe(false); // RED: the current schema accepts this profile.
  if (!res.ok) {
    expect(res.issues).toContainEqual({
      path: "channels.runtimeByChannel.discord.channel-123.model",
      message:
        "channels.runtimeByChannel profiles cannot contain model; use channels.modelByChannel instead.",
    });
  }
});
```

| Test | RED | GREEN |
| --- | --- | --- |
| Runtime-only model input | Resolver returns the transitional model. | Resolver returns `null`; supplemental thinking still resolves. |
| Validation rejection | Config validates successfully. | Validation fails at the exact `.model` path and points to `channels.modelByChannel`. |
| Fresh session ownership | Existing characterization remains green. | Model still comes from `modelByChannel`; thinking still comes from the model-free runtime profile. |

## Verification

1. Focused: `pnpm test src/channels/model-overrides.test.ts src/config/config.plugin-validation.test.ts src/auto-reply/reply/get-reply.fast-path.test.ts src/auto-reply/reply/dispatch-from-config.test.ts src/gateway/session-utils.test.ts src/agents/agent-command.live-model-switch.test.ts src/auto-reply/status.test.ts -- --reporter=dot`.
2. Inspect lanes with `pnpm changed:lanes --json`; run `pnpm check:changed` and `pnpm test:changed` per `skill:openclaw-testing`.
3. Run `pnpm build` and repository-wide `pnpm test` in Crabbox/Testbox rather than fanning out on the Mac; record the actual provider and run IDs.
4. Run `git diff --check`, `git diff --numstat`, and fresh `skill:autoreview`; resolve every accepted actionable finding.
5. Repeat `git diff --stat upstream/main -- src/channels/model-overrides.ts src/config/types.channels.ts src/config/zod-schema.channels-config.ts src/config/schema.help.ts src/config/config.plugin-validation.test.ts src/auto-reply/reply/get-reply.fast-path.test.ts src/auto-reply/reply/dispatch-from-config.test.ts src/gateway/session-utils.test.ts src/agents/agent-command.live-model-switch.test.ts src/auto-reply/status.test.ts` and summarize the reduction against the before output.

## Dependencies

- Slice 2 and manual config migration are complete; the precondition must still be rechecked immediately before edits.
- Slice 1 changes are currently dirty in the shared worktree. Modify them in place and do not revert unrelated user/agent changes.
- Slice 4 owns workspace helper changes; this slice does not edit them.

---
*Status: DRAFT*
*Created: 2026-07-24*
