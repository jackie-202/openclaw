# Plan 2026-08-23: Establish caller-owned Deliberation OR-01 through OR-23 full gate

Define the repository-owned executable gate, evidence ledger, and readiness-consumer changes needed to prove the existing Deliberation boundaries without changing product semantics.

_Status: DRAFT_
_Created: 2026-08-23_

## Progress

- [x] Phase 0: Config + Init
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Analysis

### Codebase context

- `extensions/discord/src/monitor/message-handler.deliberation.test.ts` already owns exact loader-backed `OR-01`, `OR-02`, `OR-03`, `OR-04`, and `OR-06` leaves; `extensions/slack/src/monitor/message-handler.deliberation.test.ts` owns `OR-05`.
- `extensions/deliberation/scripts/km-listener.cross-repo.ts` already enforces loopback listener startup, temporary credentials/SQLite, production-spool non-overlap, cleanup, owner-file hashes, producer intake, lifecycle fencing, and fake-provider delivery, but still reports aggregate tests instead of assigned `OR-07..OR-21` leaves.
- `test/scripts/deliberation-doctor-package.e2e.test.ts` already owns `OR-22 doctor-package-writeback-built-five-hook-runtime` through a real tarball install, doctor writeback/refusal, installed runtime hook/service probe, and isolated state.
- `package.json` exposes only `test:deliberation:km-integration`; no caller-owned full gate or ledger verifier exists.
- `plans/checkpoints/fresh-peak-7129.rollout-readiness.md` is historical manual accounting with an obsolete assignment and must be replaced by output derived only from the canonical gate artifact.
- The accepted KM bundle supplied by prior tasks is revision `79bbc5c0426bc7be901d5199da11b21213bfa008` with four scoped hashes recorded in `plans/tasks/2026-08-23_converge-openclaw-with-supplied-immutable-km-deliberation-ow.md`. Current `provenance.json` is stale; the gate must block rather than relabel that mismatch.

### Relevant documentation

- `docs/proposals/proposal-20260820-203458-161e2c_per-source-deliberation-pipelines-with-source-default-delivery.md` fixes exclusive source ownership, singular intake, immutable target lifecycle, one provider attempt, and rollout as a separate decision.
- `docs/plugins/reference/deliberation.md` documents current repository semantics; no docs edit is needed unless the gate exposes a real semantic defect.
- `docs/reference/test.md` requires focused tests before broad gates and installed-package proof for package behavior. No Deliberation PlantUML source exists.

### Knowledge base

- `learnings/test-failures/fresh-peak-7129-reporter-totals-are-not-acceptance-matrices.md`: parse exact named leaves at their owning boundaries; supporting/aggregate tests never inflate the OR count.
- `learnings/tooling/2026-08-20_canonical-test-gate-evidence-cannot-be-reconstructed.md`: preserve current command/result evidence in one dedicated artifact; historical totals are not gate evidence.
- `learnings/tooling/dark-crag-3048-exact-command-identity-includes-owner-checkout-path.md`: command identity includes the pinned owner path, revision, and hashes.
- `learnings/test-failures/dark-mist-2518-named-package-leaf-runtime-coverage.md`: keep migration, installed runtime, and singleton assertions inside named `OR-22`.
- External provenance failure is setup failure, not behavioral RED. The `recall-knowledge` helper used local fallback because collection `openclaw-fork-learnings` was unavailable; its returned external-authority rules reinforce fail-closed preflight.

## Available Skills

- `tdd`: implement the verifier and negative characterization RED-first.
- `openclaw-testing`: select focused local and package proof without broad remote lanes.
- `autoreview`: mandatory fresh closeout review for implementation.
- `validate-implementation`: verify the final gate against project and architecture constraints.
- `save-learning`: required final implementation action.

## Solution

Add one manifest-driven gate runner that owns process execution, parses machine-readable test reports, and writes an overwrite-refusing JSON ledger. Build a 22-leaf candidate only from fresh child-process results, then execute a real named `OR-23 full-gate-integrity` Vitest selector against that candidate before finalizing exactly 23 rows. Every row records its selector, canonical argv/env digest, exit code, timestamps, transcript/report hashes, OpenClaw revision, and pinned KM authority; supporting commands remain outside the OR count.

## Implementation

