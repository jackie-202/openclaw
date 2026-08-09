# TDD Red-Green Proof: cool-vale-3921

<!-- proof-capture-metadata: {"version":1,"task_id":"cool-vale-3921","command":["env","OPENCLAW_DELIBERATION_KM_ROOT=/Users/michal/.openclaw/workspace/km-system","pnpm","test:deliberation:km-integration"],"command_sha256":"dcf4e3fc2fcd7ab73e1956ebe580e25aece2e31fab58deb006e9da22e86c5cc5"} -->

## RED Phase

- **Timestamp:** 2026-08-09T09:12:18.918630+00:00
- **Test command:** `env OPENCLAW_DELIBERATION_KM_ROOT=/Users/michal/.openclaw/workspace/km-system pnpm test:deliberation:km-integration`
- **Exit code:** 1

### Standard Output

```text
✖ KM listener exposes an explicit isolated spool mode (1.214958ms)
ℹ tests 1
ℹ suites 0
ℹ pass 0
ℹ fail 1
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 686.89325

✖ failing tests:

test at extensions/deliberation/scripts/km-listener.cross-repo.ts:1:248
✖ KM listener exposes an explicit isolated spool mode (1.214958ms)
  AssertionError [ERR_ASSERTION]: spool: explicit root is unavailable
      at TestContext.<anonymous> (/Users/michal/Projects/openclaw-fork/extensions/deliberation/scripts/km-listener.cross-repo.ts:16:10)
      at Test.runInAsyncScope (node:async_hooks:226:14)
      at Test.run (node:internal/test_runner/test:1118:25)
      at Test.start (node:internal/test_runner/test:1015:17)
      at startSubtestAfterBootstrap (node:internal/test_runner/harness:358:17) {
    generatedMessage: false,
    code: 'ERR_ASSERTION',
    actual: '#!/usr/bin/env python3\n"""Loopback-only HTTP listener for the Deliberation v2 wire contract."""\n\nfrom __future__ import annotations\n\nimport argparse\nimport ipaddress\nimport json\nimport socket\nfrom http.server import BaseHTTPRequestHandler, ThreadingHTTPServer\nfrom pathlib import Path\nfrom urllib.parse import parse_qsl, urlsplit\n\nfrom deliberation_spool import DeliberationSpool, RecordValidationError, open_canonical_spool\nfrom deliberation_wire import MAX_BODY_BYTES, DeliberationWire, credential_path_from_environment, load_credential\n\n\ndef _parser() -> argparse.ArgumentParser:\n    parser = argparse.ArgumentParser(description=__doc__)\n    parser.add_argument("--host", required=True, help="Explicit loopback address: 127.0.0.1 or ::1")\n    parser.add_argument("--port", type=int, default=8765)\n    parser.add_argument("--credential-file", type=Path)\n    return parser\n\n\ndef _query_from_path(path: str):\n    split = urlsplit(path)\n    pairs = parse_qsl(split.query, keep_blank_values=True)\n    if len({key for key, _ in pairs}) != len(pairs):\n        return split.path, None, (400, {"protocolVersion": 1, "error": {"code": "SCHEMA_INVALID", "message": "duplicate query field"}})\n    return split.path, dict(pairs), None\n\n\ndef _read_json_body(handler: BaseHTTPRequestHandler):\n    if handler.command != "POST":\n        return None, None\n    try:\n        length = int(handler.headers.get("Content-Length", "-1"))\n    except ValueError:\n        length = -1\n    if not 0 <= length <= MAX_BODY_BYTES:\n        return None, (413, {"protocolVersion": 1, "error": {"code": "BODY_TOO_LARGE", "message": "request body exceeds bounds"}})\n    try:\n        return json.loads(handler.rfile.read(length)), None\n    except (UnicodeDecodeError, json.JSONDecodeError):\n        return None, (400, {"protocolVersion": 1, "error": {"code": "SCHEMA_INVALID", "message": "request body is invalid JSON"}})\n\n\ndef _dispatch_request(handler: BaseHTTPRequestHandler, wire: DeliberationWire):\n    path, query, error = _query_from_path(handler.path)\n    if error is not None:\n        return error\n    body, error = _read_json_body(handler)\n    if error is not None:\n        return error\n    return wire.handle(\n        handler.command, path, {name: value for name, value in handler.headers.items()},\n        body=body, query=query,\n    )\n\n\ndef _write_json(handler: BaseHTTPRequestHandler, status: int, body) -> None:\n    encoded = json.dumps(body, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")\n    handler.send_response(status)\n    handler.send_header("Content-Type", "application/json")\n    handler.send_header("Content-Length", str(len(encoded)))\n    handler.end_headers()\n    handler.wfile.write(encoded)\n\n\ndef _handler(wire: DeliberationWire):\n    class Handler(BaseHTTPRequestHandler):\n        protocol_version = "HTTP/1.1"\n\n        def setup(self):\n            super().setup()\n            self.connection.settimeout(5)\n\n        def log_message(self, format, *args):\n            return\n\n        def _serve(self):\n            self.connection.settimeout(10)\n            status, response = _dispatch_request(self, wire)\n            _write_json(self, status, response)\n\n        do_GET = _serve\n        do_POST = _serve\n        do_PUT = _serve\n        do_DELETE = _serve\n\n    return Handler\n\n\ndef main(\n    argv: list[str] | None = None,\n    *,\n    spool: DeliberationSpool | None = None,\n    runner_status_provider=None,\n) -> int:\n    args = _parser().parse_args(argv)\n    if runner_status_provider is None:\n        import cron_ops\n\n        runner_status_provider = cron_ops.deliberation_runner_status\n    try:\n        address = ipaddress.ip_address(args.host)\n    except ValueError as exc:\n        raise SystemExit("--host must be an explicit loopback IP address") from exc\n    if not address.is_loopback or args.host not in {"127.0.0.1", "::1"}:\n        raise SystemExit("--host must be 127.0.0.1 or ::1")\n    if not 1 <= args.port <= 65535:\n        raise SystemExit("--port must be between 1 and 65535")\n    try:\n        credential = load_credential(credential_path_from_environment(args.credential_file))\n    except RecordValidationError as exc:\n        raise SystemExit(str(exc)) from exc\n    class LoopbackServer(ThreadingHTTPServer):\n        address_family = socket.AF_INET6 if address.version == 6 else socket.AF_INET\n\n    server = LoopbackServer(\n        (args.host, args.port),\n        _handler(DeliberationWire(spool or open_canonical_spool(), credential, runner_status_provider=runner_status_provider)),\n    )\n    server.serve_forever()\n    return 0\n\n\nif __name__ == "__main__":\n    raise SystemExit(main())\n',
    expected: /--spool-root/,
    operator: 'match',
    diff: 'simple'
  }
[ELIFECYCLE] Command failed with exit code 1.
```

### Standard Error

```text
$ node --import tsx --test extensions/deliberation/scripts/km-listener.cross-repo.ts
```

## GREEN Phase

- **Timestamp:** 2026-08-09T09:25:24.737451+00:00
- **Test command:** `env OPENCLAW_DELIBERATION_KM_ROOT=/Users/michal/.openclaw/workspace/km-system pnpm test:deliberation:km-integration`
- **Exit code:** 0

### Standard Output

```text
✔ real producer reaches the isolated KM listener and canonical spool (267.133708ms)
✔ listener rejects the production spool before opening SQLite (74.524958ms)
✔ listener and temporary root are cleaned after callback failure (132.812375ms)
✔ temporary fixture paths cannot alias production state (1.673416ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2924.836833
```

### Standard Error

```text
$ node --import tsx --test extensions/deliberation/scripts/km-listener.cross-repo.ts
```
