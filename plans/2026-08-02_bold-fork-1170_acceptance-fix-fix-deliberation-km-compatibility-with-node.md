# Plan 2026-08-02: Repair Deliberation KM Node Fetch Header Compatibility

Patch and prove the KM-owned listener first, then replace the preserved consumer mirror with the accepted owner artifact.

_Status: DRAFT_

## Progress

- [x] Phase 0: Config and initialization
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Analysis

- The preserved diff already changes `extensions/deliberation/contracts/km-wire-v1.json`, `extensions/deliberation/contracts/provenance.json`, `extensions/deliberation/src/contract.test.ts`, and `extensions/deliberation/src/km-client.test.ts`. Do not recreate or discard those tests.
- `extensions/deliberation/src/km-client.ts:400` correctly uses Node global `fetch` and supplies only the four application headers. No client workaround can suppress Undici's automatic `Sec-Fetch-Mode: cors` metadata.
- `plans/checkpoints/swift-reef-7187.red-green-proof.md` records consumer GREEN but real-listener HTTP 400. Its mirror-derived loopback is synchronization proof only.
- Access to the external `km-system` authority workspace is currently denied. Implementation cannot finish until the agent can inspect and edit the owner listener, canonical contract, scoped instructions, and existing tests.
- Public docs already describe the unchanged six-operation protocol in `docs/plugins/reference/deliberation.md:59`; no docs change is needed.

## Knowledge Base

- `learnings/tooling/swift-reef-7187-mirror-green-is-not-listener-green.md`: owner listener GREEN must precede mirror synchronization; retain an unknown-header control.
- `learnings/architecture/2026-07-29_acceptance-fix-plans-must-close-contract-gates-explicitly.md`: a repeated external-contract blocker is not acceptance completion.
- Recall used deterministic local fallback because `openclaw-fork-learnings` was unavailable. Applicable external-authority learnings prohibit consumer-authored wire contracts.

## Available Skills

- `tdd`: preserve historical RED and capture fresh owner/live GREEN in `plans/checkpoints/bold-fork-1170.red-green-proof.md`.
- `openclaw-testing`: select and run focused Deliberation verification.
- `autoreview`: mandatory fresh review after code and proof changes.
- `validate-implementation`: verify authority, mirror, provenance, and acceptance closure.
- `save-learning`: mandatory last implementation action.

## Implementation

1. Obtain access to the KM workspace. Read its scoped `AGENTS.md`, `lib/deliberation_wire.py`, `contracts/deliberation-v2/v1/contract.json`, and the existing listener test module before editing; record the actual owner revision. Stop rather than guessing if access remains denied.
2. Using `skill:tdd`, link the genuine RED in `plans/checkpoints/swift-peak-4405.red-green-proof.md`. Extend the existing KM listener tests before production edits to assert case-insensitive `Sec-Fetch-Mode: cors` acceptance, rejection of any other `Sec-Fetch-Mode` value, and continued HTTP 400 rejection of `X-Deliberation-Unknown`.
3. Update the KM listener's transport-header validation and canonical contract together. Add only `Sec-Fetch-Mode` as transport metadata and accept only the `cors` value in listener validation; leave the four application headers, auth, media/protocol validation, loopback binding, and all other unknown-header rejection unchanged.
4. Run the owner test command. Start the changed listener and run an authenticated Node global-`fetch` health request against it; require HTTP 200. Run a credential-redacted unknown-application-header request and require HTTP 400. Record exact commands/outcomes without credentials in `plans/checkpoints/bold-fork-1170.red-green-proof.md`.
5. Copy the accepted owner `contract.json` verbatim over `extensions/deliberation/contracts/km-wire-v1.json`. Replace the provisional `provenance.json` metadata and SHA-256 with the real owner revision, source, acceptance date, and artifact hash.
6. Retain the existing global-fetch loopback as consumer synchronization proof. Tighten `extensions/deliberation/src/contract.test.ts` to compare the complete transport-header list exactly, so no additional metadata is silently authorized.
7. Run focused and complete plugin verification. Use `skill:autoreview` until no actionable finding remains, then `skill:validate-implementation`. Invoke `skill:save-learning` as the final action.

## Files to Modify

| File                                                              | Change                                                                                                                                     |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `km-system/lib/deliberation_wire.py`                              | Accept only case-insensitive `Sec-Fetch-Mode: cors` as generated transport metadata.                                                       |
| `km-system/contracts/deliberation-v2/v1/contract.json`            | Add the owner-approved transport classification; keep the value restriction enforced and documented by owner listener tests.               |
| Existing KM listener test module, located after access is granted | Add positive `cors`, negative non-`cors`, and unknown-application-header cases. Do not invent a test path before inspecting the authority. |
| `extensions/deliberation/contracts/km-wire-v1.json`               | Replace the provisional edit with a byte-for-byte owner artifact.                                                                          |
| `extensions/deliberation/contracts/provenance.json`               | Pin actual owner revision and hash.                                                                                                        |
| `extensions/deliberation/src/contract.test.ts`                    | Assert exact application and transport header sets.                                                                                        |
| `plans/checkpoints/bold-fork-1170.red-green-proof.md`             | Link historical RED and record fresh owner tests plus real-listener GREEN/control evidence.                                                |

## TDD

Implement the owner cycle with `skill:tdd`. Do not fabricate a new RED or revert the preserved consumer changes; use the historical real-listener RED and add owner tests before changing owner production code.

**Consumer test file:** `extensions/deliberation/src/km-client.test.ts`
**Focused command:** `pnpm test extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/contract.test.ts -- --reporter=verbose`
**Owner test file/command:** resolve from the KM workspace after permission is granted and record the exact path/command in the proof; authority access is required to provide real imports without guessing.

The preserved runnable consumer skeleton is:

```ts
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { expect, it } from "vitest";
import { createKmClient } from "./km-client.js";

it("accepts transport metadata emitted by the supported Node fetch", async () => {
  const contract = JSON.parse(
    await readFile(new URL("../contracts/km-wire-v1.json", import.meta.url), "utf8"),
  ) as { transportHeaders: string[] };
  const transportHeaders = new Set(contract.transportHeaders.map((name) => name.toLowerCase()));
  const server = createServer((request, response) => {
    const rejected =
      !transportHeaders.has("sec-fetch-mode") || request.headers["sec-fetch-mode"] !== "cors";
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
    await expect(client.health()).resolves.toMatchObject({ status: "ok" });
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});
```

| Proof            | RED                                                                                            | GREEN                                                                                                               |
| ---------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Real KM listener | Historical proof: Node global `fetch` receives HTTP 400 with generated `sec-fetch-mode: cors`. | Changed listener returns HTTP 200 for global `fetch`; non-`cors` mode and `X-Deliberation-Unknown` return HTTP 400. |
| Consumer mirror  | Preserved historical focused run failed before the provisional mirror edit.                    | Focused tests pass after byte-for-byte owner sync and real provenance pinning.                                      |

## Verification

1. KM owner test command discovered from the authority, with exact output recorded in the proof.
2. Authenticated Node global-`fetch` health probe: HTTP 200; redacted unknown-header control: HTTP 400.
3. `pnpm test extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/contract.test.ts -- --reporter=verbose`
4. `pnpm test:extension deliberation -- --reporter=verbose`
5. `node scripts/run-tsgo.mjs -p extensions/deliberation/tsconfig.json`
6. `git diff --check`

## Dependencies

- Read/write permission for the KM authority and permission to restart its loopback listener.
- A test credential exposed only to the live probe process; no credential value or path may enter artifacts.
- The canonical mirror/provenance step is blocked until owner tests and live listener behavior are GREEN.
