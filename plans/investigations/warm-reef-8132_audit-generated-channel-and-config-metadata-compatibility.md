# Audit generated channel and config metadata compatibility

Task: `warm-reef-8132`

## Scope

This is a read-only, revision-pinned audit of generated commit `e904c5b752d85c0265ec6f7210c628987bd2b422`, its parent `2c030c303aba3e27131903b08d934fd1764af78f`, upstream base `4b85d834ed1586062f31bded2f358fc5192d1674`, and the retained WhatsApp and Deliberation source baseline in the current checkout. No generator, build, test, lint, live-config, or external-repository command was run.

The local investigation-path helper is absent, so the deterministic fallback path is this file under `plans/investigations/`.

## Executive Finding

`e904c5b752d8` is a valid generated-output repair only on its June lineage. Its parent already has the canonical WhatsApp `deliveryPolicy` schema, but its generated artifact has no `deliveryPolicy`; the commit changes only the generated artifact and adds exactly two occurrences. The August base is on a divergent lineage, has materially different generator and WhatsApp source blobs, and has no `deliveryPolicy` in either its source schema or generated artifact. The old generated blob therefore cannot be promoted or used as a base artifact.

The retained WhatsApp behavior must be rebased as a source-level schema delta onto the August implementation and then projected with the August generator. Retained Deliberation is a separate plugin-config surface: it is absent from both historical revisions, declares no channel, and must remain excluded from bundled channel metadata while its manifest, runtime parser, package metadata, config-doc baseline, and built manifest copy remain aligned.

## Revision Facts

| Fact | Parent `2c030c3` | Generated commit `e904c5b` | Base `4b85d83` |
|---|---:|---:|---:|
| Generated artifact object | `9f36760d0ba5967debe3b7db6a26325d2968ff95` | `47835e2ac3cd090f4c46e50f8d5d7f547d8237ad` | `b25e1021949675da06e61d16cd14a90af1540ae8` |
| WhatsApp schema object | `02b09bd7f1d0cf0ed04f5ff9a3a04f133cdf6406` | `02b09bd7f1d0cf0ed04f5ff9a3a04f133cdf6406` | `ae6f9785ef26a02438871b70352b1e89491b3332` |
| `deliveryPolicy` in canonical WhatsApp schema | Present | Present | Absent |
| `deliveryPolicy` occurrences in generated artifact | 0 | 2 | 0 |
| `extensions/deliberation/**` | Absent | Absent | Absent |

- `e904c5b752d8` has parent `2c030c303aba3e27131903b08d934fd1764af78f` and changes only `src/config/bundled-channel-config-metadata.generated.ts` (`1` added and `1` removed minified/chunked line).
- The merge base of `e904c5b752d8` and `4b85d834ed1586062f31bded2f358fc5192d1674` is `538d36eaaaa6349a6539a2ad3d13dac7ed4c1f1d`, which is neither endpoint. Whole-tree diffs between the endpoints are not proposal diffs.
- The old and base generated artifacts have different object IDs and the scoped old-to-base comparison also changes the generator, WhatsApp manifest/package/config surface, and canonical schema. This is independent proof that the old artifact is not reusable wholesale.
- The retained canonical metadata files inspected in the current checkout are clean: `src/config/zod-schema.providers-whatsapp.ts`, `src/config/types.whatsapp.ts`, `src/config/group-policy.ts`, `src/config/bundled-channel-config-metadata.generated.ts`, `extensions/deliberation/openclaw.plugin.json`, `extensions/deliberation/package.json`, and `extensions/deliberation/src/config.ts`.

## Source To Artifact Map

