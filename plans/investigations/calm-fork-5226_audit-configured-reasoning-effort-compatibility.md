# Audit configured reasoning effort compatibility

## Scope and method

This report compares fork commit `031cdbf89477008f8cb1e2f4ac906741dd65cbc1` with the provider and stream-wrapper implementation at immutable base `4b85d834ed1586062f31bded2f358fc5192d1674`. The proposal requires accepted-value, translation, precedence, unsupported-provider, visibility, and test evidence rather than an ancestry-only conclusion (`docs/proposals/proposal-20260809-165021-f994b3_openclaw-upstream-sync-compatibility-review.md:105-109`).

The audit used repository source and test inspection only. It did not execute tests, use live configuration, make network calls, inspect external repositories, or perform Git lifecycle operations. The proposal file is fork-local and is not present in the target base object; all runtime citations below refer to the target base unless a commit is named explicitly.

## Proposal decision

**Proposal verdict: replace.**

Do not transplant `031cdbf89477` into the current provider files. Replace its raw `params.reasoningEffort` passthrough concept with the current canonical control plane: `thinkingLevel`/`params.thinking` for the selected level, `compat.supportedReasoningEfforts` for accepted values, and `compat.reasoningEffortMap` for provider-native wire labels. This preserves exact `high` and `xhigh` wire values when the model declares them, keeps request and session overrides authoritative, makes the value visible through existing session/status surfaces, and uses the same metadata for menu validation and transport translation (`docs/gateway/config-agents.md:425-438`; `docs/tools/thinking.md:23-36`).

**Confidence: high for repository behavior, medium for provider acceptance.** Active caller, builder, wrapper, and payload tests establish repository behavior. Provider acceptance and server interpretation remain outside scope because no live or external contract checks were allowed.

## Commit intent and current ownership

The fork commit removed `thinkingLevelMap` lookup from explicit `options.reasoningEffort` assignments in both Chat Completions and Responses. It added four scenarios:

| Commit-era scenario | Change or guard | Commit evidence |
| --- | --- | --- |
| Configured `high` with `thinkingLevelMap.high = "xhigh"` | Behavior changed to emit `high` | `031cdbf89477:src/llm/providers/openai-completions.ts:683-712`; `031cdbf89477:src/llm/providers/openai-responses-shared.ts:436-453`; tests at `031cdbf89477:src/llm/providers/openai-completions.test.ts:121-144` and `031cdbf89477:src/llm/providers/openai-responses-shared.test.ts:411-422` |
| Configured `xhigh` with `thinkingLevelMap.xhigh = "high"` | Behavior changed to emit `xhigh` | Tests at `031cdbf89477:src/llm/providers/openai-completions.test.ts:146-169` and `031cdbf89477:src/llm/providers/openai-responses-shared.test.ts:424-435` |
| Unset effort | Existing omission protected | `031cdbf89477:src/llm/providers/openai-completions.test.ts:171-192`; `031cdbf89477:src/llm/providers/openai-responses-shared.test.ts:437-445` |
| Unsupported completions provider | Existing omission protected | `031cdbf89477:src/llm/providers/openai-completions.test.ts:194-216` |

The old `src/llm/providers/openai-*` modules do not exist at the target base. Their callable descendants are under `packages/ai/src/providers`, while ordinary embedded runs normally select boundary-aware transports under `packages/ai/src/transports` and apply provider-owned payload wrappers (`packages/ai/src/providers/register-builtins.ts:102-120`; `packages/ai/src/transports/provider-transport-stream.ts:77-95`; `src/agents/embedded-agent-runner/stream-resolution.ts:212-245`). This creates two current behavior classes:

