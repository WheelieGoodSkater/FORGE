# FORGE Repo-Ready Handoff

Date: 2026-05-24

Workspace:

- `/Users/aaronsunshine/Documents/Playground/FORGE-repo-ready`

GitHub repository:

- `https://github.com/WheelieGoodSkater/FORGE`

## Current State

FORGE is a Tampermonkey-based NetSuite companion drawer for consultant-led demo creation. The current package is repo-ready and public-scrubbed for GitHub. It includes the runnable drawer, FORGE branding assets, canonical runtime contract source modules, NetSuite adapter/runner files, archived planning evidence, trace samples, reports, and validation harnesses.

The repo is intentionally not just a one-file Tampermonkey package. It includes historical contract artifacts and harnesses so future work can validate changes without re-learning the long W214-W244 path.

## Main Runtime Files

- `idb-drawer.user.js`
  - Tampermonkey drawer script to install/update.
  - Current drawer includes FORGE branding, completed-result import, real Open-link guardrails, W214-W244 operating-mode / record-role contract work, and W244 legacy slot mapping helpers.
  - W245/W246/W247/W248 add canonical display-ready import records, versioned lane-pack live-demo coaching, compact consultant story surfaces, and Review/Run story UI wiring.

- `assets/FORGE.png`
  - Original FORGE logo asset.

- `assets/forge-header-logo-cropped.png`
  - Cropped drawer header logo asset.

- `src/contracts/operatingModes.js`
- `src/contracts/recordRoles.js`
- `src/contracts/importStates.js`
- `src/contracts/netSuiteLinks.js`
- `src/contracts/runnerResultCompatibility.js`
- `src/contracts/snapshot.js`
- `src/contracts/lanePacks.js`
  - Canonical runtime contract source modules introduced so the drawer, W144 adapter, and runner can converge on the same mode/role/link language.
  - `lanePacks.js` defines the first versioned industry/sub-industry pack contract for future expansion.

- `netsuite/idb_governed_runner_adapter_w144_suitelet.js`
  - Approved W144 adapter path.
  - Do not bypass this path from the drawer.

- `netsuite/runner/scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js`
  - Current governed runner package included for continuity.

## Current Validation Commands

Run from `/Users/aaronsunshine/Documents/Playground/FORGE-repo-ready`:

```bash
npm run harness:contract-generated-legacy-slot-mapping-w244
npm run harness:canonical-import-result-normalization-w245
npm run harness:versioned-lane-pack-contract-w246
npm run harness:lane-pack-authoring-story-surface-w247
npm run harness:consultant-story-surface-ui-w248
npm run check
npm run validate
```

Current expected result:

- W244 harness passes `10/10`.
- W245 harness passes `10/10`.
- W246 harness passes `10/10`.
- W247 harness passes `9/9`.
- W248 harness passes `9/9`.
- `check` passes syntax checks for drawer, W144 adapter, runner, contract modules, W244 harness, W245 harness, W246 harness, W247 harness, and W248 harness.
- `validate` currently aliases `check`.

## Latest Completed Work

Latest completed block:

- W248: Consultant Story Surface UI Wiring And Evidence Confidence Copy

What changed:

- Wires `consultantStorySurfaceW247` into Review and Run after valid completed import.
- Shows open target, proof move, safe claim, do-not-claim guardrail, buyer-facing so what, and N/LLM advisory confidence/uncertainty.
- Keeps the story surface absent before valid import, preserving fake Open-link blocking.
- Weak evidence now shows explicit lane confirmation guidance instead of treating a fallback pack as truth.
- Normal story UI hides raw schema names, role arrays, stack traces, and admin diagnostics.
- W218 success wording and W220 recovery wording remain stable.

Important W248 helper name:

- `renderConsultantStorySurfaceW248`

W248 harness:

- `archive/tools/run_w248_consultant_story_surface_ui_harness.js`

W248 artifacts:

- `archive/reports/w248_consultant_story_surface_ui.md`
- `archive/trace_samples/w248_consultant_story_surface_ui_trace.json`

