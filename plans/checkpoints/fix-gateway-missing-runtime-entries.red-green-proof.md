# TDD Red-Green Proof: fix-gateway-missing-runtime-entries

<!-- proof-capture-metadata: {"version":1,"task_id":"fix-gateway-missing-runtime-entries","command":["pnpm","test","src/infra/tsdown-config.test.ts","--","--reporter=verbose"],"command_sha256":"f7d7002e77632ba32d250d7b623f7a770550252ef5471502d017d6d04b75918f"} -->

## RED Phase

- **Timestamp:** 2026-08-07T12:03:37.468456+00:00
- **Test command:** `pnpm test src/infra/tsdown-config.test.ts -- --reporter=verbose`
- **Exit code:** 1

### Standard Output

```text

[1m[30m[46m RUN [49m[39m[22m [36mv4.1.7 [39m[90m/Users/michal/Projects/openclaw-fork[39m

 [32m✓[39m [30m[42m infra [49m[39m src/infra/tsdown-config.test.ts[2m > [22mtsdown config[2m > [22mkeeps core, plugin runtime, plugin-sdk, bundled root plugins, and bundled hooks in one dist graph[32m 60[2mms[22m[39m
 [32m✓[39m [30m[42m infra [49m[39m src/infra/tsdown-config.test.ts[2m > [22mtsdown config[2m > [22mkeeps root-package-excluded external plugins out of the root dist graph[32m 1[2mms[22m[39m
 [32m✓[39m [30m[42m infra [49m[39m src/infra/tsdown-config.test.ts[2m > [22mtsdown config[2m > [22mkeeps gateway lifecycle lazy runtime behind one stable dist entry[32m 0[2mms[22m[39m
 [31m×[39m [30m[42m infra [49m[39m src/infra/tsdown-config.test.ts[2m > [22mtsdown config[2m > [22mkeeps session archive and outbound delivery lazy imports in the dist graph[32m 3[2mms[22m[39m
[31m   → expected undefined to be 'src/gateway/session-archive.runtime.ts' // Object.is equality[39m
 [32m✓[39m [30m[42m infra [49m[39m src/infra/tsdown-config.test.ts[2m > [22mtsdown config[2m > [22mkeeps reply dispatcher lazy runtime behind one root stable dist entry[32m 0[2mms[22m[39m
 [32m✓[39m [30m[42m infra [49m[39m src/infra/tsdown-config.test.ts[2m > [22mtsdown config[2m > [22mkeeps gateway shutdown hook runner behind one stable dist entry[32m 0[2mms[22m[39m
 [32m✓[39m [30m[42m infra [49m[39m src/infra/tsdown-config.test.ts[2m > [22mtsdown config[2m > [22mkeeps PI model discovery synthetic auth refs behind one stable runtime dist entry[32m 0[2mms[22m[39m
 [32m✓[39m [30m[42m infra [49m[39m src/infra/tsdown-config.test.ts[2m > [22mtsdown config[2m > [22mkeeps Telegram ingress worker behind one root stable dist entry[32m 0[2mms[22m[39m
 [32m✓[39m [30m[42m infra [49m[39m src/infra/tsdown-config.test.ts[2m > [22mtsdown config[2m > [22mroutes gateway run-loop lifecycle imports through the stable runtime boundary[32m 0[2mms[22m[39m
 [32m✓[39m [30m[42m infra [49m[39m src/infra/tsdown-config.test.ts[2m > [22mtsdown config[2m > [22mkeeps bundled plugins out of separate dependency-staging graphs[32m 0[2mms[22m[39m
 [32m✓[39m [30m[42m infra [49m[39m src/infra/tsdown-config.test.ts[2m > [22mtsdown config[2m > [22mdoes not emit plugin-sdk or hooks from a separate dist graph[32m 0[2mms[22m[39m
 [32m✓[39m [30m[42m infra [49m[39m src/infra/tsdown-config.test.ts[2m > [22mtsdown config[2m > [22mexternalizes known heavy native and declaration-fragile dependencies[32m 0[2mms[22m[39m
 [32m✓[39m [30m[42m infra [49m[39m src/infra/tsdown-config.test.ts[2m > [22mtsdown config[2m > [22malways bundles plugin SDK package-local runtime dependencies[32m 0[2mms[22m[39m
 [32m✓[39m [30m[42m infra [49m[39m src/infra/tsdown-config.test.ts[2m > [22mtsdown config[2m > [22msuppresses unresolved imports from extension source[32m 0[2mms[22m[39m
 [32m✓[39m [30m[42m infra [49m[39m src/infra/tsdown-config.test.ts[2m > [22mtsdown config[2m > [22mkeeps unresolved imports outside extension source visible[32m 0[2mms[22m[39m
 [32m✓[39m [30m[42m infra [49m[39m src/infra/tsdown-config.test.ts[2m > [22mtsdown config[2m > [22msuppresses rolldown-plugin-dts CommonJS dts warnings from bundled zod locales[32m 0[2mms[22m[39m
 [32m✓[39m [30m[42m infra [49m[39m src/infra/tsdown-config.test.ts[2m > [22mtsdown config[2m > [22mkeeps other rolldown-plugin-dts warnings visible[32m 0[2mms[22m[39m

[2m Test Files [22m [1m[31m1 failed[39m[22m[90m (1)[39m
[2m      Tests [22m [1m[31m1 failed[39m[22m[2m | [22m[1m[32m16 passed[39m[22m[90m (17)[39m
[2m   Start at [22m 14:03:36
[2m   Duration [22m 648ms[2m (transform 460ms, setup 249ms, import 226ms, tests 67ms, environment 0ms)[22m

[ELIFECYCLE] Test failed. See above for more details.
```

