# Audit cron trajectory suppression compatibility across fork and upstream

## Scope and method

This is a static, repository-only comparison of:

- fork commit `b0da725a110f15375e3bd7a540f73fe5b65e2603`;
- only the trajectory-related changes in descendant commit `7dd48ebcb8db74460a2bbd6b43ea46afd4233828`;
- upstream base `4b85d834ed1586062f31bded2f358fc5192d1674`.

The audit follows source, protocol validation, normalization, SQLite projection, execution, retry, harness dispatch, recorder construction, and cleanup. Existing tests are contract evidence only. Per the investigation boundary, no tests, builds, live configuration checks, external repository reads, or Git lifecycle operations were performed.

The comparison separates two questions:

1. Can two internal flags cause the same recorder outcome when already present at the runner boundary?
2. Does upstream preserve the fork's complete cron configuration, persistence, retry, harness, and operational contract?

Only the first is partially true. The second is false.

## Executive finding

Upstream's `disableTrajectory` is not behaviorally equivalent to the fork's cron `payload.trajectory` feature.

- The fork adds an operator-shaped, positive-polarity field, derives `trajectoryEnabled = payload.trajectory ?? true`, and forwards it through cron and embedded OpenClaw attempts. Literal `false` skips OpenClaw recorder construction.
- Upstream adds a negative-polarity runner parameter intended for auxiliary runs with no durable session owner. It is enforced for both the built-in OpenClaw attempt and the OpenClaw-owned Codex host-recorder path, but no cron path sets it.
- The fork feature is incomplete as a cron contract: Gateway add/update reject `trajectory`, the normal cron tool and CLI do not expose it, direct patch merging cannot change it, and SQLite reconstruction omits it. A value can affect an in-memory direct service job, but it is not a reliable public or restart-durable setting.
- The fork's bundled Codex harness ignores `trajectoryEnabled` and creates its recorder from the global environment gate. Therefore even the fork does not preserve suppression across a model fallback that changes from the OpenClaw harness to Codex.
- Interactive user and heartbeat turns omit the per-run flag in both trees, so their default-on trajectory behavior is preserved, subject to `OPENCLAW_TRAJECTORY=0` and recorder sink availability.
- `7dd48ebcb8db` changes queued-writer diagnostic typing and formatting only. It does not source, propagate, or enforce cron suppression.

Repository decision records later explicitly remove the fork feature as unused. That supports skipping the port, but not the August task's claim that upstream already has cron coverage.

## Commit delta

| Commit | Relevant change | Suppression effect |
| --- | --- | --- |
| `b0da725a110f` | Adds `CronAgentTurnPayloadFields.trajectory`, `trajectoryEnabled` propagation, and an OpenClaw attempt helper | Suppresses only when a supported in-memory cron payload reaches the built-in OpenClaw attempt with `false` |
| `7dd48ebcb8db` | Adds `"file-replace"` to shared queued-writer diagnostics, reuses that shared type in trajectory runtime, annotates the writer, and reformats `buildEventLine` | None |
| `4b85d834ed1586062f31bded2f358fc5192d1674` | Has generic `RunEmbeddedAgentParams.disableTrajectory` and harness-specific enforcement | Suppresses trusted auxiliary runner calls that explicitly set it; cron does not |

Evidence: `b0da725a110f:src/cron/types.ts:236-263`, `b0da725a110f:src/cron/isolated-agent/run.ts:754-768`, `b0da725a110f:src/agents/embedded-agent-runner/run/attempt.ts:710-714`; `7dd48ebcb8db:src/agents/queued-file-writer.ts:16-23`, `7dd48ebcb8db:src/trajectory/runtime.ts:63-69,509-528`; `4b85d834ed1586062f31bded2f358fc5192d1674:src/agents/embedded-agent-runner/run/params.ts:167-170`.

## Call-path comparison

### Fork call path

```text
cron timer/service
  -> executeDetachedCronJob
     -> command: runCommandJob (no embedded trajectory recorder path)
     -> agentTurn: runIsolatedAgentJob
        -> runCronIsolatedAgentTurn
           -> prepareCronRunContext
              -> trajectoryEnabled = agentPayload?.trajectory ?? true
           -> executeCronRun
              -> createCronPromptExecutor
                 -> runWithModelFallback
                    -> CLI candidate: runCliAgent (flag not forwarded)
                    -> embedded candidate: runEmbeddedAgent(trajectoryEnabled)
                       -> embedded retry loop
                          -> runEmbeddedAttemptWithBackend(trajectoryEnabled)
                             -> OpenClaw attempt
                                -> false: recorder = null
                                -> true/omitted: createTrajectoryRuntimeRecorder
                             -> Codex attempt
                                -> creates its own recorder from env only
```

