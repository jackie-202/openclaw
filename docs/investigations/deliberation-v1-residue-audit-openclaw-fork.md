---
summary: "Fork-local audit of retired Deliberation v1 and thoughtful-response activation paths"
read_when:
  - Auditing the Deliberation v2 plugin for retired v1 residue
title: "Deliberation v1 Residue Audit"
---

# Deliberation v1 residue audit

Task: `swift-mist-4312`  
Snapshot: `0b4e3efe73310486990a24f0e9a981a2979548ea` plus the current dirty worktree  
Runtime: Node `v25.6.1`, pnpm `11.2.2`

## Verdict

**CLEAN**

The fork contains no `executable_residue`, `runtime_or_config_reference`, or
`fallback_or_dual_authority` finding for retired Deliberation v1. Every match
is classified below as test-only, historical, generic OpenClaw capability, or
a false positive. The current v2 plugin has one manifest identity, four hook
registrations, one polling service, and one production durable-send call site.

This verdict is fork-local. It does not claim anything about the external KM
implementation, live configuration, live channels, or schedulers.

## Scope

The audit read repository-local source, tests, manifests, generated inventory,
configuration examples, lockfiles, task artifacts, and git metadata. It did
not repair code or mutate product configuration or runtime state.

| Included inventory | Files |
| ------------------ | ----: |
| `extensions/`      | 6,508 |
| `src/`             | 8,834 |
| `packages/`        |   425 |
| `test/`            |   561 |
| `docs/`            |   764 |
| `plans/`           |   186 |

Counts use `git ls-files --cached --others --exclude-standard` and therefore
include tracked and untracked non-ignored files. Four ignored, non-dependency,
non-build assets were separately identified and scanned:

- `extensions/canvas/src/host/a2ui/.bundle.hash`
- `extensions/canvas/src/host/a2ui/a2ui.bundle.js`
- `extensions/diffs-language-pack/assets/viewer-runtime.js`
- `extensions/diffs/assets/viewer-runtime.js`

Root inventory also covered `package.json`, `pnpm-workspace.yaml`,
`pnpm-lock.yaml`, `npm-shrinkwrap.json`, and `.github/labeler.yml`.

Excluded from content scans: `.git/`, dependency directories, generated build
output, workspace files, KM System, Mission Control, live OpenClaw config,
channels, crons, and other repositories. Other task checkpoint contents were
not read, as required by the task checkpoint protocol.

## Inventory sources

The intended v2 ownership model came from:

- `docs/investigations/deliberation-v2-standard-plugin-capability-investigation.md:15-25`
- `docs/investigations/deliberation-v2-standard-plugin-capability-investigation.md:404-438`
- `plans/2026-07-27_bright-wave-6041_deliberation-v2-standard-plugin-intake-silence-and-bounded.md:49-67`
- `plans/tasks/2026-07-27_deliberation-v2-channel-intake-gate-final-send-adapter.md:120-163`
- `docs/plugins/reference/deliberation.md:23-77`

The current implementation was then audited independently rather than accepted
from those artifacts.

## Commands and results

