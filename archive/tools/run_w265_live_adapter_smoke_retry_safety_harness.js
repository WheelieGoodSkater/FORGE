#!/usr/bin/env node

const {
  assertCase,
  completedMotionResult,
  loadHooks,
  motionContext: ctx,
  motionState,
  printResults,
  readArchiveJson,
  readArchiveText
} = require('./lib/forge_harness_fixtures');

function main() {
  const hooks = loadHooks({ fetchMessage: 'live fetch disabled in W265 harness' });
  const report = readArchiveText('reports', 'w265_live_adapter_smoke_retry_safety.md');
  const trace = readArchiveJson('trace_samples', 'w265_live_adapter_smoke_retry_safety_trace.json');
  const state = motionState(hooks);
  const context = ctx(hooks, state);
  const submitFixture = {
    statusCode: 200,
    ok: true,
    payload: {
      status: 'queued',
      queueSubmitted: true,
      task: { id: 'runner-w265-motion-001' },
      idempotencyToken: 'motion-w265-token',
      resultCapture: { status: 'pending_runner_completion' }
    }
  };
  const pendingFixture = {
    data: {
      status: 'pending',
      queued: true,
      runner_task_id: 'runner-w265-motion-001',
      resultCapture: { status: 'pending_runner_completion' }
    }
  };
  const completedFixture = {
    ok: true,
    payload: {
      status: 'done',
      queueSubmitted: true,
      runner_task_id: 'runner-w265-motion-001',
      resultCapture: {
        status: 'completed_result_capture_ready',
        finalGeneratedNamesJson: completedMotionResult({ prefix: '265' })
      }
    }
  };
  const malformedFixture = {
    status: 'adapter_exception',
    error: true,
    errorMessage: 'Adapter stopped safely before result import.'
  };
  const packet = hooks.liveAdapterSmokeEvidencePacketW265(state, context.lane, context.page, context.recommendation, {
    submitResponse: submitFixture,
    pendingRefreshResponse: pendingFixture,
    completedRefreshResponse: completedFixture,
    malformedRefreshResponse: malformedFixture
  });
  const duplicatePolicy = hooks.connectedBuildRetryPolicyW265({
    runnerTaskId: 'runner-w265-motion-001',
    idempotencyToken: 'motion-w265-token',
    completedResultAccepted: false
  });
  const errorPolicy = hooks.connectedBuildRetryPolicyW265({
    runnerTaskId: 'runner-w265-motion-001',
    idempotencyToken: 'motion-w265-token',
    adapterError: true
  });
  const w264Flow = hooks.connectedBuildSubmitRefreshImportW264(state, context.lane, context.page, context.recommendation, {
    executeSubmit: true,
    executePoll: true,
    finishBuild: true,
    submitResponse: {
      schema: 'idb.governed-runner-adapter-result.v1',
      status: 'queued_result_capture_pending',
      queueSubmitted: true,
      runnerTaskId: 'runner-w265-motion-001',
      idempotencyToken: 'motion-w265-token',
      resultCapture: { status: 'pending_runner_completion', runnerTaskId: 'runner-w265-motion-001' }
    },
    pollResponse: {
      schema: 'idb.approved-server-adapter-result-envelope.v1',
      status: 'completed_runner_result_ready',
      queueSubmitted: true,
      runnerTaskId: 'runner-w265-motion-001',
      resultCapture: {
        status: 'completed_result_capture_ready',
        runnerTaskId: 'runner-w265-motion-001',
        finalGeneratedNamesJson: completedMotionResult({ prefix: '265' })
      }
    }
  });
  const completedState = motionState(hooks, {
    integratedBuildRunnerResult: {
      status: 'completed_result_available',
      queueSubmitted: true,
      runnerTaskId: 'runner-w265-motion-001',
      idempotencyToken: 'motion-w265-token',
      finalGeneratedNamesJsonReady: true,
      finalGeneratedNamesJson: completedMotionResult({ prefix: '265' }),
      resultCapture: {
        status: 'completed_result_capture_ready',
        runnerTaskId: 'runner-w265-motion-001',
        finalGeneratedNamesJson: completedMotionResult({ prefix: '265' })
      }
    }
  });
  const completedContext = ctx(hooks, completedState);
  const completedHtml = hooks.renderIntegratedBuildRunnerReturnStatus(completedState, completedContext.lane, completedContext.page, completedContext.recommendation);
  const results = [];

  assertCase(results, 'actual-fixture-submit-aliases-normalize-runner-task',
    packet.submitShape.status === 'submit_task_captured' &&
      packet.submitShape.runnerTaskId === 'runner-w265-motion-001' &&
      packet.submitShape.idempotencyToken === 'motion-w265-token' &&
      packet.submitShape.http.status === '200',
    JSON.stringify(packet.submitShape));

  assertCase(results, 'pending-refresh-stays-waiting',
    packet.refreshShapes.pending.status === 'refresh_pending' &&
      packet.refreshShapes.pending.normalUiCopy === 'Still building.',
    JSON.stringify(packet.refreshShapes.pending));

  assertCase(results, 'completed-refresh-shows-finish-build-without-auto-import',
    packet.refreshShapes.completed.status === 'completed_result_shape_ready' &&
      packet.completedResultGuard.completedResultAcceptedByW151 === true &&
      /Finish build/.test(completedHtml) &&
      !/Motion Branch Fulfillment SKU/.test(completedHtml),
    completedHtml.slice(0, 1200));

  assertCase(results, 'finish-build-imports-only-w151-valid-results',
    w264Flow.status === 'records_imported' &&
      w264Flow.importedRecords.some((record) => record.name === 'Motion Branch Fulfillment SKU') &&
      packet.completedResultGuard.completedResultAcceptedByW151 === true,
    w264Flow.importedRecords.map((record) => record.name).join(' | '));

  assertCase(results, 'malformed-error-refresh-asks-admin-without-fake-links',
    packet.refreshShapes.malformedOrError.status === 'adapter_error_safe_stop' &&
      packet.refreshShapes.malformedOrError.normalUiCopy === 'Build stopped safely, ask admin.' &&
      packet.refreshShapes.malformedOrError.normalizedResponse.activeOpenLinks === 0,
    JSON.stringify(packet.refreshShapes.malformedOrError));

  assertCase(results, 'duplicate-submit-does-not-create-second-build',
    duplicatePolicy.duplicateSubmit.allowed === false &&
      duplicatePolicy.duplicateSubmit.createsSecondBuild === false &&
      duplicatePolicy.duplicateSubmit.action === 'use_existing_build_and_refresh_status' &&
      duplicatePolicy.duplicateSubmit.idempotencyPreserved === true,
    JSON.stringify(duplicatePolicy.duplicateSubmit));

  assertCase(results, 'retry-after-adapter-error-is-gated',
    errorPolicy.afterAdapterError.allowedAutomatically === false &&
      errorPolicy.afterAdapterError.action === 'requires_new_explicit_consultant_or_admin_action',
    JSON.stringify(errorPolicy.afterAdapterError));

  assertCase(results, 'raw-response-evidence-archived-admin-only-not-normal-ui',
    packet.rawEvidencePolicy.archiveOnly === true &&
      packet.rawEvidencePolicy.adminDebugOnly === true &&
      packet.rawEvidencePolicy.hiddenFromNormalConsultantUi === true &&
      !/runner-w265|motion-w265-token|script=6702|raw JSON|stack trace|schema name/i.test(packet.normalConsultantCopy.join(' ')),
    JSON.stringify(packet.rawEvidencePolicy));

  assertCase(results, 'w264-motion-connected-path-still-passes',
    w264Flow.guardrails.w245CanonicalImportPreserved === true &&
      w264Flow.guardrails.fakeOpenLinksBlockedBeforeImport === true &&
      w264Flow.importedRecords.some((record) => /Product SKU/i.test(record.label || '')),
    JSON.stringify(w264Flow.guardrails));

  assertCase(results, 'no-drawer-created-records-or-transaction-writes-introduced',
    packet.guardrails.noDrawerCreatedRecords === true &&
      packet.guardrails.noDrawerTransactionWrites === true &&
      duplicatePolicy.guardrails.noDrawerCreatedRecords === true &&
      /no drawer-created records/i.test(report) &&
      trace.guardrails.noDrawerCreatedRecords === true,
    JSON.stringify(packet.guardrails));

  assertCase(results, 'report-and-trace-archived',
    /W265 Live Adapter Smoke/.test(report) &&
      trace.schema === 'forge.w265.live-adapter-smoke-retry-safety.trace.v1' &&
      trace.submitShape.runnerTaskId === 'runner-w265-motion-001',
    JSON.stringify(trace));

  printResults('W265 live adapter smoke retry safety harness', results);
}

main();