1. Invoke `skill:tdd`; create `plans/checkpoints/quick-brook-1900.red-green-proof.md`, add the verifier tests below, and capture RED before runner code.
2. Add `scripts/lib/deliberation-full-gate-ledger.ts` with a closed schema and validators for the fixed OR manifest, authority bundle, command identity, one current run ID, monotonic timestamps, freshness window, exact selector/result cardinality, Green-only status, support-command success, and final 23-row integrity. Reject unknown fields, missing/duplicate/skipped/red/contradictory/stale rows, reused historical timestamps, wrong revision/hash/path, and overwrite attempts.
3. Add `scripts/deliberation-full-gate.ts` with `run` and `verify` modes. Preflight the OpenClaw checkout revision/clean status and the read-only KM checkout at `/Users/michal/.openclaw` revision `79bbc5c0426bc7be901d5199da11b21213bfa008`; require the four scoped KM paths clean and hash-identical before any behavioral command. Print the revision and all hashes, but never credentials or unbounded child output.
4. In run mode, create one temporary root for reports, package output, HOME/state/config/OAuth, listener credentials, and SQLite. Refuse overlap with either checkout or KM production state, pass the temporary paths to every child, kill listeners/process groups on failure, and remove secrets/state after hashing bounded evidence.
5. Run the existing loader-backed channel suites once with a machine-readable Vitest report and extract exactly these leaves: `OR-01 exclusive-owner-before-ordinary-side-effects`, `OR-02 disabled-source-terminal-without-side-effects`, `OR-03 missing-error-ambiguous-owner-terminal`, `OR-04 discord-system-room-event-claimed-before-enqueue`, `OR-05 slack-root-child-claim-before-thread-effects`, and `OR-06 command-abort-empty-autothread-claim-matrix`.
6. Refactor only the cross-repository harness/probe assertions needed to expose these independent `node:test` leaves while retaining auth/protocol/isolation/cleanup cases as uncounted support: `OR-07 authenticated-event-creates-one-record`, `OR-08 duplicate-idempotent-conflict-zero-mutation`, `OR-09 account-channel-source-isolation`, `OR-10 history-context-only-pending-event-singular`, `OR-11 pipeline-source-target-immutable-end-to-end`, `OR-12 reservation-no-target-override-cas-replay`, `OR-13 invocation-marker-before-one-provider-call`, `OR-14 sent-completion-exact-immutable-receipt`, `OR-15 authoritative-provider-rejection-terminal`, `OR-16 timeout-transport-remain-delivery-unknown`, `OR-17 invoked-unknown-nonreservable-after-restart`, `OR-18 never-invoked-abandonment-fresh-attempt-id`, `OR-19 legacy-not-sent-unknown-never-authorize-retry`, `OR-20 historical-attempt-drift-and-tamper-fail-closed`, and `OR-21 atomic-bounded-legacy-migration-audit-only`. Parse a machine-readable Node report and require each selector once.
7. Run `pnpm build`, package once with `scripts/package-openclaw-for-docker.mjs`, and execute `OR-22 doctor-package-writeback-built-five-hook-runtime` against that exact tarball. Keep all migration/refusal, installed five-hook/one-service, and singleton assertions inside the named leaf; do not substitute a source import or standalone smoke.
8. Record successful focused Deliberation/channel suites, the three pinned KM E2E selectors, touched-scope Oxlint, extension production/test `tsgo`, package inventory/singleton checks, and `git diff --check` as supporting command evidence. A supporting failure prevents candidate finalization but never creates or renames an OR row.
9. Run the negative verifier characterization against malformed/missing ledger input and require the expected nonzero diagnostic with no output ledger. Then run only `OR-23 full-gate-integrity` against the fresh 22-row candidate; append its real reporter result, validate exact `OR-01..OR-23` cardinality again, atomically create the final artifact, and print its SHA-256, 23-row bounded summary, and elapsed time.
10. Add `test:deliberation:full-gate` as the sole canonical entrypoint. Generate readiness accounting from the validated final ledger only: repository readiness may become Green at 23/23; deployment, live activation, provider authenticity, and pilot readiness remain explicitly unknown/not approved.
11. Run the canonical command from an authorized clean task checkout, preserve `plans/checkpoints/quick-brook-1900.full-gate.json` and `plans/checkpoints/quick-brook-1900.final-note.md`, then run `skill:validate-implementation` and fresh `skill:autoreview`, resolve findings, and rerun affected proof. Invoke `skill:save-learning` last.

Do not change product code to force Green. Any leaf exposing a semantic defect remains Red and becomes a blocker with its exact selector, command, and bounded evidence.

## Files to Modify

