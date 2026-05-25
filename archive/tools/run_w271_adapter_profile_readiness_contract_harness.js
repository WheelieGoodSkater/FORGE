#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const adapterProfiles = require('../../src/contracts/adapterProfiles');
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

function normalizedHost(value) {
  return String(value || '').replace(/^https?:\/\//i, '').replace(/\/+$/g, '');
}

function w262ForFacts(hooks, facts, overrides = {}) {
  const state = motionState(hooks, overrides);
  const context = motionContext(hooks, state);
  const w262 = hooks.adapterReadyRecordCreationUxW262(state, context.lane, context.page, context.recommendation);
  const moduleState = adapterProfiles.evaluateAdapterReadiness(facts);
  return { state, context, w262, moduleState };
}

function main() {
  const results = [];
  const hooks = loadHooks({ fetchMessage: 'live fetch disabled in W271 harness' });
  const source = readRepoFile('src', 'contracts', 'adapterProfiles.js');
  const userscript = read(userscriptPath);
  const report = readArchiveText('reports', 'w271_adapter_profile_readiness_contract.md');
  const trace = readArchiveJson('trace_samples', 'w271_adapter_profile_readiness_contract_trace.json');
  const drawerProfile = hooks.releasedAdapterProfileW263();
  const contractProfile = adapterProfiles.releasedAdapterProfile();
  const swappedProfile = adapterProfiles.releasedAdapterProfile({ accountHost: 'demo123.app.netsuite.com' });
  const appliedConfig = adapterProfiles.applySelectedAdapterProfileToConfig({
    selectedAdapterProfileId: contractProfile.profileId,
    adapterProfiles: [contractProfile],
    endpointUrl: '',
    sandboxAccountAllowlist: []
  });
  const defaultState = motionState(hooks);
  const defaultContext = motionContext(hooks, defaultState);
  const defaultW262 = hooks.adapterReadyRecordCreationUxW262(defaultState, defaultContext.lane, defaultContext.page, defaultContext.recommendation);
  const missingProfile = adapterProfiles.evaluateAdapterReadiness({
    requestReady: false,
    endpointConfigured: false,
    adapterReady: false
  });
  const previewState = motionState(hooks, {
    integratedBuildAdapterConfig: {
      adapterProfileDisabled: true,
      adapterProfiles: [],
      endpointUrl: '',
      adapterApproved: false,
      CREATE_ENABLED: false,
      GOVERNED_SANDBOX_WRITE_ENABLED: false,
      QUEUE_SUBMIT_ENABLED: false,
      productionBuildModeEnabled: false
    }
  });
  const previewContext = motionContext(hooks, previewState);
  const previewW262 = hooks.adapterReadyRecordCreationUxW262(previewState, previewContext.lane, previewContext.page, previewContext.recommendation);
  const previewModule = adapterProfiles.evaluateAdapterReadiness({
    requestReady: true,
    endpointConfigured: false,
    adapterReady: false
  });
  const waitingState = motionState(hooks, {
    integratedBuildRunnerResult: {
      schema: 'idb.approved-server-adapter-result-envelope.v1',
      status: 'queued_result_capture_pending',
      queueSubmitted: true,
      runnerTaskId: 'runner-w271-motion-001',
      idempotencyToken: 'motion-w271-token',
      resultCapture: { status: 'pending_runner_completion', runnerTaskId: 'runner-w271-motion-001' }
    }
  });
  const waitingContext = motionContext(hooks, waitingState);
  const waitingW262 = hooks.adapterReadyRecordCreationUxW262(waitingState, waitingContext.lane, waitingContext.page, waitingContext.recommendation);
  const waitingModule = adapterProfiles.evaluateAdapterReadiness({
    requestReady: true,
    endpointConfigured: true,
    adapterReady: true,
    runnerTaskCaptured: true
  });
  const completedState = motionState(hooks, {
    integratedBuildRunnerResult: {
      schema: 'idb.approved-server-adapter-result-envelope.v1',
      status: 'completed_result_available',
      queueSubmitted: true,
      runnerTaskId: 'runner-w271-motion-001',
      idempotencyToken: 'motion-w271-token',
      finalGeneratedNamesJsonReady: true,
      finalGeneratedNamesJson: completedMotionResult({ prefix: '271' }),
      resultCapture: {
        status: 'completed_result_capture_ready',
        runnerTaskId: 'runner-w271-motion-001',
        finalGeneratedNamesJson: completedMotionResult({ prefix: '271' })
      }
    }
  });
  const completedContext = motionContext(hooks, completedState);
  const completedW262 = hooks.adapterReadyRecordCreationUxW262(completedState, completedContext.lane, completedContext.page, completedContext.recommendation);
  const completedModule = adapterProfiles.evaluateAdapterReadiness({
    requestReady: true,
    endpointConfigured: true,
    adapterReady: true,
    runnerTaskCaptured: true,
    completedResultReady: true
  });
  const importedFlow = hooks.connectedBuildSubmitRefreshImportW264(defaultState, defaultContext.lane, defaultContext.page, defaultContext.recommendation, {
    executeSubmit: true,
    executePoll: true,
    finishBuild: true,
    submitResponse: {
      status: 'queued_result_capture_pending',
      queueSubmitted: true,
      runnerTaskId: 'runner-w271-motion-001',
      idempotencyToken: 'motion-w271-token',
      resultCapture: { status: 'pending_runner_completion', runnerTaskId: 'runner-w271-motion-001' }
    },
    pollResponse: {
      status: 'completed_runner_result_ready',
      queueSubmitted: true,
      runnerTaskId: 'runner-w271-motion-001',
      resultCapture: {
        status: 'completed_result_capture_ready',
        runnerTaskId: 'runner-w271-motion-001',
        finalGeneratedNamesJson: completedMotionResult({ prefix: '271' })
      }
    }
  });
  const importedModule = adapterProfiles.evaluateAdapterReadiness({
    requestReady: true,
    endpointConfigured: true,
    adapterReady: true,
    runnerTaskCaptured: true,
    completedResultReady: true,
    finalNamesImported: true
  });
  const submittedModule = adapterProfiles.evaluateAdapterReadiness({
    requestReady: true,
    endpointConfigured: true,
    adapterReady: true,
    buildSubmitted: true
  });

  assertCase(results, 'adapter-profile-contract-module-exists',
    /ADAPTER_PROFILE_SCHEMA_VERSION/.test(source) &&
      /RELEASED_W144_GOVERNED_RUNNER_ADAPTER_PROFILE/.test(source) &&
      typeof adapterProfiles.adapterProfileEndpoint === 'function' &&
      typeof adapterProfiles.evaluateAdapterReadiness === 'function',
    'src/contracts/adapterProfiles.js');

  assertCase(results, 'released-w144-profile-matches-w263-drawer-profile',
    contractProfile.profileId === drawerProfile.profileId &&
      contractProfile.scriptName === drawerProfile.scriptName &&
      contractProfile.title === drawerProfile.title &&
      contractProfile.deploymentScriptId === drawerProfile.deploymentScriptId &&
      contractProfile.deploymentStatus === drawerProfile.deploymentStatus &&
      contractProfile.deployed === drawerProfile.deployed &&
      contractProfile.executeAsRole === drawerProfile.executeAsRole &&
      contractProfile.logLevel === drawerProfile.logLevel &&
      contractProfile.suiteletPath === drawerProfile.suiteletPath &&
      contractProfile.scriptId === drawerProfile.scriptId &&
      contractProfile.deploymentId === drawerProfile.deploymentId &&
      normalizedHost(contractProfile.accountHost) === normalizedHost(drawerProfile.accountHost),
    JSON.stringify({ contractProfile, drawerProfile }));

  assertCase(results, 'full-endpoint-derives-from-host-and-path',
    adapterProfiles.adapterProfileEndpoint(contractProfile) === 'https://td3021666.app.netsuite.com/app/site/hosting/scriptlet.nl?script=6702&deploy=2' &&
      appliedConfig.endpointUrl === adapterProfiles.adapterProfileEndpoint(contractProfile) &&
      appliedConfig.selectedAdapterProfile.fullEndpointUrl === appliedConfig.endpointUrl,
    JSON.stringify({ endpoint: adapterProfiles.adapterProfileEndpoint(contractProfile), appliedConfig }));

  assertCase(results, 'future-dataset-host-swaps-without-runtime-logic-change',
    adapterProfiles.adapterProfileEndpoint(swappedProfile) === 'https://demo123.app.netsuite.com/app/site/hosting/scriptlet.nl?script=6702&deploy=2' &&
      swappedProfile.suiteletPath === contractProfile.suiteletPath &&
      swappedProfile.deploymentScriptId === contractProfile.deploymentScriptId,
    JSON.stringify(swappedProfile));

  assertCase(results, 'readiness-states-match-w262-w263-behavior',
    missingProfile.readinessState === 'adapter_not_configured' &&
      previewW262.readinessState === previewModule.readinessState &&
      defaultW262.readinessState === 'ready_to_build_records' &&
      adapterProfiles.evaluateAdapterReadiness({
        requestReady: true,
        endpointConfigured: true,
        adapterReady: true
      }).readinessState === defaultW262.readinessState &&
      submittedModule.readinessState === 'build_submitted' &&
      submittedModule.actions.showRefreshButton === true &&
      waitingW262.readinessState === waitingModule.readinessState &&
      completedW262.readinessState === completedModule.readinessState &&
      importedFlow.w262States.afterImport === importedModule.readinessState,
    JSON.stringify({
      missing: missingProfile.readinessState,
      preview: [previewW262.readinessState, previewModule.readinessState],
      ready: defaultW262.readinessState,
      submitted: submittedModule.readinessState,
      waiting: [waitingW262.readinessState, waitingModule.readinessState],
      completed: [completedW262.readinessState, completedModule.readinessState],
      imported: [importedFlow.w262States.afterImport, importedModule.readinessState]
    }));

  assertCase(results, 'normal-consultant-ui-still-hides-endpoint-admin-details',
    previewW262.hiddenFromNormalUi.some((item) => /runnerTaskId/.test(item)) &&
      !/script=6702|deploy=2|customdeployidb_governed_runner_adapter|operator gate|server flags|transport boundary/i.test(previewW262.headline + ' ' + previewW262.copy) &&
      hooks.deployedAdapterReadinessTraceW263(defaultState, defaultContext.lane, defaultContext.page, defaultContext.recommendation).normalUi.endpointProfileHiddenFromConsultant === true,
    JSON.stringify(previewW262.hiddenFromNormalUi));

  assertCase(results, 'w264-connected-build-still-submits-to-script-6702-deploy-2',
    importedFlow.endpointUrl === 'https://td3021666.app.netsuite.com/app/site/hosting/scriptlet.nl?script=6702&deploy=2' &&
      importedFlow.status === 'records_imported' &&
      importedFlow.guardrails.approvedServerAdapterPathOnly === true,
    JSON.stringify({ endpointUrl: importedFlow.endpointUrl, status: importedFlow.status, guardrails: importedFlow.guardrails }));

  assertCase(results, 'w270-shared-harness-utilities-remain-available',
    fs.existsSync(path.join(root, 'archive', 'tools', 'lib', 'forge_harness_fixtures.js')) &&
      trace.parityGuardrails.some((item) => /W270 shared harness utilities/.test(item)) &&
      readRepoFile('archive', 'tools', 'run_w271_adapter_profile_readiness_contract_harness.js').includes("require('./lib/forge_harness_fixtures')"),
    trace.parityGuardrails.join(' | '));

  assertCase(results, 'no-runtime-file-behavior-changes-introduced',
    !/require\(['\"][^'\"]*adapterProfiles/.test(userscript) &&
      /The drawer still owns runtime behavior/.test(report) &&
      trace.guardrails.runtimeBehaviorChanged === false &&
      trace.guardrails.normalConsultantUiChanged === false,
    JSON.stringify(trace.guardrails));

  assertCase(results, 'no-drawer-created-records-or-transaction-writes-introduced',
    importedFlow.guardrails.noDrawerCreatedRecords === true &&
      importedFlow.guardrails.noDrawerTransactionWrites === true &&
      trace.guardrails.noDrawerCreatedRecords === true &&
      trace.guardrails.noDrawerTransactionWrites === true,
    JSON.stringify({ imported: importedFlow.guardrails, trace: trace.guardrails }));

  assertCase(results, 'report-and-trace-archived',
    /W271 Adapter Profile/.test(report) &&
      trace.schema === 'forge.w271.adapter-profile-readiness-contract.trace.v1' &&
      trace.releasedProfile.derivedEndpoint === adapterProfiles.adapterProfileEndpoint(contractProfile),
    JSON.stringify(trace.releasedProfile));

  printResults('W271 adapter profile readiness contract harness', results);
}

main();
