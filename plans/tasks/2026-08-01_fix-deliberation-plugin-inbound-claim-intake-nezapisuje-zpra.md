# Fix: Deliberation plugin inbound_claim intake nezapisuje zprávy do KM spoolu

## Kontext

Deliberation v2 plugin v `~/Projects/openclaw-fork/extensions/deliberation/` je načtený a částečně funkční na běžící gateway (OpenClaw 2026.6.5, 120dc90):

- config: source `discord/1494790764134273195`, processing `1533078054694293695`, `enabled=true`, `failClosed=true`, credential provider `deliberation_token`
- restricted-session guard FUNGUJE: `message.send`/`message.read` ze source session vrací "Deliberation restricted sessions cannot send messages" → plugin hooks jsou registrované a route matching pro guard sedí
- KM listener běží na 127.0.0.1:8765, health OK, controls: `claims=true, review=true, source-intake=true, sender=false`

ALE: žádná inbound zpráva ze source kanálu se nezapíše do KM spoolu. Po několika testech (plain-text zpráva 2026-08-01 21:56, audio zprávy 20:32/20:35) je `state/deliberation-v2/spool.sqlite3` stále prázdný: `records=0, messages=0, history=0`, `deliberation-v2.py audit` vrací `[]`. Plain-text test vylučuje čistě media/content problém.

## Hypotézy k prověření

1. `inbound_claim` handler v `extensions/deliberation/src/intake.ts` skipne zprávu (guard na `!event.content`, sender filtr, nebo route/conversationId mismatch mezi runtime formátem a tím, co čeká `route-match.ts`).
2. Runtime `inbound_claim` event/context má jiný tvar `conversationId`/`channelId` než plugin očekává (testy v `hooks.test.ts` používají syntetické eventy — porovnat s reálným tvarem z `src/auto-reply/reply/dispatch-from-config.ts`, sekce broadcast `runInboundClaim`).
3. Intake běží, ale KM POST selže tiše (fail-closed swallow) — zkontrolovat error handling a logging v intake cestě; pokud chybí diagnostický log, přidat.

## Úkol

1. Reprodukuj: přidej/použij unit test s reálným tvarem inbound_claim eventu (podle `dispatch-from-config.ts`) pro Discord channel zprávu z `channel:1494790764134273195` a ověř, že intake handler zprávu claimne a POSTne do KM.
2. Najdi příčinu mismatch/skipu a oprav.
3. Zajisti, že skip cesty logují důvod (alespoň verbose level) — ticho bez záznamu je nediagnostikovatelné.
4. Media/audio zprávy: intake nesmí zprávu zahodit jen kvůli prázdnému textu, pokud má attachment; minimálně zapsat placeholder content s media flagem (pokud KM kontrakt dovolí).

## Acceptance criteria

- Unit testy pokrývají realný event tvar a projdou.
- Skip větve mají log s důvodem.
- `pnpm exec vitest run extensions/deliberation` zelené.

## Verifikace

- Přilož výstup vitest běhu pro extensions/deliberation.
