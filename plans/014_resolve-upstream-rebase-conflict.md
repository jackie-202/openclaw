# Plan 014: Resolve Upstream Rebase Conflict (fork → upstream/main @ 4f620beb)

Resolve the merge conflict that blocked the rebase of fork/main onto upstream/main
at commit 4f620bebe5fbb4beec91c59ff0e5f1015168fb67 (2026-03-11), and safely land all
50 local fork commits on top of the updated upstream base.

*Status: DRAFT*
*Created: 2026-03-13*

---

## Progress

- [x] Phase 0: Config + Init
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

---

## Problem

The fork `main` branch (HEAD = `fb9808262`, 2026-03-12) is 50 commits ahead of its
merge-base with `upstream/main` (`dc4441322`), and 292 upstream commits behind the
latest upstream HEAD (`a3eed2b70`). A previous gateway `update.run` attempted a rebase
onto `4f620bebe` (45 commits up) and stopped at commit 6/45 (our `90753b150`) with:

```
CONFLICT (content): Merge conflict in src/agents/pi-embedded-runner/run/attempt.ts
Could not apply 90753b150... debug: log bootstrap files injected per session
```

The rebase was aborted. The repo is currently clean (no rebase-merge state in `.git/`).

---

## Analysis

### Git topology

| Ref | SHA | Description |
|-----|-----|-------------|
| `HEAD` / `origin/main` | `fb9808262` | Fork HEAD (2026-03-12) |
| merge-base w/ upstream | `dc4441322` | Last known common ancestor |
| rebase target (requested) | `4f620bebe` | upstream/main @ 2026-03-11 |
| upstream/main (current) | `a3eed2b70` | upstream HEAD (2026-03-12+) |

**Local fork commit count:** 50 total commits above merge-base.

**Meaningful custom patches** (non-auto-snapshot, non-merge):
```
50: 37210f534  feat: two-phase LLM gate for always-on group chats
49: 8d6b75f5d  fix: improve gate prompt
48: b45abb26c  fix: rewrite gate prompt as judgment-based
47: 4d33a6d9b  fix: gate should notice prolonged silence
46: ca0838aff  feat: add systemPrompt support to WhatsApp group config
45: 90753b150  debug: log bootstrap files injected per session  ← CONFLICT COMMIT
44: a966e5145  fix: loosen gate bias
43: cdbd2c875  feat: group session continuity
42: a981c813f  test: add group session bootstrap propagation tests
41: 4810ea32f  auto-reply: resolve WhatsApp group mentions before gating
40: c45c8db27  Merge branch 'feat/group-chat-gate'
39: a1cf5e643  feat(group-chat): layer shared and group knowledge memory
38: b9e4d277a  chore(bootstrap): add context loading debug summary
37: afb2afeb8  auto: 2026-03-06 (3 files)
36: d32cde73e  chore: merge upstream/main 2026-03-06
35: 1afc79555  feat: add Models mission control tab to Control UI
34: 45b74dcea  config: allow mission-control + workspace in opencode external_directory
33: bc59a1e1a  auto: 2026-03-07 (2 files)
...  (32 auto-snapshot commits)
```

### The Conflict: `90753b150` vs upstream

**What `90753b150` adds to `attempt.ts`:**

```typescript
// DEBUG: log which bootstrap files are injected per session
log.info(
  `bootstrap context resolved: sessionKey=${params.sessionKey ?? "?"} contextMode=${params.bootstrapContextMode ?? "full"} files=[${hookAdjustedBootstrapFiles.map((f) => `${f.name}(${f.missing ? "MISSING" : `${f.content?.length ?? 0}B`})`).join(", ")}] contextFiles=${contextFiles.length}`,
);
```

This was inserted right after the `resolveBootstrapContextForRun(...)` call, at the old
line ~543 in `attempt.ts`.

**What upstream commits changed in the same area (between merge-base and 4f620beb):**

1. `87876a3e3` — **Fix env proxy bootstrap for model traffic** — added
   `ensureGlobalUndiciEnvProxyDispatcher()` call right before
   `ensureGlobalUndiciStreamTimeouts()` early in `runEmbeddedAttempt` (line ~752 in
   current file). Also refactored imports.

2. `453c8d7c1` — **fix(hooks)** — added `trigger` and `channelId` to hook contexts,
   touching lines ~1774 and ~1982.

3. `d8ee97c46` — **Agents: recover malformed Anthropic-compatible tool call args** —
   inserted ~258 lines of new code (`extractBalancedJsonPrefix`, tool call repair
   helpers) starting around line 436. **This shifted all subsequent line numbers by
   ~258 lines**, pushing our debug log's insertion point from ~543 to ~800+.

