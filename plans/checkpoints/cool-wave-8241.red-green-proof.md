# TDD Red-Green Proof: cool-wave-8241

## RED Phase

- **Provenance:** Genuine pre-implementation RED captured by parent task `quick-reef-1568` at `plans/checkpoints/quick-reef-1568.red-green-proof.md`.
- **Timestamp:** 2026-08-17T08:02:10.743483+00:00
- **Test command:** `pnpm test extensions/deliberation/src/route-match.test.ts extensions/deliberation/src/hooks.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/scripts/intake-producer.test.ts extensions/deliberation/src/contract.test.ts -- --reporter=verbose`
- **Result:** Exit code 1; 10 failed, 123 passed.
- **Behavior-linked failures:**
  - `deliberation hooks > emits sourceThreadId for Discord root`: expected `sourceThreadId: "m1"`, but the emitted intake body omitted it.
  - `deliberation hooks > emits sourceThreadId for Slack root`: expected `sourceThreadId: "1723640000.000100"`, but the emitted intake body omitted it.
  - `deliberation hooks > emits sourceThreadId for Slack reply`: expected root `sourceThreadId: "1723640000.000100"`, but the emitted intake body omitted it.
  - `accepted Deliberation contracts > defines required source threads and generic structured targets across the lifecycle`: expected `intakeBody.required` to contain `sourceThreadId`, but it did not.

### Exact Historical Failure Output

```text
FAIL  |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > emits sourceThreadId for Discord root
AssertionError: expected "vi.fn()" to be called with arguments: [ ObjectContaining{...} ]

-   ObjectContaining {
+   {
+     "provider": "discord",
+     "providerEventId": "m1",
      "sourceTarget": "v1:discord:acct:source",
-     "sourceThreadId": "m1",
    },

FAIL  |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > emits sourceThreadId for Slack reply
AssertionError: expected "vi.fn()" to be called with arguments: [ ObjectContaining{...} ]

-   ObjectContaining {
+   {
+     "provider": "slack",
+     "providerEventId": "1723640000.000200",
      "sourceTarget": "v1:slack:workspace-a:C123",
-     "sourceThreadId": "1723640000.000100",
    },

FAIL  |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > defines required source threads and generic structured targets across the lifecycle
AssertionError: expected [ 'provider', 'providerEventId', ...(5) ] to include 'sourceThreadId'

Test Files  4 failed | 1 passed (5)
Tests  10 failed | 123 passed (133)
```

This follow-up does not recreate RED after implementation. It links the preserved, task-lineage RED and will add fresh GREEN evidence for the identical focused command below.

## GREEN Phase

- **Timestamp:** 2026-08-17T08:35:40Z
- **Test command:** `pnpm test extensions/deliberation/src/route-match.test.ts extensions/deliberation/src/hooks.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/scripts/intake-producer.test.ts extensions/deliberation/src/contract.test.ts -- --reporter=verbose`
- **Result:** Exit code 0; 138 passed, 0 failed.
- **Behavior-linked passes:** The same Discord root, Slack root, Slack reply, client serialization, producer, and generic contract assertions that established RED now pass.

### Fresh Test Output

```text
RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > serializes the required source thread identity with exact camelCase casing 20ms
✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > emits sourceThreadId for Discord root 1ms
✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > emits sourceThreadId for Slack root 0ms
✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > emits sourceThreadId for Slack reply 0ms
✓ |extensions| extensions/deliberation/scripts/intake-producer.test.ts > deliberation intake producer > keeps the configured final target out of source intake 3ms
✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > defines required source threads and generic structured targets across the lifecycle 1ms
✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > keeps provider-specific destination evidence in the OpenClaw overlay 0ms
✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > pins account-scoped Discord root, Slack root, and Slack reply intake vectors 1ms
✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > accepts one exact configured source identity 0ms
✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > keeps a Slack reply's child identity separate from its normalized thread identity 0ms
✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > uses a Slack root message timestamp as both event and thread identity 0ms

Test Files  5 passed (5)
Tests  138 passed (138)
Duration  584ms (transform 209ms, setup 117ms, import 305ms, tests 80ms, environment 0ms)

[test] passed 1 Vitest shard in 3.53s
```
