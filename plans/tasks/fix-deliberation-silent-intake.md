# Fix deliberation intake to enqueue silently

## Problem

A Discord message in the configured deliberation source channel `1494265174389948538` is successfully ingested, but the normal agent path still runs and posts a public reply. The expected behavior is: enqueue the inbound message in the KM deliberation queue and stop all normal agent dispatch/delivery with no Discord response.

Observed on 2026-08-02:

- user message `1533408285770649783`
- unwanted bot reply `1533408377693012038`
- reply began `Jo — tentokrát zpráva dorazila...`

The configured source routing is already correct. Do not change listener auth, disable fail-closed controls, or work around the queue.

## Investigation evidence

Core dispatch already treats `inbound_claim` `{ handled: true }` as a silent terminal claim in `src/auto-reply/reply/dispatch-from-config.ts`: it skips the agent and sends no final payload. The existing core test `broadcasts inbound claims and short-circuits when a plugin claims` pins that contract.

The likely defect is therefore in deliberation's route matching/context assumptions or the intake handler's return path, not in the generic dispatch contract. Inspect these repository-local files first:

- `extensions/deliberation/index.ts`
- `extensions/deliberation/src/intake.ts`
- `extensions/deliberation/src/route-match.ts`
- `extensions/deliberation/src/guards.ts`
- `extensions/deliberation/src/plugin.test.ts`
- `src/hooks/message-hook-mappers.ts`
- `src/auto-reply/reply/dispatch-from-config.ts`
- `src/plugins/hook-types.ts`
- `src/plugins/hook-message.types.ts`

## Required change

1. Reproduce the source-channel mismatch with a focused unit/integration test using a realistic Discord inbound claim event/context for channel `1494265174389948538`.
2. Fix the deliberation plugin so a configured source message is matched reliably and a successful KM intake returns the terminal `inbound_claim` result `{ handled: true }`.
3. Ensure the successful path enqueues exactly once, does not invoke the normal reply resolver/model, does not call the outbound dispatcher, and produces no text reply.
4. Preserve all fail-closed behavior. Intake/auth/KM failures must remain blocked according to the current contract; do not weaken `FAIL_CLOSED_HOOK_PRIORITY`, guard hooks, listener authorization, or the expected unauthorized `401` behavior.
5. Prefer the smallest local correction. Do not introduce a second intake system or bypass the hook pipeline.

## Acceptance criteria

- A realistic Discord source-channel claim matching `channel=discord`, `accountId=default`, and `conversationId=1494265174389948538` is accepted and queued.
- The claim result is terminal (`handled: true`) and contains no public response text.
- Regression coverage proves normal agent dispatch and send are not invoked after successful enqueue.
- A non-source Discord channel is not claimed.
- Existing fail-closed guard tests remain green.
- Focused deliberation plugin tests and the relevant core dispatch test pass.

## Verification

Run at least:

- focused tests for `extensions/deliberation/src/plugin.test.ts` and any added intake/route-match test
- the core `inbound_claim` short-circuit test in `src/auto-reply/reply/dispatch-from-config.test.ts`
- the smallest relevant typecheck/lint gate for touched files

Record exact commands and results in the final task note.

## Scope boundary

Work only in `/Users/michal/Projects/openclaw-fork`. Do not inspect or modify other repositories, live OpenClaw config, credentials, Discord state, or the KM listener implementation. If external runtime evidence is required beyond the observations above, record it as a follow-up rather than crossing this boundary.
