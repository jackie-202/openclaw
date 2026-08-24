---
title: Close OpenClaw Deliberation exclusive-ownership channel boundary
---

# Close OpenClaw Deliberation exclusive-ownership channel boundary

## Objective

Ensure every configured Deliberation source event reaches an attributed exclusive-ownership decision before any ordinary bot side effect, with executable coverage for all known edge paths.

Work only in `/Users/michal/Projects/openclaw-fork`. Do not edit or broadly inspect KM. Use the approved evidence in `/Users/michal/Projects/openclaw-fork/plans/investigations/warm-vale-4978_audit-warm-cove-4137-remediation-completeness-and-rollout-readiness.md`; the cross-repository ownership map is in the completed KM investigation `wild-crag-3236`, but all required OpenClaw findings are restated here.

## Deliverable

1. Move Discord system/room event handling behind the same attributed exclusive claim that protects ordinary configured-source events. In particular, no enqueue, ack, thread/status mutation, typing, dispatch, or other ordinary responder side effect may occur before a terminal attributed ownership result.
2. Preserve normal behavior for non-Deliberation sources.
3. Complete the missing matrix across Discord, Slack, and shared core seams:
   - configured and disabled sources;
   - root and child/thread events;
   - system/room events;
   - command, abort, empty-content, and auto-thread paths;
   - missing, error, and ambiguous attribution outcomes;
   - explicit KM rejection/fail-closed behavior.
4. Do not change KM contracts, delivery semantics, package migration, or rollout configuration in this task.

## Executable acceptance

Materialize real named leaves for:

- `OR-01 exclusive-owner-before-ordinary-side-effects`
- `OR-02 disabled-source-terminal-without-side-effects`
- `OR-03 missing-error-ambiguous-owner-terminal`
- `OR-04 discord-system-room-event-claimed-before-enqueue`
- `OR-05 slack-root-child-claim-before-thread-effects`
- `OR-06 command-abort-empty-autothread-claim-matrix`

Every leaf must exercise the real loader/channel seam and assert both positive ownership and absence of prohibited side effects. A synthetic ledger without executable test references is insufficient.

Run the existing focused Discord/Slack/core Deliberation suites cited by `warm-vale-4978` plus the new named leaves. Preserve the concrete commands and results in the final note. Run the smallest relevant lint/typecheck for touched files.

## Completion evidence

Final note must include:

- exact named OR leaves and results;
- proof that system/room enqueue occurs only after claim;
- proof that missing/error/ambiguous results terminalize safely;
- proof that ordinary non-Deliberation behavior remains unchanged;
- exact commands/results and touched boundaries.

No KM edits, deployment, build/link/install, Gateway restart, live channel send, or pilot activation.
