# OpenClaw upstream sync compatibility review

## Goal <!-- section:goal type:context -->

Decide what to carry from fork commit `03639ab0774c8a7a47f5301457e6c76a0474c415` onto upstream base `4b85d834ed1586062f31bded2f358fc5192d1674` before integration resumes. No behavior is accepted, removed, or replaced solely because Git reports that a patch applies or because upstream contains a similarly named feature.

Rollback remains anchored by remote tag `rollback/pre-upstream-sync-20260809-172217`. Analysis and any later implementation use the isolated worktree `/Users/michal/Projects/openclaw-upstream-sync-20260809-180149`; the running checkout and Gateway remain untouched.

## Decision model <!-- section:decision-model type:context -->

Each change family receives one explicit verdict:

- **Equivalent upstream** — upstream preserves the same user-visible behavior, configuration semantics, failure behavior, and operational contract. The fork patch can be dropped.
- **Compatible replacement** — upstream solves the same need differently. The proposal records migration/adaptation work and proof that existing configuration and consumers remain compatible.
- **Fork-only, retain** — upstream lacks the capability; port it to current APIs.
- **Obsolete by decision** — the original need no longer exists. This requires an explicit rationale, not merely an API conflict.
- **Blocked/unknown** — evidence is insufficient. No integration for that family proceeds.

Compatibility must be evaluated across five dimensions:

1. Functional behavior and edge cases.
2. Configuration/schema and migration behavior.
3. Plugin/API contracts and external consumers.
4. Runtime observability, failure modes, and security/privacy properties.
5. Tests, generated metadata, build/export gates, and live smoke requirements.

## Evidence baseline <!-- section:evidence-baseline type:context -->

For every family, the analysis will capture:

- original intent and final fork behavior from the whole follow-up stack, not only the first commit;
- current upstream implementation and tests at the pinned base;
- behavioral contract comparison, including negative and failure paths;
- config/API migration impact on the current OpenClaw configuration and KM/Deliberation consumers;
- verdict, confidence, unresolved questions, and exact proof required before promotion.

The dirty isolated worktree currently contains an unapproved preliminary port. It is evidence only until every family below has a decision. Its diff must not be treated as accepted design.

### Family-by-family synchronization method

This review is also the learning and definition phase for a repeatable fork-to-upstream synchronization method. Apply the following procedure to every family, including changes that accumulate in the fork while the sync remains in progress:

1. Establish the family's complete current change surface and original intent from the **latest canonical production `openclaw-fork` source**, including the whole follow-up stack; do not rely only on an old commit list or the preliminary retained baseline.
2. Compare two explicit trees: that canonical production-fork source versus the new upstream-based sync target. The investigation workspace must expose both trees through repository-local refs/objects or equivalent materialized evidence; a target-only audit is invalid. Record exact source and target commits before classifying what should be dropped, replaced by upstream, retained exactly, mechanically adapted, or regenerated after canonical source closes.
3. If the classification and transfer are **trivial from direct repository evidence** — for example, an isolated exact carry-forward with no changed upstream ownership, lifecycle, shared-file conflict, or cross-family dependency — record the evidence and exact transfer directly in the proposal. Do not create an investigation task merely for ceremony.
4. If the family is **non-trivial or uncertain** — overlapping upstream implementation, changed APIs/lifecycle, shared generated files, security/failure semantics, cross-family coupling, accumulated follow-up changes, or incomplete evidence — create a **two-tree investigation task in a one-task batch**, link it to the family section, and use its report to determine exactly what and how to transfer before implementation. Register it to a comparison workspace that can read both Git trees without mutating either; if one tree is not locally available, materialize or refresh that evidence before dispatch rather than broadening the agent into unrelated repositories.
5. Investigation is decision support, not implementation. It must inventory the current family, recover behavioral intent, identify dependencies and stop conditions, classify each coherent change group, and specify task-ready transfer and proof steps.
6. Only after the disposition is explicit may implementation proceed. Preserve current behavior unless Michal makes an explicit product decision to drop or replace it; do not redesign opportunistically during synchronization.
7. Verify the transferred family against its behavioral contract, not patch applicability alone. Record source and target anchors, intentional omissions/replacements, adaptations, generated projections, and exact tests/build/smoke evidence so the procedure can be repeated on the next upstream update.
8. Before promotion, refresh the delta for families that continued changing during the review and repeat this method for newly discovered changes.

Families 1–3 established the investigation pattern. Family 13 task `bold-crag-0237`, batch `stage-a7-family13-current-inventory-20260818`, applies it to the evolving Deliberation surface.

## Family 1: Local repository hygiene <!-- section:family-local-hygiene -->

Analyze `c387494b4769fd0d2ec94929262a9be4fbbc5b05` (`Swabble` ignore): whether the path remains locally generated, whether a repository-wide ignore is appropriate, and whether upstream now ignores the same artifact under another pattern.

Required output: retain/drop verdict with exact ignore evidence. No runtime compatibility gate is needed.

### A1 result (2026-08-17) — task `calm-crag-2866`

Report: `plans/investigations/calm-crag-2866_family1-swabble-ignore-evidence.md` in the isolated sync checkout.

