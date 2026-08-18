# TDD Red-Green Proof: cool-vale-1698

<!-- proof-capture-metadata: {"version":1,"task_id":"cool-vale-1698","command":["pnpm","test","extensions/deliberation/src/contract.test.ts"],"command_sha256":"1e6ab260020824eaddaeb91e909fbd8c2d38868bdf25a5ef0b3844c59490787e"} -->

## RED Phase
- **Timestamp:** 2026-08-18T07:58:25.519633+00:00
- **Test command:** `pnpm test extensions/deliberation/src/contract.test.ts`
- **Exit code:** 1

### Standard Output
````text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

 ❯ |extensions| extensions/deliberation/src/contract.test.ts (8 tests | 2 failed) 47ms
     × defines required source threads and generic structured targets across the lifecycle 5ms
     × keeps provider-specific destination evidence in the OpenClaw overlay 1ms

 Test Files  1 failed (1)
      Tests  2 failed | 6 passed (8)
   Start at  09:58:25
   Duration  278ms (transform 147ms, setup 117ms, import 19ms, tests 47ms, environment 0ms)

[ELIFECYCLE] Test failed. See above for more details.
````

### Standard Error
````text
$ node scripts/test-projects.mjs extensions/deliberation/src/contract.test.ts
[test] queued behind the local heavy-check lock held by test, pid 23657, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 15s for the local heavy-check lock held by test, pid 23657, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 30s for the local heavy-check lock held by test, pid 23657, cwd /Users/michal/Projects/openclaw-fork...
[test] starting test/vitest/vitest.extensions.config.ts

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > defines required source threads and generic structured targets across the lifecycle
AssertionError: expected { type: 'object', …(3) } to match object { Object (required, additionalProperties, ...) }
(11 matching properties omitted from actual)

- Expected
+ Received

@@ -1,16 +1,8 @@
  {
    "additionalProperties": false,
    "properties": {
-     "account": {
-       "maxLength": 96,
-       "minLength": 1,
-     },
-     "channel": {
-       "maxLength": 96,
-       "minLength": 1,
-     },
      "provider": {
        "maxLength": 32,
        "minLength": 1,
        "pattern": "^[a-z][a-z0-9_-]{0,31}$",
      },
@@ -19,9 +11,9 @@
        "minLength": 1,
      },
    },
    "required": [
      "provider",
-     "account",
-     "channel",
+     "accountId",
+     "channelId",
    ],
  }

 ❯ extensions/deliberation/src/contract.test.ts:144:45
    142|     });
    143|     expect(contract.schemas.intakeBody.properties).not.toHaveProperty(…
    144|     expect(contract.schemas.deliveryTarget).toMatchObject({
       |                                             ^
    145|       required: ["provider", "account", "channel"],
    146|       additionalProperties: false,

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > keeps provider-specific destination evidence in the OpenClaw overlay
AssertionError: expected { threadedDiscord: { …(4) }, …(3) } to match object { threadedDiscord: { …(4) }, …(5) }
(2 matching properties omitted from actual)

- Expected
+ Received

@@ -5,24 +5,11 @@
      "reservation.deliveryEnvelope.deliveryTarget",
      "invocation.attemptedTarget",
      "completion.attemptedTarget",
      "deliveryAttempt.attemptedTarget",
    ],
-   "nonThreadedDiscord": {
-     "account": "delivery-account",
-     "channel": "delivery-channel",
-     "provider": "discord",
-   },
    "sourceTarget": "v1:slack:workspace-a:C123",
    "threadedDiscord": {
-     "account": "delivery-account",
-     "channel": "delivery-channel",
      "provider": "discord",
      "threadId": "delivery-thread",
-   },
-   "threadedSlack": {
-     "account": "workspace-a",
-     "channel": "C123",
-     "provider": "slack",
-     "threadId": "1712345678.123456",
    },
  }

 ❯ extensions/deliberation/src/contract.test.ts:206:51
    204|     };
    205|
    206|     expect(fixtures.structuredDestinationVectors).toMatchObject({
       |                                                   ^
    207|       threadedDiscord: {
    208|         provider: "discord",

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯

[test] failed 1 Vitest shard in 43.77s
````

## GREEN Phase
- **Timestamp:** 2026-08-18T08:06:18.104637+00:00
- **Test command:** `pnpm test extensions/deliberation/src/contract.test.ts`
- **Exit code:** 0

### Standard Output
````text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork


 Test Files  1 passed (1)
      Tests  8 passed (8)
   Start at  10:06:17
   Duration  229ms (transform 108ms, setup 115ms, import 2ms, tests 36ms, environment 0ms)

````

### Standard Error
````text
$ node scripts/test-projects.mjs extensions/deliberation/src/contract.test.ts
[test] starting test/vitest/vitest.extensions.config.ts
[test] passed 1 Vitest shard in 3.47s
````
