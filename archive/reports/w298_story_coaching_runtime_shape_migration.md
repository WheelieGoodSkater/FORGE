# W298 Story Coaching Runtime Shape Migration

Status: `runtime_shape_migration_ready`

## Summary

W298 executes the W297 selected micro-slice by adding a drawer-local, contract-shaped story coaching runtime helper:

- `storyCoachingRuntimeShapeW298`

The helper packages the existing W254/W255/W256/W257 story coaching outputs into a W273/W278-compatible shape while keeping the visible W248 Review/Run renderer drawer-owned.

## What Changed

- Added `storyCoachingRuntimeShapeW298` in `idb-drawer.user.js`.
- The helper assembles:
  - W254 evidence receipt
  - W255 first-glance story
  - W256 live-demo script
  - W257 guided sequence
- Updated `renderConsultantStorySurfaceW248` to consume the W298 package for those already-existing outputs.
- Exported the W298 helper through the test hook surface.

## What Stayed Drawer-Owned

- `consultantStorySurfaceFromLanePackW247`
- `storyEvidenceReceiptTrailW254`
- `consultantStoryFirstGlanceW255`
- `consultantLiveDemoScriptW256`
- `guidedDemoStepSequenceW257`
- `renderConsultantStorySurfaceW248`
- Returned-record import and Open-link authority
- W151/W214/W245 validation
- Connected submit/refresh/import
- Lane resolution
- Endpoint/profile and dataset switching

## Boundary

The W298 helper may assemble supplied story facts. It cannot:

- render UI
- change visible Review/Run copy
- mutate state
- import records
- create records
- perform transaction writes
- create Open links
- invoke the adapter
- declare W245/W151/W214 validity

## Parity Guardrails

W298 is governed by:

- `src/contracts/storyCoachingSurfaces.js`
- `src/contracts/storyCoachingBridge.js`

The W298 harness verifies field compatibility against W278 and confirms W248 visible copy, returned records, Open links, weak-evidence behavior, and runtime authority remain unchanged.

## Visual Testing Decision

Broad visual testing is not required for W298 because the visible Review/Run renderer and copy are unchanged. Harness coverage compares the rendered story surface markers and required copy.

