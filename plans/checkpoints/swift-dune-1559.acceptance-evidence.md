# Acceptance Evidence: swift-dune-1559

## Provenance

- Parent task: `quick-reef-5974`
- Acceptance goal: `goal-001`, upstream model authority with transitional fallback
- Base commit: `dc43c20df50c843537e39f77789b3994d534e579`
- Parent plan: `plans/2026-07-24_quick-reef-5974_slice-1-upstream-model-authority-with-transitional-fallback.md`
- Follow-up plan: `plans/2026-07-24_swift-dune-1559_slice-1-upstream-model-authority-with-transitional-fallback.md`
- Complete bounded diff: `plans/checkpoints/swift-dune-1559.source-and-tests.diff`
- Diff SHA-256: `83ecc4e4ede1228faeed223bfec45e86fb2934316c1441cf5f4b02a69c45a878`
- Diff size: 672 lines, 27,144 bytes

The diff was generated from the preserved parent worktree and contains all and only the 13 implementation and focused-test/support paths below. Inspection found no implementation defect, so this follow-up changes no `src/` file.

## Path Inventory

| Path | Insertions | Deletions |
| --- | ---: | ---: |
| `src/agents/agent-command.live-model-switch.test.ts` | 42 | 0 |
| `src/agents/agent-command.ts` | 15 | 16 |
| `src/auto-reply/reply/dispatch-from-config.test.ts` | 10 | 5 |
| `src/auto-reply/reply/dispatch-from-config.ts` | 4 | 4 |
| `src/auto-reply/reply/get-reply-native-slash-fast-path.ts` | 4 | 4 |
| `src/auto-reply/reply/get-reply.fast-path.test.ts` | 56 | 5 |
| `src/auto-reply/reply/get-reply.test-mocks.ts` | 1 | 1 |
| `src/auto-reply/reply/get-reply.ts` | 10 | 5 |
| `src/auto-reply/status.test.ts` | 28 | 0 |
| `src/channels/model-overrides.test.ts` | 46 | 2 |
| `src/channels/model-overrides.ts` | 42 | 2 |
| `src/gateway/session-utils.test.ts` | 46 | 0 |
| `src/gateway/session-utils.ts` | 13 | 8 |
| **Total** | **317** | **52** |

## Semantic Coverage

- Canonical authority and sole fallback seam: `plans/checkpoints/swift-dune-1559.source-and-tests.diff:487-559` shows `resolveConfiguredChannelModelOverride()` first, then one proposal-marked `resolveRuntimeChannelModelFallback()` call.
- Shared target matching: `plans/checkpoints/swift-dune-1559.source-and-tests.diff:523-557` shows the fallback delegating to `resolveChannelRuntimeProfile(params)`, preserving its direct, parent, name, and wildcard matching metadata.
- Warning behavior: `plans/checkpoints/swift-dune-1559.source-and-tests.diff:523-549` shows the proposal ID, both migration paths in the warning text, and one warning per successful fallback resolution. Resolver tests at lines 441-483 prove canonical hits do not warn and fallback hits warn once.
- Regular/fresh reply routing: `plans/checkpoints/swift-dune-1559.source-and-tests.diff:325-365` shows one shared parameter object, model selection through `resolveChannelModelOverride()`, and a separate runtime-profile read for supplemental fields.
- Native slash routing: `plans/checkpoints/swift-dune-1559.source-and-tests.diff:180-213` routes model selection through the canonical resolver; lines 258-308 test canonical precedence.
- First-turn/cached harness routing: `plans/checkpoints/swift-dune-1559.source-and-tests.diff:96-179` routes dispatch model selection through the canonical resolver and tests conflicting configuration precedence.
- Agent-command routing: `plans/checkpoints/swift-dune-1559.source-and-tests.diff:1-95` removes the `modelByChannel` presence guard and tests runtime-only fallback invocation.
- Status routing: production already used the shared resolver; `plans/checkpoints/swift-dune-1559.source-and-tests.diff:367-405` proves fallback attribution remains a channel override.
- Gateway routing and non-model preservation: `plans/checkpoints/swift-dune-1559.source-and-tests.diff:560-672` routes reconstructed model identity through the canonical resolver while retaining thinking/reasoning from the separate runtime profile; the focused test asserts all four fields.
- Test support: `plans/checkpoints/swift-dune-1559.source-and-tests.diff:312-324` preserves the real canonical resolver behind the focused test mock.

## Artifact Validation

- `git apply --check --reverse plans/checkpoints/swift-dune-1559.source-and-tests.diff` -> exit 0, proving the artifact matches the preserved implementation in the current worktree.
- `git diff --check -- <13 scoped paths>` -> exit 0, no whitespace errors.
- `git apply --numstat plans/checkpoints/swift-dune-1559.source-and-tests.diff` -> exactly the 13 paths and 317/52 totals listed above.
- `shasum -a 256 plans/checkpoints/swift-dune-1559.source-and-tests.diff` -> `83ecc4e4ede1228faeed223bfec45e86fb2934316c1441cf5f4b02a69c45a878`.

## TDD Provenance

- Genuine historical RED and parent GREEN: `plans/checkpoints/quick-reef-5974.red-green-proof.md`.
- Historical RED: the six-file focused command exited 1 with the expected pre-implementation Gateway authority mismatch (`gpt-5.5` received instead of canonical `gpt-5.6-sol`).
- Historical GREEN: the same six-file command exited 0 with 776 passing tests across four Vitest shards.
- Parent task-evidence limitation: `plans/checkpoints/quick-reef-5974.evidence.md` reports `command_lines_truncated`; its incomplete session-log command records have `outcome_unavailable`. The genuine proof artifact above is the canonical historical RED/GREEN source.
- Fresh follow-up verification: `plans/checkpoints/swift-dune-1559.red-green-proof.md`. It links the genuine parent RED/GREEN, records why the helper cannot truthfully capture a standalone GREEN, reports the two unrelated pre-existing dispatch failures, and records 585 unaffected tests plus both changed dispatch cases passing.
