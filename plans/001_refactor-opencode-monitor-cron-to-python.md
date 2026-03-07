# Plan 001: Refactor opencode-monitor cron job to Python script

Refactor the `opencode-monitor` cron job from a pure LLM prompt to a deterministic Python script that handles orphaned task detection and state cleanup, with the LLM only acting on structured JSON output.

*Status: WIP*
*Vytvořeno: 2026-03-07*

---

## Progress

- [x] Fáze 0: Config + Init
- [ ] Fáze 1: Research
- [ ] Fáze 2: Knowledge
- [ ] Fáze 3: Synthesis

## Problem

The `opencode-monitor` cron job runs every 2 minutes using a mini LLM (gpt-5-mini) with a long natural-language prompt. The LLM reads the task state file, checks for orphaned tasks, and updates their status. LLM behavior is inconsistent — the same deterministic logic should always produce the same results. A Python script should handle the deterministic part, and the LLM should just run the script and act on structured output.

## Analysis [WIP]

### Kontext z codebase [TODO]

### Relevantní dokumentace [TODO]

### Knowledge base [TODO]

## Solutions [TODO]

## Implementation [TODO]

## Files to Create/Modify [TODO]

## Testing [TODO]

## Dependencies [TODO]
