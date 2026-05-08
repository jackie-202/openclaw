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
      ({
        channels: {
          whatsapp: {
            accounts: {
              default: { enabled: true },
            },
          },
        },
      }) as never,
  };
});

vi.mock("./auth-store.js", async () => {
  const actual = await vi.importActual<typeof import("./auth-store.js")>("./auth-store.js");
  return {
    ...actual,
    restoreCredsFromBackupIfNeeded: vi.fn(async () => false),
  };
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
    expect(err).not.toBeInstanceOf(TypeError);
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
    waitState.result = {
      outcome: "failed",
      message: "status=408 Request Time-out",
      error: cause,
    };

    const err = await captureLoginError();

    expect((err as Error).message).toBe("status=408 Request Time-out");
    expect((err as Error).cause).toBe(cause);
  });
});
