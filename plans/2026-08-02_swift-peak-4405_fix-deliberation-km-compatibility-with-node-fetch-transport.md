# Plan 2026-08-02: Fix Deliberation KM compatibility with Node fetch transport headers

_Status: DRAFT - blocked on KM-owned contract change_

## Decision

- Do not change `extensions/deliberation/src/km-client.ts`: it already uses the supported global `fetch` and sends only the required application headers. A local Node probe confirmed that deleting `sec-fetch-mode` from caller-owned `Headers` does not prevent Undici from emitting `sec-fetch-mode: cors`.
- Do not replace `fetch`, add retries, hide HTTP errors, or broaden caller-controlled headers. Those options either violate scope or weaken the boundary without fixing its owner.
- Require the KM owner to add case-insensitive `Sec-Fetch-Mode` to the listener's closed **transport-header** allowlist, preserving the exact application-header allowlist, authentication, protocol/media checks, loopback binding, and fail-closed responses. The listener regression must accept the supported Node value (`cors`) and continue rejecting an unknown application header such as `X-Deliberation-Unknown`.
- Stop OpenClaw implementation until the KM owner supplies the revised canonical contract and listener test evidence. Do not edit `km-system` from this task.

## Analysis

- `extensions/deliberation/src/km-client.ts:409` resolves SecretRefs per request, applies timeout/fail-closed error mapping, and constructs `Accept`, `Authorization`, `X-Deliberation-Protocol-Version`, plus body-only `Content-Type`; no public request API permits extra headers.
- `extensions/deliberation/contracts/km-wire-v1.json:8` separates four closed application headers from transport headers but does not list `Sec-Fetch-Mode`; `extensions/deliberation/contracts/provenance.json:2` marks this file as a hash-pinned mirror of KM-owned authority.
- `extensions/deliberation/src/km-client.test.ts:27` covers the protocol route/header, SecretRef materialization, endpoints, and closed responses, but uses mocked `fetch` and therefore cannot expose Node's automatic transport metadata.
- `extensions/deliberation/src/hooks.test.ts:275` already proves sanitized KM failure and `extensions/deliberation/src/hooks.test.ts:308` proves independent fail-closed source silence. No adjacent plugin behavior change is needed.
- `docs/plugins/reference/deliberation.md:59` documents the wire operations and closed schemas but not the application-versus-transport header distinction.
- Runtime probe on Node `v25.6.1` / Undici `7.21.0` observed `sec-fetch-mode: cors` on both ordinary and caller-sanitized global-fetch requests. The task supplies the same failure on the supported live runtime; no external repository inspection is needed.

## Knowledge Base

- `learnings/architecture/2026-07-27_external-authority-must-define-the-wire-contract.md`: OpenClaw must not invent a change to an externally owned protocol.
- `learnings/architecture/2026-07-28_external-contract-gates-precede-behavioral-tdd.md`: obtain accepted owner evidence before syncing behavior or fixtures.
- `learnings/architecture/2026-07-29_acceptance-fix-plans-must-close-contract-gates-explicitly.md`: a blocked outcome is valid only when the owner accepts it; otherwise resume after the contract gate closes.
- `learnings/architecture/2026-07-28_resolve-credentials-from-both-source-and-runtime-config.md`: retain the current SecretRef/materialized-secret resolution path.
- Recall used local fallback because collection `openclaw-fork-learnings` was unavailable; all ten returned files were reviewed.

## Available Skills

- `compound-plan`: owns this planning artifact.
- `recall-knowledge`: supplied repository planning constraints.
- `tdd`: run the post-gate RED/GREEN cycle and save proof.
- `validate-implementation`: verify the later fixture/test/docs sync against the accepted contract.
- `save-learning`: record the ownership and transport-header finding after planning.

## Implementation

