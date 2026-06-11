# Investigation: quick-wave-8890 Post-Upstream-Sync Runtime Regression

Date: 2026-06-10

## Scope

Investigated the reported post-upstream-sync regression where actionable turns can terminate after promise-only/planning-only assistant text instead of continuing through tools, plus the related `sessions.send` versus `sessions_send` delivery semantics.

This was investigation-only. No production fixes were written.

## Summary

The prompt-level action bias is still present in the base OpenClaw system prompt, and current OpenAI/Codex GPT-5 overlays do not override that `execution_bias` section. The current embedded runner also has deterministic incomplete-turn/planning-only/reasoning-only retry logic wired into the terminal path and covered by focused tests.

The likely regression surface is therefore not a simple deletion of the prompt guard. The important behavioral gap is between the new generic `packages/agent-core` loop semantics and the higher-level embedded-runner safety policy: `packages/agent-core/src/agent-loop.ts` exits normally after an assistant turn with no tool calls unless an injected `shouldStopAfterTurn`, steering, or follow-up hook intervenes. Search found no current `shouldStopAfterTurn` production wiring outside the type and loop itself, so promise-only final text can be a normal low-level loop completion unless the caller routes through the embedded-runner incomplete-turn policy.

`sessions.send` and `sessions_send` are distinct contracts. Treating them as interchangeable would be a bug in analysis or fixes.

## Evidence

Prompt guard:

- `src/agents/system-prompt.ts:448` builds `## Execution Bias` with “Actionable request: act in this turn” and “do not finish with a plan/promise when tools can move it forward.”
- `src/agents/system-prompt.ts:1085` inserts the overridable `execution_bias` section.
- `src/agents/gpt5-prompt-overlay.ts:149` returns only `stablePrefix` plus an `interaction_style` override in friendly mode; it does not override `execution_bias`.

Low-level loop behavior:

- `packages/agent-core/src/agent-loop.ts:355` calls optional `config.shouldStopAfterTurn` after `turn_end`.
- `packages/agent-core/src/agent-loop.ts:367` polls steering messages after that hook.
- `packages/agent-core/src/agent-loop.ts:370` only polls follow-up messages after the loop would otherwise stop.
- `packages/agent-core/src/agent-loop.ts:378` breaks when there are no more tool calls/messages.
- `packages/agent-core/src/types.ts:197` documents `shouldStopAfterTurn`; search found only the type and loop references, no production caller wiring.

Embedded-runner guard:

- `src/agents/embedded-agent-runner/run.ts:1192` resolves the planning-only retry limit from the execution contract.
- `src/agents/embedded-agent-runner/run.ts:3143` resolves planning-only retry instruction before terminal success.
- `src/agents/embedded-agent-runner/run.ts:3177` retries planning-only turns while under limit.
- `src/agents/embedded-agent-runner/run.ts:3310` turns exhausted strict-agentic planning-only runs into `STRICT_AGENTIC_BLOCKED_TEXT`.
- `src/agents/embedded-agent-runner/run.ts:3475` surfaces incomplete-turn payloads before normal success.
- `src/agents/embedded-agent-runner/run/incomplete-turn.ts:220` defines the planning-only retry instruction.
- `src/agents/embedded-agent-runner/run/incomplete-turn.ts:228` defines the strict-agentic blocked terminal text.

Session delivery contracts:

- `packages/gateway-protocol/src/schema/sessions.ts:163` defines `SessionsSendParamsSchema` with `key`, `agentId`, `message`, `thinking`, `attachments`, `timeoutMs`, and `idempotencyKey`; it has no `deliver` field.
- `src/gateway/server-methods/sessions.ts:756` implements `handleSessionSend`.
- `src/gateway/server-methods/sessions.ts:858` delegates `sessions.send` to `chat.send` with `timeoutMs` and session metadata.
- `packages/gateway-protocol/src/schema/agent.ts:181` defines `AgentParamsSchema`, including `deliver` and `bestEffortDeliver`.
- `src/agents/tools/sessions-send-tool.ts:566` builds `sessions_send` tool `agent` params with `deliver: false`, `sourceReplyDeliveryMode: "message_tool_only"`, internal channel routing, nested lane, and provenance.
- `src/agents/tools/sessions-send-tool.ts:631` starts the A2A follow-up flow when applicable.
- `src/agents/tools/sessions-send-tool.a2a.ts:43` sends announce replies via gateway `send`, not `sessions.send`.

## Test Proof

All focused checks passed:

- `pnpm test src/agents/embedded-agent-runner/run.incomplete-turn.test.ts -- --reporter=verbose`
- Result: `117` tests passed, `1` file passed, wrapper reported `[test] passed 1 Vitest shard in 38.59s`.
- `pnpm test packages/agent-core/src/agent-loop.test.ts -- --reporter=verbose`
- Result: `3` tests passed, `1` file passed, wrapper reported `[test] passed 1 Vitest shard in 27.00s`.
- `pnpm test src/gateway/server.sessions-send.test.ts -- --reporter=verbose`
- Result: `8` tests passed across `2` gateway project files, wrapper reported `[test] passed 1 Vitest shard in 37.67s`.

## Conclusion

The current tree already contains robust embedded-runner incomplete-turn protections and passing focused tests for planning-only, reasoning-only, empty, and side-effect-sensitive terminal paths. The investigation did not prove that those protections are absent.

The remaining high-confidence risk is path coverage: any caller using the new low-level `packages/agent-core` loop without embedded-runner policy can accept promise-only text as a normal final answer when no tool calls are emitted. A production fix, if requested later, should first identify the exact caller path that bypasses embedded-runner policy, then either wire equivalent stop/continuation policy there or ensure actionable user turns route through the embedded runner.

For delivery semantics, a fix should not add `deliver` to `sessions.send` or assume `sessions.send` behaves like the model-facing `sessions_send` tool. `sessions.send` is a gateway session message API; `sessions_send` is an agent tool that launches an internal `agent` run with delivery disabled and then separately handles A2A reply/announcement delivery.

## Proof Gaps

- No live provider run was executed; this report is based on source tracing and focused local tests.
- No production code fix was attempted, per task constraint.
- The preferred `scripts/investigation-path.py --task-id quick-wave-8890 --project . --touch` helper was unavailable in this checkout, so this fallback report path was used.
