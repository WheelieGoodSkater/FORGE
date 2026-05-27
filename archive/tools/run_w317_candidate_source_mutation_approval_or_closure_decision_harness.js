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

function main() {
  const results = [];
  const hooks = loadHooks({ fetchMessage: 'live fetch disabled in W317 harness' });
  const packageJson = JSON.parse(readRepoFile('package.json'));
  const userscript = read(userscriptPath);
  const lanePacksSource = readRepoFile('src', 'contracts', 'lanePacks.js');
  const report = readArchiveText('reports', 'w317_candidate_source_mutation_approval_or_closure_decision.md');
  const trace = readArchiveJson('trace_samples', 'w317_candidate_source_mutation_approval_or_closure_decision_trace.json');
  const w316Trace = readArchiveJson('trace_samples', 'w316_approval_gated_candidate_lane_pack_source_mutation_blocked_noop_trace.json');
  const w315Trace = readArchiveJson('trace_samples', 'w315_final_human_approval_capture_candidate_source_mutation_trace.json');
  const w314Trace = readArchiveJson('trace_samples', 'w314_human_approved_candidate_lane_pack_source_mutation_blocked_noop_trace.json');
  const w313Trace = readArchiveJson('trace_samples', 'w313_explicit_approval_intake_candidate_source_change_reattempt_trace.json');
  const w310Trace = readArchiveJson('trace_samples', 'w310_review_only_candidate_lane_pack_source_diff_packet_trace.json');

  const state = motionState(hooks);
  const context = motionContext(hooks, state);
  const completedResult = completedMotionResult({ prefix: '317' });
  const completedRaw = completedRefreshResponse('runner-w317-motion-001', completedResult);
  const completedShape = hooks.actualAdapterResponseShapeW265(completedRaw, {
    phase: 'refresh',
    runnerTaskId: 'runner-w317-motion-001',
    idempotencyToken: 'motion-w317-token'
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
    submitTransport: () => submitResponse('runner-w317-motion-001', 'motion-w317-token'),
    pollTransport: () => completedRaw
  });

  assertCase(results, 'w317-closure-packet-records-blocked-pending-approval',
    /W317 Candidate Source Mutation Approval Or Closure Decision/.test(report) &&
      trace.schema === 'forge.w317.candidate-source-mutation-approval-or-closure-decision.trace.v1' &&
      trace.status === 'blocked_pending_explicit_human_approval' &&
      trace.closurePacket.decision === 'blocked_pending_explicit_human_approval' &&
      trace.closurePacket.approvalReadyForSourceMutation === false &&
      trace.inspection.approvalInW317Request === false &&
      trace.inspection.approvalMissingOrAmbiguous === true,
    JSON.stringify({ status: trace.status, closure: trace.closurePacket, inspection: trace.inspection }));

  assertCase(results, 'w316-w315-w314-w313-w310-continuity-available',
    w316Trace.status === 'blocked_noop_approval_missing' &&
      w315Trace.status === 'approval_not_provided' &&
      w314Trace.status === 'blocked_noop_explicit_approval_missing' &&
      w313Trace.approvalIntakeDecision === 'approval_not_provided' &&
      w310Trace.sourceDiffPacket.proposedFutureSourcePatch.patchApplied === false &&
      trace.continuity.w316BlockedNoopAvailable === true &&
      trace.continuity.w315FinalApprovalCaptureAvailable === true &&
      trace.continuity.w314BlockedNoopAvailable === true &&
      trace.continuity.w313ApprovalIntakeAvailable === true &&
      trace.continuity.w310SourceDiffDraftOnly === true,
    JSON.stringify({ w316: w316Trace.status, w315: w315Trace.status, w314: w314Trace.status, w313: w313Trace.approvalIntakeDecision }));

  assertCase(results, 'blocked-pending-approval-closure-keeps-source-mutation-false',
    trace.sourceMutationApplied === false &&
      trace.closurePacket.exactW310PatchApplied === false &&
      trace.closurePacket.sourcePackMutated === false &&
      trace.closurePacket.sourceTruth === false &&
      trace.closurePacket.runtimeWired === false &&
      trace.closurePacket.installable === false &&
      trace.closurePacket.autoInstallIntroduced === false,
    JSON.stringify(trace.closurePacket));

  assertCase(results, 'approval-ready-decision-shape-is-exact-w310-only',
    trace.approvalReadyDecisionShape.decision === 'approval_ready_for_source_mutation' &&
      trace.approvalReadyDecisionShape.requiresExactApproval === true &&
      trace.approvalReadyDecisionShape.futureMutationMayApplyOnlyExactW310Diff === true &&
      trace.approvalReadyDecisionShape.doesNotAuthorizeInstallOrAutoInstall === true &&
      trace.approvalReadyDecisionShape.doesNotAuthorizeRuntimeWiringBeyondSourceContract === true &&
      trace.approvalReadyDecisionShape.doesNotAuthorizeAdapterChange === true &&
      trace.approvalReadyDecisionShape.doesNotAuthorizeDrawerCreatedRecords === true &&
      trace.approvalReadyDecisionShape.doesNotAuthorizeDrawerTransactionWrites === true,
    JSON.stringify(trace.approvalReadyDecisionShape));

  assertCase(results, 'w310-source-diff-remains-draft-only-and-not-applied',
    w310Trace.sourceDiffPacket.proposedFutureSourcePatch.patchLines.some((line) => /packId: 'electrical-components-distributor'/.test(line)) &&
      w310Trace.sourceDiffPacket.proposedFutureSourcePatch.patchLines.some((line) => /subIndustryId: 'electrical-components-distributor'/.test(line)) &&
      w310Trace.sourceDiffPacket.proposedFutureSourcePatch.patchApplied === false &&
      !/packId: 'electrical-components-distributor'/.test(lanePacksSource),
    JSON.stringify(w310Trace.diffReadinessAcceptancePacket));

  assertCase(results, 'source-pack-schema-valid-and-candidate-absent',
    Array.isArray(lanePacks.LANE_PACKS) &&
      lanePacks.LANE_PACKS.length === 9 &&
      lanePacks.LANE_PACKS.some((pack) => pack.packId === 'industrial-distributor') &&
      lanePacks.LANE_PACKS.some((pack) => pack.packId === 'retail-availability') &&
      !lanePacks.LANE_PACKS.some((pack) => pack.packId === 'electrical-components-distributor') &&
      !/electrical-components-distributor/.test(lanePacksSource),
    lanePacks.LANE_PACKS.map((pack) => pack.packId).join(', '));

  assertCase(results, 'no-install-auto-install-or-runtime-wiring',
    trace.guardrails.sourceLanePacksMutated === false &&
      trace.guardrails.autoInstallIntroduced === false &&
      trace.guardrails.candidateWiredIntoRuntime === false &&
      trace.continuity.sourceLanePacksChanged === false &&
      trace.continuity.proposedPacksInstalled === false &&
      userscript.indexOf('electrical-components-distributor') < 0,
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

  assertCase(results, 'returned-records-open-links-and-review-copy-unchanged',
    normalizedImport.visibleRecords.some((record) =>
      record.recordName === 'Motion Branch Fulfillment SKU' &&
      /Product SKU/.test(record.consultantLabel) &&
      record.safeToOpen === true &&
      /netsuite\.com\/app\/common\/item\/item\.nl\?id=31703/.test(record.supportedOpenUrl)
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

  assertCase(results, 'normal-consultant-ui-hides-diagnostics',
    !/script=6702|deploy=2|runner-w317-motion-001|finalGeneratedNamesJson|stack trace|schema/i.test(html) &&
      trace.guardrails.normalConsultantUiHidesEndpointProfileRawAdminDiagnostics === true,
    html.slice(0, 700));

  assertCase(results, 'no-runtime-authority-drawer-records-or-writes',
    trace.guardrails.runtimeBehaviorChanged === false &&
      trace.guardrails.connectedBuildFlowChanged === false &&
      trace.guardrails.recordCreationAuthorityChanged === false &&
      trace.guardrails.noDrawerCreatedRecords === true &&
      trace.guardrails.noDrawerTransactionWrites === true &&
      trace.guardrails.noW144DeploymentUpdate === true &&
      trace.guardrails.nllmAdvisoryOnly === true &&
      trace.guardrails.uncertaintyVisible === true,
    JSON.stringify(trace.guardrails));

  assertCase(results, 'candidate-absent-from-runtime-and-source-pack-files',
    userscript.indexOf('electrical-components-distributor') < 0 &&
      lanePacksSource.indexOf('electrical-components-distributor') < 0,
    'candidate token should not be present in runtime or lanePacks source');

  assertCase(results, 'w317-package-check-registration-and-next-block-present',
    packageJson.scripts['harness:candidate-source-mutation-approval-or-closure-decision-w317'] &&
      packageJson.scripts.check.includes('run_w317_candidate_source_mutation_approval_or_closure_decision_harness.js') &&
      trace.nextRecommendedBlock === 'W318: Post-Approval-Gate Roadmap And Next Product Optimization Slice',
    packageJson.scripts['harness:candidate-source-mutation-approval-or-closure-decision-w317'] || '');

  printResults('W317 candidate source mutation approval or closure decision harness', results);
}

main();
