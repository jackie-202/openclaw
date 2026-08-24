# TDD Red-Green Proof: bold-wave-3956

<!-- proof-capture-metadata: {"version":1,"task_id":"bold-wave-3956","command":["env","OPENCLAW_DELIBERATION_KM_ROOT=/Users/michal/Projects/openclaw-fork/tmp/bold-wave-3956-agent-workspace/workspace/km-system","pnpm","test:deliberation:km-integration"],"command_sha256":"ee210540c82d055ca624a0575046f1e64da15d3b8a741402c66ddd05305f5175"} -->

## Evidence Status

- **Approved owner repository:** `https://github.com/jackie-202/agent-workspace.git`
- **Immutable revision:** `872436aad992826b5d501597e265e8c2b94e6f78`
- **KM root:** `workspace/km-system`
- **Owner contract SHA-256:** `d3c0771d5c1d63fecc18cb93e381136fa8af3054c96cbcdebb95b7785a46dc5f`
- **Owner fixtures SHA-256:** `a399132355c792e3861a3e8e2d8e2542e0ccb517231e817acf8afe3c54cca4b7`
- **Checkout gate:** both owner files are tracked and clean at the immutable revision; the listener and isolated `.venv/bin/python3` are present.
- **Historical parent evidence:** `plans/checkpoints/calm-cove-1824.evidence.md` contains no complete integration RED. `plans/checkpoints/swift-reef-8917.red-green-proof.md` preserves an older genuine same-command RED, but it predates the expanded harness and is context only.
- **TDD status:** the first `proof-capture.py green` invocation refused to run because no task-local RED existed. No RED was reconstructed. The hash-matched runtime then exposed the genuine failure captured below, so this task now has valid current-harness RED but no GREEN.

## Blocking Contract Divergence

The pinned owner runtime accepts only the closed intake fields in `workspace/km-system/lib/deliberation_wire.py`: it does not accept `pipelineId` or intake `deliveryTarget`. Its pinned `deliveryTarget` schema also has no `mode`. OpenClaw's current producer and mirrored schema require all three facts, so every positive intake setup reaches the real listener and fails with `400 SCHEMA_INVALID`.

KM first added `pipelineId` after the pinned revision, in commits that also changed both owner contract hashes. Those later contracts remain semantically different from the OpenClaw mirror. Stripping fields, patching the approved checkout, or refreshing provenance to those hashes would not prove the required contract and is intentionally not done.

**GREEN is blocked pending an approved KM owner revision that both matches an accepted owner contract and implements the current `pipelineId` plus mode-bearing `deliveryTarget` runtime contract. External/live convergence remains unknown.**

## RED Phase

- **Timestamp:** 2026-08-22T15:42:37.743672+00:00
- **Test command:** `env OPENCLAW_DELIBERATION_KM_ROOT=/Users/michal/Projects/openclaw-fork/tmp/bold-wave-3956-agent-workspace/workspace/km-system pnpm test:deliberation:km-integration`
- **Exit code:** 1

### Standard Output