| Surface | Canonical inputs and owner | Generator/copy path | Artifact | Consumers and effect |
|---|---|---|---|---|
| Bundled WhatsApp channel config | At the base, `src/config/zod-schema.providers-whatsapp.ts` owns the Zod schema; `src/plugin-sdk/bundled-channel-config-schema.ts` exposes it; `extensions/whatsapp/config-api.ts` and `extensions/whatsapp/src/config-schema.ts` expose the built channel surface and UI hints. `extensions/whatsapp/openclaw.plugin.json` owns plugin id and `channels: ["whatsapp"]`; `extensions/whatsapp/package.json` owns channel label/blurb/order/aliases/configured-state metadata; optional `security-contract-api` owns unsupported SecretRef patterns. | `scripts/lib/bundled-plugin-source-utils.mts` discovers tracked manifest/package pairs in sorted directory order. `scripts/generate-bundled-channel-config-metadata.ts` loads the plugin config surface, combines manifest/package/UI/security metadata, sorts entries by channel id, serializes fixed-size chunks, and formats them. | Tracked `src/config/bundled-channel-config-metadata.generated.ts`. Build/package paths additionally merge the WhatsApp entry into `dist/extensions/whatsapp/openclaw.plugin.json`. | Base config-schema assembly, raw channel validation, channel id/alias/label ordering, status scanning, doctor migration lookup, plugin registration fallback metadata, npm/bundled manifest augmentation, config-doc baseline generation, and unsupported SecretRef policy. Representative consumers are `src/config/schema.ts`, `src/config/validation-channel-rules.ts`, `src/channels/ids.ts`, `src/commands/status.scan.fast-json.ts`, `src/commands/doctor/shared/allowfrom-fallback-migration.ts`, `src/plugins/channel-validation.ts`, `scripts/lib/plugin-npm-package-manifest.mts`, and `src/secrets/unsupported-surface-policy.ts`. |
| Deliberation plugin config | `extensions/deliberation/openclaw.plugin.json` owns discovery metadata, startup activation, expected hooks, structural JSON Schema, and SecretInput contract. `extensions/deliberation/src/config.ts` owns executable parsing and cross-field invariants. `extensions/deliberation/package.json` owns the bundled entry. | The channel generator skips manifests with no `channels` declaration (`scripts/generate-bundled-channel-config-metadata.ts:257` at the base). Generic runtime postbuild invokes `scripts/copy-bundled-plugin-metadata.mts`, which copies and writes manifest/package metadata with write-if-changed semantics. | No Deliberation entry in `src/config/bundled-channel-config-metadata.generated.ts`. Generated build outputs are `dist/extensions/deliberation/openclaw.plugin.json` and `dist/extensions/deliberation/package.json`; these are build products, not canonical source. | Manifest-first plugin config validation occurs before runtime registration at the base through `src/plugins/loader-shared.ts:186`, `src/plugins/loader-runtime-candidate.ts:336`, and `src/plugins/loader-runtime-candidate.ts:523`. The retained plugin then calls `parseDeliberationConfig` at `extensions/deliberation/index.ts:17`. The copied manifest must preserve the same config and activation metadata in packaged/built execution. |
| Config documentation baseline | Base channel schema metadata is collected from bundled channel config surfaces; plugin schema metadata is collected from manifests. `src/config/channel-config-metadata.ts:127` and `src/config/channel-config-metadata.ts:220` keep plugin and channel surfaces separate. | `scripts/generate-config-doc-baseline.ts` uses `src/config/doc-baseline.runtime.ts`. | Tracked `docs/.generated/config-baseline.sha256` and `docs/.generated/config-baseline.counts.json`; full combined/core/channel/plugin JSON snapshots are local inspection artifacts and gitignored. | Detects intentional config-surface growth. WhatsApp adds two structurally reachable channel paths; Deliberation adds a plugin config schema. The tracked hash and affected count budgets must be refreshed consciously rather than copied from either historical lineage. |

## Generator Inputs At The Base

The bundled channel generator includes an entry only when all of the following hold:

- A tracked `extensions/<id>/openclaw.plugin.json` and `package.json` pair is discoverable.
- The manifest has at least one non-empty `channels` value.
- A plugin-local `src/config-schema.*` or `src/config-surface.*` module exists and exports a resolvable schema surface.

For every included channel it projects:

- `pluginId` and `channelId` from the manifest.
- `aliases`, `order`, `configurable`, configured-state environment variables, label, and description from `package.json` channel metadata, with manifest name/description fallbacks.
- JSON Schema and UI hints from the loaded plugin config surface.
- Channel-prefixed unsupported SecretRef paths from optional `security-contract-api` metadata.

Relevant base implementation points are `scripts/generate-bundled-channel-config-metadata.ts:11`, `scripts/generate-bundled-channel-config-metadata.ts:212`, `scripts/generate-bundled-channel-config-metadata.ts:257`, `scripts/generate-bundled-channel-config-metadata.ts:297`, and `scripts/generate-bundled-channel-config-metadata.ts:337`.

## Semantic Delta Classification

