# Plan 2026-08-09: Add isolated Deliberation plugin to KM listener to spool integration harness

Use the existing fork-owned intake producer as the TypeScript entry point, add a fail-closed KM listener test mode, and drive both through one explicit local `node:test` command.

_Status: DRAFT_
_Created: 2026-08-09_

## Progress

- [x] Phase 0: Config + init
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Analysis

### Codebase Context

- `extensions/deliberation/scripts/intake-producer.ts` is the reusable real plugin-side boundary: it parses Discord-like facts, builds production config, calls `createInboundClaimHandler`, and uses the unmocked `createKmClient` Node HTTP transport.
- `extensions/deliberation/src/intake.ts` canonicalizes JS timestamps to six fractional digits (`.252Z` to `.252000Z`) before calling `client.intake`; `extensions/deliberation/src/km-client.ts` sends the exact JSON over authenticated loopback HTTP and parses the duplicate response.
- `extensions/deliberation/scripts/intake-producer.test.ts` currently substitutes a Node HTTP fake and proves duplicate/error diagnostics only; it does not execute KM schema or spool code.
- `extensions/deliberation/contracts/km-wire-v1.json` defines the closed intake body, auth/version headers, loopback listener, canonical endpoint, and duplicate response shape.
- `package.json` owns extension test orchestration (`test:extensions`) and extension test typechecking (`tsgo:test:extensions`); the new cross-repo command should be explicit so normal CI does not require the sibling checkout.
- Direct inspection of `/Users/michal/.openclaw/workspace/km-system` was blocked by tool external-directory policy despite the task's scope. Implementation must first read its scoped `AGENTS.md`, listener CLI/startup path, `lib/deliberation_*` spool APIs, and focused tests before choosing exact Python flags/assertion helpers.

### Relevant Documentation

- `docs/plugins/reference/deliberation.md` documents the producer as the same handler/client path used by intake and explicitly leaves canonical spool verification to an external listener harness.
- `docs/plugins/sdk-testing.md` requires focused SDK test imports and provides temporary-directory helpers; the cross-repo process test may stay under the plugin while avoiding core internals.
- No PlantUML diagram applies to this listener/spool seam.

### Knowledge Base

- `learnings/architecture/2026-07-29_acceptance-fix-plans-must-close-contract-gates-explicitly.md`: capture a genuine focused RED before implementation and fresh GREEN afterward.
- `learnings/architecture/2026-08-01_canonical-channel-identities-at-plugin-intake-boundaries.md`: use runtime-shaped Discord facts and assert the exact canonical source identity at the intake boundary.
- `learnings/architecture/2026-07-28_wire-protocol-versions-are-not-implementation-generations.md`: keep protocol v1 names as the current Deliberation v2 interoperability contract.
- Recall used local fallback because QMD collection `openclaw-fork-learnings` was absent; unrelated or empty extracted learnings were discarded.

## Available Skills

- `tdd`: implement the integration regression RED/GREEN and preserve proof.
- `validate-implementation`: audit production-path isolation, exact acceptance behavior, and docs/command alignment after implementation.
- `save-learning`: record cross-repository harness and safety lessons after completion.

## Solution

Add `extensions/deliberation/scripts/km-listener.cross-repo.ts` as an explicitly invoked `node:test` harness. It will create one OS temporary root, place a unique sentinel, credential file, and spool beneath it, start the real listener on `127.0.0.1:0`, parse a bounded readiness line containing the selected port, call `runIntakeProducer` twice, send one malformed authenticated request, and inspect the disposable spool through the KM library's public read API.

Add listener arguments `--spool-root` and `--integration-test-root` without changing the production default. Test mode must require explicit credential/spool paths, validate the sentinel and non-overlap against the resolved production root before constructing any SQLite-backed object, and run with an allowlisted child environment that contains no production-state or credential variables.

## Implementation

