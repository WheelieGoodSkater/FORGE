# W289 Completed Result Import Eligibility Runtime Migration

## Purpose

W289 migrates only drawer-local completed-result import eligibility shape assembly toward the W287 contract and W288 bridge shape. It does not move Finish build state mutation, submit execution, refresh/poll execution, W151/W214/W245 validation, consultant UI, endpoint behavior, dataset switching, retry safety, or runtime authority.

## Runtime Shape Helpers

W289 adds contract-shaped pure helpers inside `idb-drawer.user.js`:

- `completedResultImportEligibilityShapeW289`
- `completedResultImportEligibilityFromDrawerGuardsW289`

These helpers assemble reviewable eligibility facts for:

- Completed-result JSON presence.
- W151 validation status.
- W214 semantic guard status.
- W245 canonical normalization readiness.
- Governed runner ownership.
- Finish build CTA eligibility.
- Open-link preconditions.
- W218/W220 wording preservation.
- Admin-only raw evidence policy.

## What Stayed Drawer-Owned

- `completedRunnerResultImportCommitOperatorFlowV1` remains the Finish build mutation boundary.
- Actual submit execution remains in `connectedBuildSubmitRefreshImportW264`.
- Actual refresh/poll execution remains in `connectedBuildSubmitRefreshImportW264`.
- W151/W214/W245 validation remains outside the migrated eligibility helpers.
- Returned record import and Open-link creation remain outside the eligibility shape.

## Boundaries Preserved

- No drawer-created records.
- No drawer transaction writes.
- No direct record import from the W289 helper.
- No Open-link creation from the W289 helper.
- No runtime `require`, external dependency, bundler requirement, network dependency, or storage write for contract/bridge loading.
- Normal consultant UI continues to hide endpoint URLs, raw JSON, task ids, schema names, stack traces, admin diagnostics, and internal contract arrays.

## Validation Summary

The W289 harness proves drawer-local eligibility shape parity against the W288 bridge for eligible, missing completed result, W151 rejected, W214 blocked, W245 not-ready, and Finish-build-blocked cases. It also proves W264 submit/refresh/import continuity, W265 retry safety, W245/W151/W214 validation continuity, returned record/Open-link preservation, fake-link blocking, hidden diagnostics, and unchanged runtime authority.