Verdict **DROP**. Current source/build/CI/runtime paths use `apps/swabble/**`, `apps/macos/.build`, `apps/ios/**`, temp files, or user-home locations; nothing generates root `Swabble/`.

**DONE (2026-08-17).** The obsolete root `.gitignore` entry `Swabble/` and its extra blank line were removed directly from OpenClaw Next. Verification: the resulting `.gitignore` is byte-for-byte equivalent to `v2026.8.1-beta.2`; active `apps/swabble/Package.resolved` and `apps/swabble/build/` rules remain. The unnecessary implementation task `cool-wave-9035` was cancelled during planning before code work.

## Family 2: WhatsApp plugin-only delivery policy <!-- section:family-whatsapp-plugin-only -->

Analyze the final combined behavior of:

- `1b491abbd9084af43368e963473500a698195015`
- `74ccfb5752eb63ee88dec370ae8b610564ced7c4`
- `1516cd91d811b375a44602e72096485f2e34d9f6`

Compare the fork's `deliveryPolicy: plugin-only` semantics with current upstream WhatsApp admission, group activation, plugin claims, fallback delivery, and configuration ownership. Verify precedence/merge rules for account, group, and default policy; claimed versus unclaimed messages; and whether upstream has an equivalent mode under a different contract.

Compatibility gate: a truth table covering policy source × claim outcome × fallback path, schema round-trip/migration evidence, and focused tests for every materially distinct row.

### A1 result and lifecycle review (2026-08-17) — task `wild-crag-6323`

Report: `plans/investigations/wild-crag-6323_family2-whatsapp-plugin-only-truth-table.md` in the isolated sync checkout.

The audit reconstructed 24 policy-source × claim-outcome rows. Existing component suites pass (189/189 in the broader focused run), but none of the 24 complete rows has end-to-end coverage. The source Zod schema contains `deliveryPolicy`, while committed generated channel metadata does not; this is source/generated drift that matters only if the family is retained. Six missing acceptance blocks were identified (handled; declined/error/timeout; missing/no-handler + mention behavior; delivery denied; account precedence; schema round-trip).

**Original purpose:** commit `1b491abbd908` explicitly says this mode was added to enable Deliberation plugins: run the full WhatsApp dispatch and hooks but suppress the final automatic WhatsApp message for configured groups. Follow-ups only fixed an import and SDK import boundaries. This was not a general upstream requirement; it was glue for the old Deliberation integration.

**Current relevance:** WhatsApp is not connected, and future WhatsApp intake is expected to be designed against the new Deliberation pipeline/claim contract.

**Operator decision (2026-08-17): `DROP/DEFER`, approved by Michal.** Remove `deliveryPolicy: plugin-only`, its resolver/transport guard, focused tests, and its schema/generated surface from the OpenClaw Next sync baseline. Retain this audit as design evidence. If WhatsApp is re-enabled, design delivery ownership afresh against the then-current Deliberation pipeline/claim contract rather than reviving this compatibility patch. Family 2 therefore does not proceed to its previously proposed A8 coverage work.

## Family 3: Defensive WhatsApp login normalization <!-- section:family-whatsapp-login -->

Analyze `1d066c8d2c5f5b4fb45d9b1704de7299ec93eab6` against the current login flow. Identify which non-`Error` and malformed results can still cross the boundary, how upstream renders failures today, and whether the patch remains necessary or is already covered by a generic error normalizer.

Compatibility gate: focused tests for `Error`, string, object, `null`/`undefined`, and sensitive/unserializable values; confirm no credential or payload leakage in surfaced errors.

### A1 result and operator decision (2026-08-17) — task `dark-dune-3768`

Report: `plans/investigations/dark-dune-3768_family3-login-normalization-matrix.md` in the isolated sync checkout.

The audit found the retained `buildLoginError()` guard technically necessary for malformed fulfilled login results, independent of Family 2 and the old Deliberation dispatch policy. The registered focused suite passed 298/298. However, this local customization is useful only for the currently disconnected WhatsApp channel and does not solve the more important sensitive-payload path: a rejected object can still be serialized without redaction into the CLI-visible error message.

**Operator decision: `DROP/DEFER`, approved by Michal.** Remove the retained `buildLoginError()` helpers, login call-site adaptations, and focused tests from OpenClaw Next. Preserve the audit as design evidence. If WhatsApp is re-enabled, reassess then-current upstream and implement the complete login/QR error boundary—including redaction—rather than reviving this partial patch.

## Family 4: Inbound claim contract <!-- section:family-inbound-claim -->

Analyze `da1059a30450` against current `inbound_claim`, targeted claim/outcome APIs, plugin binding, fallback behavior, and dispatch ordering. The current audit says upstream is richer, but equivalence must be demonstrated rather than assumed.

### Decision and sync consequence

The completed investigation classifies this family as **`FORK-ONLY RETAIN`**. Upstream preserves the hook runner and the binding-owner path, but deliberately does not invoke unbound `inbound_claim` handlers from production dispatch. That is compatible with Codex, whose conversation binding identifies the owning plugin, but not with the retained Deliberation integration.

