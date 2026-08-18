# Audit cron failure marker compatibility

## Scope and method

This is a static, repository-local comparison of:

- Fork marker commit **F**: `dc43c20df50c843537e39f77789b3994d534e579` (`fix(cron): surface explicit command failure markers`).
- Pinned upstream base **U**: `4b85d834ed1586062f31bded2f358fc5192d1674`.
- Merge base: `538d36eaaaa6349a6539a2ad3d13dac7ed4c1f1d`.

No product code was changed. No tests or fixture commands were run. No live data, external repositories, checkout, branch, commit, merge, rebase, or other Git lifecycle operations were used. Existing tests were read as fixtures but not executed. Read-only `git show`, `git diff`, `git grep`, commit metadata, and tag containment were used. The local object database contains F only in rollback tags, not release tags; no shipped public marker contract is proven.

Evidence labels used below:

- **T**: directly asserted by an existing checked-in test or fixture. It was not run for this investigation.
- **S**: deterministic source-derived behavior without a focused fixture.
- **U?**: not provable statically from the scoped repository evidence.

## Executive finding

F is not end-to-end compatible with U as an unchanged carry-forward. F changes only `CronRunOutcome.error`; the same stderr remains independently available in `summary` and `diagnostics`. U now preserves selected truncated output, applies selective external summary redaction, stores and projects errors and output through different paths, and classifies free-form `error` text for retries and disable decisions. A 512-unit marker cap therefore neither bounds nor redacts the complete failure result.

The most consequential differences are:

- F parses only retained stderr, after tail truncation, and requires exactly one non-empty, column-zero, case-sensitive `CRON_FAILURE:` line. U has no marker contract (`dc43c20df50c:src/cron/command-runner.ts:58-65`; repository-wide U search found no `CRON_FAILURE`).
- F can replace timeout or signal semantics whenever the process result has a numeric non-zero code, because marker selection precedes `commandErrorMessage` (`dc43c20df50c:src/cron/command-runner.ts:140-151`). U normalizes null timeout codes to `124`, making this interaction broader if F's numeric-code gate is transplanted unchanged (`4b85d834ed1586062f31bded2f358fc5192d1674:src/process/exec-runner.ts:425-442`).
- F's marker test titled "without exposing following stderr" checks only `result.error`; the following stderr remains in `summary` and `diagnostics.summary` (`dc43c20df50c:src/cron/command-runner.test.ts:95-111`; `dc43c20df50c:src/cron/command-runner.ts:139-165`).
- U's external command redactor activates only for action-critical lines. `CRON_FAILURE:` is not an action-critical pattern, and `error` is not processed by this redactor (`4b85d834ed1586062f31bded2f358fc5192d1674:src/cron/command-output-summary.ts:4-24,79-112`).
- U persists raw `lastError`, sends it to failure destinations, exposes it to hooks and public job state, and consumes it in retry classification (`4b85d834ed1586062f31bded2f358fc5192d1674:src/cron/service/timer-outcomes.ts:94-114,139-180`; `4b85d834ed1586062f31bded2f358fc5192d1674:src/cron/retry-hint.ts:48-68`).

## Evidence ledger

