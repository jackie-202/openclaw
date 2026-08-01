# Deliberation v2 plugin consuming the accepted KM wire

## Goal

Implement the missing OpenClaw Deliberation plugin after the preceding KM owner task publishes and accepts the versioned authenticated wire and final-delivery fixtures.

This is prerequisite repair for parent `wild-brook-9335` in batch `deliberation-v2-replace-v1-2026-07-26`. Preserve the completed capability investigation and consume only the accepted KM contract; do not infer protocol behavior.

## Scope

- Create `extensions/deliberation/` as an external-compatible standard plugin using public `openclaw/plugin-sdk/*` imports.
- Add strict config for exact Discord source tuples, excluded processing tuple, KM endpoint and SecretRef credential, bounded request/poll settings, restricted session keys, and fail-closed mode.
- Implement one shared exact route matcher.
- Register non-claiming `inbound_claim` that forwards configured Discord events to KM, excluding the processing tuple before any KM call.
- Register terminal silent `before_dispatch` for configured pilot sources under every KM result.
- Register cooperative `before_tool_call` and `message_sending` guards for restricted sessions and configured source targets.
- Register one abortable non-overlapping worker that lists, atomically reserves, and sends only a fresh KM-owned delivery attempt.
- Keep the sole `sendDurableMessageBatch` import/call in one final-send adapter, preserving account, target, thread, reply, queue, receipt, and correlation fields.
- Complete or reconcile each attempt exactly according to the accepted fixtures. Never blind-retry `partial_failed`, process loss, or unknown provider acceptance; a later send requires accepted `NOT_SENT` proof and a new KM attempt ID.
- Add exact plugin health, intake enable/disable, sender enable/disable, safe-silence, and synthetic controls for the cutover manifest.

## Files

- `extensions/deliberation/contracts/*` copied or generated from the accepted KM versioned fixtures with provenance/hash checks
- `extensions/deliberation/{package.json,tsconfig.json,openclaw.plugin.json,api.ts,index.ts}`
- `extensions/deliberation/src/{config,route-match,km-client,intake,guards,poll-service,final-send}.ts`
- `extensions/deliberation/src/*.test.ts`
- `docs/plugins/reference/deliberation.md`
- Plugin inventory/label/SecretRef registration files required by repository generators
- Task checkpoint and TDD proof under `plans/checkpoints/`

## Constraints

- Scope boundary is `/Users/michal/Projects/openclaw-fork`; do not inspect or edit KM, Mission Control, workspace config, cron, v1 queue/archive, or other repositories.
- Start only after the parent KM repair is accepted and its exact fixtures are available in this repository-local task context. If any protocol item is absent or contradictory, stop and report the exact missing fixture instead of guessing.
- Do not add core config keys, environment-owned state, a second database, a fallback reply path, or a second send authority.
- Keep credentials and message/provider payloads out of logs, fixtures, checkpoints, and docs.
- Do not activate live plugin config, cron, source traffic, workers, or external messaging.

## TDD

Use the `tdd` skill. Build an inert loadable plugin, add the behavioral registration test from `plans/2026-07-27_quick-crag-2548_acceptance-fix-deliberation-v2-standard-plugin-intake.md`, capture assertion-level RED, then implement behavior and capture GREEN. Historical missing-target evidence is provenance only.

## Acceptance

- Loader-backed plugin registration succeeds and exactly the intended hooks plus one worker register.
- Configured pilot traffic is terminally silent outside the v2 path; processing-channel input is excluded before KM access.
- Duplicate intake maps to one KM record; two workers or restart recovery yield one reserved provider attempt.
- Unknown/partial provider acceptance is durable and unsent until explicit accepted reconciliation permits a fresh attempt.
- Exactly one source file owns the durable provider send call, and returned receipt/message identity is completed once to KM.
- Supported health, enable/disable, safe-silence, and synthetic controls are executable and suitable for exact manifest entries.

## Verify

```bash
pnpm test extensions/deliberation
pnpm test src/plugins/wired-hooks-inbound-claim.test.ts src/plugins/wired-hooks-reply-dispatch.test.ts src/plugins/hooks.before-agent-reply.test.ts
pnpm test src/plugins/wired-hooks-message.test.ts src/plugins/wired-hooks-reply-payload-sending.test.ts src/plugins/hooks.security.test.ts src/plugins/hooks.correlation.test.ts
pnpm test src/infra/outbound/deliver.test.ts src/infra/outbound/delivery-queue.recovery.test.ts src/channels/message/receipt.test.ts
pnpm plugins:inventory:check
pnpm build
pnpm check:changed
```

Run `validate-implementation`, then run `save-learning` as the final action.
