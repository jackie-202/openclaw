# Plan 2026-08-24: Restore the simpler Deliberation final-delivery service owner

Restore the existing plugin lifecycle owner without changing the accepted pipeline configuration or Discord/Slack routing contracts.

## Evidence

- Characterize `c810e68835a128c4dbd5e77db2208ab7b43bcce2` before edits: `createFinalDeliveryService()` wraps `createFinalDeliveryAdapter()`, runs one immediate tick plus an unref'd 5-second interval, gates work with one `activeTick`, clears the timer, and drains the active tick on stop.
- Confirm the same baseline registers one `deliberation-final-delivery` service only inside the enabled branch in `extensions/deliberation/index.ts`.
- Preserve current `createFinalDeliveryAdapter()` semantics: first ready item only, reservation before invocation, durable target equality, one provider call after `invoke`, terminal `FAILED` only for explicit rejection, and unresolved `FinalDeliveryOutcomeUnknownError` after ambiguous invocation.
- Preserve current matrix behavior in `extensions/deliberation/src/config.test.ts`, `extensions/deliberation/src/final-adapter.test.ts`, `extensions/deliberation/src/plugin.test.ts`, `extensions/deliberation/src/delivery-composition.test.ts`, and `extensions/deliberation/src/orchestration.test.ts`: Discord/Slack sources and destinations, exact account selection, explicit root/thread targets, source-default routing, and immutable KM targets.
- Keep `docs/plugins/reference/deliberation.md` unchanged because it already documents the restored bounded service and read-only `health`/`status` CLI. Keep the pipeline proposal unchanged because it assigns provider delivery to OpenClaw without introducing another scheduler.

## Available Skills

- `tdd`: record the enabled-service registration failure before production edits and the focused GREEN afterward.
- `openclaw-testing`: select and run narrow Deliberation, loader, and typecheck lanes.
- `autoreview`: run the mandatory fresh review after implementation and focused verification.
- `save-learning`: record only a new reusable implementation finding, if one is discovered.

## Implementation

1. Run the baseline `git show` checks above and record the owner constant, service ID, interval, non-overlap guard, and stop drain in the task checkpoint.
2. Follow `skill:tdd`: change `extensions/deliberation/src/plugin.test.ts` first to expect exactly one enabled service and zero disabled services; restore the blocked interval/stop test and capture RED against the current CLI-only implementation.
3. Restore `createFinalDeliveryService()` in `extensions/deliberation/src/final-adapter.ts` from the characterized baseline, including owner `openclaw-deliberation`, one-item adapter tick, 5-second unref'd interval, warning bound, single active promise, timer cleanup, and stop-time drain. Do not alter adapter reservation, invocation, completion, rejection, or ambiguity logic.
4. In `extensions/deliberation/index.ts`, create the service around the existing Discord/Slack provider registry and call `api.registerService()` once in the enabled branch. Remove the adapter-only `deliver-once` wiring while retaining read-only `status` and `health` commands.
5. Delete `extensions/deliberation/src/final-delivery-command.ts`, `extensions/deliberation/src/final-delivery-cli.test-helper.ts`, and `extensions/deliberation/scripts/final-delivery-callable-fixture.ts`; repository tracing shows no independent configuration-matrix consumer to retain.
6. Restore real `registerService` capture in `extensions/deliberation/src/delivery-composition.test.ts` and `extensions/deliberation/src/orchestration.test.ts`; leave their current Discord/Slack account, root/thread, source-default, immutable-target, and receipt assertions intact.
7. Restore exact one-service assertions in `src/plugins/source-checkout-runtime.test.ts`, `scripts/test-built-plugin-singleton.mjs`, and `test/scripts/deliberation-doctor-package.e2e.test.ts`; keep exact five-hook assertions unchanged.
8. Search production, tests, scripts, and docs for `deliver-once`, `final-delivery-callable`, and `deliberation-v2-final-sender`; remove only repository-local callable residue. Report any external `km-system` cron deletion as a repository-local follow-up without inspecting that repository.
9. Run focused verification, then `skill:autoreview`; fix accepted findings and rerun affected checks before handoff.

