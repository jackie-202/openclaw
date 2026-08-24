# Plan 2026-08-23: Close owner-runtime convergence gates

Close only the four missing acceptance gates while preserving the completed lint repair and fail-closed rollout decision.

## Analysis

- `extensions/deliberation/scripts/km-listener.cross-repo.ts` starts the real owner listener, verifies pinned owner-file hashes, isolates SQLite, and exercises producer/client/adapter behavior, but currently exposes aggregate tests rather than `OR-01` through `OR-23` leaves.
- `plans/checkpoints/fresh-peak-7129.rollout-readiness.md` already has all 23 rows and separate `IMPLEMENTATION NOT READY` / `LIVE ACTIVATION NOT APPROVED` conclusions. Update and supply this artifact; do not replace it with a summary.
- `plans/checkpoints/fresh-peak-7129.red-green-proof.md` proves only lint remediation. It cannot satisfy behavioral TDD.
- `extensions/deliberation/doctor-contract-api.ts` and `test/scripts/deliberation-doctor-package.e2e.test.ts` exist, but the source artifact is untracked. Because bundled plugin inventory uses `git ls-files`, the passing build omitted the doctor artifact.
- `plans/checkpoints/cool-wave-8905.checkpoint.md` confirms the available owner mirror is not semantically converged; `plans/checkpoints/warm-fork-8061.checkpoint.md` confirms no authenticated canonical runner was available. Neither setup failure is behavioral RED.
- Preserve all unrelated dirty-worktree changes. Do not edit contracts or owner behavior until an approved immutable KM checkout is readable and its revision/hashes match provenance.

## Available Skills

- `task-evidence`: search the parent lineage for genuine owner-listener behavioral RED and exact command provenance.
- `tdd`: capture an authentic owner-runtime cycle and `plans/checkpoints/bold-reef-6539.red-green-proof.md`.
- `openclaw-testing`: choose the focused, package, build, and changed-lane gates.
- `crabbox`: obtain remote broad-gate proof with provider and run ID.
- `acceptance`: check the final artifacts against findings 001-004.
- `autoreview`: run the mandatory fresh code review after changes.
- `save-learning`: save at least one learning as the final action.

## Implementation

1. Preflight `OPENCLAW_DELIBERATION_KM_ROOT`: require a clean, readable, owner-approved immutable checkout; record its commit and hashes for every file checked by `requireKmRoot()`. Compare the listener schema, SQLite lifecycle, replay, invocation, completion, and recovery behavior with `extensions/deliberation/contracts/`. Stop with `NOT READY` on provenance or semantic drift; do not synchronize hashes alone.
2. Use `task-evidence` to inspect parent/predecessor proof for an authentic failing owner-listener scenario run. If found, copy only its command, failure, source artifact, and immutable owner revision into the new proof. If none exists, do not fabricate retroactive RED: add the first genuinely missing `OR-*` leaf before its behavior change and capture RED only if the approved runtime actually fails it; otherwise record that TDD acceptance remains blocked.
3. Expose exactly 23 reporter leaves named `OR-01` through `OR-23` across the owning suites. Put durable intake/lifecycle rows in the approved-listener/isolated-SQLite harness, silence/rollback rows in loader-backed Discord/Slack tests, provider-attempt rows through the final adapter, and migration rows in the installed-package CLI test. Reuse current fixtures and assertions; keep auth/schema/spool/cleanup tests as supporting results, not matrix rows.
4. Assert per-row invariants rather than reporter totals: one provider event maps to one durable record; duplicate/rejected/conflicting evidence cannot mutate SQLite or make another native call; `pipelineId`, source identity, effective target, attempt ID, and receipt remain exact across ready/reserve/invoke/complete/restart; unknown invocation never retries; `NOT_SENT` recovery passes only if the inspected owner contract explicitly authorizes it.
5. Make `extensions/deliberation/doctor-contract-api.ts` an intended tracked artifact before building. Extend the existing package E2E names to `OR-21` and `OR-22` only if needed, preserving migration idempotence, refusal immutability, canonical validation, and packaged plugin discovery.
6. Capture fresh GREEN with the exact behavioral command represented by the authentic RED. Then run the focused owner command, relevant Vitest suites, package E2E against the current tarball, build-inventory check, full build, scoped lint/format, changed lanes, and remote changed gate. Submit the registered canonical `cd ~/Projects/openclaw-fork && npm test` through the caller-owned runner and retain its passing reference; never relabel local output as canonical.
7. Update `plans/checkpoints/fresh-peak-7129.rollout-readiness.md` in place. For each row, record exact test name, command/run reference, result, boundary, owner commit, and owner-file hashes. Report supporting totals separately and retain independent `IMPLEMENTATION READY|NOT READY` and `LIVE ACTIVATION NOT APPROVED` conclusions. Any missing row, package artifact, canonical reference, or owner proof forces `NOT READY`.
8. Update `plans/checkpoints/bold-reef-6539.checkpoint.md` with links to the behavioral proof, canonical/remote runs, package evidence, and rollout report. Run `validate-implementation`, then fresh `autoreview` until no accepted actionable findings remain.
9. Invoke `save-learning` last, save at least one file, and make no later edits.

## Files To Modify

