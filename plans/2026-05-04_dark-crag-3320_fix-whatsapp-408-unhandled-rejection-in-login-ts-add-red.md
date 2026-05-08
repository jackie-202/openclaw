# Plan 2026-05-04: WhatsApp Login Malformed-Result Acceptance Fix

Add the missing login-flow regression test and acceptance proof for the already-applied WhatsApp login hardening.

## Analysis

### Codebase Context

- `extensions/whatsapp/src/login.ts:34` already exposes `buildLoginError(...)` and treats `waitForWhatsAppLoginResult(...)` as `unknown`; do not redo this implementation unless the new login-flow test exposes a gap.
- `extensions/whatsapp/src/login.coverage.test.ts:135` covers `buildLoginError(...)` directly; this is insufficient because acceptance requires `loginWeb(...)` coverage with `waitForWhatsAppLoginResult` mocked to malformed values.
- No `extensions/whatsapp/src/login.malformed-result.test.ts` exists; add it as the dedicated acceptance test file from the original plan.
- `plans/checkpoints/warm-reef-4350.red-green-proof.md` is missing; create it with concrete RED and GREEN command output.
- `extensions/whatsapp/package.json` has no package-local `build` script; use root `pnpm build` as the build proof, and explicitly record that `pnpm --dir extensions/whatsapp build` is not a valid WhatsApp-local script if asked for package-local build evidence.

### Relevant Documentation

- `docs/plugins/sdk-testing.md`: keep plugin tests on local mocks or focused SDK subpaths; avoid broad `openclaw/plugin-sdk/testing` imports.
- `docs/reference/test.md`: run explicit test files for scoped proof; avoid broad directory targets when acceptance needs relevant output.

### Knowledge Base

- `learnings/patterns/plan-malformed-runtime-outcomes-before-branch-reads.md`: test `undefined` producer results before branch reads and use direct producer mocks for impossible malformed union values.
- `learnings/runtime-errors/warm-reef-4350-defensive-plugin-login-errors.md`: normalize typed plugin helper results as `unknown` before reading `outcome`, `message`, or `error`.
- `learnings/tooling/fresh-cove-5182-acceptance-retry-plans-must-preserve-review-scope.md`: acceptance retries should target only missing evidence and concrete artifacts.

## Available Skills

- `tdd`: use first in implementation to create RED/GREEN proof in `plans/checkpoints/warm-reef-4350.red-green-proof.md`.
- `openclaw-testing`: use only if targeted WhatsApp test or root build output needs repo-specific triage.
- `save-learning`: run after the implementation and validation work; this is a mandatory final implementation action.

## Solution

- Add `extensions/whatsapp/src/login.malformed-result.test.ts` with direct `vi.mock(...)` seams for `./connection-controller.js`, `./session.js`, `./auth-store.js`, and runtime config.
- Assert `loginWeb(false)` throws a normal fallback `Error`, not `TypeError`, when `waitForWhatsAppLoginResult` resolves `undefined`, `{ outcome: "failed" }`, and `{ outcome: "failed", statusCode: 408 }`.
- Assert `loginWeb(false)` preserves well-formed failed `message` and `cause`.
- Keep `extensions/whatsapp/src/login.ts` unchanged unless the new login-flow test fails on the current implementation.
- Put RED and GREEN command output into `plans/checkpoints/warm-reef-4350.red-green-proof.md`, including how RED was obtained without reverting committed work.
- Treat `src/plugins/bundled-runtime-root.test.ts` registry 404 failures as separate cleanup; do not fix `qqbot-runtime` or `whatsapp-runtime` in this task.

## Implementation

### Pre-Implementation Checklist

- [ ] Inspect current diff and avoid touching unrelated untracked learning/task files.
- [ ] Start with `skill:tdd` and create the missing test file before any production edit.
- [ ] Use explicit test file targets for proof.
- [ ] Capture command output directly in the proof file.

### Steps

1. Create `extensions/whatsapp/src/login.malformed-result.test.ts` from the TDD skeleton below.
2. Establish RED proof non-destructively: run the test against the pre-fix `login.ts` from the warm-reef parent using a temporary copy/worktree outside the repo, or record the original pre-fix command output if it already exists; do not revert the current workspace.
3. Run GREEN in the current workspace with `pnpm test extensions/whatsapp/src/login.malformed-result.test.ts`.
4. Run login regression coverage with `pnpm test extensions/whatsapp/src/login.malformed-result.test.ts extensions/whatsapp/src/login.coverage.test.ts extensions/whatsapp/src/login.test.ts`.
5. Run formatting for touched files with `pnpm exec oxfmt --check --threads=1 extensions/whatsapp/src/login.malformed-result.test.ts plans/checkpoints/warm-reef-4350.red-green-proof.md`.
6. Run build proof with `pnpm build`; if it fails only in unpublished runtime package registry fetches, record the exact unrelated `qqbot-runtime` / `whatsapp-runtime` 404 evidence and the passing targeted WhatsApp tests.
7. Create `plans/checkpoints/warm-reef-4350.red-green-proof.md` with RED command, GREEN command, targeted test output, build output, and unrelated broad-suite cleanup note.
8. Run `skill:save-learning` and save one focused learning from the acceptance retry.

## Files to Modify

