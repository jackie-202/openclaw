# Plan 2026-08-25: Repair Deliberation final-delivery acceptance provenance

_Status: DRAFT_

## Progress

- [x] Phase 0: Config and initialization
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Analysis

### Codebase Context

- `extensions/deliberation/src/km-client.ts` already contains the preserved one-prefix correction and closed KM request diagnostics, but the parent acceptance manifest omitted this production file from its supplied diff.
- `extensions/deliberation/src/final-adapter.ts` already formats warnings from closed `KmRequestError` fields and maps all other failures to bounded causes without exposing raw errors.
- `extensions/deliberation/src/km-client.test.ts` and `extensions/deliberation/src/plugin.test.ts` contain the prefix, diagnostics, redaction, retry, timeout, and abort regressions.
- `extensions/deliberation/src/final-adapter.test.ts` protects reservation, destination, provider-attempt, completion, and unknown-outcome invariants.
- `plans/checkpoints/acceptance-runs/warm-vale-8144-acceptance-001/result.json` proves the remaining blocker is missing task-scoped production provenance, not a newly observed runtime failure.

### Documentation

- `extensions/deliberation/contracts/km-wire-v1.json` fixes the six canonical `/deliberation/v1/*` paths, closed headers/errors, and delivery lifecycle fences.
- `extensions/AGENTS.md` requires the correction to remain inside the plugin boundary.
- No user documentation change is needed because the public behavior is already documented and this follow-up changes provenance only.

### Knowledge Base

- `learnings/tooling/acceptance-fix-needs-task-scoped-production-provenance.md`: expose the smallest real production diff at the owner boundary; proof prose alone is insufficient.
- `learnings/tooling/warm-reef-8385-acceptance-proof-phase-provenance.md`: link the genuine historical RED and capture fresh GREEN; never fabricate a post-implementation RED.
- `learnings/runtime-errors/warm-vale-8144-node-http-aborts-need-signal-state-context.md`: preserve Node `ABORT_ERR` classification using timeout signal state and never log raw transport errors.
- Recall used deterministic local fallback because collection `openclaw-fork-learnings` was unavailable; its returned auto-extracted files were empty or unrelated, so they add no task rule.

## Available Skills

- `tdd`: record the imported parent RED and fresh follow-up GREEN evidence.
- `task-evidence`: recover exact parent command provenance if the acceptance artifact lineage is incomplete.
- `openclaw-testing`: choose the narrow extension verification commands.
- `autoreview`: mandatory fresh review before implementation handoff.
- `save-learning`: mandatory final implementation action.

## Implementation

1. Use `skill:tdd`; import the genuine RED from `plans/checkpoints/warm-vale-8144.red-green-proof.md` into `plans/checkpoints/dark-cove-9893.red-green-proof.md` and do not manufacture a new failing run.
2. In `extensions/deliberation/src/km-client.ts`, make the preserved correction task-scoped by expressing the canonical `/deliberation/v1` prefix once and using it for both `KM_PATHS` and removal of one trailing configured prefix. Keep URL authority, arbitrary parent paths, query strings, credential resolution, headers, timeout handling, response parsing, and all operation calls unchanged.
3. In `extensions/deliberation/src/final-adapter.ts`, rewrite only `formatFinalDeliveryError` as an explicit join of closed tokens (`operation`, `path`, `stage`, optional `status`, `code`, optional `cause`). Preserve the generic `delivery_outcome_unknown`/`unexpected` fallback and never include raw error messages, endpoints, credentials, payloads, or response bodies.
4. Retain the existing regressions in `extensions/deliberation/src/km-client.test.ts` and `extensions/deliberation/src/plugin.test.ts`; add assertions only if the refactor exposes an uncovered path-prefix or warning token case. Do not alter adapter lifecycle tests.
5. Run the focused GREEN command and record timestamp, command, exit code, and totals in `plans/checkpoints/dark-cove-9893.red-green-proof.md`. Record the exact task-scoped production diff and parent evidence link in `plans/checkpoints/dark-cove-9893.checkpoint.md`.
6. Run `pnpm tsgo:extensions`, `pnpm tsgo:extensions:test`, `git diff --check`, and scoped format/lint checks selected via `skill:openclaw-testing`. Run fresh `skill:autoreview` and resolve accepted findings.
7. Invoke `skill:save-learning` last and save at least one non-duplicative learning about task-scoped production provenance.

