# Plan 2026-10-07: Fix message send post-success proxy teardown hang

Trace successful local message-send teardown to the exact active resource, then make cleanup awaitable and scoped to the short-lived CLI proxy owner.

## Progress

- [x] Resolve canonical plan path and initialize plan
- [x] Research current CLI/proxy ownership, tests, and dependency behavior
- [x] Finalize implementation and TDD steps

## Analysis

### Codebase context

- `src/cli/run-main.ts`: starts a managed proxy for `message send`, dispatches the command, and awaits `stopStartedProxy()` in `finally`; successful routed commands intentionally return without `process.exit`.
- `src/infra/net/proxy/proxy-lifecycle.ts`: manages nested registrations and restores inherited environment/dispatcher state only after the final owner stops; current cleanup calls `proxylineHandle.stop()` and resets dispatcher routing.
- `src/infra/net/undici-global-dispatcher.ts`: wraps managed dispatchers and updates the global dispatcher. It currently has no owner-scoped asynchronous disposal API.
- `src/cli/run-main.exit.test.ts`: already protects successful no-forced-exit behavior, routed proxy policy, and final proxy cleanup.
- `src/infra/net/proxy/proxy-lifecycle.test.ts`: covers overlapping proxy owners and inherited managed proxy restoration.
- `src/infra/net/undici-global-dispatcher.test.ts`: provides mock dispatcher lifecycle coverage.
- `src/cli/program/message/register.send.ts` and adjacent message command tests own the send output behavior; inspect their command/result flow before editing.

### Dependency and resource evidence

- Installed `@openclaw/proxyline` is 0.3.3, matching `package.json` and `pnpm-workspace.yaml`.
- Its `src/runtime.ts` `ManagedUndiciDispatcher` owns a direct `Agent` and lazily created `ProxyAgent` instances, and exposes async `close()`/`destroy()` that await child dispatcher cleanup (`#closeAll`/`#destroyAll`).
- Proxyline `stopRuntime()` restores global state and invokes `void runtime.installedDispatcher.destroy()` (and destroys Node agents without awaiting); therefore owner stop may detach teardown of keep-alive Undici pools. Validate that exact path using a local mocked request and handle/resource instrumentation before changing ownership.
- Do not close whichever dispatcher happens to be global after teardown: inherited and nested registrations can point to shared routing, and run-main also supports long-lived runtime commands.

### Existing tests and docs

- No message-send-specific teardown integration test was located. Add the smallest CLI/proxy owner regression that performs a deterministic mocked outbound HTTP request and observes awaited close/settled handles.
- Preserve the existing assertion in `src/cli/run-main.exit.test.ts` that successful routed commands do not call `process.exit`.
- Repository test entry point is `pnpm test <path>`; the injected registered full test command is `npm test`. Use normal repo gates only after focused proof during implementation.

## TDD

This is a behavioral bug fix with deterministic test coverage. First add a failing test proving a real mocked send leaves the relevant owned dispatcher resource alive until owner cleanup; keep ownership/ref-count assertions in proxy lifecycle tests. Follow `skill:tdd` for RED/GREEN evidence.

**Targeted test skeleton**

Test file: `src/infra/net/proxy/proxy-lifecycle.test.ts` (extend existing `describe("startProxy")`)
Framework: Vitest, already used by the lifecycle owner tests.
Run command: `pnpm test src/infra/net/proxy/proxy-lifecycle.test.ts`
Edit hint: append a test beside the overlapping-owner tests; inject a mocked managed dispatcher with deferred async `destroy()` and verify the final owner stop does not settle until disposal resolves. Add a second-owner case to prove first-owner stop does not dispose shared state.

```ts
it("awaits disposal of the dispatcher created for the final managed-proxy owner", async () => {
  let resolveDestroy: (() => void) | undefined;
  const destroy = vi.fn(
    () =>
      new Promise<void>((resolve) => {
        resolveDestroy = resolve;
      }),
  );
  // Arrange the mocked Proxyline handle/dispatcher so stop triggers this destroy.
  const handle = await startProxy({ enabled: true, proxyUrl: "http://127.0.0.1:3128" });
  let stopped = false;
  const stopping = stopProxy(handle).then(() => {
    stopped = true;
  });
  await Promise.resolve();
  expect(stopped).toBe(false); // RED: current Proxyline stop detaches async destroy.
  resolveDestroy?.();
  await stopping;
  expect(destroy).toHaveBeenCalledOnce();
});
```

The test fixture must be refined to the chosen owner seam before coding; it must not mock away the lifecycle behavior under test. Add companion CLI tests for result/output-before-cleanup ordering, read/dry-run unchanged, failure exit semantics, and no forced exit after successful routing.

| Test                                                            | RED                                                                   | GREEN                                                           |
| --------------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------- |
| Final managed-proxy owner waits for created dispatcher disposal | `stopProxy()` resolves while mocked async destruction remains pending | stop completion waits for the owned resource to settle          |
| First of nested proxy owners stops                              | shared dispatcher is prematurely destroyed                            | routing and shared resource remain until final owner release    |
| Successful CLI message output precedes teardown                 | output/result or message ID is unavailable before cleanup             | structured result is emitted before awaited teardown            |
| Success/read/dry-run/failure command semantics                  | baseline expectations fail only where teardown is defective           | output, non-network behavior, and failure code remain unchanged |
| Successful routed run-main command                              | detects forced exit regression                                        | command returns normally without `process.exit`                 |

## Implementation

1. Reproduce with a deterministic local HTTP server/proxy fixture and instrument dispatcher/handle state; establish which Undici pool/socket remains referenced after `message send` returns.
2. Select the lowest responsible owner. Ensure lifecycle release awaits only resources created for the final CLI-owned proxy registration; preserve inherited routing and nested registration ref-counting.
3. Write focused failing tests first. Verify output/result availability before cleanup and retain normal error/exit handling.
4. Implement explicit awaited resource disposal at the owning boundary. Do not unconditionally close the current global dispatcher; do not change proxy selection, transport timeouts, retries, or force-exit behavior.
5. Run focused CLI/proxy/message tests, then required repository test/type/lint gates. Report observed resource, cleanup owner, and proof that nested/shared and long-lived runtime behavior remains safe.

## Files

| File                                                                                           | Planned change                                                                                                                                                       |
| ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/infra/net/proxy/proxy-lifecycle.ts`                                                       | If instrumentation confirms the lifecycle owner is responsible, await cleanup of only its managed dispatcher while retaining final-registration ownership semantics. |
| `src/infra/net/proxy/proxy-lifecycle.test.ts`                                                  | Add regression for real mocked outbound request resource disposal and nested/inherited owner safety.                                                                 |
| `src/infra/net/undici-global-dispatcher.ts` / `src/infra/net/undici-global-dispatcher.test.ts` | Touch only if evidence shows a global-dispatcher owner seam is required; prove it never disposes shared/long-lived dispatchers.                                      |
| `src/cli/run-main.exit.test.ts`                                                                | Assert successful message routed command returns after output and cleanup without `process.exit`, and preserves error behavior.                                      |
| `src/cli/program/message/**`                                                                   | Add or extend focused command result test only if needed to observe structured result/message ID before teardown.                                                    |