Deliberation uses the global claim as its synchronous Discord intake boundary: matching host-classified `user_request` events are submitted to KM before ordinary dispatch; a successful submission claims the event so normal OpenClaw processing does not also answer it. Its independent `before_dispatch` guard fails closed. Removing the global capability while retaining that guard could therefore suppress a matching Discord request without submitting it to KM.

The sync must retain the capability, not the old implementation verbatim. Reimplement global claim dispatch inside the current upstream lifecycle with explicit abort/timeout handling, reply delivery, dedupe settlement, operation finalization, deterministic claimant ordering, binding-owner exclusivity, and the host-authoritative `provider`, `eventType`, and `eventKind` facts Deliberation uses for admission. Do not restore the old block unchanged: it ignored claim replies, left handled message keys in the process in-flight dedupe set, and bypassed current lifecycle guarantees.

Stable evidence: investigation task `warm-dune-8028`, result [`plans/investigations/warm-dune-8028_audit-inbound-claim-compatibility-across-fork-and-current-upstream.md`](../../plans/investigations/warm-dune-8028_audit-inbound-claim-compatibility-across-fork-and-current-upstream.md).

Compatibility gate: map each old hook invocation and consumer to its current upstream equivalent; prove ordering, cancellation/claim semantics, error isolation, and unclaimed fallback behavior. Implementation proof must additionally cover global reply delivery, dedupe replay/settlement, fast and plugin commands, source-policy fallback, observations, handler timeout/error, source abort, media-only intake, and lifecycle completion. If any old consumer cannot migrate without semantic loss, classify it as an adaptation blocker.

## Family 5: Cron trajectory suppression <!-- section:family-cron-trajectory -->

Analyze `b0da725a110f` and the trajectory-related portion of `7dd48ebcb8db` against current `disableTrajectory` wiring. Verify that every cron execution path that previously opted out still does so, including retries and isolated runs, and that interactive/non-cron runs retain trajectory behavior.

Compatibility gate: call-path evidence plus tests for cron, retry, and normal agent runs.

## Family 6: Queued trajectory writer <!-- section:family-trajectory-writer -->

Analyze `47c4aff1db67` and related follow-ups against current `queued-file-writer.ts` and trajectory integration. Compare ordering, flush/close guarantees, process termination, backpressure, bounded memory/bytes, concurrent paths, diagnostics, and error propagation.

Compatibility gate: contract matrix and current tests proving equal or stronger durability and resource behavior. Any weaker guarantee must become an explicit decision.

## Family 7: Channel runtime/model authority <!-- section:family-channel-authority -->

Analyze the complete sequence:

- `9c09c259528`
- `f7d039a3575`
- `0529559822f1`
- `435059f7d634`
- `0b4e3efe7331`

Reconstruct the final fork invariant—what is authoritative in persisted config, session state, fresh sessions, CLI/status output, migrations, and stale-state repair—then compare it with current upstream `modelByChannel` behavior. Do not resurrect `runtimeByChannel`, but do not remove it merely because upstream deleted the field.

Compatibility gate: scenario table for existing session, fresh session, explicit override, channel default change, stale config, provider/model unavailable, status display, and migration from the rollback configuration. Include a read-only migration preview for the actual config shape before promotion.

## Family 8: Configured reasoning effort <!-- section:family-reasoning-effort -->

Analyze `031cdbf89477` against current stream-wrapper/provider routing. Compare accepted values, provider-specific translation, precedence between model defaults/session overrides/request parameters, unsupported-provider behavior, and status/telemetry visibility.

Compatibility gate: source-to-wire mapping and tests for supported and unsupported providers. Exact commit ancestry is supporting evidence, not proof by itself.

## Family 9: Cron failure markers <!-- section:family-cron-failure -->

Analyze `dc43c20df50c` against current command runner and cron delivery. Compare non-zero exit classification, stderr/stdout summary precedence, truncation, diagnostics, user-visible result, task state, retry behavior, and secret redaction.

Compatibility gate: fixture matrix for exit code, signal/timeout, stderr-only, stdout-only, mixed output, empty output, and oversized output.

## Family 10: Speech-core export/runtime alias <!-- section:family-speech-core -->

Analyze `2c030c303aba` and the previous sync boot incident against current package exports and bundled plugin loader. Confirm that every historical import path either has a supported current equivalent or is no longer referenced by built/runtime code.

Compatibility gate: source/reference search, package export resolution test, build DTS/export gate, and a clean-checkout plugin boot smoke before promotion. This family cannot be closed as obsolete from file deletion alone.

## Family 11: Generated channel/config metadata <!-- section:family-generated-metadata -->

Analyze `e904c5b752d8` as generated evidence. Identify canonical source files and regeneration commands in current upstream; compare semantic output caused by retained schema changes.

Compatibility gate: regenerate from clean sources, require a stable/idempotent second run, and review semantic diff. Never copy the old generated blob directly.

## Family 12: SecretRef credential surfaces <!-- section:family-secretref -->

Analyze `60b779d8c9e2bdb07f40cff10bd0f96584189a39` against the current canonical credential registry, generated JSON matrix, documentation, source-checkout fixtures, and Deliberation configuration. Determine whether every Deliberation secret field is supported in parsing, resolution, redaction, doctor diagnostics, and docs.

