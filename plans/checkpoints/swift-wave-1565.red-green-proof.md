# TDD Red-Green Proof: swift-wave-1565

<!-- proof-capture-metadata: {"version":1,"task_id":"swift-wave-1565","command":["pnpm","test","test/scripts/bundled-plugin-build-entries.test.ts","--","--reporter=verbose"],"command_sha256":"90c8c2f1b1fdeda37224dd9a71f9362d441771433b0065f4cd7c25cf91741652"} -->

## RED Phase

- **Timestamp:** 2026-09-07T06:33:18.806439+00:00
- **Test command:** `pnpm test test/scripts/bundled-plugin-build-entries.test.ts -- --reporter=verbose`
- **Exit code:** 1

### Standard Output

```text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

 ✓ |tooling| test/scripts/bundled-plugin-build-entries.test.ts > bundled plugin build entries > includes manifest-less runtime core support packages in dist build entries 83ms
 ✓ |tooling| test/scripts/bundled-plugin-build-entries.test.ts > bundled plugin build entries > keeps the Matrix packaged runtime shim in bundled plugin build entries 32ms
 × |tooling| test/scripts/bundled-plugin-build-entries.test.ts > bundled plugin build entries > omits the retired Deliberation doctor compatibility sidecar 66ms
   → expected { …(871) } to not have property "extensions/deliberation/doctor-contract-api"
 ✓ |tooling| test/scripts/bundled-plugin-build-entries.test.ts > bundled plugin build entries > filters bundled plugin build entries for bounded script lanes 30ms
 ✓ |tooling| test/scripts/bundled-plugin-build-entries.test.ts > bundled plugin build entries > rejects unknown bounded bundled plugin build ids 31ms
 ✓ |tooling| test/scripts/bundled-plugin-build-entries.test.ts > bundled plugin build entries > keeps the Telegram ingress worker out of bundled plugin public-surface entries 30ms
 ✓ |tooling| test/scripts/bundled-plugin-build-entries.test.ts > bundled plugin build entries > keeps top-level bundled plugin test helpers out of public-surface entries 30ms
 ✓ |tooling| test/scripts/bundled-plugin-build-entries.test.ts > bundled plugin build entries > discovers repo plugin build entries without directory scans 100ms
 ✓ |tooling| test/scripts/bundled-plugin-build-entries.test.ts > bundled plugin build entries > packs runtime core support packages without requiring plugin manifests 48ms
 ✓ |tooling| test/scripts/bundled-plugin-build-entries.test.ts > bundled plugin build entries > packs the Matrix packaged runtime shim 63ms
 ✓ |tooling| test/scripts/bundled-plugin-build-entries.test.ts > bundled plugin build entries > keeps private QA bundles out of required npm pack artifacts 34ms
 ✓ |tooling| test/scripts/bundled-plugin-build-entries.test.ts > bundled plugin build entries > keeps explicitly downloadable plugins out of bundled package artifacts 61ms
 ✓ |tooling| test/scripts/bundled-plugin-build-entries.test.ts > bundled plugin build entries > keeps external-only providers out of bundled dist entries 74ms
 ✓ |tooling| test/scripts/bundled-plugin-build-entries.test.ts > bundled plugin build entries > keeps externalized runtime-dependency plugins out of bundled dist entries 69ms
 ✓ |tooling| test/scripts/bundled-plugin-build-entries.test.ts > bundled plugin build entries > keeps bundled channel secret contracts on packed top-level sidecars 38ms
 ✓ |tooling| test/scripts/bundled-plugin-build-entries.test.ts > bundled plugin build entries > keeps bundled channel entry metadata on packed top-level sidecars 6ms

 Test Files  1 failed (1)
      Tests  1 failed | 15 passed (16)
   Start at  08:33:17
   Duration  1.08s (transform 211ms, setup 151ms, import 30ms, tests 796ms, environment 0ms)

[ELIFECYCLE] Test failed. See above for more details.
```

### Standard Error

