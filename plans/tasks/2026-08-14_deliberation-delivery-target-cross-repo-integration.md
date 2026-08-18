---
title: Deliberation delivery target: cross-repository integration coverage
type: implementation
---

# Deliberation delivery target: cross-repository integration coverage

Reference: `/Users/michal/.openclaw/workspace/docs/proposals/proposal-20260814-091650-c8b343_deliberation-configurable-final-delivery-target.md` (architectural context only; implement only the cross-repository integration-test slice).

## Goal

Extend the existing isolated Deliberation KM integration harness to prove final-delivery routing across the OpenClaw plugin and a real isolated KM listener/spool.

## Scope

Work only inside `/Users/michal/Projects/openclaw-fork`.

Primary files:
- `extensions/deliberation/scripts/km-listener.cross-repo.ts`
- `extensions/deliberation/README.md` only if the documented test behavior needs updating
- narrowly required test helpers under `extensions/deliberation/scripts/`

The existing command is `pnpm test:deliberation:km-integration`.

The test may invoke the existing cross-repository listener executable/harness as already designed, but must not modify files in `km-system` or broaden discovery outside the established harness boundary. Do not use a live spool, production credentials, the live listener service, or real Discord outbound delivery.

## Required scenarios

Use the real isolated KM listener/spool and an injected/fake outbound provider to verify:

1. **Default route** — with no plugin `deliveryTarget`, intake from source A produces a reviewed ready item whose final delivery is sent to A.
2. **Override route** — with plugin `deliveryTarget` B, intake from source A is ultimately sent to B.
3. **Source provenance** — history/freshness or the closest canonical source projection still identifies A after override delivery.
4. **Durable fencing** — invocation/completion evidence records B and a mismatched attempted target A or C fails closed.
5. **No real send** — provider calls are fully captured by the fake adapter and include the expected account/channel/text exactly once.

Keep the harness deterministic, isolated, bounded, and safe to run repeatedly. Reuse its existing temporary directories, listener lifecycle, cleanup, and assertion patterns rather than creating another integration framework.

## Acceptance

- `pnpm test:deliberation:km-integration` passes and exercises both default and override routing end to end.
- The assertions distinguish source identity, processing source, and final delivery target.
- Failure output makes a routing regression diagnosable.
- Existing isolated-listener scenarios continue to pass.
- Final note records exact verification command and result.

## Verification

Run:

`pnpm test:deliberation:km-integration`

Also run the focused Deliberation final-adapter and KM-client tests if the harness or helpers share those seams.