| Current class | Ownership | Relevance to old invariant |
| --- | --- | --- |
| Direct/simple provider | `packages/ai/src/providers/openai-completions.ts`, `packages/ai/src/providers/openai-responses-shared.ts` | Still consults `compat.reasoningEffortMap`, then `thinkingLevelMap`, then the literal value. It can reproduce the old high/xhigh remap (`packages/ai/src/providers/openai-completions.ts:842-855`; `packages/ai/src/providers/openai-responses-shared.ts:556-564`). |
| Managed embedded transport | `packages/ai/src/transports/openai-*-transport.ts` plus provider wrappers | Resolves supported efforts from canonical thinking and compatibility metadata. Native OpenAI builders do not consult `thinkingLevelMap` at this stage; the Responses thinking wrapper is later authoritative (`packages/ai/src/transports/openai-completions-transport.ts:2033-2083`; `packages/ai/src/transports/openai-responses-params-internal.ts:319-358`; `src/llm/providers/stream-wrappers/openai.ts:491-535`). |

## Accepted values

### Canonical OpenClaw values

The canonical level set is `off | minimal | low | medium | high | xhigh | adaptive | max | ultra`. Input aliases normalize before selection, including `none -> off`, `on/enabled -> low`, `min -> minimal`, `mid/med -> medium`, `x-high/x_high/extra-high -> xhigh`, and `auto -> adaptive`; unknown strings are not accepted (`src/auto-reply/thinking.shared.ts:12-22`; `src/auto-reply/thinking.shared.ts:67-108`).

Availability is model/profile specific. A non-reasoning model exposes only `off`; advanced levels require provider or catalog support; existing stored unsupported levels are clamped by profile rank (`src/auto-reply/thinking.ts:127-176`; `src/auto-reply/thinking.ts:221-237`; `src/auto-reply/thinking.ts:338-370`; `docs/tools/thinking.md:23-25`). Logical `ultra` becomes provider-facing `max` for the embedded transport (`src/agents/embedded-agent-runner/utils.ts:15-31`).

### OpenAI effort values and fallback

| Model/profile | Accepted provider effort strings |
| --- | --- |
| GPT-5.6 | `none, low, medium, high, xhigh, max` |
| GPT-5.2 through GPT-5.5 general | `none, low, medium, high, xhigh` |
| GPT-5.1 general | `none, low, medium, high` |
| GPT-5 general | `minimal, low, medium, high` |
| GPT-5.x Codex general | `low, medium, high, xhigh` |
| `gpt-5.1-codex-max` | `none, medium, high, xhigh` |
| `gpt-5.1-codex-mini` | `medium` |
| `gpt-5-pro` | `high` |
| GPT-5.2+ Pro | `medium, high, xhigh` |
| Generic compatible model | `low, medium, high` |
| Explicit compatibility metadata | Exact strings in `compat.supportedReasoningEfforts` |
| `compat.supportsReasoningEffort: false` | Empty set |

The model tables and compatibility override are defined at `packages/ai/src/providers/openai-reasoning-effort.ts:32-51` and `packages/ai/src/providers/openai-reasoning-effort.ts:85-143`. Resolution prefers an exact supported value, maps disabled `off` to supported `none`, omits unsupported disabled values, degrades `minimal -> low -> medium`, `xhigh -> high`, and `max -> xhigh`, then uses the first enabled provider value as a final fallback (`packages/ai/src/providers/openai-reasoning-effort.ts:172-213`). Explicit `compat.reasoningEffortMap` has final mapping precedence over built-in model exceptions and a caller fallback map (`packages/ai/src/transports/openai-reasoning-compat.ts:15-52`).

## Source and precedence ledger