Compatibility gate: registry consistency tests, generated matrix/doc diff, invalid/missing SecretRef diagnostics, and proof that raw credentials are not serialized or logged.

### A3 result and operator decision (2026-08-18) — task `dark-cove-2012`

Report: `plans/investigations/dark-cove-2012_family12-secretref-end-to-end-audit.md` in the isolated sync checkout.

The audit confirmed that the retained Family 12 behavior is already present on the pinned upstream tree: Deliberation accepts `km.credential` as a SecretRef, runtime resolution supplies it to the KM authorization boundary, the authored config retains the reference, and the canonical registry, generated matrix, documentation, source-checkout fixture, and focused test suites are aligned. The retained baseline replay had no semantic SecretRef conflict.

The audit also identified pre-existing hardening opportunities in config projection sensitivity and manifest/runtime validation parity. Those are not compatibility regressions introduced by this sync and are outside its preserve-current-behavior scope.

**Operator decision: `FORK-ONLY, RETAIN AS-IS / PORT COMPLETE`, approved by Michal.** Do not redesign or harden Family 12 during this sync. Preserve the currently deployed SecretRef behavior exactly. Family 12 no longer blocks Family 13.

## Family 13: Deliberation extension <!-- section:family-deliberation -->

Analyze the final state represented by:

- `120dc9059c0ba6416516390310188982eb15e598`
- `b734b8e3ee4683ffd46f9f291605ba612ac8dc53`
- `9f6f2ad55200c82c52c9e9f9a0473fc32beb7458`
- `28dacc24ebb3e24a455d839dd6ecff0d24ac9294`
- `e7a0517245be14e94c90b1bc45643bcc070a4a6f`
- `03639ab0774c8a7a47f5301457e6c76a0474c415`

Decompose it into explicit contracts before implementation:

1. Manifest, config schema, SecretRef fields, and enable/disable lifecycle.
2. KM health/intake/history/final-adapter wire contracts and fixtures.
3. Route matching, channel/thread resolution, source identity, and authorization guards.
4. Text and media-only normalization, safe placeholders, skip observability, redaction.
5. Claim/fallback and sole-send behavior, including failure and timeout paths.
6. Generic plugin hook versus Discord host-runtime bridge requirements.
7. History-read v1/v2 capability negotiation and compatibility.
8. Listener/probe tooling, source identity verification, and deploy diagnostics.
9. Plugin SDK exports, source-checkout loader, build entries, inventory/reference docs.

Compatibility gate: for each sub-contract, identify current upstream API, unchanged KM consumer expectation, adaptation needed, and focused test. Core or Discord changes require proof that the current generic plugin API cannot supply a required datum or lifecycle guarantee.

## Family 14: Historical plans and architecture evidence <!-- section:family-history -->

Classify `44c82cded640`, `CHANGELOG.agent.md`, architecture reviews, checkpoints, and learning artifacts as either durable project documentation worth retaining or sync-only evidence that belongs outside product history.

Compatibility gate: no runtime or build impact. Preserve only evidence that remains useful and does not duplicate the proposal/audit archive.

## Cross-family compatibility review <!-- section:cross-family-review -->

The completed synthesis found these interactions and encoded their dependency order and stop conditions in the Investigation outcome section. The decisive result is **PARTIALLY SAFE**: only the dependency-closed Families 5, 6, 9, and 14 are ready; whole-proposal implementation remains blocked.

Interactions that isolated family tests can miss:

- WhatsApp plugin-only policy × generic inbound claims × fallback/sole-send behavior.
- Deliberation claims × Discord host dispatch × message history/source identity.
- Deliberation SecretRefs × config schema generation × doctor/source-checkout tests.
- Channel model authority × reasoning effort × session override behavior.
- Cron trajectory suppression × queued writer lifecycle × cron failure reporting.
- Package exports × plugin build/loader × clean-checkout boot.

Completed output: dependency graph, contradictions, integration proof list, ordered checkpoints, and explicit stop conditions are recorded in [`calm-peak-5381`](../../plans/investigations/calm-peak-5381_final-cross-family-compatibility-synthesis.md) and summarized below.

## Investigation outcome <!-- section:investigation-outcome type:context -->

The nine-task compatibility batch `openclaw-upstream-compatibility-investigations-20260809` is complete. Its original synthesis was **PARTIALLY SAFE**: 4 families `READY`, 5 `NEEDS ADAPTATION`, and 5 `BLOCKED`. A1 subsequently closed Families 1–3 by evidence and approved drop/defer decisions, leaving **2 blocked families** (12 and 13). This remains a decision record, not promotion approval; no tests, builds, generators, live configuration, provider/KM scenarios, or clean-checkout smoke were run by the synthesis.

### Family disposition ledger