| Command or scan                                                                                                                                                                                                                                                                                                        | Result                                                                                                                                                            |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `git rev-parse HEAD`                                                                                                                                                                                                                                                                                                   | `0b4e3efe73310486990a24f0e9a981a2979548ea`                                                                                                                        |
| `git status --short --untracked-files=all`                                                                                                                                                                                                                                                                             | Dirty baseline recorded. The Deliberation implementation and investigation artifacts were untracked; unrelated tracked and untracked changes were left untouched. |
| `node --version` and `pnpm --version`                                                                                                                                                                                                                                                                                  | `v25.6.1` and `11.2.2`                                                                                                                                            |
| `pnpm docs:list`                                                                                                                                                                                                                                                                                                       | Passed and listed the current Deliberation plugin reference.                                                                                                      |
| `rg --files -uu ...`                                                                                                                                                                                                                                                                                                   | Not available because the local `rg` executable was missing. Inventory continued with repository Glob/Grep tools, `git ls-files`, and bounded `grep` fallback.    |
| `grep -RInEi --exclude-dir=node_modules --exclude-dir=dist --exclude='*.test.ts' 'thoughtful[-_ ]?response\|__deliberated__\|deliberation[-_ ]?v1\|plugins\.entries\.(thoughtful[-_]?response\|deliberation[-_]?v1)' extensions src packages test package.json pnpm-workspace.yaml pnpm-lock.yaml npm-shrinkwrap.json` | No production, manifest, config, package, lockfile, or non-test match.                                                                                            |
| `grep -RIn --include='*.ts' --exclude='*.test.ts' 'sendDurableMessageBatch' extensions/deliberation`                                                                                                                                                                                                                   | Exactly two lines, both in `extensions/deliberation/src/final-send.ts`: the import at line 2 and call at line 57.                                                 |
| `grep -RInEi --include='*.ts' --include='*.json' --exclude='*.test.ts' 'openKeyedStore\|writeFile\|appendFile\|sqlite\|dual.?write\|fallback\|__deliberated__\|thoughtful[-_ ]?response\|_legacy\|\.bak\|whatsapp\|slack\|telegram\|loadAdapter\|handleAction' extensions/deliberation`                                | No match.                                                                                                                                                         |
| Exact Deliberation/thoughtful/marker scan of Discord, Slack, WhatsApp, `src/channels/`, and `src/infra/outbound/`                                                                                                                                                                                                      | No retired or Deliberation-specific channel adapter wiring.                                                                                                       |
| Exact retired-identifier scan of the four ignored assets                                                                                                                                                                                                                                                               | No match.                                                                                                                                                         |
| Historical scan of `plans/` excluding `plans/checkpoints/`, plus `docs/investigations/`                                                                                                                                                                                                                                | Matches were requirements and audit statements prohibiting v1 fallback, dual write, or `__deliberated__`; no executable artifact.                                 |
| `node scripts/run-vitest.mjs extensions/deliberation src/plugins/source-checkout-runtime.test.ts --reporter=verbose`                                                                                                                                                                                                   | Passed: 9 files and 32 tests across two shards. One out-of-scope pre-existing `mission-control` config warning was emitted and not investigated.                  |
| `pnpm exec oxfmt --check --config .oxfmtrc.jsonc <both-report-paths>`                                                                                                                                                                                                                                                  | Passed after formatting both report copies.                                                                                                                       |
| `pnpm lint:docs <both-report-paths>`                                                                                                                                                                                                                                                                                   | Passed: 0 Markdown issues.                                                                                                                                        |
| `pnpm docs:check-mdx`                                                                                                                                                                                                                                                                                                  | Passed: 681 files.                                                                                                                                                |
| `cmp -s <canonical-report> <docs-mirror>` and `git diff --check`                                                                                                                                                                                                                                                       | Passed. The report copies are byte-identical; tracked worktree changes contain no whitespace errors.                                                              |

The test process proved loader-backed registration, strict config rejection,
the current contract hashes, source silence, restricted guards, one CAS winner,
receipt classification, and sole-send ownership. It did not contact KM or a
live channel.

## Activation and call paths

### Manifest and loader

1. The only Deliberation package is `@openclaw/deliberation`, with one runtime
   entry (`extensions/deliberation/package.json:2-20`). Its only manifest id is
   `deliberation`, with startup activation and a closed config schema
   (`extensions/deliberation/openclaw.plugin.json:2-68`).
2. Workspace membership comes from the generic `extensions/*` workspace rule
   (`pnpm-workspace.yaml:1-5`); the lockfile has only the current
   `extensions/deliberation` importer (`pnpm-lock.yaml:595-603`).
3. Plugin discovery scans bundled and source-checkout extension roots
   (`src/plugins/discovery.ts:1429-1554`,
   `src/plugins/discovery.ts:1562-1620`). The manifest registry keys candidates
   by the literal manifest id and resolves duplicate ids by precedence
   (`src/plugins/manifest-registry.ts:996-1027`,
   `src/plugins/manifest-registry.ts:1124-1200`).
4. The loader filters on the manifest id, resolves enablement, validates the
   manifest schema, rejects export-id mismatch, and invokes that module's
   `register` function (`src/plugins/loader.ts:1979-2002`,
   `src/plugins/loader.ts:2035-2069`, `src/plugins/loader.ts:2261-2273`,
   `src/plugins/loader.ts:2589-2700`).
5. Loader-backed verification found the `deliberation` plugin loaded with
   exactly `inbound_claim`, `before_dispatch`, `before_tool_call`, and
   `message_sending`, plus one service
   (`src/plugins/source-checkout-runtime.test.ts:40-81`).

No manifest, package metadata, config key, test fixture, or source file contains
`thoughtful-response`, `thoughtful_response`, `deliberation-v1`, or a retired
plugin-id alias. The generic built-in alias table contains only Google and
MiniMax aliases (`src/plugins/config-state.ts:37-65`).

### Hook wiring

