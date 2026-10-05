---
title: "Vyřazení bundled pluginu: zdroj versus balík"
date: 2026-10-01
category: architecture
component: tooling
tags: [plugins, packaging, migration, vitest]
file_type: decisions
---

# Vyřazení bundled pluginu vyžaduje oddělit zdrojový checkout od distribučního artefaktu

Když `extensions/<id>` zůstává v repozitáři, obecný sken manifestů ho dál uvidí a lokální zdrojové testy jej mohou načíst. Samotná úprava očekávaných ID nezmění instalovatelný balík. Vyloučení musí projít kanonickou sestavou build entries, kopírováním metadata (které odstraní i starý `dist` adresář), runtime overlay a filtrem `package.json.files`.

Testovat dvě odlišné hranice: zdrojový manifest/hooky zůstávají pravdivé pro vývoj, zatímco metadata odvozená ze skutečných pack artefaktů a nainstalovaný tarball dokazují nepřítomnost v distribuci. Singleton smoke nesmí před testem injektovat manifest odstraněného pluginu. Povolená položka konfigurace bez nainstalovaného externího pluginu skončí diagnostikou `Plugin not found`, nikoli automatickou migrací.

Existující most `src/cli/plugins-location-bridges.ts` vzniká jen ze zapnutého perzistovaného bundled záznamu a ověřitelného npm/ClawHub instalačního specu. Název package ve zdrojovém `package.json` tuto podmínku nenahrazuje. Nedostupný instalační spec znamená vyřadit starou bundled-package bránu, ale zachovat nezávislé testy zdrojových hooků a kanálů.

Při testech importujících reálný plugin může import/fixture trvat téměř 100 sekund bez průběžného výstupu. Výchozí no-output watchdog wrapperu 120 sekund může zabít kombinovaný test; zvýšení `OPENCLAW_VITEST_NO_OUTPUT_TIMEOUT_MS` na 240000 dovolí získat výsledek bez vypínání testů. Široký `node scripts/test-projects.mjs --changed HEAD` spouští i mnoho nesouvisejících tooling fixture testů; vyhodnocuj zvlášť přesně cílený test, build a nainstalovaný tarball.
