# W286 Connected Build Import Guard Boundary Map

## Purpose

W286 closes the W283-W285 response-shape migration and maps the next protected connected-build area: completed-result validation, Finish build eligibility, and returned-record import. This block does not refactor runtime logic.

## Post-Refresh Import Boundary

| Boundary | Current source anchor | Owner | Safe future extraction? | Notes |
| --- | --- | --- | --- | --- |
| Completed-result JSON presence | `connectedBuildSubmitRefreshImportW264`, `normalizeApprovedServerAdapterTransportResponseV1`, W285 completed JSON helpers | Drawer runtime shape layer | Yes, as eligibility shape only | May locate JSON but cannot declare import valid. |
| W151 payload validation | `validateDccFinalNamingImportPayload` | W151 import guard | No broad move yet | Must keep rejecting handoff-only JSON, unsupported URLs, incomplete ids, invalid status, naming violations, and semantic violations. |
| W214 semantic guard | `completedRunnerResultSemanticGuardW214` | W214 operating-mode semantic guard | No broad move yet | Keeps operating mode, lane, manufacturing, WIP, and partial-result honesty intact. |
| W245 canonical display-ready records | `canonicalImportResultNormalizationW245` | W245 returned-record normalization | Later contract parity only | Produces display-ready names, lane-aware labels, link authority, story surfaces. |
| Finish build operator action | `completedRunnerResultImportCommitOperatorFlowV1` | Drawer runtime commit surface | Not now | This is the state-mutating boundary and must remain drawer-owned. |
| Synthetic poll-control creation | `connectedBuildSubmitRefreshImportW264` | W264 orchestration | Not now | Only exists to route W151-valid completed result into existing Finish build flow. |
| Imported returned records | `connectedBuildSubmitRefreshImportW264`, `canonicalImportResultNormalizationW245` | W245/W264 | Later after eligibility contract | Must preserve returned names, lane-aware labels, types, ids, and supported Open URLs. |
| Lane-aware labels and Open-link authority | W245 label/link normalization helpers | W245/W250 link authority | Later contract parity only | Fake links stay blocked before valid import. |
| W218/W220 consultant wording | `operatorSmokePacketLiveWordingFreezeW218V1`, `importRecoveryUiSurfaceW220V1` | Frozen wording contracts | No move now | Preserve success and recovery copy. |
| Admin-only raw evidence | W265-W268 evidence packets, W272/W276 bridge | Review/admin-only evidence | Yes, review-only only | Must stay hidden from normal consultant UI. |

## Selected Next Micro-Slice

`completed_result_import_eligibility_contract_w287`

This is the safest next slice because it can define the shape of "eligible to show Finish build" and does not move Finish build state mutation.

## Proposed Target

- `src/contracts/completedResultImportEligibility.js`
- Future bridge: `src/contracts/completedResultImportEligibilityBridge.js`

## Source Anchors

- `connectedBuildSubmitRefreshImportW264`
- `validateDccFinalNamingImportPayload`
- `completedRunnerResultSemanticGuardW214`
- `canonicalImportResultNormalizationW245`
- `completedRunnerResultImportCommitOperatorFlowV1`
- `adapterResultIndicatesCompletedResultReady`
- W285 completed JSON location helpers

## Identical Behavior Surfaces

- `Finish build` appears only after W151-valid completed result.
- W214 semantic guard remains required.
- W245 canonical returned-record normalization remains required before Review/Run Open links.
- W218 success wording remains unchanged.
- W220 recovery wording remains unchanged.
- Fake Open links remain blocked before valid import.
- Normal consultant UI hides raw JSON, endpoint URLs, task ids, schema names, stack traces, and admin diagnostics.
- No drawer-created records or drawer transaction writes.

## Required Parity Harnesses

- W244 through W286 harnesses.
- W264 connected submit/refresh/import harness.
- W265 retry safety harness.
- W283/W284/W285 response-shape contract/bridge/migration harnesses.
- Future W287 completed-result import eligibility contract harness.

## Manual Review Notes

- Do not move state mutation out of `completedRunnerResultImportCommitOperatorFlowV1`.
- Do not weaken `validateDccFinalNamingImportPayload`.
- Do not let eligibility shape imply Open links are safe before W245 normalization.
- Do not expose W151/W214/W245 schema names in normal consultant UI.

## Rollback Plan

If a future extraction changes import behavior, remove the new eligibility module/bridge usage and keep the existing drawer-owned W264/W151/W214/W245 flow as the source of truth.
