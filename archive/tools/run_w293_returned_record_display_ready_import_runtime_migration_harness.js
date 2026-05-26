#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const displayReadyBridge = require('../../src/contracts/returnedRecordDisplayReadyImportBridge');
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
  completedRefreshResponse,
  userscriptPath
} = require('./lib/forge_harness_fixtures');

function readRepoFile(...parts) {
  return fs.readFileSync(path.join(root, ...parts), 'utf8');
}

function bridgeCompatible(validation) {
  return validation && validation.status === 'field_compatible' &&
    validation.fieldComparisons.every((item) => item.fieldCompatible) &&
    validation.blockedReasonsCompatible === true &&
    validation.records.recordsCompatible === true &&
    validation.visibleRecords.recordsCompatible === true &&
    validation.hiddenRecords.recordsCompatible === true;
}

function caseInput(normalizedImport, overrides) {
  return Object.assign({
    normalizedImport,
    w245ImportValid: true,
    laneAwareLabelSource: 'lanePackAwareRecordLabelW250',
    evidenceGuardrailSource: 'canonicalImportResultNormalizationW245 + verifiedRecordLinkAuthorityV1'
  }, overrides || {});
}

function migratedCase(hooks, input) {
  return {
    drawerOutput: hooks.returnedRecordDisplayReadyImportShapeW293(input),
    input
  };
}

