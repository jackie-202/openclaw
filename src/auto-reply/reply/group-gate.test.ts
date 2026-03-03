import fs from "node:fs";
import { completeSimple, type AssistantMessage } from "@mariozechner/pi-ai";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { OpenClawConfig } from "../../config/config.js";
import { _test, runGroupGate } from "./group-gate.js";

const { readRecentSessionTranscript, buildGatePrompt, parseGateResponse, resolveMentionsInBody } =
  _test;

// ── Module mocks ───────────────────────────────────────────────────────

vi.mock("@mariozechner/pi-ai", () => ({
  completeSimple: vi.fn(),
  getOAuthProviders: () => [],
  getOAuthApiKey: vi.fn(async () => null),
}));

vi.mock("../../agents/pi-embedded-runner/model.js", () => ({
  resolveModel: vi.fn((_provider: string, modelId: string) => ({
    model: {
      provider: "copilot",
      id: modelId,
      name: modelId,
      api: "openai-completions",
      reasoning: false,
      input: ["text"],
      cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
      contextWindow: 128000,
      maxTokens: 8192,
    },
    authStorage: { profiles: {} },
    modelRegistry: { find: vi.fn() },
  })),
}));

vi.mock("../../agents/model-auth.js", () => ({
  getApiKeyForModel: vi.fn(async () => ({
    apiKey: "test-api-key",
    source: "test",
    mode: "api-key",
  })),
  requireApiKey: vi.fn((auth: { apiKey?: string }) => auth.apiKey ?? ""),
}));

vi.mock("../../agents/model-selection.js", () => ({
  parseModelRef: vi.fn((modelString: string, defaultProvider: string) => {
    const parts = modelString.split("/");
    if (parts.length === 2) {
      return { provider: parts[0], model: parts[1] };
    }
    return { provider: defaultProvider, model: modelString };
  }),
}));

vi.mock("../../agents/agent-scope.js", () => ({
  resolveDefaultAgentId: vi.fn(() => "default"),
}));

vi.mock("../../config/sessions.js", () => ({
  resolveStorePath: vi.fn(() => "/tmp/test-store"),
  loadSessionStore: vi.fn(() => ({
    "test-session": { sessionId: "sess-123" },
  })),
  resolveSessionFilePath: vi.fn(() => "/tmp/test-session.jsonl"),
  resolveSessionFilePathOptions: vi.fn(() => ({})),
}));

vi.mock("../../logging/subsystem.js", () => ({
  createSubsystemLogger: vi.fn(() => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  })),
}));

// ── Helpers ────────────────────────────────────────────────────────────

const mockAssistantMessage = (text: string): AssistantMessage => ({
  role: "assistant",
  content: [{ type: "text", text }],
  api: "openai-completions",
  provider: "copilot",
  model: "gpt-4o-mini",
  usage: {
    input: 1,
    output: 1,
    cacheRead: 0,
    cacheWrite: 0,
    totalTokens: 2,
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 },
  },
  stopReason: "stop",
  timestamp: Date.now(),
});

function makeSessionJSONL(messages: Array<{ role: string; content: string }>): string {
  return messages
    .map((m) => JSON.stringify({ type: "message", message: { role: m.role, content: m.content } }))
    .join("\n");
}

const baseCfg: OpenClawConfig = {
  agents: {
    defaults: {
      groupGate: {
        enabled: true,
        model: "copilot/gpt-4o-mini",
      },
    },
  },
} as OpenClawConfig;

// ── Tests ──────────────────────────────────────────────────────────────

