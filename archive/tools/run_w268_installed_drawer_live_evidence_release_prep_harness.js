#!/usr/bin/env node

const {
  assertCase,
  completedMotionResult,
  loadHooks,
  motionState,
  printResults,
  readArchiveJson,
  readArchiveText
} = require('./lib/forge_harness_fixtures');

function buildW266Packet(hooks) {
  const state = motionState(hooks);
  const lane = hooks.getLane(state);
  const page = state.pageContext;
  const recommendation = hooks.recommendMove(lane, page);
  return hooks.controlledLiveBuildRunEvidencePacketW266(state, lane, page, recommendation, {
    submittedAt: '2026-05-25T13:00:00.000Z',
    submitResponse: {
      statusCode: 200,
      ok: true,
      payload: {
        status: 'queued',
        queueSubmitted: true,
        task: { id: 'runner-w268-motion-001' },
        idempotencyToken: 'motion-w268-token',
        resultCapture: { status: 'pending_runner_completion' }
      }
    },
    pendingRefreshResponse: {
      data: {
        status: 'pending',
        queued: true,
        runner_task_id: 'runner-w268-motion-001',
        resultCapture: { status: 'pending_runner_completion' }
      }
    },
    completedRefreshResponse: {
      ok: true,
      payload: {
        status: 'done',
        queueSubmitted: true,
        runner_task_id: 'runner-w268-motion-001',
        resultCapture: {
          status: 'completed_result_capture_ready',
          finalGeneratedNamesJson: completedMotionResult()
        }
      }
    },
    finishBuild: true
  });
}

function filledIntake(hooks, w266Packet, overrides = {}) {
  const template = hooks.installedDrawerLiveEvidenceIntakeTemplateW268();
  template.evidenceFields = template.evidenceFields.map((field) => Object.assign({}, field, {
    pass: true,
    note: `${field.label} captured in installed drawer review.`
  }));
  template.expectedConsultantCopyShown = true;
  template.returnedRecordsShown = w266Packet.importEvidence.returnedRecords.map((record) => ({ name: record.name, label: record.label }));
  template.openLinks = w266Packet.importEvidence.returnedRecords.reduce((acc, record) => {
    acc[record.role] = { openedSuccessfully: true, note: 'Opened successfully during review.' };
    return acc;
  }, {});
  Object.assign(template, overrides);
  return template;
}

