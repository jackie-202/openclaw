# Real Listener Proof: bright-vale-5327

## Authority

- **Timestamp:** `2026-08-04T14:12:26Z`
- **Authority revision:** `b66d47b46f9029e1b1a88fd160da628ab47c013f`
- **Listener:** `km-system/scripts/deliberation-v2-listener.py`
- **Listener SHA-256:** `6d205efccb623801c4d2e257de76582fccb6a61d4caa6659464269d67e95b0e7`
- **Spool SHA-256:** `a2863573fb73f310ce4f05eb3f3e9796cf5d3f97d0a32e2d02e68a9559d2b73e`
- **Wire SHA-256:** `55235f94c49118543cf00c1e44f210628e95471263f1d6db1565fedbb2126593`
- **Store:** fresh `TemporaryDirectory` passed to the KM-owned `DeliberationSpool`; removed when the run exited.
- **Credential:** disposable file with mode `0600`, passed to the authority listener and supplied to the producer only through `OPENCLAW_DELIBERATION_KM_CREDENTIAL`.

## Controls

```json
{ "claims": true, "review": true, "sender": false, "source-intake": true }
```

## Producer Replay

The exact Discord-shaped event and provider event ID `1534181693647355986` were sent twice through `extensions/deliberation/scripts/intake-producer.ts`, which composes the production inbound handler and `KmClient`.

First invocation:

```json
{ "duplicate": false, "exitCode": 0, "handled": true, "providerEventId": "1534181693647355986" }
```

Replay:

```json
{ "duplicate": true, "exitCode": 0, "handled": true, "providerEventId": "1534181693647355986" }
```

## Wire Facts

- Both requests used canonical application header names: `Accept`, `Authorization`, `Content-Type`, and `X-Deliberation-Protocol-Version`.
- Both requests preserved the event instant as `2026-08-04T12:50:19.483000Z`.
- The evidence harness fixed the producer clock for both invocations, so authority duplicate validation received an exact replay without changing production `receivedAt` semantics.
- The authority returned no error response for either request.
- No credential, endpoint, message content, sender identity, or raw listener error is included in this artifact.

## Persistence Query

The listener-owned `DeliberationSpool.list_records(limit=100)` query ran after replay against the disposable canonical store.

```json
{ "matchingRecordCount": 1, "totalRecordCount": 1 }
```

Result: the real extension producer reached the KM-owned listener, the first request persisted, and replay left exactly one canonical record.
