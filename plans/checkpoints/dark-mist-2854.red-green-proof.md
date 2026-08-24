# TDD Red-Green Proof: dark-mist-2854

## RED Phase

- **Historical proof:** `plans/checkpoints/bold-reef-6539.red-green-proof.md`
- **Timestamp:** 2026-08-23T02:00:56.521443+00:00
- **Test command:** `env OPENCLAW_DELIBERATION_KM_ROOT=/Users/michal/Projects/openclaw-fork/tmp/bold-wave-3956-agent-workspace/workspace/km-system pnpm test:deliberation:km-integration`
- **Result:** exit code 1; 12 passed, 11 failed
- **Behavioral failure:** the real owner listener rejected positive intake with `400 SCHEMA_INVALID`, preventing singular intake and dependent lifecycle scenarios from reaching the isolated SQLite owner runtime.
- **Provenance note:** this follow-up links the genuine pre-implementation RED exactly as directed by its plan. It does not rerun or approve the forbidden historical checkout.

### Historical Test Output

```text
✖ real producer reaches the isolated KM listener and canonical spool
AssertionError [ERR_ASSERTION]: Expected values to be strictly deep-equal:
+ diagnostic: { code: 'SCHEMA_INVALID', stage: 'http', status: 400 }
+ handled: false
- duplicate: false
- handled: true

ℹ tests 23
ℹ pass 12
ℹ fail 11
```

### Authority Preflight

- `plans/checkpoints/wild-crag-3236.evidence.md` reports `command_lines_truncated` and contains no accepted full KM commit SHA, contract/fixture hashes, complete `OR-07` through `OR-21` assignment, or three exact composed E2E selectors.
- The available fresh owner evidence records revision `9ad21d9670eb3178cfcfe4c222b10b288b2b601a`, contract SHA-256 `01efb2b800b2aba98faf07bd5a830fd439f34db29e19f810825c145b9813eb9f`, and fixture SHA-256 `aff1538ae121a72a2d30d3075a4e6d2107a10be5a7aad13823aa99d5699c4a76`, but explicitly identifies that revision as burst-based and semantically divergent.
- The task plan requires rejecting current `main`, short/inferred identifiers, aggregate outcomes, and contradictory bundles. Therefore this is an authority setup blocker, not a new RED and not authorization to edit production files.

## Focused Repository Verification (Not GREEN)

- **Command:** `OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test extensions/deliberation/src/contract.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/final-adapter.test.ts extensions/deliberation/scripts/intake-producer.test.ts -- --reporter=verbose`
- **Result:** exit code 0; 4 files passed, 111 tests passed.
- **Scope:** repository-local mirrors, client, adapter, and producer only. This does not satisfy the owner-backed GREEN contract.

No `## GREEN Phase` is recorded because the identical owner-backed command cannot be run against a caller-approved immutable checkout. Adding one would fabricate the mandatory evidence.
