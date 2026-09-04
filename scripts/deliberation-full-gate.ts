#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  assertNoLiveEnvironment,
  authorityDigest,
  buildSanitizedChildEnvironment,
  candidateDigest,
  commandIdentityDigest,
  DELIBERATION_CANDIDATE_LEAVES,
  DELIBERATION_FOCUSED_VITEST_CONFIG,
  DELIBERATION_LEAVES,
  DELIBERATION_VITEST_TIMEOUT_MS,
  LedgerValidationError,
  parseVitestJsonReport,
  sha256,
  validateCandidateLedger,
  validateFinalLedger,
  writeLedgerExclusive,
  type CandidateLedger,
  type FinalLedger,
  type GateAuthority,
  type GateCommand,
  type GateLeaf,
} from "./lib/deliberation-full-gate-ledger.js";

type ParsedReport = NonNullable<GateCommand["report"]>;
type CommandSpec = {
  id: string;
  role: "acceptance" | "support";
  executable: string;
  argv: string[];
  cwd: string;
  env?: Record<string, string>;
  report?: { path: string; format: ParsedReport["format"] };
  expectedExitCode?: number;
  expectedStderr?: string;
  timeoutMs?: number;
};

const repoRoot = path.resolve(import.meta.dirname, "..");
const defaultOutput = path.join(repoRoot, ".artifacts/deliberation-full-gate.json");