| Hook               | v2 registration and handler                                                               | Runtime call site                                                                                                                                       |
| ------------------ | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `inbound_claim`    | `extensions/deliberation/index.ts:37-38` -> `extensions/deliberation/src/intake.ts:14-46` | Generic broadcast claim before ordinary dispatch at `src/auto-reply/reply/dispatch-from-config.ts:1899-1924`                                            |
| `before_dispatch`  | `extensions/deliberation/index.ts:37-39` -> `extensions/deliberation/src/intake.ts:49-54` | Generic terminal handling and dedupe completion at `src/auto-reply/reply/dispatch-from-config.ts:2142-2191`                                             |
| `before_tool_call` | `extensions/deliberation/index.ts:37-40` -> `extensions/deliberation/src/guards.ts:13-23` | Generic modifying hook at `src/plugins/hooks.ts:1255-1292`, called before tool execution at `src/agents/agent-tool-definition-adapter.ts:357-420`       |
| `message_sending`  | `extensions/deliberation/index.ts:37-41` -> `extensions/deliberation/src/guards.ts:26-39` | Generic final canonical policy pass at `src/infra/outbound/deliver.ts:1065-1120` and cancellation handling at `src/infra/outbound/deliver.ts:1634-1663` |

These hooks are standard OpenClaw capabilities. Their generic runners are
defined without Deliberation policy (`src/plugins/hooks.ts:1011-1081`,
`src/plugins/hooks.ts:1159-1188`, `src/plugins/hooks.ts:1252-1293`), and the
thread-ownership plugin independently uses `message_sending`
(`extensions/thread-ownership/index.ts:144-208`). Their shared definitions and
callers contain no retired Deliberation wiring.

### Worker and final send

1. `registerService` receives only `createPollService`
   (`extensions/deliberation/index.ts:38-42`). Gateway startup passes registry
   services to the generic service runner (`src/gateway/server-startup-post-attach.ts:812-835`),
   which starts and later stops each registered service
   (`src/plugins/services.ts:95-154`).
2. The worker reads KM controls, lists ready records, atomically reserves each
   candidate, and calls `sendReservedAttempt` only for `reserved`
   (`extensions/deliberation/src/poll-service.ts:60-94`).
3. `sendReservedAttempt` first rejects routes outside configured v2 source
   tuples, then performs the only production `sendDurableMessageBatch` call
   with required durability (`extensions/deliberation/src/final-send.ts:32-68`).
   Thrown or uncertain outcomes are completed as unknown, not replayed
   (`extensions/deliberation/src/final-send.ts:69-99`).
4. The public SDK lazily forwards that call to the channel runtime
   (`src/plugin-sdk/channel-outbound.ts:209-217`). The channel runtime executes
   canonical outbound delivery and returns sent, suppressed, failed, or partial
   outcomes (`src/channels/message/send.ts:201-295`,
   `src/channels/message/send.ts:339-351`).
5. Reconciliation only calls KM. A `requeued` result does not send; a later
   platform call must pass through list, reserve, and the same final adapter
   (`extensions/deliberation/index.ts:32-35`,
   `extensions/deliberation/index.ts:84-105`,
   `extensions/deliberation/src/km-client.ts:234-252`).

There is no second outbound import, raw adapter import, native Discord sender,
state store, sidecar file, dual write, or fallback in Deliberation production
code. Generic raw adapter and channel action capabilities still exist in
OpenClaw (`src/plugins/runtime/types-channel.ts:179-181`,
`extensions/discord/src/channel-actions.ts:195-288`), but exact scans found no
Deliberation or retired identifier in those paths and the v2 plugin does not
import them.

## Categorized findings

Each row has exactly one task taxonomy category.

| ID   | Match family                                                                                                                             | Category                       | Activation evidence                                                                                                                                                                                                                                                |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| C-01 | Current `deliberation` manifest, package, config, hooks, controls, CLI, inventory, labeler, SecretRef path, workspace importer, and docs | `false_positive`               | All point to the audited v2 module and strict current schema. No alternate id or v1 branch exists.                                                                                                                                                                 |
| C-02 | `km-wire-v1.json`, `cutover-controls-v1.json`, `/v1/*`, and `x-deliberation-wire-version: 1`                                             | `false_positive`               | `contracts/provenance.json:2-8` labels these as the repository-local Deliberation v2 interoperability contract. `v1` is the current wire-contract version, not the retired plugin generation.                                                                      |
| C-03 | Deliberation unit tests, static ownership test, and loader-backed source-checkout test                                                   | `test_fixture_only`            | Production modules do not import `*.test.ts`. Tests load the current v2 plugin or inspect its source/contracts and cannot register a retired id.                                                                                                                   |
| C-04 | Plans and investigations mentioning v1 fallback, thoughtful-response, dual write, `_legacy`, `.bak`, or `__deliberated__`                | `historical_document_or_audit` | Matches are task requirements, prohibitions, and prior audit evidence. They are not imported or discovered as plugins.                                                                                                                                             |
| C-05 | Shared `inbound_claim`, `before_dispatch`, `before_tool_call`, `message_sending`, service lifecycle, and durable sender                  | `generic_openclaw_capability`  | Generic core/SDK owners have non-Deliberation callers. No shared module contains a retired Deliberation id, route, marker, or config key.                                                                                                                          |
| C-06 | Raw outbound adapter and channel `handleAction` paths that can bypass canonical hooks                                                    | `generic_openclaw_capability`  | They are standard trusted-plugin/channel surfaces. Deliberation imports neither path, and Discord, Slack, WhatsApp, channel, and outbound scans contain no retired wiring.                                                                                         |
| C-07 | `send_message`, `discord_send`, and `message_send` in `SEND_CAPABLE_TOOLS`                                                               | `false_positive`               | They occur only in a deny set (`extensions/deliberation/src/guards.ts:4-11`). No production tool with `discord_send` or `message_send` is registered; `send_message` appears elsewhere only as an agent-session event name. The entries can block but cannot send. |
| C-08 | `SYNTHETIC_FIXTURES` and `synthetic.run`                                                                                                 | `false_positive`               | These are allowlisted v2 KM control inputs (`extensions/deliberation/index.ts:8-22`, `extensions/deliberation/index.ts:49-70`, `extensions/deliberation/index.ts:106-145`), not imported test modules or retired registrations.                                    |
| C-09 | Unrelated `/v1`, fallback, dual-write, compatibility alias, legacy, `deliberately`, and plain-English “thoughtful response” matches      | `false_positive`               | Matches belong to other owners, generic migrations, protocol versions, or prose. Examples include Copilot transcript mirroring and the generic agent template; none imports or names Deliberation.                                                                 |

