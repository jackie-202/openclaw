# Per-source deliberation pipelines with source-default delivery

## Vision <!-- section:vision type:context -->

Deliberation musí podporovat více nezávislých komunikačních toků. Každý tok je explicitní pár `source → target`, nikoli položka v globálním seznamu zdrojů sdílejících jediný výstupní cíl.

Hlavní případ použití je bezpečně přijímat konverzaci ze zvoleného Slack kanálu, zabránit běžné Jackie odpovědi v tomto source kanálu, zpracovat ji přes stávající deliberation/KM lifecycle a doručit výsledek buď na explicitní cíl, nebo zpět do původního source.

## Current Problem <!-- section:current-problem type:context -->

Současná konfigurace používá globální `sources[]` a nejvýše jeden globální `deliveryTarget`. Jednotlivé source kanály proto nelze mapovat na různé cíle. Když `deliveryTarget` chybí, konfigurace navíc nevyjadřuje požadované pravidlo „odpověz zpět do source“.

Aktuální live konfigurace má jeden Discord source, globální Discord `processingSource` a žádný `deliveryTarget`. Nově připojený Slack má sloužit nejprve jako source-only pilot, ale cílové chování musí být obecné, explicitní a auditovatelné.

## Configuration Model <!-- section:configuration-model type:context -->

Nahradit top-level `sources[]` a globální `deliveryTarget` polem `pipelines[]`:

```json5
{
  enabled: true,
  failClosed: true,

  pipelines: [
    {
      id: "slack-aplikace",
      source: {
        channel: "slack",
        accountId: "default",
        target: "<slack-channel-id>",
      },
      target: {
        channel: "discord",
        accountId: "default",
        target: "<discord-channel-id>",
        // threadId: "<optional-explicit-cross-provider-thread>",
      },
    },
    {
      id: "discord-existing",
      source: {
        channel: "discord",
        accountId: "default",
        target: "<discord-source-channel-id>",
      },
      // target omitted => deliver back to the original source context.
    },
  ],

  processingSource: {
    channel: "discord",
    accountId: "default",
    target: "<processing-channel-id>",
  },

  km: {
    /* existing configuration remains */
  },
  restrictedSessionKeys: ["<processing-review-session-key>"],
}
```

Rules:

- `pipeline.id` is required, unique and stable. It is used for audit/provenance and future per-pipeline evolution.
- `pipeline.source` owns inbound messages matching that route and preserves current fail-closed suppression of ordinary agent dispatch.
- `pipeline.target` is optional. When present, it is the immutable configured delivery destination.
- When `pipeline.target` is omitted, runtime derives the effective destination from the original inbound event: same provider, account, channel and original source thread context where applicable.
- Two pipelines must not declare the same canonical source route. Ambiguous ownership is a configuration error.
- `processingSource`, `km` and `restrictedSessionKeys` remain global infrastructure in this proposal. A single shared processing/review session is intentional: the current use case is one project, Mravenčí chůva, discussed by multiple people across multiple source channels, and Jackie should maintain one current deliberation context across those channels.
- Per-pipeline `processingSource` overrides are deliberately excluded; revisit only if independent projects or isolation boundaries are introduced later.
- The resolved `pipelineId` and effective delivery target are fixed early in the lifecycle and may not drift during reservation, invocation or completion.

## Thread Semantics <!-- section:thread-semantics type:context -->

Thread inheritance follows a narrow rule:

- When target is omitted and delivery returns to the same original source, always deliver in a thread anchored to the original source message. If the inbound message is already inside a thread, preserve that thread root; if it is a root/channel message, reply in a thread under that message rather than posting another root message.
- Any explicit target without `threadId` receives the result as a root message in the configured target channel, whether same-provider or cross-provider.
- Any explicit target with `threadId` receives the result in that explicitly configured thread.
- An explicit target never inherits or translates the source thread; the source message is not mirrored merely to manufacture a thread anchor in the target.
- Slack root and child timestamps retain their existing canonical source identity semantics; a child message keeps its provider event ID while its root thread timestamp selects source history.
- Existing intake semantics remain unchanged: every inbound message is a separate deliberation item, while messages in the same thread share the thread history context. This is recorded as a non-change constraint, not a feature of this proposal.

## Delivery and Safety Decisions <!-- section:delivery-safety type:context -->

- A configured deliberation source remains silent to normal Jackie dispatch. Successful intake returns handled; `before_dispatch` continues to fail closed when KM is unavailable, processing is paused, or intake fails.
- Slack outbound is no longer globally dormant once a pipeline without an explicit target can resolve back to a Slack source. It must be enabled only through the same immutable effective-target and sender controls used for Discord.
- No fallback rerouting is allowed. Delivery failure must not silently switch provider, channel or thread.
- The Slack channel allowlist remains separately managed and must include only explicitly activated source/target channels.
- Pilot activation is a distinct configuration/rollout step after implementation and verification, not part of the core contract change.

## Contract and KM Ownership <!-- section:contract-km -->

This is a cross-project contract change:

- `openclaw-fork` owns plugin configuration parsing, source-to-pipeline resolution, fail-closed routing, source-context target derivation, provider adapters and final delivery guards.
- `km-system` owns durable deliberation intake/spool lifecycle. It must persist and validate `pipelineId` and the resolved effective delivery target through ready, reservation, invocation, completion and receipt evidence.
- Shared wire fixtures/provenance evidence must remain synchronized. No side may infer a different target late in the lifecycle.
- The effective target is operator-controlled through the selected pipeline and authenticated source context; inbound message content cannot choose or override it.

