# FORGE Repo-Ready Handoff

Date: 2026-05-25

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
  - W250-W265 harden lane-aware labels, review-only lane-pack proposal intake, visual acceptance packets, evidence receipts, receipt-driven QA, live-demo script coaching, guided objection-safe demo sequencing, compact story density, SCOUT-style header polish, a safe feedback placeholder contract, an install-ready release packet, post-install evidence/signoff flow, V1.0.0 real-build path clarity, the saved released W144 adapter profile for connected build readiness, the connected submit/refresh/import flow, and live adapter response-shape/retry safety.

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
npm run harness:evidence-receipt-trail-w254
npm run harness:receipt-driven-lane-expansion-qa-w255
npm run harness:consultant-live-demo-script-w256
npm run harness:guided-demo-step-sequence-w257
npm run harness:story-density-header-polish-w258
npm run harness:header-feedback-placeholder-visual-acceptance-w259
npm run harness:install-ready-release-packet-w260
npm run harness:post-install-smoke-evidence-capture-w261
npm run harness:real-build-path-clarity-w262
npm run harness:deployed-adapter-profile-readiness-trace-w263
npm run harness:connected-build-submit-refresh-import-w264
npm run harness:live-adapter-smoke-retry-safety-w265
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
- W254 harness passes `8/8`.
- W255 harness passes `8/8`.
- W256 harness passes `9/9`.
- W257 harness passes `9/9`.
- W258 harness passes `13/13`.
- W259 harness passes `11/11`.
- W260 harness passes `10/10`.
- W261 harness passes `14/14`.
- W262 harness passes `11/11`.
- W263 harness passes `12/12`.
- W264 harness passes `15/15`.
- W265 harness passes `11/11`.
- `check` passes syntax checks for drawer, W144 adapter, runner, contract modules, W244 harness, W245 harness, W246 harness, W247 harness, W248 harness, W249 harness, W250 harness, W251 harness, W252 harness, W253 harness, W254 harness, W255 harness, W256 harness, W257 harness, W258 harness, W259 harness, W260 harness, W261 harness, W262 harness, W263 harness, W264 harness, and W265 harness.
- `validate` currently aliases `check`.

## Latest Completed Work

Latest completed block:

- W265: Live Adapter Smoke Evidence, Result Shape Reconciliation, And Retry Safety

What changed:

- Adds a W265 response-shape normalizer for actual/fixture submit and refresh aliases without weakening W245/W151 completed-result import validation.
- Extends approved adapter response normalization to recognize common task/result aliases such as `task.id`, `runnerTask.id`, `runner_task_id`, `queueTaskId`, `completedResultJson`, `generatedNamesJson`, and nested `resultCapture.finalGeneratedNamesJson`.
- Adds a live adapter smoke evidence packet that captures submit shape, pending refresh shape, completed refresh shape, malformed/error shape, raw-evidence archive policy, and consultant-safe status copy.
- Adds retry safety policy: duplicate submit reuses the existing captured build and refresh path, retry after adapter error requires a new explicit action, refresh may repeat while pending, and Finish build requires a W151-valid completed result.
- Keeps raw response evidence archived/admin-only and hidden from normal consultant UI.
- Preserves W264 connected submit/refresh/import, no drawer-created records, no drawer transaction writes, and no W144 deployment update.

Important W265 artifacts:

- `archive/tools/run_w265_live_adapter_smoke_retry_safety_harness.js`
- `archive/reports/w265_live_adapter_smoke_retry_safety.md`
- `archive/trace_samples/w265_live_adapter_smoke_retry_safety_trace.json`

Previous completed block:

- W264: Connected Build Submit, Runner Refresh, And Completed Import

What changed:

