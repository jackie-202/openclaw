---
title: "Externí autorita musí dodat uzavřený wire kontrakt před implementací pluginu"
date: 2026-07-27
category: architecture
component: shared
tags: [openclaw, plugin-sdk, external-authority, km, contracts, tdd]
file_type: rules
---

# Externí autorita musí dodat uzavřený wire kontrakt před implementací pluginu

Plugin může mít jasně vymezené SDK seam a přesto nesmí být implementován, pokud externí durable autorita nedodala uzavřený wire kontrakt. Typové minimum v návrhu nestačí k bezpečnému odvození HTTP API.

## Povinná kontrola před produkčním kódem

Ověř repository-local authority pro:

- deterministické chování při chybějícím provider message ID,
- přesné HTTP metody, cesty, hlavičky a credential scheme,
- uzavřené request/response varianty pro intake, listing, reservation, completion a reconciliation,
- cursor, lease, CAS a conflict semantics,
- důkaz NOT_SENT a pravidla vydání nového attempt ID.

Pokud některá položka chybí, nevymýšlej endpointy ani fallbacky. Zachyť RED stav a ověř pouze existující SDK baseline. Passing baseline nesmí být vydáván za GREEN chybějícího pluginu.

## Praktický důsledek

Invariant typu one reserved attempt omezuje návrh, ale neurčuje wire protocol. Bez authoritative fixtures by mock klient otestoval pouze kontrakt vymyšlený implementátorem a mohl by maskovat chybnou autentizaci, závod rezervace nebo nebezpečný retry po neznámém provider outcome.
