# Plan 2026-08-02: Fix live Discord deliberation intake hook wiring

_Status: DRAFT_
_Created: 2026-08-02_

## Analysis

### Codebase context

- `extensions/discord/src/monitor/message-handler.process.ts:943` sends the realistic Discord `ctxPayload` through `dispatchChannelInboundReply`; `extensions/discord/src/monitor/message-handler.context.ts:322` supplies provider message id, sender id, account, `channel:<id>` target, timestamp, and content.
- `src/channels/message/inbound-reply-dispatch.ts:125` delegates to the shared channel-turn kernel; `src/channels/turn/kernel.ts:381` invokes the supplied reply dispatcher, whose production path reaches `dispatchReplyFromConfig`.
- `src/auto-reply/reply/dispatch-from-config.ts:1350` ensures runtime plugins, captures the global hook runner, constructs canonical claim input, broadcasts `inbound_claim` at `:1899`, and runs `before_dispatch` at `:2142`.
- `src/plugins/hooks.ts:692` executes claiming hooks sequentially by priority; `src/plugins/hook-runner-global.ts:32` binds one runner to the activated registry; `src/agents/runtime-plugins.ts:36` scopes dispatch-time loading to the gateway startup plugin snapshot.
- `extensions/deliberation/index.ts:13` registers both hooks at `FAIL_CLOSED_HOOK_PRIORITY`; `extensions/deliberation/src/intake.ts:51` owns intake, sanitized warning, and terminal success, while `:108` independently owns fail-closed source silence.
- `extensions/discord/src/monitor/message-handler.process.test.ts:250` replaces the production reply runtime and terminates at a mocked `dispatchInboundMessage`; it therefore cannot detect missing runtime registration, runner capability, canonical mapping, or broadcast wiring.
- Existing `extensions/deliberation/src/hooks.test.ts` and `src/auto-reply/reply/dispatch-from-config.test.ts` prove handlers and generic dispatch separately, but no test composes a Discord process event with a loader-backed Deliberation registration and the real shared dispatch seam.
- The worktree already contains uncommitted Deliberation success-claim and test edits. Implementation must preserve and integrate them rather than overwrite unrelated in-progress work.

### Relevant documentation

- `docs/plugins/sdk-channel-inbound.md`: assembled channel events must flow through `dispatchChannelInboundReply`; inbound normalization and reply dispatch remain shared core responsibilities.
- `docs/plugins/sdk-testing.md:199`: direct `register(api)` mocks do not exercise loader acceptance gates; hook-dependent plugins need loader-backed smoke/integration proof.
- `docs/investigations/deliberation-v2-standard-plugin-capability-investigation.md`: `inbound_claim` is the durable intake seam and `before_dispatch` is the independent terminal silence seam; keep Deliberation policy out of core.

### Knowledge base

- `learnings/architecture/2026-07-28_residue-audits-require-activation-proof.md`: prove discovery, registration, activation, and runtime callers; a source registration assertion is not live activation proof.
- `learnings/architecture/2026-08-02_claim-inbound-events-only-after-durable-intake-succeeds.md`: successful durable intake may terminate the claim; failed intake must continue only to the independent fail-closed gate.
- `learnings/patterns/2026-08-02_verify-terminal-claims-at-both-plugin-and-dispatch-boundarie.md`: prove behavior at both the plugin handler and composed dispatch boundary.
- Recall used local fallback because QMD collection `openclaw-fork-learnings` was unavailable; only the activation-proof result contained actionable detail.

## Available Skills

- `tdd`: implement the boundary regression RED-first and preserve command evidence.
- `openclaw-testing`: select focused Discord, Deliberation, hook-runner, and typecheck lanes without broad local fanout.
- `autoreview`: mandatory fresh pre-handoff review after implementation.
- `save-learning`: record the final wiring cause and test-harness lesson as the implementation task's last action.

## Solution