## Files to Modify

| Path                                                  | Change                                                                                                           |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `extensions/deliberation/src/km-client.ts`            | Expose the canonical-prefix correction in this task through one shared prefix constant, with no protocol change. |
| `extensions/deliberation/src/final-adapter.ts`        | Expose the bounded warning implementation in this task as a closed token formatter.                              |
| `extensions/deliberation/src/km-client.test.ts`       | Retain prefix and closed-diagnostic regressions; change only if needed for the shared-prefix expression.         |
| `extensions/deliberation/src/plugin.test.ts`          | Retain warning redaction/retry proof; add only a missing closed-token assertion if needed.                       |
| `plans/checkpoints/dark-cove-9893.red-green-proof.md` | Link historical RED and capture fresh GREEN output.                                                              |
| `plans/checkpoints/dark-cove-9893.checkpoint.md`      | Record task-scoped implementation and verification provenance.                                                   |
| `learnings/**`                                        | Add the mandatory final, non-duplicative learning.                                                               |

## TDD

Implement the cycle according to `skill:tdd`. The implementation already exists in preserved parent state, so RED is the genuine historical failure in `plans/checkpoints/warm-vale-8144.red-green-proof.md`; this follow-up captures fresh GREEN after making the production implementation reviewable under `dark-cove-9893`.

**Test files:** `extensions/deliberation/src/km-client.test.ts`, `extensions/deliberation/src/plugin.test.ts`, `extensions/deliberation/src/final-adapter.test.ts`  
**Framework:** Vitest through the repository test wrapper  
**Run command:** `pnpm test extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/plugin.test.ts extensions/deliberation/src/final-adapter.test.ts -- --reporter=verbose`  
**Edit hint:** Reuse the existing tests named `does not duplicate the canonical API prefix from a configured endpoint` and `logs safe KM request metadata and retries after a ready failure`; do not append duplicates.

```ts
import { describe, expect, it, vi } from "vitest";
import { parseDeliberationConfig } from "./config.js";
import { createKmClient } from "./km-client.js";

it("does not duplicate the canonical API prefix from a configured endpoint", async () => {
  const fetchImpl = vi
    .fn()
    .mockResolvedValue(
      new Response(JSON.stringify({ protocolVersion: 1, items: [], nextCursor: null })),
    );
  const client = createKmClient({
    config: parseDeliberationConfig({
      ...rawConfig,
      km: { ...rawConfig.km, endpoint: "https://km.invalid/deliberation/v1" },
    }),
    openclawConfig: {} as never,
    fetchImpl,
    env: { KM_TOKEN: "test-only" },
  });

  await client.ready();

  expect(new URL(fetchImpl.mock.calls[0]![0] as string).pathname).toBe("/deliberation/v1/ready");
});
```

| Test                        | Historical RED                                            | Follow-up GREEN                                                                                                    |
| --------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Canonical configured prefix | Request reached `/deliberation/v1/deliberation/v1/ready`. | Request reaches exactly `/deliberation/v1/ready`; arbitrary parent prefixes remain intact.                         |
| Safe final warning          | Warning lacked closed operation/path metadata.            | Warning contains only closed metadata and retries polling without reserving or sending.                            |
| Delivery safety guards      | Existing adapter baseline.                                | Reservation, exact destination, one provider attempt, completion evidence, and unknown-outcome tests remain green. |

## Dependencies

- Preserve all concurrent delivery-probe, docs, lifecycle, registration, and learning changes; do not revert or absorb them into this task.
- Treat `extensions/deliberation/contracts/km-wire-v1.json` as authoritative; do not change authentication, protocol, config schema, canonical routes, or delivery semantics.
- The implementation outcome must include actual task-scoped diffs for both production files; checkpoint prose alone does not satisfy acceptance.

---

_Created: 2026-08-25_  
_Status: DRAFT_
