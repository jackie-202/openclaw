---
title: "Autoritativni delivery kontrakt musi nest cil odeslani"
date: 2026-07-31
category: architecture
component: shared
tags: [deliberation, wire-contract, authority, delivery, fail-closed]
file_type: rules
---

# Autoritativni delivery kontrakt musi nest cil odeslani

Pri migraci Deliberation klienta nestaci porovnat hlavicku a endpointy. KM `readyItem` poskytuje `recordId`, verzi a text a `reservation` poskytuje lease/fencing identitu, ale ani jedna odpoved neposkytuje `sourceTarget` nebo Discord account. OpenClaw sender pritom podporuje vice zdrojovych tras a pro bezpecne odeslani potrebuje presny account a target.

Pred upravou klienta trasuj uzavrena response schemata az k poslednimu side effectu. Pokud autoritativni kontrakt nenese vsechny udaje potrebne pro send, zastav implementaci a vyzadej novou nemennou verzi kontraktu. Neodvozuj trasu z `recordId`, nevybirej vychozi source a nevytvarej procesni nebo lokalni mapu z intake: tyto varianty rozdeli autoritu, selzou po restartu nebo mohou odeslat zpravu spatnemu prijemci.

Stejny gate plati pro control surface: pokud autorita definuje controls jen jako owner CLI prikazy a nema HTTP mutation endpoint, konzument nesmi zachovat nebo vymyslet HTTP `/control` facade.
