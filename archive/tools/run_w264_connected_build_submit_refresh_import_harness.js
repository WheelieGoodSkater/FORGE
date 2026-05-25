#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..', '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const reportPath = path.join(root, 'archive', 'reports', 'w264_connected_build_submit_refresh_import.md');
const tracePath = path.join(root, 'archive', 'trace_samples', 'w264_connected_build_submit_refresh_import_trace.json');

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function assertCase(results, id, pass, evidence) {
  results.push({ id, pass: Boolean(pass), evidence: evidence || '' });
}

function loadHooks() {
  const store = new Map();
  const storage = {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key)
  };
  const sandbox = {
    console,
    Date,
    JSON,
    Math,
    RegExp,
    String,
    Number,
    Boolean,
    Array,
    Object,
    Set,
    Map,
    URL,
    URLSearchParams,
    Promise,
    Blob: function Blob() {},
    fetch: () => Promise.reject(new Error('live fetch disabled in W264 harness')),
    globalThis: null,
    window: {
      self: null,
      top: null,
      location: {
        href: 'https://td3021666.app.netsuite.com/app/center/card.nl',
        pathname: '/app/center/card.nl',
        search: ''
      },
      localStorage: storage,
      addEventListener: () => {},
      removeEventListener: () => {},
      setInterval: () => 1,
      clearInterval: () => {},
      innerWidth: 1440
    },
    document: {
      title: 'NetSuite Home',
      readyState: 'loading',
      body: { innerText: '', classList: { add: () => {}, remove: () => {} } },
      documentElement: { style: { setProperty: () => {} } },
      head: { appendChild: () => {} },
      createElement: () => ({
        setAttribute: () => {},
        appendChild: () => {},
        addEventListener: () => {},
        remove: () => {},
        classList: { toggle: () => {}, add: () => {}, remove: () => {} },
        style: {}
      }),
      querySelectorAll: () => [],
      getElementById: () => null,
      addEventListener: () => {}
    },
    __IDB_ENABLE_TEST_HOOKS__: true
  };
  sandbox.globalThis = sandbox;
  sandbox.window.self = sandbox.window;
  sandbox.window.top = sandbox.window;
  sandbox.window.window = sandbox.window;
  sandbox.window.document = sandbox.document;
  sandbox.window.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(read(userscriptPath), sandbox, { filename: userscriptPath });
  if (!sandbox.__IDB_TEST_HOOKS__) throw new Error('Missing IDB test hooks.');
  return sandbox.__IDB_TEST_HOOKS__;
}

function motionState(hooks, overrides = {}) {
  const profile = hooks.releasedAdapterProfileW263();
  const config = hooks.applySelectedAdapterProfileToConfigW263({
    selectedAdapterProfileId: profile.profileId,
    adapterProfiles: [profile],
    endpointUrl: '',
    adapterApproved: true,
    CREATE_ENABLED: true,
    GOVERNED_SANDBOX_WRITE_ENABLED: true,
    QUEUE_SUBMIT_ENABLED: true,
    sandboxAccountAllowlist: ['TD3021666'],
    productionBuildModeEnabled: true,
    mode: 'production_build_saved_admin_config'
  });
  const state = Object.assign({
    selectedLaneId: 'industrial_distribution',
    laneSelectionSource: 'consultant_confirmed',
    selectedActionId: 'prove',
    briefPrepared: true,
    setupEditMode: false,
    intake: {
      customer: 'Motion Industries',
      website: 'https://www.motion.com',
      notes: 'Buyer is the VP of Operations for a regional industrial distributor. They need one trusted view before the customer promise is made. Prove branch availability control when supplier lead times shift and branch inventory is uneven.'
    },
    toggles: {
      createNewHeroItem: true,
      enableManufacturing: false,
      enableWip: false
    },
    integratedBuildAdapterConfig: config,
    integratedBuildOperatorApproval: {
      endpointConfirmed: true,
      confirmedSandboxAccount: true,
      currentSandboxAccount: 'TD3021666',
      operatorName: 'Saved admin config',
      typeToConfirm: 'QUEUE GOVERNED SANDBOX RUNNER',
      operatorAuthorizationPhrase: 'AUTHORIZE ONE SANDBOX ADAPTER CALL',
      reviewDecision: 'operator_approved_queue_submit',
      confirmedNoSubmit: false
    },
    pageContext: {
      title: 'NetSuite Home',
      url: 'https://td3021666.app.netsuite.com/app/center/card.nl',
      pageType: 'NetSuite page',
      contextId: 'generic_netsuite_page',
      confidence: 'low'
    }
  }, overrides);
  hooks.ensureWebsiteEvidenceRuntime(state);
  hooks.reconcileStateAuthority(state);
  const lane = hooks.getLane(state);
  const recommendation = hooks.recommendMove(lane, state.pageContext);
  state.acceptedPacket = hooks.buildAcceptedPacketContext(state, lane, state.pageContext, recommendation);
  hooks.reconcileStateAuthority(state);
  return state;
}

