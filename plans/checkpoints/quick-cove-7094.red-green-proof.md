# RED/GREEN Proof: quick-cove-7094

## RED Phase

This acceptance repair begins after the parent implementation already exists, so a new RED would be fabricated. The genuine pre-production-code RED is preserved in `plans/checkpoints/cool-brook-7690.red-green-proof.md`. This follow-up reuses that historical failure provenance and will record fresh GREEN verification below.

The parent RED exercised `extensions/deliberation/src/km-client.test.ts` and demonstrated that the retired client used the delivery-specific reservation URL and retired protocol header instead of the canonical `/deliberation/v1/reservations` route and `X-Deliberation-Protocol-Version: 1` header.

## GREEN Phase

- **Test command:** `node scripts/run-vitest.mjs extensions/deliberation/src/km-client.test.ts --reporter=verbose`
- **Exit code:** 0
- **Result:** 1 test file passed; 6 tests passed.

```text
✓ KM contract parsing > uses the canonical protocol header and reservations route
✓ KM contract parsing > rejects health responses outside the accepted closed schema
✓ KM contract parsing > uses a credential already materialized by the secrets runtime
✓ KM contract parsing > uses only the six canonical endpoint paths
✓ KM contract parsing > rejects ready pagination outside the canonical query contract
✓ KM contract parsing > rejects malformed closed ready, reservation, and record responses

Test Files  1 passed (1)
Tests       6 passed (6)
```

Broader verification: `node scripts/run-vitest.mjs extensions/deliberation/src --reporter=verbose` passed 6 test files and 25 tests. `pnpm build`, `pnpm lint:docs docs/plugins/reference/deliberation.md`, `pnpm docs:check-mdx`, targeted `pnpm format:check`, and `git diff --cached --check` also passed. Final `.agents/skills/autoreview/scripts/autoreview --mode local` completed with no accepted or actionable findings.
