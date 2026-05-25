# W273 Story Surface Receipt Script Sequence Contract

Status: complete

## Summary

W273 adds a focused consultant-safe story coaching contract module at `src/contracts/storyCoachingSurfaces.js`.

The module mirrors stable shapes from:

- W254 evidence receipt rows and receipt visibility rules
- W255 first-glance consultant story
- W256 live-demo script
- W257 guided demo sequence and objection-safe response

## Contract Helpers

- Contract shape matcher for W254/W255/W256/W257 story outputs
- Consultant-safe guardrail checker for record-creation, drawer-write, measured/guaranteed ROI, unsupported lane-fit, hidden-uncertainty, and missing advisory-only claims
- Receipt visibility helper for valid-import gating
- Exported contract summary for future extraction work

## Behavior Boundary

Runtime behavior unchanged. `idb-drawer.user.js` still owns the current consultant UI, Review/Run rendering, story density, connected build behavior, and weak-evidence confirmation behavior. The new module is a parity-backed extraction point only.

## Guardrails

- Story output remains sourced from W245 returned records, W246 lane packs, W254 receipt data, and W255 first-glance data.
- Returned record names, lane-aware labels, and supported Open-link authority stay visible in story surfaces after valid import.
- Weak or conflicting evidence remains confirmation-first.
- N/LLM remains advisory-only and uncertainty-visible.
- No drawer-created records are introduced.
- No drawer transaction writes are introduced.
- No connected submit/refresh/import behavior is changed.

## Validation

- W273 harness added at `archive/tools/run_w273_story_coaching_contract_harness.js`.
- Harness uses W270 shared archived fixture utilities.
- Harness validates W254/W255/W256/W257 shape parity, story guardrail rejection, valid-import returned-record continuity, weak-evidence confirmation, W272 contract availability, W264 import continuity, and no runtime authority changes.
