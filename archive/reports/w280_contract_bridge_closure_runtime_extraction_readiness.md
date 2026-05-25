# W280 Contract Bridge Closure Map And Runtime Extraction Readiness Packet

## Purpose

W280 closes the W276-W279 bridge phase by mapping the behavior-preserving bridge modules back to the runtime/helper areas they protect, then selecting the first narrow runtime extraction readiness slice.

This block is review-only. It does not change `idb-drawer.user.js`, normal consultant UI, connected submit/refresh/import, lane resolution, endpoint behavior, dataset switching, or record creation authority.

## Bridge Closure Map

This W276-W279 bridge closure map is the review fence for the current bridge phase.

| Bridge | Source surface protected | Governing contract | Parity harnesses | Consultant UI unchanged | Runtime authority unchanged | Rollback boundary |
| --- | --- | --- | --- | --- | --- | --- |
| W276 review-only live evidence/signoff bridge | W260/W261/W266/W267/W268 release, smoke, live evidence, screenshot/Open-link, and keep/rollback packet helpers | `src/contracts/liveEvidencePackets.js` | W260, W261, W266, W267, W268, W272, W276 | Normal UI hides raw evidence, task ids, endpoint data, and admin diagnostics | Connected submit/refresh/import and retry safety unchanged; no drawer-created records or drawer transaction writes | Restore drawer-local review-only packet helpers and leave W272 as contract mirror |
| W277 admin-only lane-pack review bridge | W247/W251/W252/W255 authoring review, proposed diff, admin review, and receipt-driven QA helpers | `src/contracts/lanePackExpansionWorkflow.js` | W247, W251, W252, W255, W274, W277 | Normal UI hides raw proposals, diffs, admin diagnostics, and install actions | No proposed-pack install, no lane resolution change, no write authority | Restore drawer/source review helpers and keep source packs in `src/contracts/lanePacks.js` |
| W278 story coaching surface bridge | W254 receipt, W255 first-glance story, W256 live script, and W257 guided sequence helpers | `src/contracts/storyCoachingSurfaces.js` | W254, W255, W256, W257, W273, W278 | Review/Run visible copy, density, returned names, labels, and Open-link authority unchanged | Connected submit/refresh/import unchanged; no story claims create records or write transactions | Restore drawer-owned story helpers and rerun W254-W258 plus W273/W278 |
| W279 adapter profile/readiness bridge | W262 readiness states, W263 adapter profile, endpoint derivation, dataset switching, and readiness trace/export helpers | `src/contracts/adapterProfiles.js` | W262, W263, W264, W265, W271, W279 | Build tab copy/buttons/layout unchanged and endpoint/profile setup hidden | W144 profile values, endpoint path, script/deploy ids, submit/refresh/import, and retry safety unchanged | Restore drawer-owned W262/W263 helper implementations and keep W271 as contract mirror |

## Selected Runtime Extraction Readiness Slice

Selected slice: `adapter_profile_readiness_contract_migration_prepare`

Do not perform the selected runtime extraction in W280; this packet only prepares the next slice.

Why this is the next safe slice:

- W279 has already proven adapter profile/readiness parity against `src/contracts/adapterProfiles.js`.
- The candidate is narrower than connected submit/refresh/import.
- It can begin by replacing duplicated profile/readiness shape logic with contract-backed helpers while preserving the actual submit, poll, import, and UI rendering paths.
- It supports the user's future goal of easy dataset/account switching without making endpoint values consultant-facing.

## Selected Slice Definition

- Source anchors to inspect:
  - `releasedAdapterProfileW263`
  - `adapterProfileEndpointW263`
  - `adapterProfilesFromConfigW263`
  - `selectedAdapterProfileW263`
  - `applySelectedAdapterProfileToConfigW263`
  - `adapterReadyRecordCreationUxW262`
  - `deployedAdapterReadinessTraceW263`
- Target contract/bridge module:
  - `src/contracts/adapterProfiles.js`
  - `src/contracts/adapterReadinessBridge.js`
- Expected parity behavior:
  - Released W144 profile values remain identical.
  - Endpoint still derives from selected account host plus `/app/site/hosting/scriptlet.nl?script=6702&deploy=2`.
  - Future account host swap remains data-driven.
  - W262 readiness states remain identical for preview-only, ready, submitted, waiting, records-ready, and imported states.
  - Normal consultant UI still hides endpoint/profile/admin diagnostics.
  - Connected W264 submit/refresh/import and W265 retry safety remain unchanged.
- Harnesses that must pass:
  - W262
  - W263
  - W264
  - W265
  - W271
  - W279
  - W280
  - W244-W280 full sweep
  - `npm run check`
  - `npm run validate`
- Manual review notes:
  - Do not touch the actual W144 endpoint values.
  - Do not move connected submit/refresh/import in the same block.
  - Do not show endpoint/profile configuration in normal consultant UI.
  - Treat dataset switching as profile data, not scattered runtime string replacement.
- Rollback plan:
  - Restore drawer-owned W262/W263 adapter profile/readiness helpers.
  - Keep `src/contracts/adapterProfiles.js` and `src/contracts/adapterReadinessBridge.js` as mirrors.
  - Rerun W262, W263, W264, W265, W271, W279, W280, check, and validate.

## Guardrails

- Runtime behavior unchanged.
- Normal consultant UI unchanged.
- Build tab copy/buttons/layout unchanged.
- Connected build flow unchanged.
- W265 retry safety unchanged.
- Returned record import unchanged.
- Lane resolution unchanged.
- Adapter endpoint/profile behavior unchanged.
- Dataset/account switching behavior unchanged.
- Record creation authority unchanged.
- No drawer-created records.
- No drawer transaction writes.
- No W144 deployment update.
- N/LLM remains advisory-only and uncertainty-visible.
- Weak/conflicting evidence remains confirmation-first.

## Visual Testing Decision

No broad visual regression pass is required for W280 because this block adds archived closure/readiness artifacts and harness coverage only. It does not change visible consultant UI.
