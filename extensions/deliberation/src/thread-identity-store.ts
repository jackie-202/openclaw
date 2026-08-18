import type { PluginStateKeyedStore } from "openclaw/plugin-sdk/plugin-state-runtime";

export type SlackThreadIdentity = {
  sourceTarget: string;
  providerEventId: string;
  threadId: string;
};

export type SlackThreadIdentityStore = Pick<
  PluginStateKeyedStore<SlackThreadIdentity>,
  "lookup" | "registerIfAbsent"
>;

export function slackThreadIdentityKey(sourceTarget: string, providerEventId: string): string {
  return `${sourceTarget}\u0000${providerEventId}`;
}

export async function registerSlackThreadIdentity(
  store: SlackThreadIdentityStore,
  identity: SlackThreadIdentity,
): Promise<void> {
  const key = slackThreadIdentityKey(identity.sourceTarget, identity.providerEventId);
  if (await store.registerIfAbsent(key, identity)) {
    return;
  }
  const existing = await store.lookup(key);
  if (
    !existing ||
    existing.sourceTarget !== identity.sourceTarget ||
    existing.providerEventId !== identity.providerEventId ||
    existing.threadId !== identity.threadId
  ) {
    throw new Error("Slack thread identity conflicts with the existing mapping");
  }
}
