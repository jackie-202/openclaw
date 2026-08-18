---
title: Deploy and verify Deliberation final sender runtime
type: implementation
---

# Deploy and verify Deliberation final sender runtime

## Problem

A production spool record, `bb22cb736c0c27e135efa4ef1a45447cce738eb42afb972e044c6e1c1ee2c2fb`, remains in `READY_TO_SEND` with zero `delivery_attempts`, while the KM runner is healthy and repeatedly reports `selected: 0`. The OpenClaw source tree contains the accepted plugin-owned final sender from `cool-dune-6096`, but the live runtime has not consumed this item. The configurable delivery-target batch must not be considered complete until the actual runtime artifact is deployed and the final sender path is proven against live-compatible state.

## Objective

Close the deployment/runtime gap after the delivery-target implementation: ensure the built and linked OpenClaw runtime includes the lifecycle-owned `deliberation-final-delivery` service, starts exactly one sender loop when the plugin is enabled, and consumes eligible `READY_TO_SEND` records through the existing KM `ready -> reserve -> invoke -> provider.send -> completeDelivery` protocol.

## Scope

Work only in `/Users/michal/Projects/openclaw-fork`. Do not edit the KM repository, runtime SQLite spool, cron configuration, or OpenClaw configuration. Do not manually send the pending message and do not mutate its state as a workaround.

1. Inspect the built/linked extension artifact and plugin service lifecycle to identify why the accepted source implementation is not active in the currently running runtime.
2. Preserve the existing single plugin-owned sender protocol; do not introduce a second poller, Python sender, direct Discord path, or raw spool access.
3. Make only repository changes needed for the final sender service to be present and start reliably in the built runtime, including focused regression coverage for packaging/build/link output if that is the missing seam.
4. Preserve non-overlap, stop/reload cleanup, KM reservation/idempotency/invocation ownership, sender controls, bounded diagnostics, durable `deliveryTarget`, and fail-closed provider handling.
5. Provide an operator-ready deployment verification procedure. Do not restart the Gateway or perform external delivery from the task agent; final runtime activation remains an operator action after task acceptance.

## Required evidence

- Characterization proving whether current source tests pass while the built/linked runtime artifact lacks or fails to register `deliberation-final-delivery`.
- Focused tests proving exactly one service registration when enabled and none when disabled.
- Build/package inspection proving the emitted extension loaded by OpenClaw contains the final sender registration and adapter.
- Focused extension tests, typecheck, and the smallest relevant build gate with exact commands and results.
- Final note naming the exact artifact/runtime entrypoint that owns the sender and the exact post-acceptance activation and verification steps.

## Acceptance criteria

1. The emitted runtime plugin registers exactly one `deliberation-final-delivery` service when enabled.
2. Service startup immediately performs one bounded tick and then non-overlapping bounded polling; stop/reload removes the timer and awaits the active tick.
3. A ready item uses durable `deliveryTarget`, invokes the configured Discord outbound adapter once, and completes through KM; empty, disabled, conflicted, malformed, and failed cases do not duplicate delivery.
4. No change bypasses KM delivery lifecycle or manually edits/sends the known stale record.
5. Build/package evidence demonstrates that the runtime-consumed artifact—not only TypeScript source—contains the accepted implementation.
6. The final note clearly separates code completion from operator deployment/restart and live spool verification.