| Source | Accepted value | Precedence and active path | Wire effect | Visibility | Evidence |
| --- | --- | --- | --- | --- | --- |
| One-shot request or inline `/think` | Canonical level validated against model profile | Highest normal reply precedence, then message directive, stored session, per-agent default, model `params.thinking`, global default, provider/catalog default | Converted by agent core to stream `options.reasoning`, then translated by selected transport/wrapper | Status, session rows, Chat picker, Sessions, New Session | `src/gateway/server-methods/chat-send-handler.ts:497-503`; `src/auto-reply/reply/get-reply-directives.ts:349-356`; `src/auto-reply/reply/model-selection.ts:626-668`; `docs/tools/thinking.md:43-61` |
| Config `agents.defaults.params`, per-model params, per-agent params | Open record; later keys overwrite earlier keys | Global -> model -> agent; run `streamParams` overwrite merged config; provider preparation and transport patch follow | Only recognized fields are projected by the generic stream wrapper | Raw Config editor; most fields may appear in focused debug, but raw `reasoningEffort` does not | `src/agents/model-extra-params.ts:48-67`; `src/agents/embedded-agent-runner/extra-params.ts:266-303`; `src/agents/embedded-agent-runner/extra-params.ts:315-362`; `docs/gateway/config-agents.md:425-435` |
| Raw config `params.reasoningEffort` | Any schema-valid value accepted by the open params record; no core field-specific validation | Survives config merge and reaches provider hook context, but is not in the generic stream-option projection | No wire effect in the normal bundled embedded path; no bundled provider consumes `ctx.extraParams.reasoningEffort` | Raw Config editor only | `src/config/types.agents.ts:157-165`; `src/config/zod-schema.agent-runtime.ts:863-869`; projection whitelist at `src/agents/embedded-agent-runner/extra-params.ts:466-553` |
| Low-level `options.reasoningEffort` | String at provider/transport seam | Responses base builder prefers it over `options.reasoning`; native Responses thinking wrapper can overwrite it later from canonical session thinking or delete it for `off` | Initial `reasoning.effort`, then wrapper-authoritative nested effort/omission | Final Responses payload debug only, without source provenance | `packages/ai/src/transports/openai-responses-params-internal.ts:91-97`; `packages/ai/src/transports/openai-responses-params-internal.ts:319-358`; `src/llm/providers/stream-wrappers/openai.ts:491-535` |
| `compat.supportedReasoningEfforts` and `compat.reasoningEffortMap` | Provider-declared strings | Support validation and provider mapping occur after canonical level selection | Provider-specific scalar/nested effort or omission | Supported choices appear in menus/session UI; actual mapped wire label does not | `src/config/types.models.ts:82-93`; `docs/gateway/config-agents.md:437-438`; `packages/ai/src/providers/openai-reasoning-effort.ts:85-143` |
| `params.extra_body` on OpenAI Completions | Arbitrary JSON | Advanced pass-through merged after generated request keys | Can override generated top-level `reasoning_effort` | Collision names can be logged; no canonical effort projection | `src/agents/embedded-agent-runner/extra-params.ts:789-805`; `src/agents/embedded-agent-runner/extra-params.ts:922-930`; `docs/gateway/config-agents.md:435` |

The OpenAI family wrapper order is attribution, optional fast mode, service tier, verbosity, native web search, string-content compatibility, thinking-level rewrite, reasoning compatibility, and Responses context management (`src/plugin-sdk/provider-stream.ts:126-164`). Payload hooks mutate before invoking the prior hook, making the thinking-level and reasoning-compatibility wrappers later authorities than the base transport (`src/llm/providers/stream-wrappers/stream-payload-utils.ts:12-21`).

## Provider source-to-wire matrix

The matrix describes the normal embedded path unless marked direct/simple. `off` outcomes that depend on an uncovered composition are labeled as static risks rather than verified runtime facts.

