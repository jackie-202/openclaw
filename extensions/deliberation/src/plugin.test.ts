import { createTestPluginApi } from "openclaw/plugin-sdk/plugin-test-api";
import { describe, expect, it, vi } from "vitest";
import plugin from "../index.js";

describe("deliberation plugin boundary", () => {
  it("registers fail-closed hooks and read-only KM health without a sender", () => {
    const on = vi.fn();
    const registerService = vi.fn();
    const registerGatewayMethod = vi.fn();

    plugin.register(
      createTestPluginApi({
        pluginConfig: {
          enabled: true,
          failClosed: true,
          sources: [{ channel: "discord", accountId: "acct-1", target: "source-1" }],
          processingSource: { channel: "discord", accountId: "acct-1", target: "process-1" },
          km: {
            endpoint: "https://km.invalid",
            credential: { source: "env", provider: "default", id: "KM_TOKEN" },
            requestTimeoutMs: 1000,
          },
          restrictedSessionKeys: ["agent:reviewer"],
        },
        on,
        registerService,
        registerGatewayMethod,
      }),
    );

    expect(on.mock.calls.map((call) => call[0])).toEqual([
      "inbound_claim",
      "before_dispatch",
      "before_tool_call",
      "message_sending",
    ]);
    expect(on.mock.calls.map((call) => call[2])).toEqual([
      { priority: 1000 },
      { priority: 1000 },
      { priority: 1000 },
      { priority: 1000 },
    ]);
    expect(registerService).not.toHaveBeenCalled();
    expect(registerGatewayMethod.mock.calls.map(([name]) => name)).toEqual([
      "deliberation.status",
      "deliberation.health",
      "deliberation.history.read",
    ]);
    expect(registerGatewayMethod.mock.calls.map((call) => call[2])).toEqual([
      { scope: "operator.read" },
      { scope: "operator.read" },
      { scope: "operator.read" },
    ]);
  });
});
