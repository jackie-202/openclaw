---
title: "Rebase conflict: drop superseded debug commits vs resolve"
date: 2026-03-13
category: tooling
component: tooling
tags: [git, rebase, conflict-resolution, upstream-sync, debug]
---

# Diagnosing rebase conflicts: when to drop vs resolve

When a rebase conflict hits a debug/diagnostic commit, the first question to ask is
**"has upstream already added equivalent or better logging?"** before spending time
on a resolution.

## Pattern: debug commit superseded by upstream

Our commit `90753b150` added `log.info(...)` for bootstrap context diagnostics in
`attempt.ts`. By the time we tried to rebase onto upstream `4f620bebe`, upstream had
already added:
1. A `log.debug(...)` with equivalent fields (lines 815-817 in current `attempt.ts`)
2. A more comprehensive `buildBootstrapInjectionStats()` call in the same block

The right answer was to **drop the commit**, not resolve the conflict.

## How to identify superseded debug commits

Run these checks before attempting conflict resolution:

```bash
# Check if upstream now has similar log lines in the conflict file
git show upstream/main -- <conflicted-file> | grep -n "bootstrap context resolved"

# Check if the conflicted commit touched only one file
git show <conflict-sha> --stat

# Check if the commit message starts with "debug:" or "chore:" (temporary intent)
git log --oneline <conflict-sha>~1..<conflict-sha>
```

If upstream already has the logging and the commit is explicitly a temp diagnostic
(`debug:` prefix), drop it.

## `git rebase --onto` for selective exclusion

To drop a single commit from a rebase without interactive mode:

```bash
# Drop commit X, replay everything after X onto new base
git rebase --onto <new-base> <commit-X> <branch>
```

But this only handles commits AFTER X. For commits both before AND after X,
you need either:
- `git rebase -i` in a real terminal (drop the line)
- A two-phase rebase (rebase up to X's parent, then rebase X+1..HEAD onto the new tip)

## File-overlap analysis before rebasing

Before starting a rebase, always run:

```bash
# Get set of files upstream changed
git diff --name-only <merge-base>..<rebase-target> > /tmp/upstream_files.txt
# Get set of files our fork changed  
git diff --name-only <merge-base>..HEAD -- 'src/**' > /tmp/fork_files.txt
# Find overlap (potential conflicts)
comm -12 <(sort /tmp/upstream_files.txt) <(sort /tmp/fork_files.txt)
```

In our case, only `attempt.ts` and `run.ts` overlapped significantly. All our
group-gate feature files were new additions (no conflict).

## Merge commit handling in rebase

A fork that has upstream-sync merge commits in its local history will see those
merge commits become empty no-ops during rebase (the upstream changes are now the
base). Git linearizes them away. This is expected and correct — do NOT try to
preserve them with `--rebase-merges`.

## Upstream's line-shift is the root cause of most rebase conflicts

The conflict in `attempt.ts` was caused by upstream inserting ~258 lines of new code
(`extractBalancedJsonPrefix` + tool call repair helpers) in the same function area
where our debug log was inserted. Git couldn't determine whether our 5-line insertion
should go before or after the 258-line insertion.

When you see a conflict like this: inspect where in the NEW upstream file the same
logical anchor point (e.g., right after `resolveBootstrapContextForRun`) now lives,
and insert our change there.
