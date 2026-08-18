# Channel runtime and model authority compatibility audit

## Scope

This report compares the final fork invariant across `9c09c259528`, `f7d039a3575`,
`0529559822f1`, `435059f7d634`, and `0b4e3efe7331` with the pinned upstream base
`4b85d834ed1586062f31bded2f358fc5192d1674`. It uses repository source, tests,
plans, and review artifacts only. It does not inspect live configuration, execute
tests, or infer that an undocumented migration ran successfully.

## Conclusion

The upstream base preserves the most important final-fork invariant: one
persistent channel model authority, `channels.modelByChannel`, with explicit turn
and session selections ahead of the channel default. It does not preserve the
complete final-fork behavior. Upstream has no model-free per-channel persistence
for `thinkingLevel`, `reasoningLevel`, or `textVerbosity`; it limits
origin-aware stale automatic-fallback repair to heartbeat turns; and its Gateway
row projection does not resolve a channel model before a run records session
state.

`runtimeByChannel` therefore has two different dispositions that must not be
conflated. The `model` field was deliberately removed from the final fork's
supplement to eliminate a second model authority. The entire supplement is absent
from upstream because it was fork-owned, not because upstream gained an equivalent
contract. Restoring a model-bearing `runtimeByChannel` would revive obsolete state;
dropping the model-free supplement would instead discard intentional operator
settings documented for 10 profiles.

Proposal verdict: Preserve upstream `modelByChannel` as the sole model authority, but do not claim pure upstream fully preserves the final fork or that the 11-profile rollback was lossless; retain or redesign only independently justified model-free behavior, and close stale-state or display gaps without restoring `runtimeByChannel[*][*].model` (confidence: high).

## Invariant history

| Revision | Repository evidence | Resulting invariant |
| --- | --- | --- |
| `9c09c259528` | `9c09c259528:src/config/types.channels.ts:ChannelRuntimeProfileConfig` lines 40-49 added one composite profile containing `model`, `thinkingLevel`, `reasoningLevel`, and `textVerbosity`; `9c09c259528:src/channels/model-overrides.ts:resolveChannelRuntimeProfile` lines 286-307 resolved it alongside `resolveChannelModelOverride`. | The fork added a second persistent model-capable channel profile while retaining upstream `modelByChannel`. |
| `f7d039a3575` | `f7d039a3575:src/auto-reply/reply/get-reply.ts` lines 566-585 selected the profile model and lines 690-725 applied thinking, reasoning, and text verbosity; `f7d039a3575:src/auto-reply/reply/get-reply-native-slash-fast-path.ts` lines 113-129 also selected the profile model. | The composite profile reached fresh ordinary and native execution, making path coverage materially broader. |
| `0529559822f1` | `0529559822f1:src/auto-reply/reply/stored-model-override.ts:isStaleAutoFallbackOverride` lines 82-130 compares recorded origin with the current primary before the heartbeat-only legacy fallback branch; `0529559822f1:src/auto-reply/reply/get-reply.fast-path.test.ts` test `"stale auto fallback from the previous channel primary"` at line 508 exercises the changed channel-primary case. | An automatic fallback pinned for an old channel primary became stale on an ordinary turn, while explicit user choices remained authoritative. |
| `435059f7d634` | `435059f7d634:src/agents/agent-command.ts` line 1336 still consumed `modelByChannel`, and `435059f7d634:src/config/types.channels.ts` lines 144-146 plus `src/config/zod-schema.channels-config.ts` lines 78-79 still exposed both maps. The proposal records that ordinary/fresh/native paths consumed `runtimeByChannel` while agent-command, status, schema, doctor, and update surfaces retained `modelByChannel` (`docs/proposals/proposal-20260724-083714-6c9e68_minimize-channel-runtime-divergence-from-upstream.md:39-50`). | The attempted removal produced split, path-dependent model authority rather than one canonical source. |
| `0b4e3efe7331` | `0b4e3efe7331:src/channels/model-overrides.ts:resolveChannelRuntimeProfile` lines 209-228 and `resolveChannelModelOverride` lines 231-270 resolve separate concerns; `0b4e3efe7331:src/config/types.channels.ts:ChannelRuntimeProfileConfig` lines 39-48 has no `model`; `0b4e3efe7331:src/config/zod-schema.channels-config.ts:ChannelRuntimeProfileSchema` lines 11-29 explicitly rejects it. | Final fork invariant: `modelByChannel` is sole persistent model authority; `runtimeByChannel` is model-free and supplemental; live session state is a cache or explicit override, not channel configuration authority. |

