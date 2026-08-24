# Plan 2026-08-20: Fix compaction OpenAI OAuth/bridge provider-auth validation

_Status: DRAFT_
_Created: 2026-08-20_

## Progress

- [x] Phase 0: Config + Init
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Analysis

### Codebase context

- `src/agents/model-auth.ts`: shared provider-auth boundary. `resolveApiKeyForProvider()` validates an explicit profile before local synthetic auth; `hasSyntheticLocalProviderAuthConfig()` and `resolveSyntheticLocalProviderAuth()` already identify configured local OpenAI-compatible endpoints and return `CUSTOM_LOCAL_AUTH_MARKER`. `applyLocalNoAuthHeaderOverride()` clears `Authorization` for that marker.
- `src/agents/embedded-agent-runner/run/auth-controller.ts` and `src/agents/embedded-agent-runner/run.ts`: ordinary turns resolve auth through `getApiKeyForModel()` and apply the same local no-auth header override before SDK use.
- `src/agents/embedded-agent-runner/compact.ts`: compaction calls `getApiKeyForModel()` with the carried `authProfileId`; the explicit OAuth profile is rejected before `prepareProviderRuntimeAuth()` and before the existing header override runs.
- `src/agents/harness/compaction.ts`: harness-owned compaction also resolves credentials through `getApiKeyForModel()`, so fixing the shared resolver avoids a second compaction exception.
- `src/agents/model-auth.profiles.test.ts`: owns strict OpenAI OAuth-vs-direct-API validation and incompatible profile assertions.
- `src/agents/model-auth.test.ts`: owns synthetic local marker selection, remote/direct fail-closed cases, and marker/header behavior.
- `src/agents/embedded-agent-runner/compact.hooks.test.ts`: focused mocked compaction composition test surface; use one assertion to prove the compaction caller receives/stores the shared marker rather than an OAuth access token.
- Scoped rules: `src/agents/AGENTS.md` and `src/agents/embedded-agent-runner/run/AGENTS.md` require narrow helper tests before expensive full-runner coverage.

### Relevant documentation

- `docs/concepts/compaction.md`: built-in compaction uses the active model unless overridden and runs through the embedded model pipeline.
- `docs/providers/openai.md`: distinguishes direct OpenAI API-key routes from OAuth/Codex routes; no documentation change is expected for this fork-local bridge repair.
- `docs/auth-credential-semantics.md`: selection-time and runtime credential eligibility must remain aligned and unsupported combinations must fail closed.

### Knowledge base

- `learnings/architecture/2026-07-28_residue-audits-require-activation-proof.md`: trace runtime callers rather than relying on string matches, and keep repository-external behavior as an explicit unknown instead of crossing the scope boundary.
- `learnings/architecture/2026-07-29_acceptance-fix-plans-must-close-contract-gates-explicitly.md`: require a genuine focused RED before production edits and fresh GREEN evidence afterward.
- Recall used local fallback (`openclaw-fork-learnings` QMD collection missing); the remaining returned files contained no substantive auth/compaction guidance beyond their titles.

## Available Skills

- `tdd`: implementation must record RED/GREEN evidence for the resolver regression before production edits.
- `openclaw-testing`: choose focused auth/compaction tests, the smallest broader lane, and the build gate.
- `autoreview`: mandatory fresh pre-handoff review for non-trivial code changes.
- `validate-implementation`: check the completed change against repository architecture and task acceptance criteria.
- `save-learning`: save implementation-session findings as the final action.

## Solution

Normalize selected auth through one model-compatibility rule in `src/agents/model-auth.ts`: keep compatible API-key auth unchanged; when an OAuth/token profile conflicts with direct-OpenAI transport but the configured provider qualifies for existing synthetic local auth, substitute `CUSTOM_LOCAL_AUTH_MARKER`; otherwise retain the actionable API-key-profile error. Do not add a compaction-only exception or forward the OAuth token/marker as bearer auth.

## Implementation

1. Use `skill:tdd` to add the local OpenAI bridge + explicit OAuth profile regression and capture the current quoted failure as RED.
2. Refactor the current boolean/assert auth-mode checks into one narrow resolver that returns the selected auth unchanged, substitutes existing synthetic local auth, or rejects the unsupported combination. Apply it to explicit and per-entry selected-profile branches; verify the existing synthetic-auth availability checks remain aligned.
3. Preserve precedence: direct OpenAI API-key profiles remain valid; remote/public OpenAI OAuth with `openai-completions`/`openai-responses` remains rejected; unrelated provider/profile incompatibilities retain their existing errors.
4. Extend the compaction harness mocks/test to prove `authProfileId: "openai:default"` reaches shared resolution, the compact run stores the synthetic marker, and the effective model carries `Authorization: null` rather than the OAuth access token or `Bearer custom-local`.
5. Keep existing `applyLocalNoAuthHeaderOverride()` and `applyAuthHeaderOverride()` as the request-boundary protection; strengthen their regression coverage for provider `openai` if the new end-to-end resolver assertion does not cover both functions.
6. Do not change config, docs, Gateway lifecycle, or bridge code. Record repository-external header observation as operator follow-up.
7. Run `skill:autoreview` until no accepted/actionable findings remain, then `skill:validate-implementation` before handoff.

