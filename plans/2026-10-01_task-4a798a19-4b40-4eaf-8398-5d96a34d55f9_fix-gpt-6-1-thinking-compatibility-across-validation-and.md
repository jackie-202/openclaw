# Plan 2026-10-01: Fix GPT-6.1 thinking compatibility

_Status: DRAFT_

## Progress

- [x] Initialize canonical plan
- [x] Research code and docs
- [x] Review relevant learnings
- [x] Finalize implementation and TDD steps

## Problem

The protected installed-model registration flow cannot express complete reasoning metadata, leaving GPT-6.1 catalog capabilities inconsistent with its declared thinking levels. Plan a fail-closed contract expansion that drives Gateway profile and session validation from truthful shared metadata.

## Analysis

### Codebase context

- `src/config/types.models.ts` and `packages/model-catalog-core/src/model-catalog-types.ts` define the canonical model and compat metadata shape, including `reasoning`, API, input, cost, context/max tokens, supported effort list, and OpenAI API values.
- `src/agents/openai-reasoning-effort.ts` resolves model effort capabilities from compat metadata and has OpenAI effort fallback behavior; `src/agents/openai-reasoning-effort.test.ts` covers explicit efforts and disabled/off semantics.
- `src/gateway/sessions-patch.ts` validates patched thinking levels through the shared model catalog; `src/gateway/sessions-patch.test.ts` already proves GPT-6.1 rejects `off` and accepts a declared effort.
- Repo search did not locate `km-system/scripts/model-ops.py` or the `model_ops_register_installed_model` implementation in this fork. Keep scope fork-only; first locate the protected registration owner in the available fork surfaces. If it is external/absent, stop and request that capability be brought into the fork rather than editing another repository or inventing a bypass.
- Existing task plan `plans/tasks/2026-09-07_model-ops-supported-bounded-model-configuration-runtime-capa.md` defines the protected Model Ops authorization boundary and invariants: narrowly scoped model catalog edits, exact approval/digest, drift rejection, and no general config mutation.

### Relevant documentation

- `docs/reference/test.md`: use `pnpm test <path>` for scoped Vitest runs and changed checks for lane/type/lint/guard validation.
- Scoped guides: `src/agents/AGENTS.md` requires lightweight runtime-free focused tests; `src/gateway/AGENTS.md` documents Gateway test practices; `scripts/AGENTS.md` requires repo wrappers rather than raw Vitest.

### Knowledge base

- `learnings/architecture/2026-07-28_external-contract-gates-precede-behavioral-tdd.md`: establish the existing external/runtime contract before behavior-driven changes.
- `learnings/architecture/2026-07-24_retired-config-keys-need-explicit-validation.md`: reject unsupported config metadata explicitly rather than silently accepting it.
- `learnings/architecture/2026-07-24_centralize-configuration-authority-behind-one-resolver.md`: preserve a single authority for configuration resolution.
- Recall search used local fallback (`openclaw-fork-learnings` collection unavailable); selected notes have sparse extracted content. The task-specific Model Ops contract above is the concrete guardrail.

## Solutions

Extend only the protected registration schema/validator and plan/apply normalization to accept a closed, typed subset of canonical model metadata. Reuse existing config/model types and strict schemas; keep provider authentication, endpoint, headers, runtime parameters, and unknown fields forbidden. Preserve approval digest, immutable projection, duplicate detection, drift checks, and existing removal behavior. Feed the registered definition through the normal catalog/profile path so Gateway and OpenAI payload mapping consume the same effort list; do not add model-id or channel exceptions.

## Implementation

### Pre-implementation checklist

- [ ] Confirm the registration tool implementation and tests exist within the fork; if not, stop for an ownership/scope prerequisite.
- [ ] Trace registration plan -> approval/apply -> config/catalog materialization -> provider thinking profile -> `sessions.patch` and OpenAI effort mapping.
- [ ] Keep model API metadata and protected config policy aligned with canonical types and strict schema.

### Steps

