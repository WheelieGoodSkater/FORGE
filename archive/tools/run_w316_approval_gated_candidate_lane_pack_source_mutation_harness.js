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
  const hooks = loadHooks({ fetchMessage: 'live fetch disabled in W316 harness' });
  const packageJson = JSON.parse(readRepoFile('package.json'));
  const userscript = read(userscriptPath);
  const lanePacksSource = readRepoFile('src', 'contracts', 'lanePacks.js');
  const report = readArchiveText('reports', 'w316_approval_gated_candidate_lane_pack_source_mutation_blocked_noop.md');
  const trace = readArchiveJson('trace_samples', 'w316_approval_gated_candidate_lane_pack_source_mutation_blocked_noop_trace.json');
  const w315Trace = readArchiveJson('trace_samples', 'w315_final_human_approval_capture_candidate_source_mutation_trace.json');
  const w314Trace = readArchiveJson('trace_samples', 'w314_human_approved_candidate_lane_pack_source_mutation_blocked_noop_trace.json');
  const w313Trace = readArchiveJson('trace_samples', 'w313_explicit_approval_intake_candidate_source_change_reattempt_trace.json');
  const w310Trace = readArchiveJson('trace_samples', 'w310_review_only_candidate_lane_pack_source_diff_packet_trace.json');

  const state = motionState(hooks);
  const context = motionContext(hooks, state);
  const completedResult = completedMotionResult({ prefix: '316' });
  const completedRaw = completedRefreshResponse('runner-w316-motion-001', completedResult);
  const completedShape = hooks.actualAdapterResponseShapeW265(completedRaw, {
    phase: 'refresh',
    runnerTaskId: 'runner-w316-motion-001',
    idempotencyToken: 'motion-w316-token'
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
    submitTransport: () => submitResponse('runner-w316-motion-001', 'motion-w316-token'),
    pollTransport: () => completedRaw
  });

  assertCase(results, 'approval-gate-inspection-blocks-without-explicit-approval',
    trace.schema === 'forge.w316.approval-gated-candidate-lane-pack-source-mutation.trace.v1' &&
      trace.status === 'blocked_noop_approval_missing' &&
      trace.pathTaken === 'blocked_noop' &&
      trace.approvalGateInspection.w315Decision === 'approval_not_provided' &&
      trace.approvalGateInspection.w315ReadyForSourceMutation === false &&
      trace.approvalGateInspection.explicitApprovalInW316Request === false &&
      trace.approvalGateInspection.approvalMissingOrAmbiguous === true,
    JSON.stringify(trace.approvalGateInspection));

  assertCase(results, 'blocked-noop-packet-records-no-source-mutation',
    /W316 Approval-Gated Candidate Lane Pack Source Mutation Blocked No-Op/.test(report) &&
      trace.blockedNoopPacket.sourceMutationApplied === false &&
      trace.blockedNoopPacket.exactW310PatchApplied === false &&
      trace.blockedNoopPacket.candidatePackIdAdded === false &&
      trace.blockedNoopPacket.existingSourcePacksModified === false,
    JSON.stringify(trace.blockedNoopPacket));

  assertCase(results, 'approved-path-fixture-is-exact-w310-only-without-install-or-runtime-wiring',
    trace.approvedPathFixture.wouldRequireW313ApprovalPhraseOrEquivalentFields === true &&
      trace.approvedPathFixture.wouldApplyOnlyExactW310Patch === true &&
      trace.approvedPathFixture.wouldInsertPackId === 'electrical-components-distributor' &&
      trace.approvedPathFixture.wouldTargetSourceFile === 'src/contracts/lanePacks.js' &&
      trace.approvedPathFixture.wouldModifyExistingPacks === false &&
      trace.approvedPathFixture.wouldInstallProposedPack === false &&
      trace.approvedPathFixture.wouldAddAutoInstall === false &&
      trace.approvedPathFixture.wouldAddRuntimeWiringBeyondSourceContract === false,
    JSON.stringify(trace.approvedPathFixture));

  assertCase(results, 'w310-exact-source-addition-remains-draft-only-not-applied',
    w310Trace.sourceDiffPacket.proposedFutureSourcePatch.patchLines.some((line) => /packId: 'electrical-components-distributor'/.test(line)) &&
      w310Trace.sourceDiffPacket.proposedFutureSourcePatch.patchLines.some((line) => /subIndustryId: 'electrical-components-distributor'/.test(line)) &&
      w310Trace.sourceDiffPacket.proposedFutureSourcePatch.patchApplied === false &&
      trace.sourceMutationEvidence.diffSummary === 'No source diff applied. W310 remains draft-only.' &&
      !/packId: 'electrical-components-distributor'/.test(lanePacksSource),
    JSON.stringify(w310Trace.diffReadinessAcceptancePacket));

  assertCase(results, 'source-pack-schema-valid-existing-packs-unchanged-and-candidate-absent',
    Array.isArray(lanePacks.LANE_PACKS) &&
      lanePacks.LANE_PACKS.length === 9 &&
      lanePacks.LANE_PACKS.some((pack) => pack.packId === 'industrial-distributor' && pack.laneId === 'industrial_distribution') &&
      lanePacks.LANE_PACKS.some((pack) => pack.packId === 'retail-availability') &&
      !lanePacks.LANE_PACKS.some((pack) => pack.packId === 'electrical-components-distributor') &&
      !/electrical-components-distributor/.test(lanePacksSource),
    lanePacks.LANE_PACKS.map((pack) => pack.packId).join(', '));

  assertCase(results, 'w315-w314-w313-continuity-remains-available',
    w315Trace.status === 'approval_not_provided' &&
      w315Trace.approvalCapturePacket.readyForSourceMutation === false &&
      w314Trace.status === 'blocked_noop_explicit_approval_missing' &&
      w313Trace.approvalIntakeDecision === 'approval_not_provided' &&
      trace.continuity.w315FinalApprovalCaptureAvailable === true &&
      trace.continuity.w314BlockedNoopAvailable === true &&
      trace.continuity.w313ApprovalIntakeAvailable === true,
    JSON.stringify({ w315: w315Trace.status, w314: w314Trace.status, w313: w313Trace.approvalIntakeDecision }));

  assertCase(results, 'no-install-auto-install-runtime-wiring-or-authority-introduced',
    trace.blockedNoopPacket.candidatePackInstalled === false &&
      trace.blockedNoopPacket.autoInstallIntroduced === false &&
      trace.blockedNoopPacket.runtimeWiringBeyondSourceContractAdded === false &&
      trace.blockedNoopPacket.runtimeAuthorityChanged === false &&
      trace.guardrails.autoInstallIntroduced === false &&
      trace.guardrails.candidateWiredIntoRuntime === false &&
      trace.guardrails.recordCreationAuthorityChanged === false,
    JSON.stringify({ noop: trace.blockedNoopPacket, guardrails: trace.guardrails }));

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
      /netsuite\.com\/app\/common\/item\/item\.nl\?id=31603/.test(record.supportedOpenUrl)
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
    !/script=6702|deploy=2|runner-w316-motion-001|finalGeneratedNamesJson|stack trace|schema/i.test(html) &&
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

  assertCase(results, 'w316-report-trace-harness-and-check-registration-present',
    packageJson.scripts['harness:approval-gated-candidate-lane-pack-source-mutation-w316'] &&
      packageJson.scripts.check.includes('run_w316_approval_gated_candidate_lane_pack_source_mutation_harness.js') &&
      trace.nextRecommendedBlock === 'W317: Candidate Source Mutation Approval Or Closure Decision',
    packageJson.scripts['harness:approval-gated-candidate-lane-pack-source-mutation-w316'] || '');

  printResults('W316 approval-gated candidate lane pack source mutation harness', results);
}

main();
