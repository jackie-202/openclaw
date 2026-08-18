#!/usr/bin/env python3
"""Test-only adapter over the KM Deliberation spool public API."""

from __future__ import annotations

import json
import hashlib
import sys
from datetime import datetime, timedelta
from pathlib import Path
from types import SimpleNamespace

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
    command = sys.argv[1] if len(sys.argv) > 1 else ""
    expected_arguments = 5 if command == "prepare" else 4
    if len(sys.argv) != expected_arguments or command not in {"init", "prepare", "read"}:
        raise SystemExit(
            "usage: km-spool-probe.py init|read ABSOLUTE_TEST_ROOT ABSOLUTE_SPOOL_ROOT\n"
            "       km-spool-probe.py prepare ABSOLUTE_TEST_ROOT ABSOLUTE_SPOOL_ROOT REVIEWED_TEXT"
        )
    root = isolated_spool_root(sys.argv[2], sys.argv[3])
    spool = DeliberationSpool(root)
    if command == "init":
        result = spool.set_control("source-intake", True)
    elif command == "prepare":
        intake_record = spool.list_records()[0]
        now = datetime.fromisoformat(intake_record["debounceUntil"].replace("Z", "+00:00")) + timedelta(
            seconds=1
        )
        spool.close_due(now)
        claim = spool.claim_next("openclaw-integration-drafter", now=now)
        if claim is None:
            raise SystemExit("no draft claim available")
        record = spool.get_record(claim.record_id)
        source_target = record["sourceTarget"]
        _, provider, account, channel = source_target.split(":", 3)
        provider_event_id = record["messages"][-1]["providerEventId"]
        source_messages = [
            {
                "providerEventId": message["providerEventId"],
                "senderId": message["senderId"],
                "senderIsBot": False,
                "eventType": message["eventType"],
                "occurredAt": message["occurredAt"],
                "content": message["content"],
            }
            for message in record["messages"]
        ]
        snapshot_json = json.dumps(
            source_messages, ensure_ascii=False, sort_keys=True, separators=(",", ":")
        )
        spool.capture_source_context(
            claim,
            {
                "schemaVersion": 1,
                "sourceTarget": source_target,
                "provenance": {"provider": provider, "account": account, "channel": channel},
                "snapshotJson": snapshot_json,
                "snapshotHash": hashlib.sha256(snapshot_json.encode("utf-8")).hexdigest(),
            },
            cutoff_provider_event_id=provider_event_id,
            captured_at=now.isoformat().replace("+00:00", "Z"),
        )
        claim = spool.begin_dispatch(
            claim,
            now=now,
            processing_session_key="integration-processing-session",
        )
        spool.finalize(claim, decision="DRAFT", draft=sys.argv[4], now=now)
        review = spool.claim_review("openclaw-integration-reviewer", now=now)
        if review is None:
            raise SystemExit("no review claim available")
        artifact = {
            "schemaVersion": 1,
            "sourceTarget": source_target,
            "exclusiveCutoffProviderEventId": provider_event_id,
            "inclusiveWatermarkProviderEventId": provider_event_id,
            "provenance": {"provider": provider, "account": account, "channel": channel},
            "capturedAt": now.isoformat().replace("+00:00", "Z"),
            "messages": [],
            "complete": True,
        }
        artifact["digest"] = hashlib.sha256(
            json.dumps(
                artifact,
                ensure_ascii=False,
                sort_keys=True,
                separators=(",", ":"),
            ).encode("utf-8")
        ).hexdigest()
        review = spool.attach_review_freshness(review, artifact)
        result = spool.finalize_review(
            review,
            SimpleNamespace(
                schema_version=1,
                correlation_id=review.correlation_id,
                provider="openai",
                model="gpt-5.6-terra",
                session_id="integration-review-session",
                verdict="SEND",
                reason="integration fixture approved",
            ),
            now=now,
        )
        spool.set_control("sender", True, now=now)
    else:
        result = spool.list_records()
    print(json.dumps(result, ensure_ascii=False, sort_keys=True, separators=(",", ":")))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