describe("group-gate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── parseGateResponse ──────────────────────────────────────────────

  describe("parseGateResponse", () => {
    it("parses a valid JSON response with shouldRespond: true", () => {
      const result = parseGateResponse('{"shouldRespond": true, "reason": "direct question"}');
      expect(result).toEqual({ shouldRespond: true, reason: "direct question" });
    });

    it("parses a valid JSON response with shouldRespond: false", () => {
      const result = parseGateResponse('{"shouldRespond": false, "reason": "just banter"}');
      expect(result).toEqual({ shouldRespond: false, reason: "just banter" });
    });

    it("strips markdown code fences", () => {
      const result = parseGateResponse(
        '```json\n{"shouldRespond": true, "reason": "question"}\n```',
      );
      expect(result).toEqual({ shouldRespond: true, reason: "question" });
    });

    it("treats non-true shouldRespond as false", () => {
      const result = parseGateResponse('{"shouldRespond": "yes", "reason": "maybe"}');
      expect(result.shouldRespond).toBe(false);
    });

    it("handles missing reason field gracefully", () => {
      const result = parseGateResponse('{"shouldRespond": true}');
      expect(result).toEqual({ shouldRespond: true, reason: "unknown" });
    });

    it("falls back to keyword search when JSON is invalid", () => {
      const result = parseGateResponse('Sure! {"shouldRespond": true, "reason": "test"}...');
      // JSON.parse fails on this, but keyword search finds "shouldrespond": true
      expect(result.shouldRespond).toBe(true);
    });

    it("defaults to shouldRespond: false when parsing completely fails", () => {
      const result = parseGateResponse("I think you should respond to this message");
      expect(result).toEqual({ shouldRespond: false, reason: "failed to parse gate response" });
    });

    it("handles empty string", () => {
      const result = parseGateResponse("");
      expect(result.shouldRespond).toBe(false);
    });
  });

  // ── buildGatePrompt ────────────────────────────────────────────────

  describe("buildGatePrompt", () => {
    it("includes transcript, sender, and message", () => {
      const prompt = buildGatePrompt(
        ["User: hello", "Assistant: hi there"],
        "Alice",
        "What time is it?",
      );
      expect(prompt).toContain("User: hello");
      expect(prompt).toContain("Assistant: hi there");
      expect(prompt).toContain("Alice: What time is it?");
      expect(prompt).toContain("last 2 messages");
    });

    it("shows placeholder when transcript is empty", () => {
      const prompt = buildGatePrompt([], "Bob", "hey");
      expect(prompt).toContain("(No prior conversation history)");
      expect(prompt).toContain("Bob: hey");
    });

    it("includes decision guidance and response format", () => {
      const prompt = buildGatePrompt([], "Eve", "test");
      expect(prompt).toContain("Patterns that usually warrant a response");
      expect(prompt).toContain("Patterns that usually don't");
      expect(prompt).toContain("shouldRespond");
    });
  });

  // ── readRecentSessionTranscript ────────────────────────────────────

  describe("readRecentSessionTranscript", () => {
    it("reads and formats user/assistant messages from JSONL", () => {
      const jsonl = makeSessionJSONL([
        { role: "user", content: "Hello" },
        { role: "assistant", content: "Hi!" },
        { role: "user", content: "How are you?" },
      ]);
      vi.spyOn(fs, "readFileSync").mockReturnValue(jsonl);

      const result = readRecentSessionTranscript("/fake/path.jsonl", 10);
      expect(result).toEqual(["User: Hello", "Assistant: Hi!", "User: How are you?"]);
    });

    it("respects the limit parameter", () => {
      const jsonl = makeSessionJSONL([
        { role: "user", content: "msg1" },
        { role: "assistant", content: "msg2" },
        { role: "user", content: "msg3" },
        { role: "assistant", content: "msg4" },
      ]);
      vi.spyOn(fs, "readFileSync").mockReturnValue(jsonl);

      const result = readRecentSessionTranscript("/fake/path.jsonl", 2);
      expect(result).toEqual(["User: msg3", "Assistant: msg4"]);
    });

    it("handles array content blocks", () => {
      const jsonl = JSON.stringify({
        type: "message",
        message: {
          role: "user",
          content: [{ type: "text", text: "array content" }],
        },
      });
      vi.spyOn(fs, "readFileSync").mockReturnValue(jsonl);

      const result = readRecentSessionTranscript("/fake/path.jsonl", 10);
      expect(result).toEqual(["User: array content"]);
    });

    it("skips non-message lines and invalid JSON", () => {
      const lines = [
        JSON.stringify({ type: "system", message: { role: "system", content: "sys" } }),
        "not json at all",
        JSON.stringify({ type: "message", message: { role: "user", content: "valid" } }),
      ].join("\n");
      vi.spyOn(fs, "readFileSync").mockReturnValue(lines);

      const result = readRecentSessionTranscript("/fake/path.jsonl", 10);
      expect(result).toEqual(["User: valid"]);
    });

    it("returns empty array when file does not exist", () => {
      vi.spyOn(fs, "readFileSync").mockImplementation(() => {
        throw new Error("ENOENT");
      });

      const result = readRecentSessionTranscript("/nonexistent.jsonl", 10);
      expect(result).toEqual([]);
    });
  });

  // ── runGroupGate ───────────────────────────────────────────────────

  describe("runGroupGate", () => {
    it("returns shouldRespond: true when gate is not enabled", async () => {
      const cfg = { agents: { defaults: {} } } as OpenClawConfig;
      const result = await runGroupGate({
        cfg,
        agentId: "default",
        sessionKey: "test-session",
        senderName: "Alice",
        messageBody: "hello",
      });
      expect(result).toEqual({ shouldRespond: true, reason: "gate not enabled" });
      expect(completeSimple).not.toHaveBeenCalled();
    });

    it("returns shouldRespond: true when groupGate config is missing", async () => {
      const cfg = {} as OpenClawConfig;
      const result = await runGroupGate({
        cfg,
        agentId: "default",
        sessionKey: "test-session",
        senderName: "Alice",
        messageBody: "hello",
      });
      expect(result).toEqual({ shouldRespond: true, reason: "gate not enabled" });
    });

    it("calls completeSimple and returns parsed result when gate is enabled", async () => {
      vi.spyOn(fs, "readFileSync").mockReturnValue(
        makeSessionJSONL([
          { role: "user", content: "What's the weather?" },
          { role: "assistant", content: "It's sunny today." },
        ]),
      );
      vi.mocked(completeSimple).mockResolvedValue(
        mockAssistantMessage('{"shouldRespond": false, "reason": "already answered"}'),
      );

      const result = await runGroupGate({
        cfg: baseCfg,
        agentId: "default",
        sessionKey: "test-session",
        senderName: "Bob",
        messageBody: "ok thanks",
      });

      expect(result).toEqual({ shouldRespond: false, reason: "already answered" });
      expect(completeSimple).toHaveBeenCalledTimes(1);
    });

    it("returns shouldRespond: true when completeSimple returns empty content", async () => {
      vi.spyOn(fs, "readFileSync").mockReturnValue(makeSessionJSONL([]));
      vi.mocked(completeSimple).mockResolvedValue(mockAssistantMessage(""));

      const result = await runGroupGate({
        cfg: baseCfg,
        agentId: "default",
        sessionKey: "test-session",
        senderName: "Eve",
        messageBody: "test",
      });

      expect(result.shouldRespond).toBe(true);
      expect(result.reason).toContain("empty");
    });

    it("returns shouldRespond: true (safe fallback) on error", async () => {
      vi.spyOn(fs, "readFileSync").mockReturnValue(makeSessionJSONL([]));
      vi.mocked(completeSimple).mockRejectedValue(new Error("network error"));

      const result = await runGroupGate({
        cfg: baseCfg,
        agentId: "default",
        sessionKey: "test-session",
        senderName: "Eve",
        messageBody: "test",
      });

      expect(result.shouldRespond).toBe(true);
      expect(result.reason).toContain("gate error");
    });

    it("resolves @LID mentions in messageBody before sending to gate model", async () => {
      vi.spyOn(fs, "readFileSync").mockReturnValue(makeSessionJSONL([]));
      vi.mocked(completeSimple).mockResolvedValue(
        mockAssistantMessage('{"shouldRespond": true, "reason": "direct mention of Jackie"}'),
      );

      const roster = new Map<string, string>();
      roster.set("194146111357056:2@s.whatsapp.net", "Jackie");

      await runGroupGate({
        cfg: baseCfg,
        agentId: "default",
        sessionKey: "test-session",
        senderName: "Michal",
        messageBody: "@194146111357056 popiš co se snažíme docílit",
        mentionedJids: ["194146111357056:2@s.whatsapp.net"],
        participantRoster: roster,
      });

      // Verify the prompt sent to the model contains resolved name, not LID
      const call = vi.mocked(completeSimple).mock.calls[0];
      const promptContent = (call[1] as { messages: Array<{ content: string }> }).messages[0]
        .content;
      expect(promptContent).toContain("@Jackie popiš co se snažíme docílit");
      expect(promptContent).not.toContain("@194146111357056");
    });
  });

  // ── resolveMentionsInBody ──────────────────────────────────────────

  describe("resolveMentionsInBody", () => {
    it("replaces LID @-mention with resolved name", () => {
      const roster = new Map([["194146111357056:2@s.whatsapp.net", "Jackie"]]);
      const result = resolveMentionsInBody(
        "@194146111357056 ahoj",
        ["194146111357056:2@s.whatsapp.net"],
        roster,
      );
      expect(result).toBe("@Jackie ahoj");
    });

    it("replaces multiple different mentions", () => {
      const roster = new Map([
        ["111@s.whatsapp.net", "Alice"],
        ["222@s.whatsapp.net", "Bob"],
      ]);
      const result = resolveMentionsInBody(
        "@111 a @222 ahoj",
        ["111@s.whatsapp.net", "222@s.whatsapp.net"],
        roster,
      );
      expect(result).toBe("@Alice a @Bob ahoj");
    });

    it("leaves unresolved mentions intact", () => {
      const roster = new Map([["111@s.whatsapp.net", "Alice"]]);
      const result = resolveMentionsInBody(
        "@111 a @999 ahoj",
        ["111@s.whatsapp.net", "999@s.whatsapp.net"],
        roster,
      );
      expect(result).toBe("@Alice a @999 ahoj");
    });

    it("returns body unchanged when no mentionedJids", () => {
      const roster = new Map([["111@s.whatsapp.net", "Alice"]]);
      expect(resolveMentionsInBody("hello", undefined, roster)).toBe("hello");
      expect(resolveMentionsInBody("hello", [], roster)).toBe("hello");
    });

    it("returns body unchanged when no roster", () => {
      expect(resolveMentionsInBody("@111 hello", ["111@s.whatsapp.net"], undefined)).toBe(
        "@111 hello",
      );
      expect(resolveMentionsInBody("@111 hello", ["111@s.whatsapp.net"], new Map())).toBe(
        "@111 hello",
      );
    });

    it("handles LID format with colon separator", () => {
      const roster = new Map([["194146111357056:2@s.whatsapp.net", "Jackie"]]);
      const result = resolveMentionsInBody(
        "@194146111357056 test",
        ["194146111357056:2@s.whatsapp.net"],
        roster,
      );
      expect(result).toBe("@Jackie test");
    });

    it("replaces all occurrences of the same mention", () => {
      const roster = new Map([["111@s.whatsapp.net", "Alice"]]);
      const result = resolveMentionsInBody(
        "@111 said @111 is here",
        ["111@s.whatsapp.net"],
        roster,
      );
      expect(result).toBe("@Alice said @Alice is here");
    });
  });
});
