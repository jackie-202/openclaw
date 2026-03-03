import fs from "node:fs/promises";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  clearInternalHooks,
  registerInternalHook,
  type AgentBootstrapHookContext,
} from "../hooks/internal-hooks.js";
import { makeTempWorkspace } from "../test-helpers/workspace.js";
import { resolveBootstrapContextForRun, resolveBootstrapFilesForRun } from "./bootstrap-files.js";
import type { WorkspaceBootstrapFile } from "./workspace.js";

function registerExtraBootstrapFileHook() {
  registerInternalHook("agent:bootstrap", (event) => {
    const context = event.context as AgentBootstrapHookContext;
    context.bootstrapFiles = [
      ...context.bootstrapFiles,
      {
        name: "EXTRA.md",
        path: path.join(context.workspaceDir, "EXTRA.md"),
        content: "extra",
        missing: false,
      } as unknown as WorkspaceBootstrapFile,
    ];
  });
}

function registerMalformedBootstrapFileHook() {
  registerInternalHook("agent:bootstrap", (event) => {
    const context = event.context as AgentBootstrapHookContext;
    context.bootstrapFiles = [
      ...context.bootstrapFiles,
      {
        name: "EXTRA.md",
        filePath: path.join(context.workspaceDir, "BROKEN.md"),
        content: "broken",
        missing: false,
      } as unknown as WorkspaceBootstrapFile,
      {
        name: "EXTRA.md",
        path: 123,
        content: "broken",
        missing: false,
      } as unknown as WorkspaceBootstrapFile,
      {
        name: "EXTRA.md",
        path: "   ",
        content: "broken",
        missing: false,
      } as unknown as WorkspaceBootstrapFile,
    ];
  });
}

describe("resolveBootstrapFilesForRun", () => {
  beforeEach(() => clearInternalHooks());
  afterEach(() => clearInternalHooks());

  it("applies bootstrap hook overrides", async () => {
    registerExtraBootstrapFileHook();

    const workspaceDir = await makeTempWorkspace("openclaw-bootstrap-");
    const files = await resolveBootstrapFilesForRun({ workspaceDir });

    expect(files.some((file) => file.path === path.join(workspaceDir, "EXTRA.md"))).toBe(true);
  });

  it("drops malformed hook files with missing/invalid paths", async () => {
    registerMalformedBootstrapFileHook();

    const workspaceDir = await makeTempWorkspace("openclaw-bootstrap-");
    const warnings: string[] = [];
    const files = await resolveBootstrapFilesForRun({
      workspaceDir,
      warn: (message) => warnings.push(message),
    });

    expect(
      files.every((file) => typeof file.path === "string" && file.path.trim().length > 0),
    ).toBe(true);
    expect(warnings).toHaveLength(3);
    expect(warnings[0]).toContain('missing or invalid "path" field');
  });
});