## Scenario matrix

| Scenario | Final fork at `0b4e3efe7331` | Upstream base at `4b85d834ed1` | Compatibility assessment |
| --- | --- | --- | --- |
| Persisted channel config | `modelByChannel` stores models; a strict model-free supplement stores thinking, reasoning, and verbosity. The independent resolver behavior is tested by `0b4e3efe7331:src/channels/model-overrides.test.ts` test `"resolves the canonical model and supplemental runtime profile independently"` lines 226-266. | `4b85d834ed1:src/config/types.channels.ts:ChannelsConfig` line 135 and `src/config/zod-schema.channels-config.ts:ChannelsSchema` lines 53-67 expose only `modelByChannel`. | Model values have a compatible destination. Model-free channel settings do not. |
| Fresh ordinary session | Channel model and supplemental settings apply without writing a session model override; proven by `0b4e3efe7331:src/auto-reply/reply/get-reply.fast-path.test.ts` test `"selects fresh Discord models from modelByChannel and thinking from runtime profiles"` lines 337-448. | `4b85d834ed1:src/auto-reply/reply/get-reply.ts` lines 673-708 resolves `modelByChannel` as the primary, and lines 764-771 select it when no effective session override exists. There is no channel supplement. | Model behavior is preserved; fresh-session thinking/reasoning/verbosity is lost. No direct base ordinary-reply test containing `modelByChannel` was found, so base proof here is source plus sibling path tests rather than retained focused coverage. |
| Existing unpinned session | Last-run `model`/`modelProvider` is runtime history; the current channel model remains authoritative. `0b4e3efe7331:src/auto-reply/reply/get-reply.fast-path.test.ts` test `"keeps the canonical channel model authoritative over stale fallback state"` lines 451-580 covers stale runtime metadata. | Ordinary reply recomputes the channel primary and applies it when no effective override exists (`4b85d834ed1:src/auto-reply/reply/get-reply.ts` lines 699-771). The separate Gateway identity projection prefers persisted runtime identity (`4b85d834ed1:src/agents/session-model-ref.ts:resolveSessionModelIdentityRef` lines 67-115), while selected/default identity ignores runtime history (`resolveSessionModelRef` lines 19-64). | Execution intent is preserved. Gateway can continue displaying the previous run until another run records the changed channel model. |
| Explicit session override | Stored user selection wins over channel model; final-fork fresh-session table includes `"live session override"` at `0b4e3efe7331:src/auto-reply/reply/get-reply.fast-path.test.ts` lines 351-358. | Stored direct override wins before parent override in `4b85d834ed1:src/auto-reply/reply/stored-model-override.ts:resolveStoredModelOverride` lines 87-128. `4b85d834ed1:src/auto-reply/reply/model-selection.test.ts` tests `"applies session modelOverride when set"` and `"respects modelOverride even when session model field differs"` lines 1009-1042. Agent-command coverage explicitly keeps stored override ahead of channel override at `4b85d834ed1:src/agents/agent-command.live-model-switch.test.ts` lines 1955-1977. | Preserved. A locked selection also suppresses channel application and disallowed-pin cleanup in base (`src/auto-reply/reply/get-reply.ts` lines 699-706; `src/auto-reply/reply/model-selection.test.ts` test `"preserves a locked disallowed override without resetting it"` at line 1229). |
| Explicit one-turn/run override | Explicit run selection remains ahead of channel configuration. | `4b85d834ed1:src/agents/command/model-selection.ts` lines 263-295 skips channel resolution when `hasExplicitRunOverride`; `4b85d834ed1:src/agents/agent-command.live-model-switch.test.ts` test `"keeps explicit run model overrides ahead of channel model overrides"` lines 1979-2003 proves the result. First-turn harness selection is also `turn -> stored -> channel` in `4b85d834ed1:src/auto-reply/reply/dispatch-from-config.harness-defaults.ts:resolveHarnessSourceVisibleRepliesDefault` lines 227-283. | Preserved. |
| Channel default changes without an explicit pin | New `modelByChannel` value becomes the primary on the next ordinary turn. | The channel primary is resolved on every ordinary reply (`4b85d834ed1:src/auto-reply/reply/get-reply.ts` lines 673-708), so an unpinned session follows the new value. Explicit user and locked selections remain ahead of it. | Preserved for unpinned and explicit-user cases. Automatic fallback provenance differs in the next row. |
| Automatic fallback from a previous channel primary | An origin-tagged automatic fallback is stale whenever its recorded origin differs from the current channel primary, including ordinary turns (`0b4e3efe7331:src/auto-reply/reply/stored-model-override.ts:isStaleAutoFallbackOverride` lines 82-130; `src/auto-reply/reply/get-reply.fast-path.test.ts` lines 505-517). | `4b85d834ed1:src/auto-reply/reply/stored-model-override.ts:isStaleHeartbeatAutoFallbackOverride` lines 151-164 returns false for every non-heartbeat turn before comparing origin. `4b85d834ed1:src/auto-reply/reply/model-selection.test.ts` test `"preserves auto-failover overrides that still carry origin metadata on normal turns"` lines 1648-1665 confirms persistence. Heartbeats do clear changed origins (`"clears stale heartbeat auto-failover override when the fallback origin changed"`, lines 1930-1951). Legacy auto pins lacking origin are still cleared on normal turns (lines 1632-1646). | Not preserved. A changed channel default can remain masked by an origin-tagged automatic fallback on ordinary upstream turns until a heartbeat/other recovery path repairs it. |
| Disallowed, malformed, or unavailable model/provider | Final fork uses the same canonical model-selection and fallback machinery once `modelByChannel` resolves. | A channel string that cannot be parsed is ignored and falls back to the configured default (`4b85d834ed1:src/auto-reply/reply/get-reply.ts` lines 699-708). A parsed selection is passed through visibility policy; if no allowed selection exists, `createModelSelectionState` throws (`4b85d834ed1:src/auto-reply/reply/model-selection.ts` lines 480-499). Authoritatively disallowed stored pins are cleared (`src/auto-reply/reply/model-selection.test.ts` lines 1188-1227), while a degraded catalog preserves a pin as temporarily unavailable (`test "preserves a pin the degraded catalog cannot vouch for"` at line 2402). Generic runtime fallback crosses providers on failure/cooldown (`4b85d834ed1:src/agents/model-fallback.test.ts` test `"tries cross-provider fallbacks when same provider has rate limit"` lines 4597-4647). | General policy and runtime fallback exist, but no base test ties an unavailable channel override specifically to the fallback result. Provider outage behavior is therefore supported by shared machinery, not proven end-to-end for this channel-config scenario. |
| Native `/status` | Final fork resolves model from `modelByChannel`; `0b4e3efe7331:src/auto-reply/reply/get-reply.fast-path.test.ts` test `"uses modelByChannel for native /status"` starts at line 689. | `4b85d834ed1:src/auto-reply/reply/get-reply-native-slash-fast-path.ts` lines 201-250 applies the channel model only when the target has no explicit/locked selection and the incoming selected model is still the configured default. It intentionally prefers the authorized current command sender over stale shared-session delivery identity at lines 211-237. General status labels a matching selected model as `channel override` only when no explicit override exists (`4b85d834ed1:src/status/status-message.ts:resolveChannelModelNote` lines 498-551); `src/auto-reply/status.test.ts` test `"notes channel model overrides in status output"` lines 837-865 proves the label. | Canonical config attribution is preserved and upstream has stronger current-sender/explicit-selection guards. However, native status parses the channel value without the visibility-policy normalization used by ordinary and agent-command execution (`4b85d834ed1:src/auto-reply/reply/model-selection.ts` lines 480-499; `src/agents/command/model-selection.ts` lines 388-400), so a disallowed or unavailable configured model can be displayed before execution replaces, rejects, or falls back from it. No focused test proves cross-path effective-model parity. |
| Gateway/session-list projection before a run | Final fork supplies `modelByChannel` only when neither selected nor runtime model exists and fills absent thinking/reasoning from the supplement (`0b4e3efe7331:src/gateway/session-utils.ts:buildGatewaySessionRow` lines 1975-1994 and 2186-2193). Tests `"session row applies supplemental channel runtime fields when reconstructed fields are missing"` and `"session row prefers modelByChannel while retaining supplemental runtime fields"` are at `0b4e3efe7331:src/gateway/session-utils.test.ts` lines 480-522. | Base `buildGatewaySessionRow` obtains explicit selection, runtime identity, or agent/default identity without consulting `modelByChannel` (`4b85d834ed1:src/gateway/session-utils-row.ts` lines 216-275); it projects only session `thinkingLevel` and `reasoningLevel` at lines 464-475. `4b85d834ed1:src/agents/session-model-ref.ts:resolveSessionModelRef` lines 40-64 confirms that agent-scoped rows use current agent config rather than channel config. | Not preserved before runtime fields exist. An ordinary run can later record the effective channel model, but a reconstructed/fresh row can display the agent default first. |
| Doctor and update behavior | The final fork recognizes the supplement as channel metadata, but the approved migration was assigned to workspace tooling, not steady-state runtime fallback. | Base doctor recognizes `defaults` and `modelByChannel` as metadata and can remove stale plugin-owned entries from `modelByChannel` (`4b85d834ed1:src/commands/doctor/shared/stale-plugin-config.ts` lines 21, 272-290, 463-507). Update restoration explicitly preserves dropped `modelByChannel` entries for restored channels (`4b85d834ed1:src/cli/update-cli/update-command-config.ts:restorePreUpdateChannelModelOverrides` lines 57-100 and `restoreDroppedPreUpdateChannels` lines 102-160). Neither surface reads or migrates `runtimeByChannel`. | Upstream safely owns its canonical map, but provides no rollback migration for the fork map or its non-model fields. |
| Retired `runtimeByChannel` input | Final fork rejects only the retired `model` member with targeted guidance while accepting the three supplemental fields (`0b4e3efe7331:src/config/zod-schema.channels-config.ts` lines 11-29; `src/config/config.plugin-validation.test.ts` tests at lines 1682-1725). | Base's open-world `ChannelsSchema` does not declare the key and is passthrough (`4b85d834ed1:src/config/zod-schema.channels-config.ts` lines 53-70). Plugin-aware validation normally treats it as an unknown channel id because the allowed metadata set is only `defaults` and `modelByChannel` (`4b85d834ed1:src/config/validation.ts:validateConfigObjectWithPlugins` lines 518-540); the generic fatal-typo behavior is tested at `src/config/config.plugin-validation.test.ts` lines 1668-1689. There is no targeted retired-key fixture or migration guidance. | The old key is usually rejected, but not by an explicit retired-key contract. It is not silently translated, and schema-only/passthrough paths are weaker than the final fork's targeted rejection. |

