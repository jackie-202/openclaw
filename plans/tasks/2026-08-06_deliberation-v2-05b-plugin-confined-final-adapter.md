# Plugin-confined sole Deliberation final provider adapter

## Goal

Implement only the OpenClaw-owned Slice 5B provider boundary inside `extensions/deliberation/`: consume KM's pinned delivery envelope, perform at most one authorized provider invocation and return closed receipt/failure evidence.

## Proposal

Reference: `/Users/michal/.openclaw/workspace/docs/proposals/proposal-20260805-092115-174a6c_deliberation-v2-live-workflow-recovery-and-activation.md`, section `slice-5b-plugin-final-adapter`.

This task implements only Slice 5B. The proposal is architectural context, not permission to modify KM spool semantics, OpenClaw core, generic delivery helpers, rollout configuration or the composed KM E2E harness.

## Authoritative evidence

- `/Users/michal/.openclaw/workspace/km-system/plans/investigations/deliberation-v2/05-delivery.md`, implementation slice 2 and the final delivery contract.
- Existing plugin seams: `extensions/deliberation/src/km-client.ts`, `extensions/deliberation/src/guards.ts`, `extensions/deliberation/src/sole-send.test.ts`, plugin registration/config and neighboring plugin tests.
- Consume the stable Slice 5A KM envelope and completion vocabulary; do not invent a second schema or target grammar.

## Required behavior

1. Add one checked-in final-source adapter under `extensions/deliberation/`. It is the only Deliberation code allowed to cross the provider side-effect boundary.
2. Consume the immutable versioned KM delivery envelope. Derive provider, account and channel only from its canonical `sourceTarget`; reject target overrides or alternatives from model/reviewer output, caller args, receipt data or transport output.
3. Before or at the side-effect boundary, use the KM contract to durably mark provider invocation. Perform no provider call if that acknowledgment fails or the reservation/envelope is stale or mismatched.
4. Invoke the provider at most once for the reservation. Do not use a helper that retries, backs off, reconciles, replays or silently reroutes.
5. Return bounded target-bound evidence:
   - accepted provider receipt/message identity for `SENT`;
   - permission denial, provider rejection, `429`, transport error or timeout as the closed `delivery_failed` class;
   - leave invoked-without-durable-receipt restart classification to KM's `delivery_outcome_unknown` owner.
6. Deterministically suppress or reject bot/self recursion and prove account/channel isolation without live credentials.
7. Strengthen sole-authority tests so draft, review, processing-session delivery, generic/session/operator/synthetic/V1 paths cannot invoke final source delivery.

## Plugin/core boundary

- All production implementation must stay in `extensions/deliberation/` and use existing public OpenClaw plugin/channel APIs.
- Do not edit `src/` core, shared provider implementations, generic session/durable-send helpers, gateway runtime ownership or global configuration merely to make this adapter convenient.
- First prove whether existing plugin APIs expose the required account-bound one-shot send seam.
- If a genuine missing core capability is demonstrated, stop implementation and write a narrow evidence-backed blocker in the task result: required capability, inspected public APIs, exact reason plugin-only implementation is impossible, and smallest proposed core seam. Do not make the core change in this task. A separately reviewed task is required.
- Test-only imports of public contracts are allowed; monkey-patching or private-core imports are not production authority.

## Expected files

Production and focused tests under:

- `extensions/deliberation/src/`
- `extensions/deliberation/index.ts` only if plugin-local registration needs it
- `extensions/deliberation/contracts/` only for plugin-owned validation fixtures

Do not touch unrelated extensions or runtime configuration.

## Guardrails

- No live Discord/source send, live credentials, scheduler/config mutation, V1 fallback, alternate sender, automatic retry/backoff or provider lookup that changes target.
- No changes to KM files from this project task.
- Preserve fail-closed provenance, target, reservation, idempotency and correlation validation.
- The adapter reports evidence; it does not decide review, draft replacement, source ordering or resend.

## Acceptance

Deterministic plugin fixtures prove:

- stale/malformed/mismatched envelope causes zero provider invocations;
- accepted reservation causes exactly one invocation to the envelope's exact provider/account/channel;
- two account/channel envelopes cannot cross-route receipts or targets;
- bot/self suppression, permission denial, rejection, `429`, transport error and timeout each produce the accepted closed evidence with invocation count zero or one as appropriate;
- timeout/error paths never retry;
- completion/receipt target mismatch fails closed;
- no generic/session/operator/synthetic/V1 path can invoke the final adapter;
- production diff contains no OpenClaw core file changes. If plugin-only implementation is impossible, the verified blocker contract above is the only acceptable partial result.

## Verification

Run the extension's focused TypeScript tests/typecheck and a diff-scope check proving production changes remain under `extensions/deliberation/`. All provider behavior must use checked-in fakes; do not send to Discord or mutate live config.