| Provider/route | Accepted source/profile | Enabled wire translation | Disabled and unsupported behavior | Evidence and coverage |
| --- | --- | --- | --- | --- |
| Native OpenAI Responses | Model-specific OpenAI table; GPT-5.6 supports `max`, older supported families may support `xhigh` | Nested `reasoning: { effort, summary: "auto" }`; wrapper rewrites from canonical session thinking; web search raises unsupported `minimal` to the first non-minimal effort | Wrapper deletes `reasoning` for canonical `off`; unsupported disabled effort is omitted | `packages/ai/src/transports/openai-responses-params-internal.ts:319-350`; `src/llm/providers/stream-wrappers/openai.ts:491-535`; direct wrapper assertions at `src/llm/providers/stream-wrappers/openai.test.ts:525-605` and `src/llm/providers/stream-wrappers/openai.test.ts:680-753` |
| Native OpenAI Chat Completions | Same model-specific effort resolver | Top-level `reasoning_effort`; tool policy omits it for GPT-5.4-mini/GPT-5.5 with tools and forces `none` for GPT-5.6 with tools | Explicit unsupported effort is normalized/omitted. Static composition risk: agent-core `off` becomes absent while transport defaults absent reasoning to `high` | `packages/agent-core/src/reasoning.ts:25-44`; `packages/ai/src/transports/openai-completions-transport.ts:1313-1315`; `packages/ai/src/transports/openai-completions-transport.ts:2033-2083`; tests at `src/agents/openai-transport-stream.reasoning-and-cache.test.ts:307-440` |
| Generic OpenAI-compatible Chat Completions | Base `low, medium, high`, advanced values only when declared; proxy-like routes may default effort support off | Supported routes emit top-level `reasoning_effort` after compatibility mapping | `supportsReasoningEffort:false` omits scalar effort. Direct `reasoning:"off"` emits mapped `none` if supported; normal embedded `off` has the same absent-to-high composition risk when no provider wrapper repairs it | Compatibility defaults at `packages/ai/src/transports/openai-completions-compat.ts:77-152`; direct behavior tests at `src/agents/openai-transport-stream.reasoning-and-cache.test.ts:516-553` and `src/agents/openai-transport-stream.reasoning-and-cache.test.ts:661-685` |
| Custom Responses-compatible endpoint | Generic effort set or explicit compatibility list | Nested `reasoning.effort`; custom routes do not receive native OpenAI's session-thinking rewrite | Proxy/unsupported disabled `none` is stripped with the reasoning object | `packages/ai/src/transports/openai-responses-payload-policy.ts:314-330`; `packages/ai/src/transports/openai-responses-payload-policy.ts:346-418`; tests at `src/agents/openai-responses-payload-policy.test.ts:174-219` |
| OpenRouter ordinary reasoning model | Usually canonical base levels; advanced values require catalog metadata; explicit unsupported/auto models suppress injection | Nested `reasoning: { effort }`; wrapper removes top-level `reasoning_effort` | Wrapper removes legacy scalar effort for `off`; static composition risk: an already-built nested high effort can survive ordinary `off` | `src/plugin-sdk/provider-stream-shared.ts:399-423`; `extensions/openrouter/stream.ts:274-299`; wrapper-only tests at `extensions/openrouter/index.test.ts:1225-1284` |
| OpenRouter DeepSeek V4 | `off, minimal, low, medium, high, xhigh`; stored `max` falls to `xhigh` | Nested `reasoning.effort`; lower non-off values map to `high`, `xhigh/max` map to `xhigh` | Deletes nested/scalar effort, `thinking`, and replayed reasoning on `off` | `extensions/openrouter/thinking-policy.ts:5-30`; `extensions/openrouter/stream.ts:224-271`; tests at `extensions/openrouter/index.test.ts:1036-1125` |
| Native DeepSeek V4 | `off, minimal, low, medium, high, xhigh, max` | `thinking: { type: "enabled" }` plus top-level `reasoning_effort`; lower non-off values map to `high`, `xhigh/max` to `max` | `thinking.type = "disabled"`; removes scalar/nested effort and replay content | `src/plugin-sdk/provider-stream-shared.ts:448-462`; `src/plugin-sdk/provider-stream-shared.ts:507-542`; tests at `extensions/deepseek/index.test.ts:330-423` |
| Together reasoning models | Base canonical profile | `reasoning: { enabled: true }`; scalar `reasoning_effort` only when compatibility metadata enables it | Direct explicit `off` emits `enabled:false` and omits effort. Static composition risk: normal embedded absent reasoning can default to enabled/high | `packages/ai/src/transports/openai-completions-transport.ts:1500-1512`; `packages/ai/src/transports/openai-completions-transport.ts:2057-2083`; direct test at `src/agents/openai-transport-stream.reasoning-and-cache.test.ts:618-658` |
| Z.AI GLM-5.2 | `off, low, high, max` | `low/high -> reasoning_effort:"high"`; `max -> "max"`; optional preserved-thinking object | `thinking: { type: "disabled" }` | `extensions/zai/provider-policy-api.ts:8-24`; `extensions/zai/index.ts:106-159`; tests at `extensions/zai/index.test.ts:304-435` |
| Z.AI other GLM | Binary `off/low`, displayed as off/on | Usually relies on provider default; preservation opt-in emits enabled thinking object | `thinking: { type: "disabled" }` | `extensions/zai/provider-policy-api.ts:26-32`; tests at `extensions/zai/index.test.ts:338-489` |
| Qwen standard and Coding Plan | Base levels when reasoning capable; `reasoning:false` is off-only | Top-level `enable_thinking:true`; `qwen-chat-template` uses `chat_template_kwargs.enable_thinking:true`; wrapper strips scalar/nested reasoning effort | Corresponding boolean is false; thinking-only models may force true; reasoning-disabled models emit no reasoning control | `extensions/qwen/stream.ts:315-363`; `src/plugin-sdk/provider-stream-shared.ts:425-446`; tests at `extensions/qwen/stream.test.ts:42-99` and `src/plugin-sdk/provider-stream-shared.test.ts:256-285` |
| Qwen Token Plan DeepSeek V4 / GLM | Provider-specific profile through `max` where declared | `enable_thinking:true` plus scalar `reasoning_effort`; DeepSeek maps to high/max, GLM uses literal levels with model-specific max fallback | `enable_thinking:false`; scalar effort omitted and replay reasoning stripped | `extensions/qwen/stream.ts:100-113`; `extensions/qwen/stream.ts:277-302`; tests at `extensions/qwen/stream.test.ts:245-312` and `extensions/qwen/stream.test.ts:883-936` |
| Mistral selected reasoning models | Binary `off/high`; all enabled canonical inputs map to high | Official plugin uses Chat Completions and top-level `reasoning_effort:"high"` | Other Mistral models force effort support off and omit it. Selected models have the same static absent-to-high `off` composition risk | `extensions/mistral/index.ts:38-43`; `extensions/mistral/api.ts:25-56`; metadata/profile tests at `extensions/mistral/api.test.ts:62-160` and `extensions/mistral/api.test.ts:192-203` |
| Any `model.reasoning:false` | `off` only | No enabled translation | Omission; wrappers that honor the capability skip reasoning injection | `src/auto-reply/thinking.ts:221-237`; `src/auto-reply/thinking.test.ts:195-225`; Qwen proof at `extensions/qwen/stream.test.ts:96-99` |
| Reasoning model with `supportsReasoningEffort:false` | Canonical thinking may still be available through a non-scalar provider format | Boolean/object controls can still be emitted | Scalar `reasoning_effort` support set is empty and the scalar is omitted | `packages/ai/src/providers/openai-reasoning-effort.ts:85-100`; `packages/ai/src/providers/openai-reasoning-effort.test.ts:207-216` |

