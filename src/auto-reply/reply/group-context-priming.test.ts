import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadGroupKnowledgeFiles, resolveGroupKnowledgeFiles } from "./group-context-priming.js";

function makeWorkspace(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "group-priming-"));
}

describe("group-context-priming", () => {
  describe("resolveGroupKnowledgeFiles", () => {
    it("returns shared first, then group-specific", () => {
      const resolved = resolveGroupKnowledgeFiles({
        sharedKnowledgeFile: "knowledge/groups/_shared.md",
        groupKnowledgeFile: "knowledge/groups/dnd.md",
      });
      expect(resolved).toEqual([
        { scope: "shared", file: "knowledge/groups/_shared.md" },
        { scope: "group", file: "knowledge/groups/dnd.md" },
      ]);
    });

    it("deduplicates identical paths", () => {
      const resolved = resolveGroupKnowledgeFiles({
        sharedKnowledgeFile: "knowledge/groups/shared.md",
        groupKnowledgeFile: "knowledge/groups/shared.md",
      });
      expect(resolved).toEqual([{ scope: "shared", file: "knowledge/groups/shared.md" }]);
    });
  });

  describe("loadGroupKnowledgeFiles", () => {
    it("composes shared and specific sections", () => {
      const workspace = makeWorkspace();
      const shared = path.join(workspace, "knowledge/groups/_shared.md");
      const specific = path.join(workspace, "knowledge/groups/dnd.md");
      fs.mkdirSync(path.dirname(shared), { recursive: true });
      fs.writeFileSync(shared, "Shared rules", "utf-8");
      fs.writeFileSync(specific, "Specific rules", "utf-8");

      const result = loadGroupKnowledgeFiles(workspace, [
        { scope: "shared", file: "knowledge/groups/_shared.md" },
        { scope: "group", file: "knowledge/groups/dnd.md" },
      ]);

      expect(result.block).toContain("## Shared Group Knowledge");
      expect(result.block).toContain("Shared rules");
      expect(result.block).toContain("## Group Knowledge (specific)");
      expect(result.block).toContain("Specific rules");
      expect(result.totalChars).toBe("Shared rules".length + "Specific rules".length);
    });

    it("truncates merged content by total max chars", () => {
      const workspace = makeWorkspace();
      const shared = path.join(workspace, "knowledge/groups/_shared.md");
      const specific = path.join(workspace, "knowledge/groups/dnd.md");
      fs.mkdirSync(path.dirname(shared), { recursive: true });
      fs.writeFileSync(shared, "abcdef", "utf-8");
      fs.writeFileSync(specific, "ghijkl", "utf-8");

      const result = loadGroupKnowledgeFiles(
        workspace,
        [
          { scope: "shared", file: "knowledge/groups/_shared.md" },
          { scope: "group", file: "knowledge/groups/dnd.md" },
        ],
        { maxChars: 8 },
      );

      expect(result.totalChars).toBe(8);
      expect(result.block).toContain("[truncated]");
      expect(result.block).toContain("abcdef");
      expect(result.block).toContain("gh");
    });

    it("skips files outside workspace boundary", () => {
      const workspace = makeWorkspace();
      const result = loadGroupKnowledgeFiles(workspace, [
        { scope: "shared", file: "../escape.md" },
      ]);

      expect(result.block).toBeUndefined();
      expect(result.totalChars).toBe(0);
      expect(result.sources).toEqual([]);
    });
  });
});
