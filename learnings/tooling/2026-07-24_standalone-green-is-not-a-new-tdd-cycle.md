---
title: "Samostatný GREEN není nový TDD cyklus"
date: 2026-07-24
category: tooling
component: ci-cd
tags: [tdd, evidence, acceptance, proof-capture]
file_type: rules
---

# Samostatný GREEN nelze vydávat za nový TDD cyklus

Při evidence-only follow-upu už implementace i původní RED existují pod ID rodičovského úkolu. `proof-capture.py green` pod novým task ID správně skončí dříve, protože vyžaduje RED stejného úkolu. Nevytvářej umělý RED jen kvůli helperu.

Správný postup:

1. Odkázat přesný historický RED/GREEN artifact rodiče.
2. Spustit totožný focused test command jako čerstvou verifikaci bez tvrzení, že jde o nový TDD cyklus.
3. Pokud celý test soubor obsahuje známé nesouvisející chyby, zaznamenat je a izolovaně spustit změněné test cases.
4. V důkazním souboru explicitně popsat odmítnutí helperu, výsledky čerstvých testů a všechny mezery.

Tím zůstává provenance pravdivá a acceptance dostane jak historickou kauzalitu RED -> GREEN, tak aktuální důkaz chování.