The old target and payload rules are exhaustive at this commit:

| Target/payload | Path | Relationship to fork opt-out |
| --- | --- | --- |
| `main` + `systemEvent` | Queue event and request heartbeat | No `agentTurn` payload, so `trajectory` is inapplicable; any later heartbeat turn follows the ordinary heartbeat runner |
| `isolated` + `agentTurn` | Detached isolated agent path | Sources and forwards `trajectoryEnabled` |
| `current` + `agentTurn` | Current-session isolated-agent path | Same suppression derivation and forwarding |
| `session:<id>` + `agentTurn` | Named-session isolated-agent path | Same suppression derivation and forwarding |
| Isolated-like + `command` | Command runner | No embedded trajectory recorder at this layer |
| Other target/payload combinations | Rejected by job-shape validation | No execution |

At `b0da725a110f`, `CronPayload` contains only `systemEvent`, `agentTurn`, and `command`; the later first-class `script` and `heartbeat` payloads are not old paths. Evidence: `b0da725a110f:src/cron/types.ts:225-270`, `b0da725a110f:src/cron/service/jobs.ts:272-293`, `b0da725a110f:src/cron/service/timer.ts:1491-1499,1502-1583`.

The fork derives the value once after narrowing the payload, carries it in prepared context, and forwards the same boolean to the executor and every embedded fallback candidate: `b0da725a110f:src/cron/isolated-agent/run.ts:754-768,889-920,1301-1338`; `b0da725a110f:src/cron/isolated-agent/run-executor.ts:130-210,278-318,365-446`.

The embedded loop does not mutate the flag. Every retry dispatch reads the original `params.trajectoryEnabled`: `b0da725a110f:src/agents/embedded-agent-runner/run.ts:1469-1513,1578-1593,1708-1714`. The OpenClaw attempt skips the factory only for literal `false`; omitted and `true` call the existing factory: `b0da725a110f:src/agents/embedded-agent-runner/run/attempt.ts:710-714,2515-2531`.

The OpenClaw-owned bundled Codex implementation is a separate recorder owner at this fork commit. It calls `createCodexTrajectoryRecorder({ attempt: params, ... })`, but that factory only consults the environment and does not read `trajectoryEnabled`: `b0da725a110f:extensions/codex/src/app-server/run-attempt.ts:971-990`; `b0da725a110f:extensions/codex/src/app-server/trajectory.ts:150-160`. This observation is limited to repository-owned integration code; no external Codex dependency verdict is made.

### Upstream call path

```text
cron admission
  -> timer execution
     -> script: executeScriptCronJob
     -> heartbeat: requestHeartbeat
     -> main systemEvent: enqueue event -> heartbeat runner
     -> detached command: runCommandJob
     -> detached agentTurn: runIsolatedAgentJob
        -> runCronIsolatedAgentTurn
           -> prepare
           -> executeCronRun
              -> createCronPromptExecutor
                 -> runWithModelFallback
                    -> CLI candidate: runCliAgent
                    -> embedded candidate: runEmbeddedAgent(no disableTrajectory)
                       -> run-loop retry dispatch
                          -> run-attempt-dispatch(disableTrajectory = undefined)
                             -> OpenClaw: prepareEmbeddedAttemptTrajectory
                             -> Codex: prepare host trajectory recorder
```

Admission is shared by all current execution sources and releases in `finally`: `4b85d834ed1586062f31bded2f358fc5192d1674:src/cron/service/run-admission.ts:192-208`. Gateway wiring resolves `isolated`, `current`, and named-session targets into `runCronIsolatedAgentTurn`: `4b85d834ed1586062f31bded2f358fc5192d1674:src/gateway/server-cron.ts:727-745`.

Current target routing is exhaustive as follows:

