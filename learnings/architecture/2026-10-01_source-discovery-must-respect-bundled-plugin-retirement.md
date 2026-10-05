---
title: "Zdrojový checkout musí sdílet vyřazení bundled pluginu s runtime discovery"
date: 2026-10-01
category: architecture
component: tooling
tags: [plugins, discovery, acceptance, packaging]
file_type: rules
---

Když zůstane extensions/<id> ve zdrojovém checkoutu, vyloučení z build entries a package.json.files nevyřadí plugin ze source runtime: bundled-plugin-metadata.ts skenuje manifesty a discovery.ts skenuje stock root i source fallback. Test balíku proto nemůže nahradit test skutečného source metadata/registru a explicitního startupu. Vyřazení musí nastat před sestavením bundled indexu a registru; source-level testy pluginu je třeba načítat z explicitní ne-bundled lokální cesty. Explicitně instalovaný externí plugin téhož ID musí zůstat dostupný. Pokud se jde cestou přímého source path, ověř load-path aliasing: cesta uvnitř stock tree může být potlačena jako redundantní bundled path.