1. Read the KM checkout's scoped `AGENTS.md`, listener startup flow, `lib/deliberation_*` spool constructors/read APIs, and focused listener/wire/spool tests. Confirm the production root/database derivation, listener readiness/log behavior, and exact KM test command before editing; do not infer these from OpenClaw fixtures.
2. Implement the RED scaffold below with `skill:tdd`. Register `pnpm test:deliberation:km-integration` in root `package.json`; require `OPENCLAW_DELIBERATION_KM_ROOT`, validate that it contains the expected listener and library, and fail with an actionable `plugin:` diagnostic when missing.
3. Refactor `scripts/deliberation-v2-listener.py` so normal startup retains the canonical production default, while `--integration-test-root` requires an absolute explicit `--spool-root`, explicit credential file, and fixed-name sentinel under the resolved test root. Reject equal, ancestor, descendant, symlink-alias, or realpath-overlapping paths against `/Users/michal/.openclaw/workspace/km-system/state/deliberation-v2` before importing/constructing the spool or opening SQLite. Bind port `0` and emit one machine-readable readiness line after the HTTP server is listening.
4. Add focused KM guard tests that patch/spy on the spool constructor: production path, missing sentinel, sentinel outside the test root, symlink aliases, and inherited production env all fail before constructor invocation; ordinary production startup still resolves the existing canonical default. Snapshot production DB SHA-256, size, and mtime around the production-path case when the file exists, without parsing it.
5. Build the harness fixture with `mkdtemp`, `randomBytes`, a mode-`0600` credential file, sentinel, and explicit spool root/database. Spawn Python with an allowlisted environment (`PATH`, locale/temp/Python path only), await readiness with a timeout, and register cleanup immediately: terminate then kill on timeout, await child exit, remove only the resolved temp root, and report `cleanup:` failures. Add a deliberate callback failure case that proves the child is gone and temp root removed.
6. Invoke `runIntakeProducer` with message `1535928766595866624`, timestamp `2026-08-09T08:32:34.252Z`, fixed account/channel/sender/content facts, and only the generated credential. Assert first `{ handled: true, duplicate: false }`, second `{ handled: true, duplicate: true }`, and no Gateway/provider process or non-loopback endpoint is involved.
7. Use the KM spool library's existing public read/query API from a small test-only Python probe if no maintained KM CLI exposes the record. Assert one record/message, provider event ID, `v1:discord:<account>:<channel>` source target, sender/content/event type, exact `occurredAt` `2026-08-09T08:32:34.252000Z`, canonical UTC `receivedAt` (`Z` or exactly six fractional digits) bounded by the call, `READY_TO_SEND`, and duplicate count/response. Do not query guessed SQLite tables directly.
8. Send a raw authenticated loopback POST with one required intake field removed. Assert `400 SCHEMA_INVALID`, then re-read the spool and prove record/message counts and existing record bytes/fields are unchanged. Prefix failures by `plugin`, `HTTP/auth`, `wire/schema`, or `spool` according to the failed seam.
9. Document the command and `OPENCLAW_DELIBERATION_KM_ROOT` beside the extension. State that missing checkout is a hard actionable failure, only loopback is used, and all state is temporary. Run `skill:validate-implementation`, then preserve exact verification output in the final note.

## Files to Modify

