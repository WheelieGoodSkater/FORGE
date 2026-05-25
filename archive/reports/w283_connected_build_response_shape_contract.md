# W283 Connected Build Response Shape Contract Extraction

## Purpose

W283 extracts the stable connected-build submit/refresh response-shape contract into `src/contracts/connectedBuildResponseShapes.js` without changing the drawer-owned submit execution, refresh/poll execution, completed-result validation, Finish build import, consultant UI, endpoint behavior, dataset switching, retry safety, or runtime authority.

## What Moved Into Contract Shape

- Submit response shape.
- Pending refresh response shape.
- Completed refresh response shape.
- Malformed/error refresh response shape.
- `runnerTaskId` aliases used by W265.
- Idempotency token aliases used by W265.
- Result capture status.
- Adapter-safe error copy.
- `finalGeneratedNamesJson` location detection.
- Normal consultant copy states.

## Status Constants

- `submit_task_captured`
- `refresh_pending`
- `completed_result_shape_ready`
- `adapter_error_safe_stop`
- `no_task_or_result_shape`

## Protected Boundaries

- W151 still owns completed-result import validity.
- W214 still owns semantic operating-mode result validation.
- W245 still owns canonical returned-record normalization.
- W264 still owns connected submit/refresh/import orchestration.
- W265 retry safety remains unchanged.
- The response-shape module may locate completed JSON, but it cannot declare the result import-valid.
- The drawer remains self-contained; no runtime `require`, external dependency, bundler requirement, network dependency, or storage write was added to load the contract.

## W282 Continuity

W282 selected `connected_build_response_shape_contract_prepare` as the safest future micro-slice. W283 executes only the contract extraction/mirroring portion of that slice and keeps submit execution, refresh execution, Finish build import, W151/W214/W245 validation, normal consultant UI, endpoint/profile behavior, dataset switching, and record creation authority protected.

## Validation Summary

The W283 harness verifies contract parity against the current drawer W265 helpers, W264 connected build continuity, W265 retry safety, W245/W151 validation, W214 semantic guard, returned record names/labels/Open links, fake-link blocking, hidden diagnostics, W281/W282 continuity, and no drawer-created records or transaction writes.