| Surface | Fork evidence | Upstream evidence | Established fact |
| --- | --- | --- | --- |
| Marker parsing | `dc43c20df50c:src/cron/command-runner.ts:8-9,58-65,140-151` | No U repository match | Exactly one retained stderr line beginning with the marker prefix is required; its non-empty payload is trimmed and sliced to 512 JavaScript UTF-16 code units. Unrelated stderr lines are permitted. |
| Generic execution result | `dc43c20df50c:src/cron/command-runner.ts:38-55,132-166` | `4b85d834ed1586062f31bded2f358fc5192d1674:src/cron/command-runner.ts:26-44,112-146` | Status is independent of output. Termination precedence is timeout, no-output timeout, signal, numeric code, generic failure, except that F's accepted marker is selected first. |
| Output capture | `dc43c20df50c:src/process/exec.ts:263-309,551-558,608-638` | `4b85d834ed1586062f31bded2f358fc5192d1674:src/process/exec-output.ts:25-58,67-150,152-209` | Capture defaults to the newest 16 MiB per stream. Truncation precedes marker parsing. U additionally preserves bounded action-critical lines and trims partial UTF-8 boundaries. |
| Summary construction | `dc43c20df50c:src/cron/command-runner.ts:25-35` | `4b85d834ed1586062f31bded2f358fc5192d1674:src/cron/command-output-summary.ts:41-77` | Whitespace is trimmed; stdout-only and stderr-only remain single-stream text; mixed output is a stdout-first labeled block. U may prepend preserved action lines. |
| External summary redaction | No command-specific redactor in F announce/webhook paths; `dc43c20df50c:src/gateway/server-cron.ts:410-455`; `dc43c20df50c:src/gateway/server-cron-notifications.ts:214-278` | `4b85d834ed1586062f31bded2f358fc5192d1674:src/cron/command-output-summary.ts:79-112`; `4b85d834ed1586062f31bded2f358fc5192d1674:src/gateway/server-cron.ts:770-818` | F externally delivers raw command summaries. U redacts only action-critical lines, not arbitrary output or marker errors. |
| State and retry | `dc43c20df50c:src/cron/service/timer.ts:400-464,489-617`; `dc43c20df50c:src/cron/retry-hint.ts:21-52` | `4b85d834ed1586062f31bded2f358fc5192d1674:src/cron/service/timer-outcomes.ts:94-180,246-405`; `4b85d834ed1586062f31bded2f358fc5192d1674:src/cron/service/timer-trigger.ts:59-109` | Raw error becomes state and classifier input. Every error increments the execution-error streak. Marker wording can alter transient/permanent classification. |
| Persistence and projections | `dc43c20df50c:src/cron/store/state-codec.ts:30-44`; `dc43c20df50c:src/cron/run-log/sqlite-store.ts:46-76` | `4b85d834ed1586062f31bded2f358fc5192d1674:src/cron/store/state-codec.ts:27-41`; `4b85d834ed1586062f31bded2f358fc5192d1674:src/cron/task-run-event-codec.ts:24-55`; `4b85d834ed1586062f31bded2f358fc5192d1674:src/cron/service/task-runs.ts:335-385` | `lastError`, history error, summary, and raw run diagnostics have separate persistence paths. Only job-state diagnostics are normalized and known-pattern redacted before storage. |
| User interfaces | F Gateway broadcast/hook: `dc43c20df50c:src/gateway/server-cron.ts:537-573` | `4b85d834ed1586062f31bded2f358fc5192d1674:src/cli/cron-cli/shared.ts:537-566`; `4b85d834ed1586062f31bded2f358fc5192d1674:ui/src/pages/cron/view-runs.ts:296-370` | CLI prints full `lastError`. U run UI prefers `summary` as the body and shows `error` as metadata when both exist. |
| Documented contract | No marker documentation | `4b85d834ed1586062f31bded2f358fc5192d1674:docs/automation/cron-jobs.md:237-257,362-375,794-800` | U documents process-output delivery, generic exit/signal/timeout failures, alerts, backoff, and auto-disable, but not a marker. |

## Failure matrix

Diagnostic shorthand: **D** means one `exec` entry with status-derived severity, JSON-quoted argv in the entry message, exit code, optional `signal:<SIGNAL>` tool name, and `truncated: true` when either stream discarded bytes. When output is non-empty, `diagnostics.summary` receives the same unredacted runner summary. This is common to F and U except for U's preserved-action summary (`dc43c20df50c:src/cron/command-runner.ts:67-95`; `4b85d834ed1586062f31bded2f358fc5192d1674:src/cron/command-runner.ts:46-74`).

