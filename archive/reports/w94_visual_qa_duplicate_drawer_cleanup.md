# W94 Visual QA And Duplicate Drawer Cleanup

Generated: 2026-05-17T21:41:05.542Z

Decision: PASS / ONE ACTIVE DRAWER GUARANTEE READY

## Visual QA Results

- Initial shell: drawers=1, rails=1, styles=1.
- Duplicate injected smoke: duplicateDetected=true.
- Cleanup result: oneActiveRoot=true, duplicateDetected=false.
- Drawer width remains constrained by `--idb-drawer-width: min(410px, calc(100vw - 24px))`.
- W93 compressed Plan/Review/Run/Trace surfaces remain the expected first-viewport contract.

## Screenshots Checklist

- Only one IDB launcher button is visible.
- Only one IDB drawer root exists in the DOM.
- Drawer width is constrained by --idb-drawer-width and never exceeds calc(100vw - 24px).
- Plan first viewport shows prospect, classification, confidence, DCC pack, and one primary action.
- Review first viewport shows DCC handoff export, pack/scenario, DCC-prepared objects, blockers, and export.
- Run first viewport shows Say, Show, and Close before controls or guardrails.
- Trace first viewport shows export actions, evidence checklist, and reset controls only.

## Validator Gates

| Gate | Result | Detail |
| --- | --- | --- |
| w94_runtime_shell_diagnostics_exposed | PASS | diagnostic hooks |
| w94_initial_one_active_shell | PASS | {"schema":"idb.w94-shell-diagnostics.v1","runtimeInstanceId":"idb-1779054065507-2i1lng","activeRuntimeInstance":"idb-1779054065507-2i1lng","drawerCount":1,"railCount":1,"styleCount":1,"ownedDrawerCount":1,"ownedRailCount":1,"ownedStyleCount":1,"duplicateDetected":false,"oneActiveRoot":true} |
| w94_duplicate_detected_before_watchdog | PASS | {"schema":"idb.w94-shell-diagnostics.v1","runtimeInstanceId":"idb-1779054065507-2i1lng","activeRuntimeInstance":"idb-1779054065507-2i1lng","drawerCount":2,"railCount":2,"styleCount":2,"ownedDrawerCount":1,"ownedRailCount":1,"ownedStyleCount":1,"duplicateDetected":true,"oneActiveRoot":false} |
| w94_watchdog_restores_one_active_shell | PASS | {"schema":"idb.w94-shell-diagnostics.v1","runtimeInstanceId":"idb-1779054065507-2i1lng","activeRuntimeInstance":"idb-1779054065507-2i1lng","drawerCount":1,"railCount":1,"styleCount":1,"ownedDrawerCount":1,"ownedRailCount":1,"ownedStyleCount":1,"duplicateDetected":false,"oneActiveRoot":true} |
| w94_shell_markers_and_cleanup_selectors_present | PASS | owned shell markers and stale install selectors |
| w94_width_and_position_constraints_present | PASS | drawer width/position constraints |
| w94_plan_first_viewport_compressed | PASS | Plan first viewport compression |
| w94_no_regression_guards_present | PASS | no-write, advisory-only, DCC ownership |

## Best Next Codex Prompt

Move through W95: Hands-On Retest Packet After Visual Cleanup. Use the W94 one-active-drawer guarantee and W93 compressed UI to produce the exact next user test: file to upload, realistic sales request fields, expected first-viewport screenshots for Plan/Review/Run/Trace, required DCC handoff JSON, required trace JSON, operator comparison checklist, scoring rubric, and stop/go criteria. Preserve W92 state authority, no IDB writes, no SuiteScript invocation, no transaction writes, hosted resolver optional until remoteSmokeExecuted=true, notes story-only, consultant confirmation required, and DCC ownership of object generation. Output the retest packet, validator gates, W95 report, and best next Codex prompt.
