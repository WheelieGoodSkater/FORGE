# W291 Returned Record Display-Ready Import Contract

W291 adds a contract-only module for returned-record display-ready import shape and Open-link authority. It describes supplied W245-normalized returned records; it does not move Finish build mutation, W151/W214/W245 validation, returned-record import state mutation, Review/Run UI rendering, connected submit/refresh/import, retry safety, endpoint behavior, dataset switching, or runtime authority.

## Contract Module

- Module: `src/contracts/returnedRecordDisplayReadyImport.js`
- Schema: `forge.w291.returned-record-display-ready-import.v1`
- Selected from W290 slice: `returned_record_display_ready_import_contract_w291`
- Future bridge path: `src/contracts/returnedRecordDisplayReadyImportBridge.js`

## Display-Ready Record Shape

The contract represents:

- canonical role
- consultant label
- record name
- NetSuite record type
- numeric internal id
- supported Open URL
- link authority status
- source confidence
- normal consultant visibility
- lane-aware label source
- evidence/guardrail source

## Statuses

- `display_ready_records_valid`
- `display_ready_records_missing`
- `display_ready_record_blocked_invalid_id`
- `display_ready_record_blocked_unsupported_url`
- `display_ready_record_hidden_internal`
- `display_ready_records_not_import_valid`

## Boundaries

The W291 contract consumes supplied W245/link-authority facts and can describe display readiness. It cannot:

- validate W151, W214, or W245 payloads
- mutate state
- import records
- create records
- perform transaction writes
- create Open links
- render consultant UI

The following remain drawer-owned runtime boundaries:

- `canonicalImportResultNormalizationW245`
- `displayReadyRecordsFromFinalNamingW245`
- `completedRunnerResultImportCommitOperatorFlowV1`
- `connectedBuildSubmitRefreshImportW264`
- W151 completed-result validation
- W214 semantic guard
- W245 canonical import normalization

## Future Bridge Path

The next safe step is a W292 bridge that compares drawer-produced W245 display-ready records and Open-link authority facts against this W291 contract. That bridge should prove shape parity only and must not move import mutation, visible UI layout, W151/W214/W245 validation, or runtime authority.

## Guardrails

- No drawer-created records.
- No drawer transaction writes.
- No direct drawer record import.
- No Open-link creation from the contract.
- No W144 deployment update.
- Normal consultant UI remains hidden from endpoint URLs, raw JSON, task ids, schema names, stack traces, admin diagnostics, and internal contract arrays.
- N/LLM remains advisory-only and uncertainty-visible.
