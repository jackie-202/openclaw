# Plan 2026-08-25: Complete Slack Deliberation verification evidence

Create follow-up-scoped deterministic proof and one durable final note without changing the preserved implementation.

_Status: DRAFT_

## Evidence Basis

- `plans/checkpoints/swift-dune-6107.red-green-proof.md` is the immutable parent RED/GREEN for `extensions/slack/src/monitor/provider.allowlist.test.ts`; link it rather than recreating RED.
- `plans/checkpoints/swift-dune-6107.checkpoint.md` and the supplied parent session excerpt establish the accepted read-only live result: `v1:slack:default:C0BJW0FALSC`, root `1787683185.523829`, watermark `1787687812.510349`, `rootCorrelated=true`, `complete=true`, no writes/mutations, no operator permission action.
- `plans/checkpoints/swift-dune-6107.evidence.md` cannot prove the grouped tests because its two captured command outcomes are `outcome_unavailable`; do not cite it as passing evidence.
- Current parent-owned changes centralize Slack read-token selection and propagate one channel runtime registry through Gateway startup, deferred loading, and reload paths. Fresh proof must cover both plugin behavior and registry identity.
- `learnings/tooling/follow-up-proof-must-bind-historical-red-to-fresh-green.md` requires immutable historical RED plus an identical fresh GREEN under this task.
- `learnings/architecture/gateway-channel-runtime-context-registry-identity.md` requires lifecycle-path identity tests, not only Slack wrapper tests.
- Knowledge recall used deterministic local fallback because `openclaw-fork-learnings` was unavailable; only `learnings/architecture/2026-07-28_residue-audits-require-activation-proof.md` added a relevant rule: verify activation through registration and callers.

## Available Skills

- `task-evidence`: preserve exact historical command/outcome gaps; never reconstruct missing history.
- `tdd`: capture fresh GREEN provenance while linking the genuine parent RED.
- `openclaw-testing`: run only the focused files that prove the touched Slack, Deliberation, Gateway, and runtime surfaces.
- `acceptance`: finalize findings if an acceptance manifest is supplied to the implementing session.
- `save-learning`: mandatory last implementation action.

## Implementation

1. Re-read the parent plan, RED/GREEN proof, checkpoint, generated evidence, acceptance finding, and current task-related diff. Confirm there is no demonstrated implementation defect; do not edit production or test code.
2. With `skill:tdd`, link the parent RED and capture fresh GREEN for the identical command under `swift-wave-9497`: `pnpm test extensions/slack/src/monitor/provider.allowlist.test.ts`. Store timestamp, exit code, and actual test totals in `plans/checkpoints/swift-wave-9497.red-green-proof.md`.
3. Run the focused Slack set and record the exact command, exit code, file count, and test count:
   `pnpm test extensions/slack/src/action-runtime.test.ts extensions/slack/src/monitor/provider.allowlist.test.ts extensions/slack/src/monitor/deliberation-history.test.ts extensions/slack/src/monitor/message-handler.deliberation.test.ts`.
4. Run the focused Deliberation set with the same evidence fields:
   `pnpm test extensions/deliberation/src/history-read.test.ts extensions/deliberation/src/plugin.test.ts extensions/deliberation/src/route-match.test.ts extensions/deliberation/src/sole-send.test.ts`.
5. Prove the actual runtime-registry fix across its owner and lifecycle callers:
   `pnpm test src/plugins/runtime/index.test.ts src/gateway/server-plugins.test.ts src/gateway/server-startup-plugins.test.ts`.
6. Run `pnpm build` because the preserved fix changes Gateway/plugin loading. Record its exit code and outcome separately; do not substitute it for focused Vitest proof.
7. Create `plans/checkpoints/swift-wave-9497.final-note.md`. Map the fresh command results to goal-002; include the historical RED link; transcribe the bounded accepted live tuple above; state `provider writes/config/spool/cron mutations: none` and `remaining operator permission action: none`.
8. In that final note, list only these parent task-owned implementation/test files, excluding unrelated dirty-worktree files and this follow-up's evidence artifacts:
   `extensions/deliberation/index.ts`, `extensions/deliberation/src/plugin.test.ts`, `extensions/slack/src/accounts.runtime.ts`, `extensions/slack/src/accounts.ts`, `extensions/slack/src/action-runtime.test.ts`, `extensions/slack/src/action-runtime.ts`, `extensions/slack/src/monitor/provider.allowlist.test.ts`, `extensions/slack/src/monitor/provider.ts`, `src/gateway/server-plugin-bootstrap.ts`, `src/gateway/server-plugins.test.ts`, `src/gateway/server-plugins.ts`, `src/gateway/server-startup-plugins.test.ts`, `src/gateway/server-startup-plugins.ts`, `src/gateway/server.impl.ts`, `src/plugins/runtime/index.test.ts`, `src/plugins/runtime/index.ts`, and `src/plugins/runtime/types.ts`.
9. If any focused test exposes a real task-related defect, stop the evidence-only path, document the failure, and make only the minimal TDD-backed fix. Do not weaken Slack policy, add fallback registries, rerun the live provider read, or touch config/spool/cron/provider state.
10. Invoke `skill:save-learning` last and save at least one learning about durable acceptance evidence.

## Files to Modify

| Path                                                   | Change                                                                                                                  |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `plans/checkpoints/swift-wave-9497.red-green-proof.md` | Link the parent RED and record fresh identical-command GREEN provenance.                                                |
| `plans/checkpoints/swift-wave-9497.final-note.md`      | Record exact focused commands/results, accepted live-read tuple, parent files, mutation statement, and operator action. |

No production or test files should change unless fresh verification demonstrates a real defect.

## TDD: skip

This is an evidence-only follow-up: reuse the genuine parent RED and capture fresh GREEN instead of manufacturing a post-fix RED or changing behavior.

## Completion Checks

- Every command in the final note has its observed exit code and deterministic file/test totals; unavailable historical outcomes remain labeled unavailable.
- The final note distinguishes parent implementation files from `swift-wave-9497` evidence files and unrelated concurrent worktree changes.
- The live result contains identifiers and status only, with no message content, token, header, or credential data.
- `git diff --check -- plans/checkpoints/swift-wave-9497.red-green-proof.md plans/checkpoints/swift-wave-9497.final-note.md` passes.
- Any external blocker is stated exactly; for the accepted parent live read, the remaining operator action is explicitly `none`.

## Dependencies

- Preserved parent implementation and immutable proof artifacts remain available.
- Local dependencies support the repository `pnpm test` wrapper and build.
- No live Slack call or credential access is required because goal-003 is already accepted and the bounded result is supplied in parent evidence.
