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
  - W245/W246/W247/W248/W249 add canonical display-ready import records, versioned lane-pack live-demo coaching, compact consultant story surfaces, Review/Run story UI wiring, lane-pack expansion QA, and the repo-local launcher icon update.

- `assets/FORGE.png`
  - Original FORGE logo asset.

- `assets/forge-header-logo-cropped.png`
  - Cropped drawer header logo asset.

- `assets/forge-icon.png`
  - Repo-local launcher icon asset used where the old circular FORGE wordmark button appeared.

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
npm run harness:lane-pack-expansion-qa-w249
npm run harness:lane-aware-record-label-semantics-w250
npm run harness:lane-pack-authoring-diff-review-w251
npm run harness:lane-pack-review-ui-install-smoke-w252
npm run harness:post-install-visual-acceptance-w253
npm run check
npm run validate
```

Current expected result:

- W244 harness passes `10/10`.
- W245 harness passes `10/10`.
- W246 harness passes `10/10`.
- W247 harness passes `9/9`.
- W248 harness passes `9/9`.
- W249 harness passes `12/12`.
- W250 harness passes `10/10`.
- W251 harness passes `11/11`.
- W252 harness passes `9/9`.
- W253 harness passes `9/9`.
- `check` passes syntax checks for drawer, W144 adapter, runner, contract modules, W244 harness, W245 harness, W246 harness, W247 harness, W248 harness, W249 harness, W250 harness, W251 harness, W252 harness, and W253 harness.
- `validate` currently aliases `check`.

## Latest Completed Work

Latest completed block:

- W253: Post-Install Visual Acceptance, Header Density QA, And Consultant Story Trust Polish

What changed:

- Adds a compact post-install acceptance packet for Tampermonkey update smoke checks.
- Adds Suitelet/header density QA for logo max dimensions, header spacing, close button reachability, tab reachability, and first-card visibility.
- Tightens compact Review/Run story copy so proof moves reference returned records, supported Open links, visible uncertainty, and no-write/no-created-record guardrails.
- Keeps W252 lane-pack proposal review admin-only, review-only, and non-installable.
- Keeps runtime authority unchanged: no install action, contract mutation, drawer-created records, or drawer transaction writes.

Important W253 artifacts:

- `archive/tools/run_w253_post_install_visual_acceptance_harness.js`
- `archive/reports/w253_post_install_visual_acceptance.md`
- `archive/trace_samples/w253_post_install_visual_acceptance_trace.json`

Previous completed block:

- W252: Lane Pack Review UI Wiring, Install Smoke Acceptance, And Suitelet Header Polish

What changed:

- Wires the W251 proposed lane-pack diff/review output into a compact admin-safe trace review surface.
- Shows reviewed sections for evidence, record roles, vocabulary, story/ROI/competitive copy, and N/LLM authority/uncertainty limits.
- Keeps proposals review-only with no install button, no contract mutation, no drawer-created records, and no normal consultant UI diagnostics.
- Adds an install smoke acceptance checklist for launcher icon visibility, click target/position, Review/Run story gating, returned names and lane-aware labels, weak-evidence confirmation, and compact Suitelet/header balance.
- Reduces the FORGE header logo size so it stays crisp and recognizable without dominating the first viewport.

Important W252 artifacts:

- `archive/tools/run_w252_lane_pack_review_ui_install_smoke_harness.js`
- `archive/reports/w252_lane_pack_review_ui_install_smoke_acceptance.md`
- `archive/trace_samples/w252_lane_pack_review_ui_install_smoke_trace.json`

Previous completed block:

- W251: Lane Pack Authoring Diff Review, N/LLM Draft Intake Hardening, And Launcher Icon Visibility Polish

What changed:

- Adds structured lane-pack proposed-change diff review for N/LLM-drafted packs.
- Shows changed website evidence, roles, vocabulary, live-demo story fields, and N/LLM advisory limits.
- Keeps proposed packs review-only and non-installable until a human-reviewed contract source change is made.
- Rejects proposals that try to grant write authority, allow creation, hide uncertainty, auto-install, or make guaranteed/measured ROI claims.
- Polishes the launcher icon visibility at standard zoom while preserving the 48px click target and position.
- Keeps N/LLM advisory-only, uncertainty-visible, and confirmation-gated when evidence is weak.

Important W251 artifacts:

- `archive/fixtures/w251_lane_pack_diff_review_fixture.json`
- `archive/tools/run_w251_lane_pack_authoring_diff_review_harness.js`
- `archive/reports/w251_lane_pack_authoring_diff_review.md`
- `archive/trace_samples/w251_lane_pack_authoring_diff_review_trace.json`

Previous completed block:

- W250: Lane-Aware Record Label Semantics And Install-Ready Visual Smoke Packet

Important W250 artifacts:

- `archive/tools/run_w250_lane_aware_record_label_semantics_harness.js`
- `archive/reports/w250_lane_aware_record_label_semantics.md`
- `archive/reports/w250_install_ready_visual_smoke_packet.md`
- `archive/trace_samples/w250_lane_aware_record_label_semantics_trace.json`

Previous completed block:

- W249: Lane Pack Expansion QA, Consultant Copy Refinement, And FORGE Icon Update

Important W249 artifacts:

- `archive/fixtures/w249_lane_pack_expansion_qa_fixtures.json`
- `archive/tools/run_w249_lane_pack_expansion_qa_harness.js`
- `archive/reports/w249_lane_pack_expansion_qa.md`
- `archive/trace_samples/w249_lane_pack_expansion_qa_trace.json`

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
W254: Evidence Receipt Trail For Consultant Story Trust And Lane Expansion

Goal:
Make the compact Review/Run story surface more trustworthy by attaching a concise evidence receipt trail that explains why the lane, proof move, safe claim, and uncertainty state are safe to use without exposing raw diagnostics.

Build:
- Add a compact evidence receipt model for the W248/W253 consultant story surface.
- Include consultant-safe receipt rows for:
  - resolved lane pack and confidence
  - website/domain/category evidence used
  - returned record name and lane-aware label used as the Open target
  - conversation-note contribution to pain/value/ROI framing
  - N/LLM advisory role and hard limits
  - uncertainty or confirmation gate when evidence is weak/conflicting
- Render the receipt as a small expandable consultant-facing section after valid import.
- Keep the receipt buyer-facing and readable; do not show raw JSON, stack traces, internal arrays, contract schema names, runner task ids, or admin diagnostics.
- Add receipt coverage for industrial manufacturing, equipment manufacturing, industrial distributors, CPG distributors, CPG manufacturers, and food/beverage manufacturers.
- Keep lane-pack expansion future-friendly: receipts should come from structured lane-pack/normalization data, not scattered hardcoded story strings.
- Keep W252 proposal review admin-only and W253 acceptance packet review-only.
- Keep N/LLM advisory-only and uncertainty-visible.
- Preserve W218 success wording and W220 recovery wording.
- Preserve fake Open-link blocking before valid import.
- Keep harnesses, reports, and traces under `archive/`.
- Keep repo front clean.

Validation:
- Add archived W254 harness covering:
  - evidence receipt has all required consultant-safe rows
  - receipt renders only after valid import
  - receipt uses returned record names and lane-aware labels
  - receipt covers the six priority industry lanes
  - normal UI hides raw diagnostics and admin-only proposal review
  - N/LLM remains advisory-only with hard limits visible
  - weak/conflicting evidence remains confirmation-gated
- Run W244 through W254 harnesses, check, and validate.

Output:
- Summary of evidence receipt model/UI, lane coverage, trust guardrails, and validation.
- Validation results.
- Visual testing decision.
- GitHub Desktop commit title and description.
- Next optimized prompt.
```

## Install Note

For Tampermonkey install/update, use:

- `idb-drawer.user.js`

Do not update the W144 adapter, runner, SuiteScript deployment, or image lookup settings unless a future install packet explicitly says to.
