# Plan 2026-08-24: Establish canonical Deliberation OR-01 through OR-23 gate

Repair the existing caller-owned gate, then produce one attributable immutable 23-row result from a clean checkout.

## Analysis

### Existing Boundaries

- `scripts/deliberation-full-gate.ts` already composes OR-01..OR-23, build/package proof, support checks, negative verification, exclusive ledger output, and readiness generation.
- `scripts/lib/deliberation-full-gate-ledger.ts` already binds exact reporter selectors, command identities, timestamps, hashes, candidate integrity, and a real OR-23 selector, but incorrectly requires historical KM revision `79bbc5c...`.
- `extensions/deliberation/contracts/provenance.json` is already correct: semantic authority is the four owner-file hashes; current KM HEAD is non-blocking provenance.
- OR-01..OR-06 are loader-backed Discord/Slack ingress tests; OR-07..OR-21 are direct OpenClaw producer/client/adapter scenarios against random-loopback owner listeners and disposable SQLite; OR-22 installs the current tarball and proves doctor writeback plus five hooks and one service.
- The runner inherits the host environment without a no-live guard and characterizes only one malformed verifier input. Its required `km-e2e` support command contains one known stale owner assertion that omits contract-required `pipelineId` and `deliveryTarget`; it is not one of the fixed OR leaves or required OR-23 support surfaces.
- `plans/checkpoints/fresh-peak-7129.rollout-readiness.md` correctly remains unknown until a validated canonical artifact exists.

### Authority And Evidence Rules

- Verify these KM artifacts before behavior and stop on any mismatch:
  - `contracts/deliberation-v2/v1/contract.json`: `5c63424b32a8db8370a1212ff7eb3878695afbb5d0fec3721fbab326908de44b`
  - `contracts/deliberation-v2/v1/fixtures.json`: `f26ca9afb804664cdcc03947262001d1d8441eab6d5ad9d92bb8533ae3c916b4`
  - `lib/deliberation_wire.py`: `a0e42e4fe54eedab6f9955e77f439a4e69c9614a60560ca46532ce0de9dbb528`
  - `lib/deliberation_spool_contracts.py`: `47587e405d3e6b7f433eb7d450bd02969546860ff0d6822ad7bea9ff2478a0ca`
- Record the current KM HEAD in authority and command evidence, but accept any valid HEAD when all four hashes match.
- Reporter totals never create rows. Each OR row must bind exactly one passed owning selector from the current run; OR-23 must execute after validating the fresh 22-row candidate.
- Readiness may consume only `plans/checkpoints/bright-fork-2292.full-gate.json`. Deployment, live provider authenticity, pilot traffic, activation, and rollout approval remain unknown.

## Available Skills

- `tdd`: create moving-HEAD, no-live, and four-case CLI verifier RED before runner changes.
- `openclaw-testing`: run narrow proof first and select the changed-surface closeout lane.
- `validate-implementation` and `autoreview`: mandatory implementation closeout.
- `save-learning`: mandatory final implementation-session action.

## Implementation

1. Invoke `skill:tdd`; capture RED in `plans/checkpoints/bright-fork-2292.red-green-proof.md` for moving KM HEAD acceptance, live-environment refusal, and missing/duplicate/stale/malformed CLI inputs producing nonzero with no output artifact.
2. Replace fixed-revision KM authority in `scripts/lib/deliberation-full-gate-ledger.ts` with `head` provenance plus the fixed four-path hash manifest. Validate HEAD shape and exact ordered paths/hashes, include observed HEAD in `authorityDigest`, and remove `revision`/`scopedClean` acceptance requirements.
3. Update `preflight()` in `scripts/deliberation-full-gate.ts` to print current KM HEAD, hash each read-only owner artifact, and compare `provenance.json.ownerFiles`; do not reject unrelated HEAD movement or repository dirt when authoritative bytes match.
4. Add a fail-closed no-live preflight and child-environment policy before any behavioral command. Reject live-test toggles, omit inherited provider credentials from child processes, inject only isolated HOME/state/config/OAuth/temp paths plus command-specific test credentials, and record the sanitized environment in command identity evidence.
5. Keep all fixed OR owners unchanged. Preserve the direct OR-07..OR-21 owner-runtime command, random `127.0.0.1:0` listener, mode-`0600` temporary credential, disposable SQLite/spool, production-path exclusion, listener termination, and recursive cleanup.
6. Remove the stale external `km-e2e` assertion set from `DELIBERATION_SUPPORT_COMMANDS` and canonical execution. Do not edit KM or strip required fields; contract provenance, the direct owner-runtime leaves, focused Deliberation suites, build, package E2E, Oxlint, production/test `tsgo`, built singleton, and `git diff --check` remain blocking OR-23 support evidence.
7. After positive commands, build a provisional 22-row candidate shape and run `verify` separately against missing, duplicate, stale, and malformed variants. Require the expected nonzero code, bounded diagnostic, and absent output for every variant; only then validate/write the immutable candidate and execute the real OR-23 selector.
8. Change generated outputs to `plans/checkpoints/bright-fork-2292.{full-gate.json,final-note.md}`. The final note must list the canonical command, OpenClaw revision, non-blocking KM HEAD, all four hashes, all 23 named Green rows, artifact hash, four negative outcomes, support command results, elapsed time, and explicit non-live/non-rollout scope.
9. Generate `plans/checkpoints/fresh-peak-7129.rollout-readiness.md` only after strict final-ledger validation and point it exclusively at the bright-fork artifact. If any real OR leaf or required support command remains Red, leave the final artifact/readiness Green absent and report that exact selector or command instead of changing semantics.
10. From an authorized clean task checkout, run `pnpm test:deliberation:full-gate` once and require exit 0 plus exactly ordered `OR-01`..`OR-23` Green output. Run `skill:validate-implementation`, fresh bounded `skill:autoreview` until no actionable findings remain, then invoke `skill:save-learning` last and save at least one learning.

