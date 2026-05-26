#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
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

function hasRequiredField(trace, id) {
  return trace.approvalIntakePacket.requiredFields.some((field) => field.id === id);
}

function main() {
  const results = [];
  const hooks = loadHooks({ fetchMessage: 'live fetch disabled in W313 harness' });
  const packageJson = JSON.parse(readRepoFile('package.json'));
  const userscript = read(userscriptPath);
  const lanePacksSource = readRepoFile('src', 'contracts', 'lanePacks.js');
  const report = readArchiveText('reports', 'w313_explicit_approval_intake_candidate_source_change_reattempt.md');
  const trace = readArchiveJson('trace_samples', 'w313_explicit_approval_intake_candidate_source_change_reattempt_trace.json');
  const w312Trace = readArchiveJson('trace_samples', 'w312_conditional_candidate_lane_pack_source_change_blocked_noop_trace.json');
  const w311Trace = readArchiveJson('trace_samples', 'w311_candidate_source_diff_qa_closure_human_approval_gate_trace.json');
  const w310Trace = readArchiveJson('trace_samples', 'w310_review_only_candidate_lane_pack_source_diff_packet_trace.json');

  const state = motionState(hooks);
  const context = motionContext(hooks, state);
  const completedResult = completedMotionResult({ prefix: '313' });
  const completedRaw = completedRefreshResponse('runner-w313-motion-001', completedResult);
  const completedShape = hooks.actualAdapterResponseShapeW265(completedRaw, {
    phase: 'refresh',
    runnerTaskId: 'runner-w313-motion-001',
    idempotencyToken: 'motion-w313-token'
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
    submitTransport: () => submitResponse('runner-w313-motion-001', 'motion-w313-token'),
    pollTransport: () => completedRaw
  });

  assertCase(results, 'w312-blocked-noop-closure-map-exists',
    trace.schema === 'forge.w313.explicit-approval-intake-candidate-source-change-reattempt.trace.v1' &&
      trace.status === 'approval_intake_ready_source_change_not_provided' &&
      /W313 Explicit Approval Intake/.test(report) &&
      trace.blockedNoopClosureMap.layers.length === 5 &&
      ['w312_approval_gate_inspection', 'w312_blocked_noop_decision', 'w311_human_approval_gate', 'w310_draft_source_diff', 'w309_source_change_blockers']
        .every((id) => trace.blockedNoopClosureMap.layers.some((layer) => layer.id === id)),
    JSON.stringify(trace.blockedNoopClosureMap.layers.map((layer) => layer.id)));

  assertCase(results, 'approval-intake-packet-lists-all-required-fields',
    trace.approvalIntakePacket.decision === 'approval_not_provided' &&
      hasRequiredField(trace, 'candidate_pack_id') &&
      hasRequiredField(trace, 'source_file') &&
      hasRequiredField(trace, 'approval_to_mutate_source') &&
      hasRequiredField(trace, 'real_website_category_evidence_confirmation') &&
      hasRequiredField(trace, 'post_install_smoke_acknowledgement') &&
      hasRequiredField(trace, 'rollback_expectation'),
    JSON.stringify(trace.approvalIntakePacket.requiredFields.map((field) => `${field.id}:${field.provided}`)));

  assertCase(results, 'approval-intake-decision-remains-approval-not-provided',
    trace.approvalIntakeDecision === 'approval_not_provided' &&
      trace.sourceMutationApplied === false &&
      trace.approvalIntakePacket.requiredFields.every((field) => field.provided === false),
    JSON.stringify({ decision: trace.approvalIntakeDecision, sourceMutationApplied: trace.sourceMutationApplied }));

  assertCase(results, 'example-approval-phrase-references-exact-candidate-and-source-file',
    /explicitly approve applying/i.test(trace.approvalIntakePacket.exampleApprovalPhrase) &&
      /electrical-components-distributor/.test(trace.approvalIntakePacket.exampleApprovalPhrase) &&
      /src\/contracts\/lanePacks\.js/.test(trace.approvalIntakePacket.exampleApprovalPhrase) &&
      /exact W310 draft source diff/.test(trace.approvalIntakePacket.exampleApprovalPhrase) &&
      /post-install smoke/.test(trace.approvalIntakePacket.exampleApprovalPhrase) &&
      /rollback/.test(trace.approvalIntakePacket.exampleApprovalPhrase),
    trace.approvalIntakePacket.exampleApprovalPhrase);

  assertCase(results, 'w312-noop-w311-gate-and-w310-draft-remain-available',
    w312Trace.status === 'blocked_noop_source_change_not_approved' &&
      w312Trace.blockedNoopPacket.sourceMutationApplied === false &&
      w311Trace.humanApprovalGate.decision === 'not_approved_yet' &&
      w311Trace.humanApprovalGate.sourceMutationAllowed === false &&
      w310Trace.sourceDiffPacket.proposedFutureSourcePatch.patchApplied === false &&
      trace.continuity.w312BlockedNoopAvailable === true &&
      trace.continuity.w311ApprovalGateNotApprovedYet === true &&
      trace.continuity.w310SourceDiffDraftOnly === true,
    JSON.stringify({ w312: w312Trace.status, w311: w311Trace.humanApprovalGate.decision, w310: w310Trace.status }));

  assertCase(results, 'source-pack-schema-valid-and-unchanged',
    Array.isArray(lanePacks.LANE_PACKS) &&
      lanePacks.LANE_PACKS.length === 9 &&
      lanePacks.LANE_PACKS.some((pack) => pack.packId === 'industrial-distributor') &&
      !lanePacks.LANE_PACKS.some((pack) => pack.packId === 'electrical-components-distributor') &&
      !/packId: 'electrical-components-distributor'/.test(lanePacksSource),
    lanePacks.LANE_PACKS.map((pack) => pack.packId).join(', '));

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
      /netsuite\.com\/app\/common\/item\/item\.nl\?id=31303/.test(record.supportedOpenUrl)
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
    !/script=6702|deploy=2|runner-w313-motion-001|finalGeneratedNamesJson|stack trace|schema/i.test(html) &&
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

  assertCase(results, 'w313-report-trace-harness-and-check-registration-present',
    packageJson.scripts['harness:explicit-approval-intake-candidate-source-change-reattempt-w313'] &&
      packageJson.scripts.check.includes('run_w313_explicit_approval_intake_candidate_source_change_reattempt_harness.js') &&
      trace.nextRecommendedBlock === 'W314: Human-Approved Candidate Lane Pack Source Mutation',
    packageJson.scripts['harness:explicit-approval-intake-candidate-source-change-reattempt-w313'] || '');

  printResults('W313 explicit approval intake candidate source change reattempt harness', results);
}

main();
