#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const {
  assertCase,
  completedMotionResult,
  completedRefreshResponse,
  loadHooks,
  motionContext,
  motionState,
  printResults,
  root
} = require('./lib/forge_harness_fixtures');

function readRepoFile(...parts) {
  return fs.readFileSync(path.join(root, ...parts), 'utf8');
}

function main() {
  const results = [];
  const hooks = loadHooks({ fetchMessage: 'live fetch disabled in W464 harness' });
  const drawer = readRepoFile('idb-drawer.user.js');
  const fileCabinetDrawer = readRepoFile('src', 'FileCabinet', 'SuiteScripts', 'Intelligent Demo Builder', 'idb-drawer.user.js');

  const confirmedRequest = {
    schema: 'idb.confirmed-build-request.v1',
    requestId: 'idb-build-w464-drawer-sidecar-truth',
    buildAttemptId: 'attempt-w464-current',
    submittedAt: '2026-06-27T15:35:00.000Z',
    stateAuthority: { handoffParityStatus: 'matched', noStateMismatch: true },
    consultantConfirmation: { confirmed: true }
  };
  const expectedProvenance = {
    runnerTaskId: 'CSVIMPORT_W464',
    idempotencyToken: confirmedRequest.requestId,
    buildAttemptId: confirmedRequest.buildAttemptId,
    sourceRequestId: confirmedRequest.requestId,
    submittedAt: confirmedRequest.submittedAt
  };
  const latestRejectedFile = {
    fileId: '984101',
    fileName: 'idb_runner_sidecar_old_attempt_w463_completed.json',
    reason: 'buildAttemptId_mismatch'
  };
  const state = motionState(hooks, {
    integratedBuildRunnerResult: {
      schema: 'idb.approved-server-adapter-result-envelope.v1',
      status: 'polling_pending',
      queueSubmitted: true,
      runnerTaskId: expectedProvenance.runnerTaskId,
      idempotencyToken: expectedProvenance.idempotencyToken,
      sourceRequestId: expectedProvenance.sourceRequestId,
      buildAttemptId: expectedProvenance.buildAttemptId,
      submittedAt: expectedProvenance.submittedAt,
      confirmedBuildRequest: confirmedRequest,
      resultCapture: {
        status: 'polling_pending',
        lookupStatus: 'polling_pending',
        runnerTaskId: expectedProvenance.runnerTaskId,
        idempotencyToken: expectedProvenance.idempotencyToken,
        sourceRequestId: expectedProvenance.sourceRequestId,
        buildAttemptId: expectedProvenance.buildAttemptId,
        submittedAt: expectedProvenance.submittedAt,
        confirmedBuildRequest: confirmedRequest,
        staleRejected: true,
        terminalStatus: '',
        latestRejectedFile,
        expectedProvenance
      },
      finalGeneratedNamesJson: null,
      activeOpenLinks: 0
    }
  });
  const context = motionContext(hooks, state);

  const recovery = hooks.drawerSafePollExceptionResultW464(
    state,
    new Error('simulated client-side import normalization throw'),
    { actionId: 'check_runner_result' }
  );
  const recoveredRunner = recovery.statePatch.integratedBuildRunnerResult;
  const recoveredCapture = recoveredRunner.resultCapture || {};
  const recoveredTroubleshoot = hooks.w444TroubleshootExportPayload(Object.assign({}, state, recovery.statePatch));

  const completedResult = completedMotionResult({ prefix: '464', salesOrderName: 'SO-W464 Drawer Truth Import' });
  const freshResponse = completedRefreshResponse(expectedProvenance.runnerTaskId, completedResult);
  freshResponse.payload.idempotencyToken = expectedProvenance.idempotencyToken;
  freshResponse.payload.sourceRequestId = expectedProvenance.sourceRequestId;
  freshResponse.payload.buildAttemptId = expectedProvenance.buildAttemptId;
  freshResponse.payload.submittedAt = expectedProvenance.submittedAt;
  freshResponse.payload.resultCapture = Object.assign({}, freshResponse.payload.resultCapture, {
    runnerTaskId: expectedProvenance.runnerTaskId,
    idempotencyToken: expectedProvenance.idempotencyToken,
    sourceRequestId: expectedProvenance.sourceRequestId,
    buildAttemptId: expectedProvenance.buildAttemptId,
    submittedAt: expectedProvenance.submittedAt
  });
  const recoveredState = Object.assign({}, state, recovery.statePatch);
  const freshPoll = hooks.governedRunnerResultCapturePollingToCompletedJsonV1(
    recoveredState,
    context.lane,
    context.page,
    context.recommendation,
    {
      adapterResult: recoveredState.integratedBuildRunnerResult,
      adapterConfig: recoveredState.integratedBuildAdapterConfig || {},
      operatorEvidence: recoveredState.integratedBuildOperatorApproval || {},
      approvedEndpointMode: 'approved_server_adapter_only',
      executePoll: true,
      transport: () => freshResponse
    }
  );
  const freshState = Object.assign({}, recoveredState, freshPoll.statePatch || {});
  const freshTroubleshoot = hooks.w444TroubleshootExportPayload(freshState);
  const retryableTimeoutEnvelope = {
    schema: 'idb.approved-server-adapter-result-envelope.v1',
    status: 'result_capture_poll_request_timeout',
    queueSubmitted: true,
    runnerTaskId: expectedProvenance.runnerTaskId,
    resultCapture: {
      status: 'result_capture_poll_request_timeout',
      error: true,
      retryable: true,
      runnerTaskId: expectedProvenance.runnerTaskId
    },
    error: true,
    retryable: true,
    errorMessage: 'Approved adapter request timed out in the drawer.',
    finalGeneratedNamesJson: null,
    activeOpenLinks: 0
  };
  const retryableTimeoutNormalized = hooks.normalizeApprovedServerAdapterTransportResponseV1(
    retryableTimeoutEnvelope,
    { pollAttempted: true, runnerTaskId: expectedProvenance.runnerTaskId }
  );
  const retryableTimeoutTroubleshoot = hooks.w444TroubleshootExportPayload(motionState(hooks, {
    integratedBuildRunnerResult: retryableTimeoutEnvelope
  }));
  const completedWithEmbeddedError = Object.assign({}, freshResponse, {
    status: 'adapter_error',
    error: true,
    resultCapture: Object.assign({}, freshResponse.resultCapture || freshResponse.payload && freshResponse.payload.resultCapture || {}, {
      status: 'completed',
      error: true,
      runnerTaskId: expectedProvenance.runnerTaskId,
      finalGeneratedNamesJson: completedResult
    }),
    finalGeneratedNamesJson: completedResult
  });
  const completedWithEmbeddedErrorNormalized = hooks.normalizeApprovedServerAdapterTransportResponseV1(
    completedWithEmbeddedError,
    { pollAttempted: true, runnerTaskId: expectedProvenance.runnerTaskId }
  );
  const staleReturnedRecordState = motionState(hooks, {
    intake: {
      customer: 'Traeger W466 Real Naming Manufacturing WIP Off 20260627162719',
      website: 'https://www.traeger.com',
      notes: 'WIP intentionally off; reject prior-run sidecars.'
    }
  });
  const staleReturnedRecordContext = motionContext(hooks, staleReturnedRecordState);
  const staleReturnedRecords = completedMotionResult({ prefix: '466', salesOrderName: 'SO-W466 stale Traeger' });
  staleReturnedRecords.prospect = 'Traeger W466 Real Naming Manufacturing WIP Off 20260627162719';
  staleReturnedRecords.customerName = 'Traeger W466 Real Naming Manufacturing WIP Off 20260627162719';
  staleReturnedRecords.records[0].name = 'Traeger W466 Real Naming Manufacturing WIP Off 20260627162217 Customer Account';
  staleReturnedRecords.records[1].name = 'SO2773';
  staleReturnedRecords.records[2].name = 'Traeger Industrial Equipment Manufacturing Case';
  staleReturnedRecords.records[3].name = 'Traeger Industrial Equipment Manufacturing Assembly';
  const staleReturnedRecordImport = hooks.commitRunnerSidecarDisplayResultW431(
    staleReturnedRecordState,
    staleReturnedRecordContext.lane,
    staleReturnedRecordContext.page,
    staleReturnedRecordContext.recommendation,
    {
      status: 'completed_runner_result_ready',
      resultCapture: {
        sourceFileId: '64999',
        sourceFileName: 'idb_runner_sidecar_traeger_current_wrapper_old_records.json',
        lookupStatus: 'completed_result_capture_ready'
      },
      sidecarGeneratedNamesJson: staleReturnedRecords
    },
    { source: 'w464-current-wrapper-old-returned-records' }
  );
  const abbreviatedCurrentRunState = motionState(hooks, {
    intake: {
      customer: 'Baggu W472 Consultant Click Pink Stripe 379294',
      website: 'https://www.baggu.com/products/medium-nylon-crescent-bag-pink-stripe',
      notes: 'Pink Stripe demand spikes; use the full website product, not a color-only item.'
    }
  });
  const abbreviatedCurrentRunContext = motionContext(hooks, abbreviatedCurrentRunState);
  const abbreviatedCurrentRunResult = completedMotionResult({ prefix: '472', salesOrderName: 'SO379294' });
  abbreviatedCurrentRunResult.prospect = 'Baggu W472 Consultant Click Pink Stripe 379294';
  abbreviatedCurrentRunResult.customerName = 'Baggu W472 Consultant Click Pink Stripe 379294';
  abbreviatedCurrentRunResult.currentRunIdentityChecksW457 = {
    expectedProspect: 'Baggu W472 Consultant Click Pink Stripe 379294',
    customer: {
      expectedProspect: 'Baggu W472 Consultant Click Pink Stripe 379294',
      expectedName: 'Baggu W472 Consultant Click Pink Stripe 379294 Customer Account',
      actualName: 'Baggu W472 Consultant Click Pink Stripe 379294 Customer Account'
    }
  };
  abbreviatedCurrentRunResult.records[0].name = 'Baggu Customer Account';
  abbreviatedCurrentRunResult.records[1].name = 'SO379294';
  abbreviatedCurrentRunResult.records[2].name = 'SCAI - Medium Nylon Crescent Bag Pink Stripe';
  abbreviatedCurrentRunResult.records[3].name = 'Medium Nylon Crescent Bag Pink Stripe Availability SKU';
  const abbreviatedCurrentRunImport = hooks.commitRunnerSidecarDisplayResultW431(
    abbreviatedCurrentRunState,
    abbreviatedCurrentRunContext.lane,
    abbreviatedCurrentRunContext.page,
    abbreviatedCurrentRunContext.recommendation,
    {
      status: 'completed_runner_result_ready',
      resultCapture: {
        sourceFileId: '65798',
        sourceFileName: 'idb_result_completed_IDB-idb-build-baggu-w472-consultant-_62320e88.json',
        lookupStatus: 'completed_result_capture_ready'
      },
      sidecarGeneratedNamesJson: abbreviatedCurrentRunResult
    },
    { source: 'w472-current-identity-abbreviated-returned-records' }
  );

  assertCase(results, 'w464-root-and-filecabinet-drawer-synced',
    drawer === fileCabinetDrawer,
    'Root userscript and FileCabinet userscript should match.');

  assertCase(results, 'w464-build-return-handler-recovers-from-client-throw',
    drawer.includes('drawerSafePollExceptionResultW464(state, err, { actionId })') &&
      drawer.includes("trace('w464_drawer_poll_exception_recovered'") &&
      drawer.includes('button.disabled = false') &&
      drawer.includes("button.textContent = originalButtonText || 'Refresh build status'"),
    'Check runner result click handler should redraw instead of leaving the live DOM button Checking.');

  assertCase(results, 'w464-poll-exception-is-nonterminal-and-retryable',
    recovery.status === 'drawer_poll_exception_waiting_for_retry' &&
      recoveredRunner.status === 'polling_pending' &&
      recoveredCapture.status === 'polling_pending' &&
      recoveredCapture.lookupStatus === 'drawer_poll_exception_waiting_for_retry' &&
      recoveredCapture.drawerPollException === true &&
      recoveredTroubleshoot.runnerErrorTruthW451.terminal === false,
    JSON.stringify({ recoveryStatus: recovery.status, capture: recoveredCapture, runnerError: recoveredTroubleshoot.runnerErrorTruthW451 }));

  assertCase(results, 'w464-stale-rejection-fields-preserved-before-success',
    recovery.preservedStaleResultRejection.staleRejected === true &&
      recovery.preservedStaleResultRejection.terminalStatus === '' &&
      recovery.preservedStaleResultRejection.terminalStaleFailure === false &&
      recovery.preservedStaleResultRejection.terminalNotFoundFailure === false &&
      recoveredTroubleshoot.nonterminalStaleRejected === true &&
      recoveredTroubleshoot.terminalStaleFailure === false &&
      recoveredTroubleshoot.terminalNotFoundFailure === false &&
      recoveredTroubleshoot.latestRejectedFile === latestRejectedFile &&
      recoveredTroubleshoot.expectedProvenance === expectedProvenance,
    JSON.stringify(recoveredTroubleshoot.resultCaptureSourceW462));

  assertCase(results, 'w464-later-success-import-readiness-not-blocked-by-prior-stale-rejection',
    freshPoll.status === 'w190_completed_result_ready_for_w151_import' &&
      freshPoll.resultImportGuard.importReady === true &&
      freshTroubleshoot.nonterminalStaleRejected === true &&
      freshTroubleshoot.terminalStaleFailure === false &&
      freshTroubleshoot.terminalNotFoundFailure === false &&
      freshTroubleshoot.latestRejectedFile === latestRejectedFile &&
      freshTroubleshoot.expectedProvenance === expectedProvenance,
    JSON.stringify({ pollStatus: freshPoll.status, guard: freshPoll.resultImportGuard, capture: freshTroubleshoot.resultCaptureSourceW462 }));

  assertCase(results, 'w472-retryable-poll-timeout-keeps-refresh-path-not-forge-error',
    retryableTimeoutNormalized.status === 'polling_pending' &&
      retryableTimeoutNormalized.runnerTaskId === expectedProvenance.runnerTaskId &&
      retryableTimeoutTroubleshoot.runnerErrorTruthW451.terminal === false,
    JSON.stringify({ normalized: retryableTimeoutNormalized, runnerError: retryableTimeoutTroubleshoot.runnerErrorTruthW451 }, null, 2));

  assertCase(results, 'w472-completed-result-wins-over-embedded-adapter-error-flag',
    completedWithEmbeddedErrorNormalized.status === 'completed_result_awaiting_w151_import' &&
      completedWithEmbeddedErrorNormalized.finalGeneratedNamesJsonReady === true &&
      completedWithEmbeddedErrorNormalized.finalGeneratedNamesJson,
    JSON.stringify(completedWithEmbeddedErrorNormalized, null, 2));

  assertCase(results, 'w464-current-wrapper-stale-returned-records-rejected',
    staleReturnedRecordImport.imported === false &&
      staleReturnedRecordImport.status === 'sidecar_current_run_provenance_mismatch_rejected' &&
      staleReturnedRecordImport.currentRunProvenanceW466 &&
      staleReturnedRecordImport.currentRunProvenanceW466.reason === 'returned_records_contain_prior_run_timestamp' &&
      /20260627162217/.test(staleReturnedRecordImport.currentRunProvenanceW466.returnedNames.join(' ')),
    JSON.stringify(staleReturnedRecordImport.currentRunProvenanceW466));

  assertCase(results, 'w472-current-identity-allows-abbreviated-returned-record-names',
    abbreviatedCurrentRunImport.imported === true &&
      abbreviatedCurrentRunImport.status === 'sidecar_records_imported_for_display' &&
      abbreviatedCurrentRunImport.statePatch &&
      abbreviatedCurrentRunImport.statePatch.dccFinalNamingResult &&
      abbreviatedCurrentRunImport.statePatch.dccFinalNamingResult.finalNamesImported === true &&
      abbreviatedCurrentRunImport.statePatch.dccFinalNamingResult.displayReadyRecords.some((record) => /Medium Nylon Crescent Bag Pink Stripe/i.test(record.recordName || record.name || '')),
    JSON.stringify({
      status: abbreviatedCurrentRunImport.status,
      provenance: abbreviatedCurrentRunImport.currentRunProvenanceW466,
      records: abbreviatedCurrentRunImport.statePatch && abbreviatedCurrentRunImport.statePatch.dccFinalNamingResult && abbreviatedCurrentRunImport.statePatch.dccFinalNamingResult.displayReadyRecords
    }, null, 2));

  printResults('w464_drawer_sidecar_truth_poll_recovery_harness', results);
}

main();
