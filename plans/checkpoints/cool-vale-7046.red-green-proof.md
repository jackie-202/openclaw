# Red/Green Proof: cool-vale-7046

## RED Phase

Created before production code changes.

Target behavior: OpenAI-compatible request construction should pass an explicitly configured provider-facing reasoning effort string through unchanged, omit it when unset, and avoid hidden mapping from thinking levels.

Initial RED test command/output will be recorded after adding focused tests and before production implementation.

Command:

```sh
pnpm test src/llm/providers/openai-completions.test.ts src/llm/providers/openai-responses-shared.test.ts
```

Result: failed as expected before production code changes.

Key failures:

```text
FAIL src/llm/providers/openai-completions.test.ts > OpenAI-compatible completions params > passes configured reasoning effort through unchanged
AssertionError: expected 'xhigh' to be 'high'

FAIL src/llm/providers/openai-completions.test.ts > OpenAI-compatible completions params > does not remap configured xhigh reasoning effort
AssertionError: expected 'high' to be 'xhigh'

FAIL src/llm/providers/openai-responses-shared.test.ts > applyCommonResponsesParams > passes configured reasoning effort through unchanged
AssertionError: expected 'xhigh' to be 'high'

FAIL src/llm/providers/openai-responses-shared.test.ts > applyCommonResponsesParams > does not remap configured xhigh reasoning effort
AssertionError: expected 'high' to be 'xhigh'
```

## GREEN Phase

Command:

```sh
pnpm test src/llm/providers/openai-completions.test.ts src/llm/providers/openai-responses-shared.test.ts
```

Result: passed after production code changes.

Output:

```text
Test Files  2 passed (2)
Tests  40 passed (40)
Duration  564ms
[test] passed 1 Vitest shard in 4.05s
```

Post-format focused verification:

```text
Test Files  2 passed (2)
Tests  40 passed (40)
Duration  468ms
[test] passed 1 Vitest shard in 3.52s
```
