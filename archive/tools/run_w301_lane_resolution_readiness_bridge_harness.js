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

function casePacket(input) {
  return {
    input,
    drawerOutput: laneReadiness.normalizeLaneResolutionReadiness(input)
  };
}

function main() {
  const results = [];
  const hooks = loadHooks({ fetchMessage: 'live fetch disabled in W301 harness' });
  const userscript = read(userscriptPath);
  const packageJson = JSON.parse(readRepoFile('package.json'));
  const bridgeSource = readRepoFile('src', 'contracts', 'laneResolutionReadinessBridge.js');
  const report = readArchiveText('reports', 'w301_lane_resolution_readiness_bridge.md');
  const trace = readArchiveJson('trace_samples', 'w301_lane_resolution_readiness_bridge_trace.json');
  const w300Trace = readArchiveJson('trace_samples', 'w300_lane_resolution_readiness_contract_trace.json');
  const w299Trace = readArchiveJson('trace_samples', 'w299_story_coaching_runtime_closure_lane_resolution_readiness_trace.json');
  const w298Trace = readArchiveJson('trace_samples', 'w298_story_coaching_runtime_shape_migration_trace.json');

  const readyFacts = baseFacts();
  const needsConfirmationFacts = baseFacts({
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
  });
  const missingWebsiteEvidenceFacts = baseFacts({
    websiteEvidence: {
      website: '',
      websiteDomain: '',
      productFamily: '',
      matchedSignals: [],
      hasStrongWebsiteEvidence: false
    }
  });
  const hiddenUncertaintyFacts = baseFacts({
    nllm: {
      advisoryOnly: false,
      writeAuthority: 'write',
      creationAllowed: true,
      uncertaintyVisible: false,
      hardLimits: []
    },
    hideUncertainty: true
  });
  const notReadyFacts = baseFacts({
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
  });

  const bridgePacket = laneReadinessBridge.bridgeLaneResolutionReadiness({
    ready: casePacket(readyFacts),
    needsConfirmation: casePacket(needsConfirmationFacts),
    missingWebsiteEvidence: casePacket(missingWebsiteEvidenceFacts),
    hiddenUncertainty: casePacket(hiddenUncertaintyFacts),
    notReady: casePacket(notReadyFacts)
  });
  const readyValidation = laneReadinessBridge.validateLaneResolutionReadiness(
    laneReadiness.normalizeLaneResolutionReadiness(readyFacts),
    readyFacts
  );

  const state = motionState(hooks);
  const context = motionContext(hooks, state);
  const completedResult = completedMotionResult({ prefix: '301' });
  const completedRaw = completedRefreshResponse('runner-w301-motion-001', completedResult);
  const completedShape = hooks.actualAdapterResponseShapeW265(completedRaw, {
    phase: 'refresh',
    runnerTaskId: 'runner-w301-motion-001',
    idempotencyToken: 'motion-w301-token'
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
    submitTransport: () => submitResponse('runner-w301-motion-001', 'motion-w301-token'),
    pollTransport: () => completedRaw
  });

  assertCase(results, 'lane-resolution-readiness-bridge-module-exists',
    /LANE_RESOLUTION_READINESS_BRIDGE_SCHEMA_VERSION/.test(bridgeSource) &&
      laneReadinessBridge.exportedContractSummary().schema === 'forge.w301.lane-resolution-readiness-bridge.v1' &&
      trace.bridge.module === 'src/contracts/laneResolutionReadinessBridge.js',
    JSON.stringify(laneReadinessBridge.exportedContractSummary()));

  assertCase(results, 'bridge-validates-against-w300-contract',
    laneReadinessBridge.exportedContractSummary().governingContract === laneReadiness.LANE_RESOLUTION_READINESS_SCHEMA_VERSION &&
      bridgePacket.governingContract === laneReadiness.LANE_RESOLUTION_READINESS_SCHEMA_VERSION &&
      bridgePacket.status === 'bridge_ready' &&
      bridgePacket.failed.length === 0,
    JSON.stringify({ summary: laneReadinessBridge.exportedContractSummary(), bridge: bridgePacket.status }));

  assertCase(results, 'ready-needs-confirmation-missing-website-hidden-uncertainty-and-not-ready-compatible',
    bridgePacket.validations.length === 5 &&
      bridgePacket.validations.every((validation) => validation.status === 'field_compatible') &&
      bridgePacket.validations.map((validation) => validation.contractStatus).join('|') === [
        'lane_resolution_ready',
        'lane_resolution_needs_confirmation',
        'lane_resolution_blocked_missing_website_evidence',
        'lane_resolution_blocked_hidden_uncertainty',
        'lane_resolution_not_ready'
      ].join('|'),
    JSON.stringify(bridgePacket.validations.map((validation) => validation.contractStatus)));

  assertCase(results, 'bridge-consumes-lane-resolution-facts-without-replacing-runtime-authorities',
    readyValidation.guardrails.bridgeConsumesW246Resolution === true &&
      readyValidation.guardrails.bridgeConsumesWebsiteEvidence === true &&
      readyValidation.guardrails.bridgeConsumesConsultantToggles === true &&
      readyValidation.guardrails.bridgeConsumesW250Labels === true &&
      readyValidation.guardrails.bridgeConsumesW245Validation === true &&
      readyValidation.guardrails.bridgeConsumesW151Validation === true &&
      readyValidation.guardrails.bridgeConsumesW214SemanticGuard === true &&
      readyValidation.blockedReasonsCompatible === true &&
      readyValidation.matchedSignalsCompatible === true,
    JSON.stringify(readyValidation.guardrails));

  assertCase(results, 'bridge-cannot-choose-lanes-change-confidence-override-render-mutate-or-write',
    readyValidation.guardrails.bridgeCannotChooseLane === true &&
      readyValidation.guardrails.bridgeCannotChangeConfidence === true &&
      readyValidation.guardrails.bridgeCannotOverrideWebsiteEvidence === true &&
      readyValidation.guardrails.bridgeCannotOverrideConsultantToggles === true &&
      readyValidation.guardrails.bridgeCannotHideUncertainty === true &&
      readyValidation.guardrails.bridgeCannotRenderUi === true &&
      readyValidation.guardrails.bridgeCannotMutateState === true &&
      readyValidation.guardrails.bridgeCannotImportRecords === true &&
      readyValidation.guardrails.bridgeCannotCreateRecords === true &&
      readyValidation.guardrails.bridgeCannotWriteTransactions === true &&
      readyValidation.guardrails.bridgeCannotCreateOpenLinks === true &&
      readyValidation.guardrails.bridgeCannotInvokeAdapter === true &&
      Object.keys(bridgePacket.runtimeBoundary).every((key) => bridgePacket.runtimeBoundary[key] === true),
    JSON.stringify({ validation: readyValidation.guardrails, runtime: bridgePacket.runtimeBoundary }));

  assertCase(results, 'bridge-not-wired-into-drawer-runtime-and-drawer-self-contained',
    !/laneResolutionReadinessBridge/.test(userscript) &&
      !/require\(['\"][^'\"]*laneResolutionReadiness/.test(userscript) &&
      !/import\s+.*laneResolutionReadiness/.test(userscript) &&
      !/fetch\([^)]*laneResolutionReadiness/.test(userscript) &&
      !/localStorage\.setItem\([^)]*laneResolutionReadiness/.test(userscript),
    'drawer runtime has no W301 bridge import or dependency');

  assertCase(results, 'w300-contract-and-w299-closure-remain-available',
    w300Trace.status === 'contract_ready' &&
      w299Trace.status === 'closure_and_lane_resolution_readiness_ready' &&
      trace.continuity.w300ContractAvailable === true &&
      trace.continuity.w299ClosureReadinessMapAvailable === true,
    JSON.stringify({ w300: w300Trace.status, w299: w299Trace.status }));

  assertCase(results, 'w298-runtime-shape-remains-field-compatible-with-w278',
    w298Trace.status === 'runtime_shape_migration_ready' &&
      trace.continuity.w298RuntimeShapeFieldCompatibleWithW278 === true,
    JSON.stringify({ w298: w298Trace.status }));

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
      /netsuite\.com\/app\/common\/item\/item\.nl\?id=30103/.test(record.supportedOpenUrl)
    ) &&
      /Live proof CTA/.test(html) &&
      weakStory.status === 'needs_lane_confirmation' &&
      /Confirm lane before opening proof records/.test(weakStory.openTarget) &&
      trace.continuity.returnedRecordNamesLabelsOpenLinksChanged === false &&
      trace.continuity.reviewRunVisibleCopyChanged === false &&
      trace.continuity.weakConflictingEvidenceConfirmationFirst === true,
    JSON.stringify({ records: normalizedImport.visibleRecords.map((record) => record.recordName), weak: weakStory.status }));

  assertCase(results, 'normal-consultant-ui-hides-diagnostics-and-no-runtime-authority-changes',
    !/script=6702|deploy=2|runner-w301-motion-001|finalGeneratedNamesJson|stack trace|schema/i.test(html) &&
      trace.guardrails.normalConsultantUiHidesEndpointProfileRawAdminDiagnostics === true &&
      trace.guardrails.runtimeBehaviorChanged === false &&
      trace.guardrails.connectedBuildFlowChanged === false &&
      trace.guardrails.recordCreationAuthorityChanged === false &&
      trace.guardrails.noDrawerCreatedRecords === true &&
      trace.guardrails.noDrawerTransactionWrites === true,
    JSON.stringify(trace.guardrails));

  assertCase(results, 'w301-report-trace-harness-and-check-registration-present',
    /W301 Lane Resolution Readiness Bridge/.test(report) &&
      trace.schema === 'forge.w301.lane-resolution-readiness-bridge.trace.v1' &&
      trace.nextRecommendedBlock === 'W302: Lane Resolution Readiness Runtime Shape Migration Without Lane Behavior Change' &&
      packageJson.scripts['harness:lane-resolution-readiness-bridge-w301'] &&
      packageJson.scripts.check.includes('src/contracts/laneResolutionReadinessBridge.js') &&
      packageJson.scripts.check.includes('run_w301_lane_resolution_readiness_bridge_harness.js'),
    JSON.stringify({ trace: trace.schema, script: packageJson.scripts['harness:lane-resolution-readiness-bridge-w301'] || '' }));

  printResults('W301 lane resolution readiness bridge harness', results);
}

main();