Compose the existing Discord process harness with the production reply dispatcher and a loader-backed Deliberation registration. Capture the activated plugin id/hook inventory and canonical hook event before asserting intake so the RED result identifies whether the live gap is registry/module identity, capability selection, context mapping, or a Discord dispatcher bypass.

Fix the first shared owner where the composed trace diverges. Keep source matching, KM auth and `401` handling in Deliberation; keep hook ordering/activation in core; do not add Deliberation-specific checks to Discord or core. Successful intake remains a terminal silent claim, while intake failure logs only a stable reason/type and reaches the unchanged terminal `before_dispatch` gate.

## Implementation

1. Extend the Discord process harness with a switch that delegates `openclaw/plugin-sdk/reply-runtime` to its real `dispatchReplyWithBufferedBlockDispatcher` for this suite while retaining mocked Discord REST/delivery. Load the source-checkout Deliberation plugin through the real loader using the configured source id and a materialized test credential.
2. Add a temporary test trace/assertion for the activated registry and global runner: Deliberation is loaded once, both `inbound_claim` and `before_dispatch` are present on the same runner, and `inbound_claim` precedes `before_dispatch`. Also record the resolved module/package source when the external Discord package path differs from the host SDK path.
3. Drive `processDiscordMessage` with message id `1533451497218506752`, channel `1494265174389948538`, account `default`, sender id, content, and timestamp. Assert the claim event carries the exact provider id, bare normalized source target, sender, timestamp, and content into the actual Deliberation handler.
4. Use the RED trace to patch only the responsible shared seam:
   - If the dispatch-time registry omits Deliberation, align gateway startup snapshot/reuse so the active runner contains every startup hook plugin without creating a second registry.
   - If Discord resolves a stale/plugin-local SDK dispatcher, route its channel-inbound import to the host-owned SDK/runtime instance and add package/build proof.
   - If the capability gate skips the registered hook, gate on `hasHooks("inbound_claim")` and invoke the same runner used by `before_dispatch`.
   - If canonical mapping loses Discord facts, correct the shared mapper/context construction and preserve channel-neutral behavior.
5. Keep `createInboundClaimHandler` terminal only after `client.intake` resolves. On rejection, return non-claiming after `logger.warn("deliberation intake failed: reason=km-request-failed error=<type>")`; verify no content, sender, token, URL, or media path enters logs. Leave `createBeforeDispatchHandler` unchanged as the independent terminal source gate.
6. Add the four boundary regressions below. Assert successful KM intake uses the existing `/deliberation/v1/intake` request/header/body contract and accepted response shape; do not emulate or modify the external listener/spool implementation.
7. Remove temporary trace output after the assertions identify and lock the invariant. Update public SDK testing docs only if a reusable test-only loader export is required; otherwise keep all harness changes local to the existing test.
8. Run focused tests and type lanes, then `pnpm check:changed`. Run `pnpm build` when module resolution, loader reuse, SDK exports, or lazy boundaries change. Run fresh `autoreview` until no actionable findings remain.
9. In the final task note, name the exact live wiring cause, changed owner seam, successful/failure behavior, test/typecheck/build commands and outcomes, and any remaining external live spool verification. Invoke `save-learning` last and persist the cause/harness lesson.

## Files to Modify

| File                                                                      | Change                                                                                                                                                 |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `extensions/discord/src/monitor/message-handler.process.test.ts`          | Compose a realistic Discord event with production shared dispatch and loader-backed Deliberation hooks; cover success, failure, and unrelated routing. |
| `src/auto-reply/reply/dispatch-from-config.ts`                            | Change only if RED proves the broadcast capability/invocation seam is wrong.                                                                           |
| `src/agents/runtime-plugins.ts` or `src/plugins/loader.ts`                | Change only if RED proves startup registry scope/reuse drops the hook or replaces the gateway runner.                                                  |
| `src/hooks/message-hook-mappers.ts`                                       | Change only if RED proves Discord canonical facts are lost or normalized incorrectly.                                                                  |
| `src/plugin-sdk/plugin-test-runtime.ts` and `docs/plugins/sdk-testing.md` | Add/document a narrow loader-backed test helper only if the existing harness cannot activate the real plugin without crossing plugin boundaries.       |
| `extensions/deliberation/src/intake.ts`                                   | Preserve/complete terminal success and sanitized failure behavior; do not change auth, matching, timeout, or `401` semantics.                          |
| `extensions/deliberation/src/hooks.test.ts`                               | Retain direct contract coverage as a complement to the new composed boundary test.                                                                     |