Direct/simple provider builders differ from the normal embedded path. The direct Chat builder has explicit branches for `openai`, `openrouter`, `deepseek`, `together`, `zai`, `qwen`, and `qwen-chat-template`, including disabled objects and booleans (`packages/ai/src/providers/openai-completions.ts:842-897`). Those helper-level disabled results do not prove the composed embedded result because agent core normally represents `off` as absent `options.reasoning` (`packages/agent-core/src/reasoning.ts:25-44`).

## Unsupported-provider behavior

Unsupported behavior is fail-soft and field-specific rather than a general request rejection:

| Condition | Repository behavior |
| --- | --- |
| Unknown user thinking string | Parsing returns no canonical value; directive validation rejects it before transport (`src/auto-reply/thinking.shared.ts:67-108`). |
| Canonical level absent from model profile | Selection clamps/remaps by profile rank (`src/auto-reply/thinking.ts:338-370`). |
| Unsupported enabled OpenAI effort | Resolver degrades to a nearby supported level or first enabled value (`packages/ai/src/providers/openai-reasoning-effort.ts:172-213`). |
| Unsupported `off`/`none` | Resolver omits effort rather than enabling another level (`packages/ai/src/providers/openai-reasoning-effort.ts:172-213`). |
| `supportsReasoningEffort:false` | Scalar effort is omitted, but a provider-specific thinking boolean/object can still be used (`packages/ai/src/providers/openai-reasoning-effort.ts:85-100`). |
| Custom Responses route rejects disabled `none` | Payload policy removes the nested reasoning object (`packages/ai/src/transports/openai-responses-payload-policy.ts:314-330`). |
| GPT-5.6 Chat request has tools | Transport forces `reasoning_effort:"none"` for the model/tool combination (`packages/ai/src/transports/openai-completions-transport.ts:2046-2066`). |

