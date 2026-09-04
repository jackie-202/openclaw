# Plan 2026-08-25: Fix Deliberation final-delivery KM request failure

Plan the minimum runtime and proof changes still missing after `swift-crag-1214`.

_Status: DRAFT_

## Progress

- [x] Phase 0: Config + init
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Analysis

### Codebase context

- `extensions/deliberation/src/km-client.ts` already carries closed operation/path/stage/status/code/cause metadata, but still concatenates a configured `/deliberation/v1` endpoint with the full canonical path and therefore duplicates the prefix.
- `extensions/deliberation/src/final-adapter.ts` already formats bounded KM warning metadata and preserves serialized ticks; retain this existing production change rather than reimplementing it.
- `extensions/deliberation/src/km-client.test.ts` and `extensions/deliberation/src/plugin.test.ts` already cover redacted diagnostics and retry behavior, but the prefix regression recorded in the parent proof is absent from the current test file.
- `plans/checkpoints/swift-crag-1214.red-green-proof.md` contains the genuine failing prefix/diagnostic RED and a historical GREEN, while acceptance reports that the supplied task-scoped artifacts omitted the production diff and concrete GREEN provenance.

### Relevant documentation

- `extensions/deliberation/contracts/km-wire-v1.json` fixes the six canonical paths and closed authentication/protocol/lifecycle contract.
- `docs/plugins/reference/deliberation.md` already documents safe final-delivery metadata; no further docs edit is needed unless implementation changes that contract.
- `extensions/AGENTS.md` keeps the correction inside the plugin and public SDK boundary.

### Knowledge base

- `learnings/tooling/acceptance-fix-needs-task-scoped-production-provenance.md`: preserve the historical RED, add the smallest owner-boundary production diff, and capture fresh GREEN under this follow-up task.
- `learnings/patterns/swift-crag-1214-diagnose-service-boundaries-with-closed-metadata.md`: warnings may expose only enum-backed operation/path/stage/status/code/cause fields.
- `learnings/patterns/swift-crag-1214-disprove-configuration-hypotheses-with-sanitized-live-probes.md`: do not widen the correction beyond the proven configured-prefix case.
- `learnings/runtime-errors/deliberation-listener-process-can-lag-owner-source.md`: do not weaken client validation to compensate for stale listener code.
- Recall used deterministic local fallback because QMD collection `openclaw-fork-learnings` was unavailable; unrelated empty auto-extracted learnings were discarded.

## Available Skills

- `compound-plan`: owns this document.
- `tdd`: preserve/import the parent RED and capture fresh GREEN evidence.
- `task-evidence`: recover exact parent proof provenance if acceptance tooling needs lineage evidence.
- `validate-implementation`: check the final diff against the accepted KM contract and project rules.
- `save-learning`: mandatory final implementation action; save at least one non-duplicative learning.

## Implementation

1. Use `skill:tdd` and the test below to confirm the current client duplicates the canonical prefix. Link the genuine parent RED from `plans/checkpoints/swift-crag-1214.red-green-proof.md`; do not fabricate a replacement RED for diagnostics already implemented.
2. In `createKmClient`, keep the configured endpoint pathname, but when it already ends in `/deliberation/v1`, append only the selected operation suffix. Preserve arbitrary parent prefixes such as `/api`, query handling for `ready`, SecretInput resolution, exact headers, timeouts, and closed response parsing.
3. Retain the existing `KmRequestError` operation/path/status/cause fields and `formatFinalDeliveryError` warning formatter. Verify they remain in the task outcome and do not expose endpoint authority, credentials, payload text, response bodies, or raw errors.
4. Run the focused GREEN command and record its timestamp, exact command, exit code, and output in `plans/checkpoints/warm-vale-8144.red-green-proof.md`, explicitly citing the parent RED artifact.
5. Run `pnpm tsgo:extensions`, `pnpm tsgo:extensions:test`, and `git diff --check`; then run fresh `skill:autoreview` and resolve accepted findings without changing reservation, destination, provider-attempt, completion, or unknown-outcome semantics.
6. Update `plans/checkpoints/warm-vale-8144.checkpoint.md` with task-scoped production/test/proof provenance. Invoke `skill:save-learning` last and save at least one non-duplicative learning.

