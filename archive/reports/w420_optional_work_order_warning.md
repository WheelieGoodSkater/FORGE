# W420 Optional Work Order Warning Recovery

## Summary
W420 fixes the failure shape seen in the Herr Foods Reduced run: the one-click build submitted correctly and the runner reached `Runner COMPLETE`, but an optional Manufacturing Work Order seed problem surfaced as a NetSuite Error row and pushed the consultant drawer into `Fix the build setup`.

The fix keeps optional Work Order creation diagnostic, but no longer treats it as a build-stopping execution-log error when the core record build can continue.

## What Changed
- Advanced the drawer marker to `1.0.29 / W420`.
- Changed optional Work Order seed failures from `log.error` to an audit-level `Work Order seed best-effort warning`.
- Added explicit nonfatal telemetry: `status: best_effort_failed`, `nonFatal: true`, and `coreBuildContinues: true`.
- Updated the consultant stage priority so a captured runner task remains in `FORGE is building records` unless a completed result is actually rejected by the import guard.

## Boundaries
- No new runner write paths.
- No adapter contract change.
- No source-pack change.
- No completed-result import validation change.
- No fake Open links.
- Optional Work Order diagnostics remain visible for admin review.

## Pass/Fail
| Gate | Result |
| --- | --- |
| w420-version-marker-advanced | PASS |
| w420-filecabinet-drawer-synced | PASS |
| w420-filecabinet-runner-synced | PASS |
| w420-work-order-warning-not-error-log | PASS |
| w420-work-order-warning-preserves-diagnostics | PASS |
| w420-runner-task-warning-does-not-force-fix-build | PASS |
| w420-build-readiness-keeps-refresh-action | PASS |
| w420-completed-result-import-guard-preserved | PASS |
| w420-package-script-registered | PASS |

## Recommendation
Lock W420 as the optional Work Order warning recovery patch. Deploy the updated runner and drawer, then rerun the Herr Foods smoke with Create new item and Manufacturing enabled, WIP disabled. The expected consultant flow is: one-click Build records, Refresh build status, Finish build when W151-valid completed records return, then Demo Cockpit with verified Open links.
