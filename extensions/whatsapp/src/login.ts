import { formatCliCommand } from "openclaw/plugin-sdk/cli-runtime";
import { getRuntimeConfig } from "openclaw/plugin-sdk/runtime-config-snapshot";
import { danger, success } from "openclaw/plugin-sdk/runtime-env";
import { defaultRuntime, type RuntimeEnv } from "openclaw/plugin-sdk/runtime-env";
import { logInfo } from "openclaw/plugin-sdk/text-runtime";
import { resolveWhatsAppAccount } from "./accounts.js";
import { restoreCredsFromBackupIfNeeded } from "./auth-store.js";
import { closeWaSocketSoon, waitForWhatsAppLoginResult } from "./connection-controller.js";
import { createWaSocket, waitForWaConnection } from "./session.js";
import { resolveWhatsAppSocketTiming } from "./socket-timing.js";

type LoginResultLike = {
  outcome?: unknown;
  message?: unknown;
  statusCode?: unknown;
  error?: unknown;
  restarted?: unknown;
};

function asLoginResultLike(result: unknown): LoginResultLike | null {
  return typeof result === "object" && result !== null ? (result as LoginResultLike) : null;
}

function formatLoginStatusCode(statusCode: unknown): string {
  if (typeof statusCode === "number" && Number.isFinite(statusCode)) {
    return String(statusCode);
  }
  if (typeof statusCode === "string" && statusCode.trim().length > 0) {
    return statusCode.trim();
  }
  return "unknown";
}

export function buildLoginError(
  result: unknown,
  defaultMessage = "WhatsApp login failed",
  options: { preserveMessage?: string } = {},
): Error {
  try {
    const shaped = asLoginResultLike(result);
    const message =
      options.preserveMessage ??
      (typeof shaped?.message === "string" && shaped.message.trim().length > 0
        ? shaped.message
        : `${defaultMessage}: ${formatLoginStatusCode(shaped?.statusCode)}`);
    const cause = shaped && "error" in shaped ? shaped.error : undefined;
    return cause === undefined ? new Error(message) : new Error(message, { cause });
  } catch (cause) {
    return new Error(`${defaultMessage}: unknown`, { cause });
  }
}

export async function loginWeb(
  verbose: boolean,
  waitForConnection?: typeof waitForWaConnection,
  runtime: RuntimeEnv = defaultRuntime,
  accountId?: string,
) {
  const cfg = getRuntimeConfig();
  const account = resolveWhatsAppAccount({ cfg, accountId });
  const socketTiming = resolveWhatsAppSocketTiming(cfg);
  const restoredFromBackup = await restoreCredsFromBackupIfNeeded(account.authDir);
  let sock = await createWaSocket(true, verbose, {
    authDir: account.authDir,
    ...socketTiming,
  });
  logInfo("Waiting for WhatsApp connection...", runtime);
  try {
    const result: unknown = await waitForWhatsAppLoginResult({
      sock,
      authDir: account.authDir,
      isLegacyAuthDir: account.isLegacyAuthDir,
      verbose,
      runtime,
      waitForConnection,
      socketTiming,
      onSocketReplaced: (replacementSock) => {
        sock = replacementSock;
      },
    });
    const shapedResult = asLoginResultLike(result);
    if (shapedResult?.outcome === "connected") {
      console.log(
        success(
          shapedResult.restarted === true
            ? "✅ Linked after restart; web session ready."
            : restoredFromBackup
              ? "✅ Recovered from creds.json.bak; web session ready."
              : "✅ Linked! Credentials saved for future sends.",
        ),
      );
      return;
    }

    if (shapedResult?.outcome === "logged-out") {
      console.error(
        danger(
          `WhatsApp reported the session is logged out. Cleared cached web session; please rerun ${formatCliCommand("openclaw channels login")} and scan the QR again.`,
        ),
      );
      throw buildLoginError(result, "WhatsApp login failed", {
        preserveMessage: "Session logged out; cache cleared. Re-run login.",
      });
    }

    const error = buildLoginError(result);
    console.error(danger(`WhatsApp Web connection ended before fully opening. ${error.message}`));
    throw error;
  } finally {
    // Let Baileys flush any final events before closing the socket.
    closeWaSocketSoon(sock);
  }
}
