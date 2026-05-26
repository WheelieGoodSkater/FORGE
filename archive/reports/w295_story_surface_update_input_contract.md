# W295 Story Surface Update Input Contract

Status: contract-ready, extraction-only.

## Purpose

W295 adds a focused contract for the data that feeds the Review/Run story surfaces after a valid returned-record import. It describes whether W254 receipt inputs, W255 first-glance inputs, W256 live-demo script inputs, and W257 guided sequence inputs are ready without changing visible Review/Run UI, story copy, rendering, import mutation, connected build behavior, endpoint behavior, dataset switching, or runtime authority.

## Contract Module

- `src/contracts/storySurfaceUpdateInputs.js`
- Schema: `forge.w295.story-surface-update-inputs.v1`
- Future bridge: `src/contracts/storySurfaceUpdateInputBridge.js`

## Represented Inputs

- W245/W293 returned record facts used by story surfaces
- W246 resolved lane pack and confidence
- W250 lane-aware label source
- Supported Open-link authority
- W254 receipt input rows
- W255 first-glance input fields
- W256 live-demo script input fields
- W257 guided sequence input fields
- Weak/conflicting evidence confirmation state
- N/LLM advisory-only limits and uncertainty visibility

## Statuses

- `story_update_inputs_ready`
- `story_update_inputs_waiting_for_valid_import`
- `story_update_inputs_need_lane_confirmation`
- `story_update_inputs_blocked_missing_open_target`
- `story_update_inputs_blocked_hidden_uncertainty`

## Boundaries

The contract consumes supplied facts only. It does not validate W151/W214/W245 payloads, render UI, change visible story copy, mutate state, import records, create records, write transactions, create Open links, invoke the adapter, or declare import validity.

Drawer-owned surfaces remain drawer-owned:

- `consultantStorySurfaceFromLanePackW247`
- `storyEvidenceReceiptTrailW254`
- `consultantStoryFirstGlanceW255`
- `consultantLiveDemoScriptW256`
- `guidedDemoStepSequenceW257`
- `renderConsultantStorySurfaceW248`

## Continuity

W295 preserves W294 returned-record import closure/story update readiness, W293 returned-record runtime shape migration, W292 bridge parity, W264/W265 connected build behavior, W245/W151/W214 validation, W218/W220 wording, W250 lane-aware labels, fake Open-link blocking, N/LLM advisory-only behavior, and uncertainty visibility.

## Next

W296 should add a behavior-preserving bridge between drawer-produced story surface update-input facts and this W295 contract, still without wiring the bridge into `idb-drawer.user.js` runtime.
