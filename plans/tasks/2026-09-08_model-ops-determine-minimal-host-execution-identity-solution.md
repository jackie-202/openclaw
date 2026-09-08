# Model Ops: determine minimal host execution-identity solution

## Objective

Bounded read-only investigation in openclaw-fork: determine whether an existing supported plugin API can securely bind native allow-once approval to the exact subsequent tool execution run, and if not specify the smallest backward-compatible host change. Do not implement or deploy in this investigation.

## Operator evidence (external plugin; do not traverse outside this repository)

Installed Model Ops 0.1.0 registers a before_tool_call hook. For apply it validates event/context agentId, sessionKey, runId, toolCallId; prepares exact params + source config hash and requests native allow-once/deny. onResolution allow-once stores a receipt in a plugin-instance Map keyed by toolCallId containing all four identities plus prepared parameters. The execute closure receives toolCallId and params and factory context agentId/sessionKey, consumes the receipt and verifies agent/session/call/params/source hash, but cannot compare runId. No approved write has been attempted. Optional tool has not been exposed. Prior KM audit required host proof of global toolCallId uniqueness or trusted runId at execution. Installation has succeeded; do not repeat packaging work.

## Fresh host evidence / starting points

- src/plugins/tool-types.ts OpenClawPluginToolContext exposes agentId/sessionKey/sessionId but no runId.
- src/agents/agent-tool-definition-adapter.ts calls runBeforeToolCallHook with hookContext, then tool.execute(toolCallId, executeParams, signal, onUpdate) without runId.
- src/agents/embedded-agent-runner/run/attempt.tool-call-normalization.ts normalizeToolCallIdsInMessage resets fallbackIndex=1 per message and emits call_auto_1 etc. Provider IDs also remain model-supplied. Do not assume global cross-run uniqueness.
- src/agents/agent-tools.before-tool-call.ts owns native approval and execution wrapping.
- src/plugins/runtime/gateway-request-scope.ts and existing public plugin runtime context APIs may already provide an appropriate trusted scope; inspect before recommending any new API.

## Boundaries

Read and run only existing narrow local tests in openclaw-fork. No real host configuration, installed extension, credentials or another repository access; use supplied plugin behavior above. No OpenClaw installation/build/deployment/restart, plugin enablement, permission changes, model writes, live approval calls, new integration environment, or end-to-end infrastructure. No production code edits. This task should produce one concise repository-local investigation markdown report.

## Questions / evidence required

1. Trace approval -> resolution callback -> execution, including actual run-scoped wrappers, tool factory/descriptor caching and reuse. Does existing supported public context give a trustworthy current run identity at execution? Distinguish factory-time identity from execution-time identity. Explain concurrency, cancellation and stale receipt cases.
2. Verify the supplied non-uniqueness finding and its security relevance rather than asserting an exploitable vulnerability from missing runId alone. Hooks may independently fail closed; account for that.
3. If a supported existing solution exists, give exact API, version/source locations, scope/lifetime and minimal plugin-only adoption sketch. Otherwise specify the smallest additive host interface and propagation points; do not implement it. Avoid global tool ID rewriting, new receipt services, duplicated approval machinery, and broad refactors.
4. Name existing tests that cover these invariants and any narrow regression cases a subsequent implementation needs: two runs with same call ID, concurrent execution, denied/timed-out/cancelled approval, stale/replayed receipt, and cached factory context.
5. Conclude EXISTING_API_SUFFICIENT or HOST_CHANGE_REQUIRED with source evidence and a task-ready minimal follow-up. Keep installation success separate from tool dispatch/approval safety. No broad test-suite repair or deployment task.

## Acceptance

Concise evidence-backed report, exact supported API or minimal proposed change, explicit unresolved points, no host mutation/new environment/implementation. Run only pertinent existing tests if necessary; source-only reasoning is acceptable when clearly labeled, and must not be presented as live verification.
