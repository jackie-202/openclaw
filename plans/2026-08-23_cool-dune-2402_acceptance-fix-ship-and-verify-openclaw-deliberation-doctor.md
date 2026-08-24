# Plan 2026-08-23: Ship the OR-22 Installed-Runtime Probe

Carry the preserved OR-22 test hunk into the task-scoped deliverable and prove it against a freshly installed package; do not repeat the completed doctor migration work.

## Analysis

- `test/scripts/deliberation-doctor-package.e2e.test.ts:151-210` already contains the required uncommitted probe. It imports the installed `dist/plugins/build-smoke-entry.js`, loads only Deliberation, and asserts the ordered five hooks plus sole `deliberation-final-delivery` service.
- Baseline commit `ee0cc3b2b82` lacks that hunk, explaining why the prior task-scoped material was judged incomplete. The repair must explicitly include this file in its final diff/change set.
- `src/plugins/build-smoke-entry.ts:8` is the existing installed-runtime loader seam. No production export or loader change is needed.
- `scripts/test-built-plugin-singleton.mjs:215-246` independently asserts the same five-hook/service contract and must remain unchanged.
- Existing migration, idempotence, validation, discovery, and refusal coverage in the named leaf remains intact. No docs or product-code changes are required.

## Knowledge Base

- `learnings/test-failures/dark-mist-2518-named-package-leaf-runtime-coverage.md`: a named package leaf must directly prove every behavior in its name through the installed artifact; a separate smoke test is insufficient.
- `learnings/build-errors/cool-cove-3068-git-inventory-installed-package-proof.md`: build and source success do not prove package contents; install the tarball under an isolated prefix and execute its CLI/runtime.
- Preserve the genuine historical RED in `plans/checkpoints/cool-cove-3068.red-green-proof.md` and the prior gap explanation in `plans/checkpoints/dark-mist-2518.red-green-proof.md`; do not manufacture a new RED after the implementation exists.
- Recall used local fallback because collection `openclaw-fork-learnings` was unavailable. Its returned generic architecture files added no stronger task-specific guidance.

## Available Skills

- `tdd`: preserve historical RED provenance and capture fresh `cool-dune-2402` GREEN evidence.
- `task-evidence`: recover exact parent commands only if the existing proof files are insufficient.
- `validate-implementation`: confirm the final change remains test/evidence-only.
- `acceptance`: check that the final task-scoped material directly resolves `finding-001`.
- `save-learning`: run as the final implementation action and save at least one learning.

## Implementation

1. Invoke `skill:tdd` and initialize `plans/checkpoints/cool-dune-2402.red-green-proof.md`; link the genuine parent RED and state that the runtime-registration defect was missing coverage/change material, so no synthetic RED is run.
2. Preserve the existing installed-runtime probe and exact assertions in `test/scripts/deliberation-doctor-package.e2e.test.ts`; compare against `ee0cc3b2b82` and ensure this test file is present in the task-scoped diff. Do not alter migration behavior or production code.
3. Build and create a fresh task-specific tarball, then run the named OR-22 leaf against that tarball. Record the exact command, exit code, and named-test output as fresh GREEN evidence.
4. Run the unchanged standalone singleton smoke and scoped static checks. Confirm the final diff visibly contains the probe and both exact registration assertions, not only checkpoint prose.
5. Run `validate-implementation`, a fresh bounded `autoreview`, and the acceptance check; resolve actionable findings without expanding scope. Update `plans/checkpoints/cool-dune-2402.checkpoint.md` with the plan path, changed file, proof path, and verification outcomes.
6. Invoke `skill:save-learning` last and save at least one learning about preserving implementation hunks in acceptance task-scoped material.

## Files to Modify

| File                                                   | Change                                                                                                    |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `test/scripts/deliberation-doctor-package.e2e.test.ts` | Ship the preserved installed-runtime probe and exact ordered hook/service assertions as task-scoped code. |
| `plans/checkpoints/cool-dune-2402.red-green-proof.md`  | Link authentic RED provenance and capture fresh installed-package GREEN.                                  |
| `plans/checkpoints/cool-dune-2402.checkpoint.md`       | Link this plan and record implementation/diff/verification state.                                         |
| `learnings/<category>/<cool-dune-2402-learning>.md`    | Save the required final learning.                                                                         |

## TDD

Implement the evidence-preserving cycle with `skill:tdd`. The current worktree already contains the implementation, so retain the historical RED rather than deleting assertions or fabricating a failure.

**Test file:** `test/scripts/deliberation-doctor-package.e2e.test.ts`  
**Run command:** `OPENCLAW_CURRENT_PACKAGE_TGZ="$HOME/.openclaw/tmp/opencode/cool-dune-2402/openclaw-current.tgz" OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test test/scripts/deliberation-doctor-package.e2e.test.ts -- --reporter=verbose`  
**Edit hint:** Preserve the probe inside `OR-22 doctor-package-writeback-built-five-hook-runtime` after packaged plugin discovery.

```ts
// These assertions were absent from the accepted task-scoped change material.
expect(registration.status).toBe("loaded");
expect(registration.hooks).toEqual([
  "inbound_event_policy",
  "inbound_claim",
  "before_dispatch",
  "before_tool_call",
  "message_sending",
]);
expect(registration.services).toEqual(["deliberation-final-delivery"]);
```

| Test                          | RED / acceptance gap                                     | GREEN                                                                                    |
| ----------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Named OR-22 installed runtime | Prior task-scoped diff omitted the probe and assertions. | Named leaf loads the installed runtime and passes exact ordered hook/service assertions. |
| Standalone singleton smoke    | Existing independent coverage is already green.          | `pnpm test:build:singleton` remains green and unchanged.                                 |

## Verification

1. `pnpm build`
2. `node scripts/package-openclaw-for-docker.mjs --output-dir "$HOME/.openclaw/tmp/opencode/cool-dune-2402" --output-name openclaw-current.tgz`
3. Run the targeted OR-22 command above and require one passing named leaf.
4. `pnpm test:build:singleton`
5. `node scripts/run-oxlint.mjs test/scripts/deliberation-doctor-package.e2e.test.ts`
6. `pnpm format:check -- test/scripts/deliberation-doctor-package.e2e.test.ts plans/checkpoints/cool-dune-2402.red-green-proof.md plans/checkpoints/cool-dune-2402.checkpoint.md`
7. `git diff --check`
8. `git diff ee0cc3b2b82 -- test/scripts/deliberation-doctor-package.e2e.test.ts` must show the installed-runtime probe and both exact assertions.

## Constraints

- Do not modify Deliberation runtime code, hook declarations, migration semantics, or `scripts/test-built-plugin-singleton.mjs` unless fresh installed-package proof exposes a real defect.
- Do not overwrite any file under `plans/tasks/`; link task state through the dedicated checkpoint.
- Ignore unrelated dirty-worktree changes and keep review/proof inputs bounded to task-owned files.

_Task: `cool-dune-2402`_  
_Status: DRAFT_
