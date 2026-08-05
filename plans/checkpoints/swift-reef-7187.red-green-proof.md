# TDD Red-Green Proof: swift-reef-7187

<!-- proof-capture-metadata: {"version":1,"task_id":"swift-reef-7187","command":["pnpm","test","extensions/deliberation/src/km-client.test.ts","extensions/deliberation/src/contract.test.ts","--","--reporter=verbose"],"command_sha256":"ee6a19fdf0a8bd19191339c02fa62cb72af76344a595a500e1cdced9067cfa26"} -->

## RED Phase

- **Historical provenance:** The parent proof at `plans/checkpoints/swift-peak-4405.red-green-proof.md` records the original authenticated listener HTTP 400 for Node global `fetch` with `sec-fetch-mode: cors`. This follow-up independently reproduced that compatibility failure with the focused repository loopback test below before changing the mirrored contract.
- **Timestamp:** 2026-08-02T20:44:11.758663+00:00
- **Test command:** `pnpm test extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/contract.test.ts -- --reporter=verbose`
- **Exit code:** 1

### Standard Output

```text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > matches the accepted provenance hashes 27ms
 × |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > mirrors the exact canonical header, endpoints, and controls 3ms
   → expected [ 'Host', 'Content-Length', …(3) ] to include 'Sec-Fetch-Mode'
 × |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > accepts transport metadata emitted by the supported Node fetch 28ms
   → promise rejected "Error: KM request failed with status 400" instead of resolving
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > uses the canonical protocol header and reservations route 1ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects health responses outside the accepted closed schema 1ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > uses a credential already materialized by the secrets runtime 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > uses only the six canonical endpoint paths 2ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects ready pagination outside the canonical query contract 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed closed ready, reservation, and record responses 2ms

 Test Files  2 failed (2)
      Tests  2 failed | 7 passed (9)
   Start at  22:44:11
   Duration  400ms (transform 266ms, setup 180ms, import 230ms, tests 66ms, environment 0ms)

[ELIFECYCLE] Test failed. See above for more details.
```

### Standard Error

```text
$ node scripts/test-projects.mjs extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/contract.test.ts -- --reporter=verbose
[test] queued behind the local heavy-check lock held by test, pid 82295, cwd /Users/michal/Projects/openclaw-fork...
[test] starting test/vitest/vitest.extensions.config.ts

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > mirrors the exact canonical header, endpoints, and controls
AssertionError: expected [ 'Host', 'Content-Length', …(3) ] to include 'Sec-Fetch-Mode'
 ❯ extensions/deliberation/src/contract.test.ts:35:39
     33|       "Content-Type",
     34|     ]);
     35|     expect(contract.transportHeaders).toContain("Sec-Fetch-Mode");
       |                                       ^
     36|     expect([...contract.applicationHeaders, ...contract.transportHeade…
     37|       "X-Deliberation-Unknown",

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > accepts transport metadata emitted by the supported Node fetch
AssertionError: promise rejected "Error: KM request failed with status 400" instead of resolving
 ❯ extensions/deliberation/src/km-client.test.ts:68:35
     66|       });
     67|
     68|       await expect(client.health()).resolves.toMatchObject({ protocolV…
       |                                   ^
     69|     } finally {
     70|       await new Promise<void>((resolve, reject) =>

Caused by: Error: KM request failed with status 400
 ❯ request extensions/deliberation/src/km-client.ts:455:13
 ❯ Object.health extensions/deliberation/src/km-client.ts:462:21
 ❯ extensions/deliberation/src/km-client.test.ts:68:7

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯

[test] failed 1 Vitest shard in 12.24s
```

## GREEN Phase

- **Timestamp:** 2026-08-02T20:46:20.551816+00:00
- **Test command:** `pnpm test extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/contract.test.ts -- --reporter=verbose`
- **Exit code:** 0

### Standard Output

```text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > matches the accepted provenance hashes 32ms
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > mirrors the exact canonical header, endpoints, and controls 1ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > accepts transport metadata emitted by the supported Node fetch 23ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > uses the canonical protocol header and reservations route 1ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects health responses outside the accepted closed schema 1ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > uses a credential already materialized by the secrets runtime 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > uses only the six canonical endpoint paths 1ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects ready pagination outside the canonical query contract 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed closed ready, reservation, and record responses 1ms

 Test Files  2 passed (2)
      Tests  9 passed (9)
   Start at  22:46:20
   Duration  346ms (transform 208ms, setup 154ms, import 184ms, tests 64ms, environment 0ms)

```

### Standard Error

```text
$ node scripts/test-projects.mjs extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/contract.test.ts -- --reporter=verbose
[test] starting test/vitest/vitest.extensions.config.ts
[test] passed 1 Vitest shard in 2.91s
```

## External Listener Verification

- **Command:** `pnpm exec tsx .tmp-km-health.ts`
- **Result:** The credential-redacted authenticated Node global-fetch probe still received `KM request failed with status 400` from the running listener.
- **Authority blocker:** The listener runs from `/Users/michal/.openclaw/workspace/km-system`, but this session and a delegated implementation agent were denied external-directory access. The focused GREEN above proves the proposed mirror classification only; it is not production listener GREEN evidence.
