# Plan 2026-08-31: Repair Deliberation sender-hints acceptance evidence

_Status: DRAFT_

## Progress

- [x] Phase 0: Config + Init
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Analysis

### Codebase Context

- Sender hints are already implemented at the authenticated early-claim boundary in `extensions/discord/src/monitor/message-handler.process.ts`, `extensions/slack/src/monitor/message-handler.ts`, and `extensions/deliberation/src/intake.ts`.
- `extensions/deliberation/src/{hooks,km-client,contract}.test.ts` and `extensions/deliberation/scripts/intake-producer.test.ts` already cover normalization, omission, serialization, persisted responses, strict schemas, and provenance hashes.
- The rejected routing hunks in `extensions/deliberation/src/route-match.ts` and `docs/plugins/reference/deliberation.md` predate `quick-cove-1732`; `plans/2026-08-25_bright-wave-6798_fix-deliberation-discord-root-channel-delivery-routing-goal.md` records their separate ownership.
- `plans/checkpoints/quick-cove-1732.red-green-proof.md` contains genuine RED and GREEN for the Discord sender-hints regression. The missing outputs are follow-up-scoped GREEN, caller-owned canonical Test Gate evidence, and a final note.

### Relevant Documentation

- `docs/plugins/reference/deliberation.md` already documents the optional KM object, normalization bounds, and provider source precedence; do not mix further routing edits into this repair.
- `plans/checkpoints/acceptance-runs/quick-cove-1732-acceptance-001/result.json` is the authoritative rejected snapshot for findings 001-003.

### Knowledge Base

- `learnings/tooling/acceptance-repairs-must-answer-the-rejected-evidence-snapshot.md`: answer the evaluated snapshot with immutable parent RED and fresh identical GREEN.
- `learnings/tooling/follow-up-proof-must-bind-historical-red-to-fresh-green.md`: never manufacture a post-implementation RED.
- `learnings/tooling/2026-08-20_canonical-test-gate-evidence-cannot-be-reconstructed.md`: local results cannot replace a concrete caller-owned run reference.
- `learnings/tooling/acceptance-fix-needs-task-scoped-production-provenance.md`: separate runtime correctness from task-diff attribution.
- Recall used deterministic local fallback because QMD collection `openclaw-fork-learnings` was unavailable; its returned generic contract-authority rules add no new task-specific work.

## Available Skills

- `task-evidence`: generate bounded parent/follow-up command lineage before hand-written evidence is appended.
- `acceptance`: validate a supplied retry manifest after all concrete evidence exists.
- `validate-implementation`: confirm no routing, idempotency, replay, or delivery behavior changed.
- `save-learning`: record the evidence-provenance lesson as the final implementation action.

## Approach

Keep the accepted sender-hints implementation and all pre-existing routing work unchanged. Build a bounded follow-up evidence set that attributes the older routing rewrite to its prior task, links the genuine parent RED to fresh GREEN, records a non-`not-run` canonical gate, and supplies the missing source-field/serialized-shape final note.

## Implementation

