#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const snapshotPath = path.join(root, 'data', 'w240_canonical_contract_snapshot.json');
const contractPath = path.join(root, 'data', 'w240_drawer_contract_source_alignment.json');
const reportPath = path.join(root, 'reports', 'w240_drawer_contract_source_alignment.md');
const tracePath = path.join(root, 'trace_samples', 'w240_drawer_contract_source_alignment_trace.json');

const { buildContractSnapshot, SNAPSHOT_VERSION } = require('../src/contracts/snapshot');

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function readJson(file) {
  return JSON.parse(read(file));
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
    fetch: () => Promise.reject(new Error('live fetch disabled in W240 harness')),
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
  vm.runInContext(read(userscriptPath), sandbox, { filename: userscriptPath });
  if (!sandbox.__IDB_TEST_HOOKS__) throw new Error('Missing IDB test hooks.');
  return sandbox.__IDB_TEST_HOOKS__;
}

function baseState() {
  return {
    selectedLaneId: 'food_beverage',
    laneSelectionSource: 'consultant_confirmed',
    selectedActionId: 'prove',
    briefPrepared: true,
    setupEditMode: false,
    intake: {
      customer: 'Liquid Death',
      website: 'https://liquiddeath.com',
      notes: 'Buyer needs a food and beverage proof path for canned water, finished beverage availability, ingredient readiness, production planning, and customer promise.'
    },
    toggles: {
      createNewHeroItem: true,
      enableManufacturing: true,
      enableWip: false
    },
    pageContext: {
      title: 'NetSuite Home',
      url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/center/card.nl',
      pageType: 'NetSuite page',
      contextId: 'generic_netsuite_page',
      confidence: 'low'
    }
  };
}

function contextFor(hooks, state) {
  hooks.ensureWebsiteEvidenceRuntime(state);
  hooks.reconcileStateAuthority(state);
  const lane = hooks.getLane(state);
  const page = state.pageContext;
  const recommendation = hooks.recommendMove(lane, page);
  return { state, lane, page, recommendation };
}

