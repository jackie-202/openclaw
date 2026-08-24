# Deliberation Full Gate Implementation Note

## Canonical Command

`pnpm test:deliberation:full-gate`

## Result

The canonical command failed closed during preflight in 0.64 seconds because the OpenClaw checkout is dirty. It did not execute behavioral leaves and did not create `plans/checkpoints/quick-brook-1900.full-gate.json`. No 23-row Green result is claimed.

The checked-in Deliberation provenance is also not the supplied authority: `extensions/deliberation/contracts/provenance.json` records `acceptedRevision: calm-cove-1824`, two stale owner hashes, and no runtime-wire or spool-contract hash. The runner requires the exact accepted bundle and will reject this state after the clean-checkout prerequisite is met.

## Required Authority

- KM repository: `/Users/michal/.openclaw`
- KM root: `/Users/michal/.openclaw/workspace/km-system`
- Revision: `79bbc5c0426bc7be901d5199da11b21213bfa008`
- Contract SHA-256: `5c63424b32a8db8370a1212ff7eb3878695afbb5d0fec3721fbab326908de44b`
- Fixtures SHA-256: `f26ca9afb804664cdcc03947262001d1d8441eab6d5ad9d92bb8533ae3c916b4`
- Runtime wire SHA-256: `a0e42e4fe54eedab6f9955e77f439a4e69c9614a60560ca46532ce0de9dbb528`
- Spool contracts SHA-256: `47587e405d3e6b7f433eb7d450bd02969546860ff0d6822ad7bea9ff2478a0ca`

Direct inspection of the external checkout was denied by the active external-directory permission boundary, so these supplied values were not relabeled as locally verified.

## Verification

- Negative verifier RED/GREEN: captured in `plans/checkpoints/quick-brook-1900.red-green-proof.md`.
- Ledger tests: 14 passed, 1 conditional `OR-23` skipped outside canonical candidate context.
- Build: passed.
- Scoped direct Oxlint: passed.
- Wrapper Oxlint: blocked by unrelated missing `openai/resources/chat/completions.js` declarations during boundary preparation.
- Core test typecheck: blocked by unrelated `priority` properties in `src/plugins/hooks.sync-only.test.ts`.
- `git diff --check`: passed.
- Plan-compliance validator: its workflow files were denied by the active external-directory permission boundary.
- Autoreview: the scoped prompt was submitted, but the dirty-worktree bundle was 2,044,657 characters and exceeded the 1,048,576-character engine limit; no review verdict was produced.

Repository readiness, deployment, live activation, provider authenticity, and pilot readiness remain unknown/not approved.
