# W428 Refresh Completed Result Auto-Import Repair

## Summary
W428 repairs the simplified consultant flow after a runner task completes. Refresh preserves the original submitted build identity, polls the result capture with that identity, and auto-imports the completed runner result into the cockpit when the completed result validates locally or the completed poll response carries W151-ready evidence.

## Fix
- Store the submitted confirmed build request on the captured runner result.
- Reuse that confirmed request during result-capture polling.
- On Refresh build status, commit a W151-valid completed result immediately instead of requiring a separate Finish build click.
- Trust the completed poll result when the older poll-control object still reports a conservative pending state.
- Show a more honest waiting message when the sidecar exists but Sales Order import resolution is still pending.

## Pass/Fail
| Gate | Result |
| --- | --- |
| w428-drawer-marker-updated | FAIL |
| w427-filecabinet-drawer-synced | PASS |
| w427-submitted-confirmed-request-is-preserved | PASS |
| w427-refresh-auto-import-code-present | PASS |
| w427-auto-import-uses-existing-w151-guard | PASS |
| w427-auto-import-preserves-open-link-authority | PASS |
| w428-refresh-auto-import-trusts-completed-poll-result | PASS |
| w427-pending-transaction-resolution-copy-is-honest | PASS |
| w431-refresh-imports-sidecar-brand-records-before-sales-order-resolution | PASS |
| w433-sidecar-imports-returned-records-even-when-name-review-needed | PASS |
| w431-sidecar-import-only-blocks-empty-sidecar | PASS |
| w430-pending-transaction-resolution-stage-is-not-generic-building | PASS |

## Boundaries
- No live smoke was run.
- No upload or deployment was performed.
- No runner write path, adapter record creation, source pack, completed-result validation, or Open-link authority check was weakened.

## Recommendation
Lock W443, reinstall Drawer 1.0.51 / W443 in Tampermonkey, and rerun one controlled Food/Beverage build. After the runner returns sidecar records, Refresh build status should import returned records into the cockpit even while transaction import resolution or naming review continues.