function legacyResult() {
  return {
    schema: 'idb.completed-runner-result-json.v1',
    status: 'completed',
    runStatus: 'completed',
    generatedRecordOwner: 'governed_runner_internal_build_engine',
    resolvedOperatingMode: 'food_batch_manufacturing',
    records: {
      customer: { type: 'customer', name: 'Liquid Death Customer Account', internalId: '2123', url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/entity/custjob.nl?id=2123' },
      demoTransaction: { type: 'salesorder', name: 'SO2688', internalId: '81630', url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/accounting/transactions/salesord.nl?id=81630' },
      heroItem: { type: 'inventoryitem', name: 'Liquid Death Finished Good', internalId: '1865', url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=1865' },
      matrixProofItem: { type: 'inventoryitem', name: 'Liquid Death Production Line', internalId: '2947', url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=2947' },
      componentItem: { type: 'inventoryitem', name: 'Liquid Death Ingredient Blend', internalId: '2948', url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=2948' }
    }
  };
}

function canonicalRecordsResult() {
  return {
    schema: 'forge.completed-runner-result.v2',
    status: 'completed',
    runStatus: 'completed',
    generatedRecordOwner: 'governed_runner_internal_build_engine',
    resolvedOperatingMode: 'food_batch_manufacturing',
    records: [
      { role: 'customer', recordType: 'customer', name: 'Liquid Death Customer Account', internalId: '2123', url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/entity/custjob.nl?id=2123' },
      { role: 'sales_order', recordType: 'salesorder', name: 'SO2688', internalId: '81630', url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/accounting/transactions/salesord.nl?id=81630' },
      { role: 'finished_food_or_batch_item', recordType: 'inventoryitem', name: 'Liquid Death Finished Good', internalId: '1865', url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=1865' },
      { role: 'formula_or_batch_structure', recordType: 'inventoryitem', name: 'Liquid Death Production Line', internalId: '2947', url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=2947' },
      { role: 'ingredient_or_component_item', recordType: 'inventoryitem', name: 'Liquid Death Ingredient Blend', internalId: '2948', url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=2948' },
      { role: 'lot_or_availability_context', recordType: 'inventoryitem', name: 'Liquid Death Lot Availability Context', internalId: '2949', url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=2949' }
    ]
  };
}

function importedStateFor(hooks, payload) {
  const state = baseState();
  const context = contextFor(hooks, state);
  const finalNaming = hooks.dccFinalNamingResultV1(payload, context.state, context.lane, context.page, context.recommendation);
  const importedState = Object.assign({}, context.state, { dccFinalNamingResult: finalNaming });
  return contextFor(hooks, importedState);
}

function main() {
  const results = [];
  const hooks = loadHooks();
  const generatedSnapshot = buildContractSnapshot();
  const staticSnapshot = readJson(snapshotPath);
  const contract = readJson(contractPath);
  const drawer = read(userscriptPath);

  const sync = hooks.drawerContractSourceAlignmentW240V1(baseState(), { canonicalSnapshot: generatedSnapshot });
  const adminSync = hooks.drawerContractSourceAlignmentW240V1(Object.assign(baseState(), { setupEditMode: true }), { canonicalSnapshot: generatedSnapshot });
  const legacyContext = importedStateFor(hooks, legacyResult());
  const canonicalContext = importedStateFor(hooks, canonicalRecordsResult());
  const legacyNavigation = hooks.dccFinalNavigationModel(legacyContext.state, legacyContext.lane, legacyContext.page, legacyContext.recommendation);
  const canonicalNavigation = hooks.dccFinalNavigationModel(canonicalContext.state, canonicalContext.lane, canonicalContext.page, canonicalContext.recommendation);
  const canonicalRunHtml = hooks.renderRunView(canonicalContext.state, canonicalContext.lane, canonicalContext.page, canonicalContext.recommendation, canonicalContext.lane.moves[0], { id: 'prove', label: 'Prove' });
  const dynamicPrep = hooks.dynamicRecordRenderingPrepModelW240(canonicalNavigation.scriptPivotObjects.concat([
    { role: 'work_order_or_wip_object', label: 'Work Order', name: 'Missing URL Work Order', internalId: '', url: '' }
  ]), { resolvedOperatingMode: 'food_batch_manufacturing' });
  const forbiddenNormalUi = /(raw JSON|W151|semantic guard|mode contract|internal role arrays|stack trace|raw guard messages|canonical contract snapshot|embedded contract version)/i;

  assertCase(results, 'w240_canonical_snapshot_produced_from_src_contracts',
    generatedSnapshot.snapshotVersion === SNAPSHOT_VERSION &&
      generatedSnapshot.operatingModes.food_batch_manufacturing.requiredRecordRoles.includes('finished_food_or_batch_item') &&
      generatedSnapshot.recordRoles.labels.ingredient_or_component_item === 'Ingredient Item',
    generatedSnapshot.snapshotVersion);
  assertCase(results, 'w240_static_snapshot_matches_required_contract_shape',
    staticSnapshot.snapshotVersion === generatedSnapshot.snapshotVersion &&
      Object.keys(staticSnapshot.operatingModes).length === Object.keys(generatedSnapshot.operatingModes).length &&
      staticSnapshot.compatibility.canonicalRecordsArrayAccepted === true,
    `${Object.keys(staticSnapshot.operatingModes).length} modes`);
  assertCase(results, 'w240_drawer_sync_status_reported_without_normal_ui_exposure',
    sync.status === 'canonical_snapshot_aligned_with_drawer_embedded_contracts' &&
      sync.consultantUiVisibility === 'hidden' &&
      sync.adminDebugDiagnosticsAvailable === false &&
      adminSync.adminDebugDiagnosticsAvailable === true,
    JSON.stringify({ status: sync.status, normal: sync.adminDebugDiagnosticsAvailable, admin: adminSync.adminDebugDiagnosticsAvailable }));
  assertCase(results, 'w240_legacy_five_record_result_still_renders_expected_records',
    legacyNavigation.runCanUseImportedFinalNames === true &&
      legacyNavigation.scriptPivotObjects.length >= 5 &&
      legacyNavigation.scriptPivotObjects.some((record) => /Ingredient Blend/.test(record.name || '')),
    legacyNavigation.scriptPivotObjects.map((record) => record.name).join(' | '));
  assertCase(results, 'w240_canonical_records_array_renders_all_openable_records',
    canonicalNavigation.runCanUseImportedFinalNames === true &&
      canonicalNavigation.scriptPivotObjects.length >= 6 &&
      canonicalNavigation.scriptPivotObjects.every((record) => record.linkAuthority && record.linkAuthority.openable === true),
    canonicalNavigation.scriptPivotObjects.map((record) => `${record.label}:${record.name}`).join(' | '));
  assertCase(results, 'w240_run_pivots_no_longer_drop_valid_mode_records',
    canonicalNavigation.w240NoDropGuard &&
      canonicalNavigation.w240NoDropGuard.fixedFourRecordSliceApplied === false &&
      canonicalNavigation.w240NoDropGuard.allOpenableFinalRecordsIncluded === true &&
      !/slice\(0,\s*4\)/.test(String(drawer.match(/scriptPivotObjects,\n      linkAuthoritySummary/) || '')),
    JSON.stringify(canonicalNavigation.w240NoDropGuard));
  assertCase(results, 'w240_non_openable_records_hidden_from_normal_model',
    dynamicPrep.visibleRecords.length === canonicalNavigation.scriptPivotObjects.length &&
      dynamicPrep.hiddenNormalUiRecords.length === 1 &&
      dynamicPrep.noFakeOpenLinks === true,
    JSON.stringify({ visible: dynamicPrep.visibleRecords.length, hidden: dynamicPrep.hiddenNormalUiRecords.length }));
  assertCase(results, 'w240_normal_consultant_ui_hides_contract_diagnostics',
    !forbiddenNormalUi.test(canonicalRunHtml),
    'Run HTML hides contract/internal diagnostic wording.');
  assertCase(results, 'w240_boundaries_preserved',
    contract.noRegressionBoundaries.noDrawerCreatedRecords === true &&
      contract.noRegressionBoundaries.noDrawerTransactionWrites === true &&
      contract.noRegressionBoundaries.noDirectSuiteScriptOutsideApprovedW144AdapterPath === true &&
      contract.noRegressionBoundaries.w237FoodBatchCompletedImportGuardPreserved === true,
    JSON.stringify(contract.noRegressionBoundaries));

  const passed = results.filter((item) => item.pass).length;
  const failed = results.filter((item) => !item.pass);
  console.log(`W240 drawer contract source alignment harness: ${passed}/${results.length} passed`);
  results.forEach((item) => {
    console.log(`${item.pass ? 'PASS' : 'FAIL'} ${item.id}: ${typeof item.evidence === 'string' ? item.evidence : JSON.stringify(item.evidence)}`);
  });
  if (failed.length) process.exitCode = 1;
}

main();
