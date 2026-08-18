# Deliberation Provenance Test Gate: fresh-wave-6142

## Inherited Evidence

The genuine parent RED/GREEN remains
`plans/checkpoints/calm-dune-9914.red-green-proof.md`. It establishes the
manifest repair, but not validation against a trusted KM checkout.

## Fresh Validator Attempt

Canonical command:

```bash
OPENCLAW_DELIBERATION_KM_ROOT="$OPENCLAW_DELIBERATION_KM_ROOT" \
  pnpm test:deliberation:km-integration
```

Result: exit code 1. The supplied local KM checkout resolved, but did not
contain the required `scripts/deliberation-v2-listener.py`. The validator
therefore stopped in `requireKmRoot()` before its `provenance:` owner-file
hash checks or any integration assertions could run.

The separate attempt with no environment variable also failed at the validator's
required configuration check. No `provenance:` mismatch was reported, but this
does not demonstrate provenance acceptance because that guard was not reached.

## Gate Status

**BLOCKED.** No trusted KM checkout with the required listener and Python
environment is available in this task environment. This artifact is not an
acceptance result. Rerun the canonical command once with the approved KM root;
a passing run must record its exit code, test summary, and absence of
`provenance:` failures before the manifest can be accepted by this gate.
