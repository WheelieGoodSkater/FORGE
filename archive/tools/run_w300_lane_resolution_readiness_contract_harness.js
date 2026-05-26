#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const laneReadiness = require('../../src/contracts/laneResolutionReadiness');
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

function baseFacts(overrides = {}) {
  return Object.assign({
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
  }, overrides);
}

function main() {
  const results = [];
  const hooks = loadHooks({ fetchMessage: 'live fetch disabled in W300 harness' });
  const userscript = read(userscriptPath);
  const packageJson = JSON.parse(readRepoFile('package.json'));
  const contractSource = readRepoFile('src', 'contracts', 'laneResolutionReadiness.js');
  const report = readArchiveText('reports', 'w300_lane_resolution_readiness_contract.md');
  const trace = readArchiveJson('trace_samples', 'w300_lane_resolution_readiness_contract_trace.json');
  const w299Trace = readArchiveJson('trace_samples', 'w299_story_coaching_runtime_closure_lane_resolution_readiness_trace.json');
  const w298Trace = readArchiveJson('trace_samples', 'w298_story_coaching_runtime_shape_migration_trace.json');

  const ready = laneReadiness.normalizeLaneResolutionReadiness(baseFacts());
  const needsConfirmation = laneReadiness.normalizeLaneResolutionReadiness(baseFacts({
    laneResolution: {
      status: 'needs_confirmation',
      packId: 'industrial-distributor',
      confidence: 'medium',
      sourceAuthority: 'website_category',
      matchedSignals: ['category:industrial distributor'],
      notesOverrideIdentityAllowed: false,
      nllmAuthority: 'advisory_only'
    },
    consultantConfirmation: {
      selectedLaneId: 'distribution',
      laneSelectionSource: 'website_recommendation',
      laneConfirmed: false,
      toggles: { manufacturing: false, wip: false }
    },
    weakEvidence: true
  }));
  const missingEvidence = laneReadiness.normalizeLaneResolutionReadiness(baseFacts({
    websiteEvidence: {
      website: '',
      websiteDomain: '',
      productFamily: '',
      matchedSignals: [],
      hasStrongWebsiteEvidence: false
    }
  }));
  const hiddenUncertainty = laneReadiness.normalizeLaneResolutionReadiness(baseFacts({
    nllm: {
      advisoryOnly: false,
      writeAuthority: 'write',
      creationAllowed: true,
      uncertaintyVisible: false,
      hardLimits: []
    },
    hideUncertainty: true
  }));
  const notReady = laneReadiness.normalizeLaneResolutionReadiness(baseFacts({
    laneResolution: {
      status: 'resolved',
      packId: '',
      confidence: '',
      sourceAuthority: 'website_domain',
      matchedSignals: ['domain:motion.com'],
      notesOverrideIdentityAllowed: false,
      nllmAuthority: 'advisory_only'
    },
    laneAwareLabelFacts: {
      source: 'manual',
      labelsReady: false
    }
  }));

  const state = motionState(hooks);
  const context = motionContext(hooks, state);
  const completedResult = completedMotionResult({ prefix: '300' });
  const completedRaw = completedRefreshResponse('runner-w300-motion-001', completedResult);
  const completedShape = hooks.actualAdapterResponseShapeW265(completedRaw, {
    phase: 'refresh',
    runnerTaskId: 'runner-w300-motion-001',
    idempotencyToken: 'motion-w300-token'
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
    submitTransport: () => submitResponse('runner-w300-motion-001', 'motion-w300-token'),
    pollTransport: () => completedRaw
  });

  assertCase(results, 'lane-resolution-readiness-contract-module-exists',
    /LANE_RESOLUTION_READINESS_SCHEMA_VERSION/.test(contractSource) &&
      laneReadiness.contractSummary().schema === 'forge.w300.lane-resolution-readiness.v1' &&
      trace.contract.module === 'src/contracts/laneResolutionReadiness.js',
    JSON.stringify(laneReadiness.contractSummary()));

  assertCase(results, 'contract-represents-required-fields-and-statuses',
    laneReadiness.contractSummary().requiredFactFields.length === 7 &&
      ['lane_resolution_ready', 'lane_resolution_needs_confirmation', 'lane_resolution_blocked_missing_website_evidence', 'lane_resolution_blocked_hidden_uncertainty', 'lane_resolution_not_ready']
        .every((status) => laneReadiness.contractSummary().statuses.indexOf(status) >= 0) &&
      trace.representedInputs.length >= 9,
    JSON.stringify(laneReadiness.contractSummary().statuses));

  assertCase(results, 'resolved-high-confidence-lane-facts-ready',
    ready.status === laneReadiness.LANE_RESOLUTION_READINESS_STATUSES.READY &&
      ready.ready === true &&
      ready.laneResolution.packId === 'industrial-distributor' &&
      ready.websiteEvidence.hasWebsiteEvidence === true &&
      ready.nllm.advisoryOnly === true,
    JSON.stringify(ready));

  assertCase(results, 'weak-or-conflicting-lane-facts-need-confirmation',
    needsConfirmation.status === laneReadiness.LANE_RESOLUTION_READINESS_STATUSES.NEEDS_CONFIRMATION &&
      needsConfirmation.ready === false &&
      needsConfirmation.blockedReasons.indexOf('lane_confirmation_required_before_lane_claims') >= 0,
    JSON.stringify(needsConfirmation));

  assertCase(results, 'missing-website-evidence-blocked',
    missingEvidence.status === laneReadiness.LANE_RESOLUTION_READINESS_STATUSES.BLOCKED_MISSING_WEBSITE_EVIDENCE &&
      missingEvidence.blockedReasons.indexOf('website_evidence_required_before_lane_readiness') >= 0,
    JSON.stringify(missingEvidence));

  assertCase(results, 'hidden-uncertainty-or-non-advisory-nllm-blocked',
    hiddenUncertainty.status === laneReadiness.LANE_RESOLUTION_READINESS_STATUSES.BLOCKED_HIDDEN_UNCERTAINTY &&
      hiddenUncertainty.blockedReasons.indexOf('nllm_must_remain_advisory_only_and_uncertainty_visible') >= 0,
    JSON.stringify(hiddenUncertainty));

  assertCase(results, 'not-ready-facts-produce-lane-resolution-not-ready',
    notReady.status === laneReadiness.LANE_RESOLUTION_READINESS_STATUSES.NOT_READY &&
      notReady.blockedReasons.indexOf('resolved_lane_pack_missing') >= 0 &&
      notReady.blockedReasons.indexOf('lane_confidence_missing') >= 0 &&
      notReady.blockedReasons.indexOf('lane_aware_labels_not_ready') >= 0,
    JSON.stringify(notReady));

  assertCase(results, 'contract-consumes-facts-without-replacing-runtime-authorities',
    ready.validationBoundary.w246ResolutionConsumedNotReplaced === true &&
      ready.validationBoundary.websiteEvidenceConsumedNotReplaced === true &&
      ready.validationBoundary.consultantTogglesConsumedNotReplaced === true &&
      ready.validationBoundary.w250LabelsConsumedNotReplaced === true &&
      ready.validationBoundary.w245ValidationConsumedNotReplaced === true &&
      ready.validationBoundary.w151ValidationConsumedNotReplaced === true &&
      ready.validationBoundary.w214SemanticGuardConsumedNotReplaced === true,
    JSON.stringify(ready.validationBoundary));

  assertCase(results, 'contract-cannot-choose-lane-change-confidence-override-render-mutate-or-write',
    Object.keys(ready.runtimeBoundary).every((key) => ready.runtimeBoundary[key] === true) &&
      trace.boundaries.canChooseLane === false &&
      trace.boundaries.canChangeConfidence === false &&
      trace.boundaries.canOverrideWebsiteEvidence === false &&
      trace.boundaries.canOverrideConsultantToggles === false &&
      trace.boundaries.canHideUncertainty === false &&
      trace.boundaries.canRenderUi === false &&
      trace.boundaries.canMutateState === false &&
      trace.boundaries.canImportRecords === false &&
      trace.boundaries.canCreateRecords === false &&
      trace.boundaries.canWriteTransactions === false &&
      trace.boundaries.canCreateOpenLinks === false &&
      trace.boundaries.canInvokeAdapter === false &&
      trace.boundaries.canDeclareW245W151W214Validity === false,
    JSON.stringify({ runtime: ready.runtimeBoundary, trace: trace.boundaries }));

  assertCase(results, 'module-not-wired-into-drawer-runtime-and-drawer-self-contained',
    !/laneResolutionReadiness/.test(userscript) &&
      !/require\(['\"][^'\"]*laneResolutionReadiness/.test(userscript) &&
      !/import\s+.*laneResolutionReadiness/.test(userscript) &&
      !/fetch\([^)]*laneResolutionReadiness/.test(userscript) &&
      !/localStorage\.setItem\([^)]*laneResolutionReadiness/.test(userscript),
    'drawer runtime has no W300 contract import or dependency');

  assertCase(results, 'w299-closure-and-w298-runtime-shape-remain-available',
    w299Trace.status === 'closure_and_lane_resolution_readiness_ready' &&
      w298Trace.status === 'runtime_shape_migration_ready' &&
      trace.continuity.w299ClosureReadinessMapAvailable === true &&
      trace.continuity.w298RuntimeShapeFieldCompatibleWithW278 === true,
    JSON.stringify({ w299: w299Trace.status, w298: w298Trace.status }));

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

  assertCase(results, 'returned-records-open-links-review-copy-and-weak-evidence-preserved',
    normalizedImport.visibleRecords.some((record) =>
      record.recordName === 'Motion Branch Fulfillment SKU' &&
      /Product SKU/.test(record.consultantLabel) &&
      record.safeToOpen === true &&
      /netsuite\.com\/app\/common\/item\/item\.nl\?id=30003/.test(record.supportedOpenUrl)
    ) &&
      /Live proof CTA/.test(html) &&
      weakStory.status === 'needs_lane_confirmation' &&
      /Confirm lane before opening proof records/.test(weakStory.openTarget) &&
      trace.continuity.returnedRecordNamesLabelsOpenLinksChanged === false &&
      trace.continuity.reviewRunVisibleCopyChanged === false &&
      trace.continuity.weakConflictingEvidenceConfirmationFirst === true,
    JSON.stringify({ records: normalizedImport.visibleRecords.map((record) => record.recordName), weak: weakStory.status }));

  assertCase(results, 'normal-consultant-ui-hides-diagnostics-and-no-runtime-authority-changes',
    !/script=6702|deploy=2|runner-w300-motion-001|finalGeneratedNamesJson|stack trace|schema/i.test(html) &&
      trace.guardrails.normalConsultantUiHidesEndpointProfileRawAdminDiagnostics === true &&
      trace.guardrails.runtimeBehaviorChanged === false &&
      trace.guardrails.connectedBuildFlowChanged === false &&
      trace.guardrails.recordCreationAuthorityChanged === false &&
      trace.guardrails.noDrawerCreatedRecords === true &&
      trace.guardrails.noDrawerTransactionWrites === true,
    JSON.stringify(trace.guardrails));

  assertCase(results, 'w300-report-trace-harness-and-check-registration-present',
    /W300 Lane Resolution Readiness Contract/.test(report) &&
      trace.schema === 'forge.w300.lane-resolution-readiness-contract.trace.v1' &&
      trace.nextRecommendedBlock === 'W301: Lane Resolution Readiness Bridge Without Lane Behavior Change' &&
      packageJson.scripts['harness:lane-resolution-readiness-contract-w300'] &&
      packageJson.scripts.check.includes('src/contracts/laneResolutionReadiness.js') &&
      packageJson.scripts.check.includes('run_w300_lane_resolution_readiness_contract_harness.js'),
    JSON.stringify({ trace: trace.schema, script: packageJson.scripts['harness:lane-resolution-readiness-contract-w300'] || '' }));

  printResults('W300 lane resolution readiness contract harness', results);
}

main();
