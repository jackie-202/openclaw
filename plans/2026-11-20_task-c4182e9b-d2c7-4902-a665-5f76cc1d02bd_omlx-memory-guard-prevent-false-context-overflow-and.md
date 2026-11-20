---
{
  "tdd":
    {
      "decision": "required",
      "reason": "The remaining repair changes memory-admission classification, safe error diagnostics, and overflow recovery eligibility; real exported-classifier and runner-seam regressions require this task's genuine RED before production edits and matching GREEN afterward.",
    },
}
...

# Plan

## Analysis

- Continue the parent plan at `plans/2026-11-20_task-fdef5f79-d364-498f-b367-16d4da21977c_omlx-memory-guard-prevent-false-context-overflow-and.md`; use `plans/checkpoints/archive/2026-11-20_task-fdef5f79-d364-498f-b367-16d4da21977c.checkpoint.md:12-16` to preserve its stopped-before-tests provenance and the existing `.python-version`.
- Base fixtures on `plans/checkpoints/omlx-prefill-memory-20261120-evidence.md:8-27`: exact HTTP400 text, `error.code`/`error.omlx_code=prefill_memory_exceeded`, and separate `prefill_memory_aborted` contract. Treat installed-source envelope facts separately from observed transport bytes.
- Repair `src/agents/embedded-agent-helpers/errors.ts:101-198,499-503,786-802,1012-1123,1267-1407`: broad `prompt.*limit` overflow matching and HTTP400/schema fallbacks independently misclassify admission failures.
- Account for text-only transport at `src/llm/providers/openai-completions.ts:484-500`, ordinary code normalization at `src/agents/failover-error.ts:158-181`, and type-over-code precedence/absent omlx_code in `src/shared/assistant-error-format.ts:147-203`; do not assume structured fields survive.
- Exercise both current-attempt sources at `src/agents/embedded-agent-runner/run.ts:2067-2099`; exclude admission before synthetic token counts and overflow recovery. Replace the narrower per-case mock at `run.overflow-compaction.loop.test.ts:78-89` with the real exported classifier for new proof.
- Use supplied dependency evidence without external-runtime inspection. Recall returned backend `local`, collection `openclaw-fork-learnings`, diagnostic `Collection not found`; returned learning files contain headings only, so derive contracts from evidence and source.

## Approach

- Add one narrow admission-versus-abort recognizer in existing fallback owner `src/agents/embedded-agent-helpers/provider-error-patterns.ts`; consume it generically from classification/formatting. Avoid provider-ID/config-name matching for custom OpenAI-compatible endpoints.
- Recognize exact structured codes in preserved signals/JSON envelopes and the anchored oMLX prefill-memory-guard rejection signature for text-only errors. Do not suppress arbitrary memory, prompt, limit, or context-reduction messages.
- Exclude recognized memory failures before strict/likely overflow, HTTP400/422 format fallback, and runtime schema classification; return no invented transient/throttling/failover reason.
- Emit explicit safe memory-headroom diagnostics for admission and interrupted-memory diagnostics for abort; preserve raw error evidence and prevent final formatter replacement with schema copy. Do not promise eventual capacity or recommend bypassing protection.
- Keep runner policy unchanged if classification suffices; carry existing normalized semantics through its recovery seam only if tests expose structured signal loss. Preserve retries, timeout/compaction budgets, terminal precedence, and no replay after work starts.

## Implementation

1. Load `tdd` and `openclaw-testing`; inspect checkout type and prepared Node/pnpm dependencies before choosing focused argv. Use the caller-authorized interpreter below without private-runtime probing, Python pin changes, venv creation, or Python dependency installation. Preserve unrelated dirty files; report actual readiness blockers.
2. Edit adjacent Vitest tests first. Add exact observed text including trailing context-reduction advice, unprefixed text, HTTP400 JSON, direct code, nested error.code, and nested error.omlx_code cases. Include `invalid_request_error` and neutral/code-only variants so message matching alone cannot satisfy structured proof.
3. Extend existing runner loop tests with `makeAttemptResult`; inject real exported overflow, failover, and formatter functions at affected mocked seams per case. Keep unrelated harness defaults; expose a narrow harness hook only if necessary. Capture and inspect accepted task-local RED before production edits.
4. Implement the shared recognition/exclusions and safe formatting. Extend failover normalization only for evidenced structured gaps; do not broaden public SDK/transport metadata. Add a short invariant comment explaining why RAM admission must precede token/schema heuristics.
5. Verify promptError and lastAssistant errors reach final handling without overflow recovery or replay. Change `run.ts` only for demonstrated semantic loss; read `src/agents/embedded-agent-runner/run/AGENTS.md` before any work beneath that directory.
6. Capture accepted GREEN with identical focused argv. Use `technical-documentation` for a brief RAM-admission-versus-token-window note beside auto-compaction in `docs/concepts/compaction.md`; distinguish interrupted prefill without new configuration guidance.
7. Complete scoped regressions/checks; run fresh `autoreview` before any later commit/landing and resolve actionable findings. Record exact commands, results, run IDs, source/mock proof limits, and any learning candidate in the already-authorized task checkpoint. Leave live inference, queues, services, deployments, restarts, and runtime configuration outside this repair.

## Testing

