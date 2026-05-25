# W267 Live Run Screenshot Reconciliation, Open Link Verification, And Keep/Rollback Signoff

## Summary

W267 adds a review-only reconciliation packet for the installed drawer after a Motion-style live connected build run.

The packet compares reviewer-entered screenshot evidence and Open-link verification against the W266 controlled live-run evidence packet. It is designed to help decide whether the installed Tampermonkey update is safe to keep, needs attention, or should be rolled back.

## Evidence Captured

- Build records clicked from normal consultant UI
- Build submitted state shown
- Refresh build status state shown
- Records ready / Finish build state shown
- Returned record names and lane-aware labels shown
- Supported Open links visible only after valid import
- Review/Run W258 CTA, W256 script, W257 sequence, and W254 receipt visible after import
- Weak evidence/uncertainty remains visible where applicable

## Open-Link Verification

Each W266 returned record receives a review row for:

- consultant label
- returned record name
- NetSuite record type
- internal id
- URL
- opened successfully yes/no/note

## Signoff

- `ready_to_keep`: W266 packet, screenshot evidence, labels, Open links, and hidden-diagnostics expectations agree.
- `needs_attention`: copy or labels need polish while authority boundaries still hold.
- `rollback_recommended`: fake links, unsupported URLs, invalid imports, external actions, or runtime authority boundary failures appear.

## Guardrails

- Review-only under `archive/`.
- No external uploads.
- No network calls.
- No tracking calls.
- No local storage writes.
- No install actions.
- No drawer-created records.
- No drawer transaction writes.
- No W144 deployment update.
