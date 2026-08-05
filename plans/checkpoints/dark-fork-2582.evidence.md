# Evidence: dark-fork-2582

## Implementation Diff

The preserved parent-task implementation is still present in the dirty worktree. The surrounding `sourceTarget` hunk belongs to earlier accepted work and is not part of this timestamp repair.

```diff
diff --git a/extensions/deliberation/src/intake.ts b/extensions/deliberation/src/intake.ts
@@
+function canonicalUtcTimestamp(date: Date): string {
+  return date.toISOString().replace(/\.000Z$/, "Z");
+}
@@
-      const receivedAt = new Date().toISOString();
+      const receivedAt = canonicalUtcTimestamp(new Date());
@@
-        occurredAt: new Date(event.timestamp ?? Date.now()).toISOString(),
+        occurredAt: canonicalUtcTimestamp(new Date(event.timestamp ?? Date.now())),
```

The request-boundary regression in `extensions/deliberation/src/hooks.test.ts` uses the real `createKmClient` serialization path and contains these rows:

```ts
["exact second", "2026-08-04T07:13:50Z", "2026-08-04T07:13:51Z"],
["non-zero milliseconds", "2026-08-04T07:13:50.120Z", "2026-08-04T07:13:51.120Z"],
```

The KM-shaped fetch mock rejects terminal `.000Z`, while the final assertion requires the serialized `occurredAt` and `receivedAt` values to equal each row exactly.

## Verification

- `pnpm test extensions/deliberation/src/hooks.test.ts extensions/deliberation/src/km-client.test.ts -- --reporter=verbose`: exit 0; 2 files and 31 tests passed.
- `node scripts/run-tsgo.mjs -p extensions/deliberation/tsconfig.json`: exit 0.
- `git diff --check -- extensions/deliberation/src/intake.ts extensions/deliberation/src/hooks.test.ts plans/checkpoints/dark-fork-2582.checkpoint.md plans/checkpoints/dark-fork-2582.red-green-proof.md`: exit 0.

Historical RED provenance remains at `plans/checkpoints/quick-peak-3638.red-green-proof.md`; fresh GREEN is recorded at `plans/checkpoints/dark-fork-2582.red-green-proof.md`.

## Plan Compliance

- Goal 001: PASS. Exact-second event and clock values serialize as canonical `...ssZ` for `occurredAt` and `receivedAt`.
- Goal 002: PASS. Non-zero `.120Z` values survive unchanged in both fields.
- Goal 004: PASS. The parent RED records failure under raw `Date.toISOString()` behavior; this follow-up records 31 passing focused tests with the formatter present.
- Architecture: PASS. Formatting remains private to the Deliberation intake construction seam; no public API, config, schema, routing, duplicate, or fail-closed behavior changed in this follow-up.

## Review

`.agents/skills/autoreview/scripts/autoreview --mode local --prompt <scoped timestamp review>` completed cleanly with no accepted or actionable findings. The reviewer specifically confirmed terminal-only `.000Z` removal, both timestamp call sites, non-zero fraction preservation, and serialized KM request coverage.