- **READY:** Family 5 cron trajectory suppression — obsolete by explicit product decision; Family 6 queued trajectory writer — reject the fork compatibility layer and retain current SQLite ownership; Family 9 cron failure marker — reject the free-form marker and retain current typed timeout/signal/exit ownership; Family 14 historical evidence — retain durable proposal/audit/contract evidence, but give retired plans and `CHANGELOG.agent.md` no runtime or release authority.
- **NEEDS ADAPTATION:** Family 4 inbound claim — retain the global unbound capability, redesigned inside the current dispatch lifecycle; Family 7 channel authority — keep `modelByChannel` as the sole model authority and decide model-free profile settings/migration; Family 8 reasoning effort — replace raw `params.reasoningEffort` with canonical thinking plus compatibility metadata; Family 10 speech-core — keep the old alias retired but prove current exports/DTS/clean-checkout boot; Family 11 generated metadata — rebase canonical sources first, regenerate on the target base, and require idempotence.
- **CLOSED / DROPPED:** Family 1 local hygiene, Family 2 WhatsApp plugin-only, and Family 3 login normalization are closed by completed A1 evidence and Michal's `DROP/DEFER` decisions; their retained deltas have been removed from OpenClaw Next.
- **BLOCKED:** Family 12 SecretRef lacks one end-to-end source/runtime/doctor/redaction/non-persistence audit; Family 13 Deliberation depends on Families 4 and 12 plus verification that the preserved deployed contract maps safely onto current upstream. Its availability/fallback and inactive-outbound semantics are no longer open product decisions.

### Cross-family consequences

1. The remaining blocked nodes are real gates. Do not implement around them, and do not generate target metadata before SecretRef and Deliberation decisions close. WhatsApp Families 2 and 3 are closed and excluded from this sync.
2. Inbound claims must preserve binding-owner exclusivity while adding one deterministic global phase with host-authored event facts, abort/timeout handling, reply delivery, dedupe settlement, observations, command/source-policy behavior, and lifecycle finalization. WhatsApp-specific claim interaction is excluded from this sync because Families 2 and 3 were dropped/deferred.
3. Deliberation must use host-authored Discord classification and the full `v1:<provider>:<account>:<channel>` source identity. History v1/v2 contracts remain authoritative. Its outbound sender stays inactive; source identity is not an authorized destination.
4. `modelByChannel` remains the sole persisted model authority. Settle model-free channel settings and rollback migration before adapting reasoning transport. Never restore `runtimeByChannel[*][*].model`.
5. Do not port the cron payload opt-out, batched trajectory writer, or `CRON_FAILURE:` marker. These three no-port decisions are mutually compatible and do not justify a new combined abstraction.
6. Keep `@openclaw/speech-core` retired. Verify the current `openclaw/plugin-sdk/speech-core` and `openclaw/plugin-sdk/tts-runtime` ownership chain through package/export/DTS and clean-checkout loader proof before diagnosing any failure as an alias need.

### Required order and stop conditions

0. Families 1–3 and A2 operator compatibility decisions are closed. Complete the missing Family 12 SecretRef audit, then reclassify Family 13 against the preserved deployed contract. **Stop dependent implementation while any required family is blocked.**
1. Record the dependency-closed no-port/evidence decisions for Families 5, 6, 9, and 14.
2. Prove the current package/export baseline for Family 10; do not restore the retired alias automatically on failure.
3. Establish canonical channel authority and rollback migration for Family 7.
4. Adapt canonical reasoning transport for Family 8.
5. Adapt the generic inbound lifecycle for Family 4 after the operator ordering decision; the completed WhatsApp audit is retained as evidence but WhatsApp-specific behavior is excluded.
6. Reclassify SecretRef and Deliberation against the intended target tree. Outbound remains inactive unless a separate immutable KM-authorized destination contract is approved.
7. Regenerate target-base projections only after source families are approved; require semantic review and an idempotent second run.
8. Run the integrated promotion gate. No push, npm link, Gateway restart, live migration, or promotion while a non-excluded family is blocked or required proof is missing.

### Operator decisions — closed for compatibility scope (2026-08-17)

- Global unbound-claim placement: preserve deployed precedence and adapt it to upstream lifecycle guards (see A2).
- WhatsApp `plugin-only` and login normalization: `DROP/DEFER`; both retained deltas removed.
- Deliberation fail-closed/fallback behavior: preserve the deployed contract exactly; no product redesign in this sync.
- Model-free per-channel `thinkingLevel`, `reasoningLevel`, and `textVerbosity`: preserve deployed requirements and precedence; reconcile representation/API only.
- Outbound Deliberation: remains inactive.
- No remaining family is currently excluded beyond the approved WhatsApp drops. A new operator decision is required only if implementation discovers a concrete upstream incompatibility or safety regression.

### Investigation reports

- Final synthesis: [`calm-peak-5381`](../../plans/investigations/calm-peak-5381_final-cross-family-compatibility-synthesis.md)
- Family 4 inbound claim: [`warm-dune-8028`](../../plans/investigations/warm-dune-8028_audit-inbound-claim-compatibility-across-fork-and-current-upstream.md)
- Family 5 cron trajectory suppression: [`cool-peak-0348`](../../plans/investigations/cool-peak-0348_audit-cron-trajectory-suppression-compatibility.md)
- Family 6 queued trajectory writer: [`calm-peak-8671`](../../plans/investigations/calm-peak-8671_audit-queued-trajectory-writer-compatibility-across-fork-and-upstream.md)
- Family 7 channel/model authority: [`wild-dune-5465`](../../plans/investigations/wild-dune-5465_audit-channel-runtime-and-model-authority-compatibility.md)
- Family 8 reasoning effort: [`calm-fork-5226`](../../plans/investigations/calm-fork-5226_audit-configured-reasoning-effort-compatibility.md)
- Family 9 cron failure marker: [`wild-peak-2307`](../../plans/investigations/wild-peak-2307_audit-cron-failure-marker-compatibility.md)
- Family 10 speech-core exports: [`quick-mist-3295`](../../plans/investigations/quick-mist-3295_audit-speech-core-runtime-export-compatibility.md)
- Family 11 generated metadata: [`warm-reef-8132`](../../plans/investigations/warm-reef-8132_audit-generated-channel-and-config-metadata-compatibility.md)
- Supporting Deliberation v1 residue audit: [`swift-mist-4312`](../../plans/investigations/swift-mist-4312_audit-deliberation-v1-residue-in-openclaw-fork.md)

