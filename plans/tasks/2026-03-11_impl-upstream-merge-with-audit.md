# Upstream merge: apply fork audit and sync to upstream/main

## Objective

Merge upstream/main into our fork's main branch, using the fork audit report (`plans/fork-audit-report.md`) as the definitive guide for conflict resolution.

## Pre-merge

1. `cd ~/Projects/openclaw-fork`
2. `git fetch upstream`
3. Create sync branch: `git checkout -b upstream-sync/2026-03-11 main`
4. Start merge: `git merge upstream/main`

## Conflict Resolution Rules (from audit report)

### Auto-merge safe (12 files) — accept git's auto-merge, no manual intervention needed:
- `src/agents/bootstrap-files.test.ts`
- `src/agents/bootstrap-files.ts`
- `src/agents/workspace.test.ts`
- `src/auto-reply/reply/group-context-priming.test.ts`
- `src/auto-reply/reply/group-context-priming.ts`
- `src/auto-reply/reply/group-gate.test.ts`
- `src/auto-reply/reply/group-gate.ts`
- `src/config/types.whatsapp.ts`
- `src/config/zod-schema.providers-whatsapp.ts`
- `src/web/auto-reply/monitor/group-gating.ts`
- `src/web/auto-reply/monitor/on-message.ts`
- `src/web/auto-reply/monitor/process-message.ts`

### Manual resolution required (4 files):

#### `src/agents/pi-embedded-runner/run/attempt.ts`
- **Keep upstream changes** (onPayload signature, import removals, compaction retry changes)
- **Re-apply our debug logging** (the `bootstrapLog.debug(...)` line from commit `90753b150`)
- If our debug line conflicts with upstream's refactored code, adapt it to fit the new structure

#### `src/auto-reply/reply/get-reply-run.ts`
- **Keep upstream changes** (ACP ingress provenance receipts from `e3df94365`)
- **Keep our additions** (group continuity priming imports + the `if (isGroupChat && isFirstTurnInSession)` block)
- Both modify the `runPreparedReply` area — ensure both sets of additions coexist

#### `src/config/types.agent-defaults.ts`
- **Keep upstream's `compaction.model` field** (it was NOT intentionally removed by us — confirmed by audit)
- **Keep our `groupGate` type addition**
- Both should coexist in `AgentDefaultsConfig`

#### `src/config/zod-schema.agent-defaults.ts`
- **Keep upstream's `compaction.model` schema** (`model: z.string().optional()` inside compaction object)
- **Keep our `groupGate` schema** (the `.object({...}).strict().optional()` block)
- Ensure schema matches types file exactly

## Post-merge verification

1. `pnpm build` — must pass (TypeScript compilation)
2. `pnpm test` — run full test suite
3. If tests pass: `git checkout main && git merge upstream-sync/2026-03-11 && git push`
4. Rebuild and deploy: `cd ~/Projects/openclaw-fork && pnpm build`
5. Restart gateway to pick up changes

## Critical: DO NOT
- Do not drop `compaction.model` from types or schema (it's upstream's feature, we keep it)
- Do not modify any auto-merge safe files manually — trust git's resolution
- Do not force-push or rebase — merge commit preserves history
