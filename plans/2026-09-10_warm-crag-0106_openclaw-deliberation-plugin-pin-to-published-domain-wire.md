# Plan 2026-09-10: OpenClaw Deliberation Plugin Pin to Published Domain Wire Contract

Pin the Deliberation plugin to the accepted repository-local publication bundle without changing runtime configuration, deployment policy, or wire semantics.

## Evidence

- `plans/checkpoints/deliberation_wire_publication.md:31` releases this task and approves source-only fake-test work; deployment, installation, restart, live processing, and protocol cutover remain excluded.
- `plans/checkpoints/deliberation-wire-publication/manifest.json:1` defines bundle schema/version `1`/`1`, bundle digest `b9eaada06b60b8ecba17a378832f03591fbbf0e5a574844cd6b94a9d722ee338`, contract digest `292e7f17b13379c8e909497084bddccb57e0f371f79f7113ebd894a78cd6a98f`, and fixtures digest `357e965edb2a82b7793f92807928718843f31d6152c7524723cf65a7207c8a78`.
- The authority map at `plans/checkpoints/deliberation_wire_publication.md:3` grants the domain only `contract.json` and `fixtures.json`; runtime/store/deployment/protocol-gate evidence is excluded.

## Current Surface

- `extensions/deliberation/contracts/km-wire-v1.json` and `cutover-controls-v1.json` are the independent domain wire/schema and fixture copies; `src/contract.test.ts` validates and hashes them.
- `extensions/deliberation/contracts/openclaw-overlay-v1.json`, `source-identity-v1.json`, `source-identity-fixtures-v1.json`, and `history-read-v*.json` remain OpenClaw-owned overlays/contracts.
- `extensions/deliberation/src/km-client.ts` independently validates closed responses, preserves intake source identity, reservation/invocation/completion fencing, duplicate protection, and final-delivery evidence.
- `extensions/deliberation/src/intake.ts`, `history-read.ts`, and final delivery tests establish plugin-owned admission, freshness/history, and native-delivery behavior.

## Approach

1. Characterize the current two wire files, their fixtures, and every `km-client` request/response consumer against the supplied contract/fixtures before edits. Record exact incompatible fields in `plans/checkpoints/deliberation_wire_pin.md` and stop without modifying the pin if any current consumer behavior is not representable.
2. Copy the accepted canonical bytes into domain-qualified local artifacts under `extensions/deliberation/contracts/`; add a local pin manifest that fixes bundle schema/version, ordered member paths, member hashes, bundle hash, and canonicalization. Do not read/import the host checkpoint or any sibling checkout at runtime or in tests.
3. Replace the independent local wire and fixture authority with those pinned artifacts. Keep only the authority-map-approved domain members in the pin; retain plugin overlays, source identity, history, intake, and final-delivery contracts as OpenClaw-owned files.
4. Rework local provenance and contract tests so domain integrity is checked by the pin and OpenClaw provenance covers only OpenClaw-owned artifacts. Remove obsolete `km-wire-v1.json` and `cutover-controls-v1.json` only after all consumers use the pin.
5. Add a focused pin test for missing, tampered, version-mismatched, unordered, and digest-mismatched local artifacts plus producer fixture compatibility. Keep `km-client` and workflow tests as consumer characterization for request/status, intake, history, reservation/completion, duplicate, and delivery invariants.
6. Update the Deliberation reference page to distinguish the immutable published domain wire pin from the plugin-owned overlay and transport/history/delivery behavior. Do not change endpoint behavior, configuration, controls, runtime state, or deployment instructions.
7. Record baseline and post-change command results, exact authority membership, the bundle and member digests, and unrun build/deployed-identity/protocol-smoke requirements in `plans/checkpoints/deliberation_wire_pin.md`.

## TDD

Implement the TDD cycle with `skill:tdd`; record RED and GREEN from the identical command in `plans/checkpoints/warm-crag-0106.red-green-proof.md`.

**Test file:** `extensions/deliberation/src/deliberation-wire-pin.test.ts`

**Focused command:**

```bash
pnpm test extensions/deliberation/src/deliberation-wire-pin.test.ts -- --reporter=verbose
```

Create this RED skeleton before copying artifacts or editing consumers:

