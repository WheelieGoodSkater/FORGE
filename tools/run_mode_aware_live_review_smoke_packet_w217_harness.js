const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const dataPath = path.join(root, 'data', 'w217_mode_aware_live_review_smoke_packet.json');
const tracePath = path.join(root, 'trace_samples', 'w217_mode_aware_live_review_smoke_packet_trace.json');
const reportPath = path.join(root, 'reports', 'w217_mode_aware_live_review_smoke_packet.md');

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, value);
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
    fetch: () => Promise.reject(new Error('live NetSuite fetch disabled in W217 harness')),
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

function fixture(index, customer, website, laneId, enableManufacturing, enableWip, notes) {
  return { index, customer, website, laneId, enableManufacturing, enableWip, notes };
}

function stateFor(hooks, fix, adminDebug) {
  const state = {
    selectedLaneId: fix.laneId,
    laneSelectionSource: 'consultant_confirmed',
    selectedActionId: 'prove',
    selectedMoveIndex: 0,
    briefPrepared: true,
    setupEditMode: adminDebug === true,
    intake: { customer: fix.customer, website: fix.website, notes: fix.notes },
    toggles: {
      [fix.laneId]: {
        createNewHeroItem: true,
        enableManufacturing: fix.enableManufacturing === true,
        enableWip: fix.enableWip === true
      }
    },
    pageContext: {
      title: 'NetSuite Home',
      url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/center/card.nl',
      pageType: 'NetSuite page',
      contextId: 'generic_netsuite_page',
      confidence: 'low',
      capturedAt: '2026-05-19T12:00:00.000Z'
    }
  };
  hooks.ensureWebsiteEvidenceRuntime(state);
  hooks.reconcileStateAuthority(state);
  const lane = hooks.getLane(state);
  const page = state.pageContext;
  const recommendation = hooks.recommendMove(lane, page);
  state.acceptedPacket = hooks.buildAcceptedPacketContext(state, lane, page, recommendation);
  hooks.reconcileStateAuthority(state);
  return { state, lane, page, recommendation };
}

function nsRecord(role, type, name, id, pathName) {
  return {
    role,
    type,
    name,
    internalId: String(id),
    id: String(id),
    url: `https://YOUR_ACCOUNT_ID.app.netsuite.com${pathName || '/app/common/item/item.nl'}?id=${id}`
  };
}

function completedPayload(fix, records, options) {
  const opts = options || {};
  return {
    schema: 'idb.completed-runner-result-json.v1',
    status: 'completed',
    runStatus: 'completed',
    generatedRecordOwner: 'governed_runner_internal_build_engine',
    familyKey: fix.laneId,
    toggles: {
      createNewHeroItem: true,
      enableManufacturing: fix.enableManufacturing === true,
      enableWip: fix.enableWip === true
    },
    partialResultState: opts.partialResultState || '',
    warnings: opts.warning ? [opts.warning] : [],
    records: [
      nsRecord('customer', 'customer', `${fix.customer} Customer Account`, 3000 + fix.index, '/app/common/entity/custjob.nl'),
      nsRecord('sales_order', 'salesorder', `${fix.customer} SO217`, 90000 + fix.index, '/app/accounting/transactions/salesord.nl'),
      ...records.map((record, recordIndex) => nsRecord(record.role, record.type || 'inventoryitem', record.name, 4100 + fix.index * 100 + recordIndex))
    ]
  };
}

function forbiddenNormalUiTerms(value) {
  return /(W144|runnerTaskId|raw JSON|W151|semantic guard|mode contract|internal role arrays)/i.test(String(value || ''));
}

function hasAll(value, terms) {
  const text = String(value || '').toLowerCase();
  return terms.every((term) => text.includes(String(term).toLowerCase()));
}

