# Plan 2026-08-02: Fix Deliberation KM Node fetch transport headers

_Status: DRAFT_

## Progress

- [x] Phase 0: Initialize canonical plan
- [x] Phase 1: Research current implementation and prior acceptance evidence
- [x] Phase 2: Apply relevant learnings and project rules
- [x] Phase 3: Finalize implementation and TDD steps

## Analysis

### Codebase

- `extensions/deliberation/src/km-client.ts:409` uses global `fetch` and sends only the closed application headers; changing caller headers cannot suppress Undici's generated `Sec-Fetch-Mode`.
- `extensions/deliberation/contracts/km-wire-v1.json:8` omits `Sec-Fetch-Mode` from the transport allowlist; `extensions/deliberation/contracts/provenance.json:2` makes this a hash-pinned KM-authority mirror.
- `extensions/deliberation/src/km-client.test.ts:27` injects mocked fetch and cannot observe runtime-generated headers; `extensions/deliberation/src/contract.test.ts:9` verifies mirror provenance.
- No KM listener source exists in this repository. The task identifies authority files `km-system/lib/deliberation_wire.py` and `km-system/contracts/deliberation-v2/v1/contract.json`.
- The parent proof records a genuine external RED but no GREEN; generated task evidence reports no additional historical verification commands.

### Documentation

- `docs/plugins/reference/deliberation.md:59` documents the six-operation closed wire contract. Goal 005 is already accepted, so do not repeat docs work unless the accepted canonical artifact changes public behavior beyond transport classification.
- `pnpm docs:list` identifies this as the only Deliberation plugin reference.

### Knowledge

- `learnings/architecture/2026-08-02_fetch-generated-headers-belong-to-listener-transport-contract.md`: fix generated metadata at the listener; preserve application-header closure; sync authority before mirrors.
- `learnings/architecture/2026-08-02_external-listener-gates-require-external-green-proof.md`: consumer tests are baseline only; completion needs canonical contract and real listener GREEN.
- The acceptance task requires linking the historical RED from `plans/checkpoints/swift-peak-4405.red-green-proof.md` and capturing fresh GREEN under `swift-reef-7187`, not fabricating a post-change RED.
- Recall used deterministic local fallback because `openclaw-fork-learnings` was unavailable; only the external-authority and SecretRef findings were relevant.

## Available Skills

- `tdd`: preserve parent RED provenance and record the follow-up GREEN cycle.
- `task-evidence`: confirms the parent session logs contain no additional historical command evidence.
- `openclaw-testing`: choose focused Deliberation tests and type/build gates during implementation.
- `autoreview`: mandatory fresh code review after implementation and verification.
- `validate-implementation`: check the synchronized mirror and acceptance goals.
- `save-learning`: mandatory final implementation action.

## Implementation

1. In the KM authority, update the listener's case-insensitive transport-header validation to recognize only `Sec-Fetch-Mode: cors`; keep the exact application-header allowlist, authentication, protocol/media validation, loopback binding, and unknown-header rejection unchanged. Update the canonical contract and its listener regression in the same owner change.
2. Run the KM listener regressions and an authenticated Node global-`fetch` health request against that listener. Do not proceed on contract-only evidence: capture HTTP 200 from the actual changed listener and retain the unknown-application-header HTTP 400 control without recording credentials.
3. Copy the resulting immutable `km-system/contracts/deliberation-v2/v1/contract.json` into `extensions/deliberation/contracts/km-wire-v1.json`; update `provenance.json` owner revision/date/source and SHA-256. Never hand-edit the mirror ahead of authority.
4. Use `skill:tdd` to link the genuine parent RED from `plans/checkpoints/swift-peak-4405.red-green-proof.md`, add the loopback global-`fetch` regression below, and record fresh focused and live GREEN evidence in `plans/checkpoints/swift-reef-7187.red-green-proof.md`.
5. Tighten `contract.test.ts` to assert the exact four application headers, transport-only `Sec-Fetch-Mode`, and provenance hash. Leave `km-client.ts`, existing SecretRef/fail-closed tests, and docs unchanged unless the accepted canonical artifact requires a distinct consumer change.
6. Run focused tests, the complete Deliberation plugin lane, package-local TypeScript gate, and `git diff --check`. Run fresh `skill:autoreview` until no actionable finding remains, then `skill:validate-implementation` and finally `skill:save-learning`.

