# Red/Green Proof: fresh-peak-7116

## RED Phase

Historical genuine RED evidence is preserved at
`plans/checkpoints/dark-reef-5008.red-green-proof.md`. That task ran
`pnpm test extensions/deliberation/src/final-adapter.test.ts` before production
code existed and recorded the missing-module failure. This acceptance follow-up
does not fabricate a later RED after prior work.

## GREEN Phase

The plugin remains fail-closed while the required KM and SDK contracts are
unavailable. Fresh focused verification:

```text
$ pnpm test extensions/deliberation/src/sole-send.test.ts -- --reporter=verbose
Test Files  1 passed (1)
Tests  1 passed (1)
[test] passed 1 Vitest shard in 9.26s

$ pnpm tsgo:extensions
$ node scripts/run-tsgo.mjs -p tsconfig.extensions.json --incremental --tsBuildInfoFile .artifacts/tsgo-cache/extensions.tsbuildinfo
```

No production code was added because plugin-only delivery remains impossible:

- `extensions/deliberation/src/km-client.ts` has reservations and completions,
  but no immutable final-delivery envelope or durable provider-invoked
  acknowledgement.
- `src/plugin-sdk/channel-outbound.ts` exposes only
  `sendDurableMessageBatch`, which owns durable send/retry semantics and is
  therefore prohibited for this at-most-once adapter.
- `src/plugin-sdk/discord.ts` exposes only Discord history reads, not a
  provider-neutral account-bound one-shot sender. Importing the Discord
  extension's local runtime API would violate the plugin boundary.

Smallest proposed core seam: add a narrow public runtime SDK subpath exposing
an account-bound `sendOneShot` operation that accepts an exact channel,
account, target, and text; performs one provider invocation without retry,
replay, rerouting, or persistence; and returns a target-bound receipt or a
closed failure. KM must separately ship a versioned immutable envelope and an
invocation-ack endpoint before the Deliberation adapter can consume that seam.
