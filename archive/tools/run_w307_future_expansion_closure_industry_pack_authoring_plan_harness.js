#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const futureReadiness = require('../../src/contracts/futureLanePackExpansionReadiness');
const futureBridge = require('../../src/contracts/futureLanePackExpansionReadinessBridge');
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

function hasPlanStep(trace, id) {
  return trace.futureIndustryPackAuthoringPlan.steps.some((step) => step.id === id);
}

function candidateFacts() {
  return {
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
      checks: [
        'lane_choice_explained',
        'open_target_explained',
        'proof_evidence_explained',
        'notes_contribution_explained',
        'nllm_limits_explained',
        'uncertainty_explained'
      ].map((id) => ({ id, status: 'pass' }))
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
}

function laneFacts() {
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
  const hooks = loadHooks({ fetchMessage: 'live fetch disabled in W307 harness' });
  const userscript = read(userscriptPath);
  const packageJson = JSON.parse(readRepoFile('package.json'));
  const report = readArchiveText('reports', 'w307_future_expansion_closure_industry_pack_authoring_plan.md');
  const trace = readArchiveJson('trace_samples', 'w307_future_expansion_closure_industry_pack_authoring_plan_trace.json');
  const w306Trace = readArchiveJson('trace_samples', 'w306_future_lane_pack_expansion_readiness_runtime_shape_migration_trace.json');
  const w305Trace = readArchiveJson('trace_samples', 'w305_future_lane_pack_expansion_readiness_bridge_trace.json');
  const w304Trace = readArchiveJson('trace_samples', 'w304_future_lane_pack_expansion_readiness_contract_trace.json');
  const w303Trace = readArchiveJson('trace_samples', 'w303_lane_resolution_optimization_closure_future_expansion_readiness_trace.json');
  const w302Trace = readArchiveJson('trace_samples', 'w302_lane_resolution_readiness_runtime_shape_migration_trace.json');

  const state = motionState(hooks);
  const context = motionContext(hooks, state);
  const completedResult = completedMotionResult({ prefix: '307' });
  const completedRaw = completedRefreshResponse('runner-w307-motion-001', completedResult);
  const completedShape = hooks.actualAdapterResponseShapeW265(completedRaw, {
    phase: 'refresh',
    runnerTaskId: 'runner-w307-motion-001',
    idempotencyToken: 'motion-w307-token'
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
    submitTransport: () => submitResponse('runner-w307-motion-001', 'motion-w307-token'),
    pollTransport: () => completedRaw
  });

  const runtimeShape = hooks.futureExpansionReadinessRuntimeShapeW306(candidateFacts());
  const bridgePacket = futureBridge.validateFutureLanePackExpansionReadiness(runtimeShape, candidateFacts());
  const contractShape = futureReadiness.normalizeFutureLanePackExpansionReadiness(candidateFacts());
  const laneShape = hooks.laneResolutionReadinessRuntimeShapeW302(laneFacts());
  const laneValidation = laneReadinessBridge.validateLaneResolutionReadiness(
    Object.assign({}, laneShape, { schema: laneReadiness.LANE_RESOLUTION_READINESS_SCHEMA_VERSION }),
    laneFacts()
  );

  assertCase(results, 'w303-through-w306-closure-map-exists-and-includes-four-layers',
    trace.schema === 'forge.w307.future-expansion-closure-industry-pack-authoring-plan.trace.v1' &&
      trace.status === 'closure_and_authoring_plan_ready' &&
      /W307 Future Expansion Closure/.test(report) &&
      trace.closureMap.layers.length === 4 &&
      ['w303_lane_resolution_closure_future_expansion_readiness', 'w304_future_lane_pack_expansion_readiness_contract', 'w305_future_lane_pack_expansion_readiness_bridge', 'w306_future_expansion_readiness_runtime_shape_migration']
        .every((id) => trace.closureMap.layers.some((layer) => layer.id === id)),
    JSON.stringify(trace.closureMap.layers.map((layer) => layer.id)));

  assertCase(results, 'each-layer-maps-source-governance-owned-behavior-harnesses-rollback',
    trace.closureMap.layers.every((layer) =>
      Array.isArray(layer.sourceSurfaceProtected) &&
      layer.sourceSurfaceProtected.length > 0 &&
      layer.governingContractOrBridge &&
      Array.isArray(layer.drawerSourceOwnedBehavior) &&
      layer.drawerSourceOwnedBehavior.length > 0 &&
      Array.isArray(layer.parityHarnesses) &&
      layer.parityHarnesses.length > 0 &&
      layer.rollbackBoundary
    ),
    JSON.stringify(trace.closureMap.layers));

  assertCase(results, 'future-industry-pack-authoring-plan-complete',
    hasPlanStep(trace, 'candidate_industry_subindustry_intake') &&
      hasPlanStep(trace, 'website_category_evidence_collection') &&
      hasPlanStep(trace, 'record_role_design') &&
      hasPlanStep(trace, 'vocabulary_design') &&
      hasPlanStep(trace, 'proof_story_roi_competitive_copy') &&
      hasPlanStep(trace, 'nllm_advisory_draft_limits') &&
      hasPlanStep(trace, 'w247_authoring_review') &&
      hasPlanStep(trace, 'w251_proposed_diff_review') &&
      hasPlanStep(trace, 'w252_admin_safe_review') &&
      hasPlanStep(trace, 'w255_receipt_driven_qa') &&
      hasPlanStep(trace, 'w304_w306_readiness_check') &&
      hasPlanStep(trace, 'human_code_review_before_source_mutation') &&
      hasPlanStep(trace, 'post_install_smoke_after_pack_lands'),
    JSON.stringify(trace.futureIndustryPackAuthoringPlan.steps.map((step) => step.id)));

  assertCase(results, 'selected-next-block-is-narrow-review-only-not-source-ui-lane-or-auto-install',
    trace.selectedNextBlock.id === 'review_only_candidate_industry_pack_proposal_packet_w308' &&
      trace.selectedNextBlock.reviewOnly === true &&
      trace.selectedNextBlock.mutatesSourceLanePacks === false &&
      trace.selectedNextBlock.installsProposedPack === false &&
      trace.selectedNextBlock.autoInstallIntroduced === false &&
      trace.selectedNextBlock.changesVisibleUi === false &&
      trace.selectedNextBlock.changesLaneBehavior === false &&
      trace.selectedNextBlock.changesRuntimeAuthority === false,
    JSON.stringify(trace.selectedNextBlock));

  assertCase(results, 'selected-block-includes-source-anchors-archived-packet-plan-behavior-review-validation-rollback',
    trace.selectedNextBlock.sourceAnchors.indexOf('reviewProposedLanePackChangeW247') >= 0 &&
      trace.selectedNextBlock.sourceAnchors.indexOf('futureExpansionReadinessRuntimeShapeW306') >= 0 &&
      trace.selectedNextBlock.proposedArchivedPacketHarness.length === 3 &&
      trace.selectedNextBlock.behaviorSurfacesThatMustRemainIdentical.length >= 12 &&
      trace.selectedNextBlock.manualReviewNotes.length >= 5 &&
      trace.selectedNextBlock.validationCommands.indexOf('npm run check') >= 0 &&
      /Remove W308/.test(trace.selectedNextBlock.rollbackPlan),
    JSON.stringify(trace.selectedNextBlock));

  assertCase(results, 'w306-runtime-shape-remains-field-compatible-with-w305',
    w306Trace.status === 'runtime_shape_migration_ready' &&
      bridgePacket.status === 'field_compatible' &&
      runtimeShape.status === contractShape.status &&
      trace.continuity.w306RuntimeShapeFieldCompatibleWithW305 === true,
    JSON.stringify({ w306: w306Trace.status, bridge: bridgePacket.status, runtime: runtimeShape.status, contract: contractShape.status }));

  assertCase(results, 'w305-bridge-and-w304-contract-remain-available',
    futureBridge.exportedContractSummary().schema === 'forge.w305.future-lane-pack-expansion-readiness-bridge.v1' &&
      futureReadiness.contractSummary().schema === 'forge.w304.future-lane-pack-expansion-readiness.v1' &&
      w305Trace.status === 'bridge_ready' &&
      w304Trace.status === 'contract_ready' &&
      trace.continuity.w305BridgeAvailable === true &&
      trace.continuity.w304ContractAvailable === true,
    JSON.stringify({ w305: w305Trace.status, w304: w304Trace.status }));

  assertCase(results, 'w303-closure-and-w302-w301-w300-continuity-remain-available',
    w303Trace.status === 'closure_and_future_expansion_readiness_ready' &&
      w302Trace.status === 'runtime_shape_migration_ready' &&
      laneValidation.status === 'field_compatible' &&
      trace.continuity.w303ClosureReadinessMapAvailable === true &&
      trace.continuity.w302RuntimeShapeFieldCompatibleWithW301 === true &&
      trace.continuity.w301BridgeAvailable === true &&
      trace.continuity.w300ContractAvailable === true,
    JSON.stringify({ w303: w303Trace.status, w302: w302Trace.status, lane: laneValidation.status }));

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
      /netsuite\.com\/app\/common\/item\/item\.nl\?id=30703/.test(record.supportedOpenUrl)
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
    !/script=6702|deploy=2|runner-w307-motion-001|finalGeneratedNamesJson|stack trace|schema/i.test(html) &&
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

  assertCase(results, 'w307-report-trace-harness-and-check-registration-present',
    packageJson.scripts['harness:future-expansion-closure-industry-pack-authoring-plan-w307'] &&
      packageJson.scripts.check.includes('run_w307_future_expansion_closure_industry_pack_authoring_plan_harness.js') &&
      trace.nextRecommendedBlock === 'W308: Review-Only Candidate Industry Pack Proposal Packet Without Source Pack Mutation' &&
      userscript.indexOf('futureExpansionReadinessRuntimeShapeW306') >= 0,
    packageJson.scripts['harness:future-expansion-closure-industry-pack-authoring-plan-w307'] || '');

  printResults('W307 future expansion closure industry pack authoring plan harness', results);
}

main();