| File                                                                | Change                                                                                   |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `extensions/deliberation/scripts/km-listener.cross-repo.ts`         | Name the listener/SQLite-owned `OR-*` leaves and add durable assertions                  |
| `extensions/discord/src/monitor/message-handler.queue.test.ts`      | Fill only missing Discord owner-path rows                                                |
| `extensions/discord/src/monitor/message-handler.process.test.ts`    | Fill only missing Discord silence/rollback rows                                          |
| `extensions/slack/src/monitor/message-handler.deliberation.test.ts` | Fill only missing Slack owner-path rows                                                  |
| `test/scripts/deliberation-doctor-package.e2e.test.ts`              | Name/package-prove `OR-21` and `OR-22` if current coverage is not directly mappable      |
| `extensions/deliberation/doctor-contract-api.ts`                    | Track the preserved artifact; change content only if real package proof exposes a defect |
| `extensions/deliberation/contracts/*.json`                          | Update only from directly inspected approved owner behavior                              |
| `plans/checkpoints/bold-reef-6539.red-green-proof.md`               | Authentic behavioral RED provenance and identical-command GREEN                          |
| `plans/checkpoints/fresh-peak-7129.rollout-readiness.md`            | Reviewable passing 23-row mapping and separate rollout verdicts                          |
| `plans/checkpoints/bold-reef-6539.checkpoint.md`                    | Final evidence index and gate references                                                 |

Production runtime files are conditional: change them only when an authentic owner-boundary RED identifies a task-owned defect. Do not change live config, credentials, allowlists, deployments, or Gateway state.

## TDD

Implement the cycle with `skill:tdd`. Historical genuine RED is preferred; setup/provenance failure and the existing lint proof are invalid substitutes.

**Test file:** `extensions/deliberation/scripts/km-listener.cross-repo.ts`  
**Run command:** `env OPENCLAW_DELIBERATION_KM_ROOT="<approved-immutable-km-root>" pnpm test:deliberation:km-integration`  
**Proof:** `plans/checkpoints/bold-reef-6539.red-green-proof.md`

Append within the existing module so its private fixture/probe helpers remain available:

```ts
void test("OR-11 two same-window provider events create two durable records", async () => {
  const fixture = await createListenerFixture();
  try {
    const makeInput = (messageId: string, content: string) =>
      ({
        endpoint: fixture.context.endpoint,
        pipelines: [
          {
            id: "discord-source",
            source: { channel: "discord", accountId: "default", target: "source" },
          },
        ],
        processingSource: { channel: "discord", accountId: "default", target: "processing" },
        event: {
          provider: "discord",
          eventType: "message",
          eventKind: "user_request",
          conversationId: "source",
          accountId: "default",
          messageId,
          senderId: "sender-1",
          timestamp: OCCURRED_AT,
          content,
        },
        context: {
          channelId: "discord",
          accountId: "default",
          conversationId: "source",
          messageId,
          senderId: "sender-1",
        },
      }) as const;
    const env = { OPENCLAW_DELIBERATION_KM_CREDENTIAL: fixture.context.credential };

    assert.equal((await runIntakeProducer(makeInput("event-1", "first"), env)).handled, true);
    assert.equal((await runIntakeProducer(makeInput("event-2", "second"), env)).handled, true);

    const records = readSpool(fixture);
    assert.equal(records.length, 2); // RED only if approved owner still aggregates the events.
    assert.deepEqual(
      records
        .flatMap((record) => record.messages as Array<Record<string, unknown>>)
        .map((message) => message.providerEventId)
        .sort(),
      ["event-1", "event-2"],
    );
  } finally {
    await disposeFixture(fixture);
  }
});
```

| Evidence            | RED                                                                              | GREEN                                                             |
| ------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `OR-11`             | Approved owner aggregates two distinct events or persists fewer than two records | Two distinct events persist as exactly two records                |
| Matrix completeness | One or more named `OR-01`...`OR-23` leaves are absent/failing                    | Exactly 23 mapped leaves pass; supporting tests are separate      |
| Historical proof    | No authentic behavioral failure with immutable owner provenance                  | Historical RED is linked and the identical command passes freshly |

## Verification

1. `env OPENCLAW_DELIBERATION_KM_ROOT="<approved-immutable-km-root>" pnpm test:deliberation:km-integration`
2. `OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test extensions/deliberation extensions/discord/src/monitor/message-handler.queue.test.ts extensions/discord/src/monitor/message-handler.process.test.ts extensions/slack/src/monitor/message-handler.deliberation.test.ts test/scripts/deliberation-doctor-package.e2e.test.ts -- --reporter=verbose`
3. Confirm `collectBundledPluginBuildEntries()` includes `extensions/deliberation/doctor-contract-api.ts`; run `pnpm build`, create the current package tarball with the repository packaging workflow, set `OPENCLAW_CURRENT_PACKAGE_TGZ`, and rerun `test/scripts/deliberation-doctor-package.e2e.test.ts`.
4. Run scoped Oxlint for touched extension/core files, repository format checks for touched files, and `git diff --check`.
5. Run `pnpm changed:lanes --json`, then the selected remote `pnpm check:changed` gate via `skill:openclaw-testing` / `skill:crabbox`; record provider and run ID.
6. Obtain a passing caller-owned reference for `cd ~/Projects/openclaw-fork && npm test`.
7. Verify the readiness report contains 23 passing rows, owner provenance, package/build references, canonical reference, and both independent conclusions.

## Dependencies

- Approved immutable KM owner checkout with singular intake and closed uncertain-delivery semantics.
- Authentic historical behavioral RED, or a real pre-change failure observed against that approved checkout.
- Authenticated caller-owned canonical runner and remote Testbox/Crabbox provider.
- Isolated temporary listener, SQLite, package, config, HOME, and state roots.

---

_Status: DRAFT_
