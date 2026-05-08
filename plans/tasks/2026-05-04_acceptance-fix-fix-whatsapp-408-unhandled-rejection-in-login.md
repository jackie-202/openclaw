# [acceptance-fix] Fix WhatsApp 408 unhandled rejection in login.ts: Add RED/GREEN malformed-result coverage with direct mocks in `extensions/whatsap

Auto-created by the monitor because the original task `warm-reef-4350` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- Add RED/GREEN malformed-result coverage with direct mocks in `extensions/whatsapp/src/login.malformed-result.test.ts`.
- Provide required TDD proof for `plans/checkpoints/warm-reef-4350.red-green-proof.md`.
- Run targeted tests and WhatsApp plugin build.
- [P1] Missing planned login-flow malformed-result test (extensions/whatsapp/src/login.coverage.test.ts) -> Add the planned `extensions/whatsapp/src/login.malformed-result.test.ts` or equivalent login-flow test that mocks `waitForWhatsAppLoginResult` returning malformed values and proves `loginWeb` throws a normal fallback `Error`.
- [P1] Missing TDD RED/GREEN proof (plans/checkpoints/warm-reef-4350.red-green-proof.md) -> Provide the TDD proof file showing the malformed-result tests failing before the implementation and passing after.
- [P1] No relevant passing validation evidence (test output) -> Provide passing output for targeted WhatsApp tests and the WhatsApp plugin build, or explain why the shown unrelated suite-wide failures do not apply with separate targeted proof.

## Additional cleanup (suite-wide)

- [P2] Broad suite failure from unpublished runtime packages (src/plugins/bundled-runtime-root.test.ts) -> Track separately; the shown failures are unrelated to the WhatsApp login change and come from `qqbot-runtime` / `whatsapp-runtime` registry 404s.

## Context

- Original task: `warm-reef-4350`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Implement the remaining primary goals above first, then handle any listed cleanup items. The original implementation is committed —
build on it, do not revert or redo completed work.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-05-04_warm-reef-4350_fix-whatsapp-408-unhandled-rejection-in-login-ts.md` for full context. Focus only on the unmet goals listed above.

## Previous attempt: acceptance context

**Why incomplete:** The production hardening appears to implement the core login boundary fix, but planned acceptance evidence is missing: no dedicated login-flow malformed-result test, no TDD RED/GREEN proof, and no relevant passing targeted test/build output.

**Already done (do NOT redo):**

- Harden `extensions/whatsapp/src/login.ts` so malformed login results do not throw TypeError before normal error handling.
- Add a safe local login error builder that derives message/status/cause without unsafe property reads.
- Preserve connected behavior and well-formed failed/logged-out messages and causes.
- Keep change local to WhatsApp login consumer boundary without changing `connection-controller.ts` or core/shared seams.

## Implementation session log excerpt (last 50 lines)

```
ed-out error message behavior.
- Added regression tests in `extensions/whatsapp/src/login.coverage.test.ts`.
- Maintained checkpoint at `plans/checkpoints/warm-reef-4350.checkpoint.md`.
- Saved required learning: `learnings/runtime-errors/warm-reef-4350-defensive-plugin-login-errors.md`.

Verification:
- `pnpm exec oxfmt --check --threads=1 extensions/whatsapp/src/login.ts extensions/whatsapp/src/login.coverage.test.ts` passed.
- `pnpm test extensions/whatsapp/src/login.coverage.test.ts extensions/whatsapp/src/login.test.ts` passed: 9 tests.
- Root `pnpm build` passed.
- `pnpm build` from `extensions/whatsapp` failed because that package has no `build` script.
- `pnpm test extensions/whatsapp` ran, but failed in unrelated existing group activation/gating tests, not touched by this change.

```
