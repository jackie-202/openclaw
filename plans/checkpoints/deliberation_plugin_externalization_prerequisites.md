# Deliberation Plugin Externalization — Prerequisites Checkpoint

**Owner:** host (Jackie), prepared 2026-09-30 Europe/Prague.
**Purpose:** satisfy manual gate **G30** of proposal `proposal-20260831-170956-a06505`, section `externalize-openclaw-plugin`, before releasing `bold-brook-5925` (batch `complete-deliberation-spool-v21-proposal-20260904`, seq 79).
**Nature of this document:** read-only host inspection evidence. It authorizes nothing by itself. It does not move source, change configuration, install anything, or approve live deployment.

## 1. Source identity at inspection

| Item                    | Value                                                                 |
| ----------------------- | --------------------------------------------------------------------- |
| Fork checkout           | `~/Projects/openclaw-fork`                                            |
| Fork HEAD               | `61fd99ed61b`                                                         |
| Fork working tree       | dirty, 60 modified paths, 8 of them inside `extensions/deliberation/` |
| Provider checkout       | `~/Projects/deliberation-pipeline`                                    |
| Provider HEAD           | `cf5ee24e073b9985e257856a6fe0b062cc911757` (clean)                    |
| Plugin package          | `@openclaw/deliberation` version `2026.6.5`                           |
| Plugin TypeScript files | 30                                                                    |

The dirty fork tree is itself a prerequisite finding: an extraction manifest built now would pin uncommitted bytes. Any transfer manifest must record the exact commit it describes, and the host must reconcile or commit the eight touched plugin files before accepting a manifest under G31.

## 2. Wire pin — verified, no drift

The plugin pins the published Deliberation v1 wire bundle in `extensions/deliberation/contracts/deliberation-wire-pin-v1.json`.

Rebuilt the bundle from the provider source of truth (`deliberation_pipeline.deliberation_wire_publication.build_bundle`) into a scratch directory and compared:

| Artifact                                     | Pinned in fork                                                     | Rebuilt from provider | Match |
| -------------------------------------------- | ------------------------------------------------------------------ | --------------------- | ----- |
| bundle SHA-256                               | `b9eaada06b60b8ecba17a378832f03591fbbf0e5a574844cd6b94a9d722ee338` | identical             | yes   |
| `contracts/deliberation-v2/v1/contract.json` | `292e7f17b13379c8e909497084bddccb57e0f371f79f7113ebd894a78cd6a98f` | identical             | yes   |
| `contracts/deliberation-v2/v1/fixtures.json` | `357e965edb2a82b7793f92807928718843f31d6152c7524723cf65a7207c8a78` | identical             | yes   |

The two local contract copies in the fork hash to exactly the pinned member values. **No wire drift.** Note that the raw provider resource files hash differently (`0098f3a6…`, `824cabbd…`) because the published bundle is a canonical JSON re-rendering, not a byte copy — that is the documented publication contract, not a discrepancy.

`deliberation-wire-pin-v1.json` declares the published Deliberation domain as authority and scopes itself to `publicationManifest.members` only. `provenance.json` correctly records the dependency direction: domain wire upstream, OpenClaw owns only transport/history/delivery overlays.

## 3. External-load compatibility inventory

### 3.1 SDK surface actually used

All host coupling goes through the published plugin SDK entry points. Distinct specifiers used by the plugin:

```
openclaw/plugin-sdk/channel-contract
openclaw/plugin-sdk/channel-runtime-context
openclaw/plugin-sdk/channel-send-result
openclaw/plugin-sdk/discord
openclaw/plugin-sdk/json-schema-runtime
openclaw/plugin-sdk/plugin-entry
openclaw/plugin-sdk/plugin-state-runtime
openclaw/plugin-sdk/plugin-test-api
openclaw/plugin-sdk/secret-input
openclaw/plugin-sdk/secret-input-runtime
openclaw/plugin-sdk/string-coerce-runtime
openclaw/plugin-sdk/test-env
```

Third-party/runtime: `zod`, `node:crypto`, `node:fs/promises`, `node:http`, `node:https`, `node:path`, `node:url`, `node:util`.

**No deep relative imports into the host tree** (`../../`) and **no non-SDK `@openclaw/*` imports in production code**. That is the single most important positive finding: the production surface is already SDK-shaped.

### 3.2 Concrete blockers to record

