# Plan 2026-08-23: Acceptance evidence for exclusive deliberation ownership

Capture the missing authentic channel-owner RED/GREEN provenance and canonical Test Gate reference without changing production behavior.

_Status: DRAFT_
_Created: 2026-08-23_

## Progress

- [x] Phase 0: Config + init
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Analysis

### Codebase context

- The preserved Discord loader-backed owner test asserts zero reaction, typing, dispatch, and fallback calls for success and intake failure in `extensions/discord/src/monitor/message-handler.process.test.ts:574-815`; queue coverage suppresses prestarted typing in `extensions/discord/src/monitor/message-handler.queue.test.ts:378-404`.
- Slack loader-backed coverage asserts root/child claims plus disabled, unavailable, rejected, and ordinary cases in `extensions/slack/src/monitor/message-handler.deliberation.test.ts:105-239`.
- Current Discord claim is terminal before media, acknowledgement, auto-thread, abort, or dispatch in `extensions/discord/src/monitor/message-handler.process.ts:202-261`; Slack claim is terminal before acknowledgement/system-event preparation and later dispatch in `extensions/slack/src/monitor/message-handler/prepare.ts:1037-1110`.
- Parent RED at `plans/checkpoints/dark-wave-6899.red-green-proof.md:5-59` failed only in `src/plugin-sdk/channel-inbound.test.ts`; task-lineage extraction in `plans/checkpoints/dark-wave-6899.evidence.md` preserves no behavior-specific side-effect RED.
- Acceptance rejects the missing RED provenance and `canonical:not-run` at `plans/checkpoints/acceptance-runs/dark-wave-6899-acceptance-001/result.json:1-54`.

### Relevant documentation

- `plans/tasks/2026-08-22_deliberation-exclusive-ownership-before-channel-side-effects.md:16-29` requires real channel-path RED and canonical gate evidence.
- `docs/plugins/hooks.md:129-130` documents exclusive ownership as targeted and terminal before channel feedback.
- `docs/reference/test.md:11-24,63-77` distinguishes focused tests, changed checks, build, and full-suite proof.

### Knowledge base

- `learnings/tooling/2026-08-21_evidence-only-tdd-followups-fail-closed-on-missing-red-provenance.md`: never reconstruct RED by reverting correct code; escalate when behavior-specific historical output is unavailable.
- `learnings/tooling/2026-08-21_acceptance-green-must-match-historical-red-command.md`: fresh GREEN must use the identical focused command and preserve complete output.
- `learnings/tooling/2026-08-20_canonical-gate-evidence-remains-provider-owned.md`: local output cannot replace a concrete caller-owned gate reference.
- `learnings/architecture/exclusive-inbound-ownership-before-transport-effects.md`: ownership must be terminal before transport feedback and use authenticated original facts.
- Knowledge recall used deterministic local fallback because QMD collection `openclaw-fork-learnings` was unavailable; explicit task learnings supplied the applicable evidence rules.

## Available Skills

- `task-evidence`: preserve parent command/outcome provenance and report gaps.
- `openclaw-testing`: run the exact focused GREEN and choose only necessary integration checks.
- `acceptance`: evaluate the monitor-supplied retry manifest without executing tests.
- `save-learning`: record the evidence-provenance outcome as the implementation session's final action.

## Approach

Keep the preserved implementation and tests unchanged. Produce fresh current-state verification, but do not represent it as historical TDD evidence. Resolve `finding-001` only if the caller provides authentic pre-change Discord or Slack output from the same focused command; otherwise record `historical_red_unavailable` and return the acceptance repair as blocked. Resolve `finding-002` only with a concrete caller-owned Test Gate run reference.

## Implementation

1. Run `skill:task-evidence` for `dark-wave-6899`; copy its exact command/outcome pairs and `command_lines_truncated` gap into `plans/checkpoints/swift-cove-5006.red-green-proof.md`. Link `plans/checkpoints/dark-wave-6899.red-green-proof.md` and state that its SDK-only failure is not an acceptable side-effect RED.
2. Search only caller-supplied task lineage/artifacts for an existing pre-production Discord or Slack assertion failure from the exact focused command. If none is supplied, record `historical_red_unavailable`; do not revert production code, alter assertions, build a pre-fix worktree, or capture a reconstructed RED.
3. Capture fresh GREEN with the same focused test command:

   ```bash
   TASK_ID=swift-cove-5006 python3 "$HOME/.config/opencode/skills/tdd/scripts/proof-capture.py" green -- pnpm test src/plugins/hooks.sync-only.test.ts src/plugin-sdk/channel-inbound.test.ts extensions/discord/src/monitor/message-handler.queue.test.ts extensions/discord/src/monitor/message-handler.process.test.ts extensions/slack/src/monitor/message-handler.deliberation.test.ts src/auto-reply/reply/dispatch-from-config.test.ts -- --reporter=verbose
   ```

4. Require GREEN output to include the Discord and Slack loader-backed owner-path suites. If the command exposes a real implementation failure, stop evidence work, document the failing assertion, and make only the minimal test-first fix allowed by the task; otherwise leave every production and test file untouched.
5. Submit the registered command `cd ~/Projects/openclaw-fork && npm test` to the caller-owned canonical Test Gate. Record provider/run ID, exact command, exit code 0, and complete totals in `plans/checkpoints/swift-cove-5006.test-gate.md`; never relabel a local run as canonical. If no run reference is returned, record the provider blocker and keep `finding-002` unresolved.
6. Create `plans/checkpoints/swift-cove-5006.checkpoint.md` linking parent build/lint/integration evidence, the fresh GREEN artifact, the canonical gate artifact, and any unresolved RED provenance gap. State explicitly that no production or test files changed.
7. Run `git diff --check` on the new evidence artifacts. Invoke `skill:acceptance` only against a monitor-supplied retry manifest; do not alter the finalized parent result. Do not claim acceptance while either authentic RED provenance or the canonical gate reference is missing.
8. Invoke `skill:save-learning` last and make no subsequent edits.

## Files to Modify

| File                                                   | Change                                                                                                      |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `plans/checkpoints/swift-cove-5006.red-green-proof.md` | Link parent provenance, record the historical RED gap, and capture fresh same-command GREEN.                |
| `plans/checkpoints/swift-cove-5006.test-gate.md`       | Record the caller-owned canonical run reference and complete passing result, or its exact provider blocker. |
| `plans/checkpoints/swift-cove-5006.checkpoint.md`      | Consolidate evidence links and unresolved acceptance status.                                                |
| `learnings/**`                                         | Add the mandatory final-session learning through `save-learning`.                                           |

Production and test files are out of scope unless fresh verification proves a real implementation defect.

## TDD: skip

The implementation already exists and no behavior-specific historical RED is recoverable; creating a new RED now would fabricate provenance. Fresh same-command GREEN is verification-only.

## Verification

- The focused GREEN command and target list exactly match the parent proof command.
- The proof artifact labels the parent SDK-only RED as insufficient and never substitutes reconstructed output.
- The Test Gate artifact contains a concrete non-`not-run` caller-owned reference for `cd ~/Projects/openclaw-fork && npm test`.
- The checkpoint preserves parent build/lint evidence and reports every remaining blocker verbatim.
- `git diff --check` passes for evidence and learning files.

## Dependencies

- Genuine pre-change side-effect RED must come from caller-supplied historical provenance; current repository state cannot create it legitimately.
- The caller/monitor owns canonical Test Gate execution and the retry acceptance manifest.
- Parent implementation, tests, and completed goals 002, 003, and 005 remain untouched.
