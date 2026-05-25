# W282 Connected Build Boundary Inventory

## Purpose

W282 prepares the next optimization slice around the connected W264 submit / refresh / import path without changing live Build records behavior, W144 endpoint behavior, retry safety, completed-result import, consultant UI, lane resolution, dataset switching, or runtime authority.

## Connected Build Helper Anchors Reviewed

- `connectedBuildSubmitRefreshImportW264`
- `actualAdapterResponseShapeW265`
- `connectedBuildRetryPolicyW265`
- `adapterReadyRecordCreationUxW262`
- `canonicalImportResultNormalizationW245`
- `completedRunnerResultSemanticGuardW214`
- W151 completed-result validation/import guard helpers, especially `validateDccFinalNamingImportPayload`

## Boundary Inventory

| Boundary | Current owner | Role | Future extraction posture |
| --- | --- | --- | --- |
| consultant_request_readiness | `adapterReadyRecordCreationUxW262`, accepted packet state | Confirms prospect, website, notes, lane/toggles, and consultant request readiness before build | Protected runtime surface for now |
| selected_adapter_profile_readiness | W281-shaped W262/W263 profile/readiness helpers | Selects released adapter profile, derives endpoint from host + Suitelet path, and keeps dataset switching data-driven | Already migrated/bridged; keep protected while connected build extraction begins |
| submit_payload_idempotency | `connectedBuildSubmitRefreshImportW264` through approved adapter execution helper | Builds one approved submit request and idempotency token for the confirmed request | Protected runtime surface for now |
| adapter_response_normalization | `actualAdapterResponseShapeW265`, approved adapter transport normalization | Normalizes submit aliases, HTTP/status, runnerTaskId, result capture status, idempotency, and safe error copy | Safe future micro-slice candidate |
| refresh_poll_response_normalization | `actualAdapterResponseShapeW265`, governed runner polling helper | Normalizes pending/completed/error refresh aliases and finalGeneratedNamesJson location | Safe future micro-slice candidate |
| completed_result_validation | W151 validation via `validateDccFinalNamingImportPayload` plus W214 semantic guard | Accepts only completed, owner-valid, URL-valid, role-compatible returned records | Protected runtime surface |
| finish_build_import_action | `completedRunnerResultImportCommitOperatorFlowV1` inside W264 | Imports only after the consultant/admin chooses Finish build and W151 accepts the completed result | Protected runtime surface |
| returned_record_names_labels_open_links | W245 normalization and W250 lane-aware labels | Shows returned names, lane-aware labels, and supported Open links only after valid import | Protected consultant-facing surface |
| error_recovery_copy | W220 recovery wording plus W265 safe-stop copy | Shows safe consultant copy for invalid/error paths without raw adapter diagnostics | Future extractable only after response-shape contract exists |
| admin_only_raw_evidence | W265/W266 archived packets and admin/debug surfaces | Keeps raw response shape evidence out of normal consultant UI | Safe future micro-slice candidate |

## Selected Future Micro-Slice

The safest next runtime-adjacent micro-slice is `connected_build_response_shape_contract_prepare`.

This slice should extract or mirror the submit/refresh response-shape contract into a focused module such as `src/contracts/connectedBuildResponseShapes.js`, governed by W265 aliases and W264 continuity. It should not move submit execution, polling execution, W151 validation, Finish build import, endpoint/profile selection, dataset switching, or consultant UI.

### Source anchors

- `actualAdapterResponseShapeW265`
- `connectedBuildRetryPolicyW265`
- `connectedBuildSubmitRefreshImportW264` captured response fields only
- `normalizeApprovedServerAdapterTransportResponseV1` response status interpretation only
- W266 evidence packet response-shape fields

### Expected identical behavior surfaces

- runnerTaskId alias capture remains unchanged
- idempotency token preservation remains unchanged
- pending refresh remains `Still building`
- completed refresh shows `Records ready` / `Finish build` only after W151-valid result
- malformed/error refresh uses W220 or safe ask-admin copy
- fake Open links remain blocked before valid import
- normal consultant UI hides endpoint, raw JSON, task ids, schema names, stack traces, and admin diagnostics
- no drawer-created records or drawer transaction writes

### Required parity harnesses

- W244 through W282
- W264 connected submit/refresh/import
- W265 response shape and retry safety
- W266 controlled live evidence
- W281 adapter profile/readiness migration
- `npm run check`
- `npm run validate`

### Manual review notes

- Do not move the actual adapter submit call.
- Do not move the actual refresh/poll call.
- Do not relax W151 or W214 validation to accept incomplete ids, unsupported URLs, fake links, wrong owner, or handoff-only JSON.
- Do not expose raw response evidence in normal consultant UI.
- Keep the drawer self-contained unless a later block explicitly introduces a safe build/bundle step.

### Rollback boundary

If any parity harness, W151 import behavior, Open-link authority, retry behavior, or hidden-diagnostics expectation changes, restore drawer-owned W264/W265 response-shape helpers and keep only this archived W282 inventory.

## Guardrails

- W281 adapter profile/readiness migration is preserved.
- Dataset/account switching remains data-driven.
- W264 submit/refresh/import remains unchanged.
- W265 retry safety remains unchanged.
- W245/W151 validation remains unchanged.
- Normal consultant UI remains unchanged.
- No drawer-created records are introduced.
- No drawer transaction writes are introduced.
- W144 deployment is not updated in this block.
