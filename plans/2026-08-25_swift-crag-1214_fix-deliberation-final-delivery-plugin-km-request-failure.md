# Plan 2026-08-25: Fix Deliberation final-delivery plugin KM request failure

Use one sanitized deployed-shape fixture to identify and repair the KM request mismatch before touching delivery semantics.

_Status: DRAFT_

## Progress

- [x] Phase 0: Config and initialization
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Analysis

### Codebase context

- `extensions/deliberation/src/km-client.ts` owns endpoint concatenation, SecretInput resolution, the Node `http`/`https` transport, exact KM headers and paths, response parsing, and strict lifecycle evidence validation. `KmRequestError` currently retains only `stage`, `status`, and a bounded code; it does not identify the operation/path or retain a safe transport cause.
- `extensions/deliberation/src/final-adapter.ts` performs `ready -> reserve -> invoke -> one provider send -> complete` and the service serializes one active tick. Its warning logs only `error.message`, which reduces every client failure to `KM request failed`.
- `extensions/deliberation/src/km-client.test.ts` proves all six current routes and closed transport headers, but the real Node transport fixture exercises only health against a bare loopback origin. Lifecycle tests inject permissive `fetchImpl` mocks.
- `extensions/deliberation/scripts/km-listener.cross-repo.ts` already proves ready/reserve/invoke/complete against an isolated canonical listener and disposable spool, but constructs a bare-origin endpoint and materialized credential instead of the deployed endpoint/SecretInput shape.
- `extensions/deliberation/src/plugin.test.ts` mocks `createKmClient`, so it preserves scheduling/provider semantics but cannot expose endpoint, credential, header, or live-listener mismatch.
- `extensions/deliberation/src/config.ts` permits credential-free HTTPS or literal-loopback HTTP endpoints, including a pathname, and accepts SecretInput credentials; this makes endpoint joining and runtime credential materialization explicit differential checks.

### Relevant documentation

- `extensions/deliberation/contracts/km-wire-v1.json` is the accepted closed contract: authenticated `/deliberation/v1/{ready,reservations,invocations,completions}` requests, exact application/transport headers, strict responses, reservation CAS, invocation-before-provider fencing, and unknown-outcome recovery.
- `extensions/deliberation/README.md` documents the isolated listener command and prohibits production-spool overlap; its harness is the correct place for a no-provider, disposable lifecycle fixture.
- `docs/plugins/reference/deliberation.md` is the operator contract to audit for endpoint/credential and final-delivery diagnostics; run `pnpm docs:list` before reading or changing it.
- `extensions/AGENTS.md` requires the fix and tests to remain within the plugin/public SDK boundary.

### Knowledge base

- `learnings/runtime-errors/node-fetch-closed-header-contracts.md`: compare the exact emitted method/path/header set against a temporary listener; permissive fetch mocks cannot prove a closed transport contract.
- `learnings/architecture/deliberation-final-delivery-lifecycle-boundaries.md`: preserve KM ownership of reservation/idempotency/recovery, one plugin provider invocation, exact destination parsing, serialized ticks, and stop-time drain.
- `learnings/architecture/2026-07-29_acceptance-fix-plans-must-close-contract-gates-explicitly.md`: capture genuine focused RED against accepted owner evidence, then fresh GREEN.
- `learnings/architecture/2026-07-29_contract-gated-plans-should-name-absent-audit-artifacts.md`: if the configured endpoint shape or current listener authority cannot be obtained safely, stop and name the missing evidence rather than guessing.
- Recall used deterministic local fallback because QMD collection `openclaw-fork-learnings` was unavailable.

## Available Skills

- `compound-plan`: owns this plan.
- `recall-knowledge`: supplied external-contract and delivery-boundary rules.
- `tdd`: required for the failing lifecycle fixture and RED/GREEN proof.
- `openclaw-testing`: select focused extension tests and the smallest type/build lane.
- `autoreview`: mandatory fresh closeout review after implementation verification.
- `save-learning`: mandatory final action after the implementation task.

