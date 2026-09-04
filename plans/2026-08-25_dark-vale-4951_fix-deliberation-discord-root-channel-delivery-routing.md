# Plan 2026-08-25: Fix Deliberation Discord root-channel delivery routing

_Status: DRAFT_

## Progress

- [x] Config and plan initialization
- [x] Source and test research
- [x] Relevant knowledge review
- [x] Implementation and verification synthesis

## Analysis

### Codebase context

- `extensions/deliberation/src/route-match.ts:86-104,142-179,186-212` conflates the normalized source identity with the optional delivery thread: Discord roots normalize to `providerEventId`, then source-default delivery always writes that value as `threadId`.
- `extensions/deliberation/src/intake.ts:77-119` forwards the admitted target unchanged to KM while separately preserving `providerEventId`, `sourceThreadId`, and Discord history-channel identity. Keep those identity fields unchanged.
- `extensions/deliberation/src/final-adapter.ts:82-91,124-145` converts absence/presence of wire `threadId` directly into root/thread provider parameters; no late routing repair belongs here.
- `extensions/deliberation/index.ts:81-100` passes `threadId` to Discord only when present, so a corrected durable root target naturally becomes `to: channel:<source>` with no thread argument.
- `extensions/deliberation/src/route-match.test.ts`, `hooks.test.ts`, `final-adapter.test.ts`, and `plugin.test.ts` already cover route rejection, Slack identity, durable-target fencing, and provider invocation, but currently encode the broken Discord source-anchor case.

### Relevant documentation

- `docs/reference/test.md:11-24,38-40` requires focused `pnpm test <targets>`, the Deliberation plugin lane, and changed-scope checks through repository wrappers.
- `docs/plugins/reference/deliberation.md:93-114,173-185` and `extensions/deliberation/README.md:140-149` currently describe Discord root source-default delivery as a source-message anchor; update those statements to the corrected root-channel behavior without changing KM lifecycle ownership.
- `docs/proposals/proposal-20260820-203458-161e2c_per-source-deliberation-pipelines-with-source-default-delivery.md:74-83` records the superseded anchor design. Treat the task's confirmed production evidence and required behavior as the corrective decision; do not rewrite the historical proposal.

### Knowledge base

- `learnings/test-failures/discord-intake-fixtures-separate-message-and-thread-identities.md` requires fixtures to keep Discord `messageId` as event identity instead of inferring a thread destination.
- `learnings/test-failures/cool-brook-8631-test-provider-idempotency-at-native-boundary.md` requires preserving provider-attempt/idempotency assertions independently of target routing.
- `learnings/architecture/2026-07-29_acceptance-fix-plans-must-close-contract-gates-explicitly.md` requires an assertion-level RED using the same focused command later used for GREEN.
- `learnings/test-failures/2026-08-22_preserve-failed-integration-evidence-instead-of-manufacturin.md` and task safety rules prohibit reusing or mutating the failed production record for proof.
- Recall used the deterministic local fallback because QMD collection `openclaw-fork-learnings` was unavailable; no critical-patterns file exists.

## Available Skills

- `tdd`: capture the route regression as RED before changing production code, then capture the identical command as GREEN.
- `validate-implementation`: check the completed diff against task scope and project boundaries.
- `save-learning`: record the message-identity versus destination-thread invariant after implementation.

## Implementation

1. Apply `skill:tdd`: replace the Discord root expectation in `route-match.test.ts` so the production-shaped root event still preserves `providerEventId` and channel identity but rejects any `deliveryTarget.threadId`; capture assertion-level RED before production edits.
2. In `route-match.ts`, make the source-default delivery helper accept an optional provider thread. Pass no provider thread for Discord when `parentConversationId` is absent, pass the authenticated child conversation ID for a real Discord thread, and keep Slack's normalized root/reply timestamp behavior unchanged. Do not alter `providerEventId`, `sourceThreadId`, `historyChannelId`, route selection, configured targets, or validation branches.
3. Update `route-match.test.ts` and `hooks.test.ts` to assert the complete matrix: Discord root target has the source channel and no `threadId`; Discord child target has the authenticated parent channel plus actual child-thread ID; the message snowflake remains event/source identity only; Slack root/reply targets retain current thread timestamps; existing malformed and ambiguous cases remain rejected.
4. Strengthen `final-adapter.test.ts` and `plugin.test.ts` so a durable Discord root target reaches provider `send`/`sendTextAttempt` without `threadId`, while an actual Discord thread still forwards its thread channel ID. Retain provider-attempt, nonce/idempotency, reservation ordering, one-send, and completion evidence assertions.
5. Correct current Deliberation docs to describe source-default Discord root delivery as a root-channel send and real Discord child delivery as thread-preserving. Leave the historical proposal unchanged and do not introduce config, KM schema, migration, or deployment changes.
6. Run focused GREEN, the complete Deliberation plugin lane, extension type gates, changed checks, and the build. Inspect the generated Deliberation bundle and run the built-plugin singleton smoke to confirm the corrected source is present in the loadable artifact; report this as local artifact proof only, not deployment or production E2E proof.

