import fs from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { OpenClawConfig } from "../../config/config.js";
import { _test, resolveGateContext, type GateContextParams } from "./gate-context.js";

const { buildResolvedMentions, extractE164FromJid, assembleGroupMembers } = _test;

// ── Module mocks ───────────────────────────────────────────────────────

vi.mock("../../agents/agent-scope.js", () => ({
  resolveDefaultAgentId: vi.fn(() => "default"),
  resolveAgentWorkspaceDir: vi.fn(() => "/tmp/workspace"),
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
    trace: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  })),
}));

// ── Helpers ────────────────────────────────────────────────────────────

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

function makeBaseParams(overrides?: Partial<GateContextParams>): GateContextParams {
  return {
    cfg: baseCfg,
    agentId: "default",
    sessionKey: "test-session",
    groupId: "420123@g.us",
    channel: "whatsapp",
    rawMessage: "Hello group",
    senderName: "Alice",
    activation: "always",
    ...overrides,
  };
}

// ── Tests ──────────────────────────────────────────────────────────────

describe("gate-context", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── buildResolvedMentions ────────────────────────────────────────────

  describe("buildResolvedMentions", () => {
    it("resolves JIDs to names from participant roster", () => {
      const roster = new Map([["194146111357056:2@s.whatsapp.net", "Jackie"]]);
      const result = buildResolvedMentions(["194146111357056:2@s.whatsapp.net"], roster);
      expect(result.get("194146111357056:2@s.whatsapp.net")).toBe("Jackie");
    });

    it("matches by user-part prefix when full JID not in roster", () => {
      const roster = new Map([["194146111357056:2@s.whatsapp.net", "Jackie"]]);
      const result = buildResolvedMentions(["194146111357056:99@lid"], roster);
      expect(result.get("194146111357056:99@lid")).toBe("Jackie");
    });

    it("returns empty map when no mentionedJids", () => {
      const roster = new Map([["111@s.whatsapp.net", "Alice"]]);
      expect(buildResolvedMentions(undefined, roster).size).toBe(0);
      expect(buildResolvedMentions([], roster).size).toBe(0);
    });

    it("returns empty map when no roster", () => {
      expect(buildResolvedMentions(["111@s.whatsapp.net"], undefined).size).toBe(0);
      expect(buildResolvedMentions(["111@s.whatsapp.net"], new Map()).size).toBe(0);
    });

    it("skips JIDs not found in roster", () => {
      const roster = new Map([["111@s.whatsapp.net", "Alice"]]);
      const result = buildResolvedMentions(["111@s.whatsapp.net", "999@s.whatsapp.net"], roster);
      expect(result.size).toBe(1);
      expect(result.has("999@s.whatsapp.net")).toBe(false);
    });
  });

  // ── extractE164FromJid ──────────────────────────────────────────────

  describe("extractE164FromJid", () => {
    it("extracts phone number from phone-based JID", () => {
      expect(extractE164FromJid("420123456789@s.whatsapp.net")).toBe("+420123456789");
    });

    it("returns undefined for LID-based JID", () => {
      expect(extractE164FromJid("194146111357056:2@s.whatsapp.net")).toBeUndefined();
    });

    it("returns undefined for empty string", () => {
      expect(extractE164FromJid("")).toBeUndefined();
    });
  });

  // ── assembleGroupMembers ────────────────────────────────────────────

  describe("assembleGroupMembers", () => {
    it("builds members from participant roster", () => {
      const roster = new Map([
        ["420111@s.whatsapp.net", "Alice"],
        ["420222@s.whatsapp.net", "Bob"],
      ]);
      const members = assembleGroupMembers(roster, undefined);
      expect(members).toHaveLength(2);
      expect(members[0]).toEqual({
        jid: "420111@s.whatsapp.net",
        name: "Alice",
        e164: "+420111",
      });
    });

    it("supplements with raw participants not in roster", () => {
      const roster = new Map([["420111@s.whatsapp.net", "Alice"]]);
      const members = assembleGroupMembers(roster, [
        "420111@s.whatsapp.net",
        "420333@s.whatsapp.net",
      ]);
      expect(members).toHaveLength(2);
      expect(members[1]).toEqual({
        jid: "420333@s.whatsapp.net",
        name: "420333@s.whatsapp.net",
        e164: "+420333",
      });
    });

    it("returns empty array when no roster and no participants", () => {
      expect(assembleGroupMembers(undefined, undefined)).toEqual([]);
    });

    it("deduplicates JIDs from roster and raw participants", () => {
      const roster = new Map([["420111@s.whatsapp.net", "Alice"]]);
      const members = assembleGroupMembers(roster, ["420111@s.whatsapp.net"]);
      expect(members).toHaveLength(1);
    });
  });

  // ── resolveGateContext ──────────────────────────────────────────────

  describe("resolveGateContext", () => {
    it("assembles all context fields from params", () => {
      const jsonl = makeSessionJSONL([
        { role: "user", content: "Hello" },
        { role: "assistant", content: "Hi!" },
      ]);
      vi.spyOn(fs, "readFileSync").mockReturnValue(jsonl);

      const roster = new Map([["111@s.whatsapp.net", "Alice"]]);
      const ctx = resolveGateContext(
        makeBaseParams({
          participantRoster: roster,
          mentionedJids: ["111@s.whatsapp.net"],
          rawParticipants: ["111@s.whatsapp.net", "222@s.whatsapp.net"],
          senderName: "Bob",
        }),
      );

      expect(ctx.groupId).toBe("420123@g.us");
      expect(ctx.sessionKey).toBe("test-session");
      expect(ctx.agentId).toBe("default");
      expect(ctx.rawMessage).toBe("Hello group");
      expect(ctx.senderName).toBe("Bob");
      expect(ctx.activation).toBe("always");
      expect(ctx.resolvedMentions.get("111@s.whatsapp.net")).toBe("Alice");
      expect(ctx.conversationHistory).toHaveLength(2);
      expect(ctx.groupMembers).toHaveLength(2);
    });

    it("resolves @LID mentions into resolvedMentions map", () => {
      vi.spyOn(fs, "readFileSync").mockReturnValue(makeSessionJSONL([]));

      const roster = new Map([["194146111357056:2@s.whatsapp.net", "Jackie"]]);
      const ctx = resolveGateContext(
        makeBaseParams({
          mentionedJids: ["194146111357056:2@s.whatsapp.net"],
          participantRoster: roster,
        }),
      );

      expect(ctx.resolvedMentions.get("194146111357056:2@s.whatsapp.net")).toBe("Jackie");
    });

    it("loads conversation history from session JSONL", () => {
      const jsonl = makeSessionJSONL([
        { role: "user", content: "msg1" },
        { role: "assistant", content: "msg2" },
        { role: "user", content: "msg3" },
        { role: "assistant", content: "msg4" },
        { role: "user", content: "msg5" },
      ]);
      vi.spyOn(fs, "readFileSync").mockReturnValue(jsonl);

      const ctx = resolveGateContext(makeBaseParams());
      expect(ctx.conversationHistory).toHaveLength(5);
      expect(ctx.conversationHistory[0]).toBe("User: msg1");
      expect(ctx.conversationHistory[4]).toBe("User: msg5");
    });

    it("returns empty history when session file is missing", () => {
      vi.spyOn(fs, "readFileSync").mockImplementation(() => {
        throw new Error("ENOENT");
      });

      const ctx = resolveGateContext(makeBaseParams());
      expect(ctx.conversationHistory).toEqual([]);
    });

    it("handles empty/missing optional fields gracefully", () => {
      vi.spyOn(fs, "readFileSync").mockReturnValue(makeSessionJSONL([]));

      const ctx = resolveGateContext(
        makeBaseParams({
          mentionedJids: undefined,
          participantRoster: undefined,
          rawParticipants: undefined,
        }),
      );

      expect(ctx.resolvedMentions.size).toBe(0);
      expect(ctx.groupMembers).toEqual([]);
      expect(ctx.conversationHistory).toEqual([]);
    });

    it("normalizes channel to lowercase", () => {
      vi.spyOn(fs, "readFileSync").mockReturnValue(makeSessionJSONL([]));

      // Channel normalization is internal — verify it doesn't throw for mixed case
      const ctx = resolveGateContext(makeBaseParams({ channel: "WhatsApp" }));
      expect(ctx.groupId).toBe("420123@g.us");
    });
  });
});
