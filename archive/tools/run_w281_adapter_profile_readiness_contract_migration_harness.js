#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const adapterProfiles = require('../../src/contracts/adapterProfiles');
const adapterReadinessBridge = require('../../src/contracts/adapterReadinessBridge');
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
  userscriptPath
} = require('./lib/forge_harness_fixtures');

function readRepoFile(...parts) {
  return fs.readFileSync(path.join(root, ...parts), 'utf8');
}

function previewState(hooks) {
  return motionState(hooks, {
    integratedBuildAdapterConfig: {
      adapterProfileDisabled: true,
      adapterProfiles: [],
      selectedAdapterProfileId: '',
      endpointUrl: '',
      adapterApproved: false,
      CREATE_ENABLED: false,
      GOVERNED_SANDBOX_WRITE_ENABLED: false,
      QUEUE_SUBMIT_ENABLED: false,
      sandboxAccountAllowlist: [],
      productionBuildModeEnabled: false,
      mode: 'production_build_saved_admin_config'
    }
  });
}

function runnerState(hooks, status) {
  const result = {
    schema: 'idb.approved-server-adapter-result-envelope.v1',
    status,
    queueSubmitted: true,
    runnerTaskId: 'runner-w281-motion-001',
    idempotencyToken: 'motion-w281-token',
    resultCapture: { status: 'pending_runner_completion', runnerTaskId: 'runner-w281-motion-001' }
  };
  if (status === 'completed_result_available') {
    result.finalGeneratedNamesJsonReady = true;
    result.finalGeneratedNamesJson = completedMotionResult({ prefix: '281' });
    result.resultCapture = {
      status: 'completed_result_capture_ready',
      runnerTaskId: 'runner-w281-motion-001',
      finalGeneratedNamesJson: completedMotionResult({ prefix: '281' })
    };
  }
  return motionState(hooks, { integratedBuildRunnerResult: result });
}

function readinessFacts() {
  return {
    previewOnly: {
      facts: { requestReady: true, endpointConfigured: false, adapterReady: false },
      expectedState: 'smoke_preview_only'
    },
    ready: {
      facts: { requestReady: true, endpointConfigured: true, adapterReady: true },
      expectedState: 'ready_to_build_records'
    },
    submitted: {
      facts: { requestReady: true, endpointConfigured: true, adapterReady: true, buildSubmitted: true },
      expectedState: 'build_submitted'
    },
    waiting: {
      facts: { requestReady: true, endpointConfigured: true, adapterReady: true, runnerTaskCaptured: true },
      expectedState: 'waiting_for_runner_result'
    },
    recordsReady: {
      facts: { requestReady: true, endpointConfigured: true, adapterReady: true, runnerTaskCaptured: true, completedResultReady: true },
      expectedState: 'records_ready_to_import'
    },
    imported: {
      facts: { requestReady: true, endpointConfigured: true, adapterReady: true, runnerTaskCaptured: true, completedResultReady: true, finalNamesImported: true },
      expectedState: 'records_imported'
    }
  };
}

