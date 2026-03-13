# Resolve upstream rebase conflict in OpenClaw fork

## Problem
`gateway update.run` attempted rebase onto upstream/main (4f620beb) but hit a merge conflict at commit 6/45:

```
CONFLICT (content): Merge conflict in src/agents/pi-embedded-runner/run/attempt.ts
Could not apply 90753b150... debug: log bootstrap files injected per session
```

Rebase was aborted automatically. Fork is stuck at fb98082 (2026.3.9), upstream is at 4f620beb (2026.3.11).

## Context
- Fork has 45 local commits on top of upstream
- Preflight build+lint of upstream target passed clean (build OK, 0 lint errors)
- Conflict is in our debug commit `90753b150` ("debug: log bootstrap files injected per session") touching `src/agents/pi-embedded-runner/run/attempt.ts`
- Previous sync attempt also failed (2026-03-10, different issue — `@mariozechner/pi-ai` version mismatch)

## Approach
1. Start interactive rebase: `git rebase -i 4f620bebe5fbb4beec91c59ff0e5f1015168fb67`
2. Resolve conflict in `attempt.ts` — our debug logging vs upstream changes
3. Consider if our debug commit can be dropped (was it a temporary diagnostic?)
4. Continue rebase through remaining 39 commits
5. After rebase: `pnpm install && pnpm build && pnpm lint`
6. If clean: `npm link` to deploy, restart gateway

## Risk
- More conflicts may appear in commits 7-45
- Need to verify all 45 local patches still make sense against new upstream
