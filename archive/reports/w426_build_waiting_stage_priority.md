# W426 Build Waiting Stage Priority

## Summary
W426 fixes a cockpit state-priority regression where the day-in-life header could say "Fix the build setup" while the build panel said the runner was still waiting for records.

## Fix
The drawer now treats an active runner task with no imported final records as `waiting_for_records` before considering stale blocked/fix-build signals.

## Pass/Fail
| Gate | Result |
| --- | --- |
| w426-filecabinet-drawer-synced | PASS |
| w426-waiting-priority-code-present | PASS |
| w426-active-runner-task-does-not-show-fix-build | PASS |
| w426-no-proof-or-run-claims-before-import | PASS |

## Boundaries
- No live smoke was run.
- No upload or deployment was performed.
- No runner, adapter, source-pack, Open-link, or import-validation behavior was changed.

## Recommendation
Lock W426, reinstall the drawer, and refresh the active build. If records are still waiting, the top surface should now say FORGE is building records rather than fix the build setup.