### Standard Error

```text
$ node scripts/test-projects.mjs src/infra/tsdown-config.test.ts -- --reporter=verbose
[test] starting test/vitest/vitest.infra.config.ts

[31m⎯⎯⎯⎯⎯⎯⎯[39m[1m[41m Failed Tests 1 [49m[22m[31m⎯⎯⎯⎯⎯⎯⎯[39m

[41m[1m FAIL [22m[49m [30m[42m infra [49m[39m src/infra/tsdown-config.test.ts[2m > [22mtsdown config[2m > [22mkeeps session archive and outbound delivery lazy imports in the dist graph
[31m[1mAssertionError[22m: expected undefined to be 'src/gateway/session-archive.runtime.ts' // Object.is equality[39m

[32m- Expected:[39m
"src/gateway/session-archive.runtime.ts"

[31m+ Received:[39m
undefined

[36m [2m❯[22m src/infra/tsdown-config.test.ts:[2m149:64[22m[39m
    [90m147|[39m     [35mconst[39m distGraph [33m=[39m [34mrequireUnifiedDistGraph[39m()[33m;[39m
    [90m148|[39m
    [90m149|[39m     [34mexpect[39m([34mentrySources[39m(distGraph)[[32m"session-archive.runtime"[39m])[33m.[39m[34mtoBe[39m(
    [90m   |[39m                                                                [31m^[39m
    [90m150|[39m       [32m"src/gateway/session-archive.runtime.ts"[39m[33m,[39m
    [90m151|[39m     )[33m;[39m

[31m[2m⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯[22m[39m

[test] failed 1 Vitest shard in 6.49s
```

## GREEN Phase

- **Timestamp:** 2026-08-07T12:03:54.296954+00:00
- **Test command:** `pnpm test src/infra/tsdown-config.test.ts -- --reporter=verbose`
- **Exit code:** 0

### Standard Output