| Observed delta | Classification | Promotion treatment |
|---|---|---|
| `e904c5b` adds `deliveryPolicy` twice only in the generated blob while source and generator are unchanged from its parent. | June-lineage generated projection repair. | Do not replay the blob. Preserve only the semantic requirement proved by it. |
| The base canonical WhatsApp schema and generated blob have no `deliveryPolicy`. | Base behavior, not generated drift at `4b85d83`. | Add the retained field to the appropriate base source schema during promotion; do not assert that the base artifact is currently stale. |
| Retained `WhatsAppGroupConfig` and Zod group schema allow optional `deliveryPolicy` values `"auto-reply"` or `"plugin-only"`; account configs share the same group shape. The retained runtime defaults absent values to `auto-reply`. | Canonical retained source behavior. | Preserve root `channels.whatsapp.groups.*.deliveryPolicy` and account `channels.whatsapp.accounts.*.groups.*.deliveryPolicy`, including enum values and optional/default semantics. |
| Base WhatsApp source has unrelated upstream evolution and a different source object. | Unrelated upstream schema evolution. | Rebase the one retained field into the base shape. Never replace the base source module with the retained historical module. |
| Current retained generated metadata contains two `deliveryPolicy` occurrences. | Revision-specific projection, not authority. | Discard as a promotion input and regenerate from the rebased base source. |
| Deliberation is absent from the parent, generated commit, and base, and its retained manifest has no `channels` key. | Canonical retained plugin addition, outside channel metadata. | Preserve its manifest/package/runtime config inputs and built metadata copy; require zero Deliberation entries in the channel artifact. |
| Base config-doc hash/count artifacts predate both retained surfaces. | Stale after promotion, though valid at the unmodified base. | Regenerate from the combined base plus retained sources and inspect the channel/plugin count growth. |

## Required WhatsApp Projection

A fresh generated WhatsApp entry after promotion must contain both paths with the same optional string enum:

- `channels.whatsapp.groups.*.deliveryPolicy`: `"auto-reply" | "plugin-only"`.
- `channels.whatsapp.accounts.*.groups.*.deliveryPolicy`: `"auto-reply" | "plugin-only"`.

The two paths come from reuse of the common WhatsApp group shape at root and account scopes; they are not two independently owned schemas. The generated JSON Schema should not add a default because the retained Zod field is optional and runtime behavior supplies `auto-reply` when absent. The retained runtime/type evidence is `src/config/zod-schema.providers-whatsapp.ts:23`, `src/config/types.whatsapp.ts:26`, `src/config/group-policy.ts:20`, and `extensions/whatsapp/src/auto-reply/monitor/group-activation.ts:44`.

## Deliberation Schema Boundary

The retained manifest and parser align on the main structural contract:

- Required strict top-level fields: `enabled`, `failClosed`, `sources`, `processingSource`, `km`, and `restrictedSessionKeys`.
- `failClosed` is fixed to `true`.
- Routes use channel `discord` and canonical 1-96 character account/target components.
- KM endpoints are credential-free HTTPS or literal-loopback HTTP without query/fragment; `requestTimeoutMs` is an integer from 100 through 30000.
- Credentials permit materialized strings and SecretInput objects.

This is not full JSON-Schema/Zod equivalence, and promotion should not claim otherwise:

- The manifest rejects non-canonical route whitespace directly; the parser trims route strings before applying `encodeSourceIdentity`.
- Duplicate source routes and processing-source overlap are cross-field parser checks at `extensions/deliberation/src/config.ts:78` and `extensions/deliberation/src/config.ts:82`.
- Restricted-session uniqueness after trimming is enforced by the parser at `extensions/deliberation/src/config.ts:85`; JSON Schema `uniqueItems` operates on raw values.
- Existing parity tests directly cover endpoint cases and credential shape at `extensions/deliberation/src/config.test.ts:79` and `extensions/deliberation/src/config.test.ts:99`, but there is no exhaustive manifest-vs-parser accepted-domain proof.

The effective contract is therefore the intersection of manifest-first validation and `parseDeliberationConfig`. Copying the complete manifest into the build is required; generating a Deliberation channel entry would be both unnecessary and semantically wrong.

## Ownership

- Canonical WhatsApp schema semantics at the pinned base are owned by `src/config/zod-schema.providers-whatsapp.ts`, exposed through the Plugin SDK facade and the WhatsApp plugin-local config surface. WhatsApp manifest/package/UI/security metadata retain their separate plugin-owned fields.
- Canonical Deliberation discovery/config metadata is owned by `extensions/deliberation/openclaw.plugin.json`; executable normalization and cross-field checks are owned by `extensions/deliberation/src/config.ts`.
- `scripts/generate-bundled-channel-config-metadata.ts` owns only the channel projection; `scripts/copy-bundled-plugin-metadata.mts` owns build-time manifest/package copies; `scripts/generate-config-doc-baseline.ts` owns config-surface drift artifacts.
- There are no path-specific CODEOWNERS entries for these files. Repository architecture rules still require manifest-first plugin ownership and generator/write/check alignment.

## Idempotence Expectations

