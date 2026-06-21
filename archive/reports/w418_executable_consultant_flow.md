# W418 Executable Consultant Flow

## Summary
W418 tightens FORGE around the consultant day-in-life path: enter customer, website, notes, and selected run options; run FORGE setup; confirm the prepared path; build records; then use one Demo Cockpit when verified records return.

This is a local/source change only. No live smoke, upload, deployment, runtime package, source-pack mutation, adapter change, runner behavior change, or record-creation behavior change was performed in W418.

## What Changed
- Advanced the drawer install marker to `1.0.27 / W418`.
- Moved New Item, Manufacturing, and WIP run options onto the initial FORGE request surface.
- Reworded the prep path from “Build demo plan” toward “Run FORGE setup,” “Confirm FORGE path,” and “Run the FORGE build.”
- Kept support views collapsed and preserved for troubleshooting instead of primary consultant navigation.
- Preserved the W415 post-run Demo Cockpit as the first completed-result surface.

## Pass/Fail
| Gate | Result |
| --- | --- |
| w418-version-and-install-marker-advanced | PASS |
| w418-root-filecabinet-drawer-synced | PASS |
| w418-runner-copies-still-synced | PASS |
| w418-first-screen-is-forge-request-not-tab-sprawl | PASS |
| w418-first-screen-includes-build-toggles | PASS |
| w418-primary-action-is-run-forge-setup | PASS |
| w418-confirm-path-language-is-forge-path | PASS |
| w418-build-stage-is-run-forge-build | PASS |
| w418-completed-state-is-one-cockpit-first | PASS |
| w418-support-and-troubleshoot-are-collapsed | PASS |
| w418-open-link-authority-preserved | PASS |
| w418-advisory-and-write-boundaries-preserved | PASS |
| w418-package-script-registered | PASS |

## Install Reality
Tampermonkey will not show this update until the published/installed userscript source receives `@version 1.0.27`. The local repo now has that marker, but W418 did not upload or deploy it.

## Recommendation
Lock W418 as the local executable consultant-flow patch. Next work should either prepare the deliberate userscript/NetSuite deployment path, or run one controlled post-install validation after the updated drawer and synchronized runner are actually installed.
