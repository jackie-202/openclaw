---
title: "Session status: report channel-inherited thinking instead of provider fallback"
type: implementation
---

# Session status: report channel-inherited thinking instead of provider fallback

## Goal

Make read-only `session_status` report the same effective thinking level as the target channel's reply resolver when no session thinking override exists.

## Verified cause and files

`src/auto-reply/reply/get-reply-directives.ts` resolves explicit run/message → session → `channelRuntimeProfile.thinkingLevel` before defaults. `src/agents/tools/session-status-tool.ts` passes only `statusSessionEntry.thinkingLevel`; `src/status/status-text.ts` subsequently falls through agent/global/provider defaults without the channel profile. Installed distribution has the same omission. Operator observation: channel profile xhigh, session thinking unset, actual transcript thinking-level event xhigh, status medium. These are supplied facts; do not read host config or transcripts.

Primary owner: `src/agents/tools/session-status-tool.ts`; reuse `src/channels/model-overrides.ts` channel-profile resolution. Existing tests: `src/agents/openclaw-tools.session-status.test.ts`, `src/auto-reply/reply/commands-status.thinking-default.test.ts`. Keep changes bounded to status thinking resolution and its regression coverage; avoid a new parallel precedence policy.

## Change and boundaries

Use the target session's channel identity and existing channel matching semantics. Preserve session override (including off) over channel, then existing agent/global/provider defaults. Do not use the caller's channel for a different target session. No thinking/session/config writes, model switching, unrelated reasoning-display changes, provider calls, restart, deployment or sibling-repository access. The separate model parameter API is unchanged.

## Verification

Add synthetic regression coverage for inherited xhigh, explicit session override/off, no channel match, and a different target session. Verify a status read leaves persisted session/model state unchanged. Run the focused files through `pnpm test:fast <test-file-paths>` and retain ordinary independent acceptance and registered project gates. Repository-local source/tests only.

## Previous Plan (rejected - attempt 1)

Plan file: /Users/michal/Projects/openclaw-fork/plans/2026-11-01_task-8a0a31d9-d984-4256-be36-786577f29660_session-status-report-channel-inherited-thinking-instead-of.md
Review feedback: The required TDD decision is justified and the fix is direct and appropriately scoped, but the verification plan silently omits the task’s required independent acceptance and registered project gates; explicitly retain those alongside the focused RED/GREEN tests.
Read the previous plan, understand what was wrong, and produce a corrected plan.
