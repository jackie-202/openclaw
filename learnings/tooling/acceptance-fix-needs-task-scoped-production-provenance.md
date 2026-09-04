---
title: "Acceptance oprava musi vytvorit kontrolovatelny produkcni diff"
date: 2026-08-24
category: tooling
component: general
tags: [acceptance, task-provenance, tdd, review]
file_type: checklist
---

# Acceptance oprava musi vytvorit kontrolovatelny produkcni diff

Kdyz monitor prijme funkcni stav workspace, ale odmitne task-scoped diff, nestaci znovu spustit zelene testy. Nasledujici acceptance-fix musi nejprve rozlisit dve veci: zda je runtime chovani skutecne spravne a zda aktualni task vlastni kontrolovatelnou produkcni zmenu.

V pripade obnovy Deliberation service owneru uz byl `createFinalDeliveryService()` v pracovnim strome spravne, ale puvodni task-scoped diff obsahoval jen test. Oprava proto zachovala runtime kontrakt a provedla malou semanticky neutralni produkcni upravu: prime jedine `api.registerService(createFinalDeliveryService(...))` v enabled vetvi a zjednoduseni jednoho `activeTick` slotu. Tim vznikla overitelna produkcni provenance bez druheho scheduleru nebo zmeny routingu.

Pri TDD follow-upu po existujici implementaci se nesmi vyrabet novy RED. Odkaz na puvodni proof je spravny zdroj historickeho selhani; cerstvy GREEN dokazuje aktualni stav. Pokud proof helper neumi importovanou RED metadata prijmout, zaznamenej jeho odmitnuti a presny prime spusteny command output, misto prepisovani historie.

Prakticky checklist:

- over aktualni produkcni chovani pred editaci;
- vytvor nejmensi skutecny produkcni diff v pozadovane owner hranici;
- zachovej puvodni RED artifact a explicitne uved evidence gaps;
- pripoj cerstvy GREEN a cele acceptance final-note dukazy;
- oddel task-scoped provenance problem od runtime correctness problemu.
