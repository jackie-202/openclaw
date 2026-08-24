# Plan 2026-08-20: Close compaction auth acceptance evidence

Record fresh caller-owned test-gate results and a factual final note without changing the accepted provider-auth implementation.

_Status: DRAFT_
_Created: 2026-08-20_

## Progress

- [x] Phase 0: Config + Init
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Analysis

### Codebase context

- `src/agents/model-auth.profiles.test.ts:519` is the focused resolver and header-sanitization regression; `:560` keeps local `openai-responses` fail-closed.
- `src/agents/embedded-agent-runner/compact.hooks.test.ts:788` composes the compaction caller, synthetic marker, runtime API-key storage, and `Authorization: null` boundary.
- The parent implementation changed `src/agents/model-auth.ts`, `src/agents/model-auth.profiles.test.ts`, `src/agents/embedded-agent-runner/compact.hooks.harness.ts`, and `src/agents/embedded-agent-runner/compact.hooks.test.ts`. Do not reopen these files unless the fresh canonical suite identifies a regression.
- `plans/checkpoints/bold-brook-8179.red-green-proof.md` contains the genuine parent RED and focused GREEN. It cannot establish the required fresh canonical Test Gate.
- `plans/checkpoints/bold-brook-8179.checkpoint.md` claims broad completion but omits exact commands, results, changed files, and the required final note.

### Relevant documentation

- `docs/reference/test.md:11-25` defines `pnpm test <path-or-filter>` as scoped Vitest proof, requires explicit targets, and distinguishes Vitest proof from `pnpm check:changed`.
- `src/agents/AGENTS.md:27-32` requires preserving exact behavior proof while using narrow mock factories; the existing resolver and compaction tests already meet that boundary.
- `src/agents/embedded-agent-runner/run/AGENTS.md:10-20` reserves full-runner coverage for cross-component behavior; the existing compact-hooks composition test is the suitable cheap integration surface.

### Knowledge base

- `learnings/tooling/fresh-cove-4093-canonical-test-gate-evidence.md`: a `not-run` Test Gate cannot be repaired with local output; record the exact command, caller-owned non-`not-run` reference, exit code, and full suite totals in a dedicated artifact.
- `learnings/security-issues/synthetic-auth-marker-must-match-header-clearing-transport.md`: retain both resolver and `Authorization: null` proof, and retain `openai-responses` rejection.
- `learnings/security-issues/substitute-transport-auth-instead-of-relaxing-validation.md`: preserve the distinction between the synthetic constructor marker and omitted request authorization.
- Knowledge search used local fallback because QMD collection `openclaw-fork-learnings` was unavailable; returned architecture files were either unrelated or auto-extracted stubs and add no further applicable rule.

## Available Skills

- `openclaw-testing`: select and run the focused and five-file broader Vitest targets through the Test Gate.
- `acceptance`: evaluate the monitor-provided retry manifest after the evidence artifacts are complete.
- `save-learning`: run last and save a learning after the evidence-repair session.

## Solution

Keep the accepted source unchanged. Obtain caller-owned evidence for the original focused file and its smallest established broader auth/compaction suite, then write a separate final note that links inherited RED/GREEN proof, fresh gate output, actual changed paths, and the remaining deployment probe.

## Implementation

1. Confirm the four parent implementation paths remain the only provider-auth/compaction changes; do not touch unrelated dirty-worktree files.
2. Submit the preserved workspace to the caller-owned canonical Test Gate. It must execute both commands below and expose a concrete run reference, timestamp, exit code, and complete Vitest totals. A local shell result, `check:changed`, or a prose checkpoint is not a substitute.
3. Create `plans/checkpoints/fresh-reef-7050.test-gate.md` from the actual gate output. Include the gate owner and non-`not-run` reference; transcribe both commands, exit codes, and complete summaries; mark `PASS` only when both exit `0`.
4. Create `plans/checkpoints/fresh-reef-7050.final-note.md`. List the four actual parent changed files, link the inherited RED/GREEN proof and fresh Test Gate artifact, copy the exact commands/results from the gate, and state only this residual runtime verification: after deployment restart the Gateway, run `/compact` under the local OpenAI bridge with the carried OAuth profile, run the ordinary `AUTH_OK` probe, and inspect sanitized bridge/upstream evidence for neither the OAuth access token nor `Bearer custom-local`.
5. Update `plans/checkpoints/fresh-reef-7050.checkpoint.md` with links to this plan, the historical proof, Test Gate, final note, and retry acceptance result. If the gate is unavailable or fails, record the exact blocker and stop without claiming goal-006 or goal-007.
6. Run `skill:acceptance` only when the monitor supplies a retry manifest; require both findings to be absent. Run `skill:save-learning` as the final action and save one evidence-provenance learning.

## Files to Modify

| File                                                          | Change                                                                                                          |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `plans/checkpoints/fresh-reef-7050.test-gate.md`              | Caller-owned focused and broader Test Gate provenance and actual results.                                       |
| `plans/checkpoints/fresh-reef-7050.final-note.md`             | Actual changed files, exact verification outcomes, inherited proof links, and residual deployment verification. |
| `plans/checkpoints/fresh-reef-7050.checkpoint.md`             | Evidence-repair status and artifact links.                                                                      |
| `learnings/tooling/<dated>-canonical-test-gate-provenance.md` | One learning saved last by `skill:save-learning`.                                                               |

## TDD: skip

No production or test behavior changes are planned. Reuse the genuine parent RED/GREEN at `plans/checkpoints/bold-brook-8179.red-green-proof.md`; capture fresh caller-owned GREEN evidence instead of fabricating a post-implementation RED.

## Verification

The caller-owned Test Gate must run these commands exactly and retain their unabridged summaries:

```bash
pnpm test src/agents/model-auth.profiles.test.ts
pnpm test src/agents/model-auth.profiles.test.ts src/agents/model-auth.test.ts src/agents/model-provider-auth.test.ts src/agents/embedded-agent-runner/compact.hooks.test.ts src/agents/embedded-agent-runner/compaction-runtime-context.test.ts
```

- Focused proof covers the local `openai-completions` OAuth substitution, non-secret marker, null authorization header, and local `openai-responses` rejection.
- The five-file suite is the smallest established broader surface: shared provider-auth selection, synthetic marker/header behavior, compaction composition, and compaction runtime context. Do not substitute a full repository run or `pnpm check:changed`, which does not run Vitest.
- Record the actual output only. If either command fails or the caller-owned run reference is absent, mark the gate blocked or failed rather than fabricating a passing artifact.

## Dependencies

- A caller/monitor-owned Test Gate capable of returning a concrete non-`not-run` reference is required; this planning session cannot create it from local execution.
- A monitor-provided retry acceptance manifest is required before `skill:acceptance` can determine whether `finding-001` and `finding-002` are cleared.
