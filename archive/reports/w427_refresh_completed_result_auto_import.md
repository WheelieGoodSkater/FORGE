# W427 Refresh Completed Result Auto-Import

## Summary
W427 restores the simplified consultant flow after a runner task completes. Refresh now preserves the original submitted build identity, polls the result capture with that identity, and auto-imports the completed runner result into the cockpit only after the existing W151 import guard accepts it.

## Fix
- Store the submitted confirmed build request on the captured runner result.
- Reuse that confirmed request during result-capture polling.
- On Refresh build status, commit a W151-valid completed result immediately instead of requiring a separate Finish build click.
- Show a more honest waiting message when the sidecar exists but Sales Order import resolution is still pending.

## Pass/Fail
| Gate | Result |
| --- | --- |
| w427-drawer-marker-updated | PASS |
| w427-filecabinet-drawer-synced | PASS |
| w427-submitted-confirmed-request-is-preserved | PASS |
| w427-refresh-auto-import-code-present | PASS |
| w427-auto-import-uses-existing-w151-guard | PASS |
| w427-auto-import-preserves-open-link-authority | PASS |
| w427-pending-transaction-resolution-copy-is-honest | PASS |

## Boundaries
- No live smoke was run.
- No upload or deployment was performed.
- No runner write path, adapter record creation, source pack, completed-result validation, or Open-link authority check was weakened.

## Recommendation
Lock W427, reinstall Drawer 1.0.35 / W427 in Tampermonkey, and rerun one controlled Food/Beverage build. After the runner completes, Refresh build status should either import the records into the cockpit or clearly show transaction import resolution is still pending.
