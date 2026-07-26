# Slice 3 Final Task Note

## Outcome

The preserved Slice 3 implementation remains in place. Channel model selection reads only `channels.modelByChannel`; `channels.runtimeByChannel` remains a non-model supplement, and a runtime profile containing `model` is rejected with migration guidance.

Historical TDD provenance: `plans/checkpoints/dark-dune-1632.red-green-proof.md`.

## Canonical Test Gate

Concrete gate reference: `local:test-gate:bold-fork-4060:2026-07-25`.

The registered workspace was verified serially on 2026-07-25 after both supported remote providers failed before provisioning:

- Blacksmith Testbox-through-Crabbox: no run ID; the host has no `blacksmith` executable.
- Brokered AWS Crabbox: no run ID; the host has no configured Crabbox broker login.
- `pnpm build`: exit 0; production and Control UI builds passed.
- `pnpm check`: exit 1 in the unrelated npm shrinkwrap guard because `extensions/acpx/npm-shrinkwrap.json` is stale.
- `npm test`: exit 1 after the repository-wide test workflow completed. Failures were outside the Slice 3 behavior, including dirty-worktree tooling tests and four `extensions/voice-call/index.test.ts` assertions.
- `pnpm test src/channels/model-overrides.test.ts src/config/config.plugin-validation.test.ts src/auto-reply/reply/get-reply.fast-path.test.ts -- --reporter=dot`: exit 0; 3 files and 84 tests passed across 3 shards in 12.90 seconds.

The canonical result is therefore concrete but not globally green due to pre-existing failures outside this task. No unrelated failure or generated dependency artifact was modified.

## Affected-Surface Diff Stat

Command:

```text
git diff --numstat upstream/main -- src/channels/model-overrides.ts src/config/types.channels.ts src/config/zod-schema.channels-config.ts src/config/schema.help.ts src/config/config.plugin-validation.test.ts src/auto-reply/reply/get-reply.fast-path.test.ts src/auto-reply/reply/dispatch-from-config.test.ts src/gateway/session-utils.test.ts src/agents/agent-command.live-model-switch.test.ts src/auto-reply/status.test.ts src/gateway/model-pricing-cache.ts
```

Measured after-state:

```text
1063  2412  src/agents/agent-command.live-model-switch.test.ts
9310  8     src/auto-reply/reply/dispatch-from-config.test.ts
438   439   src/auto-reply/reply/get-reply.fast-path.test.ts
50    244   src/auto-reply/status.test.ts
93    63    src/channels/model-overrides.ts
35    567   src/config/config.plugin-validation.test.ts
1972  10    src/config/schema.help.ts
22    13    src/config/types.channels.ts
22    3     src/config/zod-schema.channels-config.ts
59    51    src/gateway/model-pricing-cache.ts
496   1140  src/gateway/session-utils.test.ts
```

- Before: 10 files, 13,585 insertions, 4,887 deletions relative to `upstream/main`; net fork delta +8,698 lines.
- After: 11 files, 13,560 insertions, 4,950 deletions relative to `upstream/main`; net fork delta +8,610 lines.
- Comparison: net fork delta decreased by 88 lines.
- Surface explanation: `src/gateway/model-pricing-cache.ts` expands the measured set from 10 to 11 files because inspection found it also consumes channel model authority and therefore belongs in the affected surface.

## Commit Dispositions

| Commit | Final disposition |
| --- | --- |
| `9c09c25952` | Retained narrowly for profile matching and non-model persistence; model ownership was replaced by `modelByChannel`. |
| `435059f7d6` | Runtime-profile model authority was replaced; the supplemental resolver and unrelated behavior were retained. |
| `0529559822` | Retained narrowly; stale automatic-fallback pins remain validated against canonical `modelByChannel`. |
