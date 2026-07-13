# Plan 2026-07-13: Complete runtimeByChannel TDD evidence

Preserve the parent task's genuine RED provenance and capture a fresh GREEN result for the unchanged regression command. Do not repeat the completed implementation.

_Status: DRAFT_
_Created: 2026-07-13_

## Progress

- [x] Phase 0: Config + init
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Analysis

### Codebase context

- `plans/checkpoints/bold-peak-9726.red-green-proof.md:5` contains the genuine pre-implementation RED: 3 expected failures from the recorded four-file command.
- `plans/checkpoints/bold-peak-9726.red-green-proof.md:142` currently contains an earlier GREEN, but acceptance requires fresh follow-up evidence.
- `src/auto-reply/reply/get-reply.fast-path.test.ts:337`, `src/auto-reply/reply/get-reply-directives.target-session.test.ts:326`, `src/auto-reply/reply/agent-runner-utils.test.ts:129`, and `src/channels/model-overrides.test.ts:226` retain the regression assertions.
- The preserved worktree already contains the runtime-profile implementation. Source or test edits are out of scope unless the fresh command fails because of this change.

### Relevant documentation

- No product documentation changes are needed; this follow-up changes only task evidence.
- `src/channels/AGENTS.md:53` requires build proof only when channel hot entrypoints or lazy seams change; neither should change here.

### Knowledge base

- `learnings/architecture/channel-runtime-profile-execution-precedence.md:14` records the tested precedence: session, runtime profile, legacy channel model, global default.
- `learnings/architecture/bold-peak-9726-channel-runtime-profiles-must-reach-every-execution-path.md:9` requires runtime-only coverage across dispatch and native slash paths.
- `learnings/tooling/bold-peak-9726-vitest-does-not-accept-jest-s-runinband-flag.md:9` requires the repository `pnpm test` wrapper without Jest's `--runInBand`.
- Do not manufacture a second RED after implementation exists; link the helper-captured parent RED and record only fresh GREEN verification for this acceptance follow-up.

## Available Skills

- `tdd`: enforce genuine failure/success provenance; use its proof format, but do not invoke a new RED against implemented code.
- `acceptance-checks`: verify the final checkpoint contains linked RED provenance and successful fresh GREEN output.
- `save-learning`: record the evidence-repair lesson as the final implementation-session action.

## Solution

Create `plans/checkpoints/calm-reef-1872.red-green-proof.md` as an acceptance-evidence checkpoint. Identify the parent proof, exact RED timestamp, command hash, exit code, and three expected failures; then attach freshly captured output from the identical command showing exit code 0. Keep production and regression files unchanged when the command passes.

## Implementation

1. Read `plans/checkpoints/bold-peak-9726.red-green-proof.md` and verify its RED metadata, command, nonzero exit, and expected assertion failures before citing it.
2. Run the exact recorded command once from the repository root and capture timestamp, exit code, stdout, and stderr without manually reconstructing test output.
3. If it fails, diagnose only the regression introduced since the preserved implementation; make the minimum correction and rerun the same command. Do not rewrite tests merely to obtain GREEN.
4. Write `plans/checkpoints/calm-reef-1872.red-green-proof.md` with a `Historical RED provenance` section linking the parent checkpoint and a `Fresh GREEN verification` section containing the captured successful run.
5. Verify the follow-up checkpoint names task `calm-reef-1872`, cites `bold-peak-9726`, uses the identical command, shows historical RED exit code 1, and shows fresh GREEN exit code 0.
6. Run `acceptance-checks` against the primary goal, then run `save-learning` and save at least one learning as the final action before completion.

## Files to Modify

| File                                                  | Change                                                                                           |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `plans/checkpoints/calm-reef-1872.red-green-proof.md` | Add linked historical RED provenance and freshly captured GREEN output.                          |
| `learnings/tooling/<generated-learning>.md`           | Record how acceptance follow-ups reuse genuine historical RED without fabricating a new failure. |

Do not modify runtime or test files unless the recorded regression command exposes a real failure.

## TDD

Implementace TDD cyklu dle skill:tdd, with the task-specific provenance exception: the genuine RED already predates the implementation under task `bold-peak-9726`; do not run or fabricate a new RED for `calm-reef-1872`.

**Existing runnable regression:** `src/auto-reply/reply/get-reply.fast-path.test.ts:337`

```ts
// Existing test body; retain these assertions unchanged.
expect(directiveParams.model, testCase.name).toBe(testCase.expectedModel);
expect(directiveParams.channelRuntimeProfile, testCase.name).toEqual(
  testCase.runtimeProfile
    ? expect.objectContaining({
        ...testCase.runtimeProfile,
        ...(testCase.runtimeProfile.model || !testCase.legacyModel
          ? {}
          : { model: testCase.legacyModel }),
      })
    : null,
);
```

**Exact command:** `pnpm test src/channels/model-overrides.test.ts src/auto-reply/reply/get-reply.fast-path.test.ts src/auto-reply/reply/get-reply-directives.target-session.test.ts src/auto-reply/reply/agent-runner-utils.test.ts -- --reporter=verbose`

| Coverage                               | Historical RED                                            | Required GREEN                                                  |
| -------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------------- |
| Fresh Discord model/profile precedence | `channelRuntimeProfile` was `undefined`                   | Runtime profile is passed and model precedence assertions pass. |
| Fresh-session thinking/reasoning       | Expected `high`, received `low`                           | Channel defaults apply below explicit session state.            |
| Provider text verbosity                | Expected `{ textVerbosity: "low" }`, received `undefined` | Stream parameters reach embedded execution.                     |
| Effective profile/legacy fallback      | Parent command includes resolver regressions              | Runtime profile and legacy fallback tests pass.                 |

## Dependencies

- Preserve the existing implementation and tests from `bold-peak-9726`.
- Use the parent checkpoint as immutable RED evidence; never edit its historical output.
- The follow-up checkpoint must remain under `plans/checkpoints/` and the plan remains at the canonical path selected for `calm-reef-1872`.
