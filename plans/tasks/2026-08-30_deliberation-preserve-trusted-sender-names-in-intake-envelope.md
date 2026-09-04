---
title: Deliberation intake: preserve trusted sender names for People Intel identity resolution
type: implementation
---

# Deliberation intake: preserve trusted sender names for People Intel identity resolution

## Problem

The Deliberation ingress contract currently preserves only a normalized source target and opaque `senderId`. For a real Discord inbound event, trusted OpenClaw metadata has all of:

- provider `discord`
- account `default`
- sender ID `1276273857921024073`
- display name `Michal876876`
- username/tag `michal876876`

Only `senderId` reaches the KM spool. This prevents People Intel from using its designed textual-indicator resolution path when a stable provider mapping is absent, stale, migrated, or represented differently in the identity registry.

## Objective

Extend the OpenClaw Deliberation intake/envelope contract to carry bounded, trusted sender identity hints from channel-native inbound metadata into the KM listener without changing source-target routing or treating human-readable aliases as authoritative provider IDs.

## Required changes

1. Inspect the current channel-to-Deliberation intake boundary and identify the canonical trusted fields for sender display name, username, tag, or channel-provided aliases across supported providers.
2. Extend the versioned Deliberation intake contract with a bounded optional sender identity-hints object. It must distinguish the opaque provider sender ID from human-readable indicators. Suggested semantics:
   - `senderId`: existing opaque provider identity, unchanged;
   - `senderDisplayName`: optional normalized display label;
   - `senderUsername`: optional normalized provider username/handle;
   - `senderAliases`: optional bounded deduplicated list only when the provider exposes additional trusted aliases.
3. Populate those fields from trusted inbound context, not from user-authored message text, quoted envelopes, or model inference.
4. Normalize and bound values deterministically: trim surrounding whitespace, reject empty/control-character values, deduplicate case-insensitively where appropriate, and enforce conservative per-value/count/serialized-size limits.
5. Preserve backward compatibility for events where the channel provides only `senderId`; all new fields remain optional.
6. Carry the fields through synthetic intake/test seams and listener requests without changing source identity, routing, dedupe, or delivery-target semantics.
7. Update the canonical generated/versioned Deliberation contract artifacts using the repository's existing generation/provenance workflow.
8. Add focused contract and adapter tests using a real-shape Discord example (`senderId=1276273857921024073`, display name `Michal876876`, username/tag `michal876876`) and at least one missing-hints case.

## Scope boundary

Modify only `openclaw-fork` Deliberation/channel intake, versioned contract artifacts, and focused tests. Do not implement People Intel resolution, edit identity registry/profile data, modify KM drafting/reviewer policy, or add delivery behavior. Do not parse free-form message text for identity hints.

## Acceptance criteria

- A Discord event with trusted sender metadata reaches the Deliberation listener request with the opaque ID plus bounded display-name/username indicators.
- No sender indicator is sourced from user-controlled envelope text.
- Missing display-name/username fields remain valid and preserve current behavior.
- Existing source-target, idempotency, replay, and delivery routing behavior is unchanged.
- Canonical contract generation/provenance verification passes.
- Focused Deliberation intake/contract tests pass.
- Final note documents exact source fields used for every supported indicator and the serialized contract shape consumed by KM.

## Verification

- Run focused Deliberation ingress, contract, normalization, and adapter tests.
- Run canonical contract generation/provenance verification.
- Inspect a synthetic Discord intake payload and prove the KM request contains trusted names while message body spoofing does not alter them.
- Inspect the final diff for unrelated routing or delivery changes.
