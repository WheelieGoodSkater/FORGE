#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const futureReadiness = require('../../src/contracts/futureLanePackExpansionReadiness');
const futureBridge = require('../../src/contracts/futureLanePackExpansionReadinessBridge');
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

function receiptChecks() {
  return [
    'lane_choice_explained',
    'open_target_explained',
    'proof_evidence_explained',
    'notes_contribution_explained',
    'nllm_limits_explained',
    'uncertainty_explained'
  ].map((id) => ({ id, status: 'pass' }));
}

function baseFacts(overrides = {}) {
  const base = {
    proposalIdentity: {
      proposedPackId: 'electrical-components-distributor',
      laneId: 'distribution',
      subIndustryId: 'electrical-components',
      label: 'Electrical Components Distributor',
      source: 'nllm_advisory_draft_for_human_review'
    },
    sourcePackComparison: {
      sourcePackFile: 'src/contracts/lanePacks.js',
      basePackId: 'industrial-distributor',
      candidatePackId: 'electrical-components-distributor',
      comparisonReady: true,
      sourcePackMutationRequested: false
    },
    websiteCategoryEvidence: {
      website: 'https://example-electrical-distributor.com',
      domain: 'example-electrical-distributor.com',
      category: 'Electrical components distributor',
      signals: ['electrical components', 'wire', 'switchgear', 'branch availability'],
      evidenceReady: true,
      canOverrideWebsiteEvidence: false
    },
    recordRoleCoverage: {
      required: ['customer', 'sales_order', 'branch_or_product_sku'],
      optional: ['supplier_lead_time_context'],
      invalid: ['formula_or_batch_structure', 'work_order_or_wip_object'],
      coverageReady: true
    },
    vocabularyCoverage: {
      allowed: ['branch availability', 'supplier lead time', 'project fulfillment'],
      forbidden: ['ingredient batch', 'style matrix', 'production routing'],
      coverageReady: true
    },
    storyCopyCoverage: {
      proofMove: 'Open the component SKU and prove branch availability, supplier timing, and replenishment confidence.',
      storyAnchor: 'The buyer needs confidence that project-critical components can be promised from the right location.',
      roiSoWhat: 'Protect service levels and margin by catching supplier and branch exceptions before project fulfillment misses.',
      competitiveContrast: 'NetSuite connects order promise, branch inventory, and replenishment action without a separate lookup path.',
      coverageReady: true
    },
    nllmDraftIntake: {
      advisoryOnly: true,
      writeAuthority: 'none',
      creationAllowed: false,
      uncertaintyVisible: true,
      allowedTasks: ['summarizeWebsiteAndCategoryEvidence', 'draftLanePackSuggestionsForHumanReview'],
      hardLimits: ['cannotOverrideWebsiteEvidence', 'cannotOverrideConsultantToggles', 'cannotCreateRecords']
    },
    authoringReview: {
      status: 'review_ready',
      installAllowed: false,
      humanReviewRequired: true,
      nllmAdvisoryOnly: true
    },
    proposedDiff: {
      status: 'compared_to_existing_pack',
      basePackId: 'industrial-distributor',
      candidatePackId: 'electrical-components-distributor',
      changes: [
        { area: 'websiteSignals' },
        { area: 'recordRoles' },
        { area: 'vocabulary' },
        { area: 'liveDemo' }
      ]
    },
    adminReview: {
      status: 'review_rendered',
      rendererReady: true,
      requiredSectionsVisible: true,
      hiddenFromNormalUi: true,
      noInstallAction: true
    },
    receiptDrivenQa: {
      status: 'qa_ready',
      checks: receiptChecks()
    },
    laneResolutionCompatibility: {
      status: 'lane_resolution_ready',
      ready: true,
      consumesFactsOnly: true,
      changesLaneBehavior: false
    },
    humanReviewGate: {
      humanReviewRequired: true,
      reviewOnly: true,
      nonInstallable: true,
      installAllowed: false,
      autoInstall: false
    },
    uncertaintyGate: {
      uncertaintyVisible: true,
      weakEvidenceConfirmationRequired: true,
      weakOrConflictingEvidence: false,
      hideUncertainty: false
    }
  };
  return Object.assign({}, base, overrides);
}

