# Plan 2026-08-25: Activate and verify the latest Deliberation Discord idempotency-key fix

Activate the verified emitted artifact in the managed Gateway, then collect read-only deployment and fresh-traffic evidence without recovering terminal records.

_Status: DRAFT_

## Progress

- [x] Phase 0: Initialize canonical plan
- [x] Phase 1: Research source, tests, deployment, and operations
- [x] Phase 2: Incorporate knowledge
- [x] Phase 3: Synthesize verification plan

## Analysis

### Codebase context

- `extensions/deliberation/src/final-adapter.ts` derives a 24-character SHA-256 provider key while retaining `provider:<attemptId>` for KM invoke/completion identity.
- `extensions/deliberation/src/final-adapter.test.ts` proves boundedness, determinism, distinctness, and the unchanged KM identity; `plugin.test.ts`, `orchestration.test.ts`, and `delivery-composition.test.ts` cover outbound composition.
- The current emitted chunk `dist/final-adapter-D1uX1r6V.js` contains the same split, but only a process restart can replace code already held by Gateway.
- `scripts/test-built-plugin-singleton.mjs` proves the emitted Deliberation runtime registers the expected hooks and exactly one `deliberation-final-delivery` service.
- `src/plugins/services.ts` starts each registered service and reports failures/start counts through logs/startup tracing; runtime inspection alone does not prove the serving Gateway started it.

### Relevant documentation

- `docs/install/index.md` documents source deployment as build followed by `pnpm link --global`; root operations policy requires managed Gateway restart/status commands.
- `docs/plugins/reference/deliberation.md` defines the production `ready -> reserve -> invoke -> provider -> complete` lifecycle, terminal evidence, no-retry behavior, and read-only health/status commands.
- `extensions/deliberation/README.md` documents the isolated canonical KM listener gate.

### Knowledge base

- `learnings/runtime-errors/deliberation-active-gateway-needs-service-lifecycle-proof.md`: combine Gateway PID/RPC, plugin-owned RPC, fresh runtime inspection, and built-singleton evidence.
- `learnings/runtime-errors/deliberation-listener-process-can-lag-owner-source.md`: compare listener process start with imported source and run canonical convergence checks; do not patch around stale memory.
- `learnings/runtime-errors/warm-brook-9472-isolated-green-not-rollout.md`: live acceptance requires one fresh natural record, one attempt/message ID, terminal `SENT`, and no manual recovery.
- `learnings/architecture/deliberation-final-delivery-lifecycle-boundaries.md`: KM owns durable identity/recovery; the plugin owns one invocation; Discord owns native nonce validation and receipts.
- Knowledge recall used deterministic local fallback because QMD collection `openclaw-fork-learnings` was unavailable.

## Available Skills

- `compound-plan`: owns this plan document.
- `openclaw-testing`: choose and run the narrow build/test proof during execution.
- `validate-implementation`: validate the final operational evidence against the task without requiring source edits.
- `save-learning`: mandatory final execution action after the final note is complete.

## Approach

1. Establish a timestamped baseline for the current artifact, linked CLI, Gateway PID/start time, Deliberation runtime registration, KM health/controls, logs, and the historical failed record.
2. Prove the source and tests, rebuild once, inspect the emitted import chain for the 24-character derivation, and run the built-plugin singleton gate.
3. Deploy only through the documented source link and managed Gateway lifecycle; require the post-restart process to be newer than the final artifact.
4. Separate activation proof from live-message proof. Activation can pass without traffic; live E2E passes only if a new naturally produced eligible record reaches `SENT` exactly once.

## Execution Steps

