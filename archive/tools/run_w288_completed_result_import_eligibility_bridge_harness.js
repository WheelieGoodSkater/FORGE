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
  const hooks = loadHooks({ fetchMessage: 'live fetch disabled in W288 harness' });
  const userscript = read(userscriptPath);
  const packageJson = JSON.parse(readRepoFile('package.json'));
  const report = readArchiveText('reports', 'w288_completed_result_import_eligibility_bridge.md');
  const trace = readArchiveJson('trace_samples', 'w288_completed_result_import_eligibility_bridge_trace.json');
  const w287Trace = readArchiveJson('trace_samples', 'w287_completed_result_import_eligibility_contract_trace.json');
  const w286Trace = readArchiveJson('trace_samples', 'w286_connected_build_import_guard_boundary_map_trace.json');
  const w285Trace = readArchiveJson('trace_samples', 'w285_connected_build_response_shape_runtime_migration_trace.json');
  const w284Trace = readArchiveJson('trace_samples', 'w284_connected_build_response_shape_bridge_trace.json');
  const w283Trace = readArchiveJson('trace_samples', 'w283_connected_build_response_shape_contract_trace.json');
  const w282Trace = readArchiveJson('trace_samples', 'w282_connected_build_boundary_inventory_trace.json');
  const w281Trace = readArchiveJson('trace_samples', 'w281_adapter_profile_readiness_contract_migration_trace.json');
  const state = motionState(hooks);
  const context = motionContext(hooks, state);
  const completedResult = completedMotionResult({ prefix: '288' });
  const submitRaw = submitResponse('runner-w288-motion-001', 'motion-w288-token');
  const completedRaw = completedRefreshResponse('runner-w288-motion-001', completedResult);
  const refreshOptions = { phase: 'refresh', runnerTaskId: 'runner-w288-motion-001', idempotencyToken: 'motion-w288-token' };
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
  const bridge = eligibilityBridge.bridgeCompletedResultImportEligibility({
    eligible: { drawerEligibility: eligibility.evaluateCompletedResultImportEligibility(eligibleFacts), facts: eligibleFacts },
    missingCompleted: { drawerEligibility: eligibility.evaluateCompletedResultImportEligibility(missingFacts), facts: missingFacts },
    w151Rejected: { drawerEligibility: eligibility.evaluateCompletedResultImportEligibility(w151Facts), facts: w151Facts },
    w214Blocked: { drawerEligibility: eligibility.evaluateCompletedResultImportEligibility(w214Facts), facts: w214Facts },
    w245NotReady: { drawerEligibility: eligibility.evaluateCompletedResultImportEligibility(w245Facts), facts: w245Facts },
    finishBuildBlocked: { drawerEligibility: eligibility.evaluateCompletedResultImportEligibility(blockedFacts), facts: blockedFacts }
  });
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
    runnerTaskId: 'runner-w288-motion-001',
    idempotencyToken: 'motion-w288-token',
    completedResultAccepted: true
  });
  const waitingState = motionState(hooks, {
    integratedBuildRunnerResult: {
      schema: 'idb.approved-server-adapter-result-envelope.v1',
      status: 'queued_result_capture_pending',
      queueSubmitted: true,
      runnerTaskId: 'runner-w288-motion-001',
      idempotencyToken: 'motion-w288-token',
      resultCapture: { status: 'pending_runner_completion', runnerTaskId: 'runner-w288-motion-001' }
    }
  });
  const waitingContext = motionContext(hooks, waitingState);
  const waitingHtml = hooks.renderIntegratedBuildRunnerReturnStatus(waitingState, waitingContext.lane, waitingContext.page, waitingContext.recommendation);
  const completedState = motionState(hooks, {
    integratedBuildRunnerResult: {
      schema: 'idb.approved-server-adapter-result-envelope.v1',
      status: 'completed_result_available',
      queueSubmitted: true,
      runnerTaskId: 'runner-w288-motion-001',
      idempotencyToken: 'motion-w288-token',
      finalGeneratedNamesJsonReady: true,
      finalGeneratedNamesJson: completedResult,
      resultCapture: {
        status: 'completed_result_capture_ready',
        runnerTaskId: 'runner-w288-motion-001',
        finalGeneratedNamesJson: completedResult
      }
    }
  });
  const completedContext = motionContext(hooks, completedState);
  const completedHtml = hooks.renderIntegratedBuildRunnerReturnStatus(completedState, completedContext.lane, completedContext.page, completedContext.recommendation);

  assertCase(results, 'completed-result-import-eligibility-bridge-exists',
    eligibilityBridge.COMPLETED_RESULT_IMPORT_ELIGIBILITY_BRIDGE_SCHEMA_VERSION === 'forge.w288.completed-result-import-eligibility-bridge.v1' &&
      eligibilityBridge.exportedContractSummary().status === 'bridge_contract_ready' &&
      /W288 Completed Result Import Eligibility Bridge/.test(report) &&
      trace.bridgeModule === 'src/contracts/completedResultImportEligibilityBridge.js',
    JSON.stringify(eligibilityBridge.exportedContractSummary()));

  assertCase(results, 'bridge-validates-against-w287-contract',
    bridge.status === 'bridge_ready' &&
      bridge.governingContract === eligibility.COMPLETED_RESULT_IMPORT_ELIGIBILITY_SCHEMA_VERSION &&
      trace.governingContract === 'src/contracts/completedResultImportEligibility.js' &&
      trace.validatedStatuses.length === 6,
    JSON.stringify({ bridgeStatus: bridge.status, governingContract: bridge.governingContract }));

  assertCase(results, 'eligible-and-blocked-cases-field-compatible',
    bridge.validations.length === 6 &&
      bridge.validations.every(compatible) &&
      bridge.validations.map((item) => item.contractStatus).join('|') === 'finish_build_eligible|missing_completed_result|w151_rejected|w214_semantic_blocked|w245_normalization_not_ready|finish_build_blocked',
    JSON.stringify(bridge.validations.map((item) => ({ status: item.status, contractStatus: item.contractStatus }))));

  assertCase(results, 'bridge-does-not-move-finish-build-mutation',
    bridge.runtimeBoundary.finishBuildMutationStaysDrawerOwned === true &&
      commitWithoutChoice.commitAllowed === false &&
      commitWithoutChoice.blockedReason === 'operator_import_choice_required' &&
      trace.runtimeBoundary.finishBuildMutationStaysDrawerOwned === true,
    JSON.stringify({ bridgeBoundary: bridge.runtimeBoundary, commitWithoutChoice: commitWithoutChoice.blockedReason }));

  assertCase(results, 'bridge-cannot-mutate-import-create-write-or-create-links',
    bridge.runtimeBoundary.noStateMutation === true &&
      bridge.runtimeBoundary.noRecordImport === true &&
      bridge.runtimeBoundary.noRecordCreation === true &&
      bridge.runtimeBoundary.noTransactionWrites === true &&
      bridge.runtimeBoundary.noOpenLinkCreation === true &&
      bridge.validations.every((item) => Object.keys(item.guardrails).every((key) => item.guardrails[key] === true)),
    JSON.stringify(bridge.runtimeBoundary));

  assertCase(results, 'w218-w220-and-raw-evidence-policy-represented',
    bridge.validations.every((item) => item.rawEvidencePolicy.drawerAdminOnly === true &&
      item.rawEvidencePolicy.drawerArchivedOnly === true &&
      item.rawEvidencePolicy.drawerHiddenFromNormalConsultantUi === true &&
      item.rawEvidencePolicy.contractAdminOnly === true &&
      item.rawEvidencePolicy.contractArchivedOnly === true &&
      item.rawEvidencePolicy.contractHiddenFromNormalConsultantUi === true) &&
      trace.rawEvidencePolicy.archiveOnly === true &&
      trace.rawEvidencePolicy.hiddenFromNormalConsultantUi === true,
    JSON.stringify(bridge.validations.map((item) => item.rawEvidencePolicy)));

  assertCase(results, 'module-not-wired-into-drawer-runtime-and-drawer-self-contained',
    !/require\(['\"][^'\"]*completedResultImportEligibilityBridge/.test(userscript) &&
      !/require\(['\"][^'\"]*completedResultImportEligibility/.test(userscript) &&
      !/src\/contracts\/completedResultImportEligibilityBridge\.js/.test(userscript) &&
      !/src\/contracts\/completedResultImportEligibility\.js/.test(userscript) &&
      trace.runtimeBoundary.bridgeNotWiredIntoDrawerRuntime === true &&
      trace.runtimeBoundary.drawerSelfContained === true &&
      trace.runtimeBoundary.noRuntimeRequireAdded === true &&
      trace.runtimeBoundary.noExternalDependencyAdded === true &&
      trace.runtimeBoundary.noBundlerRequirementAdded === true &&
      trace.runtimeBoundary.noNetworkDependencyAdded === true &&
      trace.runtimeBoundary.noStorageWriteAddedForBridgeLoading === true,
    JSON.stringify(trace.runtimeBoundary));

  assertCase(results, 'w287-through-w281-continuity-remains-available',
    w287Trace.schema === 'forge.w287.completed-result-import-eligibility-contract.trace.v1' &&
      w286Trace.schema === 'forge.w286.connected-build-import-guard-boundary-map.trace.v1' &&
      w285Trace.schema === 'forge.w285.connected-build-response-shape-runtime-migration.trace.v1' &&
      w284Trace.schema === 'forge.w284.connected-build-response-shape-bridge.trace.v1' &&
      w283Trace.schema === 'forge.w283.connected-build-response-shape-contract.trace.v1' &&
      w282Trace.schema === 'forge.w282.connected-build-boundary-inventory.trace.v1' &&
      w281Trace.schema === 'forge.w281.adapter-profile-readiness-contract-migration.trace.v1' &&
      trace.continuity.w287EligibilityContractAvailable === true &&
      trace.continuity.w286ImportGuardBoundaryMapAvailable === true,
    JSON.stringify({ w287: w287Trace.schema, w286: w286Trace.schema, w285: w285Trace.schema }));

  assertCase(results, 'w264-w265-w245-w151-w214-behavior-remains-unchanged',
    submitCalls.length === 1 &&
      pollCalls.length === 1 &&
      w264Flow.status === 'records_imported' &&
      retryPolicy.duplicateSubmit.allowed === false &&
      retryPolicy.afterAdapterError.allowedAutomatically === false &&
      completedGuard.valid === true &&
      semanticGuard.valid === true &&
      normalizedImport.status === 'display_ready_records_normalized' &&
      responseShapeValidation.status === 'field_compatible' &&
      trace.continuity.w264SubmitRefreshImportChanged === false &&
      trace.continuity.w265RetrySafetyChanged === false &&
      trace.continuity.w245CanonicalImportChanged === false &&
      trace.continuity.w151ValidationChanged === false &&
      trace.continuity.w214SemanticGuardChanged === false,
    JSON.stringify({ w264: w264Flow.status, retry: retryPolicy.finishBuild, guards: [completedGuard.status, semanticGuard.status, normalizedImport.status] }));

  assertCase(results, 'returned-records-open-links-and-fake-link-blocking-preserved',
    w264Flow.importedRecords.some((record) => record.name === 'Motion Branch Fulfillment SKU' && /Product SKU/i.test(record.label)) &&
      w264Flow.importedRecords.some((record) => record.name === 'Motion Availability Proof Flow' && /Availability|Replenishment/i.test(record.label)) &&
      w264Flow.importedRecords.every((record) => record.linkAuthority && record.linkAuthority.openable === true && /^https:\/\/td3021666\.app\.netsuite\.com\//.test(record.openUrl)) &&
      !/Open<\/a>/.test(waitingHtml) &&
      trace.continuity.returnedRecordsOpenLinksChanged === false &&
      trace.continuity.fakeLinkBlockingChanged === false,
    w264Flow.importedRecords.map((record) => `${record.label}:${record.name}:${record.openUrl}`).join(' | '));

  assertCase(results, 'normal-consultant-ui-hides-diagnostics',
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
    JSON.stringify(trace.guardrails));

  assertCase(results, 'w288-harness-and-check-registration-present',
    packageJson.scripts['harness:completed-result-import-eligibility-bridge-w288'] === 'node archive/tools/run_w288_completed_result_import_eligibility_bridge_harness.js' &&
      packageJson.scripts.check.indexOf('src/contracts/completedResultImportEligibilityBridge.js') >= 0 &&
      packageJson.scripts.check.indexOf('archive/tools/run_w288_completed_result_import_eligibility_bridge_harness.js') >= 0,
    JSON.stringify(packageJson.scripts['harness:completed-result-import-eligibility-bridge-w288']));

  printResults('W288 completed result import eligibility bridge harness', results);
}

main();
