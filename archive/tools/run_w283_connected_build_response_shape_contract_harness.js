#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const responseShapes = require('../../src/contracts/connectedBuildResponseShapes');
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

function shapeParity(drawerShape, contractShape) {
  return drawerShape.schema === contractShape.schema &&
    drawerShape.phase === contractShape.phase &&
    drawerShape.status === contractShape.status &&
    drawerShape.runnerTaskId === contractShape.runnerTaskId &&
    drawerShape.idempotencyToken === contractShape.idempotencyToken &&
    drawerShape.resultCaptureStatus === contractShape.resultCaptureStatus &&
    drawerShape.finalGeneratedNamesJsonLocation === contractShape.finalGeneratedNamesJsonLocation &&
    drawerShape.finalGeneratedNamesJsonReady === contractShape.finalGeneratedNamesJsonReady &&
    drawerShape.normalUiCopy === contractShape.normalUiCopy &&
    drawerShape.adapterSafeErrorCopy === contractShape.adapterSafeErrorCopy &&
    drawerShape.normalizedResponse.status === contractShape.normalizedResponse.status;
}

function main() {
  const results = [];
  const hooks = loadHooks({ fetchMessage: 'live fetch disabled in W283 harness' });
  const userscript = read(userscriptPath);
  const packageJson = JSON.parse(readRepoFile('package.json'));
  const report = readArchiveText('reports', 'w283_connected_build_response_shape_contract.md');
  const trace = readArchiveJson('trace_samples', 'w283_connected_build_response_shape_contract_trace.json');
  const w282Trace = readArchiveJson('trace_samples', 'w282_connected_build_boundary_inventory_trace.json');
  const w281Trace = readArchiveJson('trace_samples', 'w281_adapter_profile_readiness_contract_migration_trace.json');
  const state = motionState(hooks);
  const context = motionContext(hooks, state);
  const completedResult = completedMotionResult({ prefix: '283' });
  const submitRaw = submitResponse('runner-w283-motion-001', 'motion-w283-token');
  const pendingRaw = pendingRefreshResponse('runner-w283-motion-001');
  const completedRaw = completedRefreshResponse('runner-w283-motion-001', completedResult);
  const malformedRaw = { status: 'adapter_error', error: true, resultCapture: { status: 'adapter_error', error: true } };
  const drawerSubmitShape = hooks.actualAdapterResponseShapeW265(submitRaw, {
    phase: 'submit',
    idempotencyToken: 'motion-w283-token'
  });
  const contractSubmitShape = responseShapes.normalizeResponseShape(submitRaw, {
    phase: 'submit',
    idempotencyToken: 'motion-w283-token'
  });
  const drawerPendingShape = hooks.actualAdapterResponseShapeW265(pendingRaw, {
    phase: 'refresh',
    runnerTaskId: 'runner-w283-motion-001',
    idempotencyToken: 'motion-w283-token'
  });
  const contractPendingShape = responseShapes.normalizeResponseShape(pendingRaw, {
    phase: 'refresh',
    runnerTaskId: 'runner-w283-motion-001',
    idempotencyToken: 'motion-w283-token'
  });
  const drawerCompletedShape = hooks.actualAdapterResponseShapeW265(completedRaw, {
    phase: 'refresh',
    runnerTaskId: 'runner-w283-motion-001',
    idempotencyToken: 'motion-w283-token'
  });
  const contractCompletedShape = responseShapes.normalizeResponseShape(completedRaw, {
    phase: 'refresh',
    runnerTaskId: 'runner-w283-motion-001',
    idempotencyToken: 'motion-w283-token'
  });
  const drawerMalformedShape = hooks.actualAdapterResponseShapeW265(malformedRaw, {
    phase: 'refresh',
    runnerTaskId: 'runner-w283-motion-001',
    idempotencyToken: 'motion-w283-token'
  });
  const contractMalformedShape = responseShapes.normalizeResponseShape(malformedRaw, {
    phase: 'refresh',
    runnerTaskId: 'runner-w283-motion-001',
    idempotencyToken: 'motion-w283-token'
  });
  const nestedAliasRaw = {
    ok: true,
    payload: {
      status: 'done',
      queue: { taskId: 'runner-w283-nested-001' },
      idempotency_key: 'nested-body-token',
      resultCapture: {
        status: 'completed_result_capture_ready',
        generatedNamesJson: completedResult
      }
    }
  };
  const drawerNestedShape = hooks.actualAdapterResponseShapeW265(nestedAliasRaw, {
    phase: 'refresh',
    idempotencyToken: 'motion-w283-token'
  });
  const contractNestedShape = responseShapes.normalizeResponseShape(nestedAliasRaw, {
    phase: 'refresh',
    idempotencyToken: 'motion-w283-token'
  });
  const completedGuard = hooks.validateDccFinalNamingImportPayload(contractCompletedShape.finalGeneratedNamesJson, state, context.lane, context.page, context.recommendation);
  const semanticGuard = hooks.completedRunnerResultSemanticGuardW214(completedGuard.finalNaming, state, context.lane, contractCompletedShape.finalGeneratedNamesJson);
  const normalizedImport = hooks.canonicalImportResultNormalizationW245(contractCompletedShape.finalGeneratedNamesJson, state, context.lane, context.page, context.recommendation);
  const submitCalls = [];
  const pollCalls = [];
  const w264Flow = hooks.connectedBuildSubmitRefreshImportW264(state, context.lane, context.page, context.recommendation, {
    executeSubmit: true,
    executePoll: true,
    finishBuild: true,
    submitTransport: (request) => {
      submitCalls.push(request);
      return submitRaw;
    },
    pollTransport: (request) => {
      pollCalls.push(request);
      return completedRaw;
    }
  });
  const retryPolicy = hooks.connectedBuildRetryPolicyW265({
    runnerTaskId: 'runner-w283-motion-001',
    idempotencyToken: 'motion-w283-token',
    completedResultAccepted: true
  });
  const waitingState = motionState(hooks, {
    integratedBuildRunnerResult: {
      schema: 'idb.approved-server-adapter-result-envelope.v1',
      status: 'queued_result_capture_pending',
      queueSubmitted: true,
      runnerTaskId: 'runner-w283-motion-001',
      idempotencyToken: 'motion-w283-token',
      resultCapture: { status: 'pending_runner_completion', runnerTaskId: 'runner-w283-motion-001' }
    }
  });
  const waitingContext = motionContext(hooks, waitingState);
  const waitingHtml = hooks.renderIntegratedBuildRunnerReturnStatus(waitingState, waitingContext.lane, waitingContext.page, waitingContext.recommendation);
  const completedState = motionState(hooks, {
    integratedBuildRunnerResult: {
      schema: 'idb.approved-server-adapter-result-envelope.v1',
      status: 'completed_result_available',
      queueSubmitted: true,
      runnerTaskId: 'runner-w283-motion-001',
      idempotencyToken: 'motion-w283-token',
      finalGeneratedNamesJsonReady: true,
      finalGeneratedNamesJson: completedResult,
      resultCapture: {
        status: 'completed_result_capture_ready',
        runnerTaskId: 'runner-w283-motion-001',
        finalGeneratedNamesJson: completedResult
      }
    }
  });
  const completedContext = motionContext(hooks, completedState);
  const completedHtml = hooks.renderIntegratedBuildRunnerReturnStatus(completedState, completedContext.lane, completedContext.page, completedContext.recommendation);

  assertCase(results, 'connected-build-response-shape-contract-module-exists',
    responseShapes.CONNECTED_BUILD_RESPONSE_SHAPE_SCHEMA_VERSION === 'forge.w283.connected-build-response-shapes.v1' &&
      responseShapes.contractSummary().status === 'contract_ready' &&
      /W283 Connected Build Response Shape Contract Extraction/.test(report) &&
      trace.contractModule === 'src/contracts/connectedBuildResponseShapes.js',
    JSON.stringify(responseShapes.contractSummary()));

  assertCase(results, 'contract-represents-submit-pending-completed-and-error-shapes',
    contractSubmitShape.status === 'submit_task_captured' &&
      contractPendingShape.status === 'refresh_pending' &&
      contractCompletedShape.status === 'completed_result_shape_ready' &&
      contractMalformedShape.status === 'adapter_error_safe_stop' &&
      trace.representedShapes.length === 4,
    JSON.stringify({
      submit: contractSubmitShape.status,
      pending: contractPendingShape.status,
      completed: contractCompletedShape.status,
      malformed: contractMalformedShape.status
    }));

  assertCase(results, 'runner-task-id-aliases-normalize-like-w265',
    shapeParity(drawerSubmitShape, contractSubmitShape) &&
      shapeParity(drawerPendingShape, contractPendingShape) &&
      shapeParity(drawerNestedShape, contractNestedShape) &&
      contractNestedShape.runnerTaskId === 'runner-w283-nested-001' &&
      trace.representedAliases.runnerTaskId.indexOf('body.queue.taskId') >= 0,
    JSON.stringify({ drawerNestedShape, contractNestedShape }));

  assertCase(results, 'idempotency-token-aliases-normalize-like-w265',
    contractSubmitShape.idempotencyToken === drawerSubmitShape.idempotencyToken &&
      contractSubmitShape.idempotencyToken === 'motion-w283-token' &&
      contractNestedShape.idempotencyToken === drawerNestedShape.idempotencyToken &&
      contractNestedShape.idempotencyToken === 'motion-w283-token' &&
      trace.representedAliases.idempotencyToken.indexOf('body.idempotency_key') >= 0,
    JSON.stringify({ drawerSubmitShape, contractSubmitShape, drawerNestedShape, contractNestedShape }));

  assertCase(results, 'final-generated-names-location-detection-field-compatible-with-w265',
    shapeParity(drawerCompletedShape, contractCompletedShape) &&
      contractCompletedShape.finalGeneratedNamesJsonLocation === 'resultCapture.finalGeneratedNamesJson' &&
      contractCompletedShape.finalGeneratedNamesJsonReady === true &&
      contractNestedShape.finalGeneratedNamesJsonLocation === 'resultCapture.generatedNamesJson' &&
      trace.representedAliases.finalGeneratedNamesJson.indexOf('body.resultCapture.generatedNamesJson') >= 0,
    JSON.stringify({
      drawerLocation: drawerCompletedShape.finalGeneratedNamesJsonLocation,
      contractLocation: contractCompletedShape.finalGeneratedNamesJsonLocation,
      nestedLocation: contractNestedShape.finalGeneratedNamesJsonLocation
    }));

  assertCase(results, 'completed-response-shape-does-not-bypass-w151-w214-w245-validation',
    contractCompletedShape.status === 'completed_result_shape_ready' &&
      contractCompletedShape.guardrails.w245W151ValidationStillRequired === true &&
      contractCompletedShape.guardrails.cannotDeclareImportValid === true &&
      responseShapes.contractSummary().validationBoundary.responseShapeMayLocateCompletedJsonButCannotDeclareImportValid === true &&
      completedGuard.valid === true &&
      semanticGuard.valid === true &&
      normalizedImport.status === 'display_ready_records_normalized' &&
      trace.validationBoundary.w151OwnsImportValidity === true,
    JSON.stringify({
      contractStatus: contractCompletedShape.status,
      completedGuardStatus: completedGuard.status,
      semanticGuardStatus: semanticGuard.status,
      normalizedImportStatus: normalizedImport.status
    }));

  assertCase(results, 'malformed-error-response-shows-safe-copy-without-fake-links',
    shapeParity(drawerMalformedShape, contractMalformedShape) &&
      contractMalformedShape.adapterSafeErrorCopy === 'Build stopped safely, ask admin.' &&
      contractMalformedShape.normalUiCopy === 'Build stopped safely, ask admin.' &&
      contractMalformedShape.normalizedResponse.activeOpenLinks === 0 &&
      contractMalformedShape.guardrails.normalUiHidesRawEvidence === true,
    JSON.stringify(contractMalformedShape));

  assertCase(results, 'drawer-self-contained-no-runtime-contract-loading-side-effects',
    !/require\(['\"][^'\"]*connectedBuildResponseShapes/.test(userscript) &&
      !/src\/contracts\/connectedBuildResponseShapes\.js/.test(userscript) &&
      trace.runtimeBoundary.drawerSelfContained === true &&
      trace.runtimeBoundary.noRuntimeRequireAdded === true &&
      trace.runtimeBoundary.noExternalDependencyAdded === true &&
      trace.runtimeBoundary.noBundlerRequirementAdded === true &&
      trace.runtimeBoundary.noNetworkDependencyAdded === true &&
      trace.runtimeBoundary.noStorageWriteAddedForContractLoading === true,
    JSON.stringify(trace.runtimeBoundary));

  assertCase(results, 'w282-boundary-inventory-remains-available-and-unchanged',
    w282Trace.schema === 'forge.w282.connected-build-boundary-inventory.trace.v1' &&
      w282Trace.selectedFutureMicroSlice.id === 'connected_build_response_shape_contract_prepare' &&
      w282Trace.selectedFutureMicroSlice.targetContractOrProposedModule === 'src/contracts/connectedBuildResponseShapes.js' &&
      trace.continuity.w282BoundaryInventoryAvailable === true,
    JSON.stringify(w282Trace.selectedFutureMicroSlice));

  assertCase(results, 'w281-adapter-profile-readiness-migration-remains-available',
    w281Trace.schema === 'forge.w281.adapter-profile-readiness-contract-migration.trace.v1' &&
      trace.continuity.w281AdapterProfileReadinessMigrationPreserved === true,
    JSON.stringify({ w281Schema: w281Trace.schema }));

  assertCase(results, 'w264-submit-refresh-import-remains-unchanged',
    submitCalls.length === 1 &&
      pollCalls.length === 1 &&
      w264Flow.status === 'records_imported' &&
      w264Flow.endpointUrl === 'https://td3021666.app.netsuite.com/app/site/hosting/scriptlet.nl?script=6702&deploy=2' &&
      w264Flow.completedResultGuard.completedResultAcceptedByW151 === true &&
      w264Flow.importedRecords.length >= 4 &&
      trace.continuity.w264SubmitRefreshImportChanged === false,
    JSON.stringify({ status: w264Flow.status, endpointUrl: w264Flow.endpointUrl, importedRecords: w264Flow.importedRecords.length }));

  assertCase(results, 'w265-retry-safety-remains-unchanged',
    retryPolicy.duplicateSubmit.allowed === false &&
      retryPolicy.duplicateSubmit.createsSecondBuild === false &&
      retryPolicy.duplicateSubmit.idempotencyPreserved === true &&
      retryPolicy.afterAdapterError.allowedAutomatically === false &&
      retryPolicy.finishBuild.allowed === true &&
      trace.continuity.w265RetrySafetyChanged === false,
    JSON.stringify(retryPolicy));

  assertCase(results, 'returned-records-open-links-and-fake-link-blocking-preserved',
    w264Flow.importedRecords.some((record) => record.name === 'Motion Branch Fulfillment SKU' && /Product SKU/i.test(record.label)) &&
      w264Flow.importedRecords.some((record) => record.name === 'Motion Availability Proof Flow' && /Availability|Replenishment/i.test(record.label)) &&
      w264Flow.importedRecords.every((record) => record.linkAuthority && record.linkAuthority.openable === true && /^https:\/\/td3021666\.app\.netsuite\.com\//.test(record.openUrl)) &&
      w264Flow.refresh.resultImportGuard.activeOpenLinksBeforeImport === 0 &&
      /Finish build/.test(completedHtml) &&
      !/Open<\/a>/.test(waitingHtml) &&
      trace.continuity.returnedRecordsOpenLinksChanged === false &&
      trace.continuity.fakeLinkBlockingChanged === false,
    w264Flow.importedRecords.map((record) => `${record.label}:${record.name}:${record.openUrl}`).join(' | '));

  assertCase(results, 'normal-consultant-ui-hides-endpoint-profile-raw-admin-diagnostics',
    /Refresh build status/.test(waitingHtml) &&
      /Finish build/.test(completedHtml) &&
      !/script=6702|deploy=2|customdeployidb_governed_runner_adapter|td3021666\.app\.netsuite\.com|runnerTaskId|raw json|schema|stack trace|admin diagnostics|transport boundary|operator gate|server flags/i.test(waitingHtml + completedHtml) &&
      trace.guardrails.normalConsultantUiHidesEndpointRawTaskSchemaStackAdminDiagnostics === true,
    (waitingHtml + completedHtml).slice(0, 1400));

  assertCase(results, 'no-runtime-authority-changes-introduced',
    trace.guardrails.runtimeBehaviorChanged === false &&
      trace.guardrails.connectedBuildFlowChanged === false &&
      trace.guardrails.recordCreationAuthorityChanged === false &&
      trace.guardrails.noDrawerCreatedRecords === true &&
      trace.guardrails.noDrawerTransactionWrites === true &&
      trace.guardrails.approvedServerAdapterPathOnly === true &&
      trace.guardrails.noW144DeploymentUpdateInThisBlock === true &&
      w264Flow.guardrails.noDrawerCreatedRecords === true &&
      w264Flow.guardrails.noDrawerTransactionWrites === true,
    JSON.stringify({ traceGuardrails: trace.guardrails, flowGuardrails: w264Flow.guardrails }));

  assertCase(results, 'w283-harness-and-check-registration-present',
    packageJson.scripts['harness:connected-build-response-shape-contract-w283'] === 'node archive/tools/run_w283_connected_build_response_shape_contract_harness.js' &&
      packageJson.scripts.check.indexOf('src/contracts/connectedBuildResponseShapes.js') >= 0 &&
      packageJson.scripts.check.indexOf('archive/tools/run_w283_connected_build_response_shape_contract_harness.js') >= 0,
    JSON.stringify(packageJson.scripts['harness:connected-build-response-shape-contract-w283']));

  printResults('W283 connected build response shape contract harness', results);
}

main();
