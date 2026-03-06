import type { GatewayBrowserClient } from "../gateway.ts";
import type { ConfigSnapshot, CronJob, CronJobsListResult } from "../types.ts";

const DEFAULT_CRON_PAGE_LIMIT = 200;
const MAX_CRON_PAGES = 20;
const PINNED_PROVIDER_ORDER = ["copilot", "ollama", "local"] as const;

type ModelLike = {
  primary?: unknown;
};

type ChannelModelHit = {
  channel: string;
  path: string[];
  model: string;
};

export type AgentModelOverrideEntry = {
  id: string;
  model: string;
};

export type CronModelAssignmentEntry = {
  id: string;
  name: string;
  scheduleKind: string;
  model: string;
  enabled: boolean;
  lastRunStatus: string;
};

export type ChannelModelOverrideEntry = {
  channel: string;
  target: string;
  scope: string;
  path: string;
  model: string;
};

export type ProviderModelEntry = {
  id: string;
  name: string;
  contextWindow: number | null;
  maxTokens: number | null;
  reasoning: boolean | null;
};

export type ProviderCatalogEntry = {
  id: string;
  models: ProviderModelEntry[];
};

export type ModelsDashboardData = {
  defaultModel: string | null;
  groupGateModel: string | null;
  agentOverrides: AgentModelOverrideEntry[];
  cronJobs: CronModelAssignmentEntry[];
  whatsappGroupOverrides: Array<{ id: string; model: string }>;
  otherChannelOverrides: ChannelModelOverrideEntry[];
  providers: ProviderCatalogEntry[];
  allowedModels: string[];
};

export type ModelsState = {
  client: GatewayBrowserClient | null;
  connected: boolean;
  modelsLoading: boolean;
  modelsData: ModelsDashboardData | null;
  modelsError: string | null;
};

export async function loadModels(state: ModelsState) {
  if (!state.client || !state.connected) {
    return;
  }
  if (state.modelsLoading) {
    return;
  }
  state.modelsLoading = true;
  state.modelsError = null;
  try {
    const [configSnapshot, cronJobs, modelsPayload] = await Promise.all([
      state.client.request<ConfigSnapshot>("config.get", {}),
      loadAllCronJobs(state.client),
      state.client.request<{ models?: unknown[] }>("models.list", {}),
    ]);
    state.modelsData = buildModelsDashboardData({
      configSnapshot,
      cronJobs,
      discoveredModels: Array.isArray(modelsPayload?.models) ? modelsPayload.models : [],
    });
  } catch (err) {
    state.modelsError = String(err);
  } finally {
    state.modelsLoading = false;
  }
}

async function loadAllCronJobs(client: GatewayBrowserClient): Promise<CronJob[]> {
  const allJobs: CronJob[] = [];
  let offset = 0;
  let page = 0;

  while (page < MAX_CRON_PAGES) {
    const response = await client.request<CronJobsListResult>("cron.list", {
      includeDisabled: true,
      limit: DEFAULT_CRON_PAGE_LIMIT,
      offset,
    });
    const jobs = Array.isArray(response.jobs) ? response.jobs : [];
    allJobs.push(...jobs);

    const hasMore = response.hasMore === true;
    if (!hasMore) {
      break;
    }

    if (typeof response.nextOffset === "number" && Number.isFinite(response.nextOffset)) {
      offset = Math.max(0, Math.floor(response.nextOffset));
    } else {
      offset += jobs.length > 0 ? jobs.length : DEFAULT_CRON_PAGE_LIMIT;
    }

    page += 1;
  }

  return allJobs;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function asString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function asPositiveNumber(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return null;
  }
  return value;
}

function asBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function resolveModelPrimary(value: unknown): string | null {
  const direct = asString(value);
  if (direct) {
    return direct;
  }
  const model = asRecord(value) as ModelLike | null;
  return model ? asString(model.primary) : null;
}

