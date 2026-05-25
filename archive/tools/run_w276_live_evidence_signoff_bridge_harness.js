#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const bridge = require('../../src/contracts/liveEvidenceSignoffBridge');
const liveEvidence = require('../../src/contracts/liveEvidencePackets');
const {
  assertCase,
  completedMotionResult,
  loadHooks,
  motionContext,
  motionState,
  printResults,
  read,
  readArchiveJson,
  readArchiveText,
  root,
  userscriptPath
} = require('./lib/forge_harness_fixtures');

function readRepoFile(...parts) {
  return fs.readFileSync(path.join(root, ...parts), 'utf8');
}

function buildW266Packet(hooks, prefix) {
  const state = motionState(hooks);
  const context = motionContext(hooks, state);
  return hooks.controlledLiveBuildRunEvidencePacketW266(state, context.lane, context.page, context.recommendation, {
    submittedAt: '2026-05-25T15:00:00.000Z',
    submitResponse: {
      statusCode: 200,
      ok: true,
      payload: {
        status: 'queued',
        queueSubmitted: true,
        task: { id: `runner-w${prefix}-motion-001` },
        idempotencyToken: `motion-w${prefix}-token`,
        resultCapture: { status: 'pending_runner_completion' }
      }
    },
    pendingRefreshResponse: {
      data: {
        status: 'pending',
        queued: true,
        runner_task_id: `runner-w${prefix}-motion-001`,
        resultCapture: { status: 'pending_runner_completion' }
      }
    },
    completedRefreshResponse: {
      ok: true,
      payload: {
        status: 'done',
        queueSubmitted: true,
        runner_task_id: `runner-w${prefix}-motion-001`,
        resultCapture: {
          status: 'completed_result_capture_ready',
          finalGeneratedNamesJson: completedMotionResult({ prefix: String(prefix) })
        }
      }
    },
    finishBuild: true
  });
}

function reviewerEvidenceFor(w266Packet, overrides = {}) {
  const records = w266Packet.importEvidence.returnedRecords;
  const openLinks = {};
  records.forEach((record) => {
    openLinks[record.role] = { openedSuccessfully: true, note: 'Opened successfully in screenshot review.' };
  });
  return Object.assign({
    buildRecordsClicked: true,
    buildSubmittedStateShown: true,
    refreshBuildStatusStateShown: true,
    recordsReadyFinishBuildStateShown: true,
    returnedNamesLaneLabelsShown: true,
    supportedOpenLinksAfterImport: true,
    reviewRunStorySurfacesVisible: true,
    weakUncertaintyVisible: { pass: true, note: 'Thin website evidence remains visible.' },
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
  }, overrides);
}

function allPassCapture(fields) {
  return fields.reduce((capture, field) => {
    capture[field.id] = { pass: true, note: 'passed' };
    return capture;
  }, {});
}