function main() {
  const results = [];
  const hooks = loadHooks({ fetchMessage: 'live fetch disabled in W293 harness' });
  const userscript = read(userscriptPath);
  const packageJson = JSON.parse(readRepoFile('package.json'));
  const report = readArchiveText('reports', 'w293_returned_record_display_ready_import_runtime_migration.md');
  const trace = readArchiveJson('trace_samples', 'w293_returned_record_display_ready_import_runtime_migration_trace.json');
  const w292Trace = readArchiveJson('trace_samples', 'w292_returned_record_display_ready_import_bridge_trace.json');
  const w291Trace = readArchiveJson('trace_samples', 'w291_returned_record_display_ready_import_contract_trace.json');
  const w290Trace = readArchiveJson('trace_samples', 'w290_completed_result_import_guard_closure_trace.json');
  const w289Trace = readArchiveJson('trace_samples', 'w289_completed_result_import_eligibility_runtime_migration_trace.json');
  const state = motionState(hooks);
  const context = motionContext(hooks, state);
  const completedResult = completedMotionResult({ prefix: '293' });
  const submitRaw = submitResponse('runner-w293-motion-001', 'motion-w293-token');
  const completedRaw = completedRefreshResponse('runner-w293-motion-001', completedResult);
  const refreshOptions = { phase: 'refresh', runnerTaskId: 'runner-w293-motion-001', idempotencyToken: 'motion-w293-token' };
  const completedShape = hooks.actualAdapterResponseShapeW265(completedRaw, refreshOptions);
  const completedGuard = hooks.validateDccFinalNamingImportPayload(completedShape.finalGeneratedNamesJson, state, context.lane, context.page, context.recommendation);
  const semanticGuard = hooks.completedRunnerResultSemanticGuardW214(completedGuard.finalNaming, state, context.lane, completedShape.finalGeneratedNamesJson);
  const normalizedImport = hooks.canonicalImportResultNormalizationW245(completedShape.finalGeneratedNamesJson, state, context.lane, context.page, context.recommendation);
  const invalidRecord = Object.assign({}, normalizedImport.displayReadyRecords[2], { id: '', internalId: '' });
  const unsupportedRecord = Object.assign({}, normalizedImport.displayReadyRecords[2], {
    supportedOpenUrl: '',
    openableUrl: '',
    openUrl: 'https://example.com/not-netsuite',
    url: 'https://example.com/not-netsuite',
    linkAuthority: { status: 'unsupported_url', openable: false }
  });
  const hiddenRecord = Object.assign({}, normalizedImport.displayReadyRecords[2], {
    normalConsultantVisible: false,
    internalDiagnostic: true,
    linkAuthority: { status: 'internal_diagnostic', openable: false, hiddenFromNormalConsultantUi: true }
  });
  const bridge = displayReadyBridge.bridgeReturnedRecordDisplayReadyImport({
    valid: migratedCase(hooks, caseInput(normalizedImport)),
    invalidId: migratedCase(hooks, caseInput(normalizedImport, { records: [invalidRecord] })),
    unsupportedUrl: migratedCase(hooks, caseInput(normalizedImport, { records: [unsupportedRecord] })),
    hiddenInternal: migratedCase(hooks, caseInput(normalizedImport, { records: [hiddenRecord] })),
    missingRecords: migratedCase(hooks, caseInput(null, { records: [] })),
    notImportValid: migratedCase(hooks, caseInput(normalizedImport, { w245ImportValid: false, records: normalizedImport.displayReadyRecords }))
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
    runnerTaskId: 'runner-w293-motion-001',
    idempotencyToken: 'motion-w293-token',
    completedResultAccepted: true
  });
  const waitingHtml = hooks.renderIntegratedBuildRunnerReturnStatus(motionState(hooks, {
    integratedBuildRunnerResult: {
      schema: 'idb.approved-server-adapter-result-envelope.v1',
      status: 'queued_result_capture_pending',
      queueSubmitted: true,
      runnerTaskId: 'runner-w293-motion-001',
      idempotencyToken: 'motion-w293-token',
      resultCapture: { status: 'pending_runner_completion', runnerTaskId: 'runner-w293-motion-001' }
    }
  }), context.lane, context.page, context.recommendation);

  assertCase(results, 'w290-through-w292-selected-source-anchors-present-or-mapped',
    /function canonicalImportResultNormalizationW245/.test(userscript) &&
      /function displayReadyRecordsFromFinalNamingW245/.test(userscript) &&
      /function lanePackAwareRecordLabelW250/.test(userscript) &&
      /function verifiedRecordLinkAuthorityV1/.test(userscript) &&
      /function completedRunnerResultImportCommitOperatorFlowV1/.test(userscript) &&
      /function connectedBuildSubmitRefreshImportW264/.test(userscript) &&
      /function returnedRecordDisplayReadyImportShapeW293/.test(userscript) &&
      trace.protectedSourceAnchors.indexOf('canonicalImportResultNormalizationW245') >= 0 &&
      /W293 Returned Record Display-Ready Import Runtime Shape Migration/.test(report),
    JSON.stringify(trace.protectedSourceAnchors));

  assertCase(results, 'drawer-local-display-ready-facts-field-compatible-with-w292',
    bridge.schema === 'forge.w292.returned-record-display-ready-import-bridge.v1' &&
      bridge.status === 'bridge_ready' &&
      bridge.validations.length === 6 &&
      bridge.validations.every(bridgeCompatible) &&
      bridge.validations.map((item) => item.contractStatus).join('|') === 'display_ready_records_valid|display_ready_record_blocked_invalid_id|display_ready_record_blocked_unsupported_url|display_ready_record_hidden_internal|display_ready_records_missing|display_ready_records_not_import_valid',
    JSON.stringify(bridge.validations.map((item) => item.contractStatus)));

  assertCase(results, 'w151-w214-w245-validation-remains-outside-migrated-helpers',
    bridge.validationBoundary.w151ValidationConsumedNotReplaced === true &&
      bridge.validationBoundary.w214SemanticGuardConsumedNotReplaced === true &&
      bridge.validationBoundary.w245ValidationConsumedNotReplaced === true &&
      completedGuard.valid === true &&
      semanticGuard.valid === true &&
      normalizedImport.status === 'display_ready_records_normalized' &&
      trace.validationBoundary.w151ValidationConsumedNotReplaced === true &&
      trace.validationBoundary.w214SemanticGuardConsumedNotReplaced === true &&
      trace.validationBoundary.w245ValidationConsumedNotReplaced === true,
    JSON.stringify(bridge.validationBoundary));

  assertCase(results, 'w245-normalization-and-display-ready-boundaries-remain-drawer-owned',
    /function canonicalImportResultNormalizationW245/.test(userscript) &&
      /function displayReadyRecordsFromFinalNamingW245/.test(userscript) &&
      trace.validationBoundary.canonicalImportResultNormalizationRemainsDrawerOwned === true &&
      trace.validationBoundary.displayReadyRecordsFromFinalNamingRemainsDrawerOwned === true,
    JSON.stringify(trace.validationBoundary));

  assertCase(results, 'finish-build-state-mutation-remains-drawer-owned',
    /function completedRunnerResultImportCommitOperatorFlowV1/.test(userscript) &&
      bridge.runtimeBoundary.finishBuildMutationStaysDrawerOwned === true &&
      trace.runtimeBoundary.finishBuildMutationStaysDrawerOwned === true,
    JSON.stringify(trace.runtimeBoundary));

  assertCase(results, 'connected-submit-and-refresh-execution-remain-drawer-owned-and-unchanged',
    /function connectedBuildSubmitRefreshImportW264/.test(userscript) &&
      w264Flow.status === 'records_imported' &&
      submitCalls.length === 1 &&
      pollCalls.length === 1 &&
      trace.runtimeBoundary.connectedSubmitExecutionStaysDrawerOwned === true &&
      trace.runtimeBoundary.refreshPollExecutionStaysDrawerOwned === true,
    JSON.stringify({ status: w264Flow.status, submitCalls: submitCalls.length, pollCalls: pollCalls.length }));

  assertCase(results, 'drawer-self-contained-no-runtime-contract-or-bridge-loading',
    !/require\(['\"][^'\"]*returnedRecordDisplayReadyImportBridge/.test(userscript) &&
      !/require\(['\"][^'\"]*returnedRecordDisplayReadyImport/.test(userscript) &&
      !/src\/contracts\/returnedRecordDisplayReadyImportBridge\.js/.test(userscript) &&
      !/src\/contracts\/returnedRecordDisplayReadyImport\.js/.test(userscript) &&
      trace.runtimeBoundary.noRuntimeRequireAdded === true &&
      trace.runtimeBoundary.noExternalDependencyAdded === true &&
      trace.runtimeBoundary.noBundlerRequirementAdded === true &&
      trace.runtimeBoundary.noNetworkDependencyAdded === true &&
      trace.runtimeBoundary.noStorageWriteAddedForContractLoading === true,
    JSON.stringify(trace.runtimeBoundary));

  assertCase(results, 'w292-bridge-and-w291-contract-remain-available-and-unchanged',
    w292Trace.schema === 'forge.w292.returned-record-display-ready-import-bridge.trace.v1' &&
      w292Trace.status === 'bridge_ready' &&
      w291Trace.schema === 'forge.w291.returned-record-display-ready-import-contract.trace.v1' &&
      trace.continuity.w292BridgeAvailableAndUnchanged === true &&
      trace.continuity.w291ContractAvailableAndUnchanged === true,
    JSON.stringify(trace.continuity));

  assertCase(results, 'w290-closure-map-and-w289-continuity-remain-available',
    w290Trace.schema === 'forge.w290.completed-result-import-guard-closure.trace.v1' &&
      w289Trace.schema === 'forge.w289.completed-result-import-eligibility-runtime-migration.trace.v1' &&
      trace.continuity.w290ClosureMapAvailable === true &&
      trace.continuity.w289RuntimeMigrationFieldCompatibleWithW288 === true,
    JSON.stringify(trace.continuity));

  assertCase(results, 'w264-submit-refresh-import-remains-unchanged',
      w264Flow.status === 'records_imported' &&
      w264Flow.importCommit &&
      w264Flow.importCommit.commitAllowed === true &&
      Array.isArray(w264Flow.importedRecords) &&
      w264Flow.importedRecords.length >= 4 &&
      w264Flow.importedRecords.some((record) => /Motion/i.test(record.name || record.recordName || '')) &&
      trace.continuity.w264SubmitRefreshImportUnchanged === true,
    JSON.stringify({ status: w264Flow.status, imported: w264Flow.importedRecords && w264Flow.importedRecords.length }));

  assertCase(results, 'w265-retry-safety-remains-unchanged',
    retryPolicy.duplicateSubmit &&
      retryPolicy.duplicateSubmit.action === 'use_existing_build_and_refresh_status' &&
      retryPolicy.duplicateSubmit.createsSecondBuild === false &&
      retryPolicy.refreshWhilePending &&
      retryPolicy.refreshWhilePending.allowed === true &&
      retryPolicy.afterAdapterError &&
      retryPolicy.afterAdapterError.allowedAutomatically === false &&
      trace.continuity.w265RetrySafetyUnchanged === true,
    JSON.stringify(retryPolicy));

  assertCase(results, 'w245-w151-w214-validation-remains-unchanged',
    completedGuard.valid === true &&
      completedGuard.status === 'completed_runner_result_accepted' &&
      semanticGuard.valid === true &&
      normalizedImport.status === 'display_ready_records_normalized' &&
      normalizedImport.displayReadyRecords.length >= 4 &&
      trace.continuity.w245W151W214ValidationUnchanged === true,
    JSON.stringify({ w151: completedGuard.status, w214: semanticGuard.status, w245: normalizedImport.status }));

  assertCase(results, 'returned-record-names-labels-and-open-links-preserved-after-valid-import',
      normalizedImport.displayReadyRecords.some((record) => record.recordName === 'Motion Branch Fulfillment SKU' && /Product SKU/i.test(record.consultantLabel) && record.safeToOpen === true) &&
      w264Flow.importedRecords.some((record) => /Motion Branch Fulfillment SKU/i.test(record.name || record.recordName || '')) &&
      trace.continuity.returnedRecordNamesLabelsOpenLinksPreserved === true,
    JSON.stringify(normalizedImport.displayReadyRecords.map((record) => `${record.consultantLabel}:${record.recordName}:${record.linkAuthorityStatus}`)));

  assertCase(results, 'fake-open-links-remain-blocked-before-valid-import',
    /Open links appear only after real NetSuite records are returned/i.test(waitingHtml) &&
      !/href=["'][^"']*REPLACE_/i.test(waitingHtml) &&
      !/href=["'][^"']*YOUR_ACCOUNT_ID/i.test(waitingHtml) &&
      trace.continuity.fakeOpenLinksBlockedBeforeValidImport === true,
    waitingHtml.slice(0, 400));

  assertCase(results, 'normal-consultant-ui-hides-endpoint-profile-raw-admin-diagnostics',
    !/script=6702|deploy=2|runner-w293-motion-001|finalGeneratedNamesJson|stack trace|schema/i.test(waitingHtml),
    waitingHtml.slice(0, 400));

  assertCase(results, 'no-runtime-authority-changes-introduced',
    bridge.runtimeBoundary.noStateMutation === true &&
      bridge.runtimeBoundary.noRecordImport === true &&
      bridge.runtimeBoundary.noRecordCreation === true &&
      bridge.runtimeBoundary.noTransactionWrites === true &&
      bridge.runtimeBoundary.noOpenLinkCreation === true &&
      bridge.runtimeBoundary.noUiRendering === true &&
      trace.runtimeBoundary.noRecordCreation === true &&
      trace.runtimeBoundary.noTransactionWrites === true,
    JSON.stringify(bridge.runtimeBoundary));

  assertCase(results, 'w293-harness-and-check-registration-present',
    packageJson.scripts['harness:returned-record-display-ready-import-runtime-migration-w293'] &&
      packageJson.scripts.check.includes('run_w293_returned_record_display_ready_import_runtime_migration_harness.js') &&
      trace.status === 'runtime_shape_migration_ready',
    packageJson.scripts['harness:returned-record-display-ready-import-runtime-migration-w293'] || '');

  printResults('W293 returned record display-ready import runtime migration harness', results);
}

main();
