---
title: "Fork sync s critical upstream bugfixem: hotfix-first, rebase-second"
date: 2026-04-29
category: tooling
component: tooling
tags: [git, rebase, upstream-sync, fork, hotfix, launchctl, gateway]
file_type: decisions
---

# Fork sync s critical upstream bugfixem: hotfix-first, rebase-second

## Kontext

Fork `openclaw-fork` byl 23 commits za `upstream/main` a běžící gateway na localním buildu měl runaway promise loop (CPU 100%, RSS rostlo +250 MB/min, P99 event-loop delay 117s, `cron.list` odpovídal 92 sekund). Root cause byl missing upstream commit `7877182b6f fix(gateway): defer missed cron agent startup work`, který přechází synchronní spuštění missed cron jobs na deferred staggered execution.

Plný rebase (3 vlastní commits ahead, 30 upstream commits behind) byl plánovaný, ale gateway potřeboval fix HNED, ne až po vyřešení 9 očekávaných konfliktů.

## Pattern: Two-step sync

Když musíš sync velký a zároveň potřebuješ rychlý fix konkrétního bugu, NIKDY neslučuj obojí do jednoho rebase pod tlakem.

### Krok 1: Hotfix branch + cherry-pick

```bash
# Safety net
git tag pre-rebase-$(date +%Y-%m-%d-%H%M)

# Isolated fix
git checkout -b hotfix/<short-name>
git cherry-pick <upstream-fix-sha>

# Build + restart prod, verify
pnpm build
launchctl bootout gui/$(id -u)/ai.openclaw.gateway
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/ai.openclaw.gateway.plist
```

Production je healthy do 5 minut. Sync teď můžeš dělat v klidu.

### Krok 2: Rebase main na upstream/main

```bash
git checkout main
git rebase upstream/main
# … resolve conflicts …
pnpm build
# Restart gateway s plně syncnutou verzí (která už zahrnuje hotfix)
```

### Krok 3: Cleanup hotfix branch

```bash
git branch -D hotfix/<short-name>
git tag -d pre-rebase-<timestamp>
```

## Co jsem se naučil

### Pre-sync conflict prediction bývá pesimistická

`git diff --name-only main upstream/main` ukazuje seznam **změněných** souborů, ne **konfliktních**. 9 souborů ze seznamu se nemusí dotýkat stejných řádků jako naše commits. V tomto případě reálné konflikty: **0 source files** + 1 CHANGELOG.md (při cherry-pick, ne při rebase).

Praktický důsledek: nestrašit se velkým seznamem; rebase často projde čistě.

### CHANGELOG.md je hot zone pro cherry-pick

Při cherry-pickování upstream fixu, který přidává položku do `### Fixes`, vznikne konflikt vždy když `### Fixes` v naší verzi nemá stejné okolí. Resolution = vzít upstream verzi pokud jsme do té sekce nic nepřidávali; jinak zachovat oba.

### Build cache je tichý zabiják

Po `git fetch upstream && git rebase`, který upravuje source files, je `dist/index.js` stále starý. Gateway naloaduje stale buggy build → reproduces stejný problém. **Vždy `pnpm build` před restart**.

V tomto případě `dist/index.js` z 09:47 byl **post-fetch ale pre-merge** — tj. fetch proběhl ale rebase nebyl dokončený a build mezitím proběhl jen z částečně updatovaného stromu.

### Diagnostika: 4 indikátory cron startup loopu

Když gateway loop loop, ověř všechny 4 najednou:

```bash
# 1. Top-level resource usage
ps -o pid,pcpu,rss,etime -p <PID>
# Symptoms: %CPU≈100, RSS rostoucí, etime malý

# 2. Stack sample
sample <PID> 5 -file /tmp/sample.txt
# Look for: fs::AfterStat → MicrotaskQueue::RunMicrotasks → AsyncFunctionAwaitResolveClosure

# 3. Event-loop liveness
grep -E "liveness warning|eventLoopDelay" ~/.openclaw/logs/gateway.err.log | tail -5
# Symptoms: eventLoopDelayP99Ms > 1000, eventLoopUtilization > 0.95

# 4. WS response times
grep "cron.list\|health" ~/.openclaw/logs/gateway.log | tail -10
# Symptoms: response time > 30000ms
```

Po fixu hledej confirmation log:

```
cron: deferring missed agent jobs until after gateway startup count: N delayMs: 120000
cron: staggering missed jobs to prevent gateway overload immediateCount: 0 deferredCount: N
```

## Decision tree

```
Production gateway broken + upstream sync overdue
├── Is the bug fixed by a single upstream commit?
│   ├── YES → cherry-pick to hotfix branch, build, restart, THEN do full sync later
│   └── NO  → forced full rebase under pressure (high risk)
└── Is the full rebase risky (many predicted conflicts)?
    ├── YES → two-step (hotfix first, rebase next)
    └── NO  → straight rebase is fine
```

## Edge case: launchctl bootout selhává

Při restartu gatewaye se mi `launchctl bootout gui/501/ai.openclaw.gateway` vrátil `Bootstrap failed: 5: Input/output error`. Workaround:

```bash
# 1. Try bootout, ignore I/O error
launchctl bootout gui/$(id -u)/ai.openclaw.gateway 2>&1
# 2. Verify proces je opravdu pryč
pgrep -fl "dist/index.js gateway"
# 3. Pokud běží, kill -TERM
kill -TERM <PID>
sleep 5
# 4. Bootstrap znovu
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/ai.openclaw.gateway.plist
sleep 5
launchctl list | grep openclaw  # exit 0 = launchd ho zaregistroval (nový PID)
```

`launchctl list` "exit 0" neznamená crash — znamená "service je registered, momentálně neběží jako tracked PID, ale launchd ho re-spawne". Procházet to logem `~/.openclaw/logs/gateway.log` je spolehlivější než `launchctl print`.