## Slice 1: Contract and migration design <!-- section:slice-contract-migration -->

Define the versioned configuration and wire-contract transition across `openclaw-fork` and `km-system`:

- canonical `pipelines[]` schema and validation;
- required `pipelineId` provenance;
- effective-target derivation representation;
- compatibility/migration behavior for existing `sources[]` plus optional global `deliveryTarget`;
- deterministic rejection of duplicate source routes and invalid cross-provider thread inheritance;
- synchronized fixtures and contract evidence.

The implementation must choose an explicit migration strategy rather than silently accepting two competing authorities. Preferred direction: accept the legacy shape only for a bounded compatibility window, normalize it internally to one or more pipelines, reject mixed legacy/new shape, migrate live config, then remove legacy support in a separately identified cleanup condition.

## Slice 2: Per-pipeline intake and immutable target lifecycle <!-- section:slice-routing-lifecycle -->

Implement end-to-end selection of exactly one pipeline from an inbound source and carry its identity and effective destination through the deliberation lifecycle:

- route matching returns the selected pipeline, not merely source membership;
- normal dispatch remains suppressed for every configured pipeline source;
- explicit targets are fixed from configuration;
- omitted targets are derived from authenticated source context, including same-source thread identity;
- KM persists and validates `pipelineId` and effective target without late recomputation or drift;
- duplicates, stale evidence, malformed identity and contradictory targets fail closed.

## Slice 3: Provider delivery and source-default return <!-- section:slice-provider-delivery -->

Support final delivery to the immutable effective target:

- Discord and Slack adapters honor the same reservation/invocation/completion contract;
- source-default Slack delivery becomes possible only for a Slack pipeline whose target is omitted;
- explicit targets without `threadId` deliver as root messages, while explicit target threads require `threadId`;
- no provider fallback or second send is permitted;
- one deliberation item produces at most one provider attempt and one matching completion receipt.

Include focused unit/integration coverage for Discord→source, Slack→source, Slack→Discord, explicit same-provider targets, root/child thread behavior and all fail-closed negative paths.

## Slice 4: Live configuration migration and bounded Slack pilot <!-- section:slice-config-pilot -->

After the contract and runtime are deployed:

- migrate the existing Discord deliberation source into one explicit pipeline;
- preserve current global `processingSource`, KM credentials and restricted review session;
- add one Slack source pipeline only after its source channel is selected and the bot is invited;
- choose its target explicitly for the pilot, or omit target only if same-Slack-source delivery has been separately approved;
- update Slack channel allowlist narrowly;
- validate root, child reply, duplicate event and stale/invalid evidence cases;
- verify zero ordinary Jackie replies in source channels and exactly one final provider attempt for accepted work;
- retain an immediate disable/rollback path that keeps source traffic fail-closed.

Runtime configuration changes and Gateway restart require explicit operator approval at rollout time.

## Corrective Completion Plan <!-- section:corrective-completion type:context -->

The earlier corrective sequence coupled OpenClaw acceptance to another
repository's checkout, implementation files, and fixed scenario count. That
sequence is superseded.

OpenClaw acceptance now covers only OpenClaw-owned behavior: channel ownership,
intake and history adapters, public request/response validation, provider and
delivery behavior, package integrity, and local fail-closed cases. The local
gate derives its result set from those retained checks rather than preserving a
historical count.

The dependency is one-way. OpenClaw publishes the provider/channel hooks and
public adapter interface; an external orchestrator may depend on that interface.
Cross-repository end-to-end validation and implementation-level storage,
restart, reconciliation, and migration tests are caller-owned and must run in
the caller's repository. They are not prerequisites for OpenClaw build or
acceptance. Rollout remains separately approval-gated.

## Acceptance Criteria <!-- section:acceptance type:context -->

1. Configuration can express multiple independent source-target pipelines with stable unique IDs.
2. Each inbound source matches at most one pipeline; duplicate canonical sources are rejected.
3. Omitting target delivers to the authenticated original source, always in a thread: an existing source thread is preserved, while a root source message becomes the anchor of a new reply thread.
4. Explicit targets never inherit source threads implicitly: without `threadId` they deliver as root messages in the configured target channel, and with `threadId` they deliver into that explicitly configured thread.
5. Source channels remain silent to ordinary agent dispatch, including failure and disabled-processing paths.
6. The selected `pipelineId` and effective target are durably fixed before provider invocation and validated through completion.
7. Slack and Discord delivery have identical no-fallback, at-most-once and receipt requirements.
8. Existing live deliberation behavior has a documented migration path with no period of ambiguous dual authority.
9. Contract, plugin, KM integration and bounded live pilot evidence cover positive and fail-closed paths.
10. Rollout does not broaden Slack channel access beyond the selected pilot channel.

## Out of Scope <!-- section:out-of-scope type:context -->

- Per-pipeline model, prompt, reviewer or KM endpoint configuration.
- Multiple processing/review channels or per-pipeline processing overrides; `processingSource` remains intentionally global so one Mravenčí chůva context spans multiple people and channels.
- Dynamic targets selected from message content or by the model.
- Automatic thread mapping or creation for explicit targets, including manufacturing a target-side anchor by mirroring the source message.
- Fallback delivery to another provider or channel.
- Multiple matching pipelines for one source.
- Activating more than one Slack pilot source during initial rollout.

## Open Rollout Input <!-- section:open-rollout type:context -->

Before Slice 4, Michal must choose the initial Slack source channel and whether its pilot target is an explicit Discord destination or the original Slack source. This does not block contract and implementation work.