## Promotion gate <!-- section:promotion-gate type:context -->

No rewrite of `main`, remote push, npm link, Gateway restart, or live configuration migration occurs until:

- every actionable family has an explicit verdict and evidence;
- blocked/unknown families are resolved or consciously excluded by Michal;
- the isolated branch passes focused tests, generated-file consistency, full build including DTS/export gates, doctor against a copied/sanitized config, clean-checkout plugin boot, and rollback verification;
- the final proposal records the exact retained, replaced, removed, and deferred behavior.

Implementation and promotion will be decomposed only after the compatibility review is approved.

## Parallel canary instance <!-- section:parallel-canary type:context -->

Promotion runs through a second OpenClaw instance on the same host (Mac Studio). Goal: the production Gateway must never be the first place new code boots. The dominant historical failure mode is "new version does not start / Gateway down, no way to repair", not data corruption — so isolation targets runtime, not data.

### Shared between production and canary (deliberately identical)

- Workspace `~/.openclaw/workspace` — same real files, no copy. Deliberation pipeline, km-system, skills, memory, knowledge must be testable against real data.
- Credentials, copilot-bridge, Ollama, and other host services (read-mostly).

### Separated (only what would collide)

- **Process + checkout**: canary runs directly from the isolated upstream-sync checkout (`node dist/...` or local bin). No `npm link` — the global link stays pointed at production until final promotion.
- **Gateway port**: canary on its own port (e.g. 18790 vs production 18789), plus any other listener ports the instance opens.
- **Session/runtime state**: canary has its own state dir (sessions, session index, run state, media). Two processes must never write the same session store. Canary config is a copy of production config with a minimal diff: port, bot token, state paths, cron policy.
- **Discord identity**: second bot application/token ("canary bot"). One token cannot safely serve two gateways. Canary bot is allowlisted to one dedicated test channel; the production bot ignores that channel. All other channels stay on production.

### Cron policy: switch as a whole set, never per-job

Cron jobs write into the shared workspace and pipeline, so exactly one instance owns the cron set at any moment — otherwise attribution of "which version did what" is lost and duplicated side-effect jobs (autocommit, monitor) collide over shared state (e.g. tasks.db).

- At any point in time the full cron set is enabled on exactly one instance and disabled on the other.
- Cutover: disable all crons on the old version and enable the same set on the new version in one operation. Rollback is the same operation in reverse.
- Never migrate crons one by one; partial splits are prohibited.
- Individual jobs may still be exercised on the non-owning instance manually (`cron run`) for testing, but scheduled ownership stays whole-set.
- The pipeline monitor is part of this rule: it runs on exactly one instance at a time.

### Lifecycle and promotion

- Canary is started/stopped manually (no launchd). If it fails to boot, production is untouched and remains the repair surface.
- Promotion after canary passes: boot, doctor, real messages in the test channel, cron-set cutover trial, and a soak period. Then production checkout moves to the tested commit and restarts via the supported Gateway restart path; cron set moves with it.
- Rollback anchor: previous commit + config backup + cron-set switch back.

### Build & start sequence (canary bring-up plan, 2026-08-17)

Relationship to the investigation verdicts: the nine-task batch completed with synthesis **PARTIALLY SAFE** (see Investigation outcome). A1 has since closed Families 1–3: Family 1's obsolete ignore and the retained Family 2/3 WhatsApp deltas were removed. Before the canary can run a meaningful soak, the sync checkout still needs: closure of the remaining BLOCKED Families 12 (SecretRef) and 13 (Deliberation); implementation/proof for NEEDS ADAPTATION Families 4 (inbound claim), 7 (channel authority), 8 (reasoning effort), 10 (speech-core), and 11 (generated metadata); and recorded READY no-port decisions for Families 5, 6, 9, and 14. The required order and stop conditions in Investigation outcome govern this work.

- Stage mapping — to avoid forgetting anything:
- **Stage A (sync content work):** close blocked families + implement adaptations in the isolated checkout, per family verdicts. This is where "přemigrování změn z upstreamu" happens. Pipeline tasks linked to the family sections.
- **Stage B (canary infra, phases 0–2 below):** buildable in parallel with Stage A — the tooling does not depend on the verdicts — but a meaningful canary soak requires Stage A complete, otherwise the canary tests bare upstream without our behavior.
- **Stage C (cron cutover trial + soak + promotion, phases 3–4):** requires Stage A closed and the promotion gate satisfied.