| Target/payload | Direct path | Trajectory behavior |
| --- | --- | --- |
| Any supported `script` target | Script runner before target routing | No embedded model attempt at this layer |
| System-owned `heartbeat` payload | Wake request only | Eventual heartbeat turn is ordinary agent dispatch with no per-run suppression |
| Heartbeat-task-shaped `systemEvent` | Wake request only | Same ordinary heartbeat behavior |
| `main` + `systemEvent` | Queue event; immediate or later heartbeat | No cron suppression source; later model turn is default-on |
| `isolated` + `agentTurn` | Isolated agent runner | `disableTrajectory` omitted |
| `current` + `agentTurn` | Current-session agent runner | `disableTrajectory` omitted |
| `session:<id>` + `agentTurn` | Named-session agent runner | `disableTrajectory` omitted |
| Isolated-like + `command` | Command runner | No embedded model attempt at this layer |
| Unsupported combination | Job-shape validation error | No execution |

Evidence: `4b85d834ed1586062f31bded2f358fc5192d1674:src/cron/service/timer-execution.ts:144-215,218-243,250-370,372-454`; `4b85d834ed1586062f31bded2f358fc5192d1674:src/cron/service/jobs-validation.ts:13-53`.

The current cron fallback closure calls `runEmbeddedAgent` with a complete session target and `trigger: "cron"`, but has no `disableTrajectory` property: `4b85d834ed1586062f31bded2f358fc5192d1674:src/cron/isolated-agent/run-executor.ts:369-425,585-696`. `executeCronRun` also has no suppression parameter: `4b85d834ed1586062f31bded2f358fc5192d1674:src/cron/isolated-agent/run-executor.ts:747-846`.

## Source, propagation, and enforcement

| Boundary | Fork `b0da725a110f` | Upstream `4b85d834ed1586062f31bded2f358fc5192d1674` |
| --- | --- | --- |
| Intended source | `CronAgentTurnPayload.trajectory?: boolean` | Trusted `RunEmbeddedAgentParams.disableTrajectory?: boolean` caller |
| Polarity/default | Positive; omission becomes `true` | Negative; omission is false-like |
| Cron derivation | `agentPayload?.trajectory ?? true` | None |
| Cron executor parameter | Required `trajectoryEnabled: boolean` | None |
| Attempt parameter | Optional `trajectoryEnabled` | Optional `disableTrajectory` |
| Built-in OpenClaw enforcement | `false` returns `null` before recorder factory | `true` returns `null` before recorder factory |
| Bundled Codex enforcement | Not enforced; Codex-owned factory checks env only | Host creates no recorder when `disableTrajectory` is true; Codex requires that host recorder |
| Other harnesses | No central enforcement contract proven | No repository-wide guarantee for a third-party harness that owns a separate recorder |
| Global env gate | Factory defaults on; false-like `OPENCLAW_TRAJECTORY` returns `null` | Same |
| Public cron schema | Field absent and rejected | Field absent and rejected |
| SQLite active projection | Field omitted | Field omitted |

Current enforcement is split deliberately by harness:

- OpenClaw attempt: `4b85d834ed1586062f31bded2f358fc5192d1674:src/agents/embedded-agent-runner/run/attempt-trajectory.ts:9-54`.
- Codex host-recorder setup: `4b85d834ed1586062f31bded2f358fc5192d1674:src/agents/embedded-agent-runner/run/attempt-dispatch-preparation.ts:156-189`.
- Codex consumes the host recorder and refuses local capture without it: `4b85d834ed1586062f31bded2f358fc5192d1674:extensions/codex/src/app-server/run-attempt-resources.ts:50-61`; `4b85d834ed1586062f31bded2f358fc5192d1674:extensions/codex/src/app-server/trajectory.ts:124-145`.
- Shared default-on environment gate and sink validation: `4b85d834ed1586062f31bded2f358fc5192d1674:src/trajectory/runtime.ts:408-435`.

Upstream has eight production assignments of `disableTrajectory: true`, all for auxiliary or restricted runs and none for cron:

| Caller | Purpose visible in source |
| --- | --- |
| `src/agents/harness/builtin-openclaw.ts:62` | Separate settled-tool finalization attempt |
| `src/gateway/session-companion-ask.ts:295` | Restricted one-shot session companion |
| `src/hooks/llm-slug-generator.ts:107` | Slug-generation helper |
| `src/skills/workshop/experience-review.ts:568` | Skill Workshop review |
| `src/skills/workshop/history-scan-review.ts:89` | Skill Workshop history review |
| `src/system-agent/agent-turn.ts:334` | Internal system-agent turn |
| `src/system-agent/assistant.ts:173` | Internal assistant helper |
| `src/system-agent/setup-inference-persist.ts:556` | Setup-inference probe |

