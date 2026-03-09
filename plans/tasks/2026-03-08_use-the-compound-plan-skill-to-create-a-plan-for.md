Use the compound-plan skill to create a plan for:

## Task: Upstream sync branch strategy + skill update

Current situation:

- We have a fork of openclaw/openclaw at ~/Projects/openclaw-fork
- We are 537 commits behind upstream, 23 commits ahead (our custom features)
- Our custom code lives in: src/auto-reply/reply/group-gate.ts, src/media-understanding/runner.entries.ts, src/config/zod-schema.providers-whatsapp.ts, src/config/types.whatsapp.ts
- We have an existing sync skill at ~/.openclaw/workspace/skills/openclaw-upstream/SKILL.md
- The skill has a single script: ~/.openclaw/workspace/skills/openclaw-upstream/scripts/sync.sh

## Goal

1. Update the upstream sync workflow to use a dedicated branch strategy:
   - Instead of merging directly into main/master, create a new branch (e.g. `upstream-sync/YYYY-MM-DD`)
   - Do the full merge + build + test on that branch
   - If everything works: merge back to main
   - If it breaks: easy rollback, main stays clean

2. Update the skill SKILL.md and sync.sh script to implement this new flow:
   - `sync.sh --branch` or default behavior: create sync branch, do the work there
   - `sync.sh --merge`: merge the sync branch back to main (after human verification)
   - `sync.sh --abort`: abandon the sync branch, go back to main
   - The skill description should document this flow clearly

3. The script should also:
   - Before merging, summarize our custom commits that need to survive (so we can verify post-merge)
   - After merge, check if the key custom files were modified by upstream (diff check)
   - Report any conflicts clearly

Project: ~/Projects/openclaw-fork
Plans output dir: ~/Projects/openclaw-fork/plans/
