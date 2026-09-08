# Model Ops: supported bounded model-configuration runtime capability

## Objective and scope

User approved extending existing Model Ops so routine LLM configuration changes never require coding tasks. Implement the missing supported operator-authorized runtime owner in openclaw-fork ONLY (/Users/michal/Projects/openclaw-fork). Do not inspect other repositories or live home configs. Do not deploy/restart services, alter permissions, weaken protected config policy, or implement a direct-file/alternate-transport bypass. The capability must be explicitly authorized through the existing authenticated operator approval infrastructure, not enabled for arbitrary agents. If that authorization cannot be expressed without a policy decision, stop with precise prerequisite.

## Supplied external contract

KM model-ops currently validates plans and always refuses protected apply. Existing request fields: operation, changes[{path,before,after}], expectedConfigSha256; digest currently Python json.dumps(sort_keys=True,separators=(',',':'),ensure_ascii=False) UTF8 SHA256. Current permitted fields: existing provider models array; agents.defaults.models model-key; agents.defaults.model.primary. This task must define supported versioned request/result transport for KM to consume via public Gateway/CLI owner; do not require KM to write config. Use existing server method/auth conventions, not fabricated general patch endpoint. Add explicit model-reference support for heartbeat and model fallback fields only where supported schema validates. No endpoint/credential/permission mutation. Keep general config.patch denial unchanged.

## Behavior

Characterization-first: inspect local protected config/auth validation and tests. Define operation-specific catalog registration/retirement, primary model/default/heartbeat/fallback reference replacement with provider-qualified IDs. Check exact target/provider existence, distinguish catalogue vs configured references, reject dangling references, stale plan and wrong approvals. Model IDs include periods/slashes; no naive dot-path traversal. Preserve unrelated fields/overrides and historical records. Approval binds exact diff and digest; concurrent drift requires replan/reapproval. Secret-free dry-run, backup, config validation, lock/CAS, targeted readback verification and bounded rollback only without intervening edits. Separate persisted/reloaded/effective evidence and return reload requirement; no automatic Gateway restart. Existing general config APIs stay protected.

## Verification/handoff

Fixture-only tests: authorized apply, denied/missing approval, forged/replayed/stale requests, unrelated protected path rejection, Fable5 retained, heartbeat and fallbacks, Unicode/dotted model keys, concurrent write and rollback. Check smallest related auth/config suite. Document public transport and exact versioned wire schema in docs/gateway/model-ops-runtime-contract.md with sanitized golden fixtures and CLI examples (no external file access). This is a named runtime capability, not expansion of blanket access. Task does file edits and local verification only; activation requires host evidence later. New module filenames domain-qualified (e.g. model-ops-runtime-contract.ts, model-ops-config-operations.ts); check basename collisions, no generic utils/state/config modules.
