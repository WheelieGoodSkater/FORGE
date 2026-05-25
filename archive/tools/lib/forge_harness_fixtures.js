const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..', '..', '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');

function archivePath(...parts) {
  return path.join(root, 'archive', ...parts);
}

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function readArchiveText(...parts) {
  return read(archivePath(...parts));
}

function readArchiveJson(...parts) {
  return JSON.parse(readArchiveText(...parts));
}

function assertCase(results, id, pass, evidence) {
  results.push({ id, pass: Boolean(pass), evidence: evidence || '' });
}

function printResults(label, results) {
  const failed = results.filter((item) => !item.pass);
  results.forEach((item) => {
    console.log(`${item.pass ? 'PASS' : 'FAIL'} ${item.id}`);
    if (!item.pass && item.evidence) console.log(item.evidence);
  });
  console.log(`${label}: ${results.length - failed.length}/${results.length} passed`);
  if (failed.length) process.exit(1);
}

function createNetSuiteSandbox(fetchMessage) {
  const storage = new Map();
  const localStorage = {
    getItem: (key) => (storage.has(key) ? storage.get(key) : null),
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: (key) => storage.delete(key)
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
    fetch: () => Promise.reject(new Error(fetchMessage || 'live fetch disabled in harness')),
    globalThis: null,
    window: {
      self: null,
      top: null,
      location: {
        href: 'https://td3021666.app.netsuite.com/app/center/card.nl',
        pathname: '/app/center/card.nl',
        search: ''
      },
      localStorage,
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
  return sandbox;
}

function loadHooks(options = {}) {
  const sandbox = createNetSuiteSandbox(options.fetchMessage);
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

function motionContext(hooks, state) {
  const lane = hooks.getLane(state);
  const page = state.pageContext;
  const recommendation = hooks.recommendMove(lane, page);
  return { lane, page, recommendation };
}

function completedMotionResult(options = {}) {
  const prefix = String(options.prefix || '266');
  const salesOrderName = options.salesOrderName || `SO-W${prefix} Motion Branch Availability`;
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
        internalId: `${prefix}01`,
        url: `https://td3021666.app.netsuite.com/app/common/entity/custjob.nl?id=${prefix}01`
      },
      {
        role: 'sales_order',
        recordType: 'salesorder',
        type: 'salesorder',
        name: salesOrderName,
        internalId: `${prefix}02`,
        url: `https://td3021666.app.netsuite.com/app/accounting/transactions/salesord.nl?id=${prefix}02`
      },
      {
        role: 'branch_or_product_sku',
        recordType: 'inventoryitem',
        type: 'inventoryitem',
        name: 'Motion Branch Fulfillment SKU',
        internalId: `${prefix}03`,
        url: `https://td3021666.app.netsuite.com/app/common/item/item.nl?id=${prefix}03`
      },
      {
        role: 'replenishment_or_availability_flow',
        recordType: 'inventoryitem',
        type: 'inventoryitem',
        name: 'Motion Availability Proof Flow',
        internalId: `${prefix}04`,
        url: `https://td3021666.app.netsuite.com/app/common/item/item.nl?id=${prefix}04`
      }
    ]
  };
}

function invalidMotionResult(options = {}) {
  const result = completedMotionResult(options);
  result.records = result.records.map((record) => record.role === 'branch_or_product_sku'
    ? Object.assign({}, record, { internalId: '', url: '' })
    : record);
  return result;
}

function submitResponse(taskId, token) {
  return {
    statusCode: 200,
    ok: true,
    payload: {
      status: 'queued',
      queueSubmitted: true,
      task: { id: taskId },
      idempotencyToken: token,
      resultCapture: { status: 'pending_runner_completion' }
    }
  };
}

function pendingRefreshResponse(taskId) {
  return {
    data: {
      status: 'pending',
      queued: true,
      runner_task_id: taskId,
      resultCapture: { status: 'pending_runner_completion' }
    }
  };
}

function completedRefreshResponse(taskId, result) {
  return {
    ok: true,
    payload: {
      status: 'done',
      queueSubmitted: true,
      runner_task_id: taskId,
      resultCapture: {
        status: 'completed_result_capture_ready',
        finalGeneratedNamesJson: result
      }
    }
  };
}

module.exports = {
  root,
  userscriptPath,
  archivePath,
  read,
  readArchiveText,
  readArchiveJson,
  assertCase,
  printResults,
  loadHooks,
  motionState,
  motionContext,
  completedMotionResult,
  invalidMotionResult,
  submitResponse,
  pendingRefreshResponse,
  completedRefreshResponse
};
