import { getGlobalAnnounceTransport } from "../gateway/announce-transport.js";
import {
  ackAnnounceDelivery,
  computeAnnounceBackoffMs,
  failAnnounceDelivery,
  loadPendingAnnounceDeliveries,
  moveAnnounceToFailed,
  type QueuedAnnounce,
} from "./subagent-announce-delivery-queue.js";

const MAX_RETRIES = 4;

function waitMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function startSubagentAnnounceDeliveryWorker(params: {
  log: { info: (msg: string) => void; warn: (msg: string) => void; error: (msg: string) => void };
  pollIntervalMs?: number;
}): { stop: () => Promise<void> } {
  let stopped = false;
  const pollIntervalMs = Math.max(500, params.pollIntervalMs ?? 2_000);
  const transport = getGlobalAnnounceTransport();
  transport.start();

  const pump = async () => {
    while (!stopped) {
      try {
        const pending = await loadPendingAnnounceDeliveries();
        for (const entry of pending) {
          if (stopped) {
            break;
          }
          await attemptEntry(entry, params.log);
        }
      } catch (err) {
        params.log.warn(`announce worker tick failed: ${String(err)}`);
      }
      if (!stopped) {
        await waitMs(pollIntervalMs);
      }
    }
  };

  const attemptEntry = async (
    entry: QueuedAnnounce,
    log: { info: (msg: string) => void; warn: (msg: string) => void; error: (msg: string) => void },
  ) => {
    const backoffMs = computeAnnounceBackoffMs(entry.retryCount + 1);
    const baseAttemptAt = entry.lastAttemptAt ?? entry.enqueuedAt;
    if (Date.now() < baseAttemptAt + backoffMs) {
      return;
    }
    try {
      const origin = entry.completionDirectOrigin ?? entry.directOrigin;
      const threadId =
        origin?.threadId != null && origin.threadId !== "" ? String(origin.threadId) : undefined;
      await transport.sendAgentRequest(
        {
          sessionKey: entry.requesterSessionKey,
          message: entry.triggerMessage,
          deliver: Boolean(origin?.channel && origin?.to),
          bestEffortDeliver: entry.bestEffortDeliver,
          internalEvents: entry.internalEvents,
          channel: origin?.channel,
          accountId: origin?.accountId,
          to: origin?.to,
          threadId,
          inputProvenance: {
            kind: "inter_session",
            sourceSessionKey: entry.sourceSessionKey,
            sourceChannel: entry.sourceChannel,
            sourceTool: entry.sourceTool,
          },
          queuePriority: "background",
          idempotencyKey: entry.idempotencyKey,
        },
        { timeoutMs: 15_000 },
      );
      await ackAnnounceDelivery(entry.id);
      log.info(`announce worker delivered queued completion ${entry.id}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (entry.retryCount + 1 >= MAX_RETRIES) {
        await moveAnnounceToFailed(entry.id).catch(() => undefined);
        log.error(`announce worker moved entry ${entry.id} to failed: ${errorMessage}`);
        return;
      }
      await failAnnounceDelivery(entry.id, errorMessage).catch(() => undefined);
      log.warn(`announce worker failed entry ${entry.id}: ${errorMessage}`);
    }
  };

  void pump();

  return {
    stop: async () => {
      stopped = true;
      await transport.stop();
    },
  };
}