Repository evidence does not establish how an external provider treats an accepted-but-unrecognized string after send. No live or external provider contract claim is made.

## Status, UI, and telemetry visibility

| Surface | Canonical thinking | Raw configured `params.reasoningEffort` | Translated wire effort |
| --- | --- | --- | --- |
| `/status` | Displays effective `think <level>` after model support normalization | Not displayed | Not displayed (`src/status/status-text.ts:630-670`; `src/status/status-message.ts:1000-1011`) |
| Gateway session rows/history | Stores/exposes override, default, choices, and effective `thinkingLevel` | Not in contract | Not in contract (`src/gateway/session-utils-model.ts:177-300`; `src/gateway/session-utils-row.ts:464-467`; `src/gateway/session-utils.types.ts:120-139`) |
| Control UI Chat/Sessions/New Session | Effort picker edits canonical `thinkingLevel` | Only visible indirectly in raw Config editor | Not displayed (`ui/src/lib/chat/thinking.ts:83-111`; `ui/src/pages/chat/components/chat-effort-picker.ts:12-25`; `ui/src/pages/chat/chat-session.ts:475-538`) |
| Startup/runtime summary | Reports canonical/default thinking | Not reported | Not reported (`src/gateway/server-startup-log.ts:126-200`; `src/agents/embedded-agent-runner/extra-params.ts:485-575`) |
| OpenAI Responses payload debug | Not separately identified | No provenance | `reasoningEffort=<reasoning.effort>` in summary; bounded/redacted payload in full mode (`packages/ai/src/transports/openai-responses-debug.ts:194-207`; `packages/ai/src/transports/openai-responses-debug.ts:512-551`) |
| OpenAI Chat Completions debug | Not separately identified | No provenance | No equivalent final effort summary found; transport mutates request only (`packages/ai/src/transports/openai-completions-transport.ts:2033-2084`) |
| Usage footer/plugin delivery state | Carries canonical run `thinkLevel` under internal name `reasoningEffort` | Not exposed | Not exposed (`src/auto-reply/reply/agent-runner-result-accounting.ts:138-147`; `src/plugins/hook-types.ts:592-605`; `src/auto-reply/usage-bar/contract.ts:48-64`) |
| Diagnostic events/OTEL | No effort dimension | No effort dimension | Reasoning output token count only (`src/infra/diagnostic-events.ts:637-698`; `extensions/diagnostics-otel/src/service-genai-attributes.ts:135-161`) |

`talk.realtime.reasoningEffort` is a separate realtime voice configuration and request-override surface, not evidence that normal text-model `params.reasoningEffort` is active (`src/gateway/server-methods/talk-shared.ts:290-323`; `src/gateway/server-methods/talk-shared.ts:431-470`; `ui/src/pages/chat/realtime-talk.ts:34-43`).

## Test coverage classification

No test was executed. The classification records what the target-base test source proves.

