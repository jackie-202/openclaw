export type SourceIdentity = {
  provider: string;
  account: string;
  channel: string;
};

const PROVIDER_PATTERN = /^[a-z][a-z0-9_-]{0,31}$/;
const COMPONENT_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._~-]{0,95}$/;
const SOURCE_IDENTITY_PATTERN =
  /^v1:([a-z][a-z0-9_-]{0,31}):([A-Za-z0-9][A-Za-z0-9._~-]{0,95}):([A-Za-z0-9][A-Za-z0-9._~-]{0,95})$/;

function isAcceptedIdentity(identity: SourceIdentity): boolean {
  return (
    PROVIDER_PATTERN.test(identity.provider) &&
    COMPONENT_PATTERN.test(identity.account) &&
    COMPONENT_PATTERN.test(identity.channel) &&
    (identity.provider !== "synthetic" || identity.account === "diagnostic")
  );
}

export function encodeSourceIdentity(identity: SourceIdentity): string | undefined {
  return isAcceptedIdentity(identity)
    ? `v1:${identity.provider}:${identity.account}:${identity.channel}`
    : undefined;
}

export function parseSourceIdentity(value: string): SourceIdentity | undefined {
  const match = SOURCE_IDENTITY_PATTERN.exec(value);
  if (!match) {
    return undefined;
  }
  const [, provider, account, channel] = match;
  if (!provider || !account || !channel) {
    return undefined;
  }
  const identity = { provider, account, channel };
  return isAcceptedIdentity(identity) ? identity : undefined;
}