| Scenario | Exit metadata | F selected result | U selected result | Summary, diagnostics, truncation | Basis |
| --- | --- | --- | --- | --- | --- |
| Numeric non-zero, stdout only | `termination=exit`, `code=N` | `status=error`; `error="command exited with code N"` | Same | Trimmed stdout; D has `exitCode=N`, `truncated=false` unless capped | S |
| Numeric non-zero, stderr only, no marker | `termination=exit`, `code=N` | Generic code error | Same | Trimmed stderr; D carries it as summary | T: F `src/cron/command-runner.test.ts:59-76`; U `src/cron/command-runner.test.ts:76-93` |
| Numeric non-zero, empty or whitespace-only output | `termination=exit`, `code=N` | Generic code error | Same | No summary; D message says `with no output` | S |
| Numeric non-zero, mixed output | `termination=exit`, `code=N` | Generic code error unless marker accepted | Generic code error | `stdout:\n...\n\nstderr:\n...`; D receives the same block; U can prepend preserved action lines | S |
| One non-empty stderr marker | `termination=exit`, `code!=0` | Marker payload becomes `error` | Marker has no meaning; generic code error | Entire marker line remains in stderr summary and D | T for F status/error only: `src/cron/command-runner.test.ts:78-93`; summary/D are S |
| One empty or whitespace marker | `termination=exit`, `code!=0` | Marker rejected; generic code error | Generic code error | `CRON_FAILURE:` remains ordinary stderr summary | S |
| Multiple marker lines | `termination=exit`, `code!=0` | All markers rejected because retained count is not exactly one | Generic code error | Every retained marker remains in summary and D | S |
| Marker only on stdout | `termination=exit`, `code!=0` | Ignored; generic code error | Generic code error | Marker is delivered as stdout summary | S |
| Zero-exit marker | `termination=exit`, `code=0`, not killed | `status=ok`; no `error` | Same | Marker is ordinary output; D severity is `info` | S |
| Oversized marker, prefix retained | `termination=exit`, `code!=0` | First 512 UTF-16 code units of trimmed payload become `error`; a surrogate pair can be split | Generic code error | Full captured marker remains in summary/D, bounded only by process capture | T for 512-unit cap and following-line exclusion from `error`: F `src/cron/command-runner.test.ts:95-111`; broader projection is S |
| Oversized stdout/stderr | Any launched result | Each stream retains its newest configured bytes, default 16 MiB | Same tail default; U also preserves qualifying action lines | D sets `truncated=true`; no textual truncation marker is added | T for explicit five-byte tail/counts: F `src/process/exec.no-output-timer.test.ts:99-122`; U `src/process/exec.no-output-timer.test.ts:32-47`; default cap and D are S |
| Marker before retained stderr tail | `code!=0`, stderr truncated | Marker is absent from parser input; generic error | Generic error; an independently action-critical line may survive only in U's preserved summary | Summary contains retained tail; D `truncated=true` | S |
| Marker cut by the tail boundary | `code!=0`, stderr truncated | Rejected if any prefix character is lost; accepted if the retained bytes happen to begin exactly at `CRON_FAILURE:`, even if that position was mid-line before truncation | Generic error | Tail only; D `truncated=true` | S from F tail capture plus line-start parser |
| Marker fully retained after truncation | `code!=0`, stderr truncated | Accepted | Generic error | Retained marker and following tail remain in summary; D `truncated=true` | S |
| Multiple original markers but exactly one retained | `code!=0`, stderr truncated | Accepted because cardinality is evaluated after truncation | Generic error | Only retained tail is visible; D `truncated=true` | S |
| Marker plus a secret on the marker line | `termination=exit`, `code!=0` | Secret enters `error` up to the 512-unit cap | Marker has no meaning at U; an unchanged carry-forward would put the same secret in `error` | Marker line also remains in summary/D | S |
| Marker plus a secret on a following stderr line | `termination=exit`, `code!=0` | Following line is excluded from marker-derived `error` | Generic code error | Following line remains in summary/D and F announce/completion webhook output | T only for exclusion from F `error`: `src/cron/command-runner.test.ts:95-111`; all other projections S |
| Child-requested signal | Usually `termination=signal`, `code=null`, signal set | Marker parser skipped; signal error | Signal error | Captured output remains summary; D has null exit and `signal:*` | Process T at U `src/process/exec.test.ts:178-192`; cron text is S |
| Already-aborted signal | `termination=signal`, `code=null`, no output | `error="command stopped"` | Same | No summary; D has null exit | T for status/error/no summary: F `src/cron/command-runner.test.ts:175-191`; U `src/cron/command-runner.test.ts:184-200`; D metadata is S |
| Wall timeout | `termination=timeout`; F commonly has null code after signal kill, U normalizes null/zero to `124` | Normally `command timed out`; a retained marker overrides it only if F receives a numeric non-zero code | Always `command timed out` | Any retained output remains summary; D is error/truncated as applicable | Generic timeout T in both runner tests; marker interaction S |
| No-output timeout | `termination=no-output-timeout`; output may exist from before the silent interval | Normally fixed no-output timeout text; a retained earlier marker overrides only with numeric non-zero code | Always fixed no-output timeout text | Earlier output remains summary; D records timeout result | Generic timeout T in both runner tests; marker interaction S |
| Launch failure | Process layer throws | Original child-process error message is copied into the outcome; no marker parsing | U constructs a sanitized transport error before the cron catch | No top-level summary; `diagnostics.summary` is the caught error; entry says command failed to start | S; U test `src/process/exec.test.ts:457-467` proves its thrown transport error omits argv values; F has no equivalent sanitizer (`dc43c20df50c:src/process/exec.ts:559-570`) |
| Output-capture failure | Stream/capture boundary fails | **U?** F has no stream-error handler establishing this outcome | U constructs a sanitized transport error before the cron catch | U has no top-level summary; caught error becomes diagnostics summary | F unknown; U S from `src/process/exec-runner.ts:327-332,406-422` and `src/process/exec-result.ts:20-47` |

