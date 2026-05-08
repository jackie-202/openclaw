# Plan 2026-05-05: WhatsApp Login Acceptance Evidence

Complete the missing acceptance artifacts for the already-committed WhatsApp login hardening.

## Analysis

### Codebase Context

- `extensions/whatsapp/src/login.malformed-result.test.ts` already has direct mocks for malformed `waitForWhatsAppLoginResult` outputs; preserve it unless a rerun exposes a test defect.
- `plans/checkpoints/dark-crag-3320.red-green-proof.md` is missing; create this exact checkpoint and include concrete command output.
- `plans/checkpoints/warm-reef-4350.red-green-proof.md` has reconstructed RED prose only; do not copy it as-is into the required checkpoint.
- `extensions/whatsapp/package.json` has no plugin-local build script; use root `pnpm build` or record its exact unrelated failure.

### Relevant Documentation

- `docs/reference/test.md`: use explicit test file targets for relevant proof; `pnpm test` routes targets through scoped Vitest lanes.
- `docs/plugins/sdk-testing.md`: keep plugin tests on focused local mocks or plugin SDK subpaths; avoid broad legacy test barrels.

### Knowledge Base

- `learnings/tooling/dark-crag-3320-isolated-test-proof-when-local-wrapper-is-locked.md`: if `pnpm test <file>` is blocked by a local wrapper lock, use `node scripts/run-vitest.mjs` with the WhatsApp config and a unique cache path; record the blocker separately.
- `learnings/patterns/plan-malformed-runtime-outcomes-before-branch-reads.md`: keep the dedicated direct-mock malformed-result test focused on the consumer boundary.
- `learnings/tooling/fresh-cove-5182-acceptance-retry-plans-must-preserve-review-scope.md`: target only missing evidence; do not redo completed source work.

## Available Skills

- `tdd`: use first during implementation to assemble RED/GREEN evidence at `plans/checkpoints/dark-crag-3320.red-green-proof.md`.
- `openclaw-testing`: use only if targeted WhatsApp command output needs repo-specific triage.
- `save-learning`: mandatory final implementation action after evidence and validation.

## Solution

- Create `plans/checkpoints/dark-crag-3320.red-green-proof.md` with concrete RED, GREEN, login regression, formatter, and build output.
- Generate RED evidence without reverting the active workspace: use a temporary copy/worktree outside the repo, patch only that copy back to the pre-hardening `login.ts` behavior, run the existing malformed-result test there, and paste the real failing output.
- Run GREEN and regression commands in the current workspace and paste real passing output.
- Treat unrelated broad failures, including `src/cli/update-cli.test.ts`, as non-blocking cleanup notes only if they appear in output.

## Implementation

### Steps

1. Inspect `git status --short` and avoid touching unrelated files.
2. Create a temporary proof workspace under `/Users/michal/.openclaw/tmp/opencode/`, copy only files needed to run the WhatsApp malformed-result test, or create a temporary git worktree there.
3. In the temporary workspace only, revert the relevant `login.ts` guard to the old unsafe result handling needed for RED.
4. Run RED: `OPENCLAW_VITEST_FS_MODULE_CACHE_PATH=/Users/michal/.openclaw/tmp/opencode/vitest-cache-bold-cove-red node scripts/run-vitest.mjs run --config test/vitest/vitest.extension-whatsapp.config.ts extensions/whatsapp/src/login.malformed-result.test.ts`.
5. Save the actual RED failing output under `## RED Phase` in `plans/checkpoints/dark-crag-3320.red-green-proof.md`; include the temporary workspace method.
6. Run GREEN in the current workspace: `pnpm test extensions/whatsapp/src/login.malformed-result.test.ts`; if blocked by a wrapper lock, use the same `node scripts/run-vitest.mjs` fallback with a unique cache path and record the blocker.
7. Run broader login regression: `pnpm test extensions/whatsapp/src/login.malformed-result.test.ts extensions/whatsapp/src/login.coverage.test.ts extensions/whatsapp/src/login.test.ts`.
8. Run formatter check for touched files: `pnpm exec oxfmt --check --threads=1 extensions/whatsapp/src/login.malformed-result.test.ts plans/checkpoints/dark-crag-3320.red-green-proof.md`.
9. Run build proof: `pnpm build`; if it fails unrelated to WhatsApp login, paste the exact failing section and explain why targeted login evidence still passes.
10. Append all command outputs to `plans/checkpoints/dark-crag-3320.red-green-proof.md` with timestamps and exit status.
11. Run `skill:save-learning` and save one focused learning about the evidence recovery path.

## Files to Modify

| File                                                     | Change                                                                      |
| -------------------------------------------------------- | --------------------------------------------------------------------------- |
| `plans/checkpoints/dark-crag-3320.red-green-proof.md`    | Add required concrete RED/GREEN, regression, formatter, and build evidence. |
| `learnings/...`                                          | Add one mandatory learning via `skill:save-learning`.                       |
| `extensions/whatsapp/src/login.malformed-result.test.ts` | Leave unchanged unless rerun exposes a test-only defect.                    |
| `extensions/whatsapp/src/login.ts`                       | Leave unchanged unless current GREEN test fails.                            |

## TDD

Implementace TDD cyklu dle skill:tdd.

**Proof file:** `plans/checkpoints/dark-crag-3320.red-green-proof.md`
**Test file:** `extensions/whatsapp/src/login.malformed-result.test.ts`
**Framework:** Vitest with direct local module mocks.
**RED command:** `OPENCLAW_VITEST_FS_MODULE_CACHE_PATH=/Users/michal/.openclaw/tmp/opencode/vitest-cache-bold-cove-red node scripts/run-vitest.mjs run --config test/vitest/vitest.extension-whatsapp.config.ts extensions/whatsapp/src/login.malformed-result.test.ts`
**GREEN command:** `pnpm test extensions/whatsapp/src/login.malformed-result.test.ts`

| Existing Test                                                                | RED Evidence Required                                                                                     | GREEN Evidence Required      |
| ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ---------------------------- |
| `throws a regular fallback Error when the login result is undefined`         | Actual failure from temporary pre-hardening workspace, showing `TypeError` or fallback assertion failure. | Passes in current workspace. |
| `throws a regular fallback Error when failed result lacks message and error` | Actual failure showing missing fallback message.                                                          | Passes in current workspace. |
| `keeps status code in fallback message when present`                         | Actual failure showing missing `408` fallback.                                                            | Passes in current workspace. |
| `preserves well-formed failed message and cause`                             | Passing or unchanged in RED is acceptable; record actual output.                                          | Passes in current workspace. |

### Verification

- [ ] `pnpm test extensions/whatsapp/src/login.malformed-result.test.ts`
- [ ] `pnpm test extensions/whatsapp/src/login.malformed-result.test.ts extensions/whatsapp/src/login.coverage.test.ts extensions/whatsapp/src/login.test.ts`
- [ ] `pnpm exec oxfmt --check --threads=1 extensions/whatsapp/src/login.malformed-result.test.ts plans/checkpoints/dark-crag-3320.red-green-proof.md`
- [ ] `pnpm build`, or exact unrelated build-failure evidence.

## Dependencies

- Preserve the committed WhatsApp login implementation from `dark-crag-3320`.
- Do not obtain RED by reverting or editing the active workspace.
- Do not use unrelated broad test failures as WhatsApp login acceptance proof.

---

_Created: 2026-05-05_
_Status: DRAFT_
