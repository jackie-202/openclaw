# oMLX prefill memory rejection — host evidence, 2026-11-20

Passive inspection only: no inference request, runtime configuration change, process signal, restart or production code change. This artifact materializes the relevant external evidence so workers need not access home configuration, sessions or installed application files.

## Observed failure

Gateway log, 2026-11-20T13:45:57.323+01:00, oMLX OpenAI-compatible chat route:

```
400 oMLX prefill memory guard rejected this prompt: Prefill would require ~61.90 GB peak (current 50.75 GB + KV+SDPA 11.15 GB) but the prefill limit is 59.80 GB (dynamic ceiling 65.00 GB - safety margin 5.20 GB). Close other apps to free RAM (macOS and other apps leave oMLX 65.00 GB of the 88.32 GB static cap, and oMLX already uses all but 14.25 GB of it), raise memory_guard_tier (safe → balanced → aggressive), or reduce context length. To continue, set Memory Guard to aggressive, raise the custom memory guard ceiling, free system memory, or compact/reduce context.
```

Gateway classified this as failoverReason=format, providerRuntimeFailureKind=schema; user-facing copy was `LLM request failed: provider rejected the request schema or tool payload.` At 13:45:57.400 the runner also logged context-overflow-diag, observedTokens=unknown, compactionTokens=200001, compactionAttempts=0, using this same error. Further occurrences show attempts 1, 2 and 3. The 200001 is a synthetic ctxInfo.tokens+1 fallback in run.ts, not a measured prompt token count.

The server logged 49 preflight rejections during the 13th hour, prompts 26,034–72,706 tokens. One matching 13:45:58 rejection had 43,439 tokens. The configured model context is 262,144, effective agent context cap 200,000; this case is a RAM-admission rejection below those limits. This does NOT prove every rejected prompt would fit after waiting, nor that all local errors have the same cause.

## Source-level reproduction of false-positive condition

`src/agents/embedded-agent-helpers/errors.ts` CONTEXT_OVERFLOW_HINT_RE contains `prompt.*(too (?:large|long)|exceed|over|limit|max(?:imum)?)`. The exact message above matches from `prompt: Prefill would require` through `prefill limit`. A Node regex probe confirmed this match. `isLikelyContextOverflowError` reaches that heuristic even when strict `isContextOverflowError` is false. HTTP400 without a recognized semantic class separately falls back to format. `src/agents/embedded-agent-runner/run.ts` allows three overflow recovery compactions.

## External dependency contract, read directly by host

Installed oMLX source (reported status version 0.7.3) constructs an OpenAI body shaped as:

```json
{
  "error": {
    "message": "<the RAM rejection above>",
    "type": "invalid_request_error",
    "code": "prefill_memory_exceeded",
    "omlx_code": "prefill_memory_exceeded"
  },
  "type": "error"
}
```

The dependency conditionally adds numeric `estimated_bytes` and `limit_bytes` fields. This is a source-derived envelope shape, not captured raw response bytes. Observed Gateway text is verbatim above; whether the active adapter retains each structured field is unproven and must be checked in repository-local transport code/tests. Contract locations: installed server.py `_prefill_memory_openai_error_body`, `_status_to_error_type`, `prefill_memory_exceeded_handler`. A mid-prefill abort instead uses code/omlx_code `prefill_memory_aborted`, different wording, and may already have emitted tokens; do not assume it is safe to replay.

Current installed server route calls engine.preflight_chat BEFORE building StreamingResponse. The scheduler estimates current footprint + KV/attention temporary peak against its effective admission ceiling (including safety/cache constraints). Preflight helper can wait briefly for post-request cleanup and attempt eligible memory reclaim, then rejects if still over; it does not generally wait for active generations to finish. Disk source is supporting evidence, not proof of byte-identical modules already loaded into the long-lived process.

## Live passive settings and queue facts

Authenticated GET global-settings returned max_concurrent_requests=1, prefill_memory_guard=true, memory_guard_tier=balanced. No changes made. Queueing generation concurrency is already serialized at the scheduler, not at HTTP admission. Accepted requests can wait in scheduler.waiting; its current source waiting cap with concurrency1 is max(1\*4,32)=32, queue-full maps to503+Retry-After. Memory admission/store-cache stalls have separate60s no-progress guards. A subsequent passive GET status returned waiting_requests=1; active_requests=2 counts output collectors (includes queued requests), NOT two simultaneously decoding requests.

No current supported OpenClaw provider-specific concurrency config was found. main lane default4 and agents.defaults.maxConcurrent are shared across cloud/local sessions; lowering that is not independent oMLX isolation. Provider queue/retry is a separate behavior change, outside the classifier repair. Do not disable memory protection or globally reduce context as part of this task.
