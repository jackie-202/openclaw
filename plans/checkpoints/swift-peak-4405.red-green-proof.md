# TDD Red-Green Proof: swift-peak-4405

## RED Phase

- **Evidence source:** Task-supplied live diagnostic from the authenticated loopback boundary.
- **Observed behavior:** Node global `fetch` adds `sec-fetch-mode: cors`; the KM listener returns HTTP 400 because the KM-owned closed transport-header allowlist does not include `Sec-Fetch-Mode`.
- **Control behavior:** The same endpoint, credential, and protocol headers sent by curl return HTTP 200.
- **Expected compatibility behavior:** Standard transport metadata emitted by the supported Node runtime is accepted without changing OpenClaw's exact application headers.
- **Security invariant:** An unknown application header such as `X-Deliberation-Unknown` remains rejected.
- **Result:** RED is characterized at the external KM listener. The repository-local GREEN implementation is blocked until the KM owner supplies the revised canonical contract and listener test evidence required by the plan.

No credential values, request bodies, or runtime state are recorded in this proof.

## GREEN Phase

- **Status:** BLOCKED at the KM-owner contract gate; no OpenClaw product code or hash-pinned contract mirror was changed.
- **Focused baseline command:** `pnpm test extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/contract.test.ts extensions/deliberation/src/hooks.test.ts -- --reporter=verbose`
- **Focused baseline result:** 3 test files passed, 24 tests passed, 0 failed.
- **Extension command:** `pnpm test:extension deliberation -- --reporter=verbose`
- **Extension result:** 6 test files passed, 52 tests passed, 0 failed.
- **Type gate command:** `node scripts/run-tsgo.mjs -p extensions/deliberation/tsconfig.json`
- **Type gate result:** Passed with exit code 0 and no diagnostics.

These passing results prove the unchanged repository baseline, including SecretRef handling and fail-closed intake. They do not prove the external KM listener accepts Node's automatic `sec-fetch-mode: cors`; that GREEN requires the KM-owned listener and canonical contract change described in the RED phase.
