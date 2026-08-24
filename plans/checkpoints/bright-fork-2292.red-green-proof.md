# TDD Red-Green Proof: bright-fork-2292

<!-- proof-capture-metadata: {"version":1,"task_id":"bright-fork-2292","command":["env","OPENCLAW_VITEST_MAX_WORKERS=1","pnpm","test","test/scripts/deliberation-full-gate.test.ts","--","--reporter=verbose"],"command_sha256":"940053d82e87a69266a9a3e3f4ad07cb4111c8a38261ca7a5bbc624ad0a177ec"} -->

## RED Phase

- **Timestamp:** 2026-08-24T00:22:33.885341+00:00
- **Test command:** `env OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test test/scripts/deliberation-full-gate.test.ts -- --reporter=verbose`
- **Exit code:** 1

### Standard Output

```text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

 × |tooling| test/scripts/deliberation-full-gate.test.ts > accepts moving KM HEAD when all authoritative hashes match 36ms
   → Invalid input: expected "79bbc5c0426bc7be901d5199da11b21213bfa008"
 × |tooling| test/scripts/deliberation-full-gate.test.ts > rejects a live execution environment before running children 3ms
   → expected [Function] to throw error including 'live execution environment' but got '(0 , __vite_ssr_import_5__.assertNoLi…'
 × |tooling| test/scripts/deliberation-full-gate.test.ts > omits inherited provider credentials from the recorded child environment 0ms
   → buildSanitizedChildEnvironment is not a function
 ✓ |tooling| test/scripts/deliberation-full-gate.test.ts > verify fails closed for 'missing' input 162ms
 ✓ |tooling| test/scripts/deliberation-full-gate.test.ts > verify fails closed for 'duplicate' input 128ms
 × |tooling| test/scripts/deliberation-full-gate.test.ts > verify fails closed for 'stale' input 140ms
   → expected 'Invalid input: expected "79bbc5c0426b…' to contain 'candidate is stale'
 ✓ |tooling| test/scripts/deliberation-full-gate.test.ts > verify fails closed for 'malformed' input 118ms
 ✓ |tooling| test/scripts/deliberation-full-gate.test.ts > normalizes nested Vitest names to exact leaf titles 0ms
 ✓ |tooling| test/scripts/deliberation-full-gate.test.ts > keeps only passed JUnit testcase selectors 1ms
 × |tooling| test/scripts/deliberation-full-gate.test.ts > accepts only the exact fresh 22-row candidate 1ms
   → Invalid input: expected "79bbc5c0426bc7be901d5199da11b21213bfa008"
 × |tooling| test/scripts/deliberation-full-gate.test.ts > accepts only the exact 23-row final ledger bound to its candidate 1ms
   → Invalid input: expected "79bbc5c0426bc7be901d5199da11b21213bfa008"
 × |tooling| test/scripts/deliberation-full-gate.test.ts > rejects unknown fields 1ms
   → expected [Function] to throw error including 'Unrecognized key' but got 'Invalid input: expected "79bbc5c0426b…'
 ✓ |tooling| test/scripts/deliberation-full-gate.test.ts > rejects a final ledger whose candidate evidence changed 1ms
 × |tooling| test/scripts/deliberation-full-gate.test.ts > rejects duplicate reporter results 1ms
   → expected [Function] to throw error including 'exactly one reporter result' but got 'Invalid input: expected "79bbc5c0426b…'
 × |tooling| test/scripts/deliberation-full-gate.test.ts > allows expected skips in supporting suites without skipping an OR leaf 1ms
   → Invalid input: expected "79bbc5c0426bc7be901d5199da11b21213bfa008"
 ✓ |tooling| test/scripts/deliberation-full-gate.test.ts > rejects duplicate candidate evidence 0ms
 ✓ |tooling| test/scripts/deliberation-full-gate.test.ts > rejects skipped candidate evidence 1ms
 ✓ |tooling| test/scripts/deliberation-full-gate.test.ts > rejects red candidate evidence 1ms
 ✓ |tooling| test/scripts/deliberation-full-gate.test.ts > rejects contradictory candidate evidence 1ms
 ✓ |tooling| test/scripts/deliberation-full-gate.test.ts > rejects wrong authority candidate evidence 0ms
 × |tooling| test/scripts/deliberation-full-gate.test.ts > rejects stale candidate evidence 1ms
   → expected [Function] to throw error including 'candidate is stale' but got 'Invalid input: expected "79bbc5c0426b…'
 ✓ |tooling| test/scripts/deliberation-full-gate.test.ts > refuses to overwrite an existing ledger 1ms
 ↓ |tooling| test/scripts/deliberation-full-gate.test.ts > OR-23 full-gate-integrity

 Test Files  1 failed (1)
      Tests  10 failed | 12 passed | 1 skipped (23)
   Start at  02:22:32
   Duration  878ms (transform 150ms, setup 129ms, import 63ms, tests 600ms, environment 0ms)

[ELIFECYCLE] Test failed. See above for more details.
```