| File                                                                              | Change                                                                                                                               |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `extensions/deliberation/scripts/km-listener.cross-repo.ts`                       | New `node:test` orchestrator, seam diagnostics, assertions, process lifecycle, and cleanup proof.                                    |
| `extensions/deliberation/scripts/km-spool-probe.py`                               | Test-only adapter over the KM spool's existing public read API, only if its maintained CLI cannot expose the required record fields. |
| `extensions/deliberation/README.md`                                               | Document the named local cross-repo command, required checkout variable, isolation guarantees, and failure behavior.                 |
| `package.json`                                                                    | Add `test:deliberation:km-integration` using `node --import tsx --test`; ordinary Vitest commands remain unchanged.                  |
| `/Users/michal/.openclaw/workspace/km-system/scripts/deliberation-v2-listener.py` | Add explicit isolated-test root/spool selection, sentinel/path guards, port-zero readiness, and preserve production defaults.        |
| `/Users/michal/.openclaw/workspace/km-system/lib/deliberation_*`                  | Change only the existing spool-root injection seam needed by the listener; no schema relaxation or second storage path.              |
| Existing focused KM listener/wire/spool test file(s), identified in step 1        | Add pre-open path/sentinel/env guard coverage and unchanged-production-default coverage.                                             |
| `plans/checkpoints/cool-vale-3921.red-green-proof.md`                             | Record genuine RED/GREEN commands and outcomes.                                                                                      |

## TDD

Implement the cycle with `skill:tdd` and record evidence in `plans/checkpoints/cool-vale-3921.red-green-proof.md`.

**Test file:** `extensions/deliberation/scripts/km-listener.cross-repo.ts`  
**Framework:** Node `node:test`, so the explicitly selected cross-repo suite is not discovered by ordinary Vitest extension CI.  
**Run command:** `OPENCLAW_DELIBERATION_KM_ROOT=/absolute/path/to/km-system pnpm test:deliberation:km-integration`  
**Edit hint:** Create the executable CLI-contract RED first, then expand the same file into the full harness.

```ts
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { test } from "node:test";
import { runIntakeProducer } from "./intake-producer.js";

test("KM listener exposes an explicit isolated spool mode", () => {
  assert.equal(typeof runIntakeProducer, "function");
  const kmRoot = process.env.OPENCLAW_DELIBERATION_KM_ROOT;
  assert.ok(kmRoot, "plugin: set OPENCLAW_DELIBERATION_KM_ROOT to the KM checkout");

  const result = spawnSync(
    "python3",
    [path.join(kmRoot, "scripts/deliberation-v2-listener.py"), "--help"],
    { encoding: "utf8", env: { PATH: process.env.PATH ?? "" } },
  );

  assert.equal(result.status, 0, "wire/schema: listener help failed");
  assert.match(result.stdout, /--spool-root/, "spool: explicit root is unavailable");
  assert.match(result.stdout, /--integration-test-root/, "spool: test guard is unavailable");
});
```

| Case                        | RED before implementation                                    | GREEN after implementation                                                                                                |
| --------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Isolated listener CLI       | `--spool-root` or `--integration-test-root` assertion fails. | Both explicit test-only controls are available; production default remains unchanged.                                     |
| `.252Z` real seam           | Listener cannot start safely against a temp spool.           | Real producer/listener/spool persists `.252000Z` and exact source/message facts.                                          |
| Replay and malformed body   | No composed proof exists.                                    | Replay returns duplicate with one record; `400 SCHEMA_INVALID` leaves spool unchanged.                                    |
| Production path and cleanup | No pre-open or failure-cleanup proof exists.                 | Constructor is not called, production fingerprint is unchanged, child/temp artifacts are gone on pass and forced failure. |

### Verification

1. `OPENCLAW_DELIBERATION_KM_ROOT=/absolute/path/to/km-system pnpm test:deliberation:km-integration`
2. `pnpm test extensions/deliberation -- --reporter=verbose`
3. `node scripts/run-tsgo.mjs -p extensions/deliberation/tsconfig.json`
4. Run the KM checkout's focused listener/wire/spool command discovered from its maintained test configuration in step 1; record the exact command and result rather than inventing a runner.
5. Run the integration command once with a nonexistent checkout and verify the actionable nonzero `plugin:` failure.

## Dependencies

- The implementation requires read/write access to the explicitly scoped KM checkout; this planning session could not inspect it because external-directory tooling denied access.
- Use only Python standard-library/process dependencies and existing OpenClaw tooling; do not add packages, production config, credentials, Gateway startup, Discord access, or non-loopback network calls.
