# Plan 2026-09-08: Fix approval command deadlock behind same-session reply admission

_Status: DRAFT_
_Created: 2026-09-08_

## Progress

- [x] Phase 0: Config + init
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Analysis

### Codebase context

- `extensions/discord/src/monitor/agent-components.handlers.ts:131-195` turns generic command components into synthetic command text only after component authorization and preserves the card's session/account route.
- `extensions/discord/src/monitor/agent-components.dispatch.ts:199-240` emits that text as `CommandSource: "text"`, carries `CommandAuthorized`, and targets the originating Discord session.
- `src/auto-reply/reply/dispatch-from-config.ts:1192-1263` admits normal dispatches through the per-session reply registry; `src/auto-reply/reply/dispatch-from-config.ts:2285-2287` waits before invoking the resolver at `src/auto-reply/reply/dispatch-from-config.ts:2559-2569`.
- `src/auto-reply/reply/reply-turn-admission.ts:27-81` serializes visible turns behind an active operation. `/stop` remains a separate fast-abort path at `src/auto-reply/reply/dispatch-from-config.ts:1997-2010`.
- `src/auto-reply/reply/get-reply.ts:823-868` and `src/auto-reply/reply/get-reply-inline-actions.ts:518-557` route commands to the existing handlers before any agent run.
- `src/auto-reply/reply/commands-approve.ts:126-241` owns parsing, sender/account authorization, operator scopes, exec/plugin method selection, and gateway submission. Keep this canonical path rather than adding a resolver.
- `src/gateway/server-methods/plugin-approval.ts:151-196` and `src/gateway/server-methods/approval-shared.ts:504-609` remain authoritative for pending visibility, allowed decisions, expiry, exact-once resolution, and idempotent retries.
- Existing unit coverage in `src/auto-reply/reply/commands-approve.test.ts` proves authorization, plugin/exec routing, scopes, and unknown/expired errors; gateway approval tests own allowed-decision and duplicate semantics. `src/auto-reply/reply/reply-turn-admission.test.ts` proves ordinary visible waiting. The missing test is dispatch-level same-session plugin approval progress while the originating operation stays active.

### Relevant documentation

- `docs/tools/exec-approvals.md` documents approval policy and confirms this repair must not weaken approval semantics. No public documentation or config change is required.
- `extensions/AGENTS.md` requires Discord to stay transport-only and use SDK/core seams; therefore the repair belongs in core dispatch classification, not a Discord-specific bypass.

### Knowledge base

- `learnings/architecture/2026-07-29_acceptance-fix-plans-must-close-contract-gates-explicitly.md`: capture a real focused RED before edits and fresh GREEN afterward; baseline waiting tests are not regression proof.
- `learnings/architecture/2026-08-02_acceptance-repair-plans-must-include-owner-implementation.md`: change the owning core dispatch path and prove that path directly, rather than patching a transport symptom.
- `learnings/architecture/2026-08-09_inbound-claim-compatibility-needs-caller-and-terminal-state-proof.md`: audit ordering and terminal state for the bypass, including dedupe and reply-operation ownership.
- Recall backend: local fallback; collection `openclaw-fork-learnings` was absent.

## Available Skills

- `compound-plan`: produce and persist this implementation plan.
- `recall-knowledge`: load repository planning lessons before synthesis.
- `tdd`: implementation must capture the required RED/GREEN regression proof.
- `openclaw-testing`: choose focused OpenClaw test and changed-check commands during implementation.
- `autoreview`: run the mandatory fresh pre-closeout review after implementation.
- `validate-implementation`: verify the completed repair against architecture and acceptance constraints.

## Solution

Create one lightweight predicate for the exact approval command forms already accepted by `commands-approve.ts`, and use it in `dispatch-from-config.ts` to skip reply-operation acquisition only for those control turns. Continue through the normal reply resolver and `handleApproveCommand`, so authorization and gateway ownership remain unchanged and no LLM interprets the decision.

Do not add a new reply-turn kind, Discord-only route, approval resolver, timeout, config, or registry mutation. `/stop`, normal visible turns, exec approvals, plugin approvals, and gateway expiry/idempotency keep their current owners.

## Implementation

1. Use `skill:tdd` to append the dispatch-level regression first; run it alone and record the deadlock RED in `plans/checkpoints/bright-fork-9227.red-green-proof.md`.
2. Extract the exact `/approve`, bare `approve`, and foreign-bot mention candidate check from `commands-approve.ts` into a lightweight local module; keep parsing, decision aliases, authorization, and gateway calls in `commands-approve.ts`.
3. Resolve command text with the existing context precedence and compute the approval-control fact once in `dispatchReplyFromConfig`.
4. Make `ensureDispatchReplyOperation` return ready without reading, waiting on, adopting, aborting, completing, or replacing a reply operation only for that fact. Leave both existing admission calls and all non-approval branches unchanged.
5. Extend command tests for plugin `deny`, malformed input, unauthorized sender, unknown/expired request, and unprefixed exec compatibility; rely on gateway owner tests for allowed-decision, expiry, repeated-identical resolution, and conflicting duplicate enforcement.
6. Re-run the focused RED test for GREEN, then the admission, stop, command, and gateway-owner suites. Confirm the active originating operation remains registered and unresolved until the test releases it, while ordinary messages still wait.
7. Run `skill:validate-implementation`, focused changed checks via `skill:openclaw-testing`, `git diff --check`, and mandatory `skill:autoreview`; address every actionable finding before handoff.