## Files

| Path                                                                 | Change                                                                           |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `extensions/deliberation/src/final-adapter.ts`                       | Restore the bounded service wrapper around the unchanged adapter.                |
| `extensions/deliberation/index.ts`                                   | Register one enabled service and remove `deliver-once`.                          |
| `extensions/deliberation/src/plugin.test.ts`                         | Prove enabled/disabled cardinality, one-item ticks, non-overlap, and stop drain. |
| `extensions/deliberation/src/delivery-composition.test.ts`           | Exercise Discord/Slack composition through the registered service.               |
| `extensions/deliberation/src/orchestration.test.ts`                  | Exercise KM orchestration through the registered service.                        |
| `src/plugins/source-checkout-runtime.test.ts`                        | Require the source-loaded singleton service.                                     |
| `scripts/test-built-plugin-singleton.mjs`                            | Require the emitted singleton service.                                           |
| `test/scripts/deliberation-doctor-package.e2e.test.ts`               | Require the packaged singleton service.                                          |
| `extensions/deliberation/src/final-delivery-command.ts`              | Delete.                                                                          |
| `extensions/deliberation/src/final-delivery-cli.test-helper.ts`      | Delete.                                                                          |
| `extensions/deliberation/scripts/final-delivery-callable-fixture.ts` | Delete.                                                                          |

## TDD

Implement the RED/GREEN cycle with `skill:tdd`; record evidence in `plans/checkpoints/quick-wave-8748.red-green-proof.md`.

**Test file:** `extensions/deliberation/src/plugin.test.ts`  
**Run command:** `pnpm test extensions/deliberation/src/plugin.test.ts`  
**Edit:** Add the type import and replace the current no-scheduler assertion inside the existing suite.

```ts
import type { OpenClawPluginService } from "openclaw/plugin-sdk/plugin-entry";

it("registers exactly one final-delivery service when enabled", () => {
  const services: OpenClawPluginService[] = [];
  createKmClientMock.mockReturnValue(createKm());

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

| Test                         | RED                                               | GREEN                                                                       |
| ---------------------------- | ------------------------------------------------- | --------------------------------------------------------------------------- |
| Enabled singleton            | Current code registers `[]`.                      | Registers only `deliberation-final-delivery`.                               |
| Disabled registration        | Preserve zero registrations.                      | Registers no service.                                                       |
| Serialized interval and stop | CLI harness has no interval or active-tick drain. | Repeated elapsed intervals do not overlap; stop waits for the blocked tick. |

## Verification

1. `pnpm test extensions/deliberation/src/final-adapter.test.ts extensions/deliberation/src/plugin.test.ts extensions/deliberation/src/delivery-composition.test.ts extensions/deliberation/src/orchestration.test.ts extensions/deliberation/src/config.test.ts`
2. `pnpm test src/plugins/source-checkout-runtime.test.ts`
3. `pnpm test extensions/deliberation`
4. `pnpm tsgo:extensions`
5. `pnpm tsgo:extensions:test`
6. `git diff --check`
7. `git grep -n -E 'deliver-once|final-delivery-callable|deliberation-v2-final-sender' -- extensions scripts src test docs` must return no repository-local runtime/callable dependency.
8. Do not run `pnpm build`, `pnpm test:build:singleton`, or the package E2E under this task's explicit no-build/no-install boundary. Update their assertions, report emitted/package execution proof as blocked by that boundary, and never use stale `dist` or an old tarball as proof. If the owner instead authorizes local artifact-only build and isolated temporary install, run those checks and report that build/install accurately; this still does not authorize deployment.
9. Final note: list exact commands/results, preserved Discord/Slack matrix cases, the three deleted callable artifacts, any external repository follow-up, and confirm no live send, config/state mutation, build/install, Gateway restart, or deployment occurred.

---

_Created: 2026-08-24_  
_Status: DRAFT_