### Timeout compatibility detail

F's process implementation converts timeout code `0` to `124` but leaves null as null (`dc43c20df50c:src/process/exec.ts:608-620`). U converts both null and zero timeout codes to `124` (`4b85d834ed1586062f31bded2f358fc5192d1674:src/process/exec-runner.ts:425-442`). Consequently, copying F's `typeof code === "number" && code !== 0` marker gate into U would let any retained marker override U's canonical timeout or no-output-timeout error in cases where the same process termination at F skipped marker parsing. This is a behavior expansion, not parity.

### Output precedence detail

The docs say non-empty stdout wins, stderr is used when stdout is empty, and mixed output becomes a small labeled block (`4b85d834ed1586062f31bded2f358fc5192d1674:docs/automation/cron-jobs.md:255-257`). Source confirms that stderr is not discarded in the mixed case. Output never determines success: zero exit with stderr is still `ok`; non-zero exit with stdout is still `error`. A token-only silent reply suppresses announce/webhook delivery; matching is case-insensitive and permits repeated or punctuation-wrapped silent tokens, but a labeled mixed stdout/stderr block with other text remains visible (`4b85d834ed1586062f31bded2f358fc5192d1674:src/gateway/server-cron.ts:770-800`; `4b85d834ed1586062f31bded2f358fc5192d1674:src/auto-reply/tokens.ts:23-29,47-66`).

## End-to-end projection matrix

This matrix describes F as committed and the effect an accepted marker would have if introduced into U's current consumers.

