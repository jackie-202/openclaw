# TDD Red-Green Proof: quick-wave-8748

<!-- proof-capture-metadata: {"version":1,"task_id":"quick-wave-8748","command":["pnpm","test","extensions/deliberation/src/plugin.test.ts"],"command_sha256":"39279a047f9291dd823b244cba921b0f058ee0436ecd1796e191fcde97ba2e18"} -->

## RED Phase

- **Timestamp:** 2026-08-24T20:07:55.413958+00:00
- **Test command:** `pnpm test extensions/deliberation/src/plugin.test.ts`
- **Exit code:** 1

### Standard Output

```text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

 ❯ |extensions| extensions/deliberation/src/plugin.test.ts (20 tests | 16 failed) 35ms
     × registers fail-closed hooks, read-only KM health, and one final sender 25ms
     × delivers one ready item through the exact Discord account and stops its timer 2ms
     × delivers one Slack-origin item through the exact Slack account and thread 0ms
     × delivers one Discord-origin item through the exact Slack account and thread 0ms
     × delivers an explicit Slack root without manufacturing a thread 0ms
     × delivers a Discord source anchor through the channel-owned anchor operation 0ms
     × fails an oversized result without sending multiple Discord messages 0ms
     × fails a Slack destination whose explicit account is not configured 1ms
     × leaves Slack delivery unresolved when the provider returns no platform message id 0ms
     × leaves a thrown provider outcome unresolved 0ms
     × leaves 'unknown Discord sentinel' receipt evidence unresolved 0ms
     × leaves 'padded noncanonical ID' receipt evidence unresolved 0ms
     × leaves 'missing primary ID' receipt evidence unresolved 0ms
     × leaves 'different receipt ID' receipt evidence unresolved 0ms
     × leaves 'multiple receipt parts' receipt evidence unresolved 0ms
     × serializes repeated ticks and waits for the active tick during stop 1ms

 Test Files  1 failed (1)
      Tests  16 failed | 4 passed (20)
   Start at  22:07:54
   Duration  788ms (transform 384ms, setup 79ms, import 596ms, tests 35ms, environment 0ms)

[ELIFECYCLE] Test failed. See above for more details.
```

### Standard Error

