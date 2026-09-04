# Final Note: wild-dune-0272

## Supported sender indicators

The opaque provider `senderId` remains authoritative. The following optional values are channel-authenticated textual indicators only; message content, rendered envelopes, quoted messages, reply text, and model output are not sources.

### Discord

- `senderDisplayName`: resolved PluralKit `member.display_name`, then PluralKit `member.name`; otherwise guild `member.nickname`, then `member.nick`, then Discord `author.globalName`, then `author.username`.
- `senderUsername`: resolved PluralKit `member.name`; otherwise Discord `author.username`.
- `senderAliases`: the formatted Discord author tag from native author fields; for a resolved PluralKit member, `member.name` is eligible. Normalization removes an alias when it duplicates a direct indicator.

### Slack

- `senderDisplayName`: native event `message.username`; otherwise authenticated `users.info` `user.profile.display_name`, then `user.profile.real_name`, then `user.name`.
- `senderUsername`: native event `message.username` when present.
- `senderAliases`: not populated.

## Serialized KM contract

`senderIdentityHints` is optional on intake and persisted messages. Empty or invalid optional hints omit the field, preserving sender-ID-only intake.

```json
{
  "senderIdentityHints": {
    "senderDisplayName": "Display Name",
    "senderUsername": "provider-handle",
    "senderAliases": ["additional-provider-alias"]
  }
}
```

The object is closed. Every child field is optional, but a present object contains at least one child. Values are trimmed, reject C0/C1 control characters, and are limited to 128 UTF-8 bytes. Aliases retain provider order, are limited to eight, and are deduplicated case-insensitively against direct indicators and earlier aliases. The serialized object is limited to 2048 UTF-8 bytes.

These indicators do not alter `senderId`, `providerEventId`, `sourceTarget`, `sourceThreadId`, `pipelineId`, `deliveryTarget`, timestamps, content, idempotency, replay, source matching, or delivery routing. The unrelated root-routing wording from the rejected task material was removed; the pre-task Discord source-anchor and source-thread contract remains documented.
