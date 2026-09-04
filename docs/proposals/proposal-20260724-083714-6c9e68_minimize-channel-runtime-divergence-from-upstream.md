# Minimize channel runtime divergence from upstream

## Context and origin <!-- section:context type:context -->

This proposal records a correction to the architectural direction of the OpenClaw fork. It was triggered by the architecture simplification review:

- **Review run:** `2026-07-24T080000Z-openclaw-fork`
- **Report:** `/Users/michal/Projects/openclaw-fork/.architecture-reviews/reports/2026-07-24T082900Z-openclaw-fork.md`
- **Checkpoint:** `/Users/michal/Projects/openclaw-fork/.architecture-reviews/checkpoints/2026-07-24T080000Z-openclaw-fork.json`
- **Finding:** `channels.modelByChannel` and `channels.runtimeByChannel[*][*].model` can both select a model for the same channel, with different execution paths consuming different authorities.
- **Focused evidence gate:** four test files, 127 tests passed. The tests confirm that the split behavior is intentional in the current fork; they do not establish that removing the upstream configuration is safe.

The review originally recommended making `runtimeByChannel` the sole channel-scoped model authority. Provenance analysis after publication changed the framing: `modelByChannel` is the upstream-supported authority, while `runtimeByChannel` is a fork addition. Removing the upstream authority would increase rather than reduce the fork's long-term divergence.

This proposal supersedes the architectural direction—not necessarily every operational requirement—of the earlier workspace proposal:

- `/Users/michal/.openclaw/workspace/docs/proposals/proposal-20260710-090050-9a1a4c_simplify-openclaw-channel-model-runtime-configuration.md`

That proposal assumed `runtimeByChannel` should become canonical and `modelByChannel` should be cleaned up. This assumption must not drive further implementation until the design here is resolved.

## Verified provenance <!-- section:provenance type:context -->

### Upstream-owned behavior

`channels.modelByChannel` is an upstream OpenClaw configuration surface. Current `upstream/main` uses it across:

- regular reply/model selection,
- agent-command live model selection,
- status attribution,
- configuration schema/types/help and validation,
- doctor and update/config preservation paths,
- plugin SDK exports,
- focused tests.

It is therefore not merely local residue that the fork can delete without cost. It is part of the upstream contract and will continue to change as upstream evolves.

### Fork-owned behavior

`channels.runtimeByChannel` was introduced by fork commit:

- `9c09c259528500e0ac015589f2cb3c5a979d70b7` — `feat(channels): persist runtime profiles by channel` (2026-06-09, Jackie).

It stores a composite per-channel profile, including model and runtime controls such as thinking/reasoning/text verbosity. Upstream currently has no `runtimeByChannel` surface.

The fork later added:

- `435059f7d634a3300dd7533b707e8ccfe73008e0` — `refactor: remove legacy channel model overrides` (2026-07-19, Jackie).

Despite its title, the commit did not complete removal. The current fork still exposes and consumes `modelByChannel` in agent-command, status, schema/doctor/update paths and tests. Some normal/fresh reply and native-slash paths consume `runtimeByChannel` instead. The result is path-dependent model selection.

### Workspace-owned tooling

The model-switch helper is not upstream OpenClaw code. It is external workspace tooling:

- `scripts/openclaw-channel-runtime.py`
- `scripts/openclaw_channel_runtime_support.py`

The current implementation writes `runtimeByChannel`, optionally patches live sessions, and only warns when `modelByChannel` exists: `legacy channels.modelByChannel present — unsupported, migrate manually`. It does not currently remove the legacy entry.

### Current local configuration

The active local configuration was inspected in sanitized form:

- `runtimeByChannel.discord` contains 11 target profiles;
- `modelByChannel` is absent.

This means our deployment has already adopted the fork-specific surface. It does **not** prove the upstream surface is obsolete or that other configurations/plugins do not depend on it.

## Problem statement <!-- section:problem type:context -->

We currently pay for two kinds of divergence:

1. **Behavioral divergence:** two persistent model authorities can disagree, and model selection depends on execution path.
2. **Maintenance divergence:** the fork is moving toward deleting an upstream-supported configuration contract, creating recurring conflicts in schema, doctor, SDK, update, resolver and test code.

The previous simplification direction solved the first problem by deepening the second. That violates the operating goal for this fork: keep custom behavior narrowly scoped and keep the delta from upstream as small and rebaseable as possible.