1. Obtain KM-owner evidence containing the listener change, a canonical contract that classifies `Sec-Fetch-Mode` as transport metadata, and tests showing Node transport metadata accepted while unknown application headers remain rejected. If this evidence is not supplied, record the gate and stop without product edits.
2. Use `skill:tdd` to add the focused real-global-fetch loopback test below. Run it before syncing the fixture and record the HTTP-400 RED in `plans/checkpoints/swift-peak-4405.red-green-proof.md` without credentials or request bodies.
3. Replace `extensions/deliberation/contracts/km-wire-v1.json` only with the accepted KM-owner artifact; update `extensions/deliberation/contracts/provenance.json` source metadata and SHA-256 in the same change. Do not hand-edit the mirror or add other transport headers without owner evidence.
4. Extend `extensions/deliberation/src/contract.test.ts` to assert the exact four application headers, `Sec-Fetch-Mode` membership in transport headers, and absence of `X-Deliberation-Unknown` from both sets.
5. Keep `extensions/deliberation/src/km-client.ts` unchanged. Strengthen its existing request-header assertions only as needed to prove GET omits `Content-Type`, POST includes it, and neither path adds caller-controlled application headers.
6. Update `docs/plugins/reference/deliberation.md` to distinguish closed application headers from the narrow transport allowlist and state that unknown application headers remain rejected.
7. Run focused client/contract tests, existing intake fail-closed coverage, the Deliberation plugin suite, and the package-local TypeScript boundary command. Record exact commands and outcomes in the implementation final note.

## Files to Modify

| File                                                | Change after KM gate closes                                                                                         |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `extensions/deliberation/contracts/km-wire-v1.json` | Sync the accepted KM-owned transport-header contract.                                                               |
| `extensions/deliberation/contracts/provenance.json` | Record revised owner provenance and contract hash.                                                                  |
| `extensions/deliberation/src/km-client.test.ts`     | Reproduce Node global-fetch metadata at a loopback HTTP boundary and retain exact client-header/SecretRef coverage. |
| `extensions/deliberation/src/contract.test.ts`      | Lock application-versus-transport classification and unknown-header rejection.                                      |
| `docs/plugins/reference/deliberation.md`            | Document the supported transport-header seam.                                                                       |

`extensions/deliberation/src/km-client.ts` and `extensions/deliberation/src/plugin.test.ts` are inspect-only unless authoritative evidence reveals a separate in-repository defect.

## TDD

Implement the cycle with `skill:tdd` and write RED/GREEN evidence to `plans/checkpoints/swift-peak-4405.red-green-proof.md`.

**Test file:** `extensions/deliberation/src/km-client.test.ts`
**Run command:** `pnpm test extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/contract.test.ts -- --reporter=verbose`
**Edit hint:** append to `describe("KM contract parsing")`; use the real global `fetch`, not `fetchImpl`.

```ts
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";

it("accepts transport metadata emitted by the supported Node fetch", async () => {
  const contract = JSON.parse(
    await readFile(new URL("../contracts/km-wire-v1.json", import.meta.url), "utf8"),
  ) as { transportHeaders: string[] };
  const transportHeaders = new Set(contract.transportHeaders.map((name) => name.toLowerCase()));
  const server = createServer((request, response) => {
    const unsupported =
      request.headers["sec-fetch-mode"] && !transportHeaders.has("sec-fetch-mode");
    response.writeHead(unsupported ? 400 : 200, { "Content-Type": "application/json" });
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
    if (!address || typeof address === "string") throw new Error("missing test listener address");
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

| Test                              | RED before accepted fixture sync                                                                   | GREEN after sync                                                                                                          |
| --------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Node global-fetch loopback health | Client receives HTTP 400 because `Sec-Fetch-Mode` is absent from the mirrored transport allowlist. | Health resolves while exact application headers remain unchanged.                                                         |
| Contract header classification    | `Sec-Fetch-Mode` membership assertion fails.                                                       | Four application headers remain exact; `Sec-Fetch-Mode` is transport-only; unknown application header is absent/rejected. |

## Verification

1. `pnpm test extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/contract.test.ts -- --reporter=verbose`
2. `pnpm test extensions/deliberation/src/hooks.test.ts -- --reporter=verbose`
3. `pnpm test:extension deliberation -- --reporter=verbose`
4. `node scripts/run-tsgo.mjs -p extensions/deliberation/tsconfig.json`
5. `pnpm docs:list` and `git diff --check`

## Dependencies

- Revised immutable KM contract and listener proof from the KM owner.
- Supported Node runtime global `fetch`; no new dependency or transport implementation.
