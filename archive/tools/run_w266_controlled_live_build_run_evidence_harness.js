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
  const hooks = loadHooks({ fetchMessage: 'live fetch disabled in W266 harness' });
  const report = readArchiveText('reports', 'w266_controlled_live_build_run_evidence.md');
  const trace = readArchiveJson('trace_samples', 'w266_controlled_live_build_run_evidence_trace.json');
  const state = motionState(hooks);
  const context = ctx(hooks, state);
  const submitResponse = {
    statusCode: 200,
    ok: true,
    payload: {
      status: 'queued',
      queueSubmitted: true,
      task: { id: 'runner-w266-motion-001' },
      idempotencyToken: 'motion-w266-token',
      resultCapture: { status: 'pending_runner_completion' }
    }
  };
  const pendingRefreshResponse = {
    data: {
      status: 'pending',
      queued: true,
      runner_task_id: 'runner-w266-motion-001',
      resultCapture: { status: 'pending_runner_completion' }
    }
  };
  const completedRefreshResponse = {
    ok: true,
    payload: {
      status: 'done',
      queueSubmitted: true,
      runner_task_id: 'runner-w266-motion-001',
      resultCapture: {
        status: 'completed_result_capture_ready',
        finalGeneratedNamesJson: completedMotionResult()
      }
    }
  };
  const packet = hooks.controlledLiveBuildRunEvidencePacketW266(state, context.lane, context.page, context.recommendation, {
    submittedAt: '2026-05-25T12:00:00.000Z',
    submitResponse,
    pendingRefreshResponse,
    completedRefreshResponse,
    malformedRefreshResponse: { status: 'adapter_error', error: true },
    finishBuild: true
  });
  const needsAttention = hooks.liveRunDecisionHelperW266(Object.assign({}, packet, {
    responseReconciliation: Object.assign({}, packet.responseReconciliation, {
      newAliasesObserved: true,
      safeAliasesOnly: true
    }),
    importEvidence: Object.assign({}, packet.importEvidence, { imported: false, returnedRecords: [] })
  }));
  const rollback = hooks.liveRunDecisionHelperW266(Object.assign({}, packet, {
    guardrails: Object.assign({}, packet.guardrails, { noDrawerTransactionWrites: false }),
    importEvidence: Object.assign({}, packet.importEvidence, { supportedOpenLinksOnly: false, fakeOpenLinksSeen: true })
  }));
  const aliasShape = hooks.actualAdapterResponseShapeW265({
    payload: {
      status: 'done',
      queueSubmitted: true,
      queueTaskId: 'runner-w266-alias-001',
      generatedNamesJson: completedMotionResult()
    }
  }, { phase: 'refresh' });
  const w264Flow = hooks.connectedBuildSubmitRefreshImportW264(state, context.lane, context.page, context.recommendation, {
    executeSubmit: true,
    executePoll: true,
    finishBuild: true,
    submitResponse: {
      status: 'queued_result_capture_pending',
      queueSubmitted: true,
      runnerTaskId: 'runner-w266-motion-001',
      idempotencyToken: 'motion-w266-token',
      resultCapture: { status: 'pending_runner_completion', runnerTaskId: 'runner-w266-motion-001' }
    },
    pollResponse: {
      status: 'completed_runner_result_ready',
      queueSubmitted: true,
      runnerTaskId: 'runner-w266-motion-001',
      resultCapture: {
        status: 'completed_result_capture_ready',
        runnerTaskId: 'runner-w266-motion-001',
        finalGeneratedNamesJson: completedMotionResult()
      }
    }
  });
  const duplicatePolicy = hooks.connectedBuildRetryPolicyW265({
    runnerTaskId: packet.submitEvidence.runnerTaskId,
    idempotencyToken: packet.submitEvidence.idempotencyToken,
    completedResultAccepted: false
  });
  const errorPolicy = hooks.connectedBuildRetryPolicyW265({
    runnerTaskId: packet.submitEvidence.runnerTaskId,
    idempotencyToken: packet.submitEvidence.idempotencyToken,
    adapterError: true
  });
  const normalCopy = packet.normalConsultantCopy.join(' ');
  const results = [];

  assertCase(results, 'live-evidence-packet-includes-required-capture-fields',
    packet.submitEvidence.runnerTaskId === 'runner-w266-motion-001' &&
      packet.submitEvidence.idempotencyToken === 'motion-w266-token' &&
      packet.refreshEvidence.pending.status === 'refresh_pending' &&
      packet.refreshEvidence.completed.status === 'completed_result_shape_ready' &&
      /resultCapture\.finalGeneratedNamesJson/.test(packet.refreshEvidence.finalGeneratedNamesJsonLocation || '') &&
      packet.w151Validation.completedResultAcceptedByW151 === true &&
      packet.importEvidence.imported === true &&
      packet.importEvidence.returnedRecords.length === 4 &&
      packet.importEvidence.supportedOpenLinksOnly === true,
    JSON.stringify(packet));

  assertCase(results, 'live-run-decision-helper-statuses',
    packet.liveRunDecision.status === 'ready_to_keep' &&
      needsAttention.status === 'needs_attention' &&
      rollback.status === 'rollback_recommended',
    JSON.stringify({ ready: packet.liveRunDecision, needsAttention, rollback }));

  assertCase(results, 'actual-response-aliases-continue-through-w265',
    aliasShape.status === 'completed_result_shape_ready' &&
      aliasShape.runnerTaskId === 'runner-w266-alias-001' &&
      aliasShape.finalGeneratedNamesJsonReady === true,
    JSON.stringify(aliasShape));

  assertCase(results, 'completed-result-imports-only-after-w151-valid-result',
    packet.w151Validation.completedResultAcceptedByW151 === true &&
      packet.importEvidence.imported === true &&
      packet.liveRunDecision.status === 'ready_to_keep',
    JSON.stringify(packet.w151Validation));

  assertCase(results, 'motion-distribution-records-keep-product-sku-availability-labels',
    packet.importEvidence.returnedRecords.some((record) => record.name === 'Motion Branch Fulfillment SKU' && /Product SKU/i.test(record.label || '')) &&
      packet.importEvidence.returnedRecords.some((record) => /Availability/i.test(record.label || '')) &&
      !packet.importEvidence.returnedRecords.some((record) => /Motion Branch Fulfillment SKU/.test(record.name || '') && /Finished\/Assembly Item/i.test(record.label || '')),
    packet.importEvidence.returnedRecords.map((record) => `${record.name}:${record.label}`).join(' | '));

  assertCase(results, 'normal-consultant-ui-hides-admin-details',
    packet.endpointHiddenFromNormalUi === true &&
      packet.rawEvidencePolicy.hiddenFromNormalConsultantUi === true &&
      !/endpoint|script=6702|raw JSON|runner-w266|task id|schema|stack trace|admin diagnostics/i.test(normalCopy),
    normalCopy);

  assertCase(results, 'duplicate-submit-and-error-retry-rules-remain-enforced',
    duplicatePolicy.duplicateSubmit.createsSecondBuild === false &&
      duplicatePolicy.duplicateSubmit.allowed === false &&
      errorPolicy.afterAdapterError.allowedAutomatically === false,
    JSON.stringify({ duplicate: duplicatePolicy.duplicateSubmit, error: errorPolicy.afterAdapterError }));

  assertCase(results, 'fake-open-links-remain-blocked-before-import',
    packet.guardrails.fakeOpenLinksBlockedBeforeImport === true &&
      w264Flow.guardrails.fakeOpenLinksBlockedBeforeImport === true,
    JSON.stringify(packet.guardrails));

  assertCase(results, 'w264-and-w265-continuity-still-passes',
    w264Flow.status === 'records_imported' &&
      packet.retrySafety.guardrails.finishRequiresW151ValidResult === true,
    JSON.stringify({ w264Status: w264Flow.status, retry: packet.retrySafety.guardrails }));

  assertCase(results, 'no-drawer-created-records-or-transaction-writes-introduced',
    packet.guardrails.noDrawerCreatedRecords === true &&
      packet.guardrails.noDrawerTransactionWrites === true &&
      packet.guardrails.approvedServerAdapterPathOnly === true &&
      /no drawer-created records/i.test(report) &&
      trace.guardrails.noDrawerCreatedRecords === true,
    JSON.stringify(packet.guardrails));

  assertCase(results, 'report-and-trace-archived',
    /W266 Controlled Live Build Run/.test(report) &&
      trace.schema === 'forge.w266.controlled-live-build-run-evidence.trace.v1' &&
      trace.liveRunDecision.status === 'ready_to_keep',
    JSON.stringify(trace));

  printResults('W266 controlled live build run evidence harness', results);
}

main();
