# Deliberation Integration Proof: bold-peak-4880

## Status

**BLOCKED: no approved contract-converged KM revision exists in the supplied owner repository, so a fresh GREEN cannot be captured without fabricating owner convergence.**

External/live convergence remains **unknown**. No production code, mirrored contract, fixture, owner hash, provenance status, or KM checkout file was changed.

## Inherited RED

- Artifact: `plans/checkpoints/bold-wave-3956.red-green-proof.md`
- Approved owner repository: `https://github.com/jackie-202/agent-workspace.git`
- Immutable hash-matched revision: `872436aad992826b5d501597e265e8c2b94e6f78`
- Command: `env OPENCLAW_DELIBERATION_KM_ROOT=/Users/michal/Projects/openclaw-fork/tmp/bold-wave-3956-agent-workspace/workspace/km-system pnpm test:deliberation:km-integration`
- Outcome: exit 1; 12 passed and 11 failed of 23 current-harness scenarios.
- Failure: every positive setup reached the owner listener but returned `400 SCHEMA_INVALID` because the runtime excludes required `pipelineId`, intake `deliveryTarget`, and target `mode` fields.
- Task-log evidence gap: `plans/checkpoints/bold-wave-3956.evidence.md` reports truncated command lines and unavailable outcomes. The complete command and outcome above come from the preserved proof artifact, not reconstructed session logs.

## Fresh Owner Inspection

- Fetch command: `git fetch origin --prune`
- Fetch result: owner `main` advanced from `3c65959a095a9a85b614462867412060e9c508d7` to `c97bfeed87cb99a32dcbfd22deb39eb0623e2e52`.
- Remote-head command: `git ls-remote --heads origin`
- Remote-head result: the owner repository exposes only `refs/heads/main` at `c97bfeed87cb99a32dcbfd22deb39eb0623e2e52`.
- Supplied checkout status: clean, detached at `872436aad992826b5d501597e265e8c2b94e6f78`.
- Accepted owner hashes at the detached revision:
  - contract: `d3c0771d5c1d63fecc18cb93e381136fa8af3054c96cbcdebb95b7785a46dc5f`
  - fixtures: `a399132355c792e3861a3e8e2d8e2542e0ccb517231e817acf8afe3c54cca4b7`
- Latest owner hashes at `c97bfeed87cb99a32dcbfd22deb39eb0623e2e52`:
  - contract: `01efb2b800b2aba98faf07bd5a830fd439f34db29e19f810825c145b9813eb9f`
  - fixtures: `aff1538ae121a72a2d30d3075a4e6d2107a10be5a7aad13823aa99d5699c4a76`

Owner history contains six revisions that changed either tracked owner file. Blob-identity checks show only `872436aad992826b5d501597e265e8c2b94e6f78` has both accepted file versions. Later revisions changed at least one owner file. A history search for `"mode"` in the owner delivery-target, wire, and spool runtime returned no revision.

At latest owner `main`, `lib/deliberation_wire.py` accepts `pipelineId` and intake `deliveryTarget`, but `lib/deliberation_delivery_target.py` still closes targets to `provider`, `account`, `channel`, and optional `threadId`. It therefore rejects the mode-bearing target required by the current OpenClaw gate. The hash-matched revision has the earlier wire validator and rejects all three required extensions.

## GREEN

Not run. The plan requires semantic inspection before execution and says to stop when approval, accepted hashes, or executable convergence is absent. Running the latest owner revision would stop at OpenClaw's owner-hash preflight; rerunning the accepted revision would repeat the preserved genuine RED. Patching the owner checkout, stripping producer fields, or refreshing accepted hashes would manufacture evidence and is forbidden.

The missing prerequisite is an owner-approved immutable revision that retains the accepted contract and fixture bytes while implementing `pipelineId`, intake `deliveryTarget`, and mode-bearing target parsing and persistence. Once supplied, run exactly:

`env OPENCLAW_DELIBERATION_KM_ROOT="<approved-converged-km-root>" pnpm test:deliberation:km-integration`

Required result: exit 0 and all 23 scenarios passing. A caller-owned acceptance Test Gate manifest for `bold-peak-4880` was not supplied, so no acceptance result is claimed.
