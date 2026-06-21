# W419 One-Click Build Records

## Summary
W419 collapses the pre-build consultant flow to one primary action after entry: `Build records`.

The consultant enters customer, website, conversation notes, and toggles on the first surface. The `Build records` click prepares the path, freezes the accepted packet when evidence is usable, and submits through the existing approved adapter path.

## What Changed
- Advanced the drawer marker to `1.0.28 / W419`.
- Replaced the first-screen `Run FORGE setup` action with `Build records`.
- Replaced the visible prepared-but-unconfirmed `Confirm FORGE path` action with `Build records`.
- Added a one-click handler that prepares/confirms the build path and reuses the existing approved `submit_w144_once` adapter route.
- Kept support views collapsed and preserved.

## Boundaries
- No runner behavior changed.
- No source-pack behavior changed.
- No adapter contract changed.
- No completed-result import validation was weakened.
- No fake Open links were introduced.
- N/LLM remains advisory-only.

## Pass/Fail
| Gate | Result |
| --- | --- |
| w419-version-marker-advanced | PASS |
| w419-filecabinet-drawer-synced | PASS |
| w419-first-screen-primary-is-build-records | PASS |
| w419-first-screen-keeps-entry-and-toggles | PASS |
| w419-old-setup-confirm-actions-not-primary-path | PASS |
| w419-one-click-handler-prepares-confirms-and-submits | PASS |
| w419-existing-approved-adapter-path-preserved | PASS |
| w419-support-stays-collapsed | PASS |
| w419-authority-boundaries-preserved | PASS |
| w419-package-script-registered | PASS |

## Recommendation
Lock W419 as the local one-click Build records patch. Next step is deployment/install readiness so Tampermonkey and NetSuite actually receive `1.0.28 / W419` before the next live validation.
