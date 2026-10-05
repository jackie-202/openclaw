---
title: "Vyřazení bundled pluginu musí pokrýt uložený index a overlay"
date: 2026-10-01
category: architecture
component: backend
tags: [plugins, discovery, registry, build]
file_type: decisions
---

Při vyřazení pluginu, jehož zdrojový adresář zůstává v checkoutu, nestačí odebrat build entries ani přeskočit `discoverInDirectory`. Zdrojové overlay adresáře vstupují přes `discoverFromPath` a starší perzistentní `InstalledPluginIndex` může vrátit dřívější bundled záznam bez nového discovery. Vylučovací pravidlo aplikuj na metadata, stock/source-fallback discovery, source overlay i validaci perzistentního bundled indexu před jeho použitím. Vydaný bundle ukládá moduly do plochých `dist/*` chunků, takže kořen balíku odvozuj přes `resolveOpenClawPackageRootSync({ moduleUrl: import.meta.url })`, ne přes pevné `../..`; při porovnání skenovaných adresářů zohledni symlinky pomocí realpath. Explicitní lokální cesta je sice discoverable jako config-origin, ale sama z ní nevznikne trusted official install: plugin využívající `openKeyedStore` nelze v tomto režimu plně aktivovat bez oficiálního install trust kontraktu. Ověř zvlášť fresh source, built source loader, starý persisted index, overlay a nezávisle nainstalovaný externí plugin stejného id.