1. Add a failing registration plan/apply test for a complete GPT-6.1 model envelope, plus table-driven malformed, unknown, sensitive/auth, duplicate, immutable-field, and config-drift rejections. Assert existing registration/removal/approval behavior remains unchanged.
2. Add failing resolver/profile and session patch coverage proving `low|medium|high|xhigh|max` works and undeclared `off` fails for GPT-6.1; retain non-reasoning and off-capable controls.
3. Add failing OpenAI mapping coverage proving declared GPT-6.1 `high` maps to the provider effort and unsupported `off` is omitted/rejected according to the current established contract. Avoid changing unrelated model-family defaults.
4. Implement the narrow registration contract and shared catalog/profile mapping. Run RED/GREEN cycles and record outcomes in `plans/checkpoints/task-4a798a19-4b40-4eaf-8398-5d96a34d55f9.red-green-proof.md`.
5. Run focused suites, then changed-surface type/lint/build checks required by the files changed; no live provider requests or Gateway restart.

## Files to Modify

| File                                                                                                                                 | Planned change                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Protected model-ops registration source + colocated test (exact fork path to be identified; currently absent from repository search) | Narrow accepted metadata envelope, closed validation, plan/apply regression cases.                                                 |
| `src/agents/openai-reasoning-effort.test.ts`                                                                                         | GPT-6.1 declared effort mapping and unsupported effort behavior.                                                                   |
| `src/gateway/sessions-patch.test.ts`                                                                                                 | Ensure complete resulting catalog metadata allows `high` and rejects `off`; preserve current neighboring compatibility assertions. |
| Shared catalog/profile implementation and tests (only if tracing shows metadata is dropped; exact owner to determine before edits)   | Preserve supported effort set and thinking map from canonical registered model through profile generation.                         |

## TDD

Implement RED/GREEN per `skill:tdd`. Start by adding failing tests before production edits. Focused command:
`pnpm test src/agents/openai-reasoning-effort.test.ts src/gateway/sessions-patch.test.ts`

Registration test must be added beside the located protected registration owner; its path and exact command depend on finding that code in the fork. A minimal existing-surface RED skeleton for the Gateway contract:

```ts
test("accepts high and rejects undeclared off for GPT-6.1", async () => {
  const loadGatewayModelCatalog = async () => [
    {
      provider: "openai",
      id: "gpt-6.1-sol",
      name: "GPT-6.1 Sol",
      reasoning: true,
      compat: {
        supportsReasoningEffort: true,
        supportedReasoningEfforts: ["low", "medium", "high", "xhigh", "max"],
      },
    },
  ];
  const cfg = {
    agents: { defaults: { model: { primary: "openai/gpt-6.1-sol" } } },
  } as OpenClawConfig;
  const high = await runPatch({
    cfg,
    patch: { key: MAIN_SESSION_KEY, thinkingLevel: "high" },
    loadGatewayModelCatalog,
  });
  expect(expectPatchOk(high).thinkingLevel).toBe("high");

  const off = await runPatch({
    cfg,
    patch: { key: MAIN_SESSION_KEY, thinkingLevel: "off" },
    loadGatewayModelCatalog,
  });
  expectPatchError(off, 'thinkingLevel "off" is not supported');
});
```

| Test                             | RED                                                                | GREEN                                                                                 |
| -------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| Registration complete metadata   | Plan/apply rejects or drops canonical metadata                     | Accepted metadata survives exact approved apply and is visible in catalog             |
| Registration fail-closed guards  | Add specific inputs exposing acceptance/drift/immutable regression | Each malformed, unknown, sensitive, duplicate, drifted, or immutable mutation rejects |
| GPT-6.1 session profile skeleton | Fails while profile/catalog cannot expose requested level          | `high` patch succeeds; `off` patch fails                                              |
| OpenAI mapping                   | Declared `high` cannot resolve/map through effort helper           | `high` preserved; undeclared `off` remains omitted/rejected                           |

## Dependencies

- The protected registration implementation must be available in this fork for the registration portion; no out-of-repo edits are in scope.
- Use existing canonical OpenClaw model metadata schema/types and authenticated Model Ops approval pathway; do not alter config/session state directly.

---

_Created: 2026-10-01_
_Status: DRAFT_
