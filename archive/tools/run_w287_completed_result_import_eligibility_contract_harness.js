#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const eligibility = require('../../src/contracts/completedResultImportEligibility');
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

function eligibleFacts(overrides) {
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

function main() {
  const results = [];
  const hooks = loadHooks({ fetchMessage: 'live fetch disabled in W287 harness' });
  const userscript = read(userscriptPath);
  const packageJson = JSON.parse(readRepoFile('package.json'));
  const report = readArchiveText('reports', 'w287_completed_result_import_eligibility_contract.md');
  const trace = readArchiveJson('trace_samples', 'w287_completed_result_import_eligibility_contract_trace.json');
  const w286Trace = readArchiveJson('trace_samples', 'w286_connected_build_import_guard_boundary_map_trace.json');
  const w285Trace = readArchiveJson('trace_samples', 'w285_connected_build_response_shape_runtime_migration_trace.json');
  const w284Trace = readArchiveJson('trace_samples', 'w284_connected_build_response_shape_bridge_trace.json');
  const w283Trace = readArchiveJson('trace_samples', 'w283_connected_build_response_shape_contract_trace.json');
  const w282Trace = readArchiveJson('trace_samples', 'w282_connected_build_boundary_inventory_trace.json');
  const w281Trace = readArchiveJson('trace_samples', 'w281_adapter_profile_readiness_contract_migration_trace.json');
  const state = motionState(hooks);
  const context = motionContext(hooks, state);
  const completedResult = completedMotionResult({ prefix: '287' });
  const submitRaw = submitResponse('runner-w287-motion-001', 'motion-w287-token');
  const completedRaw = completedRefreshResponse('runner-w287-motion-001', completedResult);
  const refreshOptions = { phase: 'refresh', runnerTaskId: 'runner-w287-motion-001', idempotencyToken: 'motion-w287-token' };
  const completedShape = hooks.actualAdapterResponseShapeW265(completedRaw, refreshOptions);
  const bridgeValidation = responseBridge.validateResponseShape(completedShape, completedRaw, refreshOptions);
  const completedGuard = hooks.validateDccFinalNamingImportPayload(completedShape.finalGeneratedNamesJson, state, context.lane, context.page, context.recommendation);
  const semanticGuard = hooks.completedRunnerResultSemanticGuardW214(completedGuard.finalNaming, state, context.lane, completedShape.finalGeneratedNamesJson);
  const normalizedImport = hooks.canonicalImportResultNormalizationW245(completedShape.finalGeneratedNamesJson, state, context.lane, context.page, context.recommendation);
  const finishEligible = eligibility.evaluateCompletedResultImportEligibility(eligibleFacts({
    completedResultJson: completedShape.finalGeneratedNamesJson,
    w151: completedGuard,
    w214: semanticGuard,
    w245: normalizedImport
  }));
  const missingCompleted = eligibility.evaluateCompletedResultImportEligibility(eligibleFacts({
    completedResultJsonPresent: false,
    completedResultJson: null
  }));
  const w151Rejected = eligibility.evaluateCompletedResultImportEligibility(eligibleFacts({
    w151Valid: false,
    w151ValidationStatus: 'handoff_packet_rejected'
  }));
  const w214Blocked = eligibility.evaluateCompletedResultImportEligibility(eligibleFacts({
    w214Valid: false,
    w214SemanticGuardStatus: 'operating_mode_record_contract_failed'
  }));
  const w245NotReady = eligibility.evaluateCompletedResultImportEligibility(eligibleFacts({
    w245CanonicalNormalizationReady: false,
    w245NormalizationStatus: 'no_valid_display_ready_records'
  }));
  const blocked = eligibility.evaluateCompletedResultImportEligibility(eligibleFacts({
    finishBuildCtaEligible: false
  }));
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
    runnerTaskId: 'runner-w287-motion-001',
    idempotencyToken: 'motion-w287-token',
    completedResultAccepted: true
  });
  const waitingState = motionState(hooks, {
    integratedBuildRunnerResult: {
      schema: 'idb.approved-server-adapter-result-envelope.v1',
      status: 'queued_result_capture_pending',
      queueSubmitted: true,
      runnerTaskId: 'runner-w287-motion-001',
      idempotencyToken: 'motion-w287-token',
      resultCapture: { status: 'pending_runner_completion', runnerTaskId: 'runner-w287-motion-001' }
    }
  });
  const waitingContext = motionContext(hooks, waitingState);
  const waitingHtml = hooks.renderIntegratedBuildRunnerReturnStatus(waitingState, waitingContext.lane, waitingContext.page, waitingContext.recommendation);
  const completedState = motionState(hooks, {
    integratedBuildRunnerResult: {
      schema: 'idb.approved-server-adapter-result-envelope.v1',
      status: 'completed_result_available',
      queueSubmitted: true,
      runnerTaskId: 'runner-w287-motion-001',
      idempotencyToken: 'motion-w287-token',
      finalGeneratedNamesJsonReady: true,
      finalGeneratedNamesJson: completedResult,
      resultCapture: {
        status: 'completed_result_capture_ready',
        runnerTaskId: 'runner-w287-motion-001',
        finalGeneratedNamesJson: completedResult
      }
    }
  });
  const completedContext = motionContext(hooks, completedState);
  const completedHtml = hooks.renderIntegratedBuildRunnerReturnStatus(completedState, completedContext.lane, completedContext.page, completedContext.recommendation);

  assertCase(results, 'completed-result-import-eligibility-contract-exists',
    eligibility.COMPLETED_RESULT_IMPORT_ELIGIBILITY_SCHEMA_VERSION === 'forge.w287.completed-result-import-eligibility.v1' &&
      eligibility.contractSummary().status === 'contract_ready' &&
      /W287 Completed Result Import Eligibility Contract/.test(report) &&
      trace.contractModule === 'src/contracts/completedResultImportEligibility.js',
    JSON.stringify(eligibility.contractSummary()));

  assertCase(results, 'contract-represents-required-inputs-and-statuses',
    [
      'completedResultJsonPresent',
      'w151ValidationStatus',
      'w214SemanticGuardStatus',
      'w245CanonicalNormalizationReady',
      'generatedRecordOwner',
      'governedRunnerOwnerValid',
      'finishBuildCtaEligible',
      'openLinkPreconditions',
      'w218SuccessWordingPreserved',
      'w220RecoveryWordingPreserved',
      'rawEvidencePolicy'
    ].every((item) => eligibility.REQUIRED_INPUTS.indexOf(item) >= 0) &&
      trace.statuses.every((status) => eligibility.contractSummary().statuses.indexOf(status) >= 0) &&
      trace.representedInputs.length >= 10,
    JSON.stringify({ inputs: eligibility.REQUIRED_INPUTS, statuses: eligibility.contractSummary().statuses }));

  assertCase(results, 'eligible-facts-produce-finish-build-eligible',
    finishEligible.status === 'finish_build_eligible' &&
      finishEligible.finishBuildEligible === true &&
      finishEligible.blockedReasons.length === 0 &&
      finishEligible.openLinkPreconditionsReady === true,
    JSON.stringify(finishEligible));

  assertCase(results, 'missing-completed-result-produces-missing-completed-result',
    missingCompleted.status === 'missing_completed_result' &&
      missingCompleted.finishBuildEligible === false &&
      missingCompleted.blockedReasons.indexOf('completed_result_json_missing') >= 0,
    JSON.stringify(missingCompleted));

  assertCase(results, 'w151-rejected-facts-produce-w151-rejected',
    w151Rejected.status === 'w151_rejected' &&
      w151Rejected.finishBuildEligible === false &&
      w151Rejected.blockedReasons.indexOf('w151_validation_not_accepted') >= 0,
    JSON.stringify(w151Rejected));

  assertCase(results, 'w214-semantic-blocked-facts-produce-w214-semantic-blocked',
    w214Blocked.status === 'w214_semantic_blocked' &&
      w214Blocked.finishBuildEligible === false &&
      w214Blocked.blockedReasons.indexOf('w214_semantic_guard_not_accepted') >= 0,
    JSON.stringify(w214Blocked));

  assertCase(results, 'w245-not-ready-facts-produce-w245-normalization-not-ready',
    w245NotReady.status === 'w245_normalization_not_ready' &&
      w245NotReady.finishBuildEligible === false &&
      w245NotReady.blockedReasons.indexOf('w245_canonical_normalization_not_ready') >= 0,
    JSON.stringify(w245NotReady));

  assertCase(results, 'finish-build-blocked-status-remains-distinct',
    blocked.status === 'finish_build_blocked' &&
      blocked.finishBuildEligible === false &&
      blocked.blockedReasons.indexOf('finish_build_cta_not_eligible') >= 0,
    JSON.stringify(blocked));

  assertCase(results, 'contract-cannot-mutate-import-create-write-or-open-links',
    finishEligible.runtimeBoundary.noStateMutation === true &&
      finishEligible.runtimeBoundary.noRecordImport === true &&
      finishEligible.runtimeBoundary.noRecordCreation === true &&
      finishEligible.runtimeBoundary.noTransactionWrites === true &&
      finishEligible.runtimeBoundary.noOpenLinkCreation === true &&
      finishEligible.runtimeBoundary.finishBuildMutationStaysDrawerOwned === true &&
      trace.runtimeBoundary.noStateMutation === true &&
      trace.runtimeBoundary.finishBuildMutationStaysDrawerOwned === true,
    JSON.stringify(finishEligible.runtimeBoundary));

  assertCase(results, 'w218-w220-and-admin-only-raw-evidence-policy-represented',
    finishEligible.wordingPreservation.w218SuccessWordingPreserved === true &&
      finishEligible.wordingPreservation.w220RecoveryWordingPreserved === true &&
      finishEligible.rawEvidencePolicy.adminOnly === true &&
      finishEligible.rawEvidencePolicy.archivedOnly === true &&
      finishEligible.rawEvidencePolicy.hiddenFromNormalConsultantUi === true &&
      trace.runtimeBoundary.contractNotWiredIntoDrawerRuntime === true,
    JSON.stringify({ wording: finishEligible.wordingPreservation, rawEvidence: finishEligible.rawEvidencePolicy }));

  assertCase(results, 'module-not-wired-into-drawer-runtime-and-drawer-self-contained',
    !/require\(['\"][^'\"]*completedResultImportEligibility/.test(userscript) &&
      !/src\/contracts\/completedResultImportEligibility\.js/.test(userscript) &&
      trace.runtimeBoundary.drawerSelfContained === true &&
      trace.runtimeBoundary.noRuntimeRequireAdded === true &&
      trace.runtimeBoundary.noExternalDependencyAdded === true &&
      trace.runtimeBoundary.noBundlerRequirementAdded === true &&
      trace.runtimeBoundary.noNetworkDependencyAdded === true &&
      trace.runtimeBoundary.noStorageWriteAddedForContractLoading === true,
    JSON.stringify(trace.runtimeBoundary));

  assertCase(results, 'w286-import-guard-boundary-map-remains-available',
    w286Trace.schema === 'forge.w286.connected-build-import-guard-boundary-map.trace.v1' &&
      w286Trace.selectedFutureMicroSlice.id === 'completed_result_import_eligibility_contract_w287' &&
      trace.continuity.w286ImportGuardBoundaryMapAvailable === true,
    JSON.stringify({ w286: w286Trace.schema, selected: w286Trace.selectedFutureMicroSlice.id }));

  assertCase(results, 'w285-remains-field-compatible-with-w284',
    w285Trace.status === 'runtime_migration_parity_ready' &&
      bridgeValidation.status === 'field_compatible' &&
      bridgeValidation.contractStatus === 'completed_result_shape_ready' &&
      completedShape.guardrails.w245W151ValidationStillRequired === true &&
      trace.continuity.w285ResponseShapeRuntimeMigrationAvailable === true,
    JSON.stringify({ w285: w285Trace.status, bridge: bridgeValidation.status }));

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
      commitWithoutChoice.commitAllowed === false &&
      commitWithoutChoice.blockedReason === 'operator_import_choice_required',
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
      trace.continuity.w245CanonicalImportChanged === false &&
      trace.continuity.w151ValidationChanged === false &&
      trace.continuity.w214SemanticGuardChanged === false,
    JSON.stringify({ completedGuard: completedGuard.status, semanticGuard: semanticGuard.status, normalizedImport: normalizedImport.status }));

  assertCase(results, 'returned-records-labels-open-links-preserved-after-valid-import',
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

  assertCase(results, 'w287-harness-and-check-registration-present',
    packageJson.scripts['harness:completed-result-import-eligibility-contract-w287'] === 'node archive/tools/run_w287_completed_result_import_eligibility_contract_harness.js' &&
      packageJson.scripts.check.indexOf('src/contracts/completedResultImportEligibility.js') >= 0 &&
      packageJson.scripts.check.indexOf('archive/tools/run_w287_completed_result_import_eligibility_contract_harness.js') >= 0,
    JSON.stringify(packageJson.scripts['harness:completed-result-import-eligibility-contract-w287']));

  printResults('W287 completed result import eligibility contract harness', results);
}

main();
