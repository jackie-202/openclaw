# Upstream sync branch strategy — implementation

Implement the plan at ~/Projects/openclaw-fork/plans/006_upstream-sync-branch-strategy.md

The plan involves:
1. Rewrite `~/.openclaw/workspace/skills/openclaw-upstream/scripts/sync.sh` — three modes: default/--branch, --merge, --abort. Uses a `.upstream-sync-branch` marker file in the repo to track active sync branch.
2. Update `~/.openclaw/workspace/skills/openclaw-upstream/SKILL.md` — document the new three-phase workflow.
3. Add `.upstream-sync-branch` to `~/Projects/openclaw-fork/.gitignore`.

Follow the plan exactly. The script should:
- `--branch` (default): check for dirty tree (refuse if dirty), fetch upstream, show custom commit summary, create upstream-sync/YYYY-MM-DD branch, merge upstream/main, report which custom files upstream touched, pnpm build, pnpm test (non-blocking), write marker file
- `--merge`: read marker file, checkout main, merge sync branch, npm link, openclaw doctor, git push origin, delete branch, remove marker
- `--abort`: read marker file, checkout main, delete branch, remove marker
- `--dry-run`: fetch, show counts, show custom commit summary, check custom file modifications — no branch created

Custom files to protect: src/auto-reply/reply/group-gate.ts, src/media-understanding/runner.entries.ts, src/config/zod-schema.providers-whatsapp.ts, src/config/types.whatsapp.ts

Project: ~/Projects/openclaw-fork
