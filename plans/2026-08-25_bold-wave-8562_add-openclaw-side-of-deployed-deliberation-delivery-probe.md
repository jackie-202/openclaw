# Plan 2026-08-25: Add OpenClaw Side of Deployed Deliberation Delivery Probe

Expose one separately built plugin API that composes the production KM client and final-delivery adapter with an internal synthetic provider.

_Status: DRAFT_

## Analysis

- `extensions/deliberation/src/km-client.ts` owns SecretInput resolution, exact KM requests, closed response parsing, and reserve/invoke/complete idempotency derivation.
- `extensions/deliberation/src/final-adapter.ts` owns target parsing, ready/reserve/invoke/provider/complete ordering, one-call delivery, and replay behavior through KM reservation state.
- `extensions/deliberation/index.ts` is the only Gateway entry and the only path that loads Discord/Slack adapters; the probe must remain absent from this module and `openclaw.extensions`.
- `extensions/deliberation/api.ts` is an existing top-level public build entry but is not plugin-discoverable. Exporting the probe there produces `dist/extensions/deliberation/api.js` without creating another startup mode.
- `extensions/deliberation/scripts/km-listener.cross-repo.ts` already owns isolated canonical-listener setup and disposable state, but its adapter cases override `ready()` and call source modules directly.
- `scripts/write-build-info.ts` produces packaged version/commit identity. The probe can combine that metadata with the executing API artifact class and SHA-256, without exposing an absolute path.
- `extensions/deliberation/contracts/km-wire-v1.json`, `extensions/deliberation/contracts/provenance.json`, `docs/plugins/reference/deliberation.md`, and `extensions/deliberation/README.md` remain the protocol, provenance, and isolation authorities.

## Knowledge Base

- `learnings/architecture/deliberation-final-delivery-lifecycle-boundaries.md`: keep KM reservation/idempotency/recovery, plugin one-shot invocation, and channel ownership separate.
- `learnings/architecture/2026-08-17_deliberation-readiness-separate-from-hermetic-e2e.md`: compose the registered production seams with loopback KM and fake outbound delivery; local tests alone are not deployment proof.
- `learnings/runtime-errors/deliberation-active-gateway-needs-service-lifecycle-proof.md`: identify the artifact actually executing; fresh source inspection is not active build proof.
- `learnings/architecture/2026-07-29_acceptance-fix-plans-must-close-contract-gates-explicitly.md`: capture genuine focused RED and fresh GREEN against accepted KM-owner evidence.
- Recall used deterministic local fallback because QMD collection `openclaw-fork-learnings` was unavailable.

## Available Skills

- `tdd`: implement the boundary and capture RED/GREEN proof.
- `openclaw-testing`: choose focused extension, typecheck, and build gates.
- `autoreview`: run the mandatory fresh implementation closeout review.
- `save-learning`: save at least one non-duplicative learning as the final implementation action.

## Approach

1. Add `runDeliberationDeliveryProbe(input)` behind `extensions/deliberation/api.ts`; accept a strict object containing only a literal-loopback HTTP endpoint, an environment-backed ephemeral SecretRef, and a bounded timeout.
2. Build the client with `parseDeliberationConfig` and `createKmClient`, then pass that exact client to `createFinalDeliveryAdapter`; do not reconstruct URLs, request bodies, lifecycle keys, targets, or receipts in the probe.
3. Keep provider creation internal and non-injectable. Register synthetic Discord and Slack handlers that never load channel adapters, retain no text, reject a second call, return deterministic IDs derived from the production provider-attempt ID, and report only call count plus `provider` and `root`/`thread` classification.
4. Return one closed JSON result with ordered stage outcomes, synthetic-provider summary, and `{ packageVersion, commit, artifactClass, moduleSha256 }`. Bound arrays/strings and omit endpoint authority, credential fields/values, item text, response bodies, and raw errors.
5. Extend `KmRequestError` with closed operation/path and a safe transport-cause enum. Preserve these fields through credential, transport, JSON, HTTP, and response-schema failures so probe evidence can report operation/path/status/code or safe cause without raw messages.
6. Refuse non-loopback hosts, HTTPS/public endpoints, literal credentials, unknown input fields such as provider selection, and any attempt to supply a provider implementation before constructing a client or making I/O.
7. Promote only the probe function and input/result types through `api.ts`; leave `index.ts`, plugin config, manifest activation, and normal Gateway service behavior unchanged.

## Implementation

