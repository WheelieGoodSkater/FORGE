#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const bridge = require('../../src/contracts/adapterReadinessBridge');
const adapterProfiles = require('../../src/contracts/adapterProfiles');
const liveEvidenceBridge = require('../../src/contracts/liveEvidenceSignoffBridge');
const lanePackReviewBridge = require('../../src/contracts/lanePackReviewBridge');
const storyCoachingBridge = require('../../src/contracts/storyCoachingBridge');
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
    runnerTaskId: 'runner-w279-motion-001',
    idempotencyToken: 'motion-w279-token',
    resultCapture: { status: 'pending_runner_completion', runnerTaskId: 'runner-w279-motion-001' }
  };
  if (status === 'completed_result_available') {
    result.finalGeneratedNamesJsonReady = true;
    result.finalGeneratedNamesJson = completedMotionResult({ prefix: '279' });
    result.resultCapture = {
      status: 'completed_result_capture_ready',
      runnerTaskId: 'runner-w279-motion-001',
      finalGeneratedNamesJson: completedMotionResult({ prefix: '279' })
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
  const hooks = loadHooks({ fetchMessage: 'live fetch disabled in W279 harness' });
  const userscript = read(userscriptPath);
  const source = readRepoFile('src', 'contracts', 'adapterReadinessBridge.js');
  const report = readArchiveText('reports', 'w279_adapter_readiness_bridge.md');
  const trace = readArchiveJson('trace_samples', 'w279_adapter_readiness_bridge_trace.json');
  const drawerProfile = hooks.releasedAdapterProfileW263();
  const contractProfile = adapterProfiles.releasedAdapterProfile();
  const profileValidation = bridge.validateAdapterProfile(drawerProfile);
  const endpointValidation = bridge.validateEndpointDerivation(drawerProfile, 'future279.app.netsuite.com');
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
  const w264Flow = hooks.connectedBuildSubmitRefreshImportW264(readyState, readyContext.lane, readyContext.page, readyContext.recommendation, {
    executeSubmit: true,
    executePoll: true,
    finishBuild: true,
    submitResponse: {
      status: 'queued_result_capture_pending',
      queueSubmitted: true,
      runnerTaskId: 'runner-w279-motion-001',
      idempotencyToken: 'motion-w279-token',
      resultCapture: { status: 'pending_runner_completion', runnerTaskId: 'runner-w279-motion-001' }
    },
    pollResponse: {
      status: 'completed_runner_result_ready',
      queueSubmitted: true,
      runnerTaskId: 'runner-w279-motion-001',
      resultCapture: {
        status: 'completed_result_capture_ready',
        runnerTaskId: 'runner-w279-motion-001',
        finalGeneratedNamesJson: completedMotionResult({ prefix: '279' })
      }
    }
  });
  const retryPolicy = hooks.connectedBuildRetryPolicyW265({
    runnerTaskId: 'runner-w279-motion-001',
    idempotencyToken: 'motion-w279-token',
    completedResultAccepted: true
  });
  const bridgePacket = bridge.bridgeAdapterReadiness({
    releasedAdapterProfile: drawerProfile,
    alternateAccountHost: 'future279.app.netsuite.com',
    readinessFacts: readinessFacts(),
    readinessTrace: readyTrace
  });

  assertCase(results, 'adapter-readiness-bridge-exists',
    /ADAPTER_READINESS_BRIDGE_SCHEMA_VERSION/.test(source) &&
      /require\('\.\/adapterProfiles'\)/.test(source) &&
      bridge.exportedContractSummary().schema === 'forge.w279.adapter-readiness-bridge.v1' &&
      bridge.exportedContractSummary().governingContract === adapterProfiles.ADAPTER_PROFILE_SCHEMA_VERSION,
    JSON.stringify(bridge.exportedContractSummary()));

  assertCase(results, 'bridge-validates-against-adapter-profiles-contract',
    bridgePacket.status === 'bridge_ready' &&
      bridgePacket.governingContract === adapterProfiles.ADAPTER_PROFILE_SCHEMA_VERSION &&
      bridgePacket.readinessContract === adapterProfiles.ADAPTER_READINESS_SCHEMA_VERSION &&
      bridgePacket.readinessEntries.length === 6,
    JSON.stringify(bridgePacket));

  assertCase(results, 'released-w144-governed-runner-adapter-profile-field-compatible',
    profileValidation.fieldCompatible === true &&
      drawerProfile.profileId === contractProfile.profileId &&
      drawerProfile.scriptName === contractProfile.scriptName &&
      drawerProfile.title === contractProfile.title &&
      drawerProfile.deploymentScriptId === 'customdeployidb_governed_runner_adapter' &&
      drawerProfile.suiteletPath === '/app/site/hosting/scriptlet.nl?script=6702&deploy=2' &&
      drawerProfile.scriptId === '6702' &&
      drawerProfile.deploymentId === '2',
    JSON.stringify({ validation: profileValidation, drawerProfile, contractProfile }));

  assertCase(results, 'endpoint-derives-from-account-host-and-suitelet-path',
    endpointValidation.status === 'field_compatible' &&
      endpointValidation.derivedEndpoint === 'https://td3021666.app.netsuite.com/app/site/hosting/scriptlet.nl?script=6702&deploy=2' &&
      drawerProfile.fullEndpointUrl === endpointValidation.derivedEndpoint,
    JSON.stringify(endpointValidation));

  assertCase(results, 'future-dataset-account-host-can-swap-without-runtime-logic-change',
    endpointValidation.canSwapAccountHostWithoutRuntimeLogicChange === true &&
      endpointValidation.swappedEndpoint === 'https://future279.app.netsuite.com/app/site/hosting/scriptlet.nl?script=6702&deploy=2' &&
      readyTrace.datasetSwitching.canSwapAccountHostWithoutRuntimeLogicChange === true,
    JSON.stringify({ endpointValidation, datasetSwitching: readyTrace.datasetSwitching }));

  assertCase(results, 'w262-readiness-states-remain-field-compatible',
    previewW262.readinessState === bridge.validateReadinessState(readinessFacts().previewOnly.facts, 'smoke_preview_only').readiness.readinessState &&
      hooks.adapterReadyRecordCreationUxW262(readyState, readyContext.lane, readyContext.page, readyContext.recommendation).readinessState === bridge.validateReadinessState(readinessFacts().ready.facts, 'ready_to_build_records').readiness.readinessState &&
      bridge.validateReadinessState(readinessFacts().submitted.facts, 'build_submitted').readiness.actions.showRefreshButton === true &&
      waitingW262.readinessState === bridge.validateReadinessState(readinessFacts().waiting.facts, 'waiting_for_runner_result').readiness.readinessState &&
      completedW262.readinessState === bridge.validateReadinessState(readinessFacts().recordsReady.facts, 'records_ready_to_import').readiness.readinessState &&
      w264Flow.w262States.afterImport === bridge.validateReadinessState(readinessFacts().imported.facts, 'records_imported').readiness.readinessState,
    JSON.stringify({
      preview: previewW262.readinessState,
      ready: hooks.adapterReadyRecordCreationUxW262(readyState, readyContext.lane, readyContext.page, readyContext.recommendation).readinessState,
      waiting: waitingW262.readinessState,
      completed: completedW262.readinessState,
      imported: w264Flow.w262States.afterImport
    }));

  assertCase(results, 'w263-readiness-trace-export-profile-fields-remain-compatible',
    bridge.validateReadinessTrace(readyTrace).fieldCompatible === true &&
      readyTrace.selectedAdapterProfile.profileId === drawerProfile.profileId &&
      readyTrace.selectedAdapterProfile.deploymentId === '2' &&
      readyTrace.w262ReadinessState === 'ready_to_build_records' &&
      readyTrace.normalUi.endpointProfileHiddenFromConsultant === true,
    JSON.stringify(bridge.validateReadinessTrace(readyTrace)));

  assertCase(results, 'normal-consultant-ui-hides-endpoint-profile-admin-diagnostics',
    /Ready to create NetSuite records/.test(readyHtml) &&
      /Build records/.test(readyHtml) &&
      !/script=6702|deploy=2|customdeployidb_governed_runner_adapter|td3021666\.app\.netsuite\.com|endpoint|server flags|sandbox allowlist|operator gate|transport boundary/i.test(readyHtml) &&
      trace.guardrails.endpointProfileHiddenFromNormalUi === true,
    readyHtml.slice(0, 1400));

  assertCase(results, 'w276-w277-w278-bridges-remain-available',
    liveEvidenceBridge.exportedContractSummary().schema === 'forge.w276.live-evidence-signoff-bridge.v1' &&
      lanePackReviewBridge.exportedContractSummary().schema === 'forge.w277.lane-pack-review-bridge.v1' &&
      storyCoachingBridge.exportedContractSummary().schema === 'forge.w278.story-coaching-bridge.v1' &&
      trace.continuity.w276LiveEvidenceSignoffBridgeAvailable === true &&
      trace.continuity.w277LanePackReviewBridgeAvailable === true &&
      trace.continuity.w278StoryCoachingBridgeAvailable === true,
    JSON.stringify({
      w276: liveEvidenceBridge.exportedContractSummary().schema,
      w277: lanePackReviewBridge.exportedContractSummary().schema,
      w278: storyCoachingBridge.exportedContractSummary().schema
    }));

  assertCase(results, 'connected-w264-submit-refresh-import-remains-unchanged',
    w264Flow.status === 'records_imported' &&
      w264Flow.endpointUrl === 'https://td3021666.app.netsuite.com/app/site/hosting/scriptlet.nl?script=6702&deploy=2' &&
      w264Flow.completedResultGuard.completedResultAcceptedByW151 === true &&
      w264Flow.importedRecords.length > 0 &&
      w264Flow.guardrails.fakeOpenLinksBlockedBeforeImport === true,
    JSON.stringify({ status: w264Flow.status, endpointUrl: w264Flow.endpointUrl, guard: w264Flow.completedResultGuard }));

  assertCase(results, 'w265-retry-safety-remains-unchanged',
    retryPolicy.duplicateSubmit.allowed === false &&
      retryPolicy.duplicateSubmit.createsSecondBuild === false &&
      retryPolicy.duplicateSubmit.idempotencyPreserved === true &&
      retryPolicy.afterAdapterError.allowedAutomatically === false &&
      retryPolicy.finishBuild.allowed === true,
    JSON.stringify(retryPolicy));

  assertCase(results, 'no-runtime-authority-changes-introduced',
    !/require\(['\"][^'\"]*adapterReadinessBridge/.test(userscript) &&
      trace.guardrails.runtimeBehaviorChanged === false &&
      trace.guardrails.connectedBuildFlowChanged === false &&
      trace.guardrails.adapterEndpointProfileChanged === false &&
      trace.guardrails.recordCreationAuthorityChanged === false,
    JSON.stringify(trace.guardrails));

  assertCase(results, 'no-drawer-created-records-or-transaction-writes-introduced',
    bridgePacket.guardrails.noDrawerCreatedRecords === true &&
      bridgePacket.guardrails.noDrawerTransactionWrites === true &&
      w264Flow.guardrails.noDrawerCreatedRecords === true &&
      w264Flow.guardrails.noDrawerTransactionWrites === true &&
      trace.guardrails.noDrawerCreatedRecords === true &&
      trace.guardrails.noDrawerTransactionWrites === true,
    JSON.stringify({ bridge: bridgePacket.guardrails, w264: w264Flow.guardrails, trace: trace.guardrails }));

  assertCase(results, 'report-and-trace-archived',
    /W279 Adapter Profile Readiness Bridge/.test(report) &&
      trace.schema === 'forge.w279.adapter-readiness-bridge.trace.v1' &&
      trace.bridge.module === 'src/contracts/adapterReadinessBridge.js' &&
      trace.visualTestingDecision.broadVisualRegressionRequired === false,
    JSON.stringify({ report: 'archive/reports/w279_adapter_readiness_bridge.md', trace: trace.schema }));

  printResults('W279 adapter readiness bridge harness', results);
}

main();