function collectChannelModelHits(value: unknown, path: string[] = []): ChannelModelHit[] {
  const objectValue = asRecord(value);
  if (!objectValue) {
    return [];
  }
  const output: ChannelModelHit[] = [];
  for (const [key, entry] of Object.entries(objectValue)) {
    const nextPath = [...path, key];
    if (key === "model") {
      const model = asString(entry);
      if (model) {
        output.push({
          channel: path[0] ?? "unknown",
          path: nextPath,
          model,
        });
      }
      continue;
    }
    output.push(...collectChannelModelHits(entry, nextPath));
  }
  return output;
}

function isWhatsAppGroupModelPath(path: string[]): boolean {
  return (
    path.length >= 4 && path[0] === "whatsapp" && path[1] === "groups" && path.at(-1) === "model"
  );
}

function deriveChannelTarget(path: string[]): string {
  const withoutChannel = path.slice(1, -1);
  const groupIndex = withoutChannel.indexOf("groups");
  if (groupIndex >= 0) {
    const groupId = withoutChannel[groupIndex + 1];
    if (groupId) {
      return groupId;
    }
  }
  const accountIndex = withoutChannel.indexOf("accounts");
  if (accountIndex >= 0) {
    const accountId = withoutChannel[accountIndex + 1];
    if (accountId) {
      return accountId;
    }
  }
  return withoutChannel.join(".") || path[0] || "unknown";
}

function deriveChannelScope(path: string[]): string {
  const withoutChannel = path.slice(1, -1);
  if (withoutChannel.length === 0) {
    return "channel default";
  }
  return withoutChannel.join(".");
}