4. `9aeaa19e9` — **Agents: clear invalidated Kimi tool call repair** — added
   `clearToolCallArgumentsInMessage` helper (~20 lines) at ~line 557.

**Why the conflict occurred:** Upstream's `d8ee97c46` inserted 258 lines of new code
into `attempt.ts` in the same area where our commit `90753b150` inserted the debug
`log.info`. Git's 3-way merge couldn't reconcile the structural reshuffling with our
insertion.

**Key insight — the debug logging is superseded by upstream:** Looking at the current
`attempt.ts` (lines 815–817), upstream already has an equivalent `log.debug` call with
even more detail:

```typescript
log.debug(
  `bootstrap context resolved: sessionKey=${params.sessionKey ?? params.sessionId} loaded=[${loadedContextNames.join(", ")}] missing=[${missingBootstrapNames.join(", ")}]`,
);
```

Our `log.info` commit (`90753b150`) captured:
- `sessionKey`, `contextMode`, per-file sizes/missing status, `contextFiles.length`

Upstream now has in the same block (lines 809–827):
- `log.debug` with `sessionKey`, `loaded=[]`, `missing=[]`
- Plus `buildBootstrapInjectionStats()` for full injection analysis

Our commit `b9e4d277a` also added logging to `bootstrap-files.ts` itself with
`sessionKey`, `runKind`, `contextMode`, `loaded`, `missing`, `skipped` — which is
**more comprehensive** than our `attempt.ts` debug line.

**Conclusion: commit `90753b150` can be dropped without loss.** Its diagnostic intent
is fully covered by upstream's own logging plus our `b9e4d277a`.

### Additional conflict risk assessment

Files touched by **both** upstream (dc4441322→4f620bebe) and our fork:

| File | Upstream commits | Fork commits | Risk |
|------|-----------------|--------------|------|
| `src/agents/pi-embedded-runner/run/attempt.ts` | 4 commits | `90753b150`, `b9e4d277a` (indirect) | **HIGH** — known conflict |
| `src/agents/pi-embedded-runner/run.ts` | 2 commits | auto-snapshots (merge carries) | MEDIUM |
| `src/config/types.gateway.ts` | 1 commit (UI slice 1) | auto-snapshot `e89c5ce10` (our new fields) | LOW — different lines |
| `src/cli/daemon-cli/lifecycle.test.ts` | upstream test changes | auto-snapshot | LOW |
| `src/config/schema.help.ts` / `schema.labels.ts` | upstream | auto-snapshot | LOW |
| `src/gateway/protocol/schema/agent.ts` | upstream | auto-snapshot | LOW |

The overlap in `types.gateway.ts` deserves checking: upstream added dashboard-v2 chat
infra fields; our fork added `GatewayEventLoopGuardConfig` and
`GatewayAnnounceDeliveryConfig`. These are in different parts of the file (our types go
after `GatewayToolsConfig`), so a textual conflict is unlikely but must be verified.

### Knowledge base

**Critical patterns (from `learnings/tooling/fork-sync-audit-led-conflict-resolution.md`):**
- In high-churn files: preserve upstream interface/flow refactors first, then
  re-apply small fork-only diagnostics in the new structure.
- After conflict resolution, verify exact contract points before running full test suite.
- Full `pnpm check` can fail on formatting drift in plan/learning docs — treat separately.

**AGENTS.md multi-agent safety:**
- Do not create/apply/drop git stash entries unless explicitly requested.
- When rebasing, scope to your changes only.
- `git rebase -i` requires interactive input — not available in automated context; use
  non-interactive approaches (cherry-pick or `--exec` strategy instead).

---

## Solutions

### Option A: Drop `90753b150` via `--onto` rebase (Recommended)

Since `90753b150` is a temporary diagnostic commit whose output is now fully superseded
by upstream's own logging, the cleanest solution is to **exclude it from the rebase**.

Strategy: Use `git rebase --onto` or create a new branch without the conflicting commit,
then rebase.