All paths in that table are at `4b85d834ed1586062f31bded2f358fc5192d1674`. There is no production `disableTrajectory: false` assignment. The full runner parameter is also available to trusted native plugins through `PluginRuntime.agent.runEmbeddedAgent`; this is a runtime-call contract, not operator cron configuration: `4b85d834ed1586062f31bded2f358fc5192d1674:src/plugins/runtime/types-core.ts:297-346`, `4b85d834ed1586062f31bded2f358fc5192d1674:src/plugins/registry-runtime.ts:859-880`, `4b85d834ed1586062f31bded2f358fc5192d1674:src/plugin-sdk/core.ts:208-217`.

## Retry and special-path matrix

| Path | Fork behavior | Upstream behavior | Compatibility consequence |
| --- | --- | --- | --- |
| First embedded cron attempt | Passes derived `trajectoryEnabled` | Omits `disableTrajectory` | Fork can suppress an in-memory OpenClaw cron job; upstream cron cannot |
| Model fallback candidate | Same closure-captured fork flag passed to every embedded candidate | Every candidate omits current flag | Upstream always follows normal capture; fork suppression becomes harness-dependent if fallback reaches Codex |
| `LiveSessionModelSwitchError` retry | Reuses the same executor and derived flag, up to two retries | Reuses the same executor with no flag, up to two retries | No retry resets a value, but upstream has no cron suppression value to preserve |
| Bare interim-ack continuation | Calls the same `executor.runPrompt` | Calls the same `executor.runPrompt` | Same as first attempt on each side |
| Embedded normalization retry | Loop redispatches with original outer params | Loop redispatches with original outer params | Fork `false` remains false for OpenClaw; current explicit generic `true` remains true |
| Embedded recovery retry | Same outer params across auth, timeout, compaction, overflow, Codex replay-safe, and response-shape retries | Recovery returns `retry` to the same run loop and params | Neither implementation resets its run-level flag |
| Terminal retry | Same run-level params are reused | Terminal resolution returns `retry` to the same run loop | Same preservation rule |
| Settled-turn finalization | No separate current-style suppression source identified at the pinned fork seam | Starts a distinct restricted attempt with `disableTrajectory: true` | This is auxiliary finalization suppression, not cron payload compatibility |
| `before_agent_reply` hook handles turn | Returns before attempt recorder creation | Returns before attempt recorder creation | No trajectory recorder exists, regardless of cron flag |
| CLI runtime candidate | Fork flag is not forwarded into `runCliAgent` | Generic flag is not part of this branch | Both bypass the embedded attempt recorder path; this is not proof of cron opt-out equivalence |

Fork retry evidence: `b0da725a110f:src/cron/isolated-agent/run-executor.ts:187-210,417-485,489-542`; `b0da725a110f:src/agents/embedded-agent-runner/run.ts:1469-1513,1590-1712`; hook short-circuit at `b0da725a110f:src/agents/embedded-agent-runner/run.ts:652-685`.

Upstream retry evidence: `4b85d834ed1586062f31bded2f358fc5192d1674:src/cron/isolated-agent/run-executor.ts:849-953`; model fallback callback at `4b85d834ed1586062f31bded2f358fc5192d1674:src/agents/model-fallback-attempt.ts:230-249`; repeated dispatch and recovery at `4b85d834ed1586062f31bded2f358fc5192d1674:src/agents/embedded-agent-runner/run-loop.ts:314-463,518-656`; settled finalization at `4b85d834ed1586062f31bded2f358fc5192d1674:src/agents/harness/builtin-openclaw.ts:35-65`; hook short-circuit at `4b85d834ed1586062f31bded2f358fc5192d1674:src/agents/embedded-agent-runner/run-orchestrator.ts:350-396`.

Recorder terminal events and flushes remain attempt-local. OpenClaw records a normal terminal event or cleanup fallback and then uses the bounded cleanup wrapper: `4b85d834ed1586062f31bded2f358fc5192d1674:src/agents/embedded-agent-runner/run/attempt-finalize.ts:124-138`, `4b85d834ed1586062f31bded2f358fc5192d1674:src/agents/embedded-agent-runner/run/attempt-session-cleanup.ts:78-107`, `4b85d834ed1586062f31bded2f358fc5192d1674:src/agents/embedded-agent-runner/run/attempt-trajectory-flush-cleanup.ts:17-38`. Codex records and flushes on normal cleanup and turn-start failure: `4b85d834ed1586062f31bded2f358fc5192d1674:extensions/codex/src/app-server/run-attempt-cleanup.ts:45-72`, `4b85d834ed1586062f31bded2f358fc5192d1674:extensions/codex/src/app-server/run-attempt-turn-start.ts:180-191,265-271`.

