---
{
  "tdd":
    {
      "decision": "required",
      "reason": "The repair must demonstrate the actual declaration compiler failure before the type correction and a passing result afterward; relevant uncovered reasoning behavior also needs causal characterization.",
    },
}
...

# Plan

## Analysis

- Check the canonical catalog compat declaration, shared thinking entry type, implementation callers, provider-thinking contracts, and existing adjacent tests before editing.
- Confirm the missing compat property is optional and catalog-authorized; determine contextual array type needed to reinsert `off` without changing results.
- Preserve reasoning-disabled off-only behavior, provider-authoritative and binary profiles, catalog opt-out precedence, and valid, invalid, and empty effort handling.

## Approach

- Make the smallest coherent correction at the actual owning type and inference boundary; avoid casts, suppressions, policy changes, or compiler/build bypasses.
- Add behavioral characterization only for a relevant contract not already covered by existing tests.

## Implementation

1. Capture fresh causal RED at the exact declaration command before source edits; capture focused behavioral RED only for newly added characterization.
2. Correct `ThinkingCatalogEntry["compat"]` to express the canonical optional contract and contextually type the mapped effort options so authorized `off` is accepted.
3. Run focused verification, inspect the complete diff against provider/catalog contracts, and record exact outcomes and source-versus-runtime limits.
4. Perform independent acceptance against the task criteria: inspect the final source/types/tests and verification evidence; confirm every policy invariant and that no prohibited build, deployment, installation, or runtime operation occurred. Record acceptance separately from implementation proof.

## Testing

- Reproduce RED and then GREEN with `node scripts/run-tsgo.mjs -p tsconfig.plugin-sdk.dts.json --declaration true`.
- Run `pnpm test src/auto-reply/thinking.test.ts src/auto-reply/thinking.shared.test.ts` only for files that actually exist; do not invent a missing test file.
- Select file-scoped formatting/lint and changed-lane checks using repository testing guidance; report blocked prerequisites distinctly.
- Do not run `pnpm build`, broad/full suites, installation, deployment, or runtime probes. The declaration command is the narrow compile oracle, not proof of complete build or deployed behavior.

## TDD

- Decision: `required`. This repair addresses actual compiler failures and requires a fresh causal RED at the failing declaration boundary followed by GREEN; focused behavior characterization must also use RED/GREEN when existing tests do not already cover the specified policy.

## Files

- `src/auto-reply/thinking.shared.ts` — align the shared compat input declaration with the canonical optional catalog contract if confirmed by source inspection.
- `src/auto-reply/thinking.ts` — correct profile-array contextual typing while preserving its returned options and policy.
- Existing adjacent thinking tests — add only missing behavioral characterization; do not create a test file solely because the task names one.
- Another owner type or test file — touch only if contract inspection proves it is the correct owner and explain that boundary in the implementation record.

## Progress

- [x] Read prior rejected plan and incorporate its missing independent-acceptance requirement.
- [ ] Inspect canonical contracts and existing tests; capture causal RED before implementation.
- [ ] Apply bounded type correction and run scoped verification.
- [ ] Complete independent acceptance and report exact evidence and limits.
