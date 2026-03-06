import { html, nothing } from "lit";
import type {
  ChannelModelOverrideEntry,
  ModelsDashboardData,
  ProviderCatalogEntry,
} from "../controllers/models.ts";

export type ModelsProps = {
  loading: boolean;
  error: string | null;
  data: ModelsDashboardData | null;
  onRefresh: () => void;
};

function renderModelChip(model: string | null, fallback = "not set") {
  return html`<span class="chip">${model ?? fallback}</span>`;
}

function renderChannelOverride(entry: ChannelModelOverrideEntry) {
  return html`
    <div class="list-item">
      <div class="list-main">
        <div class="list-title mono">${entry.path}</div>
        <div class="list-sub">${entry.channel} · ${entry.scope} · ${entry.target}</div>
      </div>
      <div class="list-meta">${renderModelChip(entry.model)}</div>
    </div>
  `;
}

function renderProvider(provider: ProviderCatalogEntry) {
  return html`
    <div class="card" style="padding: 14px;">
      <div class="row" style="justify-content: space-between; align-items: baseline; gap: 12px;">
        <div class="card-title">${provider.id}</div>
        <div class="muted">${provider.models.length} models</div>
      </div>
      ${
        provider.models.length === 0
          ? html`
              <div class="muted" style="margin-top: 10px">No models discovered.</div>
            `
          : html`
              <div class="list" style="margin-top: 10px;">
                ${provider.models.map(
                  (model) => html`
                    <div class="list-item">
                      <div class="list-main">
                        <div class="list-title mono">${model.id}</div>
                        <div class="list-sub">${model.name}</div>
                      </div>
                      <div class="list-meta" style="min-width: 260px;">
                        <div>ctx: ${model.contextWindow ?? "n/a"}</div>
                        <div>max: ${model.maxTokens ?? "n/a"}</div>
                        <div>reasoning: ${model.reasoning == null ? "n/a" : model.reasoning ? "on" : "off"}</div>
                      </div>
                    </div>
                  `,
                )}
              </div>
            `
      }
    </div>
  `;
}