1. Use `skill:tdd`; add the API-presence/refusal RED first and record evidence in `plans/checkpoints/bold-wave-8562.red-green-proof.md`.
2. Add closed KM operation/path/cause metadata in `km-client.ts` and focused redaction tests in `km-client.test.ts`.
3. Implement the strict probe input/result schemas, build identity reader, stage recorder, internal fake provider, and real client/adapter composition in `src/delivery-probe.ts`; export it from `api.ts` only.
4. Add loopback HTTP tests that exercise successful ready/reserve/invoke/complete, exactly one synthetic provider call, completed replay with zero calls, ready/reservation target mismatch, auth/protocol errors, and input refusal without any channel runtime.
5. Change the canonical cross-repo lifecycle case to invoke the public probe API against its existing isolated listener, then replay it and assert one total fake call followed by zero calls; retain provenance, sentinel, spool-overlap, and cleanup gates.
6. Extend the built singleton smoke to import the emitted `dist-runtime/extensions/deliberation/api.js`, verify the probe export and artifact identity, and retain exact assertions that plugin discovery registers only the existing five hooks and `deliberation-final-delivery` service.
7. Document the KM-harness import path, strict input, JSON evidence fields, redactions, and no-Gateway/no-provider guarantees in the plugin README and reference page.
8. Run focused proof, build/typecheck, and fresh `skill:autoreview`; do not restart Gateway, edit runtime config, or send externally.
9. Invoke `skill:save-learning` last and save at least one learning about deployable probe isolation or safe build/request identity.

## Files to Modify

| Path                                                        | Change                                                                                                      |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `extensions/deliberation/src/delivery-probe.ts`             | Implement strict loopback-only probe composition, fake provider, stage evidence, and build/source identity. |
| `extensions/deliberation/src/delivery-probe.test.ts`        | Cover success, replay, mismatch, auth/protocol diagnostics, redaction, and all refusal paths.               |
| `extensions/deliberation/api.ts`                            | Export only the public test/probe function and closed types.                                                |
| `extensions/deliberation/src/km-client.ts`                  | Add closed operation/path/safe-cause diagnostics used by production and probe paths.                        |
| `extensions/deliberation/src/km-client.test.ts`             | Prove diagnostic precision and secret/payload redaction.                                                    |
| `extensions/deliberation/scripts/km-listener.cross-repo.ts` | Drive the real public probe against the isolated canonical KM lifecycle and replay it.                      |
| `scripts/test-built-plugin-singleton.mjs`                   | Prove the emitted API exists while normal plugin startup cannot select it.                                  |
| `extensions/deliberation/README.md`                         | Document the isolated deployed-artifact harness contract.                                                   |
| `docs/plugins/reference/deliberation.md`                    | Document bounded probe invocation/evidence and safety constraints.                                          |
| `plans/checkpoints/bold-wave-8562.red-green-proof.md`       | Record focused RED/GREEN commands and outcomes.                                                             |

## TDD

Implement the cycle with `skill:tdd` and save proof to `plans/checkpoints/bold-wave-8562.red-green-proof.md`.

**Test file:** `extensions/deliberation/src/delivery-probe.test.ts`  
**Framework:** Vitest with the emitted plugin API contract and loopback HTTP fixtures  
**Focused command:** `pnpm test extensions/deliberation/src/delivery-probe.test.ts extensions/deliberation/src/km-client.test.ts -- --reporter=verbose`  
**Edit hint:** Create the test file before the implementation module.

```ts
import { describe, expect, it } from "vitest";

describe("public Deliberation delivery probe", () => {
  it("is exported only from the non-plugin API boundary", async () => {
    const api = await import("../api.js");
    const plugin = await import("../index.js");

    expect(api).toHaveProperty("runDeliberationDeliveryProbe"); // RED: export is absent.
    expect(plugin).not.toHaveProperty("runDeliberationDeliveryProbe");
  });
});
```

| Test                   | RED                                       | GREEN                                                                                            |
| ---------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Public API isolation   | Probe export is absent.                   | `api.ts` exports it; `index.ts` and plugin discovery do not.                                     |
| Successful lifecycle   | No composed probe exists.                 | Real client reaches ready/reserve/invoke/complete and fake provider records one call.            |
| Replay                 | No probe result exists.                   | Same completed item yields zero provider calls.                                                  |
| Target mismatch        | No boundary-level evidence exists.        | Production parsing/equality fails before provider I/O and reports the bounded stage.             |
| Auth/protocol failures | Errors collapse to insufficient metadata. | Result reports operation/path/status/code or safe cause with no secret/text.                     |
| Input/provider refusal | No strict probe schema exists.            | Non-loopback, literal credential, unknown provider mode, and provider injection fail before I/O. |
| Built artifact         | Built API is not asserted.                | Fresh build exposes the probe API while normal registry surfaces remain unchanged.               |

## Verification

1. `pnpm test extensions/deliberation/src/delivery-probe.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/final-adapter.test.ts -- --reporter=verbose`
2. `OPENCLAW_DELIBERATION_KM_ROOT=<approved-km-checkout> pnpm test:deliberation:km-integration`
3. `pnpm tsgo:extensions`
4. `pnpm tsgo:extensions:test`
5. `pnpm build`
6. `pnpm test:build:singleton`
7. `git diff --check`
8. Run `pnpm changed:lanes --json`, then use `skill:openclaw-testing` for the smallest reported changed gate; move any broad gate to Testbox/Crabbox and record its provider/run ID.
9. Run fresh `skill:autoreview` until no accepted actionable findings remain.

## Dependencies

- An approved KM checkout matching `extensions/deliberation/contracts/provenance.json` for the cross-repo gate.
- The KM harness supplies a random loopback listener and ephemeral environment SecretRef; no production endpoint, credential, spool, or provider is accepted.
- Deployment/restart/live-provider proof remains separately operator-approved and is excluded from this implementation.