### Standard Error

```text
$ node scripts/test-projects.mjs test/scripts/deliberation-full-gate.test.ts -- --reporter=verbose
[test] starting test/vitest/vitest.tooling.config.ts

⎯⎯⎯⎯⎯⎯ Failed Tests 10 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  |tooling| test/scripts/deliberation-full-gate.test.ts > accepts moving KM HEAD when all authoritative hashes match
LedgerValidationError: Invalid input: expected "79bbc5c0426bc7be901d5199da11b21213bfa008"
 ❯ validateCandidateLedger scripts/lib/deliberation-full-gate-ledger.ts:423:11
    421|   const parsed = candidateSchema.safeParse(input);
    422|   if (!parsed.success) {
    423|     throw new LedgerValidationError(
       |           ^
    424|       "MALFORMED_LEDGER",
    425|       parsed.error.issues[0]?.message ?? "invalid ledger",
 ❯ test/scripts/deliberation-full-gate.test.ts:182:10

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
Serialized Error: { code: 'MALFORMED_LEDGER' }
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/10]⎯

 FAIL  |tooling| test/scripts/deliberation-full-gate.test.ts > rejects a live execution environment before running children
AssertionError: expected [Function] to throw error including 'live execution environment' but got '(0 , __vite_ssr_import_5__.assertNoLi…'

Expected: "live execution environment"
Received: "(0 , __vite_ssr_import_5__.assertNoLiveEnvironment) is not a function"

 ❯ test/scripts/deliberation-full-gate.test.ts:188:70
    186|
    187| it("rejects a live execution environment before running children", () …
    188|   expect(() => assertNoLiveEnvironment({ OPENCLAW_LIVE_TEST: "1" })).t…
       |                                                                      ^
    189|     "live execution environment",
    190|   );

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/10]⎯

 FAIL  |tooling| test/scripts/deliberation-full-gate.test.ts > omits inherited provider credentials from the recorded child environment
TypeError: buildSanitizedChildEnvironment is not a function
 ❯ test/scripts/deliberation-full-gate.test.ts:194:17
    192|
    193| it("omits inherited provider credentials from the recorded child envir…
    194|   const child = buildSanitizedChildEnvironment(
       |                 ^
    195|     {
    196|       PATH: "/usr/bin",

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/10]⎯

 FAIL  |tooling| test/scripts/deliberation-full-gate.test.ts > verify fails closed for 'stale' input
AssertionError: expected 'Invalid input: expected "79bbc5c0426b…' to contain 'candidate is stale'

- Expected
+ Received

- candidate is stale
+ Invalid input: expected "79bbc5c0426bc7be901d5199da11b21213bfa008"
+

 ❯ test/scripts/deliberation-full-gate.test.ts:272:27
    270|     expect(result.status).not.toBe(0);
    271|     expect(result.stderr.length).toBeLessThanOrEqual(4_000);
    272|     expect(result.stderr).toContain(diagnostic);
       |                           ^
    273|     expect(fs.existsSync(output)).toBe(false);
    274|   } finally {

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/10]⎯

 FAIL  |tooling| test/scripts/deliberation-full-gate.test.ts > accepts only the exact fresh 22-row candidate
LedgerValidationError: Invalid input: expected "79bbc5c0426bc7be901d5199da11b21213bfa008"
 ❯ validateCandidateLedger scripts/lib/deliberation-full-gate-ledger.ts:423:11
    421|   const parsed = candidateSchema.safeParse(input);
    422|   if (!parsed.success) {
    423|     throw new LedgerValidationError(
       |           ^
    424|       "MALFORMED_LEDGER",
    425|       parsed.error.issues[0]?.message ?? "invalid ledger",
 ❯ test/scripts/deliberation-full-gate.test.ts:319:10

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
Serialized Error: { code: 'MALFORMED_LEDGER' }
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/10]⎯

 FAIL  |tooling| test/scripts/deliberation-full-gate.test.ts > accepts only the exact 23-row final ledger bound to its candidate
LedgerValidationError: Invalid input: expected "79bbc5c0426bc7be901d5199da11b21213bfa008"
 ❯ validateFinalLedger scripts/lib/deliberation-full-gate-ledger.ts:463:11
    461|   const parsed = finalSchema.safeParse(input);
    462|   if (!parsed.success) {
    463|     throw new LedgerValidationError(
       |           ^
    464|       "MALFORMED_LEDGER",
    465|       parsed.error.issues[0]?.message ?? "invalid ledger",
 ❯ test/scripts/deliberation-full-gate.test.ts:323:10

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
Serialized Error: { code: 'MALFORMED_LEDGER' }
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/10]⎯

 FAIL  |tooling| test/scripts/deliberation-full-gate.test.ts > rejects unknown fields
AssertionError: expected [Function] to throw error including 'Unrecognized key' but got 'Invalid input: expected "79bbc5c0426b…'

Expected: "Unrecognized key"
Received: "Invalid input: expected "79bbc5c0426bc7be901d5199da11b21213bfa008""

 ❯ test/scripts/deliberation-full-gate.test.ts:329:63
    327|   const candidate = validCandidate() as CandidateLedger & { unexpected…
    328|   candidate.unexpected = true;
    329|   expect(() => validateCandidateLedger(candidate, context())).toThrow(…
       |                                                               ^
    330| });
    331|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/10]⎯

 FAIL  |tooling| test/scripts/deliberation-full-gate.test.ts > rejects duplicate reporter results
AssertionError: expected [Function] to throw error including 'exactly one reporter result' but got 'Invalid input: expected "79bbc5c0426b…'

Expected: "exactly one reporter result"
Received: "Invalid input: expected "79bbc5c0426bc7be901d5199da11b21213bfa008""

 ❯ test/scripts/deliberation-full-gate.test.ts:342:63
    340|   const command = candidate.commands.find(({ id }) => id === "km-integ…
    341|   command!.report!.selectors.push(DELIBERATION_LEAVES[6][1]);
    342|   expect(() => validateCandidateLedger(candidate, context())).toThrow(
       |                                                               ^
    343|     "exactly one reporter result",
    344|   );

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/10]⎯

 FAIL  |tooling| test/scripts/deliberation-full-gate.test.ts > allows expected skips in supporting suites without skipping an OR leaf
LedgerValidationError: Invalid input: expected "79bbc5c0426bc7be901d5199da11b21213bfa008"
 ❯ validateCandidateLedger scripts/lib/deliberation-full-gate-ledger.ts:423:11
    421|   const parsed = candidateSchema.safeParse(input);
    422|   if (!parsed.success) {
    423|     throw new LedgerValidationError(
       |           ^
    424|       "MALFORMED_LEDGER",
    425|       parsed.error.issues[0]?.message ?? "invalid ledger",
 ❯ test/scripts/deliberation-full-gate.test.ts:359:10

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
Serialized Error: { code: 'MALFORMED_LEDGER' }
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[9/10]⎯

 FAIL  |tooling| test/scripts/deliberation-full-gate.test.ts > rejects stale candidate evidence
AssertionError: expected [Function] to throw error including 'candidate is stale' but got 'Invalid input: expected "79bbc5c0426b…'

Expected: "candidate is stale"
Received: "Invalid input: expected "79bbc5c0426bc7be901d5199da11b21213bfa008""

 ❯ test/scripts/deliberation-full-gate.test.ts:380:5
    378|   expect(() =>
    379|     validateCandidateLedger(validCandidate(), context("2026-08-24T12:1…
    380|   ).toThrow("candidate is stale");
       |     ^
    381| });
    382|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[10/10]⎯

[test] failed 1 Vitest shard in 3.49s
```

