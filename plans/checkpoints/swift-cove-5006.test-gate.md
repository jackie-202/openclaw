# Canonical Test Gate: swift-cove-5006

## Required Gate

- Registered command: `cd ~/Projects/openclaw-fork && npm test`
- Required owner: caller/monitor Test Gate
- Canonical reference: `canonical:not-run`
- Status: `BLOCKED`

No caller-owned Test Gate runner, submission interface, run manifest, provider,
or run reference was supplied to this implementation session. The available
local shell cannot mint a caller-owned canonical reference. Running `npm test`
locally or assigning a local label would not satisfy the acceptance contract.

## Local Verification

These results describe the current workspace only and are not canonical Test
Gate evidence:

- Focused owner-path command: exit code 0; 5 Vitest shards, 6 files, and 347
  tests passed. See `plans/checkpoints/swift-cove-5006.red-green-proof.md`.
- `pnpm build`: exit code 0.
- `pnpm lint:extensions -- extensions/deliberation extensions/discord extensions/slack`:
  exit code 1 on unrelated existing errors in
  `extensions/deliberation/scripts/intake-producer.test.ts:244`,
  `extensions/deliberation/src/orchestration.test.ts:176`, and
  `extensions/deliberation/src/orchestration.test.ts:253`.

## Acceptance Status

`finding-002` remains unresolved until the caller/monitor runs the registered
command and supplies a concrete passing canonical provider/run reference with
exit code and complete totals.
