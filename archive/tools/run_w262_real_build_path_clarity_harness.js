#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..', '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const reportPath = path.join(root, 'archive', 'reports', 'w262_real_build_path_clarity.md');
const tracePath = path.join(root, 'archive', 'trace_samples', 'w262_real_build_path_clarity_trace.json');

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
    fetch: () => Promise.reject(new Error('live fetch disabled in W262 harness')),
    globalThis: null,
    window: {
      self: null,
      top: null,
      location: {
        href: 'https://TD3021666.app.netsuite.com/app/center/card.nl',
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

function baseState(hooks) {
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
    integratedBuildAdapterConfig: {
      adapterProfileDisabled: true,
      adapterProfiles: [],
      selectedAdapterProfileId: '',
      endpointUrl: '',
      adapterApproved: true,
      CREATE_ENABLED: true,
      GOVERNED_SANDBOX_WRITE_ENABLED: true,
      QUEUE_SUBMIT_ENABLED: true,
      sandboxAccountAllowlist: ['TD3021666'],
      productionBuildModeEnabled: true,
      mode: 'production_build_saved_admin_config'
    },
    pageContext: {
      title: 'NetSuite Home',
      url: 'https://TD3021666.app.netsuite.com/app/center/card.nl',
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

function context(hooks, state) {
  const lane = hooks.getLane(state);
  const page = state.pageContext;
  const recommendation = hooks.recommendMove(lane, page);
  return { lane, page, recommendation };
}

function adapterReadyState(hooks) {
  const state = baseState(hooks);
  state.integratedBuildAdapterConfig = {
    endpointUrl: 'https://TD3021666.app.netsuite.com/app/site/hosting/scriptlet.nl?script=123&deploy=1',
    adapterApproved: true,
    CREATE_ENABLED: true,
    GOVERNED_SANDBOX_WRITE_ENABLED: true,
    QUEUE_SUBMIT_ENABLED: true,
    sandboxAccountAllowlist: ['TD3021666'],
    productionBuildModeEnabled: true,
    mode: 'production_build_saved_admin_config'
  };
  state.integratedBuildOperatorApproval = {
    endpointConfirmed: true,
    confirmedSandboxAccount: true,
    currentSandboxAccount: 'TD3021666',
    operatorName: 'Saved admin config',
    typeToConfirm: 'QUEUE GOVERNED SANDBOX RUNNER',
    operatorAuthorizationPhrase: 'AUTHORIZE ONE SANDBOX ADAPTER CALL',
    reviewDecision: 'operator_approved_queue_submit',
    confirmedNoSubmit: false
  };
  return state;
}

function submittedState(hooks) {
  const state = adapterReadyState(hooks);
  state.integratedBuildRunnerResult = {
    schema: 'idb.approved-server-adapter-result-envelope.v1',
    status: 'queued_pending',
    queueSubmitted: true,
    runnerTaskId: 'runner-w262-motion-001',
    resultCapture: { status: 'pending_runner_completion', runnerTaskId: 'runner-w262-motion-001' }
  };
  return state;
}

function completedResultState(hooks) {
  const state = adapterReadyState(hooks);
  state.integratedBuildRunnerResult = {
    schema: 'idb.approved-server-adapter-result-envelope.v1',
    status: 'completed_result_available',
    queueSubmitted: true,
    runnerTaskId: 'runner-w262-motion-001',
    finalGeneratedNamesJsonReady: true,
    finalGeneratedNamesJson: {
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
          internalId: '26201',
          url: 'https://TD3021666.app.netsuite.com/app/common/entity/custjob.nl?id=26201'
        },
        {
          role: 'sales_order',
          recordType: 'salesorder',
          type: 'salesorder',
          name: 'SO-W262 Motion Branch Availability',
          internalId: '26202',
          url: 'https://TD3021666.app.netsuite.com/app/accounting/transactions/salesord.nl?id=26202'
        },
        {
          role: 'branch_or_product_sku',
          recordType: 'inventoryitem',
          type: 'inventoryitem',
          name: 'Motion Branch Fulfillment SKU',
          internalId: '26203',
          url: 'https://TD3021666.app.netsuite.com/app/common/item/item.nl?id=26203'
        },
        {
          role: 'replenishment_or_availability_flow',
          recordType: 'inventoryitem',
          type: 'inventoryitem',
          name: 'Motion Availability Proof Flow',
          internalId: '26204',
          url: 'https://TD3021666.app.netsuite.com/app/common/item/item.nl?id=26204'
        }
      ]
    },
    resultCapture: {
      status: 'completed_result_available',
      runnerTaskId: 'runner-w262-motion-001',
      finalGeneratedNamesJson: {
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
            internalId: '26201',
            url: 'https://TD3021666.app.netsuite.com/app/common/entity/custjob.nl?id=26201'
          },
          {
            role: 'sales_order',
            recordType: 'salesorder',
            type: 'salesorder',
            name: 'SO-W262 Motion Branch Availability',
            internalId: '26202',
            url: 'https://TD3021666.app.netsuite.com/app/accounting/transactions/salesord.nl?id=26202'
          },
          {
            role: 'branch_or_product_sku',
            recordType: 'inventoryitem',
            type: 'inventoryitem',
            name: 'Motion Branch Fulfillment SKU',
            internalId: '26203',
            url: 'https://TD3021666.app.netsuite.com/app/common/item/item.nl?id=26203'
          },
          {
            role: 'replenishment_or_availability_flow',
            recordType: 'inventoryitem',
            type: 'inventoryitem',
            name: 'Motion Availability Proof Flow',
            internalId: '26204',
            url: 'https://TD3021666.app.netsuite.com/app/common/item/item.nl?id=26204'
          }
        ]
      }
    }
  };
  return state;
}

