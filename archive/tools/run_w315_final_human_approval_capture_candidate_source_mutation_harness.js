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
  return trace.approvalCapturePacket.requiredFields.some((field) => field.id === id);
}

function allRequiredFieldsProvided(fields) {
  return fields.every((field) => field.provided === true);
}

function finalApprovalDecision(fields) {
  return allRequiredFieldsProvided(fields)
    ? 'approval_ready_for_source_mutation'
    : 'approval_not_provided';
}

function main() {
  const results = [];
  const hooks = loadHooks({ fetchMessage: 'live fetch disabled in W315 harness' });
  const packageJson = JSON.parse(readRepoFile('package.json'));
  const userscript = read(userscriptPath);
  const lanePacksSource = readRepoFile('src', 'contracts', 'lanePacks.js');
  const report = readArchiveText('reports', 'w315_final_human_approval_capture_candidate_source_mutation.md');
  const trace = readArchiveJson('trace_samples', 'w315_final_human_approval_capture_candidate_source_mutation_trace.json');
  const w314Trace = readArchiveJson('trace_samples', 'w314_human_approved_candidate_lane_pack_source_mutation_blocked_noop_trace.json');
  const w313Trace = readArchiveJson('trace_samples', 'w313_explicit_approval_intake_candidate_source_change_reattempt_trace.json');
  const w310Trace = readArchiveJson('trace_samples', 'w310_review_only_candidate_lane_pack_source_diff_packet_trace.json');

  const approvedFieldsFixture = trace.approvalCapturePacket.requiredFields.map((field) => Object.assign({}, field, { provided: true }));
  const actualDecision = finalApprovalDecision(trace.approvalCapturePacket.requiredFields);
  const approvedDecision = finalApprovalDecision(approvedFieldsFixture);

  const state = motionState(hooks);
  const context = motionContext(hooks, state);
  const completedResult = completedMotionResult({ prefix: '315' });
  const completedRaw = completedRefreshResponse('runner-w315-motion-001', completedResult);
  const completedShape = hooks.actualAdapterResponseShapeW265(completedRaw, {
    phase: 'refresh',
    runnerTaskId: 'runner-w315-motion-001',
    idempotencyToken: 'motion-w315-token'
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
    submitTransport: () => submitResponse('runner-w315-motion-001', 'motion-w315-token'),
    pollTransport: () => completedRaw
  });

  assertCase(results, 'final-approval-capture-packet-exists-and-defaults-not-provided',
    trace.schema === 'forge.w315.final-human-approval-capture-candidate-source-mutation.trace.v1' &&
      trace.status === 'approval_not_provided' &&
      trace.approvalCapturePacket.schema === 'forge.w315.final-approval-capture.v1' &&
      trace.approvalCapturePacket.decision === 'approval_not_provided' &&
      trace.approvalCapturePacket.readyForSourceMutation === false &&
      /W315 Final Human Approval Capture/.test(report),
    JSON.stringify({ status: trace.status, decision: trace.approvalCapturePacket.decision }));

  assertCase(results, 'approval-capture-packet-lists-all-required-fields',
    hasRequiredField(trace, 'candidate_pack_id') &&
      hasRequiredField(trace, 'source_file') &&
      hasRequiredField(trace, 'approval_to_mutate_source_using_exact_w310_diff') &&
      hasRequiredField(trace, 'real_website_category_evidence_confirmation') &&
      hasRequiredField(trace, 'post_install_smoke_acknowledgement') &&
      hasRequiredField(trace, 'rollback_expectation'),
    JSON.stringify(trace.approvalCapturePacket.requiredFields.map((field) => `${field.id}:${field.provided}`)));

  assertCase(results, 'actual-approval-not-provided-case-remains-blocked',
    actualDecision === 'approval_not_provided' &&
      trace.approvalEvaluationCases.approvalNotProvidedActual.decision === 'approval_not_provided' &&
      trace.approvalEvaluationCases.approvalNotProvidedActual.readyForSourceMutation === false &&
      trace.approvalEvaluationCases.approvalNotProvidedActual.sourceMutationAllowed === false &&
      trace.approvalCapturePacket.requiredFields.every((field) => field.provided === false),
    JSON.stringify(trace.approvalEvaluationCases.approvalNotProvidedActual));

  assertCase(results, 'approval-ready-fixture-case-is-represented-without-mutating-source',
    approvedDecision === 'approval_ready_for_source_mutation' &&
      trace.approvalEvaluationCases.approvalReadyFixture.decision === 'approval_ready_for_source_mutation' &&
      trace.approvalEvaluationCases.approvalReadyFixture.readyForSourceMutation === true &&
      trace.approvalEvaluationCases.approvalReadyFixture.sourceMutationAllowed === true &&
      trace.approvalEvaluationCases.approvalReadyFixture.wouldAuthorizeOnlyExactW310Diff === true &&
      trace.sourceMutationApplied === false,
    JSON.stringify(trace.approvalEvaluationCases.approvalReadyFixture));

  assertCase(results, 'example-approval-phrase-references-exact-candidate-source-diff-smoke-and-rollback',
    /explicitly approve applying/i.test(trace.approvalCapturePacket.exampleApprovalPhrase) &&
      /electrical-components-distributor/.test(trace.approvalCapturePacket.exampleApprovalPhrase) &&
      /src\/contracts\/lanePacks\.js/.test(trace.approvalCapturePacket.exampleApprovalPhrase) &&
      /exact W310 draft source diff/.test(trace.approvalCapturePacket.exampleApprovalPhrase) &&
      /post-install smoke/.test(trace.approvalCapturePacket.exampleApprovalPhrase) &&
      /rollback/.test(trace.approvalCapturePacket.exampleApprovalPhrase),
    trace.approvalCapturePacket.exampleApprovalPhrase);

  assertCase(results, 'w314-blocked-noop-and-w313-intake-continuity-remain-available',
    w314Trace.status === 'blocked_noop_explicit_approval_missing' &&
      w314Trace.sourceMutationApplied === false &&
      w313Trace.approvalIntakeDecision === 'approval_not_provided' &&
      trace.continuity.w314BlockedNoopAvailable === true &&
      trace.continuity.w313ApprovalIntakeAvailable === true &&
      trace.continuity.w313ApprovalIntakeDecision === 'approval_not_provided',
    JSON.stringify({ w314: w314Trace.status, w313: w313Trace.approvalIntakeDecision }));

  assertCase(results, 'w310-draft-only-diff-and-source-pack-schema-remain-unchanged',
    w310Trace.sourceDiffPacket.proposedFutureSourcePatch.patchLines.some((line) => /packId: 'electrical-components-distributor'/.test(line)) &&
      w310Trace.sourceDiffPacket.proposedFutureSourcePatch.patchApplied === false &&
      Array.isArray(lanePacks.LANE_PACKS) &&
      lanePacks.LANE_PACKS.length === 9 &&
      !lanePacks.LANE_PACKS.some((pack) => pack.packId === 'electrical-components-distributor') &&
      !/packId: 'electrical-components-distributor'/.test(lanePacksSource),
    lanePacks.LANE_PACKS.map((pack) => pack.packId).join(', '));

  assertCase(results, 'no-install-auto-install-runtime-wiring-or-source-mutation',
    userscript.indexOf('electrical-components-distributor') < 0 &&
      lanePacksSource.indexOf('electrical-components-distributor') < 0 &&
      trace.sourceMutationApplied === false &&
      trace.guardrails.sourceLanePacksMutated === false &&
      trace.guardrails.autoInstallIntroduced === false &&
      trace.guardrails.candidateWiredIntoRuntime === false &&
      trace.continuity.sourceLanePacksChanged === false &&
      trace.continuity.proposedPacksInstalled === false,
    JSON.stringify({ guardrails: trace.guardrails, continuity: trace.continuity }));

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
      /netsuite\.com\/app\/common\/item\/item\.nl\?id=31503/.test(record.supportedOpenUrl)
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
    !/script=6702|deploy=2|runner-w315-motion-001|finalGeneratedNamesJson|stack trace|schema/i.test(html) &&
      trace.guardrails.normalConsultantUiHidesEndpointProfileRawAdminDiagnostics === true,
    html.slice(0, 700));

  assertCase(results, 'no-runtime-authority-drawer-records-or-transaction-writes',
    trace.guardrails.runtimeBehaviorChanged === false &&
      trace.guardrails.connectedBuildFlowChanged === false &&
      trace.guardrails.recordCreationAuthorityChanged === false &&
      trace.guardrails.noDrawerCreatedRecords === true &&
      trace.guardrails.noDrawerTransactionWrites === true &&
      trace.guardrails.nllmAdvisoryOnly === true &&
      trace.guardrails.uncertaintyVisible === true,
    JSON.stringify(trace.guardrails));

  assertCase(results, 'w315-report-trace-harness-and-check-registration-present',
    packageJson.scripts['harness:final-human-approval-capture-candidate-source-mutation-w315'] &&
      packageJson.scripts.check.includes('run_w315_final_human_approval_capture_candidate_source_mutation_harness.js') &&
      trace.nextRecommendedBlock === 'W316: Approval-Gated Candidate Lane Pack Source Mutation',
    packageJson.scripts['harness:final-human-approval-capture-candidate-source-mutation-w315'] || '');

  printResults('W315 final human approval capture candidate source mutation harness', results);
}

main();
