#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..', '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const reportPath = path.join(root, 'archive', 'reports', 'w245_canonical_import_result_normalization.md');
const tracePath = path.join(root, 'archive', 'trace_samples', 'w245_canonical_import_result_normalization_trace.json');

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
    fetch: () => Promise.reject(new Error('live fetch disabled in W245 harness')),
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

function record(type, name, id, path) {
  return {
    recordType: type,
    type,
    name,
    internalId: id,
    url: `https://YOUR_ACCOUNT_ID.app.netsuite.com${path}?id=${id}`
  };
}

function legacyCompletedResult() {
  return {
    schema: 'idb.completed-runner-result-json.v1',
    status: 'completed',
    runStatus: 'completed',
    generatedRecordOwner: 'governed_runner_internal_build_engine',
    resolvedOperatingMode: 'food_batch_manufacturing',
    partialResultState: 'partial_result_wip_detail_not_returned',
    records: {
      customer: record('customer', 'Liquid Death Customer Account', '2123', '/app/common/entity/custjob.nl'),
      demoTransaction: record('salesorder', 'SO2688', '81630', '/app/accounting/transactions/salesord.nl'),
      heroItem: record('inventoryitem', 'Liquid Death Finished Good', '1865', '/app/common/item/item.nl'),
      matrixProofItem: record('inventoryitem', 'Liquid Death Formula Flow', '2947', '/app/common/item/item.nl'),
      componentItem: record('inventoryitem', 'Liquid Death Ingredient Blend', '2948', '/app/common/item/item.nl')
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
    partialResultState: 'partial_result_wip_detail_not_returned',
    records: [
      Object.assign({ role: 'customer' }, record('customer', 'Liquid Death Customer Account', '2123', '/app/common/entity/custjob.nl')),
      Object.assign({ role: 'sales_order' }, record('salesorder', 'SO2688', '81630', '/app/accounting/transactions/salesord.nl')),
      Object.assign({ role: 'finished_food_or_batch_item' }, record('inventoryitem', 'Liquid Death Finished Good', '1865', '/app/common/item/item.nl')),
      Object.assign({ role: 'formula_or_batch_structure' }, record('inventoryitem', 'Liquid Death Formula Flow', '2947', '/app/common/item/item.nl')),
      Object.assign({ role: 'ingredient_or_component_item' }, record('inventoryitem', 'Liquid Death Ingredient Blend', '2948', '/app/common/item/item.nl')),
      Object.assign({ role: 'lot_or_availability_context' }, record('inventoryitem', 'Liquid Death Lot Availability Context', '2949', '/app/common/item/item.nl'))
    ]
  };
}

function mixedCompletedResult() {
  const legacy = legacyCompletedResult();
  return Object.assign({}, legacy, {
    records: {
      customer: legacy.records.customer,
      heroItem: legacy.records.heroItem,
      componentItem: legacy.records.componentItem
    },
    salesOrder: legacy.records.demoTransaction,
    proofItem: legacy.records.matrixProofItem
  });
}

function invalidPreviewResult() {
  const result = legacyCompletedResult();
  result.records.customer = {
    type: 'customer',
    name: 'Preview Customer',
    internalId: 'PREVIEW_CUSTOMER',
    url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/entity/custjob.nl?id=PREVIEW_CUSTOMER'
  };
  return result;
}

function importedContext(hooks, payload) {
  const state = stateFor('Liquid Death', 'https://liquiddeath.com', 'Food batch proof with retail urgency.', { enableManufacturing: true, enableWip: true }, 'food_beverage');
  const context = contextFor(hooks, state);
  const finalNaming = hooks.dccFinalNamingResultV1(payload, context.state, context.lane, context.page, context.recommendation);
  const importedState = Object.assign({}, context.state, { dccFinalNamingResult: finalNaming });
  const next = contextFor(hooks, importedState);
  return Object.assign({}, next, { finalNaming });
}

function roleList(records) {
  return records.map((recordItem) => `${recordItem.canonicalRole}:${recordItem.name}:${recordItem.linkAuthorityStatus}`);
}

function main() {
  const hooks = loadHooks();
  const report = read(reportPath);
  const trace = JSON.parse(read(tracePath));
  const results = [];
  const context = contextFor(hooks, stateFor('Liquid Death', 'https://liquiddeath.com', 'Food batch proof.', { enableManufacturing: true, enableWip: true }, 'food_beverage'));
  const legacy = hooks.canonicalImportResultNormalizationW245(legacyCompletedResult(), context.state, context.lane, context.page, context.recommendation);
  const canonical = hooks.canonicalImportResultNormalizationW245(canonicalCompletedResult(), context.state, context.lane, context.page, context.recommendation);
  const mixed = hooks.canonicalImportResultNormalizationW245(mixedCompletedResult(), context.state, context.lane, context.page, context.recommendation);
  const invalid = hooks.canonicalImportResultNormalizationW245(invalidPreviewResult(), context.state, context.lane, context.page, context.recommendation);
  const imported = importedContext(hooks, canonicalCompletedResult());
  const navigation = hooks.dccFinalNavigationModel(imported.state, imported.lane, imported.page, imported.recommendation);
  const reviewRun = hooks.consultantPartialResultReviewRunModelW216V1(canonicalCompletedResult(), imported.state, imported.lane, imported.page, imported.recommendation);
  const runHtml = hooks.renderRunView(imported.state, imported.lane, imported.page, imported.recommendation, imported.lane.moves[0], { id: 'prove', label: 'Prove' });
  const notImported = contextFor(hooks, stateFor('Liquid Death', 'https://liquiddeath.com', 'Food batch proof.', { enableManufacturing: true }, 'food_beverage'));
  const notImportedNavigation = hooks.dccFinalNavigationModel(notImported.state, notImported.lane, notImported.page, notImported.recommendation);
  const forbiddenNormalUi = /(raw JSON|W151|semantic guard|mode contract|internal role arrays|stack trace|raw guard messages|canonical contract snapshot|embedded contract version|checksum)/i;

  assertCase(results, 'w245_helper_exported',
    typeof hooks.canonicalImportResultNormalizationW245 === 'function' && typeof hooks.displayReadyRecordsFromFinalNamingW245 === 'function',
    'W245 helper hooks exported.');
  assertCase(results, 'w245_legacy_completed_result_normalizes_display_ready_records',
    legacy.visibleRecords.length === 5 &&
      legacy.visibleRecords.every((recordItem) => recordItem.safeToOpen && recordItem.recordType && recordItem.internalId) &&
      legacy.visibleRecords.some((recordItem) => recordItem.canonicalRole === 'finished_food_or_batch_item'),
    roleList(legacy.visibleRecords).join(' | '));
  assertCase(results, 'w245_canonical_records_array_normalizes_display_ready_records',
    canonical.visibleRecords.length === 6 &&
      canonical.visibleRecords.every((recordItem) => recordItem.linkAuthority && recordItem.linkAuthority.openable) &&
      canonical.visibleRecords.some((recordItem) => recordItem.canonicalRole === 'lot_or_availability_context'),
    roleList(canonical.visibleRecords).join(' | '));
  assertCase(results, 'w245_mixed_payload_with_legacy_aliases_normalizes',
    mixed.visibleRecords.length === 5 &&
      mixed.visibleRecords.some((recordItem) => recordItem.canonicalRole === 'sales_order') &&
      mixed.visibleRecords.some((recordItem) => recordItem.canonicalRole === 'formula_or_batch_structure'),
    roleList(mixed.visibleRecords).join(' | '));
  assertCase(results, 'w245_w237_food_batch_completed_import_still_repairs_saved_result',
    (() => {
      const savedState = stateFor('Liquid Death', 'https://liquiddeath.com', 'Food batch proof.', { enableManufacturing: true, enableWip: true }, 'food_beverage');
      savedState.integratedBuildRunnerResult = {
        finalGeneratedNamesJson: canonicalCompletedResult(),
        resultCapture: { finalGeneratedNamesJson: canonicalCompletedResult() }
      };
      const savedContext = contextFor(hooks, savedState);
      const repair = hooks.revalidateCompletedRunnerResultImportFromSavedStateW237(savedContext.state, savedContext.lane, savedContext.page, savedContext.recommendation);
      return repair.repaired === true &&
        savedContext.state.dccFinalNamingResult &&
        savedContext.state.dccFinalNamingResult.displayReadyRecords &&
        savedContext.state.dccFinalNamingResult.displayReadyRecords.length === 6;
    })(),
    'W237 saved completed food-batch result repair still imports display-ready records.');
  assertCase(results, 'w245_build_review_run_use_imported_names_after_valid_import',
    navigation.scriptPivotObjects.some((recordItem) => recordItem.name === 'Liquid Death Customer Account') &&
      navigation.scriptPivotObjects.every((recordItem) => recordItem.linkAuthority && recordItem.linkAuthority.openable) &&
      /Liquid Death Customer Account/.test(runHtml) &&
      reviewRun.consultantReview.visibleRecords.some((recordItem) => recordItem.name === 'Liquid Death Formula Flow'),
    reviewRun.consultantRun.show);
  assertCase(results, 'w245_no_fake_open_links_before_valid_import',
    notImportedNavigation.scriptPivotObjects.every((recordItem) => recordItem.linkAuthority && recordItem.linkAuthority.openable === false && !recordItem.openableUrl) &&
      invalid.visibleRecords.length === 4 &&
      invalid.displayReadyRecords.some((recordItem) => recordItem.linkAuthorityStatus === 'preview_placeholder'),
    `pre-import=${notImportedNavigation.scriptPivotObjects.length}; invalid-visible=${invalid.visibleRecords.length}`);
  assertCase(results, 'w245_normal_ui_hides_diagnostics',
    !forbiddenNormalUi.test(runHtml) &&
      !forbiddenNormalUi.test(reviewRun.consultantReview.headline) &&
      !forbiddenNormalUi.test(reviewRun.consultantRun.show),
    'Run/Review consultant surfaces hide internal diagnostics.');
  assertCase(results, 'w245_live_demo_coaching_answers_five_questions',
    reviewRun.consultantRun.liveDemoCoaching &&
      reviewRun.consultantRun.liveDemoCoaching.whatToOpen.length >= 3 &&
      /Use .* as the NetSuite proof point/.test(reviewRun.consultantRun.liveDemoCoaching.whatToProve) &&
      /passed import and link authority/.test(reviewRun.consultantRun.liveDemoCoaching.safeToSay) &&
      /Do not claim/.test(reviewRun.consultantRun.liveDemoCoaching.doNotClaim) &&
      /live demo/.test(reviewRun.consultantRun.liveDemoCoaching.buyerFacingSoWhat),
    JSON.stringify(reviewRun.consultantRun.liveDemoCoaching));
  assertCase(results, 'w245_report_and_trace_present',
    /W245: Canonical Import Result Normalization/.test(report) &&
      trace.schema === 'forge.w245-canonical-import-result-normalization-trace.v1',
    trace.schema);

  const passed = results.filter((item) => item.pass).length;
  const failed = results.filter((item) => !item.pass);
  console.log(`W245 canonical import result normalization harness: ${passed}/${results.length} passed`);
  results.forEach((item) => {
    console.log(`${item.pass ? 'PASS' : 'FAIL'} ${item.id}: ${typeof item.evidence === 'string' ? item.evidence : JSON.stringify(item.evidence)}`);
  });
  if (failed.length) process.exitCode = 1;
}

main();