| File                                                     | Change                                                                       |
| -------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `extensions/whatsapp/src/login.malformed-result.test.ts` | Add direct-mock login-flow malformed-result tests for `loginWeb(...)`.       |
| `plans/checkpoints/warm-reef-4350.red-green-proof.md`    | Add required RED/GREEN proof and targeted validation output.                 |
| `extensions/whatsapp/src/login.ts`                       | Only adjust if the new login-flow test exposes a current implementation gap. |
| `learnings/...`                                          | Add one learning via `skill:save-learning` after implementation.             |

## TDD

**Workflow for implementing agent:**

1. Create `extensions/whatsapp/src/login.malformed-result.test.ts` first.
2. Run RED against the pre-fix source in a temporary copy/worktree; do not revert current committed work.
3. Run GREEN against the current workspace.
4. Save evidence to `plans/checkpoints/warm-reef-4350.red-green-proof.md`.
5. Implementace TDD cyklu dle skill:tdd.

### Targeted Tests

**Test file:** `extensions/whatsapp/src/login.malformed-result.test.ts`
**Framework:** Vitest with direct local module mocks.
**Run command:** `pnpm test extensions/whatsapp/src/login.malformed-result.test.ts`
**Edit hint:** NEW FILE.

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const waitState = vi.hoisted(() => ({
  result: undefined as unknown,
}));

vi.mock("openclaw/plugin-sdk/runtime-config-snapshot", async () => {
  const actual = await vi.importActual<
    typeof import("openclaw/plugin-sdk/runtime-config-snapshot")
  >("openclaw/plugin-sdk/runtime-config-snapshot");
  return {
    ...actual,
    getRuntimeConfig: () =>
      ({ channels: { whatsapp: { accounts: { default: { enabled: true } } } } }) as never,
  };
});

vi.mock("./auth-store.js", async () => {
  const actual = await vi.importActual<typeof import("./auth-store.js")>("./auth-store.js");
  return { ...actual, restoreCredsFromBackupIfNeeded: vi.fn(async () => false) };
});

vi.mock("./session.js", async () => {
  const actual = await vi.importActual<typeof import("./session.js")>("./session.js");
  return {
    ...actual,
    createWaSocket: vi.fn(async () => ({ ws: { close: vi.fn() } })),
    waitForWaConnection: vi.fn(),
  };
});

vi.mock("./connection-controller.js", async () => {
  const actual = await vi.importActual<typeof import("./connection-controller.js")>(
    "./connection-controller.js",
  );
  return {
    ...actual,
    closeWaSocketSoon: vi.fn(),
    waitForWhatsAppLoginResult: vi.fn(async () => waitState.result as never),
  };
});

import { loginWeb } from "./login.js";

async function captureLoginError() {
  try {
    await loginWeb(false);
  } catch (err) {
    return err;
  }
  throw new Error("Expected loginWeb to throw");
}

describe("loginWeb malformed login results", () => {
  beforeEach(() => {
    waitState.result = undefined;
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("throws a regular fallback Error when the login result is undefined", async () => {
    waitState.result = undefined;

    const err = await captureLoginError();

    expect(err).toBeInstanceOf(Error);
    expect(err).not.toBeInstanceOf(TypeError); // RED: old code read result.outcome.
    expect((err as Error).message).toBe("WhatsApp login failed: unknown");
  });

  it("throws a regular fallback Error when failed result lacks message and error", async () => {
    waitState.result = { outcome: "failed" };

    const err = await captureLoginError();

    expect(err).toBeInstanceOf(Error);
    expect(err).not.toBeInstanceOf(TypeError);
    expect((err as Error).message).toBe("WhatsApp login failed: unknown");
    expect((err as Error).cause).toBeUndefined();
  });

  it("keeps status code in fallback message when present", async () => {
    waitState.result = { outcome: "failed", statusCode: 408 };

    const err = await captureLoginError();

    expect((err as Error).message).toBe("WhatsApp login failed: 408");
  });

  it("preserves well-formed failed message and cause", async () => {
    const cause = new Error("socket closed");
    waitState.result = { outcome: "failed", message: "status=408 Request Time-out", error: cause };

    const err = await captureLoginError();

    expect((err as Error).message).toBe("status=408 Request Time-out");
    expect((err as Error).cause).toBe(cause);
  });
});
```

| Test                      | RED Before Implementation                | GREEN After Implementation                        |
| ------------------------- | ---------------------------------------- | ------------------------------------------------- |
| undefined result          | `TypeError` from `result.outcome`        | `Error: WhatsApp login failed: unknown`           |
| partial failed result     | unsafe/missing fallback message behavior | `Error: WhatsApp login failed: unknown`, no cause |
| failed with status code   | fallback omits guarded status            | `Error: WhatsApp login failed: 408`               |
| well-formed failed result | behavior must not regress                | original message and cause preserved              |

### Verification

- [ ] `pnpm test extensions/whatsapp/src/login.malformed-result.test.ts`
- [ ] `pnpm test extensions/whatsapp/src/login.malformed-result.test.ts extensions/whatsapp/src/login.coverage.test.ts extensions/whatsapp/src/login.test.ts`
- [ ] `pnpm exec oxfmt --check --threads=1 extensions/whatsapp/src/login.malformed-result.test.ts plans/checkpoints/warm-reef-4350.red-green-proof.md`
- [ ] `pnpm build`, or record exact unrelated registry 404 failure and explain why targeted WhatsApp tests are the relevant acceptance proof.

## Dependencies

- The current committed warm-reef source fix remains the implementation baseline.
- RED proof needs either historical pre-fix output or a temporary pre-fix worktree/copy; never obtain RED by reverting the active workspace.

---

_Created: 2026-05-04_
_Status: DRAFT_
