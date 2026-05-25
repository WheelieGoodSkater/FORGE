# W285 Connected Build Response Shape Runtime Migration

## Purpose

W285 migrates only safe drawer-owned W265 response-shape helper logic toward the W283 response-shape contract and W284 bridge shape. The migration stays inside `idb-drawer.user.js` so the Tampermonkey drawer remains self-contained.

## What Was Reshaped

- Response-shape status constants now use W283-shaped drawer-local constants.
- Transport normalization statuses, labels, and messages now use drawer-local W283-shaped tables.
- Normal consultant response copy now uses a drawer-local W283-shaped copy table.
- Completed-result JSON alias detection is centralized in drawer-local W285 helpers.
- Runner task id and idempotency alias detection for `actualAdapterResponseShapeW265` is centralized in drawer-local W285 helpers.
- `actualAdapterResponseShapeW265` now derives status/copy through W285 helper functions that match the W283/W284 parity shape.

## What Stayed Drawer-Owned

- Actual Build records submit execution.
- Actual Refresh build status / runner poll execution.
- W264 connected submit/refresh/import orchestration.
- W265 retry policy.
- W151 completed-result import validation.
- W214 semantic guard.
- W245 canonical import normalization.
- Finish build import.
- Normal consultant Build/Review/Run UI.

## Runtime Boundary

The drawer does not import `src/contracts/connectedBuildResponseShapes.js` or `src/contracts/connectedBuildResponseShapeBridge.js` at runtime. No runtime `require`, external dependency, bundler requirement, network dependency, or storage write was introduced for contract or bridge loading.

## Validation Summary

The W285 harness proves the migrated drawer-local helpers preserve W265 submit, pending refresh, completed refresh, and malformed/error response-shape behavior; remain field-compatible with the W284 bridge; do not bypass W151/W214/W245 validation; keep W264 submit/refresh/import and W265 retry safety unchanged; preserve returned record names, lane-aware labels, supported Open links, fake-link blocking, hidden diagnostics, and unchanged runtime authority.
