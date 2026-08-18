# Deliberation Provenance Blocker: fresh-brook-6923

The accepted provenance manifest cannot be resolved from permitted evidence.

Missing immutable owner evidence:

- Exact KM owner revision identifier.
- Complete `ownerFiles` map of `km-system/`-relative paths to SHA-256 hashes.

The supplied five hashes prove only current OpenClaw mirror-file integrity. Local semantic contract tests and artifacts prove the converged camelCase `sourceThreadId`, generic durable `deliveryTarget`, reservation-only legacy target input, and separate OpenClaw provider overlay. They do not establish KM owner identity or owner-file provenance.

`extensions/deliberation/scripts/km-listener.cross-repo.ts` requires `ownerFiles` and verifies every entry against the KM checkout. It cannot accept the unresolved manifest. Provide the immutable owner bundle above or an explicit accepted-blocked decision before changing `contracts/provenance.json`.

No runtime safety guards, adapter isolation, source-channel send fencing, or provider protections were changed. Do not restart or reload the plugin. After an accepted owner pin and local validation, Jackie must perform a full gateway restart, not a plugin-only reload, then run the live smoke.

Verification status:

- `pnpm test extensions/deliberation/src/contract.test.ts -- --reporter=verbose`: timed out with exit code 1 after 120 seconds while waiting for the user-owned local heavy-check lock (PID 53721); the test did not start.