- Connects the normal `Build records` path to the selected released W144 adapter profile when W262 readiness is `ready_to_build_records`.
- Submits through the saved adapter profile endpoint with the `script=6702&deploy=2` path and preserves one idempotency token per confirmed request.
- Captures adapter response status, runnerTaskId, result capture status, idempotency token, and adapter-safe error state.
- Shows consultant-safe `Build submitted` / `Refresh build status` flow after submit, without raw runner/admin diagnostics in normal UI.
- Polls the approved adapter result-capture path and shows `Finish build` only after completed result JSON passes W245/W151 validation.
- Imports returned display-ready records on `Finish build`, then updates Review/Run with returned names, lane-aware labels, supported Open links, W258 CTA, W256 script, W257 sequence, and W254 receipt.
- Keeps Motion distribution records labeled as Product SKU / availability proof instead of manufacturing-flavored Finished/Assembly labels.
- Adapter errors and invalid completed results stop safely with W220-style recovery, no fake Open links, and no mutation of returned records.
- Preserves no drawer-created records, no drawer transaction writes, and the approved W144/server-adapter-only record creation boundary.

Important W264 artifacts:

- `archive/tools/run_w264_connected_build_submit_refresh_import_harness.js`
- `archive/reports/w264_connected_build_submit_refresh_import.md`
- `archive/trace_samples/w264_connected_build_submit_refresh_import_trace.json`

Previous completed block:

- W263: Deployed Adapter Profile, Dataset Switching, And Readiness Trace

What changed:

- Adds a saved released W144 governed runner adapter profile for `customdeployidb_governed_runner_adapter`.
- Stores the current account host, Suitelet path, script/deploy ids, deployment status, deployed flag, execute-as-role mode, log level, allowlist, adapter approval flags, and production build mode flag.
- Represents the released endpoint as account host plus path so future datasets/accounts can swap hosts without changing runtime logic.
- Applies the selected released profile to W262 readiness so missing endpoint remains preview-only, while a released profile with all gates true becomes `ready_to_build_records`.
- Keeps endpoint/profile setup hidden from normal consultant UI.
- Adds W262 readiness, selected profile, endpoint configuration, script/deploy ids, blockers, and Motion run observations into Trace/export.
- Captures Motion observations from the current run: industrial distribution confirmed, manufacturing off, WIP off, previous blocker was missing endpoint, no runner task captured, and no completed result imported.
- Preserves no drawer-created records, no drawer transaction writes, and the approved W144/server-adapter-only record creation boundary.

Released adapter profile:

- Script: `IDB W144 Customer Proof Pilot Suitelet`
- Title: `IDB W24 Customer Proof Pilot Suitelet`
- Deployment script id: `customdeployidb_governed_runner_adapter`
- Status: `Released`
- Deployed: `true`
- Execute as role: `Current Role`
- Log level: `Error`
- Suitelet path: `/app/site/hosting/scriptlet.nl?script=6702&deploy=2`
- Current endpoint: `https://td3021666.app.netsuite.com/app/site/hosting/scriptlet.nl?script=6702&deploy=2`

Important W263 artifacts:

- `archive/tools/run_w263_deployed_adapter_profile_readiness_trace_harness.js`
- `archive/reports/w263_deployed_adapter_profile_readiness_trace.md`
- `archive/trace_samples/w263_deployed_adapter_profile_readiness_trace.json`

Previous completed block:

- W262: V1.0.0 Release UX, Real Build Path Clarity, And Adapter-Ready Record Creation

What changed:

- Stabilizes the visible FORGE release/version display as `V1.0.0`.
- Adds `adapterReadyRecordCreationUxW262` to separate preview-only smoke mode from real adapter-ready record creation.
- Keeps the normal consultant Build path to name, website, notes, toggles, `Build records`, `Refresh build status`, `Finish build`, then Review/Run returned names and Open links.
- Shows the real `Build records` action only when the approved server adapter path is ready.
- Replaces internal normal-UI language like blocked server adapter, operator gate, server flags, transport boundary, no submit, and invocation diagnostics with consultant-safe preview/build copy.
- Preserves W245 canonical import normalization, W218 success wording, W220 recovery wording, fake-link blocking, W260 install-only packet, and W261 smoke signoff.

Important W262 artifacts:

- `archive/tools/run_w262_real_build_path_clarity_harness.js`
- `archive/reports/w262_real_build_path_clarity.md`
- `archive/trace_samples/w262_real_build_path_clarity_trace.json`

Previous completed block:

- W261: Post-Install Smoke Evidence Capture And Release Signoff

What changed:

