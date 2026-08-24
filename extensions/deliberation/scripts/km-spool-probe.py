#!/usr/bin/env python3
"""Test-only adapter over the KM Deliberation spool public API."""

from __future__ import annotations

import json
import hashlib
import sqlite3
import sys
from datetime import datetime, timedelta
from pathlib import Path
from types import SimpleNamespace

from deliberation_orchestrator import DeliberationOrchestrator
from deliberation_spool import CANONICAL_SPOOL_ROOT, DeliberationSpool, InboundMessage
from deliberation_spool_schema import DeliberationSpoolSchemaMixin


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


def seed_delivery_history_fixture(spool, record_id: str, case: str) -> dict:
    with sqlite3.connect(spool.database_path) as connection:
        connection.row_factory = sqlite3.Row
        original = connection.execute(
            "SELECT * FROM delivery_attempts WHERE record_id = ? AND ordinal = 1",
            (record_id,),
        ).fetchone()
        if original is None:
            raise SystemExit("delivery history fixture requires one reservation")
        current = dict(original)
        current_attempt_id = f"{original['attempt_id']}-current"
        current.update(
            {
                "ordinal": 2,
                "attempt_id": current_attempt_id,
                "reserve_idempotency_key": "reserve:current",
                "completion_outcome": "SENT",
                "outcome": "SENT",
                "completion_idempotency_key": f"complete:{current_attempt_id}",
                "invocation_idempotency_key": f"invoke:{current_attempt_id}",
                "invoked_at": original["reserved_at"],
                "attempted_target": connection.execute(
                    "SELECT delivery_target FROM records WHERE record_id = ?", (record_id,)
                ).fetchone()[0],
                "provider_attempt_id": "provider-current",
                "provider_receipt_id": "receipt-current",
                "provider_message_id": "message-current",
                "terminal_reason": "delivery_sent",
                "completed_at": original["reserved_at"],
            }
        )
        columns = list(current)
        connection.execute(
            f"INSERT INTO delivery_attempts({','.join(columns)}) "
            f"VALUES ({','.join('?' for _ in columns)})",
            [current[column] for column in columns],
        )
        if case in {"legacy-not-sent", "legacy-delivery-unknown"}:
            outcome = "NOT_SENT" if case == "legacy-not-sent" else "DELIVERY_UNKNOWN"
            connection.execute(
                "UPDATE delivery_attempts SET completion_outcome = ?, outcome = ? "
                "WHERE attempt_id = ?",
                (outcome, outcome, original["attempt_id"]),
            )
        elif case == "pipeline-drift":
            connection.execute("DROP TRIGGER delivery_attempts_envelope_immutable")
            envelope = json.loads(original["delivery_envelope_json"])
            envelope["pipelineId"] = "contradictory-pipeline"
            envelope_json = json.dumps(
                envelope, ensure_ascii=False, sort_keys=True, separators=(",", ":")
            )
            connection.execute(
                "UPDATE delivery_attempts SET delivery_envelope_json = ?, "
                "delivery_envelope_digest = ?, completion_outcome = 'SENT', outcome = 'SENT', "
                "completion_idempotency_key = ?, "
                "invocation_idempotency_key = ?, invoked_at = reserved_at, "
                "attempted_target = ?, provider_attempt_id = 'provider-historical', "
                "provider_receipt_id = 'receipt-historical', "
                "provider_message_id = 'message-historical', terminal_reason = 'delivery_sent', "
                "completed_at = reserved_at WHERE attempt_id = ?",
                (
                    envelope_json,
                    hashlib.sha256(envelope_json.encode("utf-8")).hexdigest(),
                    f"complete:{original['attempt_id']}",
                    f"invoke:{original['attempt_id']}",
                    current["attempted_target"],
                    original["attempt_id"],
                ),
            )
        else:
            raise SystemExit("unknown audit fixture")
        connection.execute(
            "UPDATE records SET state = 'SENT', version = version + 1, "
            "terminal_reason = 'delivery_sent' WHERE record_id = ?",
            (record_id,),
        )
    return {
        "record": spool.get_record(record_id),
        "currentAttemptId": current_attempt_id,
        "currentReserveIdempotencyKey": "reserve:current",
    }


