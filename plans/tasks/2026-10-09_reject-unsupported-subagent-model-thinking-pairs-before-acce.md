# Reject unsupported subagent model-thinking pairs before accepting a spawn

## Outcome

Use existing model capability rules during native subagent spawn planning so an explicitly unsupported model/thinking pair is rejected synchronously rather than reported accepted and then failing before work. Preserve supported settings and existing policy boundaries.

## Evidence

Tooling friction reports tf_20261007T135501_ff885ddd and tf_20261006T103042_7e360552 record accepted gpt-mini + thinking medium, followed by `Thinking level "medium" is not supported for openai/gpt-5.4-mini. Use one of: off.` with no domain work. This is a separate failure from the subsequent opaque provider schema rejection with thinking off.
Host source inspection: src/agents/subagent-spawn-plan.ts invokes resolveSubagentThinkingOverride; helper normalizes lexical thinking values without model compatibility. formatThinkingLevels is only used if normalization fails. src/agents/agent-command.ts later applies isThinkingLevelSupported with the effective thinking catalog and rejects explicit unsupported levels. Reuse the authoritative capability resolution rather than duplicating a model-name table.

## Scope boundary

Only OpenClaw fork source/tests. Primary seams: src/agents/subagent-spawn-plan.ts, subagent-spawn-thinking.ts, subagent-spawn.ts and existing spawn/model capability tests. Read the repo's applicable instructions. Do not inspect other repos, private runtime/config/credentials, or actual child transcripts. No schema-route remediation in this slice; unknown provider schema cause remains separate. No unrelated dirty-file edits.

## Requirements

- Characterize the accepted-but-unsupported path using synthetic injected catalog/config and unit tests before fixing.
- Validate against the same effective resolved provider/model capabilities and alias handling as execution, using existing shared resolver seams. Do not make assumptions about universal supported levels of a provider/model family.
- Explicit incompatible override: fail synchronously with canonical model and allowed levels, no queued worker or successful spawn result. No new child execution side effects after validation failure; test early path ordering.
- Preserve effective model selection precedence, supported levels, inherited/config defaults and their existing execution fallback semantics. Do not silently reinterpret an explicit user request.
- Cover alias and canonical refs, supported off, unsupported explicit level, catalog-dependent capability, lexical-invalid input, inherited/default thinking, and models with other valid reasoning levels. Return useful sanitized errors, never provider payload/secrets.
- If safe effective capability resolution needs an existing async seam, use it rather than a parallel registry. No network preflight, live probe, model-call trial, new registry/config/permission changes.

## Acceptance

Focused deterministic spawn/planning/thinking unit tests plus unchanged registered full gate. Record true RED/GREEN and exact verification evidence. No build deployment, service/restart/scheduler actions, live sessions/provider/model/message calls, local model trials or gate waivers. Source correctness is not a runtime-installation claim.
