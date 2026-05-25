#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const adapterReadinessBridge = require('../../src/contracts/adapterReadinessBridge');
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
  submitResponse,
  pendingRefreshResponse,
  completedRefreshResponse,
  userscriptPath
} = require('./lib/forge_harness_fixtures');

function readRepoFile(...parts) {
  return fs.readFileSync(path.join(root, ...parts), 'utf8');
}

function boundary(trace, id) {
  return (trace.boundaryInventory || []).find((item) => item.id === id) || {};
}

function includesAll(source, expected) {
  const values = source || [];
  return expected.every((value) => values.indexOf(value) >= 0);
}

function main() {
  const results = [];
  const hooks = loadHooks({ fetchMessage: 'live fetch disabled in W282 harness' });
  const userscript = read(userscriptPath);
  const packageJson = JSON.parse(readRepoFile('package.json'));
  const report = readArchiveText('reports', 'w282_connected_build_boundary_inventory.md');
  const trace = readArchiveJson('trace_samples', 'w282_connected_build_boundary_inventory_trace.json');
  const w281Trace = readArchiveJson('trace_samples', 'w281_adapter_profile_readiness_contract_migration_trace.json');
  const state = motionState(hooks);
  const context = motionContext(hooks, state);
  const submitCalls = [];
  const pollCalls = [];
  const completedResult = completedMotionResult({ prefix: '282' });
  const w264Flow = hooks.connectedBuildSubmitRefreshImportW264(state, context.lane, context.page, context.recommendation, {
    executeSubmit: true,
    executePoll: true,
    finishBuild: true,
    submitTransport: (request) => {
      submitCalls.push(request);
      return submitResponse('runner-w282-motion-001', request && request.idempotencyToken || 'motion-w282-token');
    },
    pollTransport: (request) => {
      pollCalls.push(request);
      return completedRefreshResponse('runner-w282-motion-001', completedResult);
    }
  });
  const submitShape = hooks.actualAdapterResponseShapeW265(submitResponse('runner-w282-motion-001', 'motion-w282-token'), {
    phase: 'submit',
    idempotencyToken: 'motion-w282-token'
  });
  const pendingShape = hooks.actualAdapterResponseShapeW265(pendingRefreshResponse('runner-w282-motion-001'), {
    phase: 'refresh',
    runnerTaskId: 'runner-w282-motion-001',
    idempotencyToken: 'motion-w282-token'
  });
  const completedShape = hooks.actualAdapterResponseShapeW265(completedRefreshResponse('runner-w282-motion-001', completedResult), {
    phase: 'refresh',
    runnerTaskId: 'runner-w282-motion-001',
    idempotencyToken: 'motion-w282-token'
  });
  const malformedShape = hooks.actualAdapterResponseShapeW265({ status: 'adapter_error', error: true }, {
    phase: 'refresh',
    runnerTaskId: 'runner-w282-motion-001',
    idempotencyToken: 'motion-w282-token'
  });
  const retryPolicy = hooks.connectedBuildRetryPolicyW265({
    runnerTaskId: 'runner-w282-motion-001',
    idempotencyToken: 'motion-w282-token',
    completedResultAccepted: w264Flow.completedResultGuard.completedResultAcceptedByW151
  });
  const completedGuard = hooks.validateDccFinalNamingImportPayload(completedResult, state, context.lane, context.page, context.recommendation);
  const normalizedImport = hooks.canonicalImportResultNormalizationW245(completedResult, state, context.lane, context.page, context.recommendation);
  const semanticGuard = hooks.completedRunnerResultSemanticGuardW214(completedGuard.finalNaming, state, context.lane, completedResult);
  const readyTrace = hooks.deployedAdapterReadinessTraceW263(state, context.lane, context.page, context.recommendation);
  const waitingState = motionState(hooks, {
    integratedBuildRunnerResult: {
      schema: 'idb.approved-server-adapter-result-envelope.v1',
      status: 'queued_result_capture_pending',
      queueSubmitted: true,
      runnerTaskId: 'runner-w282-motion-001',
      idempotencyToken: 'motion-w282-token',
      resultCapture: { status: 'pending_runner_completion', runnerTaskId: 'runner-w282-motion-001' }
    }
  });
  const waitingContext = motionContext(hooks, waitingState);
  const waitingHtml = hooks.renderIntegratedBuildRunnerReturnStatus(waitingState, waitingContext.lane, waitingContext.page, waitingContext.recommendation);
  const completedState = motionState(hooks, {
    integratedBuildRunnerResult: {
      schema: 'idb.approved-server-adapter-result-envelope.v1',
      status: 'completed_result_available',
      queueSubmitted: true,
      runnerTaskId: 'runner-w282-motion-001',
      idempotencyToken: 'motion-w282-token',
      finalGeneratedNamesJsonReady: true,
      finalGeneratedNamesJson: completedResult,
      resultCapture: {
        status: 'completed_result_capture_ready',
        runnerTaskId: 'runner-w282-motion-001',
        finalGeneratedNamesJson: completedResult
      }
    }
  });
  const completedContext = motionContext(hooks, completedState);
  const completedHtml = hooks.renderIntegratedBuildRunnerReturnStatus(completedState, completedContext.lane, completedContext.page, completedContext.recommendation);

  assertCase(results, 'boundary-inventory-includes-all-required-connected-build-areas',
    trace.schema === 'forge.w282.connected-build-boundary-inventory.trace.v1' &&
      trace.boundaryInventory.length === 10 &&
      [
        'consultant_request_readiness',
        'selected_adapter_profile_readiness',
        'submit_payload_idempotency',
        'adapter_response_normalization',
        'refresh_poll_response_normalization',
        'completed_result_validation',
        'finish_build_import_action',
        'returned_record_names_labels_open_links',
        'error_recovery_copy',
        'admin_only_raw_evidence'
      ].every((id) => Boolean(boundary(trace, id).id)) &&
      /Boundary Inventory/.test(report),
    JSON.stringify(trace.boundaryInventory.map((item) => item.id)));

  assertCase(results, 'future-micro-slice-selects-response-shape-not-submit-execution',
    trace.selectedFutureMicroSlice.id === 'connected_build_response_shape_contract_prepare' &&
      trace.selectedFutureMicroSlice.targetContractOrProposedModule === 'src/contracts/connectedBuildResponseShapes.js' &&
      includesAll(trace.selectedFutureMicroSlice.sourceAnchors, [
        'actualAdapterResponseShapeW265',
        'connectedBuildRetryPolicyW265',
        'connectedBuildSubmitRefreshImportW264.captured',
        'normalizeApprovedServerAdapterTransportResponseV1'
      ]) &&
      trace.selectedFutureMicroSlice.manualReviewNotes.some((note) => /Do not move the submit execution call/.test(note)) &&
      !/perform the connected build runtime extraction/i.test(report),
    JSON.stringify(trace.selectedFutureMicroSlice));

  assertCase(results, 'w281-adapter-profile-readiness-migration-continuity-preserved',
    w281Trace.schema === 'forge.w281.adapter-profile-readiness-contract-migration.trace.v1' &&
      trace.continuity.w281AdapterProfileReadinessMigrationPreserved === true &&
      adapterReadinessBridge.validateReadinessTrace(readyTrace).fieldCompatible === true &&
      readyTrace.datasetSwitching.canSwapAccountHostWithoutRuntimeLogicChange === true,
    JSON.stringify({
      w281Schema: w281Trace.schema,
      readinessTrace: adapterReadinessBridge.validateReadinessTrace(readyTrace)
    }));

  assertCase(results, 'w264-connected-submit-refresh-import-continuity-preserved',
    submitCalls.length === 1 &&
      pollCalls.length === 1 &&
      w264Flow.status === 'records_imported' &&
      w264Flow.endpointUrl === 'https://td3021666.app.netsuite.com/app/site/hosting/scriptlet.nl?script=6702&deploy=2' &&
      w264Flow.completedResultGuard.completedResultAcceptedByW151 === true &&
      w264Flow.importedRecords.length >= 4 &&
      trace.continuity.w264SubmitRefreshImportChanged === false,
    JSON.stringify({
      status: w264Flow.status,
      endpointUrl: w264Flow.endpointUrl,
      importedRecords: w264Flow.importedRecords.length
    }));

  assertCase(results, 'w265-response-shape-and-retry-safety-continuity-preserved',
    submitShape.status === 'submit_task_captured' &&
      submitShape.runnerTaskId === 'runner-w282-motion-001' &&
      pendingShape.status === 'refresh_pending' &&
      completedShape.status === 'completed_result_shape_ready' &&
      completedShape.finalGeneratedNamesJsonLocation === 'resultCapture.finalGeneratedNamesJson' &&
      malformedShape.status === 'adapter_error_safe_stop' &&
      retryPolicy.duplicateSubmit.allowed === false &&
      retryPolicy.duplicateSubmit.createsSecondBuild === false &&
      retryPolicy.finishBuild.allowed === true &&
      trace.continuity.w265RetrySafetyChanged === false,
    JSON.stringify({ submitShape, pendingStatus: pendingShape.status, completedLocation: completedShape.finalGeneratedNamesJsonLocation, retryPolicy }));

  assertCase(results, 'w245-and-w151-validation-remain-protected',
    completedGuard.valid === true &&
      completedGuard.status === 'completed_runner_result_accepted' &&
      semanticGuard.valid === true &&
      normalizedImport.status === 'display_ready_records_normalized' &&
      normalizedImport.visibleRecords.length >= 4 &&
      boundary(trace, 'completed_result_validation').futureExtractionPosture === 'protected_runtime_surface' &&
      trace.continuity.w245CanonicalImportChanged === false &&
      trace.continuity.w151ValidationChanged === false,
    JSON.stringify({
      completedGuard,
      semanticStatus: semanticGuard.status,
      normalizedStatus: normalizedImport.status
    }));

  assertCase(results, 'returned-record-names-labels-and-open-links-remain-preserved',
    w264Flow.importedRecords.some((record) => record.name === 'Motion Branch Fulfillment SKU' && /Product SKU/i.test(record.label)) &&
      w264Flow.importedRecords.some((record) => record.name === 'Motion Availability Proof Flow' && /Availability|Replenishment/i.test(record.label)) &&
      w264Flow.importedRecords.every((record) => record.linkAuthority && record.linkAuthority.openable === true && /^https:\/\/td3021666\.app\.netsuite\.com\//.test(record.openUrl)) &&
      boundary(trace, 'returned_record_names_labels_open_links').futureExtractionPosture === 'protected_runtime_surface' &&
      trace.continuity.returnedRecordsOpenLinksChanged === false,
    w264Flow.importedRecords.map((record) => `${record.label}:${record.name}:${record.openUrl}`).join(' | '));

  assertCase(results, 'fake-link-blocking-and-finish-build-gate-remain-preserved',
    w264Flow.refresh.resultImportGuard.activeOpenLinksBeforeImport === 0 &&
      /Finish build/.test(completedHtml) &&
      !/Motion Branch Fulfillment SKU/.test(completedHtml) &&
      !/Open<\/a>/.test(waitingHtml) &&
      trace.continuity.fakeLinkBlockingChanged === false,
    JSON.stringify(w264Flow.refresh.resultImportGuard));

  assertCase(results, 'normal-consultant-ui-hides-endpoint-raw-task-schema-stack-admin-diagnostics',
    /Refresh build status/.test(waitingHtml) &&
      /Finish build/.test(completedHtml) &&
      !/script=6702|deploy=2|customdeployidb_governed_runner_adapter|td3021666\.app\.netsuite\.com|runnerTaskId|raw json|schema|stack trace|admin diagnostics|transport boundary|operator gate|server flags/i.test(waitingHtml + completedHtml) &&
      trace.guardrails.normalConsultantUiHidesEndpointRawTaskSchemaStackAdminDiagnostics === true,
    (waitingHtml + completedHtml).slice(0, 1400));

  assertCase(results, 'safe-and-protected-extraction-postures-are-explicit',
    boundary(trace, 'adapter_response_normalization').futureExtractionPosture === 'future_extractable' &&
      boundary(trace, 'refresh_poll_response_normalization').futureExtractionPosture === 'future_extractable' &&
      boundary(trace, 'admin_only_raw_evidence').futureExtractionPosture === 'admin_review_only' &&
      boundary(trace, 'submit_payload_idempotency').futureExtractionPosture === 'protected_runtime_surface' &&
      boundary(trace, 'finish_build_import_action').futureExtractionPosture === 'protected_runtime_surface',
    JSON.stringify(trace.boundaryInventory));

  assertCase(results, 'no-runtime-authority-or-connected-build-changes-introduced',
    trace.guardrails.runtimeBehaviorChanged === false &&
      trace.guardrails.connectedBuildFlowChanged === false &&
      trace.guardrails.endpointProfileBehaviorChanged === false &&
      trace.guardrails.datasetSwitchingChanged === false &&
      trace.guardrails.recordCreationAuthorityChanged === false &&
      w264Flow.guardrails.noDrawerCreatedRecords === true &&
      w264Flow.guardrails.noDrawerTransactionWrites === true &&
      w264Flow.guardrails.approvedServerAdapterPathOnly === true &&
      w264Flow.guardrails.noW144DeploymentUpdateInThisBlock === true,
    JSON.stringify({ traceGuardrails: trace.guardrails, flowGuardrails: w264Flow.guardrails }));

  assertCase(results, 'w282-harness-and-check-registration-present',
    packageJson.scripts['harness:connected-build-boundary-inventory-w282'] === 'node archive/tools/run_w282_connected_build_boundary_inventory_harness.js' &&
      packageJson.scripts.check.indexOf('archive/tools/run_w282_connected_build_boundary_inventory_harness.js') >= 0 &&
      /W282 Connected Build Boundary Inventory/.test(report),
    JSON.stringify(packageJson.scripts['harness:connected-build-boundary-inventory-w282']));

  printResults('W282 connected build boundary inventory harness', results);
}

main();