```ts
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const contractDir = join(dirname(fileURLToPath(import.meta.url)), "../contracts");

describe("Deliberation published wire pin", () => {
  it("requires the versioned local pin manifest", async () => {
    await expect(
      readFile(join(contractDir, "deliberation-wire-pin-v1.json"), "utf8"),
    ).resolves.toContain('"bundleVersion":1');
  });

  it("will hash each pinned artifact", async () => {
    const bytes = await readFile(join(contractDir, "deliberation-v2-v1-contract.json"));
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(
      "292e7f17b13379c8e909497084bddccb57e0f371f79f7113ebd894a78cd6a98f",
    );
  });
});
```

| Test                                 | RED                                                                            | GREEN                                                               |
| ------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| pin manifest exists and is versioned | missing-file rejection                                                         | local manifest reports bundle version `1`                           |
| contract and fixture integrity       | missing/tampered bytes or digest mismatch                                      | both hashes match the accepted manifest                             |
| pin structure                        | altered member order, unknown member, or mismatched bundle/version is rejected | exactly the two authority-map members are accepted                  |
| fixture compatibility                | a published request/status fixture fails local schema or consumer parsing      | all supported domain fixtures pass without widening plugin overlays |

## Verification

Run serially after the focused RED/GREEN command:

```bash
pnpm test extensions/deliberation/src/contract.test.ts extensions/deliberation/src/deliberation-wire-pin.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/hooks.test.ts extensions/deliberation/src/history-read.test.ts extensions/deliberation/src/orchestration.test.ts extensions/deliberation/src/delivery-composition.test.ts -- --reporter=verbose
```

- Use only fakes/local loopback servers already present in these tests.
- Do not run live sessions, send messages, call providers, mutate a spool, restart services, install/link, or deploy.
- Separately list, without claiming execution, the required `pnpm build`, installed-artifact identity, and approved deployed protocol-smoke evidence.

## Files

| File                                                                 | Change                                                                                                                                |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `extensions/deliberation/contracts/deliberation-v2-v1-contract.json` | Add exact local copy of the accepted domain contract bytes.                                                                           |
| `extensions/deliberation/contracts/deliberation-v2-v1-fixtures.json` | Add exact local copy of the accepted domain fixture bytes.                                                                            |
| `extensions/deliberation/contracts/deliberation-wire-pin-v1.json`    | Add explicit domain pin metadata: schema/version, ordered members, all accepted digests, canonicalization, and authority declaration. |
| `extensions/deliberation/contracts/km-wire-v1.json`                  | Delete after consumers migrate to the pin.                                                                                            |
| `extensions/deliberation/contracts/cutover-controls-v1.json`         | Delete after producer fixtures replace its domain-owned fixture role.                                                                 |
| `extensions/deliberation/contracts/provenance.json`                  | Remove superseded domain-copy hashes; retain only OpenClaw-owned artifact provenance and point to the separate pin authority.         |
| `extensions/deliberation/src/contract.test.ts`                       | Validate the pinned local contract/fixtures and preserve checks for plugin-owned overlays and source identity.                        |
| `extensions/deliberation/src/deliberation-wire-pin.test.ts`          | Add isolated pin-integrity, authority-membership, tamper, and fixture-compatibility tests.                                            |
| `extensions/deliberation/src/km-client.test.ts`                      | Adapt only fixture paths/assertions required by the pin; preserve closed request/response and reservation/completion behavior.        |
| `docs/plugins/reference/deliberation.md`                             | Document published-domain pin ownership versus OpenClaw transport/history/delivery ownership.                                         |
| `plans/checkpoints/deliberation_wire_pin.md`                         | Implementation-time evidence record; do not create during planning.                                                                   |

## Constraints

- Preserve `openclaw-overlay-v1.json`, source identity, history-read contracts, authentication, fail-closed admission, freshness, duplicate protection, terminal outcome distinctions, reservation fencing, and final-delivery ownership unless the supplied contract directly requires a compatible consumer adaptation.
- The pin must be self-contained in this extension and survive a source repository move. No network fetch, host-bundle test dependency, remote generation, or hand-maintained authority mirror.
- If published fixtures expose a real consumer incompatibility, stop and write the incompatibility report; do not hand-edit canonical bytes or redesign the protocol.

## Skills

- `tdd`: capture the required focused RED/GREEN evidence.
- `openclaw-testing`: choose the focused extension test lane and broaden only to the listed consumer coverage.
- `technical-documentation`: review the scoped ownership wording before editing the public reference page.
- `autoreview`: mandatory fresh code review before any implementation commit.

_Status: DRAFT_
