const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const adapterPath = path.join(root, 'netsuite', 'idb_governed_runner_adapter_w144_suitelet_v2_json_errors.js');
const dataPath = path.join(root, 'data', 'w205_production_consultant_flow_cleanup.json');
const tracePath = path.join(root, 'trace_samples', 'w205_production_consultant_flow_cleanup_trace.json');
const reportPath = path.join(root, 'reports', 'w205_production_consultant_flow_cleanup.md');

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function assertCase(results, name, pass, detail) {
  results.push({ name, pass: Boolean(pass), detail: detail || '' });
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
    fetch: () => Promise.reject(new Error('live NetSuite fetch disabled in W205 harness')),
    globalThis: null,
    window: {
      self: null,
      top: null,
      location: {
        href: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/center/card.nl',
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
  vm.runInContext(fs.readFileSync(userscriptPath, 'utf8'), sandbox, { filename: userscriptPath });
  if (!sandbox.__IDB_TEST_HOOKS__) throw new Error('Missing IDB test hooks.');
  return sandbox.__IDB_TEST_HOOKS__;
}

function baseState() {
  return {
    open: true,
    selectedLaneId: 'apparel_accessories',
    laneSelectionSource: 'consultant_confirmed',
    selectedActionId: 'prove',
    briefPrepared: true,
    activeView: 'review',
    setupEditMode: false,
    intake: {
      customer: 'Ariat International',
      website: 'https://www.ariat.com/',
      notes: 'Buyer needs style, size, color, replenishment timing, and channel availability connected for seasonal footwear and apparel launches.',
      websiteEvidence: 'Ariat sells footwear, apparel, workwear, outdoor gear, size/color variants, and retail ecommerce categories.',
      scObjective: 'Prepare a concise demo story showing how NetSuite supports style/SKU readiness, size/color availability, replenishment timing, and customer promise.'
    },
    toggles: {
      createNewHeroItem: true,
      enableManufacturing: false,
      enableWip: false
    },
    acceptedPacket: null,
    dccFinalNamingResult: null,
    integratedBuildRunnerResult: {
      status: 'completed_result_awaiting_w151_import',
      runnerTaskId: 'SCHEDSCRIPT_REDACTED',
      resultCaptureStatus: 'completed_result_capture_ready',
      finalGeneratedNamesJsonReady: true
    },
    pageContext: {
      title: 'NetSuite Home',
      url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/center/card.nl',
      pageType: 'NetSuite page',
      contextId: 'generic_netsuite_page',
      confidence: 'low',
      movePreference: ['Customer Record', 'Sales Order View'],
      capturedAt: '2026-05-18T10:00:00.000Z'
    }
  };
}

function completedRunnerResultWithRelativeSalesOrderUrl() {
  return {
    schema: 'idb.completed-runner-result-json.v1',
    status: 'completed',
    runStatus: 'completed',
    generatedRecordOwner: 'governed_runner_internal_build_engine',
    records: {
      customer: {
        type: 'customer',
        name: 'Ariat International Customer Account',
        internalId: '1722',
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/entity/custjob.nl?id=1722'
      },
      demoTransaction: {
        type: 'salesorder',
        name: 'SO2677',
        internalId: '80828',
        url: '/app/accounting/transactions/salesord.nl?id=80828'
      },
      heroItem: {
        type: 'inventoryitem',
        name: 'SCAI - Ariat International Style SKU - ESSORIES',
        internalId: '1865',
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=1865'
      },
      matrixProofItem: {
        type: 'inventoryitem',
        name: 'Ariat International Omnichannel Availability Flow',
        internalId: '2545',
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=2545'
      },
      componentItem: {
        type: 'inventoryitem',
        name: 'Ariat International Core Style',
        internalId: '2546',
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=2546'
      }
    }
  };
}

function main() {
  const hooks = loadHooks();
  const state = baseState();
  hooks.ensureWebsiteEvidenceRuntime(state);
  hooks.reconcileStateAuthority(state);
  const lane = hooks.getLane(state);
  const page = state.pageContext;
  const recommendation = hooks.recommendMove(lane, page);
  state.acceptedPacket = hooks.buildAcceptedPacketContext(state, lane, page, recommendation);

  const completedResult = completedRunnerResultWithRelativeSalesOrderUrl();
  const guard = hooks.validateDccFinalNamingImportPayload(completedResult, state, lane, page, recommendation);
  state.dccFinalNamingResult = guard.finalNaming;
  const navigation = hooks.dccFinalNavigationModel(state, lane, page, recommendation);
  const cleanup = hooks.productionConsultantFlowCleanupAfterFiveLinkPassW205V1(state, lane, page, recommendation);
  const reviewHtml = hooks.renderReviewView(state, lane, page, recommendation);
  const adapterSource = fs.readFileSync(adapterPath, 'utf8');
  const salesOrder = navigation.reviewObjects.find((record) => record.role === 'sales_order');

  const results = [];
  assertCase(results, 'w205_w151_guard_still_accepts_completed_result', guard.valid === true, JSON.stringify(guard));
  assertCase(results, 'w205_sales_order_url_normalized_to_absolute_in_drawer', /^https:\/\/SANDBOX_ACCOUNT_ID\.app\.netsuite\.com\/app\/accounting\/transactions\/salesord\.nl\?id=80828$/i.test(salesOrder && salesOrder.url), salesOrder && salesOrder.url);
  assertCase(results, 'w205_w144_adapter_builds_absolute_record_urls', adapterSource.includes('https://${accountId}.app.netsuite.com') && !adapterSource.includes("return `/app/accounting/transactions/salesord.nl?id=${internalId}`"), 'W144 buildNetSuiteRecordUrl returns account-hosted absolute URLs.');
  assertCase(results, 'w205_admin_adapter_controls_hidden_after_import', !reviewHtml.includes('Approved W144 Suitelet endpoint') && !reviewHtml.includes('Submit W144 once') && reviewHtml.includes('Admin/debug: governed runner trace'), 'Post-import review renders compact status and hides adapter setup controls.');
  assertCase(results, 'w205_consultant_flow_reduced_to_intake_and_simple_toggles', cleanup.consultantIntake.visibleRequiredFields.length === 3 && cleanup.consultantIntake.simpleBuildToggles.length === 3 && cleanup.consultantIntake.adapterConfigurationVisibility === 'hidden_behind_saved_admin_debug_config', JSON.stringify(cleanup.consultantIntake));
  assertCase(results, 'w205_five_verified_open_links_remain_after_import', cleanup.linkAuthority.requiredRoles.length === 5 && cleanup.linkAuthority.requiredRoles.every((role) => role.present && role.openable && role.absoluteUrl), JSON.stringify(cleanup.linkAuthority.requiredRoles));
  assertCase(results, 'w205_no_regression_boundaries_preserved', cleanup.noRegression.w151ImportGuardPreserved && cleanup.noRegression.noDrawerWrites && cleanup.noRegression.noDrawerCreatedRecords && cleanup.noRegression.noDrawerTransactionWrites && cleanup.noRegression.runnerOwnsGeneratedRecords, JSON.stringify(cleanup.noRegression));

  const pass = results.every((result) => result.pass);
  const contract = {
    schema: 'idb.w205-production-consultant-flow-cleanup-after-five-link-pass.v1',
    status: pass ? 'PASS_W205_PRODUCTION_CONSULTANT_FLOW_CLEANED_UP' : 'FAIL_W205_CLEANUP_REGRESSION',
    cleanupContract: {
      consultantVisibleInputs: ['Customer / Prospect Name', 'Website', 'Conversation Notes'],
      consultantBuildToggles: ['Create new hero item', 'Manufacturing', 'WIP'],
      adminDebugConfig: 'saved_and_collapsed_outside_consultant_flow',
      exportHandoffMode: 'debug_operator_evidence_only',
      openLinkPolicy: 'show Open only after completed W151 result import'
    },
    urlNormalization: cleanup.resultUrlNormalization,
    linkAuthoritySummary: cleanup.linkAuthority.summary,
    traceSamples: {
      runnerTaskId: state.integratedBuildRunnerResult.runnerTaskId,
      importedSalesOrderUrlBeforeNormalization: completedResult.records.demoTransaction.url,
      importedSalesOrderUrlAfterNormalization: salesOrder && salesOrder.url,
      buildStatusSurface: 'compact_imported_records_ready'
    },
    noRegression: cleanup.noRegression,
    results
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, {
    schema: 'idb.w205-trace-samples.v1',
    samples: contract.traceSamples,
    cleanupStatus: contract.status,
    linkAuthoritySummary: contract.linkAuthoritySummary
  });
  fs.writeFileSync(reportPath, [
    '# W205 Production Consultant Flow Cleanup Report',
    '',
    `Status: ${contract.status}`,
    '',
    '## Cleanup Contract',
    '- Consultant-facing intake stays at Customer / Prospect Name, Website, and Conversation Notes.',
    '- Consultant-facing build controls stay limited to simple build toggles.',
    '- W144 endpoint, flags, operator phrases, and submit controls are hidden behind admin/debug state after completed result import.',
    '- Sales Order URLs are normalized to absolute NetSuite URLs before drawer Open links render.',
    '- Export handoff remains debug/operator evidence, not the primary production build path.',
    '',
    '## Regression Harness',
    ...results.map((result) => `- ${result.pass ? 'PASS' : 'FAIL'} ${result.name}: ${result.detail}`),
    '',
    '## Visual Testing Decision',
    'No broad visual testing required. The existing W204/W205 five-link pass is accepted; future visual checks should be targeted-only if link authority changes.',
    ''
  ].join('\n'));

  if (!pass) {
    console.error(JSON.stringify(contract, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({
    status: contract.status,
    reportPath,
    dataPath,
    tracePath,
    checked: results.length
  }, null, 2));
}

main();
