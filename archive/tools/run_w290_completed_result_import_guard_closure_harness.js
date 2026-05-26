#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
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
  const hooks = loadHooks({ fetchMessage: 'live fetch disabled in W290 harness' });
  const userscript = read(userscriptPath);
  const packageJson = JSON.parse(readRepoFile('package.json'));
  const report = readArchiveText('reports', 'w290_completed_result_import_guard_closure_map.md');
  const trace = readArchiveJson('trace_samples', 'w290_completed_result_import_guard_closure_trace.json');
  const w286Trace = readArchiveJson('trace_samples', 'w286_connected_build_import_guard_boundary_map_trace.json');
  const w287Trace = readArchiveJson('trace_samples', 'w287_completed_result_import_eligibility_contract_trace.json');
  const w288Trace = readArchiveJson('trace_samples', 'w288_completed_result_import_eligibility_bridge_trace.json');
  const w289Trace = readArchiveJson('trace_samples', 'w289_completed_result_import_eligibility_runtime_migration_trace.json');
  const state = motionState(hooks);
  const context = motionContext(hooks, state);
  const completedResult = completedMotionResult({ prefix: '290' });
  const submitRaw = submitResponse('runner-w290-motion-001', 'motion-w290-token');
  const completedRaw = completedRefreshResponse('runner-w290-motion-001', completedResult);
  const refreshOptions = { phase: 'refresh', runnerTaskId: 'runner-w290-motion-001', idempotencyToken: 'motion-w290-token' };
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
  const drawerEligibilityOutputs = {
    eligible: { drawerEligibility: hooks.completedResultImportEligibilityShapeW289(eligibleFacts), facts: eligibleFacts },
    missingCompleted: { drawerEligibility: hooks.completedResultImportEligibilityShapeW289(facts({ completedResultJsonPresent: false, completedResultJson: null })), facts: facts({ completedResultJsonPresent: false, completedResultJson: null }) },
    w151Rejected: { drawerEligibility: hooks.completedResultImportEligibilityShapeW289(facts({ w151Valid: false, w151ValidationStatus: 'handoff_packet_rejected' })), facts: facts({ w151Valid: false, w151ValidationStatus: 'handoff_packet_rejected' }) },
    w214Blocked: { drawerEligibility: hooks.completedResultImportEligibilityShapeW289(facts({ w214Valid: false, w214SemanticGuardStatus: 'operating_mode_record_contract_failed' })), facts: facts({ w214Valid: false, w214SemanticGuardStatus: 'operating_mode_record_contract_failed' }) },
    w245NotReady: { drawerEligibility: hooks.completedResultImportEligibilityShapeW289(facts({ w245CanonicalNormalizationReady: false, w245NormalizationStatus: 'no_valid_display_ready_records' })), facts: facts({ w245CanonicalNormalizationReady: false, w245NormalizationStatus: 'no_valid_display_ready_records' }) },
    finishBuildBlocked: { drawerEligibility: hooks.completedResultImportEligibilityShapeW289(facts({ finishBuildCtaEligible: false })), facts: facts({ finishBuildCtaEligible: false }) }
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
    runnerTaskId: 'runner-w290-motion-001',
    idempotencyToken: 'motion-w290-token',
    completedResultAccepted: true
  });
  const waitingState = motionState(hooks, {
    integratedBuildRunnerResult: {
      schema: 'idb.approved-server-adapter-result-envelope.v1',
      status: 'queued_result_capture_pending',
      queueSubmitted: true,
      runnerTaskId: 'runner-w290-motion-001',
      idempotencyToken: 'motion-w290-token',
      resultCapture: { status: 'pending_runner_completion', runnerTaskId: 'runner-w290-motion-001' }
    }
  });
  const waitingContext = motionContext(hooks, waitingState);
  const waitingHtml = hooks.renderIntegratedBuildRunnerReturnStatus(waitingState, waitingContext.lane, waitingContext.page, waitingContext.recommendation);
  const completedState = motionState(hooks, {
    integratedBuildRunnerResult: {
      schema: 'idb.approved-server-adapter-result-envelope.v1',
      status: 'completed_result_available',
      queueSubmitted: true,
      runnerTaskId: 'runner-w290-motion-001',
      idempotencyToken: 'motion-w290-token',
      finalGeneratedNamesJsonReady: true,
      finalGeneratedNamesJson: completedResult,
      resultCapture: {
        status: 'completed_result_capture_ready',
        runnerTaskId: 'runner-w290-motion-001',
        finalGeneratedNamesJson: completedResult
      }
    }
  });
  const completedContext = motionContext(hooks, completedState);
  const completedHtml = hooks.renderIntegratedBuildRunnerReturnStatus(completedState, completedContext.lane, completedContext.page, completedContext.recommendation);

  assertCase(results, 'w286-through-w289-closure-map-exists',
    /W290 Completed Result Import Guard Closure Map/.test(report) &&
      trace.schema === 'forge.w290.completed-result-import-guard-closure.trace.v1' &&
      trace.status === 'closure_and_returned_record_readiness_ready' &&
      trace.closureMap.layers.length === 4,
    JSON.stringify({ schema: trace.schema, layers: trace.closureMap.layers.length }));

  assertCase(results, 'closure-map-includes-all-four-layers',
    [
      'w286_connected_build_import_guard_boundary_map',
      'w287_completed_result_import_eligibility_contract',
      'w288_completed_result_import_eligibility_bridge',
      'w289_drawer_local_eligibility_runtime_shape_migration'
    ].every((id) => trace.closureMap.layers.some((layer) => layer.id === id)) &&
      /W286 connected-build import guard boundary map/.test(report) &&
      /W287 completed-result import eligibility contract/.test(report) &&
      /W288 completed-result import eligibility bridge/.test(report) &&
      /W289 drawer-local eligibility runtime shape migration/.test(report),
    JSON.stringify(trace.closureMap.layers.map((layer) => layer.id)));

  assertCase(results, 'each-layer-maps-source-governance-drawer-owned-harnesses-rollback',
    trace.closureMap.layers.every((layer) => layer.sourceDrawerHelperSurfaceProtected.length > 0 &&
      layer.governingContractOrBridge &&
      layer.drawerOwnedBehaviorThatStayedInPlace.length > 0 &&
      layer.parityHarnesses.length > 0 &&
      layer.rollbackBoundary) &&
      /Source drawer\/helper surface protected/.test(report) &&
      /Governing contract or bridge/.test(report) &&
      /Drawer-owned behavior that stayed in place/.test(report) &&
      /Rollback boundary/.test(report),
    JSON.stringify(trace.closureMap.layers.map((layer) => ({ id: layer.id, harnesses: layer.parityHarnesses }))));

  assertCase(results, 'returned-record-import-readiness-inventory-complete',
    [
      'w245_canonical_display_ready_normalization',
      'display_ready_returned_record_collection',
      'lane_aware_labels',
      'supported_open_link_authority',
      'w218_success_wording',
      'w220_recovery_wording',
      'review_run_story_surface_update_inputs',
      'admin_only_raw_evidence'
    ].every((id) => trace.returnedRecordImportReadinessInventory.areas.some((area) => area.id === id)) &&
      /W245 canonical display-ready normalization/.test(report) &&
      /Display-ready returned record collection/.test(report) &&
      /Lane-aware labels/.test(report) &&
      /Supported Open-link authority/.test(report) &&
      /Review\/Run story surface update inputs/.test(report),
    JSON.stringify(trace.returnedRecordImportReadinessInventory.areas.map((area) => area.id)));

  assertCase(results, 'selected-next-micro-slice-is-narrow-returned-record-shape-and-open-link-authority',
    trace.selectedNextMicroSlice.id === 'returned_record_display_ready_import_contract_w291' &&
      trace.selectedNextMicroSlice.proposedContractModule === 'src/contracts/returnedRecordDisplayReadyImport.js' &&
      trace.selectedNextMicroSlice.proposedBridgeModule === 'src/contracts/returnedRecordDisplayReadyImportBridge.js' &&
      trace.selectedNextMicroSlice.targetsReturnedRecordDisplayReadyShapeAndOpenLinkAuthority === true &&
      trace.selectedNextMicroSlice.movesFinishBuildStateMutation === false &&
      trace.selectedNextMicroSlice.movesVisibleUILayout === false &&
      trace.selectedNextMicroSlice.movesW151W214W245Validation === false &&
      /not move Finish build mutation/.test(report) &&
      /not state mutation or visible UI layout/.test(report),
    JSON.stringify(trace.selectedNextMicroSlice));

  assertCase(results, 'selected-slice-includes-source-target-behavior-harness-review-rollback',
    trace.selectedNextMicroSlice.sourceHelperAnchors.indexOf('canonicalImportResultNormalizationW245') >= 0 &&
      trace.selectedNextMicroSlice.sourceHelperAnchors.indexOf('displayReadyRecordsFromFinalNamingW245') >= 0 &&
      trace.selectedNextMicroSlice.sourceHelperAnchors.indexOf('lanePackAwareRecordLabelW250') >= 0 &&
      trace.selectedNextMicroSlice.sourceHelperAnchors.indexOf('verifiedRecordLinkAuthorityV1') >= 0 &&
      trace.selectedNextMicroSlice.behaviorSurfacesThatMustRemainIdentical.length >= 10 &&
      trace.selectedNextMicroSlice.parityHarnesses.indexOf('future W291') >= 0 &&
      trace.selectedNextMicroSlice.manualReviewNotes.some((note) => /Do not move W151\/W214\/W245 validation/.test(note)) &&
      /Rollback Plan/.test(report),
    JSON.stringify(trace.selectedNextMicroSlice));

  assertCase(results, 'w289-runtime-migration-remains-field-compatible-with-w288',
    w289Trace.schema === 'forge.w289.completed-result-import-eligibility-runtime-migration.trace.v1' &&
      bridge.status === 'bridge_ready' &&
      bridge.validations.length === 6 &&
      bridge.validations.every(compatible) &&
      trace.continuity.w289RuntimeMigrationFieldCompatibleWithW288 === true,
    JSON.stringify(bridge.validations.map((item) => ({ status: item.status, contractStatus: item.contractStatus }))));

  assertCase(results, 'w288-w287-w286-remain-available-and-unchanged',
    w288Trace.schema === 'forge.w288.completed-result-import-eligibility-bridge.trace.v1' &&
      w287Trace.schema === 'forge.w287.completed-result-import-eligibility-contract.trace.v1' &&
      w286Trace.schema === 'forge.w286.connected-build-import-guard-boundary-map.trace.v1' &&
      trace.continuity.w288BridgeAvailableAndUnchanged === true &&
      trace.continuity.w287ContractAvailableAndUnchanged === true &&
      trace.continuity.w286ImportGuardBoundaryMapAvailableAndUnchanged === true,
    JSON.stringify({ w288: w288Trace.schema, w287: w287Trace.schema, w286: w286Trace.schema }));

  assertCase(results, 'finish-build-state-mutation-remains-drawer-owned',
    commitWithoutChoice.commitAllowed === false &&
      commitWithoutChoice.blockedReason === 'operator_import_choice_required' &&
      commitWithChoice.commitAllowed === true &&
      commitWithChoice.importEligibilityW289.runtimeBoundary.finishBuildMutationStaysDrawerOwned === true &&
      commitWithChoice.mutationGuard.finalGeneratedNamesMutatedOnlyByOperatorImport === true &&
      trace.continuity.finishBuildStateMutationDrawerOwned === true,
    JSON.stringify({ withoutChoice: commitWithoutChoice.blockedReason, withChoice: commitWithChoice.status }));

  assertCase(results, 'actual-submit-and-refresh-poll-execution-remain-drawer-owned',
    submitCalls.length === 1 &&
      pollCalls.length === 1 &&
      w264Flow.status === 'records_imported' &&
      /function connectedBuildSubmitRefreshImportW264/.test(userscript) &&
      /submitTransport/.test(userscript) &&
      /pollTransport/.test(userscript) &&
      trace.continuity.actualSubmitExecutionDrawerOwned === true &&
      trace.continuity.actualRefreshPollExecutionDrawerOwned === true,
    JSON.stringify({ status: w264Flow.status, submitCalls: submitCalls.length, pollCalls: pollCalls.length }));

  assertCase(results, 'w264-submit-refresh-import-remains-unchanged',
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

  assertCase(results, 'returned-record-names-labels-and-open-links-preserved',
    w264Flow.importedRecords.some((record) => record.name === 'Motion Branch Fulfillment SKU' && /Product SKU/i.test(record.label)) &&
      w264Flow.importedRecords.some((record) => record.name === 'Motion Availability Proof Flow' && /Availability|Replenishment/i.test(record.label)) &&
      w264Flow.importedRecords.every((record) => record.linkAuthority && record.linkAuthority.openable === true && /^https:\/\/td3021666\.app\.netsuite\.com\//.test(record.openUrl)) &&
      normalizedImport.displayReadyRecords.every((record) => (record.id || record.internalId) && (record.openUrl || record.supportedOpenUrl || record.openableUrl) && record.linkAuthority && record.linkAuthority.openable === true) &&
      trace.continuity.returnedRecordNamesLabelsOpenLinksChanged === false,
    w264Flow.importedRecords.map((record) => `${record.label}:${record.name}:${record.openUrl}`).join(' | '));

  assertCase(results, 'fake-links-blocked-before-valid-import',
    !/Open<\/a>/.test(waitingHtml) &&
      /Refresh build status/.test(waitingHtml) &&
      /Finish build/.test(completedHtml) &&
      trace.continuity.fakeLinkBlockingChanged === false,
    (waitingHtml + completedHtml).slice(0, 1200));

  assertCase(results, 'normal-consultant-ui-hides-endpoint-profile-raw-admin-diagnostics',
    !/script=6702|deploy=2|customdeployidb_governed_runner_adapter|td3021666\.app\.netsuite\.com|runnerTaskId|raw json|schema|stack trace|admin diagnostics|transport boundary|operator gate|server flags|completedResultImportEligibility/i.test(waitingHtml + completedHtml) &&
      trace.guardrails.normalConsultantUiHidesEndpointProfileRawAdminDiagnostics === true,
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

  assertCase(results, 'w290-harness-and-check-registration-present',
    packageJson.scripts['harness:completed-result-import-guard-closure-w290'] === 'node archive/tools/run_w290_completed_result_import_guard_closure_harness.js' &&
      packageJson.scripts.check.indexOf('archive/tools/run_w290_completed_result_import_guard_closure_harness.js') >= 0,
    JSON.stringify(packageJson.scripts['harness:completed-result-import-guard-closure-w290']));

  printResults('W290 completed result import guard closure harness', results);
}

main();