```text
$ node scripts/test-projects.mjs extensions/deliberation/src/plugin.test.ts
[test] queued behind the local heavy-check lock held by test, pid 58247, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 15s for the local heavy-check lock held by test, pid 58247, cwd /Users/michal/Projects/openclaw-fork...
[test] starting test/vitest/vitest.extensions.config.ts

⎯⎯⎯⎯⎯⎯ Failed Tests 16 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > registers fail-closed hooks, read-only KM health, and one final sender
AssertionError: expected "vi.fn()" to be called 1 times, but got 0 times
 ❯ extensions/deliberation/src/plugin.test.ts:170:29
    168|       { priority: 1000 },
    169|     ]);
    170|     expect(registerService).toHaveBeenCalledTimes(1);
       |                             ^
    171|     expect(registerCli).toHaveBeenCalledTimes(1);
    172|     expect(registerGatewayMethod.mock.calls.map(([name]) => name)).toE…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/16]⎯

 FAIL  |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > delivers one ready item through the exact Discord account and stops its timer
AssertionError: expected [] to have a length of 1 but got +0

- Expected
+ Received

- 1
+ 0

 ❯ extensions/deliberation/src/plugin.test.ts:214:22
    212|     const { api, services, loadAdapter, slackSendText } = registerPlug…
    213|
    214|     expect(services).toHaveLength(1);
       |                      ^
    215|     await services[0]?.start({ config: api.config, stateDir: "/tmp", l…
    216|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/16]⎯

 FAIL  |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > delivers one Slack-origin item through the exact Slack account and thread
 FAIL  |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > delivers one Discord-origin item through the exact Slack account and thread
AssertionError: expected "vi.fn()" to be called 1 times, but got 0 times
 ❯ extensions/deliberation/src/plugin.test.ts:269:27
    267|       await services[0]?.stop?.({ config: api.config, stateDir: "/tmp"…
    268|
    269|       expect(loadAdapter).toHaveBeenCalledTimes(1);
       |                           ^
    270|       expect(loadAdapter).toHaveBeenCalledWith("slack");
    271|       expect(discordSendText).not.toHaveBeenCalled();

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/16]⎯

 FAIL  |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > delivers an explicit Slack root without manufacturing a thread
AssertionError: expected "vi.fn()" to be called 1 times, but got 0 times
 ❯ extensions/deliberation/src/plugin.test.ts:315:27
    313|     await services[0]?.stop?.({ config: api.config, stateDir: "/tmp", …
    314|
    315|     expect(slackSendText).toHaveBeenCalledTimes(1);
       |                           ^
    316|     expect(slackSendText.mock.calls[0]?.[0]).not.toHaveProperty("threa…
    317|     expect(km.completeDelivery).toHaveBeenCalledWith(expect.objectCont…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/16]⎯

 FAIL  |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > delivers a Discord source anchor through the channel-owned anchor operation
AssertionError: expected "vi.fn()" to be called 1 times, but got 0 times
 ❯ extensions/deliberation/src/plugin.test.ts:345:22
    343|     await services[0]?.stop?.({ config: api.config, stateDir: "/tmp", …
    344|
    345|     expect(sendText).toHaveBeenCalledTimes(1);
       |                      ^
    346|     expect(sendText).toHaveBeenCalledWith(
    347|       expect.objectContaining({

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/16]⎯

 FAIL  |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > fails an oversized result without sending multiple Discord messages
AssertionError: expected "vi.fn()" to be called 1 times, but got 0 times
 ❯ extensions/deliberation/src/plugin.test.ts:380:22
    378|     await services[0]?.stop?.({ config: api.config, stateDir: "/tmp", …
    379|
    380|     expect(sendText).toHaveBeenCalledTimes(1);
       |                      ^
    381|     expect(km.completeDelivery).toHaveBeenCalledWith(
    382|       expect.objectContaining({ outcome: "FAILED", providerFailureClas…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/16]⎯

 FAIL  |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > fails a Slack destination whose explicit account is not configured
AssertionError: expected "vi.fn()" to be called with arguments: [ ObjectContaining{…} ]

Number of calls: 0

 ❯ extensions/deliberation/src/plugin.test.ts:413:33
    411|
    412|     expect(slackSendText).not.toHaveBeenCalled();
    413|     expect(km.completeDelivery).toHaveBeenCalledWith(
       |                                 ^
    414|       expect.objectContaining({ outcome: "FAILED", providerFailureClas…
    415|     );

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/16]⎯

 FAIL  |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > leaves Slack delivery unresolved when the provider returns no platform message id
AssertionError: expected "vi.fn()" to be called 1 times, but got 0 times
 ❯ extensions/deliberation/src/plugin.test.ts:449:27
    447|     await services[0]?.stop?.({ config: api.config, stateDir: "/tmp", …
    448|
    449|     expect(slackSendText).toHaveBeenCalledTimes(1);
       |                           ^
    450|     expect(km.completeDelivery).not.toHaveBeenCalled();
    451|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/16]⎯

 FAIL  |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > leaves a thrown provider outcome unresolved
TypeError: You must provide a Promise to expect() when using .resolves, not 'undefined'.
 ❯ extensions/deliberation/src/plugin.test.ts:490:5
    488|     await expect(
    489|       services[0]?.start({ config: api.config, stateDir: "/tmp", logge…
    490|     ).resolves.toBeUndefined();
       |     ^
    491|     await services[0]?.stop?.({ config: api.config, stateDir: "/tmp", …
    492|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[9/16]⎯

 FAIL  |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > leaves 'unknown Discord sentinel' receipt evidence unresolved
 FAIL  |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > leaves 'padded noncanonical ID' receipt evidence unresolved
 FAIL  |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > leaves 'missing primary ID' receipt evidence unresolved
 FAIL  |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > leaves 'different receipt ID' receipt evidence unresolved
 FAIL  |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > leaves 'multiple receipt parts' receipt evidence unresolved
AssertionError: expected "vi.fn()" to be called 1 times, but got 0 times
 ❯ extensions/deliberation/src/plugin.test.ts:552:22
    550|     await services[0]?.stop?.({ config: api.config, stateDir: "/tmp", …
    551|
    552|     expect(sendText).toHaveBeenCalledTimes(1);
       |                      ^
    553|     expect(km.completeDelivery).not.toHaveBeenCalled();
    554|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[10/16]⎯

 FAIL  |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > serializes repeated ticks and waits for the active tick during stop
AssertionError: expected "vi.fn()" to be called 2 times, but got 0 times
 ❯ extensions/deliberation/src/plugin.test.ts:574:22
    572|     });
    573|     await vi.advanceTimersByTimeAsync(10_000);
    574|     expect(km.ready).toHaveBeenCalledTimes(2);
       |                      ^
    575|
    576|     const stopPromise = services[0]?.stop?.({

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[11/16]⎯

[test] failed 1 Vitest shard in 21.45s
```

## GREEN Phase

- **Timestamp:** 2026-08-24T20:08:54.479841+00:00
- **Test command:** `pnpm test extensions/deliberation/src/plugin.test.ts`
- **Exit code:** 0

### Standard Output

```text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork


 Test Files  1 passed (1)
      Tests  20 passed (20)
   Start at  22:08:53
   Duration  713ms (transform 276ms, setup 78ms, import 527ms, tests 30ms, environment 0ms)

```

### Standard Error

```text
$ node scripts/test-projects.mjs extensions/deliberation/src/plugin.test.ts
[test] starting test/vitest/vitest.extensions.config.ts
[test] passed 1 Vitest shard in 3.71s
```
