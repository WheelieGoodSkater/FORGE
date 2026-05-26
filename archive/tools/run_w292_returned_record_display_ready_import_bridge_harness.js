#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const displayReadyContract = require('../../src/contracts/returnedRecordDisplayReadyImport');
const displayReadyBridge = require('../../src/contracts/returnedRecordDisplayReadyImportBridge');
const eligibilityBridge = require('../../src/contracts/completedResultImportEligibilityBridge');
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
  completedRefreshResponse,
  userscriptPath
} = require('./lib/forge_harness_fixtures');

function readRepoFile(...parts) {
  return fs.readFileSync(path.join(root, ...parts), 'utf8');
}

function facts(overrides) {
  return Object.assign({
    completedResultJsonPresent: true,
    w151ValidationStatus: 'completed_runner_result_accepted',
    w151Valid: true,
    w214SemanticGuardStatus: 'operating_mode_record_contract_passed',
    w214Valid: true,
    w245CanonicalNormalizationReady: true,
    w245NormalizationStatus: 'display_ready_records_normalized',
    generatedRecordOwner: 'governed_runner_internal_build_engine',
    governedRunnerOwnerValid: true,
    finishBuildCtaEligible: true,
    openLinkPreconditions: {
      realUrlsOnly: true,
      numericInternalIds: true,
      supportedNetSuiteUrls: true,
      fakeLinksBlockedBeforeImport: true
    },
    w218SuccessWordingPreserved: true,
    w220RecoveryWordingPreserved: true,
    rawEvidencePolicy: {
      adminOnly: true,
      archivedOnly: true,
      hiddenFromNormalConsultantUi: true
    }
  }, overrides || {});
}

