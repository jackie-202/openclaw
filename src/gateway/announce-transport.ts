import { callGateway } from "./call.js";

export type AnnounceTransportRequest = {
  sessionKey: string;
  message: string;
  deliver: boolean;
  bestEffortDeliver?: boolean;
  internalEvents?: unknown[];
  channel?: string;
  accountId?: string;
  to?: string;
  threadId?: string;
  inputProvenance?: {
    kind: "inter_session";
    sourceSessionKey?: string;
    sourceChannel?: string;
    sourceTool?: string;
  };
  idempotencyKey: string;
};

export class AnnounceTransport {
  private stopped = false;
  private serialized: Promise<void> = Promise.resolve();

  start(): void {
    this.stopped = false;
  }

  async stop(): Promise<void> {
    this.stopped = true;
    await this.serialized.catch(() => undefined);
  }

  async sendAgentRequest(
    params: AnnounceTransportRequest,
    opts?: { timeoutMs?: number },
  ): Promise<void> {
    if (this.stopped) {
      throw new Error("announce transport stopped");
    }
    const run = async () => {
      if (this.stopped) {
        throw new Error("announce transport stopped");
      }
      await callGateway({
        method: "agent",
        params,
        expectFinal: true,
        timeoutMs: opts?.timeoutMs,
      });
    };
    const next = this.serialized.then(run, run);
    this.serialized = next.then(
      () => undefined,
      () => undefined,
    );
    return await next;
  }
}

let globalAnnounceTransport: AnnounceTransport | null = null;

export function getGlobalAnnounceTransport(): AnnounceTransport {
  globalAnnounceTransport ??= new AnnounceTransport();
  return globalAnnounceTransport;
}
