# Prepare Deliberation v2 for a bounded live test after safe silence

## Goal

Move Deliberation from the current verified safe-silence state to a technically ready, still non-sending state for one later explicitly approved live pilot. Do not perform the live pilot in this task.

Current live facts as of 2026-07-29:

- retired `thoughtful-response` config and load authority are absent;
- `deliberation` has no live plugin entry or load path;
- the workspace has no `extensions/deliberation` checkout;
- the three designated WhatsApp routes remain `plugin-only`, which preserves safe silence;
- the OpenClaw fork owns the v2 plugin implementation at `/Users/michal/Projects/openclaw-fork/extensions/deliberation`;
- the latest readiness audit is `plans/investigations/bright-vale-8642_final-deliberation-v2-readiness-audit.md` and its cross-boundary wire/control findings remain authoritative until repaired.

## Scope boundary

This task is registered to `openclaw-fork`. Modify only `/Users/michal/Projects/openclaw-fork/**`. Do not inspect or modify live OpenClaw config, Jackie workspace runtime state, KM System, Mission Control, crons, channels, spool data, or external services. Existing reports provide the external evidence; record unknowns rather than crossing repository boundaries.

## Required implementation

1. Reconcile the fork's Deliberation plugin implementation against the KM contract evidence quoted by the latest readiness audit. Repair the OpenClaw side so the wire paths, protocol header, request/response schemas, control semantics, reservation/completion/reconciliation behavior, and versioning match the canonical KM contract described there. Do not preserve a second compatibility route or dual protocol.
2. Ensure the plugin has one explicit fail-closed operating mode for preparation: intake and sender disabled until configured; no fallback to v1 or direct provider send outside the durable reservation path.
3. Add or update repository-owned install/config/operator documentation with exact supported plugin configuration fields and read-only health/preflight checks needed by a later Jackie workspace activation task. Document rollback as removal/disablement of v2 back to safe silence; it must never restore v1.
4. Add/update fixtures and focused tests proving contract compatibility, one intake mapping, claim/reservation transitions, at-most-one provider attempt, receipt/reconciliation handling, duplicate rejection, disabled-control behavior, and rollback-to-silence assumptions.
5. Produce a task-owned checkpoint with exact commands and results. If the KM contract cannot be unambiguously reconstructed from repository-local artifacts plus the quoted audit evidence, fail closed and name the exact missing immutable input rather than guessing.

## Acceptance

- One canonical OpenClaw-side wire/control implementation remains; no competing `/v1/*` versus `/deliberation/v1/*` protocol variants survive.
- Protocol paths, headers, schemas, controls, and lifecycle semantics are internally consistent and tested.
- Plugin defaults fail closed with intake/sender disabled and no v1/direct-send fallback.
- Exact supported activation, health/preflight, and rollback-to-safe-silence procedure is documented for the later live-config task.
- Focused Deliberation tests and the smallest relevant OpenClaw test/build/typecheck gates pass, with exact evidence in the checkpoint.
- No live config, cron, routing, spool, process, Gateway, or external-message mutation occurs.

Do not include git operations.
