# Plan 2026-08-31: Preserve Deliberation routing contract

_Status: DRAFT_

## Progress

- [x] Phase 0: Config + init
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Analysis

### Codebase context

- `extensions/deliberation/README.md:139-148` is the only inspected contract surface that rewrites omitted-target Discord roots as `mode: "root"` without `threadId`.
- `docs/plugins/reference/deliberation.md:102,137-139` and `extensions/deliberation/src/contract.test.ts:447` retain the source-anchor contract: omitted-target Discord roots use `mode: "source_anchor"` with the source message ID; explicit targets without `threadId` use root mode.
- The pre-task README wording is visible in the current diff and can be restored without touching sender hints, routing code, tests, idempotency, replay, or delivery implementation.

### Relevant documentation

- `plans/2026-08-31_wild-dune-0272_deliberation-intake-preserve-trusted-sender-names-for.md` completed sender-hint work but omitted this README from its routing-wording restoration.
- `plans/checkpoints/acceptance-runs/wild-dune-0272-acceptance-001/result.json` requires removal of the routing-semantic rewrite or task-scoped preservation proof.
- `plans/checkpoints/wild-dune-0272.final-note.md` claims the unrelated rewrite was removed and must be corrected or made true by the README restoration.

### Knowledge base

- `learnings/tooling/wild-dune-0272-bind-acceptance-evidence-to-task-candidate.md`: restore unrelated documentation byte-for-byte from the baseline and bind verification to the exact task candidate.
- Do not fabricate a new RED after implementation; retain the parent RED and capture fresh GREEN for this follow-up.
- Recall used deterministic local fallback because QMD collection `openclaw-fork-learnings` was unavailable; returned generic architecture stubs add no task-specific requirements.

## Available Skills

- `task-evidence`: recover exact parent/follow-up verification provenance.
- `tdd`: use only to preserve historical RED and record fresh GREEN, not to invent a new failure.
- `validate-implementation`: verify the repair changes documentation/evidence only.
- `autoreview`: mandatory fresh closeout for non-trivial repository changes.
- `save-learning`: mandatory final implementation action.

## Implementation

1. Record `HEAD`, `git status --short`, and a SHA-256 digest for the exact follow-up candidate; use `skill:task-evidence` to link the historical `quick-cove-1732` RED and `wild-dune-0272` evidence without rewriting either proof.
2. Restore only `extensions/deliberation/README.md:139-148` to its pre-task wording: omitted targets resolve to source and source thread; Discord roots use `mode: "source_anchor"` and create/reuse the source-message thread; Discord child messages and Slack source defaults use `mode: "thread"`; explicit targets retain root/thread semantics.
3. Confirm `git diff -- extensions/deliberation/README.md` contains no routing rewrite relative to the task baseline. Do not alter `extensions/deliberation/src/route-match.ts`, sender-hint code, contracts, or existing tests.
4. Create `plans/checkpoints/fresh-brook-6464.red-green-proof.md` linking the genuine parent RED and recording fresh GREEN from the focused sender-hint and routing/contract commands below.
5. Create `plans/checkpoints/fresh-brook-6464.test-gate.md` with candidate digest, exact commands, complete totals, exit codes, and a durable caller-owned reference for the registered `cd ~/Projects/openclaw-fork && npm test` gate; unavailable allocation remains `BLOCKED`.
6. Create `plans/checkpoints/fresh-brook-6464.final-note.md` and `.checkpoint.md` mapping `finding-001` to the clean README diff, unchanged production/test files, fresh GREEN, and the canonical gate. Keep the existing sender-field and KM-shape claims; state that source-target, event identity, idempotency, replay, and delivery routing were not changed by this follow-up.
7. Run `skill:validate-implementation`, `git diff --check` over owned files, and a fresh `skill:autoreview`; resolve accepted findings without broadening scope.
8. Invoke `skill:save-learning` last and save at least one learning about checking every duplicated contract surface during evidence-only acceptance repairs.

## Files to Modify

| File                                                                    | Change                                                                                          |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `extensions/deliberation/README.md`                                     | Remove the unrelated root-routing semantic rewrite by restoring the pre-task paragraph exactly. |
| `plans/checkpoints/fresh-brook-6464.red-green-proof.md`                 | Link historical RED and record fresh focused GREEN.                                             |
| `plans/checkpoints/fresh-brook-6464.test-gate.md`                       | Bind canonical verification to the repaired candidate.                                          |
| `plans/checkpoints/fresh-brook-6464.final-note.md`                      | State exact repaired scope and unchanged behavior invariants.                                   |
| `plans/checkpoints/fresh-brook-6464.checkpoint.md`                      | Map `finding-001` to repair and evidence.                                                       |
| `learnings/tooling/<dated>-deliberation-contract-surface-provenance.md` | Save the mandatory implementation learning.                                                     |

## TDD: skip

The sender-hint implementation already exists and this repair removes an unrelated documentation diff, so a new RED would be fabricated. Reuse `plans/checkpoints/quick-cove-1732.red-green-proof.md`, then capture fresh GREEN with:

- `pnpm test extensions/discord/src/monitor/message-handler.deliberation.test.ts extensions/slack/src/monitor/message-handler.deliberation.test.ts src/hooks/message-hook-mappers.test.ts -- --reporter=verbose`
- `pnpm test extensions/deliberation/src/hooks.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/contract.test.ts extensions/deliberation/scripts/intake-producer.test.ts -- --reporter=verbose`
- `pnpm test extensions/deliberation/src/route-match.test.ts extensions/deliberation/src/delivery-composition.test.ts extensions/deliberation/src/final-adapter.test.ts extensions/deliberation/src/delivery-probe.test.ts -- --reporter=verbose`

Implementation follows `skill:tdd` evidence discipline: preserve genuine historical RED, record fresh GREEN, and never synthesize a post-implementation failure.