describe("resolveBootstrapContextForRun", () => {
  beforeEach(() => clearInternalHooks());
  afterEach(() => clearInternalHooks());

  it("returns context files for hook-adjusted bootstrap files", async () => {
    registerExtraBootstrapFileHook();

    const workspaceDir = await makeTempWorkspace("openclaw-bootstrap-");
    const result = await resolveBootstrapContextForRun({ workspaceDir });
    const extra = result.contextFiles.find(
      (file) => file.path === path.join(workspaceDir, "EXTRA.md"),
    );

    expect(extra?.content).toBe("extra");
  });

  it("uses heartbeat-only bootstrap files in lightweight heartbeat mode", async () => {
    const workspaceDir = await makeTempWorkspace("openclaw-bootstrap-");
    await fs.writeFile(path.join(workspaceDir, "HEARTBEAT.md"), "check inbox", "utf8");
    await fs.writeFile(path.join(workspaceDir, "SOUL.md"), "persona", "utf8");

    const files = await resolveBootstrapFilesForRun({
      workspaceDir,
      contextMode: "lightweight",
      runKind: "heartbeat",
    });

    expect(files.length).toBeGreaterThan(0);
    expect(files.every((file) => file.name === "HEARTBEAT.md")).toBe(true);
  });

  it("keeps bootstrap context empty in lightweight cron mode", async () => {
    const workspaceDir = await makeTempWorkspace("openclaw-bootstrap-");
    await fs.writeFile(path.join(workspaceDir, "HEARTBEAT.md"), "check inbox", "utf8");

    const files = await resolveBootstrapFilesForRun({
      workspaceDir,
      contextMode: "lightweight",
      runKind: "cron",
    });

    expect(files).toEqual([]);
  });

  // Group session bootstrap integration tests
  it("includes all workspace files for WhatsApp group session key", async () => {
    const workspaceDir = await makeTempWorkspace("openclaw-bootstrap-group-");
    await fs.writeFile(path.join(workspaceDir, "SOUL.md"), "persona", "utf8");
    await fs.writeFile(path.join(workspaceDir, "IDENTITY.md"), "identity", "utf8");
    await fs.writeFile(path.join(workspaceDir, "AGENTS.md"), "agents", "utf8");
    await fs.writeFile(path.join(workspaceDir, "MEMORY.md"), "memory", "utf8");
    await fs.writeFile(path.join(workspaceDir, "USER.md"), "user", "utf8");
    await fs.writeFile(path.join(workspaceDir, "HEARTBEAT.md"), "heartbeat", "utf8");

    const result = await resolveBootstrapContextForRun({
      workspaceDir,
      sessionKey: "agent:main:wa:420776600475-1590265989@g.us",
    });

    const bootstrapNames = result.bootstrapFiles.map((f) => f.name);
    // Group sessions should currently receive ALL files (no group-specific filter yet)
    expect(bootstrapNames).toContain("SOUL.md");
    expect(bootstrapNames).toContain("IDENTITY.md");
    expect(bootstrapNames).toContain("AGENTS.md");
    expect(bootstrapNames).toContain("MEMORY.md");
    expect(bootstrapNames).toContain("USER.md");
    expect(bootstrapNames).toContain("HEARTBEAT.md");
    // Verify content is populated in contextFiles
    expect(result.contextFiles.length).toBeGreaterThan(0);
    const soulCtx = result.contextFiles.find((f) => f.path.endsWith("SOUL.md"));
    expect(soulCtx?.content).toBe("persona");
  });

  it("filters files for subagent session but not for group session", async () => {
    const workspaceDir = await makeTempWorkspace("openclaw-bootstrap-group-");
    await fs.writeFile(path.join(workspaceDir, "SOUL.md"), "persona", "utf8");
    await fs.writeFile(path.join(workspaceDir, "MEMORY.md"), "memory", "utf8");
    await fs.writeFile(path.join(workspaceDir, "HEARTBEAT.md"), "heartbeat", "utf8");

    // Subagent: MEMORY.md and HEARTBEAT.md should be filtered out
    const subagentResult = await resolveBootstrapContextForRun({
      workspaceDir,
      sessionKey: "agent:main:subagent:task-1",
    });
    const subagentNames = subagentResult.bootstrapFiles.map((f) => f.name);
    expect(subagentNames).toContain("SOUL.md");
    expect(subagentNames).not.toContain("MEMORY.md");
    expect(subagentNames).not.toContain("HEARTBEAT.md");

    // Group: everything should pass through
    const groupResult = await resolveBootstrapContextForRun({
      workspaceDir,
      sessionKey: "agent:main:wa:420776600475-1590265989@g.us",
    });
    const groupNames = groupResult.bootstrapFiles.map((f) => f.name);
    expect(groupNames).toContain("SOUL.md");
    expect(groupNames).toContain("MEMORY.md");
    expect(groupNames).toContain("HEARTBEAT.md");
  });
});
