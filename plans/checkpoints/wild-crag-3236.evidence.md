# Task Evidence: wild-crag-3236

Generated from public task lineage and OpenCode session logs.

## Session 1

- Task ID: `wild-crag-3236`
- Role: `plan`
- Session ID: `unavailable`
- Verification evidence: none
- Gaps:
  - `session_id_unavailable: wild-crag-3236 plan`

## Session 2

- Task ID: `wild-crag-3236`
- Role: `impl`
- Session ID: `bold-cove-6170`
- Verification evidence:
  - `PYTHONDONTWRITEBYTECODE=1 PYTHONPATH=scripts:lib .venv/bin/pytest tests/test_deliberation_wire.py tests/test_deliberation_spool.py -k 'one_record_per_message or each_message_has_its_own_debounce_deadl` -> `28 passed, 84 deselected in 0.31s`
  - `PYTHONDONTWRITEBYTECODE=1 PYTHONPATH=scripts:lib .venv/bin/pytest tests/test_deliberation_spool_characterization.py tests/test_deliberation_delivery_target_golden_fixture.py -k 'historical_pair_migrat` -> `26 passed, 94 deselected in 1.09s`
  - `PYTHONDONTWRITEBYTECODE=1 PYTHONPATH=scripts:lib .venv/bin/pytest tests/integration/test_deliberation_v2_e2e.py -q` -> `3 failed, 38 passed in 18.45s`
- Gaps:
  - `command_lines_truncated`
