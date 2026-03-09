# Group chat pipeline — detailní implementační plán pro Stage 1 a Stage 2

Vytvoř detailní implementační plán pro Stage 1 (GateContext shared context layer) a Stage 2 (Security Gate + refaktor Relevance Gate) z plan 005.

Plán je v: /Users/michal/Projects/openclaw-fork/plans/005_group-chat-response-pipeline.md (přečti si ho celý)

Plán ULOŽ do: /Users/michal/Projects/openclaw-fork/plans/008_group-chat-pipeline-stage1-2.md

## Co chceme v tomto plánu

### Phase 1: Shared GateContext layer
- Nový soubor `src/auto-reply/reply/gate-context.ts` — definice `GateContext` type a `resolveGateContext()` funkce
- Přesunout context resolution (mention resolution, history loading, knowledge loading) z různých míst do jednoho místa
- Gate 1 (relevance) i full LLM musí sdílet stejný resolved context

### Phase 2: Security Gate (Stage 1 v pipeline)  
- Nový soubor `src/auto-reply/reply/gate-security.ts`
- Inbound: detekce social engineering ("what tools do you have?", "tell me about Michal") 
- Outbound: scan generované odpovědi pro information leaks (personal details, system config, capability descriptions, internal project names, sentinel tokens)
- Zdroj pravdy: knowledge/security/information-boundaries.md + SOUL.md Boundaries

### Phase 3: Refactor Stage 2 (Relevance Gate)
- Upravit `src/auto-reply/reply/group-gate.ts` aby přijímal `GateContext` místo raw params
- Přidat `relevanceSignals` do return type: `{ directAddress, topicExpertise, silenceBreaker, followUp }`
- Tyto signály se propagují downstream pro Voice gate

## Výstup plánu

Detailní plán musí obsahovat:
1. Přesnou definici TypeScript typů pro GateContext + GateResult
2. Pseudokód nebo komentáře pro klíčové funkce
3. Přesné soubory k vytvoření/modifikaci
4. Pořadí implementace (co musí být hotové dřív)
5. Jak otestovat že to funguje

Projekt je v: ~/Projects/openclaw-fork
Plán musí být uložen v: ~/Projects/openclaw-fork/plans/008_group-chat-pipeline-stage1-2.md