1. Run `skill:task-evidence` for `quick-cove-1732` and `wild-dune-0272`; preserve unavailable/truncated fields as gaps and use the underlying proof for concrete outcomes.
2. Record `HEAD`, `git status --short`, and SHA-256 values for `extensions/deliberation/src/route-match.ts`, `extensions/deliberation/src/route-match.test.ts`, `extensions/deliberation/src/hooks.test.ts`, and `docs/plugins/reference/deliberation.md` before verification. Cite `plans/2026-08-25_bright-wave-6798_fix-deliberation-discord-root-channel-delivery-routing-goal.md` as the older routing owner; do not revert, edit, or claim those routing hunks.
3. Create `plans/checkpoints/wild-dune-0272.red-green-proof.md`: transcribe the immutable parent RED command, timestamp, exit `1`, 1 failed/5 passed totals, and missing `senderIdentityHints` assertion from `plans/checkpoints/quick-cove-1732.red-green-proof.md`; append fresh output from the identical command with its own timestamp, exit code, and totals.
4. Run the focused Deliberation intake/contract command below. Record each file's totals and explicitly identify the passing provenance-hash assertion from `extensions/deliberation/src/contract.test.ts`.
5. Submit the same candidate to the caller-owned canonical Test Gate. Require a durable run ID/URL for the registered `cd ~/Projects/openclaw-fork && npm test` command plus the focused command below. Write `plans/checkpoints/wild-dune-0272.test-gate.md` with provider, candidate identity, UTC timestamps, exact commands, exit codes, and complete totals; allocation failure remains `BLOCKED`, never local `PASS`.
6. Write `plans/checkpoints/wild-dune-0272.final-note.md` with an explicit source map: Discord opaque ID is PluralKit member ID when resolved, otherwise `author.id`; display name is PluralKit `member.display_name ?? member.name`, otherwise `member.nickname ?? member.nick ?? author.globalName ?? author.username`; username is PluralKit `member.name`, otherwise `author.username`; the alias candidate is PluralKit `member.name` or `formatDiscordUserTag(author)` and is omitted when normalization finds it duplicates a direct indicator. Slack opaque ID is `message.user ?? message.bot_id`; display name is `message.username`, otherwise `users.info.profile.display_name ?? profile.real_name ?? user.name`; username is `message.username`; Slack adds no aliases.
7. In the same final note, show the exact optional KM shape `{ senderIdentityHints: { senderDisplayName?, senderUsername?, senderAliases? } }`, omission rules, 128-byte value limit, eight-alias limit, case-insensitive deduplication, 2048-byte serialized limit, and the invariant that `senderId`, source target, provider event ID, idempotency/replay keys, and delivery target are unchanged. Link the parent proof, fresh proof, canonical gate, prior routing owner, and acceptance result.
8. Recompute the route/docs hashes and require equality with step 2. Update `plans/checkpoints/wild-dune-0272.checkpoint.md` with finding-to-artifact links and no completion claim unless the canonical gate is `PASS`.
9. Run `skill:validate-implementation`; if a fresh test exposes a real sender-hints defect, add the smallest test-first repair without touching routing. If a retry manifest is supplied, run `skill:acceptance`. Run `git diff --check` on the follow-up artifacts, then invoke `skill:save-learning` last and save at least one learning.

## Files to Modify

| File                                                              | Change                                                                                      |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `plans/checkpoints/wild-dune-0272.red-green-proof.md`             | Bind genuine parent RED to fresh identical GREEN.                                           |
| `plans/checkpoints/wild-dune-0272.evidence.md`                    | Record candidate identity, route/doc hash invariance, task ownership, and focused outcomes. |
| `plans/checkpoints/wild-dune-0272.test-gate.md`                   | Record the concrete canonical run or exact blocker.                                         |
| `plans/checkpoints/wild-dune-0272.final-note.md`                  | Document every provider source field, exact KM shape, invariants, and evidence links.       |
| `plans/checkpoints/wild-dune-0272.checkpoint.md`                  | Map findings 001-003 to artifacts and final status.                                         |
| `learnings/tooling/<dated>-sender-hints-acceptance-provenance.md` | Save the mandatory session learning.                                                        |

Production, test, contract, and documentation files remain unchanged unless fresh verification reproduces a sender-hints defect.

## TDD: skip

The implementation already exists, so a new RED would be fabricated. Reuse the genuine parent RED and capture fresh GREEN with:

`pnpm test extensions/discord/src/monitor/message-handler.deliberation.test.ts -- --reporter=verbose`

## Verification

- `pnpm test extensions/deliberation/src/hooks.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/contract.test.ts extensions/deliberation/scripts/intake-producer.test.ts -- --reporter=verbose`
- Caller-owned canonical gate: `cd ~/Projects/openclaw-fork && npm test`, with a durable non-`not-run` reference and logs covering the focused files above.
- Route/docs SHA-256 values before and after verification are identical.
- `git diff --check -- plans/checkpoints/wild-dune-0272.red-green-proof.md plans/checkpoints/wild-dune-0272.evidence.md plans/checkpoints/wild-dune-0272.test-gate.md plans/checkpoints/wild-dune-0272.final-note.md plans/checkpoints/wild-dune-0272.checkpoint.md`
