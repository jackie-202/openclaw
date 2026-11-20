---
title: "OpenClaw compaction: zjistit příčinu OAuth/API-key route mismatch"
type: investigation
---

# OpenClaw compaction: zjistit příčinu OAuth/API-key route mismatch

## Cíl

Read-only investigation of why manual/budget compaction fails authentication while normal turns and some local automatic compactions succeed for the same configured OpenAI model. Produce a minimal evidence-backed repair recommendation and characterize the relevant route/auth contract with existing offline tests where feasible. No production edits in this investigation.

## Observed incident, not an assumed code root cause

On 2026-10-15 the Discord startups session repeatedly hit OpenClaw's local tool-loop context guard. Gateway log records 4364, 4409 and 6598 report trigger=cli_budget outcome=failed with `Auth profile openai:default uses oauth auth but openai/openai-completions requires an OpenAI API key`. Another attempt (log record 5845, trigger=overflow) failed timeout after ~906 seconds. These messages prove failures, not which owner is incorrect. Normal model gpt-6.1-sol turns show successful usage. agents.defaults.contextTokens was 128000; compaction safeguard reserveTokensFloor 20000; no explicit compaction model override. The configured model catalog contextWindow reported 200000. Never infer actual provider context capability from this catalog alone.

## Source scope / comparison

Inspect the compaction model/auth resolution, getApiKeyForModel, prepareProviderRuntimeAuth and normal-turn equivalent routing, plugin ownership and supported compaction configuration. Starting points: src/agents/embedded-agent-runner/compact.ts around runtime auth preparation; src/agents/embedded-agent-runner/run.ts overflow recovery; extensions/openai and relevant existing auth tests. Read applicable repository instructions, relevant docs and directly relevant dependency contracts before a verdict. Keep analysis repo-local; do not access private session archives, credentials or live config. Supplied incident text is sufficient to construct synthetic offline inputs.

## Deliverable

Write plans/checkpoints/compaction-oauth-route-parity-20261015.md with: exact entry points and compared contracts; configuration-only vs executable-logic cause distinction; minimal repair owner and precise change if established; why normal turns differ; existing or focused offline test evidence; unknowns clearly labeled. Account for manual compaction versus overflow recovery. Do not conclude that larger context alone fixes authentication failures. Do not assert that sentinel compactionTokens=128001 is a measured prompt size.

## Safety and non-goals

No source/config/instruction changes, credentials/auth state reads, provider calls, live transcript replay, messages, local model calls, installations, services/restarts/deployments or schedulers. No task/batch lifecycle operations. No global timeout increases, new auth fallback or credential conversion as a workaround. Keep existing test assertions and access controls. If an actionable defect is established, describe a bounded repair, do not implement it in this investigation.

## Verification

Use existing focused offline tests for the relevant auth/routing seam where possible; record exact commands and results. Do not fabricate a successful runtime compaction from source-only tests. Bound command output; write detailed evidence into the checkpoint and return a concise report.
