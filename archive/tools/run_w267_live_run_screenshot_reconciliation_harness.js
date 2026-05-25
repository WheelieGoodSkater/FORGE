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
    submittedAt: '2026-05-25T12:30:00.000Z',
    submitResponse: {
      statusCode: 200,
      ok: true,
      payload: {
        status: 'queued',
        queueSubmitted: true,
        task: { id: 'runner-w267-motion-001' },
        idempotencyToken: 'motion-w267-token',
        resultCapture: { status: 'pending_runner_completion' }
      }
    },
    pendingRefreshResponse: {
      data: {
        status: 'pending',
        queued: true,
        runner_task_id: 'runner-w267-motion-001',
        resultCapture: { status: 'pending_runner_completion' }
      }
    },
    completedRefreshResponse: {
      ok: true,
      payload: {
        status: 'done',
        queueSubmitted: true,
        runner_task_id: 'runner-w267-motion-001',
        resultCapture: {
          status: 'completed_result_capture_ready',
          finalGeneratedNamesJson: completedMotionResult()
        }
      }
    },
    finishBuild: true
  });
}

function passingReviewerEvidence(w266Packet) {
  const records = w266Packet.importEvidence.returnedRecords;
  const openLinks = {};
  records.forEach((record) => {
    openLinks[record.role] = { openedSuccessfully: true, note: 'Opened in NetSuite during screenshot review.' };
  });
  return {
    buildRecordsClicked: true,
    buildSubmittedStateShown: true,
    refreshBuildStatusStateShown: true,
    recordsReadyFinishBuildStateShown: true,
    returnedNamesLaneLabelsShown: true,
    supportedOpenLinksAfterImport: true,
    reviewRunStorySurfacesVisible: true,
    weakUncertaintyVisible: { pass: true, note: 'Motion website evidence remained thin enough to keep uncertainty visible.' },
    expectedConsultantCopyShown: true,
    returnedRecordsShown: records.map((record) => ({ name: record.name, label: record.label })),
    openLinks,
    rawDiagnosticsVisible: false,
    endpointVisible: false,
    runnerTaskIdVisible: false,
    schemaNamesVisible: false,
    stackTraceVisible: false,
    adminDiagnosticsVisible: false,
    fakeOpenLinksVisible: false,
    unsupportedUrlsVisible: false,
    invalidImportVisible: false
  };
}

