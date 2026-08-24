import type { PluginStateKeyedStore } from "openclaw/plugin-sdk/plugin-state-runtime";

export type SlackThreadIdentity = {
  sourceTarget: string;
  providerEventId: string;
  threadId: string;
};

export type DiscordHistoryIdentity = {
  provider: "discord";
  sourceTarget: string;
  providerEventId: string;
  historyChannelId: string;
};

export type SourceHistoryIdentity = SlackThreadIdentity | DiscordHistoryIdentity;

export type SourceHistoryIdentityStore = Pick<
  PluginStateKeyedStore<SourceHistoryIdentity>,
  "lookup" | "registerIfAbsent"
>;

export function sourceHistoryIdentityKey(sourceTarget: string, providerEventId: string): string {
  return `${sourceTarget}\u0000${providerEventId}`;
}

export async function registerSlackThreadIdentity(
  store: SourceHistoryIdentityStore,
  identity: SlackThreadIdentity,
): Promise<void> {
  const key = sourceHistoryIdentityKey(identity.sourceTarget, identity.providerEventId);
  if (await store.registerIfAbsent(key, identity)) {
    return;
  }
  const existing = await store.lookup(key);
  if (
    !existing ||
    existing.sourceTarget !== identity.sourceTarget ||
    existing.providerEventId !== identity.providerEventId ||
    !("threadId" in existing) ||
    existing.threadId !== identity.threadId
  ) {
    throw new Error("Slack thread identity conflicts with the existing mapping");
  }
}

export async function registerDiscordHistoryIdentity(
  store: SourceHistoryIdentityStore,
  identity: DiscordHistoryIdentity,
): Promise<void> {
  const key = sourceHistoryIdentityKey(identity.sourceTarget, identity.providerEventId);
  if (await store.registerIfAbsent(key, identity)) {
    return;
  }
  const existing = await store.lookup(key);
  if (
    !existing ||
    !("provider" in existing) ||
    existing.provider !== "discord" ||
    existing.sourceTarget !== identity.sourceTarget ||
    existing.providerEventId !== identity.providerEventId ||
    existing.historyChannelId !== identity.historyChannelId
  ) {
    throw new Error("Discord history identity conflicts with the existing mapping");
  }
}
