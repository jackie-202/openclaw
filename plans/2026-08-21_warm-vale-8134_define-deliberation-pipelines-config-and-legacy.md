# Plan 2026-08-21: Define deliberation pipelines config and legacy normalization

Normalize canonical and legacy plugin input at startup into one pipeline-based runtime shape without changing intake, KM wire, or final-send behavior.

## Approach

- Make `pipelines[]` the only runtime authority. Each entry has a bounded non-empty `id`, one strict Discord/Slack `source`, and an optional strict explicit `target` using canonical `channel`/`accountId`/`target` identity fields plus optional provider-valid `threadId`.
- Represent source-default delivery only by an omitted pipeline target. Accept omitted `threadId` on explicit Discord and Slack targets as root delivery; reject malformed thread IDs and inheritance-like/unknown fields through closed provider schemas.
- Parse raw input as exactly one closed shape: canonical `pipelines`, or legacy `sources` with optional global `deliveryTarget`. Reject any presence of both authorities before branch parsing.
- Normalize legacy sources deterministically to pipelines. Derive each compatibility ID from its unambiguous encoded `v1:<provider>:<account>:<channel>` source identity and copy the normalized legacy global target into every generated pipeline.
- Build a source-keyed pipeline index from the normalized array, then reject duplicate IDs, duplicate canonical sources, processing-source overlap, and duplicate restricted session keys.
- Keep any producer-facing global-target value as a private projection derived only when all normalized pipelines have the same explicit target. This preserves current legacy behavior without retaining raw legacy config as runtime authority; the next producer-contract slice replaces this projection with selected-pipeline resolution.
- Preserve `processingSource`, `km`, and `restrictedSessionKeys` as top-level globals with their existing validation and meaning.

## Implementation

1. In `extensions/deliberation/src/config.ts`, split raw canonical and legacy schemas from the exported normalized `DeliberationConfig`; add strict pipeline/target schemas, deterministic legacy ID generation, mixed-shape rejection, normalization, uniqueness checks, and the derived source index/global-target compatibility projection.
2. In `extensions/deliberation/openclaw.plugin.json`, model the two accepted raw shapes with exclusive closed-schema branches. Add pipeline definitions and keep legacy definitions only in the compatibility branch; keep SecretRef metadata and all global field constraints unchanged.
3. Update source-only consumers in `extensions/deliberation/index.ts`, `extensions/deliberation/src/route-match.ts`, and `extensions/deliberation/src/history-read.ts` to read normalized pipelines or their derived index. Do not return `pipelineId` from admission or alter intake payloads.
4. Adapt `extensions/deliberation/src/km-client.ts` only to consume the normalized, derived common-target projection. Do not select a per-source pipeline, derive a source-default target, or alter reservation/final delivery semantics.
5. Expand `extensions/deliberation/src/config.test.ts` with canonical/legacy parity, deterministic compatibility IDs, preserved globals, manifest/runtime alignment, and deterministic failures for mixed authority, duplicate IDs/sources, malformed identities, processing overlap, unknown inheritance fields, and provider-specific thread formats.
6. Convert the route-shape and loader fixtures in `extensions/deliberation/src/route-match.test.ts` and `src/plugins/source-checkout-runtime.test.ts` to canonical pipelines. Retain a focused legacy fixture in config tests and the producer probe so compatibility and the producer-slice boundary remain explicit.
7. Replace legacy examples in `extensions/deliberation/README.md` and `docs/plugins/reference/deliberation.md` with pipeline examples covering explicit root, explicit thread, and omitted source-default targets. State that source-default resolution activates in the following producer-contract slice, not this config slice.
8. Document the compatibility removal gate beside the normalizer and in both docs surfaces: remove the legacy branch and derived global-target projection after the approved live config is migrated to `pipelines`, repository fixtures contain no operational legacy examples, and the producer-contract slice consumes selected pipelines directly. Name that follow-up as a required cleanup, not an indefinite deprecation.
9. Run `skill:validate-implementation`, then a fresh `skill:autoreview`; resolve accepted findings before handoff. Do not inspect or edit live config, restart Gateway, or touch KM contracts.

## Files To Modify