| Scenario | Direct payload proof | Indirect proof | Stale/inactive evidence | Gap |
| --- | --- | --- | --- | --- |
| `high` must survive conflicting `high -> xhigh` map | Provider tests prove mapping precedence with another value (`packages/ai/src/providers/openai-completions.test.ts:266-291`); wrapper proves session high emits high (`src/llm/providers/stream-wrappers/openai.test.ts:536-543`) | Current managed builder code ignores `thinkingLevelMap` for this stage | Original `src/llm/providers/*` test path is absent | No target-base test uses exact `thinkingLevelMap: { high: "xhigh" }`; direct/simple and managed paths statically differ |
| `xhigh` must survive conflicting `xhigh -> high` map | Managed Responses and Completions serialize normalized xhigh (`src/agents/openai-transport-stream.replay-and-tools.test.ts:1143-1174`); wrapper emits xhigh (`src/llm/providers/stream-wrappers/openai.test.ts:680-699`) | Resolver preserves xhigh for supported models (`packages/ai/src/providers/openai-reasoning-effort.test.ts:31-68`) | Original path absent | No exact conflicting-map test; direct/simple path would remap while native managed path preserves |
| Unset effort is omitted | Direct Responses omission with `off:null` (`packages/ai/src/providers/openai-responses-shared.test.ts:326-332`); Codex Responses omission and native Responses `none` split (`src/agents/openai-thinking-contract.test.ts:98-115`) | Current route policies explain conditional omission | Original helper test path absent | Exact old `setDefaultReasoningOff:false` branch and direct completions no-off-map branch are uncovered; managed defaults intentionally emit high/none |
| Unsupported completions provider omits scalar effort | Direct disabled compatibility test (`packages/ai/src/providers/openai-completions.test.ts:242-264`); Qwen and proxy payload tests (`src/agents/openai-transport-stream.streaming.test.ts:655-730`; `src/agents/openai-transport-stream.reasoning-and-cache.test.ts:938-959`) | Resolver disablement test (`packages/ai/src/providers/openai-reasoning-effort.test.ts:207-216`) | Original path absent | Exact old native-GPT fixture is not repeated, but the same gate has direct current proof |

The exact commit-era tests are stale only by path, not by concept: every scenario maps to a callable current builder or wrapper. The important current gap is that tests generally prove one layer at a time. They do not cover direct versus managed divergence or the full `agent-core off -> transport default -> provider wrapper` composition for native Chat Completions, ordinary OpenRouter, Together, or selected Mistral models.

## Concrete risks

1. A raw configured `params.reasoningEffort` is inert for payload control but still counts as an authored provider request parameter. It can switch OpenAI from implicit Codex reproduction to the embedded OpenClaw runtime without changing wire effort (`src/agents/model-extra-params.ts:70-84`; `src/agents/openai-routing.ts:56-74`; `extensions/openai/provider-policy-api.ts:161-174`; `extensions/openai/provider-policy-api.ts:427-434`).
2. Direct/simple and managed transports disagree on whether `thinkingLevelMap` may remap an explicit effort. Copying the old patch into only one current seam would preserve split ownership rather than establish one invariant (`packages/ai/src/providers/openai-completions.ts:842-855`; `packages/ai/src/transports/openai-completions-transport.ts:2033-2040`).
3. The composed `off` path is not directly tested for several Chat Completions families. Agent core omits reasoning for off while the managed transport defaults absence to high; wrappers that do not repair the final shape may re-enable thinking (`packages/agent-core/src/reasoning.ts:25-44`; `packages/ai/src/transports/openai-completions-transport.ts:1313-1315`). This is static repository evidence, not a live-provider claim.
4. Status, session, UI, usage, and diagnostics show canonical intent but not the actual provider wire value. Only Responses payload debug exposes the final effort, and it does not preserve source provenance (`packages/ai/src/transports/openai-responses-debug.ts:512-551`).
5. Exact adversarial `high/xhigh` map collisions and full composed disabled behavior are uncovered at the target base. Existing green tests alone would not prove compatibility for the original fork scenarios.

## Recommended promotion state

Promotion should use the current canonical thinking API and compatibility metadata, not raw `params.reasoningEffort`. For an OpenAI-compatible GPT-5.5 bridge, declare the exact accepted efforts in `compat.supportedReasoningEfforts`, use `params.thinking` only as the model default, and use `compat.reasoningEffortMap` only when a canonical label must become a different provider-native string. Add direct payload tests at the active managed transport seam for exact `high`, exact `xhigh`, unsupported omission, request/session-over-model precedence, and full disabled composition before treating the family as closed.

This recommendation keeps one authoritative state visible to users, preserves request and session override semantics, and avoids introducing a second opaque provider-param control plane.