function packet(input) {
  return {
    input,
    drawerOutput: futureReadiness.normalizeFutureLanePackExpansionReadiness(input)
  };
}

function main() {
  const results = [];
  const hooks = loadHooks({ fetchMessage: 'live fetch disabled in W305 harness' });
  const userscript = read(userscriptPath);
  const packageJson = JSON.parse(readRepoFile('package.json'));
  const bridgeSource = readRepoFile('src', 'contracts', 'futureLanePackExpansionReadinessBridge.js');
  const contractSource = readRepoFile('src', 'contracts', 'futureLanePackExpansionReadiness.js');
  const lanePacksSource = readRepoFile('src', 'contracts', 'lanePacks.js');
  const report = readArchiveText('reports', 'w305_future_lane_pack_expansion_readiness_bridge.md');
  const trace = readArchiveJson('trace_samples', 'w305_future_lane_pack_expansion_readiness_bridge_trace.json');
  const w303Trace = readArchiveJson('trace_samples', 'w303_lane_resolution_optimization_closure_future_expansion_readiness_trace.json');
  const w302Trace = readArchiveJson('trace_samples', 'w302_lane_resolution_readiness_runtime_shape_migration_trace.json');
  const w304Trace = readArchiveJson('trace_samples', 'w304_future_lane_pack_expansion_readiness_contract_trace.json');

  const readyFacts = baseFacts();
  const needsEvidenceFacts = baseFacts({
    websiteCategoryEvidence: {
      website: '',
      domain: '',
      category: '',
      signals: [],
      evidenceReady: false,
      canOverrideWebsiteEvidence: false
    }
  });
  const unsafeFacts = baseFacts({
    nllmDraftIntake: {
      advisoryOnly: false,
      writeAuthority: 'write',
      creationAllowed: true,
      uncertaintyVisible: false,
      hardLimits: []
    },
    uncertaintyGate: {
      uncertaintyVisible: false,
      weakEvidenceConfirmationRequired: true,
      hideUncertainty: true
    }
  });
  const autoInstallFacts = baseFacts({
    humanReviewGate: {
      humanReviewRequired: true,
      reviewOnly: false,
      nonInstallable: false,
      installAllowed: true,
      autoInstall: true
    }
  });
  const notReadyFacts = baseFacts({
    proposedDiff: {
      status: 'draft',
      basePackId: 'industrial-distributor',
      candidatePackId: 'electrical-components-distributor',
      changes: [{ area: 'websiteSignals' }]
    },
    receiptDrivenQa: {
      status: 'qa_pending',
      checks: []
    }
  });

  const bridgePacket = futureBridge.bridgeFutureLanePackExpansionReadiness({
    readyForReview: packet(readyFacts),
    needsEvidence: packet(needsEvidenceFacts),
    unsafeAuthority: packet(unsafeFacts),
    autoInstall: packet(autoInstallFacts),
    notReady: packet(notReadyFacts)
  });
  const readyValidation = futureBridge.validateFutureLanePackExpansionReadiness(
    futureReadiness.normalizeFutureLanePackExpansionReadiness(readyFacts),
    readyFacts
  );

  const state = motionState(hooks);
  const context = motionContext(hooks, state);
  const completedResult = completedMotionResult({ prefix: '305' });
  const completedRaw = completedRefreshResponse('runner-w305-motion-001', completedResult);
  const completedShape = hooks.actualAdapterResponseShapeW265(completedRaw, {
    phase: 'refresh',
    runnerTaskId: 'runner-w305-motion-001',
    idempotencyToken: 'motion-w305-token'
  });
  const completedGuard = hooks.validateDccFinalNamingImportPayload(completedShape.finalGeneratedNamesJson, state, context.lane, context.page, context.recommendation);
  const semanticGuard = hooks.completedRunnerResultSemanticGuardW214(completedGuard.finalNaming, state, context.lane, completedShape.finalGeneratedNamesJson);
  const normalizedImport = hooks.canonicalImportResultNormalizationW245(completedShape.finalGeneratedNamesJson, state, context.lane, context.page, context.recommendation);
  const html = hooks.renderConsultantStorySurfaceW248(normalizedImport.consultantStorySurfaceW247);
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
    submitTransport: () => submitResponse('runner-w305-motion-001', 'motion-w305-token'),
    pollTransport: () => completedRaw
  });

  assertCase(results, 'future-lane-pack-expansion-readiness-bridge-module-exists',
    /FUTURE_LANE_PACK_EXPANSION_READINESS_BRIDGE_SCHEMA_VERSION/.test(bridgeSource) &&
      /validateFutureLanePackExpansionReadiness/.test(bridgeSource) &&
      /bridgeFutureLanePackExpansionReadiness/.test(bridgeSource) &&
      futureBridge.exportedContractSummary().schema === 'forge.w305.future-lane-pack-expansion-readiness-bridge.v1' &&
      trace.bridgeModule === 'src/contracts/futureLanePackExpansionReadinessBridge.js',
    JSON.stringify(futureBridge.exportedContractSummary()));

  assertCase(results, 'bridge-validates-against-w304-contract',
    bridgePacket.status === 'bridge_ready' &&
      bridgePacket.governingContract === futureReadiness.FUTURE_LANE_PACK_EXPANSION_READINESS_SCHEMA_VERSION &&
      readyValidation.status === 'field_compatible' &&
      readyValidation.contractOutput.schema === 'forge.w304.future-lane-pack-expansion-readiness.v1' &&
      report.indexOf('W304 future lane-pack expansion readiness contract') >= 0,
    JSON.stringify({ bridgeStatus: bridgePacket.status, readyValidation: readyValidation.status }));

  assertCase(results, 'ready-needs-evidence-unsafe-auto-install-not-ready-cases-field-compatible',
    bridgePacket.validations.length === 5 &&
      bridgePacket.validations.every((item) => item.status === 'field_compatible') &&
      bridgePacket.validations.map((item) => item.contractStatus).indexOf('future_lane_pack_expansion_ready_for_review') >= 0 &&
      bridgePacket.validations.map((item) => item.contractStatus).indexOf('future_lane_pack_expansion_needs_evidence') >= 0 &&
      bridgePacket.validations.map((item) => item.contractStatus).indexOf('future_lane_pack_expansion_blocked_unsafe_authority') >= 0 &&
      bridgePacket.validations.map((item) => item.contractStatus).indexOf('future_lane_pack_expansion_blocked_auto_install') >= 0 &&
      bridgePacket.validations.map((item) => item.contractStatus).indexOf('future_lane_pack_expansion_not_ready') >= 0,
    JSON.stringify(bridgePacket.validations.map((item) => item.contractStatus)));

  assertCase(results, 'bridge-consumes-facts-but-does-not-replace-governed-workflows',
    bridgePacket.consumedNotReplacedBoundary.w247AuthoringReviewConsumedNotReplaced === true &&
      bridgePacket.consumedNotReplacedBoundary.w251ProposedDiffConsumedNotReplaced === true &&
      bridgePacket.consumedNotReplacedBoundary.w252AdminReviewConsumedNotReplaced === true &&
      bridgePacket.consumedNotReplacedBoundary.w255ReceiptDrivenQaConsumedNotReplaced === true &&
      bridgePacket.consumedNotReplacedBoundary.w274WorkflowConsumedNotReplaced === true &&
      bridgePacket.consumedNotReplacedBoundary.w277BridgeConsumedNotReplaced === true &&
      bridgePacket.consumedNotReplacedBoundary.w300W301W302LaneReadinessConsumedNotReplaced === true &&
      bridgePacket.consumedNotReplacedBoundary.w245ValidationConsumedNotReplaced === true &&
      bridgePacket.consumedNotReplacedBoundary.w151ValidationConsumedNotReplaced === true &&
      bridgePacket.consumedNotReplacedBoundary.w214SemanticGuardConsumedNotReplaced === true,
    JSON.stringify(bridgePacket.consumedNotReplacedBoundary));

  assertCase(results, 'bridge-cannot-take-runtime-authority',
    bridgePacket.runtimeBoundary.noSourcePackMutation === true &&
      bridgePacket.runtimeBoundary.noProposalInstall === true &&
      bridgePacket.runtimeBoundary.noLaneChoice === true &&
      bridgePacket.runtimeBoundary.noConfidenceChange === true &&
      bridgePacket.runtimeBoundary.noWebsiteEvidenceOverride === true &&
      bridgePacket.runtimeBoundary.noConsultantToggleOverride === true &&
      bridgePacket.runtimeBoundary.noHiddenUncertainty === true &&
      bridgePacket.runtimeBoundary.noUiRendering === true &&
      bridgePacket.runtimeBoundary.noStateMutation === true &&
      bridgePacket.runtimeBoundary.noRecordImport === true &&
      bridgePacket.runtimeBoundary.noRecordCreation === true &&
      bridgePacket.runtimeBoundary.noTransactionWrites === true &&
      bridgePacket.runtimeBoundary.noOpenLinkCreation === true &&
      bridgePacket.runtimeBoundary.noAdapterInvocation === true &&
      bridgePacket.runtimeBoundary.noW245W151W214ValidityDeclaration === true,
    JSON.stringify(bridgePacket.runtimeBoundary));

  assertCase(results, 'bridge-not-wired-into-drawer-runtime-and-drawer-self-contained',
    userscript.indexOf('futureLanePackExpansionReadinessBridge') === -1 &&
      !/require\(['"]\.\/src\/contracts\/futureLanePackExpansionReadinessBridge/.test(userscript) &&
      !/import\s+.*futureLanePackExpansionReadinessBridge/.test(userscript) &&
      !/fetch\([^)]*futureLanePackExpansionReadinessBridge/.test(userscript) &&
      !/localStorage\.setItem\([^)]*futureLanePackExpansionReadinessBridge/.test(userscript),
    'bridge remains extraction-only');

  assertCase(results, 'w304-contract-available-and-unchanged',
    /future_lane_pack_expansion_ready_for_review/.test(contractSource) &&
      futureReadiness.contractSummary().schema === 'forge.w304.future-lane-pack-expansion-readiness.v1' &&
      w304Trace.contractModule === 'src/contracts/futureLanePackExpansionReadiness.js' &&
      w304Trace.guardrails.sourceLanePacksMutated === false,
    JSON.stringify({ w304Trace: w304Trace.status }));

  assertCase(results, 'w303-closure-map-and-w302-lane-readiness-continuity-available',
    w303Trace.status === 'closure_and_future_expansion_readiness_ready' &&
      w303Trace.continuity &&
      w303Trace.continuity.w302RuntimeShapeFieldCompatibleWithW301 === true &&
      w302Trace.status === 'runtime_shape_migration_ready' &&
      laneReadinessBridge.exportedContractSummary().schema === 'forge.w301.lane-resolution-readiness-bridge.v1',
    JSON.stringify({ w303: w303Trace.status, w302: w302Trace.status }));

  assertCase(results, 'w274-and-w277-lane-pack-expansion-review-contracts-available',
    laneExpansion.exportedContractSummary().schema === 'forge.w274.lane-pack-expansion-workflow.v1' &&
      laneReviewBridge.exportedContractSummary().schema === 'forge.w277.lane-pack-review-bridge.v1' &&
      trace.continuity.w274LanePackExpansionWorkflowAvailable === true &&
      trace.continuity.w277LanePackReviewBridgeAvailable === true,
    JSON.stringify({ w274: laneExpansion.exportedContractSummary().schema, w277: laneReviewBridge.exportedContractSummary().schema }));

  assertCase(results, 'w264-w265-w245-w151-w214-behavior-unchanged',
    w264Flow.status === 'records_imported' &&
      completedShape.runnerTaskId === 'runner-w305-motion-001' &&
      completedGuard.valid === true &&
      semanticGuard.valid === true &&
      normalizedImport.status === 'display_ready_records_normalized' &&
      normalizedImport.visibleRecords.length >= 3,
    JSON.stringify({ flow: w264Flow.status, imported: normalizedImport.visibleRecords.length }));

  assertCase(results, 'returned-records-labels-open-links-review-copy-unchanged',
    normalizedImport.visibleRecords.some((record) => record.id === '30503' && record.consultantLabel === 'Product SKU' && /item\.nl\?id=30503/.test(record.url || '')) &&
      html.indexOf('Live proof CTA') >= 0 &&
      html.indexOf('Product SKU') >= 0 &&
      html.indexOf('Evidence receipt') >= 0 &&
      html.indexOf('Guided demo sequence') >= 0,
    JSON.stringify(normalizedImport.visibleRecords.map((record) => ({ label: record.label, id: record.id }))));

  assertCase(results, 'weak-conflicting-evidence-remains-confirmation-first',
    weakStory.status === 'needs_lane_confirmation' &&
      /confirm/i.test(weakStory.openTarget || '') &&
      /not strong enough/i.test(weakStory.safeClaim || '') &&
      trace.continuity.weakConflictingEvidenceConfirmationFirst === true,
    JSON.stringify({ status: weakStory.status, openTarget: weakStory.openTarget }));

  assertCase(results, 'normal-consultant-ui-hides-endpoint-profile-raw-admin-diagnostics',
    html.indexOf('script=6702') === -1 &&
      html.indexOf('runner-w305-motion-001') === -1 &&
      html.indexOf('finalGeneratedNamesJson') === -1 &&
      html.indexOf('schema') === -1 &&
      trace.guardrails.normalConsultantUiHidesEndpointProfileRawAdminDiagnostics === true,
    'normal story html remains consultant-safe');

  assertCase(results, 'no-runtime-authority-source-pack-mutation-or-auto-install-introduced',
    lanePacksSource.indexOf('electrical-components-distributor') === -1 &&
      trace.guardrails.runtimeBehaviorChanged === false &&
      trace.guardrails.connectedBuildFlowChanged === false &&
      trace.guardrails.recordCreationAuthorityChanged === false &&
      trace.guardrails.sourceLanePacksMutated === false &&
      trace.guardrails.autoInstallIntroduced === false &&
      trace.guardrails.noDrawerCreatedRecords === true &&
      trace.guardrails.noDrawerTransactionWrites === true,
    JSON.stringify(trace.guardrails));

  assertCase(results, 'w305-report-trace-harness-check-registration-present',
    report.indexOf('Status: `bridge_ready`') >= 0 &&
      trace.status === 'bridge_ready' &&
      packageJson.scripts.check.indexOf('src/contracts/futureLanePackExpansionReadinessBridge.js') >= 0 &&
      packageJson.scripts.check.indexOf('run_w305_future_lane_pack_expansion_readiness_bridge_harness.js') >= 0 &&
      packageJson.scripts['harness:future-lane-pack-expansion-readiness-bridge-w305'] === 'node archive/tools/run_w305_future_lane_pack_expansion_readiness_bridge_harness.js',
    JSON.stringify({ trace: trace.status, script: packageJson.scripts['harness:future-lane-pack-expansion-readiness-bridge-w305'] }));

  printResults('W305 Future Lane Pack Expansion Readiness Bridge Harness', results);
}

main();