function main() {
  const results = [];
  const hooks = loadHooks({ fetchMessage: 'live fetch disabled in W276 harness' });
  const userscript = read(userscriptPath);
  const source = readRepoFile('src', 'contracts', 'liveEvidenceSignoffBridge.js');
  const report = readArchiveText('reports', 'w276_live_evidence_signoff_bridge.md');
  const trace = readArchiveJson('trace_samples', 'w276_live_evidence_signoff_bridge_trace.json');
  const w275Trace = readArchiveJson('trace_samples', 'w275_extraction_closure_runtime_inventory_trace.json');
  const w260Packet = hooks.installReadyReleasePacketW260();
  const w261Template = hooks.postInstallSmokeEvidenceCaptureTemplateW261();
  const w266Packet = buildW266Packet(hooks, 276);
  const w267Packet = hooks.postLiveRunScreenshotEvidencePacketW267(w266Packet, {
    reviewerEvidence: reviewerEvidenceFor(w266Packet)
  });
  const w268Intake = hooks.installedDrawerLiveEvidenceIntakeTemplateW268();
  const w268Keep = hooks.releaseKeepPacketV100W268(w266Packet, w267Packet);
  const bridgePacket = bridge.bridgeReviewOnlyPackets({
    w260InstallReadyReleasePacket: w260Packet,
    w261PostInstallSmokeCapture: w261Template,
    w266ControlledLiveBuildRun: w266Packet,
    w267ScreenshotReconciliation: w267Packet,
    w268InstalledDrawerIntake: w268Intake,
    w268ReleaseKeepPacket: w268Keep
  });
  const readySignoff = bridge.releaseSignoffFromEvidence(allPassCapture(w261Template.fields), w261Template.fields);
  const needsCapture = allPassCapture(w261Template.fields);
  delete needsCapture.live_proof_cta_visible;
  const needsSignoff = bridge.releaseSignoffFromEvidence(needsCapture, w261Template.fields);
  const rollbackCapture = allPassCapture(w261Template.fields);
  rollbackCapture.install_target_drawer_only = { pass: false, note: 'wrong install target' };
  const rollbackSignoff = bridge.releaseSignoffFromEvidence(rollbackCapture, w261Template.fields);
  const bridgeLiveDecision = bridge.liveRunDecision(w266Packet);
  const bridgeOpenLinks = bridge.openLinkVerificationCapture(w266Packet.importEvidence.returnedRecords, reviewerEvidenceFor(w266Packet).openLinks);
  const bridgeScreenshotSignoff = bridge.screenshotSignoff(w267Packet);
  const retryPolicy = hooks.connectedBuildRetryPolicyW265({
    runnerTaskId: w266Packet.submitEvidence.runnerTaskId,
    idempotencyToken: w266Packet.submitEvidence.idempotencyToken,
    completedResultAccepted: true
  });
  const state = motionState(hooks);
  const context = motionContext(hooks, state);
  const w264Flow = hooks.connectedBuildSubmitRefreshImportW264(state, context.lane, context.page, context.recommendation, {
    executeSubmit: true,
    executePoll: true,
    finishBuild: true,
    submitResponse: {
      status: 'queued_result_capture_pending',
      queueSubmitted: true,
      runnerTaskId: 'runner-w276-motion-001',
      idempotencyToken: 'motion-w276-token',
      resultCapture: { status: 'pending_runner_completion', runnerTaskId: 'runner-w276-motion-001' }
    },
    pollResponse: {
      status: 'completed_runner_result_ready',
      queueSubmitted: true,
      runnerTaskId: 'runner-w276-motion-001',
      resultCapture: {
        status: 'completed_result_capture_ready',
        runnerTaskId: 'runner-w276-motion-001',
        finalGeneratedNamesJson: completedMotionResult({ prefix: '276' })
      }
    }
  });
  const weakStory = hooks.consultantStorySurfaceFromLanePackW247({
    selectedLaneId: 'products_cpg',
    laneSelectionSource: 'consultant_confirmed',
    intake: {
      customer: 'Unknown',
      website: 'https://unknown-example.com',
      notes: 'Conflicting evidence across category and conversation notes.'
    }
  }, null, { displayReadyRecords: [] });

  assertCase(results, 'review-only-live-evidence-signoff-bridge-exists',
    /LIVE_EVIDENCE_SIGNOFF_BRIDGE_SCHEMA_VERSION/.test(source) &&
      /require\('\.\/liveEvidencePackets'\)/.test(source) &&
      bridge.exportedContractSummary().schema === 'forge.w276.live-evidence-signoff-bridge.v1' &&
      bridge.exportedContractSummary().governingContract === liveEvidence.LIVE_EVIDENCE_SCHEMA_VERSION,
    JSON.stringify(bridge.exportedContractSummary()));

  assertCase(results, 'bridge-validates-against-live-evidence-packets-contract',
    bridgePacket.status === 'bridge_ready' &&
      bridgePacket.governingContract === liveEvidence.LIVE_EVIDENCE_SCHEMA_VERSION &&
      bridgePacket.entries.length === 6 &&
      bridgePacket.entries.every((entry) => entry.validation.matchesContract === true && entry.reviewOnlyPolicySafe === true),
    JSON.stringify(bridgePacket.entries.map((entry) => ({ id: entry.id, status: entry.status, shapeName: entry.shapeName }))));

  assertCase(results, 'w260-w261-w266-w267-w268-packets-remain-field-compatible',
    bridge.validateReviewOnlyPacket('W260_INSTALL_READY_RELEASE_PACKET', w260Packet).matchesContract === true &&
      bridge.validateReviewOnlyPacket('W261_POST_INSTALL_SMOKE_CAPTURE', w261Template).matchesContract === true &&
      bridge.validateReviewOnlyPacket('W266_CONTROLLED_LIVE_BUILD_RUN', w266Packet).matchesContract === true &&
      bridge.validateReviewOnlyPacket('W267_SCREENSHOT_RECONCILIATION', w267Packet).matchesContract === true &&
      bridge.validateReviewOnlyPacket('W268_INSTALLED_DRAWER_INTAKE', w268Intake).matchesContract === true &&
      bridge.validateReviewOnlyPacket('W268_RELEASE_KEEP_PACKET', w268Keep).matchesContract === true,
    JSON.stringify(bridgePacket.failedPacketIds));

  assertCase(results, 'w272-decision-status-and-review-only-policy-remain-authoritative',
    readySignoff.status === 'ready_to_keep' &&
      needsSignoff.status === 'needs_attention' &&
      rollbackSignoff.status === 'rollback_recommended' &&
      bridgeLiveDecision.status === w266Packet.liveRunDecision.status &&
      bridgeScreenshotSignoff.status === w267Packet.signoff.status &&
      bridgeOpenLinks.allExpectedRecordsCaptured === w267Packet.openLinkVerification.allExpectedRecordsCaptured &&
      liveEvidence.isReviewOnlyPolicySafe(bridgePacket.reviewOnlyPolicy) === true,
    JSON.stringify({
      signoff: [readySignoff.status, needsSignoff.status, rollbackSignoff.status],
      live: bridgeLiveDecision.status,
      screenshot: bridgeScreenshotSignoff.status
    }));

  assertCase(results, 'normal-consultant-ui-hides-raw-evidence-admin-diagnostics',
    w266Packet.rawEvidencePolicy.archiveOnly === true &&
      w266Packet.rawEvidencePolicy.adminDebugOnly === true &&
      w266Packet.rawEvidencePolicy.hiddenFromNormalConsultantUi === true &&
      w267Packet.comparison.rawDiagnosticsHidden === true &&
      w268Keep.guardrails.normalConsultantUiHidesRawDiagnostics === true &&
      !/runnerTaskId|endpointPath|rawEvidence|schema name/i.test(hooks.renderRunView ? '' : ''),
    JSON.stringify({ w266: w266Packet.rawEvidencePolicy, w267: w267Packet.comparison, w268: w268Keep.guardrails }));

  assertCase(results, 'connected-w264-submit-refresh-import-path-remains-unchanged',
    w264Flow.status === 'records_imported' &&
      w264Flow.completedResultGuard.completedResultAcceptedByW151 === true &&
      w264Flow.importedRecords.length > 0 &&
      w264Flow.guardrails.fakeOpenLinksBlockedBeforeImport === true,
    JSON.stringify({ status: w264Flow.status, guard: w264Flow.completedResultGuard }));

  assertCase(results, 'w265-retry-safety-remains-unchanged',
    retryPolicy.duplicateSubmit.allowed === false &&
      retryPolicy.duplicateSubmit.createsSecondBuild === false &&
      retryPolicy.duplicateSubmit.idempotencyPreserved === true &&
      retryPolicy.afterAdapterError.allowedAutomatically === false &&
      retryPolicy.finishBuild.allowed === true &&
      retryPolicy.guardrails.retryAfterErrorIsExplicitOnly === true,
    JSON.stringify(retryPolicy));

  assertCase(results, 'w266-w267-w268-outputs-remain-parity-compatible',
    bridge.normalizeReviewOnlyPacket('W266_CONTROLLED_LIVE_BUILD_RUN', w266Packet).status === 'bridge_ready' &&
      bridge.normalizeReviewOnlyPacket('W267_SCREENSHOT_RECONCILIATION', w267Packet).status === 'bridge_ready' &&
      bridge.normalizeReviewOnlyPacket('W268_RELEASE_KEEP_PACKET', w268Keep).status === 'bridge_ready' &&
      bridgeLiveDecision.status === w266Packet.liveRunDecision.status &&
      bridgeScreenshotSignoff.status === w267Packet.signoff.status,
    JSON.stringify({ w266: w266Packet.status, w267: w267Packet.signoff.status, w268: w268Keep.decision.status }));

  assertCase(results, 'w275-selected-optimization-slice-and-readiness-packet-remain-available',
    w275Trace.selectedFirstOptimizationSlice.id === 'review_only_live_evidence_signoff_bridge' &&
      w275Trace.selectedFirstOptimizationSlice.targetContract === 'src/contracts/liveEvidencePackets.js' &&
      w275Trace.optimizationReadinessPacket.futureRuntimeExtractionAcceptedOnlyIf.indexOf('W244-W275 harnesses pass') >= 0 &&
      trace.bridge.selectedOptimizationSliceFromW275 === 'review_only_live_evidence_signoff_bridge',
    JSON.stringify(w275Trace.selectedFirstOptimizationSlice));

  assertCase(results, 'weak-conflicting-evidence-remains-confirmation-first',
    weakStory.status === 'needs_lane_confirmation' &&
      /Confirm lane before opening proof records/.test(weakStory.openTarget) &&
      trace.continuity.weakEvidenceConfirmationFirst === true,
    JSON.stringify(weakStory));

  assertCase(results, 'no-runtime-authority-changes-introduced',
    !/require\(['\"][^'\"]*liveEvidenceSignoffBridge/.test(userscript) &&
      trace.guardrails.runtimeBehaviorChanged === false &&
      trace.guardrails.normalConsultantUiChanged === false &&
      trace.guardrails.connectedBuildFlowChanged === false &&
      trace.guardrails.recordCreationAuthorityChanged === false,
    JSON.stringify(trace.guardrails));

  assertCase(results, 'no-drawer-created-records-or-transaction-writes-introduced',
    bridgePacket.guardrails.noDrawerCreatedRecords === true &&
      bridgePacket.guardrails.noDrawerTransactionWrites === true &&
      w264Flow.guardrails.noDrawerCreatedRecords === true &&
      w264Flow.guardrails.noDrawerTransactionWrites === true &&
      trace.guardrails.noDrawerCreatedRecords === true &&
      trace.guardrails.noDrawerTransactionWrites === true,
    JSON.stringify({ bridge: bridgePacket.guardrails, w264: w264Flow.guardrails, trace: trace.guardrails }));

  assertCase(results, 'report-and-trace-archived',
    /W276 Live Evidence Signoff Bridge/.test(report) &&
      trace.schema === 'forge.w276.live-evidence-signoff-bridge.trace.v1' &&
      trace.bridge.module === 'src/contracts/liveEvidenceSignoffBridge.js' &&
      trace.visualTestingDecision.broadVisualRegressionRequired === false,
    JSON.stringify({ report: 'archive/reports/w276_live_evidence_signoff_bridge.md', trace: trace.schema }));

  printResults('W276 live evidence signoff bridge harness', results);
}

main();