## TDD

Implement the cycle with `skill:tdd`; write RED/GREEN evidence to `plans/checkpoints/bright-mist-1370.red-green-proof.md`.

**Test file:** `extensions/discord/src/monitor/message-handler.process.test.ts`
**Run command:** `pnpm test extensions/discord/src/monitor/message-handler.process.test.ts -- --reporter=verbose`
**Edit hint:** append a `processDiscordMessage Deliberation wiring` block and reuse `createBaseDiscordMessageContext`; add a local real-dispatch mode instead of creating a second Discord harness.

```ts
import {
  initializeGlobalHookRunner,
  resetGlobalHookRunner,
} from "openclaw/plugin-sdk/plugin-test-runtime";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("processDiscordMessage Deliberation wiring", () => {
  afterEach(() => resetGlobalHookRunner());

  it("intakes the configured Discord source exactly once before terminal silence", async () => {
    const intakeRequest = vi.fn();
    const agentDispatch = vi.fn();
    const send = vi.fn();
    await installLoaderBackedDeliberationForDiscordTest({ intakeRequest, agentDispatch, send });
    const ctx = await createBaseDiscordMessageContext({
      messageChannelId: "1494265174389948538",
      message: {
        id: "1533451497218506752",
        channelId: "1494265174389948538",
        content: "Tak schvalne",
        timestamp: "2026-08-02T12:28:47.088Z",
        attachments: [],
      },
      baseText: "Tak schvalne",
      messageText: "Tak schvalne",
    });

    await processDiscordMessage(ctx);

    expect(intakeRequest).toHaveBeenCalledTimes(1); // RED: current Discord harness stops at its mocked dispatcher.
    expect(intakeRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        providerEventId: "1533451497218506752",
        sourceTarget: "default:1494265174389948538",
        content: "Tak schvalne",
      }),
    );
    expect(agentDispatch).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });
});
```

| Test                              | RED                                                   | GREEN                                                              |
| --------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------ |
| configured source, KM accepts     | intake request count is `0` at the mocked/broken seam | canonical intake occurs once; claim is terminal; no agent/send     |
| configured source, KM unavailable | no sanitized failure observation or intake attempt    | one sanitized warning; `before_dispatch` terminates; no agent/send |
| configured source hook order      | claim absent or uses a different runner/context       | `inbound_claim` runs once before `before_dispatch`                 |
| unrelated Discord channel         | source gate accidentally intercepts or intake runs    | no intake; normal reply dispatcher is reached once                 |

Regression commands:

- `pnpm test extensions/deliberation extensions/discord/src/monitor/message-handler.process.test.ts src/auto-reply/reply/dispatch-from-config.test.ts src/plugins/source-checkout-runtime.test.ts`
- `pnpm tsgo:core && pnpm tsgo:extensions && pnpm tsgo:core:test && pnpm tsgo:extensions:test`
- `pnpm check:changed`
- `pnpm build` when loader/SDK/module boundaries change

## Dependencies

- Use the supplied live event as the external repro; do not read or modify live config, credentials, listener code, or spool files.
- Preserve `FAIL_CLOSED_HOOK_PRIORITY`, exact source matching, listener auth, request timeout, canonical KM headers/body, and `401` behavior.
- Treat listener/spool confirmation after the patch as an external follow-up if it cannot be exercised inside this repository.
