# Plan 006: Upstream Sync Branch Strategy + Skill Update

Redesign the openclaw upstream sync workflow to use a dedicated branch strategy instead of merging directly into main. Update the skill SKILL.md and sync.sh script accordingly.

*Status: DRAFT*
*Vytvořeno: 2026-03-08*

---

## Progress

- [x] Fáze 0: Config + Init
- [x] Fáze 1: Research
- [x] Fáze 2: Knowledge
- [x] Fáze 3: Synthesis

## Problem

Current upstream sync merges directly into main, which is risky with 537 commits behind upstream. If the merge breaks the build or introduces conflicts with our 23 custom commits, main is left in a broken state and rollback is painful.

**Requirements:**
1. Branch-based sync: create `upstream-sync/YYYY-MM-DD` branch for merge + build + test
2. Three script modes: `--branch` (default), `--merge`, `--abort`
3. Pre-merge: summarize our custom commits that need to survive
4. Post-merge: diff-check our key custom files against upstream changes
5. Clear conflict reporting

## Analysis

### Kontext z codebase

**Git topology:**
- `origin` → `git@github.com:jackie-202/openclaw.git` (fork)
- `upstream` → `https://github.com/openclaw/openclaw.git` (official)
- Current branches: `main`, `feat/group-chat-gate`
- 537 commits behind upstream/main, 23 commits ahead

**Our custom commits (23, from git log):**
- Group chat gate feature: two-phase LLM gate, gate prompt rewrites, bias tuning, session continuity, knowledge layering, mentions handling
- WhatsApp config: systemPrompt support for group config, types + zod schema extensions
- Media understanding: whisper fix, attachment guards, proxy fetchFn
- Mission control: Models tab, context loading debug
- Auto-commit snapshots (cron-based)
- Upstream merge commit from 2026-03-06

**Key custom files (must survive sync):**
- `src/auto-reply/reply/group-gate.ts` (15KB) — group chat LLM gating
- `src/media-understanding/runner.entries.ts` (21KB) — media understanding with our fixes
- `src/config/zod-schema.providers-whatsapp.ts` (5.8KB) — WhatsApp config schema extensions
- `src/config/types.whatsapp.ts` (4.5KB) — WhatsApp config type extensions

**Existing skill structure:**
- Skill: `~/.openclaw/workspace/skills/openclaw-upstream/SKILL.md` (44 lines)
- Script: `~/.openclaw/workspace/skills/openclaw-upstream/scripts/sync.sh` (80 lines)
- Current flow: auto-commit dirty state → fetch → merge → build → npm link → doctor → push
- Only supports `--dry-run` flag

**Current script issues:**
1. Merges directly into main — no rollback if build/tests fail
2. No custom file protection — doesn't check if upstream modified our files
3. No summary of our custom commits before merge
4. Auto-commits dirty state with `--no-verify` (risky)
5. Single-shot: no staged workflow (branch → verify → merge)

### Relevantní dokumentace

- AGENTS.md: Mentions `scripts/committer` for commits, `pnpm build` for build, `pnpm test` for tests
- Build commands: `pnpm build`, `pnpm test`, `pnpm check`
- Multi-agent safety: don't switch branches unless explicitly requested — relevant because the script WILL switch branches (user explicitly invokes it)

### Knowledge base

- No project learnings directory found (auto-discovery)
- AGENTS.md multi-agent safety rules: no branch switching unless explicit — the sync script is explicitly user-invoked, so this is fine
- AGENTS.md git safety: no stash create/apply unless requested — script should avoid `git stash`

## Solutions

### Approach: Three-phase branch-based sync

Replace the single-shot merge-into-main approach with a staged workflow using a dedicated sync branch.

**Flow diagram:**

```
[main] ─── user runs sync.sh (default / --branch) ───┐
                                                       ▼
                                            [upstream-sync/YYYY-MM-DD]
                                                       │
                                              1. Show custom commit summary
                                              2. git merge upstream/main
                                              3. Check conflicts
                                              4. If no conflicts: pnpm build
                                              5. If build OK: pnpm test
                                              6. Diff-check custom files
                                              7. Print status report
                                                       │
                     ┌─────────────────────────────────┴──────────────────────────┐
                     ▼                                                             ▼
           user runs --merge                                             user runs --abort
                     │                                                             │
           1. Checkout main                                              1. Checkout main
           2. git merge sync-branch                                      2. Delete sync branch
           3. npm link + doctor                                          3. Print "aborted"
           4. git push origin
           5. Delete sync branch
           6. Print "done"
```

**Advantages over current approach:**
- Main stays clean until human verifies the merge
- Easy rollback: just `--abort` and sync branch disappears
- Custom file diff report allows manual inspection before merge
- Build + test run on the sync branch, not on main