## Negative evidence

- No `executable_residue`: no retired plugin module, hook registration, sender,
  route, state path, backup branch, or production-imported fixture was found.
- No `runtime_or_config_reference`: no retired manifest id, package id, config
  key, loader alias, compatibility registration, generated inventory entry, or
  schema example was found.
- No `fallback_or_dual_authority`: reconciliation returns to KM and the normal
  reserve path; Deliberation has one sender call and no second store, dual
  write, raw channel sender, blind replay, or v1 fallback.
- No marker authorization: `__deliberated__` appears only in historical task
  and investigation text.
- No hidden channel bypass: Discord, Slack, WhatsApp, core channel, and outbound
  paths contain no Deliberation-specific or thoughtful-response wiring.
- No executable backup: filename scans found no Deliberation `_legacy` or
  `.bak` artifact.

## Repair recommendations

There are no blocking findings and therefore no repair task to insert. If a
future scan finds a category 1-3 item, repair must remain owner-scoped: remove
the retired manifest/config alias in `src/plugins/` or the retired sender/state
path in `extensions/deliberation/`, preserve the one reserve-to-final-send path,
and rerun this audit before continuing the parent batch.

## Unknowns

- The external KM implementation, ownership, provenance, and fixture behavior
  were not inspected. Repository contracts describe the expected v2 wire, but
  this audit cannot prove the external service has no legacy behavior.
- Live OpenClaw config, channels, crons, workspaces, and Mission Control were not
  inspected or mutated.
- Other repositories and other task checkpoint contents were not inspected.
- The focused loader test emitted an out-of-scope stale `mission-control`
  config warning. The selected Deliberation plugin still loaded with the exact
  expected registrations, so the warning does not change the fork-local
  residue verdict.

These unknowns do not create ambiguous fork activation: all repository-local
manifest, alias, registration, config, hook, service, sender, recovery, fixture,
and channel paths in scope were traced.

## Machine-readable summary

```json
{
  "project": "openclaw-fork",
  "verdict": "CLEAN",
  "blocking_findings": [],
  "archival_findings": [
    {
      "id": "C-03",
      "category": "test_fixture_only",
      "summary": "Current v2 tests and loader fixtures cannot register a retired plugin id."
    },
    {
      "id": "C-04",
      "category": "historical_document_or_audit",
      "summary": "V1, thoughtful-response, fallback, dual-write, and marker terms occur only as historical requirements or prohibitions."
    }
  ],
  "generic_capabilities": [
    {
      "id": "C-05",
      "summary": "Shared message hooks, service lifecycle, and durable outbound APIs have no retired Deliberation wiring."
    },
    {
      "id": "C-06",
      "summary": "Raw adapter and channel action paths are generic trusted-plugin capabilities and are not imported by Deliberation."
    }
  ],
  "searched_roots": [
    "extensions/",
    "src/",
    "packages/",
    "test/",
    "docs/",
    "plans/",
    ".github/labeler.yml",
    "package.json",
    "pnpm-workspace.yaml",
    "pnpm-lock.yaml",
    "npm-shrinkwrap.json"
  ],
  "unknowns": [
    "External KM implementation and provenance were out of scope.",
    "Live config, channels, crons, workspaces, and Mission Control were out of scope.",
    "Other repositories and other task checkpoint contents were not inspected.",
    "An out-of-scope stale mission-control config warning appeared during the focused loader test."
  ]
}
```
