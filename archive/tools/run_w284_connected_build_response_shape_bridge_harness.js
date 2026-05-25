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
  const hooks = loadHooks({ fetchMessage: 'live fetch disabled in W284 harness' });
  const userscript = read(userscriptPath);
  const packageJson = JSON.parse(readRepoFile('package.json'));
  const report = readArchiveText('reports', 'w284_connected_build_response_shape_bridge.md');
  const trace = readArchiveJson('trace_samples', 'w284_connected_build_response_shape_bridge_trace.json');
  const w283Trace = readArchiveJson('trace_samples', 'w283_connected_build_response_shape_contract_trace.json');
  const w282Trace = readArchiveJson('trace_samples', 'w282_connected_build_boundary_inventory_trace.json');
  const w281Trace = readArchiveJson('trace_samples', 'w281_adapter_profile_readiness_contract_migration_trace.json');
  const state = motionState(hooks);
  const context = motionContext(hooks, state);
  const completedResult = completedMotionResult({ prefix: '284' });
  const submitRaw = submitResponse('runner-w284-motion-001', 'motion-w284-token');
  const pendingRaw = pendingRefreshResponse('runner-w284-motion-001');
  const completedRaw = completedRefreshResponse('runner-w284-motion-001', completedResult);
  const malformedRaw = { status: 'adapter_error', error: true, resultCapture: { status: 'adapter_error', error: true } };
  const submitOptions = { phase: 'submit', idempotencyToken: 'motion-w284-token' };
  const refreshOptions = { phase: 'refresh', runnerTaskId: 'runner-w284-motion-001', idempotencyToken: 'motion-w284-token' };
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
      queue: { taskId: 'runner-w284-nested-001' },
      idempotency_key: 'nested-body-token',
      resultCapture: {
        status: 'completed_result_capture_ready',
        generatedNamesJson: completedResult
      }
    }
  };
  const drawerNestedShape = hooks.actualAdapterResponseShapeW265(nestedAliasRaw, { phase: 'refresh', idempotencyToken: 'motion-w284-token' });
  const nestedValidation = responseBridge.validateResponseShape(drawerNestedShape, nestedAliasRaw, { phase: 'refresh', idempotencyToken: 'motion-w284-token' });
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
    runnerTaskId: 'runner-w284-motion-001',
    idempotencyToken: 'motion-w284-token',
    completedResultAccepted: true
  });
  const waitingState = motionState(hooks, {
    integratedBuildRunnerResult: {
      schema: 'idb.approved-server-adapter-result-envelope.v1',
      status: 'queued_result_capture_pending',
      queueSubmitted: true,
      runnerTaskId: 'runner-w284-motion-001',
      idempotencyToken: 'motion-w284-token',
      resultCapture: { status: 'pending_runner_completion', runnerTaskId: 'runner-w284-motion-001' }
    }
  });
  const waitingContext = motionContext(hooks, waitingState);
  const waitingHtml = hooks.renderIntegratedBuildRunnerReturnStatus(waitingState, waitingContext.lane, waitingContext.page, waitingContext.recommendation);
  const completedState = motionState(hooks, {
    integratedBuildRunnerResult: {
      schema: 'idb.approved-server-adapter-result-envelope.v1',
      status: 'completed_result_available',
      queueSubmitted: true,
      runnerTaskId: 'runner-w284-motion-001',
      idempotencyToken: 'motion-w284-token',
      finalGeneratedNamesJsonReady: true,
      finalGeneratedNamesJson: completedResult,
      resultCapture: {
        status: 'completed_result_capture_ready',
        runnerTaskId: 'runner-w284-motion-001',
        finalGeneratedNamesJson: completedResult
      }
    }
  });
  const completedContext = motionContext(hooks, completedState);
  const completedHtml = hooks.renderIntegratedBuildRunnerReturnStatus(completedState, completedContext.lane, completedContext.page, completedContext.recommendation);

  assertCase(results, 'connected-build-response-shape-bridge-exists',
    responseBridge.CONNECTED_BUILD_RESPONSE_SHAPE_BRIDGE_SCHEMA_VERSION === 'forge.w284.connected-build-response-shape-bridge.v1' &&
      responseBridge.exportedContractSummary().status === 'bridge_contract_ready' &&
      /W284 Connected Build Response Shape Bridge/.test(report) &&
      trace.bridgeModule === 'src/contracts/connectedBuildResponseShapeBridge.js',
    JSON.stringify(responseBridge.exportedContractSummary()));

  assertCase(results, 'bridge-validates-against-w283-response-shape-contract',
    bridge.status === 'bridge_ready' &&
      bridge.governingContract === responseShapes.CONNECTED_BUILD_RESPONSE_SHAPE_SCHEMA_VERSION &&
      bridge.actualShapeSchema === responseShapes.ACTUAL_ADAPTER_RESPONSE_SHAPE_SCHEMA &&
      trace.governingContract === 'src/contracts/connectedBuildResponseShapes.js',
    JSON.stringify({ bridgeStatus: bridge.status, governingContract: bridge.governingContract }));

  assertCase(results, 'submit-pending-completed-and-error-shapes-field-compatible',
    bridge.validations.length === 4 &&
      bridge.validations.every(allFieldCompatible) &&
      bridge.validations.map((item) => item.contractStatus).join('|') === 'submit_task_captured|refresh_pending|completed_result_shape_ready|adapter_error_safe_stop' &&
      trace.validatedShapes.length === 4,
    JSON.stringify(bridge.validations.map((item) => ({ phase: item.phase, status: item.status, contractStatus: item.contractStatus }))));

  assertCase(results, 'runner-id-idempotency-and-completed-json-aliases-field-compatible',
    nestedValidation.status === 'field_compatible' &&
      nestedValidation.contractShape.runnerTaskId === 'runner-w284-nested-001' &&
      nestedValidation.contractShape.idempotencyToken === 'motion-w284-token' &&
      nestedValidation.contractShape.finalGeneratedNamesJsonLocation === 'resultCapture.generatedNamesJson' &&
      trace.comparedFields.indexOf('runnerTaskId') >= 0 &&
      trace.comparedFields.indexOf('idempotencyToken') >= 0 &&
      trace.comparedFields.indexOf('finalGeneratedNamesJsonLocation') >= 0,
    JSON.stringify(nestedValidation));

  assertCase(results, 'completed-shape-parity-does-not-bypass-w151-w214-w245-validation',
    bridge.validations[2].contractStatus === 'completed_result_shape_ready' &&
      bridge.validations[2].guardrails.contractCannotDeclareImportValid === true &&
      bridge.validationBoundary.bridgeCannotDeclareImportValid === true &&
      completedGuard.valid === true &&
      semanticGuard.valid === true &&
      normalizedImport.status === 'display_ready_records_normalized' &&
      trace.validationBoundary.w151OwnsImportValidity === true &&
      trace.validationBoundary.w214OwnsSemanticGuard === true &&
      trace.validationBoundary.w245OwnsCanonicalImportNormalization === true,
    JSON.stringify({
      bridgeValidation: bridge.validations[2],
      completedGuard: completedGuard.status,
      semanticGuard: semanticGuard.status,
      normalizedImport: normalizedImport.status
    }));

  assertCase(results, 'malformed-error-parity-keeps-safe-copy-and-no-fake-links',
    bridge.validations[3].contractStatus === 'adapter_error_safe_stop' &&
      bridge.validations[3].contractShape.adapterSafeErrorCopy === 'Build stopped safely, ask admin.' &&
      bridge.validations[3].contractShape.normalUiCopy === 'Build stopped safely, ask admin.' &&
      bridge.validations[3].contractShape.normalizedResponse.activeOpenLinks === 0 &&
      bridge.validations[3].guardrails.contractCannotDeclareImportValid === true,
    JSON.stringify(bridge.validations[3]));

  assertCase(results, 'raw-evidence-archived-admin-only-and-hidden-from-normal-ui',
    bridge.validations.every((item) => item.rawEvidencePolicy.drawerAdminOnly === true &&
      item.rawEvidencePolicy.drawerArchivedOnly === true &&
      item.rawEvidencePolicy.contractAdminOnly === true &&
      item.rawEvidencePolicy.contractArchivedOnly === true &&
      item.rawEvidencePolicy.hiddenFromNormalConsultantUi === true) &&
      trace.rawEvidencePolicy.archiveOnly === true &&
      trace.rawEvidencePolicy.hiddenFromNormalConsultantUi === true,
    JSON.stringify(bridge.validations.map((item) => item.rawEvidencePolicy)));

  assertCase(results, 'drawer-self-contained-no-runtime-bridge-or-contract-loading-side-effects',
    !/require\(['\"][^'\"]*connectedBuildResponseShapeBridge/.test(userscript) &&
      !/require\(['\"][^'\"]*connectedBuildResponseShapes/.test(userscript) &&
      !/src\/contracts\/connectedBuildResponseShapeBridge\.js/.test(userscript) &&
      !/src\/contracts\/connectedBuildResponseShapes\.js/.test(userscript) &&
      trace.runtimeBoundary.bridgeNotWiredIntoDrawerRuntime === true &&
      trace.runtimeBoundary.drawerSelfContained === true &&
      trace.runtimeBoundary.noRuntimeRequireAdded === true &&
      trace.runtimeBoundary.noExternalDependencyAdded === true &&
      trace.runtimeBoundary.noBundlerRequirementAdded === true &&
      trace.runtimeBoundary.noNetworkDependencyAdded === true &&
      trace.runtimeBoundary.noStorageWriteAddedForBridgeLoading === true,
    JSON.stringify(trace.runtimeBoundary));

  assertCase(results, 'w283-w282-w281-continuity-remains-available',
    w283Trace.schema === 'forge.w283.connected-build-response-shape-contract.trace.v1' &&
      w282Trace.schema === 'forge.w282.connected-build-boundary-inventory.trace.v1' &&
      w281Trace.schema === 'forge.w281.adapter-profile-readiness-contract-migration.trace.v1' &&
      trace.continuity.w283ResponseShapeContractAvailable === true &&
      trace.continuity.w282BoundaryInventoryAvailable === true &&
      trace.continuity.w281AdapterProfileReadinessMigrationPreserved === true,
    JSON.stringify({ w283: w283Trace.schema, w282: w282Trace.schema, w281: w281Trace.schema }));

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
    bridge.runtimeBoundary.noSubmitExecutionMoved === true &&
      bridge.runtimeBoundary.noRefreshExecutionMoved === true &&
      trace.guardrails.runtimeBehaviorChanged === false &&
      trace.guardrails.connectedBuildFlowChanged === false &&
      trace.guardrails.recordCreationAuthorityChanged === false &&
      trace.guardrails.noDrawerCreatedRecords === true &&
      trace.guardrails.noDrawerTransactionWrites === true &&
      trace.guardrails.approvedServerAdapterPathOnly === true &&
      trace.guardrails.noW144DeploymentUpdateInThisBlock === true &&
      w264Flow.guardrails.noDrawerCreatedRecords === true &&
      w264Flow.guardrails.noDrawerTransactionWrites === true,
    JSON.stringify({ bridgeRuntimeBoundary: bridge.runtimeBoundary, traceGuardrails: trace.guardrails }));

  assertCase(results, 'w284-harness-and-check-registration-present',
    packageJson.scripts['harness:connected-build-response-shape-bridge-w284'] === 'node archive/tools/run_w284_connected_build_response_shape_bridge_harness.js' &&
      packageJson.scripts.check.indexOf('src/contracts/connectedBuildResponseShapeBridge.js') >= 0 &&
      packageJson.scripts.check.indexOf('archive/tools/run_w284_connected_build_response_shape_bridge_harness.js') >= 0,
    JSON.stringify(packageJson.scripts['harness:connected-build-response-shape-bridge-w284']));

  printResults('W284 connected build response shape bridge harness', results);
}

main();
