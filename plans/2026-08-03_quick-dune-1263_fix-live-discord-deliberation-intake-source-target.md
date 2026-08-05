# Plan 2026-08-03: Fix live Discord Deliberation intake source-target canonicalization

_Status: DRAFT_

## Progress

- [x] Phase 0: Initialize canonical plan file
- [x] Phase 1: Research code, tests, docs, and scoped rules
- [x] Phase 2: Recall applicable project knowledge
- [x] Phase 3: Synthesize implementation and verification plan

## Analysis

### Codebase context

- `extensions/discord/src/monitor/message-handler.process.test.ts:573` already composes a realistic Discord message, loader-backed Deliberation hooks, production shared dispatch, and captured KM HTTP body. Its `sourceTarget: default:<id>` assertion reproduces the incident at the required inbound boundary.
- `extensions/deliberation/src/intake.ts:51` normalizes/matches a Discord route, preserves `messageId` as `providerEventId`, and currently constructs the wrong account-qualified `sourceTarget` at line 91.
- `extensions/deliberation/src/route-match.ts:11` strips one runtime `channel:` prefix and rejects missing/non-Discord route candidates; `config.ts:62` deliberately keeps account identity in route keys for source/processing matching.
- `extensions/deliberation/src/hooks.test.ts` owns direct intake, route exclusion, malformed-input, terminal-success, and fail-closed regression coverage. Existing expectations encode the wrong account-qualified target.
- `src/auto-reply/reply/dispatch-from-config.ts:1899` terminally stops dispatch after successful `inbound_claim`; KM errors continue to the independent `before_dispatch` guard at line 2142. These seams are already proven by the Discord integration and must remain unchanged.
- `extensions/deliberation/src/km-client.ts:502` serializes the supplied intake body without altering identity/grouping fields; auth, SecretRef resolution, headers, and delivery controls are unrelated to this correction.

### Relevant documentation

- `extensions/deliberation/contracts/km-wire-v1.json:57` defines `providerEventId` and `sourceTarget` as distinct intake fields; the mirrored schema leaves canonical target semantics to the KM authority.
- `docs/plugins/reference/deliberation.md:76` requires configured source traffic to remain fail-closed and processing routes to remain excluded.
- `docs/plugins/sdk-testing.md:199` requires loader-backed proof for hook-dependent plugin behavior; the existing Discord integration satisfies that requirement.
- No PlantUML diagram governs this narrow payload mapping.

### Knowledge base

- `learnings/architecture/deliberation-normalize-canonical-channel-identities.md`: normalize the runtime `channel:` prefix once at the plugin boundary and reuse the normalized route; realistic tests must use the canonical Discord context shape.
- `learnings/architecture/deliberation-successful-intake-terminal-claim.md`: return `{ handled: true }` only after intake succeeds; KM failures remain non-claiming and rely on the independent fail-closed dispatch guard.
- `learnings/architecture/2026-07-28_residue-audits-require-activation-proof.md`: runtime activation proof is stronger than source-only assertions; retain the loader-backed Discord boundary test.
- Recall used deterministic local fallback because QMD collection `openclaw-fork-learnings` was unavailable. Other returned auto-extracted files contained no actionable body; do not infer new wire semantics from their titles.
- Project rules require plugin-local ownership, RED-first testing via `skill:tdd`, focused tests before `pnpm check:changed`, and fresh `skill:autoreview` before handoff.

## Available Skills

- `tdd`: execute and record the required RED/GREEN boundary regression.
- `openclaw-testing`: choose focused plugin and smallest broader checks.
- `autoreview`: run mandatory fresh pre-handoff review after implementation.
- `save-learning`: persist the source-target ownership lesson as the implementation task's final action.

## Approach

Keep account identity in `routeKey` for configured-source and processing-route matching, but derive the KM identity solely from the normalized Discord channel: `discord:channel:${route.target}`. This makes `providerEventId` the message-level duplicate key and `sourceTarget` the channel-level debounce key without changing hook ordering, dispatch suppression, KM transport, auth, or delivery controls.

## Implementation