function main() {
  const results = [];
  const hooks = loadHooks({ fetchMessage: 'live fetch disabled in W281 harness' });
  const userscript = read(userscriptPath);
  const packageJson = JSON.parse(readRepoFile('package.json'));
  const report = readArchiveText('reports', 'w281_adapter_profile_readiness_contract_migration.md');
  const trace = readArchiveJson('trace_samples', 'w281_adapter_profile_readiness_contract_migration_trace.json');
  const w280Trace = readArchiveJson('trace_samples', 'w280_contract_bridge_closure_runtime_extraction_readiness_trace.json');
  const drawerProfile = hooks.releasedAdapterProfileW263();
  const contractProfile = adapterProfiles.releasedAdapterProfile();
  const endpointValidation = adapterReadinessBridge.validateEndpointDerivation(drawerProfile, 'future281.app.netsuite.com');
  const profileValidation = adapterReadinessBridge.validateAdapterProfile(drawerProfile);
  const readyState = motionState(hooks);
  const readyContext = motionContext(hooks, readyState);
  const readyTrace = hooks.deployedAdapterReadinessTraceW263(readyState, readyContext.lane, readyContext.page, readyContext.recommendation);
  const readyHtml = hooks.renderIntegratedBuildRunnerReturnStatus(readyState, readyContext.lane, readyContext.page, readyContext.recommendation);
  const preview = previewState(hooks);
  const previewContext = motionContext(hooks, preview);
  const previewW262 = hooks.adapterReadyRecordCreationUxW262(preview, previewContext.lane, previewContext.page, previewContext.recommendation);
  const waiting = runnerState(hooks, 'queued_result_capture_pending');
  const waitingContext = motionContext(hooks, waiting);
  const waitingW262 = hooks.adapterReadyRecordCreationUxW262(waiting, waitingContext.lane, waitingContext.page, waitingContext.recommendation);
  const completed = runnerState(hooks, 'completed_result_available');
  const completedContext = motionContext(hooks, completed);
  const completedW262 = hooks.adapterReadyRecordCreationUxW262(completed, completedContext.lane, completedContext.page, completedContext.recommendation);
  const readyW262 = hooks.adapterReadyRecordCreationUxW262(readyState, readyContext.lane, readyContext.page, readyContext.recommendation);
  const w264Flow = hooks.connectedBuildSubmitRefreshImportW264(readyState, readyContext.lane, readyContext.page, readyContext.recommendation, {
    executeSubmit: true,
    executePoll: true,
    finishBuild: true,
    submitResponse: {
      status: 'queued_result_capture_pending',
      queueSubmitted: true,
      runnerTaskId: 'runner-w281-motion-001',
      idempotencyToken: 'motion-w281-token',
      resultCapture: { status: 'pending_runner_completion', runnerTaskId: 'runner-w281-motion-001' }
    },
    pollResponse: {
      status: 'completed_runner_result_ready',
      queueSubmitted: true,
      runnerTaskId: 'runner-w281-motion-001',
      resultCapture: {
        status: 'completed_result_capture_ready',
        runnerTaskId: 'runner-w281-motion-001',
        finalGeneratedNamesJson: completedMotionResult({ prefix: '281' })
      }
    }
  });
  const retryPolicy = hooks.connectedBuildRetryPolicyW265({
    runnerTaskId: 'runner-w281-motion-001',
    idempotencyToken: 'motion-w281-token',
    completedResultAccepted: true
  });

  assertCase(results, 'w280-selected-source-anchors-present-or-mapped',
    [
      'releasedAdapterProfileW263',
      'adapterProfileEndpointW263',
      'adapterProfilesFromConfigW263',
      'selectedAdapterProfileW263',
      'applySelectedAdapterProfileToConfigW263',
      'adapterReadyRecordCreationUxW262',
      'deployedAdapterReadinessTraceW263'
    ].every((anchor) => new RegExp(`function ${anchor}\\b`).test(userscript)) &&
      [
        'normalizeAdapterAccountHostW281',
        'normalizeAdapterSuiteletPathW281',
        'adapterProfileEndpointFromContractShapeW281',
        'adapterProfileWithContractShapeW281',
        'ADAPTER_READINESS_STATES_W281',
        'ADAPTER_READINESS_COPY_W281'
      ].every((anchor) => userscript.indexOf(anchor) >= 0) &&
      trace.selectedSourceAnchors.adapterProfileEndpointW263 === 'present',
    JSON.stringify(trace.selectedSourceAnchors));

  assertCase(results, 'released-w144-profile-values-exactly-unchanged',
    profileValidation.fieldCompatible === true &&
      drawerProfile.profileId === contractProfile.profileId &&
      drawerProfile.scriptName === 'IDB W144 Customer Proof Pilot Suitelet' &&
      drawerProfile.title === 'IDB W24 Customer Proof Pilot Suitelet' &&
      drawerProfile.deploymentScriptId === 'customdeployidb_governed_runner_adapter' &&
      drawerProfile.deploymentStatus === 'Released' &&
      drawerProfile.deployed === true &&
      drawerProfile.executeAsRole === 'Current Role' &&
      drawerProfile.logLevel === 'Error' &&
      drawerProfile.suiteletPath === '/app/site/hosting/scriptlet.nl?script=6702&deploy=2' &&
      String(drawerProfile.scriptId) === '6702' &&
      String(drawerProfile.deploymentId) === '2' &&
      trace.releasedProfile.defaultAccountHost === 'td3021666.app.netsuite.com',
    JSON.stringify({ drawerProfile, contractProfile, validation: profileValidation }));

  assertCase(results, 'endpoint-derives-from-account-host-plus-suitelet-path',
    endpointValidation.status === 'field_compatible' &&
      drawerProfile.fullEndpointUrl === 'https://td3021666.app.netsuite.com/app/site/hosting/scriptlet.nl?script=6702&deploy=2' &&
      endpointValidation.derivedEndpoint === drawerProfile.fullEndpointUrl &&
      /normalizeAdapterAccountHostW281/.test(userscript) &&
      /normalizeAdapterSuiteletPathW281/.test(userscript),
    JSON.stringify(endpointValidation));

  assertCase(results, 'future-dataset-account-host-can-swap-without-runtime-logic-change',
    endpointValidation.canSwapAccountHostWithoutRuntimeLogicChange === true &&
      endpointValidation.swappedEndpoint === 'https://future281.app.netsuite.com/app/site/hosting/scriptlet.nl?script=6702&deploy=2' &&
      readyTrace.datasetSwitching.canSwapAccountHostWithoutRuntimeLogicChange === true &&
      trace.guardrails.datasetAccountSwitchingChanged === false,
    JSON.stringify({ endpointValidation, datasetSwitching: readyTrace.datasetSwitching }));

  assertCase(results, 'w262-readiness-states-remain-equivalent',
    previewW262.readinessState === adapterReadinessBridge.validateReadinessState(readinessFacts().previewOnly.facts, 'smoke_preview_only').readiness.readinessState &&
      readyW262.readinessState === adapterReadinessBridge.validateReadinessState(readinessFacts().ready.facts, 'ready_to_build_records').readiness.readinessState &&
      adapterReadinessBridge.validateReadinessState(readinessFacts().submitted.facts, 'build_submitted').readiness.actions.showRefreshButton === true &&
      waitingW262.readinessState === adapterReadinessBridge.validateReadinessState(readinessFacts().waiting.facts, 'waiting_for_runner_result').readiness.readinessState &&
      completedW262.readinessState === adapterReadinessBridge.validateReadinessState(readinessFacts().recordsReady.facts, 'records_ready_to_import').readiness.readinessState &&
      w264Flow.w262States.afterImport === adapterReadinessBridge.validateReadinessState(readinessFacts().imported.facts, 'records_imported').readiness.readinessState &&
      trace.continuity.w262ReadinessStatesEquivalent === true,
    JSON.stringify({
      preview: previewW262.readinessState,
      ready: readyW262.readinessState,
      waiting: waitingW262.readinessState,
      completed: completedW262.readinessState,
      imported: w264Flow.w262States.afterImport
    }));

  assertCase(results, 'w263-readiness-trace-export-profile-fields-remain-compatible',
    adapterReadinessBridge.validateReadinessTrace(readyTrace).fieldCompatible === true &&
      readyTrace.selectedAdapterProfile.profileId === drawerProfile.profileId &&
      readyTrace.selectedAdapterProfile.deploymentId === '2' &&
      readyTrace.selectedAdapterProfile.fullEndpointUrl === drawerProfile.fullEndpointUrl &&
      readyTrace.w262ReadinessState === 'ready_to_build_records' &&
      readyTrace.normalUi.endpointProfileHiddenFromConsultant === true &&
      trace.continuity.w263ReadinessTraceFieldCompatible === true,
    JSON.stringify(adapterReadinessBridge.validateReadinessTrace(readyTrace)));

  assertCase(results, 'drawer-self-contained-no-runtime-require-or-contract-loading-side-effects',
    !/require\s*\(/.test(userscript) &&
      !/from ['"][^'"]*src\/contracts/.test(userscript) &&
      !/import\s+[^;]*adapterProfiles|import\s+[^;]*adapterReadinessBridge/.test(userscript) &&
      !/fetch\([^)]*adapterProfiles|GM_xmlhttpRequest\([^)]*adapterProfiles|localStorage\.setItem\([^)]*adapterProfiles/.test(userscript) &&
      trace.migration.drawerRemainsSelfContained === true &&
      trace.migration.runtimeRequireAdded === false &&
      trace.migration.externalDependencyAdded === false &&
      trace.migration.bundlerRequirementAdded === false &&
      trace.migration.networkDependencyForContractLoadingAdded === false &&
      trace.migration.storageWriteForContractLoadingAdded === false,
    JSON.stringify(trace.migration));

  assertCase(results, 'normal-build-ui-hides-endpoint-profile-raw-admin-diagnostics',
    /Ready to create NetSuite records/.test(readyHtml) &&
      /Build records/.test(readyHtml) &&
      !/script=6702|deploy=2|customdeployidb_governed_runner_adapter|td3021666\.app\.netsuite\.com|endpoint|raw json|schema|task id|stack trace|admin diagnostics/i.test(readyHtml) &&
      trace.guardrails.normalBuildUiHidesEndpointProfileRawAdminDiagnostics === true,
    readyHtml.slice(0, 1400));

  assertCase(results, 'connected-w264-submit-refresh-import-remains-unchanged',
    w264Flow.status === 'records_imported' &&
      w264Flow.endpointUrl === 'https://td3021666.app.netsuite.com/app/site/hosting/scriptlet.nl?script=6702&deploy=2' &&
      w264Flow.completedResultGuard.completedResultAcceptedByW151 === true &&
      w264Flow.importedRecords.length > 0 &&
      w264Flow.guardrails.fakeOpenLinksBlockedBeforeImport === true &&
      trace.continuity.w264SubmitRefreshImportChanged === false,
    JSON.stringify({ status: w264Flow.status, endpointUrl: w264Flow.endpointUrl, guard: w264Flow.completedResultGuard }));

  assertCase(results, 'w265-retry-safety-remains-unchanged',
    retryPolicy.duplicateSubmit.allowed === false &&
      retryPolicy.duplicateSubmit.createsSecondBuild === false &&
      retryPolicy.duplicateSubmit.idempotencyPreserved === true &&
      retryPolicy.afterAdapterError.allowedAutomatically === false &&
      retryPolicy.finishBuild.allowed === true &&
      trace.continuity.w265RetrySafetyChanged === false,
    JSON.stringify(retryPolicy));

  assertCase(results, 'w279-adapter-readiness-bridge-remains-available',
    adapterReadinessBridge.exportedContractSummary().schema === 'forge.w279.adapter-readiness-bridge.v1' &&
      adapterReadinessBridge.bridgeAdapterReadiness({
        releasedAdapterProfile: drawerProfile,
        alternateAccountHost: 'future281.app.netsuite.com',
        readinessFacts: readinessFacts(),
        readinessTrace: readyTrace
      }).status === 'bridge_ready' &&
      trace.continuity.w279AdapterReadinessBridgeAvailable === true,
    JSON.stringify(adapterReadinessBridge.exportedContractSummary()));

  assertCase(results, 'w280-bridge-closure-readiness-packet-remains-available',
    w280Trace.schema === 'forge.w280.contract-bridge-closure-runtime-extraction-readiness.trace.v1' &&
      w280Trace.runtimeExtractionReadinessPacket.selectedSlice.id === 'adapter_profile_readiness_contract_migration_prepare' &&
      trace.continuity.w280BridgeClosureReadinessPacketAvailable === true,
    JSON.stringify({ w280: w280Trace.runtimeExtractionReadinessPacket.selectedSlice.id }));

  assertCase(results, 'no-runtime-authority-changes-introduced',
    trace.guardrails.normalConsultantUiChanged === false &&
      trace.guardrails.buildTabCopyButtonsLayoutChanged === false &&
      trace.guardrails.connectedBuildFlowChanged === false &&
      trace.guardrails.retrySafetyChanged === false &&
      trace.guardrails.returnedRecordImportChanged === false &&
      trace.guardrails.laneResolutionChanged === false &&
      trace.guardrails.adapterEndpointProfileChanged === false &&
      trace.guardrails.recordCreationAuthorityChanged === false &&
      trace.guardrails.noW144DeploymentUpdateInThisBlock === true,
    JSON.stringify(trace.guardrails));

  assertCase(results, 'no-drawer-created-records-or-transaction-writes-introduced',
    w264Flow.guardrails.noDrawerCreatedRecords === true &&
      w264Flow.guardrails.noDrawerTransactionWrites === true &&
      trace.guardrails.noDrawerCreatedRecords === true &&
      trace.guardrails.noDrawerTransactionWrites === true,
    JSON.stringify({ w264: w264Flow.guardrails, trace: trace.guardrails }));

  assertCase(results, 'package-script-and-check-include-w281-harness',
    packageJson.scripts['harness:adapter-profile-readiness-contract-migration-w281'] ===
      'node archive/tools/run_w281_adapter_profile_readiness_contract_migration_harness.js' &&
      packageJson.scripts.check.indexOf('run_w281_adapter_profile_readiness_contract_migration_harness.js') >= 0,
    JSON.stringify(packageJson.scripts['harness:adapter-profile-readiness-contract-migration-w281']));

  assertCase(results, 'report-and-trace-archived',
    /W281 Adapter Profile Readiness Contract Migration/.test(report) &&
      /What Stayed Drawer-Owned/.test(report) &&
      trace.schema === 'forge.w281.adapter-profile-readiness-contract-migration.trace.v1' &&
      trace.visualTestingDecision.broadVisualRegressionRequired === false,
    JSON.stringify({
      report: 'archive/reports/w281_adapter_profile_readiness_contract_migration.md',
      trace: trace.schema
    }));

  printResults('W281 adapter profile readiness contract migration harness', results);
}

main();
