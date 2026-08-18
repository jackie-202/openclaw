# Plan 2026-08-10: Audit generated channel and config metadata compatibility

Produce a revision-pinned, read-only compatibility report that separates canonical retained schemas from disposable generated snapshots.

## Problem

Determine whether the generated-only change in `e904c5b752d8` remains meaningful at base `4b85d834ed1586062f31bded2f358fc5192d1674`, and identify every artifact that a later promotion must regenerate or preserve for the retained WhatsApp and Deliberation baselines.

## Analysis

### Codebase Context

- `e904c5b752d8` changes only `src/config/bundled-channel-config-metadata.generated.ts`; against parent `2c030c303aba`, it adds WhatsApp `groups.*.deliveryPolicy` and `accounts.*.groups.*.deliveryPolicy`.
- The revisions are divergent. Base `4b85d834...` contains neither `deliveryPolicy` nor Deliberation; current retained source contains both, so the old generated blob cannot be applied as a source patch.
- WhatsApp source chain: `src/config/zod-schema.providers-whatsapp.ts` -> `src/plugin-sdk/bundled-channel-config-schema.ts` -> `extensions/whatsapp/config-api.ts` -> `extensions/whatsapp/src/config-schema.ts` -> `scripts/generate-bundled-channel-config-metadata.ts` -> `src/config/bundled-channel-config-metadata.generated.ts`.
- The channel generator also consumes each bundled plugin's `openclaw.plugin.json`, `package.json` `openclaw.channel` block, UI hints, and optional `security-contract-api`; it sorts entries and list fields before formatting/chunking the JSON.
- Deliberation has no declared channel. Its canonical config surfaces are `extensions/deliberation/openclaw.plugin.json` and `extensions/deliberation/src/config.ts`; promotion copies manifest metadata through `scripts/copy-bundled-plugin-metadata.mjs` rather than adding Deliberation to the channel metadata blob.
- Generated metadata is consumed by config validation/schema assembly, channel IDs, fast status scanning, doctor migration, and secret-surface policy; stale output is therefore runtime-relevant, not cosmetic.

### Relevant Documentation

- `AGENTS.md`, `extensions/AGENTS.md`, `src/plugins/AGENTS.md`, `src/plugin-sdk/AGENTS.md`, and `scripts/AGENTS.md` define manifest-first ownership and require generator/write/check alignment.
- No product documentation or PlantUML artifact is needed for this repository-local generated-metadata audit.

### Knowledge Base

- `learnings/architecture/2026-07-28_residue-audits-require-activation-proof.md`: inventory alone is insufficient; trace registration/import and classify activation.
- `learnings/architecture/2026-08-09_audit-historical-aliases-by-architecture-generation.md`: compare each architecture generation at the requested revision and preserve forbidden executable checks as proof gaps.
- `learnings/architecture/2026-07-29_contract-gated-plans-should-name-absent-audit-artifacts.md`: do not substitute historical evidence for an absent current canonical source.
- Recall used local fallback because collection `openclaw-fork-learnings` was unavailable; the remaining returned learnings were reviewed but were not directly applicable to generated config metadata.

## Available Skills

- `compound-plan`: owns this plan's structure and canonical path.
- `recall-knowledge`: supplied repository audit and compatibility rules before synthesis.
- `save-learning`: capture the planning/session lesson after the plan is complete.

## Solutions

Use blob-level Git inspection without checkout or regeneration. Treat source schemas/manifests as authority, generated files as revision-specific projections, and compare semantic paths rather than whole minified lines.

## Implementation

1. **Reproduce.** Record the object IDs, parent, ancestry result, and scoped name/status diff for `e904c5b752d8`, its parent, and base `4b85d834...`. Inventory only the WhatsApp, Deliberation, generator, generated artifact, package scripts, CI/release checks, and generated-artifact consumers with `git show`, `git ls-tree`, and `git grep`; do not checkout, regenerate, run tests, or inspect live state.
2. **Trace.** Build a source -> generator/copy path -> artifact -> consumer map. For WhatsApp, compare the parent, generated commit, base, and retained current schema paths and identify root/account `deliveryPolicy` parity. For Deliberation, compare its manifest JSON Schema with `parseDeliberationConfig`, prove its absence from both historical revisions, prove that no `channels` declaration means exclusion from the channel generator, and trace manifest copying into built plugin metadata.
3. **Diagnose.** Classify each observed delta as canonical retained input, regenerated projection, unrelated upstream schema evolution, or proof gap. Verify deterministic ordering/chunking and `--check` stale detection from generator source; conclude whether the old blob is stale wholesale and list the exact semantic fields that a fresh artifact must contain after retained sources are applied. Keep WhatsApp channel metadata and Deliberation plugin metadata as separate ownership rows.
4. **Write report.** Immediately before writing, run `python3 scripts/investigation-path.py --task-id warm-reef-8132 --project . --touch` when the helper exists and write only to its returned path. If absent, create `plans/investigations/` and write `plans/investigations/warm-reef-8132_audit-generated-channel-config-metadata.md`. Include the revision facts, source -> generator -> artifact -> consumer map, semantic delta/classification table, ownership, idempotence expectations, proof gaps, and the later commands below. End with exactly one proposal verdict and one confidence value. Record the canonical report path in task state; do not edit `plans/tasks/`.

### Later Verification Commands

Run only after a promotion workspace contains the intended retained source changes:

```bash
pnpm config:channels:gen
pnpm config:channels:check
pnpm check:bundled-channel-config-metadata
pnpm test extensions/whatsapp/src/config-schema.test.ts extensions/deliberation/src/config.test.ts src/config/validation.channel-metadata.test.ts src/plugins/bundled-plugin-metadata.test.ts src/plugins/copy-bundled-plugin-metadata.test.ts
pnpm build
pnpm release:generated:check
```

Require the first generation to project current upstream plus retained WhatsApp fields, the immediate check to report no further change, Deliberation manifest/runtime schema parity to pass, and build/release metadata copying to retain the Deliberation manifest.

## Files to Modify

| File | Change |
|---|---|
| `plans/investigations/<helper-returned-path>.md` | Write the canonical read-only investigation report. |

## TDD: skip

The deliverable is a read-only diagnostic report; executable generation and tests are explicitly deferred to later promotion verification.

## Dependencies

- Local Git objects for `e904c5b752d8`, `2c030c303aba`, and `4b85d834ed1586062f31bded2f358fc5192d1674` must remain available.
- Conclusions are repository-local; no live config, external repository, generated output, or runtime result may be used in this investigation.

*Created: 2026-08-10*
*Status: DRAFT*