## Files To Modify

| File                                                     | Change                                                                                                                                                   |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scripts/lib/deliberation-full-gate-ledger.ts`           | Model KM HEAD as provenance, retain four-hash authority, update support manifest, and expose the no-live environment validator used by the runner/tests. |
| `scripts/deliberation-full-gate.ts`                      | Repair preflight/environment isolation, execute four negative cases, preserve fixed OR composition, and generate task-owned evidence.                    |
| `test/scripts/deliberation-full-gate.test.ts`            | Add moving-HEAD, no-live/sanitized-env, and missing/duplicate/stale/malformed CLI regressions.                                                           |
| `plans/checkpoints/bright-fork-2292.red-green-proof.md`  | Preserve exact RED/GREEN commands and outcomes.                                                                                                          |
| `plans/checkpoints/bright-fork-2292.full-gate.json`      | Store the exclusive complete 23-row machine artifact from the canonical run.                                                                             |
| `plans/checkpoints/bright-fork-2292.final-note.md`       | Store bounded completion evidence and scope exclusions.                                                                                                  |
| `plans/checkpoints/fresh-peak-7129.rollout-readiness.md` | Consume only the validated bright-fork artifact.                                                                                                         |

Do not change channel handlers, Deliberation product runtime, OR-01..OR-22 owning tests, `provenance.json`, package scripts, or KM files unless a fresh fixed-leaf failure proves a task-scoped gate defect.

## TDD

Implement the cycle with `skill:tdd`; write evidence to `plans/checkpoints/bright-fork-2292.red-green-proof.md`.

**Test file:** `test/scripts/deliberation-full-gate.test.ts`  
**Run command:** `OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test test/scripts/deliberation-full-gate.test.ts -- --reporter=verbose`  
**Edit hint:** extend `fixtureAuthority`/`validCandidate` to accept a KM HEAD, then append these cases before changing the gate.

```ts
import { expect, it } from "vitest";
import {
  assertNoLiveEnvironment,
  validateCandidateLedger,
} from "../../scripts/lib/deliberation-full-gate-ledger.js";

it("accepts moving KM HEAD when all authoritative hashes match", () => {
  const candidate = validCandidate({ kmHead: "f".repeat(40) });
  expect(validateCandidateLedger(candidate, context()).authority.km.head).toBe("f".repeat(40)); // RED: the schema still requires historical revision 79bbc5c...
});

it("rejects a live execution environment before running children", () => {
  expect(() => assertNoLiveEnvironment({ OPENCLAW_LIVE_TEST: "1" })).toThrow(
    "live execution environment",
  ); // RED: no no-live guard exists.
});
```

Add a table-driven CLI test that writes valid-candidate derivatives for `missing`, `duplicate`, and `stale`, plus invalid JSON for `malformed`; spawn `scripts/deliberation-full-gate.ts verify` for each and assert nonzero status, bounded case-specific stderr, and no output file.

| Test                    | RED                                                             | GREEN                                                                                       |
| ----------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Moving KM HEAD          | Candidate schema rejects any revision except `79bbc5c...`.      | Any 40-character HEAD passes when all four paths/hashes match.                              |
| No-live environment     | Runner can inherit live toggles/provider credentials.           | Preflight rejects live toggles and child evidence contains only sanitized/test credentials. |
| Four CLI negative cases | Canonical runner characterizes only one empty malformed ledger. | Missing, duplicate, stale, and malformed inputs each fail nonzero and create no artifact.   |
| Canonical integrity     | No bright-fork 23-row artifact exists.                          | One clean run emits 23 ordered unique Green rows and a real OR-23 reporter result.          |

## Verification

1. `OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test test/scripts/deliberation-full-gate.test.ts -- --reporter=verbose`
2. `OPENCLAW_DELIBERATION_KM_ROOT="$HOME/.openclaw/workspace/km-system" pnpm test:deliberation:km-integration`; require all four hashes and each OR-07..OR-21 exactly once.
3. `pnpm test:deliberation:full-gate`; require zero exit, 23/23 Green, four negative failures, complete artifact, and bounded output.
4. Inspect `plans/checkpoints/bright-fork-2292.full-gate.json` for exact order/cardinality, current revisions, fixed hashes, command/report hashes, support results, candidate digest, and exclusive mode-`0600` creation.
5. Run the changed-surface gate selected by `skill:openclaw-testing`; because build/package boundaries change operationally, retain `pnpm build`, installed OR-22 package proof, and built singleton proof inside the canonical command.

## Dependencies

- Read-only `/Users/michal/.openclaw/workspace/km-system` with the four accepted artifact hashes and its existing Python environment; current HEAD may move.
- A clean committed OpenClaw task state for immutable revision evidence. Preserve unrelated worktree changes and obtain the clean state through the authorized workflow rather than weakening preflight.
- No KM edits, deployment, live installation linking, Gateway restart, live config, production spool, provider send, or pilot activation.

_Status: DRAFT_