function ctx(hooks, state) {
  const lane = hooks.getLane(state);
  const page = state.pageContext;
  const recommendation = hooks.recommendMove(lane, page);
  return { lane, page, recommendation };
}

function completedMotionResult() {
  return {
    schema: 'forge.completed-runner-result.v2',
    status: 'completed',
    runStatus: 'completed',
    generatedRecordOwner: 'governed_runner_internal_build_engine',
    resolvedOperatingMode: 'distribution_replenishment',
    records: [
      {
        role: 'customer',
        recordType: 'customer',
        type: 'customer',
        name: 'Motion Industries Demo Account',
        internalId: '26401',
        url: 'https://td3021666.app.netsuite.com/app/common/entity/custjob.nl?id=26401'
      },
      {
        role: 'sales_order',
        recordType: 'salesorder',
        type: 'salesorder',
        name: 'SO-W264 Motion Branch Availability',
        internalId: '26402',
        url: 'https://td3021666.app.netsuite.com/app/accounting/transactions/salesord.nl?id=26402'
      },
      {
        role: 'branch_or_product_sku',
        recordType: 'inventoryitem',
        type: 'inventoryitem',
        name: 'Motion Branch Fulfillment SKU',
        internalId: '26403',
        url: 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=26403'
      },
      {
        role: 'replenishment_or_availability_flow',
        recordType: 'inventoryitem',
        type: 'inventoryitem',
        name: 'Motion Availability Proof Flow',
        internalId: '26404',
        url: 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=26404'
      }
    ]
  };
}

function invalidMotionResult() {
  const result = completedMotionResult();
  result.records = result.records.map((record) => record.role === 'branch_or_product_sku'
    ? Object.assign({}, record, { internalId: '', url: '' })
    : record);
  return result;
}

