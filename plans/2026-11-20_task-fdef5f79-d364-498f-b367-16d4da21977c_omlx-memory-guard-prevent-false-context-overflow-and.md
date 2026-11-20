---
{
  "tdd":
    {
      "decision": "required",
      "reason": "The planned source repair changes provider memory-admission classification, user-facing error formatting, and eligibility for overflow compaction; exported-classifier and runner-seam regression tests must fail before the repair and pass afterward.",
    },
}
...

# Plan

## Analysis

- Use `plans/checkpoints/omlx-prefill-memory-20261120-evidence.md:8-27` as the external contract: preflight `prefill_memory_exceeded` is RAM admission, whereas `prefill_memory_aborted` may follow emitted tokens. Keep transport preservation and deployed behavior claims separate.
- Repair both false-positive paths in `src/agents/embedded-agent-helpers/errors.ts`: broad overflow matching at lines 156-198 and HTTP400/422 format fallback at lines 786-802. Cover the schema check at lines 499-503 and final safe-copy rewrite at lines 1391-1407.
- Respect `src/llm/providers/openai-completions.ts:484-500`: Error instances retain only `.message`; do not assume SDK code fields survive. `src/agents/failover-error.ts:158-180` preserves ordinary code fields, while `src/shared/assistant-error-format.ts:147-203` prefers error.type over code and does not expose omlx_code.
- Test both current-attempt sources in `src/agents/embedded-agent-runner/run.ts:2067-2099`; only genuine overflow may synthesize `ctxInfo.tokens + 1` and enter the three-compaction budget.
- Apply the supplied LM Studio semantic-exclusion design inspiration and recoverable-versus-unsatisfiable distinction; do not import newer upstream failover architecture or Groq token-quota parsing.
- Reuse the contract-first lesson from local recall results; record recall backend `local`, collection `openclaw-fork-learnings`, diagnostic `Collection not found`. The three relevant external-contract learning files contain headings only; derive concrete behavior from the supplied evidence instead.

## Approach

- Put oMLX contract recognition in the existing provider fallback owner, `src/agents/embedded-agent-helpers/provider-error-patterns.ts`; no oMLX-specific bundled plugin exists in the inspected source. Keep core consumers generic and avoid provider-ID/config-name matching for custom OpenAI-compatible endpoints.
- Recognize exact code/omlx_code `prefill_memory_exceeded` in supported structured/envelope shapes; use a narrowly anchored oMLX prefill-memory-guard rejection signature for the text-only route. Do not classify generic “memory”, “prompt”, “limit”, or suggested “reduce context” wording as this contract.
- Return a closed admission-versus-abort distinction from the shared recognition logic. Keep admission out of strict/likely overflow and format/schema fallback; return no retry-eligible failover reason rather than inventing throttling or timeout semantics.
- Add a generic resource/memory runtime diagnostic only where needed for explicit safe formatting. Keep the original raw error for diagnostics; final chat copy must describe insufficient prefill memory headroom, survive `formatUserFacingAssistantErrorText`, and avoid promising capacity recovery or recommending bypassing memory protection.
- Treat the abort code separately: exclude erroneous overflow/schema handling, retain an interrupted-memory diagnostic, and preserve existing no-replay behavior after work starts.

## Implementation

1. Load `skill:tdd` and `skill:openclaw-testing`; verify prepared Node/pnpm dependencies and checkout type. Resolve the TDD helper interpreter from authorized project configuration: `.python-version` pins 3.15.0 but supplies no absolute executable. Obtain the missing absolute interpreter from the caller/runtime owner if unavailable; do not substitute PATH Python or probe private runtime state.
2. Edit adjacent tests first. Use the verbatim observed HTTP400 message from the evidence, including its trailing context-reduction advice; add structured fixtures with ordinary code, nested error.code, and nested error.omlx_code, with invalid_request_error and neutral message variants. Confirm which normalizer/JSON envelope actually preserves each field before wiring consumers.
3. Add focused runner cases using `makeAttemptResult` and existing harness seams. Override `mockedIsLikelyContextOverflowError` with the real exported classifier for these cases; use real failover/error formatting functions at affected mocked seams too. Keep unrelated harness defaults unchanged. Capture accepted RED before production edits.
4. Implement one recognition path at the provider fallback owner, using existing payload/status extraction where suitable. Wire exclusions before both overflow heuristics and before HTTP400 format fallback in exported message/signal/status classification; cover runtime schema classification and both formatter layers. Extend `failover-error.ts` normalization only if real preserved structured variants require it; do not expand transport or public SDK metadata.
5. Keep `run.ts` recovery policy unchanged if classifier repair suffices. If structured prompt errors lose their only semantic signal before the recovery seam, carry the existing normalized signal through that seam without changing retry, timeout, compaction budgets, or terminal precedence. Read `src/agents/embedded-agent-runner/run/AGENTS.md` before any work beneath that subtree.
6. Capture GREEN with identical focused argv, then run scoped regressions. Add a brief RAM-admission-versus-token-window note to `docs/concepts/compaction.md` using `skill:technical-documentation`; document accurate failure semantics without new configuration guidance.
7. Run fresh `skill:autoreview` before any later commit/landing, resolve actionable findings, and record exact proof in the authorized checkpoint. Preserve unrelated working files; leave queues, retries, timeouts, global context/config, deployments, restarts, and live inference untouched.