Previous completed block:

- W247: Lane Pack Authoring And Consultant Story Surface Hardening

What changed:

- Added a review-only lane-pack authoring gate for N/LLM proposed pack changes.
- Added compact consultant story surface helpers that combine W246 lane-pack truth with W245 real returned records.
- Story surface returns open target, proof move, safe claim, do-not-claim guardrail, buyer-facing so what, competitive contrast, and N/LLM confidence/uncertainty.
- Added a sample N/LLM proposed lane-pack fixture under `archive/fixtures/`; it can be validated and reviewed but cannot install itself.
- W245 import normalization now carries `consultantStorySurfaceW247` for Review/Run consumers.

Important W247 helper names:

- `reviewProposedLanePackChange`
- `consultantStorySurfaceFromLanePack`
- `reviewProposedLanePackChangeW247`
- `consultantStorySurfaceFromLanePackW247`

W247 harness:

- `archive/tools/run_w247_lane_pack_authoring_story_surface_harness.js`

W247 artifacts:

- `archive/fixtures/w247_nllm_proposed_lane_pack_fixture.json`
- `archive/reports/w247_lane_pack_authoring_story_surface.md`
- `archive/trace_samples/w247_lane_pack_authoring_story_surface_trace.json`

Previous completed block:

- W246: Versioned Lane Pack Contract For Live Demo Coaching

What changed:

- Added the first versioned lane-pack contract, `forge.lane-pack.v1`.
- Added initial packs for industrial manufacturing, equipment manufacturing, industrial distributors, CPG distributors, CPG manufacturers, food/beverage manufacturers, dealer hardgoods, apparel/style matrix, and retail availability.
- Each pack defines lane/sub-industry identity, website/category evidence, operating mode, required/optional/invalid record roles, vocabulary bounds, proof move, story anchor, ROI/so-what, competitive contrast, and N/LLM advisory limits.
- W245 import normalization now carries W246 lane-pack resolution and advisory payloads so Review/Run can coach from returned records plus structured lane truth.
- N/LLM remains advisory-only and cannot create records, write transactions, silently install truth, override website evidence, override toggles, hide uncertainty, invent verified facts, or claim measured ROI without a baseline.

Important W246 helper names in `idb-drawer.user.js`:

- `versionedLanePacksW246`
- `validateLanePackW246`
- `resolveLanePackFromEvidenceW246`
- `nllmAdvisoryPayloadForLanePackW246`
- `liveDemoCoachingFromLanePackW246`

W246 harness:

- `archive/tools/run_w246_versioned_lane_pack_contract_harness.js`

W246 artifacts:

- `archive/reports/w246_versioned_lane_pack_contract.md`
- `archive/trace_samples/w246_versioned_lane_pack_contract_trace.json`

Previous completed block:

- W245: Canonical Import Result Normalization For Live Demo Coaching

What changed:

- Added a canonical display-ready record collection for completed runner imports.
- Normalizes legacy five-record, canonical `records[]`, and mixed alias payloads.
- Preserves record name, canonical role, consultant label, NetSuite record type, numeric internal id, supported Open URL, link authority, and source confidence.
- Uses W244 helpers for safe legacy slot / canonical role interpretation.
- Wires Build/Review/Run-facing paths to use the same normalized returned records after valid import.
- Adds live-demo coaching answers: what to open, what to prove, what is safe to say, what not to claim, and buyer-facing so what.
- Preserves W237 food batch saved-result repair behavior.
- Preserves fake Open-link blocking before valid import and hides non-openable records from normal consultant UI.

Important W245 helper names in `idb-drawer.user.js`:

- `canonicalImportResultNormalizationW245`
- `displayReadyRecordsFromFinalNamingW245`
- `canonicalImportRoleW245`
- `inferNetSuiteRecordTypeW245`

W245 harness:

- `archive/tools/run_w245_canonical_import_result_normalization_harness.js`

W245 artifacts:

