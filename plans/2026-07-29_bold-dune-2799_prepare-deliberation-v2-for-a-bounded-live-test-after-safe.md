# Plan 2026-07-29: Prepare Deliberation v2 Acceptance Fix

Repair the acceptance gap with a real task-owned proof path: source audit first, RED before edits, bounded OpenClaw-side repair, fresh GREEN, and no live mutation.

## Analysis

### Codebase Context

- `plans/2026-07-29_fresh-brook-8143_prepare-deliberation-v2-for-a-bounded-live-test-after-safe.md`: prior plan allowed a blocked stop; this acceptance fix must not stop unless a task owner explicitly accepts that blocked contract as completion.
- `plans/checkpoints/fresh-brook-8143.checkpoint.md`: no production, fixture, or docs edits were made; treat existing implementation as current baseline, not as accepted completion.
- `plans/checkpoints/fresh-brook-8143.red-green-proof.md`: not valid TDD proof for this repair because it records a contract-gate stop, not failing focused behavior tests followed by implementation.
- `plans/tasks/2026-07-29_prepare-deliberation-v2-for-a-bounded-live-test-after-safe-s.md`: scope is fork-only; do not inspect/mutate live config, KM, Mission Control, routes, spool, crons, Gateway, channels, or external services.
- `extensions/AGENTS.md`: Deliberation must stay within plugin boundary and import production code only from `openclaw/plugin-sdk/*` plus local files.
- `extensions/deliberation/src/km-client.ts`: current client calls `/v1/*` and sends `x-deliberation-wire-version: 1`; it has closed parsers but only sparse schema authority.
- `extensions/deliberation/contracts/*.json`: current fixtures are summary contracts with repository-local provenance, not KM-owner provenance.
- `extensions/deliberation/index.ts`: registers `deliberation.*` controls and `reconcile`; control operations must match the accepted fixture exactly.
- `extensions/deliberation/src/intake.ts`: intake is non-claiming and `before_dispatch` preserves terminal source silence.
- `extensions/deliberation/src/poll-service.ts`: sender already skips list/reserve while disabled or safe-silence; preserve this preparation-mode behavior.
- `extensions/deliberation/src/final-send.ts`: sole production `sendDurableMessageBatch` call; preserve reserve -> one send attempt -> complete/reconcile ownership.
- Existing tests cover strict config, closed control parsing, safe-silence skip, CAS race, final-send receipts, and sole-send ownership; add missing acceptance tests for canonical wire/control authority, disabled preparation mode, docs/fixture provenance, and valid TDD evidence.

### Relevant Documentation

- `pnpm docs:list`: run for discovery; relevant docs include `plugins/reference/deliberation.md`, `plugins/sdk-channel-outbound.md`, `plugins/sdk-entrypoints.md`, `plugins/sdk-overview.md`, `plugins/sdk-runtime.md`, `plugins/sdk-testing.md`, and `reference/secretref-credential-surface.md`.
- `docs/plugins/reference/deliberation.md`: update only after behavior is repaired; document exact supported config, read-only preflight, preparation-mode defaults, later activation handoff, and rollback to safe silence.
- `plans/investigations/swift-mist-4312_audit-deliberation-v1-residue-in-openclaw-fork.md`: `/v1/*` is not retired-v1 evidence by itself; do not use that audit as KM-owner wire authority.
- `plans/investigations/wild-peak-6037_investigate-deliberation-v2-standard-plugin-capabilities.md`: keep bounded guarantee wording: one KM-reserved OpenClaw send call, unknown outcomes not retried until reconciled, no exactly-once visible-delivery claim.

### Knowledge Base

- `learnings/architecture/contract-gated-deliberation-missing-km-authority.md`: missing KM-owner authority is a hard gate for invented wire semantics, but this acceptance fix needs either implementation against accepted evidence or an explicitly accepted blocked-completion contract.
- `learnings/architecture/2026-07-29_contract-gated-plans-should-name-absent-audit-artifacts.md`: do not silently replace absent `bright-vale-8642` with older investigations.
- `learnings/architecture/2026-07-28_route-delivery-recovery-through-canonical-reservation.md`: all recovery goes through KM reservation; reconciliation never sends directly.
- `learnings/architecture/2026-07-28_wire-protocol-versions-are-not-implementation-generations.md`: do not remove `/v1/*` merely because it contains `v1`; remove it only if accepted contract says another path is canonical.
- Recall search: backend `local`, collection `openclaw-fork-learnings`, diagnostic `Collection not found: openclaw-fork-learnings`.

## Available Skills

- `tdd`: required first implementation step; write `plans/checkpoints/bold-dune-2799.red-green-proof.md` with exact RED and GREEN command output.
- `task-evidence`: use before TDD if a genuine historical RED exists; link it rather than fabricating a RED after implementation.
- `openclaw-testing`: use for the smallest safe Deliberation/docs/build gates.
- `technical-documentation`: use if `docs/plugins/reference/deliberation.md` changes beyond small factual edits.
- `save-learning`: mandatory final implementation action after checkpoint evidence.

