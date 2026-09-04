import { normalizeOptionalString } from "openclaw/plugin-sdk/string-coerce-runtime";
import type { SlackMessageEvent } from "../../types.js";

export async function resolveSlackSenderIdentity(params: {
  message: SlackMessageEvent;
  resolveUserName: (userId: string) => Promise<{ name?: string }>;
}): Promise<{ displayName?: string; username?: string }> {
  const username = normalizeOptionalString(params.message.username);
  if (username) {
    return { displayName: username, username };
  }
  if (!params.message.user) {
    return {};
  }
  const sender = await params.resolveUserName(params.message.user);
  return { displayName: normalizeOptionalString(sender?.name) };
}
