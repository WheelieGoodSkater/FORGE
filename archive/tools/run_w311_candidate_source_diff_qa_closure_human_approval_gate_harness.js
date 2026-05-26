#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const futureReadiness = require('../../src/contracts/futureLanePackExpansionReadiness');
const futureBridge = require('../../src/contracts/futureLanePackExpansionReadinessBridge');
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

function hasGateItem(trace, id, approved) {
  return trace.humanApprovalGate.items.some((item) => item.id === id && item.approved === approved);
}

function candidateFacts(w308Trace) {
  const packet = w308Trace.proposalPacket;
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

function main() {
  const results = [];
  const hooks = loadHooks({ fetchMessage: 'live fetch disabled in W311 harness' });
  const packageJson = JSON.parse(readRepoFile('package.json'));
  const userscript = read(userscriptPath);
  const lanePacksSource = readRepoFile('src', 'contracts', 'lanePacks.js');
  const report = readArchiveText('reports', 'w311_candidate_source_diff_qa_closure_human_approval_gate.md');
  const trace = readArchiveJson('trace_samples', 'w311_candidate_source_diff_qa_closure_human_approval_gate_trace.json');
  const w310Trace = readArchiveJson('trace_samples', 'w310_review_only_candidate_lane_pack_source_diff_packet_trace.json');
  const w309Trace = readArchiveJson('trace_samples', 'w309_candidate_industry_pack_proposal_qa_closure_source_change_readiness_trace.json');
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

  const state = motionState(hooks);
  const context = motionContext(hooks, state);
  const completedResult = completedMotionResult({ prefix: '311' });
  const completedRaw = completedRefreshResponse('runner-w311-motion-001', completedResult);
  const completedShape = hooks.actualAdapterResponseShapeW265(completedRaw, {
    phase: 'refresh',
    runnerTaskId: 'runner-w311-motion-001',
    idempotencyToken: 'motion-w311-token'
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
    submitTransport: () => submitResponse('runner-w311-motion-001', 'motion-w311-token'),
    pollTransport: () => completedRaw
  });

  const patchText = w310Trace.sourceDiffPacket.proposedFutureSourcePatch.patchLines.join('\n');

  assertCase(results, 'w310-source-diff-qa-closure-map-exists',
    trace.schema === 'forge.w311.candidate-source-diff-qa-closure-human-approval-gate.trace.v1' &&
      trace.status === 'source_diff_qa_closure_human_gate_ready' &&
      /W311 Candidate Source Diff QA Closure/.test(report) &&
      trace.sourceDiffQaClosureMap.layers.length === 6 &&
      ['w310_review_only_source_diff_packet', 'w310_diff_readiness_acceptance_packet', 'w309_source_change_blockers', 'w308_candidate_proposal_acceptance', 'w304_w306_future_expansion_readiness', 'w247_w251_w252_w255_review_expectations']
        .every((id) => trace.sourceDiffQaClosureMap.layers.some((layer) => layer.id === id)),
    JSON.stringify(trace.sourceDiffQaClosureMap.layers.map((layer) => layer.id)));

  assertCase(results, 'human-approval-gate-defaults-to-not-approved-yet',
    trace.humanApprovalGate.decision === 'not_approved_yet' &&
      trace.humanApprovalGate.sourceMutationAllowed === false &&
      trace.humanApprovalGate.allRequiredBeforeSourceMutation === true,
    JSON.stringify(trace.humanApprovalGate));

  assertCase(results, 'real-evidence-and-explicit-human-source-approval-remain-required',
    hasGateItem(trace, 'real_website_category_evidence_confirmation', false) &&
      hasGateItem(trace, 'explicit_source_mutation_approval', false) &&
      w309Trace.sourceChangeReadinessChecklist.items.some((item) => item.id === 'confirmed_real_website_category_evidence' && item.ready === false) &&
      w309Trace.sourceChangeReadinessChecklist.items.some((item) => item.id === 'explicit_human_code_review_approval' && item.ready === false),
    JSON.stringify(trace.humanApprovalGate.items.filter((item) => !item.approved).map((item) => item.id)));

  assertCase(results, 'w310-source-diff-remains-represented-but-unapplied',
    /packId: 'electrical-components-distributor'/.test(patchText) &&
      /laneId: 'industrial_distribution'/.test(patchText) &&
      /operatingMode: 'distribution_replenishment'/.test(patchText) &&
      w310Trace.sourceDiffPacket.proposedFutureSourcePatch.patchApplied === false &&
      !/packId: 'electrical-components-distributor'/.test(lanePacksSource),
    patchText);

  assertCase(results, 'w310-diff-readiness-acceptance-remains-draft-only',
    w310Trace.diffReadinessAcceptancePacket.diffDrafted === true &&
      w310Trace.diffReadinessAcceptancePacket.diffApplied === false &&
      w310Trace.diffReadinessAcceptancePacket.sourcePackMutated === false &&
      w310Trace.diffReadinessAcceptancePacket.runtimeWired === false &&
      w310Trace.diffReadinessAcceptancePacket.installable === false &&
      w310Trace.diffReadinessAcceptancePacket.sourceTruth === false &&
      trace.continuity.w310DiffReadinessDraftOnly === true,
    JSON.stringify(w310Trace.diffReadinessAcceptancePacket));

  assertCase(results, 'w308-proposal-remains-review-only-and-non-installable',
    w308Trace.acceptancePacket.reviewOnly === true &&
      w308Trace.acceptancePacket.nonInstallable === true &&
      w308Trace.acceptancePacket.sourceTruth === false &&
      w308Trace.acceptancePacket.runtimeWired === false &&
      w308Trace.acceptancePacket.autoInstallIntroduced === false,
    JSON.stringify(w308Trace.acceptancePacket));

  assertCase(results, 'w306-w305-w304-readiness-continuity-remains-available',
    w306Trace.status === 'runtime_shape_migration_ready' &&
      w305Trace.status === 'bridge_ready' &&
      w304Trace.status === 'contract_ready' &&
      runtimeShape.status === contractShape.status &&
      bridgePacket.status === 'field_compatible' &&
      trace.continuity.w306RuntimeShapeFieldCompatibleWithW305 === true,
    JSON.stringify({ runtime: runtimeShape.status, contract: contractShape.status, bridge: bridgePacket.status }));

  assertCase(results, 'w303-w307-w309-w310-closure-maps-remain-available',
    w303Trace.status === 'closure_and_future_expansion_readiness_ready' &&
      w307Trace.status === 'closure_and_authoring_plan_ready' &&
      w309Trace.status === 'qa_closure_source_change_readiness_ready' &&
      w310Trace.status === 'review_only_source_diff_packet_ready' &&
      trace.continuity.w303ClosureReadinessMapAvailable === true &&
      trace.continuity.w307ClosureAuthoringPlanAvailable === true &&
      trace.continuity.w309SourceChangeReadinessAvailable === true &&
      trace.continuity.w310SourceDiffPacketAvailable === true,
    JSON.stringify({ w303: w303Trace.status, w307: w307Trace.status, w309: w309Trace.status, w310: w310Trace.status }));

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
    JSON.stringify({ w264: w264Flow.status, w151: completedGuard.status, w214: semanticGuard.valid, w245: normalizedImport.status }));

  assertCase(results, 'returned-records-labels-open-links-and-review-run-copy-unchanged',
    normalizedImport.visibleRecords.some((record) =>
      record.recordName === 'Motion Branch Fulfillment SKU' &&
      /Product SKU/.test(record.consultantLabel) &&
      record.safeToOpen === true &&
      /netsuite\.com\/app\/common\/item\/item\.nl\?id=31103/.test(record.supportedOpenUrl)
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
    !/script=6702|deploy=2|runner-w311-motion-001|finalGeneratedNamesJson|stack trace|schema/i.test(html) &&
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

  assertCase(results, 'w311-report-trace-harness-and-check-registration-present',
    packageJson.scripts['harness:candidate-source-diff-qa-closure-human-approval-gate-w311'] &&
      packageJson.scripts.check.includes('run_w311_candidate_source_diff_qa_closure_human_approval_gate_harness.js') &&
      trace.nextRecommendedBlock === 'W312: Conditional Human-Approved Candidate Lane Pack Source Change',
    packageJson.scripts['harness:candidate-source-diff-qa-closure-human-approval-gate-w311'] || '');

  printResults('W311 candidate source diff QA closure human approval gate harness', results);
}

main();