function buildModelsDashboardData(params: {
  configSnapshot: ConfigSnapshot;
  cronJobs: CronJob[];
  discoveredModels: unknown[];
}): ModelsDashboardData {
  const root = asRecord(params.configSnapshot.config) ?? {};
  const agents = asRecord(root.agents) ?? {};
  const defaults = asRecord(agents.defaults) ?? {};
  const groupGate = asRecord(defaults.groupGate) ?? {};
  const channels = asRecord(root.channels) ?? {};
  const modelConfig = asRecord(root.models) ?? {};
  const modelProviders = asRecord(modelConfig.providers) ?? {};

  const defaultModel = resolveModelPrimary(defaults.model);
  const groupGateModel = asString(groupGate.model);

  const agentOverrides: AgentModelOverrideEntry[] = [];
  const agentList = Array.isArray(agents.list) ? agents.list : [];
  for (const item of agentList) {
    const entry = asRecord(item);
    if (!entry) {
      continue;
    }
    const id = asString(entry.id);
    const model = resolveModelPrimary(entry.model);
    if (!id || !model) {
      continue;
    }
    agentOverrides.push({ id, model });
  }
  agentOverrides.sort((a, b) => a.id.localeCompare(b.id));

  const cronJobs: CronModelAssignmentEntry[] = params.cronJobs.map((job) => ({
    id: job.id,
    name: job.name,
    scheduleKind: job.schedule.kind,
    model:
      job.payload.kind === "agentTurn" ? (asString(job.payload.model) ?? "default") : "default",
    enabled: job.enabled,
    lastRunStatus: asString(job.state?.lastStatus) ?? "n/a",
  }));
  cronJobs.sort((a, b) => a.name.localeCompare(b.name));

  const whatsappGroupOverrides: Array<{ id: string; model: string }> = [];
  const whatsapp = asRecord(channels.whatsapp) ?? {};
  const whatsappGroups = asRecord(whatsapp.groups) ?? {};
  for (const [groupId, groupConfig] of Object.entries(whatsappGroups)) {
    const model = asString(asRecord(groupConfig)?.model);
    if (!model) {
      continue;
    }
    whatsappGroupOverrides.push({ id: groupId, model });
  }
  whatsappGroupOverrides.sort((a, b) => a.id.localeCompare(b.id));

  const otherChannelOverrides = collectChannelModelHits(channels)
    .filter((hit) => !isWhatsAppGroupModelPath(hit.path))
    .map<ChannelModelOverrideEntry>((hit) => ({
      channel: hit.channel,
      target: deriveChannelTarget(hit.path),
      scope: deriveChannelScope(hit.path),
      path: `channels.${hit.path.join(".")}`,
      model: hit.model,
    }))
    .toSorted((a, b) => a.path.localeCompare(b.path));

  const providersById = new Map<string, Map<string, ProviderModelEntry>>();

  for (const [providerId, providerConfig] of Object.entries(modelProviders)) {
    const provider = asRecord(providerConfig);
    if (!provider) {
      continue;
    }
    const providerModels = Array.isArray(provider.models) ? provider.models : [];
    for (const modelEntry of providerModels) {
      const model = asRecord(modelEntry);
      if (!model) {
        continue;
      }
      const modelId = asString(model.id);
      if (!modelId) {
        continue;
      }
      const catalog = providersById.get(providerId) ?? new Map<string, ProviderModelEntry>();
      catalog.set(modelId, {
        id: modelId,
        name: asString(model.name) ?? modelId,
        contextWindow: asPositiveNumber(model.contextWindow),
        maxTokens: asPositiveNumber(model.maxTokens),
        reasoning: asBoolean(model.reasoning),
      });
      providersById.set(providerId, catalog);
    }
  }

  for (const modelEntry of params.discoveredModels) {
    const model = asRecord(modelEntry);
    if (!model) {
      continue;
    }
    const providerId = asString(model.provider) ?? "unknown";
    const modelId = asString(model.id);
    if (!modelId) {
      continue;
    }
    const catalog = providersById.get(providerId) ?? new Map<string, ProviderModelEntry>();
    const existing = catalog.get(modelId);
    const discovered: ProviderModelEntry = {
      id: modelId,
      name: asString(model.name) ?? modelId,
      contextWindow: asPositiveNumber(model.contextWindow),
      maxTokens: asPositiveNumber(model.maxTokens),
      reasoning: asBoolean(model.reasoning),
    };
    if (!existing) {
      catalog.set(modelId, discovered);
    } else {
      catalog.set(modelId, {
        ...existing,
        name: existing.name || discovered.name,
        contextWindow: existing.contextWindow ?? discovered.contextWindow,
        maxTokens: existing.maxTokens ?? discovered.maxTokens,
        reasoning: existing.reasoning ?? discovered.reasoning,
      });
    }
    providersById.set(providerId, catalog);
  }

  const providerIds = new Set<string>([
    ...PINNED_PROVIDER_ORDER,
    ...Object.keys(modelProviders),
    ...Array.from(providersById.keys()),
  ]);
  const providers = Array.from(providerIds)
    .toSorted((a, b) => {
      const leftPinned = PINNED_PROVIDER_ORDER.indexOf(a as (typeof PINNED_PROVIDER_ORDER)[number]);
      const rightPinned = PINNED_PROVIDER_ORDER.indexOf(
        b as (typeof PINNED_PROVIDER_ORDER)[number],
      );
      const leftRank = leftPinned >= 0 ? leftPinned : PINNED_PROVIDER_ORDER.length;
      const rightRank = rightPinned >= 0 ? rightPinned : PINNED_PROVIDER_ORDER.length;
      if (leftRank !== rightRank) {
        return leftRank - rightRank;
      }
      return a.localeCompare(b);
    })
    .map<ProviderCatalogEntry>((providerId) => {
      const models = Array.from(providersById.get(providerId)?.values() ?? []).toSorted((a, b) =>
        a.id.localeCompare(b.id),
      );
      return {
        id: providerId,
        models,
      };
    });

  const allowedModelEntries = asRecord(defaults.models) ?? {};
  const allowedModels = Object.keys(allowedModelEntries)
    .map((modelId) => modelId.trim())
    .filter(Boolean)
    .toSorted((a, b) => a.localeCompare(b));

  return {
    defaultModel,
    groupGateModel,
    agentOverrides,
    cronJobs,
    whatsappGroupOverrides,
    otherChannelOverrides,
    providers,
    allowedModels,
  };
}
