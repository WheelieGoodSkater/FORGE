#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
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

function main() {
  const results = [];
  const hooks = loadHooks({ fetchMessage: 'live fetch disabled in W286 harness' });
  const userscript = read(userscriptPath);
  const packageJson = JSON.parse(readRepoFile('package.json'));
  const report = readArchiveText('reports', 'w286_connected_build_import_guard_boundary_map.md');
  const trace = readArchiveJson('trace_samples', 'w286_connected_build_import_guard_boundary_map_trace.json');
  const w285Trace = readArchiveJson('trace_samples', 'w285_connected_build_response_shape_runtime_migration_trace.json');
  const w284Trace = readArchiveJson('trace_samples', 'w284_connected_build_response_shape_bridge_trace.json');
  const w283Trace = readArchiveJson('trace_samples', 'w283_connected_build_response_shape_contract_trace.json');
  const w282Trace = readArchiveJson('trace_samples', 'w282_connected_build_boundary_inventory_trace.json');
  const w281Trace = readArchiveJson('trace_samples', 'w281_adapter_profile_readiness_contract_migration_trace.json');
  const state = motionState(hooks);
  const context = motionContext(hooks, state);
  const completedResult = completedMotionResult({ prefix: '286' });
  const submitRaw = submitResponse('runner-w286-motion-001', 'motion-w286-token');
  const pendingRaw = pendingRefreshResponse('runner-w286-motion-001');
  const completedRaw = completedRefreshResponse('runner-w286-motion-001', completedResult);
  const refreshOptions = { phase: 'refresh', runnerTaskId: 'runner-w286-motion-001', idempotencyToken: 'motion-w286-token' };
  const completedShape = hooks.actualAdapterResponseShapeW265(completedRaw, refreshOptions);
  const bridgeValidation = responseBridge.validateResponseShape(completedShape, completedRaw, refreshOptions);
  const completedGuard = hooks.validateDccFinalNamingImportPayload(completedShape.finalGeneratedNamesJson, state, context.lane, context.page, context.recommendation);
  const semanticGuard = hooks.completedRunnerResultSemanticGuardW214(completedGuard.finalNaming, state, context.lane, completedShape.finalGeneratedNamesJson);
  const normalizedImport = hooks.canonicalImportResultNormalizationW245(completedShape.finalGeneratedNamesJson, state, context.lane, context.page, context.recommendation);
  const commitWithoutChoice = hooks.completedRunnerResultImportCommitOperatorFlowV1(state, context.lane, context.page, context.recommendation, {
    operatorChoseImport: false,
    pollControl: {
      schema: 'idb.approved-server-adapter-result-poll-control-implementation.v1',
      status: 'poll_control_completed_result_ready_for_w151_import',
      normalizedPollResponse: Object.assign({}, completedShape.normalizedResponse, {
        finalGeneratedNamesJson: completedShape.finalGeneratedNamesJson,
        finalGeneratedNamesJsonReady: true
      }),
      resultImportGuard: {
        importReady: true,
        completedResultAcceptedByW151: true
      }
    },
    completedResultJson: completedShape.finalGeneratedNamesJson
  });
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
    runnerTaskId: 'runner-w286-motion-001',
    idempotencyToken: 'motion-w286-token',
    completedResultAccepted: true
  });
  const waitingState = motionState(hooks, {
    integratedBuildRunnerResult: {
      schema: 'idb.approved-server-adapter-result-envelope.v1',
      status: 'queued_result_capture_pending',
      queueSubmitted: true,
      runnerTaskId: 'runner-w286-motion-001',
      idempotencyToken: 'motion-w286-token',
      resultCapture: { status: 'pending_runner_completion', runnerTaskId: 'runner-w286-motion-001' }
    }
  });
  const waitingContext = motionContext(hooks, waitingState);
  const waitingHtml = hooks.renderIntegratedBuildRunnerReturnStatus(waitingState, waitingContext.lane, waitingContext.page, waitingContext.recommendation);
  const completedState = motionState(hooks, {
    integratedBuildRunnerResult: {
      schema: 'idb.approved-server-adapter-result-envelope.v1',
      status: 'completed_result_available',
      queueSubmitted: true,
      runnerTaskId: 'runner-w286-motion-001',
      idempotencyToken: 'motion-w286-token',
      finalGeneratedNamesJsonReady: true,
      finalGeneratedNamesJson: completedResult,
      resultCapture: {
        status: 'completed_result_capture_ready',
        runnerTaskId: 'runner-w286-motion-001',
        finalGeneratedNamesJson: completedResult
      }
    }
  });
  const completedContext = motionContext(hooks, completedState);
  const completedHtml = hooks.renderIntegratedBuildRunnerReturnStatus(completedState, completedContext.lane, completedContext.page, completedContext.recommendation);

  assertCase(results, 'import-guard-boundary-map-exists',
    /W286 Connected Build Import Guard Boundary Map/.test(report) &&
      trace.schema === 'forge.w286.connected-build-import-guard-boundary-map.trace.v1' &&
      trace.status === 'import_guard_boundary_mapped',
    JSON.stringify({ report: /W286/.test(report), trace: trace.status }));

  assertCase(results, 'boundary-map-includes-required-post-refresh-import-areas',
    [
      'completed_result_json_presence',
      'w151_payload_validation',
      'w214_semantic_guard',
      'w245_canonical_display_ready_import_normalization',
      'finish_build_operator_action',
      'synthetic_poll_control_creation',
      'imported_returned_records',
      'lane_aware_labels_and_supported_open_links',
      'w218_w220_consultant_wording',
      'admin_only_raw_evidence'
    ].every((item) => trace.postRefreshImportBoundaries.indexOf(item) >= 0) &&
      /Completed-result JSON presence/.test(report) &&
      /W151 payload validation/.test(report) &&
      /W214 semantic guard/.test(report) &&
      /W245 canonical display-ready records/.test(report) &&
      /Finish build operator action/.test(report),
    JSON.stringify(trace.postRefreshImportBoundaries));

  assertCase(results, 'w151-w214-w245-finish-build-records-links-wording-separated',
    trace.sourceAnchors.indexOf('validateDccFinalNamingImportPayload') >= 0 &&
      trace.sourceAnchors.indexOf('completedRunnerResultSemanticGuardW214') >= 0 &&
      trace.sourceAnchors.indexOf('canonicalImportResultNormalizationW245') >= 0 &&
      trace.sourceAnchors.indexOf('completedRunnerResultImportCommitOperatorFlowV1') >= 0 &&
      /W218\/W220 consultant wording/.test(report) &&
      /Lane-aware labels and Open-link authority/.test(report),
    JSON.stringify(trace.sourceAnchors));

  assertCase(results, 'selected-future-micro-slice-is-narrow-and-does-not-move-finish-build-mutation',
    trace.selectedFutureMicroSlice.id === 'completed_result_import_eligibility_contract_w287' &&
      trace.selectedFutureMicroSlice.targetContract === 'src/contracts/completedResultImportEligibility.js' &&
      trace.selectedFutureMicroSlice.proposedBridge === 'src/contracts/completedResultImportEligibilityBridge.js' &&
      trace.selectedFutureMicroSlice.movesFinishBuildStateMutation === false &&
      /does not move Finish build state mutation/i.test(report),
    JSON.stringify(trace.selectedFutureMicroSlice));

  assertCase(results, 'selected-slice-includes-source-target-parity-harness-manual-review-rollback',
    trace.selectedFutureMicroSlice.sourceAnchors.length >= 7 &&
      trace.selectedFutureMicroSlice.parityBehavior.length >= 8 &&
      trace.selectedFutureMicroSlice.requiredHarnesses.indexOf('future W287') >= 0 &&
      trace.selectedFutureMicroSlice.manualReviewNotes.some((note) => /Do not move Finish build state mutation/i.test(note)) &&
      /Rollback Plan/.test(report) &&
      /Required Parity Harnesses/.test(report),
    JSON.stringify(trace.selectedFutureMicroSlice));

  assertCase(results, 'w285-response-shape-runtime-migration-remains-field-compatible-with-w284',
    w285Trace.status === 'runtime_migration_parity_ready' &&
      bridgeValidation.status === 'field_compatible' &&
      bridgeValidation.contractStatus === 'completed_result_shape_ready' &&
      completedShape.guardrails.w245W151ValidationStillRequired === true &&
      trace.continuity.w285ResponseShapeRuntimeMigrationAvailable === true,
    JSON.stringify({ w285: w285Trace.status, bridgeValidation: bridgeValidation.status, contractStatus: bridgeValidation.contractStatus }));

  assertCase(results, 'w284-w283-w282-w281-continuity-remains-available',
    w284Trace.schema === 'forge.w284.connected-build-response-shape-bridge.trace.v1' &&
      w283Trace.schema === 'forge.w283.connected-build-response-shape-contract.trace.v1' &&
      w282Trace.schema === 'forge.w282.connected-build-boundary-inventory.trace.v1' &&
      w281Trace.schema === 'forge.w281.adapter-profile-readiness-contract-migration.trace.v1' &&
      trace.continuity.w284ResponseShapeBridgeAvailable === true &&
      trace.continuity.w283ResponseShapeContractAvailable === true &&
      trace.continuity.w282BoundaryInventoryAvailable === true &&
      trace.continuity.w281AdapterProfileReadinessMigrationPreserved === true,
    JSON.stringify({ w284: w284Trace.schema, w283: w283Trace.schema, w282: w282Trace.schema, w281: w281Trace.schema }));

  assertCase(results, 'w264-submit-refresh-import-remains-unchanged',
    submitCalls.length === 1 &&
      pollCalls.length === 1 &&
      w264Flow.status === 'records_imported' &&
      w264Flow.completedResultGuard.completedResultAcceptedByW151 === true &&
      w264Flow.importedRecords.length >= 4 &&
      trace.continuity.w264SubmitRefreshImportChanged === false,
    JSON.stringify({ submitCalls: submitCalls.length, pollCalls: pollCalls.length, status: w264Flow.status }));

  assertCase(results, 'w265-retry-safety-remains-unchanged',
    retryPolicy.duplicateSubmit.allowed === false &&
      retryPolicy.duplicateSubmit.createsSecondBuild === false &&
      retryPolicy.duplicateSubmit.idempotencyPreserved === true &&
      retryPolicy.afterAdapterError.allowedAutomatically === false &&
      retryPolicy.finishBuild.allowed === true &&
      trace.continuity.w265RetrySafetyChanged === false,
    JSON.stringify(retryPolicy));

  assertCase(results, 'w245-w151-w214-validation-remains-unchanged',
    completedGuard.valid === true &&
      completedGuard.status === 'completed_runner_result_accepted' &&
      semanticGuard.valid === true &&
      normalizedImport.status === 'display_ready_records_normalized' &&
      commitWithoutChoice.commitAllowed === false &&
      commitWithoutChoice.blockedReason === 'operator_import_choice_required' &&
      trace.continuity.w245CanonicalImportChanged === false &&
      trace.continuity.w151ValidationChanged === false &&
      trace.continuity.w214SemanticGuardChanged === false,
    JSON.stringify({
      completedGuard: completedGuard.status,
      semanticGuard: semanticGuard.status,
      normalizedImport: normalizedImport.status,
      commitWithoutChoice: commitWithoutChoice.blockedReason
    }));

  assertCase(results, 'returned-record-names-labels-open-links-preserved-after-valid-import',
    w264Flow.importedRecords.some((record) => record.name === 'Motion Branch Fulfillment SKU' && /Product SKU/i.test(record.label)) &&
      w264Flow.importedRecords.some((record) => record.name === 'Motion Availability Proof Flow' && /Availability|Replenishment/i.test(record.label)) &&
      w264Flow.importedRecords.every((record) => record.linkAuthority && record.linkAuthority.openable === true && /^https:\/\/td3021666\.app\.netsuite\.com\//.test(record.openUrl)) &&
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

  assertCase(results, 'w286-harness-and-check-registration-present',
    packageJson.scripts['harness:connected-build-import-guard-boundary-map-w286'] === 'node archive/tools/run_w286_connected_build_import_guard_boundary_map_harness.js' &&
      packageJson.scripts.check.indexOf('archive/tools/run_w286_connected_build_import_guard_boundary_map_harness.js') >= 0,
    JSON.stringify(packageJson.scripts['harness:connected-build-import-guard-boundary-map-w286']));

  printResults('W286 connected build import guard boundary map harness', results);
}

main();