- In a healthy normal checkout select `pnpm test src/agents/embedded-agent-helpers/errors.test.ts src/agents/embedded-agent-helpers/errors-provider-structured-signals.test.ts src/agents/embedded-agent-runner/run.overflow-compaction.loop.test.ts`. For a linked/sparse/Codex checkout select `node scripts/run-vitest.mjs` with those same three files before RED; retain that exact selected argv through GREEN.
- Assert exported strict/likely classifiers reject admission as overflow; failover classification is null, runtime kind is not schema, and both `formatAssistantErrorText` and `formatUserFacingAssistantErrorText` retain accurate memory copy. Prove structured neutral-message cases through actual normalization/JSON paths.
- For promptError and assistant-error runner paths assert exactly one attempt, zero overflow compactions, zero oversized-tool truncations, no context-overflow diagnostic or synthetic token count, and preserved original memory failure plus accurate final diagnostic.
- Cover `prefill_memory_aborted` after partial assistant content and work/delivery metadata, including transport stopReason `error` with `aborted: false`: one attempt, no compaction, no replay. Use supplied abort code facts without inventing verbatim server wording.
- Retain positive controls using real classification: genuine token overflow compacts once and succeeds on attempt two; malformed-tool HTTP400 retains format/schema safe copy; near-miss resource text does not gain oMLX recognition.
- After GREEN run serialized scoped regressions: `pnpm test src/agents/embedded-agent-helpers/provider-error-patterns.test.ts src/agents/embedded-agent-runner/run.overflow-compaction.test.ts`; add `src/agents/failover-error.test.ts` if normalization changes. Use the node wrapper instead in linked checkouts; keep workers at or below 16.
- Run `git diff --check`, file-scoped repository format/lint checks, and `git diff --numstat`; justify production LOC growth by one canonical recognition path. Select changed type/lint/guard lanes with `pnpm changed:lanes --json` and run the appropriate prepared remote changed gate under `openclaw-testing`/`crabbox`; keep broad suites remote. Build only if module/lazy/published boundaries change.
- Preserve independent host TestGate ownership; do not copy registry execution metadata into worker commands. Report missing prerequisites and source/mock-only proof explicitly; do not claim deployed oMLX transport, loaded server behavior, or actual RAM recovery verification.

## TDD

- Require genuine RED/GREEN because classifier, diagnostic, and recovery eligibility behavior changes remain unimplemented; parent history cannot satisfy this task's proof.
- Append this initial executable regression to `src/agents/embedded-agent-helpers/errors.test.ts`, extending existing imports from `./errors.js`; expand to the matrix above and runner cases before RED:

```ts
import {
  classifyFailoverSignal,
  formatUserFacingAssistantErrorText,
  isContextOverflowError,
} from "./errors.js";

it("keeps oMLX prefill RAM admission out of overflow and schema copy", () => {
  const raw =
    "400 oMLX prefill memory guard rejected this prompt: " +
    "Prefill would require ~61.90 GB peak but the prefill limit is 59.80 GB";
  expect(isContextOverflowError(raw)).toBe(false);
  expect(isLikelyContextOverflowError(raw)).toBe(false); // RED: prompt.*limit.
  expect(classifyFailoverSignal({ status: 400, message: raw })).toBeNull();
  const msg = makeAssistantMessageFixture({ errorMessage: raw });
  expect(formatAssistantErrorText(msg)).toMatch(/memory/i);
  expect(formatUserFacingAssistantErrorText(msg)).toMatch(/memory/i);
  expect(formatUserFacingAssistantErrorText(msg)).not.toMatch(
    /schema|tool payload|context overflow/i,
  );
});
```

- From the project root set `CONSUMER_PYTHON=/opt/homebrew/opt/python@3.15/bin/python3.15`; invoke the installed helper with `TASK_ID=task-c4182e9b-d2c7-4902-a665-5f76cc1d02bd "$CONSUMER_PYTHON" /Users/michal/.config/opencode/skills/tdd/scripts/proof-capture.py red -- <selected focused argv>` and then `green --` with identical argv. Python runs the helper only; retain Node/pnpm test execution.
- Verify helper exit zero and `accepted_red` with nonzero child exit caused by behavioral assertions before production edits; reject import/setup failures as characterization. After repair require `accepted_green`, child exit zero, and both phases in `plans/checkpoints/task-c4182e9b-d2c7-4902-a665-5f76cc1d02bd.red-green-proof.md`; inspect captured output using helper `read` and actual run IDs.
- Keep parent proof/checkpoint bytes and identity immutable; never hand-write, import, or relabel RED/GREEN. Report helper admission failures for review rather than waiving required TDD.

## Files

- Modify `src/agents/embedded-agent-helpers/provider-error-patterns.ts` and `errors.ts` for canonical recognition, exclusions, and diagnostics.
- Extend `src/agents/embedded-agent-helpers/errors.test.ts`, `errors-provider-structured-signals.test.ts`, and `src/agents/embedded-agent-runner/run.overflow-compaction.loop.test.ts`; touch the shared harness only for required real-function injection.
- Touch `src/agents/failover-error.ts`/its tests and runner source only for demonstrated normalization/recovery-seam gaps.
- Update `docs/concepts/compaction.md`; publish task-local proof only through the installed helper and implementation notes within the authorized checkpoint. Keep supplied evidence, parent plan/checkpoint, task files, and `.python-version` intact.

## Progress

- Planning inspection completed; dispatch implementation only after ordinary semantic plan review. No behavioral tests or implementation executed during planning.