- Adds `postInstallSmokeEvidenceCaptureTemplateW261` for local pass/fail/note capture after the W260 Tampermonkey smoke.
- Adds `releaseSignoffFromEvidenceW261` to classify captured evidence as `ready_to_keep`, `needs_attention`, or `rollback_recommended`.
- Treats install target and runtime authority boundaries as rollback-critical.
- Keeps evidence capture review-only with no upload, external URL, network call, tracking call, local storage write, install action, or runtime dependency.
- Preserves W260 install-only packet purpose, W259 feedback placeholder no-op behavior, W218/W220 wording, fake-link blocking, weak-evidence confirmation, and W255-W257 lane/story continuity.

Important W261 artifacts:

- `archive/tools/run_w261_post_install_smoke_evidence_capture_harness.js`
- `archive/reports/w261_post_install_smoke_evidence_capture.md`
- `archive/trace_samples/w261_post_install_smoke_evidence_capture_trace.json`

Previous completed block:

- W260: Install-Ready Release Packet And Consultant Smoke Script

What changed:

- Adds `consultantAdminSmokeScriptW260` and `installReadyReleasePacketW260` to make the Tampermonkey update path explicit and reviewable.
- Release packet says to update/install `idb-drawer.user.js` only.
- Release packet explicitly says not to update W144 adapter, runner, SuiteScript deployment, image lookup settings, or lane-pack contract source.
- Smoke script covers launcher open, compact FORGE header, safe `Bug / Enhancement` placeholder, fake-link blocking before import, valid returned record names/labels/Open links, W258 `Live proof CTA`, W256/W257/W254 expandable coaching/receipt, weak-evidence confirmation, and rollback.
- Keeps no live runner invocation, no drawer-created records, no drawer transaction writes, no W144 deployment update, and no feedback URL/network/storage/install action.

Important W260 artifacts:

- `archive/tools/run_w260_install_ready_release_packet_harness.js`
- `archive/reports/w260_install_ready_release_packet.md`
- `archive/trace_samples/w260_install_ready_release_packet_trace.json`

Previous completed block:

- W259: Header Feedback Placeholder Contract And Visual Acceptance Packet

What changed:

- Adds `feedbackPlaceholderContractW259`, `feedbackPlaceholderActionW259`, and `visualAcceptancePacketW259` to make the header `Bug / Enhancement` entry point reviewable and future-ready.
- Wires the header button with safe placeholder metadata: `data-idb-feedback-placeholder="w259"`, accessible label/title, and `aria-disabled="true"`.
- Keeps the button a no-op until a future human-reviewed URL is provided; no external URL, fetch, tracking, local storage write, install action, or runtime dependency is introduced.
- Adds a compact visual acceptance packet covering header logo readability, version placement, feedback placeholder visibility, close button reachability, tabs/first-card reachability, W258 `Live proof CTA` density, W256/W257 expandable coaching, and W254 receipt placement.
- Keeps W248/W255/W256/W257 story hierarchy compact and preserves no-write/no-runner/no-W144 runtime authority boundaries.

Important W259 artifacts:

- `archive/tools/run_w259_header_feedback_placeholder_visual_acceptance_harness.js`
- `archive/reports/w259_header_feedback_placeholder_visual_acceptance.md`
- `archive/trace_samples/w259_header_feedback_placeholder_visual_acceptance_trace.json`

Previous completed block:

- W258: Consultant Story Surface Density Pass And FORGE Assistant Header Polish

What changed:

- Compresses the Review/Run story surface into a first-glance `Live proof CTA` with open target, proof action, safe claim, stop guardrail, and evidence confidence.
- Keeps W256 `Say this live` and W257 `Guided demo sequence` available behind expandable sections so the normal consultant view does not feel like duplicate coaching text.
- Keeps the W254 evidence receipt expandable below the coaching surface and preserves returned record names, lane-aware labels, supported Open-link authority, and weak-evidence confirmation gates.
- Polishes the FORGE assistant header into a compact SCOUT-style top bar with the FORGE logo on the left, running version to the right, a warm yellow `Bug / Enhancement` placeholder button, and the close button balanced on the right.
- Shrinks the header logo to `188px` wide / `58px` max-height and updates W253 density QA defaults to match the new compact header.
- Updates W248-W253 compatibility harness expectations so older acceptance checks validate the new W258 UI without weakening no-diagnostics, no-install, no-write, or no-overclaim guardrails.