## Scenario matrix

Assume a valid recorder sink unless a row says otherwise.

| Scenario | Fork result | Upstream result | Exact equivalence? |
| --- | --- | --- | --- |
| In-memory cron `agentTurn`, `trajectory: false`, OpenClaw harness, env enabled | No recorder factory call | Old field has no current source or meaning; recorder created | No |
| In-memory cron `agentTurn`, `trajectory: false`, fork Codex harness, env enabled | Recorder created because Codex ignores the fork field | Recorder created because cron omits current flag | Same outcome by fork gap, not equivalent contract |
| Cron `trajectory: true`, OpenClaw harness, env enabled | Recorder created | Recorder created | Same default outcome only |
| Cron field omitted, OpenClaw harness, env enabled | Defaults to enabled; recorder created | No field; recorder created | Same default outcome only |
| Any ordinary run with `OPENCLAW_TRAJECTORY=0` | Factory returns no recorder; fork `false` also avoids factory | Factory returns no recorder | Equivalent global override |
| Current trusted caller sets `disableTrajectory: true`, OpenClaw harness | No fork counterpart unless it uses `trajectoryEnabled: false` | No recorder | Equivalent only after an explicit caller-side polarity translation |
| Current trusted caller sets `disableTrajectory: true`, Codex harness | Fork Codex still follows env | Host recorder omitted; Codex capture unavailable | Upstream is stronger for this internal runner contract |
| Public Gateway add/update with `trajectory: false` | Rejected as unknown | Rejected as unknown | Equivalent rejection, not feature preservation |
| Direct fork service create with typed `trajectory: false` | Retained in memory and can suppress OpenClaw | Type lacks field; an untyped value is ignored by runtime | No |
| Direct same-kind fork patch sets `trajectory` | Patch type permits it, but merge code never reads it | Unsupported | Neither provides a working update contract |
| Existing same-kind fork payload with `trajectory` receives unrelated patch | Initial spread retains it in memory | An untyped unknown can likewise survive a spread but remains inert | No semantic preservation upstream |
| Payload kind replacement | Fork builder omits and loses field | Field unsupported and absent | Same data loss, not compatibility |
| Restart/reload after fork value was written to `job_json` | Active SQLite projection reconstructs payload without it and defaults enabled | Active projection also omits it | Existing `false` loses suppression |
| Manual cron run | Uses the same stored job execution path; an in-memory fork `false` is honored by OpenClaw | Same current cron path with no suppression source | No |
| Interactive user turn | Caller omits fork field; default-on subject to env | Caller omits current field; default-on subject to env | Yes for normal interactive behavior |
| Heartbeat turn | Caller omits fork field; default-on subject to env | Caller omits current field; default-on subject to env | Yes for normal heartbeat behavior |
| Main-session `systemEvent` cron | Queues/wakes; later heartbeat is ordinary behavior | Queues/wakes; later heartbeat is ordinary behavior | Yes regarding absence of cron-specific suppression |
| Hook claims cron before model dispatch | No attempt recorder | No attempt recorder | Yes |
| Recorder sink cannot be created | No recorder even if enabled | No recorder even if enabled | Same no-capture outcome, independent of cron opt-out |

Interactive and heartbeat evidence: the fork user/heartbeat call sets only `trigger` and omits `trajectoryEnabled` at `b0da725a110f:src/auto-reply/reply/agent-runner-execution.ts:2285-2315`; upstream similarly sets `trigger: turn.isHeartbeat ? "heartbeat" : "user"` and omits `disableTrajectory` at `4b85d834ed1586062f31bded2f358fc5192d1674:src/auto-reply/reply/agent-runner-embedded-candidate.ts:196-215`.

## Protocol, persistence, and migration compatibility

### Public API

The fork's TypeScript cron type includes `trajectory`, but its TypeBox protocol schema does not. The agent-turn schema is closed with `additionalProperties: false`, and both add and update embed it: `b0da725a110f:packages/gateway-protocol/src/schema/cron.ts:13-27,470-504`. Gateway normalizes before validating, while payload normalization clones unknown fields rather than stripping them: `b0da725a110f:src/cron/normalize.ts:144-155,467-475,542-544`; `b0da725a110f:src/gateway/server-methods/cron.ts:363-397,445-480`. The result is rejection, not silent removal.