export function renderModels(props: ModelsProps) {
  const data = props.data;
  return html`
    <section class="card">
      <div class="row" style="justify-content: space-between; align-items: flex-start; gap: 12px;">
        <div>
          <div class="card-title">Mission Control</div>
          <div class="card-sub">Read-only map of all model assignments across agents, cron, channels, and providers.</div>
        </div>
        <button class="btn" ?disabled=${props.loading} @click=${props.onRefresh}>
          ${props.loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>
      ${props.error ? html`<div class="callout danger" style="margin-top: 12px">${props.error}</div>` : nothing}
    </section>

    <section class="grid grid-cols-2" style="margin-top: 16px;">
      <div class="card">
        <div class="card-title">Default & Agent Models</div>
        <div class="card-sub">Gateway defaults, group gate, and per-agent overrides.</div>
        ${
          !data
            ? html`
                <div class="muted" style="margin-top: 12px">Loading...</div>
              `
            : html`
                <div class="row" style="margin-top: 12px;">
                  <span class="label">Default model</span>
                  ${renderModelChip(data.defaultModel)}
                </div>
                <div class="row" style="margin-top: 8px;">
                  <span class="label">Group gate model</span>
                  ${renderModelChip(data.groupGateModel)}
                </div>
                <div style="margin-top: 12px;">
                  <div class="label">Agent overrides</div>
                  ${
                    data.agentOverrides.length === 0
                      ? html`
                          <div class="muted" style="margin-top: 8px">No per-agent model overrides.</div>
                        `
                      : html`
                          <div class="list" style="margin-top: 8px;">
                            ${data.agentOverrides.map(
                              (entry) => html`
                                <div class="list-item">
                                  <div class="list-main">
                                    <div class="list-title mono">${entry.id}</div>
                                  </div>
                                  <div class="list-meta">${renderModelChip(entry.model)}</div>
                                </div>
                              `,
                            )}
                          </div>
                        `
                  }
                </div>
              `
        }
      </div>

      <div class="card">
        <div class="card-title">Allowed Models Whitelist</div>
        <div class="card-sub">agents.defaults.models keys allowed for agent model selection.</div>
        ${
          !data
            ? html`
                <div class="muted" style="margin-top: 12px">Loading...</div>
              `
            : data.allowedModels.length === 0
              ? html`
                  <div class="muted" style="margin-top: 12px">
                    No explicit allowlist. Gateway model catalog is used.
                  </div>
                `
              : html`<div class="chip-row" style="margin-top: 12px;">
                  ${data.allowedModels.map((modelId) => html`<span class="chip mono">${modelId}</span> `)}
                </div>`
        }
      </div>
    </section>

    <section class="card" style="margin-top: 16px;">
      <div class="card-title">Cron Jobs</div>
      <div class="card-sub">Model assignment for each scheduled job payload.</div>
      ${
        !data
          ? html`
              <div class="muted" style="margin-top: 12px">Loading...</div>
            `
          : data.cronJobs.length === 0
            ? html`
                <div class="muted" style="margin-top: 12px">No cron jobs found.</div>
              `
            : html`
                <div class="list" style="margin-top: 12px;">
                  ${data.cronJobs.map(
                    (job) => html`
                      <div class="list-item">
                        <div class="list-main">
                          <div class="list-title">${job.name}</div>
                          <div class="list-sub mono">${job.id}</div>
                          <div class="chip-row" style="margin-top: 6px;">
                            <span class="chip">schedule: ${job.scheduleKind}</span>
                            <span class="chip ${job.enabled ? "chip-ok" : "chip-danger"}"
                              >${job.enabled ? "enabled" : "disabled"}</span
                            >
                            <span class="chip">last: ${job.lastRunStatus}</span>
                          </div>
                        </div>
                        <div class="list-meta">${renderModelChip(job.model, "default")}</div>
                      </div>
                    `,
                  )}
                </div>
              `
      }
    </section>

    <section class="grid grid-cols-2" style="margin-top: 16px;">
      <div class="card">
        <div class="card-title">Channel Model Overrides</div>
        <div class="card-sub">WhatsApp group overrides and any other channel-level model field found in config.</div>
        ${
          !data
            ? html`
                <div class="muted" style="margin-top: 12px">Loading...</div>
              `
            : html`
                <div class="label" style="margin-top: 10px;">WhatsApp groups</div>
                ${
                  data.whatsappGroupOverrides.length === 0
                    ? html`
                        <div class="muted" style="margin-top: 8px">No WhatsApp group model overrides.</div>
                      `
                    : html`
                        <div class="list" style="margin-top: 8px;">
                          ${data.whatsappGroupOverrides.map(
                            (entry) => html`
                              <div class="list-item">
                                <div class="list-main">
                                  <div class="list-title mono">${entry.id}</div>
                                </div>
                                <div class="list-meta">${renderModelChip(entry.model)}</div>
                              </div>
                            `,
                          )}
                        </div>
                      `
                }

                <div class="label" style="margin-top: 14px;">Other channel model fields</div>
                ${
                  data.otherChannelOverrides.length === 0
                    ? html`
                        <div class="muted" style="margin-top: 8px">No additional channel-level model overrides.</div>
                      `
                    : html`
                        <div class="list" style="margin-top: 8px;">
                          ${data.otherChannelOverrides.map((entry) => renderChannelOverride(entry))}
                        </div>
                      `
                }
              `
        }
      </div>

      <div class="card">
        <div class="card-title">Providers Catalog</div>
        <div class="card-sub">Provider model inventory with context windows, token caps, and reasoning support.</div>
        ${
          !data
            ? html`
                <div class="muted" style="margin-top: 12px">Loading...</div>
              `
            : data.providers.length === 0
              ? html`
                  <div class="muted" style="margin-top: 12px">No provider model catalog data.</div>
                `
              : html`<div class="stack" style="margin-top: 10px;">${data.providers.map(renderProvider)}</div>`
        }
      </div>
    </section>
  `;
}
