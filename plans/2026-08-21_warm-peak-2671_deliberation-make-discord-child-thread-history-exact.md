# Plan 2026-08-21: Deliberation Discord child-thread history

_Status: DRAFT_

## Progress

- [x] Config and plan initialization
- [x] Research code, tests, docs, and investigation evidence
- [x] Apply relevant knowledge
- [x] Synthesize implementation and TDD steps

## Analysis

### Codebase

- `extensions/deliberation/src/route-match.ts:120-219` already authenticates Discord parent and child facts independently: the parent chooses `pipelineBySourceKey`, while `sourceThreadId` is the exact child conversation (or the root event ID for root delivery anchoring).
- `extensions/deliberation/src/intake.ts:63-111` persists only Slack event-to-thread identity before KM intake; Discord sends `sourceThreadId` to KM but leaves no authenticated local history mapping.
- `extensions/deliberation/src/thread-identity-store.ts:1-35` provides atomic register-if-absent plus exact duplicate/conflict handling keyed by `sourceTarget + providerEventId`; this is the existing no-wire-change correlation seam.
- `extensions/deliberation/src/history-read.ts:257-519` authorizes history with the parent-scoped `sourceTarget`, resolves Slack through the keyed store, but passes `identity.channel` to every Discord read.
- `extensions/deliberation/index.ts:60-68,163-168` opens the store only for Slack pipelines and injects it into intake/history. The store must become provider-neutral without making history identity a pipeline or delivery selector.
- `extensions/deliberation/src/history-read.test.ts:52-217` covers Discord parent-channel reads and freshness bounds; `extensions/deliberation/src/history-read.test.ts:218-430` supplies the parallel Slack root/child/conflict model.
- `extensions/deliberation/src/hooks.test.ts:180-368`, `extensions/deliberation/src/route-match.test.ts:180-220`, and `extensions/deliberation/src/orchestration.test.ts:210-390` cover authenticated identity, store-before-intake ordering, and end-to-end Slack exact-thread exclusion.
- `extensions/discord/src/send.messages.ts:48-73` forwards the supplied channel/thread ID directly to Discord `listChannelMessages`; `src/plugin-sdk/discord.ts:61-67` omits the returned `channel_id`, although `discord-api-types/payloads/v10/message.d.ts:257-268` requires it on every `APIMessage`.

### Documentation

- `plans/investigations/quick-wave-9858_audit-openclaw-deliberation-pipeline-routing-and-delivery-safety.md:54-60` identifies this exact remediation and requires Discord root/child vectors parallel to Slack.
- `extensions/deliberation/contracts/history-read-v1.json` and `extensions/deliberation/contracts/history-read-v2.json` intentionally expose only parent-scoped `sourceTarget` plus the admitted event cursor. Preserve these closed request/response keys; resolve authenticated history identity locally.
- `extensions/AGENTS.md:25-31` keeps the change plugin-local and permits only Plugin SDK imports at the production boundary.

### Knowledge

- Normalize and authenticate channel identities at plugin intake, using real prefixed Discord hook shapes; do not add fallback comparisons (`learnings/architecture/2026-08-01_canonical-channel-identities-at-plugin-intake-boundaries.md`).
- Trace authority through registration and runtime callers, not names alone; prove route selection and history lookup remain separate (`learnings/architecture/2026-07-28_residue-audits-require-activation-proof.md`).
- Close the acceptance gate with a genuine focused RED before edits and fresh GREEN afterward (`learnings/architecture/2026-07-29_acceptance-fix-plans-must-close-contract-gates-explicitly.md`).
- Recall used deterministic local fallback because QMD collection `openclaw-fork-learnings` was absent; only the three cited results applied directly.
- Keep event, parent route, exact conversation, and delivery identities distinct; never overload `sourceThreadId` for history selection (`learnings/architecture/2026-08-21_authenticated-thread-routing-separates-source-parent.md`, `learnings/patterns/swift-peak-3523-keep-event-identity-separate-from-conversation-identity.md`).

## Available Skills

- `tdd`: record the required Discord root/child/conflict RED/GREEN cycle.
- `validate-implementation`: verify route authority, store ownership, and closed history wire remain aligned.
- `code-review`: inspect the completed diff for identity-authority regressions before handoff.

## Approach

Add an internal `historyTarget` to successful admission: Discord uses the validated direct conversation (root channel or exact child thread), while Slack uses its validated thread root. Persist `{ sourceTarget, providerEventId, historyTarget }` atomically before every KM intake, then resolve only that mapping after the parent `sourceTarget` has authorized the configured pipeline source.

Keep `route`/`sourceTarget` as the sole pipeline authority and `deliveryTarget` as the sole send authority. `historyTarget` is consumed only by registration and history reads; it never participates in pipeline lookup, target derivation, or the KM wire.

## Implementation

