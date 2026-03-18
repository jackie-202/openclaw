# Task: Thoughtful Response — OpenClaw Native Plugin

## Cíl
Vytvořit OpenClaw native plugin, který oddělí příjem zpráv od odpovědí ve veřejných kanálech. Agent nikdy neodpovídá přímo — místo toho se zprávy ukládají do scratchpadu a cron job je periodicky zpracovává s deliberací, kontextovým lookupem a iterativním vylepšením.

## Architektura

### 1. Plugin hooky

**`message_received` hook** (fire-and-forget):
- Uloží příchozí zprávu do scratchpadu (`drafts/inbox/<channel>-<timestamp>.json`)
- Ukládá: kanál, odesílatel, obsah, timestamp, conversationId, metadata

**`message_sending` hook** (async, může blokovat):
- Pro kanály v configu (`deliberateChannels` whitelist): vrátí `cancel: true`
- Pro ostatní kanály (command channel, interní): pustí bez zásahu
- Rozpozná "deliberované" odpovědi přes bypass marker — ty pustí
- Context dostupný: `{ channelId, accountId }` — stačí pro whitelist rozhodnutí

### 2. Bypass marker
Cron-poslaná odpověď projde znovu přes `message_sending` hook. Plugin ji musí pustit.
Varianty:
- Metadata marker v payload (preferované — čistý, neviditelný)
- Temp soubor s whitelist message IDs (fallback)
- Marker v obsahu zprávy (nežádoucí — viditelný)

### 3. Scratchpad struktura
```
drafts/
  inbox/          # příchozí zprávy čekající na zpracování
  wip/            # rozpracované drafty
  sent/           # archiv odeslaných (pro self-review)
  skip/           # zprávy kde se rozhodlo neodpovídat (s důvodem)
```

### 4. Cron job — deliberativní pipeline
Periodicky (interval TBD — 30s? 1min?) prochází `drafts/inbox/`:
1. **Kontext lookup** — memory_search, knowledge base, konverzační historie
2. **Rozhodnutí** — odpovídat? (ne všechno si zaslouží reakci)
3. **Draft** — vygeneruje odpověď
4. **Iterace** — self-review po literární a filozofické stránce (SOUL.md alignment)
5. **Odeslání** — finální verze přes `message` tool s bypass markerem

### 5. Konfigurace
```json
{
  "deliberateChannels": ["discord:1483778179700228147"],
  "bypassMarker": "__deliberated__",
  "scratchpadDir": "drafts/",
  "cronIntervalMs": 60000
}
```

## Technické detaily (ověřeno ze zdrojáků)

- `message_sending` sedí na `deliverOutboundPayloads()` — **jediný outbound bod**, chytá všechno (přímé odpovědi, heartbeat, message tool, cron delivery)
- `message_sending` je **async** — může dělat I/O
- `message_received` je fire-and-forget — nemůže blokovat příjem
- Hook event: `{ to, content, metadata: { channel, accountId, mediaUrls } }`
- Hook ctx: `{ channelId, accountId }`
- Hook return: `{ content?, cancel? }`
- Hooky existují v aktuálním forku — nepotřebujeme upgrade

## Plugin packaging
- `openclaw.plugin.json` manifest
- Runtime modul s `register(api)` — registruje `message_received` + `message_sending` hooky
- Config schema pro `deliberateChannels`, `bypassMarker`, `scratchpadDir`

## Otevřené otázky
- [ ] Bypass marker implementace — metadata vs soubor vs jiné
- [ ] Cron interval — rychlost vs zátěž
- [ ] Fallback pokud cron selže — zprávy nesmí zmizet
- [ ] Jak cron přistoupí k SOUL.md a knowledge base pro iteraci
- [ ] Self-review kritéria — co je "dostatečně dobrá" odpověď
- [ ] GitHub issues komentáře — projdou taky tímhle? Nebo jen messaging kanály?

## Inspirace
- Close komentáře na GitHub: obrazný jazyk, techniku schovávat za metafory
- Odpověď Marie Podvalové: respekt k uživateli, jasný návrh, žádné omluvy
- SOUL.md: stručnost, každé slovo platí, anti-AI writing discipline
