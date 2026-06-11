# Investigate OpenClaw Discord channel-session caller path bypassing embedded-runner incomplete-turn policy

## Context

Task `quick-wave-8890` investigated the broad post-upstream-sync runtime regression. It found:

- The prompt-level execution bias still exists.
- Embedded-runner incomplete-turn/planning-only guards exist and focused tests pass.
- The remaining likely risk is path coverage: callers using the new low-level `packages/agent-core` loop without embedded-runner policy can accept promise-only assistant text as normal final output.
- `sessions.send` and model-facing `sessions_send` are distinct contracts.

Michal wants a narrower follow-up investigation focused on the exact production caller path that caused the observed behavior in Discord / Mission Control Ask Jackie flows.

## Goal

Identify the precise live caller path for Discord channel turns and Mission Control Ask Jackie session dispatch, and determine whether it routes through embedded-runner incomplete-turn policy or bypasses it through raw `packages/agent-core` loop semantics.

## Questions to answer

1. For a normal Discord channel inbound user message in `#tech-debt`, what exact code path launches the agent run?
   - Include file/function chain from Discord inbound event to agent execution.
   - State whether it uses embedded-runner incomplete-turn policy.

2. For Mission Control Ask Jackie dispatch via Gateway `sessions.send`, what exact code path launches the target channel session turn?
   - Include file/function chain from `sessions.send` handler to agent execution.
   - State whether it uses embedded-runner incomplete-turn policy.

3. Which path can produce promise-only final assistant text without tool evidence?
   - If none can, identify the remaining likely cause and evidence.
   - If one can, identify the smallest safe fix location.

4. For final confirmation delivery back to Discord, what is the correct contract?
   - Do not assume `sessions.send` supports `deliver`; previous investigation found it does not.
   - Identify whether MC must explicitly post final result, or whether OpenClaw channel session should deliver it.

## Required evidence

- Exact source files and line numbers for the call chain.
- Exact branch/commit inspected.
- Any relevant tests already covering the path.
- If no test exists, describe the minimal test to add.

## Deliverable

Write a concise investigation note under `plans/investigations/` with:

- call-chain map for Discord inbound;
- call-chain map for Gateway `sessions.send`;
- embedded-runner vs raw agent-core verdict;
- recommended minimal fix task, if needed.

## Constraints

- Investigation only unless the fix is trivially local and covered by focused tests.
- No Git operations.
- No OpenClaw live config mutation.
- Do not duplicate the broad prompt comparison from `quick-wave-8890`; focus on caller path coverage.
