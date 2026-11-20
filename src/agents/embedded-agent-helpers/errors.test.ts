// Covers assistant error formatting for streaming, sandbox, and context errors.
import type { AssistantMessage } from "openclaw/plugin-sdk/llm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { OpenClawConfig } from "../../config/types.openclaw.js";
import { MALFORMED_STREAMING_FRAGMENT_ERROR_MESSAGE } from "../../shared/assistant-error-format.js";
import { makeAssistantMessageFixture } from "../test-helpers/assistant-message-fixtures.js";
import {
  classifyFailoverSignal,
  classifyProviderRuntimeFailureKind,
  formatAssistantErrorText,
  formatUserFacingAssistantErrorText,
  isContextOverflowError,
  isLikelyContextOverflowError,
} from "./errors.js";

const { toolPolicyAuditInfo } = vi.hoisted(() => ({
  toolPolicyAuditInfo: vi.fn(),
}));

describe("prefill memory failures", () => {
  const observed =
    "oMLX prefill memory guard rejected this prompt: Prefill would require ~61.90 GB peak (current 50.75 GB + KV+SDPA 11.15 GB) but the prefill limit is 59.80 GB (dynamic ceiling 65.00 GB - safety margin 5.20 GB). Close other apps to free RAM (macOS and other apps leave oMLX 65.00 GB of the 88.32 GB static cap, and oMLX already uses all but 14.25 GB of it), raise memory_guard_tier (safe → balanced → aggressive), or reduce context length. To continue, set Memory Guard to aggressive, raise the custom memory guard ceiling, free system memory, or compact/reduce context.";
  const envelopes = ["prefill_memory_exceeded", "prefill_memory_aborted"].flatMap((code) =>
    ["code", "omlx_code"].flatMap((field) => [
      JSON.stringify({
        error: { type: "invalid_request_error", [field]: code, message: "Request rejected" },
        type: "error",
      }),
      `400 ${JSON.stringify({ error: { type: "invalid_request_error", [field]: code } })}`,
    ]),
  );

  it.each([observed, `400 ${observed}`, ...envelopes])(
    "keeps memory failures out of token/schema recovery: %s",
    (raw) => {
      expect(isContextOverflowError(raw)).toBe(false);
      expect(isLikelyContextOverflowError(raw)).toBe(false);
      expect(classifyFailoverSignal({ status: 400, message: raw })).toBeNull();
      expect(classifyProviderRuntimeFailureKind({ status: 400, message: raw })).not.toBe("schema");
      const msg = makeAssistantMessageFixture({ errorMessage: raw });
      for (const text of [formatAssistantErrorText(msg), formatUserFacingAssistantErrorText(msg)]) {
        expect(text).toMatch(/memory/i);
        expect(text).not.toMatch(/schema|tool payload|context overflow|aggressive|raise.*ceiling/i);
        expect(text).toMatch(raw.includes("prefill_memory_aborted") ? /interrupt/i : /headroom/i);
      }
      expect(msg.errorMessage).toBe(raw);
    },
  );

  it("retains malformed tool schema copy and genuine token overflow", () => {
    const raw =
      '400 {"error":{"type":"invalid_request_error","message":"Invalid tool payload schema"}}';
    expect(classifyFailoverSignal({ status: 400, message: raw })).toEqual({
      kind: "reason",
      reason: "format",
    });
    expect(
      formatUserFacingAssistantErrorText(makeAssistantMessageFixture({ errorMessage: raw })),
    ).toMatch(/schema|tool payload/i);
    expect(isLikelyContextOverflowError("maximum context length exceeded")).toBe(true);
  });

  it.each([
    "400 memory allocation failed",
    "400 prompt memory limit reached",
    "400 prefill_memory_exceeded_extra",
    "400 oMLX resource limit reached",
  ])("does not assign memory-guard semantics to near misses: %s", (raw) => {
    expect(classifyFailoverSignal({ status: 400, message: raw })).toEqual({
      kind: "reason",
      reason: "format",
    });
    expect(
      formatUserFacingAssistantErrorText(makeAssistantMessageFixture({ errorMessage: raw })),
    ).not.toMatch(/headroom|prefill.*interrupt/i);
  });
});

vi.mock("../../logging/subsystem.js", () => ({
  createSubsystemLogger: () => ({
    debug: vi.fn(),
    error: vi.fn(),
    info: toolPolicyAuditInfo,
    warn: vi.fn(),
  }),
}));

describe("formatAssistantErrorText streaming JSON parse classification", () => {
  beforeEach(() => {
    toolPolicyAuditInfo.mockClear();
  });

  const makeAssistantError = (errorMessage: string): AssistantMessage =>
    makeAssistantMessageFixture({
      errorMessage,
      content: [{ type: "text", text: errorMessage }],
    });

  it("suppresses transport-classified malformed streaming fragments", () => {
    // Transport JSON fragmentation is not user-authored content and should get
    // stable retry copy instead of raw parser text.
    const msg = makeAssistantError(MALFORMED_STREAMING_FRAGMENT_ERROR_MESSAGE);
    expect(formatAssistantErrorText(msg)).toBe(
      "LLM streaming response contained a malformed fragment. Please try again.",
    );
  });

  it("does not suppress unclassified JSON.parse text", () => {
    const msg = makeAssistantError(
      "Expected ',' or '}' after property value in JSON at position 334 (line 1 column 335)",
    );
    expect(formatAssistantErrorText(msg)).toBe(
      "Expected ',' or '}' after property value in JSON at position 334 (line 1 column 335)",
    );
  });

  it("keeps non-streaming provider request-validation syntax diagnostics", () => {
    const msg = makeAssistantError(
      '{"type":"error","error":{"type":"invalid_request_error","message":"Expected value in JSON at position 12 for messages.0.content"}}',
    );
    expect(formatAssistantErrorText(msg)).toBe(
      "LLM request rejected: Expected value in JSON at position 12 for messages.0.content",
    );
  });

  it("audits a sandbox tool-policy block once per assistant error", () => {
    // Formatting may be called multiple times for the same error; audit logs
    // should stay deduplicated per blocked assistant error.
    const cfg: OpenClawConfig = {
      agents: {
        defaults: {
          sandbox: { mode: "non-main", scope: "agent" },
        },
      },
      tools: {
        sandbox: {
          tools: {
            deny: ["browser"],
          },
        },
      },
    };
    const msg = makeAssistantError("unknown tool: browser");

    expect(
      formatAssistantErrorText(msg, { cfg, sessionKey: "agent:main:mobilechat:g1" }),
    ).toContain('Tool "browser" blocked by sandbox tool policy');
    expect(
      formatAssistantErrorText(msg, { cfg, sessionKey: "agent:main:mobilechat:g1" }),
    ).toContain('Tool "browser" blocked by sandbox tool policy');

    expect(toolPolicyAuditInfo).toHaveBeenCalledTimes(1);
    expect(toolPolicyAuditInfo).toHaveBeenCalledWith(
      "sandbox tool policy blocked browser via tools.sandbox.tools.deny; matched browser",
      {
        tool: "browser",
        ruleKind: "deny",
        ruleSource: "global",
        configKey: "tools.sandbox.tools.deny",
        matchedRule: "browser",
        sandboxMode: "non-main",
      },
    );
  });
});

describe("isLikelyContextOverflowError", () => {
  it("detects Codex promptError wording for a full context window", () => {
    expect(
      isLikelyContextOverflowError(
        "Codex ran out of room in the model's context window. Start a new thread or clear earlier history before retrying.",
      ),
    ).toBe(true);
  });
});
