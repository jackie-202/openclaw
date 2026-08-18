# Blocked: cool-crag-7527

The provenance refresh is blocked by a semantic incompatibility in the verified
KM owner revision `dd17cfe22abcdc5e8a755c2cc0731cf0552e9bb1`.

## Immutable Owner Evidence

- `git status --porcelain -- contracts/deliberation-v2/v1/contract.json contracts/deliberation-v2/v1/fixtures.json`: clean.
- Both files are tracked by `git ls-tree -r HEAD`.
- `contracts/deliberation-v2/v1/contract.json` SHA-256: `73e0a731064201ffe51ad5a19b048b43b513007b523f72acfff328c254dd6171`.
- `contracts/deliberation-v2/v1/fixtures.json` SHA-256: `756bd7ff380fef8b537ae1c5495d96ccdbe2f57a4e1ab54911ea3047c12e892f`.

## Incompatibility

`contracts/deliberation-v2/v1/contract.json#/schemas/deliveryTarget` now:

- requires `threadId`, while OpenClaw's generic `km-wire-v1.json` allows it to
  be absent;
- restricts `provider` to `discord` and `slack`, while the generic wire accepts
  a provider-independent identifier; and
- replaces the generic legacy reservation input with `deliveryTargetInput` and
  a transitional four-component target normalization.

The owner fixture adds cross-provider delivery vectors and destination-thread
requirements. Those are provider adapter concerns, but they are now part of
the owner wire instead of the separate `openclaw-overlay-v1.json` overlay.
Refreshing hashes alone would falsely attest that the unchanged generic mirror
implements this owner contract.

No product provenance or test assertion was changed.
