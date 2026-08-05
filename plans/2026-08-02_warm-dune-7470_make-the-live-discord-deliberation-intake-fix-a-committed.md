# Plan 2026-08-02: Make the live Discord deliberation intake fix a committed production artifact

Audit the preserved task-chain diff, retain only the proven production/test artifact, and produce fresh source, test, type, and build evidence for downstream autocommit/deploy.

## Analysis

### Codebase Context

- `extensions/discord/src/monitor/message-handler.process.ts:32` now imports the narrow host-owned `reply-dispatch-runtime`; `extensions/discord/src/monitor/message-handler.process.ts:937` passes that dispatcher into shared inbound reply dispatch without creating a second broad runtime instance.
- `extensions/discord/src/monitor/message-handler.context.ts:322` assembles the canonical inbound context and uses `sender.id ?? author.id`, preserving a resolved proxy identity while supplying ordinary Discord author identity.
- `extensions/deliberation/src/intake.ts:86` returns `{ handled: true }` only after awaited KM intake succeeds; failures remain non-claiming and reach the unchanged fail-closed `before_dispatch` gate at `extensions/deliberation/src/intake.ts:108`.
- `src/plugin-sdk/plugin-test-runtime.ts:17` exposes narrow loader/global-runner test seams; the production SDK surface is unchanged.
- `extensions/discord/src/monitor/message-handler.process.test.ts` composes real narrow dispatch with loader-backed Deliberation hooks and covers sender fallback, one successful intake, terminal silence, failed-intake silence, and no ordinary Discord delivery.
- `extensions/deliberation/src/hooks.test.ts`, `src/plugins/source-checkout-runtime.test.ts`, and `src/auto-reply/reply/dispatch-from-config.test.ts` cover direct hook behavior, real plugin activation/KM wire shape, and shared terminal dispatch behavior.
- The working tree contains unrelated modified/untracked files; select task-owned paths explicitly and never clean, reset, or stage unrelated state.

### Evidence And Docs

- `plans/checkpoints/bright-mist-1370.red-green-proof.md`: genuine RED was 1 failed/102 passed because the host narrow dispatcher was called zero times.
- `plans/checkpoints/fresh-fork-4718.red-green-proof.md`: focused GREEN passed 105 tests and the four-shard matrix passed 353 tests.
- `plans/checkpoints/cool-reef-2065.evidence.md`: the same matrix, build, scoped lint/format, and `git diff --check` passed; broad lint had an unrelated Slack declaration failure.
- `plans/checkpoints/bright-mist-1370.checkpoint.md`: identifies missing canonical `SenderId` as the live intake cause and the narrow dispatcher as the runtime ownership fix.
- `docs/plugins/sdk-channel-inbound.md`: assembled channel events use shared `dispatchChannelInboundReply`.
- `docs/plugins/sdk-testing.md`: loader-backed tests reset bundled-directory, plugin runtime, and global hook-runner state.
- `docs/investigations/deliberation-v2-standard-plugin-capability-investigation.md`: exact source matching and the independent `before_dispatch` silence gate remain plugin-owned.

### Knowledge Base

- `learnings/architecture/2026-07-28_residue-audits-require-activation-proof.md`: verify discovery, registration, activation, and runtime callers, not registration source alone.
- `learnings/architecture/2026-07-28_wire-protocol-versions-are-not-implementation-generations.md`: preserve the accepted `/deliberation/v1/intake` contract; `v1` names the current wire protocol.
- Recall used local fallback because QMD collection `openclaw-fork-learnings` was unavailable; other returned learnings added no task-specific constraints.

## Available Skills

- `tdd`: preserve the historical RED and capture fresh GREEN evidence without manufacturing a new failure.
- `openclaw-testing`: run the focused matrix first, then the required type/build gates.
- `code-review` and `autoreview`: audit the reconciled diff and complete the mandatory fresh pre-handoff review.
- `validate-implementation`: check source ownership, acceptance criteria, and generated artifact proof.
- `save-learning`: run last after all implementation work and verification.

## Implementation