## Testing

- In a healthy normal checkout, use one focused argv for RED and GREEN: `pnpm test src/agents/embedded-agent-helpers/errors.test.ts src/agents/embedded-agent-helpers/errors-provider-structured-signals.test.ts src/agents/embedded-agent-runner/run.overflow-compaction.loop.test.ts`. In a linked/sparse/Codex checkout, select `node scripts/run-vitest.mjs` with the same explicit files before starting the cycle; never switch argv mid-cycle.
- Assert the exact observed text, unprefixed text, HTTP400 JSON envelopes, and preserved structured signals are neither strict/likely overflow nor format/schema, produce no transient/throttling reason, and retain an explicit memory diagnostic through both exported formatters. Include code-only structured recognition to avoid passing solely on message matching.
- Through the real runner classifier seam, cover promptError and lastAssistant error variants: exactly one attempt, zero overflow compactions, zero oversized-tool truncations, no context-overflow diagnostic/synthetic token count, and preserved original memory failure. Do not accept the harness's copied/narrower heuristic as proof.
- Cover mid-prefill abort with already-produced assistant content and work/delivery metadata, including transport stopReason `error` without relying solely on `aborted: true`; assert one attempt, no compaction, and no replay of started work. Use only supplied abort contract facts, not invented verbatim server text.
- Retain positive controls: genuine token overflow compacts once and succeeds on attempt two; ordinary malformed-tool HTTP400 remains format/schema with existing safe copy. Add a near-miss resource message that does not satisfy the oMLX signature to prove narrow matching.
- After GREEN, run `pnpm test src/agents/embedded-agent-helpers/provider-error-patterns.test.ts src/agents/embedded-agent-runner/run.overflow-compaction.test.ts src/agents/embedded-agent-runner/run.overflow-compaction.loop.test.ts`; add `src/agents/failover-error.test.ts` if normalization changes. Use the node wrapper instead in linked checkouts; serialize test commands and keep workers at or below 16.
- Run `git diff --check`, file-scoped repository format/lint checks, and inspect `git diff --numstat`; justify any production LOC growth by one canonical recognition path. Use `pnpm changed:lanes --json` and the appropriate remote changed gate only when authorized/prepared under `skill:openclaw-testing`; do not turn local proof into broad local execution. Run `pnpm build` only if module/lazy/published boundaries change.
- Record commands, exit/results, tested checkout identity, and remaining gaps in `plans/checkpoints/task-fdef5f79-d364-498f-b367-16d4da21977c.red-green-proof.md` through the TDD helper. State source/mock proof only: no deployed oMLX transport, loaded server, real memory recovery, or live inference verified. Keep any learning candidate within that already-authorized report.

## TDD

- Require regression characterization and RED/GREEN: the actual work changes runtime admission classification, user-facing diagnostics, and overflow recovery eligibility.
- Append executable Vitest characterization to `src/agents/embedded-agent-helpers/errors.test.ts`, extending its existing imports from `./errors.js`; use this initial RED skeleton, then table-drive the full observed/envelope cases described above:

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
  expect(isLikelyContextOverflowError(raw)).toBe(false); // RED: broad prompt...limit.
  expect(classifyFailoverSignal({ status: 400, message: raw })).toBeNull();
  const message = makeAssistantMessageFixture({ errorMessage: raw });
  const safe = formatUserFacingAssistantErrorText(message);
  expect(safe).toMatch(/memory/i); // RED: currently schema rejection copy.
  expect(safe).not.toMatch(/schema|tool payload|context overflow/i);
});
```

- Use `TASK_ID=task-fdef5f79-d364-498f-b367-16d4da21977c "$CONSUMER_PYTHON" "$TDD_SKILL_DIR/scripts/proof-capture.py" red -- <selected focused argv>` from the project root, then `green --` with identical argv. Bind both variables from the loaded skill and authorized interpreter; confirm `accepted_red` with a failing child before implementation and `accepted_green` with child exit zero afterward. Do not hand-write proof or treat import/setup failures as behavioral RED.

## Files

- Modify `src/agents/embedded-agent-helpers/provider-error-patterns.ts` and `errors.ts` for contract recognition, exclusions, and safe resource diagnostics.
- Extend `src/agents/embedded-agent-helpers/errors.test.ts`, `errors-provider-structured-signals.test.ts`, and `src/agents/embedded-agent-runner/run.overflow-compaction.loop.test.ts`; touch the shared harness only if per-case real-function injection cannot suffice.
- Touch `src/agents/failover-error.ts` and its adjacent tests only for evidenced structured normalization gaps; touch runner source only for evidenced loss at its classification boundary.
- Update `docs/concepts/compaction.md` for the bounded behavior note; create only the TDD-owned checkpoint during implementation. Treat the supplied oMLX evidence as read-only.
