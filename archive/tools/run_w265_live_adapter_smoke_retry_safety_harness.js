#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..', '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const reportPath = path.join(root, 'archive', 'reports', 'w265_live_adapter_smoke_retry_safety.md');
const tracePath = path.join(root, 'archive', 'trace_samples', 'w265_live_adapter_smoke_retry_safety_trace.json');

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
    fetch: () => Promise.reject(new Error('live fetch disabled in W265 harness')),
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
        internalId: '26501',
        url: 'https://td3021666.app.netsuite.com/app/common/entity/custjob.nl?id=26501'
      },
      {
        role: 'sales_order',
        recordType: 'salesorder',
        type: 'salesorder',
        name: 'SO-W265 Motion Branch Availability',
        internalId: '26502',
        url: 'https://td3021666.app.netsuite.com/app/accounting/transactions/salesord.nl?id=26502'
      },
      {
        role: 'branch_or_product_sku',
        recordType: 'inventoryitem',
        type: 'inventoryitem',
        name: 'Motion Branch Fulfillment SKU',
        internalId: '26503',
        url: 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=26503'
      },
      {
        role: 'replenishment_or_availability_flow',
        recordType: 'inventoryitem',
        type: 'inventoryitem',
        name: 'Motion Availability Proof Flow',
        internalId: '26504',
        url: 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=26504'
      }
    ]
  };
}