## Solutions

- Treat `bright-vale-8642` absence as a contract-authority gap to close, not as completion: locate repository-local quoted canonical values, import an accepted immutable KM-owner bundle supplied in-task, or ask the task owner for a task contract explicitly accepting blocked fail-closed completion.
- If canonical values are available, replace sparse contract fixtures with closed request/response/control schemas and align `km-client.ts`, `index.ts`, docs, and tests to one path/header/control family.
- If canonical values remain unavailable and no owner contract accepts the block, stop before product edits with a checkpoint that says the acceptance fix cannot be completed; do not mark the task satisfied.
- Preserve preparation safety in every branch: plugin may be configured and testable, but intake/sender controls stay disabled or safe-silence until a later live activation task.

## Implementation

### Pre-implementation Checklist

- [ ] Confirm `plans/investigations/bright-vale-8642_final-deliberation-v2-readiness-audit.md` is still absent or read it if it now exists.
- [ ] Read any task-supplied KM-owner bundle before writing tests; do not infer schemas from sparse summary fixtures alone.
- [ ] Use `skill:task-evidence` to search for a genuine historical RED; if none exists, create a new RED under this task before production edits.
- [ ] Keep all file references repo-root relative.
- [ ] Do not perform git operations.

### Steps

1. Add the focused RED tests in `extensions/deliberation/src/km-client.test.ts`, `extensions/deliberation/src/plugin.test.ts`, and `extensions/deliberation/src/contract.test.ts` using the canonical contract values available to the task.
2. Run the focused RED command and record the failing assertion/output in `plans/checkpoints/bold-dune-2799.red-green-proof.md`.
3. Replace `extensions/deliberation/contracts/km-wire-v1.json` and `extensions/deliberation/contracts/cutover-controls-v1.json` with closed canonical schemas, examples, allowed outcomes, operation paths, and control semantics.
4. Update `extensions/deliberation/contracts/provenance.json` with hashes and the exact accepted source/provenance; do not claim KM-owner approval unless the source actually provides it.
5. Update `extensions/deliberation/src/km-client.ts` to use the single canonical path family, protocol header, request bodies, closed response parsers, duplicate/disabled/safe-silence outcomes, reservation CAS fields, completion payloads, and reconciliation outcomes.
6. Update `extensions/deliberation/index.ts` so `health`, `status`, mutation controls, `synthetic.run`, and `reconcile.not-sent` match the control fixture exactly.
7. Adjust `extensions/deliberation/src/intake.ts` only if canonical intake field names differ; keep non-claiming intake and terminal `before_dispatch` source silence.
8. Adjust `extensions/deliberation/src/poll-service.ts` only if canonical list/reserve semantics differ; keep disabled/safe-silence skips before list/reserve/send.
9. Adjust `extensions/deliberation/src/final-send.ts` only if canonical completion payloads differ; keep the sole provider attempt and unknown/no-replay behavior.
10. Update `docs/plugins/reference/deliberation.md` with exact supported config fields, SecretRef credential, read-only `health`/`status` preflight, disabled preparation defaults, later activation handoff, and rollback by disabling/removing v2 back to safe silence.
11. Run focused GREEN, Deliberation suite, docs checks, and build commands below; record exact results in `plans/checkpoints/bold-dune-2799.checkpoint.md` and `plans/checkpoints/bold-dune-2799.red-green-proof.md`.
12. Run `skill:save-learning` and save one learning about the repair or remaining contract gate.

## Files to Modify

| File                                                         | Change                                                                                           |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| `extensions/deliberation/contracts/km-wire-v1.json`          | Replace sparse summary with closed canonical KM wire fixture if accepted authority is available. |
| `extensions/deliberation/contracts/cutover-controls-v1.json` | Align health/status/mutation/synthetic/reconcile controls to accepted schema.                    |
| `extensions/deliberation/contracts/provenance.json`          | Update hashes and provenance for accepted fixtures.                                              |
| `extensions/deliberation/src/km-client.ts`                   | Canonicalize paths, headers, payloads, parsers, and lifecycle outcomes.                          |
| `extensions/deliberation/index.ts`                           | Align Gateway/CLI controls and reconciliation method semantics.                                  |
| `extensions/deliberation/src/intake.ts`                      | Keep source silence; adjust intake payload only if canonical schema requires it.                 |
| `extensions/deliberation/src/poll-service.ts`                | Keep disabled/safe-silence skips; adjust list/reserve only if canonical schema requires it.      |
| `extensions/deliberation/src/final-send.ts`                  | Keep sole send and no replay; adjust completion schema only if required.                         |
| `extensions/deliberation/src/km-client.test.ts`              | Add canonical wire/header/schema RED tests.                                                      |
| `extensions/deliberation/src/plugin.test.ts`                 | Add control registration/preparation-mode tests.                                                 |
| `extensions/deliberation/src/contract.test.ts`               | Assert contract hashes, closed fixtures, and no competing path/header variants.                  |
| `docs/plugins/reference/deliberation.md`                     | Document exact preparation config, preflight, activation handoff, and rollback.                  |
| `plans/checkpoints/bold-dune-2799.checkpoint.md`             | Record exact commands, results, changed files, and no-live-mutation statement.                   |
| `plans/checkpoints/bold-dune-2799.red-green-proof.md`        | Record genuine RED provenance and fresh GREEN verification.                                      |

