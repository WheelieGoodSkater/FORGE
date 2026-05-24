#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const dataPath = path.join(root, 'data', 'w241_userscript_contract_injection.json');
const embeddedSnapshotPath = path.join(root, 'data', 'w241_embedded_contract_snapshot.json');
const reportPath = path.join(root, 'reports', 'w241_userscript_contract_injection.md');
const tracePath = path.join(root, 'trace_samples', 'w241_userscript_contract_injection_trace.json');

const injector = require('./inject_userscript_contract_snapshot_w241');
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
    fetch: () => Promise.reject(new Error('live fetch disabled in W241 harness')),
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
      notes: 'Buyer needs beverage availability, finished good, ingredient readiness, and production planning.'
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

function completedResultRecordsArray() {
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

function legacyCompletedResult() {
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

function importedNavigation(hooks, payload) {
  const context = contextFor(hooks, baseState());
  const finalNaming = hooks.dccFinalNamingResultV1(payload, context.state, context.lane, context.page, context.recommendation);
  const importedState = Object.assign({}, context.state, { dccFinalNamingResult: finalNaming });
  const importedContext = contextFor(hooks, importedState);
  return {
    context: importedContext,
    navigation: hooks.dccFinalNavigationModel(importedContext.state, importedContext.lane, importedContext.page, importedContext.recommendation),
    runHtml: hooks.renderRunView(importedContext.state, importedContext.lane, importedContext.page, importedContext.recommendation, importedContext.lane.moves[0], { id: 'prove', label: 'Prove' })
  };
}

function main() {
  const results = [];
  const userscript = read(userscriptPath);
  const contract = readJson(dataPath);
  const embeddedSnapshot = readJson(embeddedSnapshotPath);
  const report = read(reportPath);
  const trace = readJson(tracePath);
  const hooks = loadHooks();
  const sourceSnapshot = injector.buildEmbeddedSnapshot();
  const sourceSnapshotAgain = injector.buildEmbeddedSnapshot();
  const sync = hooks.drawerContractSourceAlignmentW240V1(baseState(), { canonicalSnapshot: sourceSnapshot });
  const legacy = importedNavigation(hooks, legacyCompletedResult());
  const canonical = importedNavigation(hooks, completedResultRecordsArray());
  const forbiddenNormalUi = /(raw JSON|W151|semantic guard|mode contract|internal role arrays|stack trace|raw guard messages|canonical contract snapshot|embedded contract version|checksum)/i;

  assertCase(results, 'w241_injection_utility_exists_and_is_deterministic',
    typeof injector.buildEmbeddedSnapshot === 'function' &&
      injector.stableStringify(sourceSnapshot) === injector.stableStringify(sourceSnapshotAgain),
    sourceSnapshot.checksum);
  assertCase(results, 'w241_generated_snapshot_built_from_src_snapshot',
    buildContractSnapshot().snapshotVersion === SNAPSHOT_VERSION &&
      sourceSnapshot.snapshotVersion === SNAPSHOT_VERSION &&
      sourceSnapshot.generatedFrom.includes('src/contracts/operatingModes.js'),
    sourceSnapshot.snapshotVersion);
  assertCase(results, 'w241_userscript_contains_generated_markers',
    userscript.includes(injector.BEGIN) &&
      userscript.includes(injector.END) &&
      userscript.indexOf(injector.BEGIN) < userscript.indexOf(injector.END),
    'generated markers present');
  assertCase(results, 'w241_embedded_snapshot_version_exact',
    embeddedSnapshot.snapshotVersion === 'forge.contract-snapshot.w241.v1' &&
      userscript.includes('"snapshotVersion": "forge.contract-snapshot.w241.v1"'),
    embeddedSnapshot.snapshotVersion);
  assertCase(results, 'w241_embedded_checksum_matches_source_checksum',
    embeddedSnapshot.checksum === sourceSnapshot.checksum &&
      sync.generatedSnapshotSyncStatus === 'generated_snapshot_checksum_match',
    JSON.stringify({ embedded: embeddedSnapshot.checksum, source: sourceSnapshot.checksum, sync: sync.generatedSnapshotSyncStatus }));
  assertCase(results, 'w241_drawer_diagnostics_report_generated_snapshot_sync',
    sync.embeddedGeneratedSnapshotVersion === 'forge.contract-snapshot.w241.v1' &&
      sync.sourceSnapshotChecksum === sourceSnapshot.checksum &&
      sync.generatedFromCanonicalContracts === true,
    JSON.stringify(sync));
  assertCase(results, 'w241_normal_consultant_ui_hides_contract_diagnostics',
    !forbiddenNormalUi.test(canonical.runHtml),
    'Run HTML hides generated snapshot diagnostics.');
  assertCase(results, 'w241_legacy_five_record_result_still_renders',
    legacy.navigation.scriptPivotObjects.length >= 5 &&
      legacy.navigation.scriptPivotObjects.some((record) => /Ingredient Blend/.test(record.name || '')),
    legacy.navigation.scriptPivotObjects.map((record) => record.name).join(' | '));
  assertCase(results, 'w241_canonical_records_array_renders_all_openable_records',
    canonical.navigation.scriptPivotObjects.length >= 6 &&
      canonical.navigation.scriptPivotObjects.every((record) => record.linkAuthority && record.linkAuthority.openable === true),
    canonical.navigation.scriptPivotObjects.map((record) => record.name).join(' | '));
  assertCase(results, 'w241_w240_run_pivot_no_drop_guard_preserved',
    canonical.navigation.w240NoDropGuard &&
      canonical.navigation.w240NoDropGuard.fixedFourRecordSliceApplied === false &&
      canonical.navigation.w240NoDropGuard.allOpenableFinalRecordsIncluded === true,
    JSON.stringify(canonical.navigation.w240NoDropGuard));
  assertCase(results, 'w241_report_trace_and_contract_present',
    contract.status === 'generated_userscript_contract_injection_ready' &&
      /W241: Generated Userscript Contract Injection/.test(report) &&
      trace.schema === 'forge.w241-userscript-contract-injection-trace.v1',
    `${contract.status}; ${trace.schema}`);

  const passed = results.filter((item) => item.pass).length;
  const failed = results.filter((item) => !item.pass);
  console.log(`W241 userscript contract injection harness: ${passed}/${results.length} passed`);
  results.forEach((item) => {
    console.log(`${item.pass ? 'PASS' : 'FAIL'} ${item.id}: ${typeof item.evidence === 'string' ? item.evidence : JSON.stringify(item.evidence)}`);
  });
  if (failed.length) process.exitCode = 1;
}

main();