function main() {
  const hooks = loadHooks();
  const userscript = read(userscriptPath);
  const report = read(reportPath);
  const trace = JSON.parse(read(tracePath));
  const previewState = baseState(hooks);
  const readyState = adapterReadyState(hooks);
  const waitingState = submittedState(hooks);
  const completedState = completedResultState(hooks);
  const previewCtx = context(hooks, previewState);
  const readyCtx = context(hooks, readyState);
  const waitingCtx = context(hooks, waitingState);
  const completedCtx = context(hooks, completedState);
  const previewUx = hooks.adapterReadyRecordCreationUxW262(previewState, previewCtx.lane, previewCtx.page, previewCtx.recommendation);
  const readyUx = hooks.adapterReadyRecordCreationUxW262(readyState, readyCtx.lane, readyCtx.page, readyCtx.recommendation);
  const waitingUx = hooks.adapterReadyRecordCreationUxW262(waitingState, waitingCtx.lane, waitingCtx.page, waitingCtx.recommendation);
  const completedUx = hooks.adapterReadyRecordCreationUxW262(completedState, completedCtx.lane, completedCtx.page, completedCtx.recommendation);
  const previewHtml = hooks.renderIntegratedBuildRunnerReturnStatus(previewState, previewCtx.lane, previewCtx.page, previewCtx.recommendation);
  const readyHtml = hooks.renderIntegratedBuildRunnerReturnStatus(readyState, readyCtx.lane, readyCtx.page, readyCtx.recommendation);
  const waitingHtml = hooks.renderIntegratedBuildRunnerReturnStatus(waitingState, waitingCtx.lane, waitingCtx.page, waitingCtx.recommendation);
  const completedHtml = hooks.renderIntegratedBuildRunnerReturnStatus(completedState, completedCtx.lane, completedCtx.page, completedCtx.recommendation);
  const w260Packet = hooks.installReadyReleasePacketW260();
  const w261Template = hooks.postInstallSmokeEvidenceCaptureTemplateW261();
  const results = [];

  assertCase(results, 'visible-version-is-v1-0-0-without-trace-suffix',
    userscript.includes('@version      1.0.0') &&
      hooks.CONTRACT.product.version === 'V1.0.0' &&
      /V1\.0\.0/.test(hooks.renderDrawer(previewState)) &&
      !/w144-error-trace|v0\.1\.2/i.test(hooks.renderDrawer(previewState)),
    hooks.CONTRACT.product.version);

  assertCase(results, 'consultant-inputs-remain-name-website-notes-and-toggles',
    previewUx.consultantWorkflow.consultantNeedsAdminFields === false &&
      previewUx.consultantWorkflow.requiredInputs.join('|') === 'Customer / Prospect Name|Website|Conversation Notes' &&
      previewUx.consultantWorkflow.simpleToggles.join('|') === 'Create new item|Manufacturing|WIP',
    JSON.stringify(previewUx.consultantWorkflow));

  assertCase(results, 'preview-only-mode-is-clear-and-hides-adapter-diagnostics',
    previewUx.readinessState === 'smoke_preview_only' &&
      /Preview ready\. Record creation is not enabled in this install\./.test(previewHtml) &&
      /Continue to Run/.test(previewHtml) &&
      !/blocked before server adapter|operator gate|server flags|transport boundary|no submit|Invocation from drawer: no/i.test(previewHtml),
    previewHtml.slice(0, 1200));

  assertCase(results, 'real-build-records-button-appears-when-adapter-ready',
    readyUx.readinessState === 'ready_to_build_records' &&
      readyUx.actions.showBuildButton === true &&
      /data-idb-real-adapter-action="submit_w144_once">Build records<\/button>/.test(readyHtml) &&
      !/Preview ready\. Record creation is not enabled/.test(readyHtml),
    readyHtml.slice(0, 1200));

  assertCase(results, 'refresh-action-appears-after-submitted-build',
    waitingUx.readinessState === 'waiting_for_runner_result' &&
      waitingUx.actions.showRefreshButton === true &&
      /Refresh build status/.test(waitingHtml) &&
      /data-idb-build-return-action="check_runner_result"/.test(waitingHtml),
    waitingHtml.slice(0, 1200));

  assertCase(results, 'completed-result-is-ready-for-w245-import',
    completedUx.readinessState === 'records_ready_to_import' &&
      completedUx.actions.showFinishButton === true &&
      /Finish build/.test(completedHtml),
    completedHtml.slice(0, 1200));

  assertCase(results, 'returned-record-normalization-preserves-names-labels-open-links',
    (() => {
      const normalized = hooks.canonicalImportResultNormalizationW245(
        completedState.integratedBuildRunnerResult.resultCapture.finalGeneratedNamesJson,
        completedState,
        completedCtx.lane,
        completedCtx.page,
        completedCtx.recommendation
      );
      const labels = normalized.displayReadyRecords.map((item) => item.consultantLabel).join('|');
      const names = normalized.displayReadyRecords.map((item) => item.recordName).join('|');
      return /Motion Branch Fulfillment SKU/.test(names) &&
        /Motion Availability Proof Flow/.test(names) &&
        /Branch|Availability|SKU|Flow/i.test(labels) &&
        normalized.displayReadyRecords.every((item) => item.supportedOpenUrl && item.linkAuthorityStatus);
    })(),
    'W245 display-ready records');

  assertCase(results, 'w218-w220-and-fake-link-boundaries-remain-present',
    /W218|success wording|Records ready/i.test(report) &&
      /W220|recovery wording|fake Open-link blocking/i.test(report) &&
      previewUx.guardrails.fakeOpenLinksBlockedBeforeImport === true,
    report.slice(0, 800));

  assertCase(results, 'w260-release-packet-remains-drawer-only-install',
    w260Packet.installTarget === 'idb-drawer.user.js' &&
      w260Packet.updateOnly.length === 1 &&
      w260Packet.updateOnly[0] === 'idb-drawer.user.js' &&
      w260Packet.doNotUpdate.some((item) => /W144/i.test(item)) &&
      w260Packet.doNotUpdate.some((item) => /runner/i.test(item)) &&
      w260Packet.doNotUpdate.some((item) => /lane-pack/i.test(item)),
    JSON.stringify(w260Packet.installTarget));

  assertCase(results, 'w261-smoke-signoff-supports-preview-and-adapter-ready-paths',
    w261Template.fields.some((field) => field.id === 'pre_import_fake_links_blocked') &&
      w261Template.fields.some((field) => field.id === 'valid_import_story_ready') &&
      trace.previewOnlyReadinessState === 'smoke_preview_only' &&
      trace.adapterReadyReadinessState === 'ready_to_build_records',
    JSON.stringify(w261Template.fields.map((field) => field.id)));

  assertCase(results, 'runtime-authority-guardrails-preserved',
    previewUx.guardrails.noDrawerCreatedRecords === true &&
      previewUx.guardrails.noDrawerTransactionWrites === true &&
      previewUx.guardrails.recordCreationRequiresApprovedServerAdapterPath === true &&
      previewUx.guardrails.noW144DeploymentUpdateInThisBlock === true,
    JSON.stringify(previewUx.guardrails));

  const failed = results.filter((item) => !item.pass);
  results.forEach((item) => {
    console.log(`${item.pass ? 'PASS' : 'FAIL'} ${item.id}`);
    if (!item.pass && item.evidence) console.log(item.evidence);
  });
  console.log(`W262 real build path clarity harness: ${results.length - failed.length}/${results.length} passed`);
  if (failed.length) process.exit(1);
}

main();
