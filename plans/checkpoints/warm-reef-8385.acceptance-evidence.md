# Acceptance Evidence: warm-reef-8385

## Scope

- **Goal:** `goal-001` - Add OpenClaw side of deployed Deliberation delivery probe
- **Finding:** `finding-001` - required TDD proof missing GREEN evidence
- **Canonical plan:** `plans/2026-08-25_warm-reef-8385_add-openclaw-side-of-deployed-deliberation-delivery-probe.md`
- **Change class:** Evidence-only follow-up; production and test files were unchanged.

## Complete RED/GREEN Evidence

Both phases use the identical focused command:

`pnpm test extensions/deliberation/src/delivery-probe.test.ts extensions/deliberation/src/km-client.test.ts -- --reporter=verbose`

| Phase                  | Provenance                                                  | Timestamp                        | Exit | Outcome                                                                                 |
| ---------------------- | ----------------------------------------------------------- | -------------------------------- | ---- | --------------------------------------------------------------------------------------- |
| Genuine historical RED | `plans/checkpoints/bold-wave-8562.red-green-proof.md:5-203` | 2026-08-25T10:05:26.922241+00:00 | 1    | 11 failed, 75 passed; failure was the absent `runDeliberationDeliveryProbe` API export. |
| Fresh follow-up GREEN  | `plans/checkpoints/warm-reef-8385.red-green-proof.md`       | 2026-08-25T16:29:34Z             | 0    | 2 files passed; 91 tests passed, 0 failed.                                              |

The historical RED is linked rather than recreated after implementation. The fresh GREEN was executed in this follow-up against the preserved implementation and records a successful post-implementation command and outcome.

`plans/checkpoints/bold-wave-8562.evidence.md` is not used as proof because its historical command records were truncated and outcomes were unavailable. The complete parent proof and the fresh follow-up proof above are the authoritative artifacts.

## Finding Resolution

`finding-001` is resolved by the linked genuine RED and fresh task-scoped GREEN for the exact same focused command. Inspection confirmed `extensions/deliberation/api.ts` still exports the probe and `extensions/deliberation/src/delivery-probe.test.ts` still exercises the public boundary; no implementation defect or code change was required.