```text
$ node scripts/test-projects.mjs test/scripts/bundled-plugin-build-entries.test.ts -- --reporter=verbose
[test] starting test/vitest/vitest.tooling.config.ts

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  |tooling| test/scripts/bundled-plugin-build-entries.test.ts > bundled plugin build entries > omits the retired Deliberation doctor compatibility sidecar
AssertionError: expected { …(871) } to not have property "extensions/deliberation/doctor-contract-api"

- Expected:
undefined

+ Received:
"extensions/deliberation/doctor-contract-api.ts"

 ❯ test/scripts/bundled-plugin-build-entries.test.ts:75:25
     73|     const artifacts = listBundledPluginPackArtifacts();
     74|
     75|     expect(entries).not.toHaveProperty("extensions/deliberation/doctor…
       |                         ^
     76|     expect(artifacts).not.toContain("dist/extensions/deliberation/doct…
     77|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯

[test] failed 1 Vitest shard in 4.19s
```

## GREEN Phase

- **Timestamp:** 2026-09-07T06:36:08.981895+00:00
- **Test command:** `pnpm test test/scripts/bundled-plugin-build-entries.test.ts -- --reporter=verbose`
- **Exit code:** 0

### Standard Output

```text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

 ✓ |tooling| test/scripts/bundled-plugin-build-entries.test.ts > bundled plugin build entries > includes manifest-less runtime core support packages in dist build entries 57ms
 ✓ |tooling| test/scripts/bundled-plugin-build-entries.test.ts > bundled plugin build entries > keeps the Matrix packaged runtime shim in bundled plugin build entries 30ms
 ✓ |tooling| test/scripts/bundled-plugin-build-entries.test.ts > bundled plugin build entries > omits the retired Deliberation doctor compatibility sidecar 54ms
 ✓ |tooling| test/scripts/bundled-plugin-build-entries.test.ts > bundled plugin build entries > filters bundled plugin build entries for bounded script lanes 25ms
 ✓ |tooling| test/scripts/bundled-plugin-build-entries.test.ts > bundled plugin build entries > rejects unknown bounded bundled plugin build ids 26ms
 ✓ |tooling| test/scripts/bundled-plugin-build-entries.test.ts > bundled plugin build entries > keeps the Telegram ingress worker out of bundled plugin public-surface entries 26ms
 ✓ |tooling| test/scripts/bundled-plugin-build-entries.test.ts > bundled plugin build entries > keeps top-level bundled plugin test helpers out of public-surface entries 26ms
 ✓ |tooling| test/scripts/bundled-plugin-build-entries.test.ts > bundled plugin build entries > discovers repo plugin build entries without directory scans 90ms
 ✓ |tooling| test/scripts/bundled-plugin-build-entries.test.ts > bundled plugin build entries > packs runtime core support packages without requiring plugin manifests 27ms
 ✓ |tooling| test/scripts/bundled-plugin-build-entries.test.ts > bundled plugin build entries > packs the Matrix packaged runtime shim 26ms
 ✓ |tooling| test/scripts/bundled-plugin-build-entries.test.ts > bundled plugin build entries > keeps private QA bundles out of required npm pack artifacts 26ms
 ✓ |tooling| test/scripts/bundled-plugin-build-entries.test.ts > bundled plugin build entries > keeps explicitly downloadable plugins out of bundled package artifacts 53ms
 ✓ |tooling| test/scripts/bundled-plugin-build-entries.test.ts > bundled plugin build entries > keeps external-only providers out of bundled dist entries 53ms
 ✓ |tooling| test/scripts/bundled-plugin-build-entries.test.ts > bundled plugin build entries > keeps externalized runtime-dependency plugins out of bundled dist entries 55ms
 ✓ |tooling| test/scripts/bundled-plugin-build-entries.test.ts > bundled plugin build entries > keeps bundled channel secret contracts on packed top-level sidecars 32ms
 ✓ |tooling| test/scripts/bundled-plugin-build-entries.test.ts > bundled plugin build entries > keeps bundled channel entry metadata on packed top-level sidecars 2ms

 Test Files  1 passed (1)
      Tests  16 passed (16)
   Start at  08:36:08
   Duration  756ms (transform 78ms, setup 63ms, import 18ms, tests 611ms, environment 0ms)

```

### Standard Error

```text
$ node scripts/test-projects.mjs test/scripts/bundled-plugin-build-entries.test.ts -- --reporter=verbose
[test] starting test/vitest/vitest.tooling.config.ts
[test] passed 1 Vitest shard in 3.28s
```
