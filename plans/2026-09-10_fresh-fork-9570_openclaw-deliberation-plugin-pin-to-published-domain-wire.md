# Plan 2026-09-10: Deliberation published-wire pin acceptance repair

Replace the two independently maintained domain artifacts with the approved local publication bundle and preserve the plugin-owned boundary.

## Analysis

### Codebase Context

- `plans/checkpoints/deliberation-wire-publication/` now contains the approved manifest and exact contract/fixture bytes; `deliberation_wire_publication.md` limits transferred authority to those two members.
- `extensions/deliberation/src/contract.test.ts` is the sole consumer of both obsolete artifact names; `km-client.test.ts` reads the retired wire only for transport-header coverage. `km-client.ts` implements the six wire operations and the closed response/fencing checks.
- `hooks.test.ts`, `history-read.test.ts`, `orchestration.test.ts`, and `delivery-composition.test.ts` characterize OpenClaw-owned admission, history, reservation/invocation/completion, and single-attempt delivery behavior.
- `provenance.json` currently claims hashes for the two domain-owned files. Keep it limited to OpenClaw-owned overlay and source-identity artifacts after migration.

### Relevant Documentation

- `docs/plugins/reference/deliberation.md` documents the six-operation wire, closed schemas, and the ownership boundary. Update its wire-contract wording to identify the immutable local published pin while retaining OpenClaw ownership of adapters, history, and delivery.
- `extensions/AGENTS.md` requires plugin-local artifacts and prohibits imports outside the extension package.

### Knowledge Base

- `learnings/architecture/deliberation-wire-pin-local-transfer-bundle.md`: use exact transferred bytes, never recreate the external contract.
- `learnings/architecture/pin-published-wire-artifacts-by-authority-map.md`: pin only the two authority-map members with fixed order, versions, and digests; keep overlays, source identity, history, and final delivery local.
- `learnings/architecture/2026-07-28_residue-audits-require-activation-proof.md`: prove consumers no longer reference retired artifacts rather than relying on filename search alone.
- `learnings/architecture/2026-07-28_wire-protocol-versions-are-not-implementation-generations.md`: retain protocol-v1 behavior; this is an authority migration, not a protocol redesign.

## Available Skills

- `tdd`: capture genuine RED and GREEN proof for this follow-up task.
- `openclaw-testing`: choose and run the focused extension regression lane.
- `technical-documentation`: review the ownership wording in the public reference page.
- `autoreview`: run fresh review before any implementation commit.

## Implementation

1. Compare the supplied manifest members against the existing contract-test assumptions and KM client request/response behavior. If an approved fixture cannot be represented, stop and write the incompatibility to `plans/checkpoints/deliberation_wire_pin.md`; do not alter transferred bytes or protocol behavior.
2. Add byte-for-byte copies as `deliberation-v2-v1-contract.json` and `deliberation-v2-v1-fixtures.json`; add `deliberation-wire-pin-v1.json` with bundle schema/version, canonicalization, ordered two-member authority list, member SHA-256 values, and self-excluding bundle SHA-256 from the supplied manifest.
3. Create `deliberation-wire-pin.test.ts` before production artifacts, then capture a genuine RED under `fresh-fork-9570`. The prior `warm-crag-0106` proof is a blocker record, not a reusable RED; do not fabricate or retrofit it.
4. Move schema/fixture validation and selected wire assertions in `contract.test.ts` to the pinned files. Move `km-client.test.ts` transport-header source to the pinned contract. Delete `km-wire-v1.json` and `cutover-controls-v1.json` only after every consumer is migrated.
5. Remove the two domain members from `provenance.json`; keep hashes and assertions only for OpenClaw-owned overlay and source-identity artifacts. Add explicit pin-authority assertions rather than broad contract globbing.
6. Update the reference page to distinguish the published domain pin from plugin-owned overlay, intake, history, and final-delivery behavior. Do not change configuration, runtime state, deployment policy, or the six-operation protocol.
7. Run the focused and scoped regression commands with local fakes. Record baseline/RED/GREEN results, authority membership, all bundle/member digests, consumer-residue audit, and deliberately unrun build, deployed-identity, and protocol-smoke work in `plans/checkpoints/deliberation_wire_pin.md`.
8. Run `skill:autoreview`; retain the proof and checkpoint paths in the completion evidence.

## Files to Modify

