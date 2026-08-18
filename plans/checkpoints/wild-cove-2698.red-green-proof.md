# TDD Red-Green Proof: wild-cove-2698

<!-- proof-capture-metadata: {"version":1,"task_id":"wild-cove-2698","command":["pnpm","test","extensions/deliberation/src/final-adapter.test.ts"],"command_sha256":"1d17fc47ea929ff03d6b48d7f7ac6224d144e3f0d7590ce34409276bf66626f4"} -->

## RED Phase
- **Timestamp:** 2026-08-16T21:09:23.326529+00:00
- **Test command:** `pnpm test extensions/deliberation/src/final-adapter.test.ts`
- **Exit code:** 1

### Standard Output
````text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

 ❯ |extensions| extensions/deliberation/src/final-adapter.test.ts (10 tests | 8 failed) 33ms
     × routes one Slack-origin result to its canonical Discord thread 28ms
     × uses the durable delivery target for send and all evidence 0ms
     × durably invokes once, calls only the injected provider, and binds its receipt 1ms
     × terminalizes a provider failure without retrying it 0ms
     × classifies structured provider 'permission' failures 0ms
     × classifies structured provider 'rate limit' failures 0ms
     × classifies structured provider 'transport' failures 0ms
     × classifies structured provider 'timeout' failures 0ms

 Test Files  1 failed (1)
      Tests  8 failed | 2 passed (10)
   Start at  23:09:23
   Duration  235ms (transform 120ms, setup 104ms, import 19ms, tests 33ms, environment 0ms)

[ELIFECYCLE] Test failed. See above for more details.
````

### Standard Error
````text
$ node scripts/test-projects.mjs extensions/deliberation/src/final-adapter.test.ts
[test] queued behind the local heavy-check lock held by test, pid 20988, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 15s for the local heavy-check lock held by test, pid 20988, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 30s for the local heavy-check lock held by test, pid 20988, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 46s for the local heavy-check lock held by test, pid 20988, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 1m 1s for the local heavy-check lock held by test, pid 20988, cwd /Users/michal/Projects/openclaw-fork...
[test] starting test/vitest/vitest.extensions.config.ts

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 8 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > routes one Slack-origin result to its canonical Discord thread
Error: delivery envelope has an unsupported destination
 ❯ destination extensions/deliberation/src/final-adapter.ts:46:11
     44|   const identity = parseSourceIdentity(sourceTarget);
     45|   if (identity?.provider !== "discord") {
     46|     throw new Error("delivery envelope has an unsupported destination"…
       |           ^
     47|   }
     48|   return { accountId: identity.account, channelId: identity.channel };
 ❯ Object.runOnce extensions/deliberation/src/final-adapter.ts:107:22
 ❯ extensions/deliberation/src/final-adapter.test.ts:53:5

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/8]⎯

 FAIL  |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > uses the durable delivery target for send and all evidence
Error: delivery envelope has an unsupported destination
 ❯ destination extensions/deliberation/src/final-adapter.ts:46:11
     44|   const identity = parseSourceIdentity(sourceTarget);
     45|   if (identity?.provider !== "discord") {
     46|     throw new Error("delivery envelope has an unsupported destination"…
       |           ^
     47|   }
     48|   return { accountId: identity.account, channelId: identity.channel };
 ❯ Object.runOnce extensions/deliberation/src/final-adapter.ts:107:22
 ❯ extensions/deliberation/src/final-adapter.test.ts:86:5

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/8]⎯

 FAIL  |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > durably invokes once, calls only the injected provider, and binds its receipt
AssertionError: promise rejected "Error: delivery envelope has an unsupport…" instead of resolving
 ❯ extensions/deliberation/src/final-adapter.test.ts:114:5
    112|     await expect(
    113|       createFinalDeliveryAdapter({ km, provider, owner: "owner" }).run…
    114|     ).resolves.toEqual({ state: "SENT" });
       |     ^
    115|     expect(km.invoke).toHaveBeenCalledBefore(provider.send);
    116|     expect(provider.send).toHaveBeenCalledTimes(1);

Caused by: Error: delivery envelope has an unsupported destination
 ❯ destination extensions/deliberation/src/final-adapter.ts:46:11
 ❯ Object.runOnce extensions/deliberation/src/final-adapter.ts:107:22

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/8]⎯

 FAIL  |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > terminalizes a provider failure without retrying it
Error: delivery envelope has an unsupported destination
 ❯ destination extensions/deliberation/src/final-adapter.ts:46:11
     44|   const identity = parseSourceIdentity(sourceTarget);
     45|   if (identity?.provider !== "discord") {
     46|     throw new Error("delivery envelope has an unsupported destination"…
       |           ^
     47|   }
     48|   return { accountId: identity.account, channelId: identity.channel };
 ❯ Object.runOnce extensions/deliberation/src/final-adapter.ts:107:22
 ❯ extensions/deliberation/src/final-adapter.test.ts:134:5

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/8]⎯

 FAIL  |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > classifies structured provider 'permission' failures
 FAIL  |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > classifies structured provider 'rate limit' failures
 FAIL  |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > classifies structured provider 'transport' failures
 FAIL  |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > classifies structured provider 'timeout' failures
Error: delivery envelope has an unsupported destination
 ❯ destination extensions/deliberation/src/final-adapter.ts:46:11
     44|   const identity = parseSourceIdentity(sourceTarget);
     45|   if (identity?.provider !== "discord") {
     46|     throw new Error("delivery envelope has an unsupported destination"…
       |           ^
     47|   }
     48|   return { accountId: identity.account, channelId: identity.channel };
 ❯ Object.runOnce extensions/deliberation/src/final-adapter.ts:107:22
 ❯ extensions/deliberation/src/final-adapter.test.ts:174:5

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/8]⎯

[test] failed 1 Vitest shard in 79.60s
````

## GREEN Phase
- **Timestamp:** 2026-08-16T21:11:31.882582+00:00
- **Test command:** `pnpm test extensions/deliberation/src/final-adapter.test.ts`
- **Exit code:** 0

### Standard Output
````text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork


 Test Files  1 passed (1)
      Tests  11 passed (11)
   Start at  23:11:31
   Duration  256ms (transform 106ms, setup 92ms, import 65ms, tests 30ms, environment 0ms)

````

### Standard Error
````text
$ node scripts/test-projects.mjs extensions/deliberation/src/final-adapter.test.ts
[test] starting test/vitest/vitest.extensions.config.ts
[test] passed 1 Vitest shard in 3.38s
````
