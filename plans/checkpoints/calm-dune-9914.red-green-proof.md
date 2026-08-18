# Deliberation Provenance RED/GREEN Proof: calm-dune-9914

## RED Phase

This repair starts from the preserved worktree regression, where
`provenance.json` replaces the accepted baseline owner pin with an unresolved
`ownerPin`. The immutable owner evidence is recovered from
`git show HEAD:extensions/deliberation/contracts/provenance.json`, not inferred
from the semantic handoff or local mirror hashes:

- Accepted revision: `401ababdd3`
- `km-system/contracts/deliberation-v2/v1/contract.json`: `c5ea7d1514b8834368d90bed51f0f9f99772b0b59ab885a4a67bccb78775cbd5`
- `km-system/contracts/deliberation-v2/v1/fixtures.json`: `afe531da034209a8a329b6af24d40381cc06cc0a93406ca274c99564eb4d5d34`

The focused assertion will be changed before the manifest so it fails against
the unresolved state. This is a new RED for the acceptance repair; no
historical RED is fabricated.

First attempt: `pnpm test extensions/deliberation/src/contract.test.ts -- --reporter=verbose`
waited 120 seconds behind the user-owned local heavy-check lock (`test`, PID
57503) and did not start. The lock was preserved; the same command must be
retried to capture the assertion failure before the manifest edit.

Focused RED command after the lock released:
`pnpm test extensions/deliberation/src/contract.test.ts -- --reporter=verbose`

Result: exit code 1. Seven assertions passed; `pins the accepted KM owner
revision and owner files` failed at `contract.test.ts:294` because
`acceptedRevision` was `undefined`, rather than `401ababdd3`.

## GREEN Phase

After restoring `acceptedRevision`, the exact two-entry `ownerFiles` map, and
removing unresolved `ownerPin`, the same command passed with exit code 0:

```text
Test Files  1 passed (1)
Tests  8 passed (8)
[test] passed 1 Vitest shard in 2.74s
```

`shasum -a 256` also matched all five current local manifest pins, and
`git diff --check` completed with exit code 0.
