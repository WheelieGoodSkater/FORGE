#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const liveEvidence = require('../../src/contracts/liveEvidencePackets');
const adapterProfiles = require('../../src/contracts/adapterProfiles');
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

function buildW266Packet(hooks) {
  const state = motionState(hooks);
  const context = motionContext(hooks, state);
  return hooks.controlledLiveBuildRunEvidencePacketW266(state, context.lane, context.page, context.recommendation, {
    submittedAt: '2026-05-25T14:00:00.000Z',
    submitResponse: {
      statusCode: 200,
      ok: true,
      payload: {
        status: 'queued',
        queueSubmitted: true,
        task: { id: 'runner-w272-motion-001' },
        idempotencyToken: 'motion-w272-token',
        resultCapture: { status: 'pending_runner_completion' }
      }
    },
    pendingRefreshResponse: {
      data: {
        status: 'pending',
        queued: true,
        runner_task_id: 'runner-w272-motion-001',
        resultCapture: { status: 'pending_runner_completion' }
      }
    },
    completedRefreshResponse: {
      ok: true,
      payload: {
        status: 'done',
        queueSubmitted: true,
        runner_task_id: 'runner-w272-motion-001',
        resultCapture: {
          status: 'completed_result_capture_ready',
          finalGeneratedNamesJson: completedMotionResult({ prefix: '272' })
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
  const hooks = loadHooks({ fetchMessage: 'live fetch disabled in W272 harness' });
  const source = readRepoFile('src', 'contracts', 'liveEvidencePackets.js');
  const userscript = read(userscriptPath);
  const report = readArchiveText('reports', 'w272_live_evidence_signoff_contract.md');
  const trace = readArchiveJson('trace_samples', 'w272_live_evidence_signoff_contract_trace.json');
  const w260Packet = hooks.installReadyReleasePacketW260();
  const w261Template = hooks.postInstallSmokeEvidenceCaptureTemplateW261();
  const w266Packet = buildW266Packet(hooks);
  const readyW267 = hooks.postLiveRunScreenshotEvidencePacketW267(w266Packet, {
    reviewerEvidence: reviewerEvidenceFor(w266Packet)
  });
  const readyW268 = hooks.releaseKeepPacketV100W268(w266Packet, readyW267);
  const w268Template = hooks.installedDrawerLiveEvidenceIntakeTemplateW268();
  const contractSummary = liveEvidence.exportedContractSummary();
  const readySignoff = liveEvidence.releaseSignoffFromEvidence(allPassCapture(w261Template.fields), w261Template.fields);
  const needsCapture = allPassCapture(w261Template.fields);
  delete needsCapture.live_proof_cta_visible;
  const needsSignoff = liveEvidence.releaseSignoffFromEvidence(needsCapture, w261Template.fields);
  const rollbackCapture = allPassCapture(w261Template.fields);
  rollbackCapture.install_target_drawer_only = { pass: false, note: 'wrong install target' };
  const rollbackSignoff = liveEvidence.releaseSignoffFromEvidence(rollbackCapture, w261Template.fields);
  const moduleLiveDecisionReady = liveEvidence.liveRunDecision(w266Packet);
  const moduleLiveDecisionNeeds = liveEvidence.liveRunDecision(Object.assign({}, w266Packet, {
    importEvidence: Object.assign({}, w266Packet.importEvidence, { imported: false, returnedRecords: [] })
  }));
  const moduleLiveDecisionRollback = liveEvidence.liveRunDecision(Object.assign({}, w266Packet, {
    guardrails: Object.assign({}, w266Packet.guardrails, { noDrawerTransactionWrites: false })
  }));
  const moduleOpenLinks = liveEvidence.openLinkVerificationCapture(
    w266Packet.importEvidence.returnedRecords,
    reviewerEvidenceFor(w266Packet).openLinks
  );
  const moduleScreenshotReady = liveEvidence.screenshotSignoff(readyW267);
  const moduleScreenshotRollback = liveEvidence.screenshotSignoff(hooks.postLiveRunScreenshotEvidencePacketW267(w266Packet, {
    reviewerEvidence: reviewerEvidenceFor(w266Packet, { fakeOpenLinksVisible: true })
  }));
  const state = motionState(hooks);
  const context = motionContext(hooks, state);
  const w264Flow = hooks.connectedBuildSubmitRefreshImportW264(state, context.lane, context.page, context.recommendation, {
    executeSubmit: true,
    executePoll: true,
    finishBuild: true,
    submitResponse: {
      status: 'queued_result_capture_pending',
      queueSubmitted: true,
      runnerTaskId: 'runner-w272-motion-001',
      idempotencyToken: 'motion-w272-token',
      resultCapture: { status: 'pending_runner_completion', runnerTaskId: 'runner-w272-motion-001' }
    },
    pollResponse: {
      status: 'completed_runner_result_ready',
      queueSubmitted: true,
      runnerTaskId: 'runner-w272-motion-001',
      resultCapture: {
        status: 'completed_result_capture_ready',
        runnerTaskId: 'runner-w272-motion-001',
        finalGeneratedNamesJson: completedMotionResult({ prefix: '272' })
      }
    }
  });

  assertCase(results, 'live-evidence-signoff-contract-module-exists',
    /LIVE_EVIDENCE_SCHEMA_VERSION/.test(source) &&
      /CONTRACT_SHAPES/.test(source) &&
      typeof liveEvidence.packetMatchesContractShape === 'function' &&
      typeof liveEvidence.liveRunDecision === 'function',
    'src/contracts/liveEvidencePackets.js');

  assertCase(results, 'w260-w261-w266-w267-w268-contract-shapes-represented',
    liveEvidence.packetMatchesContractShape(w260Packet, liveEvidence.contractShape('W260_INSTALL_READY_RELEASE_PACKET')) &&
      liveEvidence.packetMatchesContractShape(w261Template, liveEvidence.contractShape('W261_POST_INSTALL_SMOKE_CAPTURE')) &&
      liveEvidence.packetMatchesContractShape(w266Packet, liveEvidence.contractShape('W266_CONTROLLED_LIVE_BUILD_RUN')) &&
      liveEvidence.packetMatchesContractShape(readyW267, liveEvidence.contractShape('W267_SCREENSHOT_RECONCILIATION')) &&
      liveEvidence.packetMatchesContractShape(w268Template, liveEvidence.contractShape('W268_INSTALLED_DRAWER_INTAKE')) &&
      liveEvidence.packetMatchesContractShape(readyW268, liveEvidence.contractShape('W268_RELEASE_KEEP_PACKET')),
    JSON.stringify(contractSummary.contractShapes));

  assertCase(results, 'decision-helper-returns-ready-attention-and-rollback',
    readySignoff.status === 'ready_to_keep' &&
      needsSignoff.status === 'needs_attention' &&
      rollbackSignoff.status === 'rollback_recommended' &&
      moduleLiveDecisionReady.status === 'ready_to_keep' &&
      moduleLiveDecisionNeeds.status === 'needs_attention' &&
      moduleLiveDecisionRollback.status === 'rollback_recommended' &&
      moduleScreenshotReady.status === 'ready_to_keep' &&
      moduleScreenshotRollback.status === 'rollback_recommended',
    JSON.stringify({
      release: [readySignoff.status, needsSignoff.status, rollbackSignoff.status],
      live: [moduleLiveDecisionReady.status, moduleLiveDecisionNeeds.status, moduleLiveDecisionRollback.status],
      screenshot: [moduleScreenshotReady.status, moduleScreenshotRollback.status]
    }));

  assertCase(results, 'review-only-policy-forbids-external-actions',
    liveEvidence.isReviewOnlyPolicySafe(liveEvidence.reviewOnlyPolicy()) === true &&
      liveEvidence.reviewOnlyPolicyViolations({
        externalUploadAllowed: true,
        networkCallAllowed: true,
        trackingAllowed: true,
        localStorageWriteAllowed: true,
        installActionAllowed: true,
        runtimeDependencyAdded: true
      }).length === 6 &&
      readyW268.reviewOnlyPolicy.externalUploadAllowed === false &&
      readyW268.reviewOnlyPolicy.networkCallAllowed === false &&
      readyW268.reviewOnlyPolicy.trackingAllowed === false &&
      readyW268.reviewOnlyPolicy.localStorageWriteAllowed === false &&
      readyW268.reviewOnlyPolicy.installActionAllowed === false &&
      readyW268.reviewOnlyPolicy.runtimeDependencyAdded === false,
    JSON.stringify({ violations: liveEvidence.reviewOnlyPolicyViolations({ networkCallAllowed: true }), policy: readyW268.reviewOnlyPolicy }));

  assertCase(results, 'drawer-w266-w267-w268-outputs-remain-field-compatible',
    w266Packet.schema === liveEvidence.contractShape('W266_CONTROLLED_LIVE_BUILD_RUN').schema &&
      readyW267.schema === liveEvidence.contractShape('W267_SCREENSHOT_RECONCILIATION').schema &&
      readyW268.schema === liveEvidence.contractShape('W268_RELEASE_KEEP_PACKET').schema &&
      moduleOpenLinks.rows.length === readyW267.openLinkVerification.rows.length &&
      moduleOpenLinks.allExpectedRecordsCaptured === readyW267.openLinkVerification.allExpectedRecordsCaptured &&
      moduleLiveDecisionReady.status === w266Packet.liveRunDecision.status &&
      moduleScreenshotReady.status === readyW267.signoff.status,
    JSON.stringify({ w266: w266Packet.schema, w267: readyW267.schema, w268: readyW268.schema }));

  assertCase(results, 'raw-evidence-remains-archived-admin-only-and-hidden-from-normal-ui',
    w266Packet.rawEvidencePolicy.archiveOnly === true &&
      w266Packet.rawEvidencePolicy.adminDebugOnly === true &&
      w266Packet.rawEvidencePolicy.hiddenFromNormalConsultantUi === true &&
      readyW267.reviewOnlyPolicy.archiveOnly === true &&
      readyW267.comparison.rawDiagnosticsHidden === true &&
      readyW268.guardrails.normalConsultantUiHidesRawDiagnostics === true,
    JSON.stringify({ w266: w266Packet.rawEvidencePolicy, w267: readyW267.reviewOnlyPolicy, w268: readyW268.guardrails }));

  assertCase(results, 'w271-adapter-profile-contract-remains-available',
    adapterProfiles.releasedAdapterProfile().deploymentScriptId === 'customdeployidb_governed_runner_adapter' &&
      adapterProfiles.adapterProfileEndpoint(adapterProfiles.releasedAdapterProfile()) === 'https://td3021666.app.netsuite.com/app/site/hosting/scriptlet.nl?script=6702&deploy=2' &&
      readRepoFile('src', 'contracts', 'adapterProfiles.js').includes('ADAPTER_PROFILE_SCHEMA_VERSION'),
    adapterProfiles.adapterProfileEndpoint(adapterProfiles.releasedAdapterProfile()));

  assertCase(results, 'w264-connected-build-imports-only-w151-valid-completed-results',
    w264Flow.status === 'records_imported' &&
      w264Flow.completedResultGuard.completedResultAcceptedByW151 === true &&
      w264Flow.importedRecords.length > 0 &&
      w264Flow.guardrails.fakeOpenLinksBlockedBeforeImport === true,
    JSON.stringify({ status: w264Flow.status, guard: w264Flow.completedResultGuard }));

  assertCase(results, 'w270-shared-harness-utilities-remain-available',
    fs.existsSync(path.join(root, 'archive', 'tools', 'lib', 'forge_harness_fixtures.js')) &&
      readRepoFile('archive', 'tools', 'run_w272_live_evidence_signoff_contract_harness.js').includes("require('./lib/forge_harness_fixtures')"),
    'archive/tools/lib/forge_harness_fixtures.js');

  assertCase(results, 'no-runtime-file-behavior-changes-introduced',
    !/require\(['\"][^'\"]*liveEvidencePackets/.test(userscript) &&
      /runtime behavior unchanged/i.test(report) &&
      trace.guardrails.runtimeBehaviorChanged === false &&
      trace.guardrails.normalConsultantUiChanged === false,
    JSON.stringify(trace.guardrails));

  assertCase(results, 'no-drawer-created-records-or-transaction-writes-introduced',
    w266Packet.guardrails.noDrawerCreatedRecords === true &&
      w266Packet.guardrails.noDrawerTransactionWrites === true &&
      readyW267.guardrails.noDrawerCreatedRecords === true &&
      readyW267.guardrails.noDrawerTransactionWrites === true &&
      readyW268.guardrails.noDrawerCreatedRecords === true &&
      readyW268.guardrails.noDrawerTransactionWrites === true,
    JSON.stringify({ w266: w266Packet.guardrails, w267: readyW267.guardrails, w268: readyW268.guardrails }));

  assertCase(results, 'report-and-trace-archived',
    /W272 Live Evidence And Signoff Packet Contract/.test(report) &&
      trace.schema === 'forge.w272.live-evidence-signoff-contract.trace.v1' &&
      trace.contractSummary.schema === 'forge.w272.live-evidence-packets.v1',
    JSON.stringify(trace));

  printResults('W272 live evidence signoff contract harness', results);
}

main();
