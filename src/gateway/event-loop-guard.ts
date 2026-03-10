import { monitorEventLoopDelay, performance } from "node:perf_hooks";

export function startEventLoopGuard(params: {
  log: { warn: (msg: string) => void; error: (msg: string) => void };
  enabled?: boolean;
  sampleIntervalMs?: number;
  warnLagMs?: number;
  severeLagMs?: number;
}) {
  if (params.enabled === false) {
    return { stop: () => {} };
  }
  const sampleIntervalMs = Math.max(1000, params.sampleIntervalMs ?? 5_000);
  const warnLagMs = Math.max(1, params.warnLagMs ?? 100);
  const severeLagMs = Math.max(warnLagMs, params.severeLagMs ?? 1000);
  const hist = monitorEventLoopDelay({ resolution: 20 });
  hist.enable();
  let prevElu = performance.eventLoopUtilization();

  const timer = setInterval(() => {
    const p99 = hist.percentile(99) / 1_000_000;
    const max = hist.max / 1_000_000;
    const currentElu = performance.eventLoopUtilization();
    const deltaElu = performance.eventLoopUtilization(currentElu, prevElu);
    prevElu = currentElu;
    const msg = `event-loop lag p99=${Math.round(p99)}ms max=${Math.round(max)}ms elu=${deltaElu.utilization.toFixed(3)}`;
    if (max >= severeLagMs) {
      params.log.error(`[gateway:event-loop] severe ${msg}`);
    } else if (p99 >= warnLagMs) {
      params.log.warn(`[gateway:event-loop] warn ${msg}`);
    }
    hist.reset();
  }, sampleIntervalMs);

  return {
    stop: () => {
      clearInterval(timer);
      hist.disable();
    },
  };
}