function compatible(validation) {
  return validation && validation.status === 'field_compatible' &&
    validation.fieldComparisons.every((item) => item.fieldCompatible) &&
    validation.blockedReasonsCompatible === true;
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

function evaluatedCase(input) {
  return {
    drawerOutput: displayReadyContract.evaluateReturnedRecordDisplayReadyImport(input),
    input
  };
}

function main() {
  const results = [];
  const hooks = loadHooks({ fetchMessage: 'live fetch disabled in W292 harness' });
  const userscript = read(userscriptPath);
  const packageJson = JSON.parse(readRepoFile('package.json'));
  const report = readArchiveText('reports', 'w292_returned_record_display_ready_import_bridge.md');
  const trace = readArchiveJson('trace_samples', 'w292_returned_record_display_ready_import_bridge_trace.json');
  const w291Trace = readArchiveJson('trace_samples', 'w291_returned_record_display_ready_import_contract_trace.json');
  const w290Trace = readArchiveJson('trace_samples', 'w290_completed_result_import_guard_closure_trace.json');
  const w289Trace = readArchiveJson('trace_samples', 'w289_completed_result_import_eligibility_runtime_migration_trace.json');
  const state = motionState(hooks);
  const context = motionContext(hooks, state);
  const completedResult = completedMotionResult({ prefix: '292' });
  const submitRaw = submitResponse('runner-w292-motion-001', 'motion-w292-token');
  const completedRaw = completedRefreshResponse('runner-w292-motion-001', completedResult);
  const refreshOptions = { phase: 'refresh', runnerTaskId: 'runner-w292-motion-001', idempotencyToken: 'motion-w292-token' };
  const completedShape = hooks.actualAdapterResponseShapeW265(completedRaw, refreshOptions);
  const responseShapeValidation = responseBridge.validateResponseShape(completedShape, completedRaw, refreshOptions);
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
    valid: evaluatedCase(caseInput(normalizedImport)),
    invalidId: evaluatedCase(caseInput(normalizedImport, { records: [invalidRecord] })),
    unsupportedUrl: evaluatedCase(caseInput(normalizedImport, { records: [unsupportedRecord] })),
    hiddenInternal: evaluatedCase(caseInput(normalizedImport, { records: [hiddenRecord] })),
    missingRecords: evaluatedCase(caseInput(null, { records: [] })),
    notImportValid: evaluatedCase(caseInput(normalizedImport, { w245ImportValid: false, records: normalizedImport.displayReadyRecords }))
  });
  const eligibleFacts = facts({
    completedResultJson: completedShape.finalGeneratedNamesJson,
    w151: completedGuard,
    w214: semanticGuard,
    w245: normalizedImport
  });
  const eligibilityOutputs = {
    eligible: { drawerEligibility: hooks.completedResultImportEligibilityShapeW289(eligibleFacts), facts: eligibleFacts },
    missingCompleted: { drawerEligibility: hooks.completedResultImportEligibilityShapeW289(facts({ completedResultJsonPresent: false, completedResultJson: null })), facts: facts({ completedResultJsonPresent: false, completedResultJson: null }) },
    w151Rejected: { drawerEligibility: hooks.completedResultImportEligibilityShapeW289(facts({ w151Valid: false, w151ValidationStatus: 'handoff_packet_rejected' })), facts: facts({ w151Valid: false, w151ValidationStatus: 'handoff_packet_rejected' }) },
    w214Blocked: { drawerEligibility: hooks.completedResultImportEligibilityShapeW289(facts({ w214Valid: false, w214SemanticGuardStatus: 'operating_mode_record_contract_failed' })), facts: facts({ w214Valid: false, w214SemanticGuardStatus: 'operating_mode_record_contract_failed' }) },
    w245NotReady: { drawerEligibility: hooks.completedResultImportEligibilityShapeW289(facts({ w245CanonicalNormalizationReady: false, w245NormalizationStatus: 'no_valid_display_ready_records' })), facts: facts({ w245CanonicalNormalizationReady: false, w245NormalizationStatus: 'no_valid_display_ready_records' }) },
    finishBuildBlocked: { drawerEligibility: hooks.completedResultImportEligibilityShapeW289(facts({ finishBuildCtaEligible: false })), facts: facts({ finishBuildCtaEligible: false }) }
  };
  const eligibilityParity = eligibilityBridge.bridgeCompletedResultImportEligibility(eligibilityOutputs);
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
    runnerTaskId: 'runner-w292-motion-001',
    idempotencyToken: 'motion-w292-token',
    completedResultAccepted: true
  });
  const waitingState = motionState(hooks, {
    integratedBuildRunnerResult: {
      schema: 'idb.approved-server-adapter-result-envelope.v1',
      status: 'queued_result_capture_pending',
      queueSubmitted: true,
      runnerTaskId: 'runner-w292-motion-001',
      idempotencyToken: 'motion-w292-token',
      resultCapture: { status: 'pending_runner_completion', runnerTaskId: 'runner-w292-motion-001' }
    }
  });
  const waitingContext = motionContext(hooks, waitingState);
  const waitingHtml = hooks.renderIntegratedBuildRunnerReturnStatus(waitingState, waitingContext.lane, waitingContext.page, waitingContext.recommendation);
  const completedState = motionState(hooks, {
    integratedBuildRunnerResult: {
      schema: 'idb.approved-server-adapter-result-envelope.v1',
      status: 'completed_result_available',
      queueSubmitted: true,
      runnerTaskId: 'runner-w292-motion-001',
      idempotencyToken: 'motion-w292-token',
      finalGeneratedNamesJsonReady: true,
      finalGeneratedNamesJson: completedResult,
      resultCapture: {
        status: 'completed_result_capture_ready',
        runnerTaskId: 'runner-w292-motion-001',
        finalGeneratedNamesJson: completedResult
      }
    }
  });
  const completedContext = motionContext(hooks, completedState);
  const completedHtml = hooks.renderIntegratedBuildRunnerReturnStatus(completedState, completedContext.lane, completedContext.page, completedContext.recommendation);

  assertCase(results, 'returned-record-display-ready-import-bridge-exists',
    displayReadyBridge.RETURNED_RECORD_DISPLAY_READY_IMPORT_BRIDGE_SCHEMA_VERSION === 'forge.w292.returned-record-display-ready-import-bridge.v1' &&
      displayReadyBridge.exportedContractSummary().governingContract === displayReadyContract.RETURNED_RECORD_DISPLAY_READY_IMPORT_SCHEMA_VERSION &&
      /W292 Returned Record Display-Ready Import Bridge/.test(report) &&
      trace.bridgeModule === 'src/contracts/returnedRecordDisplayReadyImportBridge.js',
    JSON.stringify(displayReadyBridge.exportedContractSummary()));

  assertCase(results, 'bridge-validates-against-w291-contract',
    bridge.schema === 'forge.w292.returned-record-display-ready-import-bridge.v1' &&
      bridge.status === 'bridge_ready' &&
      bridge.governingContract === displayReadyContract.RETURNED_RECORD_DISPLAY_READY_IMPORT_SCHEMA_VERSION &&
      bridge.validations.length === 6,
    JSON.stringify({ status: bridge.status, validations: bridge.validations.length }));

  assertCase(results, 'valid-w245-motion-records-field-compatible-with-w291',
    bridge.validations[0].contractStatus === 'display_ready_records_valid' &&
      bridgeCompatible(bridge.validations[0]) &&
      bridge.validations[0].contractOutput.visibleRecords.some((record) => record.recordName === 'Motion Branch Fulfillment SKU' && /Product SKU/i.test(record.consultantLabel)),
    JSON.stringify(bridge.validations[0].contractOutput.visibleRecords.map((record) => `${record.consultantLabel}:${record.recordName}`)));

  assertCase(results, 'blocked-and-not-import-valid-cases-field-compatible',
    bridge.validations.slice(1).every(bridgeCompatible) &&
      bridge.validations.map((item) => item.contractStatus).join('|') === 'display_ready_records_valid|display_ready_record_blocked_invalid_id|display_ready_record_blocked_unsupported_url|display_ready_record_hidden_internal|display_ready_records_missing|display_ready_records_not_import_valid' &&
      trace.coveredCases.indexOf('display_ready_record_blocked_invalid_id') >= 0 &&
      trace.coveredCases.indexOf('display_ready_records_not_import_valid') >= 0,
    JSON.stringify(bridge.validations.map((item) => item.contractStatus)));

  assertCase(results, 'bridge-consumes-w245-link-authority-facts-does-not-replace-w151-w214-w245',
    bridge.validationBoundary.w151ValidationConsumedNotReplaced === true &&
      bridge.validationBoundary.w214SemanticGuardConsumedNotReplaced === true &&
      bridge.validationBoundary.w245ValidationConsumedNotReplaced === true &&
      bridge.validationBoundary.bridgeCannotDeclareImportValidWithoutSuppliedFacts === true &&
      bridge.validations.every((item) => item.guardrails.w151ConsumedNotReplaced && item.guardrails.w214ConsumedNotReplaced && item.guardrails.w245ConsumedNotReplaced) &&
      trace.validationBoundary.w245ValidationConsumedNotReplaced === true,
    JSON.stringify(bridge.validationBoundary));

  assertCase(results, 'bridge-cannot-mutate-import-create-write-open-links-or-render-ui',
    bridge.runtimeBoundary.noStateMutation === true &&
      bridge.runtimeBoundary.noRecordImport === true &&
      bridge.runtimeBoundary.noRecordCreation === true &&
      bridge.runtimeBoundary.noTransactionWrites === true &&
      bridge.runtimeBoundary.noOpenLinkCreation === true &&
      bridge.runtimeBoundary.noUiRendering === true &&
      bridge.runtimeBoundary.finishBuildMutationStaysDrawerOwned === true &&
      bridge.validations.every((item) => Object.keys(item.guardrails).every((key) => item.guardrails[key] === true)),
    JSON.stringify(bridge.runtimeBoundary));

  assertCase(results, 'bridge-not-wired-into-drawer-runtime-and-drawer-self-contained',
    !/require\(['\"][^'\"]*returnedRecordDisplayReadyImportBridge/.test(userscript) &&
      !/require\(['\"][^'\"]*returnedRecordDisplayReadyImport/.test(userscript) &&
      !/src\/contracts\/returnedRecordDisplayReadyImportBridge\.js/.test(userscript) &&
      !/src\/contracts\/returnedRecordDisplayReadyImport\.js/.test(userscript) &&
      trace.drawerRuntimeBoundary.moduleWiredIntoDrawerRuntime === false &&
      trace.drawerRuntimeBoundary.drawerSelfContained === true &&
      trace.drawerRuntimeBoundary.noRuntimeRequireAdded === true &&
      trace.drawerRuntimeBoundary.noExternalDependencyAdded === true &&
      trace.drawerRuntimeBoundary.noBundlerRequirementAdded === true &&
      trace.drawerRuntimeBoundary.noNetworkDependencyAdded === true &&
      trace.drawerRuntimeBoundary.noStorageWriteAddedForBridgeContractLoading === true,
    JSON.stringify(trace.drawerRuntimeBoundary));

  assertCase(results, 'w291-contract-remains-available-and-unchanged',
    w291Trace.schema === 'forge.w291.returned-record-display-ready-import-contract.trace.v1' &&
      displayReadyContract.contractSummary().futureBridge === 'src/contracts/returnedRecordDisplayReadyImportBridge.js' &&
      trace.continuity.w291ContractAvailableAndUnchanged === true,
    JSON.stringify(displayReadyContract.contractSummary()));

  assertCase(results, 'w290-closure-readiness-map-remains-available',
    w290Trace.schema === 'forge.w290.completed-result-import-guard-closure.trace.v1' &&
      w290Trace.selectedNextMicroSlice.id === 'returned_record_display_ready_import_contract_w291' &&
      trace.continuity.w290ClosureReadinessMapAvailable === true,
    JSON.stringify(w290Trace.selectedNextMicroSlice));

  assertCase(results, 'w289-runtime-migration-remains-field-compatible-with-w288',
    w289Trace.schema === 'forge.w289.completed-result-import-eligibility-runtime-migration.trace.v1' &&
      eligibilityParity.status === 'bridge_ready' &&
      eligibilityParity.validations.length === 6 &&
      eligibilityParity.validations.every(compatible) &&
      trace.continuity.w289RuntimeMigrationFieldCompatibleWithW288 === true,
    JSON.stringify(eligibilityParity.validations.map((item) => item.contractStatus)));

  assertCase(results, 'w264-submit-refresh-import-remains-unchanged',
    submitCalls.length === 1 &&
      pollCalls.length === 1 &&
      w264Flow.status === 'records_imported' &&
      w264Flow.completedResultGuard.completedResultAcceptedByW151 === true &&
      w264Flow.importedRecords.length >= 4 &&
      responseShapeValidation.status === 'field_compatible' &&
      trace.continuity.w264SubmitRefreshImportChanged === false,
    JSON.stringify({ status: w264Flow.status, imported: w264Flow.importedRecords.length }));

  assertCase(results, 'w265-retry-safety-remains-unchanged',
    retryPolicy.duplicateSubmit.allowed === false &&
      retryPolicy.duplicateSubmit.createsSecondBuild === false &&
      retryPolicy.afterAdapterError.allowedAutomatically === false &&
      retryPolicy.refreshWhilePending.allowed === true &&
      retryPolicy.finishBuild.allowed === true &&
      trace.continuity.w265RetrySafetyChanged === false,
    JSON.stringify(retryPolicy));

  assertCase(results, 'w245-w151-w214-validation-remains-unchanged',
    completedGuard.valid === true &&
      completedGuard.status === 'completed_runner_result_accepted' &&
      semanticGuard.valid === true &&
      semanticGuard.status === 'operating_mode_record_contract_passed' &&
      normalizedImport.status === 'display_ready_records_normalized' &&
      trace.continuity.w245CanonicalImportChanged === false &&
      trace.continuity.w151ValidationChanged === false &&
      trace.continuity.w214SemanticGuardChanged === false,
    JSON.stringify({ w151: completedGuard.status, w214: semanticGuard.status, w245: normalizedImport.status }));

  assertCase(results, 'returned-record-names-labels-and-open-links-preserved-after-valid-import',
    w264Flow.importedRecords.some((record) => record.name === 'Motion Branch Fulfillment SKU' && /Product SKU/i.test(record.label)) &&
      w264Flow.importedRecords.some((record) => record.name === 'Motion Availability Proof Flow' && /Availability|Replenishment/i.test(record.label)) &&
      w264Flow.importedRecords.every((record) => record.linkAuthority && record.linkAuthority.openable === true && /^https:\/\/td3021666\.app\.netsuite\.com\//.test(record.openUrl)) &&
      trace.continuity.returnedRecordNamesLabelsOpenLinksChanged === false,
    w264Flow.importedRecords.map((record) => `${record.label}:${record.name}:${record.openUrl}`).join(' | '));

  assertCase(results, 'fake-open-links-remain-blocked-before-valid-import',
    !/Open<\/a>/.test(waitingHtml) &&
      /Refresh build status/.test(waitingHtml) &&
      /Finish build/.test(completedHtml) &&
      trace.continuity.fakeLinkBlockingChanged === false,
    (waitingHtml + completedHtml).slice(0, 1200));

  assertCase(results, 'normal-consultant-ui-hides-endpoint-profile-raw-admin-diagnostics',
    !/script=6702|deploy=2|customdeployidb_governed_runner_adapter|td3021666\.app\.netsuite\.com|runnerTaskId|raw json|schema|stack trace|admin diagnostics|transport boundary|operator gate|server flags|returnedRecordDisplayReadyImport/i.test(waitingHtml + completedHtml) &&
      trace.guardrails.normalConsultantUiHidesEndpointProfileRawAdminDiagnostics === true,
    (waitingHtml + completedHtml).slice(0, 1400));

  assertCase(results, 'no-runtime-authority-changes-introduced',
    bridge.runtimeBoundary.noRecordCreation === true &&
      bridge.runtimeBoundary.noTransactionWrites === true &&
      trace.guardrails.runtimeBehaviorChanged === false &&
      trace.guardrails.connectedBuildFlowChanged === false &&
      trace.guardrails.recordCreationAuthorityChanged === false &&
      trace.guardrails.noDrawerCreatedRecords === true &&
      trace.guardrails.noDrawerTransactionWrites === true,
    JSON.stringify(trace.guardrails));

  assertCase(results, 'w292-harness-and-check-registration-present',
    packageJson.scripts['harness:returned-record-display-ready-import-bridge-w292'] === 'node archive/tools/run_w292_returned_record_display_ready_import_bridge_harness.js' &&
      packageJson.scripts.check.indexOf('src/contracts/returnedRecordDisplayReadyImportBridge.js') >= 0 &&
      packageJson.scripts.check.indexOf('archive/tools/run_w292_returned_record_display_ready_import_bridge_harness.js') >= 0,
    JSON.stringify(packageJson.scripts['harness:returned-record-display-ready-import-bridge-w292']));

  printResults('W292 returned record display-ready import bridge harness', results);
}

main();