def main() -> int:
    command = sys.argv[1] if len(sys.argv) > 1 else ""
    expected_arguments = {
        "audit-fixture": 6,
        "init": 4,
        "migration-check": 4,
        "prepare": 8,
        "read": 4,
        "reconcile": 5,
    }
    if command not in expected_arguments or len(sys.argv) != expected_arguments[command]:
        raise SystemExit(
            "usage: km-spool-probe.py init|read ABSOLUTE_TEST_ROOT ABSOLUTE_SPOOL_ROOT\n"
            "       km-spool-probe.py prepare ABSOLUTE_TEST_ROOT ABSOLUTE_SPOOL_ROOT "
            "RECORD_ID REVIEWED_TEXT SOURCE_HISTORY_JSON CUTOFF_PROVIDER_EVENT_ID\n"
            "       km-spool-probe.py reconcile ABSOLUTE_TEST_ROOT ABSOLUTE_SPOOL_ROOT ISO_NOW"
            "\n       km-spool-probe.py audit-fixture ABSOLUTE_TEST_ROOT ABSOLUTE_SPOOL_ROOT "
            "RECORD_ID legacy-not-sent|legacy-delivery-unknown|pipeline-drift"
            "\n       km-spool-probe.py migration-check ABSOLUTE_TEST_ROOT ABSOLUTE_SPOOL_ROOT"
        )
    root = isolated_spool_root(sys.argv[2], sys.argv[3])
    spool = DeliberationSpool(root)
    if command == "init":
        result = spool.set_control("source-intake", True)
    elif command == "prepare":
        intake_record = spool.get_record(sys.argv[4])
        received_at = intake_record["messages"][0]["receivedAt"]
        now = datetime.fromisoformat(received_at.replace("Z", "+00:00")) + timedelta(seconds=61)
        DeliberationOrchestrator(spool).run_once(
            "openclaw-integration-closure",
            now=now,
            selection_budget=0,
        )
        claim = spool.claim_next("openclaw-integration-drafter", now=now)
        if claim is None:
            raise SystemExit("no draft claim available")
        record = spool.get_record(claim.record_id)
        source_target = record["sourceTarget"]
        _, provider, account, channel = source_target.split(":", 3)
        source_messages = json.loads(sys.argv[6])
        if not isinstance(source_messages, list):
            raise SystemExit("source history must be a JSON array")
        provider_event_id = sys.argv[7]
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
        spool.finalize(claim, decision="DRAFT", draft=sys.argv[5], now=now)
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
    elif command == "reconcile":
        now = datetime.fromisoformat(sys.argv[4].replace("Z", "+00:00"))
        result = spool.reconcile_delivery_boundaries(now=now, limit=100)
    elif command == "audit-fixture":
        record_id = sys.argv[4]
        case = sys.argv[5]
        result = seed_delivery_history_fixture(spool, record_id, case)
    elif command == "migration-check":
        ingested = spool.ingest(
            InboundMessage(
                provider="discord",
                provider_event_id="1535928766595866799",
                source_target="v1:discord:default:migration",
                source_thread_id="1535928766595866799",
                pipeline_id="migration-pipeline",
                delivery_target={
                    "provider": "discord",
                    "account": "default",
                    "channel": "migration",
                    "threadId": "1535928766595866799",
                },
                sender_id="migration-sender",
                occurred_at="2026-08-09T08:32:34.252000Z",
                received_at="2026-08-09T08:33:00.123000Z",
                content="migration fixture",
            )
        )
        with sqlite3.connect(spool.database_path) as connection:
            connection.execute(
                "UPDATE records SET state = 'SENT', terminal_reason = 'historical_audit' "
                "WHERE record_id = ?",
                (ingested.record_id,),
            )
            connection.execute("DELETE FROM deliberation_migration_metadata")
            connection.execute("DROP INDEX source_delivery_sequence")
            for trigger in (
                "records_pipeline_id_immutable",
                "messages_routing_immutable",
            ):
                connection.execute(f"DROP TRIGGER {trigger}")
            connection.execute("ALTER TABLE records DROP COLUMN pipeline_id")
            connection.execute("ALTER TABLE messages DROP COLUMN pipeline_id")
            before_failed_migration = "\n".join(connection.iterdump())

        original_target_migration = DeliberationSpoolSchemaMixin._migrate_delivery_targets

        def fail_target_migration(_connection):
            raise sqlite3.IntegrityError("synthetic target migration failure")

        DeliberationSpoolSchemaMixin._migrate_delivery_targets = staticmethod(
            fail_target_migration
        )
        rollback_observed = False
        try:
            DeliberationSpool(root)
        except sqlite3.IntegrityError:
            rollback_observed = True
        finally:
            DeliberationSpoolSchemaMixin._migrate_delivery_targets = staticmethod(
                original_target_migration
            )
        with sqlite3.connect(spool.database_path) as connection:
            rollback_atomic = "\n".join(connection.iterdump()) == before_failed_migration
        migrated = DeliberationSpool(root)
        audit = migrated.get_record(ingested.record_id)
        reopened = DeliberationSpool(root)
        with sqlite3.connect(spool.database_path) as connection:
            version = connection.execute(
                "SELECT value FROM deliberation_migration_metadata "
                "WHERE key = 'historical_pair_migration_version'"
            ).fetchone()[0]
        result = {
            "version": version,
            "rollbackObserved": rollback_observed,
            "rollbackAtomic": rollback_atomic,
            "historicalPipelineId": audit["pipelineId"],
            "historicalValid": audit["valid"],
            "historicalState": audit["state"],
            "historicalReadyCount": len(migrated.list_ready()["items"]),
            "sourceReport": reopened.source_thread_migration_report,
            "targetReport": reopened.delivery_target_migration_report,
        }
    else:
        result = spool.list_records()
    print(json.dumps(result, ensure_ascii=False, sort_keys=True, separators=(",", ":")))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