1. Use `skill:tdd` to add Discord root, child, missing/conflict, sibling-row, and parent-route coexistence vectors. Record the focused RED before production edits in `plans/checkpoints/warm-peak-2671.red-green-proof.md`.
2. Extend accepted `SourceAdmission` with `historyTarget`. Derive it only after event/context provider, account, direct conversation, parent conversation, message, and thread facts agree: Discord gets `directTarget`; Slack gets `normalizedThreadId`. Keep `route.target` parent-scoped and leave `pipelineTargetToWire` unchanged.
3. Replace the Slack-specific store symbols with one provider-neutral source-history identity store keyed by `sourceTarget + providerEventId`. Register every accepted Discord and Slack identity before `client.intake`; identical replays remain idempotent, while missing store access or conflicting values stop intake.
4. Open and inject the provider-neutral keyed store for configured pipelines in `extensions/deliberation/index.ts`. Replace the unshipped Slack-only namespace rather than adding a dual-read fallback or migration path.
5. Resolve the mapping for both providers at the start of `createHistoryReadHandler` after configured-source authorization. Reject missing mappings, source/event mismatches, malformed targets, and provider-specific contradictions before provider access; pass only the mapped `historyTarget` to every Discord v1/v2 page read.
6. Add `channel_id?: unknown` to `DiscordHistoryMessage`, require each normalized Discord row to contain the exact mapped history target, and reject parent/sibling/off-thread rows. This matches the required upstream `APIMessage.channel_id` contract without adding a new SDK entrypoint.
7. Extend the orchestration fixture so a Discord child event is admitted through its configured parent, writes its child history target, reads only that child, excludes parent/sibling rows, and never consults delivery target state for history.
8. Run focused GREEN and regression commands, then `skill:validate-implementation` and fresh `skill:autoreview` until no accepted actionable finding remains.

## Files to Modify

| Path                                                                                                              | Change                                                                                                                                 |
| ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `extensions/deliberation/src/route-match.ts`                                                                      | Return exact authenticated history identity separately from parent route and delivery target.                                          |
| `extensions/deliberation/src/thread-identity-store.ts` -> `extensions/deliberation/src/history-identity-store.ts` | Generalize atomic event-to-history mapping and conflict checks for Discord and Slack.                                                  |
| `extensions/deliberation/src/intake.ts`, `extensions/deliberation/index.ts`                                       | Persist every admitted history identity before intake and inject one provider-neutral store.                                           |
| `extensions/deliberation/src/history-read.ts`                                                                     | Require the mapping, read the mapped Discord channel/thread for v1/v2, and reject off-target rows.                                     |
| `src/plugin-sdk/discord.ts`                                                                                       | Expose the existing Discord message `channel_id` field for boundary validation.                                                        |
| `extensions/deliberation/src/{route-match,hooks,history-read,orchestration,plugin}.test.ts`                       | Add root/child/conflict vectors, store wiring, exact read arguments, no-fallback proof, and update Discord fixtures with `channel_id`. |

## TDD

Implement the cycle with `skill:tdd`; append these cases to `extensions/deliberation/src/history-read.test.ts` before production edits.

**Run:** `pnpm test extensions/deliberation/src/history-read.test.ts extensions/deliberation/src/route-match.test.ts -- --reporter=verbose`

```ts
it("reads a Discord child from its authenticated history mapping, not its parent", async () => {
  const sourceTarget = "v1:discord:acct-b:channel-1";
  const lookup = vi.fn().mockResolvedValue({
    sourceTarget,
    providerEventId: "200",
    threadId: "child-thread-1",
  });
  const readMessages = vi.fn().mockResolvedValue([]);

  await createHistoryReadHandler({
    config,
    openclawConfig: {},
    threadStore: { lookup } as never,
    readMessages,
  })({ schemaVersion: 2, sourceTarget, after: "200" });

  expect(lookup).toHaveBeenCalled();
  expect(readMessages).toHaveBeenCalledWith(
    "child-thread-1",
    { limit: 1, after: "200" },
    { cfg: {}, accountId: "acct-b" },
  );
});

it("fails closed when Discord history identity is missing", async () => {
  const readMessages = vi.fn().mockResolvedValue([]);
  const handler = createHistoryReadHandler({
    config,
    openclawConfig: {},
    threadStore: { lookup: vi.fn().mockResolvedValue(undefined) } as never,
    readMessages,
  });

  await expect(handler(request)).rejects.toThrow("history identity");
  expect(readMessages).not.toHaveBeenCalled();
});
```

| Test                            | RED                                                              | GREEN                                                                           |
| ------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Discord child mapping           | Lookup is unused and reader receives parent `channel-1`.         | Parent authorizes the source; reader receives only `child-thread-1`.            |
| Missing Discord mapping         | Parent-channel provider read succeeds.                           | Request rejects before provider access.                                         |
| Root/child route vectors        | Admission exposes no dedicated history fact.                     | Both retain parent route ownership and expose exact root/child history targets. |
| Conflicting/off-target identity | Conflict or mismatched `channel_id` can reach normalized output. | Intake/read rejects before KM/provider use or response acceptance.              |

## Verification

```bash
pnpm test extensions/deliberation/src/route-match.test.ts extensions/deliberation/src/history-read.test.ts extensions/deliberation/src/hooks.test.ts extensions/deliberation/src/orchestration.test.ts -- --reporter=verbose
pnpm test extensions/deliberation/src/plugin.test.ts extensions/deliberation/src/contract.test.ts src/plugin-sdk/discord.test.ts -- --reporter=verbose
pnpm format:check -- extensions/deliberation/src src/plugin-sdk/discord.ts
node scripts/run-oxlint.mjs --tsconfig config/tsconfig/oxlint.extensions.json extensions/deliberation/src src/plugin-sdk/discord.ts
pnpm build
```

- Confirm the history v1/v2 contract JSON and KM intake body are byte-for-byte unchanged.
- Confirm `git diff --numstat` reflects one canonical store/read path rather than parallel Discord and Slack correlation paths.
