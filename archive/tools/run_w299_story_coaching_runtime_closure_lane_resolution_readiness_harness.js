#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const storyContracts = require('../../src/contracts/storyCoachingSurfaces');
const storyBridge = require('../../src/contracts/storyCoachingBridge');
const {
  assertCase,
  completedMotionResult,
  completedRefreshResponse,
  loadHooks,
  motionContext,
  motionState,
  printResults,
  read,
  readArchiveJson,
  readArchiveText,
  root,
  submitResponse,
  userscriptPath
} = require('./lib/forge_harness_fixtures');

function readRepoFile(...parts) {
  return fs.readFileSync(path.join(root, ...parts), 'utf8');
}

function hasArea(trace, id) {
  return trace.laneResolutionRuntimeReadinessInventory.areas.some((area) => area.id === id);
}

function main() {
  const results = [];
  const hooks = loadHooks({ fetchMessage: 'live fetch disabled in W299 harness' });
  const userscript = read(userscriptPath);
  const packageJson = JSON.parse(readRepoFile('package.json'));
  const report = readArchiveText('reports', 'w299_story_coaching_runtime_closure_lane_resolution_readiness.md');
  const trace = readArchiveJson('trace_samples', 'w299_story_coaching_runtime_closure_lane_resolution_readiness_trace.json');
  const w298Trace = readArchiveJson('trace_samples', 'w298_story_coaching_runtime_shape_migration_trace.json');
  const w297Trace = readArchiveJson('trace_samples', 'w297_story_update_input_bridge_closure_story_coaching_readiness_trace.json');
  const w296Trace = readArchiveJson('trace_samples', 'w296_story_surface_update_input_bridge_trace.json');
  const w295Trace = readArchiveJson('trace_samples', 'w295_story_surface_update_input_contract_trace.json');
  const w294Trace = readArchiveJson('trace_samples', 'w294_returned_record_import_closure_story_update_readiness_trace.json');

  const state = motionState(hooks);
  const context = motionContext(hooks, state);
  const completedResult = completedMotionResult({ prefix: '299' });
  const completedRaw = completedRefreshResponse('runner-w299-motion-001', completedResult);
  const completedShape = hooks.actualAdapterResponseShapeW265(completedRaw, {
    phase: 'refresh',
    runnerTaskId: 'runner-w299-motion-001',
    idempotencyToken: 'motion-w299-token'
  });
  const completedGuard = hooks.validateDccFinalNamingImportPayload(completedShape.finalGeneratedNamesJson, state, context.lane, context.page, context.recommendation);
  const semanticGuard = hooks.completedRunnerResultSemanticGuardW214(completedGuard.finalNaming, state, context.lane, completedShape.finalGeneratedNamesJson);
  const normalizedImport = hooks.canonicalImportResultNormalizationW245(completedShape.finalGeneratedNamesJson, state, context.lane, context.page, context.recommendation);
  const story = normalizedImport.consultantStorySurfaceW247;
  const shape = hooks.storyCoachingRuntimeShapeW298(story);
  const bridgePacket = storyBridge.bridgeStoryCoachingSurfaces({
    w254EvidenceReceipt: shape.w254EvidenceReceipt,
    w255FirstGlance: shape.w255FirstGlance,
    w256LiveDemoScript: shape.w256LiveDemoScript,
    w257GuidedSequence: shape.w257GuidedSequence
  }, { hasValidImport: true });
  const html = hooks.renderConsultantStorySurfaceW248(story);
  const weakState = Object.assign({}, state, {
    intake: Object.assign({}, state.intake, {
      website: 'https://unknown-example.com',
      notes: 'Evidence is mixed and the buyer has not confirmed the lane.'
    })
  });
  const weakStory = hooks.consultantStorySurfaceFromLanePackW247(weakState, null, { displayReadyRecords: normalizedImport.visibleRecords });
  const w264Flow = hooks.connectedBuildSubmitRefreshImportW264(state, context.lane, context.page, context.recommendation, {
    executeSubmit: true,
    executePoll: true,
    finishBuild: true,
    submitTransport: () => submitResponse('runner-w299-motion-001', 'motion-w299-token'),
    pollTransport: () => completedRaw
  });

  assertCase(results, 'w297-through-w298-closure-map-exists-and-includes-four-layers',
    trace.schema === 'forge.w299.story-coaching-runtime-closure-lane-resolution-readiness.trace.v1' &&
      trace.status === 'closure_and_lane_resolution_readiness_ready' &&
      /W299 Story Coaching Runtime Closure/.test(report) &&
      trace.closureMap.layers.length === 4 &&
      ['w297_story_update_input_bridge_closure_story_coaching_readiness', 'w298_story_coaching_runtime_shape_migration', 'w273_story_coaching_contract', 'w278_story_coaching_bridge']
        .every((id) => trace.closureMap.layers.some((layer) => layer.id === id)),
    JSON.stringify(trace.closureMap.layers.map((layer) => layer.id)));

  assertCase(results, 'each-layer-maps-source-governance-drawer-owned-harnesses-rollback',
    trace.closureMap.layers.every((layer) =>
      Array.isArray(layer.sourceDrawerHelperSurfaceProtected) &&
      layer.sourceDrawerHelperSurfaceProtected.length > 0 &&
      layer.governingContractOrBridge &&
      Array.isArray(layer.drawerOwnedRuntimeBehavior) &&
      layer.drawerOwnedRuntimeBehavior.length > 0 &&
      Array.isArray(layer.parityHarnesses) &&
      layer.parityHarnesses.length > 0 &&
      layer.rollbackBoundary
    ),
    JSON.stringify(trace.closureMap.layers));

  assertCase(results, 'lane-resolution-runtime-readiness-inventory-complete',
    hasArea(trace, 'w246_resolved_lane_pack_and_confidence') &&
      hasArea(trace, 'website_evidence_bridge_and_matched_signals') &&
      hasArea(trace, 'consultant_lane_toggle_confirmation') &&
      hasArea(trace, 'resolve_lane_pack_from_evidence_w246') &&
      hasArea(trace, 'nllm_advisory_payload_w246') &&
      hasArea(trace, 'consultant_story_surface_w247') &&
      hasArea(trace, 'w250_lane_aware_labels') &&
      hasArea(trace, 'weak_conflicting_evidence_confirmation_gate') &&
      hasArea(trace, 'future_lane_pack_expansion_workflow') &&
      hasArea(trace, 'normal_ui_and_admin_evidence_boundaries'),
    JSON.stringify(trace.laneResolutionRuntimeReadinessInventory.areas.map((area) => area.id)));

  assertCase(results, 'selected-next-micro-slice-targets-lane-resolution-readiness-not-ui-or-behavior',
    trace.selectedNextMicroSlice.id === 'lane_resolution_readiness_contract_w300' &&
      trace.selectedNextMicroSlice.proposedContractModule === 'src/contracts/laneResolutionReadiness.js' &&
      trace.selectedNextMicroSlice.targetsLaneResolutionFactAssembly === true &&
      trace.selectedNextMicroSlice.movesVisibleUiLayoutOrCopy === false &&
      trace.selectedNextMicroSlice.movesLaneResolutionBehavior === false &&
      trace.selectedNextMicroSlice.movesReturnedRecordImport === false &&
      trace.selectedNextMicroSlice.movesConnectedSubmitRefreshImport === false &&
      trace.selectedNextMicroSlice.movesEndpointOrDatasetSwitching === false &&
      trace.selectedNextMicroSlice.movesRuntimeAuthority === false,
    JSON.stringify(trace.selectedNextMicroSlice));

  assertCase(results, 'selected-slice-includes-required-planning-fields',
    trace.selectedNextMicroSlice.sourceHelperAnchors.indexOf('resolveLanePackFromEvidenceW246') >= 0 &&
      trace.selectedNextMicroSlice.sourceHelperAnchors.indexOf('websiteEvidenceBridge') >= 0 &&
      trace.selectedNextMicroSlice.sourceHelperAnchors.indexOf('nllmAdvisoryPayloadForLanePackW246') >= 0 &&
      trace.selectedNextMicroSlice.sourceHelperAnchors.indexOf('consultantStorySurfaceFromLanePackW247') >= 0 &&
      trace.selectedNextMicroSlice.sourceHelperAnchors.indexOf('lanePackAwareRecordLabelW250') >= 0 &&
      trace.selectedNextMicroSlice.behaviorSurfacesThatMustRemainIdentical.length >= 8 &&
      trace.selectedNextMicroSlice.parityHarnesses.length >= 8 &&
      trace.selectedNextMicroSlice.manualReviewNotes.length >= 5 &&
      /Remove W300/.test(trace.selectedNextMicroSlice.rollbackPlan),
    JSON.stringify(trace.selectedNextMicroSlice));

  assertCase(results, 'w298-runtime-shape-remains-field-compatible-with-w278',
    w298Trace.status === 'runtime_shape_migration_ready' &&
      bridgePacket.status === 'bridge_ready' &&
      shape.schema === 'forge.w298.story-coaching-runtime-shape.v1' &&
      shape.governingContract === storyContracts.STORY_COACHING_SCHEMA_VERSION &&
      shape.governingBridge === storyBridge.STORY_COACHING_BRIDGE_SCHEMA_VERSION &&
      trace.continuity.w298RuntimeShapeFieldCompatibleWithW278 === true,
    JSON.stringify({ w298: w298Trace.status, bridge: bridgePacket.status, shape: shape.schema }));

  assertCase(results, 'w297-w296-w295-w294-continuity-remains-available',
    w297Trace.status === 'closure_and_story_coaching_readiness_ready' &&
      w296Trace.status === 'bridge_ready' &&
      w295Trace.status === 'contract_ready' &&
      w294Trace.status === 'closure_and_story_update_readiness_ready' &&
      trace.continuity.w297ClosureReadinessMapAvailable === true &&
      trace.continuity.w296BridgeAvailable === true &&
      trace.continuity.w295ContractAvailable === true &&
      trace.continuity.w294ClosureReadinessMapAvailable === true,
    JSON.stringify({ w297: w297Trace.status, w296: w296Trace.status, w295: w295Trace.status, w294: w294Trace.status }));

  assertCase(results, 'w273-story-coaching-contract-and-w278-bridge-remain-available',
    storyContracts.exportedContractSummary().schema === 'forge.w273.story-coaching-surfaces.v1' &&
      storyBridge.exportedContractSummary().schema === 'forge.w278.story-coaching-bridge.v1' &&
      trace.continuity.w273StoryCoachingContractAvailable === true &&
      trace.continuity.w278StoryCoachingBridgeAvailable === true,
    JSON.stringify({ w273: storyContracts.exportedContractSummary().schema, w278: storyBridge.exportedContractSummary().schema }));

  assertCase(results, 'w264-w265-w245-w151-w214-behavior-remains-unchanged',
    w264Flow.status === 'records_imported' &&
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

  assertCase(results, 'returned-records-open-links-and-review-run-visible-copy-unchanged',
    normalizedImport.visibleRecords.some((record) =>
      record.recordName === 'Motion Branch Fulfillment SKU' &&
      /Product SKU/.test(record.consultantLabel) &&
      record.safeToOpen === true &&
      /netsuite\.com\/app\/common\/item\/item\.nl\?id=29903/.test(record.supportedOpenUrl)
    ) &&
      /Live proof CTA/.test(html) &&
      /Say this live/.test(html) &&
      /Guided demo sequence/.test(html) &&
      /Evidence receipt/.test(html) &&
      trace.continuity.returnedRecordNamesLabelsOpenLinksChanged === false &&
      trace.continuity.reviewRunVisibleCopyChanged === false,
    JSON.stringify(normalizedImport.visibleRecords.map((record) => `${record.consultantLabel}:${record.recordName}:${record.linkAuthorityStatus}`)));

  assertCase(results, 'weak-conflicting-evidence-remains-confirmation-first-and-lane-resolution-unchanged',
    weakStory.status === 'needs_lane_confirmation' &&
      /Confirm lane before opening proof records/.test(weakStory.openTarget) &&
      trace.continuity.weakConflictingEvidenceConfirmationFirst === true &&
      trace.continuity.laneResolutionChanged === false,
    JSON.stringify({ weakStatus: weakStory.status, openTarget: weakStory.openTarget }));

  assertCase(results, 'normal-consultant-ui-hides-endpoint-profile-raw-admin-diagnostics',
    !/script=6702|deploy=2|runner-w299-motion-001|finalGeneratedNamesJson|stack trace|schema/i.test(html) &&
      trace.guardrails.normalConsultantUiHidesEndpointProfileRawAdminDiagnostics === true,
    html.slice(0, 700));

  assertCase(results, 'no-runtime-authority-changes-introduced',
    trace.guardrails.runtimeBehaviorChanged === false &&
      trace.guardrails.connectedBuildFlowChanged === false &&
      trace.guardrails.recordCreationAuthorityChanged === false &&
      trace.guardrails.noDrawerCreatedRecords === true &&
      trace.guardrails.noDrawerTransactionWrites === true &&
      trace.guardrails.noW144DeploymentUpdate === true,
    JSON.stringify(trace.guardrails));

  assertCase(results, 'w299-report-trace-harness-and-check-registration-present',
    packageJson.scripts['harness:story-coaching-runtime-closure-lane-resolution-readiness-w299'] &&
      packageJson.scripts.check.includes('run_w299_story_coaching_runtime_closure_lane_resolution_readiness_harness.js') &&
      trace.nextRecommendedBlock === 'W300: Lane Resolution Readiness Contract Without Lane Behavior Change',
    packageJson.scripts['harness:story-coaching-runtime-closure-lane-resolution-readiness-w299'] || '');

  printResults('W299 story coaching runtime closure lane resolution readiness harness', results);
}

main();
