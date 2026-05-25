#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..', '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const reportPath = path.join(root, 'archive', 'reports', 'w267_live_run_screenshot_reconciliation.md');
const tracePath = path.join(root, 'archive', 'trace_samples', 'w267_live_run_screenshot_reconciliation_trace.json');

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
    fetch: () => Promise.reject(new Error('live fetch disabled in W267 harness')),
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

function motionState(hooks) {
  const profile = hooks.releasedAdapterProfileW263();
  const config = hooks.applySelectedAdapterProfileToConfigW263({
    selectedAdapterProfileId: profile.profileId,
    adapterProfiles: [profile],
    adapterApproved: true,
    CREATE_ENABLED: true,
    GOVERNED_SANDBOX_WRITE_ENABLED: true,
    QUEUE_SUBMIT_ENABLED: true,
    sandboxAccountAllowlist: ['TD3021666'],
    productionBuildModeEnabled: true,
    mode: 'production_build_saved_admin_config'
  });
  const state = {
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
  };
  hooks.ensureWebsiteEvidenceRuntime(state);
  hooks.reconcileStateAuthority(state);
  const lane = hooks.getLane(state);
  const recommendation = hooks.recommendMove(lane, state.pageContext);
  state.acceptedPacket = hooks.buildAcceptedPacketContext(state, lane, state.pageContext, recommendation);
  hooks.reconcileStateAuthority(state);
  return state;
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

function buildW266Packet(hooks) {
  const state = motionState(hooks);
  const lane = hooks.getLane(state);
  const page = state.pageContext;
  const recommendation = hooks.recommendMove(lane, page);
  return hooks.controlledLiveBuildRunEvidencePacketW266(state, lane, page, recommendation, {
    submittedAt: '2026-05-25T12:30:00.000Z',
    submitResponse: {
      statusCode: 200,
      ok: true,
      payload: {
        status: 'queued',
        queueSubmitted: true,
        task: { id: 'runner-w267-motion-001' },
        idempotencyToken: 'motion-w267-token',
        resultCapture: { status: 'pending_runner_completion' }
      }
    },
    pendingRefreshResponse: {
      data: {
        status: 'pending',
        queued: true,
        runner_task_id: 'runner-w267-motion-001',
        resultCapture: { status: 'pending_runner_completion' }
      }
    },
    completedRefreshResponse: {
      ok: true,
      payload: {
        status: 'done',
        queueSubmitted: true,
        runner_task_id: 'runner-w267-motion-001',
        resultCapture: {
          status: 'completed_result_capture_ready',
          finalGeneratedNamesJson: completedMotionResult()
        }
      }
    },
    finishBuild: true
  });
}

function passingReviewerEvidence(w266Packet) {
  const records = w266Packet.importEvidence.returnedRecords;
  const openLinks = {};
  records.forEach((record) => {
    openLinks[record.role] = { openedSuccessfully: true, note: 'Opened in NetSuite during screenshot review.' };
  });
  return {
    buildRecordsClicked: true,
    buildSubmittedStateShown: true,
    refreshBuildStatusStateShown: true,
    recordsReadyFinishBuildStateShown: true,
    returnedNamesLaneLabelsShown: true,
    supportedOpenLinksAfterImport: true,
    reviewRunStorySurfacesVisible: true,
    weakUncertaintyVisible: { pass: true, note: 'Motion website evidence remained thin enough to keep uncertainty visible.' },
    expectedConsultantCopyShown: true,
    returnedRecordsShown: records.map((record) => ({ name: record.name, label: record.label })),
    openLinks,
    rawDiagnosticsVisible: false,
    endpointVisible: false,
    runnerTaskIdVisible: false,
    schemaNamesVisible: false,
    stackTraceVisible: false,
    adminDiagnosticsVisible: false,
    fakeOpenLinksVisible: false,
    unsupportedUrlsVisible: false,
    invalidImportVisible: false
  };
}

function main() {
  const hooks = loadHooks();
  const report = read(reportPath);
  const trace = JSON.parse(read(tracePath));
  const w266Packet = buildW266Packet(hooks);
  const readyPacket = hooks.postLiveRunScreenshotEvidencePacketW267(w266Packet, {
    reviewerEvidence: passingReviewerEvidence(w266Packet)
  });
  const needsPacket = hooks.postLiveRunScreenshotEvidencePacketW267(w266Packet, {
    reviewerEvidence: Object.assign({}, passingReviewerEvidence(w266Packet), {
      returnedNamesLaneLabelsShown: { pass: false, note: 'One label needs copy polish.' },
      returnedRecordsShown: w266Packet.importEvidence.returnedRecords.slice(0, 2).map((record) => ({ name: record.name, label: record.label }))
    })
  });
  const rollbackPacket = hooks.postLiveRunScreenshotEvidencePacketW267(w266Packet, {
    reviewerEvidence: Object.assign({}, passingReviewerEvidence(w266Packet), {
      fakeOpenLinksVisible: true,
      unsupportedUrlsVisible: true
    })
  });
  const openLinkCapture = hooks.openLinkVerificationCaptureW267(
    w266Packet.importEvidence.returnedRecords,
    passingReviewerEvidence(w266Packet).openLinks
  );
  const w264Policy = hooks.connectedBuildSubmitRefreshImportW264(
    motionState(hooks),
    hooks.getLane(motionState(hooks)),
    motionState(hooks).pageContext,
    hooks.recommendMove(hooks.getLane(motionState(hooks)), motionState(hooks).pageContext),
    { executeSubmit: false, executePoll: false }
  );
  const w265Retry = hooks.connectedBuildRetryPolicyW265({
    runnerTaskId: w266Packet.submitEvidence.runnerTaskId,
    idempotencyToken: w266Packet.submitEvidence.idempotencyToken
  });
  const results = [];
  const requiredIds = [
    'build_records_clicked',
    'build_submitted_state_shown',
    'refresh_build_status_state_shown',
    'records_ready_finish_build_state_shown',
    'returned_names_lane_labels_shown',
    'supported_open_links_after_import',
    'review_run_story_surfaces_visible',
    'weak_uncertainty_visible'
  ];

  assertCase(results, 'screenshot-evidence-reconciliation-packet-includes-required-capture-fields',
    readyPacket.schema === 'forge.w267.post-live-run-screenshot-evidence-reconciliation.v1' &&
      requiredIds.every((id) => readyPacket.reviewerEvidenceRows.some((row) => row.id === id)) &&
      readyPacket.expectedFromW266.records.length === w266Packet.importEvidence.returnedRecords.length &&
      readyPacket.reviewOnlyPolicy.archiveOnly === true,
    JSON.stringify(readyPacket.reviewerEvidenceRows));

  assertCase(results, 'open-link-verification-capture-includes-each-returned-w266-record',
    openLinkCapture.rows.length === w266Packet.importEvidence.returnedRecords.length &&
      openLinkCapture.rows.every((row) => row.openedSuccessfully === true && row.expectedSupportedOpenUrl === true),
    JSON.stringify(openLinkCapture));

  assertCase(results, 'signoff-helper-returns-ready-attention-and-rollback',
    readyPacket.signoff.status === 'ready_to_keep' &&
      needsPacket.signoff.status === 'needs_attention' &&
      rollbackPacket.signoff.status === 'rollback_recommended',
    JSON.stringify({ ready: readyPacket.signoff, needs: needsPacket.signoff, rollback: rollbackPacket.signoff }));

  assertCase(results, 'normal-consultant-ui-expectations-hide-raw-diagnostics',
    readyPacket.comparison.rawDiagnosticsHidden === true &&
      readyPacket.screenshotEvidence.endpointVisible === false &&
      readyPacket.screenshotEvidence.runnerTaskIdVisible === false &&
      readyPacket.screenshotEvidence.schemaNamesVisible === false &&
      readyPacket.screenshotEvidence.stackTraceVisible === false &&
      readyPacket.screenshotEvidence.adminDiagnosticsVisible === false,
    JSON.stringify(readyPacket.screenshotEvidence));

  assertCase(results, 'w266-live-run-decision-remains-available',
    w266Packet.liveRunDecision.status === 'ready_to_keep' &&
      readyPacket.expectedFromW266.openLinkAuthority === true,
    JSON.stringify(w266Packet.liveRunDecision));

  assertCase(results, 'w264-w265-w266-continuity-remains-available',
    w264Policy.guardrails.noDrawerCreatedRecords === true &&
      w265Retry.duplicateSubmit.createsSecondBuild === false &&
      w266Packet.guardrails.w265RetrySafetyPreserved === true,
    JSON.stringify({ w264: w264Policy.guardrails, w265: w265Retry.duplicateSubmit, w266: w266Packet.guardrails }));

  assertCase(results, 'no-drawer-created-records-or-transaction-writes-introduced',
    readyPacket.guardrails.noDrawerCreatedRecords === true &&
      readyPacket.guardrails.noDrawerTransactionWrites === true &&
      readyPacket.reviewOnlyPolicy.networkCallAllowed === false &&
      readyPacket.reviewOnlyPolicy.localStorageWriteAllowed === false &&
      readyPacket.reviewOnlyPolicy.installActionAllowed === false,
    JSON.stringify({ guardrails: readyPacket.guardrails, policy: readyPacket.reviewOnlyPolicy }));

  assertCase(results, 'report-and-trace-archived',
    /W267 Live Run Screenshot Reconciliation/.test(report) &&
      trace.schema === 'forge.w267.live-run-screenshot-reconciliation.trace.v1' &&
      trace.signoff.status === 'ready_to_keep',
    JSON.stringify(trace));

  const failed = results.filter((item) => !item.pass);
  results.forEach((item) => {
    console.log(`${item.pass ? 'PASS' : 'FAIL'} ${item.id}`);
    if (!item.pass && item.evidence) console.log(item.evidence);
  });
  console.log(`W267 live run screenshot reconciliation harness: ${results.length - failed.length}/${results.length} passed`);
  if (failed.length) process.exit(1);
}

main();