- `archive/reports/w245_canonical_import_result_normalization.md`
- `archive/trace_samples/w245_canonical_import_result_normalization_trace.json`

## Non-Negotiable Boundaries

Preserve these unless a future prompt explicitly changes them:

- No drawer-created records.
- No drawer transaction writes.
- No direct SuiteScript outside the approved W144 adapter path.
- Runner owns generated records.
- Image lookup disabled by default.
- N/LLM remains advisory only.
- Normal consultant UI must not show raw JSON, internal diagnostics, W144 endpoint, runner task ids, W151 language, semantic guard wording, mode contract wording, internal role arrays, stack traces, or raw guard messages.
- Open links appear only after valid completed import with numeric internal ids and supported NetSuite URLs.
- W218 frozen success wording and W220 recovery wording should remain stable unless intentionally revised.
- Do not run broad visual testing unless explicitly requested.
- Do not invoke the live runner unless explicitly requested.
- Do not update W144 deployment unless an install packet explicitly calls for it.

## Recent Product Lessons

- Website evidence should remain the primary naming authority.
- Toggles control operating-model vocabulary.
- Conversation notes should shape consultant story, ROI, objections, and run coaching, but should not override website/toggle naming authority.
- Food/ingredient/batch language requires food/batch/ingredient evidence or strong notes plus Manufacturing enabled.
- Manufacturing and WIP claims must stay honest: if records are missing, show partial/admin-debug warnings rather than pretending full support exists.
- The drawer must bring back completed runner names and real links into Build/Run once the runner returns a valid completed result.

## Recommended Next Block

```text
Move through W249: Lane Pack Expansion QA And Consultant Coaching Copy Refinement.

Goal:
Refine the lane-pack story copy and add QA coverage so consultants can trust the first expanded industry lanes in live demos without overclaiming.

Build:
- Review all W246 initial lane packs for consultant-friendly copy consistency.
- Tighten proof move, safe claim, do-not-claim, ROI/so-what, and competitive contrast wording where it sounds generic or overconfident.
- Add lane-pack QA fixtures for at least:
  - industrial manufacturing
  - equipment manufacturing
  - industrial distributors
  - CPG distributors
  - CPG manufacturers
  - food/beverage manufacturers
- Ensure each fixture produces a clean W248 story surface from W245-style returned records.
- Replace the current circular FORGE icon treatment in the drawer with the provided icon asset:
  - source file: `/Users/aaronsunshine/Downloads/FORGE ICON.png`
  - copy it into `assets/` before wiring it, do not reference the Downloads path at runtime
  - use it for the page/drawer icon wherever the UI currently shows the FORGE wordmark inside a circle
  - keep the existing header/logo assets unless the icon placement specifically needs the new asset
- Keep N/LLM advisory-only and uncertainty-visible.
- Preserve W218 success wording and W220 recovery wording.
- Preserve fake Open-link blocking before valid import.
- Keep harnesses, reports, and traces under `archive/`.
- Keep repo front clean.

Validation:
- Add archived W249 harness covering:
  - lane-pack story copy has required fields and no banned overclaims
  - each QA fixture resolves expected lane pack
  - each fixture renders W248 story surface with returned record names
  - the new FORGE icon asset is repo-local and used in the intended drawer/page icon location
  - weak/conflicting evidence remains confirmation-gated
- Run only:
  - W244 harness
  - W245 harness
  - W246 harness
  - W247 harness
  - W248 harness
  - W249 harness
  - check
  - validate

Do not run broad visual testing.
Do not invoke the runner live.
Do not update W144 deployment.

Output:
- Lane-pack copy refinements.
- Drawer/page icon update using the new repo-local FORGE icon asset.
- W249 regression harness.
- W249 report and trace.
- Visual testing decision.
- GitHub Desktop commit title and description.
- Best next Codex prompt.
```

## Install Note

For Tampermonkey install/update, use:

- `idb-drawer.user.js`

Do not update the W144 adapter, runner, SuiteScript deployment, or image lookup settings unless a future install packet explicitly says to.
