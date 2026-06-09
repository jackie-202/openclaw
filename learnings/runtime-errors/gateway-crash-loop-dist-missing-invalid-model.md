---
title: "Gateway crash-loop: dist/ chybí po rebase + invalid model config"
date: 2026-05-08
category: runtime-errors
component: tooling
tags: [gateway, launchd, crash-loop, dist, build, model-config, doctor]
---

# Gateway crash-loop po smazání dist/ + invalid model config

## Problém 1: dist/ chybí → launchd crash-loop

Gateway (`ai.openclaw.gateway` launchd agent) crashuje s `Cannot find module '/Users/michal/Projects/openclaw-fork/dist/index.js'` okamžitě po startu. launchd ji restartuje každou sekundu → spam err logu (35 MB za ~20h).

### Příčina

Node.js drží `dist/index.js` v paměti za běhu — smazání souboru za běhu proces neshodí. Gateway tedy zemřela z jiného důvodu (OOM nebo jiný crash), a při restartu launchd zjistil, že `dist/` chybí.

`dist/` nejspíš smazal rebase/clean operace (`pnpm clean`, `git clean -fdx`, apod.).

### Diagnóza

```bash
# Zjistit, jestli gateway process běží
pgrep -fl "openclaw.*gateway\|dist/index.js"
lsof -iTCP:18789 -sTCP:LISTEN

# Podívat se na real příčinu (ne gateway.log, ale gateway.err.log)
tail -100 ~/.openclaw/logs/gateway.err.log

# Zkontrolovat dist/
ls dist/index.js
```

### Oprava

```bash
# 1. Zastav launchd crash-loop
launchctl bootout gui/$UID/ai.openclaw.gateway

# 2. Rotuj spamované logy
TS=$(date +%Y%m%d_%H%M%S)
mv ~/.openclaw/logs/gateway.log ~/.openclaw/logs/gateway.log.$TS
mv ~/.openclaw/logs/gateway.err.log ~/.openclaw/logs/gateway.err.log.$TS
gzip ~/.openclaw/logs/gateway.log.$TS ~/.openclaw/logs/gateway.err.log.$TS &

# 3. Rebuild
pnpm build

# 4. Bootstrap zpět
launchctl bootstrap gui/$UID ~/Library/LaunchAgents/ai.openclaw.gateway.plist
```

---

## Problém 2: Gateway failuje na `Invalid config` — removed model

Po rebuildu gateway stále crashuje:

```
Gateway failed to start: Error: Invalid config at /Users/michal/.openclaw/openclaw.json.
agents.defaults.models.openai/gpt-5.3-codex-spark: Unknown model: openai/gpt-5.3-codex-spark.
gpt-5.3-codex-spark is no longer exposed by the OpenAI or Codex catalogs. Use openai/gpt-5.5.
Run "openclaw doctor --fix" to repair, then retry.
```

### Gotcha: `doctor --fix` toto NEOPRAVÍ

`pnpm openclaw doctor --fix` vyhodí "Config validation failed" a exit code 1 — nedokáže automaticky opravit odstraněné modely z katalogu.

### Manuální oprava

```bash
# Záloha
cp ~/.openclaw/openclaw.json ~/.openclaw/openclaw.json.bak.$(date +%Y%m%d_%H%M%S)

# Najít výskyt v config
grep -n "gpt-5.3-codex-spark" ~/.openclaw/openclaw.json

# Odebrat řádek z agents.defaults.models (Edit tool nebo sed)
# Typicky: "openai/gpt-5.3-codex-spark": {}
```

### Poznámka

Katalogová definice modelu (v `providers[].models[]`) gateway neblokuje — chyba vzniká pouze pokud je model v `agents.defaults.models`. Dead katalogová definice je neškodná.

---

## Postup po opravě: ověření

```bash
# Gateway running?
lsof -iTCP:18789 -sTCP:LISTEN
# Logy čisté?
tail -20 ~/.openclaw/logs/gateway.log
```