## Solution

1. Obtain a sanitized projection of the active Deliberation KM configuration: endpoint scheme, host class, port/prefix shape, SecretInput source/provider/id, and credential-resolution success only. Do not print the endpoint authority, credential value, or config payload.
2. Reproduce that shape with the real `createKmClient` and accepted KM listener on a disposable spool. Record only operation, canonical path, stage, status, bounded KM code/cause, and request header names. Require the current code to fail at the same boundary before editing.
3. Compare the emitted URL, method, headers, resolved credential presence, and response contract with `km-wire-v1.json` and the listener implementation. Fix only the proven endpoint-join, SecretInput-resolution, request-header, or transport mismatch in `km-client.ts`; do not relax endpoint validation, authentication, or closed response parsing.
4. Carry a closed operation/path label through `KmRequestError` and format service warnings from safe fields. Permit only known operation/path values, numeric status, canonical KM code, and a bounded transport classification such as timeout or socket error code; discard raw error messages, response bodies, endpoint values, credentials, and ready-item text.
5. Keep `createFinalDeliveryAdapter` unchanged unless the regression exposes a client-call defect. Preserve reserve-before-invoke, durable invocation before provider I/O, one provider call, exact target equality, completion evidence, and unresolved post-invocation ambiguity.

## Implementation

1. Use `skill:tdd` to add the client diagnostic RED in `km-client.test.ts` and the deployed-shape lifecycle RED in `km-listener.cross-repo.ts`; save exact evidence in `plans/checkpoints/swift-crag-1214.red-green-proof.md`.
2. Add a test-only configuration projection to the isolated harness matching the live endpoint pathname and credential descriptor while substituting a random loopback authority and temporary credential. Assert `ready`, `reserve`, `invoke`, and `completeDelivery` reach their exact accepted paths; use a fake provider only if exercising the adapter sequence.
3. Before product edits, require the lifecycle RED to identify one exact mismatch. If sanitized configuration or compatible listener authority is unavailable, stop with that named evidence gap rather than guessing or changing auth/protocol guards.
4. In `km-client.ts`, attach a closed operation and canonical path to every request and preserve safe failure metadata at credential, transport, JSON, HTTP, and schema stages. Apply the reproduced narrow request/config fix in the same owner function.
5. In `final-adapter.ts`, render `KmRequestError` warnings as fixed key/value metadata. Keep generic non-KM errors bounded and ensure neither path includes endpoint, credential, body, ready text, provider text, or raw listener messages.
6. Add service-log coverage in `plugin.test.ts`: a simulated ready failure includes operation/path plus status or safe cause, performs no reservation/provider call, and the next tick remains eligible. Retain existing serialized-tick, exact-target, one-send, and unknown-outcome assertions.
7. Update the isolated lifecycle case to pass through list, reserve, invoke, and completion with one fake provider attempt and exact receipt evidence. Assert no production spool overlap and cleanup on failure.
8. Update `docs/plugins/reference/deliberation.md` only for the new final-delivery warning fields and their redaction guarantees; do not publish live endpoint or credential details.
9. Run focused tests and extension type gates, then fresh `skill:autoreview` until no accepted actionable findings remain. Record that no deployment, Gateway restart, production spool mutation, or real provider send occurred.
10. Invoke `skill:save-learning` as the final implementation action and save at least one non-duplicative learning about the reproduced request-boundary mismatch or safe diagnostics.

## Files to Modify

