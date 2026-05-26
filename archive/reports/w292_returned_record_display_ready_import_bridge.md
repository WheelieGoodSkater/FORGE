# W292 Returned Record Display-Ready Import Bridge

W292 adds a bridge-only module between drawer-produced W245 display-ready returned record facts and the W291 returned-record display-ready import contract. It proves shape parity only. It does not move Finish build mutation, W151/W214/W245 validation, returned-record import state mutation, Review/Run UI rendering, connected submit/refresh/import, retry safety, endpoint behavior, dataset switching, or runtime authority.

## Bridge Module

- Module: `src/contracts/returnedRecordDisplayReadyImportBridge.js`
- Schema: `forge.w292.returned-record-display-ready-import-bridge.v1`
- Governing contract: `src/contracts/returnedRecordDisplayReadyImport.js`

## Compared Shape

The bridge compares drawer-produced and W291 contract-normalized output for:

- status
- display readiness
- blocked reasons
- visible records
- hidden records
- numeric id authority
- supported Open-link authority
- W151/W214/W245 consumed-not-replaced boundary
- no mutation/import/create/write/Open-link/UI runtime boundary

Per-record parity includes:

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
- safe-to-open flag

## Boundaries

The W292 bridge may prove display-ready record parity. It cannot:

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

## Guardrails

- No drawer-created records.
- No drawer transaction writes.
- No direct drawer record import.
- No Open-link creation from the bridge.
- No W144 deployment update.
- Normal consultant UI remains hidden from endpoint URLs, raw JSON, task ids, schema names, stack traces, admin diagnostics, and internal contract arrays.
- N/LLM remains advisory-only and uncertainty-visible.

## Future Runtime Path

The next safe step is a W293 runtime migration that reshapes only drawer-local returned-record display-ready fact assembly toward the W291/W292 shape while keeping W245 normalization, import mutation, Open-link authority, and visible UI behavior unchanged.