## Files to Modify

| File                                                        | Change                                                                                                                    |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `src/agents/model-auth.ts`                                  | Centralize model/auth compatibility and substitute existing synthetic local auth only for qualifying local bridge config. |
| `src/agents/model-auth.profiles.test.ts`                    | Add RED/GREEN coverage for local bridge OAuth substitution plus direct API-key and fail-closed profile behavior.          |
| `src/agents/model-auth.test.ts`                             | Strengthen marker/header non-leakage coverage only if not fully proved in the profile regression.                         |
| `src/agents/embedded-agent-runner/compact.hooks.harness.ts` | Export/configure narrow auth and header mocks for compaction proof.                                                       |
| `src/agents/embedded-agent-runner/compact.hooks.test.ts`    | Prove compaction consumes the shared marker policy and never uses OAuth/placeholder as upstream bearer auth.              |

No production change is expected in `src/agents/embedded-agent-runner/compact.ts`; it already calls the shared resolver and applies the header override.

## TDD

Implement the cycle with `skill:tdd`; save RED/GREEN evidence to `plans/checkpoints/bold-brook-8179.red-green-proof.md`.

**Test file:** `src/agents/model-auth.profiles.test.ts`  
**Run command:** `pnpm test src/agents/model-auth.profiles.test.ts`  
**Edit:** add `CUSTOM_LOCAL_AUTH_MARKER`, `applyAuthHeaderOverride`, and `applyLocalNoAuthHeaderOverride` imports, then append inside `describe("getApiKeyForModel")`.

```ts
it("uses synthetic local auth for an OpenAI bridge despite a carried OAuth profile", async () => {
  const cfg = {
    models: {
      providers: {
        openai: {
          baseUrl: "http://127.0.0.1:18800/v1",
          api: "openai-completions",
          models: [{ id: "gpt-5.5" }],
        },
      },
    },
  } as OpenClawConfig;
  const model = {
    id: "gpt-5.5",
    provider: "openai",
    api: "openai-completions",
    baseUrl: "http://127.0.0.1:18800/v1",
  } as Model;
  const auth = await getApiKeyForModel({
    model,
    cfg,
    profileId: "openai:default",
    lockedProfile: true,
    store: {
      version: 1,
      profiles: {
        "openai:default": { type: "oauth", provider: "openai", ...oauthFixture },
      },
    },
  });

  expect(auth).toMatchObject({ apiKey: CUSTOM_LOCAL_AUTH_MARKER, mode: "api-key" });
  expect(auth.apiKey).not.toBe(oauthFixture.access);
  const requestModel = applyAuthHeaderOverride(
    applyLocalNoAuthHeaderOverride(model, auth),
    auth,
    cfg,
  );
  expect(requestModel.headers?.Authorization).toBeNull();
});
```

| Test                                           | RED                                                            | GREEN                                                                                       |
| ---------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Local OpenAI bridge with carried OAuth profile | Throws `requires an OpenAI API key profile` before assertions. | Returns `CUSTOM_LOCAL_AUTH_MARKER`, never returns OAuth access, and clears `Authorization`. |

Preserve and rerun existing direct/public assertions: `keeps OpenAI OAuth profiles on the Codex transport and API keys on direct OpenAI`, `rejects an explicit OpenAI OAuth profile for direct OpenAI Platform models`, incompatible per-entry profile tests, and synthetic-marker header tests.

## Verification

1. RED/GREEN: `pnpm test src/agents/model-auth.profiles.test.ts`
2. Focused composition: `pnpm test src/agents/model-auth.test.ts src/agents/embedded-agent-runner/compact.hooks.test.ts`
3. Small broader auth/compaction suite: `pnpm test src/agents/model-auth.profiles.test.ts src/agents/model-auth.test.ts src/agents/model-provider-auth.test.ts src/agents/embedded-agent-runner/compact.hooks.test.ts src/agents/embedded-agent-runner/compaction-runtime-context.test.ts`
4. Changed-surface gate selected with `skill:openclaw-testing`: `pnpm check:changed`
5. Build: `pnpm build`
6. Operator-only after deployment: restart the Gateway, trigger `/compact` in the same local-bridge/OpenAI-OAuth arrangement, confirm summary success without the quoted auth error, send the ordinary `AUTH_OK` probe, and verify sanitized bridge/upstream request evidence contains neither the OAuth access token nor `custom-local` as an OpenAI bearer credential.

## Dependencies

- OpenAI SDK `6.39.1` requires a constructor credential but supports explicit auth omission: `node_modules/openai/src/client.ts:325-330,520-563` and `node_modules/openai/src/internal/headers.ts:71-91` confirm `Authorization: null` removes generated bearer auth and passes validation.
- `src/llm/providers/openai-completions.ts:535-582` passes model headers as SDK `defaultHeaders`, so the existing override is the correct non-leakage boundary.
- Supplied session `46e7c0f4-68a9-402d-ac0e-8cbf440888e5` is accepted as ordinary-operation evidence; live bridge configuration and bridge source remain out of scope.
- No Codex protocol/runtime verdict is needed: this repair targets the OpenClaw `openai-completions` local bridge path, not the native Codex harness.

---

_Created: 2026-08-20_
_Status: DRAFT_