The legitimate requirement behind `runtimeByChannel` remains: a channel profile may carry more than a model (`thinkingLevel`, `reasoningLevel`, `textVerbosity`). The design question is therefore not simply “delete runtime profiles”. It is how to preserve required per-channel runtime behavior without replacing an upstream authority or duplicating its model field.

## Design principle <!-- section:principle type:context -->

**Upstream compatibility is the default authority.** A local abstraction may extend upstream behavior, but should not replace or fork an upstream public contract unless there is a demonstrated requirement that cannot be met through a narrow additive layer.

For channel model selection, the target architecture should preserve `channels.modelByChannel` as the canonical persistent model authority unless upstream itself changes that contract.

Any fork-specific mechanism should be limited to runtime dimensions that upstream does not represent. It must not silently become a second model authority.

## Options to evaluate <!-- section:options type:context -->

### Option A — Recommended: upstream model authority plus model-free runtime supplement

- Keep `channels.modelByChannel` as the persistent channel model authority.
- Redefine the fork-specific profile as a supplement containing only non-model runtime properties (`thinkingLevel`, `reasoningLevel`, `textVerbosity`, and any future controls that upstream lacks).
- Remove or reject `runtimeByChannel[*][*].model` after a bounded migration of our 11 local entries into `modelByChannel`.
- Make all execution paths obtain the channel model through upstream's resolver and apply supplemental runtime properties separately.
- Adapt the workspace switch helper to write the upstream model field plus the supplemental runtime profile atomically and patch live session cache for immediate effect.

Advantages: smallest conceptual divergence, upstream changes remain consumable, no competing model authority, composite runtime behavior is preserved.

Cost: requires a local config migration and careful session/runtime integration tests. The helper may still write two fields, but they represent different concerns rather than duplicated authority.

### Option B — Keep the composite profile only outside OpenClaw config

- Preserve `modelByChannel` in OpenClaw config.
- Move non-model per-channel controls to workspace-owned configuration or profiles.
- The helper resolves the external profile and applies it to OpenClaw/live sessions.

Advantages: potentially reduces fork schema changes further.

Cost: adds an external authority and may make fresh-session behavior dependent on workspace tooling. This risks moving, rather than removing, complexity and is not preferred without evidence that OpenClaw lacks a narrow additive config seam.

### Option C — Continue making `runtimeByChannel` canonical

- Finish removing `modelByChannel` from the fork and migrate all consumers.

This is the previous direction and is **not recommended**. It produces a large permanent fork delta across upstream schema, doctor, update, SDK and tests, and requires continuous conflict resolution as upstream evolves.

### Option D — Drop per-channel non-model runtime persistence

- Revert to upstream `modelByChannel` only.
- Apply thinking/reasoning/verbosity manually or only as live-session settings.

This is the smallest fork delta but may fail the operator requirement that channel behavior survives fresh/reset sessions. It remains a valid baseline against which the value of custom persistence must be demonstrated.

## Decision record — Option A approved <!-- section:design-decision type:context -->

**Decision (Michal, 2026-07-24): Option A.**

Evidence that settled the choice:

- Live config inspection (2026-07-24): `modelByChannel` absent; `runtimeByChannel.discord` has 11 profiles. 10 of them carry non-model runtime fields, and `thinkingLevel` genuinely varies per channel (`medium` / `high` / `xhigh`). Option D (drop non-model persistence) is therefore ruled out — the per-channel thinking differences are intentional operator state.
- Option B (external workspace authority) rejected: fresh sessions would depend on workspace tooling, creating a hidden authority outside OpenClaw config.
- Option C remains rejected as documented above.

**Resulting ownership model:**

- `channels.modelByChannel` (upstream) — sole persistent channel **model** authority.
- Fork supplemental profile — **non-model** runtime fields only (`thinkingLevel`, `reasoningLevel`, `textVerbosity`); the `model` key is removed from its schema and rejected by validation.
- Live session state — cache/snapshot only, never configuration authority.

The original decision checklist below is retained as requirements the implementation slices must satisfy:

- exact operator requirements that still justify fork-specific channel runtime persistence;
- a field-by-field ownership map: upstream authority, fork supplement, or live-session cache;
- the smallest code/config surface needed in the fork;
- comparison against current `upstream/main` extension points;
- migration and rollback strategy for the 11 current local runtime profiles;
- implications for upstream synchronization and expected conflict surface;
- explicit disposition of fork commits `9c09c25952`, `435059f7d6`, `0529559822`, and adjacent runtime-profile changes—retain narrowly, replace, or revert;
- disposition of the earlier workspace proposal and its linked work so contradictory implementation cannot continue.