## GREEN Phase

- **Timestamp:** 2026-08-24T00:24:40.494753+00:00
- **Test command:** `env OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test test/scripts/deliberation-full-gate.test.ts -- --reporter=verbose`
- **Exit code:** 0

### Standard Output

```text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

 ✓ |tooling| test/scripts/deliberation-full-gate.test.ts > accepts moving KM HEAD when all authoritative hashes match 21ms
 ✓ |tooling| test/scripts/deliberation-full-gate.test.ts > rejects a live execution environment before running children 0ms
 ✓ |tooling| test/scripts/deliberation-full-gate.test.ts > omits inherited provider credentials from the recorded child environment 0ms
 ✓ |tooling| test/scripts/deliberation-full-gate.test.ts > verify fails closed for 'missing' input 124ms
 ✓ |tooling| test/scripts/deliberation-full-gate.test.ts > verify fails closed for 'duplicate' input 126ms
 ✓ |tooling| test/scripts/deliberation-full-gate.test.ts > verify fails closed for 'stale' input 136ms
 ✓ |tooling| test/scripts/deliberation-full-gate.test.ts > verify fails closed for 'malformed' input 106ms
 ✓ |tooling| test/scripts/deliberation-full-gate.test.ts > normalizes nested Vitest names to exact leaf titles 0ms
 ✓ |tooling| test/scripts/deliberation-full-gate.test.ts > keeps only passed JUnit testcase selectors 1ms
 ✓ |tooling| test/scripts/deliberation-full-gate.test.ts > accepts only the exact fresh 22-row candidate 1ms
 ✓ |tooling| test/scripts/deliberation-full-gate.test.ts > accepts only the exact 23-row final ledger bound to its candidate 2ms
 ✓ |tooling| test/scripts/deliberation-full-gate.test.ts > rejects unknown fields 1ms
 ✓ |tooling| test/scripts/deliberation-full-gate.test.ts > rejects a final ledger whose candidate evidence changed 1ms
 ✓ |tooling| test/scripts/deliberation-full-gate.test.ts > rejects duplicate reporter results 1ms
 ✓ |tooling| test/scripts/deliberation-full-gate.test.ts > allows expected skips in supporting suites without skipping an OR leaf 1ms
 ✓ |tooling| test/scripts/deliberation-full-gate.test.ts > rejects duplicate candidate evidence 0ms
 ✓ |tooling| test/scripts/deliberation-full-gate.test.ts > rejects skipped candidate evidence 0ms
 ✓ |tooling| test/scripts/deliberation-full-gate.test.ts > rejects red candidate evidence 1ms
 ✓ |tooling| test/scripts/deliberation-full-gate.test.ts > rejects contradictory candidate evidence 0ms
 ✓ |tooling| test/scripts/deliberation-full-gate.test.ts > rejects wrong authority candidate evidence 0ms
 ✓ |tooling| test/scripts/deliberation-full-gate.test.ts > rejects stale candidate evidence 0ms
 ✓ |tooling| test/scripts/deliberation-full-gate.test.ts > refuses to overwrite an existing ledger 2ms
 ↓ |tooling| test/scripts/deliberation-full-gate.test.ts > OR-23 full-gate-integrity

 Test Files  1 passed (1)
      Tests  22 passed | 1 skipped (23)
   Start at  02:24:39
   Duration  707ms (transform 90ms, setup 66ms, import 47ms, tests 525ms, environment 0ms)

```

### Standard Error

```text
$ node scripts/test-projects.mjs test/scripts/deliberation-full-gate.test.ts -- --reporter=verbose
[test] starting test/vitest/vitest.tooling.config.ts
[test] passed 1 Vitest shard in 3.26s
```