1. Snapshot `git status --short`, the task-path diff, and `git diff --numstat`; classify each existing hunk by provenance from `bright-mist-1370`, `fresh-fork-4718`, and `cool-reef-2065`. Preserve unrelated dirty files and do not edit live config, credentials, Gateway state, or KM spool data.
2. Reconcile the four production files as one invariant: Discord uses the host-owned narrow dispatcher, canonical context always has the correct sender id, successful durable intake claims exactly once, and intake failure remains silent through `before_dispatch`. Remove stale lazy-runtime code rather than adding compatibility or fallback paths.
3. Reconcile the related tests so they prove the invariant at three boundaries: direct Deliberation handler, loader/global runner, and realistic Discord process dispatch. Keep assertions for unrelated Discord routing and test-state cleanup; trim duplicate setup/assertions that do not improve boundary proof.
4. Retain `src/plugin-sdk/plugin-test-runtime.ts` exports and `docs/plugins/sdk-testing.md` only if the Discord integration still needs the generic loader-backed test seam. Confirm no production extension imports the test runtime and no public production SDK entrypoint changes are required.
5. Exclude `CHANGELOG.agent.md` from this artifact unless lineage proves its older 2026-07-28 entry belongs to this fix; do not absorb unrelated historical edits merely because they are dirty.
6. Run the focused GREEN and regression matrix below, all four prior type lanes, scoped formatting/lint, `git diff --check`, and `pnpm build`. Record exact commands, exit codes, file/test counts, and any unrelated blocker separately.
7. After build, inspect `dist/message-handler.process-*.js`: require an import from `reply-dispatch-runtime`, require `id: sender.id ?? author.id`, and reject `replyRuntimePromise`/`loadReplyRuntime` in that generated module. Record the matched generated file as proof that deployable output contains the fix.
8. Run fresh `autoreview` until no accepted/actionable findings remain. Re-run affected gates after any review edit and leave only the intended source/test/docs changes for downstream autocommit; do not restart or deploy the Gateway.
9. Final note: list the four production files, retained tests/docs, exact verification outcomes, generated artifact result, and the explicit handoff that Jackie owns deployment/live spool verification. Invoke `save-learning` as the final task action.

## Files To Reconcile

| File                                                             | Intended result                                                                                     |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `extensions/deliberation/src/intake.ts`                          | Terminal claim only after successful awaited intake; unchanged fail-closed failure path.            |
| `extensions/discord/src/monitor/message-handler.context.ts`      | Canonical sender id prefers resolved identity and falls back to `author.id`.                        |
| `extensions/discord/src/monitor/message-handler.process.ts`      | Use the narrow host-owned dispatch facade; remove the second broad runtime loader.                  |
| `src/plugin-sdk/plugin-test-runtime.ts`                          | Export only generic loader/global-runner test seams needed by integration proof.                    |
| `extensions/deliberation/src/hooks.test.ts`                      | Prove exact-source one-time intake and terminal success.                                            |
| `extensions/discord/src/monitor/message-handler.process.test.ts` | Prove narrow runtime ownership, sender fallback, exact-once intake, silence, and unrelated routing. |
| `src/plugins/source-checkout-runtime.test.ts`                    | Prove loader-backed Deliberation activation and accepted KM request contract.                       |
| `src/auto-reply/reply/dispatch-from-config.test.ts`              | Preserve shared inbound-claim terminal/no-delivery behavior.                                        |
| `docs/plugins/sdk-testing.md`                                    | Document loader-backed test setup/reset only if the retained SDK test seam requires it.             |

## TDD

Implement the reconciliation cycle with `skill:tdd`. Reuse the genuine RED in `plans/checkpoints/bright-mist-1370.red-green-proof.md`; do not remove working code to fabricate another RED. Capture fresh GREEN under `warm-dune-7470`.

**Test file:** `extensions/discord/src/monitor/message-handler.process.test.ts`
**Focused command:** `pnpm test extensions/discord/src/monitor/message-handler.process.test.ts -- --reporter=verbose`
**Edit hint:** retain the existing test in the `processDiscordMessage reply runtime wiring` block.

```ts
import { describe, expect, it } from "vitest";

describe("processDiscordMessage reply runtime wiring", () => {
  it("uses the host-owned narrow dispatch facade", async () => {
    await runProcessDiscordMessage(await createBaseContext());

    expect(replyRuntimeMocks.narrowDispatch).toHaveBeenCalledTimes(1); // Historical RED: 0.
    expect(replyRuntimeMocks.broadDispatch).not.toHaveBeenCalled();
  });
});
```

| Test                                     | Historical RED                            | Fresh GREEN                                                 |
| ---------------------------------------- | ----------------------------------------- | ----------------------------------------------------------- |
| Host-owned narrow dispatcher             | Narrow call count `0`                     | Narrow call count `1`; broad call count `0`                 |
| Configured Discord source accepted by KM | Intake path unreachable or missing sender | One KM intake; terminal silence; no agent/send              |
| Configured source with KM failure        | Risk of ordinary dispatch                 | One failed intake; `before_dispatch` handles; no agent/send |
| Unrelated Discord source                 | Potential over-claim                      | No Deliberation intake; normal dispatch remains reachable   |

Regression and gate commands:

```bash
pnpm test extensions/deliberation extensions/discord/src/monitor/message-handler.process.test.ts src/auto-reply/reply/dispatch-from-config.test.ts src/plugins/source-checkout-runtime.test.ts -- --reporter=verbose
pnpm tsgo:core
pnpm tsgo:extensions
pnpm tsgo:core:test
pnpm tsgo:extensions:test
pnpm build
git diff --check
```

## Dependencies

- Use the existing accepted KM client contract and test credential materialization; do not call a live listener.
- Preserve `FAIL_CLOSED_HOOK_PRIORITY`, source authorization, request timeout, `401` handling, and channel-neutral shared dispatch.
- Treat current `dist/` only as stale context until a fresh `pnpm build` regenerates and verifies the artifact.
- Downstream autocommit/deploy creates durability; this task prepares and proves the exact intended working-tree artifact without performing deployment.

---

_Created: 2026-08-02_
_Status: DRAFT_