Phase 0 — preparation, no production impact:
1. Verify state of isolated checkout `~/Projects/openclaw-upstream-sync-20260809-180149` (branch `sync/clean-upstream-20260809-180149`, pinned upstream HEAD `4b85d834...`, uncommitted retained baseline).
2. Build in the checkout: install, schema gen, build, DTS gate. No link, no restart.

Phase 1 — canary infrastructure (script in `km-system/scripts/`, delivered via pipeline task):
3. `openclaw-canary` operator command with `init / start / stop / status / cutover-crons / rollback-crons`:
   - `init`: create `~/.openclaw-canary/` state dir; copy production `openclaw.json` and apply the minimal diff (canary port, canary bot token, state paths, all crons disabled, monitor off); workspace path stays shared `~/.openclaw/workspace`; run doctor against the canary config.
   - `start`/`stop`: run the Gateway directly from the isolated checkout (node dist), PID file and logs inside the canary state dir.
   - `cutover-crons`/`rollback-crons`: atomic whole-set cron ownership switch per the rule above.
4. Second Discord application ("canary bot"), invited to the server, dedicated test channel; canary config allowlists only that channel, production config ignores it. Bot creation is a Michal action; token goes into canary credentials, never into the workspace.

Phase 2 — first boot and smoke:
5. `init` + doctor → `start` → verify canary gateway status and port, production untouched.
6. Real messages in the test channel: text, tool calls, model routing via copilot-bridge, session status.
7. Functional tests over the shared workspace: memory search, skills, Deliberation intake read-only, manual `cron run` of selected jobs from canary (no scheduled ownership).

Phase 3 — cron cutover trial (requires whole-set rule): `cutover-crons` to canary, observe first scheduled runs, `rollback-crons` back. Proves the switch both ways before soak.

Phase 4 — soak and promotion: several days of canary owning the test channel (optionally crons); then promotion per the promotion gate — production checkout moves to the tested commit, supported restart, cron set moves with it, canary stops. Rollback anchor as above.

Open blockers updated 2026-08-17: canary bot token (Michal), and closure of the 2 remaining BLOCKED families (12 SecretRef, 13 Deliberation) before promotion.

## Stage A execution plan <!-- section:stage-a-plan type:context -->

Detailed, ordered work plan for the sync content (recorded 2026-08-17). Each step becomes one or more pipeline tasks linked to its family section; steps run as sequential batches respecting the dependency order from Investigation outcome. All implementation happens in the isolated checkout registered as a temporary pipeline project (`openclaw-upstream-sync`, no deploy, no npm link, no production post-impl, autocommit off). Production fork stays untouched throughout Stage A.

### A0 — baseline re-verification (complete 2026-08-17)

- Target base is the tagged upstream release **`v2026.8.1-beta.2`**, not random `upstream/main`. Isolated branch: `sync/stable-v2026.8.1-beta.2` in `~/Projects/openclaw-upstream-sync-20260809-180149`.
- Retained baseline (WhatsApp plugin-only, login normalization, Deliberation + SecretRef/build/docs, Swabble ignore) was replayed onto the tag as commit `6c40f6813`. Three small conflicts were resolved: two generated plugin-document counts/entries and one obsolete WhatsApp `EchoTracker` import; no semantic conflict in retained behavior.
- Node was upgraded globally from 25.6.1 to official arm64 **25.9.0** because beta.2 requires `>=25.9.0`. SHA-256 was verified; previous global links are backed up at `~/.local/share/node-versions/global-links-20260817-150447`. Production `openclaw doctor` completed with exit 0 under Node 25.9.0 (existing TaskFlow warnings only); production Gateway was not restarted.
- Frozen install completed with pnpm 11.15.1. Focused baseline suites pass on beta.2: **WhatsApp 78/78; Deliberation 109/109**.
- The checkout is registered as temporary pipeline project `openclaw-upstream-sync`: no deploy, no npm link, no production post-implementation, autocommit off.

### A1 — close the audit-gap BLOCKED families (complete 2026-08-17)

Sequential batch `stage-a1-blocked-family-audits-20260817` completed all three investigations and the follow-up Family 2 removal:

1. `calm-crag-2866` — **Family 1 local hygiene:** verdict `DROP`; root `Swabble/` ignore was obsolete. The entry was removed directly and the resulting `.gitignore` verified equivalent to the target tag.
2. `wild-crag-6323` — **Family 2 WhatsApp plugin-only:** reconstructed the 24-row precedence/claim/fallback table and established that the customization was old Deliberation integration glue. Michal approved `DROP/DEFER`; follow-up `wild-brook-0745` removed it from OpenClaw Next.
3. `dark-dune-3768` — **Family 3 login normalization:** produced the malformed/sensitive-result matrix. Although the guard handled malformed results, it was WhatsApp-only, incomplete for redaction, and unnecessary while WhatsApp is disconnected. Michal approved `DROP/DEFER`; follow-up `wild-reef-4110` removed it from OpenClaw Next.

Families 1–3 are no longer blocked. Their reports remain design evidence for any future WhatsApp reactivation.

### A2 — operator decisions (Michal, recorded in this proposal)

