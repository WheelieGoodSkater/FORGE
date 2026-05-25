#!/usr/bin/env node

const {
  assertCase,
  completedMotionResult: completedMotionResultFixture,
  invalidMotionResult: invalidMotionResultFixture,
  loadHooks,
  motionContext: ctx,
  motionState,
  printResults,
  read,
  readArchiveJson,
  readArchiveText,
  userscriptPath
} = require('./lib/forge_harness_fixtures');

function completedMotionResult() {
  return completedMotionResultFixture({ prefix: '264' });
}

function invalidMotionResult() {
  return invalidMotionResultFixture({ prefix: '264' });
}

function main() {
  const hooks = loadHooks({ fetchMessage: 'live fetch disabled in W264 harness' });
  const userscript = read(userscriptPath);
  const report = readArchiveText('reports', 'w264_connected_build_submit_refresh_import.md');
  const trace = readArchiveJson('trace_samples', 'w264_connected_build_submit_refresh_import_trace.json');
  const state = motionState(hooks);
  const context = ctx(hooks, state);
  const submitCalls = [];
  const pollCalls = [];
  const flow = hooks.connectedBuildSubmitRefreshImportW264(state, context.lane, context.page, context.recommendation, {
    executeSubmit: true,
    executePoll: true,
    finishBuild: true,
    submitTransport: (request) => {
      submitCalls.push(request);
      return {
        schema: 'idb.governed-runner-adapter-result.v1',
        status: 'queued_result_capture_pending',
        queueSubmitted: true,
        runnerTaskId: 'runner-w264-motion-001',
        resultCapture: { status: 'pending_runner_completion', runnerTaskId: 'runner-w264-motion-001' }
      };
    },
    pollTransport: (request) => {
      pollCalls.push(request);
      return {
        schema: 'idb.approved-server-adapter-result-envelope.v1',
        status: 'completed_runner_result_ready',
        queueSubmitted: true,
        runnerTaskId: 'runner-w264-motion-001',
        resultCapture: {
          status: 'completed_result_capture_ready',
          runnerTaskId: 'runner-w264-motion-001',
          finalGeneratedNamesJson: completedMotionResult()
        },
        finalGeneratedNamesJson: completedMotionResult()
      };
    }
  });
  const waitingState = motionState(hooks, {
    integratedBuildRunnerResult: {
      schema: 'idb.approved-server-adapter-result-envelope.v1',
      status: 'queued_result_capture_pending',
      queueSubmitted: true,
      runnerTaskId: 'runner-w264-motion-001',
      idempotencyToken: 'motion-w264-token',
      resultCapture: { status: 'pending_runner_completion', runnerTaskId: 'runner-w264-motion-001' }
    }
  });
  const waitingContext = ctx(hooks, waitingState);
  const waitingHtml = hooks.renderIntegratedBuildRunnerReturnStatus(waitingState, waitingContext.lane, waitingContext.page, waitingContext.recommendation);
  const completedState = motionState(hooks, {
    integratedBuildRunnerResult: {
      schema: 'idb.approved-server-adapter-result-envelope.v1',
      status: 'completed_result_available',
      queueSubmitted: true,
      runnerTaskId: 'runner-w264-motion-001',
      idempotencyToken: 'motion-w264-token',
      finalGeneratedNamesJsonReady: true,
      finalGeneratedNamesJson: completedMotionResult(),
      resultCapture: {
        status: 'completed_result_capture_ready',
        runnerTaskId: 'runner-w264-motion-001',
        finalGeneratedNamesJson: completedMotionResult()
      }
    }
  });
  const completedContext = ctx(hooks, completedState);
  const completedHtml = hooks.renderIntegratedBuildRunnerReturnStatus(completedState, completedContext.lane, completedContext.page, completedContext.recommendation);
  const invalidState = motionState(hooks, {
    integratedBuildRunnerResult: {
      schema: 'idb.approved-server-adapter-result-envelope.v1',
      status: 'completed_result_available',
      queueSubmitted: true,
      runnerTaskId: 'runner-w264-motion-bad',
      idempotencyToken: 'motion-w264-token-bad',
      finalGeneratedNamesJsonReady: false,
      finalGeneratedNamesJson: invalidMotionResult(),
      resultCapture: {
        status: 'completed_result_capture_ready',
        runnerTaskId: 'runner-w264-motion-bad',
        finalGeneratedNamesJson: invalidMotionResult()
      }
    }
  });
  const invalidContext = ctx(hooks, invalidState);
  const invalidHtml = hooks.renderIntegratedBuildRunnerReturnStatus(invalidState, invalidContext.lane, invalidContext.page, invalidContext.recommendation);
  const adapterErrorState = motionState(hooks);
  const adapterErrorFlow = hooks.connectedBuildSubmitRefreshImportW264(adapterErrorState, context.lane, context.page, context.recommendation, {
    executeSubmit: true,
    executePoll: true,
    finishBuild: true,
    submitResponse: {
      schema: 'idb.governed-runner-adapter-result.v1',
      status: 'adapter_error',
      error: true,
      errorMessage: 'Sandbox adapter stopped safely.',
      queueSubmitted: false,
      resultCapture: { status: 'adapter_error', error: true }
    }
  });
  const results = [];

  assertCase(results, 'build-records-submits-only-when-released-profile-readiness-is-true',
    flow.w262States.beforeSubmit === 'ready_to_build_records' &&
      flow.submit.readyForOneCall === true &&
      flow.submit.executionAllowed === true,
    JSON.stringify(flow.w262States));

  assertCase(results, 'submit-uses-script-6702-deploy-2',
    submitCalls.length === 1 &&
      /script=6702&deploy=2/.test(submitCalls[0].endpointUrl) &&
      flow.endpointUrl === 'https://td3021666.app.netsuite.com/app/site/hosting/scriptlet.nl?script=6702&deploy=2',
    submitCalls[0] && submitCalls[0].endpointUrl);

  assertCase(results, 'one-call-idempotency-behavior-is-preserved',
    submitCalls.length === 1 &&
      flow.submit.adapterRequestEnvelope.oneSubmitLimit.maxQueueSubmitAttempts === 1 &&
      !!flow.submit.adapterRequestEnvelope.idempotencyToken &&
      flow.submit.runnerTaskIdCapturePath.statePatch.integratedBuildRunnerResult.idempotencyToken === flow.submit.adapterRequestEnvelope.idempotencyToken,
    JSON.stringify(flow.submit.adapterRequestEnvelope.oneSubmitLimit));

  assertCase(results, 'runner-task-id-is-captured-from-approved-adapter-response',
    flow.captured.runnerTaskId === 'runner-w264-motion-001' &&
      flow.w262States.afterSubmit === 'waiting_for_runner_result',
    JSON.stringify(flow.captured));

  assertCase(results, 'refresh-build-status-appears-after-submit',
    /Refresh build status/.test(waitingHtml) &&
      /data-idb-build-return-action="check_runner_result"/.test(waitingHtml),
    waitingHtml.slice(0, 1200));

  assertCase(results, 'completed-result-validates-before-finish-build-appears',
    /Finish build/.test(completedHtml) &&
      /data-idb-build-return-action="import_completed_runner_result"/.test(completedHtml) &&
      !/Motion Branch Fulfillment SKU/.test(completedHtml),
    completedHtml.slice(0, 1200));

  assertCase(results, 'invalid-result-is-rejected-with-w220-recovery-wording',
    /Import recovery/.test(invalidHtml) &&
      /Use the latest completed runner result|Paste the completed build result/.test(invalidHtml) &&
      !/Finish build/.test(invalidHtml),
    invalidHtml.slice(0, 1400));

  assertCase(results, 'valid-result-imports-returned-names-and-open-links',
    flow.status === 'records_imported' &&
      flow.importCommit.commitAllowed === true &&
      flow.importedRecords.some((record) => record.name === 'Motion Branch Fulfillment SKU' && record.linkAuthority && record.linkAuthority.openable === true) &&
      flow.importedRecords.some((record) => record.name === 'SO-W264 Motion Branch Availability'),
    flow.importedRecords.map((record) => `${record.name}:${record.linkAuthority && record.linkAuthority.status}`).join(' | '));

  assertCase(results, 'motion-distribution-records-use-product-sku-availability-labels',
    flow.importedRecords.some((record) => /Product SKU/i.test(record.label || record.consultantLabel || '')) &&
      flow.importedRecords.some((record) => /Availability|Replenishment/i.test(record.label || record.consultantLabel || '')) &&
      !flow.importedRecords.some((record) => /Motion Branch Fulfillment SKU/.test(record.name || '') && /Finished\/Assembly Item/i.test(record.label || record.consultantLabel || '')),
    flow.importedRecords.map((record) => `${record.name}:${record.label || record.consultantLabel}`).join(' | '));

  assertCase(results, 'review-run-story-surfaces-remain-available-after-import',
    flow.storySurface &&
      flow.storySurface.evidenceReceiptW254 &&
      Array.isArray(flow.storySurface.evidenceReceiptW254.rows) &&
      flow.storySurface.evidenceReceiptW254.rows.length >= 6 &&
      userscript.includes('idb-w256-live-demo-script') &&
      userscript.includes('idb-w257-guided-demo-sequence') &&
      userscript.includes('idb-w258-first-glance-cta'),
    flow.storySurface && JSON.stringify({ openTarget: flow.storySurface.openTarget, receiptRows: flow.storySurface.evidenceReceiptW254.rows.length }));

  assertCase(results, 'fake-links-remain-blocked-before-import',
    flow.refresh.resultImportGuard.activeOpenLinksBeforeImport === 0 &&
      flow.guardrails.fakeOpenLinksBlockedBeforeImport === true,
    JSON.stringify(flow.refresh.resultImportGuard));

  assertCase(results, 'adapter-error-does-not-mutate-returned-records-or-show-fake-links',
    adapterErrorFlow.status === 'adapter_error_safe_stop' &&
      adapterErrorFlow.importedRecords.length === 0 &&
      adapterErrorFlow.captured.adapterSafeErrorState === true,
    JSON.stringify(adapterErrorFlow.captured));

  assertCase(results, 'normal-consultant-ui-hides-raw-adapter-diagnostics',
    !/runnerTaskId|script=6702|deploy=2|customdeployidb_governed_runner_adapter|operator gate|server flags|transport boundary/i.test(waitingHtml + completedHtml),
    (waitingHtml + completedHtml).slice(0, 1400));

  assertCase(results, 'no-drawer-created-records-or-transaction-writes-introduced',
    flow.guardrails.noDrawerCreatedRecords === true &&
      flow.guardrails.noDrawerTransactionWrites === true &&
      flow.guardrails.approvedServerAdapterPathOnly === true &&
      /no drawer-created records/i.test(report) &&
      trace.guardrails.noDrawerCreatedRecords === true,
    JSON.stringify(flow.guardrails));

  assertCase(results, 'archived-report-and-trace-present',
    /W264 Connected Build Submit/.test(report) &&
      trace.schema === 'forge.w264.connected-build-submit-refresh-import.trace.v1' &&
      trace.endpoint.includes('script=6702&deploy=2'),
    JSON.stringify(trace));

  printResults('W264 connected build submit refresh import harness', results);
}

main();
