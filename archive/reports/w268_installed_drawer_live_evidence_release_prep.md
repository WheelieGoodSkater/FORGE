# W268 Installed Drawer Live Evidence Intake, Release Keep Packet, And Code Review Prep

## Summary

W268 adds the review-only intake layer for user-provided installed-drawer Motion screenshots and notes. It maps evidence into the W267 screenshot/Open-link signoff fields, creates a compact V1.0.0 release keep packet, and prepares the next code-review phase without refactoring runtime logic.

## Installed Drawer Evidence Intake

The intake template captures:

- Build records clicked
- Build submitted state
- Refresh build status state
- Records ready / Finish build state
- returned record names and lane-aware labels
- supported Open links after valid import
- Review/Run story surfaces
- uncertainty/weak-evidence visibility
- hidden admin/raw diagnostics

## V1.0.0 Release Keep Packet

The release packet summarizes:

- install target
- adapter profile used
- Motion run outcome
- returned records and Open-link verification
- story-surface readiness
- needs-attention UI polish
- keep/needs-attention/rollback decision

## Code Review Prep Inventory

The inventory calls out:

- oversized helper areas in `idb-drawer.user.js`
- candidate extraction points into `src/contracts/`
- duplicated fixture/setup patterns in archived harnesses
- normal consultant UI surfaces to keep stable
- runtime authority boundaries that must not move

## Guardrails

- Review-only under `archive/`.
- No external uploads.
- No network calls.
- No tracking calls.
- No local storage writes.
- No install actions.
- No runtime dependencies.
- No drawer-created records.
- No drawer transaction writes.
- No W144 deployment update.