function main() {
  const hooks = loadHooks({ fetchMessage: 'live fetch disabled in W268 harness' });
  const report = readArchiveText('reports', 'w268_installed_drawer_live_evidence_release_prep.md');
  const trace = readArchiveJson('trace_samples', 'w268_installed_drawer_live_evidence_release_prep_trace.json');
  const w266Packet = buildW266Packet(hooks);
  const readyIntake = filledIntake(hooks, w266Packet);
  const readyEvidence = hooks.reviewerEvidenceFromIntakeW268(readyIntake);
  const readyW267 = hooks.postLiveRunScreenshotEvidencePacketW267(w266Packet, { reviewerEvidence: readyEvidence });
  const readyRelease = hooks.releaseKeepPacketV100W268(w266Packet, readyW267);
  const needsIntake = filledIntake(hooks, w266Packet);
  needsIntake.evidenceFields = needsIntake.evidenceFields.map((field) => field.id === 'returnedNamesLaneLabelsShown'
    ? Object.assign({}, field, { pass: false, note: 'One label needs UI polish.' })
    : field);
  needsIntake.returnedRecordsShown = w266Packet.importEvidence.returnedRecords.slice(0, 2).map((record) => ({ name: record.name, label: record.label }));
  const needsW267 = hooks.postLiveRunScreenshotEvidencePacketW267(w266Packet, { reviewerEvidence: hooks.reviewerEvidenceFromIntakeW268(needsIntake) });
  const needsRelease = hooks.releaseKeepPacketV100W268(w266Packet, needsW267, { needsAttentionUiPolish: ['Returned records label row needs polish.'] });
  const rollbackIntake = filledIntake(hooks, w266Packet, {
    fakeOpenLinksVisible: true,
    unsupportedUrlsVisible: true
  });
  const rollbackW267 = hooks.postLiveRunScreenshotEvidencePacketW267(w266Packet, { reviewerEvidence: hooks.reviewerEvidenceFromIntakeW268(rollbackIntake) });
  const rollbackRelease = hooks.releaseKeepPacketV100W268(w266Packet, rollbackW267);
  const inventory = hooks.codeReviewPrepInventoryW268();
  const w264Cluster = hooks.connectedBuildSubmitRefreshImportW264(
    motionState(hooks),
    hooks.getLane(motionState(hooks)),
    motionState(hooks).pageContext,
    hooks.recommendMove(hooks.getLane(motionState(hooks)), motionState(hooks).pageContext),
    { executeSubmit: false, executePoll: false }
  );
  const w265Retry = hooks.connectedBuildRetryPolicyW265({
    runnerTaskId: w266Packet.submitEvidence.runnerTaskId,
    idempotencyToken: w266Packet.submitEvidence.idempotencyToken
  });
  const results = [];
  const mapIds = readyIntake.evidenceFields.map((field) => field.mapsToW267);

  assertCase(results, 'installed-drawer-live-evidence-intake-template-maps-to-w267-fields',
    readyIntake.schema === 'forge.w268.installed-drawer-live-evidence-intake-template.v1' &&
      ['build_records_clicked', 'build_submitted_state_shown', 'refresh_build_status_state_shown', 'records_ready_finish_build_state_shown', 'returned_names_lane_labels_shown', 'supported_open_links_after_import', 'review_run_story_surfaces_visible', 'weak_uncertainty_visible', 'rawDiagnosticsHidden'].every((id) => mapIds.indexOf(id) >= 0) &&
      readyEvidence.buildRecordsClicked.pass === true &&
      readyEvidence.rawDiagnosticsVisible === false,
    JSON.stringify({ mapIds, readyEvidence }));

  assertCase(results, 'v1-release-keep-packet-includes-required-summary-fields',
    readyRelease.schema === 'forge.w268.v1-release-keep-packet.v1' &&
      readyRelease.installTarget === 'idb-drawer.user.js' &&
      /customdeployidb_governed_runner_adapter/.test(readyRelease.adapterProfileUsed.deploymentScriptId || '') &&
      readyRelease.motionRunOutcome.prospect === 'Motion Industries' &&
      readyRelease.returnedRecords.length === w266Packet.importEvidence.returnedRecords.length &&
      readyRelease.openLinkVerification.allExpectedRecordsCaptured === true &&
      readyRelease.storySurfaceReadiness.reviewerConfirmed === true &&
      Array.isArray(readyRelease.needsAttentionUiPolish) &&
      readyRelease.decision.status === 'ready_to_keep',
    JSON.stringify(readyRelease));

  assertCase(results, 'release-keep-packet-represents-ready-attention-and-rollback',
    readyRelease.status === 'ready_to_keep' &&
      needsRelease.status === 'needs_attention' &&
      rollbackRelease.status === 'rollback_recommended',
    JSON.stringify({ ready: readyRelease.decision, needs: needsRelease.decision, rollback: rollbackRelease.decision }));

  assertCase(results, 'code-review-prep-inventory-covers-next-phase',
    inventory.oversizedRuntimeHelperAreas.some((item) => /idb-drawer\.user\.js/.test(item)) &&
      inventory.candidateExtractionPointsIntoContracts.length >= 4 &&
      inventory.duplicatedFixtureSetupPatterns.some((item) => /Motion Industries/.test(item)) &&
      inventory.stableNormalConsultantUiSurfaces.some((item) => /Build records/.test(item)) &&
      inventory.runtimeAuthorityBoundariesThatMustNotMove.some((item) => /no drawer-created records/.test(item)),
    JSON.stringify(inventory));

  assertCase(results, 'review-only-packet-introduces-no-external-actions',
    readyRelease.reviewOnlyPolicy.externalUploadAllowed === false &&
      readyRelease.reviewOnlyPolicy.networkCallAllowed === false &&
      readyRelease.reviewOnlyPolicy.trackingAllowed === false &&
      readyRelease.reviewOnlyPolicy.localStorageWriteAllowed === false &&
      readyRelease.reviewOnlyPolicy.installActionAllowed === false &&
      readyRelease.reviewOnlyPolicy.runtimeDependencyAdded === false,
    JSON.stringify(readyRelease.reviewOnlyPolicy));

  assertCase(results, 'w267-signoff-remains-available',
    readyW267.signoff.status === 'ready_to_keep' &&
      needsW267.signoff.status === 'needs_attention' &&
      rollbackW267.signoff.status === 'rollback_recommended',
    JSON.stringify({ ready: readyW267.signoff, needs: needsW267.signoff, rollback: rollbackW267.signoff }));

  assertCase(results, 'w264-w265-w266-w267-continuity-still-passes',
    w264Cluster.guardrails.noDrawerCreatedRecords === true &&
      w265Retry.duplicateSubmit.createsSecondBuild === false &&
      w266Packet.liveRunDecision.status === 'ready_to_keep' &&
      readyW267.openLinkVerification.allExpectedRecordsCaptured === true,
    JSON.stringify({ w264: w264Cluster.guardrails, w265: w265Retry.duplicateSubmit, w266: w266Packet.liveRunDecision, w267: readyW267.signoff }));

  assertCase(results, 'no-drawer-created-records-or-transaction-writes-introduced',
    readyRelease.guardrails.noDrawerCreatedRecords === true &&
      readyRelease.guardrails.noDrawerTransactionWrites === true &&
      readyRelease.guardrails.noW144DeploymentUpdateInThisBlock === true,
    JSON.stringify(readyRelease.guardrails));

  assertCase(results, 'report-and-trace-archived',
    /W268 Installed Drawer Live Evidence/.test(report) &&
      trace.schema === 'forge.w268.installed-drawer-live-evidence-release-prep.trace.v1' &&
      trace.releaseKeepPacket.status === 'ready_to_keep',
    JSON.stringify(trace));

  printResults('W268 installed drawer live evidence release prep harness', results);
}

main();
