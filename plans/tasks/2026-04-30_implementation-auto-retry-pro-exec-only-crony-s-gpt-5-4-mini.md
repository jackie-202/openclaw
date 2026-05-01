# Implementation: Auto-retry pro exec-only crony s gpt-5.4-mini empty completion

## Kontext

`gpt-5.4-mini` přes `openai/` provider má cca 40% empty-completion error rate u exec-only cron jobů (`opencode-monitor`, `batch-orchestrator`, `autocommit`, atd.). Symptom: `lastRunStatus="error"`, `error="⚠️ Agent couldn't generate a response. Note: some tool actions may have already been executed — please verify before retrying."`, `output_tokens` často přesně 69.

Prompt engineering nepomohl (3 varianty otestovány — kratší/delší prompt situaci nezlepší). Root cause se bude vyšetřovat zvlášť (task `quick-mist-8179` — bridge raw logging).

**Mezitím:** chceme retry mechanismus, který empty-completion errory absorbuje, aby pipeline nebyla závislá na 40% selhávajícím modelu.

## Cíl

Přidat **auto-retry** pro cron jobs typu `agentTurn`, kdy se finished status = `error` a error message matchuje známý pattern empty completion ("Agent couldn't generate a response"). Po splnění podmínek znovu vykonat tentýž job — max N pokusů.

## Architektonické rozhodnutí

**Retry musí být na úrovni cron orchestrace v gateway**, NE uvnitř LLM agenta:

- Agent (LLM) nemá přehled o předchozím selhání — dostane fresh kontext
- Cron runner v gateway už drží `lastRunStatus`, `lastError`, `consecutiveErrors` — má všechny potřebné informace
- Retry uvnitř promptu by zdvojnásobil latency a model by stejně selhával stejným způsobem

Hledat seam: `gateway/src/cron/runner.ts` (nebo ekvivalent) — místo kde se po dokončení agentTurn finalizuje run a zapisuje do `state.lastRunStatus`. Tam by se měl rozhodnout retry vs finalize.

## Požadavky

### 1. Konfigurace retry per-job

Cron job payload rozšířit o volitelný retry config:

```json
{
  "kind": "agentTurn",
  "model": "openai/gpt-5.4-mini",
  "message": "...",
  "retry": {
    "max": 1,
    "errorPatterns": ["Agent couldn't generate a response"],
    "delayMs": 0
  }
}
```

- `retry.max` (default 0 = bez retry) — kolikrát zopakovat při error matchi
- `retry.errorPatterns` — pole regex/substring patternů; retry triggernutý jen pokud error matchuje aspoň jeden
- `retry.delayMs` (default 0) — delay před retry pokusem (pokud chceme jitter)

### 2. Retry pravidla

- Retry **POUZE při finished status=error** (ne při skipped, ne při timeout, ne při OK)
- Retry **POUZE při matchi error patternu** (nesmí maskovat skutečné chyby kódu/scriptu)
- Retry **NESMÍ překročit timeout celého jobu** — pokud `timeoutSeconds: 120` a první pokus zabral 60s, retry se musí zmrazit pokud by 2. pokus přetekl deadline
- Retry **NESMÍ kolidovat s next-run schedule** — pokud retry doběhl 30s před `nextRunAtMs`, log to a vrátit standard finished

### 3. State tracking

Run state rozšířit:

- `lastRetryCount` — počet retry pokusů v posledním běhu
- `retryStats: { totalRetries, retrySuccesses, retryFailures }` — kumulativní

`cron runs` výstup by měl obsahovat:

- `attempts` — array per pokus (timestamp, status, error, duration, output_tokens, usage)
- `finalAttempt` — který pokus byl použit jako finální výsledek (1 = první)

### 4. Delivery

- Delivery (announce/webhook) se triggeruje **JEN podle finálního výsledku** (po posledním pokusu nebo prvním úspěchu)
- Pokud retry uspěje → delivery = úspěšný výstup
- Pokud všechny pokusy selžou → delivery = error z posledního pokusu (jako dnes)
- **Při neúspěšných retry-aurech do logu/metrik propsat všechny pokusy** (kvůli debugging — uvidíme rate empty completionů)

