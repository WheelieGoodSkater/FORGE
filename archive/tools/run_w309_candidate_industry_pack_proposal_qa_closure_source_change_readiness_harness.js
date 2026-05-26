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

function hasChecklistItem(trace, id) {
  return trace.sourceChangeReadinessChecklist.items.some((item) => item.id === id);
}

function candidateFacts(trace) {
  const packet = trace.proposalPacket;
  const facts = packet.futureExpansionReadinessFacts;
  return {
    proposalIdentity: packet.candidateIdentity,
    sourcePackComparison: packet.sourcePackComparison,
    websiteCategoryEvidence: packet.websiteCategoryEvidence,
    recordRoleCoverage: packet.recordRoleCoverage,
    vocabularyCoverage: packet.vocabularyCoverage,
    storyCopyCoverage: packet.storyCopyCoverage,
    nllmDraftIntake: packet.nllmDraftIntake,
    authoringReview: facts.authoringReview,
    proposedDiff: facts.proposedDiff,
    adminReview: facts.adminReview,
    receiptDrivenQa: facts.receiptDrivenQa,
    laneResolutionCompatibility: facts.laneResolutionCompatibility,
    humanReviewGate: facts.humanReviewGate,
    uncertaintyGate: facts.uncertaintyGate
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
  const hooks = loadHooks({ fetchMessage: 'live fetch disabled in W309 harness' });
  const userscript = read(userscriptPath);
  const packageJson = JSON.parse(readRepoFile('package.json'));
  const lanePacksSource = readRepoFile('src', 'contracts', 'lanePacks.js');
  const report = readArchiveText('reports', 'w309_candidate_industry_pack_proposal_qa_closure_source_change_readiness.md');
  const trace = readArchiveJson('trace_samples', 'w309_candidate_industry_pack_proposal_qa_closure_source_change_readiness_trace.json');
  const w308Trace = readArchiveJson('trace_samples', 'w308_review_only_candidate_industry_pack_proposal_packet_trace.json');
  const w307Trace = readArchiveJson('trace_samples', 'w307_future_expansion_closure_industry_pack_authoring_plan_trace.json');
  const w306Trace = readArchiveJson('trace_samples', 'w306_future_lane_pack_expansion_readiness_runtime_shape_migration_trace.json');
  const w305Trace = readArchiveJson('trace_samples', 'w305_future_lane_pack_expansion_readiness_bridge_trace.json');
  const w304Trace = readArchiveJson('trace_samples', 'w304_future_lane_pack_expansion_readiness_contract_trace.json');
  const w303Trace = readArchiveJson('trace_samples', 'w303_lane_resolution_optimization_closure_future_expansion_readiness_trace.json');

  const facts = candidateFacts(w308Trace);
  const runtimeShape = hooks.futureExpansionReadinessRuntimeShapeW306(facts);
  const bridgePacket = futureBridge.validateFutureLanePackExpansionReadiness(runtimeShape, facts);
  const contractShape = futureReadiness.normalizeFutureLanePackExpansionReadiness(facts);
  const laneShape = hooks.laneResolutionReadinessRuntimeShapeW302(laneFacts());
  const laneValidation = laneReadinessBridge.validateLaneResolutionReadiness(
    Object.assign({}, laneShape, { schema: laneReadiness.LANE_RESOLUTION_READINESS_SCHEMA_VERSION }),
    laneFacts()
  );

  const state = motionState(hooks);
  const context = motionContext(hooks, state);
  const completedResult = completedMotionResult({ prefix: '309' });
  const completedRaw = completedRefreshResponse('runner-w309-motion-001', completedResult);
  const completedShape = hooks.actualAdapterResponseShapeW265(completedRaw, {
    phase: 'refresh',
    runnerTaskId: 'runner-w309-motion-001',
    idempotencyToken: 'motion-w309-token'
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
    submitTransport: () => submitResponse('runner-w309-motion-001', 'motion-w309-token'),
    pollTransport: () => completedRaw
  });

  assertCase(results, 'w308-candidate-proposal-qa-closure-map-exists',
    trace.schema === 'forge.w309.candidate-industry-pack-proposal-qa-closure-source-change-readiness.trace.v1' &&
      trace.status === 'qa_closure_source_change_readiness_ready' &&
      /W309 Candidate Industry Pack Proposal QA Closure/.test(report) &&
      trace.qaClosureMap.layers.length === 7 &&
      ['w308_review_only_candidate_proposal_packet', 'w308_review_only_acceptance_packet', 'w247_authoring_review_expectations', 'w251_proposed_diff_expectations', 'w252_admin_safe_review_expectations', 'w255_receipt_driven_qa_expectations', 'w304_w306_future_expansion_readiness']
        .every((id) => trace.qaClosureMap.layers.some((layer) => layer.id === id)),
    JSON.stringify(trace.qaClosureMap.layers.map((layer) => layer.id)));

  assertCase(results, 'source-change-readiness-checklist-has-all-required-gates',
    trace.sourceChangeReadinessChecklist.status === 'source_change_not_authorized_yet' &&
      trace.sourceChangeReadinessChecklist.allRequiredBeforeSourceMutation === true &&
      hasChecklistItem(trace, 'confirmed_real_website_category_evidence') &&
      hasChecklistItem(trace, 'reviewed_base_pack_comparison') &&
      hasChecklistItem(trace, 'reviewed_record_roles') &&
      hasChecklistItem(trace, 'reviewed_vocabulary') &&
      hasChecklistItem(trace, 'reviewed_story_roi_competitive_copy') &&
      hasChecklistItem(trace, 'reviewed_nllm_advisory_only_limits') &&
      hasChecklistItem(trace, 'w247_authoring_review_passes') &&
      hasChecklistItem(trace, 'w251_proposed_diff_review_passes') &&
      hasChecklistItem(trace, 'w252_admin_safe_review_no_install_action') &&
      hasChecklistItem(trace, 'w255_receipt_driven_qa_passes') &&
      hasChecklistItem(trace, 'w304_w306_readiness_passes') &&
      hasChecklistItem(trace, 'explicit_human_code_review_approval') &&
      hasChecklistItem(trace, 'post_install_smoke_plan_ready'),
    JSON.stringify(trace.sourceChangeReadinessChecklist.items.map((item) => `${item.id}:${item.ready}`)));

  assertCase(results, 'source-change-checklist-blocks-unapproved-source-mutation',
    trace.sourceChangeReadinessChecklist.items.some((item) => item.id === 'confirmed_real_website_category_evidence' && item.ready === false) &&
      trace.sourceChangeReadinessChecklist.items.some((item) => item.id === 'explicit_human_code_review_approval' && item.ready === false),
    'real evidence and human source approval remain required');

  assertCase(results, 'selected-next-block-is-review-only-source-diff-packet-and-does-not-apply-mutation',
    trace.selectedNextBlock.id === 'review_only_candidate_lane_pack_source_diff_packet_w310' &&
      trace.selectedNextBlock.draftsExactFutureLanePacksMutation === true &&
      trace.selectedNextBlock.appliesSourceMutation === false &&
      trace.selectedNextBlock.mutatesSourceLanePacks === false &&
      trace.selectedNextBlock.installsProposedPack === false &&
      trace.selectedNextBlock.autoInstallIntroduced === false &&
      trace.selectedNextBlock.wiresCandidateIntoRuntime === false &&
      trace.selectedNextBlock.changesVisibleUi === false &&
      trace.selectedNextBlock.changesLaneBehavior === false &&
      trace.selectedNextBlock.changesRuntimeAuthority === false,
    JSON.stringify(trace.selectedNextBlock));

  assertCase(results, 'w308-proposal-remains-review-only-non-installable-not-source-truth-runtime-unwired',
    w308Trace.acceptancePacket.reviewOnly === true &&
      w308Trace.acceptancePacket.nonInstallable === true &&
      w308Trace.acceptancePacket.sourceTruth === false &&
      w308Trace.acceptancePacket.runtimeWired === false &&
      w308Trace.acceptancePacket.autoInstallIntroduced === false &&
      trace.continuity.w308ProposalPacketReviewOnly === true &&
      trace.continuity.w308AcceptancePacketAvailable === true,
    JSON.stringify(w308Trace.acceptancePacket));

  assertCase(results, 'w306-w305-w304-w303-w307-continuity-remains-available',
    w307Trace.status === 'closure_and_authoring_plan_ready' &&
      w306Trace.status === 'runtime_shape_migration_ready' &&
      w305Trace.status === 'bridge_ready' &&
      w304Trace.status === 'contract_ready' &&
      w303Trace.status === 'closure_and_future_expansion_readiness_ready' &&
      runtimeShape.status === contractShape.status &&
      bridgePacket.status === 'field_compatible' &&
      trace.continuity.w306RuntimeShapeFieldCompatibleWithW305 === true,
    JSON.stringify({ w307: w307Trace.status, w306: w306Trace.status, w305: w305Trace.status, w304: w304Trace.status, w303: w303Trace.status, bridge: bridgePacket.status }));

  assertCase(results, 'w302-through-w300-and-w274-w277-continuity-remain-available',
    laneValidation.status === 'field_compatible' &&
      laneExpansion.exportedContractSummary().schema === 'forge.w274.lane-pack-expansion-workflow.v1' &&
      laneReviewBridge.exportedContractSummary().schema === 'forge.w277.lane-pack-review-bridge.v1' &&
      trace.continuity.w302RuntimeShapeFieldCompatibleWithW301 === true &&
      trace.continuity.w274LanePackExpansionWorkflowAvailable === true &&
      trace.continuity.w277LanePackReviewBridgeAvailable === true,
    JSON.stringify({ lane: laneValidation.status, w274: laneExpansion.exportedContractSummary().schema, w277: laneReviewBridge.exportedContractSummary().schema }));

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
      /netsuite\.com\/app\/common\/item\/item\.nl\?id=30903/.test(record.supportedOpenUrl)
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
    !/script=6702|deploy=2|runner-w309-motion-001|finalGeneratedNamesJson|stack trace|schema/i.test(html) &&
      trace.guardrails.normalConsultantUiHidesEndpointProfileRawAdminDiagnostics === true,
    html.slice(0, 700));

  assertCase(results, 'no-runtime-authority-source-pack-mutation-install-or-auto-install',
    userscript.indexOf('electrical-components-distributor') < 0 &&
      lanePacksSource.indexOf('electrical-components-distributor') < 0 &&
      trace.guardrails.runtimeBehaviorChanged === false &&
      trace.guardrails.connectedBuildFlowChanged === false &&
      trace.guardrails.recordCreationAuthorityChanged === false &&
      trace.guardrails.sourceLanePacksMutated === false &&
      trace.guardrails.autoInstallIntroduced === false &&
      trace.guardrails.candidateWiredIntoRuntime === false &&
      trace.guardrails.noDrawerCreatedRecords === true &&
      trace.guardrails.noDrawerTransactionWrites === true &&
      trace.continuity.sourceLanePacksChanged === false &&
      trace.continuity.proposedPacksInstalled === false,
    JSON.stringify({ guardrails: trace.guardrails, continuity: trace.continuity }));

  assertCase(results, 'w309-report-trace-harness-and-check-registration-present',
    packageJson.scripts['harness:candidate-industry-pack-proposal-qa-closure-source-change-readiness-w309'] &&
      packageJson.scripts.check.includes('run_w309_candidate_industry_pack_proposal_qa_closure_source_change_readiness_harness.js') &&
      trace.nextRecommendedBlock === 'W310: Review-Only Candidate Lane Pack Source Diff Packet Without Applying Source Mutation',
    packageJson.scripts['harness:candidate-industry-pack-proposal-qa-closure-source-change-readiness-w309'] || '');

  printResults('W309 candidate industry pack proposal QA closure source change readiness harness', results);
}

main();
