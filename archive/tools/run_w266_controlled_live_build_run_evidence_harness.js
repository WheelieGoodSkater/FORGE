#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..', '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const reportPath = path.join(root, 'archive', 'reports', 'w266_controlled_live_build_run_evidence.md');
const tracePath = path.join(root, 'archive', 'trace_samples', 'w266_controlled_live_build_run_evidence_trace.json');

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
    fetch: () => Promise.reject(new Error('live fetch disabled in W266 harness')),
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
        internalId: '26601',
        url: 'https://td3021666.app.netsuite.com/app/common/entity/custjob.nl?id=26601'
      },
      {
        role: 'sales_order',
        recordType: 'salesorder',
        type: 'salesorder',
        name: 'SO-W266 Motion Branch Availability',
        internalId: '26602',
        url: 'https://td3021666.app.netsuite.com/app/accounting/transactions/salesord.nl?id=26602'
      },
      {
        role: 'branch_or_product_sku',
        recordType: 'inventoryitem',
        type: 'inventoryitem',
        name: 'Motion Branch Fulfillment SKU',
        internalId: '26603',
        url: 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=26603'
      },
      {
        role: 'replenishment_or_availability_flow',
        recordType: 'inventoryitem',
        type: 'inventoryitem',
        name: 'Motion Availability Proof Flow',
        internalId: '26604',
        url: 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=26604'
      }
    ]
  };
}