### 5. Backwards compat

- Joby bez `retry` configu se chovají přesně jako dnes (zero behavior change)
- Test: existující job s `retry: undefined` → 1 attempt, žádný overhead, identický flow

### 6. Apply to known-broken cron jobs

Po implementaci updatnout ENABLED crony s pattern issue na `retry.max: 1`:

- `opencode-monitor` (d401fb17)
- `batch-orchestrator` (bc2c7bfd)
- `autocommit` (6c1d92d8)
- `pipeline-sentinel` (ff31b240)
- `thoughtful-response-triage` (c575f4eb)
- `thoughtful-response-gate` (98433e00)
- `sqlite-dump` (b3d8f153)

(Konkrétní seznam ověřit v `cron list` před aplikací — zařadit jen ty které mají model `openai/gpt-5.4-mini` a pattern matchuje.)

### 7. Metriky / observability

- Po každém retry → log entry: `{job_id, attempt, error, model, ts}`
- Aggregate metric do `cron status` výstupu: `retryRatePercent` per job (= retries / total runs \* 100)

## Akceptace

- [ ] Cron job s `retry: { max: 1, errorPatterns: ["Agent couldn't generate a response"] }` po failu modelu opakuje pokus 1×
- [ ] Pokud druhý pokus uspěje → finished status=ok, delivery proběhne s úspěšným výstupem
- [ ] Pokud druhý pokus selže → finished status=error, delivery jako dnes
- [ ] `cron runs --id X` ukazuje `attempts: [...]` array s detailem každého pokusu
- [ ] Existující joby bez retry configu fungují beze změny chování
- [ ] Timeout celého jobu se respektuje napříč všemi pokusy (retry necedí pokud by přetekl deadline)
- [ ] 7 výše uvedených cronů přepnuto na `retry.max: 1` a verifikováno přes 30 běhů, že success rate stoupl z ~60% na ≥85%
- [ ] Dokumentace v `docs/gateway/configuration.md` (nebo ekvivalent) — sekce „Cron retry" s příkladem
- [ ] Test: regression na neretry jobu, retry success path, retry exhausted path, timeout-mid-retry path

## Out of scope

- Exponenciální backoff (zatím lineární `delayMs` stačí — empty completion není rate-limit)
- Retry pro jiné než agentTurn payloady (systemEvent retry zatím nepotřebujeme)
- Cross-job retry deduplication (každý job retryje sám)
- Bridge-level retry (to by patřilo do copilot-bridge, ale tady řešíme vyšší vrstvu)

## Hint pro implementátora

Začni v `~/Projects/openclaw-fork/` — cron runner kód. Najdi:

- Kde se po dokončení agentTurn zapisuje `lastRunStatus`
- Kde se triggeruje delivery
- Mezi tyto dva body vlož retry-loop s pattern checkerem

Nezapomeň že:

- Jobs běží v isolated session — retry musí spustit **nový run** se stejným payloadem (ne pokračovat v původním)
- Pokud existují fixture testy v `tests/cron/` — rozšiř je
- Migration neni potřeba (nové pole je opt-in)

## Důležité

- **Default behavior se NESMÍ změnit.** Joby bez retry configu = identický flow jako dnes.
- **Retry NESMÍ tichý** — každý retry attempt loguj (debug level OK), aby šlo poznat kdy a proč se opakovalo.
- **Retry NEMASKUJE jiné errory.** Pokud script vrátí non-zero exit → retry NE. Jen empty completion patterny.
- **Bezpečnost:** retry by mohl zdvojnásobit side-effecty pokud agent stihl udělat tool call před tím, než selhal. Akceptace explicitně předpokládá idempotentní cron payloady (skripty co jsou bezpečné spustit 2×). Pokud by to nestačilo, zvážit `retry.requireNoToolCallsExecuted: true` flag — ale zatím ne, ať není scope creep.