## Files to Modify

| File                                                | Change                                                                             |
| --------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `src/auto-reply/reply/approval-command-control.ts`  | Add the shared lightweight approval-command candidate predicate.                   |
| `src/auto-reply/reply/commands-approve.ts`          | Reuse the predicate while retaining all approval parsing and policy.               |
| `src/auto-reply/reply/dispatch-from-config.ts`      | Bypass reply-operation admission only for recognized approval control turns.       |
| `src/auto-reply/reply/dispatch-from-config.test.ts` | Add the same-session Discord generic-component regression and registry invariants. |
| `src/auto-reply/reply/commands-approve.test.ts`     | Fill decision/auth/error/exec compatibility assertions needed by the control lane. |

## TDD

Implement the TDD cycle with `skill:tdd`; write evidence to `plans/checkpoints/bright-fork-9227.red-green-proof.md`.

**Test file:** `src/auto-reply/reply/dispatch-from-config.test.ts`  
**Run command:** `pnpm test src/auto-reply/reply/dispatch-from-config.test.ts -t "resolves a same-session plugin approval while the originating reply remains active"`  
**Edit hint:** Add the gateway resolver mock beside existing hoisted mocks, then append this case inside `describe("dispatchReplyFromConfig")`; use the suite's existing `buildTestCtx`, `createDispatcher`, `createReplyOperation`, `replyRunRegistry`, and cleanup.

```ts
it("resolves a same-session plugin approval while the originating reply remains active", async () => {
  vi.stubEnv("OPENCLAW_TEST_FAST", "1");
  setNoAbort();
  const sessionKey = "agent:main:discord:channel:approval";
  const active = createReplyOperation({
    sessionKey,
    sessionId: "originating-run",
    resetTriggered: false,
  });
  active.setPhase("running");
  approvalGatewayMocks.resolveApprovalOverGateway.mockResolvedValue(undefined);

  const dispatch = dispatchReplyFromConfig({
    ctx: buildTestCtx({
      Provider: "discord",
      Surface: "discord",
      OriginatingChannel: "discord",
      OriginatingTo: "channel:approval",
      To: "channel:approval",
      SessionKey: sessionKey,
      SenderId: "123",
      CommandAuthorized: true,
      CommandSource: "text",
      BodyForAgent: "/approve plugin:request-1 allow-once",
      BodyForCommands: "/approve plugin:request-1 allow-once",
      CommandBody: "/approve plugin:request-1 allow-once",
      RawBody: "/approve plugin:request-1 allow-once",
    }),
    cfg: discordApprovalConfig,
    dispatcher: createDispatcher(),
  });

  await vi.waitFor(() => {
    expect(approvalGatewayMocks.resolveApprovalOverGateway).toHaveBeenCalledWith(
      expect.objectContaining({
        approvalId: "plugin:request-1",
        decision: "allow-once",
        resolveMethod: "plugin",
      }),
    );
  }); // RED: current dispatch is still waiting for `active`.
  await dispatch;
  expect(approvalGatewayMocks.resolveApprovalOverGateway).toHaveBeenCalledTimes(1);
  expect(replyRunRegistry.get(sessionKey)).toBe(active);
  expect(active.result).toBeUndefined();
  active.complete();
});
```

| Test                                 | RED                                                                        | GREEN                                                                                            |
| ------------------------------------ | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Same-session Discord plugin approval | Gateway resolver is not reached while `active` owns the session.           | Resolver receives the exact plugin id/decision and dispatch settles before `active` is released. |
| Originating operation ownership      | Control dispatch cannot settle without completing `active`.                | Registry still points to unresolved `active`; one gateway resolution occurs.                     |
| Ordinary visible message             | Existing `dispatch-from-config.test.ts` waiting assertion remains blocked. | Still blocked until the active operation completes.                                              |
| `/stop`                              | Existing fast-abort suites remain baseline-green.                          | Behavior and active-run abort semantics remain unchanged.                                        |

Focused GREEN command:

`pnpm test src/auto-reply/reply/dispatch-from-config.test.ts src/auto-reply/reply/commands-approve.test.ts src/auto-reply/reply/reply-turn-admission.test.ts src/auto-reply/reply/abort.test.ts src/gateway/server-methods/plugin-approval.test.ts`

## Dependencies

- Use existing Discord synthetic command context, reply resolver, command authorization, operator approval client, and gateway approval managers without changing their contracts.
- Existing gateway tests are the authority for expiration, request visibility, allowed decisions, and duplicate resolution; do not reproduce those policies in dispatch.
- No distribution regeneration, config/schema change, production request, deployment, restart, or timeout adjustment is part of this repair.
