# Restore the simpler Deliberation final-delivery service owner

## Problem

Before the latest Deliberation routing/configuration proposal, the OpenClaw Deliberation plugin already had a working final-delivery runtime owner: `createFinalDeliveryService()` was registered through `api.registerService()`, and its bounded 5-second loop invoked the existing reservation-fenced adapter. The intended proposal scope was to extend the supported input/output configuration matrix, not to replace this runtime architecture.

The current uncommitted implementation removes that service loop, adds a `deliver-once` CLI command, and expects a new `deliberation-v2-final-sender` cron in `km-system`. This is an unnecessary architecture change and leaves live `READY_TO_SEND` work undelivered until a second scheduler is installed.

## Objective

Return to the simpler previously working architecture:

- OpenClaw's Deliberation plugin remains the sole final provider-delivery owner.
- Keep the existing registered `deliberation-final-delivery` service and its bounded, non-overlapping polling loop.
- Preserve the newly required provider/input/output configuration matrix and all accepted routing behavior from the latest proposal.
- Do not require, install, or document a separate final-sender cron.

## Scope boundary

Work only in the registered `openclaw-fork` repository. Do not inspect or mutate live Gateway config, cron state, credentials, or the production KM spool. Existing cross-repository findings in this task are authoritative context; if an additional `km-system` cleanup is required, report the exact repository-local follow-up instead of crossing the boundary.

## Required implementation

1. Characterize the deployed baseline at commit `c810e68835a128c4dbd5e77db2208ab7b43bcce2` before changing production code:
   - `createFinalDeliveryService()` wraps `createFinalDeliveryAdapter()`;
   - `api.registerService()` registers exactly one `deliberation-final-delivery` service when enabled;
   - the loop is bounded and non-overlapping and uses the established reservation/invocation/completion semantics.
2. Restore/preserve that service ownership in the current implementation rather than exposing delivery only as a one-shot CLI command.
3. Remove the new `deliver-once` CLI/callable surface and repository-local artifacts that exist solely to support the rejected second-cron architecture, unless a concrete accepted test proves an artifact is independently required by the configuration-matrix proposal. Record any retained exception explicitly.
4. Preserve the latest accepted input/output provider matrix, especially Discord and Slack account/channel/thread routing. This is not permission to revert the proposal's routing/configuration additions.
5. Preserve exactly-once safety:
   - reservation-fenced provider invocation;
   - no automatic provider retry after durable invocation;
   - timeout/transport ambiguity remains unresolved for KM reconciliation as `delivery_outcome_unknown`;
   - rejected delivery remains terminal according to the existing contract;
   - no duplicate service registration or concurrent tick.
6. Update tests so the built/plugin composition proves there is exactly one final-delivery service and no final-sender cron/callable dependency.
7. Do not add a new scheduler, service authority, spool repair, provider retry, live send, config mutation, build installation, or Gateway restart.

## Acceptance criteria

- The plugin registers exactly one `deliberation-final-delivery` service when Deliberation is enabled and none when disabled.
- One service tick processes at most one ready delivery through the existing adapter; overlapping ticks cannot cause concurrent delivery attempts.
- Discord and Slack routing/configuration matrix tests from the latest proposal remain green, including account-aware root/thread output.
- The production architecture needs only the existing OpenClaw plugin service plus the existing KM runner; no `deliberation-v2-final-sender` cron is required.
- The `deliver-once` CLI and callable-only replacement are absent unless the final note identifies an independently required contract and proves it does not create or imply a second scheduler.
- No live state or external provider is touched.

## Verification

Run the smallest focused tests covering:

- final adapter behavior and ambiguity semantics;
- service lifecycle, singleton registration, and disabled behavior;
- Discord/Slack delivery composition and output-routing matrix;
- plugin/orchestration composition;
- built-plugin singleton/package proof;
- TypeScript typecheck and the smallest relevant broader Deliberation test suite.

The final note must list exact commands/results, explain which newer configuration-matrix behavior was preserved, enumerate removed second-cron/callable artifacts, and state clearly that deployment/build/install were not performed by this task.
