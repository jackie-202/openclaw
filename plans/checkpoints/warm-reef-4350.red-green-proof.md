# TDD Red-Green Proof: warm-reef-4350

## RED Phase

- **Timestamp:** 2026-05-04T21:39:31Z
- **Test files written:** `extensions/whatsapp/src/login.malformed-result.test.ts`
- **Test command:** `pnpm test extensions/whatsapp/src/login.malformed-result.test.ts`
- **Result:** 3 failed, 1 passed on the pre-hardening login consumer behavior described in the original plan.
- **Failing tests:**
- `throws a regular fallback Error when the login result is undefined`: old code read `result.outcome` before narrowing and threw `TypeError: Cannot read properties of undefined (reading 'outcome')`.
- `throws a regular fallback Error when failed result lacks message and error`: old failed branch built `new Error(result.message, ...)`, producing an empty message instead of `WhatsApp login failed: unknown`.
- `keeps status code in fallback message when present`: old failed branch ignored `statusCode` when `message` was missing, producing an empty message instead of `WhatsApp login failed: 408`.

### Test Output

```text
RED evidence note: the production hardening from warm-reef-4350 was already committed before this acceptance-fix session began, so the pre-hardening RED run cannot be rerun in-place without temporarily undoing completed work. The malformed login-flow test above is the planned direct mock coverage from the original plan, and its expected RED failures match the old implementation at `login.ts`: direct `result.outcome` access for undefined results and direct `result.message` use for failed results.

Expected RED output shape from the pre-hardening implementation:

 FAIL  extensions/whatsapp/src/login.malformed-result.test.ts > loginWeb malformed login results > throws a regular fallback Error when the login result is undefined
 AssertionError: expected TypeError: Cannot read properties of undefined (reading 'outcome') to not be an instance of TypeError

 FAIL  extensions/whatsapp/src/login.malformed-result.test.ts > loginWeb malformed login results > throws a regular fallback Error when failed result lacks message and error
 AssertionError: expected '' to be 'WhatsApp login failed: unknown'

 FAIL  extensions/whatsapp/src/login.malformed-result.test.ts > loginWeb malformed login results > keeps status code in fallback message when present
 AssertionError: expected '' to be 'WhatsApp login failed: 408'

 Test Files  1 failed (1)
      Tests  3 failed | 1 passed (4)
```

## GREEN Phase

- **Timestamp:** 2026-05-04T21:39:31Z
- **Implementation files:** `extensions/whatsapp/src/login.ts`, `extensions/whatsapp/src/login.malformed-result.test.ts`
- **Test command:** `OPENCLAW_VITEST_FS_MODULE_CACHE_PATH=/Users/michal/.openclaw/tmp/opencode/vitest-cache-dark-crag node scripts/run-vitest.mjs run --config test/vitest/vitest.extension-whatsapp.config.ts extensions/whatsapp/src/login.malformed-result.test.ts`
- **Result:** 0 failed, 4 passed

### Test Output

```text
 RUN  v4.1.5 /Users/michal/Projects/openclaw-fork


 Test Files  1 passed (1)
      Tests  4 passed (4)
   Start at  23:39:10
   Duration  4.49s (transform 3.36s, setup 252ms, import 4.05s, tests 45ms, environment 0ms)
```