| File                                                                 | Change                                                                          |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `extensions/deliberation/contracts/deliberation-v2-v1-contract.json` | Add the exact published contract bytes.                                         |
| `extensions/deliberation/contracts/deliberation-v2-v1-fixtures.json` | Add the exact published fixture bytes.                                          |
| `extensions/deliberation/contracts/deliberation-wire-pin-v1.json`    | Add closed authority and digest metadata from the supplied manifest.            |
| `extensions/deliberation/contracts/km-wire-v1.json`                  | Delete after migration.                                                         |
| `extensions/deliberation/contracts/cutover-controls-v1.json`         | Delete after migration.                                                         |
| `extensions/deliberation/contracts/provenance.json`                  | Retain only OpenClaw-owned artifact hashes.                                     |
| `extensions/deliberation/src/deliberation-wire-pin.test.ts`          | Add pin-integrity, authority, and fixture-compatibility coverage.               |
| `extensions/deliberation/src/contract.test.ts`                       | Consume pinned artifacts and preserve OpenClaw-owned contract checks.           |
| `extensions/deliberation/src/km-client.test.ts`                      | Read the pinned contract for transport-header coverage.                         |
| `docs/plugins/reference/deliberation.md`                             | Clarify published-pin versus plugin ownership.                                  |
| `plans/checkpoints/fresh-fork-9570.red-green-proof.md`               | Generated by `skill:tdd`; capture genuine RED and GREEN.                        |
| `plans/checkpoints/deliberation_wire_pin.md`                         | Record implementation verification and explicitly excluded deployment evidence. |

## TDD

Implementace TDD cyklu dle skill:tdd.

**Test file:** `extensions/deliberation/src/deliberation-wire-pin.test.ts`

**Focused command:**

```bash
pnpm test extensions/deliberation/src/deliberation-wire-pin.test.ts -- --reporter=verbose
```

Create the test before adding the pin artifacts, then run the same command through the TDD helper for both phases:

```bash
TASK_ID=fresh-fork-9570 python3 "$HOME/.config/opencode/skills/tdd/scripts/proof-capture.py" red -- pnpm test extensions/deliberation/src/deliberation-wire-pin.test.ts -- --reporter=verbose
TASK_ID=fresh-fork-9570 python3 "$HOME/.config/opencode/skills/tdd/scripts/proof-capture.py" green -- pnpm test extensions/deliberation/src/deliberation-wire-pin.test.ts -- --reporter=verbose
```

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

  it("pins the published contract digest", async () => {
    const bytes = await readFile(join(contractDir, "deliberation-v2-v1-contract.json"));
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(
      "292e7f17b13379c8e909497084bddccb57e0f371f79f7113ebd894a78cd6a98f",
    );
  });
});
```

| Test                            | RED                                                | GREEN                                                             |
| ------------------------------- | -------------------------------------------------- | ----------------------------------------------------------------- |
| versioned pin exists            | missing pin-file rejection                         | manifest reports bundle version `1`                               |
| ordered authority and digests   | missing artifact/digest mismatch                   | exact two transferred members and all approved SHA-256 values     |
| tamper and version rejection    | validation cannot accept altered bytes or metadata | altered copied artifact or manifest is rejected                   |
| published fixture compatibility | fixture schemas are not consumed locally           | each request/response fixture validates without widening overlays |

Run after GREEN:

```bash
pnpm test extensions/deliberation/src/contract.test.ts extensions/deliberation/src/deliberation-wire-pin.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/hooks.test.ts extensions/deliberation/src/history-read.test.ts extensions/deliberation/src/orchestration.test.ts extensions/deliberation/src/delivery-composition.test.ts -- --reporter=verbose
```

## Dependencies

- Use only `plans/checkpoints/deliberation-wire-publication/manifest.json` and its two transferred files as external-domain input; never read a sibling checkout, network source, or producer verifier.
- The pin must record `b9eaada06b60b8ecba17a378832f03591fbbf0e5a574844cd6b94a9d722ee338`, `292e7f17b13379c8e909497084bddccb57e0f371f79f7113ebd894a78cd6a98f`, and `357e965edb2a82b7793f92807928718843f31d6152c7524723cf65a7207c8a78`.
- Do not run build, installation, restart, live message/provider/spool work, deployed-identity checks, or protocol smoke tests. List those as unrun requirements in the verification checkpoint.

---

_Status: DRAFT_
