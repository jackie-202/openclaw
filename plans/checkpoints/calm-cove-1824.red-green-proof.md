# TDD Red-Green Proof: calm-cove-1824

<!-- proof-capture-metadata: {"version":1,"task_id":"calm-cove-1824","command":["env","OPENCLAW_VITEST_FS_MODULE_CACHE_PATH=/Users/michal/.openclaw/tmp/opencode/calm-cove-1824-contract-cache","OPENCLAW_VITEST_MAX_WORKERS=1","pnpm","test","extensions/deliberation/src/contract.test.ts","extensions/deliberation/src/config-compat.test.ts","--","--reporter=verbose"],"command_sha256":"70fbd3811eec4fb7fd093e8673c02fbb43c81a5a3e4151075d07696b7bea8bcd"} -->

## RED Phase

- **Timestamp:** 2026-08-22T14:51:36.237189+00:00
- **Test command:** `env OPENCLAW_VITEST_FS_MODULE_CACHE_PATH=/Users/michal/.openclaw/tmp/opencode/calm-cove-1824-contract-cache OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test extensions/deliberation/src/contract.test.ts extensions/deliberation/src/config-compat.test.ts -- --reporter=verbose`
- **Exit code:** 1

### Standard Output

```text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

 × |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > validates every fixture request and status-specific response 83ms
   → Cannot use 'in' operator to search for 'recordId' in null
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > requires the KM owner to adopt immutable pipeline and target evidence 1ms
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > matches the accepted provenance hashes 2ms
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > mirrors the exact canonical header, endpoints, and controls 0ms
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > mirrors the current KM endpoint and health contract 0ms
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > accepts the current closed projection fields 1ms
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > defines required source threads and generic structured targets across the lifecycle 1ms
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > keeps provider-specific destination evidence in the OpenClaw overlay 0ms
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > pins account-scoped Discord root, Slack root, and Slack reply intake vectors 1ms
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > pins the accepted KM owner revision and owner files 0ms

 Test Files  2 failed (2)
      Tests  1 failed | 9 passed (10)
   Start at  16:51:35
   Duration  496ms (transform 341ms, setup 185ms, import 125ms, tests 92ms, environment 0ms)

[ELIFECYCLE] Test failed. See above for more details.
```

### Standard Error

```text
$ node scripts/test-projects.mjs extensions/deliberation/src/contract.test.ts extensions/deliberation/src/config-compat.test.ts -- --reporter=verbose
[test] starting test/vitest/vitest.extensions.config.ts

⎯⎯⎯⎯⎯⎯ Failed Suites 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  |extensions| extensions/deliberation/src/config-compat.test.ts [ extensions/deliberation/src/config-compat.test.ts ]
Error: Cannot find module '../doctor-contract-api.js' imported from /Users/michal/Projects/openclaw-fork/extensions/deliberation/src/config-compat.test.ts
 ❯ extensions/deliberation/src/config-compat.test.ts:3:1
      1| import type { OpenClawConfig } from "openclaw/plugin-sdk/config-contra…
      2| import { describe, expect, it } from "vitest";
      3| import {
       | ^
      4|   DELIBERATION_LEGACY_CONFIG_CUTOFF,
      5|   legacyConfigRules,

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
Serialized Error: { code: 'ERR_MODULE_NOT_FOUND' }
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯


⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > validates every fixture request and status-specific response
TypeError: Cannot use 'in' operator to search for 'recordId' in null
 ❯ check_9a9abbf297e05076 node_modules/typebox/build/system/environment/evaluate.mjs:36:12
 ❯ check_21d306e70ad9439b node_modules/typebox/build/system/environment/evaluate.mjs:36:12
 ❯ check_8765365d237a0684 node_modules/typebox/build/system/environment/evaluate.mjs:36:12
 ❯ EvaluateResult.eval [as check] node_modules/typebox/build/system/environment/evaluate.mjs:36:12
 ❯ EvaluateResult.Check node_modules/typebox/build/schema/build.mjs:58:21
 ❯ Validator.Check node_modules/typebox/build/compile/validator.mjs:65:36
 ❯ src/plugins/schema-validator.ts:134:18
    132| function checkSchema(validate: TypeBoxValidator, value: unknown): Type…
    133|   return withPluginFormatSemantics(() => {
    134|     if (validate.Check(value)) {
       |                  ^
    135|       return null;
    136|     }
 ❯ withPluginFormatSemantics src/plugins/schema-validator.ts:123:12
 ❯ checkSchema src/plugins/schema-validator.ts:133:10
 ❯ validateJsonSchemaValue src/plugins/schema-validator.ts:396:18

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯

[test] failed 1 Vitest shard in 3.75s
```

## GREEN Phase

- **Timestamp:** 2026-08-22T15:01:39.742828+00:00
- **Test command:** `env OPENCLAW_VITEST_FS_MODULE_CACHE_PATH=/Users/michal/.openclaw/tmp/opencode/calm-cove-1824-contract-cache OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test extensions/deliberation/src/contract.test.ts extensions/deliberation/src/config-compat.test.ts -- --reporter=verbose`
- **Exit code:** 0

### Standard Output

```text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > validates every fixture request and status-specific response 401ms
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > requires the KM owner to adopt immutable pipeline and target evidence 1ms
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > matches the accepted provenance hashes 1ms
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > mirrors the exact canonical header, endpoints, and controls 0ms
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > mirrors the current KM endpoint and health contract 0ms
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > accepts the current closed projection fields 0ms
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > defines required source threads and generic structured targets across the lifecycle 1ms
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > keeps provider-specific destination evidence in the OpenClaw overlay 0ms
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > pins account-scoped Discord root, Slack root, and Slack reply intake vectors 1ms
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > pins the accepted KM owner revision and owner files 0ms
 ✓ |extensions| extensions/deliberation/src/config-compat.test.ts > deliberation doctor migration > diagnoses the tagged cutoff and writes operational config as canonical pipelines 3ms
 ✓ |extensions| extensions/deliberation/src/config-compat.test.ts > deliberation doctor migration > leaves canonical config unchanged and refuses mixed authority 0ms

 Test Files  2 passed (2)
      Tests  12 passed (12)
   Start at  17:01:38
   Duration  800ms (transform 133ms, setup 88ms, import 223ms, tests 411ms, environment 0ms)

```

### Standard Error

```text
$ node scripts/test-projects.mjs extensions/deliberation/src/contract.test.ts extensions/deliberation/src/config-compat.test.ts -- --reporter=verbose
[test] starting test/vitest/vitest.extensions.config.ts
[test] passed 1 Vitest shard in 3.55s
```
