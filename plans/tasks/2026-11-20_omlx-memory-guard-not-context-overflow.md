---
title: "oMLX memory guard: prevent false context overflow and compaction"
type: implementation
---

# oMLX memory guard: prevent false context overflow and compaction

## Goal

A prefill RAM-admission rejection must not be presented as token-window overflow or trigger overflow compaction. Preserve an accurate resource/memory diagnostic rather than telling the user their tool schema is invalid.

## Files and evidence

- `src/agents/embedded-agent-helpers/errors.ts`: `isContextOverflowError`, `isLikelyContextOverflowError`, failover/runtime-error classification and user-facing formatting.
- `src/agents/embedded-agent-helpers/provider-error-patterns.ts` and existing provider hook seams, if needed; preserve provider ownership conventions.
- Existing adjacent errors/structured-signal tests and `src/agents/embedded-agent-runner/run.ts` overflow-recovery tests.
- Read-only dependency/log contract: `plans/checkpoints/omlx-prefill-memory-20261120-evidence.md`. All external evidence needed for this repair is materialized there.

## Change

The observed HTTP400 text begins `oMLX prefill memory guard rejected this prompt: Prefill would require ~61.90 GB peak` and includes `but the prefill limit is 59.80 GB`. The broad regex matches `prompt...limit`, inducing up to three compactions, while another path calls it format/schema failure. Structured oMLX contract code/omlx_code is `prefill_memory_exceeded`; the current transport may retain only text. Use recognized structured signals where actually preserved and a narrowly scoped textual equivalent where required, without weakening genuine overflow detection. Upstream main `238160cf99b254aebd96a8ed34b9148b3e56903b` still has the same broad false-positive heuristic; there is no ready-made oMLX repair to adopt. Use the narrow semantic-exclusion plus regression-test pattern of upstream PR #121790 (LM Studio prompt-template errors) as design inspiration, adapting to existing fork owners rather than importing its newer failover module architecture. The normal memory guard rejection describes insufficient headroom, not proof that capacity will recover. Preserve the distinction illustrated by upstream PR #130275 between recoverable throttling and an unsatisfiable request, without treating its Groq token-quota parser as a RAM classifier. Do not label every such error transient merely to obtain retries. Keep mid-prefill `prefill_memory_aborted` distinct and do not replay already-started work.

## Boundaries

Repository-local source/tests/docs only. No provider queue/semaphore, new retry behavior, timeout changes, global context reduction, runtime config edits, live inference/GPU/provider calls, deployment or restart. Do not inspect other repositories, installed app files or private home/runtime state. Preserve unrelated working files and normal review/approval gates.

## Verification

Implement the TDD cycle using skill:tdd. Through real exported classifiers/formatter and runner recovery seam, prove the observed text and structured HTTP400 variants do not enter overflow compaction and retain an accurate memory diagnostic. Cover genuine token overflow still recovering, ordinary malformed-tool HTTP400 retaining schema handling, and mid-stream abort not silently replaying. Reuse adjacent test files and repository-supported focused test commands; record commands/results and source-vs-deployed proof boundary. A copied-regex-only probe is not sufficient acceptance.