| Surface | F behavior | U behavior for an accepted marker | Compatibility and redaction consequence |
| --- | --- | --- | --- |
| Announce | Sends `result.summary` for failed commands when non-empty, without command-specific redaction (`dc43c20df50c:src/gateway/server-cron.ts:410-455`) | Sends selectively redacted `summary`, independent of `status` and `error` (`4b85d834ed1586062f31bded2f358fc5192d1674:src/gateway/server-cron.ts:770-818`) | The clean marker payload is not the announce body. Marker line and following stderr can be user-visible. U redacts only lines that independently match action patterns. |
| Announce failure | Required failure overwrites F's execution error with the delivery error (`dc43c20df50c:src/gateway/server-cron.ts:465-487`) | Existing execution error is preserved; delivery failure is stored separately as `deliveryError` unless an otherwise successful required-delivery run must become error (`4b85d834ed1586062f31bded2f358fc5192d1674:src/gateway/server-cron.ts:828-853`) | The marker's durable meaning differs between revisions when delivery also fails. U has the safer ownership split. |
| Primary webhook | F detached completion fanout requires a truthy summary and sends the raw event (`dc43c20df50c:src/gateway/server-cron-notifications.ts:214-278`) | U settles primary webhook delivery before final state. Failed payloads omit top-level summary/diagnostics but retain raw `error` (`4b85d834ed1586062f31bded2f358fc5192d1674:src/cron/service/timer-job-runner.ts:48-151`; `4b85d834ed1586062f31bded2f358fc5192d1674:src/gateway/server-cron-notifications.ts:193-210,313-345`) | F may expose all output and diagnostics; U removes failed output but exposes marker text through `error`. |
| Completion webhook | F sends the raw event only when summary exists | U sends failures even without summary; failed payload removes summary/diagnostics and job-state diagnostics (`4b85d834ed1586062f31bded2f358fc5192d1674:src/gateway/server-cron-notifications.ts:442-505`) | U narrows output exposure, but top-level marker error and embedded `job.state.lastError` remain raw. |
| Failure destination | F webhook/chat includes raw marker error (`dc43c20df50c:src/gateway/server-cron-notifications.ts:291-385`) | U webhook/chat also includes raw error (`4b85d834ed1586062f31bded2f358fc5192d1674:src/gateway/server-cron-notifications.ts:165-177,520-623`) | No marker-specific redaction or semantic validation exists. |
| Failure alert | F sends the first 200 UTF-16 units using unsafe `slice` (`dc43c20df50c:src/cron/service/failure-alerts.ts:101-129`) | U sends the first 200 UTF-16-safe units and optional inferred cause (`4b85d834ed1586062f31bded2f358fc5192d1674:src/cron/service/failure-alerts.ts:157-184`) | The marker is directly user-visible; length bounding is not secret redaction. |
| Auto-disable notice | F has no recurring-run ten-failure auto-disable path | U puts the first 200 safe units of the last error in the owner notification after ten recurring failures (`4b85d834ed1586062f31bded2f358fc5192d1674:src/cron/service/auto-disable.ts:10-49,88-107`) | Marker contents become notification text. |
| Job state and SQLite | Raw marker becomes `lastError`; normalized `lastDiagnostics` is separately bounded and known-pattern redacted (`dc43c20df50c:src/cron/service/timer.ts:409-430`; `dc43c20df50c:src/cron/store/state-codec.ts:30-44`) | Same separation (`4b85d834ed1586062f31bded2f358fc5192d1674:src/cron/service/timer-outcomes.ts:94-114`; `4b85d834ed1586062f31bded2f358fc5192d1674:src/cron/store/state-codec.ts:27-41`) | Marker `error` is raw and durable. Only state diagnostics receive generic secret-pattern redaction. |
| Delivery state | Failed announce runs are represented as `not-delivered` even when their summary send succeeded; marker error can become `lastDeliveryError`. F's detached primary webhook cannot settle the run's delivery result (`dc43c20df50c:src/cron/service/timer.ts:303-378,432-447`; `dc43c20df50c:src/gateway/server-cron-notifications.ts:214-278`) | Failed announce has the same error-run shape, but a successfully accepted U primary webhook is recorded as `delivered` and does not duplicate the marker into `lastDeliveryError` (`4b85d834ed1586062f31bded2f358fc5192d1674:src/cron/service/timer-job-runner.ts:48-151`; `4b85d834ed1586062f31bded2f358fc5192d1674:src/cron/service/timer-trigger.ts:227-304`) | User-visible announce delivery and persisted announce status are intentionally not equivalent for failed runs; U's owned primary-webhook path is a distinct delivered case. |
| Run/task history | F appends raw error, summary, and diagnostics (`dc43c20df50c:src/gateway/server-cron.ts:574-617`; `dc43c20df50c:src/cron/run-log/sqlite-store.ts:46-76`) | U's finished event and task detail carry raw error, summary, and runner diagnostics (`4b85d834ed1586062f31bded2f358fc5192d1674:src/cron/service/timer-outcomes.ts:691-728`; `4b85d834ed1586062f31bded2f358fc5192d1674:src/cron/task-run-event-codec.ts:24-55`) | State-diagnostic redaction does not sanitize raw history fields. History read normalization is not an arbitrary-secret redactor. |
| Gateway broadcast | Broadcasts raw event | Broadcasts raw top-level event while filtering only scheduler fields from the job snapshot (`4b85d834ed1586062f31bded2f358fc5192d1674:src/gateway/server-cron.ts:1025-1031`) | Marker error, summary, and diagnostics remain available to Gateway clients. |
| Plugin hook | F sends raw top-level error/summary and job state (`dc43c20df50c:src/gateway/server-cron.ts:537-573`) | U selectively redacts command summary, but raw top-level `error`, job `lastError`, and cloned command payload remain (`4b85d834ed1586062f31bded2f358fc5192d1674:src/gateway/server-cron.ts:228-265,1040-1070`) | Error and configured command payload secrets are outside the command-summary redactor. |
| CLI and UI | No focused marker fixture | U CLI prints full `lastError`; run UI prefers summary body and adds error metadata when both exist (`4b85d834ed1586062f31bded2f358fc5192d1674:src/cli/cron-cli/shared.ts:537-566`; `4b85d834ed1586062f31bded2f358fc5192d1674:ui/src/pages/cron/view-runs.ts:296-370`) | The marker does not replace noisy output in history UI; it adds a second representation. |

## Task state and retries

At the command-runner boundary, all launched marker cases preserve the process-derived `status`; the marker changes text, not success/failure. A non-zero marker therefore increments `consecutiveErrors`. A zero-exit marker records `ok` and resets the error streak only when later required delivery does not change the final status to `error` (`dc43c20df50c:src/cron/service/timer.ts:450-483`; `dc43c20df50c:src/gateway/server-cron.ts:465-473`; `4b85d834ed1586062f31bded2f358fc5192d1674:src/cron/service/timer-outcomes.ts:139-180`; `4b85d834ed1586062f31bded2f358fc5192d1674:src/gateway/server-cron.ts:828-839`).

