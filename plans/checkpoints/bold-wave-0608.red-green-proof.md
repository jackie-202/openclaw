# TDD Red-Green Proof: bold-wave-0608

## RED Phase

- **Historical proof:** `plans/checkpoints/bold-reef-6539.red-green-proof.md`
- **Parent proof:** `plans/checkpoints/dark-mist-2854.red-green-proof.md`
- **Timestamp:** 2026-08-23T02:00:56.521443+00:00
- **Historical command:** `env OPENCLAW_DELIBERATION_KM_ROOT=/Users/michal/Projects/openclaw-fork/tmp/bold-wave-3956-agent-workspace/workspace/km-system pnpm test:deliberation:km-integration`
- **Result:** exit code 1; 12 passed, 11 failed.
- **Behavioral failure:** the real owner listener rejected positive intake with `400 SCHEMA_INVALID`, preventing singular intake and dependent lifecycle scenarios from reaching the isolated SQLite owner runtime.
- **Provenance:** this acceptance fix reuses the plan-approved genuine pre-implementation RED. It does not rerun or approve the forbidden historical checkout and does not manufacture a new RED after preserved implementation work.

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

## Focused Repository Verification (Not GREEN)

- **Command:** `OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test extensions/deliberation/src/contract.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/final-adapter.test.ts extensions/deliberation/scripts/intake-producer.test.ts -- --reporter=verbose`
- **Result:** exit code 0; 4 files passed, 111 tests passed.
- **Scope:** repository-local contract mirrors, KM client, final adapter, and intake producer. This does not satisfy the owner-backed GREEN contract because the immutable authority bundle and approved checkout remain unavailable.

## Supporting Quality Verification (Not GREEN)

- `pnpm build`: exit code 0.
- `node scripts/run-oxlint.mjs extensions/deliberation/scripts/km-listener.cross-repo.ts extensions/deliberation/scripts/intake-producer.ts extensions/deliberation/src/km-client.ts extensions/deliberation/src/final-adapter.ts`: exit code 0.
- `pnpm format:check -- extensions/deliberation/scripts/km-listener.cross-repo.ts extensions/deliberation/scripts/intake-producer.ts extensions/deliberation/src/km-client.ts extensions/deliberation/src/final-adapter.ts plans/checkpoints/bold-wave-0608.checkpoint.md plans/checkpoints/bold-wave-0608.red-green-proof.md`: initially found formatting drift only in the new checkpoint; `pnpm format:fix -- plans/checkpoints/bold-wave-0608.checkpoint.md` corrected it. A clean rerun is required after this evidence update.
- `git diff --check -- plans/checkpoints/bold-wave-0608.checkpoint.md plans/checkpoints/bold-wave-0608.red-green-proof.md plans/checkpoints/bold-wave-0608.evidence.md`: exit code 0 before this evidence update; a clean rerun is required.