| #   | Blocker                             | Location                                                                                                                                                              | Why it blocks external load                                                                                                                                                                                                                                                                                                                                                                       |
| --- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B1  | `@openclaw/plugin-sdk: workspace:*` | `extensions/deliberation/package.json`                                                                                                                                | A pnpm workspace protocol cannot resolve outside the fork. The external package needs a real published/pinned SDK version, or a host-provided peer dependency declaration.                                                                                                                                                                                                                        |
| B2  | Sibling plugin imports in tests     | `src/delivery-composition.test.ts` imports `@openclaw/discord/api.js` and `@openclaw/slack/api.js`                                                                    | The composition test reaches into two other bundled channel plugins. Externally these are not resolvable without the host workspace. Needs either a documented peer/dev dependency or a rewrite against the SDK test API.                                                                                                                                                                         |
| B3  | Host-tree build-info probing        | `src/delivery-probe.ts:92-96` resolves `../../../dist/build-info.json`, `../../../../dist/build-info.json`, `../../../build-info.json` relative to its own module URL | These candidate paths assume the plugin sits inside the fork layout. Externally all three miss and `commit` silently becomes `null`, while `artifactClass` derives from whether the module path contains `/dist/` or `/dist-runtime/`. Build identity must be supplied by the host through the SDK, not by walking up the filesystem.                                                             |
| B4  | No registered test lane             | `test/vitest/`                                                                                                                                                        | `extensions/deliberation` appears in **no** `vitest.extension-*-paths.mjs` routing list and in no config. It currently runs only through the catch-all `vitest.extensions.config.ts` shard. There is therefore no fork-side lane to retire, and no target lane yet — the target project must own a real lane before G31 accepts any evidence. A bootstrap placeholder is explicitly not evidence. |

### 3.3 Registered hooks and activation

`openclaw.plugin.json` declares `expectedHooks`: `inbound_event_policy`, `inbound_claim`, `before_dispatch`, `before_tool_call`, `message_sending`, with `activation.onStartup: true`, plus a closed `configSchema` (`additionalProperties: false`, `failClosed` pinned to `const: true`) and a `secretInputs` contract on `km.credential`. External loading must demonstrate that all five hooks, startup activation, config schema validation and the secret-input contract survive — an isolated load test, not a mock.

## 4. Current fork-side test baseline

Ran the existing plugin suite through the fork's own extensions shard:

```
node scripts/run-vitest.mjs run --config test/vitest/vitest.extensions.config.ts extensions/deliberation
```

Result: **15 test files, 345 tests, all passed, 4.12s.** This is the behavioral baseline the externalized package must reproduce. Notably this run required **no build, no link and no doctor** — evidence for section 5.

## 5. Fork pipeline hooks — the actual G30 risk

G30 explicitly requires verifying the real pipeline hooks, because a prohibition written into a task prompt does not disable them. Current registry (`~/.openclaw/workspace/skills/opencode-dev/projects.yaml`, project `openclaw-fork`):

| Setting              | Value                                                                      |
| -------------------- | -------------------------------------------------------------------------- |
| `post_impl`          | `cd ~/Projects/openclaw-fork && pnpm build && npm link && openclaw doctor` |
| `deploy.enabled`     | `true`                                                                     |
| `deploy.trigger`     | `on_done`                                                                  |
| `deploy.environment` | `production`                                                               |
| `deploy.command`     | `bash ~/.openclaw/workspace/km-system/scripts/deploy-fork.sh all`          |
| `testCommand`        | `cd ~/Projects/openclaw-fork && npm test` (full suite)                     |
| `autocommit`         | `false`                                                                    |

**Consequence:** dispatching `bold-brook-5925` as the fork project is currently configured would, on implementation completion, rebuild the fork, relink the globally installed `openclaw`, run doctor, and then fire a production deploy — while the tree carries 60 uncommitted modifications. That is exactly the outcome G30 exists to prevent.

The companion document `deliberation_plugin_externalization_isolated_pipeline_policy.md` proposes the isolated policy that would remove this coupling. **Until that policy is accepted and applied, G30 is not satisfied and `bold-brook-5925` stays held.**

## 6. G30 checklist status

| G30 requirement                                     | Status                                                                                         |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Accept the original extraction audit conclusion     | Deferred — host decision, unchanged by this document                                           |
| Verify current wire pin                             | **Met.** Bundle and both members rebuild byte-identical (§2)                                   |
| Verify plugin changes/drift                         | **Partially met.** No wire drift; but 8 uncommitted plugin files must be reconciled first (§1) |
| Hand over local prerequisites checkpoint            | **Met by this document**                                                                       |
| Verify real fork pipeline hooks and test policy     | **Met as an inspection; outcome is negative** (§5)                                             |
| Approved separation of testing from live deployment | **Not met.** Blocking. See the isolated pipeline policy document                               |

## 7. Explicit non-actions

No file was moved or copied between repositories. No manifest was accepted. No registry, cron, LaunchAgent, Gateway, or plugin configuration was changed. No build, link, doctor, install or deploy was executed against the fork. The scratch wire bundle was written outside both repositories and is not a transfer artifact. `bold-brook-5925` remains `backlog` / `pauseState=manual`.