**Design decisions:**
1. Branch naming: `upstream-sync/YYYY-MM-DD` (with `-N` suffix if branch already exists for same day)
2. State tracking: use a marker file `.upstream-sync-branch` in repo root (gitignored) to remember the active sync branch name — avoids complex branch detection logic
3. `--dry-run` preserved as a sub-mode of `--branch` (fetch + show count + show custom summary, but don't create branch)
4. Custom files list: hardcoded in the script as a bash array — easy to update, no config file needed
5. No auto-push in `--merge`: the merge into main is local only; user must `git push` explicitly (safer)

## Implementation

### Pre-implementation checklist
- [ ] Back up current `sync.sh` (git tracks it; no extra action needed)
- [ ] Verify `.gitignore` includes `.upstream-sync-branch` marker file

### Step 1: Update `sync.sh` — complete rewrite

Rewrite `~/.openclaw/workspace/skills/openclaw-upstream/scripts/sync.sh` with the new three-mode structure.

**Script structure:**

```bash
#!/usr/bin/env bash
set -euo pipefail

FORK_DIR="$HOME/Projects/openclaw-fork"
MARKER_FILE="$FORK_DIR/.upstream-sync-branch"

# Key custom files that must survive sync
CUSTOM_FILES=(
  "src/auto-reply/reply/group-gate.ts"
  "src/media-understanding/runner.entries.ts"
  "src/config/zod-schema.providers-whatsapp.ts"
  "src/config/types.whatsapp.ts"
)

# Parse args: --branch (default), --merge, --abort, --dry-run
# Dispatch to function: do_branch, do_merge, do_abort
```

**Mode: `--branch` (default)**
1. Check for uncommitted changes — refuse if dirty (don't auto-commit; let user decide)
2. `git fetch upstream`
3. Count upstream-ahead commits; exit 0 if none
4. Print custom commit summary: `git log --oneline upstream/main..HEAD` (our 23 commits that ride on top)
5. Create branch `upstream-sync/YYYY-MM-DD` from current `main`
6. `git checkout upstream-sync/YYYY-MM-DD`
7. `git merge upstream/main --no-edit`
   - If conflict: print conflicting files, print "resolve conflicts then re-run --branch to continue or --abort to give up", exit 1
8. Check which custom files were touched by upstream: `git diff upstream/main...HEAD~1 -- $CUSTOM_FILES` (compare what upstream changed in those files)
   - Actually better: `git diff HEAD~1..upstream/main -- ${CUSTOM_FILES[@]}` to see upstream-only changes to our files
   - Print a clear report: "upstream MODIFIED / DID NOT MODIFY" per file
9. `pnpm build` — if fail: print error, suggest `--abort`
10. `pnpm test` — if fail: print warning (non-blocking, but flag it)
11. Write branch name to `$MARKER_FILE`
12. Print summary: "Sync branch ready. Inspect, then run `sync.sh --merge` or `sync.sh --abort`"

**Mode: `--dry-run`**
1. `git fetch upstream`
2. Count + list upstream commits
3. Print custom commit summary
4. Check if upstream modified any custom files (without merging)
5. Exit 0

**Mode: `--merge`**
1. Read `$MARKER_FILE` — if missing, error "no active sync branch"
2. Verify sync branch exists
3. `git checkout main`
4. `git merge $SYNC_BRANCH --no-edit` (fast-forward if possible)
5. `npm link` (deploy)
6. `openclaw doctor` (validate)
7. `git push origin` (push)
8. Delete sync branch: `git branch -d $SYNC_BRANCH`
9. Remove `$MARKER_FILE`
10. Print "Sync complete"

**Mode: `--abort`**
1. Read `$MARKER_FILE` — if missing, error "no active sync branch"
2. `git checkout main`
3. Delete sync branch: `git branch -D $SYNC_BRANCH`
4. Remove `$MARKER_FILE`
5. Print "Sync aborted. Main is unchanged."

### Step 2: Update SKILL.md

Rewrite `~/.openclaw/workspace/skills/openclaw-upstream/SKILL.md` to document the new three-phase flow.

**New structure:**
- Description: updated to mention branch-based strategy
- Quick reference: three commands (default, --merge, --abort, --dry-run)
- Workflow section explaining the staged approach
- Custom files section listing what we protect
- Conflict handling section (updated for branch workflow)
- Remotes section (unchanged)
- Notes section (updated)

### Step 3: Add `.upstream-sync-branch` to `.gitignore`

Add the marker file pattern to the repo's `.gitignore` so it's never committed.

## Files to Modify

| File | Change |
|------|--------|
| `~/.openclaw/workspace/skills/openclaw-upstream/scripts/sync.sh` | Complete rewrite: three-mode branch-based sync |
| `~/.openclaw/workspace/skills/openclaw-upstream/SKILL.md` | Rewrite docs for new workflow |
| `~/Projects/openclaw-fork/.gitignore` | Add `.upstream-sync-branch` |

## Testing

### Manual testing (recommended order):

1. **Dry run**: `bash sync.sh --dry-run`
   - Should show upstream commit count, our custom commit summary, and custom file modification check
   - No branches created, no changes

2. **Branch creation**: `bash sync.sh --branch` (or just `bash sync.sh`)
   - Should create `upstream-sync/YYYY-MM-DD` branch
   - Should run merge + build + test
   - Should print custom file diff report
   - Should write marker file
   - Verify: `git branch` shows sync branch, `cat .upstream-sync-branch` shows branch name

3. **Abort**: `bash sync.sh --abort`
   - Should delete sync branch, return to main, remove marker
   - Verify: `git branch` shows no sync branch, main is clean

4. **Full flow**: Run `--branch` again, then `--merge`
   - Should merge sync branch into main, deploy, push
   - Verify: `git log -1` shows merge, `openclaw doctor` passes

### Edge cases to verify:
- Running `--merge` without an active sync branch → error message
- Running `--branch` with dirty working tree → refused with message
- Running `--branch` when already on a sync branch → error or re-use
- Branch naming collision (same day, run twice) → suffix handling

## Dependencies

- `upstream` remote must be configured (already is: `https://github.com/openclaw/openclaw.git`)
- `pnpm` installed and working
- `openclaw` CLI available for `doctor` command
- `npm link` permissions (current setup works)

---
*Vytvořeno: 2026-03-08*
*Status: DRAFT*
