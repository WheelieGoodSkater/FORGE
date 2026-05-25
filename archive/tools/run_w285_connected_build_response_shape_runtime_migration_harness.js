#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const responseShapes = require('../../src/contracts/connectedBuildResponseShapes');
const responseBridge = require('../../src/contracts/connectedBuildResponseShapeBridge');
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

function allFieldCompatible(validation) {
  return validation && validation.status === 'field_compatible' &&
    validation.fieldComparisons.every((item) => item.fieldCompatible) &&
    validation.normalizedStatusComparison.fieldCompatible === true;
}

function main() {
  const results = [];
  const hooks = loadHooks({ fetchMessage: 'live fetch disabled in W285 harness' });
  const userscript = read(userscriptPath);
  const packageJson = JSON.parse(readRepoFile('package.json'));
  const report = readArchiveText('reports', 'w285_connected_build_response_shape_runtime_migration.md');
  const trace = readArchiveJson('trace_samples', 'w285_connected_build_response_shape_runtime_migration_trace.json');
  const w284Trace = readArchiveJson('trace_samples', 'w284_connected_build_response_shape_bridge_trace.json');
  const w283Trace = readArchiveJson('trace_samples', 'w283_connected_build_response_shape_contract_trace.json');
  const w282Trace = readArchiveJson('trace_samples', 'w282_connected_build_boundary_inventory_trace.json');
  const w281Trace = readArchiveJson('trace_samples', 'w281_adapter_profile_readiness_contract_migration_trace.json');
  const state = motionState(hooks);
  const context = motionContext(hooks, state);
  const completedResult = completedMotionResult({ prefix: '285' });
  const submitRaw = submitResponse('runner-w285-motion-001', 'motion-w285-token');
  const pendingRaw = pendingRefreshResponse('runner-w285-motion-001');
  const completedRaw = completedRefreshResponse('runner-w285-motion-001', completedResult);
  const malformedRaw = { status: 'adapter_error', error: true, resultCapture: { status: 'adapter_error', error: true } };
  const submitOptions = { phase: 'submit', idempotencyToken: 'motion-w285-token' };
  const refreshOptions = { phase: 'refresh', runnerTaskId: 'runner-w285-motion-001', idempotencyToken: 'motion-w285-token' };
  const drawerSubmitShape = hooks.actualAdapterResponseShapeW265(submitRaw, submitOptions);
  const drawerPendingShape = hooks.actualAdapterResponseShapeW265(pendingRaw, refreshOptions);
  const drawerCompletedShape = hooks.actualAdapterResponseShapeW265(completedRaw, refreshOptions);
  const drawerMalformedShape = hooks.actualAdapterResponseShapeW265(malformedRaw, refreshOptions);
  const bridge = responseBridge.bridgeResponseShapes({
    submit: { drawerShape: drawerSubmitShape, rawResponse: submitRaw, options: submitOptions },
    pendingRefresh: { drawerShape: drawerPendingShape, rawResponse: pendingRaw, options: refreshOptions },
    completedRefresh: { drawerShape: drawerCompletedShape, rawResponse: completedRaw, options: refreshOptions },
    malformedOrError: { drawerShape: drawerMalformedShape, rawResponse: malformedRaw, options: refreshOptions }
  });
  const nestedAliasRaw = {
    ok: true,
    payload: {
      status: 'done',
      queue: { taskId: 'runner-w285-nested-001' },
      idempotency_key: 'nested-body-token',
      resultCapture: {
        status: 'completed_result_capture_ready',
        generatedNamesJson: completedResult
      }
    }
  };
  const nestedOptions = { phase: 'refresh', idempotencyToken: 'motion-w285-token' };
  const drawerNestedShape = hooks.actualAdapterResponseShapeW265(nestedAliasRaw, nestedOptions);
  const nestedValidation = responseBridge.validateResponseShape(drawerNestedShape, nestedAliasRaw, nestedOptions);
  const directCompleted = hooks.connectedBuildCompletedJsonFromActualResponseW285(
    nestedAliasRaw,
    nestedAliasRaw.payload.resultCapture,
    nestedAliasRaw.payload,
    nestedAliasRaw.payload.resultCapture
  );
  const directRunnerTaskId = hooks.connectedBuildRunnerTaskIdFromActualResponseW285(
    nestedAliasRaw,
    nestedAliasRaw.payload.resultCapture,
    nestedAliasRaw.payload,
    nestedAliasRaw.payload.resultCapture,
    nestedOptions
  );
  const directIdempotency = hooks.connectedBuildIdempotencyTokenFromActualResponseW285(
    nestedAliasRaw,
    nestedAliasRaw.payload.resultCapture,
    nestedAliasRaw.payload,
    nestedOptions
  );
  const completedGuard = hooks.validateDccFinalNamingImportPayload(drawerCompletedShape.finalGeneratedNamesJson, state, context.lane, context.page, context.recommendation);
  const semanticGuard = hooks.completedRunnerResultSemanticGuardW214(completedGuard.finalNaming, state, context.lane, drawerCompletedShape.finalGeneratedNamesJson);
  const normalizedImport = hooks.canonicalImportResultNormalizationW245(drawerCompletedShape.finalGeneratedNamesJson, state, context.lane, context.page, context.recommendation);
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
    runnerTaskId: 'runner-w285-motion-001',
    idempotencyToken: 'motion-w285-token',
    completedResultAccepted: true
  });
  const waitingState = motionState(hooks, {
    integratedBuildRunnerResult: {
      schema: 'idb.approved-server-adapter-result-envelope.v1',
      status: 'queued_result_capture_pending',
      queueSubmitted: true,
      runnerTaskId: 'runner-w285-motion-001',
      idempotencyToken: 'motion-w285-token',
      resultCapture: { status: 'pending_runner_completion', runnerTaskId: 'runner-w285-motion-001' }
    }
  });
  const waitingContext = motionContext(hooks, waitingState);
  const waitingHtml = hooks.renderIntegratedBuildRunnerReturnStatus(waitingState, waitingContext.lane, waitingContext.page, waitingContext.recommendation);
  const completedState = motionState(hooks, {
    integratedBuildRunnerResult: {
      schema: 'idb.approved-server-adapter-result-envelope.v1',
      status: 'completed_result_available',
      queueSubmitted: true,
      runnerTaskId: 'runner-w285-motion-001',
      idempotencyToken: 'motion-w285-token',
      finalGeneratedNamesJsonReady: true,
      finalGeneratedNamesJson: completedResult,
      resultCapture: {
        status: 'completed_result_capture_ready',
        runnerTaskId: 'runner-w285-motion-001',
        finalGeneratedNamesJson: completedResult
      }
    }
  });
  const completedContext = motionContext(hooks, completedState);
  const completedHtml = hooks.renderIntegratedBuildRunnerReturnStatus(completedState, completedContext.lane, completedContext.page, completedContext.recommendation);

  assertCase(results, 'w285-runtime-migration-artifacts-exist',
    /W285 Connected Build Response Shape Runtime Migration/.test(report) &&
      trace.schema === 'forge.w285.connected-build-response-shape-runtime-migration.trace.v1' &&
      trace.status === 'runtime_migration_parity_ready',
    JSON.stringify({ report: /W285/.test(report), trace: trace.status }));

  assertCase(results, 'selected-source-anchors-present-or-mapped',
    /function actualAdapterResponseShapeW265/.test(userscript) &&
      /function normalizeApprovedServerAdapterTransportResponseV1/.test(userscript) &&
      /function connectedBuildRetryPolicyW265/.test(userscript) &&
      /function connectedBuildSubmitRefreshImportW264/.test(userscript) &&
      /CONNECTED_BUILD_RESPONSE_SHAPE_STATUSES_W285/.test(userscript) &&
      /CONNECTED_BUILD_COMPLETED_JSON_LOCATION_CANDIDATES_W285/.test(userscript) &&
      /connectedBuildResponseShapeStatusW285/.test(userscript) &&
      !/const normalCopyByStatus = \{/.test(userscript) &&
      !/const completedJsonLocations = \[/.test(userscript) &&
      trace.migratedHelperAnchors.indexOf('connectedBuildResponseShapeStatusW285') >= 0,
    JSON.stringify(trace.migratedHelperAnchors));

  assertCase(results, 'submit-response-aliases-preserve-runner-task-and-idempotency',
    drawerSubmitShape.status === 'submit_task_captured' &&
      drawerSubmitShape.runnerTaskId === 'runner-w285-motion-001' &&
      drawerSubmitShape.idempotencyToken === 'motion-w285-token' &&
      drawerSubmitShape.normalUiCopy === 'Build submitted.' &&
      responseShapes.normalizeResponseShape(submitRaw, submitOptions).runnerTaskId === drawerSubmitShape.runnerTaskId,
    JSON.stringify(drawerSubmitShape));

  assertCase(results, 'pending-refresh-aliases-preserve-waiting-behavior',
    drawerPendingShape.status === 'refresh_pending' &&
      drawerPendingShape.runnerTaskId === 'runner-w285-motion-001' &&
      drawerPendingShape.finalGeneratedNamesJsonReady === false &&
      drawerPendingShape.normalUiCopy === 'Still building.' &&
      drawerPendingShape.normalizedResponse.status === 'polling_pending',
    JSON.stringify(drawerPendingShape));

  assertCase(results, 'completed-refresh-aliases-locate-json-without-import-validity',
    drawerCompletedShape.status === 'completed_result_shape_ready' &&
      drawerCompletedShape.finalGeneratedNamesJsonReady === true &&
      drawerCompletedShape.finalGeneratedNamesJsonLocation === 'resultCapture.finalGeneratedNamesJson' &&
      drawerCompletedShape.guardrails.w245W151ValidationStillRequired === true &&
      drawerCompletedShape.normalUiCopy === 'Records ready.' &&
      completedGuard.valid === true,
    JSON.stringify({ completedShape: drawerCompletedShape.status, guard: completedGuard.status }));

  assertCase(results, 'malformed-error-aliases-keep-safe-stop-copy-and-no-fake-links',
    drawerMalformedShape.status === 'adapter_error_safe_stop' &&
      drawerMalformedShape.adapterSafeErrorCopy === 'Build stopped safely, ask admin.' &&
      drawerMalformedShape.normalUiCopy === 'Build stopped safely, ask admin.' &&
      drawerMalformedShape.normalizedResponse.activeOpenLinks === 0 &&
      drawerMalformedShape.guardrails.w245W151ValidationStillRequired === true,
    JSON.stringify(drawerMalformedShape));

  assertCase(results, 'w285-pure-helper-aliases-match-w283-w284-shape',
    directCompleted.location === 'resultCapture.generatedNamesJson' &&
      directCompleted.ready === true &&
      directRunnerTaskId === 'runner-w285-nested-001' &&
      directIdempotency === 'motion-w285-token' &&
      nestedValidation.status === 'field_compatible' &&
      nestedValidation.contractShape.finalGeneratedNamesJsonLocation === 'resultCapture.generatedNamesJson',
    JSON.stringify({ directCompleted, directRunnerTaskId, directIdempotency, nestedValidation: nestedValidation.status }));

  assertCase(results, 'w284-bridge-remains-field-compatible-after-migration',
    bridge.status === 'bridge_ready' &&
      bridge.validations.length === 4 &&
      bridge.validations.every(allFieldCompatible) &&
      bridge.validations.map((item) => item.contractStatus).join('|') === 'submit_task_captured|refresh_pending|completed_result_shape_ready|adapter_error_safe_stop' &&
      trace.continuity.w284BridgeAvailable === true,
    JSON.stringify(bridge.validations.map((item) => ({ phase: item.phase, status: item.status, contractStatus: item.contractStatus }))));

  assertCase(results, 'completed-shape-parity-does-not-bypass-w151-w214-w245',
    bridge.validations[2].guardrails.contractCannotDeclareImportValid === true &&
      bridge.validationBoundary.bridgeCannotDeclareImportValid === true &&
      completedGuard.valid === true &&
      semanticGuard.valid === true &&
      normalizedImport.status === 'display_ready_records_normalized' &&
      trace.validationBoundary.w151OwnsImportValidity === true &&
      trace.validationBoundary.w214OwnsSemanticGuard === true &&
      trace.validationBoundary.w245OwnsCanonicalImportNormalization === true,
    JSON.stringify({ completedGuard: completedGuard.status, semanticGuard: semanticGuard.status, normalizedImport: normalizedImport.status }));

  assertCase(results, 'actual-submit-and-refresh-execution-remain-drawer-owned',
    submitCalls.length === 1 &&
      pollCalls.length === 1 &&
      w264Flow.status === 'records_imported' &&
      w264Flow.completedResultGuard.completedResultAcceptedByW151 === true &&
      trace.runtimeBoundary.actualSubmitExecutionMoved === false &&
      trace.runtimeBoundary.actualRefreshExecutionMoved === false &&
      trace.runtimeBoundary.finishBuildImportMoved === false,
    JSON.stringify({ submitCalls: submitCalls.length, pollCalls: pollCalls.length, status: w264Flow.status }));

  assertCase(results, 'drawer-self-contained-no-runtime-contract-or-bridge-loading',
    !/require\(['\"][^'\"]*connectedBuildResponseShapeBridge/.test(userscript) &&
      !/require\(['\"][^'\"]*connectedBuildResponseShapes/.test(userscript) &&
      !/src\/contracts\/connectedBuildResponseShapeBridge\.js/.test(userscript) &&
      !/src\/contracts\/connectedBuildResponseShapes\.js/.test(userscript) &&
      trace.runtimeBoundary.drawerSelfContained === true &&
      trace.runtimeBoundary.noRuntimeRequireAdded === true &&
      trace.runtimeBoundary.noExternalDependencyAdded === true &&
      trace.runtimeBoundary.noBundlerRequirementAdded === true &&
      trace.runtimeBoundary.noNetworkDependencyAdded === true &&
      trace.runtimeBoundary.noStorageWriteAddedForContractOrBridgeLoading === true,
    JSON.stringify(trace.runtimeBoundary));

  assertCase(results, 'w284-w283-w282-w281-continuity-remains-available',
    w284Trace.schema === 'forge.w284.connected-build-response-shape-bridge.trace.v1' &&
      w283Trace.schema === 'forge.w283.connected-build-response-shape-contract.trace.v1' &&
      w282Trace.schema === 'forge.w282.connected-build-boundary-inventory.trace.v1' &&
      w281Trace.schema === 'forge.w281.adapter-profile-readiness-contract-migration.trace.v1' &&
      trace.continuity.w284BridgeAvailable === true &&
      trace.continuity.w283ResponseShapeContractAvailable === true &&
      trace.continuity.w282BoundaryInventoryAvailable === true &&
      trace.continuity.w281AdapterProfileReadinessMigrationPreserved === true,
    JSON.stringify({ w284: w284Trace.schema, w283: w283Trace.schema, w282: w282Trace.schema, w281: w281Trace.schema }));

  assertCase(results, 'w264-and-w265-continuity-remain-unchanged',
    w264Flow.status === 'records_imported' &&
      retryPolicy.duplicateSubmit.allowed === false &&
      retryPolicy.duplicateSubmit.createsSecondBuild === false &&
      retryPolicy.duplicateSubmit.idempotencyPreserved === true &&
      retryPolicy.afterAdapterError.allowedAutomatically === false &&
      retryPolicy.finishBuild.allowed === true &&
      trace.continuity.w264SubmitRefreshImportChanged === false &&
      trace.continuity.w265RetrySafetyChanged === false,
    JSON.stringify({ w264: w264Flow.status, retry: retryPolicy }));

  assertCase(results, 'w245-w151-validation-and-returned-records-open-links-preserved',
    completedGuard.valid === true &&
      normalizedImport.displayReadyRecords.length >= 4 &&
      w264Flow.importedRecords.some((record) => record.name === 'Motion Branch Fulfillment SKU' && /Product SKU/i.test(record.label)) &&
      w264Flow.importedRecords.some((record) => record.name === 'Motion Availability Proof Flow' && /Availability|Replenishment/i.test(record.label)) &&
      w264Flow.importedRecords.every((record) => record.linkAuthority && record.linkAuthority.openable === true && /^https:\/\/td3021666\.app\.netsuite\.com\//.test(record.openUrl)) &&
      trace.continuity.w245CanonicalImportChanged === false &&
      trace.continuity.w151ValidationChanged === false &&
      trace.continuity.returnedRecordsOpenLinksChanged === false,
    w264Flow.importedRecords.map((record) => `${record.label}:${record.name}:${record.openUrl}`).join(' | '));

  assertCase(results, 'fake-links-blocked-and-normal-ui-hides-diagnostics',
    /Refresh build status/.test(waitingHtml) &&
      /Finish build/.test(completedHtml) &&
      !/Open<\/a>/.test(waitingHtml) &&
      !/script=6702|deploy=2|customdeployidb_governed_runner_adapter|td3021666\.app\.netsuite\.com|runnerTaskId|raw json|schema|stack trace|admin diagnostics|transport boundary|operator gate|server flags/i.test(waitingHtml + completedHtml) &&
      trace.continuity.fakeLinkBlockingChanged === false &&
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
    JSON.stringify(trace.guardrails));

  assertCase(results, 'w285-harness-and-check-registration-present',
    packageJson.scripts['harness:connected-build-response-shape-runtime-migration-w285'] === 'node archive/tools/run_w285_connected_build_response_shape_runtime_migration_harness.js' &&
      packageJson.scripts.check.indexOf('archive/tools/run_w285_connected_build_response_shape_runtime_migration_harness.js') >= 0,
    JSON.stringify(packageJson.scripts['harness:connected-build-response-shape-runtime-migration-w285']));

  printResults('W285 connected build response shape runtime migration harness', results);
}

main();
