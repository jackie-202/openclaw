# Plan 2026-08-20: Repair compaction auth Test Gate evidence

Obtain and record the missing caller-owned canonical Test Gate result for the preserved OpenAI OAuth/local bridge compaction fix.

_Status: DRAFT_
_Created: 2026-08-20_

## Analysis

### Codebase context

- `src/agents/model-auth.ts:102-132` allows OAuth only for the local `openai-completions` transport by replacing it with the non-secret local marker; other OpenAI APIs remain rejected.
- `src/agents/model-auth.ts:1499-1520` clears the generated `Authorization` header only for that marker and transport.
- `src/agents/model-auth.profiles.test.ts` and `src/agents/embedded-agent-runner/compact.hooks.test.ts` are the accepted focused resolver and compaction-composition regression surfaces. Do not change them unless the required gate exposes a real regression.
- `plans/checkpoints/fresh-reef-7050.checkpoint.md` records local passes for the focused test and five-file broader suite, but no caller-owned Test Gate reference.
- `plans/2026-08-20_fresh-reef-7050_fix-compaction-openai-oauth-bridge-provider-auth-validation.md` defines the exact missing gate commands and evidence fields.

### Relevant documentation

- `docs/reference/test.md` defines `pnpm test <path-or-filter>` as scoped Vitest proof.
- `src/agents/AGENTS.md` requires retaining exact behavior proof in narrow agent test coverage.

### Knowledge base

- `learnings/tooling/fresh-cove-4093-canonical-test-gate-evidence.md` requires a non-`not-run` caller-owned reference, exact command, exit code, and complete totals; local output cannot substitute.
- `learnings/tooling/fresh-reef-7050-narrow-auth-compaction-verification.md` identifies the existing focused resolver test plus five-file auth/compaction suite as the smallest useful broader proof.

## Approach

Keep all production and test source unchanged. Supply only a caller-owned canonical Test Gate result and link it from the parent checkpoint so acceptance can consume the required proof.

## Implementation

1. Confirm the preserved diff remains limited to `src/agents/model-auth.ts`, `src/agents/model-auth.profiles.test.ts`, `src/agents/embedded-agent-runner/compact.hooks.harness.ts`, and `src/agents/embedded-agent-runner/compact.hooks.test.ts`; leave unrelated dirty-worktree changes untouched.
2. Request or run the caller-owned canonical Test Gate for the two commands below. Require a concrete run ID/URL, timestamp, non-`not-run` status, exit code, and unabridged Vitest file/test totals for each command.
3. Record the returned result verbatim in `plans/checkpoints/fresh-reef-7050.test-gate.md`; mark it `PASS` only if both commands exit `0`, otherwise mark it blocked/failed with the actual gate output.
4. Update `plans/checkpoints/fresh-reef-7050.checkpoint.md` to link the Test Gate artifact, retained parent RED/GREEN proof at `plans/checkpoints/bold-brook-8179.red-green-proof.md`, and the exact result. Do not claim acceptance before the retry consumes the gate reference.
5. Run `skill:acceptance` only with a monitor-supplied retry manifest. Save one evidence-provenance learning as the final action with `skill:save-learning`.

## Files to Modify

| File                                                          | Change                                                      |
| ------------------------------------------------------------- | ----------------------------------------------------------- |
| `plans/checkpoints/fresh-reef-7050.test-gate.md`              | Add caller-owned gate reference and actual command results. |
| `plans/checkpoints/fresh-reef-7050.checkpoint.md`             | Link the canonical gate and inherited proof.                |
| `learnings/tooling/<dated>-canonical-test-gate-provenance.md` | Save the final evidence-provenance learning.                |

## TDD: skip

This evidence-only follow-up changes no executable behavior. Reuse the genuine parent RED/GREEN proof at `plans/checkpoints/bold-brook-8179.red-green-proof.md`; capture fresh canonical GREEN evidence without fabricating a post-implementation RED.

## Verification

The canonical Test Gate must execute and retain full output for:

```bash
pnpm test src/agents/model-auth.profiles.test.ts
pnpm test src/agents/model-auth.profiles.test.ts src/agents/model-auth.test.ts src/agents/model-provider-auth.test.ts src/agents/embedded-agent-runner/compact.hooks.test.ts src/agents/embedded-agent-runner/compaction-runtime-context.test.ts
```

- The focused suite proves OAuth replacement, the non-secret local marker, cleared authorization, and `openai-responses` rejection.
- The five-file suite proves shared provider-auth selection and compaction/runtime-context composition.
- Acceptance remains blocked if either command fails or the canonical run reference is absent.

## Dependencies

- A caller/monitor-owned Test Gate that returns a concrete non-`not-run` reference.
- A monitor-provided retry acceptance manifest before evaluating resolution.
