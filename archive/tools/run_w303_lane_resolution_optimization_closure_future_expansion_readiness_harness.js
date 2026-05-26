#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const laneReadiness = require('../../src/contracts/laneResolutionReadiness');
const laneReadinessBridge = require('../../src/contracts/laneResolutionReadinessBridge');
const laneExpansion = require('../../src/contracts/lanePackExpansionWorkflow');
const laneReviewBridge = require('../../src/contracts/lanePackReviewBridge');
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
  return trace.futureIndustryExpansionReadinessInventory.areas.some((area) => area.id === id);
}

function readyFacts() {
  return {
    laneResolution: {
      status: 'resolved',
      packId: 'industrial-distributor',
      confidence: 'high',
      sourceAuthority: 'website_domain',
      matchedSignals: ['domain:motion.com', 'category:industrial distributor'],
      notesOverrideIdentityAllowed: false,
      nllmAuthority: 'advisory_only'
    },
    websiteEvidence: {
      website: 'https://www.motion.com',
      websiteDomain: 'motion.com',
      productFamily: 'Inventory / Fulfillment',
      matchedSignals: ['domain:motion.com', 'category:industrial distributor'],
      hasStrongWebsiteEvidence: true
    },
    consultantConfirmation: {
      selectedLaneId: 'distribution',
      laneSelectionSource: 'consultant_confirmed',
      laneConfirmed: true,
      toggles: { manufacturing: false, wip: false }
    },
    nllm: {
      advisoryOnly: true,
      writeAuthority: 'none',
      creationAllowed: false,
      uncertaintyVisible: true,
      uncertainty: 'Keep lane uncertainty visible if buyer evidence changes.',
      hardLimits: ['cannotOverrideWebsiteEvidence', 'cannotOverrideConsultantToggles', 'cannotCreateRecords']
    },
    storySurfaceInputs: {
      status: 'story_ready',
      packId: 'industrial-distributor',
      openTarget: 'Open Motion Branch Fulfillment SKU (Product SKU).'
    },
    laneAwareLabelFacts: {
      source: 'lanePackAwareRecordLabelW250',
      labelsReady: true,
      distributionLabelsProtected: true,
      manufacturingLabelsProtected: true
    },
    expansionWorkflow: {
      sourcePackFile: 'src/contracts/lanePacks.js',
      reviewOnlyProposals: true,
      noAutoInstall: true,
      advisoryOnly: true
    }
  };
}