function fail(message: string): never {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

function git(args: string[], cwd: string): string {
  const result = spawnSync("git", args, { cwd, encoding: "utf8", timeout: 30_000 });
  if (result.status !== 0) {
    throw new Error(`git ${args.join(" ")} failed: ${result.stderr.trim()}`);
  }
  return result.stdout.trim();
}

function preflight(): GateAuthority {
  const openclawRevision = git(["rev-parse", "HEAD"], repoRoot);
  const openclawStatus = git(["status", "--short"], repoRoot);
  if (openclawStatus) {
    throw new Error("preflight: OpenClaw checkout is dirty; commit the task before canonical run");
  }
  const authority: GateAuthority = {
    openclaw: { root: repoRoot, revision: openclawRevision, clean: true },
  };
  process.stdout.write(`OpenClaw revision: ${openclawRevision}\n`);
  return authority;
}

function execute(
  spec: CommandSpec,
  runId: string,
  authoritySha256: string,
  isolatedEnv: Record<string, string>,
): GateCommand {
  const startedAt = new Date().toISOString();
  const env = buildSanitizedChildEnvironment(process.env, isolatedEnv, spec.env);
  const result = spawnSync(spec.executable, spec.argv, {
    cwd: spec.cwd,
    env,
    encoding: "utf8",
    timeout: spec.timeoutMs ?? 20 * 60 * 1000,
    maxBuffer: 64 * 1024 * 1024,
    killSignal: "SIGKILL",
  });
  const finishedAt = new Date().toISOString();
  const stdout = result.stdout ?? "";
  const stderr = result.stderr ?? "";
  const report =
    spec.report && fs.existsSync(spec.report.path)
      ? parseVitestJsonReport(fs.readFileSync(spec.report.path))
      : null;
  const identity = {
    executable: spec.executable,
    argv: spec.argv,
    cwd: spec.cwd,
    env,
  };
  const command: GateCommand = {
    id: spec.id,
    role: spec.role,
    ...identity,
    identitySha256: commandIdentityDigest(runId, authoritySha256, identity),
    startedAt,
    finishedAt,
    expectedExitCode: spec.expectedExitCode ?? 0,
    exitCode: result.status ?? -1,
    timedOut: result.error?.code === "ETIMEDOUT",
    stdoutSha256: sha256(stdout),
    stderrSha256: sha256(stderr),
    report,
  };
  process.stdout.write(
    `[${command.exitCode === command.expectedExitCode ? "pass" : "fail"}] ${spec.id} ` +
      `${command.exitCode} ${Date.parse(finishedAt) - Date.parse(startedAt)}ms\n`,
  );
  if (command.exitCode !== command.expectedExitCode) {
    const bounded = `${stdout}\n${stderr}`.slice(-4000);
    throw new Error(`${spec.id} exited ${command.exitCode}\n${bounded}`);
  }
  if (spec.expectedStderr && !stderr.includes(spec.expectedStderr)) {
    throw new Error(
      `${spec.id}: expected stderr containing ${JSON.stringify(spec.expectedStderr)}`,
    );
  }
  if (spec.report && !report) {
    throw new Error(`${spec.id}: command passed without its machine-readable report`);
  }
  return command;
}

function leavesFromReport(command: GateCommand): GateLeaf[] {
  if (!command.report) {
    throw new Error(`${command.id}: machine-readable report is missing`);
  }
  return DELIBERATION_LEAVES.filter((leaf) => leaf[2] === command.id).map(
    ([id, selector, commandId]) => {
      const occurrences = command.report!.selectors.filter(
        (reported) => reported === selector,
      ).length;
      if (occurrences !== 1) {
        throw new Error(`${command.id}: selector ${selector} occurred ${occurrences} times`);
      }
      return { id, selector, commandId, status: "Green", observedAt: command.finishedAt };
    },
  );
}

function vitestSpec(
  id: string,
  config: string,
  files: string[],
  report: string,
  env?: Record<string, string>,
): CommandSpec {
  return {
    id,
    role: "acceptance",
    executable: process.execPath,
    argv: [
      "scripts/run-vitest.mjs",
      "run",
      "--config",
      config,
      ...files,
      "--reporter=default",
      "--reporter=json",
      `--testTimeout=${DELIBERATION_VITEST_TIMEOUT_MS}`,
      `--outputFile.json=${report}`,
    ],
    cwd: repoRoot,
    env,
    report: { path: report, format: "vitest-json" },
  };
}

function runGate(output: string): void {
  if (fs.existsSync(output)) {
    throw new LedgerValidationError("OUTPUT_EXISTS", `refusing to overwrite ${output}`);
  }
  assertNoLiveEnvironment(process.env);
  const authority = preflight();
  const runId = randomUUID();
  const runStartedAt = new Date().toISOString();
  const authoritySha256 = authorityDigest(authority);
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "openclaw-deliberation-full-gate-"));
  const reports = path.join(tempRoot, "reports");
  const packageDir = path.join(tempRoot, "package");
  fs.mkdirSync(reports, { recursive: true });
  fs.mkdirSync(packageDir, { recursive: true });
  const isolatedEnv = {
    HOME: path.join(tempRoot, "home"),
    TMPDIR: path.join(tempRoot, "tmp"),
    OPENCLAW_STATE_DIR: path.join(tempRoot, "state"),
    OPENCLAW_CONFIG_PATH: path.join(tempRoot, "openclaw.json"),
    OPENCLAW_OAUTH_DIR: path.join(tempRoot, "oauth"),
    OPENCLAW_VITEST_MAX_WORKERS: "1",
    OPENCLAW_VITEST_NO_OUTPUT_TIMEOUT_MS: DELIBERATION_VITEST_TIMEOUT_MS,
  };
  for (const directory of Object.values(isolatedEnv).filter((value) => path.isAbsolute(value))) {
    fs.mkdirSync(path.extname(directory) ? path.dirname(directory) : directory, {
      recursive: true,
    });
  }
  try {
    const commands: GateCommand[] = [];
    const leavesById = new Map<string, GateLeaf>();
    const discord = execute(
      vitestSpec(
        "discord",
        "test/vitest/vitest.extension-discord.config.ts",
        ["extensions/discord/src/monitor/message-handler.deliberation.test.ts"],
        path.join(reports, "discord.json"),
      ),
      runId,
      authoritySha256,
      isolatedEnv,
    );
    commands.push(discord);
    for (const leaf of leavesFromReport(discord)) {
      leavesById.set(leaf.id, leaf);
    }
    const slack = execute(
      vitestSpec(
        "slack",
        "test/vitest/vitest.extension-slack.config.ts",
        ["extensions/slack/src/monitor/message-handler.deliberation.test.ts"],
        path.join(reports, "slack.json"),
      ),
      runId,
      authoritySha256,
      isolatedEnv,
    );
    commands.push(slack);
    for (const leaf of leavesFromReport(slack)) {
      leavesById.set(leaf.id, leaf);
    }

    commands.push(
      execute(
        { id: "build", role: "support", executable: "pnpm", argv: ["build"], cwd: repoRoot },
        runId,
        authoritySha256,
        isolatedEnv,
      ),
    );
    const tarball = path.join(packageDir, "openclaw-current.tgz");
    commands.push(
      execute(
        {
          id: "package-build",
          role: "support",
          executable: process.execPath,
          argv: [
            "scripts/package-openclaw-for-docker.mjs",
            "--skip-build",
            "--output-dir",
            packageDir,
            "--output-name",
            path.basename(tarball),
          ],
          cwd: repoRoot,
        },
        runId,
        authoritySha256,
        isolatedEnv,
      ),
    );
    const packageCommand = execute(
      vitestSpec(
        "package",
        "test/vitest/vitest.e2e.config.ts",
        [
          "test/scripts/deliberation-doctor-package.e2e.test.ts",
          "-t",
          "^OR-22 doctor-package-writeback-built-five-hook-runtime$",
        ],
        path.join(reports, "package.json"),
        { OPENCLAW_CURRENT_PACKAGE_TGZ: tarball },
      ),
      runId,
      authoritySha256,
      isolatedEnv,
    );
    commands.push(packageCommand);
    for (const leaf of leavesFromReport(packageCommand)) {
      leavesById.set(leaf.id, leaf);
    }

    commands.push(
      execute(
        vitestSpec(
          "focused-deliberation",
          DELIBERATION_FOCUSED_VITEST_CONFIG,
          [
            "extensions/deliberation/src/contract.test.ts",
            "extensions/deliberation/src/km-client.test.ts",
            "extensions/deliberation/src/final-adapter.test.ts",
            "extensions/deliberation/src/delivery-probe.test.ts",
            "extensions/deliberation/scripts/intake-producer.test.ts",
          ],
          path.join(reports, "focused.json"),
        ),
        runId,
        authoritySha256,
        isolatedEnv,
      ),
    );
    commands.at(-1)!.role = "support";
    for (const spec of [
      {
        id: "oxlint",
        executable: process.execPath,
        argv: [
          "scripts/run-oxlint.mjs",
          "scripts/deliberation-full-gate.ts",
          "scripts/lib/deliberation-full-gate-ledger.ts",
          "test/scripts/deliberation-full-gate.test.ts",
          "extensions/deliberation/src/km-client.ts",
          "extensions/deliberation/src/contract.test.ts",
        ],
      },
      { id: "tsgo-production", executable: "pnpm", argv: ["tsgo:extensions"] },
      { id: "tsgo-tests", executable: "pnpm", argv: ["tsgo:extensions:test"] },
      { id: "package-singleton", executable: "pnpm", argv: ["test:build:singleton"] },
      { id: "diff-check", executable: "git", argv: ["diff", "--check"] },
    ]) {
      commands.push(
        execute({ ...spec, role: "support", cwd: repoRoot }, runId, authoritySha256, isolatedEnv),
      );
    }

    const candidateLeaves = DELIBERATION_CANDIDATE_LEAVES.map(([id]) => {
      const leaf = leavesById.get(id);
      if (!leaf) {
        throw new Error(`missing local acceptance leaf ${id}`);
      }
      return leaf;
    });
    const provisional: CandidateLedger = {
      schemaVersion: 1,
      kind: "candidate",
      runId,
      runStartedAt,
      candidateCreatedAt: new Date().toISOString(),
      authority,
      authoritySha256,
      commands,
      leaves: candidateLeaves,
    };
    const negativeCases = [
      {
        name: "missing",
        diagnostic: "missing leaf OR-22",
        input: () => ({ ...provisional, leaves: provisional.leaves.slice(0, -1) }),
      },
      {
        name: "duplicate",
        diagnostic: "duplicate leaf OR-01",
        input: () => ({ ...provisional, leaves: [...provisional.leaves, provisional.leaves[0]] }),
      },
      {
        name: "stale",
        diagnostic: "candidate is stale",
        input: () => ({
          ...provisional,
          runStartedAt: "2020-01-01T00:00:00.000Z",
          candidateCreatedAt: "2020-01-01T00:01:00.000Z",
        }),
      },
      { name: "malformed", diagnostic: "JSON", input: () => "{" },
    ] as const;
    for (const negative of negativeCases) {
      const input = path.join(tempRoot, `negative-${negative.name}.json`);
      const manufactured = path.join(tempRoot, `manufactured-${negative.name}.json`);
      const value = negative.input();
      fs.writeFileSync(input, typeof value === "string" ? value : JSON.stringify(value));
      commands.push(
        execute(
          {
            id: `negative-${negative.name}`,
            role: "support",
            executable: process.execPath,
            argv: [
              "--import",
              "tsx",
              "scripts/deliberation-full-gate.ts",
              "verify",
              "--input",
              input,
              "--output",
              manufactured,
            ],
            cwd: repoRoot,
            expectedExitCode: 1,
            expectedStderr: negative.diagnostic,
          },
          runId,
          authoritySha256,
          isolatedEnv,
        ),
      );
      if (fs.existsSync(manufactured)) {
        throw new Error(`${negative.name} verifier manufactured an output ledger`);
      }
    }

    const candidate: CandidateLedger = {
      ...provisional,
      candidateCreatedAt: new Date().toISOString(),
      commands: [...commands],
      leaves: [...candidateLeaves],
    };
    validateCandidateLedger(candidate, {
      runId,
      now: new Date(),
      openclawRoot: repoRoot,
      openclawRevision: authority.openclaw.revision,
    });
    const candidatePath = path.join(tempRoot, "candidate.json");
    writeLedgerExclusive(candidatePath, candidate);
    const integrity = execute(
      vitestSpec(
        "integrity",
        "test/vitest/vitest.tooling.config.ts",
        ["test/scripts/deliberation-full-gate.test.ts", "-t", "^OR-23 full-gate-integrity$"],
        path.join(reports, "integrity.json"),
        {
          OPENCLAW_DELIBERATION_GATE_CANDIDATE: candidatePath,
          OPENCLAW_DELIBERATION_GATE_RUN_ID: runId,
          OPENCLAW_DELIBERATION_GATE_REVISION: authority.openclaw.revision,
        },
      ),
      runId,
      authoritySha256,
      isolatedEnv,
    );
    commands.push(integrity);
    const integrityLeaves = leavesFromReport(integrity);
    const final: FinalLedger = {
      schemaVersion: 1,
      kind: "final",
      runId,
      runStartedAt,
      candidateCreatedAt: candidate.candidateCreatedAt,
      candidateSha256: candidateDigest(candidate),
      finalizedAt: new Date().toISOString(),
      authority,
      authoritySha256,
      commands,
      leaves: [...candidateLeaves, ...integrityLeaves],
    };
    validateFinalLedger(final, {
      runId,
      now: new Date(),
      openclawRoot: repoRoot,
      openclawRevision: authority.openclaw.revision,
    });
    writeLedgerExclusive(output, final);
    const artifactSha256 = sha256(fs.readFileSync(output));
    for (const leaf of final.leaves) {
      process.stdout.write(`${leaf.id} Green ${leaf.selector}\n`);
    }
    process.stdout.write(
      `Repository-local result: ${final.leaves.length}/${DELIBERATION_LEAVES.length} Green\n` +
        `Ledger SHA-256: ${artifactSha256}\n`,
    );
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

function argument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

function verifyMode(): void {
  const inputPath = argument("--input");
  const outputPath = argument("--output");
  if (!inputPath || !outputPath) {
    fail("usage: deliberation-full-gate.ts verify --input FILE --output FILE");
  }
  const input = JSON.parse(fs.readFileSync(inputPath, "utf8")) as unknown;
  if (!input || typeof input !== "object") {
    fail("ledger must be an object");
  }
  const metadata = input as { kind?: unknown; runId?: unknown };
  const context = {
    runId:
      typeof metadata.runId === "string" ? metadata.runId : "00000000-0000-0000-0000-000000000000",
    now: new Date(),
    openclawRoot: repoRoot,
    openclawRevision: git(["rev-parse", "HEAD"], repoRoot),
  };
  const ledger =
    metadata.kind === "final"
      ? validateFinalLedger(input, context)
      : validateCandidateLedger(input, context);
  writeLedgerExclusive(outputPath, ledger);
}

try {
  const mode = process.argv[2] ?? "run";
  if (mode === "run") {
    runGate(argument("--output") ?? defaultOutput);
  } else if (mode === "verify") {
    verifyMode();
  } else {
    fail("usage: deliberation-full-gate.ts run|verify");
  }
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}
