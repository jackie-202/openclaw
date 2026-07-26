# TDD Provenance and Fresh Verification: swift-dune-1559

TDD: skip - this is an evidence-only follow-up after the implementation exists. Creating a new RED would fabricate history.

## Historical RED/GREEN

The genuine parent cycle is preserved at `plans/checkpoints/quick-reef-5974.red-green-proof.md`:

- RED: the six-file focused command exited 1 with the expected Gateway authority mismatch.
- GREEN: the identical command exited 0 with 776 passing tests across four Vitest shards.

## Fresh Verification

- Attempted proof helper command: `TASK_ID=swift-dune-1559 python3 "/Users/michal/.config/opencode/skills/tdd/scripts/proof-capture.py" green -- pnpm test src/channels/model-overrides.test.ts src/auto-reply/reply/get-reply.fast-path.test.ts src/auto-reply/reply/dispatch-from-config.test.ts src/agents/agent-command.live-model-switch.test.ts src/auto-reply/status.test.ts src/gateway/session-utils.test.ts -- --reporter=dot`
- Outcome: helper refused before running tests because standalone GREEN requires a same-task RED. No synthetic RED was created.
- Full focused command: `pnpm test src/channels/model-overrides.test.ts src/auto-reply/reply/get-reply.fast-path.test.ts src/auto-reply/reply/dispatch-from-config.test.ts src/agents/agent-command.live-model-switch.test.ts src/auto-reply/status.test.ts src/gateway/session-utils.test.ts -- --reporter=dot`
- Outcome: task-related shards passed, but the complete dispatch file retained two unrelated pre-existing inbound-claim assertion failures at `src/auto-reply/reply/dispatch-from-config.test.ts:4930` and `src/auto-reply/reply/dispatch-from-config.test.ts:5691`. These are the same unrelated failures documented by the parent implementation session.
- Unaffected five-file command: `pnpm test src/channels/model-overrides.test.ts src/auto-reply/reply/get-reply.fast-path.test.ts src/agents/agent-command.live-model-switch.test.ts src/auto-reply/status.test.ts src/gateway/session-utils.test.ts -- --reporter=dot`
- Outcome: exit 0, 585 tests passed across four Vitest shards.
- Changed dispatch cases: `pnpm test src/auto-reply/reply/dispatch-from-config.test.ts -- --reporter=dot -t "uses (modelByChannel before runtime models for first-turn delivery defaults|runtime channel models before cached Codex runtime defaults)"`
- Outcome: exit 0, 2 tests passed and 191 unrelated tests skipped.
- Build: `pnpm build` -> exit 0.
- Scoped lint: `OPENCLAW_OXLINT_SKIP_PREPARE=1 node scripts/run-oxlint.mjs <13 scoped paths>` -> exit 0.
- Scoped format: `pnpm exec oxfmt --check --threads=1 <13 scoped paths>` -> exit 0, all 13 files correctly formatted.
