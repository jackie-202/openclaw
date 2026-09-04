# Plan 2026-08-24: Restore the Deliberation final-delivery service owner

Create a reviewable production diff for the already-restored single service without changing delivery, routing, or live state.

## Evidence

- `extensions/deliberation/index.ts` and `extensions/deliberation/src/final-adapter.ts` currently equal `HEAD` and baseline `c810e688...`; the parent task therefore left only a test hunk in its task-scoped diff despite restoring correct worktree behavior.
- `extensions/deliberation/src/final-adapter.ts` already processes `(await km.ready()).items[0]`, tracks one `activeTick`, runs an immediate tick plus one unref'd 5-second interval, clears the timer, and awaits the active promise on stop.
- `src/plugins/types.ts:2319-2346` and `src/plugins/services.ts:95-154` define one registered service as the host-owned start/stop boundary and show that the host awaits both lifecycle methods.
- `extensions/deliberation/src/plugin.test.ts`, `extensions/deliberation/src/delivery-composition.test.ts`, and `extensions/deliberation/src/orchestration.test.ts` already exercise the registered service across Discord/Slack exact-account, root/thread, source-default, immutable-target, one-attempt, and ambiguity behavior.
- `src/plugins/source-checkout-runtime.test.ts`, `scripts/test-built-plugin-singleton.mjs`, and `test/scripts/deliberation-doctor-package.e2e.test.ts` already assert the sole service ID.
- `docs/plugins/reference/deliberation.md:153-159` already documents the bounded service and shutdown drain; the pipeline proposal keeps provider delivery in OpenClaw and live rollout out of scope. No docs change is needed.

## Available Skills

- `task-evidence`: link exact parent proof instead of reconstructing historical commands.
- `tdd`: record the historical RED provenance and fresh follow-up GREEN.
- `openclaw-testing`: select focused plugin and extension checks.
- `autoreview`: perform the mandatory fresh review after verification.
- `save-learning`: mandatory last action after the final note; save at least one concrete follow-up learning.

## Implementation

1. Run `skill:task-evidence` for `quick-wave-8748`; cite `plans/checkpoints/quick-wave-8748.red-green-proof.md` as the genuine historical RED and report any evidence gap rather than rerunning or fabricating RED.
2. In `extensions/deliberation/index.ts`, inline `createFinalDeliveryService(...)` into exactly one `api.registerService(...)` call inside the existing `config.enabled` branch. Keep provider registry construction, read-only CLI commands, hooks, and Gateway methods unchanged.
3. In `extensions/deliberation/src/final-adapter.ts`, keep the adapter and service in place, but simplify the service tick into one guarded active promise whose body catches and bounds warnings and whose `finally` clears that same lifecycle slot. Preserve owner ID, immediate first tick, 5-second unref'd interval, one-item adapter call, stopped gate, timer cleanup, and stop-time await.
4. In `extensions/deliberation/src/plugin.test.ts`, strengthen the registration assertion from count-only to the exact array `['deliberation-final-delivery']`; retain the disabled zero-service and blocked-tick shutdown tests from the parent work.
5. Confirm the three rejected callable artifacts remain absent: `extensions/deliberation/src/final-delivery-command.ts`, `extensions/deliberation/src/final-delivery-cli.test-helper.ts`, and `extensions/deliberation/scripts/final-delivery-callable-fixture.ts`. Do not add a CLI callable, cron, fallback, or second scheduler.
6. Run focused verification and `skill:autoreview`; address actionable findings without broadening into routing/configuration changes.
7. Write `plans/checkpoints/wild-peak-9394.final-note.md` with exact command outcomes, matrix coverage, absent artifacts, proof gaps, and the complete no-live/no-build declaration.
8. Invoke `skill:save-learning` as the final action and save at least one non-duplicative learning about acceptance requiring reviewable task-scoped production provenance.

## Files to Modify

| Path                                                  | Change                                                                          |
| ----------------------------------------------------- | ------------------------------------------------------------------------------- |
| `extensions/deliberation/index.ts`                    | Make the sole enabled registration explicit in the task-scoped production diff. |
| `extensions/deliberation/src/final-adapter.ts`        | Simplify the existing serialized tick while preserving lifecycle semantics.     |
| `extensions/deliberation/src/plugin.test.ts`          | Assert the exact enabled service ID and preserve disabled/non-overlap coverage. |
| `plans/checkpoints/wild-peak-9394.red-green-proof.md` | Link historical RED and capture fresh GREEN through `skill:tdd`.                |
| `plans/checkpoints/wild-peak-9394.final-note.md`      | Record acceptance evidence and prohibited-action declaration.                   |

## TDD

Follow `skill:tdd`, but do not create a new RED after the implementation already exists. Reuse the genuine RED at `plans/checkpoints/quick-wave-8748.red-green-proof.md:5-201`, where the exact service assertion failed with zero registrations, then capture fresh GREEN for this follow-up.

**Test file:** `extensions/deliberation/src/plugin.test.ts`  
**Run command:** `pnpm test extensions/deliberation/src/plugin.test.ts`

```ts
import type { OpenClawPluginService } from "openclaw/plugin-sdk/plugin-entry";
import { createTestPluginApi } from "openclaw/plugin-sdk/plugin-test-api";
import { expect, it, vi } from "vitest";
import plugin from "../index.js";

it("registers exactly one final-delivery service when enabled", () => {
  const services: OpenClawPluginService[] = [];
  plugin.register(
    createTestPluginApi({
      pluginConfig,
      registerService: (service) => services.push(service),
      runtime: {
        channel: { outbound: { loadAdapter: vi.fn() } },
        state: createStateRuntime(),
      } as never,
    }),
  );

  expect(services.map(({ id }) => id)).toEqual(["deliberation-final-delivery"]);
});
```

| Test                      | Historical RED                                   | Fresh GREEN                                                         |
| ------------------------- | ------------------------------------------------ | ------------------------------------------------------------------- |
| Enabled singleton         | Parent proof received `[]`.                      | Exact service ID array passes.                                      |
| Disabled registration     | Existing test receives no service.               | Still receives no service.                                          |
| Serialized ticks and stop | Parent proof had no registered lifecycle to run. | Repeated intervals do not overlap; stop waits for the blocked tick. |

## Verification

1. `pnpm test extensions/deliberation/src/plugin.test.ts`
2. `pnpm test extensions/deliberation/src/final-adapter.test.ts extensions/deliberation/src/plugin.test.ts extensions/deliberation/src/delivery-composition.test.ts extensions/deliberation/src/orchestration.test.ts extensions/deliberation/src/config.test.ts`
3. `pnpm test src/plugins/source-checkout-runtime.test.ts`
4. `pnpm test extensions/deliberation`
5. `pnpm tsgo:extensions`
6. `pnpm tsgo:extensions:test`
7. `pnpm lint:extensions`
8. `git diff --check`
9. Search `extensions/`, `scripts/`, `src/`, `test/`, and `docs/` for `deliver-once`, `final-delivery-callable`, and `deliberation-v2-final-sender`; classify historical plans/checkpoints separately and require no production, test, script, or public-doc dependency.
10. Do not run build, package install, deployment, Gateway restart, live send, config/state mutation, or external provider calls. The final note must state each prohibition explicitly and enumerate preserved Discord/Slack account-aware root/thread cases plus all three absent callable artifacts.

---

_Status: DRAFT_