This sync does not reopen product behavior. Its rule is to preserve the currently deployed fork semantics and adapt them mechanically to the new upstream lifecycle. A deviation is allowed only where current upstream makes the old behavior impossible or unsafe; such a conflict must be surfaced separately rather than decided implicitly during the port.

Recorded compatibility decisions:

- **DECIDED 2026-08-17 — global unbound-claim precedence (Family 4):** preserve current production semantics while adapting them to the new dispatch lifecycle. After dedupe and upstream lifecycle/admission/abort guards, run any binding-targeted owner claim first; then run the global broadcast `inbound_claim` used by Deliberation; only an unhandled global claim falls through to recognized command processing and normal agent dispatch. A handled global claim suppresses OpenClaw agent dispatch while preserving `message_received` observability. This is a compatibility port, not a new precedence model.
- **Family 13 Deliberation:** preserve the existing deployed fail-closed/fallback behavior exactly; do not broaden or narrow it as a product decision during this sync. First reconstruct that behavior from the retained implementation and tests, then map it onto the upstream lifecycle. Escalate only a concrete incompatibility or safety regression.
- **Family 7 channel profile settings:** preserve existing deployed requirements and precedence; do not redesign them during this sync. Reconcile only API/representation changes required by upstream.
- **Outbound Deliberation:** preserve its currently inactive state for this sync.
- Any conscious exclusion of a still-blocked family requires an explicit separate decision.

### A3 — SecretRef end-to-end audit (Family 12)

One audit task: source/runtime/doctor/redaction/non-persistence across the current canonical credential registry, generated matrix, docs, source-checkout fixtures, and Deliberation config. Gate for Family 13.

### A4 — record READY no-port decisions (Families 5, 6, 9, 14)

Single documentation task: mark cron trajectory suppression, queued trajectory writer, cron failure marker as no-port; classify historical evidence retention. No code.

### A5 — independent adaptation implementations (after A1/A2 close their inputs)

Sequential implementation tasks in the isolated checkout, each with its family compatibility gate as acceptance:

1. **Family 10 speech-core proof:** package export resolution test, build DTS/export gate, clean-checkout plugin boot smoke. Evidence-only unless a failure appears.
2. **Family 7 channel authority:** scenario table (existing session, fresh session, explicit override, default change, stale config, unavailable provider/model, status display, rollback migration) + read-only migration preview of the real production config shape. `modelByChannel` remains sole model authority; never restore `runtimeByChannel[*][*].model`.
3. **Family 8 reasoning effort:** canonical thinking transport replacing raw `params.reasoningEffort`; source-to-wire mapping tests for supported and unsupported providers. Depends on Family 7 authority decision.

### A6 — inbound claim adaptation (Family 4; A2 placement decided)

Adapt the existing production global unbound claim semantics to the current upstream dispatch lifecycle. Preserve this order: dedupe and lifecycle/admission/abort guards → binding-targeted owner claim → global broadcast claim → recognized commands and normal agent dispatch on unhandled outcome. Preserve `message_received` observability for handled global claims. Add abort/timeout handling, reply delivery, dedupe settlement, operation finalization, deterministic claimant ordering, binding-owner exclusivity, and host-authoritative `provider`/`eventType`/`eventKind`. Implementation proof per the family gate (reply delivery, dedupe replay, fast/plugin commands, source-policy fallback, observations, handler timeout/error, source abort, media-only intake, lifecycle completion).

### A7 — Deliberation reclassification and adaptation (Family 13; requires A3 + A6)

Work through the nine sub-contracts against the target tree; for each: current upstream API, unchanged KM consumer expectation, adaptation needed, focused test. Core/Discord changes require proof that the generic plugin API cannot supply the required datum. Outbound sender stays inactive.

### A8 — WhatsApp family disposition (complete 2026-08-17)

No WhatsApp adaptation is carried into OpenClaw Next. Michal approved `DROP/DEFER` for both Family 2 (`plugin-only` delivery policy) and Family 3 (partial login normalization); their retained deltas were removed from the isolated checkout. Investigation reports are retained as evidence. If WhatsApp is re-enabled, delivery ownership and the complete login/QR error boundary—including redaction—must be designed against then-current upstream and Deliberation contracts.

### A9 — generated metadata regeneration (Family 11; last code step)

Only after all source families above are approved: regenerate from clean canonical sources on the target base, require an idempotent second run, semantic diff review. Never copy the old generated blob.

### A10 — integrated verification (Stage A exit)

- Full build including DTS/export gates; focused suites of every touched family; generated-file consistency; doctor against a copied/sanitized production config; clean-checkout plugin boot; `git diff --check`.
- Cross-family interaction spot-checks from the synthesis list (claims × WhatsApp policy × fallback; Deliberation × SecretRef × doctor; model authority × reasoning effort × session override).
- Commit the sync branch content with per-family commits; push branch + backup refs to origin. No touch of `main`, no link, no restart.
- Record a Stage A closure note per family in this proposal. Then Stage B soak can start (canary boots this branch).

### Stop conditions

Inherit the Investigation outcome stop conditions: stop dependent implementation while any required family is blocked; no implementation around blocked nodes; no metadata regeneration before source families close. Any semantic-loss finding in A6/A7 reopens the family verdict instead of being patched around.
