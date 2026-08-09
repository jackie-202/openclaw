# Fix stale Deliberation KM client contract fixtures

## Goal

Restore the focused OpenClaw Deliberation suite after the delivery-envelope contract expansion in commit `e7a0517245b`.

## Observed evidence

Command:

`pnpm exec vitest run extensions/deliberation/src extensions/deliberation/scripts/intake-producer.test.ts`

Result: 103 passed, 2 failed, both in `extensions/deliberation/src/km-client.test.ts`:

1. `KM contract parsing > uses only the six canonical endpoint paths` fails because the reservation fixture no longer satisfies the parser after `KmReservation` gained required `deliveryEnvelope` and `deliveryEnvelopeDigest` fields.
2. `KM contract parsing > rejects malformed closed ready, reservation, and record responses` expects `invalid reviewedTextHash`, but parsing now fails earlier with generic `invalid reservation`, again indicating the fixture does not reach the intended field-level assertion.

The new cross-repo integration test itself is green when run with:

`OPENCLAW_DELIBERATION_KM_ROOT=/Users/michal/.openclaw/workspace/km-system pnpm test:deliberation:km-integration`

Result: 4/4 passed, including canonical spool persistence, production-path rejection, cleanup, and anti-alias guards.

## Scope

Repository-local only: `/Users/michal/Projects/openclaw-fork`.

Inspect and change only the Deliberation KM client fixtures/assertions and, only if evidence proves necessary, the corresponding parser. Do not inspect or modify the KM repository, runtime config, scheduler, generated session artifacts, or production spool. Do not weaken closed-schema parsing merely to make tests pass.

## Required behavior

- Update valid ready/reservation fixture builders to match the current canonical delivery-envelope response contract.
- Preserve the endpoint-path assertion's purpose, including the currently canonical invocation/completion paths if applicable; rename the test if the historical count “six” is no longer correct.
- Ensure malformed-field tests each reach and assert the intended validation boundary instead of failing on an earlier unrelated missing field.
- Keep exact-key/closed-schema validation and delivery envelope/digest requirements intact.
- Add or retain focused coverage for malformed `deliveryEnvelope`, `deliveryEnvelopeDigest`, and `reviewedTextHash`.

## Verification

Run:

1. `pnpm exec vitest run extensions/deliberation/src/km-client.test.ts`
2. `pnpm exec vitest run extensions/deliberation/src extensions/deliberation/scripts/intake-producer.test.ts`
3. `OPENCLAW_DELIBERATION_KM_ROOT=/Users/michal/.openclaw/workspace/km-system pnpm test:deliberation:km-integration`

Record exact pass/fail counts in the final note. No build, npm link, Gateway restart, Discord send, config mutation, commit, or push in this task.
