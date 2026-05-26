#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const eligibility = require('../../src/contracts/completedResultImportEligibility');
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

function main() {
  const results = [];
  const hooks = loadHooks({ fetchMessage: 'live fetch disabled in W289 harness' });
  const userscript = read(userscriptPath);
  const packageJson = JSON.parse(readRepoFile('package.json'));
  const report = readArchiveText('reports', 'w289_completed_result_import_eligibility_runtime_migration.md');
  const trace = readArchiveJson('trace_samples', 'w289_completed_result_import_eligibility_runtime_migration_trace.json');
  const w288Trace = readArchiveJson('trace_samples', 'w288_completed_result_import_eligibility_bridge_trace.json');
  const w287Trace = readArchiveJson('trace_samples', 'w287_completed_result_import_eligibility_contract_trace.json');
  const w286Trace = readArchiveJson('trace_samples', 'w286_connected_build_import_guard_boundary_map_trace.json');
  const w285Trace = readArchiveJson('trace_samples', 'w285_connected_build_response_shape_runtime_migration_trace.json');
  const w284Trace = readArchiveJson('trace_samples', 'w284_connected_build_response_shape_bridge_trace.json');
  const state = motionState(hooks);
  const context = motionContext(hooks, state);
  const completedResult = completedMotionResult({ prefix: '289' });
  const submitRaw = submitResponse('runner-w289-motion-001', 'motion-w289-token');
  const completedRaw = completedRefreshResponse('runner-w289-motion-001', completedResult);
  const refreshOptions = { phase: 'refresh', runnerTaskId: 'runner-w289-motion-001', idempotencyToken: 'motion-w289-token' };
  const completedShape = hooks.actualAdapterResponseShapeW265(completedRaw, refreshOptions);
  const responseShapeValidation = responseBridge.validateResponseShape(completedShape, completedRaw, refreshOptions);
  const completedGuard = hooks.validateDccFinalNamingImportPayload(completedShape.finalGeneratedNamesJson, state, context.lane, context.page, context.recommendation);
  const semanticGuard = hooks.completedRunnerResultSemanticGuardW214(completedGuard.finalNaming, state, context.lane, completedShape.finalGeneratedNamesJson);
  const normalizedImport = hooks.canonicalImportResultNormalizationW245(completedShape.finalGeneratedNamesJson, state, context.lane, context.page, context.recommendation);
  const eligibleFacts = facts({
    completedResultJson: completedShape.finalGeneratedNamesJson,
    w151: completedGuard,
    w214: semanticGuard,
    w245: normalizedImport
  });
  const missingFacts = facts({ completedResultJsonPresent: false, completedResultJson: null });
  const w151Facts = facts({ w151Valid: false, w151ValidationStatus: 'handoff_packet_rejected' });
  const w214Facts = facts({ w214Valid: false, w214SemanticGuardStatus: 'operating_mode_record_contract_failed' });
  const w245Facts = facts({ w245CanonicalNormalizationReady: false, w245NormalizationStatus: 'no_valid_display_ready_records' });
  const blockedFacts = facts({ finishBuildCtaEligible: false });
  const drawerEligibilityOutputs = {
    eligible: { drawerEligibility: hooks.completedResultImportEligibilityShapeW289(eligibleFacts), facts: eligibleFacts },
    missingCompleted: { drawerEligibility: hooks.completedResultImportEligibilityShapeW289(missingFacts), facts: missingFacts },
    w151Rejected: { drawerEligibility: hooks.completedResultImportEligibilityShapeW289(w151Facts), facts: w151Facts },
    w214Blocked: { drawerEligibility: hooks.completedResultImportEligibilityShapeW289(w214Facts), facts: w214Facts },
    w245NotReady: { drawerEligibility: hooks.completedResultImportEligibilityShapeW289(w245Facts), facts: w245Facts },
    finishBuildBlocked: { drawerEligibility: hooks.completedResultImportEligibilityShapeW289(blockedFacts), facts: blockedFacts }
  };
  const bridge = eligibilityBridge.bridgeCompletedResultImportEligibility(drawerEligibilityOutputs);
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
  const commitWithChoice = hooks.completedRunnerResultImportCommitOperatorFlowV1(state, context.lane, context.page, context.recommendation, {
    operatorChoseImport: true,
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
    runnerTaskId: 'runner-w289-motion-001',
    idempotencyToken: 'motion-w289-token',
    completedResultAccepted: true
  });
  const waitingState = motionState(hooks, {
    integratedBuildRunnerResult: {
      schema: 'idb.approved-server-adapter-result-envelope.v1',
      status: 'queued_result_capture_pending',
      queueSubmitted: true,
      runnerTaskId: 'runner-w289-motion-001',
      idempotencyToken: 'motion-w289-token',
      resultCapture: { status: 'pending_runner_completion', runnerTaskId: 'runner-w289-motion-001' }
    }
  });
  const waitingContext = motionContext(hooks, waitingState);
  const waitingHtml = hooks.renderIntegratedBuildRunnerReturnStatus(waitingState, waitingContext.lane, waitingContext.page, waitingContext.recommendation);
  const completedState = motionState(hooks, {
    integratedBuildRunnerResult: {
      schema: 'idb.approved-server-adapter-result-envelope.v1',
      status: 'completed_result_available',
      queueSubmitted: true,
      runnerTaskId: 'runner-w289-motion-001',
      idempotencyToken: 'motion-w289-token',
      finalGeneratedNamesJsonReady: true,
      finalGeneratedNamesJson: completedResult,
      resultCapture: {
        status: 'completed_result_capture_ready',
        runnerTaskId: 'runner-w289-motion-001',
        finalGeneratedNamesJson: completedResult
      }
    }
  });
  const completedContext = motionContext(hooks, completedState);
  const completedHtml = hooks.renderIntegratedBuildRunnerReturnStatus(completedState, completedContext.lane, completedContext.page, completedContext.recommendation);

  assertCase(results, 'w286-through-w288-selected-source-anchors-present-or-mapped',
    /function connectedBuildSubmitRefreshImportW264/.test(userscript) &&
      /function completedRunnerResultImportCommitOperatorFlowV1/.test(userscript) &&
      /function validateDccFinalNamingImportPayload/.test(userscript) &&
      /function completedRunnerResultSemanticGuardW214/.test(userscript) &&
      /function canonicalImportResultNormalizationW245/.test(userscript) &&
      /function adapterResultIndicatesCompletedResultReady/.test(userscript) &&
      /completedResultImportEligibilityShapeW289/.test(userscript) &&
      /W289 Completed Result Import Eligibility Runtime Migration/.test(report) &&
      trace.migratedHelperAnchors.indexOf('completedResultImportEligibilityShapeW289') >= 0,
    JSON.stringify(trace.migratedHelperAnchors));

  assertCase(results, 'drawer-local-eligibility-facts-field-compatible-with-w288',
    bridge.status === 'bridge_ready' &&
      bridge.validations.length === 6 &&
      bridge.validations.every(compatible) &&
      bridge.validations.map((item) => item.contractStatus).join('|') === 'finish_build_eligible|missing_completed_result|w151_rejected|w214_semantic_blocked|w245_normalization_not_ready|finish_build_blocked',
    JSON.stringify(bridge.validations.map((item) => ({ status: item.status, contractStatus: item.contractStatus }))));

  assertCase(results, 'w151-w214-w245-validation-remains-outside-migrated-helpers',
    commitWithChoice.importEligibilityW289.validationBoundary.w151ValidationConsumedNotReplaced === true &&
      commitWithChoice.importEligibilityW289.validationBoundary.w214SemanticGuardConsumedNotReplaced === true &&
      commitWithChoice.importEligibilityW289.validationBoundary.w245NormalizationConsumedNotReplaced === true &&
      completedGuard.valid === true &&
      semanticGuard.valid === true &&
      normalizedImport.status === 'display_ready_records_normalized' &&
      trace.validationBoundary.w151W214W245ValidationOutsideMigratedHelpers === true,
    JSON.stringify({ eligibility: commitWithChoice.importEligibilityW289.status, guards: [completedGuard.status, semanticGuard.status, normalizedImport.status] }));

  assertCase(results, 'finish-build-state-mutation-remains-drawer-owned',
    commitWithoutChoice.commitAllowed === false &&
      commitWithoutChoice.blockedReason === 'operator_import_choice_required' &&
      commitWithChoice.commitAllowed === true &&
      commitWithChoice.importEligibilityW289.runtimeBoundary.finishBuildMutationStaysDrawerOwned === true &&
      commitWithChoice.mutationGuard.finalGeneratedNamesMutatedOnlyByOperatorImport === true,
    JSON.stringify({ withoutChoice: commitWithoutChoice.blockedReason, withChoice: commitWithChoice.status }));

  assertCase(results, 'actual-submit-and-refresh-execution-remain-drawer-owned',
    submitCalls.length === 1 &&
      pollCalls.length === 1 &&
      w264Flow.status === 'records_imported' &&
      /function connectedBuildSubmitRefreshImportW264/.test(userscript) &&
      /submitTransport/.test(userscript) &&
      /pollTransport/.test(userscript),
    JSON.stringify({ status: w264Flow.status, submitCalls: submitCalls.length, pollCalls: pollCalls.length }));

  assertCase(results, 'drawer-self-contained-no-runtime-contract-loading-side-effects',
    !/require\(['\"][^'\"]*completedResultImportEligibilityBridge/.test(userscript) &&
      !/require\(['\"][^'\"]*completedResultImportEligibility/.test(userscript) &&
      !/src\/contracts\/completedResultImportEligibilityBridge\.js/.test(userscript) &&
      !/src\/contracts\/completedResultImportEligibility\.js/.test(userscript) &&
      trace.runtimeBoundary.drawerSelfContained === true &&
      trace.runtimeBoundary.noRuntimeRequireAdded === true &&
      trace.runtimeBoundary.noExternalDependencyAdded === true &&
      trace.runtimeBoundary.noBundlerRequirementAdded === true &&
      trace.runtimeBoundary.noNetworkDependencyAdded === true &&
      trace.runtimeBoundary.noStorageWriteAddedForContractBridgeLoading === true,
    JSON.stringify(trace.runtimeBoundary));

  assertCase(results, 'w288-w287-w286-and-w285-w284-continuity-remains',
    w288Trace.schema === 'forge.w288.completed-result-import-eligibility-bridge.trace.v1' &&
      w287Trace.schema === 'forge.w287.completed-result-import-eligibility-contract.trace.v1' &&
      w286Trace.schema === 'forge.w286.connected-build-import-guard-boundary-map.trace.v1' &&
      w285Trace.schema === 'forge.w285.connected-build-response-shape-runtime-migration.trace.v1' &&
      w284Trace.schema === 'forge.w284.connected-build-response-shape-bridge.trace.v1' &&
      trace.continuity.w288BridgeAvailableAndUnchanged === true &&
      trace.continuity.w287ContractAvailableAndUnchanged === true &&
      trace.continuity.w286ImportGuardBoundaryMapAvailableAndUnchanged === true &&
      trace.continuity.w285ResponseShapeMigrationFieldCompatibleWithW284 === true,
    JSON.stringify({ w288: w288Trace.schema, w287: w287Trace.schema, w286: w286Trace.schema }));

  assertCase(results, 'w264-submit-refresh-import-remains-unchanged',
    w264Flow.status === 'records_imported' &&
      w264Flow.importedRecords.length >= 4 &&
      responseShapeValidation.status === 'field_compatible' &&
      trace.continuity.w264SubmitRefreshImportChanged === false,
    JSON.stringify({ status: w264Flow.status, imported: w264Flow.importedRecords.length }));

  assertCase(results, 'w265-retry-safety-remains-unchanged',
    retryPolicy.duplicateSubmit.allowed === false &&
      retryPolicy.afterAdapterError.allowedAutomatically === false &&
      retryPolicy.refreshWhilePending.allowed === true &&
      trace.continuity.w265RetrySafetyChanged === false,
    JSON.stringify(retryPolicy));

  assertCase(results, 'w245-w151-w214-validation-remains-unchanged',
    completedGuard.valid === true &&
      completedGuard.status === 'completed_runner_result_accepted' &&
      semanticGuard.valid === true &&
      normalizedImport.status === 'display_ready_records_normalized' &&
      trace.continuity.w245CanonicalImportChanged === false &&
      trace.continuity.w151ValidationChanged === false &&
      trace.continuity.w214SemanticGuardChanged === false,
    JSON.stringify({ w151: completedGuard.status, w214: semanticGuard.status, w245: normalizedImport.status }));

  assertCase(results, 'returned-records-open-links-preserved-after-valid-import',
    w264Flow.importedRecords.some((record) => record.name === 'Motion Branch Fulfillment SKU' && /Product SKU/i.test(record.label)) &&
      w264Flow.importedRecords.some((record) => record.name === 'Motion Availability Proof Flow' && /Availability|Replenishment/i.test(record.label)) &&
      w264Flow.importedRecords.every((record) => record.linkAuthority && record.linkAuthority.openable === true && /^https:\/\/td3021666\.app\.netsuite\.com\//.test(record.openUrl)) &&
      trace.continuity.returnedRecordsOpenLinksChanged === false,
    w264Flow.importedRecords.map((record) => `${record.label}:${record.name}:${record.openUrl}`).join(' | '));

  assertCase(results, 'fake-links-blocked-before-valid-import',
    !/Open<\/a>/.test(waitingHtml) &&
      /Refresh build status/.test(waitingHtml) &&
      /Finish build/.test(completedHtml) &&
      trace.continuity.fakeLinkBlockingChanged === false,
    (waitingHtml + completedHtml).slice(0, 1200));

  assertCase(results, 'normal-consultant-ui-hides-endpoint-profile-raw-admin-diagnostics',
    !/script=6702|deploy=2|customdeployidb_governed_runner_adapter|td3021666\.app\.netsuite\.com|runnerTaskId|raw json|schema|stack trace|admin diagnostics|transport boundary|operator gate|server flags|completedResultImportEligibility/i.test(waitingHtml + completedHtml) &&
      trace.guardrails.normalConsultantUiHidesEndpointRawTaskSchemaStackAdminDiagnostics === true,
    (waitingHtml + completedHtml).slice(0, 1400));

  assertCase(results, 'no-runtime-authority-changes-introduced',
    commitWithChoice.importEligibilityW289.runtimeBoundary.noRecordImport === true &&
      commitWithChoice.importEligibilityW289.runtimeBoundary.noRecordCreation === true &&
      commitWithChoice.importEligibilityW289.runtimeBoundary.noTransactionWrites === true &&
      commitWithChoice.importEligibilityW289.runtimeBoundary.noOpenLinkCreation === true &&
      trace.guardrails.runtimeBehaviorChanged === false &&
      trace.guardrails.connectedBuildFlowChanged === false &&
      trace.guardrails.recordCreationAuthorityChanged === false &&
      trace.guardrails.noDrawerCreatedRecords === true &&
      trace.guardrails.noDrawerTransactionWrites === true,
    JSON.stringify(trace.guardrails));

  assertCase(results, 'w289-harness-and-check-registration-present',
    packageJson.scripts['harness:completed-result-import-eligibility-runtime-migration-w289'] === 'node archive/tools/run_w289_completed_result_import_eligibility_runtime_migration_harness.js' &&
      packageJson.scripts.check.indexOf('archive/tools/run_w289_completed_result_import_eligibility_runtime_migration_harness.js') >= 0 &&
      eligibility.contractSummary().futureBridge === 'src/contracts/completedResultImportEligibilityBridge.js',
    JSON.stringify(packageJson.scripts['harness:completed-result-import-eligibility-runtime-migration-w289']));

  printResults('W289 completed result import eligibility runtime migration harness', results);
}

main();