function main() {
  const results = [];
  const hooks = loadHooks({ fetchMessage: 'live fetch disabled in W303 harness' });
  const userscript = read(userscriptPath);
  const packageJson = JSON.parse(readRepoFile('package.json'));
  const report = readArchiveText('reports', 'w303_lane_resolution_optimization_closure_future_expansion_readiness.md');
  const trace = readArchiveJson('trace_samples', 'w303_lane_resolution_optimization_closure_future_expansion_readiness_trace.json');
  const w302Trace = readArchiveJson('trace_samples', 'w302_lane_resolution_readiness_runtime_shape_migration_trace.json');
  const w301Trace = readArchiveJson('trace_samples', 'w301_lane_resolution_readiness_bridge_trace.json');
  const w300Trace = readArchiveJson('trace_samples', 'w300_lane_resolution_readiness_contract_trace.json');
  const w299Trace = readArchiveJson('trace_samples', 'w299_story_coaching_runtime_closure_lane_resolution_readiness_trace.json');

  const state = motionState(hooks);
  const context = motionContext(hooks, state);
  const completedResult = completedMotionResult({ prefix: '303' });
  const completedRaw = completedRefreshResponse('runner-w303-motion-001', completedResult);
  const completedShape = hooks.actualAdapterResponseShapeW265(completedRaw, {
    phase: 'refresh',
    runnerTaskId: 'runner-w303-motion-001',
    idempotencyToken: 'motion-w303-token'
  });
  const completedGuard = hooks.validateDccFinalNamingImportPayload(completedShape.finalGeneratedNamesJson, state, context.lane, context.page, context.recommendation);
  const semanticGuard = hooks.completedRunnerResultSemanticGuardW214(completedGuard.finalNaming, state, context.lane, completedShape.finalGeneratedNamesJson);
  const normalizedImport = hooks.canonicalImportResultNormalizationW245(completedShape.finalGeneratedNamesJson, state, context.lane, context.page, context.recommendation);
  const story = normalizedImport.consultantStorySurfaceW247;
  const html = hooks.renderConsultantStorySurfaceW248(story);
  const weakStory = hooks.consultantStorySurfaceFromLanePackW247(Object.assign({}, state, {
    intake: Object.assign({}, state.intake, {
      website: 'https://unknown-example.com',
      notes: 'Evidence is mixed and the buyer has not confirmed the lane.'
    })
  }), null, { displayReadyRecords: normalizedImport.visibleRecords });
  const w264Flow = hooks.connectedBuildSubmitRefreshImportW264(state, context.lane, context.page, context.recommendation, {
    executeSubmit: true,
    executePoll: true,
    finishBuild: true,
    submitTransport: () => submitResponse('runner-w303-motion-001', 'motion-w303-token'),
    pollTransport: () => completedRaw
  });
  const readinessShape = hooks.laneResolutionReadinessRuntimeShapeW302(readyFacts());
  const readinessValidation = laneReadinessBridge.validateLaneResolutionReadiness(
    Object.assign({}, readinessShape, { schema: laneReadiness.LANE_RESOLUTION_READINESS_SCHEMA_VERSION }),
    readyFacts()
  );

  assertCase(results, 'w299-through-w302-closure-map-exists-and-includes-four-layers',
    trace.schema === 'forge.w303.lane-resolution-optimization-closure-future-expansion-readiness.trace.v1' &&
      trace.status === 'closure_and_future_expansion_readiness_ready' &&
      /W303 Lane Resolution Optimization Closure/.test(report) &&
      trace.closureMap.layers.length === 4 &&
      ['w299_story_coaching_runtime_closure_lane_resolution_readiness', 'w300_lane_resolution_readiness_contract', 'w301_lane_resolution_readiness_bridge', 'w302_lane_resolution_readiness_runtime_shape_migration']
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

  assertCase(results, 'future-industry-subindustry-expansion-readiness-inventory-complete',
    hasArea(trace, 'source_lane_packs') &&
      hasArea(trace, 'w247_authoring_review_inputs') &&
      hasArea(trace, 'w251_proposed_diff_review') &&
      hasArea(trace, 'w252_admin_safe_review_renderer') &&
      hasArea(trace, 'w255_receipt_driven_qa') &&
      hasArea(trace, 'w274_lane_pack_expansion_workflow_contract') &&
      hasArea(trace, 'w277_lane_pack_review_bridge') &&
      hasArea(trace, 'w300_w301_w302_lane_resolution_readiness_facts') &&
      hasArea(trace, 'nllm_advisory_only_draft_intake') &&
      hasArea(trace, 'website_evidence_authority') &&
      hasArea(trace, 'consultant_toggle_confirmation_authority') &&
      hasArea(trace, 'weak_conflicting_evidence_confirmation_gate') &&
      hasArea(trace, 'returned_records_labels_open_links_story_inputs') &&
      hasArea(trace, 'normal_ui_and_admin_only_evidence_boundaries'),
    JSON.stringify(trace.futureIndustryExpansionReadinessInventory.areas.map((area) => area.id)));

  assertCase(results, 'selected-next-micro-slice-targets-future-expansion-readiness-not-ui-source-pack-or-lane-behavior',
    trace.selectedNextMicroSlice.id === 'future_lane_pack_expansion_readiness_contract_w304' &&
      trace.selectedNextMicroSlice.proposedContractModule === 'src/contracts/futureLanePackExpansionReadiness.js' &&
      trace.selectedNextMicroSlice.targetsFutureLanePackExpansionAuthoringReadiness === true &&
      trace.selectedNextMicroSlice.targetsProposalIntakeQa === true &&
      trace.selectedNextMicroSlice.movesVisibleUiLayoutOrCopy === false &&
      trace.selectedNextMicroSlice.mutatesSourceLanePacks === false &&
      trace.selectedNextMicroSlice.movesLaneResolutionBehavior === false &&
      trace.selectedNextMicroSlice.movesConnectedSubmitRefreshImport === false &&
      trace.selectedNextMicroSlice.movesEndpointOrDatasetSwitching === false &&
      trace.selectedNextMicroSlice.movesRuntimeAuthority === false,
    JSON.stringify(trace.selectedNextMicroSlice));

  assertCase(results, 'selected-slice-includes-source-anchors-behavior-surfaces-harnesses-review-notes-and-rollback',
    trace.selectedNextMicroSlice.sourceHelperAnchors.indexOf('reviewProposedLanePackChangeW247') >= 0 &&
      trace.selectedNextMicroSlice.sourceHelperAnchors.indexOf('lanePackProposedChangeDiffW251') >= 0 &&
      trace.selectedNextMicroSlice.sourceHelperAnchors.indexOf('renderLanePackDiffReviewW252') >= 0 &&
      trace.selectedNextMicroSlice.sourceHelperAnchors.indexOf('receiptDrivenLaneExpansionQaW255') >= 0 &&
      trace.selectedNextMicroSlice.sourceHelperAnchors.indexOf('laneResolutionReadinessRuntimeShapeW302') >= 0 &&
      trace.selectedNextMicroSlice.behaviorSurfacesThatMustRemainIdentical.length >= 10 &&
      trace.selectedNextMicroSlice.parityHarnesses.length >= 10 &&
      trace.selectedNextMicroSlice.manualReviewNotes.length >= 5 &&
      /Remove W304/.test(trace.selectedNextMicroSlice.rollbackPlan),
    JSON.stringify(trace.selectedNextMicroSlice));

  assertCase(results, 'w302-runtime-shape-remains-field-compatible-with-w301',
    w302Trace.status === 'runtime_shape_migration_ready' &&
      readinessValidation.status === 'field_compatible' &&
      trace.continuity.w302RuntimeShapeFieldCompatibleWithW301 === true,
    JSON.stringify({ w302: w302Trace.status, validation: readinessValidation.status }));

  assertCase(results, 'w301-bridge-and-w300-contract-remain-available',
    laneReadinessBridge.exportedContractSummary().schema === 'forge.w301.lane-resolution-readiness-bridge.v1' &&
      laneReadiness.contractSummary().schema === 'forge.w300.lane-resolution-readiness.v1' &&
      w301Trace.status === 'bridge_ready' &&
      w300Trace.status === 'contract_ready' &&
      trace.continuity.w301BridgeAvailable === true &&
      trace.continuity.w300ContractAvailable === true,
    JSON.stringify({ w301: w301Trace.status, w300: w300Trace.status }));

  assertCase(results, 'w299-closure-readiness-map-remains-available',
    w299Trace.status === 'closure_and_lane_resolution_readiness_ready' &&
      trace.continuity.w299ClosureReadinessMapAvailable === true,
    JSON.stringify({ w299: w299Trace.status }));

  assertCase(results, 'w274-and-w277-lane-pack-expansion-review-contracts-remain-available',
    laneExpansion.exportedContractSummary().schema === 'forge.w274.lane-pack-expansion-workflow.v1' &&
      laneReviewBridge.exportedContractSummary().schema === 'forge.w277.lane-pack-review-bridge.v1' &&
      trace.continuity.w274LanePackExpansionWorkflowAvailable === true &&
      trace.continuity.w277LanePackReviewBridgeAvailable === true,
    JSON.stringify({ w274: laneExpansion.exportedContractSummary().schema, w277: laneReviewBridge.exportedContractSummary().schema }));

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
      /netsuite\.com\/app\/common\/item\/item\.nl\?id=30303/.test(record.supportedOpenUrl)
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
    !/script=6702|deploy=2|runner-w303-motion-001|finalGeneratedNamesJson|stack trace|schema/i.test(html) &&
      trace.guardrails.normalConsultantUiHidesEndpointProfileRawAdminDiagnostics === true,
    html.slice(0, 700));

  assertCase(results, 'no-runtime-authority-source-pack-or-auto-install-changes-introduced',
    trace.guardrails.runtimeBehaviorChanged === false &&
      trace.guardrails.connectedBuildFlowChanged === false &&
      trace.guardrails.recordCreationAuthorityChanged === false &&
      trace.guardrails.sourceLanePacksMutated === false &&
      trace.guardrails.autoInstallIntroduced === false &&
      trace.guardrails.noDrawerCreatedRecords === true &&
      trace.guardrails.noDrawerTransactionWrites === true &&
      trace.continuity.sourceLanePacksChanged === false &&
      trace.continuity.proposedPacksInstalled === false,
    JSON.stringify({ guardrails: trace.guardrails, continuity: trace.continuity }));

  assertCase(results, 'w303-report-trace-harness-and-check-registration-present',
    packageJson.scripts['harness:lane-resolution-optimization-closure-future-expansion-readiness-w303'] &&
      packageJson.scripts.check.includes('run_w303_lane_resolution_optimization_closure_future_expansion_readiness_harness.js') &&
      trace.nextRecommendedBlock === 'W304: Future Lane Pack Expansion Readiness Contract Without Source Pack Mutation',
    packageJson.scripts['harness:lane-resolution-optimization-closure-future-expansion-readiness-w303'] || '');

  printResults('W303 lane resolution optimization closure future expansion readiness harness', results);
}

main();
