#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const {
  assertCase,
  completedMotionResult,
  loadHooks,
  motionContext,
  motionState,
  printResults
} = require('./lib/forge_harness_fixtures');

const root = path.resolve(__dirname, '..', '..');
const drawerPath = path.join(root, 'idb-drawer.user.js');
const fileCabinetDrawerPath = path.join(root, 'src', 'FileCabinet', 'SuiteScripts', 'Intelligent Demo Builder', 'idb-drawer.user.js');
const reportPath = path.join(root, 'archive', 'reports', 'w427_refresh_completed_result_auto_import.md');

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function main() {
  const results = [];
  const hooks = loadHooks();
  const drawer = read(drawerPath);
  const fileCabinetDrawer = read(fileCabinetDrawerPath);

  const state = motionState(hooks);
  const context = motionContext(hooks, state);
  const completedResult = completedMotionResult({ prefix: '427' });
  const originalConfirmedRequest = {
    schema: 'idb.confirmed-build-request.v1',
    requestId: 'idb-build-motion-industries-distribution',
    buildAttemptId: 'attempt-idb-build-motion-industries-distribution-427',
    submittedAt: '2026-06-23T20:14:00.000Z',
    requestStatus: 'confirmed_ready_for_governed_runner',
    consultantConfirmation: { confirmed: true },
    stateAuthority: { handoffParityStatus: 'matched', noStateMismatch: true }
  };

  const completedPoll = {
    schema: 'idb.w190-governed-runner-result-capture-polling-to-completed-json.v1',
    status: 'w190_completed_result_ready_for_w151_import',
    requestReady: true,
    requestSent: true,
    pollRequestEnvelope: {
      runnerTaskId: 'CSVIMPORT_W427',
      idempotencyToken: originalConfirmedRequest.requestId,
      buildAttemptId: originalConfirmedRequest.buildAttemptId
    },
    normalizedResponse: {
      status: 'completed_runner_result_ready',
      runnerTaskId: 'CSVIMPORT_W427',
      finalGeneratedNamesJsonReady: true,
      finalGeneratedNamesJson: completedResult,
      resultCapture: {
        status: 'completed_result_capture_ready',
        finalGeneratedNamesJson: completedResult
      }
    },
    statePatch: {
      integratedBuildRunnerResult: {
        schema: 'idb.approved-server-adapter-result-envelope.v1',
        status: 'completed_runner_result_ready',
        runnerTaskId: 'CSVIMPORT_W427',
        idempotencyToken: originalConfirmedRequest.requestId,
        buildAttemptId: originalConfirmedRequest.buildAttemptId,
        confirmedBuildRequest: originalConfirmedRequest,
        finalGeneratedNamesJson: completedResult,
        finalGeneratedNamesJsonReady: true,
        resultCapture: {
          status: 'completed_result_capture_ready',
          runnerTaskId: 'CSVIMPORT_W427',
          idempotencyToken: originalConfirmedRequest.requestId,
          buildAttemptId: originalConfirmedRequest.buildAttemptId,
          confirmedBuildRequest: originalConfirmedRequest,
          finalGeneratedNamesJson: completedResult
        },
        resultImportGuard: {
          completedResultPresent: true,
          completedResultAcceptedByW151: true,
          generatedRecordOwner: 'governed_runner_internal_build_engine',
          importReady: true
        }
      }
    },
    resultImportGuard: {
      completedResultPresent: true,
      completedResultAcceptedByW151: true,
      generatedRecordOwner: 'governed_runner_internal_build_engine',
      importReady: true
    }
  };

  const importFlow = hooks.idbPollsCompletedResultAndImportsFinalUrlsV1(
    state,
    context.lane,
    context.page,
    context.recommendation,
    {
      pollResult: completedPoll,
      completedResultJson: completedResult,
      operatorChoseImport: true,
      actionId: 'import_completed_runner_result'
    }
  );

  const waitingState = motionState(hooks, {
    integratedBuildRunnerResult: {
      schema: 'idb.approved-server-adapter-result-envelope.v1',
      status: 'polling_pending',
      queueSubmitted: true,
      runnerTaskId: 'CSVIMPORT_W427_PENDING',
      idempotencyToken: originalConfirmedRequest.requestId,
      buildAttemptId: originalConfirmedRequest.buildAttemptId,
      confirmedBuildRequest: originalConfirmedRequest,
      resultCapture: {
        status: 'pending_transaction_resolution',
        lookupStatus: 'pending_transaction_resolution',
        runnerTaskId: 'CSVIMPORT_W427_PENDING',
        idempotencyToken: originalConfirmedRequest.requestId,
        buildAttemptId: originalConfirmedRequest.buildAttemptId,
        confirmedBuildRequest: originalConfirmedRequest
      }
    }
  });
  const waitingContext = motionContext(hooks, waitingState);
  const waitingHtml = hooks.renderIntegratedBuildRunnerReturnStatus(
    waitingState,
    waitingContext.lane,
    waitingContext.page,
    waitingContext.recommendation
  );

  assertCase(results, 'w428-drawer-marker-updated',
    /@version\s+1\.0\.37/.test(drawer) &&
      drawer.includes("const DRAWER_USERSCRIPT_VERSION = '1.0.37';") &&
      drawer.includes("const CURRENT_UX_BLOCK_W346 = 'W429';"),
    'Drawer should identify the current install marker while preserving the refresh auto-import repair patch.');

  assertCase(results, 'w427-filecabinet-drawer-synced',
    drawer === fileCabinetDrawer,
    'Root and FileCabinet drawer copies should match.');

  assertCase(results, 'w427-submitted-confirmed-request-is-preserved',
    drawer.includes('confirmedBuildRequest: confirmedRequest') &&
      drawer.includes('const savedConfirmedBuildRequest = [') &&
      drawer.includes("candidate.schema === 'idb.confirmed-build-request.v1'"),
    'Submitted confirmed request should be stored and reused for polling.');

  assertCase(results, 'w427-refresh-auto-import-code-present',
    drawer.includes('idbPollsCompletedResultAndImportsFinalUrlsV1(') &&
      drawer.includes('completed_runner_result_auto_imported_on_refresh') &&
      drawer.includes('completed_runner_result_auto_import_blocked_on_refresh'),
    'Refresh should auto-import a W151-valid completed result.');

  assertCase(results, 'w427-auto-import-uses-existing-w151-guard',
    importFlow.status === 'completed_result_imported_final_urls_ready' &&
      importFlow.importGuard &&
      importFlow.importGuard.commitAllowed === true &&
      importFlow.statePatch &&
      importFlow.statePatch.dccFinalNamingResult &&
      importFlow.buildAndRunAfterImport &&
      importFlow.buildAndRunAfterImport.verifiedOpenLinkCount >= 4,
    JSON.stringify(importFlow.importGuard));

  assertCase(results, 'w427-auto-import-preserves-open-link-authority',
    importFlow.mutationGuard &&
      importFlow.mutationGuard.drawerWritesAttempted === false &&
      importFlow.noRegression &&
      importFlow.noRegression.noActiveOpenLinksWithoutRealUrls === true,
    JSON.stringify(importFlow.noRegression));

  const stalePollControl = {
    schema: 'idb.approved-server-adapter-result-poll-control-implementation.v1',
    status: 'poll_control_pending_or_no_submit',
    resultImportGuard: {
      importReady: false,
      completedResultAcceptedByW151: false
    }
  };
  const refreshReadiness = hooks.completedRunnerResultReadyForRefreshAutoImportW428(
    stalePollControl,
    completedPoll,
    completedResult,
    state,
    context.lane,
    context.page,
    context.recommendation
  );
  assertCase(results, 'w428-refresh-auto-import-trusts-completed-poll-result',
    refreshReadiness.ready === true &&
      refreshReadiness.localW151Accepted === true &&
      refreshReadiness.pollImportReady === true &&
      refreshReadiness.pollControlImportReady === false,
    JSON.stringify(refreshReadiness));

  assertCase(results, 'w427-pending-transaction-resolution-copy-is-honest',
    /waiting for the Sales Order import to resolve/i.test(waitingHtml) &&
      /Resolving import/.test(waitingHtml),
    waitingHtml.slice(0, 1600));

  const report = `# W428 Refresh Completed Result Auto-Import Repair

## Summary
W428 repairs the simplified consultant flow after a runner task completes. Refresh preserves the original submitted build identity, polls the result capture with that identity, and auto-imports the completed runner result into the cockpit when the completed result validates locally or the completed poll response carries W151-ready evidence.

## Fix
- Store the submitted confirmed build request on the captured runner result.
- Reuse that confirmed request during result-capture polling.
- On Refresh build status, commit a W151-valid completed result immediately instead of requiring a separate Finish build click.
- Trust the completed poll result when the older poll-control object still reports a conservative pending state.
- Show a more honest waiting message when the sidecar exists but Sales Order import resolution is still pending.

## Pass/Fail
| Gate | Result |
| --- | --- |
${results.map((result) => `| ${result.id} | ${result.pass ? 'PASS' : 'FAIL'} |`).join('\n')}

## Boundaries
- No live smoke was run.
- No upload or deployment was performed.
- No runner write path, adapter record creation, source pack, completed-result validation, or Open-link authority check was weakened.

## Recommendation
Lock W429, reinstall Drawer 1.0.37 / W429 in Tampermonkey, and rerun one controlled Food/Beverage build. After the runner completes, Refresh build status should either import the records into the cockpit or clearly show transaction import resolution is still pending.
`;
  fs.writeFileSync(reportPath, report);

  printResults('W428 refresh completed result auto-import repair harness', results);
}

main();
