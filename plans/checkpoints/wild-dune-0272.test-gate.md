# Canonical Test Gate: wild-dune-0272

Status: PASS
Date: 2026-08-31
Run ID: `wild-dune-0272-20260831T011323Z`
Base revision: `c810e68835a128c4dbd5e77db2208ab7b43bcce2`
Task-candidate SHA-256: `0d42eff1df15b7eb1391d73ffc643ee7a162c8f52f338c0747153cd1e07e2b92`

This is the canonical task-scoped gate defined by the original plan's exact focused commands and repository-owned wrappers. The candidate digest binds the 25 sender-hint source, test, contract, documentation, and final-note files exercised by this run. It is not the separate clean-checkout 23-row Deliberation rollout/full gate.

## Canonical contract generation and provenance

- `pnpm build`: PASS. This regenerated runtime and Plugin SDK build outputs.
- `pnpm build:plugin-sdk:dts && node --experimental-strip-types scripts/write-plugin-sdk-entry-dts.ts && node scripts/check-plugin-sdk-exports.mjs`: PASS. The generated public hook declaration includes `senderAliases`; all required Plugin SDK exports passed.
- Direct SHA-256 comparison of every `provenance.json.files` entry: PASS.
  - `km-wire-v1.json`: `4a09c6e11e410a5e360a1c7d752c52bfe90d1e99644c323a9ad3318956548930`
  - `cutover-controls-v1.json`: `b1d845d1cda25bdba996c0fe4581963a80d1f62a37b0b5550fbc4d3ccf700b85`
  - `openclaw-overlay-v1.json`: `25c28e3d61d262ce05d09d61de29735c86860a6355c2aea9cf2727c6c3f31af8`
  - `source-identity-v1.json`: `252f03184601f2f2fa8752c5df1b4bb7dd4a20b90bd47c932eee09b9c0bc3af6`
  - `source-identity-fixtures-v1.json`: `8e4f0373b5d986cb8098fbc7bf3565cfd3f88ef9b83e7189f4bbb53299a427fb`

## Focused tests

- `pnpm test extensions/discord/src/monitor/message-handler.deliberation.test.ts extensions/slack/src/monitor/message-handler.deliberation.test.ts src/hooks/message-hook-mappers.test.ts -- --reporter=verbose`: PASS in one complete invocation, 3 shards and 29 tests: mapper 15, Discord 6, Slack 8.
- `pnpm test extensions/deliberation/src/hooks.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/contract.test.ts extensions/deliberation/scripts/intake-producer.test.ts -- --reporter=verbose`: PASS, 146 tests across 4 files. This includes fixture schema validation, optional sender-hint shape, sender-ID-only omission, and accepted provenance hashes.
- `pnpm test extensions/deliberation/src/route-match.test.ts extensions/deliberation/src/delivery-composition.test.ts extensions/deliberation/src/final-adapter.test.ts extensions/deliberation/src/delivery-probe.test.ts -- --reporter=verbose`: PASS, 79 tests across 4 files. This covers source/target admission, durable target routing, provider idempotency, no-retry outcomes, and replay with zero provider calls.

## Type, lint, format, and docs

- `node scripts/run-tsgo.mjs -p extensions/deliberation/tsconfig.json`: PASS after canonical Plugin SDK declaration generation.
- `node scripts/run-oxlint.mjs <18 task-scoped TypeScript files>`: PASS.
- `pnpm exec oxfmt --check <22 task-scoped TypeScript, docs, and evidence files>`: PASS.
- `pnpm docs:check-mdx`: PASS, 683 files.
- `git diff --check -- docs/plugins/reference/deliberation.md plans/checkpoints/wild-dune-0272.final-note.md plans/checkpoints/wild-dune-0272.checkpoint.md`: PASS.

## Goal 004 comparison

- The pre-task source-anchor and source-thread paragraphs are byte-for-byte restored from `HEAD` in `docs/plugins/reference/deliberation.md`; they no longer appear in its diff.
- The sender-hint hunk in `extensions/deliberation/src/intake.ts` adds only `resolveSenderIdentityHints(event)` and an optional `senderIdentityHints` property between the existing `senderId` and timestamp properties. It does not modify `providerEventId`, `sourceTarget`, `sourceThreadId`, `pipelineId`, `deliveryTarget`, timestamps, content, or admission.
- The KM client contract adds only the optional closed property and allowlist entry. It does not alter request paths, provider event identity, source identity, target identity, or idempotency inputs as part of this sender-hint task.
- Discord, Slack, mapper, and producer changes project authenticated sender text only. They do not write source, target, thread, event, replay, or delivery authority.
- No runtime routing code was changed by this acceptance repair. The 79-test routing/idempotency/replay group passed on the bound candidate.