```text
✖ real producer reaches the isolated KM listener and canonical spool (237.654458ms)
▶ named intake and protocol negatives reach their runtime rejection
  ✔ auth.missing (379.37075ms)
  ✔ auth.invalid (354.853333ms)
  ✔ version.unsupported (352.613708ms)
  ✔ schema.unknown-field (379.161208ms)
  ✔ intake.debounce-override-rejected (353.1725ms)
  ✖ intake.conflicting-replay (188.614625ms)
  ✔ intake.provider-mismatch (342.507875ms)
  ✔ intake.account-missing (351.309042ms)
  ✔ intake.synthetic-impersonation (353.752791ms)
  ✔ intake.historical-reopen-rejected (349.246333ms)
✖ named intake and protocol negatives reach their runtime rejection (3405.802375ms)
▶ named lifecycle conflicts preserve durable state without provider calls
  ✖ reserve.cas-conflict (188.415334ms)
  ✖ reserve.lease-conflict (200.8445ms)
  ✖ invoke.conflict (190.22175ms)
  ✖ complete.conflict (188.5165ms)
✖ named lifecycle conflicts preserve durable state without provider calls (768.475291ms)
▶ reviewed final delivery preserves source provenance and uses the durable target
  ✖ defaults final delivery to source A (191.243875ms)
  ✖ routes final delivery from source A to override B (188.613667ms)
✖ reviewed final delivery preserves source provenance and uses the durable target (380.30475ms)
✔ listener rejects the production spool before opening SQLite (180.647791ms)
✔ listener and temporary root are cleaned after callback failure (179.665334ms)
✔ temporary fixture paths cannot alias production state (0.538167ms)
ℹ tests 23
ℹ suites 0
ℹ pass 12
ℹ fail 11
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 7720.315875

✖ failing tests:

test at extensions/deliberation/scripts/km-listener.cross-repo.ts:3:4803
✖ real producer reaches the isolated KM listener and canonical spool (237.654458ms)
  AssertionError [ERR_ASSERTION]: Expected values to be strictly deep-equal:
  + actual - expected

    {
  +   diagnostic: {
  +     code: 'SCHEMA_INVALID',
  +     stage: 'http',
  +     status: 400
  +   },
  +   handled: false,
  -   duplicate: false,
  -   handled: true,
      providerEventId: '1535928766595866624'
    }

      at TestContext.<anonymous> (/Users/michal/Projects/openclaw-fork/extensions/deliberation/scripts/km-listener.cross-repo.ts:514:12)
      at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
      at async Test.run (node:internal/test_runner/test:1208:7)
      at async startSubtestAfterBootstrap (node:internal/test_runner/harness:385:3) {
    generatedMessage: true,
    code: 'ERR_ASSERTION',
    actual: { handled: false, providerEventId: '1535928766595866624', diagnostic: { stage: 'http', status: 400, code: 'SCHEMA_INVALID' } },
    expected: { handled: true, providerEventId: '1535928766595866624', duplicate: false },
    operator: 'deepStrictEqual',
    diff: 'simple'
  }

test at extensions/deliberation/scripts/km-listener.cross-repo.ts:3:7993
✖ intake.conflicting-replay (188.614625ms)
  AssertionError [ERR_ASSERTION]: intake.conflicting-replay: setup intake failed

  400 !== 201

      at TestContext.<anonymous> (/Users/michal/Projects/openclaw-fork/extensions/deliberation/scripts/km-listener.cross-repo.ts:604:18)
      at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
      at async Test.run (node:internal/test_runner/test:1208:7)
      at async TestContext.<anonymous> (/Users/michal/Projects/openclaw-fork/extensions/deliberation/scripts/km-listener.cross-repo.ts:598:5)
      at async Test.run (node:internal/test_runner/test:1208:7)
      at async Test.processPendingSubtests (node:internal/test_runner/test:831:7) {
    generatedMessage: false,
    code: 'ERR_ASSERTION',
    actual: 400,
    expected: 201,
    operator: 'strictEqual',
    diff: 'simple'
  }

test at extensions/deliberation/scripts/km-listener.cross-repo.ts:3:8929
✖ reserve.cas-conflict (188.415334ms)
  AssertionError [ERR_ASSERTION]: fixture setup: intake was not handled

  false !== true

      at prepareReservation (/Users/michal/Projects/openclaw-fork/extensions/deliberation/scripts/km-listener.cross-repo.ts:441:10)
      at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
      at async TestContext.<anonymous> (/Users/michal/Projects/openclaw-fork/extensions/deliberation/scripts/km-listener.cross-repo.ts:634:47)
      at async Test.run (node:internal/test_runner/test:1208:7)
      at async TestContext.<anonymous> (/Users/michal/Projects/openclaw-fork/extensions/deliberation/scripts/km-listener.cross-repo.ts:630:5)
      at async Test.run (node:internal/test_runner/test:1208:7)
      at async Test.processPendingSubtests (node:internal/test_runner/test:831:7) {
    generatedMessage: false,
    code: 'ERR_ASSERTION',
    actual: false,
    expected: true,
    operator: 'strictEqual',
    diff: 'simple'
  }

test at extensions/deliberation/scripts/km-listener.cross-repo.ts:3:8929
✖ reserve.lease-conflict (200.8445ms)
  AssertionError [ERR_ASSERTION]: fixture setup: intake was not handled

  false !== true

      at prepareReservation (/Users/michal/Projects/openclaw-fork/extensions/deliberation/scripts/km-listener.cross-repo.ts:441:10)
      at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
      at async TestContext.<anonymous> (/Users/michal/Projects/openclaw-fork/extensions/deliberation/scripts/km-listener.cross-repo.ts:634:47)
      at async Test.run (node:internal/test_runner/test:1208:7)
      at async TestContext.<anonymous> (/Users/michal/Projects/openclaw-fork/extensions/deliberation/scripts/km-listener.cross-repo.ts:630:5)
      at async Test.run (node:internal/test_runner/test:1208:7)
      at async Test.processPendingSubtests (node:internal/test_runner/test:831:7) {
    generatedMessage: false,
    code: 'ERR_ASSERTION',
    actual: false,
    expected: true,
    operator: 'strictEqual',
    diff: 'simple'
  }

test at extensions/deliberation/scripts/km-listener.cross-repo.ts:3:8929
✖ invoke.conflict (190.22175ms)
  AssertionError [ERR_ASSERTION]: fixture setup: intake was not handled

  false !== true

      at prepareReservation (/Users/michal/Projects/openclaw-fork/extensions/deliberation/scripts/km-listener.cross-repo.ts:441:10)
      at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
      at async TestContext.<anonymous> (/Users/michal/Projects/openclaw-fork/extensions/deliberation/scripts/km-listener.cross-repo.ts:634:47)
      at async Test.run (node:internal/test_runner/test:1208:7)
      at async TestContext.<anonymous> (/Users/michal/Projects/openclaw-fork/extensions/deliberation/scripts/km-listener.cross-repo.ts:630:5)
      at async Test.run (node:internal/test_runner/test:1208:7)
      at async Test.processPendingSubtests (node:internal/test_runner/test:831:7) {
    generatedMessage: false,
    code: 'ERR_ASSERTION',
    actual: false,
    expected: true,
    operator: 'strictEqual',
    diff: 'simple'
  }

test at extensions/deliberation/scripts/km-listener.cross-repo.ts:3:8929
✖ complete.conflict (188.5165ms)
  AssertionError [ERR_ASSERTION]: fixture setup: intake was not handled

  false !== true

      at prepareReservation (/Users/michal/Projects/openclaw-fork/extensions/deliberation/scripts/km-listener.cross-repo.ts:441:10)
      at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
      at async TestContext.<anonymous> (/Users/michal/Projects/openclaw-fork/extensions/deliberation/scripts/km-listener.cross-repo.ts:634:47)
      at async Test.run (node:internal/test_runner/test:1208:7)
      at async TestContext.<anonymous> (/Users/michal/Projects/openclaw-fork/extensions/deliberation/scripts/km-listener.cross-repo.ts:630:5)
      at async Test.run (node:internal/test_runner/test:1208:7)
      at async Test.processPendingSubtests (node:internal/test_runner/test:831:7) {
    generatedMessage: false,
    code: 'ERR_ASSERTION',
    actual: false,
    expected: true,
    operator: 'strictEqual',
    diff: 'simple'
  }

test at extensions/deliberation/scripts/km-listener.cross-repo.ts:3:11614
✖ defaults final delivery to source A (191.243875ms)
  AssertionError [ERR_ASSERTION]: routing: intake was not handled: {"stage":"http","status":400,"code":"SCHEMA_INVALID"}

  false !== true

      at TestContext.<anonymous> (/Users/michal/Projects/openclaw-fork/extensions/deliberation/scripts/km-listener.cross-repo.ts:813:16)
      at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
      at async Test.run (node:internal/test_runner/test:1208:7)
      at async TestContext.<anonymous> (/Users/michal/Projects/openclaw-fork/extensions/deliberation/scripts/km-listener.cross-repo.ts:730:5)
      at async Test.run (node:internal/test_runner/test:1208:7)
      at async Test.processPendingSubtests (node:internal/test_runner/test:831:7) {
    generatedMessage: false,
    code: 'ERR_ASSERTION',
    actual: false,
    expected: true,
    operator: 'strictEqual',
    diff: 'simple'
  }

test at extensions/deliberation/scripts/km-listener.cross-repo.ts:3:11614
✖ routes final delivery from source A to override B (188.613667ms)
  AssertionError [ERR_ASSERTION]: routing: intake was not handled: {"stage":"http","status":400,"code":"SCHEMA_INVALID"}

  false !== true

      at TestContext.<anonymous> (/Users/michal/Projects/openclaw-fork/extensions/deliberation/scripts/km-listener.cross-repo.ts:813:16)
      at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
      at async Test.run (node:internal/test_runner/test:1208:7)
      at async TestContext.<anonymous> (/Users/michal/Projects/openclaw-fork/extensions/deliberation/scripts/km-listener.cross-repo.ts:730:5)
      at async Test.run (node:internal/test_runner/test:1208:7)
      at async Test.processPendingSubtests (node:internal/test_runner/test:831:7) {
    generatedMessage: false,
    code: 'ERR_ASSERTION',
    actual: false,
    expected: true,
    operator: 'strictEqual',
    diff: 'simple'
  }
[ELIFECYCLE] Command failed with exit code 1.
```

### Standard Error

```text
$ node --import tsx --test extensions/deliberation/scripts/km-listener.cross-repo.ts
```
