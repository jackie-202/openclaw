# TDD Red-Green Proof: swift-reef-8917

<!-- proof-capture-metadata: {"version":1,"task_id":"swift-reef-8917","command":["env","OPENCLAW_DELIBERATION_KM_ROOT=/Users/michal/.openclaw/workspace/km-system","pnpm","test:deliberation:km-integration"],"command_sha256":"dcf4e3fc2fcd7ab73e1956ebe580e25aece2e31fab58deb006e9da22e86c5cc5"} -->

## RED Phase

- **Timestamp:** 2026-08-14T12:55:29.171535+00:00
- **Test command:** `env OPENCLAW_DELIBERATION_KM_ROOT=/Users/michal/.openclaw/workspace/km-system pnpm test:deliberation:km-integration`
- **Exit code:** 1

### Standard Output

```text
✔ real producer reaches the isolated KM listener and canonical spool (532.972958ms)
▶ reviewed final delivery preserves source provenance and uses the durable target
  ✔ defaults final delivery to source A (257.385292ms)
  ✖ routes final delivery from source A to override B (123.890333ms)
✖ reviewed final delivery preserves source provenance and uses the durable target (381.916417ms)
✔ listener rejects the production spool before opening SQLite (119.255417ms)
✔ listener and temporary root are cleaned after callback failure (132.011542ms)
✔ temporary fixture paths cannot alias production state (0.405875ms)
ℹ tests 7
ℹ suites 0
ℹ pass 5
ℹ fail 2
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 4646.453666

✖ failing tests:

test at extensions/deliberation/scripts/km-listener.cross-repo.ts:3:5348
✖ routes final delivery from source A to override B (123.890333ms)
  AssertionError [ERR_ASSERTION]: routing: intake was not handled: {"stage":"http","status":400,"code":"SCHEMA_INVALID"}

  false !== true

      at TestContext.<anonymous> (/Users/michal/Projects/openclaw-fork/extensions/deliberation/scripts/km-listener.cross-repo.ts:491:16)
      at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
      at async Test.run (node:internal/test_runner/test:1125:7)
      at async TestContext.<anonymous> (/Users/michal/Projects/openclaw-fork/extensions/deliberation/scripts/km-listener.cross-repo.ts:451:5)
      at async Test.run (node:internal/test_runner/test:1125:7)
      at async Test.processPendingSubtests (node:internal/test_runner/test:787:7) {
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

## Historical RED Provenance

`plans/checkpoints/quick-crag-3748.evidence.md` contains no pre-implementation default-route listener RED. Its only available RED is the producer-schema run, and the evidence artifact reports `command_lines_truncated`. This follow-up does not reconstruct or misrepresent that missing history.

The fresh RED above is the preserved real-listener route failing at override intake with `400 SCHEMA_INVALID`; the fresh GREEN proves default and override delivery through KM revision `e8e5055ab9`, contract SHA-256 `44520bcb2add69dc0b02c2651f1bcecdf26f735cb27f9c80d76e51f3b4ab0ac2`, and fixture SHA-256 `8020a929a837b21b6a25a7b31f0985e0df50ecef16a5003390bab187780c74b2`. Every outbound send was captured by the fake provider; no Discord call or credential was used.

## GREEN Phase

- **Timestamp:** 2026-08-14T12:59:59.590067+00:00
- **Test command:** `env OPENCLAW_DELIBERATION_KM_ROOT=/Users/michal/.openclaw/workspace/km-system pnpm test:deliberation:km-integration`
- **Exit code:** 0

### Standard Output

```text
✔ real producer reaches the isolated KM listener and canonical spool (215.489916ms)
▶ reviewed final delivery preserves source provenance and uses the durable target
  ✔ defaults final delivery to source A (218.855291ms)
  ✔ routes final delivery from source A to override B (395.303209ms)
✔ reviewed final delivery preserves source provenance and uses the durable target (614.563ms)
✔ listener rejects the production spool before opening SQLite (104.097084ms)
✔ listener and temporary root are cleaned after callback failure (107.847417ms)
✔ temporary fixture paths cannot alias production state (1.56475ms)
ℹ tests 7
ℹ suites 0
ℹ pass 7
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3434.036083
```

### Standard Error

```text
$ node --import tsx --test extensions/deliberation/scripts/km-listener.cross-repo.ts
```
