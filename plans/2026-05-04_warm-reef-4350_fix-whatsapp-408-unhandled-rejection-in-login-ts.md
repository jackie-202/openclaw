# Plan 2026-05-04: Fix WhatsApp 408 Unhandled Rejection In Login

Harden the WhatsApp login failure boundary so malformed runtime outcomes produce normal `Error`s instead of TypeErrors.

## Analysis

### Codebase Context

- `extensions/whatsapp/src/login.ts:28` awaits `waitForWhatsAppLoginResult(...)`, then immediately reads `result.outcome`; guard `result` before any branch read.
- `extensions/whatsapp/src/login.ts:53` logged-out branch throws with `cause: result.error`; route this through a safe error builder.
- `extensions/whatsapp/src/login.ts:64` failed branch logs `result.message` and throws with `cause: result.error`; route this through the same safe builder.
- `extensions/whatsapp/src/connection-controller.ts:170` declares `Promise<WhatsAppLoginWaitResult>` and normally returns well-formed outcomes; keep the type union unchanged and harden only the consumer boundary.
- `extensions/whatsapp/src/login.coverage.test.ts` already tests 515 restart, 401 logout, and generic formatting through `waitForWaConnection`; add malformed-result coverage in a dedicated test that mocks `waitForWhatsAppLoginResult` directly.
- `extensions/AGENTS.md` keeps plugin production code inside plugin/package boundaries; do not add core imports or shared SDK seams for this local bug.

### Relevant Documentation

- `docs/plugins/sdk-testing.md`: keep plugin tests on focused SDK/test subpaths or local mocks; avoid broad legacy `plugin-sdk/testing` imports.
- `docs/reference/test.md`: run explicit test files or concrete globs for scoped Vitest proof; avoid directory targets that may route to the wrong project config.

### Knowledge Base

- `learnings/runtime-errors/fresh-mist-4301-baileys-408-login-failures-surface-through-a-structured-disconnect-path.md`: 408 login failures flow through `waitForWaConnection` → `waitForWhatsAppLoginResult` → `loginWeb` throw site.
- `learnings/patterns/fresh-mist-4301-upstream-history-may-contain-adjacent-fixes-without-covering-the-actual-crash-si.md`: verify the exact crash site instead of assuming nearby upstream WhatsApp login fixes cover it.
- `learnings/tooling/warm-fork-9899-use-concrete-vitest-file-globs-when-directory-targets-hit-the-wrong-project-conf.md`: validate with explicit test files or globs.

## Available Skills

- `tdd`: use first during implementation; create RED malformed-result tests before editing `login.ts`.
- `openclaw-testing`: use if targeted WhatsApp tests or build fail and need repo-specific test triage.
- `save-learning`: run after implementation is complete and capture any new gotcha.

## Solution

- Add a local helper in `extensions/whatsapp/src/login.ts`, for example `buildLoginError(result, fallbackStatusMessage)`, that accepts `unknown` or a partial login result shape.
- Derive message as `typeof result?.message === "string" && result.message.length > 0 ? result.message : \`WhatsApp login failed: ${statusCode ?? "unknown"}\``.
- Derive cause as `result?.error` only after narrowing `result` to a non-null object; never dereference `result.error` directly in branch code.
- After awaiting `waitForWhatsAppLoginResult`, handle missing/non-object results before reading `result.outcome`.
- Preserve connected behavior and well-formed failed/logged-out messages and causes.
- Keep the change local to `login.ts`; do not refactor `connection-controller.ts` or add 408-specific reconnect behavior.

## Implementation

### Pre-Implementation Checklist

- [ ] Start with `skill:tdd` and create the malformed-result tests first.
- [ ] Keep production imports within `extensions/whatsapp` and documented plugin SDK subpaths.
- [ ] Avoid changing `WhatsAppLoginWaitResult` or `connection-controller.ts` unless tests prove the consumer-only guard is insufficient.

### Steps

1. Add `extensions/whatsapp/src/login.malformed-result.test.ts` with direct mocks for `./connection-controller.js`, `./session.js`, auth restore, and runtime config.
2. Run `pnpm test extensions/whatsapp/src/login.malformed-result.test.ts` and confirm RED failures show TypeError or the old missing-message behavior.
3. Add a small safe helper in `extensions/whatsapp/src/login.ts` that narrows malformed results and builds an `Error` without unsafe property reads.
4. Guard the post-await value before `result.outcome`; throw the helper-built fallback error for undefined/null/non-object results.
5. Replace both `cause: result.error` throw sites with the helper while preserving the logged-out fixed message and well-formed failed message.
6. Run targeted tests, then run the WhatsApp plugin build from `extensions/whatsapp`.
7. Include `plans/investigations/wild-reef-6230_whatsapp-408-unhandled-rejection.md` in the eventual commit message.

## Files To Modify

| File                                                     | Change                                                                                                            |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `extensions/whatsapp/src/login.ts`                       | Add safe login error builder and remove direct unsafe `result.error` / `result.message` reads from failure paths. |
| `extensions/whatsapp/src/login.malformed-result.test.ts` | Add RED/GREEN unit tests for undefined, partial failed, logged-out partial, and well-formed failed outcomes.      |

## TDD

**Workflow for implementing agent:**

1. Create the test file from the skeleton below.
2. Run the targeted test and confirm RED.
3. Implement `login.ts` changes.
4. Run the targeted test and confirm GREEN.
5. Run the existing WhatsApp login coverage tests.

> Implementace TDD cyklu dle skill:tdd.

### Targeted Tests

**Test file:** `extensions/whatsapp/src/login.malformed-result.test.ts`
**Framework:** Vitest with local module mocks.
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
    expect(err).not.toBeInstanceOf(TypeError); // RED: current code reads result.outcome.
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

| Test                      | RED Before Implementation                                          | GREEN After Implementation                        |
| ------------------------- | ------------------------------------------------------------------ | ------------------------------------------------- |
| undefined result          | TypeError from `result.outcome` or unsafe property read            | `Error: WhatsApp login failed: unknown`           |
| partial failed result     | Missing/undefined message behavior or unsafe `result.error` access | `Error: WhatsApp login failed: unknown`, no cause |
| failed with status code   | Fallback does not include status                                   | `Error: WhatsApp login failed: 408`               |
| well-formed failed result | Should already pass or preserve behavior                           | Original message and cause preserved              |

### Verification

- [ ] `pnpm test extensions/whatsapp/src/login.malformed-result.test.ts`
- [ ] `pnpm test extensions/whatsapp/src/login.coverage.test.ts extensions/whatsapp/src/login.test.ts`
- [ ] From `extensions/whatsapp`: `pnpm build`
- [ ] Post-merge only: after the next real WhatsApp 408 event, inspect `~/.openclaw/logs/stability/` for no new `unhandled_rejection` bundles from this path.

## Dependencies

- Baileys 408 behavior remains unchanged; this plan only makes the login consumer defensive.
- Runtime stability-bundle verification needs a real or reproduced WhatsApp 408 after merge and is not an acceptance gate.

---

_Created: 2026-05-04_
_Status: DRAFT_
