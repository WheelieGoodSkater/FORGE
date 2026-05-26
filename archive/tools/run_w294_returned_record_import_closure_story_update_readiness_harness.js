#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const displayReadyBridge = require('../../src/contracts/returnedRecordDisplayReadyImportBridge');
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
  const hooks = loadHooks({ fetchMessage: 'live fetch disabled in W294 harness' });
  const userscript = read(userscriptPath);
  const packageJson = JSON.parse(readRepoFile('package.json'));
  const report = readArchiveText('reports', 'w294_returned_record_import_closure_story_update_readiness.md');
  const trace = readArchiveJson('trace_samples', 'w294_returned_record_import_closure_story_update_readiness_trace.json');
  const w293Trace = readArchiveJson('trace_samples', 'w293_returned_record_display_ready_import_runtime_migration_trace.json');
  const w292Trace = readArchiveJson('trace_samples', 'w292_returned_record_display_ready_import_bridge_trace.json');
  const w291Trace = readArchiveJson('trace_samples', 'w291_returned_record_display_ready_import_contract_trace.json');
  const w290Trace = readArchiveJson('trace_samples', 'w290_completed_result_import_guard_closure_trace.json');
  const state = motionState(hooks);
  const context = motionContext(hooks, state);
  const completedResult = completedMotionResult({ prefix: '294' });
  const completedRaw = completedRefreshResponse('runner-w294-motion-001', completedResult);
  const completedShape = hooks.actualAdapterResponseShapeW265(completedRaw, {
    phase: 'refresh',
    runnerTaskId: 'runner-w294-motion-001',
    idempotencyToken: 'motion-w294-token'
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
  const bridgeValidation = displayReadyBridge.validateReturnedRecordDisplayReadyImport(displayReadyShape, {
    normalizedImport,
    w245ImportValid: true,
    laneAwareLabelSource: 'lanePackAwareRecordLabelW250',
    evidenceGuardrailSource: 'canonicalImportResultNormalizationW245 + verifiedRecordLinkAuthorityV1'
  });
  const w264Flow = hooks.connectedBuildSubmitRefreshImportW264(state, context.lane, context.page, context.recommendation, {
    executeSubmit: true,
    executePoll: true,
    finishBuild: true,
    submitTransport: () => submitResponse('runner-w294-motion-001', 'motion-w294-token'),
    pollTransport: () => completedRaw
  });
  const story = normalizedImport.consultantStorySurfaceW247;
  const firstGlance = hooks.consultantStoryFirstGlanceW255(story);
  const script = hooks.consultantLiveDemoScriptW256(story);
  const sequence = hooks.guidedDemoStepSequenceW257(story);
  const html = hooks.renderConsultantStorySurfaceW248(story);
  const weakStory = hooks.consultantStorySurfaceFromLanePackW247(Object.assign({}, state, {
    intake: Object.assign({}, state.intake, {
      website: 'https://unknown-example.com',
      notes: 'Evidence is mixed and the buyer has not confirmed the lane.'
    })
  }), null, { displayReadyRecords: normalizedImport.visibleRecords });

  assertCase(results, 'w290-through-w293-closure-map-exists',
    trace.schema === 'forge.w294.returned-record-import-closure-story-update-readiness.trace.v1' &&
      trace.status === 'closure_and_story_update_readiness_ready' &&
      /W294 Returned Record Import Optimization Closure/.test(report) &&
      trace.closureMap.layers.length === 4,
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

  assertCase(results, 'story-update-readiness-inventory-complete',
    trace.storyUpdateReadinessInventory.areas.some((area) => area.id === 'w254_evidence_receipt_inputs') &&
      trace.storyUpdateReadinessInventory.areas.some((area) => area.id === 'w255_first_glance_story_inputs') &&
      trace.storyUpdateReadinessInventory.areas.some((area) => area.id === 'w256_live_demo_script_inputs') &&
      trace.storyUpdateReadinessInventory.areas.some((area) => area.id === 'w257_guided_sequence_inputs') &&
      trace.storyUpdateReadinessInventory.areas.some((area) => area.id === 'w248_w258_review_run_rendering_surfaces') &&
      trace.storyUpdateReadinessInventory.areas.some((area) => area.id === 'returned_records_and_open_link_authority_feeding_story') &&
      trace.storyUpdateReadinessInventory.areas.some((area) => area.id === 'weak_conflicting_evidence_confirmation_gate') &&
      trace.storyUpdateReadinessInventory.areas.some((area) => area.id === 'nllm_advisory_visibility') &&
      trace.storyUpdateReadinessInventory.areas.some((area) => area.id === 'admin_only_raw_evidence_surfaces'),
    JSON.stringify(trace.storyUpdateReadinessInventory.areas.map((area) => area.id)));

  assertCase(results, 'selected-next-micro-slice-targets-story-inputs-not-ui-or-import-mutation',
    trace.selectedNextMicroSlice.id === 'story_surface_update_input_contract_w295' &&
      trace.selectedNextMicroSlice.targetsStorySurfaceUpdateInputs === true &&
      trace.selectedNextMicroSlice.movesVisibleReviewRunLayoutOrCopy === false &&
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
      trace.selectedNextMicroSlice.proposedContractModule === 'src/contracts/storySurfaceUpdateInputs.js' &&
      trace.selectedNextMicroSlice.proposedBridgeModule === 'src/contracts/storySurfaceUpdateInputBridge.js' &&
      trace.selectedNextMicroSlice.behaviorSurfacesThatMustRemainIdentical.length >= 8 &&
      trace.selectedNextMicroSlice.parityHarnesses.length >= 8 &&
      trace.selectedNextMicroSlice.manualReviewNotes.length >= 4 &&
      /Remove W295/.test(trace.selectedNextMicroSlice.rollbackPlan),
    JSON.stringify(trace.selectedNextMicroSlice));

  assertCase(results, 'w293-runtime-migration-remains-field-compatible-with-w292',
    w293Trace.status === 'runtime_shape_migration_ready' &&
      bridgeValidation.status === 'field_compatible' &&
      bridgeValidation.records.recordsCompatible === true &&
      trace.continuity.w293RuntimeMigrationFieldCompatibleWithW292 === true,
    JSON.stringify({ w293: w293Trace.status, bridge: bridgeValidation.status }));

  assertCase(results, 'w292-bridge-and-w291-contract-remain-available',
    w292Trace.status === 'bridge_ready' &&
      w291Trace.status === 'contract_ready' &&
      trace.continuity.w292BridgeAvailableAndUnchanged === true &&
      trace.continuity.w291ContractAvailableAndUnchanged === true,
    JSON.stringify(trace.continuity));

  assertCase(results, 'w290-closure-readiness-map-remains-available',
    w290Trace.status === 'closure_and_returned_record_readiness_ready' &&
      trace.continuity.w290ClosureReadinessMapAvailable === true,
    JSON.stringify({ w290: w290Trace.status }));

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

  assertCase(results, 'returned-record-names-labels-and-open-links-preserved',
    normalizedImport.visibleRecords.some((record) =>
      record.recordName === 'Motion Branch Fulfillment SKU' &&
      /Product SKU/.test(record.consultantLabel) &&
      record.safeToOpen === true &&
      /netsuite\.com\/app\/common\/item\/item\.nl\?id=29403/.test(record.supportedOpenUrl)
    ) &&
      trace.continuity.returnedRecordNamesLabelsOpenLinksChanged === false,
    JSON.stringify(normalizedImport.visibleRecords.map((record) => `${record.consultantLabel}:${record.recordName}:${record.linkAuthorityStatus}`)));

  assertCase(results, 'review-run-story-surfaces-remain-available-and-unchanged',
    story &&
      /story_ready|needs_lane_confirmation/.test(story.status) &&
      firstGlance.schema === 'forge.w255.consultant-story-first-glance.v1' &&
      script.schema === 'forge.w256.consultant-live-demo-script.v1' &&
      sequence.schema === 'forge.w257.guided-demo-step-sequence.v1' &&
      /Live proof CTA/.test(html) &&
      /Say this live/.test(html) &&
      /Guided demo sequence/.test(html) &&
      /Evidence receipt/.test(html) &&
      trace.continuity.reviewRunStorySurfacesChanged === false,
    html.slice(0, 600));

  assertCase(results, 'weak-conflicting-evidence-remains-confirmation-first',
    weakStory.status === 'needs_lane_confirmation' &&
      /Confirm lane before opening proof records/.test(weakStory.openTarget) &&
      trace.continuity.weakConflictingEvidenceConfirmationFirst === true,
    JSON.stringify({ status: weakStory.status, openTarget: weakStory.openTarget }));

  assertCase(results, 'normal-consultant-ui-hides-endpoint-profile-raw-admin-diagnostics',
    !/script=6702|deploy=2|runner-w294-motion-001|finalGeneratedNamesJson|stack trace|schema/i.test(html) &&
      trace.guardrails.normalConsultantUiHidesEndpointProfileRawAdminDiagnostics === true,
    html.slice(0, 600));

  assertCase(results, 'no-runtime-authority-changes-introduced',
    trace.guardrails.runtimeBehaviorChanged === false &&
      trace.guardrails.connectedBuildFlowChanged === false &&
      trace.guardrails.recordCreationAuthorityChanged === false &&
      trace.guardrails.noDrawerCreatedRecords === true &&
      trace.guardrails.noDrawerTransactionWrites === true &&
      trace.guardrails.nlLmAdvisoryOnly === true &&
      trace.guardrails.uncertaintyVisible === true &&
      !/function storySurfaceUpdateInput/.test(userscript),
    JSON.stringify(trace.guardrails));

  assertCase(results, 'w294-harness-and-check-registration-present',
    packageJson.scripts['harness:returned-record-import-closure-story-update-readiness-w294'] &&
      packageJson.scripts.check.includes('run_w294_returned_record_import_closure_story_update_readiness_harness.js') &&
      trace.nextRecommendedBlock === 'W295: Story Surface Update Input Contract Without Review/Run UI Change',
    packageJson.scripts['harness:returned-record-import-closure-story-update-readiness-w294'] || '');

  printResults('W294 returned record import closure story update readiness harness', results);
}

main();
