---
title: "Fork rebase bez force-push: divergence a tichá build-breakage"
date: 2026-05-08
category: tooling
component: tooling
tags: [git, rebase, force-push, fork, build, imports, plugin-sdk]
---

# Fork rebase bez force-push → divergence + tichá build-breakage

## Situace

Fork `jackie-202/openclaw` (origin) pravidelně rebasuje fork commity na nový `upstream/main` (openclaw/openclaw). Problém nastane, když:

1. Fork commit závisí na exportu z barrelového souboru (např. `config.runtime.ts`)
2. Upstream commit ten barrel **smrskne** — odebere exporty
3. Rebase proběhne bez konfliktu (git nevidí problém — jsou to různé soubory)
4. **Build se tiše rozbije** — nikdo si nevšimne, protože po rebase se `pnpm build` nespustí
5. Gateway bezproblemově běží ze starého `dist/` v RAM — **problém se projeví až při dalším restartu**

## Konkrétní případ (2026-05-08)

- Fork commit `0523cbf62c feat(whatsapp): add deliveryPolicy 'plugin-only' for groups` importoval `resolveChannelGroupPolicy`, `resolveChannelGroupRequireMention` z `../config.runtime.js`
- Upstream commit `4336a7f3a9 refactor(plugin-sdk): narrow config runtime imports` tyto exporty z `config.runtime.ts` odstranil
- Rebase proběhl tiše, build se nespustil
- Gateway crashla z jiného důvodu (OOM), `dist/` bylo smazáno → `MODULE_NOT_FOUND` při restartu

## Oprava importů

Správný pattern (podle `extensions/AGENTS.md`): importovat z SDK, ne z lokálního barrelů:

```typescript
// ❌ ŠPATNĚ (local barrel, může se změnit)
import { resolveChannelGroupPolicy } from "../config.runtime.js";

// ✅ SPRÁVNĚ (SDK public surface, stabilní)
import { resolveChannelGroupPolicy } from "openclaw/plugin-sdk/channel-policy";
import { resolveGroupSessionKey } from "openclaw/plugin-sdk/session-store-runtime";
```

Vzor: podívej se jak to dělá `inbound-policy.ts` ve stejném extensions adresáři.

## Divergence origin/main vs lokální main

Po rebase bez force-push nastane: lokální main má nové hashe, origin/main staré → `N ahead, M behind`.

```bash
# Diagnóza
git rev-list --left-right --count main...origin/main
git log --format="%s" origin/main ^main   # co je na remote, co lokálně nemáme
git log --format="%s" main ^origin/main   # co je lokálně, co není na remote
```

Pokud jsou subjects identické (jen různé hashe), je to čistá rebase divergence — bezpečné force-pushnout.

## Postup pro bezpečný force-push

```bash
# 1. Záloha remote stavu
TS=$(date +%Y%m%d_%H%M%S)
git branch "backup/origin-main-pre-force-${TS}" origin/main
git push origin "backup/origin-main-pre-force-${TS}"

# 2. Ověř že subjects jsou identické (žádný obsah se neztratí)
git log --format="%s" origin/main ^main

# 3. Force-push
git push --force-with-lease origin main
```

`--force-with-lease` je bezpečnější než `--force` — selže pokud někdo mezitím pushnul na remote.

## Pravidlo do budoucna

**Po každém rebase: `pnpm build`** — jedinou pojistkou proti tichému sémantickému konfliktu je okamžité ověření buildu. launchd crash-loop + smazaný dist = hodiny diagnostiky.