**Approach:**
1. Create a new integration branch from the rebase target (`4f620bebe`)
2. Cherry-pick all 50 local commits **except** `90753b150`
3. For merge commits in the list (which can't be cherry-picked), handle via the
   topological ordering approach described below

Alternatively with interactive rebase (must be done in a real terminal, not automation):
```bash
git rebase -i dc4441322 # then `drop` the line for 90753b150
```
Then:
```bash
git rebase 4f620bebe
```

### Option B: Resolve conflict in-place during rebase (Alternative)

Start the rebase, and when it stops at `90753b150`, resolve by simply **accepting
upstream's version** (since their logging is more complete), then continue.

```bash
git rebase 4f620bebe
# When stopped at 90753b150:
git checkout --theirs src/agents/pi-embedded-runner/run/attempt.ts
# or manually merge: keep upstream's log.debug, drop our log.info
git add src/agents/pi-embedded-runner/run/attempt.ts
git rebase --continue
```

### Option C: Squash `90753b150` into the preceding feature commit

Squash the debug commit into `a966e5145` (fix: loosen gate bias) or `cdbd2c875`
(feat: group session continuity) during interactive rebase. Less clean since those
commits are semantically unrelated.

**Recommended:** **Option A** (drop the commit) is cleanest and lowest-risk, since the
commit is explicitly marked as `debug:` (temporary diagnostic) and its value is already
present in upstream.

---

## Implementation

### Pre-implementation checklist

- [ ] Verify no rebase/merge is currently in progress: `git status` — should show
      clean working tree (confirmed: clean)
- [ ] Ensure `upstream/main` is up to date: `git fetch upstream`
- [ ] Decide whether to target `4f620bebe` (as in original task) or latest
      `upstream/main` (`a3eed2b70`). Note: `a3eed2b70` is only 1 commit further and
      adds a fix for memory file duplication on case-insensitive mounts — rebasing
      to latest is marginally better but optional.
- [ ] Create a safety backup branch before starting

### Step-by-step implementation

#### Step 1: Create a safety backup

```bash
git branch backup/pre-rebase-2026-03-13 HEAD
```

This preserves the current state. It can be deleted after successful rebase + deploy.

#### Step 2: Fetch upstream

```bash
git fetch upstream
```

Ensures `4f620bebe` and `upstream/main` refs are current.

#### Step 3: Identify the exact rebase range

Our merge-base:
```
dc4441322f9dc15f19de7bb89c3b2daf703d71e6
```

The 50 local commits to replay are: everything from `37210f534` (oldest) up to
`fb9808262` (HEAD), in chronological order (oldest-first).

#### Step 4: Drop `90753b150` using a non-interactive rebase

Since `git rebase -i` requires a terminal, use one of these approaches:

**Approach 4a: `git rebase --onto` with a prepare step**

```bash
# Step 4a-1: Create a temporary branch that is identical to the commit BEFORE 90753b150
# 90753b150's parent commit is a966e5145
git checkout -b temp/rebase-prep a966e5145

# Step 4a-2: Cherry-pick all commits FROM (not including) 90753b150 THROUGH HEAD
# i.e., ca0838aff and everything after, up to HEAD
# First, get the list: 46 commits from ca0838aff to fb9808262
git cherry-pick ca0838aff cdbd2c875 a981c813f 4810ea32f c45c8db27 a1cf5e643 b9e4d277a afb2afeb8 d32cde73e 45b74dcea 1afc79555 bc59a1e1a ... (auto commits) ... fb9808262
```

> Note: The cherry-pick approach is complex for merge commits (c45c8db27 "Merge branch
> 'feat/group-chat-gate'"). Merge commits need `git cherry-pick -m 1 <sha>`.

**Approach 4b: Use `git rebase --onto` directly (cleaner)**

```bash
# Rebase: take commits FROM (exclusive) 90753b150's parent to HEAD
# and replay them on top of 4f620bebe, thus skipping 90753b150 itself

git rebase --onto 4f620bebe 90753b150 HEAD
```

Wait — `git rebase --onto <newbase> <upstream> <branch>` replays commits from
`<upstream>` (exclusive) to `<branch>`. So:

```bash
git rebase --onto 4f620bebe 90753b150
```

This replays commits from `90753b150` (exclusive, i.e., starting with `ca0838aff`)
through HEAD, onto `4f620bebe`. The commits from `37210f534` through `a966e5145`
(commits 50 down to 44 in our list) will still need to be handled.

**Correct full approach:**

The commits BEFORE `90753b150` (oldest to newest) are:
```
37210f534 → 8d6b75f5d → b45abb26c → 4d33a6d9b → ca0838aff → a966e5145  [these need to go onto 4f620beb too]
90753b150  [DROP THIS]
ca0838aff → ... → fb9808262  [these replay after dropping 90753b150]
```

The proper sequence:

**Option 4c: Two-phase rebase (recommended for automation)**

```bash
# Phase 1: Rebase commits BEFORE the problematic commit
# (37210f534 through a966e5145) onto 4f620bebe
git rebase --onto 4f620bebe dc4441322 a966e5145

# This puts a966e5145 as the tip of a detached HEAD on top of 4f620bebe
# Save the new SHA of a966e5145's rebased version
NEW_PARENT=$(git rev-parse HEAD)

# Phase 2: Rebase commits AFTER the dropped commit
# (ca0838aff through fb9808262) onto NEW_PARENT
# Check out our main branch and rebase forward
git checkout main
git rebase --onto $NEW_PARENT 90753b150 main
```

Wait - this is getting complicated due to merge commits in the range. The cleanest
approach for a mixed linear/merge commit history is the interactive rebase in a real
terminal.

**Recommended actual implementation steps** (to be executed in a real shell session):

```bash
# 1. Safety backup
git branch backup/pre-rebase-2026-03-13 HEAD

# 2. Fetch upstream
git fetch upstream

# 3. Interactive rebase - in a REAL terminal (not automation)
git rebase -i dc4441322

# In the editor that opens:
# - Find the line: pick 90753b150 debug: log bootstrap files injected per session
# - Change "pick" to "drop" (or just delete that line)
# - Save and exit the editor
# This will replay all commits except 90753b150, in order

# 4. After the drop rebase completes cleanly (no more conflicts expected):
# The branch is now rebased onto dc4441322 without the debug commit.
# Now rebase that onto 4f620bebe:
git rebase 4f620bebe

# 5. Handle any conflicts that arise:
# For each conflict file, prefer upstream changes and re-apply our changes cleanly
# on top. Use the conflict resolution guidance below.

# 6. Verify build
pnpm install && pnpm build

# 7. Verify lint (optional, treat formatting drift separately)
pnpm check

# 8. Run tests
pnpm test

# 9. If clean: force-push to origin (fork)
git push origin main --force-with-lease

# 10. Deploy (npm link / restart gateway via OpenClaw Mac app)
npm link
# Then restart gateway via the OpenClaw Mac app (NOT ad-hoc tmux)
```

### Conflict resolution guidance for `attempt.ts`

If additional conflicts arise during the rebase in `attempt.ts`, follow this pattern:

1. **Open the conflicted file** and inspect both sides.
2. **Preserve upstream structure first** — accept all upstream refactors/new functions
   (like `extractBalancedJsonPrefix`, `clearToolCallArgumentsInMessage`, etc.).
3. **Re-apply our changes** — look for our group-chat/gate-related changes in
   `attempt.ts`. These are unlikely since our custom patches touch different files
   (`group-gate.ts`, `bootstrap-files.ts`, `zod-schema.providers-whatsapp.ts`, etc.),
   not the tool-call repair sections of `attempt.ts`.
4. If our debug `log.info` from `b9e4d277a` creates a conflict, **keep upstream's
   `log.debug`** which has equivalent or better information.

### Conflict resolution for `types.gateway.ts`

If a conflict arises here:
- Upstream added: chat infrastructure fields (dashboard-v2 slice 1).
- Our fork added: `GatewayEventLoopGuardConfig` and `GatewayAnnounceDeliveryConfig`
  (in auto-snapshot `e89c5ce10`).
- These are in different areas of the file. Resolution: keep both sets of additions.

### Handling merge commits in the rebase

The local fork has 4 merge commits:
- `c45c8db27` Merge branch 'feat/group-chat-gate'
- `d32cde73e` chore: merge upstream/main 2026-03-06
- `6471392bd` Merge upstream/main into upstream-sync/2026-03-11
- `e701df1cf` Merge remote-tracking branch 'upstream/main' into upstream-sync/2026-03-11-1

During `git rebase -i`, merge commits cannot be replayed by default. When using
interactive rebase, these will appear as warnings/errors. Strategies:

1. **Accept git's merge-linearization**: `git rebase` by default linearizes history
   (drops merge commits and replays the effective changes). This is usually fine for a
   fork that is privately maintained.
2. **Alternatively**: use `git rebase -i --rebase-merges` to preserve merge topology.
   However, for upstream syncs that have been merged in, this adds complexity without
   benefit — those merge commits just bring in upstream changes that will now be the
   base anyway.

**Recommendation**: Allow linearization (default `git rebase -i` behavior). The
upstream sync merge commits are "bring upstream in" commits; after the rebase, upstream
is the new base, so these merges become empty no-ops and will be dropped automatically.

---

## Files to Modify

During conflict resolution, the following files may need manual intervention:

| File | Expected action |
|------|----------------|
| `src/agents/pi-embedded-runner/run/attempt.ts` | Accept upstream's version; our `90753b150` commit is dropped; `b9e4d277a` only touches `bootstrap-files.ts` |
| `src/agents/pi-embedded-runner/run.ts` | Accept upstream if conflicted; verify our fork has no meaningful custom changes here (only in auto-snapshots which carry upstream syncs) |
| `src/config/types.gateway.ts` | Keep both: upstream dashboard-v2 types AND our `GatewayEventLoopGuardConfig`/`GatewayAnnounceDeliveryConfig` |
| `src/cli/daemon-cli/lifecycle.test.ts` | Accept upstream; our changes here are from upstream syncs, not fork customizations |

**Files our fork adds that upstream does NOT have (no conflict expected):**
- `src/auto-reply/reply/group-gate.ts` — new file (group chat LLM gate)
- `src/auto-reply/reply/group-context-priming.ts` — new file
- `src/auto-reply/reply/gate-context.ts` — new file
- `src/auto-reply/reply/gate-security.ts` — new file
- `src/config/types.whatsapp.ts` (additions only in group config section)
- `src/config/zod-schema.providers-whatsapp.ts` (additions to group schema)

---

## Testing

After completing the rebase:

### 1. Build check (mandatory)
```bash
pnpm install
pnpm build
```
Expected: zero TypeScript errors, zero `[INEFFECTIVE_DYNAMIC_IMPORT]` warnings.

### 2. Lint check
```bash
pnpm check
```
Expected: 0 lint errors. Format drift in `plans/` or `learnings/` docs is OK to ignore
(per `learnings/tooling/fork-sync-audit-led-conflict-resolution.md`).

### 3. Test suite
```bash
pnpm test
```
Expected: pass (previously 731/731 test files; 1 pre-existing failure is acceptable).

### 4. Bootstrap/group-gate functional verification (manual)
- Confirm `src/auto-reply/reply/group-gate.ts` is present and unmodified.
- Confirm `src/agents/bootstrap-files.ts` still has the `bootstrapLog.debug(...)` from
  `b9e4d277a`.
- Confirm `src/config/types.gateway.ts` still has our `GatewayEventLoopGuardConfig` and
  `GatewayAnnounceDeliveryConfig` type exports.
- Confirm `src/config/types.whatsapp.ts` still has our WhatsApp group `systemPrompt`
  and group continuity fields.
- Grep check: `grep -n "groupGate" src/config/types.gateway.ts` should still find our
  group gate config type.

### 5. Deploy and smoke-test
```bash
npm link
# Restart gateway via OpenClaw Mac app
# Send a test message to a WhatsApp group
# Verify gate fires (check logs)
```

---

## Dependencies and Risks

### Confirmed safe
- Commit `90753b150` can be dropped — its diagnostic purpose is covered by upstream
  (lines 815–817 in current `attempt.ts`) and our `b9e4d277a` (in `bootstrap-files.ts`).
- `b9e4d277a` only touches `bootstrap-files.ts` — no conflict with upstream.

### Risks requiring attention

1. **Additional conflicts in commits 7–45**: The analysis identified only `attempt.ts`
   as a high-risk overlap. The remaining files our fork touches (`group-gate.ts`,
   `bootstrap-files.ts`, `zod-schema.providers-whatsapp.ts`, etc.) are new files or
   additions in areas upstream did not touch.

2. **Merge commit linearization**: The 4 merge commits in our local history
   (`c45c8db27`, `d32cde73e`, `6471392bd`, `e701df1cf`) will become no-ops and be
   dropped during rebase. This is expected and correct.

3. **`@mariozechner/pi-ai` version mismatch** (mentioned in context as previous failure):
   After `pnpm install`, verify `pnpm why @mariozechner/pi-ai` shows a compatible
   version. If there is a version conflict, check `package.json` lockfile and resolve
   before deployment.

4. **Force push to `origin/main`**: Required after rebase. Use `--force-with-lease` to
   avoid overwriting concurrent remote changes. Warn: this rewrites public history on
   the fork. Since this is a private fork (`jackie-202/openclaw`), this is acceptable.

---

## Quick Reference: Commit to Drop

```
SHA:     90753b150a34aaa957fcf3602b28dbc4d5f899d7
Message: debug: log bootstrap files injected per session
File:    src/agents/pi-embedded-runner/run/attempt.ts
Change:  +5 lines (log.info bootstrap context with file sizes)
Reason:  Superseded by upstream's log.debug (lines 815-817 in current attempt.ts)
         and our b9e4d277a in bootstrap-files.ts
Action:  DROP in interactive rebase (change "pick" to "drop")
```

---

*Created: 2026-03-13*
*Status: DRAFT*