No source implementation should begin from this proposal until this section has a reviewed recommendation and migration plan.

## Safe rollout strategy <!-- section:rollout-strategy type:context -->

The environment being migrated is the one we work in — the gateway, this Discord channel, and the pipeline all run on the same config. Ordering is therefore **code first, config second, cleanup last**, so that at every step the live deployment keeps resolving the same effective models:

1. **Transitional dual-read in the fork (Slice 1).** All execution paths resolve the channel model through the upstream `modelByChannel` resolver; when absent, fall back to `runtimeByChannel[*][*].model` with a deprecation warning. This makes the fork correct for both the current config and the migrated config, eliminating any window where model selection breaks.
2. **Config migration via the workspace helper (Slice 2).** Only after Slice 1 is deployed. Timestamped backup, dry-run showing old/new paths per profile, apply, `openclaw doctor`, gateway restart, live verification of a sample of channels (including this one). Rollback = restore backup + restart.
3. **Remove the fallback and the `model` key (Slice 3).** Only after the local config no longer contains `runtimeByChannel[*][*].model`. Validation then rejects the key so the split authority cannot silently return. Permanent dual-read is explicitly not an end state.
4. **Tooling alignment (Slice 4)** and **closure/provenance review (Slice 5)** follow.

Safety rules for every step: one config change at a time; backup before mutation; `openclaw doctor` after; verify live behavior in at least one high-traffic and one low-traffic channel; keep the rollback artifact until the following slice is complete.

## Slice 1: Fork — upstream model authority with transitional fallback <!-- section:slice-1-model-authority -->

In the fork (`~/Projects/openclaw-fork`):

- Restore/route all channel model resolution (regular replies, fresh sessions, native slash, agent-command, status) through the upstream `modelByChannel` contract.
- Add a clearly marked transitional fallback: if `modelByChannel` has no entry for the target but `runtimeByChannel[*][*].model` does, use it and log a deprecation warning. Fallback code must be trivially removable (single seam).
- Non-model fields from the fork profile continue to apply unchanged.
- Focused tests: precedence (`modelByChannel` wins when both present), fallback behavior, and identical resolution across all execution paths. Then the repo's canonical test/build gate.

## Slice 2: Config migration of the 11 local profiles <!-- section:slice-2-config-migration -->

In workspace tooling (`km-system/scripts/openclaw-channel-runtime.py` + support module), add a bounded `migrate` operation:

- Inventory `runtimeByChannel[*][*].model` and `modelByChannel`; detect conflicts (same target, different model) and abort on conflict rather than pick a winner.
- Dry-run output: per profile, old path/value → new path/value.
- Apply: timestamped backup of `openclaw.json`, move each `model` value into `modelByChannel`, delete the `model` key from the runtime profile, keep non-model fields intact.
- Validate with `openclaw doctor`; emit rollback artifact (the backup path + restore instructions).
- Execution against the live config happens manually with Michal present: dry-run → review → apply → doctor → gateway restart → verify effective model in sample channels.
- No bulk mutation of anything beyond the local config.

## Slice 3: Fork — remove fallback, reject model in supplement <!-- section:slice-3-remove-fallback -->

After Slice 2 is verified on the live config:

- Remove the transitional fallback seam from Slice 1.
- Remove `model` from the fork profile schema; validation rejects it with a clear error pointing to `modelByChannel`.
- Trim fork-only schema/SDK/doctor/update/test changes that existed only to replace `modelByChannel`; decide disposition of commits `9c09c25952`, `435059f7d6`, `0529559822` (retain narrowly / replace / revert) and record it here.
- Fresh-session tests proving one model authority; canonical gate; before/after fork-vs-upstream diff review for the affected surfaces.

## Slice 4: Workspace tooling alignment <!-- section:slice-4-tooling -->

Align `openclaw-channel-runtime.py` with the approved ownership model:

- Switch operations write the model to `modelByChannel` and non-model fields to the supplement, atomically, with live-session patch for immediate effect.
- Dry-run/apply reports all persistent and live-session mutations.
- Remove “legacy” language about `modelByChannel`.
- Regression coverage for same-channel and cross-channel switching, including a target with model-only profile (the `ollama/gemma4` case).