## Files to Modify

| File                                                | Change                                                                                   |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `extensions/deliberation/src/route-match.ts`        | Separate optional Discord delivery-thread routing from existing source/message identity. |
| `extensions/deliberation/src/route-match.test.ts`   | Add the production-shaped RED and root/real-thread/Slack/fail-closed assertions.         |
| `extensions/deliberation/src/hooks.test.ts`         | Verify the KM intake target omits only the Discord root `threadId`.                      |
| `extensions/deliberation/src/final-adapter.test.ts` | Assert exact root versus thread provider target conversion.                              |
| `extensions/deliberation/src/plugin.test.ts`        | Assert Discord outbound receives no root `threadId` and retains a real thread ID.        |
| `docs/plugins/reference/deliberation.md`            | Align current user-visible source-default routing semantics.                             |
| `extensions/deliberation/README.md`                 | Align plugin-local operational guidance with the corrected target shape.                 |

## TDD

Implement the cycle with `skill:tdd`; record RED and GREEN in `plans/checkpoints/dark-vale-4951.red-green-proof.md` using the identical focused command.

**Test file:** `extensions/deliberation/src/route-match.test.ts`  
**Run command:** `pnpm test extensions/deliberation/src/route-match.test.ts -- --reporter=verbose`  
**Edit:** replace the existing Discord root source-anchor case inside `describe("Deliberation source admission")`.

```ts
it("keeps a Discord root message id out of the delivery destination", () => {
  const result = admitInboundSource(config, event, context);

  expect(result).toMatchObject({
    accepted: true,
    providerEventId: "message-1",
    deliveryTarget: {
      provider: "discord",
      account: "account-a",
      channel: "source",
    },
  });
  if (!result.accepted) {
    throw new Error("expected Discord root admission");
  }
  expect(result.deliveryTarget).not.toHaveProperty("threadId"); // RED: currently "message-1".
});
```

| Case                        | RED                                                             | GREEN                                                                                            |
| --------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Discord root source-default | `deliveryTarget.threadId` is the inbound message ID.            | Target is `{ provider, account, channel }` with no `threadId`; event identity remains unchanged. |
| Discord authenticated child | Existing behavior is already green and guards the fix boundary. | Target retains the actual child-thread channel ID, never the message ID.                         |
| Slack root/reply            | Existing behavior is already green.                             | Existing normalized Slack thread timestamps remain unchanged.                                    |

## Verification

1. RED: `TASK_ID=dark-vale-4951 python3 "$HOME/.config/opencode/skills/tdd/scripts/proof-capture.py" red -- pnpm test extensions/deliberation/src/route-match.test.ts -- --reporter=verbose`
2. GREEN: rerun the same command with `green` after the production edit.
3. Focused path: `pnpm test extensions/deliberation/src/route-match.test.ts extensions/deliberation/src/hooks.test.ts extensions/deliberation/src/final-adapter.test.ts extensions/deliberation/src/plugin.test.ts -- --reporter=verbose`
4. Plugin regression: `pnpm test extensions/deliberation`
5. Types/checks: `pnpm tsgo:extensions && pnpm tsgo:extensions:test && pnpm check:changed`
6. Docs: `pnpm format:docs:check && pnpm lint:docs`
7. Artifact: `pnpm build && node scripts/test-built-plugin-singleton.mjs`; inspect `dist/extensions/deliberation/index.js` and `dist-runtime/extensions/deliberation/index.js` for the rebuilt Deliberation entry and corrected optional root-thread branch.
8. Closeout: run mandatory fresh `$autoreview`; do not run the live KM integration, send provider traffic, mutate records/config, restart Gateway, or claim deployment success.
