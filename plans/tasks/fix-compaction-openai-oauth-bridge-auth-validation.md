# Fix compaction OpenAI OAuth/bridge provider-auth validation

## Context

Normal OpenAI operation through the local bridge was repaired by adding a placeholder API key required by the OpenClaw SDK during provider initialization. Real authentication remains OAuth through the local bridge, and the placeholder must never be sent to OpenAI. After build and Gateway restart, verification session `46e7c0f4-68a9-402d-ac0e-8cbf440888e5` returned `AUTH_OK`.

Compaction still fails earlier on a distinct path. Its strict provider-auth validation compares auth profile `openai:default = oauth` with `openai/openai-completions` and aborts before the existing bridge/placeholder initialization logic can apply:

> Auth profile "openai:default" uses oauth auth, but openai/openai-completions requires an OpenAI API key profile.

This is the same auth mismatch, but the previous repair covered only ordinary provider initialization. The current build does not cover compaction.

## Objective

Extend the existing OpenAI local-bridge/placeholder-auth compatibility to compaction and its provider-auth validation without weakening validation for genuine direct OpenAI API-key use or leaking the placeholder credential upstream.

## Scope boundary

Work only in the `openclaw-fork` repository. Do not inspect or modify runtime configuration under `~/.openclaw`, the local bridge repository, or other projects. Treat the facts above and verification session ID as supplied evidence. Record any external unknown as a follow-up instead of crossing repository boundaries.

## Requirements

1. Locate the compaction/provider-auth path that rejects the OAuth profile before provider initialization.
2. Characterize the current behavior with focused tests before changing production behavior, including:
   - the failing OpenAI OAuth + local bridge/placeholder-compatible case;
   - ordinary direct OpenAI API-key profiles;
   - incompatible auth/provider combinations that must still fail closed;
   - assurance that a placeholder key is not treated as the real upstream OpenAI credential or leaked to OpenAI.
3. Reuse or centralize the existing provider initialization compatibility rule rather than creating a second divergent exception.
4. Make compaction accept the same valid local bridge/OAuth arrangement already accepted by ordinary operation.
5. Keep error messages actionable for unsupported combinations.
6. Avoid unrelated refactors and configuration changes.

## Acceptance criteria

- Compaction no longer raises the quoted OAuth-vs-API-key error for the supported local bridge/OAuth arrangement.
- Normal OpenAI provider initialization and compaction use one coherent auth-compatibility policy.
- Direct API-key authentication remains valid.
- Unsupported auth/provider combinations remain rejected before network use.
- Tests prove the placeholder cannot become an upstream credential.
- Relevant focused tests and the smallest suitable broader test suite pass.
- The final note lists changed files, exact verification commands/results, and any residual runtime verification required after deployment.

## Verification

Run focused unit/integration tests for provider auth and compaction, then the smallest relevant broader suite available in the repository. Build the project if that is the repository-standard gate. Do not restart or deploy the Gateway from the coding task; report the exact post-build runtime verification needed for the operator.