function main() {
  const hooks = loadHooks({ fetchMessage: 'live fetch disabled in W267 harness' });
  const report = readArchiveText('reports', 'w267_live_run_screenshot_reconciliation.md');
  const trace = readArchiveJson('trace_samples', 'w267_live_run_screenshot_reconciliation_trace.json');
  const w266Packet = buildW266Packet(hooks);
  const readyPacket = hooks.postLiveRunScreenshotEvidencePacketW267(w266Packet, {
    reviewerEvidence: passingReviewerEvidence(w266Packet)
  });
  const needsPacket = hooks.postLiveRunScreenshotEvidencePacketW267(w266Packet, {
    reviewerEvidence: Object.assign({}, passingReviewerEvidence(w266Packet), {
      returnedNamesLaneLabelsShown: { pass: false, note: 'One label needs copy polish.' },
      returnedRecordsShown: w266Packet.importEvidence.returnedRecords.slice(0, 2).map((record) => ({ name: record.name, label: record.label }))
    })
  });
  const rollbackPacket = hooks.postLiveRunScreenshotEvidencePacketW267(w266Packet, {
    reviewerEvidence: Object.assign({}, passingReviewerEvidence(w266Packet), {
      fakeOpenLinksVisible: true,
      unsupportedUrlsVisible: true
    })
  });
  const openLinkCapture = hooks.openLinkVerificationCaptureW267(
    w266Packet.importEvidence.returnedRecords,
    passingReviewerEvidence(w266Packet).openLinks
  );
  const w264Policy = hooks.connectedBuildSubmitRefreshImportW264(
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
  const requiredIds = [
    'build_records_clicked',
    'build_submitted_state_shown',
    'refresh_build_status_state_shown',
    'records_ready_finish_build_state_shown',
    'returned_names_lane_labels_shown',
    'supported_open_links_after_import',
    'review_run_story_surfaces_visible',
    'weak_uncertainty_visible'
  ];

  assertCase(results, 'screenshot-evidence-reconciliation-packet-includes-required-capture-fields',
    readyPacket.schema === 'forge.w267.post-live-run-screenshot-evidence-reconciliation.v1' &&
      requiredIds.every((id) => readyPacket.reviewerEvidenceRows.some((row) => row.id === id)) &&
      readyPacket.expectedFromW266.records.length === w266Packet.importEvidence.returnedRecords.length &&
      readyPacket.reviewOnlyPolicy.archiveOnly === true,
    JSON.stringify(readyPacket.reviewerEvidenceRows));

  assertCase(results, 'open-link-verification-capture-includes-each-returned-w266-record',
    openLinkCapture.rows.length === w266Packet.importEvidence.returnedRecords.length &&
      openLinkCapture.rows.every((row) => row.openedSuccessfully === true && row.expectedSupportedOpenUrl === true),
    JSON.stringify(openLinkCapture));

  assertCase(results, 'signoff-helper-returns-ready-attention-and-rollback',
    readyPacket.signoff.status === 'ready_to_keep' &&
      needsPacket.signoff.status === 'needs_attention' &&
      rollbackPacket.signoff.status === 'rollback_recommended',
    JSON.stringify({ ready: readyPacket.signoff, needs: needsPacket.signoff, rollback: rollbackPacket.signoff }));

  assertCase(results, 'normal-consultant-ui-expectations-hide-raw-diagnostics',
    readyPacket.comparison.rawDiagnosticsHidden === true &&
      readyPacket.screenshotEvidence.endpointVisible === false &&
      readyPacket.screenshotEvidence.runnerTaskIdVisible === false &&
      readyPacket.screenshotEvidence.schemaNamesVisible === false &&
      readyPacket.screenshotEvidence.stackTraceVisible === false &&
      readyPacket.screenshotEvidence.adminDiagnosticsVisible === false,
    JSON.stringify(readyPacket.screenshotEvidence));

  assertCase(results, 'w266-live-run-decision-remains-available',
    w266Packet.liveRunDecision.status === 'ready_to_keep' &&
      readyPacket.expectedFromW266.openLinkAuthority === true,
    JSON.stringify(w266Packet.liveRunDecision));

  assertCase(results, 'w264-w265-w266-continuity-remains-available',
    w264Policy.guardrails.noDrawerCreatedRecords === true &&
      w265Retry.duplicateSubmit.createsSecondBuild === false &&
      w266Packet.guardrails.w265RetrySafetyPreserved === true,
    JSON.stringify({ w264: w264Policy.guardrails, w265: w265Retry.duplicateSubmit, w266: w266Packet.guardrails }));

  assertCase(results, 'no-drawer-created-records-or-transaction-writes-introduced',
    readyPacket.guardrails.noDrawerCreatedRecords === true &&
      readyPacket.guardrails.noDrawerTransactionWrites === true &&
      readyPacket.reviewOnlyPolicy.networkCallAllowed === false &&
      readyPacket.reviewOnlyPolicy.localStorageWriteAllowed === false &&
      readyPacket.reviewOnlyPolicy.installActionAllowed === false,
    JSON.stringify({ guardrails: readyPacket.guardrails, policy: readyPacket.reviewOnlyPolicy }));

  assertCase(results, 'report-and-trace-archived',
    /W267 Live Run Screenshot Reconciliation/.test(report) &&
      trace.schema === 'forge.w267.live-run-screenshot-reconciliation.trace.v1' &&
      trace.signoff.status === 'ready_to_keep',
    JSON.stringify(trace));

  printResults('W267 live run screenshot reconciliation harness', results);
}

main();
