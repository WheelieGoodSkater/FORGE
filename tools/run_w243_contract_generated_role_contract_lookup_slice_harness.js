#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const dataPath = path.join(root, 'data', 'w243_contract_generated_role_contract_lookup_slice.json');
const reportPath = path.join(root, 'reports', 'w243_contract_generated_role_contract_lookup_slice.md');
const tracePath = path.join(root, 'trace_samples', 'w243_contract_generated_role_contract_lookup_slice_trace.json');
const embeddedSnapshotPath = path.join(root, 'data', 'w241_embedded_contract_snapshot.json');

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function readJson(file) {
  return JSON.parse(read(file));
}

function assertCase(results, id, pass, evidence) {
  results.push({ id, pass: Boolean(pass), evidence: evidence || '' });
}

function sameArray(a, b) {
  return JSON.stringify(a || []) === JSON.stringify(b || []);
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
    fetch: () => Promise.reject(new Error('live fetch disabled in W243 harness')),
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
  const selectedToggles = Object.assign({
    createNewHeroItem: true,
    enableManufacturing: false,
    enableWip: false
  }, toggles || {});
  return {
    selectedLaneId,
    laneSelectionSource: 'consultant_confirmed',
    selectedActionId: 'prove',
    briefPrepared: true,
    setupEditMode: false,
    intake: { customer, website, notes },
    toggles: { [selectedLaneId]: selectedToggles },
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

function resolveMode(hooks, fixture) {
  const context = contextFor(hooks, stateFor(fixture.customer, fixture.website, fixture.notes, fixture.toggles, fixture.laneId));
  return hooks.resolveBuildOperatingModeW214(context.state, context.lane, context.page, context.recommendation, {});
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

function importedNavigation(hooks, payload) {
  const context = contextFor(hooks, stateFor('Liquid Death', 'https://liquiddeath.com', 'Food and beverage proof path.', { enableManufacturing: true }, 'food_beverage'));
  const finalNaming = hooks.dccFinalNamingResultV1(payload, context.state, context.lane, context.page, context.recommendation);
  const importedState = Object.assign({}, context.state, { dccFinalNamingResult: finalNaming });
  const importedContext = contextFor(hooks, importedState);
  return {
    finalNaming,
    navigation: hooks.dccFinalNavigationModel(importedContext.state, importedContext.lane, importedContext.page, importedContext.recommendation),
    runHtml: hooks.renderRunView(importedContext.state, importedContext.lane, importedContext.page, importedContext.recommendation, importedContext.lane.moves[0], { id: 'prove', label: 'Prove' })
  };
}

function main() {
  const results = [];
  const hooks = loadHooks();
  const data = readJson(dataPath);
  const snapshot = readJson(embeddedSnapshotPath);
  const report = read(reportPath);
  const trace = readJson(tracePath);
  const fixtureModes = [
    { customer: 'Northstar Trail Outfitters', website: 'https://www.rei.com', laneId: 'dealer_hardgoods', notes: 'Outdoor retail availability.', toggles: { enableManufacturing: false }, expected: ['retail_availability', 'dealer_hardgoods_replenishment'] },
    { customer: 'Harbor & Ridge Apparel', website: 'https://www.patagonia.com', laneId: 'apparel_accessories', notes: 'Style, size, color availability.', toggles: { enableManufacturing: false }, expected: ['apparel_style_matrix'] },
    { customer: 'Metroline Parts Supply', website: 'https://www.grainger.com', laneId: 'industrial_distribution', notes: 'Distribution replenishment.', toggles: { enableManufacturing: false }, expected: ['distribution_replenishment', 'dealer_hardgoods_replenishment'] },
    { customer: 'Evergreen Equipment Works', website: 'https://www.ariens.com', laneId: 'industrial_equipment', notes: 'Equipment manufacturing proof.', toggles: { enableManufacturing: true, enableWip: false }, expected: ['discrete_manufacturing', 'dealer_hardgoods_replenishment'] },
    { customer: 'Canyon Ridge Components', website: 'https://www.trekbikes.com', laneId: 'dealer_hardgoods', notes: 'Bicycle dealer hardgoods with WIP interest.', toggles: { enableManufacturing: true, enableWip: true }, expected: ['wip_manufacturing', 'dealer_hardgoods_replenishment'] },
    { customer: 'McCormick', website: 'https://www.mccormick.com', laneId: 'food_beverage', notes: 'Food ingredient batch manufacturing.', toggles: { enableManufacturing: true, enableWip: true }, expected: ['food_batch_manufacturing'] }
  ];
  const resolved = fixtureModes.map((fixture) => Object.assign({}, fixture, { resolver: resolveMode(hooks, fixture) }));
  const fallbackContract = {
    label: 'Fallback Mode',
    requiredRecordRoles: ['fallback_required'],
    expectedRecordRoles: ['fallback_expected'],
    optionalRecordRoles: ['fallback_optional'],
    invalidRecordRoles: ['fallback_invalid'],
    allowedNouns: ['fallback noun'],
    invalidTerms: ['fallback term']
  };
  const fallbackSnapshot = { operatingModes: {}, recordRoles: { labels: {}, legacySlotToRole: {} } };
  const mergedFood = hooks.operatingModeRoleContractFromSnapshotW243('food_batch_manufacturing');
  const fallbackMerged = hooks.operatingModeRoleContractFromSnapshotW243('unknown_mode', fallbackContract, { snapshot: fallbackSnapshot });
  const legacy = importedNavigation(hooks, legacyCompletedResult());
  const canonical = importedNavigation(hooks, canonicalCompletedResult());
  const forbiddenNormalUi = /(raw JSON|W151|semantic guard|mode contract|internal role arrays|stack trace|raw guard messages|canonical contract snapshot|embedded contract version|checksum)/i;

  assertCase(results, 'w243_role_contract_helpers_exist',
    ['roleListFromSnapshotW243', 'operatingModeRoleContractFromSnapshotW243', 'requiredRecordRolesFromSnapshotW243', 'expectedRecordRolesFromSnapshotW243', 'optionalRecordRolesFromSnapshotW243', 'invalidRecordRolesFromSnapshotW243']
      .every((name) => typeof hooks[name] === 'function'),
    'role contract helper hooks exported');
  assertCase(results, 'w243_required_roles_read_generated_snapshot',
    sameArray(hooks.requiredRecordRolesFromSnapshotW243('food_batch_manufacturing'), snapshot.operatingModes.food_batch_manufacturing.requiredRecordRoles),
    hooks.requiredRecordRolesFromSnapshotW243('food_batch_manufacturing').join(', '));
  assertCase(results, 'w243_expected_optional_invalid_roles_read_generated_snapshot',
    sameArray(hooks.expectedRecordRolesFromSnapshotW243('wip_manufacturing'), snapshot.operatingModes.wip_manufacturing.expectedRecordRoles) &&
      sameArray(hooks.optionalRecordRolesFromSnapshotW243('retail_availability'), snapshot.operatingModes.retail_availability.optionalRecordRoles) &&
      sameArray(hooks.invalidRecordRolesFromSnapshotW243('distribution_replenishment'), snapshot.operatingModes.distribution_replenishment.invalidRecordRoles),
    'expected, optional, and invalid role arrays read from generated snapshot');
  assertCase(results, 'w243_fallback_role_arrays_work_without_snapshot_data',
    sameArray(hooks.requiredRecordRolesFromSnapshotW243('unknown_mode', ['fallback_required'], { snapshot: fallbackSnapshot }), ['fallback_required']) &&
      sameArray(hooks.invalidRecordRolesFromSnapshotW243('unknown_mode', ['fallback_invalid'], { snapshot: fallbackSnapshot }), ['fallback_invalid']),
    'fallback role arrays resolved');
  assertCase(results, 'w243_merged_contract_preserves_embedded_guard_terms',
    sameArray(mergedFood.requiredRecordRoles, snapshot.operatingModes.food_batch_manufacturing.requiredRecordRoles) &&
      mergedFood.allowedNouns && mergedFood.allowedNouns.includes('finished food item') &&
      mergedFood.invalidTerms && mergedFood.invalidTerms.includes('style sku'),
    JSON.stringify({ required: mergedFood.requiredRecordRoles, invalidTerms: mergedFood.invalidTerms }));
  assertCase(results, 'w243_merged_contract_missing_mode_uses_fallback',
    fallbackMerged.label === 'Fallback Mode' &&
      sameArray(fallbackMerged.requiredRecordRoles, ['fallback_required']) &&
      fallbackMerged.invalidTerms.includes('fallback term'),
    JSON.stringify(fallbackMerged));
  assertCase(results, 'w243_resolver_role_arrays_match_generated_snapshot_for_six_fixtures',
    resolved.every((item) => item.expected.includes(item.resolver.resolvedOperatingMode)) &&
      resolved.every((item) => sameArray(item.resolver.requiredRecordRoles, snapshot.operatingModes[item.resolver.resolvedOperatingMode].requiredRecordRoles)) &&
      resolved.every((item) => sameArray(item.resolver.optionalRecordRoles, snapshot.operatingModes[item.resolver.resolvedOperatingMode].optionalRecordRoles)) &&
      resolved.every((item) => sameArray(item.resolver.expectedRecordRoles, snapshot.operatingModes[item.resolver.resolvedOperatingMode].expectedRecordRoles)) &&
      resolved.every((item) => sameArray(item.resolver.invalidRecordRoles, snapshot.operatingModes[item.resolver.resolvedOperatingMode].invalidRecordRoles)),
    resolved.map((item) => `${item.customer}:${item.resolver.resolvedOperatingMode}`).join(', '));
  assertCase(results, 'w243_legacy_five_record_result_still_renders',
    legacy.navigation.scriptPivotObjects.length >= 5 &&
      legacy.navigation.scriptPivotObjects.some((record) => /Ingredient Blend/.test(record.name || '')),
    legacy.navigation.scriptPivotObjects.map((record) => `${record.label}:${record.name}`).join(' | '));
  assertCase(results, 'w243_canonical_records_array_still_renders_all_openable_records',
    canonical.navigation.scriptPivotObjects.length >= 6 &&
      canonical.navigation.scriptPivotObjects.every((record) => record.linkAuthority && record.linkAuthority.openable === true),
    canonical.navigation.scriptPivotObjects.map((record) => `${record.label}:${record.name}`).join(' | '));
  assertCase(results, 'w243_normal_consultant_ui_hides_contract_diagnostics',
    !forbiddenNormalUi.test(canonical.runHtml),
    'Run HTML hides contract diagnostics.');
  assertCase(results, 'w243_report_trace_and_contract_present',
    data.status === 'contract_generated_role_lookup_slice_ready' &&
      /W243: Contract-Generated Role Contract Lookup Slice/.test(report) &&
      trace.schema === 'forge.w243-contract-generated-role-contract-lookup-slice-trace.v1',
    `${data.status}; ${trace.schema}`);

  const passed = results.filter((item) => item.pass).length;
  const failed = results.filter((item) => !item.pass);
  console.log(`W243 contract-generated role contract lookup slice harness: ${passed}/${results.length} passed`);
  results.forEach((item) => {
    console.log(`${item.pass ? 'PASS' : 'FAIL'} ${item.id}: ${typeof item.evidence === 'string' ? item.evidence : JSON.stringify(item.evidence)}`);
  });
  if (failed.length) process.exitCode = 1;
}

main();
