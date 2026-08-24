# Canonical Test Gate: swift-reef-2433

- Status: `BLOCKED`
- Required command: `npm test`
- Recorded at: `2026-08-23T00:41:32Z`
- Production/test changes: none

## Owner Infrastructure Attempts

### Blacksmith Testbox Through Crabbox

- Command: `node scripts/crabbox-wrapper.mjs run --provider blacksmith-testbox --blacksmith-org openclaw --blacksmith-workflow .github/workflows/ci-check-testbox.yml --blacksmith-job check --blacksmith-ref main --idle-timeout 90m --ttl 240m --timing-json -- npm test`
- Result: blocked before Testbox allocation and before `npm test` execution.
- Error: `blacksmith testbox warmup failed: blacksmith failed: exec: "blacksmith": executable file not found in $PATH`
- Run reference: unavailable; no `tbx_...` ID was allocated.

### Direct Azure Crabbox

- Probe: `crabbox list --provider azure`
- Result: blocked before runner allocation.
- Error: `AZURE_SUBSCRIPTION_ID is required for direct azure provider (or run 'az login' and 'crabbox azure login'): az CLI not found on PATH`
- Run reference: unavailable; no lease was allocated.

### Direct AWS Crabbox

- Probe: `crabbox list --provider aws`
- Result: blocked before runner allocation.
- Error: AWS credential refresh failed because no credentials or EC2 IMDS role were available.
- Run reference: unavailable; no `cbx_...` ID was allocated.

## Conclusion

No canonical Test Gate executed, so this artifact does not claim `PASS`. A caller with authenticated Blacksmith Testbox, Azure Crabbox, or AWS Crabbox access must run `npm test` against the preserved workspace and supply its durable provider/run reference and passing result.
