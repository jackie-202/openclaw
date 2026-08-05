# RED/GREEN Proof: bold-fork-1170

## RED Phase

This follow-up preserves the genuine historical RED recorded before the prior consumer implementation in `plans/checkpoints/swift-peak-4405.red-green-proof.md`: an authenticated Node global-`fetch` health request to the authoritative KM listener emitted `Sec-Fetch-Mode: cors` and received HTTP 400.

The accepted prior task evidence further records that the authoritative listener remained RED after consumer-mirror-only changes. This follow-up will not fabricate a new post-implementation RED. GREEN requires the changed KM-owned listener itself to return HTTP 200 for Node global fetch while retaining HTTP 400 for an unknown application header.