```text

[1m[30m[46m RUN [49m[39m[22m [36mv4.1.7 [39m[90m/Users/michal/Projects/openclaw-fork[39m

 [32m✓[39m [30m[42m infra [49m[39m src/infra/tsdown-config.test.ts[2m > [22mtsdown config[2m > [22mkeeps core, plugin runtime, plugin-sdk, bundled root plugins, and bundled hooks in one dist graph[32m 20[2mms[22m[39m
 [32m✓[39m [30m[42m infra [49m[39m src/infra/tsdown-config.test.ts[2m > [22mtsdown config[2m > [22mkeeps root-package-excluded external plugins out of the root dist graph[32m 1[2mms[22m[39m
 [32m✓[39m [30m[42m infra [49m[39m src/infra/tsdown-config.test.ts[2m > [22mtsdown config[2m > [22mkeeps gateway lifecycle lazy runtime behind one stable dist entry[32m 0[2mms[22m[39m
 [32m✓[39m [30m[42m infra [49m[39m src/infra/tsdown-config.test.ts[2m > [22mtsdown config[2m > [22mkeeps session archive and outbound delivery lazy imports in the dist graph[32m 0[2mms[22m[39m
 [32m✓[39m [30m[42m infra [49m[39m src/infra/tsdown-config.test.ts[2m > [22mtsdown config[2m > [22mkeeps reply dispatcher lazy runtime behind one root stable dist entry[32m 0[2mms[22m[39m
 [32m✓[39m [30m[42m infra [49m[39m src/infra/tsdown-config.test.ts[2m > [22mtsdown config[2m > [22mkeeps gateway shutdown hook runner behind one stable dist entry[32m 0[2mms[22m[39m
 [32m✓[39m [30m[42m infra [49m[39m src/infra/tsdown-config.test.ts[2m > [22mtsdown config[2m > [22mkeeps PI model discovery synthetic auth refs behind one stable runtime dist entry[32m 0[2mms[22m[39m
 [32m✓[39m [30m[42m infra [49m[39m src/infra/tsdown-config.test.ts[2m > [22mtsdown config[2m > [22mkeeps Telegram ingress worker behind one root stable dist entry[32m 0[2mms[22m[39m
 [32m✓[39m [30m[42m infra [49m[39m src/infra/tsdown-config.test.ts[2m > [22mtsdown config[2m > [22mroutes gateway run-loop lifecycle imports through the stable runtime boundary[32m 0[2mms[22m[39m
 [32m✓[39m [30m[42m infra [49m[39m src/infra/tsdown-config.test.ts[2m > [22mtsdown config[2m > [22mkeeps bundled plugins out of separate dependency-staging graphs[32m 0[2mms[22m[39m
 [32m✓[39m [30m[42m infra [49m[39m src/infra/tsdown-config.test.ts[2m > [22mtsdown config[2m > [22mdoes not emit plugin-sdk or hooks from a separate dist graph[32m 0[2mms[22m[39m
 [32m✓[39m [30m[42m infra [49m[39m src/infra/tsdown-config.test.ts[2m > [22mtsdown config[2m > [22mexternalizes known heavy native and declaration-fragile dependencies[32m 0[2mms[22m[39m
 [32m✓[39m [30m[42m infra [49m[39m src/infra/tsdown-config.test.ts[2m > [22mtsdown config[2m > [22malways bundles plugin SDK package-local runtime dependencies[32m 0[2mms[22m[39m
 [32m✓[39m [30m[42m infra [49m[39m src/infra/tsdown-config.test.ts[2m > [22mtsdown config[2m > [22msuppresses unresolved imports from extension source[32m 0[2mms[22m[39m
 [32m✓[39m [30m[42m infra [49m[39m src/infra/tsdown-config.test.ts[2m > [22mtsdown config[2m > [22mkeeps unresolved imports outside extension source visible[32m 0[2mms[22m[39m
 [32m✓[39m [30m[42m infra [49m[39m src/infra/tsdown-config.test.ts[2m > [22mtsdown config[2m > [22msuppresses rolldown-plugin-dts CommonJS dts warnings from bundled zod locales[32m 0[2mms[22m[39m
 [32m✓[39m [30m[42m infra [49m[39m src/infra/tsdown-config.test.ts[2m > [22mtsdown config[2m > [22mkeeps other rolldown-plugin-dts warnings visible[32m 0[2mms[22m[39m

[2m Test Files [22m [1m[32m1 passed[39m[22m[90m (1)[39m
[2m      Tests [22m [1m[32m17 passed[39m[22m[90m (17)[39m
[2m   Start at [22m 14:03:53
[2m   Duration [22m 338ms[2m (transform 116ms, setup 87ms, import 130ms, tests 24ms, environment 0ms)[22m

```

### Standard Error

```text
$ node scripts/test-projects.mjs src/infra/tsdown-config.test.ts -- --reporter=verbose
[test] starting test/vitest/vitest.infra.config.ts
[test] passed 1 Vitest shard in 3.01s
```
