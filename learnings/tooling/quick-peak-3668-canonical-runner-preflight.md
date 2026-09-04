---
title: "Oddělte dostupnost kanonického runneru od lokálního výsledku"
date: 2026-08-25
category: tooling
component: ci-cd
tags: [openclaw, test-gate, crabbox, testbox, acceptance, evidence]
file_type: checklist
---

# Oddělte dostupnost kanonického runneru od lokálního výsledku

U evidence-only acceptance opravy nejdřív ověřte, že caller-owned runner skutečně dokáže alokovat běh a vrátit trvalé ID. Blacksmith bez CLI, Azure bez přihlášení a AWS bez brokeru všechny selhaly ještě před alokací; žádný z těchto stavů proto nesmí být zapsán jako neúspěšný test ani nahrazen lokálním výsledkem.

Do gate artefaktu uložte pro každý provider přesný příkaz, pre-allocation chybu, absenci `tbx_...` nebo `cbx_...` ID a informaci, že registrovaný příkaz vůbec nezačal. Teprve potom lze samostatně uvést lokální build/test/lint jako defect-detection proof. I když lokálně projde build, 97 focused testů, singleton smoke a 39 KM integračních testů, kanonický stav zůstává `BLOCKED`, dokud caller-owned provider nevydá inspectable run reference proti totožnému workspace.

Tento postup zabraňuje dvěma chybám: přejmenování lokálního běhu na Test Gate a zaměnění infrastrukturní nedostupnosti za regresi implementace.