| File                                              | Change                                                                      |
| ------------------------------------------------- | --------------------------------------------------------------------------- |
| `extensions/deliberation/src/config.ts`           | Canonical schemas, legacy normalizer, indexes, invariants, and removal gate |
| `extensions/deliberation/src/config.test.ts`      | RED/GREEN parser, parity, manifest, and negative-path coverage              |
| `extensions/deliberation/openclaw.plugin.json`    | Exclusive canonical/legacy raw config schemas                               |
| `extensions/deliberation/index.ts`                | Read Slack presence from normalized pipelines                               |
| `extensions/deliberation/src/route-match.ts`      | Match against the normalized pipeline index without exposing pipeline IDs   |
| `extensions/deliberation/src/route-match.test.ts` | Canonical route-shape fixture                                               |
| `extensions/deliberation/src/history-read.ts`     | Validate configured sources through normalized pipelines/index              |
| `extensions/deliberation/src/km-client.ts`        | Consume only the derived common-target compatibility projection             |
| `src/plugins/source-checkout-runtime.test.ts`     | Canonical loader-backed config fixtures                                     |
| `extensions/deliberation/README.md`               | Repository-local canonical examples and cleanup gate                        |
| `docs/plugins/reference/deliberation.md`          | Public canonical config and migration semantics                             |

## TDD

Implement the TDD cycle using `skill:tdd`. Append the initial test to `extensions/deliberation/src/config.test.ts`, capture genuine RED before production edits, and store proof at `plans/checkpoints/warm-vale-8134.red-green-proof.md`.

**Focused command for both RED and GREEN:**

```bash
TASK_ID=warm-vale-8134 python3 "$HOME/.config/opencode/skills/tdd/scripts/proof-capture.py" red -- pnpm test extensions/deliberation/src/config.test.ts -- --reporter=verbose
```

Use the identical command with `green` for GREEN.

```ts
import { describe, expect, it } from "vitest";
import { parseDeliberationConfig } from "./config.js";

describe("deliberation pipeline config", () => {
  it("normalizes canonical pipelines as the sole runtime authority", () => {
    const parsed = parseDeliberationConfig({
      enabled: true,
      failClosed: true,
      pipelines: [
        {
          id: "slack-aplikace",
          source: { channel: "slack", accountId: "default", target: "C123" },
          target: { channel: "discord", accountId: "default", target: "delivery" },
        },
      ],
      processingSource: { channel: "discord", accountId: "default", target: "processing" },
      km: {
        endpoint: "https://km.invalid",
        credential: { source: "env", provider: "default", id: "KM_TOKEN" },
        requestTimeoutMs: 1000,
      },
      restrictedSessionKeys: ["agent:reviewer"],
    });

    expect(parsed.pipelines).toEqual([
      {
        id: "slack-aplikace",
        source: { channel: "slack", accountId: "default", target: "C123" },
        target: { channel: "discord", accountId: "default", target: "delivery" },
      },
    ]);
    expect(parsed).not.toHaveProperty("sources");
    expect(parsed).not.toHaveProperty("deliveryTarget");
  });
});
```

| Test                      | RED                                                              | GREEN                                                                                                  |
| ------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Canonical pipelines parse | Current strict schema rejects `pipelines` and requires `sources` | Parser returns the canonical pipeline and no raw legacy fields                                         |
| Legacy/canonical parity   | Runtime has no pipeline representation                           | Equivalent inputs produce identical pipelines, indexes, globals, and derived compatibility target      |
| Closed validation matrix  | Current parser cannot distinguish canonical invariants           | Mixed shapes, duplicate IDs/sources, malformed identities, and invalid thread/inheritance fields throw |
| Manifest parity           | Manifest requires only legacy `sources`                          | Manifest accepts either exclusive branch and mirrors runtime constraints                               |

## Verification

1. Focused config, identity, route-shape, and loader fixtures:

   `pnpm test extensions/deliberation/src/config.test.ts extensions/deliberation/src/source-identity.test.ts extensions/deliberation/src/route-match.test.ts src/plugins/source-checkout-runtime.test.ts`

2. Existing target-override behavior and producer boundary:

   `pnpm test extensions/deliberation/src/km-client.test.ts extensions/deliberation/scripts/intake-producer.test.ts`

3. Smallest relevant plugin suite:

   `pnpm test extensions/deliberation`

4. Touched-surface checks and docs:

   `pnpm check:changed`

   `pnpm docs:list && pnpm docs:check-links && git diff --check`

Record exact commands and outcomes in the implementation final note.

## Dependencies

- The repository-local proposal and existing source identity fixtures are authoritative; do not inspect `km-system` or external/live configuration.
- The following producer-contract slice owns pipeline selection, `pipelineId`, source-default target derivation, and removal of the temporary common-target projection.

_Status: DRAFT_
