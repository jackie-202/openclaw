# Deliberation Provenance Acceptance: calm-dune-9914

## Semantic Evidence

`quick-reef-1568 semantic contract convergence` and the stable handoff
`proposal-20260814-203937-cbe1dc` establish the mirrored Deliberation semantic
contract. This evidence is distinct from byte-level provenance.

## Owner Provenance

The accepted immutable owner pin recovered from the repository baseline is
revision `401ababdd3`:

- `km-system/contracts/deliberation-v2/v1/contract.json`: `c5ea7d1514b8834368d90bed51f0f9f99772b0b59ab885a4a67bccb78775cbd5`
- `km-system/contracts/deliberation-v2/v1/fixtures.json`: `afe531da034209a8a329b6af24d40381cc06cc0a93406ca274c99564eb4d5d34`

## Local Hash Evidence

The manifest independently pins current OpenClaw mirror artifacts:

- `km-wire-v1.json`: `8fa171dacaca99d36684a310308e36e46598782a19265cffd103eee9e3e0dc5b`
- `cutover-controls-v1.json`: `da2c9b719b852bd4fa3d1ea8ee1dd13e43a88b78c41f5028e2099fc8b2eedc93`
- `openclaw-overlay-v1.json`: `843c764a29cee3578ee8ebf0b4a4fb22b03c2528f62220177297da831c6864c8`
- `source-identity-v1.json`: `252f03184601f2f2fa8752c5df1b4bb7dd4a20b90bd47c932eee09b9c0bc3af6`
- `source-identity-fixtures-v1.json`: `8e4f0373b5d986cb8098fbc7bf3565cfd3f88ef9b83e7189f4bbb53299a427fb`

## Rollout Evidence

No restart, deployment, or live provider/transport call was performed by this
repair. Jackie must perform a full gateway restart, not a plugin-only reload,
then run the live smoke.