1. Use `skill:tdd` to change the existing loader-backed Discord integration expectation to `discord:channel:1494265174389948538`; run that file and record the expected RED payload difference in `plans/checkpoints/quick-dune-1263.red-green-proof.md`.
2. Extend `extensions/deliberation/src/hooks.test.ts` with a table covering `default` and non-default accounts and runtime targets with/without `channel:`. For every accepted case assert the exact canonical target, unchanged Discord message ID in `providerEventId`, one intake call, and `{ handled: true }`.
3. Add/retain rejection cases for non-Discord, missing-account, missing-target, unmatched, and processing-route candidates. Assert no intake, and preserve the existing KM-error test plus independent `before_dispatch` suppression so pilot traffic cannot leak.
4. Change only `extensions/deliberation/src/intake.ts` payload construction from account-qualified to `discord:channel:${route.target}`. Do not change `candidateRoute`, `routeKey`, config shape, KM client, SecretRef handling, hook priorities, or outbound controls.
5. Rerun the RED target for GREEN, then focused Deliberation tests and `pnpm check:changed`. Run fresh `skill:autoreview` until no actionable findings remain.
6. Final note must report exact commands/results, confirm the payload cannot regress to `default:<id>`, and state that a built/managed Gateway needs a rebuild plus process restart to load changed plugin code; do not restart live services in this task. Invoke `save-learning` last and persist at least one learning.

## Files to Modify

| File                                                             | Change                                                                                                                                                                          |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `extensions/discord/src/monitor/message-handler.process.test.ts` | Make the loader-backed real inbound boundary assert the exact canonical KM JSON body and reject the prior account-qualified value.                                              |
| `extensions/deliberation/src/hooks.test.ts`                      | Cover account independence, runtime target normalization, message identity, terminal success, malformed/unmatched routes, processing isolation, and fail-closed error behavior. |
| `extensions/deliberation/src/intake.ts`                          | Build `sourceTarget` as `discord:channel:<normalized-channel-id>` while leaving route/account matching unchanged.                                                               |

## TDD

Implement the cycle with `skill:tdd`; record RED/GREEN evidence in `plans/checkpoints/quick-dune-1263.red-green-proof.md`.

**Test file:** `extensions/discord/src/monitor/message-handler.process.test.ts`
**Run command:** `pnpm test extensions/discord/src/monitor/message-handler.process.test.ts -- --reporter=verbose`
**Edit hint:** replace the KM body assertion inside `runDeliberationIntegrationTest`; reuse its loader, real dispatch path, captured fetch, and live-shaped Discord context.

```ts
import { expect } from "vitest";

// Inside runDeliberationIntegrationTest, after parsing requestInit.body.
const intakeBody = JSON.parse(requestInit.body) as Record<string, unknown>;
expect(intakeBody).toMatchObject({
  provider: "discord",
  providerEventId: "1533451497218506752",
  sourceTarget: `discord:channel:${sourceId}`, // RED: currently default:<sourceId>
});
expect(intakeBody.sourceTarget).not.toBe(`default:${sourceId}`);
```

| Test                                | RED before implementation                                             | GREEN after implementation                                                                                                            |
| ----------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Loader-backed Discord inbound event | `sourceTarget` is `default:1494265174389948538`                       | Exact body contains `discord:channel:1494265174389948538`; ordinary dispatch and delivery remain unused.                              |
| Direct accepted-route matrix        | Existing expectations use `<account>:<target>` or variants are absent | Both accounts and both runtime target shapes emit the same canonical channel target, preserve message ID, and return `handled: true`. |
| Rejected/error matrix               | No new failure expected; guards establish baseline                    | Non-Discord/malformed/unmatched/processing candidates never intake; KM failure still reaches fail-closed suppression.                 |

## Verification

1. RED then GREEN: `pnpm test extensions/discord/src/monitor/message-handler.process.test.ts -- --reporter=verbose`
2. Focused plugin suite: `pnpm test extensions/deliberation -- --reporter=verbose`
3. Smallest broader gate: `pnpm check:changed`
4. Run `pnpm build` because the fix changes bundled plugin runtime code and the activation note requires built-artifact proof.
5. Inspect the final diff to ensure production changes are confined to `intake.ts`; no KM state, Mission Control, config, live service, docs, or git operations are part of implementation.