Upstream remains closed and omits both `trajectory` and `disableTrajectory`: `4b85d834ed1586062f31bded2f358fc5192d1674:packages/gateway-protocol/src/schema/cron.ts:14-34`. Neither the fork cron tool's declared fields nor current cron CLI/protocol surfaces expose suppression. Fork tool evidence: `b0da725a110f:src/agents/tools/cron-tool.ts:100-115`.

### Direct service create and update

Fork direct create assigns `payload: input.payload`, so typed internal construction can retain the field until persistence/reload: `b0da725a110f:src/cron/service/jobs.ts:729-784`. Update behavior is internally inconsistent:

- `CronAgentTurnPayloadPatch` inherits `trajectory?: boolean` from the partial field type: `b0da725a110f:src/cron/types.ts:259-263`.
- Same-kind merge starts from `{ ...existing }`, so an existing value survives unrelated patches.
- The merge has branches for message, model, fallbacks, tools, thinking, timeout, light context, and unsafe external content, but none for `patch.trajectory`: `b0da725a110f:src/cron/service/jobs.ts:916-947`.
- Kind replacement constructs a known-field payload and omits trajectory: `b0da725a110f:src/cron/service/jobs.ts:950-988`.

Thus the fork has a create-time in-memory capability, not a complete mutable cron payload contract.

### SQLite projection and restart

At the fork commit, a full config copy is serialized to `job_json`, but active runtime jobs are rebuilt from split columns:

- `bindPayloadColumns` has no trajectory column or binding: `b0da725a110f:src/cron/store/payload-codec.ts:63-119`.
- `payloadFromRow` reconstructs only known agent-turn fields: `b0da725a110f:src/cron/store/payload-codec.ts:122-158`.
- `rowToCronJob` uses `payloadFromRow`; `job_json` is retained separately as config evidence: `b0da725a110f:src/cron/store/row-codec.ts:124-148,214-243,303-327`.
- Service loading schedules the projected job, not the config JSON payload: `b0da725a110f:src/cron/service/store.ts:97-166`.

Upstream has the same decisive property. Its evolved codec binds and reconstructs many fields but still no trajectory field: `4b85d834ed1586062f31bded2f358fc5192d1674:src/cron/store/payload-codec.ts:120-163,178-206`. `rowToCronJob` selectively reads a few config-only fields from `job_json`, but obtains `payload` from `payloadFromRow`: `4b85d834ed1586062f31bded2f358fc5192d1674:src/cron/store/row-codec.ts:277-335`. Loaded `configJobs` retain raw JSON separately from active `store.jobs`: `4b85d834ed1586062f31bded2f358fc5192d1674:src/cron/store/row-codec.ts:481-530`.

Consequences for old persisted payloads:

| Stored payload state | Config JSON | Active runtime after reload | Migration status |
| --- | --- | --- | --- |
| `trajectory` omitted | Omitted | Capture defaults on | No migration needed |
| `trajectory: true` | May remain as unknown config JSON | Field absent; capture defaults on | Observable behavior happens to match |
| `trajectory: false` | May remain as unknown config JSON | Field absent; capture defaults on | Suppression is lost |

### Doctor behavior

There is no trajectory-specific doctor rule, SQLite column migration, polarity translation, or cleanup rule in either pinned tree. Generic doctor projection comparison includes the entire payload, so config JSON containing `trajectory` differs from the active projected payload: `b0da725a110f:src/commands/doctor/cron/repair-plan.ts:143-174`; `4b85d834ed1586062f31bded2f358fc5192d1674:src/commands/doctor/cron/repair-plan.ts:213-245`.

Current doctor can import legacy JSON jobs and backfill split columns, but it writes through the same codec that has no trajectory field: `4b85d834ed1586062f31bded2f358fc5192d1674:src/commands/doctor/cron/legacy-repair.ts:109-147,252-270`. Therefore generic import can retain the unknown value in config JSON while leaving it inert in the active projection; it cannot restore suppression. Because the config/runtime payload mismatch remains representable after rewriting, the unknown field can also continue to trigger projection-backfill findings instead of being migrated or intentionally removed.

## Existing test evidence

Fork tests added by `b0da725a110f` prove only two narrow seams:

