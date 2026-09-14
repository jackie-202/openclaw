# Deliberation Wire Pin Evidence

## Baseline

- Before implementation, `pnpm test extensions/deliberation/src/contract.test.ts -- --reporter=verbose` passed 12/12 tests.
- The old independent domain copies had SHA-256 digests `4a09c6e11e410a5e360a1c7d752c52bfe90d1e99644c323a9ad3318956548930` (`km-wire-v1.json`) and `b1d845d1cda25bdba996c0fe4581963a80d1f62a37b0b5550fbc4d3ccf700b85` (`cutover-controls-v1.json`).

## Compatibility Characterization

- The published contract preserves the same six endpoint methods and paths, application and transport headers, closed target/intake/reservation/invocation/completion schemas, controls, and 43 fixture cases.
- The compatible consumer additions are required health `sourceDrift`, listener `sourceIdentity`, runtime `sourceHistoryTimeoutCount`, runtime `failureWindow`, and active-slot/drafting dispatch-stage evidence.
- The published error-code set adds `DELIVERY_FRESHNESS_CLOSED`.
- The published fixtures replace `health.degraded` with `health.source-identity-unavailable` and refresh the trusted-sender fixture values without changing its schema or identity semantics.
- Published terminal completion projections omit optional reservation and invocation fields that the previous independent consumer required. The client now validates those fields when present while retaining mandatory envelope, digest, attempt, outcome, provider, receipt/failure, and request-bound identity checks; the exact published `complete.sent`, `complete.replay`, and `complete.failed` responses pass consumer parsing.
- No current request, status, intake, reservation, invocation, completion, duplicate, history, or delivery behavior was unrepresentable. No endpoint, configuration, control, state, or deployment behavior changed.

## Authority And Digests

- Pin manifest: `extensions/deliberation/contracts/deliberation-wire-pin-v1.json`.
- Authority: published Deliberation v2 domain, restricted to the two ordered `publicationManifest.members` below.
- Bundle schema/version: `1` / `1`.
- Self-excluding bundle SHA-256: `b9eaada06b60b8ecba17a378832f03591fbbf0e5a574844cd6b94a9d722ee338`.
- Canonicalization: UTF-8, RFC 8259 values, lexicographically sorted object keys, compact separators, one trailing newline.
- Member 1: `contracts/deliberation-v2/v1/contract.json`, pinned locally as `deliberation-v2-v1-contract.json`, SHA-256 `292e7f17b13379c8e909497084bddccb57e0f371f79f7113ebd894a78cd6a98f`.
- Member 2: `contracts/deliberation-v2/v1/fixtures.json`, pinned locally as `deliberation-v2-v1-fixtures.json`, SHA-256 `357e965edb2a82b7793f92807928718843f31d6152c7524723cf65a7207c8a78`.
- Both local members compared byte-for-byte equal to the approved transfer bundle with `cmp`; both commands exited 0.
- OpenClaw-owned `openclaw-overlay-v1.json`, source-identity artifacts, history contracts, intake, transport, and final-delivery behavior remain outside domain authority.
- Obsolete `km-wire-v1.json` and `cutover-controls-v1.json` were removed after all consumers migrated.

## Local Verification

- RED: `pnpm test extensions/deliberation/src/deliberation-wire-pin.test.ts -- --reporter=verbose` failed 3/3 because the local pin manifest did not exist. Full output is in `plans/checkpoints/fresh-fork-9570.red-green-proof.md`.
- GREEN: the identical command passed 3/3. It verifies pin version/authority, ordered membership, self-excluding bundle digest, member digests, canonical bytes, missing/tampered/version/order/digest rejection, and all published fixture schemas.
- Consumer characterization: `pnpm test extensions/deliberation/src/deliberation-wire-pin.test.ts extensions/deliberation/src/contract.test.ts extensions/deliberation/src/km-client.test.ts -- --reporter=verbose` passed 102/102.
- Required fake-only regression command: `pnpm test extensions/deliberation/src/contract.test.ts extensions/deliberation/src/deliberation-wire-pin.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/hooks.test.ts extensions/deliberation/src/history-read.test.ts extensions/deliberation/src/orchestration.test.ts extensions/deliberation/src/delivery-composition.test.ts -- --reporter=verbose` passed 189/189 in 7 files.
- `pnpm lint:extensions`, `pnpm tsgo:extensions`, and `pnpm tsgo:extensions:test` passed.
- Scoped `pnpm exec oxfmt --check --threads=1 ...` and `git diff --check` passed.
- `shasum -a 256` reproduced both approved member digests, and byte-for-byte `cmp` against the transfer bundle passed.
- Final scoped `.agents/skills/autoreview/scripts/autoreview --mode local --prompt <fresh-fork-9570 scope> --stream-engine-output` reported `autoreview clean: no accepted/actionable findings reported`. The reviewer specifically confirmed the exact published completion projections are accepted while mandatory delivery fences remain enforced.

## Explicitly Unrun Evidence

- `pnpm build`: not run; the approved plan requires it to be listed separately from this source-only fake-test gate.
- Installed-artifact identity: not checked; installation/linking is outside this coding task's authorization.
- Deployed-identity and protocol-smoke evidence: not run or refreshed; deployment, restart, live processing, provider calls, and protocol cutover require separate host approval.