| Path                                                        | Change                                                                                                             |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `extensions/deliberation/src/km-client.ts`                  | Add closed operation/path diagnostics and the reproduced narrow request/config correction.                         |
| `extensions/deliberation/src/km-client.test.ts`             | Cover operation-aware HTTP/transport failures, redaction, and exact configured-shape requests.                     |
| `extensions/deliberation/src/final-adapter.ts`              | Format safe actionable service warnings without changing adapter sequencing.                                       |
| `extensions/deliberation/src/plugin.test.ts`                | Prove warning metadata, no side effect on pre-reservation failure, and continued polling eligibility.              |
| `extensions/deliberation/scripts/km-listener.cross-repo.ts` | Add the deployed-shape isolated list/reserve/invoke/complete regression with a fake provider and disposable spool. |
| `docs/plugins/reference/deliberation.md`                    | Document final-delivery operation/status/cause diagnostics and redaction.                                          |
| `plans/checkpoints/swift-crag-1214.red-green-proof.md`      | Capture genuine lifecycle and diagnostic RED/GREEN evidence through `skill:tdd`.                                   |

## TDD

Implement the cycle with `skill:tdd`; capture proof in `plans/checkpoints/swift-crag-1214.red-green-proof.md`.

**Test file:** `extensions/deliberation/src/km-client.test.ts`  
**Framework:** Vitest using the real `createKmClient` request path  
**Run command:** `pnpm test extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/plugin.test.ts -- --reporter=verbose`  
**Edit hint:** Append to `describe("KM contract parsing")`; reuse `config` and the existing fixture helpers.

```ts
it("identifies a failed ready request without exposing listener data", async () => {
  const fetchImpl = vi.fn().mockResolvedValue(
    new Response(
      JSON.stringify({
        protocolVersion: 1,
        error: { code: "AUTH_INVALID", message: "credential and reviewed text" },
      }),
      { status: 401 },
    ),
  );
  const client = createKmClient({
    config,
    openclawConfig: {} as never,
    fetchImpl,
    env: { KM_TOKEN: "test-only" },
  });

  const error = await client.ready().catch((caught: unknown) => caught);
  expect(error).toMatchObject({
    operation: "ready",
    path: "/deliberation/v1/ready",
    stage: "http",
    status: 401,
    code: "AUTH_INVALID",
  }); // RED: KmRequestError currently omits operation and path.
  expect(JSON.stringify(error)).not.toContain("credential and reviewed text");
  expect(JSON.stringify(error)).not.toContain("test-only");
});
```

| Test                              | RED before implementation                                                             | GREEN after implementation                                                                          |
| --------------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Ready error metadata              | Rejection lacks `operation` and `path`.                                               | Rejection exposes only closed operation/path/stage/status/code fields.                              |
| Deployed-shape listener lifecycle | Current client reproduces the production request mismatch before reservation or send. | Ready, reservation, invocation, and completion reach accepted paths with one fake provider attempt. |
| Service warning                   | Warning is only `KM request failed`.                                                  | Warning names safe operation/path and status or bounded cause; secrets and text are absent.         |
| Delivery invariants               | Existing adapter tests remain the baseline.                                           | Existing one-reservation, one-send, target-integrity, and unknown-outcome tests remain green.       |

## Verification

1. `pnpm test extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/plugin.test.ts extensions/deliberation/src/final-adapter.test.ts -- --reporter=verbose`
2. `OPENCLAW_DELIBERATION_KM_ROOT=<approved-km-checkout> pnpm test:deliberation:km-integration`
3. `pnpm tsgo:extensions`
4. `pnpm tsgo:extensions:test`
5. `pnpm docs:list`
6. `git diff --check`
7. Run `pnpm changed:lanes --json`; use `skill:openclaw-testing` for the smallest reported changed gate, moving broad work to Testbox/Crabbox and recording its provider/run ID.
8. Run fresh `skill:autoreview`; resolve every accepted actionable finding without widening protocol or delivery semantics.

## Dependencies

- Sanitized active endpoint/SecretInput shape and credential-resolution availability, with no secret values.
- An approved KM checkout whose listener artifacts match `extensions/deliberation/contracts/provenance.json`.
- Disposable listener state guarded by the existing sentinel and production-spool overlap checks.
- Separate operator approval for deployment, restart, production delivery, or real provider verification; none belongs to implementation acceptance.
