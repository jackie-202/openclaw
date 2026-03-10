import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { resolveStateDir } from "../config/paths.js";
import type { DeliveryContext } from "../utils/delivery-context.js";

const QUEUE_DIRNAME = "subagent-announce-queue";
const FAILED_DIRNAME = "failed";

export type QueuedAnnounce = {
  id: string;
  enqueuedAt: number;
  retryCount: number;
  requesterSessionKey: string;
  triggerMessage: string;
  directOrigin?: DeliveryContext;
  completionDirectOrigin?: DeliveryContext;
  idempotencyKey: string;
  bestEffortDeliver?: boolean;
  internalEvents?: unknown[];
  sourceSessionKey?: string;
  sourceChannel?: string;
  sourceTool?: string;
  lastAttemptAt?: number;
  lastError?: string;
};

function resolveQueueDir(stateDir?: string): string {
  return path.join(stateDir ?? resolveStateDir(), QUEUE_DIRNAME);
}

function resolveFailedDir(stateDir?: string): string {
  return path.join(resolveQueueDir(stateDir), FAILED_DIRNAME);
}

export async function ensureAnnounceQueueDir(stateDir?: string): Promise<void> {
  await fs.promises.mkdir(resolveQueueDir(stateDir), { recursive: true, mode: 0o700 });
  await fs.promises.mkdir(resolveFailedDir(stateDir), { recursive: true, mode: 0o700 });
}

export async function enqueueCompletionAnnounce(
  payload: Omit<QueuedAnnounce, "id" | "enqueuedAt" | "retryCount">,
  stateDir?: string,
): Promise<string> {
  await ensureAnnounceQueueDir(stateDir);
  const id = randomUUID();
  const entry: QueuedAnnounce = {
    id,
    enqueuedAt: Date.now(),
    retryCount: 0,
    ...payload,
  };
  const filePath = path.join(resolveQueueDir(stateDir), `${id}.json`);
  const tmpPath = `${filePath}.${process.pid}.tmp`;
  await fs.promises.writeFile(tmpPath, JSON.stringify(entry, null, 2), {
    encoding: "utf-8",
    mode: 0o600,
  });
  await fs.promises.rename(tmpPath, filePath);
  return id;
}

export async function loadPendingAnnounceDeliveries(stateDir?: string): Promise<QueuedAnnounce[]> {
  const dir = resolveQueueDir(stateDir);
  const files = await fs.promises.readdir(dir).catch(() => []);
  const entries: QueuedAnnounce[] = [];
  for (const file of files) {
    if (!file.endsWith(".json")) {
      continue;
    }
    const filePath = path.join(dir, file);
    try {
      const raw = await fs.promises.readFile(filePath, "utf-8");
      const parsed = JSON.parse(raw) as QueuedAnnounce;
      if (typeof parsed?.id === "string" && parsed.id.trim()) {
        entries.push(parsed);
      }
    } catch {
      // Ignore malformed entries.
    }
  }
  return entries.toSorted((a, b) => a.enqueuedAt - b.enqueuedAt);
}

export async function ackAnnounceDelivery(id: string, stateDir?: string): Promise<void> {
  await fs.promises
    .unlink(path.join(resolveQueueDir(stateDir), `${id}.json`))
    .catch(() => undefined);
}

export async function failAnnounceDelivery(
  id: string,
  error: string,
  stateDir?: string,
): Promise<void> {
  const filePath = path.join(resolveQueueDir(stateDir), `${id}.json`);
  const raw = await fs.promises.readFile(filePath, "utf-8");
  const entry = JSON.parse(raw) as QueuedAnnounce;
  const next: QueuedAnnounce = {
    ...entry,
    retryCount: Math.max(0, entry.retryCount) + 1,
    lastAttemptAt: Date.now(),
    lastError: error,
  };
  const tmpPath = `${filePath}.${process.pid}.tmp`;
  await fs.promises.writeFile(tmpPath, JSON.stringify(next, null, 2), {
    encoding: "utf-8",
    mode: 0o600,
  });
  await fs.promises.rename(tmpPath, filePath);
}

export async function moveAnnounceToFailed(id: string, stateDir?: string): Promise<void> {
  await ensureAnnounceQueueDir(stateDir);
  await fs.promises.rename(
    path.join(resolveQueueDir(stateDir), `${id}.json`),
    path.join(resolveFailedDir(stateDir), `${id}.json`),
  );
}

export function computeAnnounceBackoffMs(retryCount: number): number {
  const schedule = [2_000, 5_000, 15_000, 60_000, 5 * 60_000] as const;
  if (retryCount <= 0) {
    return 0;
  }
  return schedule[Math.min(retryCount - 1, schedule.length - 1)] ?? schedule.at(-1) ?? 0;
}