- the helper skips the OpenClaw recorder factory for `false` and invokes it for omitted/`true`: `b0da725a110f:src/agents/embedded-agent-runner/run/attempt.test.ts:132-161`;
- an in-memory cron payload forwards `false`, while omission forwards `true`, to a mocked embedded runner: `b0da725a110f:src/cron/isolated-agent/run.cron-model-override-forwarding.test.ts:328-370`.

They do not cover Gateway acceptance, direct update, SQLite round-trip/restart, doctor, CLI/tool input, Codex harness behavior, model fallback across harnesses, hook claims, or retry-specific suppression.

Upstream tests prove the generic runner seam and settled-turn auxiliary call:

- `disableTrajectory` skips OpenClaw recorder creation: `4b85d834ed1586062f31bded2f358fc5192d1674:src/agents/embedded-agent-runner/run/attempt-trajectory.test.ts:97-103`;
- settled-turn finalization sets `disableTrajectory: true`: `4b85d834ed1586062f31bded2f358fc5192d1674:src/agents/harness/builtin-openclaw.test.ts:64-75`.

The pinned upstream tree has no cron test containing `disableTrajectory`, because cron does not use the parameter. No pass/fail claim is made; test execution was prohibited by scope.

## Equivalence assessment

The two implementations can produce the same built-in OpenClaw recorder outcome only after a caller performs an explicit polarity translation:

```text
fork payload.trajectory === false
    maps to
upstream run params.disableTrajectory === true
```

Upstream cron performs no such translation, has no source field to translate, and has no persisted representation or migration. Same-purpose enforcement at a lower layer is therefore not end-to-end compatibility.

If the product need returned, a current implementation would require one canonical cron field in protocol/type/tool/CLI surfaces, SQLite projection, update merging, doctor migration for old `trajectory` values, translation to `disableTrajectory`, and tests across Gateway round-trip, restart, retries, OpenClaw, and Codex. Replaying `b0da725a110f` would not be the best implementation because its own public, persistence, update, and Codex gaps would be carried forward.

## Repository decision evidence

The later fork decision explicitly describes both the writer change and cron opt-out as unused fork-only commits, states that trajectory recording was not used in production, and requires removal of `CronAgentTurnPayload.trajectory` and all propagation: `plans/tasks/2026-07-18_remove-fork-trajectory-batched-writer-and-cron-opt-out.md:5-18,22-28`.

The corresponding implementation plan repeats that `b0da725a110f` added the full internal chain and directs its deletion while preserving the unrelated `7dd48ebcb8db` diagnostics fix: `plans/2026-07-19_calm-fork-4679_remove-fork-only-trajectory-batched-writer-and-cron.md:5-11,27-29`.

The August port task says to skip the commit because upstream already has `disableTrajectory` and cron coverage: `plans/tasks/2026-08-09_port-retained-openclaw-fork-customizations-onto-current-upst.md:41-47`. Source supports the skip outcome but disproves that rationale: upstream has generic auxiliary-run coverage, not cron sourcing or cron tests. The earlier explicit removal decision is the sound basis for not porting the feature.

## Proposal verdict

**Obsolete by decision**

- **Confidence:** High for commit-pinned source behavior and non-equivalence; medium-high for the product decision because multiple repository records explicitly require removal, but the investigation boundary prohibited independent live-configuration or production-state validation.
- **Gaps:** No tests or builds were run. No live cron store was inspected. No external Codex repository was inspected, so Codex findings are confined to OpenClaw-owned harness and plugin code and are not a dependency-protocol verdict. Third-party harnesses that own separate trajectory recorders were not provable from the central runner contract.
- **Cited evidence:** Fork source/default/propagation at `b0da725a110f:src/cron/types.ts:236-263`, `b0da725a110f:src/cron/isolated-agent/run.ts:754-768,889-920`, and `b0da725a110f:src/cron/isolated-agent/run-executor.ts:187-318`; fork persistence gap at `b0da725a110f:src/cron/store/payload-codec.ts:63-158`; upstream generic contract and cron omission at `4b85d834ed1586062f31bded2f358fc5192d1674:src/agents/embedded-agent-runner/run/params.ts:167-170` and `4b85d834ed1586062f31bded2f358fc5192d1674:src/cron/isolated-agent/run-executor.ts:585-696`; explicit removal decision at `plans/tasks/2026-07-18_remove-fork-trajectory-batched-writer-and-cron-opt-out.md:5-28`.