## Files to Modify

| File                                                                                                                                                            | Change                                                                                                                                                                                                              |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| KM owner listener and canonical contract (`km-system/lib/deliberation_wire.py`, `km-system/contracts/deliberation-v2/v1/contract.json`, existing listener test) | Accept only the characterized generated transport metadata and prove listener behavior. These authority files must be supplied or made available to the implementing agent; they are not present in this workspace. |
| `extensions/deliberation/contracts/km-wire-v1.json`                                                                                                             | Synchronize the accepted owner artifact verbatim.                                                                                                                                                                   |
| `extensions/deliberation/contracts/provenance.json`                                                                                                             | Record accepted owner provenance and new hash.                                                                                                                                                                      |
| `extensions/deliberation/src/km-client.test.ts`                                                                                                                 | Add the real global-`fetch` loopback compatibility regression.                                                                                                                                                      |
| `extensions/deliberation/src/contract.test.ts`                                                                                                                  | Lock exact application/transport classification and mirror integrity.                                                                                                                                               |
| `plans/checkpoints/swift-reef-7187.red-green-proof.md`                                                                                                          | Link historical RED and record fresh repository plus real-listener GREEN without secrets.                                                                                                                           |

## TDD

Implement the cycle with `skill:tdd`. Preserve the historical external RED; do not reconstruct or relabel the unchanged baseline as RED/GREEN.

**Test file:** `extensions/deliberation/src/km-client.test.ts`
**Run command:** `pnpm test extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/contract.test.ts -- --reporter=verbose`
**Edit hint:** add the Node imports and append inside `describe("KM contract parsing")` before syncing the owner artifact.

```ts
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";

it("accepts transport metadata emitted by Node global fetch", async () => {
  const contract = JSON.parse(
    await readFile(new URL("../contracts/km-wire-v1.json", import.meta.url), "utf8"),
  ) as { transportHeaders: string[] };
  const transportHeaders = new Set(contract.transportHeaders.map((name) => name.toLowerCase()));
  const server = createServer((request, response) => {
    const fetchMode = request.headers["sec-fetch-mode"];
    const rejected =
      fetchMode !== undefined && (!transportHeaders.has("sec-fetch-mode") || fetchMode !== "cors");
    response.writeHead(rejected ? 400 : 200, { "Content-Type": "application/json" });
    response.end(
      JSON.stringify({
        protocolVersion: 1,
        status: "ok",
        controls: { "source-intake": true, claims: true, review: true, sender: false },
      }),
    );
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("missing listener address");
    const client = createKmClient({
      config: { ...config, km: { ...config.km, endpoint: `http://127.0.0.1:${address.port}` } },
      openclawConfig: {} as never,
      env: { KM_TOKEN: "test-only" },
    });
    await expect(client.health()).resolves.toMatchObject({ protocolVersion: 1, status: "ok" });
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});
```

| Proof                         | RED                                                                                                   | GREEN                                                                                                                       |
| ----------------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Historical real listener      | Parent artifact records Node global `fetch` receiving HTTP 400 from generated `sec-fetch-mode: cors`. | Fresh authenticated request to the changed KM listener returns HTTP 200; unknown application header still returns HTTP 400. |
| Focused repository regression | Before mirror sync, health rejects because `Sec-Fetch-Mode` is absent from `transportHeaders`.        | After verbatim mirror/provenance sync, health resolves and contract assertions pass.                                        |

## Verification

1. KM owner test command and authenticated Node global-`fetch` probe, recorded exactly by the owner/implementer.
2. `pnpm test extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/contract.test.ts -- --reporter=verbose`
3. `pnpm test:extension deliberation -- --reporter=verbose`
4. `node scripts/run-tsgo.mjs -p extensions/deliberation/tsconfig.json`
5. `git diff --check`