Important W258 artifacts:

- `archive/tools/run_w258_story_surface_density_header_polish_harness.js`
- `archive/reports/w258_story_surface_density_header_polish.md`
- `archive/trace_samples/w258_story_surface_density_header_polish_trace.json`

Previous completed block:

- W257: Guided Demo Step Sequencing And Objection-Safe Talk Track QA

What changed:

- Adds a compact guided demo sequence helper sourced from W245 returned records, W246 lane packs, W254 receipts, W255 first-glance story data, and W256 live-demo script lines.
- Renders an expandable `Guided demo sequence` block near the W256 script in Review/Run after valid import.
- Sequence covers three live steps: frame the buyer problem, open the returned record, and prove the value/so-what.
- Adds a likely buyer objection, safe objection response, stop condition, and uncertainty response.
- Keeps responses short enough for live use and blocks invented facts, record-creation claims, write-action claims, measured ROI, guaranteed outcomes, and unsupported lane-fit claims.
- Keeps W256 script, W254 evidence receipt, and W255 receipt-driven QA available.

Important W257 artifacts:

- `archive/tools/run_w257_guided_demo_step_sequence_harness.js`
- `archive/reports/w257_guided_demo_step_sequence.md`
- `archive/trace_samples/w257_guided_demo_step_sequence_trace.json`

Previous completed block:

- W256: Consultant Live Demo Script From Receipt Evidence And Returned Records

What changed:

- Adds a compact live-demo script helper sourced from W245 returned records, W246 lane-pack coaching, W254 evidence receipts, and W255 first-glance story data.
- Renders a `Say this live` consultant block in Review/Run after valid import.
- Script covers opening line, what to open, what to prove, safe buyer-facing claim, value/so-what line, stop/guardrail line, and uncertainty line.
- Keeps the script short, consultant-facing, and grounded in returned record names and lane-aware labels.
- Prevents record-creation, write-action, measured ROI, guaranteed-outcome, and unsupported lane-fit claims while preserving explicit stop guidance.
- Keeps the full W254 evidence receipt expandable below the script and keeps W255 receipt-driven lane QA available.

Important W256 artifacts:

- `archive/tools/run_w256_consultant_live_demo_script_harness.js`
- `archive/reports/w256_consultant_live_demo_script.md`
- `archive/trace_samples/w256_consultant_live_demo_script_trace.json`

Previous completed block:

- W255: Receipt-Driven Lane Expansion QA And Consultant Story Compression

What changed:

- Adds receipt-driven lane expansion QA that validates whether a lane/story receipt explains lane choice, Open target, proof evidence, notes contribution, N/LLM limits, and uncertainty.
- Adds a compressed first-glance story model for Open target, prove move, safe claim, do-not-claim guardrail, receipt summary, and next action.
- Updates the Review/Run story surface with compact receipt and next-action chips while keeping the full W254 receipt expandable.
- Adds a W255 proposed lane-pack fixture that remains N/LLM advisory, review-only, and non-installable.
- Keeps W252 proposal review admin-only, W253 acceptance packet review-only, and W254 receipt consultant-safe.

Important W255 artifacts:

- `archive/fixtures/w255_proposed_lane_pack_receipt_fixture.json`
- `archive/tools/run_w255_receipt_driven_lane_expansion_qa_harness.js`
- `archive/reports/w255_receipt_driven_lane_expansion_qa.md`
- `archive/trace_samples/w255_receipt_driven_lane_expansion_qa_trace.json`

Previous completed block:

- W254: Evidence Receipt Trail For Consultant Story Trust And Lane Expansion

What changed:

