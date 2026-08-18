type SlackTimestamp = { seconds: bigint; micros: string };

function parseSlackTimestamp(value: string): SlackTimestamp | undefined {
  const match = /^(0|[1-9]\d*)\.(\d{1,6})$/.exec(value);
  if (!match?.[1] || !match[2]) {
    return undefined;
  }
  return { seconds: BigInt(match[1]), micros: match[2].padEnd(6, "0") };
}

export function isSlackTimestamp(value: string): boolean {
  return parseSlackTimestamp(value) !== undefined;
}

export function compareSlackTimestamps(left: string, right: string): number {
  const leftTimestamp = parseSlackTimestamp(left);
  const rightTimestamp = parseSlackTimestamp(right);
  if (!leftTimestamp || !rightTimestamp) {
    throw new Error("Slack history response contains an invalid timestamp");
  }
  if (leftTimestamp.seconds !== rightTimestamp.seconds) {
    return leftTimestamp.seconds < rightTimestamp.seconds ? -1 : 1;
  }
  return leftTimestamp.micros.localeCompare(rightTimestamp.micros);
}

export function slackTimestampIso(value: string): string {
  const timestamp = parseSlackTimestamp(value);
  if (!timestamp) {
    throw new Error("Slack history response contains an invalid timestamp");
  }
  const milliseconds = timestamp.seconds * 1000n + BigInt(timestamp.micros.slice(0, 3));
  if (milliseconds > 8_640_000_000_000_000n) {
    throw new Error("Slack history response contains an invalid timestamp");
  }
  const occurredAt = new Date(Number(milliseconds));
  if (!Number.isFinite(occurredAt.getTime())) {
    throw new Error("Slack history response contains an invalid timestamp");
  }
  return occurredAt.toISOString();
}