function main() {
  const hooks = loadHooks();
  const userscript = read(userscriptPath);
  const report = read(reportPath);
  const trace = JSON.parse(read(tracePath));
  const state = motionState(hooks);
  const context = ctx(hooks, state);
  const submitFixture = {
    statusCode: 200,
    ok: true,
    payload: {
      status: 'queued',
      queueSubmitted: true,
      task: { id: 'runner-w265-motion-001' },
      idempotencyToken: 'motion-w265-token',
      resultCapture: { status: 'pending_runner_completion' }
    }
  };
  const pendingFixture = {
    data: {
      status: 'pending',
      queued: true,
      runner_task_id: 'runner-w265-motion-001',
      resultCapture: { status: 'pending_runner_completion' }
    }
  };
  const completedFixture = {
    ok: true,
    payload: {
      status: 'done',
      queueSubmitted: true,
      runner_task_id: 'runner-w265-motion-001',
      resultCapture: {
        status: 'completed_result_capture_ready',
        finalGeneratedNamesJson: completedMotionResult()
      }
    }
  };
  const malformedFixture = {
    status: 'adapter_exception',
    error: true,
    errorMessage: 'Adapter stopped safely before result import.'
  };
  const packet = hooks.liveAdapterSmokeEvidencePacketW265(state, context.lane, context.page, context.recommendation, {
    submitResponse: submitFixture,
    pendingRefreshResponse: pendingFixture,
    completedRefreshResponse: completedFixture,
    malformedRefreshResponse: malformedFixture
  });
  const duplicatePolicy = hooks.connectedBuildRetryPolicyW265({
    runnerTaskId: 'runner-w265-motion-001',
    idempotencyToken: 'motion-w265-token',
    completedResultAccepted: false
  });
  const errorPolicy = hooks.connectedBuildRetryPolicyW265({
    runnerTaskId: 'runner-w265-motion-001',
    idempotencyToken: 'motion-w265-token',
    adapterError: true
  });
  const w264Flow = hooks.connectedBuildSubmitRefreshImportW264(state, context.lane, context.page, context.recommendation, {
    executeSubmit: true,
    executePoll: true,
    finishBuild: true,
    submitResponse: {
      schema: 'idb.governed-runner-adapter-result.v1',
      status: 'queued_result_capture_pending',
      queueSubmitted: true,
      runnerTaskId: 'runner-w265-motion-001',
      idempotencyToken: 'motion-w265-token',
      resultCapture: { status: 'pending_runner_completion', runnerTaskId: 'runner-w265-motion-001' }
    },
    pollResponse: {
      schema: 'idb.approved-server-adapter-result-envelope.v1',
      status: 'completed_runner_result_ready',
      queueSubmitted: true,
      runnerTaskId: 'runner-w265-motion-001',
      resultCapture: {
        status: 'completed_result_capture_ready',
        runnerTaskId: 'runner-w265-motion-001',
        finalGeneratedNamesJson: completedMotionResult()
      }
    }
  });
  const completedState = motionState(hooks, {
    integratedBuildRunnerResult: {
      status: 'completed_result_available',
      queueSubmitted: true,
      runnerTaskId: 'runner-w265-motion-001',
      idempotencyToken: 'motion-w265-token',
      finalGeneratedNamesJsonReady: true,
      finalGeneratedNamesJson: completedMotionResult(),
      resultCapture: {
        status: 'completed_result_capture_ready',
        runnerTaskId: 'runner-w265-motion-001',
        finalGeneratedNamesJson: completedMotionResult()
      }
    }
  });
  const completedContext = ctx(hooks, completedState);
  const completedHtml = hooks.renderIntegratedBuildRunnerReturnStatus(completedState, completedContext.lane, completedContext.page, completedContext.recommendation);
  const results = [];

  assertCase(results, 'actual-fixture-submit-aliases-normalize-runner-task',
    packet.submitShape.status === 'submit_task_captured' &&
      packet.submitShape.runnerTaskId === 'runner-w265-motion-001' &&
      packet.submitShape.idempotencyToken === 'motion-w265-token' &&
      packet.submitShape.http.status === '200',
    JSON.stringify(packet.submitShape));

  assertCase(results, 'pending-refresh-stays-waiting',
    packet.refreshShapes.pending.status === 'refresh_pending' &&
      packet.refreshShapes.pending.normalUiCopy === 'Still building.',
    JSON.stringify(packet.refreshShapes.pending));

  assertCase(results, 'completed-refresh-shows-finish-build-without-auto-import',
    packet.refreshShapes.completed.status === 'completed_result_shape_ready' &&
      packet.completedResultGuard.completedResultAcceptedByW151 === true &&
      /Finish build/.test(completedHtml) &&
      !/Motion Branch Fulfillment SKU/.test(completedHtml),
    completedHtml.slice(0, 1200));

  assertCase(results, 'finish-build-imports-only-w151-valid-results',
    w264Flow.status === 'records_imported' &&
      w264Flow.importedRecords.some((record) => record.name === 'Motion Branch Fulfillment SKU') &&
      packet.completedResultGuard.completedResultAcceptedByW151 === true,
    w264Flow.importedRecords.map((record) => record.name).join(' | '));

  assertCase(results, 'malformed-error-refresh-asks-admin-without-fake-links',
    packet.refreshShapes.malformedOrError.status === 'adapter_error_safe_stop' &&
      packet.refreshShapes.malformedOrError.normalUiCopy === 'Build stopped safely, ask admin.' &&
      packet.refreshShapes.malformedOrError.normalizedResponse.activeOpenLinks === 0,
    JSON.stringify(packet.refreshShapes.malformedOrError));

  assertCase(results, 'duplicate-submit-does-not-create-second-build',
    duplicatePolicy.duplicateSubmit.allowed === false &&
      duplicatePolicy.duplicateSubmit.createsSecondBuild === false &&
      duplicatePolicy.duplicateSubmit.action === 'use_existing_build_and_refresh_status' &&
      duplicatePolicy.duplicateSubmit.idempotencyPreserved === true,
    JSON.stringify(duplicatePolicy.duplicateSubmit));

  assertCase(results, 'retry-after-adapter-error-is-gated',
    errorPolicy.afterAdapterError.allowedAutomatically === false &&
      errorPolicy.afterAdapterError.action === 'requires_new_explicit_consultant_or_admin_action',
    JSON.stringify(errorPolicy.afterAdapterError));

  assertCase(results, 'raw-response-evidence-archived-admin-only-not-normal-ui',
    packet.rawEvidencePolicy.archiveOnly === true &&
      packet.rawEvidencePolicy.adminDebugOnly === true &&
      packet.rawEvidencePolicy.hiddenFromNormalConsultantUi === true &&
      !/runner-w265|motion-w265-token|script=6702|raw JSON|stack trace|schema name/i.test(packet.normalConsultantCopy.join(' ')),
    JSON.stringify(packet.rawEvidencePolicy));

  assertCase(results, 'w264-motion-connected-path-still-passes',
    w264Flow.guardrails.w245CanonicalImportPreserved === true &&
      w264Flow.guardrails.fakeOpenLinksBlockedBeforeImport === true &&
      w264Flow.importedRecords.some((record) => /Product SKU/i.test(record.label || '')),
    JSON.stringify(w264Flow.guardrails));

  assertCase(results, 'no-drawer-created-records-or-transaction-writes-introduced',
    packet.guardrails.noDrawerCreatedRecords === true &&
      packet.guardrails.noDrawerTransactionWrites === true &&
      duplicatePolicy.guardrails.noDrawerCreatedRecords === true &&
      /no drawer-created records/i.test(report) &&
      trace.guardrails.noDrawerCreatedRecords === true,
    JSON.stringify(packet.guardrails));

  assertCase(results, 'report-and-trace-archived',
    /W265 Live Adapter Smoke/.test(report) &&
      trace.schema === 'forge.w265.live-adapter-smoke-retry-safety.trace.v1' &&
      trace.submitShape.runnerTaskId === 'runner-w265-motion-001',
    JSON.stringify(trace));

  const failed = results.filter((item) => !item.pass);
  results.forEach((item) => {
    console.log(`${item.pass ? 'PASS' : 'FAIL'} ${item.id}`);
    if (!item.pass && item.evidence) console.log(item.evidence);
  });
  console.log(`W265 live adapter smoke retry safety harness: ${results.length - failed.length}/${results.length} passed`);
  if (failed.length) process.exit(1);
}

main();