F behavior:

- Raw marker text is assigned to `lastError`, passed to provider-style error-reason inference, and logged as the run error (`dc43c20df50c:src/cron/service/timer.ts:409-430`).
- `cron.retry` can configure categories, maximum attempts, and backoff. Defaults are three transient retries using the first three steps of the normal error-backoff schedule (`dc43c20df50c:src/config/types.cron.ts:4-14,32-37`; `dc43c20df50c:src/cron/service/timer.ts:220-300`).
- Marker text such as `HTTP 429`, `timeout`, or a network code can make a plain process exit transient. Conversely, a marker can replace a genuine timeout with permanent-looking text when its numeric-code gate is met. F's broad rate-limit regex also treats any `429` or `cloudflare` text as transient (`dc43c20df50c:src/cron/retry-hint.ts:21-29`).
- A one-shot job is disabled after a permanent error or after transient retries are exhausted. Recurring errors receive retry/backoff scheduling but F has no U-style ten-run recurring auto-disable (`dc43c20df50c:src/cron/service/timer.ts:489-617`).

U behavior:

- U removed the public `cron.retry` configuration. It uses a fixed maximum of three transient retries and the `30s, 60s, 5m` retry prefix (`4b85d834ed1586062f31bded2f358fc5192d1674:src/config/types.cron.ts:23-40`; `4b85d834ed1586062f31bded2f358fc5192d1674:src/cron/service/timer-trigger.ts:15-16,59-109`).
- U's text classifier is narrower for incidental `429` and `5xx` numbers, but still consumes free-form error text. Structured classifications win only when present; command runner results do not provide one (`4b85d834ed1586062f31bded2f358fc5192d1674:src/cron/retry-hint.ts:17-68`).
- A schedule-consuming one-shot permanent error disables immediately. Three retries mean the fourth consecutive transient failure disables and preserves the job. A forced run that borrows a future `at` occurrence preserves that occurrence and cannot disable or retry it. Schedule-owning, schedule-advancing recurring errors use the extended `30s, 60s, 5m, 15m, 60m` lower-bound schedule and auto-disable on the tenth consecutive execution failure. Forced recurring runs using preserve mode and completions with stale schedule ownership do not mutate retry scheduling or auto-disable state for that completion (`4b85d834ed1586062f31bded2f358fc5192d1674:src/cron/service/ops-run.ts:176-214`; `4b85d834ed1586062f31bded2f358fc5192d1674:src/cron/service/timer-outcomes.ts:184-214,246-405`; `4b85d834ed1586062f31bded2f358fc5192d1674:src/cron/service/jobs-scheduling.ts:49-81`; `4b85d834ed1586062f31bded2f358fc5192d1674:src/cron/service/auto-disable.ts:10-14,88-107`).
- Schedule-computation failures are separate and auto-disable after three errors; marker text does not directly control that counter (`4b85d834ed1586062f31bded2f358fc5192d1674:src/cron/service/jobs-scheduling.ts:362-401`).

The compatibility issue is not that marker failures fail to count. They count correctly. The issue is that untyped process-controlled text becomes policy input for retry timing, one-shot disable, inferred error reason, recurring retry acceleration, alerts, and final auto-disable text.

## Secret redaction audit

### What is bounded or redacted

- F bounds only the selected marker-derived `error` to 512 UTF-16 code units. It does not redact that text and can split a surrogate pair (`dc43c20df50c:src/cron/command-runner.ts:58-65`).
- F and U normalize job-state diagnostics to ten latest entries, 1,000 characters per entry, and a 2,000-character summary. Known secret patterns are redacted there (`dc43c20df50c:src/cron/run-diagnostics.ts:76-162`; `4b85d834ed1586062f31bded2f358fc5192d1674:src/cron/run-diagnostics.ts:49-57`; `4b85d834ed1586062f31bded2f358fc5192d1674:src/cron/run-diagnostics-normalize.ts:94-172`).
- U redacts URLs, code-like values, and token/password/secret assignments only on action-critical command-summary lines before announce, hook summary, and webhook delivery (`4b85d834ed1586062f31bded2f358fc5192d1674:src/cron/command-output-summary.ts:79-112`).
- U failed primary/completion webhook payloads omit top-level summary and diagnostics and strip embedded job diagnostics (`4b85d834ed1586062f31bded2f358fc5192d1674:src/gateway/server-cron-notifications.ts:77-130,193-210`).
- Generic logger transports apply configured known-pattern redaction, but that is not arbitrary marker-content sanitization.

