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

function casePacket(hooks, input) {
  return {
    input,
    drawerOutput: hooks.futureExpansionReadinessRuntimeShapeW306(input)
  };
}

function main() {
  const results = [];
  const hooks = loadHooks({ fetchMessage: 'live fetch disabled in W306 harness' });
  const userscript = read(userscriptPath);
  const packageJson = JSON.parse(readRepoFile('package.json'));
  const report = readArchiveText('reports', 'w306_future_lane_pack_expansion_readiness_runtime_shape_migration.md');
  const trace = readArchiveJson('trace_samples', 'w306_future_lane_pack_expansion_readiness_runtime_shape_migration_trace.json');
  const w305Trace = readArchiveJson('trace_samples', 'w305_future_lane_pack_expansion_readiness_bridge_trace.json');
  const w304Trace = readArchiveJson('trace_samples', 'w304_future_lane_pack_expansion_readiness_contract_trace.json');
  const w303Trace = readArchiveJson('trace_samples', 'w303_lane_resolution_optimization_closure_future_expansion_readiness_trace.json');
  const w302Trace = readArchiveJson('trace_samples', 'w302_lane_resolution_readiness_runtime_shape_migration_trace.json');
  const lanePacksSource = readRepoFile('src', 'contracts', 'lanePacks.js');

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
    readyForReview: casePacket(hooks, readyFacts),
    needsEvidence: casePacket(hooks, needsEvidenceFacts),
    unsafeAuthority: casePacket(hooks, unsafeFacts),
    autoInstall: casePacket(hooks, autoInstallFacts),
    notReady: casePacket(hooks, notReadyFacts)
  });
  const readyRuntimeShape = hooks.futureExpansionReadinessRuntimeShapeW306(readyFacts);
  const readyContractShape = futureReadiness.normalizeFutureLanePackExpansionReadiness(readyFacts);

  const state = motionState(hooks);
  const context = motionContext(hooks, state);
  const completedResult = completedMotionResult({ prefix: '306' });
  const completedRaw = completedRefreshResponse('runner-w306-motion-001', completedResult);
  const completedShape = hooks.actualAdapterResponseShapeW265(completedRaw, {
    phase: 'refresh',
    runnerTaskId: 'runner-w306-motion-001',
    idempotencyToken: 'motion-w306-token'
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
    submitTransport: () => submitResponse('runner-w306-motion-001', 'motion-w306-token'),
    pollTransport: () => completedRaw
  });

  assertCase(results, 'w303-through-w305-source-anchors-present-or-mapped',
    typeof hooks.reviewProposedLanePackChangeW247 === 'function' &&
      typeof hooks.lanePackProposedChangeDiffW251 === 'function' &&
      typeof hooks.renderLanePackDiffReviewW252 === 'function' &&
      typeof hooks.receiptDrivenLaneExpansionQaW255 === 'function' &&
      typeof hooks.laneResolutionReadinessRuntimeShapeW302 === 'function' &&
      typeof hooks.futureExpansionReadinessRuntimeShapeW306 === 'function' &&
      /src\/contracts\/lanePacks\.js/.test(readyRuntimeShape.sourcePackComparison.sourcePackFile),
    JSON.stringify({ schema: readyRuntimeShape.schema, source: readyRuntimeShape.source }));

  assertCase(results, 'future-expansion-readiness-fact-assembly-field-compatible-with-w305',
    bridgePacket.status === 'bridge_ready' &&
      bridgePacket.validations.length === 5 &&
      bridgePacket.validations.every((item) => item.status === 'field_compatible') &&
      bridgePacket.validations.map((item) => item.contractStatus).indexOf('future_lane_pack_expansion_ready_for_review') >= 0 &&
      bridgePacket.validations.map((item) => item.contractStatus).indexOf('future_lane_pack_expansion_needs_evidence') >= 0 &&
      bridgePacket.validations.map((item) => item.contractStatus).indexOf('future_lane_pack_expansion_blocked_unsafe_authority') >= 0 &&
      bridgePacket.validations.map((item) => item.contractStatus).indexOf('future_lane_pack_expansion_blocked_auto_install') >= 0 &&
      bridgePacket.validations.map((item) => item.contractStatus).indexOf('future_lane_pack_expansion_not_ready') >= 0,
    JSON.stringify(bridgePacket.validations.map((item) => item.contractStatus)));

  assertCase(results, 'w247-w251-w252-w255-w274-w277-workflows-remain-outside-migrated-helper',
    readyRuntimeShape.consumedNotReplacedBoundary.w247AuthoringReviewConsumedNotReplaced === true &&
      readyRuntimeShape.consumedNotReplacedBoundary.w251ProposedDiffConsumedNotReplaced === true &&
      readyRuntimeShape.consumedNotReplacedBoundary.w252AdminReviewConsumedNotReplaced === true &&
      readyRuntimeShape.consumedNotReplacedBoundary.w255ReceiptDrivenQaConsumedNotReplaced === true &&
      readyRuntimeShape.consumedNotReplacedBoundary.w274WorkflowConsumedNotReplaced === true &&
      readyRuntimeShape.consumedNotReplacedBoundary.w277BridgeConsumedNotReplaced === true &&
      hooks.reviewProposedLanePackChangeW247({}).schema === 'forge.lane-pack-authoring-review.v1',
    JSON.stringify(readyRuntimeShape.consumedNotReplacedBoundary));

  assertCase(results, 'w300-w302-lane-readiness-and-w245-w151-w214-validation-remain-outside-migrated-helper',
    readyRuntimeShape.consumedNotReplacedBoundary.w300W301W302LaneReadinessConsumedNotReplaced === true &&
      readyRuntimeShape.consumedNotReplacedBoundary.w245ValidationConsumedNotReplaced === true &&
      readyRuntimeShape.consumedNotReplacedBoundary.w151ValidationConsumedNotReplaced === true &&
      readyRuntimeShape.consumedNotReplacedBoundary.w214SemanticGuardConsumedNotReplaced === true &&
      hooks.laneResolutionReadinessRuntimeShapeW302({ laneResolution: { packId: 'industrial-distributor', confidence: 'high' }, websiteEvidence: { website: 'https://example.com' }, nllm: { advisoryOnly: true, writeAuthority: 'none', uncertaintyVisible: true, hardLimits: ['cannotCreateRecords'] } }).schema === 'forge.w302.lane-resolution-readiness-runtime-shape.v1',
    JSON.stringify(readyRuntimeShape.consumedNotReplacedBoundary));

  assertCase(results, 'source-lane-packs-remain-unchanged',
    lanePacksSource.indexOf('electrical-components-distributor') === -1 &&
      readyRuntimeShape.sourcePackComparison.sourcePackFile === 'src/contracts/lanePacks.js' &&
      readyContractShape.sourcePackComparison.sourcePackMutationRequested === false,
    'candidate remains proposed/review-only and source packs are not mutated');

  assertCase(results, 'migrated-helper-cannot-take-runtime-authority',
    readyRuntimeShape.runtimeBoundary.noSourcePackMutation === true &&
      readyRuntimeShape.runtimeBoundary.noProposalInstall === true &&
      readyRuntimeShape.runtimeBoundary.noLaneChoice === true &&
      readyRuntimeShape.runtimeBoundary.noConfidenceChange === true &&
      readyRuntimeShape.runtimeBoundary.noWebsiteEvidenceOverride === true &&
      readyRuntimeShape.runtimeBoundary.noConsultantToggleOverride === true &&
      readyRuntimeShape.runtimeBoundary.noHiddenUncertainty === true &&
      readyRuntimeShape.runtimeBoundary.noUiRendering === true &&
      readyRuntimeShape.runtimeBoundary.noVisibleCopyChange === true &&
      readyRuntimeShape.runtimeBoundary.noStateMutation === true &&
      readyRuntimeShape.runtimeBoundary.noRecordImport === true &&
      readyRuntimeShape.runtimeBoundary.noRecordCreation === true &&
      readyRuntimeShape.runtimeBoundary.noTransactionWrites === true &&
      readyRuntimeShape.runtimeBoundary.noOpenLinkCreation === true &&
      readyRuntimeShape.runtimeBoundary.noAdapterInvocation === true &&
      readyRuntimeShape.runtimeBoundary.noW245W151W214ValidityDeclaration === true,
    JSON.stringify(readyRuntimeShape.runtimeBoundary));

  assertCase(results, 'drawer-self-contained-no-runtime-require-external-dependency-network-or-storage-write',
    !/require\(['"]\.\/src\/contracts\/futureLanePackExpansionReadiness/.test(userscript) &&
      !/import\s+.*futureLanePackExpansionReadiness/.test(userscript) &&
      !/fetch\([^)]*futureLanePackExpansionReadiness/.test(userscript) &&
      !/localStorage\.setItem\([^)]*futureLanePackExpansionReadiness/.test(userscript),
    'drawer-local W306 helper does not load contract modules at runtime');

  assertCase(results, 'w305-bridge-and-w304-contract-remain-available',
    futureBridge.exportedContractSummary().schema === 'forge.w305.future-lane-pack-expansion-readiness-bridge.v1' &&
      futureReadiness.contractSummary().schema === 'forge.w304.future-lane-pack-expansion-readiness.v1' &&
      w305Trace.status === 'bridge_ready' &&
      w304Trace.status === 'contract_ready',
    JSON.stringify({ w305: w305Trace.status, w304: w304Trace.status }));

  assertCase(results, 'w303-closure-and-w302-runtime-shape-remain-available',
    w303Trace.status === 'closure_and_future_expansion_readiness_ready' &&
      w302Trace.status === 'runtime_shape_migration_ready' &&
      laneReadinessBridge.exportedContractSummary().schema === 'forge.w301.lane-resolution-readiness-bridge.v1',
    JSON.stringify({ w303: w303Trace.status, w302: w302Trace.status }));

  assertCase(results, 'w274-and-w277-lane-pack-expansion-review-contracts-remain-available',
    laneExpansion.exportedContractSummary().schema === 'forge.w274.lane-pack-expansion-workflow.v1' &&
      laneReviewBridge.exportedContractSummary().schema === 'forge.w277.lane-pack-review-bridge.v1' &&
      trace.continuity.w274LanePackExpansionWorkflowAvailable === true &&
      trace.continuity.w277LanePackReviewBridgeAvailable === true,
    JSON.stringify({ w274: laneExpansion.exportedContractSummary().schema, w277: laneReviewBridge.exportedContractSummary().schema }));

  assertCase(results, 'w264-w265-w245-w151-w214-behavior-remains-unchanged',
    w264Flow.status === 'records_imported' &&
      completedShape.runnerTaskId === 'runner-w306-motion-001' &&
      completedGuard.valid === true &&
      semanticGuard.valid === true &&
      normalizedImport.status === 'display_ready_records_normalized' &&
      normalizedImport.visibleRecords.length >= 3,
    JSON.stringify({ flow: w264Flow.status, records: normalizedImport.visibleRecords.length }));

  assertCase(results, 'returned-records-open-links-and-review-run-visible-copy-unchanged',
    normalizedImport.visibleRecords.some((record) => record.id === '30603' && record.consultantLabel === 'Product SKU' && /item\.nl\?id=30603/.test(record.url || '')) &&
      html.indexOf('Live proof CTA') >= 0 &&
      html.indexOf('Product SKU') >= 0 &&
      html.indexOf('Evidence receipt') >= 0 &&
      html.indexOf('Guided demo sequence') >= 0,
    JSON.stringify(normalizedImport.visibleRecords.map((record) => ({ id: record.id, label: record.consultantLabel || record.label }))));

  assertCase(results, 'weak-conflicting-evidence-remains-confirmation-first',
    weakStory.status === 'needs_lane_confirmation' &&
      /confirm/i.test(weakStory.openTarget || '') &&
      /not strong enough/i.test(weakStory.safeClaim || '') &&
      trace.continuity.weakConflictingEvidenceConfirmationFirst === true,
    JSON.stringify({ status: weakStory.status, openTarget: weakStory.openTarget }));

  assertCase(results, 'normal-consultant-ui-hides-endpoint-profile-raw-admin-diagnostics',
    html.indexOf('script=6702') === -1 &&
      html.indexOf('runner-w306-motion-001') === -1 &&
      html.indexOf('finalGeneratedNamesJson') === -1 &&
      html.indexOf('schema') === -1 &&
      trace.guardrails.normalConsultantUiHidesEndpointProfileRawAdminDiagnostics === true,
    'normal story html remains consultant-safe');

  assertCase(results, 'no-runtime-authority-source-pack-mutation-or-auto-install-introduced',
    trace.guardrails.runtimeBehaviorChanged === false &&
      trace.guardrails.connectedBuildFlowChanged === false &&
      trace.guardrails.recordCreationAuthorityChanged === false &&
      trace.guardrails.sourceLanePacksMutated === false &&
      trace.guardrails.autoInstallIntroduced === false &&
      trace.guardrails.noDrawerCreatedRecords === true &&
      trace.guardrails.noDrawerTransactionWrites === true,
    JSON.stringify(trace.guardrails));

  assertCase(results, 'w306-report-trace-harness-check-registration-present',
    report.indexOf('Status: `runtime_shape_migration_ready`') >= 0 &&
      trace.status === 'runtime_shape_migration_ready' &&
      packageJson.scripts.check.indexOf('run_w306_future_lane_pack_expansion_readiness_runtime_shape_migration_harness.js') >= 0 &&
      packageJson.scripts['harness:future-lane-pack-expansion-readiness-runtime-shape-migration-w306'] === 'node archive/tools/run_w306_future_lane_pack_expansion_readiness_runtime_shape_migration_harness.js',
    JSON.stringify({ trace: trace.status, script: packageJson.scripts['harness:future-lane-pack-expansion-readiness-runtime-shape-migration-w306'] }));

  printResults('W306 Future Lane Pack Expansion Readiness Runtime Shape Migration Harness', results);
}

main();
