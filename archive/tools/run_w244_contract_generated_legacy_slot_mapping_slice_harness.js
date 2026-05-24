#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const dataPath = path.join(root, 'data', 'w244_contract_generated_legacy_slot_mapping_slice.json');
const reportPath = path.join(root, 'reports', 'w244_contract_generated_legacy_slot_mapping_slice.md');
const tracePath = path.join(root, 'trace_samples', 'w244_contract_generated_legacy_slot_mapping_slice_trace.json');

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
    fetch: () => Promise.reject(new Error('live fetch disabled in W244 harness')),
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

function stateFor(customer, website, notes, toggles, laneId) {
  const selectedLaneId = laneId || 'food_beverage';
  return {
    selectedLaneId,
    laneSelectionSource: 'consultant_confirmed',
    selectedActionId: 'prove',
    briefPrepared: true,
    setupEditMode: false,
    intake: { customer, website, notes },
    toggles: {
      [selectedLaneId]: Object.assign({
        createNewHeroItem: true,
        enableManufacturing: false,
        enableWip: false
      }, toggles || {})
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

function canonicalCompletedResult() {
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

function importedModel(hooks, payload) {
  const context = contextFor(hooks, stateFor('Liquid Death', 'https://liquiddeath.com', 'Food batch proof.', { enableManufacturing: true }, 'food_beverage'));
  const finalNaming = hooks.dccFinalNamingResultV1(payload, context.state, context.lane, context.page, context.recommendation);
  const importedState = Object.assign({}, context.state, { dccFinalNamingResult: finalNaming });
  const importedContext = contextFor(hooks, importedState);
  const navigation = hooks.dccFinalNavigationModel(importedContext.state, importedContext.lane, importedContext.page, importedContext.recommendation);
  const runHtml = hooks.renderRunView(importedContext.state, importedContext.lane, importedContext.page, importedContext.recommendation, importedContext.lane.moves[0], { id: 'prove', label: 'Prove' });
  return { finalNaming, navigation, runHtml };
}

function roleSummary(finalNaming) {
  return finalNaming.displayObjects
    .concat(finalNaming.componentItems, finalNaming.locationPlanningRecords)
    .filter((record) => record && record.source === 'dcc_final')
    .map((record) => `${record.role}:${record.name}`);
}

function main() {
  const hooks = loadHooks();
  const data = readJson(dataPath);
  const report = read(reportPath);
  const trace = readJson(tracePath);
  const results = [];
  const fallbackSnapshot = { recordRoles: { aliases: {}, legacySlotToRole: {}, modePrimaryRoleAliases: {} } };
  const legacy = importedModel(hooks, legacyCompletedResult());
  const canonical = importedModel(hooks, canonicalCompletedResult());
  const notImportedContext = contextFor(hooks, stateFor('Liquid Death', 'https://liquiddeath.com', 'Food batch proof.', { enableManufacturing: true }, 'food_beverage'));
  const notImportedNavigation = hooks.dccFinalNavigationModel(notImportedContext.state, notImportedContext.lane, notImportedContext.page, notImportedContext.recommendation);
  const legacyRoles = roleSummary(legacy.finalNaming);
  const canonicalRoles = roleSummary(canonical.finalNaming);
  const forbiddenNormalUi = /(raw JSON|W151|semantic guard|mode contract|internal role arrays|stack trace|raw guard messages|canonical contract snapshot|embedded contract version|checksum)/i;

  assertCase(results, 'w244_legacy_slot_mapping_helpers_exist',
    ['canonicalRoleFromSnapshotW244', 'legacySlotModeAwareRoleFromSnapshotW244', 'legacySlotsForCanonicalRoleFromSnapshotW244', 'canonicalRoleToLegacySlotFallbackW244', 'legacyRecordByCanonicalRoleW244']
      .every((name) => typeof hooks[name] === 'function'),
    'legacy slot mapping helper hooks exported');
  assertCase(results, 'w244_legacy_slot_lookup_reads_generated_snapshot',
    hooks.legacySlotModeAwareRoleFromSnapshotW244('demoTransaction') === 'sales_order' &&
      hooks.legacySlotModeAwareRoleFromSnapshotW244('heroItem', 'food_batch_manufacturing') === 'finished_food_or_batch_item' &&
      hooks.legacySlotModeAwareRoleFromSnapshotW244('componentItem', 'food_batch_manufacturing') === 'ingredient_or_component_item',
    ['demoTransaction', 'heroItem', 'componentItem'].map((slot) => `${slot}:${hooks.legacySlotModeAwareRoleFromSnapshotW244(slot, 'food_batch_manufacturing')}`).join(', '));
  assertCase(results, 'w244_canonical_role_to_legacy_slot_fallback_available',
    hooks.canonicalRoleToLegacySlotFallbackW244('sales_order') === 'demoTransaction' &&
      hooks.canonicalRoleToLegacySlotFallbackW244('finished_food_or_batch_item', 'food_batch_manufacturing') === 'heroItem',
    `${hooks.canonicalRoleToLegacySlotFallbackW244('sales_order')} / ${hooks.canonicalRoleToLegacySlotFallbackW244('finished_food_or_batch_item', 'food_batch_manufacturing')}`);
  assertCase(results, 'w244_fallback_works_when_snapshot_mapping_missing',
    hooks.legacySlotModeAwareRoleFromSnapshotW244('unknownSlot', '', 'fallback_role', { snapshot: fallbackSnapshot }) === 'fallback_role' &&
      hooks.canonicalRoleToLegacySlotFallbackW244('unknown_role', '', 'unknownSlot', { snapshot: fallbackSnapshot }) === 'unknownSlot',
    'missing snapshot mapping falls back safely');
  assertCase(results, 'w244_legacy_five_record_result_normalizes_same_roles',
    legacy.finalNaming.displayObjects.length === 4 &&
      legacy.finalNaming.componentItems.length === 1 &&
      legacyRoles.some((item) => /hero_item:Liquid Death Finished Good/.test(item)) &&
      legacyRoles.some((item) => /matrix_or_proof_item:Liquid Death Production Line/.test(item)) &&
      legacyRoles.some((item) => /component_item:Liquid Death Ingredient Blend/.test(item)),
    legacyRoles.join(' | '));
  assertCase(results, 'w244_canonical_records_array_result_remains_accepted',
    canonical.navigation.scriptPivotObjects.length >= 6 &&
      canonical.navigation.scriptPivotObjects.every((record) => record.linkAuthority && record.linkAuthority.openable === true),
    canonicalRoles.join(' | '));
  assertCase(results, 'w244_w151_open_link_rules_remain_enforced',
    legacy.navigation.scriptPivotObjects.length >= 5 &&
      legacy.navigation.scriptPivotObjects.every((record) => record.linkAuthority && record.linkAuthority.openable === true),
    legacy.navigation.scriptPivotObjects.map((record) => `${record.name}:${record.linkAuthority.status}`).join(', '));
  assertCase(results, 'w244_no_fake_open_links_before_valid_import',
    notImportedNavigation.scriptPivotObjects.every((record) => record.linkAuthority && record.linkAuthority.openable === false && !record.openableUrl),
    notImportedNavigation.scriptPivotObjects.map((record) => `${record.label}:${record.linkAuthority && record.linkAuthority.status}`).join(', '));
  assertCase(results, 'w244_normal_consultant_ui_hides_diagnostics',
    !forbiddenNormalUi.test(canonical.runHtml),
    'Run HTML hides contract diagnostics.');
  assertCase(results, 'w244_report_trace_and_contract_present',
    data.status === 'contract_generated_legacy_slot_mapping_ready' &&
      /W244: Contract-Generated Legacy Slot Mapping Runtime Slice/.test(report) &&
      trace.schema === 'forge.w244-contract-generated-legacy-slot-mapping-slice-trace.v1',
    `${data.status}; ${trace.schema}`);

  const passed = results.filter((item) => item.pass).length;
  const failed = results.filter((item) => !item.pass);
  console.log(`W244 contract-generated legacy slot mapping slice harness: ${passed}/${results.length} passed`);
  results.forEach((item) => {
    console.log(`${item.pass ? 'PASS' : 'FAIL'} ${item.id}: ${typeof item.evidence === 'string' ? item.evidence : JSON.stringify(item.evidence)}`);
  });
  if (failed.length) process.exitCode = 1;
}

main();