### What remains raw

- Marker payload in `error`, including same-line secrets.
- `lastError`, public job state, CLI display, Gateway event error, plugin hook error, failure destination payload, failure alert text, and auto-disable text.
- Ordinary non-action-critical command summaries in U.
- F announce and completion webhook summaries, including stderr following the marker.
- Raw error and summary in run/task history. Runner diagnostics also contain JSON-quoted argv; argv secrets can enter history and internal diagnostics even though U's lower process transport errors are sanitized.
- F launch exception messages are copied directly into the cron outcome; unlike U, F has no sanitized transport-error construction for launch errors at this boundary (`dc43c20df50c:src/process/exec.ts:559-570`; `4b85d834ed1586062f31bded2f358fc5192d1674:src/process/exec-result.ts:20-47`). F output-capture failure behavior is unproven because its stream path has no equivalent error handler.
- Command job payload fields cloned into plugin jobs and webhook job snapshots. Configured `argv`, `env`, and `input` are outside the command-summary redactor.

### Unknown redaction behavior

- **U?** Channel plugins or external webhook receivers may add their own sanitization; that is outside this repository/proposal scope and was not inspected.
- **U?** Whether an arbitrary domain secret happens to match the generic logger redactor depends on the value and runtime registered-secret set.
- **U?** No fixture proves a complete marker-plus-secret route across state, history, announce, hooks, alerts, primary webhook, completion webhook, and failure destination.

## Existing fixture and test inventory

### Fork marker-specific coverage

- Extraction from one non-empty stderr marker on exit 1: `dc43c20df50c:src/cron/command-runner.test.ts:78-93`.
- 512-unit cap and exclusion of a following `secret body` line from `result.error`: `dc43c20df50c:src/cron/command-runner.test.ts:95-111`.
- Repository-wide F search finds no other product or test `CRON_FAILURE` references.

### Runner and process coverage

- F runner basics: stdout success, exact `NO_REPLY`, generic non-zero stderr, wall timeout, shell process-tree kill, no-output timeout, and pre-abort: `dc43c20df50c:src/cron/command-runner.test.ts:25-191`.
- U runner basics plus early action-line preservation: `4b85d834ed1586062f31bded2f358fc5192d1674:src/cron/command-runner.test.ts:42-200`.
- Per-stream tail capture, truncation counts, wall timeout, and no-output timeout: F `src/process/exec.no-output-timer.test.ts:72-163`; U `src/process/exec.no-output-timer.test.ts:5-72`.
- U process fixtures cover pre-abort, child-requested signal, timeout kill signal, preserved truncated lines, UTF-8-safe truncation, independent stream caps, and sanitized transport errors: `4b85d834ed1586062f31bded2f358fc5192d1674:src/process/exec.test.ts:158-207,243-389,429-467`.

### Upstream output, delivery, state, and retry coverage

- Action-block construction and URL/code/token redaction: `4b85d834ed1586062f31bded2f358fc5192d1674:src/cron/command-output-summary.test.ts:7-46`.
- Command `NO_REPLY` handling: the announce fixture checks the resulting run state but does not assert that the send mock was untouched; the webhook fixture directly asserts that no request was made (`4b85d834ed1586062f31bded2f358fc5192d1674:src/gateway/server-cron.test.ts:1444-1479,1849-1883`). Announce suppression itself is source-backed at `4b85d834ed1586062f31bded2f358fc5192d1674:src/gateway/server-cron.ts:770-800`.
- Execution error preserved when announce delivery also fails: `4b85d834ed1586062f31bded2f358fc5192d1674:src/gateway/server-cron.test.ts:1522-1569`.
- Hook and announce action-line redaction: `4b85d834ed1586062f31bded2f358fc5192d1674:src/gateway/server-cron.test.ts:1885-1981`.
- Completion webhook action-line redaction and failed-command summary/diagnostic omission: `4b85d834ed1586062f31bded2f358fc5192d1674:src/gateway/server-cron-notifications.test.ts:930-1090`.
- Real loopback webhook fixture for successful command delivery persistence and failed-command failure-destination persistence: `4b85d834ed1586062f31bded2f358fc5192d1674:src/cron/cron-delivery-outcomes.e2e.test.ts:25-239`.
- Detached failure-destination delivery remains `unknown` in finished state: `4b85d834ed1586062f31bded2f358fc5192d1674:src/cron/service.persists-delivered-status.test.ts:772-801`.
- Retry classifier positive and incidental-number cases: `4b85d834ed1586062f31bded2f358fc5192d1674:src/cron/retry-hint.test.ts:9-155`.
- Fourth one-shot transient failure disables; tenth recurring failure auto-disables: `4b85d834ed1586062f31bded2f358fc5192d1674:src/cron/service/timer.regression.test.ts:240-280,2890-2941`.
- State-diagnostic bounds, known-secret redaction, and UTF-16-safe truncation: `4b85d834ed1586062f31bded2f358fc5192d1674:src/cron/run-diagnostics.test.ts:17-55`.

