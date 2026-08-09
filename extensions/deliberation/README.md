# Deliberation plugin

## Local KM integration

Run the real intake serializer and HTTP client against an isolated KM listener
and disposable canonical spool:

```bash
OPENCLAW_DELIBERATION_KM_ROOT=/absolute/path/to/km-system \
  pnpm test:deliberation:km-integration
```

The command is intentionally separate from the hermetic extension unit suite.
It fails with an actionable `plugin:` error when the KM checkout is missing,
uses only a random loopback port, generates a temporary credential, and removes
the listener and all temporary state on success or failure. The listener's test
mode requires a sentinel and rejects any path overlapping the production spool
before opening SQLite.
