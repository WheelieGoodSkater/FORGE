# W266 Controlled Live Build Run Evidence And Result Import QA

## Summary

W266 adds the controlled live build run evidence packet and release decision helper for the first Motion-style connected build run through the released W144 adapter profile.

The harness remains fixture-based and does not perform a live network call. The packet is designed to capture the real run when the installed drawer is used in NetSuite.

## Consultant Workflow

- Prospect name
- Website
- Notes
- Toggles/lane
- Build records
- Refresh build status
- Finish build after records are ready
- Review/Run returned records

## Evidence Captured

- Selected adapter profile
- Endpoint path, hidden from normal UI
- Submit timestamp
- Idempotency token
- Actual submit response shape
- Captured runner task id or supported alias
- Pending refresh response shape
- Completed refresh response shape
- `finalGeneratedNamesJson` location
- W245/W151 validation result
- Imported returned record names, labels, types, ids, and supported Open URLs

## Decision Helper

- `ready_to_keep`: submit, refresh, validation, import, and Open-link checks pass.
- `needs_attention`: result shape is new but safe to reconcile, or required evidence is missing.
- `rollback_recommended`: authority boundaries, fake links, unsupported URLs, or invalid completed result behavior appear.

## Guardrails

- No drawer-created records.
- No drawer transaction writes.
- Record creation remains approved-server-adapter-only.
- No W144 deployment update.
- Raw response evidence stays archived/admin-only.
- Normal consultant UI keeps simple copy only.