## Known rollback shape

The proposal records the pre-migration shape as 11 Discord runtime profiles with
no `modelByChannel`, and says 10 profiles had intentional non-model settings
(`docs/proposals/proposal-20260724-083714-6c9e68_minimize-channel-runtime-divergence-from-upstream.md:60-67,125-139`). It requires conflict detection, abort-on-conflict, a timestamped backup,
per-profile dry-run output, movement of each `model` into `modelByChannel`,
preservation of non-model fields, doctor validation, restart/live sampling, and a
rollback artifact (`docs/proposals/proposal-20260724-083714-6c9e68_minimize-channel-runtime-divergence-from-upstream.md:154-181,209-223`).

Repository evidence supports only this bounded assessment:

- The structural target is coherent in the final fork: 11 model entries can live
  in `modelByChannel`, while the 10 non-model profiles remain model-free. The
  closure report records that observed post-state shape, but explicitly says it
  could not compare the 11 old values or normalized supplemental fields with a
  backup (`.architecture-reviews/reports/2026-07-24-option-a-closure.md:18`).
- No OpenClaw base migration inventories both maps, detects same-target conflicts,
  or moves fields between them. Base doctor and update handling preserve/repair
  only `modelByChannel`; they are not substitutes for the proposed workspace
  migration.
- Pure upstream cannot preserve the 10 model-free profiles because it has no
  corresponding config surface. Keeping only the 11 model entries is therefore a
  model-compatible migration, not a lossless final-fork migration.