function main() {
  const hooks = loadHooks();
  const northstar = fixture(1, 'Northstar Trail Outfitters', 'https://www.rei.com', 'dealer_hardgoods', false, false, 'Retail availability and dealer replenishment proof.');
  const evergreen = fixture(4, 'Evergreen Equipment Works', 'https://www.ariens.com', 'industrial_equipment', true, false, 'Outdoor equipment manufacturing readiness.');
  const mccormick = fixture(6, 'McCormick', 'https://www.mccormick.com', 'food_beverage', true, true, 'Spice and seasoning food batch proof with ingredient, formula, lot, and WIP readiness.');

  const retail = completedPayload(northstar, [
    { role: 'hero_sku', name: 'Northstar Trail Outfitters Product Availability SKU' },
    { role: 'dealer_availability_or_replenishment_flow', name: 'Northstar Trail Outfitters Dealer Replenishment Flow' },
    { role: 'location_or_channel_context', name: 'Northstar Trail Outfitters Channel Context' }
  ]);
  const manufacturing = completedPayload(evergreen, [
    { role: 'finished_or_assembly_item', name: 'Evergreen Equipment Works Finished Good' },
    { role: 'bom_or_assembly_structure', name: 'Evergreen Equipment Works Assembly Structure' },
    { role: 'component_item', name: 'Evergreen Equipment Works Component Item' }
  ]);
  const foodPartial = completedPayload(mccormick, [
    { role: 'finished_food_or_batch_item', name: 'McCormick Finished Food Batch Item' },
    { role: 'formula_or_batch_structure', name: 'McCormick Formula Batch Structure' },
    { role: 'ingredient_or_component_item', name: 'McCormick Ingredient Item' },
    { role: 'lot_or_availability_context', name: 'McCormick Lot Context' }
  ], {
    partialResultState: 'partial_result_missing_wip_detail',
    warning: 'WIP detail not returned for food batch result.'
  });

  const retailContext = stateFor(hooks, northstar, false);
  const manufacturingContext = stateFor(hooks, evergreen, false);
  const foodContext = stateFor(hooks, mccormick, true);

  const packet = hooks.modeAwareLiveReviewSmokePacketW217V1([
    {
      label: 'Complete Non-Manufacturing Retail Availability',
      caseType: 'complete_non_manufacturing',
      payload: retail,
      state: retailContext.state,
      lane: retailContext.lane,
      pageContext: retailContext.page,
      recommendation: retailContext.recommendation
    },
    {
      label: 'Complete Discrete Manufacturing',
      caseType: 'complete_manufacturing',
      payload: manufacturing,
      state: manufacturingContext.state,
      lane: manufacturingContext.lane,
      pageContext: manufacturingContext.page,
      recommendation: manufacturingContext.recommendation
    },
    {
      label: 'Partial Food Batch WIP',
      caseType: 'partial_food_batch_wip',
      payload: foodPartial,
      state: foodContext.state,
      lane: foodContext.lane,
      pageContext: foodContext.page,
      recommendation: foodContext.recommendation
    }
  ]);

  const cases = packet.smokeCases;
  const retailCase = cases.find((item) => item.caseType === 'complete_non_manufacturing');
  const manufacturingCase = cases.find((item) => item.caseType === 'complete_manufacturing');
  const partialCase = cases.find((item) => item.caseType === 'partial_food_batch_wip');
  const results = [];

  assertCase(results, 'packet_has_three_representative_cases',
    packet.status === 'mode_aware_live_review_smoke_packet_ready' &&
      cases.length === 3 &&
      retailCase &&
      manufacturingCase &&
      partialCase,
    cases.map((item) => item.caseType).join(', '));
  assertCase(results, 'complete_non_manufacturing_case_is_operator_readable',
    retailCase.consultantReviewHeadline === 'Build results are ready.' &&
      retailCase.selectedToggles.enableManufacturing === false &&
      hasAll(retailCase.visibleRecordLabels.join(' '), ['Customer', 'Sales Order', 'Product SKU']) &&
      retailCase.openLinkEligibility.visibleRecordsOnlyAfterValidImport === true,
    `${retailCase.resolvedOperatingMode}: ${retailCase.consultantReviewHeadline}`);
  assertCase(results, 'complete_manufacturing_case_has_mode_aware_labels',
    manufacturingCase.consultantReviewHeadline === 'Build results are ready.' &&
      manufacturingCase.selectedToggles.enableManufacturing === true &&
      hasAll(manufacturingCase.visibleRecordLabels.join(' '), ['Finished/Assembly Item', 'Component Item', 'BOM or Assembly Structure']) &&
      manufacturingCase.openLinkEligibility.visibleRecordsOnlyAfterValidImport === true,
    manufacturingCase.visibleRecordLabels.join(', '));
  assertCase(results, 'partial_food_batch_wip_case_is_honest_and_debuggable',
    partialCase.consultantReviewHeadline === 'Food batch records are ready. WIP detail was not returned.' &&
      partialCase.selectedToggles.enableManufacturing === true &&
      partialCase.selectedToggles.enableWip === true &&
      hasAll(partialCase.visibleRecordLabels.join(' '), ['Finished Food/Batch Item', 'Ingredient Item', 'Formula or Batch Structure', 'Lot Context']) &&
      partialCase.adminDebugOnlyDiagnostics.visible === true &&
      partialCase.adminDebugOnlyDiagnostics.diagnostics.missingWorkOrderOrWipObject === true,
    `${partialCase.consultantReviewHeadline}; ${partialCase.visibleRecordLabels.join(', ')}`);
  assertCase(results, 'normal_consultant_copy_hides_internal_terms',
    cases.every((item) => !forbiddenNormalUiTerms(item.normalConsultantCopy)),
    cases.map((item) => item.normalConsultantCopy).join(' | '));
  assertCase(results, 'admin_debug_is_only_visible_for_expected_partial_case',
    retailCase.adminDebugOnlyDiagnostics.visible === false &&
      manufacturingCase.adminDebugOnlyDiagnostics.visible === false &&
      partialCase.adminDebugOnlyDiagnostics.visible === true,
    cases.map((item) => `${item.caseType}:${item.adminDebugOnlyDiagnostics.visible}`).join(', '));
  assertCase(results, 'run_next_steps_are_concise_and_record_backed',
    cases.every((item) => Array.isArray(item.consultantRunNextSteps) && item.consultantRunNextSteps.length >= 3) &&
      partialCase.consultantRunNextSteps.includes('WIP detail not returned') &&
      !partialCase.consultantRunNextSteps.includes('Open Work Order'),
    partialCase.consultantRunNextSteps.join(' / '));
  assertCase(results, 'visible_records_are_openable_only',
    cases.every((item) => item.visibleRecords.every((record) => record.openable === true && /^https:\/\/SANDBOX_ACCOUNT_ID\.app\.netsuite\.com\//.test(record.url))),
    cases.map((item) => `${item.caseType}:${item.visibleRecords.length}`).join(', '));
  assertCase(results, 'w214_w215_w216_boundaries_preserved',
    packet.noRegression.w151ImportGuardPreserved === true &&
      packet.noRegression.semanticRoleMappingPreserved === true &&
      packet.noRegression.modeAwareNamingGuardrailsPreserved === true &&
      packet.noRegression.dynamicRecordDisplayPreserved === true &&
      packet.noRegression.consultantPartialResultLanguagePreserved === true &&
      packet.noRegression.noDrawerCreatedRecords === true &&
      packet.noRegression.noDrawerTransactionWrites === true &&
      packet.noRegression.noDirectSuiteScriptOutsideApprovedW144AdapterPath === true &&
      packet.noRegression.runnerOwnsGeneratedRecords === true &&
      packet.noRegression.imageLookupDisabledByDefault === true &&
      packet.noRegression.nllmAdvisoryOnly === true,
    JSON.stringify(packet.noRegression));

  const trace = {
    schema: 'idb.w217-mode-aware-live-review-smoke-trace.v1',
    cases: cases.map((item) => ({
      label: item.label,
      caseType: item.caseType,
      resolvedOperatingMode: item.resolvedOperatingMode,
      selectedToggles: item.selectedToggles,
      consultantReviewHeadline: item.consultantReviewHeadline,
      consultantRunNextSteps: item.consultantRunNextSteps,
      visibleRecordLabels: item.visibleRecordLabels,
      openableRecordCount: item.openLinkEligibility.openableRecordCount,
      adminDebugVisible: item.adminDebugOnlyDiagnostics.visible,
      adminDebugDiagnostics: item.adminDebugOnlyDiagnostics.visible ? item.adminDebugOnlyDiagnostics.diagnostics : {}
    }))
  };

  const passCount = results.filter((item) => item.pass).length;
  const summary = {
    schema: 'idb.w217-mode-aware-live-review-smoke-harness.v1',
    status: passCount === results.length ? 'pass' : 'fail',
    passCount,
    total: results.length,
    results,
    packet
  };

  writeJson(dataPath, summary);
  writeJson(tracePath, trace);
  const report = [
    '# W217 Mode-Aware Live Review Smoke Packet',
    '',
    `Status: ${summary.status.toUpperCase()} (${passCount}/${results.length})`,
    '',
    '## Smoke Cases',
    ...cases.map((item) => [
      `- ${item.label}`,
      `  - Mode: ${item.resolvedOperatingMode}`,
      `  - Headline: ${item.consultantReviewHeadline}`,
      `  - Run: ${item.consultantRunNextSteps.join(' / ')}`,
      `  - Labels: ${item.visibleRecordLabels.join(', ')}`,
      `  - Openable records: ${item.openLinkEligibility.openableRecordCount}`,
      `  - Admin/debug visible: ${item.adminDebugOnlyDiagnostics.visible ? 'yes' : 'no'}`
    ].join('\n')),
    '',
    '## Validation',
    ...results.map((item) => `- ${item.pass ? 'PASS' : 'FAIL'} ${item.id}: ${item.evidence}`),
    '',
    '## Operator-Readable Trace Samples',
    '- trace_samples/w217_mode_aware_live_review_smoke_packet_trace.json',
    '- data/w217_mode_aware_live_review_smoke_packet.json',
    '',
    '## Upload Packet',
    '- Upload/update `idb-drawer.user.js` only if deploying W217 script helpers.',
    '- No W144 adapter, runner, or SuiteScript upload is required for W217.',
    '',
    '## Visual Testing Decision',
    'No broad visual testing was run for W217. This block produces a targeted operator smoke packet and harness assertions for Review/Run copy, Open-link eligibility, and admin/debug separation.',
    '',
    '## Best Next Codex Prompt',
    'Move through W218: Operator Smoke Packet Live Wording Freeze. Use W217 smoke cases to freeze the exact Review/Run labels and copy for the representative complete non-manufacturing, complete manufacturing, and partial food/WIP import paths. Preserve W151, real Open links, no drawer writes, and no broad visual testing.',
    ''
  ].join('\n');
  writeText(reportPath, report);

  if (passCount !== results.length) {
    console.error(`W217 mode-aware live review smoke packet: fail; ${passCount}/${results.length} checks`);
    process.exit(1);
  }
  console.log(`W217 mode-aware live review smoke packet: pass; ${passCount}/${results.length} checks`);
}

main();