function main() {
  const hooks = loadHooks();
  const report = read(reportPath);
  const trace = JSON.parse(read(tracePath));
  const state = motionState(hooks);
  const context = ctx(hooks, state);
  const submitResponse = {
    statusCode: 200,
    ok: true,
    payload: {
      status: 'queued',
      queueSubmitted: true,
      task: { id: 'runner-w266-motion-001' },
      idempotencyToken: 'motion-w266-token',
      resultCapture: { status: 'pending_runner_completion' }
    }
  };
  const pendingRefreshResponse = {
    data: {
      status: 'pending',
      queued: true,
      runner_task_id: 'runner-w266-motion-001',
      resultCapture: { status: 'pending_runner_completion' }
    }
  };
  const completedRefreshResponse = {
    ok: true,
    payload: {
      status: 'done',
      queueSubmitted: true,
      runner_task_id: 'runner-w266-motion-001',
      resultCapture: {
        status: 'completed_result_capture_ready',
        finalGeneratedNamesJson: completedMotionResult()
      }
    }
  };
  const packet = hooks.controlledLiveBuildRunEvidencePacketW266(state, context.lane, context.page, context.recommendation, {
    submittedAt: '2026-05-25T12:00:00.000Z',
    submitResponse,
    pendingRefreshResponse,
    completedRefreshResponse,
    malformedRefreshResponse: { status: 'adapter_error', error: true },
    finishBuild: true
  });
  const needsAttention = hooks.liveRunDecisionHelperW266(Object.assign({}, packet, {
    responseReconciliation: Object.assign({}, packet.responseReconciliation, {
      newAliasesObserved: true,
      safeAliasesOnly: true
    }),
    importEvidence: Object.assign({}, packet.importEvidence, { imported: false, returnedRecords: [] })
  }));
  const rollback = hooks.liveRunDecisionHelperW266(Object.assign({}, packet, {
    guardrails: Object.assign({}, packet.guardrails, { noDrawerTransactionWrites: false }),
    importEvidence: Object.assign({}, packet.importEvidence, { supportedOpenLinksOnly: false, fakeOpenLinksSeen: true })
  }));
  const aliasShape = hooks.actualAdapterResponseShapeW265({
    payload: {
      status: 'done',
      queueSubmitted: true,
      queueTaskId: 'runner-w266-alias-001',
      generatedNamesJson: completedMotionResult()
    }
  }, { phase: 'refresh' });
  const w264Flow = hooks.connectedBuildSubmitRefreshImportW264(state, context.lane, context.page, context.recommendation, {
    executeSubmit: true,
    executePoll: true,
    finishBuild: true,
    submitResponse: {
      status: 'queued_result_capture_pending',
      queueSubmitted: true,
      runnerTaskId: 'runner-w266-motion-001',
      idempotencyToken: 'motion-w266-token',
      resultCapture: { status: 'pending_runner_completion', runnerTaskId: 'runner-w266-motion-001' }
    },
    pollResponse: {
      status: 'completed_runner_result_ready',
      queueSubmitted: true,
      runnerTaskId: 'runner-w266-motion-001',
      resultCapture: {
        status: 'completed_result_capture_ready',
        runnerTaskId: 'runner-w266-motion-001',
        finalGeneratedNamesJson: completedMotionResult()
      }
    }
  });
  const duplicatePolicy = hooks.connectedBuildRetryPolicyW265({
    runnerTaskId: packet.submitEvidence.runnerTaskId,
    idempotencyToken: packet.submitEvidence.idempotencyToken,
    completedResultAccepted: false
  });
  const errorPolicy = hooks.connectedBuildRetryPolicyW265({
    runnerTaskId: packet.submitEvidence.runnerTaskId,
    idempotencyToken: packet.submitEvidence.idempotencyToken,
    adapterError: true
  });
  const normalCopy = packet.normalConsultantCopy.join(' ');
  const results = [];

  assertCase(results, 'live-evidence-packet-includes-required-capture-fields',
    packet.submitEvidence.runnerTaskId === 'runner-w266-motion-001' &&
      packet.submitEvidence.idempotencyToken === 'motion-w266-token' &&
      packet.refreshEvidence.pending.status === 'refresh_pending' &&
      packet.refreshEvidence.completed.status === 'completed_result_shape_ready' &&
      /resultCapture\.finalGeneratedNamesJson/.test(packet.refreshEvidence.finalGeneratedNamesJsonLocation || '') &&
      packet.w151Validation.completedResultAcceptedByW151 === true &&
      packet.importEvidence.imported === true &&
      packet.importEvidence.returnedRecords.length === 4 &&
      packet.importEvidence.supportedOpenLinksOnly === true,
    JSON.stringify(packet));

  assertCase(results, 'live-run-decision-helper-statuses',
    packet.liveRunDecision.status === 'ready_to_keep' &&
      needsAttention.status === 'needs_attention' &&
      rollback.status === 'rollback_recommended',
    JSON.stringify({ ready: packet.liveRunDecision, needsAttention, rollback }));

  assertCase(results, 'actual-response-aliases-continue-through-w265',
    aliasShape.status === 'completed_result_shape_ready' &&
      aliasShape.runnerTaskId === 'runner-w266-alias-001' &&
      aliasShape.finalGeneratedNamesJsonReady === true,
    JSON.stringify(aliasShape));

  assertCase(results, 'completed-result-imports-only-after-w151-valid-result',
    packet.w151Validation.completedResultAcceptedByW151 === true &&
      packet.importEvidence.imported === true &&
      packet.liveRunDecision.status === 'ready_to_keep',
    JSON.stringify(packet.w151Validation));

  assertCase(results, 'motion-distribution-records-keep-product-sku-availability-labels',
    packet.importEvidence.returnedRecords.some((record) => record.name === 'Motion Branch Fulfillment SKU' && /Product SKU/i.test(record.label || '')) &&
      packet.importEvidence.returnedRecords.some((record) => /Availability/i.test(record.label || '')) &&
      !packet.importEvidence.returnedRecords.some((record) => /Motion Branch Fulfillment SKU/.test(record.name || '') && /Finished\/Assembly Item/i.test(record.label || '')),
    packet.importEvidence.returnedRecords.map((record) => `${record.name}:${record.label}`).join(' | '));

  assertCase(results, 'normal-consultant-ui-hides-admin-details',
    packet.endpointHiddenFromNormalUi === true &&
      packet.rawEvidencePolicy.hiddenFromNormalConsultantUi === true &&
      !/endpoint|script=6702|raw JSON|runner-w266|task id|schema|stack trace|admin diagnostics/i.test(normalCopy),
    normalCopy);

  assertCase(results, 'duplicate-submit-and-error-retry-rules-remain-enforced',
    duplicatePolicy.duplicateSubmit.createsSecondBuild === false &&
      duplicatePolicy.duplicateSubmit.allowed === false &&
      errorPolicy.afterAdapterError.allowedAutomatically === false,
    JSON.stringify({ duplicate: duplicatePolicy.duplicateSubmit, error: errorPolicy.afterAdapterError }));

  assertCase(results, 'fake-open-links-remain-blocked-before-import',
    packet.guardrails.fakeOpenLinksBlockedBeforeImport === true &&
      w264Flow.guardrails.fakeOpenLinksBlockedBeforeImport === true,
    JSON.stringify(packet.guardrails));

  assertCase(results, 'w264-and-w265-continuity-still-passes',
    w264Flow.status === 'records_imported' &&
      packet.retrySafety.guardrails.finishRequiresW151ValidResult === true,
    JSON.stringify({ w264Status: w264Flow.status, retry: packet.retrySafety.guardrails }));

  assertCase(results, 'no-drawer-created-records-or-transaction-writes-introduced',
    packet.guardrails.noDrawerCreatedRecords === true &&
      packet.guardrails.noDrawerTransactionWrites === true &&
      packet.guardrails.approvedServerAdapterPathOnly === true &&
      /no drawer-created records/i.test(report) &&
      trace.guardrails.noDrawerCreatedRecords === true,
    JSON.stringify(packet.guardrails));

  assertCase(results, 'report-and-trace-archived',
    /W266 Controlled Live Build Run/.test(report) &&
      trace.schema === 'forge.w266.controlled-live-build-run-evidence.trace.v1' &&
      trace.liveRunDecision.status === 'ready_to_keep',
    JSON.stringify(trace));

  const failed = results.filter((item) => !item.pass);
  results.forEach((item) => {
    console.log(`${item.pass ? 'PASS' : 'FAIL'} ${item.id}`);
    if (!item.pass && item.evidence) console.log(item.evidence);
  });
  console.log(`W266 controlled live build run evidence harness: ${results.length - failed.length}/${results.length} passed`);
  if (failed.length) process.exit(1);
}

main();