- The closure report found no Slice 2 or Slice 4 final note and marks dry-run,
  apply, doctor, and rollback unproved
  (`.architecture-reviews/reports/2026-07-24-option-a-closure.md:19,30-36`). It also
  records that the canonical gate was not globally green (`:20`). Current shape
  cannot reconstruct historical execution evidence.

Consequently, repository evidence cannot prove conflict-free 11-to-11 value
equality, byte-equivalent preservation of the 10 supplements, backup creation,
doctor success, restart verification, or rollback rehearsal. Any future migration
must re-inventory its input and produce those artifacts; it must not infer success
from the current shape.

## Why `runtimeByChannel` disappeared

The whole key did not disappear in the final fork. At `0b4e3efe7331` it remained
as the model-free supplement, and validation made a model-bearing profile invalid.
What disappeared there was its authority over `model`.

The whole key disappears only when comparing with `4b85d834ed1`, where repository
search finds no `runtimeByChannel` occurrence under `src/`, `packages/`,
`extensions/`, `docs/`, or `test/`. This follows provenance: the key originated in
fork commit `9c09c259528`, whereas `modelByChannel` remained the upstream type,
schema, resolver, execution, status, doctor/update, and SDK contract. The proposal
approved realignment for that reason
(`docs/proposals/proposal-20260724-083714-6c9e68_minimize-channel-runtime-divergence-from-upstream.md:21-49,80-98`).

The safe interpretation is therefore field ownership, not backward compatibility:

- Models stay in upstream `modelByChannel`.
- Explicit session selections stay in canonical session override fields.
- Last-run model fields remain runtime history, not config authority.
- Old automatic fallback pins are repairable state, with the ordinary-turn gap
  above requiring separate treatment if final-fork semantics are retained.
- Non-model channel defaults require an independently justified current seam; they
  must not be smuggled back through a deprecated model-capable profile.

## Evidence limits

- No tests were run because the task explicitly requires a repository-evidence-only
  audit.
- No live config, backup, workspace helper, or external repository was inspected.
- No focused base ordinary-reply test containing `modelByChannel` was found; the
  ordinary path assessment is source-backed and corroborated by agent-command and
  status tests.
- No focused base test proves the exact unavailable-provider path from a channel
  override through fallback completion.
- Native `/status` does not apply the visibility policy used by execution, and no
  focused test reconciles its configured-model display with a disallowed or
  unavailable model's eventual execution result.
- No base test explicitly compares chat `/status` with a pre-run Gateway row, even
  though the source ownership difference is direct.
- Base has generic unknown-channel rejection, not a dedicated
  `runtimeByChannel` retirement test or doctor migration.