- Input discovery is sorted by plugin directory (`scripts/lib/bundled-plugin-source-utils.mts:66`, `scripts/lib/bundled-plugin-source-utils.mts:91`, and `scripts/lib/bundled-plugin-source-utils.mts:123` at the base).
- Alias, environment-variable, and unsupported-secret lists are deduplicated and sorted; entries are sorted by `channelId`.
- JSON uses deterministic `JSON.stringify`, fixed 16 KiB chunk boundaries, and repository `oxfmt` formatting.
- Generation compares complete expected bytes to the current file. `--check` never writes and fails on any mismatch (`scripts/lib/generated-output-utils.mts:15` and `scripts/lib/generated-output-utils.mts:17`). Write mode uses write-if-changed (`scripts/lib/generated-output-utils.mts:27`).
- A successful generation followed immediately by `config:channels:check` must report no drift. Repeating generation with unchanged inputs must produce no file change.
- Build metadata copying uses write-if-changed for both manifest and package outputs (`scripts/copy-bundled-plugin-metadata.mts:344` and `scripts/copy-bundled-plugin-metadata.mts:363` at the base). A second build from identical source should reproduce byte-identical metadata.
- Config-doc baseline generation must similarly settle: a generation followed by `config:docs:check` must pass without further changes.

## Artifact Disposition Before Promotion

| Path or artifact | Treatment |
|---|---|
| `e904c5b:src/config/bundled-channel-config-metadata.generated.ts` | Discard as a stale revision projection. |
| Current retained `src/config/bundled-channel-config-metadata.generated.ts` | Use only as evidence that both paths were previously projected; do not copy to the base. |
| Base `src/config/bundled-channel-config-metadata.generated.ts` | Regenerate after the source-level WhatsApp merge. Commit the complete fresh base-derived result. |
| Base `docs/.generated/config-baseline.sha256` and `docs/.generated/config-baseline.counts.json` | Regenerate after both WhatsApp and Deliberation sources are present; inspect channel and plugin deltas. |
| `extensions/deliberation/openclaw.plugin.json`, `extensions/deliberation/package.json`, `extensions/deliberation/src/config.ts` | Preserve as canonical retained inputs, subject to semantic rebase where the base APIs differ. Do not synthesize them from old generated metadata. |
| `dist/extensions/whatsapp/openclaw.plugin.json` | Rebuild from the fresh generated channel entry plus canonical WhatsApp manifest. |
| `dist/extensions/deliberation/openclaw.plugin.json` and `package.json` | Rebuild by generic metadata copying; manifest config and activation metadata must be retained without a generated channel config. |

## Required Later Verification

Run these only in a promotion workspace that already contains the intended retained source changes. The generation commands intentionally come before checks:

```bash
pnpm config:channels:gen
pnpm config:docs:gen
pnpm config:channels:check
pnpm check:bundled-channel-config-metadata
pnpm config:docs:check
pnpm test extensions/whatsapp/src/config-schema.test.ts extensions/deliberation/src/config.test.ts src/config/validation.channel-metadata.test.ts src/plugins/bundled-plugin-metadata.test.ts src/plugins/copy-bundled-plugin-metadata.test.ts
pnpm build
pnpm release:generated:check
```

Required observations after those commands:

- The fresh channel artifact reflects all current upstream channel schemas plus exactly the retained WhatsApp semantics at root and account group scopes.
- No Deliberation channel entry appears.
- Immediate channel and docs checks report no drift.
- Config-doc baseline changes identify intentional channel growth from WhatsApp and plugin growth from Deliberation.
- The built WhatsApp manifest receives the regenerated channel config; the built Deliberation manifest retains its plugin config schema, activation, expected hooks, and SecretInput contract without a synthetic channel config.
- `release:generated:check` passes all base-owned generation contracts. If it identifies another source-derived artifact such as plugin inventory after Deliberation is added, refresh that artifact with its named base generator rather than copying a retained historical output.

## Proof Gaps

- Executable generation, tests, build, lint, and release checks were prohibited for this investigation and remain required later proof.
- The exact post-rebase generated bytes and config-doc count deltas cannot be known until the intended source merge exists in one promotion workspace.
- Deliberation has focused endpoint/credential parity tests, not an exhaustive equivalence test between manifest JSON Schema and runtime parsing.
- No live config, packaged artifact, or external repository was inspected.

## Conclusion

**Proposal verdict: DO NOT PROMOTE the generated blob from `e904c5b752d8`; promote the retained WhatsApp and Deliberation source semantics onto `4b85d834ed1586062f31bded2f358fc5192d1674`, then regenerate every base-owned channel, config-doc, and build metadata projection.**

**Confidence: High (0.97).**
