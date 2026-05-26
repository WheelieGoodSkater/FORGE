#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const futureReadiness = require('../../src/contracts/futureLanePackExpansionReadiness');
const futureBridge = require('../../src/contracts/futureLanePackExpansionReadinessBridge');
const laneExpansion = require('../../src/contracts/lanePackExpansionWorkflow');
const laneReviewBridge = require('../../src/contracts/lanePackReviewBridge');
const lanePacks = require('../../src/contracts/lanePacks');
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
  const hooks = loadHooks({ fetchMessage: 'live fetch disabled in W312 harness' });
  const packageJson = JSON.parse(readRepoFile('package.json'));
  const userscript = read(userscriptPath);
  const lanePacksSource = readRepoFile('src', 'contracts', 'lanePacks.js');
  const report = readArchiveText('reports', 'w312_conditional_candidate_lane_pack_source_change_blocked_noop.md');
  const trace = readArchiveJson('trace_samples', 'w312_conditional_candidate_lane_pack_source_change_blocked_noop_trace.json');
  const w311Trace = readArchiveJson('trace_samples', 'w311_candidate_source_diff_qa_closure_human_approval_gate_trace.json');
  const w310Trace = readArchiveJson('trace_samples', 'w310_review_only_candidate_lane_pack_source_diff_packet_trace.json');
  const w308Trace = readArchiveJson('trace_samples', 'w308_review_only_candidate_industry_pack_proposal_packet_trace.json');
  const facts = candidateFacts(w308Trace);
  const runtimeShape = hooks.futureExpansionReadinessRuntimeShapeW306(facts);
  const bridgePacket = futureBridge.validateFutureLanePackExpansionReadiness(runtimeShape, facts);
  const contractShape = futureReadiness.normalizeFutureLanePackExpansionReadiness(facts);

  const state = motionState(hooks);
  const context = motionContext(hooks, state);
  const completedResult = completedMotionResult({ prefix: '312' });
  const completedRaw = completedRefreshResponse('runner-w312-motion-001', completedResult);
  const completedShape = hooks.actualAdapterResponseShapeW265(completedRaw, {
    phase: 'refresh',
    runnerTaskId: 'runner-w312-motion-001',
    idempotencyToken: 'motion-w312-token'
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
    submitTransport: () => submitResponse('runner-w312-motion-001', 'motion-w312-token'),
    pollTransport: () => completedRaw
  });

  assertCase(results, 'w311-approval-gate-inspected-and-blocked',
    trace.schema === 'forge.w312.conditional-candidate-lane-pack-source-change.trace.v1' &&
      trace.status === 'blocked_noop_source_change_not_approved' &&
      trace.approvalGateInspection.w311Decision === 'not_approved_yet' &&
      trace.approvalGateInspection.w311SourceMutationAllowed === false &&
      trace.approvalGateInspection.explicitApprovalInW312Request === false &&
      w311Trace.humanApprovalGate.decision === 'not_approved_yet' &&
      w311Trace.humanApprovalGate.sourceMutationAllowed === false,
    JSON.stringify(trace.approvalGateInspection));

  assertCase(results, 'blocked-noop-packet-records-no-source-mutation',
    /W312 Conditional Candidate Lane Pack Source Change Blocked No-Op/.test(report) &&
      trace.pathTaken === 'blocked_noop' &&
      trace.blockedNoopPacket.sourceMutationApplied === false &&
      trace.blockedNoopPacket.sourceFileChanged === false &&
      trace.blockedNoopPacket.exactW310PatchApplied === false &&
      trace.blockedNoopPacket.existingSourcePacksModified === false,
    JSON.stringify(trace.blockedNoopPacket));

  assertCase(results, 'w310-exact-source-addition-remains-draft-only-not-applied',
    w310Trace.sourceDiffPacket.proposedFutureSourcePatch.patchLines.some((line) => /packId: 'electrical-components-distributor'/.test(line)) &&
      w310Trace.sourceDiffPacket.proposedFutureSourcePatch.patchApplied === false &&
      trace.sourceChangeEvidence.diffSummary === 'No source diff applied. W310 remains draft-only.' &&
      !/packId: 'electrical-components-distributor'/.test(lanePacksSource),
    JSON.stringify(w310Trace.diffReadinessAcceptancePacket));

  assertCase(results, 'lane-pack-schema-valid-and-existing-lanes-unchanged',
    Array.isArray(lanePacks.LANE_PACKS) &&
      lanePacks.LANE_PACKS.length === 9 &&
      lanePacks.LANE_PACKS.some((pack) => pack.packId === 'industrial-distributor' && pack.laneId === 'industrial_distribution') &&
      lanePacks.LANE_PACKS.some((pack) => pack.packId === 'food-beverage-manufacturer' && pack.operatingMode === 'food_batch_manufacturing') &&
      !lanePacks.LANE_PACKS.some((pack) => pack.packId === 'electrical-components-distributor'),
    lanePacks.LANE_PACKS.map((pack) => `${pack.packId}:${pack.laneId}`).join(', '));

  assertCase(results, 'candidate-readiness-remains-advisory-only-and-uncertainty-visible',
    runtimeShape.status === contractShape.status &&
      bridgePacket.status === 'field_compatible' &&
      facts.nllmDraftIntake.advisoryOnly === true &&
      facts.nllmDraftIntake.writeAuthority === 'none' &&
      facts.nllmDraftIntake.creationAllowed === false &&
      facts.nllmDraftIntake.uncertaintyVisible === true,
    JSON.stringify({ runtime: runtimeShape.status, contract: contractShape.status, bridge: bridgePacket.status }));

  assertCase(results, 'no-install-auto-install-runtime-wiring-or-authority-introduced',
    trace.blockedNoopPacket.candidatePackInstalled === false &&
      trace.blockedNoopPacket.autoInstallIntroduced === false &&
      trace.blockedNoopPacket.runtimeWiringIntroduced === false &&
      trace.blockedNoopPacket.runtimeAuthorityChanged === false &&
      trace.guardrails.autoInstallIntroduced === false &&
      trace.guardrails.candidateWiredIntoRuntime === false &&
      trace.guardrails.recordCreationAuthorityChanged === false,
    JSON.stringify({ noop: trace.blockedNoopPacket, guardrails: trace.guardrails }));

  assertCase(results, 'w274-and-w277-lane-pack-review-contracts-remain-available',
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
      /netsuite\.com\/app\/common\/item\/item\.nl\?id=31203/.test(record.supportedOpenUrl)
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
    !/script=6702|deploy=2|runner-w312-motion-001|finalGeneratedNamesJson|stack trace|schema/i.test(html) &&
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

  assertCase(results, 'w312-report-trace-harness-and-check-registration-present',
    packageJson.scripts['harness:conditional-candidate-lane-pack-source-change-w312'] &&
      packageJson.scripts.check.includes('run_w312_conditional_candidate_lane_pack_source_change_harness.js') &&
      trace.nextRecommendedBlock === 'W313: Explicit Approval Intake Or Candidate Source Change Reattempt',
    packageJson.scripts['harness:conditional-candidate-lane-pack-source-change-w312'] || '');

  printResults('W312 conditional candidate lane pack source change harness', results);
}

main();