function main() {
  const hooks = loadHooks();
  const userscript = read(userscriptPath);
  const report = read(reportPath);
  const trace = JSON.parse(read(tracePath));
  const state = motionState(hooks);
  const context = ctx(hooks, state);
  const submitCalls = [];
  const pollCalls = [];
  const flow = hooks.connectedBuildSubmitRefreshImportW264(state, context.lane, context.page, context.recommendation, {
    executeSubmit: true,
    executePoll: true,
    finishBuild: true,
    submitTransport: (request) => {
      submitCalls.push(request);
      return {
        schema: 'idb.governed-runner-adapter-result.v1',
        status: 'queued_result_capture_pending',
        queueSubmitted: true,
        runnerTaskId: 'runner-w264-motion-001',
        resultCapture: { status: 'pending_runner_completion', runnerTaskId: 'runner-w264-motion-001' }
      };
    },
    pollTransport: (request) => {
      pollCalls.push(request);
      return {
        schema: 'idb.approved-server-adapter-result-envelope.v1',
        status: 'completed_runner_result_ready',
        queueSubmitted: true,
        runnerTaskId: 'runner-w264-motion-001',
        resultCapture: {
          status: 'completed_result_capture_ready',
          runnerTaskId: 'runner-w264-motion-001',
          finalGeneratedNamesJson: completedMotionResult()
        },
        finalGeneratedNamesJson: completedMotionResult()
      };
    }
  });
  const waitingState = motionState(hooks, {
    integratedBuildRunnerResult: {
      schema: 'idb.approved-server-adapter-result-envelope.v1',
      status: 'queued_result_capture_pending',
      queueSubmitted: true,
      runnerTaskId: 'runner-w264-motion-001',
      idempotencyToken: 'motion-w264-token',
      resultCapture: { status: 'pending_runner_completion', runnerTaskId: 'runner-w264-motion-001' }
    }
  });
  const waitingContext = ctx(hooks, waitingState);
  const waitingHtml = hooks.renderIntegratedBuildRunnerReturnStatus(waitingState, waitingContext.lane, waitingContext.page, waitingContext.recommendation);
  const completedState = motionState(hooks, {
    integratedBuildRunnerResult: {
      schema: 'idb.approved-server-adapter-result-envelope.v1',
      status: 'completed_result_available',
      queueSubmitted: true,
      runnerTaskId: 'runner-w264-motion-001',
      idempotencyToken: 'motion-w264-token',
      finalGeneratedNamesJsonReady: true,
      finalGeneratedNamesJson: completedMotionResult(),
      resultCapture: {
        status: 'completed_result_capture_ready',
        runnerTaskId: 'runner-w264-motion-001',
        finalGeneratedNamesJson: completedMotionResult()
      }
    }
  });
  const completedContext = ctx(hooks, completedState);
  const completedHtml = hooks.renderIntegratedBuildRunnerReturnStatus(completedState, completedContext.lane, completedContext.page, completedContext.recommendation);
  const invalidState = motionState(hooks, {
    integratedBuildRunnerResult: {
      schema: 'idb.approved-server-adapter-result-envelope.v1',
      status: 'completed_result_available',
      queueSubmitted: true,
      runnerTaskId: 'runner-w264-motion-bad',
      idempotencyToken: 'motion-w264-token-bad',
      finalGeneratedNamesJsonReady: false,
      finalGeneratedNamesJson: invalidMotionResult(),
      resultCapture: {
        status: 'completed_result_capture_ready',
        runnerTaskId: 'runner-w264-motion-bad',
        finalGeneratedNamesJson: invalidMotionResult()
      }
    }
  });
  const invalidContext = ctx(hooks, invalidState);
  const invalidHtml = hooks.renderIntegratedBuildRunnerReturnStatus(invalidState, invalidContext.lane, invalidContext.page, invalidContext.recommendation);
  const adapterErrorState = motionState(hooks);
  const adapterErrorFlow = hooks.connectedBuildSubmitRefreshImportW264(adapterErrorState, context.lane, context.page, context.recommendation, {
    executeSubmit: true,
    executePoll: true,
    finishBuild: true,
    submitResponse: {
      schema: 'idb.governed-runner-adapter-result.v1',
      status: 'adapter_error',
      error: true,
      errorMessage: 'Sandbox adapter stopped safely.',
      queueSubmitted: false,
      resultCapture: { status: 'adapter_error', error: true }
    }
  });
  const results = [];

  assertCase(results, 'build-records-submits-only-when-released-profile-readiness-is-true',
    flow.w262States.beforeSubmit === 'ready_to_build_records' &&
      flow.submit.readyForOneCall === true &&
      flow.submit.executionAllowed === true,
    JSON.stringify(flow.w262States));

  assertCase(results, 'submit-uses-script-6702-deploy-2',
    submitCalls.length === 1 &&
      /script=6702&deploy=2/.test(submitCalls[0].endpointUrl) &&
      flow.endpointUrl === 'https://td3021666.app.netsuite.com/app/site/hosting/scriptlet.nl?script=6702&deploy=2',
    submitCalls[0] && submitCalls[0].endpointUrl);

  assertCase(results, 'one-call-idempotency-behavior-is-preserved',
    submitCalls.length === 1 &&
      flow.submit.adapterRequestEnvelope.oneSubmitLimit.maxQueueSubmitAttempts === 1 &&
      !!flow.submit.adapterRequestEnvelope.idempotencyToken &&
      flow.submit.runnerTaskIdCapturePath.statePatch.integratedBuildRunnerResult.idempotencyToken === flow.submit.adapterRequestEnvelope.idempotencyToken,
    JSON.stringify(flow.submit.adapterRequestEnvelope.oneSubmitLimit));

  assertCase(results, 'runner-task-id-is-captured-from-approved-adapter-response',
    flow.captured.runnerTaskId === 'runner-w264-motion-001' &&
      flow.w262States.afterSubmit === 'waiting_for_runner_result',
    JSON.stringify(flow.captured));

  assertCase(results, 'refresh-build-status-appears-after-submit',
    /Refresh build status/.test(waitingHtml) &&
      /data-idb-build-return-action="check_runner_result"/.test(waitingHtml),
    waitingHtml.slice(0, 1200));

  assertCase(results, 'completed-result-validates-before-finish-build-appears',
    /Finish build/.test(completedHtml) &&
      /data-idb-build-return-action="import_completed_runner_result"/.test(completedHtml) &&
      !/Motion Branch Fulfillment SKU/.test(completedHtml),
    completedHtml.slice(0, 1200));

  assertCase(results, 'invalid-result-is-rejected-with-w220-recovery-wording',
    /Import recovery/.test(invalidHtml) &&
      /Use the latest completed runner result|Paste the completed build result/.test(invalidHtml) &&
      !/Finish build/.test(invalidHtml),
    invalidHtml.slice(0, 1400));

  assertCase(results, 'valid-result-imports-returned-names-and-open-links',
    flow.status === 'records_imported' &&
      flow.importCommit.commitAllowed === true &&
      flow.importedRecords.some((record) => record.name === 'Motion Branch Fulfillment SKU' && record.linkAuthority && record.linkAuthority.openable === true) &&
      flow.importedRecords.some((record) => record.name === 'SO-W264 Motion Branch Availability'),
    flow.importedRecords.map((record) => `${record.name}:${record.linkAuthority && record.linkAuthority.status}`).join(' | '));

  assertCase(results, 'motion-distribution-records-use-product-sku-availability-labels',
    flow.importedRecords.some((record) => /Product SKU/i.test(record.label || record.consultantLabel || '')) &&
      flow.importedRecords.some((record) => /Availability|Replenishment/i.test(record.label || record.consultantLabel || '')) &&
      !flow.importedRecords.some((record) => /Motion Branch Fulfillment SKU/.test(record.name || '') && /Finished\/Assembly Item/i.test(record.label || record.consultantLabel || '')),
    flow.importedRecords.map((record) => `${record.name}:${record.label || record.consultantLabel}`).join(' | '));

  assertCase(results, 'review-run-story-surfaces-remain-available-after-import',
    flow.storySurface &&
      flow.storySurface.evidenceReceiptW254 &&
      Array.isArray(flow.storySurface.evidenceReceiptW254.rows) &&
      flow.storySurface.evidenceReceiptW254.rows.length >= 6 &&
      userscript.includes('idb-w256-live-demo-script') &&
      userscript.includes('idb-w257-guided-demo-sequence') &&
      userscript.includes('idb-w258-first-glance-cta'),
    flow.storySurface && JSON.stringify({ openTarget: flow.storySurface.openTarget, receiptRows: flow.storySurface.evidenceReceiptW254.rows.length }));

  assertCase(results, 'fake-links-remain-blocked-before-import',
    flow.refresh.resultImportGuard.activeOpenLinksBeforeImport === 0 &&
      flow.guardrails.fakeOpenLinksBlockedBeforeImport === true,
    JSON.stringify(flow.refresh.resultImportGuard));

  assertCase(results, 'adapter-error-does-not-mutate-returned-records-or-show-fake-links',
    adapterErrorFlow.status === 'adapter_error_safe_stop' &&
      adapterErrorFlow.importedRecords.length === 0 &&
      adapterErrorFlow.captured.adapterSafeErrorState === true,
    JSON.stringify(adapterErrorFlow.captured));

  assertCase(results, 'normal-consultant-ui-hides-raw-adapter-diagnostics',
    !/runnerTaskId|script=6702|deploy=2|customdeployidb_governed_runner_adapter|operator gate|server flags|transport boundary/i.test(waitingHtml + completedHtml),
    (waitingHtml + completedHtml).slice(0, 1400));

  assertCase(results, 'no-drawer-created-records-or-transaction-writes-introduced',
    flow.guardrails.noDrawerCreatedRecords === true &&
      flow.guardrails.noDrawerTransactionWrites === true &&
      flow.guardrails.approvedServerAdapterPathOnly === true &&
      /no drawer-created records/i.test(report) &&
      trace.guardrails.noDrawerCreatedRecords === true,
    JSON.stringify(flow.guardrails));

  assertCase(results, 'archived-report-and-trace-present',
    /W264 Connected Build Submit/.test(report) &&
      trace.schema === 'forge.w264.connected-build-submit-refresh-import.trace.v1' &&
      trace.endpoint.includes('script=6702&deploy=2'),
    JSON.stringify(trace));

  const failed = results.filter((item) => !item.pass);
  results.forEach((item) => {
    console.log(`${item.pass ? 'PASS' : 'FAIL'} ${item.id}`);
    if (!item.pass && item.evidence) console.log(item.evidence);
  });
  console.log(`W264 connected build submit refresh import harness: ${results.length - failed.length}/${results.length} passed`);
  if (failed.length) process.exit(1);
}

main();