- Adds a compact evidence receipt trail to the consultant Review/Run story surface after valid import.
- Receipt rows explain lane confidence, website/category evidence, returned Open target, conversation-note role, N/LLM advisory limits, and uncertainty gate.
- Receipt content is generated from structured lane-pack resolution, W245 normalized returned records, website evidence, and N/LLM advisory metadata.
- Covers industrial manufacturing, equipment manufacturing, industrial distributors, CPG distributors, CPG manufacturers, and food/beverage manufacturers.
- Tightens weak/medium lane evidence so it stays confirmation-gated unless a lane pack is explicitly supplied by the completed import path.

Important W254 artifacts:

- `archive/tools/run_w254_evidence_receipt_trail_harness.js`
- `archive/reports/w254_evidence_receipt_trail.md`
- `archive/trace_samples/w254_evidence_receipt_trail_trace.json`

Previous completed block:

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
W266: Controlled Live Build Run Evidence And Result Import QA

Goal:
Use the W265 response-shape and retry safety layer to guide one controlled live Motion-style build run, capture the actual submit/refresh/import evidence, and reconcile any real W144 response differences while keeping consultant UI simple and runtime authority unchanged.

Build:
- Add a controlled live build run evidence packet for one Motion Industries run through the released W144 profile.
- Use the normal consultant workflow only:
  - prospect name
  - website
  - notes
  - toggles/lane
  - Build records
  - Refresh build status
  - Finish build after records are ready
  - Review/Run returned records
- Capture live evidence in archive/admin-only surfaces:
  - selected adapter profile
  - endpoint path, not as normal UI copy
  - submit timestamp
  - idempotency token
  - actual submit response shape
  - captured runner task id or supported alias
  - actual pending refresh response shape
  - actual completed refresh response shape
  - finalGeneratedNamesJson location
  - W245/W151 validation result
  - imported returned record names, labels, types, ids, and supported Open URLs
- Reconcile actual response differences into W265 normalization only if they are safe aliases.
- Do not weaken validation to accept incomplete ids, unsupported URLs, wrong owner, fake links, or handoff-only JSON.
- Keep normal consultant UI simple:
  - `Build submitted`
  - `Refresh build status`
  - `Still building`
  - `Records ready`
  - `Finish build`
  - `Build stopped safely, ask admin`
- Add a live-run decision helper:
  - `ready_to_keep` when live submit, refresh, validation, import, and Open-link checks pass
  - `needs_attention` when result shape is new but safe to reconcile
  - `rollback_recommended` when authority boundaries, fake links, unsupported URLs, or invalid completed result behavior appear
- Preserve duplicate-submit safety and explicit retry-after-error gating from W265.
- Keep raw response evidence only in archived reports/traces/admin debug surfaces.
- Do not create records from the drawer client directly.
- Do not add transaction writes outside approved adapter path.
- Do not update W144 deployment in this block.
- Preserve W218 success wording, W220 recovery wording, fake Open-link blocking, W245 canonical import normalization, W262 readiness, W263 adapter profile, W264 submit/refresh/import flow, and W265 retry safety.
- Keep harnesses, reports, and traces under archive/.
- Keep repo front clean.

Validation:
- Add W266 harness covering:
  - live evidence packet includes submit, pending refresh, completed refresh, validation, import, and Open-link capture fields
  - live-run decision helper returns `ready_to_keep`, `needs_attention`, and `rollback_recommended` for the right conditions
  - actual response aliases continue to normalize through W265
  - completed result imports only after W151-valid result
  - returned Motion distribution records keep Product SKU / availability labels
  - normal consultant UI hides endpoint, raw JSON, task ids, schema names, stack traces, and admin diagnostics
  - duplicate submit and retry-after-error rules remain enforced
  - fake Open links remain blocked before import
  - W264 and W265 harnesses still pass
  - no drawer-created records or drawer transaction writes are introduced
- Run W244 through W266 harnesses, check, and validate.

Output:
- Summary of controlled live run evidence packet, response reconciliation, import QA, rollback decision logic, guardrails, and validation.
- Validation results.
- Visual testing decision.
- GitHub Desktop commit title and description.
- Full next optimized prompt block.
```

## Install Note

For Tampermonkey install/update, use:

- `idb-drawer.user.js`

Do not update the W144 adapter, runner, SuiteScript deployment, or image lookup settings unless a future install packet explicitly says to.