## Files to Modify

| Path                                                  | Change                                                                                      |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `extensions/deliberation/src/km-client.ts`            | Avoid duplicating an already configured canonical API prefix.                               |
| `extensions/deliberation/src/km-client.test.ts`       | Restore the real request-path regression and preserve noncanonical parent prefixes.         |
| `extensions/deliberation/src/final-adapter.ts`        | Retain and verify the existing bounded warning implementation; avoid unrelated refactoring. |
| `extensions/deliberation/src/plugin.test.ts`          | Retain the existing warning redaction/retry regression.                                     |
| `plans/checkpoints/warm-vale-8144.red-green-proof.md` | Link historical RED and capture fresh concrete GREEN output.                                |
| `plans/checkpoints/warm-vale-8144.checkpoint.md`      | Record task-scoped implementation and verification provenance.                              |
| `learnings/**`                                        | Add the mandatory non-duplicative learning as the final action.                             |

## TDD

Implement the cycle according to `skill:tdd`. Reuse the genuine parent RED for the already-written diagnostic behavior and capture a current failing run for the still-missing prefix test before changing `km-client.ts`.

**Test file:** `extensions/deliberation/src/km-client.test.ts`  
**Framework:** Vitest with the real `createKmClient` URL construction  
**Run command:** `pnpm test extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/plugin.test.ts extensions/deliberation/src/final-adapter.test.ts -- --reporter=verbose`  
**Edit hint:** Append near the existing real Node transport test; reuse `parseDeliberationConfig`, `createServer`, `requestUrl`, and `validHealthResponse`.

```ts
it("does not duplicate the canonical API prefix from a configured endpoint", async () => {
  const fetchImpl = vi
    .fn()
    .mockResolvedValue(
      new Response(JSON.stringify({ protocolVersion: 1, items: [], nextCursor: null })),
    );
  const prefixedConfig = parseDeliberationConfig({
    ...rawConfig,
    km: { ...rawConfig.km, endpoint: "https://km.invalid/deliberation/v1" },
  });
  const client = createKmClient({
    config: prefixedConfig,
    openclawConfig: {} as never,
    fetchImpl,
    env: { KM_TOKEN: "test-only" },
  });

  await client.ready();

  expect(requestUrl(fetchImpl.mock.calls[0]?.[0] as string).pathname).toBe(
    "/deliberation/v1/ready",
  ); // RED: current path is /deliberation/v1/deliberation/v1/ready.
});
```

| Test                             | RED                                                            | GREEN                                                                                                               |
| -------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Configured canonical prefix      | Request pathname contains the prefix twice.                    | Request reaches exactly `/deliberation/v1/ready`.                                                                   |
| Other configured pathname prefix | Existing contract permits paths such as `/api`.                | `/api` remains and receives `/deliberation/v1/ready`; no broad pathname stripping.                                  |
| Safe final-delivery warning      | Parent RED proves missing operation/path and warning metadata. | Existing tests pass with bounded metadata and no secret/payload leakage.                                            |
| Delivery guards                  | Existing adapter tests define the baseline.                    | Reservation, target equality, one provider attempt, completion evidence, and unknown-outcome behavior remain green. |

## Dependencies

- The preserved parent worktree changes remain the baseline; do not revert or duplicate delivery-probe, lifecycle, docs, or service-registration work.
- `extensions/deliberation/contracts/km-wire-v1.json` remains authoritative; no protocol, auth, config-schema, or endpoint-validation expansion is required.
- No deployment, listener restart, production spool mutation, or real provider send belongs to this acceptance fix.

---

_Created: 2026-08-25_
_Status: DRAFT_
