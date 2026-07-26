# TDD Provenance and Fresh Verification: warm-peak-1796

TDD: skip - this evidence-only follow-up runs after the implementation exists. Creating a new RED would fabricate history.

## Historical RED/GREEN

The genuine parent cycle is preserved at `plans/checkpoints/quick-reef-5974.red-green-proof.md`:

- RED: the six-file focused command exited 1 with the expected pre-implementation Gateway authority mismatch.
- GREEN: the identical command exited 0 with 776 passing tests across four Vitest shards.

## Fresh GREEN

- Command: `pnpm test src/channels/model-overrides.test.ts src/auto-reply/reply/get-reply.fast-path.test.ts src/agents/agent-command.live-model-switch.test.ts src/auto-reply/status.test.ts src/gateway/session-utils.test.ts -- --reporter=dot`
- Outcome: exit 0; 585 tests passed across four Vitest shards (424 Gateway, 100 auto-reply, 51 agents, 10 channels).
- Command: `pnpm test src/auto-reply/reply/dispatch-from-config.test.ts -- --reporter=dot -t "uses (modelByChannel before runtime models for first-turn delivery defaults|runtime channel models before cached Codex runtime defaults)"`
- Outcome: exit 0; 2 changed dispatch tests passed and 191 unrelated tests were skipped.

The prior follow-up's broad dispatch run and its two unrelated pre-existing failures remain documented at `plans/checkpoints/swift-dune-1559.red-green-proof.md`; this task did not rerun or attempt to fix unrelated cases.

## Build and Evidence Checks

- `pnpm build` -> exit 0. The first invocation exceeded the 120-second tool timeout during the UI build; the fresh retry completed successfully in 107.4 seconds.
- `pnpm exec oxfmt --check --threads=1 plans/checkpoints/warm-peak-1796.acceptance-evidence.md plans/checkpoints/warm-peak-1796.red-green-proof.md plans/checkpoints/warm-peak-1796.checkpoint.md` -> exit 0.
- The semantic-review Markdown is intentionally excluded from formatting because oxfmt removes the single-space blank context lines required for byte-identical diff preservation. Its fenced payload instead passed exact byte comparison, 13-path counting, and no-truncation checks.
- `git diff --check -- plans/checkpoints/warm-peak-1796.semantic-review-material.md plans/checkpoints/warm-peak-1796.acceptance-evidence.md plans/checkpoints/warm-peak-1796.red-green-proof.md plans/checkpoints/warm-peak-1796.checkpoint.md` -> exit 0.
- `git apply --check --reverse plans/checkpoints/swift-dune-1559.source-and-tests.diff` -> exit 0.
