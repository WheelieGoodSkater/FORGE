#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const futureReadiness = require('../../src/contracts/futureLanePackExpansionReadiness');
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

function statusFor(facts) {
  return futureReadiness.normalizeFutureLanePackExpansionReadiness(facts).status;
}

function main() {
  const results = [];
  const hooks = loadHooks({ fetchMessage: 'live fetch disabled in W304 harness' });
  const userscript = read(userscriptPath);
  const packageJson = JSON.parse(readRepoFile('package.json'));
  const source = readRepoFile('src', 'contracts', 'futureLanePackExpansionReadiness.js');
  const lanePacksSourceBefore = readRepoFile('src', 'contracts', 'lanePacks.js');
  const report = readArchiveText('reports', 'w304_future_lane_pack_expansion_readiness_contract.md');
  const trace = readArchiveJson('trace_samples', 'w304_future_lane_pack_expansion_readiness_contract_trace.json');
  const w303Trace = readArchiveJson('trace_samples', 'w303_lane_resolution_optimization_closure_future_expansion_readiness_trace.json');
  const w302Trace = readArchiveJson('trace_samples', 'w302_lane_resolution_readiness_runtime_shape_migration_trace.json');
  const w274Trace = readArchiveJson('trace_samples', 'w274_lane_pack_expansion_workflow_contract_trace.json');
  const w277Trace = readArchiveJson('trace_samples', 'w277_lane_pack_review_bridge_trace.json');

  const ready = futureReadiness.normalizeFutureLanePackExpansionReadiness(baseFacts());
  const missingEvidence = futureReadiness.normalizeFutureLanePackExpansionReadiness(baseFacts({
    websiteCategoryEvidence: {
      website: '',
      domain: '',
      category: '',
      signals: [],
      evidenceReady: false,
      canOverrideWebsiteEvidence: false
    }
  }));
  const unsafe = futureReadiness.normalizeFutureLanePackExpansionReadiness(baseFacts({
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
  }));
  const autoInstall = futureReadiness.normalizeFutureLanePackExpansionReadiness(baseFacts({
    humanReviewGate: {
      humanReviewRequired: true,
      reviewOnly: false,
      nonInstallable: false,
      installAllowed: true,
      autoInstall: true
    }
  }));
  const notReady = futureReadiness.normalizeFutureLanePackExpansionReadiness(baseFacts({
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
  }));

  const state = motionState(hooks);
  const context = motionContext(hooks, state);
  const completedResult = completedMotionResult({ prefix: '304' });
  const completedRaw = completedRefreshResponse('runner-w304-motion-001', completedResult);
  const completedShape = hooks.actualAdapterResponseShapeW265(completedRaw, {
    phase: 'refresh',
    runnerTaskId: 'runner-w304-motion-001',
    idempotencyToken: 'motion-w304-token'
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
    submitTransport: () => submitResponse('runner-w304-motion-001', 'motion-w304-token'),
    pollTransport: () => completedRaw
  });

  assertCase(results, 'future-lane-pack-expansion-readiness-contract-module-exists',
    /FUTURE_LANE_PACK_EXPANSION_READINESS_SCHEMA_VERSION/.test(source) &&
      /normalizeFutureLanePackExpansionReadiness/.test(source) &&
      futureReadiness.contractSummary().schema === 'forge.w304.future-lane-pack-expansion-readiness.v1' &&
      trace.contractModule === 'src/contracts/futureLanePackExpansionReadiness.js',
    JSON.stringify(futureReadiness.contractSummary()));

  assertCase(results, 'contract-represents-required-fields-and-statuses',
    futureReadiness.REQUIRED_FACT_FIELDS.indexOf('proposalIdentity') >= 0 &&
      futureReadiness.REQUIRED_FACT_FIELDS.indexOf('sourcePackComparison') >= 0 &&
      futureReadiness.REQUIRED_FACT_FIELDS.indexOf('websiteCategoryEvidence') >= 0 &&
      futureReadiness.REQUIRED_FACT_FIELDS.indexOf('recordRoleCoverage') >= 0 &&
      futureReadiness.REQUIRED_FACT_FIELDS.indexOf('vocabularyCoverage') >= 0 &&
      futureReadiness.REQUIRED_FACT_FIELDS.indexOf('storyCopyCoverage') >= 0 &&
      futureReadiness.REQUIRED_FACT_FIELDS.indexOf('nllmDraftIntake') >= 0 &&
      futureReadiness.REQUIRED_FACT_FIELDS.indexOf('authoringReview') >= 0 &&
      futureReadiness.REQUIRED_FACT_FIELDS.indexOf('proposedDiff') >= 0 &&
      futureReadiness.REQUIRED_FACT_FIELDS.indexOf('adminReview') >= 0 &&
      futureReadiness.REQUIRED_FACT_FIELDS.indexOf('receiptDrivenQa') >= 0 &&
      futureReadiness.REQUIRED_FACT_FIELDS.indexOf('laneResolutionCompatibility') >= 0 &&
      Object.keys(futureReadiness.FUTURE_LANE_PACK_EXPANSION_READINESS_STATUSES).length === 5,
    JSON.stringify({ fields: futureReadiness.REQUIRED_FACT_FIELDS, statuses: futureReadiness.FUTURE_LANE_PACK_EXPANSION_READINESS_STATUSES }));

  assertCase(results, 'complete-review-safe-proposed-expansion-facts-ready-for-review',
    ready.status === 'future_lane_pack_expansion_ready_for_review' &&
      ready.readyForReview === true &&
      ready.proposalIdentity.proposedPackId === 'electrical-components-distributor' &&
      ready.humanReviewGate.reviewOnly === true &&
      ready.humanReviewGate.nonInstallable === true,
    JSON.stringify(ready));

  assertCase(results, 'missing-website-category-evidence-needs-evidence',
    missingEvidence.status === 'future_lane_pack_expansion_needs_evidence' &&
      missingEvidence.blockedReasons.indexOf('website_category_evidence_required') >= 0,
    JSON.stringify(missingEvidence));

  assertCase(results, 'unsafe-write-creation-or-hidden-uncertainty-blocked',
    unsafe.status === 'future_lane_pack_expansion_blocked_unsafe_authority' &&
      unsafe.runtimeBoundary.noSourcePackMutation === true &&
      unsafe.runtimeBoundary.noProposalInstall === true,
    JSON.stringify(unsafe));

  assertCase(results, 'auto-install-or-installable-facts-blocked',
    autoInstall.status === 'future_lane_pack_expansion_blocked_auto_install' &&
      autoInstall.blockedReasons.indexOf('future_lane_pack_must_remain_review_only_non_installable') >= 0,
    JSON.stringify(autoInstall));

  assertCase(results, 'incomplete-proposal-review-qa-facts-not-ready',
    notReady.status === 'future_lane_pack_expansion_not_ready' &&
      notReady.blockedReasons.indexOf('w251_proposed_diff_not_ready') >= 0 &&
      notReady.blockedReasons.indexOf('w255_receipt_qa_not_ready') >= 0,
    JSON.stringify(notReady));

  assertCase(results, 'contract-consumes-w247-w251-w252-w255-w274-w277-w300-through-w302-facts-without-replacing-behavior',
    ready.consumedNotReplacedBoundary.w247AuthoringReviewConsumedNotReplaced === true &&
      ready.consumedNotReplacedBoundary.w251ProposedDiffConsumedNotReplaced === true &&
      ready.consumedNotReplacedBoundary.w252AdminReviewConsumedNotReplaced === true &&
      ready.consumedNotReplacedBoundary.w255ReceiptDrivenQaConsumedNotReplaced === true &&
      ready.consumedNotReplacedBoundary.w274WorkflowConsumedNotReplaced === true &&
      ready.consumedNotReplacedBoundary.w277BridgeConsumedNotReplaced === true &&
      ready.consumedNotReplacedBoundary.w300W301W302LaneReadinessConsumedNotReplaced === true,
    JSON.stringify(ready.consumedNotReplacedBoundary));

  assertCase(results, 'contract-cannot-mutate-install-choose-override-render-write-invoke-or-declare-validity',
    ready.runtimeBoundary.noSourcePackMutation === true &&
      ready.runtimeBoundary.noProposalInstall === true &&
      ready.runtimeBoundary.noLaneChoice === true &&
      ready.runtimeBoundary.noConfidenceChange === true &&
      ready.runtimeBoundary.noWebsiteEvidenceOverride === true &&
      ready.runtimeBoundary.noConsultantToggleOverride === true &&
      ready.runtimeBoundary.noHiddenUncertainty === true &&
      ready.runtimeBoundary.noUiRendering === true &&
      ready.runtimeBoundary.noStateMutation === true &&
      ready.runtimeBoundary.noRecordImport === true &&
      ready.runtimeBoundary.noRecordCreation === true &&
      ready.runtimeBoundary.noTransactionWrites === true &&
      ready.runtimeBoundary.noOpenLinkCreation === true &&
      ready.runtimeBoundary.noAdapterInvocation === true &&
      ready.runtimeBoundary.noW245W151W214ValidityDeclaration === true,
    JSON.stringify(ready.runtimeBoundary));

  assertCase(results, 'module-not-wired-into-drawer-runtime-and-drawer-self-contained',
    !/futureLanePackExpansionReadiness/.test(userscript) &&
      !/require\(['\"][^'\"]*futureLanePackExpansionReadiness/.test(userscript) &&
      !/import\s+.*futureLanePackExpansionReadiness/.test(userscript) &&
      !/fetch\([^)]*futureLanePackExpansionReadiness/.test(userscript) &&
      !/localStorage\.setItem\([^)]*futureLanePackExpansionReadiness/.test(userscript),
    'drawer runtime remains self-contained');

  assertCase(results, 'w303-closure-readiness-map-remains-available',
    w303Trace.status === 'closure_and_future_expansion_readiness_ready' &&
      trace.continuity.w303ClosureReadinessMapAvailable === true,
    JSON.stringify({ w303: w303Trace.status }));

  assertCase(results, 'w302-runtime-shape-remains-field-compatible-with-w301',
    w302Trace.status === 'runtime_shape_migration_ready' &&
      laneReadinessBridge.exportedContractSummary().schema === 'forge.w301.lane-resolution-readiness-bridge.v1' &&
      trace.continuity.w302RuntimeShapeFieldCompatibleWithW301 === true,
    JSON.stringify({ w302: w302Trace.status, w301: laneReadinessBridge.exportedContractSummary().schema }));

  assertCase(results, 'w274-and-w277-lane-pack-expansion-review-contracts-remain-available',
    laneExpansion.exportedContractSummary().schema === 'forge.w274.lane-pack-expansion-workflow.v1' &&
      laneReviewBridge.exportedContractSummary().schema === 'forge.w277.lane-pack-review-bridge.v1' &&
      w274Trace.schema === 'forge.w274.lane-pack-expansion-workflow-contract.trace.v1' &&
      w277Trace.schema === 'forge.w277.lane-pack-review-bridge.trace.v1' &&
      w277Trace.bridge.schema === 'forge.w277.lane-pack-review-bridge.v1' &&
      trace.continuity.w274LanePackExpansionWorkflowAvailable === true &&
      trace.continuity.w277LanePackReviewBridgeAvailable === true,
    JSON.stringify({ w274: w274Trace.schema, w277: w277Trace.bridge && w277Trace.bridge.schema }));

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
      /netsuite\.com\/app\/common\/item\/item\.nl\?id=30403/.test(record.supportedOpenUrl)
    ) &&
      /Live proof CTA/.test(html) &&
      /Say this live/.test(html) &&
      /Guided demo sequence/.test(html) &&
      /Evidence receipt/.test(html) &&
      trace.continuity.returnedRecordNamesLabelsOpenLinksChanged === false &&
      trace.continuity.reviewRunVisibleCopyChanged === false,
    JSON.stringify(normalizedImport.visibleRecords.map((record) => `${record.consultantLabel}:${record.recordName}:${record.linkAuthorityStatus}`)));

  assertCase(results, 'weak-conflicting-evidence-remains-confirmation-first',
    weakStory.status === 'needs_lane_confirmation' &&
      /Confirm lane before opening proof records/.test(weakStory.openTarget) &&
      trace.continuity.weakConflictingEvidenceConfirmationFirst === true,
    JSON.stringify({ weakStatus: weakStory.status, openTarget: weakStory.openTarget }));

  assertCase(results, 'normal-consultant-ui-hides-endpoint-profile-raw-admin-diagnostics',
    !/script=6702|deploy=2|runner-w304-motion-001|finalGeneratedNamesJson|stack trace|schema/i.test(html) &&
      trace.guardrails.normalConsultantUiHidesEndpointProfileRawAdminDiagnostics === true,
    html.slice(0, 700));

  assertCase(results, 'no-runtime-authority-source-pack-mutation-or-auto-install-introduced',
    lanePacksSourceBefore === readRepoFile('src', 'contracts', 'lanePacks.js') &&
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

  assertCase(results, 'w304-report-trace-harness-and-check-registration-present',
    /W304 Future Lane Pack Expansion Readiness Contract/.test(report) &&
      trace.schema === 'forge.w304.future-lane-pack-expansion-readiness-contract.trace.v1' &&
      trace.nextRecommendedBlock === 'W305: Future Lane Pack Expansion Readiness Bridge Without Source Pack Mutation' &&
      packageJson.scripts['harness:future-lane-pack-expansion-readiness-contract-w304'] &&
      packageJson.scripts.check.includes('futureLanePackExpansionReadiness.js') &&
      packageJson.scripts.check.includes('run_w304_future_lane_pack_expansion_readiness_contract_harness.js'),
    JSON.stringify({ script: packageJson.scripts['harness:future-lane-pack-expansion-readiness-contract-w304'] || '', trace: trace.schema }));

  printResults('W304 future lane pack expansion readiness contract harness', results);
}

main();