1. Record UTC start time and run `pnpm openclaw gateway status --deep --require-rpc --json`, `pnpm openclaw gateway call deliberation.status --json`, and `pnpm openclaw plugins inspect deliberation --runtime --json`. Extract the serving PID/command/root, process start via `ps -p <pid> -o lstart=`, loaded source, hooks, services, controls, listener identity, and queue counts.
2. From the canonical KM root, run `PYTHONDONTWRITEBYTECODE=1 PYTHONPATH=scripts:lib .venv/bin/python3 scripts/deliberation-v2.py --help` to confirm the installed operator surface, then its documented read-only service-health/status command and `PYTHONDONTWRITEBYTECODE=1 PYTHONPATH=scripts:lib .venv/bin/python3 scripts/deliberation-v2.py audit --limit 20`. Save a sanitized baseline for record `c22ea3ca4ce9866785f9056e55b11aeceb509dbe2f4f230a8549ec71d0764ff9`; never pass it to a mutation command.
3. Inspect `extensions/deliberation/src/final-adapter.ts` and `extensions/deliberation/src/final-adapter.test.ts`; require 24 lowercase hex characters for provider delivery and unchanged `provider:<attemptId>` assertions for KM.
4. Run `pnpm test extensions/deliberation/src/final-adapter.test.ts extensions/deliberation/src/plugin.test.ts extensions/deliberation/src/orchestration.test.ts extensions/deliberation/src/delivery-composition.test.ts extensions/discord/src/outbound-adapter.test.ts -- --reporter=verbose`.
5. Run `pnpm build`, record start/end timestamps, then run `pnpm test:build:singleton`. Follow the emitted Deliberation entry's import chain to the active `final-adapter-*.js`, verify `.slice(0, 24)` and the separate KM/provider variables, and record its path, SHA-256, and `stat` mtime as the final relevant artifact timestamp.
6. Run `OPENCLAW_DELIBERATION_KM_ROOT="$HOME/.openclaw/workspace/km-system" pnpm test:deliberation:km-integration`; require provenance/source convergence, all required lifecycle leaves, listener isolation/cleanup, and zero exit. Do not run `test:deliberation:full-gate`, because its clean-checkout preflight performs prohibited git operations and its scope exceeds this activation task.
7. Run `pnpm link --global`, verify `command -v openclaw` resolves through the global link to this checkout, and compare that root with the managed service command/root from deep status. If they differ, stop before restart and use only the repository-documented managed-service install/repair route from the linked CLI; do not activate an unknown installation.
8. Capture a restart boundary timestamp, run `openclaw gateway restart`, wait for `openclaw gateway status --deep --require-rpc --json`, and record the new PID/start time. Require a changed PID and `process start > final artifact mtime`; a build without this process replacement is not activation.
9. Run `openclaw plugins inspect deliberation --runtime --json`, `openclaw gateway call deliberation.health --json`, and `openclaw gateway call deliberation.status --json`. Require loaded/activated Deliberation from the linked artifact, expected hooks, exactly one registered `deliberation-final-delivery` service, healthy listener, and enabled expected controls.
10. Inspect Gateway logs only from the restart boundary using `./scripts/clawlog.sh --server --last <bounded-window> --all`. Require no plugin-service startup failure and no post-restart `Discord idempotency key must contain 1-25 characters`, `KM request failed`, or `deliberation: final delivery tick failed`. Use startup-trace service counts when present; otherwise record registration plus new-process/no-start-failure evidence without overstating direct service introspection.
11. Re-run the canonical KM read-only health/status and `audit --limit 20` commands. Confirm listener executable/source identity is converged and that the historical failed record's terminal state and attempt count are unchanged.
12. During a bounded observation window, poll only Gateway status/logs and the KM read-only audit for a record created after the restart boundary. Do not create traffic or call reserve/invoke/complete/run-once/provider-send/spool tools.
13. If fresh eligible traffic appears, correlate one record and attempt through ordered reserve, KM invoke/provider send, completion, provider receipt/message ID, terminal `SENT`, and one visible Discord delivery. Re-read the record after at least one additional service interval and require one attempt, one provider message ID, no second completion/send, and no duplicate visible message.
14. If no fresh eligible traffic appears, close deployment as activated and healthy but mark production-path E2E `PENDING FRESH TRAFFIC`; do not claim delivery success from tests, probes, old records, or elapsed error-free time.
15. Write `plans/checkpoints/warm-cove-0653.final-note.md` with exact commands, UTC timestamps, PID/start time, artifact path/hash/mtime, test summaries, linked/service roots, sanitized health/log evidence, historical-record non-mutation, and either exact-once fresh `SENT` evidence or the explicit pending verdict. Run `skill:validate-implementation`, then invoke `skill:save-learning` last.

## Files to Modify

| Path                                             | Change                                                                     |
| ------------------------------------------------ | -------------------------------------------------------------------------- |
| `plans/checkpoints/warm-cove-0653.final-note.md` | Store activation, health, timestamp, and optional fresh-message evidence.  |
| `learnings/**`                                   | Add at least one non-duplicative operational learning as the final action. |

No production source, config, KM state, spool, or historical record is expected to change.

## TDD: skip

This task activates and observes an already-tested artifact; it introduces no code behavior for a RED/GREEN implementation cycle.

## Preconditions

- The managed Gateway and global linked CLI belong to this checkout, or the documented linked-service repair route is available before restart.
- The canonical KM checkout and its maintained read-only operator/service commands are accessible; discover exact health syntax from that checkout rather than guessing.
- Existing Discord/KM credentials and Deliberation configuration remain unchanged and are never printed.
- Fresh production traffic is optional evidence, not permission to fabricate a message or recover a terminal item.
