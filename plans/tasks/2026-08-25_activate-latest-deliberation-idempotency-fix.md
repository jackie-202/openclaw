# Activate and verify the latest Deliberation Discord idempotency-key fix

## Objective

Activate the already implemented Deliberation final-delivery fix in the running OpenClaw Gateway and prove that a fresh production-path message can complete successfully. The current Gateway process predates the latest build, so it still rejects delivery with `Discord idempotency key must contain 1-25 characters` even though the built artifact contains the 24-character key derivation.

## Context

- Project: `openclaw-fork`.
- Existing implementation task: `cool-brook-8631`.
- `deriveProviderIdempotencyKey` now returns `sha256(attemptId)[:24]`; KM-side `providerAttemptId` must remain unchanged.
- Observed failed record: `c22ea3ca4ce9866785f9056e55b11aeceb509dbe2f4f230a8549ec71d0764ff9`, completed around `2026-08-25T14:54:24Z`, with provider rejection `Discord idempotency key must contain 1-25 characters`.
- The Gateway process started before the latest dist artifact was built. A build alone does not activate code already held in Gateway memory.
- Existing terminal `FAILED` records must not be reset, retried, resent, or otherwise mutated as part of this task.
- Do not use manual `reserve`, `invoke`, `complete`, `run-once`, provider send, or spool mutation as a substitute for the standard path.

## Required work

1. Verify the source and built artifact contain the intended 24-character provider idempotency-key derivation and its tests.
2. Run the project build and the narrow Deliberation tests needed to establish the artifact is valid.
3. Activate the new artifact through the repository's documented linked-install/Gateway deployment procedure. A Gateway restart is expected and authorized by this task.
4. Verify after activation that:
   - the running Gateway process started after the final relevant build artifact;
   - the Deliberation plugin is loaded and activated;
   - the `deliberation-final-delivery` service is registered/running;
   - KM listener/source convergence and deployment checks pass;
   - no new `Discord idempotency key must contain 1-25 characters`, `KM request failed`, or final-delivery tick failure appears after the new process start.
5. Observe a fresh naturally produced Deliberation message through the normal pipeline if one is available during the verification window. Record evidence for `reserve → invoke/send → complete`, provider receipt/message ID, terminal `SENT`, and no duplicate delivery. Do not fabricate traffic or recycle terminal historical messages. If no fresh eligible message exists, report the deployment as activated but explicitly mark live end-to-end proof as pending rather than claiming success.

## Acceptance criteria

- Running Gateway PID/start time is newer than the final relevant build artifact.
- Built/runtime code uses a provider idempotency key of at most 25 characters while KM attempt identity remains stable.
- Relevant build and Deliberation tests pass.
- Plugin and listener deployment/health verification passes after restart.
- No post-restart recurrence of the Discord idempotency-length rejection.
- If fresh traffic exists, it reaches `SENT` with receipt evidence exactly once. Otherwise the final note clearly states that fresh-traffic E2E proof is still pending.
- No terminal historical record is manually recovered or resent.

## Verification

Use repository-documented build/test/deployment checks plus the canonical KM operator/service health commands with `PYTHONPATH=scripts:lib`. Capture exact timestamps, PID, artifact mtime, test results, and sanitized delivery evidence. Do not include git operations.