## Slice 5: Closure and provenance review <!-- section:slice-5-closure -->

- Verify all acceptance criteria in the Verification section.
- Close architecture review finding `2026-07-24T080000Z-openclaw-fork` with a correction note linking this proposal and explaining the revised recommendation.
- Mark the superseded workspace proposal (`proposal-20260710-090050-9a1a4c`) archived with a pointer here, so the old “remove modelByChannel” direction cannot drive new work.

## Migration and compatibility plan <!-- section:migration type:context -->

After the design decision is approved, define a bounded migration that:

- inventories `runtimeByChannel` and `modelByChannel` without exposing secrets;
- detects conflicts rather than silently selecting a winner;
- preserves the effective model and non-model runtime settings for all 11 local Discord profiles;
- writes a backup before config mutation;
- supports dry-run output with old/new paths and values;
- validates the resulting config with `openclaw doctor`;
- provides rollback instructions and an automated rollback artifact where practical;
- does not bulk-modify unknown external deployments;
- distinguishes persistent config from live-session cache and verifies both.

The migration must explicitly decide whether it is implemented in OpenClaw doctor, the workspace helper, or both. Permanent dual-read fallback is not an acceptable end state.

## Fork realignment implementation <!-- section:fork-realignment type:context -->

Implement the approved design with the smallest feasible diff from current upstream. Expected work, subject to the design decision:

- restore the upstream model resolver and contract as authoritative;
- remove the model field from any fork-specific supplemental runtime profile;
- keep only the minimal non-model runtime extension required for fresh sessions;
- remove path-dependent model selection from regular replies, native slash, agent-command and status;
- trim fork-only schema, SDK, doctor, update and test changes that merely exist to replace upstream `modelByChannel`;
- retain shared target matching rather than duplicating provider/target candidate logic;
- add focused precedence and fresh-session tests proving one model authority across all execution paths.

Success is measured not only by passing tests but by a reviewed reduction in fork-vs-upstream diff for the affected channel configuration surfaces.

## Workspace tooling alignment <!-- section:tooling-alignment type:context -->

Align `openclaw-channel-runtime.py` and its documentation with the approved ownership model:

- write model state to the canonical upstream authority;
- write only genuinely supplemental fields to any fork-specific profile;
- report all persistent and live-session mutations in dry-run/apply output;
- keep live sessions as cache/snapshot, not configuration authority;
- preserve safety behavior: backup, one config change, doctor validation, and hard warning on live patch failure;
- remove language that calls the upstream authority “legacy” unless upstream itself deprecates it;
- add regression coverage for same-channel and cross-channel switching.

## Verification and acceptance <!-- section:verification type:context -->

The completed work must demonstrate:

1. One persistent source determines the channel model for regular messages, fresh sessions, native slash, agent-command and status.
2. The canonical source is compatible with current upstream behavior.
3. Non-model runtime settings still behave according to the approved requirements, or are explicitly removed as unnecessary.
4. The 11 local Discord channel profiles migrate without effective-setting loss.
5. Dry-run, apply, doctor and rollback paths are tested.
6. Relevant focused tests pass, followed by the repository's canonical test/build gate.
7. A before/after provenance review shows that the affected fork delta was reduced and no upstream public surface was unnecessarily deleted.
8. The architecture review finding is closed with a correction note linking this proposal and explaining why the original recommendation was revised.

## Out of scope <!-- section:out-of-scope type:context -->

- Asking upstream to adopt the full fork-specific runtime profile before we have minimized and validated the requirement.
- Changing global default model routing.
- OpenCode pipeline model routing, cron model routing, or Copilot bridge aliases.
- Raw edits to session storage.
- Removing upstream `modelByChannel` from OpenClaw.
- Treating passing tests for the current split as proof that the architecture is desirable.

## Open questions <!-- section:open-questions type:context -->

- Which non-model fields must persist per channel after reset/fresh session, and which can remain live-session-only?
- Can upstream's current session/config extension points carry these fields with a smaller patch than `runtimeByChannel`?
- Should the supplemental configuration retain the name `runtimeByChannel`, or should a narrower name make its non-authoritative role explicit?
- Is a workspace-only profile acceptable if it avoids fork schema changes, or does fresh-session independence require an in-fork supplement?
- Which existing tasks or commits are based on the superseded “remove `modelByChannel`” direction and must be paused, cancelled or replanned?
