#!/usr/bin/env python3
"""Test-only adapter over the KM Deliberation spool public API."""

from __future__ import annotations

import json
import sys
from pathlib import Path

from deliberation_spool import CANONICAL_SPOOL_ROOT, DeliberationSpool


SENTINEL = ".openclaw-deliberation-integration-test"


def paths_overlap(left: Path, right: Path) -> bool:
    return left == right or left in right.parents or right in left.parents


def isolated_spool_root(test_root_value: str, spool_root_value: str) -> Path:
    test_root = Path(test_root_value)
    spool_root = Path(spool_root_value)
    if not test_root.is_absolute() or not spool_root.is_absolute():
        raise SystemExit("test and spool roots must be absolute")
    test_root = test_root.resolve(strict=False)
    spool_root = spool_root.resolve(strict=False)
    production_root = CANONICAL_SPOOL_ROOT.resolve(strict=False)
    if paths_overlap(test_root, production_root) or paths_overlap(spool_root, production_root):
        raise SystemExit("test paths overlap the production Deliberation spool")
    if test_root not in spool_root.parents:
        raise SystemExit("spool root must be beneath the test root")
    if not (test_root / SENTINEL).is_file():
        raise SystemExit("integration test sentinel is required")
    return spool_root


def main() -> int:
    if len(sys.argv) != 4 or sys.argv[1] not in {"init", "read"}:
        raise SystemExit("usage: km-spool-probe.py init|read ABSOLUTE_TEST_ROOT ABSOLUTE_SPOOL_ROOT")
    root = isolated_spool_root(sys.argv[2], sys.argv[3])
    spool = DeliberationSpool(root)
    if sys.argv[1] == "init":
        result = spool.set_control("source-intake", True)
    else:
        result = spool.list_records()
    print(json.dumps(result, ensure_ascii=False, sort_keys=True, separators=(",", ":")))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
