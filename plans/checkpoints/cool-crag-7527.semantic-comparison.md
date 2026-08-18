# Semantic Comparison: cool-crag-7527

## Owner Snapshot

- Immutable KM `HEAD`: `dd17cfe22abcdc5e8a755c2cc0731cf0552e9bb1`.
- Owner paths are clean and tracked at that HEAD.
- `contract.json` SHA-256: `73e0a731064201ffe51ad5a19b048b43b513007b523f72acfff328c254dd6171`.
- `fixtures.json` SHA-256: `756bd7ff380fef8b537ae1c5495d96ccdbe2f57a4e1ab54911ea3047c12e892f`.

## Semantic Comparison

The following owner/generic mirror invariants remain equal: protocol version,
closed schemas, camelCase intake keys, required `sourceThreadId` grammar,
source identity and account/channel domain, headers, controls, endpoints,
delivery envelope, invocation fence, and completion fence.

The comparison is incompatible overall. The live owner requires a provider
enum of `discord` or `slack` and a mandatory destination `threadId`; OpenClaw's
generic mirror accepts a provider-independent destination with optional
`threadId`. The owner also replaces the reservation's generic legacy target
input with a different `deliveryTargetInput` contract. Its new fixtures cover
cross-provider destinations and destination-thread rules. These provider
constraints cannot be folded into the generic KM wire without breaking the
accepted generic-wire/provider-overlay split.

`sourceThreadId` remains separate from provider destination thread identity,
but the required generic structured-target compatibility does not hold.
Existing source-channel fencing, drafting-only isolation, memory/write guards,
and fake-provider isolation were not changed or revalidated because the
provenance gate failed before integration execution.

## Byte/Hash Comparison

The two live owner hashes match the task-approved values above. This is
separate from semantic compatibility and is insufficient to refresh the pin.

## Verification Status

The canonical seven-test integration verifier was not run: it would only
report the expected provenance preflight mismatch against an intentionally
unrefreshed manifest and cannot establish compatibility.

The preserved focused contract suite passed: 8/8 tests. `git diff --check`
also passed.

Remaining rollout sequence after a compatible owner contract exists: host
deploy verifier -> full gateway restart -> live smoke.
