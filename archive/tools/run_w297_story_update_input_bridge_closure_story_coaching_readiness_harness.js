#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const storyBridge = require('../../src/contracts/storySurfaceUpdateInputBridge');
const {
  assertCase,
  completedMotionResult,
  loadHooks,
  motionContext,
  motionState,
  printResults,
  read,
  readArchiveJson,
  readArchiveText,
  root,
  submitResponse,
  completedRefreshResponse,
  userscriptPath
} = require('./lib/forge_harness_fixtures');

function readRepoFile(...parts) {
  return fs.readFileSync(path.join(root, ...parts), 'utf8');
}

function main() {
  const results = [];
  const hooks = loadHooks({ fetchMessage: 'live fetch disabled in W297 harness' });
  const userscript = read(userscriptPath);
  const packageJson = JSON.parse(readRepoFile('package.json'));
  const report = readArchiveText('reports', 'w297_story_update_input_bridge_closure_story_coaching_readiness.md');
  const trace = readArchiveJson('trace_samples', 'w297_story_update_input_bridge_closure_story_coaching_readiness_trace.json');
  const w296Trace = readArchiveJson('trace_samples', 'w296_story_surface_update_input_bridge_trace.json');
  const w295Trace = readArchiveJson('trace_samples', 'w295_story_surface_update_input_contract_trace.json');
  const w294Trace = readArchiveJson('trace_samples', 'w294_returned_record_import_closure_story_update_readiness_trace.json');

  const state = motionState(hooks);
  const context = motionContext(hooks, state);
  const completedResult = completedMotionResult({ prefix: '297' });
  const completedRaw = completedRefreshResponse('runner-w297-motion-001', completedResult);
  const completedShape = hooks.actualAdapterResponseShapeW265(completedRaw, {
    phase: 'refresh',
    runnerTaskId: 'runner-w297-motion-001',
    idempotencyToken: 'motion-w297-token'
  });
  const completedGuard = hooks.validateDccFinalNamingImportPayload(completedShape.finalGeneratedNamesJson, state, context.lane, context.page, context.recommendation);
  const semanticGuard = hooks.completedRunnerResultSemanticGuardW214(completedGuard.finalNaming, state, context.lane, completedShape.finalGeneratedNamesJson);
  const normalizedImport = hooks.canonicalImportResultNormalizationW245(completedShape.finalGeneratedNamesJson, state, context.lane, context.page, context.recommendation);
  const displayReadyShape = hooks.returnedRecordDisplayReadyImportShapeW293({
    normalizedImport,
    w245ImportValid: true,
    laneAwareLabelSource: 'lanePackAwareRecordLabelW250',
    evidenceGuardrailSource: 'canonicalImportResultNormalizationW245 + verifiedRecordLinkAuthorityV1'
  });
  const story = normalizedImport.consultantStorySurfaceW247;
  const firstGlance = hooks.consultantStoryFirstGlanceW255(story);
  const script = hooks.consultantLiveDemoScriptW256(story);
  const sequence = hooks.guidedDemoStepSequenceW257(story);
  const html = hooks.renderConsultantStorySurfaceW248(story);
  const w264Flow = hooks.connectedBuildSubmitRefreshImportW264(state, context.lane, context.page, context.recommendation, {
    executeSubmit: true,
    executePoll: true,
    finishBuild: true,
    submitTransport: () => submitResponse('runner-w297-motion-001', 'motion-w297-token'),
    pollTransport: () => completedRaw
  });
  const weakStory = hooks.consultantStorySurfaceFromLanePackW247(Object.assign({}, state, {
    intake: Object.assign({}, state.intake, {
      website: 'https://unknown-example.com',
      notes: 'Evidence is mixed and the buyer has not confirmed the lane.'
    })
  }), null, { displayReadyRecords: normalizedImport.visibleRecords });

  assertCase(results, 'w294-through-w296-closure-map-exists',
    trace.schema === 'forge.w297.story-update-input-bridge-closure-story-coaching-readiness.trace.v1' &&
      trace.status === 'closure_and_story_coaching_readiness_ready' &&
      /W297 Story Update Input Bridge Closure/.test(report) &&
      trace.closureMap.layers.length === 3,
    JSON.stringify(trace.closureMap.layers.map((layer) => layer.id)));

  assertCase(results, 'each-layer-maps-source-governance-drawer-owned-harnesses-rollback',
    trace.closureMap.layers.every((layer) =>
      Array.isArray(layer.sourceDrawerHelperSurfaceProtected) &&
      layer.sourceDrawerHelperSurfaceProtected.length > 0 &&
      layer.governingContractOrBridge &&
      Array.isArray(layer.drawerOwnedBehaviorThatStayedInPlace) &&
      layer.drawerOwnedBehaviorThatStayedInPlace.length > 0 &&
      Array.isArray(layer.parityHarnesses) &&
      layer.parityHarnesses.length > 0 &&
      layer.rollbackBoundary
    ),
    JSON.stringify(trace.closureMap.layers));

  assertCase(results, 'story-coaching-runtime-readiness-inventory-complete',
    trace.storyCoachingRuntimeShapeReadinessInventory.areas.some((area) => area.id === 'w247_story_surface_fact_assembly') &&
      trace.storyCoachingRuntimeShapeReadinessInventory.areas.some((area) => area.id === 'w254_evidence_receipt_shape') &&
      trace.storyCoachingRuntimeShapeReadinessInventory.areas.some((area) => area.id === 'w255_first_glance_shape') &&
      trace.storyCoachingRuntimeShapeReadinessInventory.areas.some((area) => area.id === 'w256_live_demo_script_shape') &&
      trace.storyCoachingRuntimeShapeReadinessInventory.areas.some((area) => area.id === 'w257_guided_sequence_shape') &&
      trace.storyCoachingRuntimeShapeReadinessInventory.areas.some((area) => area.id === 'w248_review_run_rendering_surface') &&
      trace.storyCoachingRuntimeShapeReadinessInventory.areas.some((area) => area.id === 'returned_records_open_link_authority_feeding_story_coaching') &&
      trace.storyCoachingRuntimeShapeReadinessInventory.areas.some((area) => area.id === 'weak_conflicting_evidence_confirmation_gate') &&
      trace.storyCoachingRuntimeShapeReadinessInventory.areas.some((area) => area.id === 'nllm_advisory_visibility') &&
      trace.storyCoachingRuntimeShapeReadinessInventory.areas.some((area) => area.id === 'admin_only_raw_evidence_surfaces'),
    JSON.stringify(trace.storyCoachingRuntimeShapeReadinessInventory.areas.map((area) => area.id)));

  assertCase(results, 'selected-next-micro-slice-targets-story-coaching-fact-assembly-not-ui-or-import',
    trace.selectedNextMicroSlice.id === 'story_coaching_runtime_shape_migration_w298' &&
      trace.selectedNextMicroSlice.targetsStoryCoachingFactAssembly === true &&
      trace.selectedNextMicroSlice.movesVisibleReviewRunLayoutOrCopy === false &&
      trace.selectedNextMicroSlice.movesRenderConsultantStorySurfaceW248 === false &&
      trace.selectedNextMicroSlice.movesImportMutation === false &&
      trace.selectedNextMicroSlice.movesConnectedSubmitRefreshImport === false &&
      trace.selectedNextMicroSlice.movesOpenLinkCreation === false,
    JSON.stringify(trace.selectedNextMicroSlice));

  assertCase(results, 'selected-slice-includes-required-planning-fields',
    Array.isArray(trace.selectedNextMicroSlice.sourceHelperAnchors) &&
      trace.selectedNextMicroSlice.sourceHelperAnchors.indexOf('consultantStorySurfaceFromLanePackW247') >= 0 &&
      trace.selectedNextMicroSlice.sourceHelperAnchors.indexOf('storyEvidenceReceiptTrailW254') >= 0 &&
      trace.selectedNextMicroSlice.sourceHelperAnchors.indexOf('consultantStoryFirstGlanceW255') >= 0 &&
      trace.selectedNextMicroSlice.sourceHelperAnchors.indexOf('consultantLiveDemoScriptW256') >= 0 &&
      trace.selectedNextMicroSlice.sourceHelperAnchors.indexOf('guidedDemoStepSequenceW257') >= 0 &&
      trace.selectedNextMicroSlice.proposedContractModule === 'src/contracts/storyCoachingSurfaces.js' &&
      trace.selectedNextMicroSlice.proposedBridgeModule === 'src/contracts/storyCoachingBridge.js' &&
      trace.selectedNextMicroSlice.behaviorSurfacesThatMustRemainIdentical.length >= 8 &&
      trace.selectedNextMicroSlice.parityHarnesses.length >= 8 &&
      trace.selectedNextMicroSlice.manualReviewNotes.length >= 4 &&
      /Remove W298/.test(trace.selectedNextMicroSlice.rollbackPlan),
    JSON.stringify(trace.selectedNextMicroSlice));

  assertCase(results, 'w296-w295-w294-continuity-remains-available',
    w296Trace.status === 'bridge_ready' &&
      w295Trace.status === 'contract_ready' &&
      w294Trace.status === 'closure_and_story_update_readiness_ready' &&
      trace.continuity.w296BridgeAvailableAndUnchanged === true &&
      trace.continuity.w295ContractAvailableAndUnchanged === true &&
      trace.continuity.w294ClosureReadinessMapAvailable === true &&
      storyBridge.exportedContractSummary().schema === 'forge.w296.story-surface-update-input-bridge.v1',
    JSON.stringify({ w296: w296Trace.status, w295: w295Trace.status, w294: w294Trace.status }));

  assertCase(results, 'w264-w265-w245-w151-w214-behavior-remains-unchanged',
    w264Flow.status === 'records_imported' &&
      w264Flow.importCommit &&
      w264Flow.importCommit.commitAllowed === true &&
      completedGuard.status === 'completed_runner_result_accepted' &&
      completedGuard.valid === true &&
      semanticGuard.valid === true &&
      normalizedImport.status === 'display_ready_records_normalized' &&
      trace.continuity.w264SubmitRefreshImportChanged === false &&
      trace.continuity.w265RetrySafetyChanged === false &&
      trace.continuity.w245CanonicalImportChanged === false &&
      trace.continuity.w151ValidationChanged === false &&
      trace.continuity.w214SemanticGuardChanged === false,
    JSON.stringify({ w264: w264Flow.status, w151: completedGuard.status, w214: semanticGuard.status, w245: normalizedImport.status }));

  assertCase(results, 'returned-record-names-labels-supported-open-links-preserved',
    normalizedImport.visibleRecords.some((record) =>
      record.recordName === 'Motion Branch Fulfillment SKU' &&
      /Product SKU/.test(record.consultantLabel) &&
      record.safeToOpen === true &&
      /netsuite\.com\/app\/common\/item\/item\.nl\?id=29703/.test(record.supportedOpenUrl)
    ) &&
      displayReadyShape.status === 'display_ready_records_valid' &&
      trace.continuity.returnedRecordNamesLabelsOpenLinksChanged === false,
    JSON.stringify(normalizedImport.visibleRecords.map((record) => `${record.consultantLabel}:${record.recordName}:${record.linkAuthorityStatus}`)));

  assertCase(results, 'review-run-visible-copy-remains-unchanged',
    story &&
      /story_ready|needs_lane_confirmation/.test(story.status) &&
      firstGlance.schema === 'forge.w255.consultant-story-first-glance.v1' &&
      script.schema === 'forge.w256.consultant-live-demo-script.v1' &&
      sequence.schema === 'forge.w257.guided-demo-step-sequence.v1' &&
      /Live proof CTA/.test(html) &&
      /Say this live/.test(html) &&
      /Guided demo sequence/.test(html) &&
      /Evidence receipt/.test(html) &&
      trace.continuity.reviewRunVisibleCopyChanged === false,
    html.slice(0, 600));

  assertCase(results, 'weak-conflicting-evidence-remains-confirmation-first',
    weakStory.status === 'needs_lane_confirmation' &&
      /Confirm lane before opening proof records/.test(weakStory.openTarget) &&
      trace.continuity.weakConflictingEvidenceConfirmationFirst === true,
    JSON.stringify({ status: weakStory.status, openTarget: weakStory.openTarget }));

  assertCase(results, 'normal-consultant-ui-hides-endpoint-profile-raw-admin-diagnostics',
    !/script=6702|deploy=2|runner-w297-motion-001|finalGeneratedNamesJson|stack trace|schema/i.test(html) &&
      trace.guardrails.normalConsultantUiHidesEndpointProfileRawAdminDiagnostics === true,
    html.slice(0, 600));

  assertCase(results, 'no-runtime-authority-changes-introduced',
    trace.guardrails.runtimeBehaviorChanged === false &&
      trace.guardrails.connectedBuildFlowChanged === false &&
      trace.guardrails.recordCreationAuthorityChanged === false &&
      trace.guardrails.noDrawerCreatedRecords === true &&
      trace.guardrails.noDrawerTransactionWrites === true &&
      trace.guardrails.nlLmAdvisoryOnly === true &&
      trace.guardrails.uncertaintyVisible === true,
    JSON.stringify(trace.guardrails));

  assertCase(results, 'w297-harness-and-check-registration-present',
    packageJson.scripts['harness:story-update-input-closure-story-coaching-readiness-w297'] &&
      packageJson.scripts.check.includes('run_w297_story_update_input_bridge_closure_story_coaching_readiness_harness.js') &&
      trace.nextRecommendedBlock === 'W298: Story Coaching Runtime Shape Migration Without Review/Run UI Change',
    packageJson.scripts['harness:story-update-input-closure-story-coaching-readiness-w297'] || '');

  printResults('W297 story update input bridge closure story coaching readiness harness', results);
}

main();