## TDD

Implement the TDD cycle with `skill:tdd`. Use `skill:task-evidence` first only to link a genuine historical RED; if none exists, create the RED below before production edits.

**Test file:** `extensions/deliberation/src/km-client.test.ts`  
**Framework:** Vitest through repo wrapper  
**Run command:** `node scripts/run-vitest.mjs extensions/deliberation/src/km-client.test.ts --reporter=verbose`  
**Edit hint:** append to `describe("KM contract parsing", ...)`; replace placeholder path/header strings only with accepted task-supplied KM contract values before running RED.

```ts
it("uses the accepted canonical KM intake path and protocol header", async () => {
  const fetchImpl = vi
    .fn()
    .mockResolvedValue(
      new Response(JSON.stringify({ status: "accepted", recordId: "record-1" }), { status: 200 }),
    );
  const client = createKmClient({
    config,
    openclawConfig: {} as never,
    fetchImpl,
    env: { KM_TOKEN: "test-only" },
  });

  await client.intake({ idempotencyKey: "key", route: {}, message: {} });

  expect(fetchImpl.mock.calls[0]?.[0]).toBe("https://km.invalid/<accepted-canonical-intake-path>");
  expect(fetchImpl.mock.calls[0]?.[1]?.headers).toMatchObject({
    "<accepted-protocol-header>": "<accepted-protocol-version>",
  });
});

it("rejects reservation responses outside the accepted closed schema", async () => {
  const client = createClient({ outcome: "reserved", attempt: { unexpected: true } });

  await expect(
    client.reserve({ deliveryId: "delivery-1", version: 1 }, "worker-1"),
  ).rejects.toThrow("invalid reserved attempt");
});
```

| Test                                                               | RED                                                                                                                                                                                       | GREEN                                                                         |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `uses the accepted canonical KM intake path and protocol header`   | Current client uses `/v1/intake` and `x-deliberation-wire-version` when accepted values differ; if accepted values are identical, replace this with another contract mismatch before RED. | Client sends the accepted path/header only.                                   |
| `rejects reservation responses outside the accepted closed schema` | Parser accepts or fails with non-canonical behavior for an accepted-schema violation.                                                                                                     | Parser rejects every non-canonical reservation shape with the expected error. |

### Additional Focused Tests

- `extensions/deliberation/src/plugin.test.ts`: assert preparation mode exposes read-only status/health and write controls without enabling sender by default.
- `extensions/deliberation/src/poll-service.test.ts`: add sender-disabled skip if missing; preserve safe-silence skip and one-CAS-winner send.
- `extensions/deliberation/src/final-send.test.ts`: preserve one provider call, sanitized receipt, unknown completion on thrown/uncertain outcome, and route-not-configured no-send completion.
- `extensions/deliberation/src/contract.test.ts`: assert fixture hashes and no competing `/v1/*` versus `/deliberation/v1/*` variants unless the accepted contract explicitly defines exactly one of them.

### Verification Commands

- `node scripts/run-vitest.mjs extensions/deliberation/src/km-client.test.ts --reporter=verbose`
- `node scripts/run-vitest.mjs extensions/deliberation/src --reporter=verbose`
- `node scripts/run-vitest.mjs extensions/deliberation src/plugins/source-checkout-runtime.test.ts --reporter=verbose`
- `pnpm docs:list`
- `pnpm lint:docs docs/plugins/reference/deliberation.md plans/checkpoints/bold-dune-2799.checkpoint.md plans/checkpoints/bold-dune-2799.red-green-proof.md`
- `pnpm docs:check-mdx`
- `pnpm build`

## Dependencies

- Accepted KM contract evidence must provide canonical path family, protocol header, request/response schemas, control operations, CAS/lease semantics, completion/reconciliation outcomes, and provenance.
- If the accepted contract is unavailable, obtain task-owner acceptance for blocked fail-closed completion before marking the task satisfied.
- No live config, Jackie runtime state, KM System, Mission Control, routes, spool, crons, Gateway processes, channels, external services, or message sends may be touched.
- No compatibility route, v1 fallback, direct-send fallback, JSON state file, dual reader, blind retry, or exactly-once visible-delivery claim.

---

_Created: 2026-07-29_
_Status: DRAFT_
