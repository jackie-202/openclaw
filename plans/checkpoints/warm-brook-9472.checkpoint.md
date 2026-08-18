# Checkpoint: warm-brook-9472
## Steps
- ✅ Step 1: Read the original plan and preserved implementation context.
- ✅ Step 2: Create the checkpoint and RED/GREEN proof scaffold before production changes.
- ✅ Step 3: Establish the active Gateway's READY_TO_SEND delivery state and canonical rollout path.
- ⬜ Step 4: Apply the authorized rollout or minimal proven production fix.
- ⬜ Step 5: Verify focused behavior, live exactly-once delivery, and proof artifacts.
- ⬜ Step 6: Save a learning.

## Last completed
Confirmed the isolated canonical transition is green: seven tests prove READY_TO_SEND reaches SENT with one fake-provider call.

## Context for resume
The repository is a large dirty shared worktree. `extensions/deliberation/src/final-adapter.ts` already owns the sole `ready -> reserve -> invoke -> provider.send -> completeDelivery` flow, and `extensions/deliberation/index.ts` registers its service when enabled. The isolated owner-backed integration test passes 7/7. The active Gateway call still reports `readyToSend: 1`; its serving artifact cannot be validated or restarted because the host owner did not supply the canonical deploy verifier or authorization. Do not substitute a guessed deploy/restart, manually reserve/send, or mutate KM/SQLite.