## Coverage gaps

No existing fixture establishes these marker-specific behaviors:

- Empty, multiple, indented, case-mismatched, stdout-only, CRLF-specific, or zero-exit markers.
- Marker selection on child signal, wall timeout, no-output timeout after earlier output, abort races, or outer scheduler-watchdog races.
- Marker before, across, exactly at, or after a stderr tail boundary; multiple original markers reduced to one retained marker.
- UTF-16-safe marker capping or a marker larger than the process output cap.
- Accepted marker with stdout plus stderr, whitespace-only streams, or action-critical preserved output.
- Distinct arbitrary secrets on the marker line and following lines.
- Marker-driven retry classification, one-shot retry exhaustion, recurring backoff, inferred `lastErrorReason`, failure-alert cause, or ten-failure auto-disable.
- Durable `lastError`, duplicated `lastDeliveryError`, normalized state diagnostics, raw task history, Gateway broadcasts, plugin hooks, CLI, and UI projections.
- Failed announce behavior at F versus U, including U's preservation of execution error alongside `deliveryError`.
- Primary webhook, completion webhook, failure destination, and failure-alert payloads containing marker text.
- Command payload secret handling for `argv`, `env`, and `input` at plugin/webhook job-snapshot boundaries.

Existing non-marker gaps relevant to this assessment are:

- No focused command-runner fixture for successful empty/whitespace output or real mixed stdout/stderr.
- No focused cron-level child-signal text fixture.
- No full command-payload fixture for inner process timeout versus outer cron watchdog precedence.
- No fixture proving that ordinary non-action-critical command output is intentionally unchanged by external redaction.
- No fixture proving omission or sanitization of command `argv`, `env`, and `input` in plugin/webhook job snapshots.

## Compatibility diagnosis

The marker is locally coherent only for one narrow case: a normal numeric non-zero exit whose single marker line survives capture intact. Even there, it provides a second error representation rather than replacing process output. The marker payload becomes policy and notification text, while the original marker and adjacent stderr continue through summary and diagnostic paths.

The carry-forward risks are concrete:

- **Termination regression:** U's timeout normalization broadens F's numeric-code marker gate, allowing retained marker text to hide canonical timeout/no-output-timeout reasons.
- **Truncation ambiguity:** post-truncation cardinality and line starts can reject a real marker, accept one of several original markers, or accept a prefix exposed only by a tail boundary.
- **Policy injection:** process-controlled free-form text can change retry category and timing without a typed error classification.
- **Disclosure mismatch:** a bounded `error` coexists with raw or selectively redacted summary, diagnostics, state, history, hooks, alerts, and payload snapshots.
- **Projection mismatch:** announce users and run-history users usually see summary first, not the marker-derived error; failure destinations and CLI see the marker instead.
- **Delivery semantic drift:** F overwrites execution error on required announce failure, while U correctly preserves execution and delivery errors separately.

Best-fix assessment: an unchanged single marker-line stderr convention is not the best owner boundary for U. Any future explicit command-failure feature would need a structured, truncation-aware execution result with a closed retry classification and separately defined operator error, deliverable output, diagnostic, persistence, and external-redaction contracts. This assessment does not implement or specify such a change.

## Confidence

**High (0.93).** The marker parser, process capture, summary construction, delivery projections, state persistence, retry classifier, backoff/disable policy, docs, and relevant fixtures were inspected directly at both pinned objects. Confidence is below absolute because tests were prohibited and not run; timeout/signal races are platform-sensitive; no live channel or webhook behavior was observed; and downstream sanitization outside this repository is intentionally unknown.

Proposal verdict: Reject carrying `dc43c20df50c843537e39f77789b3994d534e579` forward as-is at `4b85d834ed1586062f31bded2f358fc5192d1674`; its bounded marker error is not an end-to-end bounded or redacted failure contract, and it lets truncated process text redefine timeout and retry semantics across current upstream consumers.