| File                                                                                   | Change                                                                                                                                   |
| -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `package.json`                                                                         | Add the canonical `test:deliberation:full-gate` command.                                                                                 |
| `scripts/deliberation-full-gate.ts`                                                    | Orchestrate preflight, isolated commands, candidate/final artifacts, bounded output, and readiness generation.                           |
| `scripts/lib/deliberation-full-gate-ledger.ts`                                         | Define the fixed manifest/result schema and fail-closed candidate/final validators.                                                      |
| `test/scripts/deliberation-full-gate.test.ts`                                          | Prove malformed, missing, duplicate, skipped, red, stale, contradictory, and wrong-authority rejection plus named `OR-23`.               |
| `extensions/deliberation/scripts/km-listener.cross-repo.ts`                            | Split aggregate owner-runtime assertions into exact `OR-07..OR-21` leaves without semantic weakening.                                    |
| `extensions/deliberation/scripts/km-spool-probe.py`                                    | Add only public-owner lifecycle/projection operations required by the named leaves; retain temporary SQLite and production-state guards. |
| `plans/checkpoints/fresh-peak-7129.rollout-readiness.md`                               | Replace manual/obsolete row accounting with generated canonical-artifact status and explicit live-readiness exclusions.                  |
| `plans/checkpoints/quick-brook-1900.{red-green-proof.md,full-gate.json,final-note.md}` | Preserve TDD, complete ledger, exact authority/commands, negative proof, artifact hash, elapsed result, and prerequisites.               |

The existing channel `OR-01..06` and package `OR-22` tests should not change unless reporter extraction proves their names or boundaries are not executable.

## TDD

Implement the TDD cycle per `skill:tdd`; record evidence in `plans/checkpoints/quick-brook-1900.red-green-proof.md`.

**Test file:** `test/scripts/deliberation-full-gate.test.ts`  
**Run command:** `OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test test/scripts/deliberation-full-gate.test.ts -t "rejects malformed or missing leaf input"`  
**Edit hint:** create the new test file before `scripts/deliberation-full-gate.ts`.

```ts
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { expect, it } from "vitest";

it("rejects malformed or missing leaf input", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "deliberation-gate-negative-"));
  try {
    const input = path.join(root, "malformed.json");
    const output = path.join(root, "result.json");
    fs.writeFileSync(input, JSON.stringify({ schemaVersion: 1, leaves: [] }));

    const result = spawnSync(
      process.execPath,
      [
        "--import",
        "tsx",
        "scripts/deliberation-full-gate.ts",
        "verify",
        "--input",
        input,
        "--output",
        output,
      ],
      { cwd: process.cwd(), encoding: "utf8" },
    );

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("missing leaf OR-01"); // RED: runner/verifier does not exist.
    expect(fs.existsSync(output)).toBe(false);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
```

| Test                                                      | RED                                                             | GREEN                                                                                         |
| --------------------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| malformed/missing input CLI                               | Missing runner cannot emit the required fail-closed diagnostic. | Nonzero, exact diagnostic, and no manufactured output artifact.                               |
| duplicate/skipped/red/stale/contradictory/wrong authority | No closed ledger validator exists.                              | Each malformed fixture is rejected deterministically.                                         |
| `OR-23 full-gate-integrity`                               | No candidate ledger or full-gate selector exists.               | A fresh 22-row candidate plus all support/provenance records produces one real Green `OR-23`. |

After unit GREEN, run the full canonical command exactly as recorded by the new package script. The final clean-checkout run, not reconstructed local totals, is acceptance evidence.

## Dependencies

- Read-only KM repository `/Users/michal/.openclaw`, KM root `/Users/michal/.openclaw/workspace/km-system`, exact revision `79bbc5c0426bc7be901d5199da11b21213bfa008`.
- Exact SHA-256 values: contract `5c63424b32a8db8370a1212ff7eb3878695afbb5d0fec3721fbab326908de44b`; fixtures `f26ca9afb804664cdcc03947262001d1d8441eab6d5ad9d92bb8533ae3c916b4`; runtime wire `a0e42e4fe54eedab6f9955e77f439a4e69c9614a60560ca46532ce0de9dbb528`; spool contracts `47587e405d3e6b7f433eb7d450bd02969546860ff0d6822ad7bea9ff2478a0ca`.
- The accepted KM checkout must be restored cleanly by its owner; the task may not edit its files or Git metadata. Any mismatch, including stale `extensions/deliberation/contracts/provenance.json`, blocks behavioral execution.
- The final gate needs a clean committed OpenClaw task checkout so its repository revision and command evidence are immutable. If commit authorization is unavailable, record that clean-run prerequisite rather than weakening the check.
