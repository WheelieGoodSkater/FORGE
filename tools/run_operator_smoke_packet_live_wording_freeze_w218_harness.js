const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const dataPath = path.join(root, 'data', 'w218_operator_smoke_packet_live_wording_freeze.json');
const tracePath = path.join(root, 'trace_samples', 'w218_operator_smoke_packet_live_wording_freeze_trace.json');
const reportPath = path.join(root, 'reports', 'w218_operator_smoke_packet_live_wording_freeze.md');

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
    fetch: () => Promise.reject(new Error('live NetSuite fetch disabled in W218 harness')),
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
      nsRecord('customer', 'customer', `${fix.customer} Customer Account`, 5000 + fix.index, '/app/common/entity/custjob.nl'),
      nsRecord('sales_order', 'salesorder', `${fix.customer} SO218`, 92000 + fix.index, '/app/accounting/transactions/salesord.nl'),
      ...records.map((record, recordIndex) => nsRecord(record.role, record.type || 'inventoryitem', record.name, 5100 + fix.index * 100 + recordIndex))
    ]
  };
}

function exactArray(value, expected) {
  return JSON.stringify(value) === JSON.stringify(expected);
}

function makePacket(hooks) {
  const northstar = fixture(1, 'Northstar Trail Outfitters', 'https://www.rei.com', 'dealer_hardgoods', false, false, 'Retail availability and dealer replenishment proof.');
  const evergreen = fixture(4, 'Evergreen Equipment Works', 'https://www.ariens.com', 'industrial_equipment', true, false, 'Outdoor equipment manufacturing readiness.');
  const mccormick = fixture(6, 'McCormick', 'https://www.mccormick.com', 'food_beverage', true, true, 'Spice and seasoning food batch proof with ingredient, formula, lot, and WIP readiness.');
  const retailContext = stateFor(hooks, northstar, false);
  const manufacturingContext = stateFor(hooks, evergreen, false);
  const foodContext = stateFor(hooks, mccormick, true);
  return hooks.modeAwareLiveReviewSmokePacketW217V1([
    {
      label: 'Complete Non-Manufacturing Retail Availability',
      caseType: 'complete_non_manufacturing',
      payload: completedPayload(northstar, [
        { role: 'hero_sku', name: 'Northstar Trail Outfitters Product Availability SKU' },
        { role: 'dealer_availability_or_replenishment_flow', name: 'Northstar Trail Outfitters Dealer Replenishment Flow' },
        { role: 'location_or_channel_context', name: 'Northstar Trail Outfitters Channel Context' }
      ]),
      state: retailContext.state,
      lane: retailContext.lane,
      pageContext: retailContext.page,
      recommendation: retailContext.recommendation
    },
    {
      label: 'Complete Discrete Manufacturing',
      caseType: 'complete_manufacturing',
      payload: completedPayload(evergreen, [
        { role: 'finished_or_assembly_item', name: 'Evergreen Equipment Works Finished Good' },
        { role: 'bom_or_assembly_structure', name: 'Evergreen Equipment Works Assembly Structure' },
        { role: 'component_item', name: 'Evergreen Equipment Works Component Item' }
      ]),
      state: manufacturingContext.state,
      lane: manufacturingContext.lane,
      pageContext: manufacturingContext.page,
      recommendation: manufacturingContext.recommendation
    },
    {
      label: 'Partial Food Batch WIP',
      caseType: 'partial_food_batch_wip',
      payload: completedPayload(mccormick, [
        { role: 'finished_food_or_batch_item', name: 'McCormick Finished Food Batch Item' },
        { role: 'formula_or_batch_structure', name: 'McCormick Formula Batch Structure' },
        { role: 'ingredient_or_component_item', name: 'McCormick Ingredient Item' },
        { role: 'lot_or_availability_context', name: 'McCormick Lot Context' }
      ], {
        partialResultState: 'partial_result_missing_wip_detail',
        warning: 'WIP detail not returned for food batch result.'
      }),
      state: foodContext.state,
      lane: foodContext.lane,
      pageContext: foodContext.page,
      recommendation: foodContext.recommendation
    }
  ]);
}

function main() {
  const hooks = loadHooks();
  const packet = makePacket(hooks);
  const freeze = hooks.operatorSmokePacketLiveWordingFreezeW218V1(packet);
  const byType = Object.fromEntries(freeze.frozenCases.map((item) => [item.caseType, item]));
  const retail = byType.complete_non_manufacturing;
  const manufacturing = byType.complete_manufacturing;
  const foodPartial = byType.partial_food_batch_wip;
  const results = [];

  assertCase(results, 'freeze_contract_ready',
    freeze.status === 'operator_smoke_wording_frozen' &&
      freeze.schema === 'idb.w218-operator-smoke-packet-live-wording-freeze.v1',
    freeze.status);
  assertCase(results, 'exact_review_headlines_frozen',
    retail.reviewHeadline === 'Build results are ready.' &&
      manufacturing.reviewHeadline === 'Build results are ready.' &&
      foodPartial.reviewHeadline === 'Food batch records are ready. WIP detail was not returned.',
    [retail.reviewHeadline, manufacturing.reviewHeadline, foodPartial.reviewHeadline].join(' | '));
  assertCase(results, 'exact_run_actions_frozen',
    exactArray(retail.runActions, ['Open Customer', 'Open Sales Order', 'Open Item']) &&
      exactArray(manufacturing.runActions, ['Open Customer', 'Open Sales Order', 'Open Item']) &&
      exactArray(foodPartial.runActions, ['Open Customer', 'Open Sales Order', 'Open Item', 'Use available records', 'WIP detail not returned']),
    foodPartial.runActions.join(' / '));
  assertCase(results, 'exact_mode_aware_labels_frozen',
    exactArray(retail.visibleRecordLabels, ['Customer', 'Sales Order', 'Product SKU', 'Availability/Replenishment Flow', 'Channel/Location Context']) &&
      exactArray(manufacturing.visibleRecordLabels, ['Customer', 'Sales Order', 'Finished/Assembly Item', 'BOM or Assembly Structure', 'Component Item']) &&
      exactArray(foodPartial.visibleRecordLabels, ['Customer', 'Sales Order', 'Finished Food/Batch Item', 'Formula or Batch Structure', 'Ingredient Item', 'Lot Context']),
    foodPartial.visibleRecordLabels.join(', '));
  assertCase(results, 'partial_food_wip_does_not_claim_wip_support',
    foodPartial.noUnsupportedManufacturingOrWipClaims === true &&
      !/Open Work Order|Open Routing|Open Work Center|Show WIP|Prove WIP/i.test(foodPartial.normalConsultantCopy),
    foodPartial.normalConsultantCopy);
  assertCase(results, 'complete_manufacturing_only_mentions_returned_bom_or_assembly',
    manufacturing.visibleRecordLabels.includes('BOM or Assembly Structure') &&
      manufacturing.noUnsupportedManufacturingOrWipClaims === true &&
      !/WIP detail not returned|Open Work Order|Open Routing|Open Work Center/i.test(manufacturing.normalConsultantCopy),
    manufacturing.normalConsultantCopy);
  assertCase(results, 'normal_copy_hides_internal_terms',
    freeze.frozenCases.every((item) => item.normalCopyHidesInternalTerms === true),
    freeze.frozenCases.map((item) => item.normalConsultantCopy).join(' | '));
  assertCase(results, 'admin_debug_diagnostics_remain_gated',
    retail.adminDebugVisible === false &&
      manufacturing.adminDebugVisible === false &&
      foodPartial.adminDebugVisible === true &&
      freeze.adminDebugSeparation.partialFoodBatchWipExpectedAdminDebug === true,
    freeze.frozenCases.map((item) => `${item.caseType}:${item.adminDebugVisible}`).join(', '));
  assertCase(results, 'open_links_remain_real_only',
    freeze.frozenCases.every((item) => item.openLinksAreRealOnly === true),
    freeze.frozenCases.map((item) => `${item.caseType}:${item.openLinksAreRealOnly}`).join(', '));
  assertCase(results, 'w214_to_w217_boundaries_preserved',
    freeze.noRegression.w151ImportGuardPreserved === true &&
      freeze.noRegression.semanticRoleMappingPreserved === true &&
      freeze.noRegression.modeAwareNamingGuardrailsPreserved === true &&
      freeze.noRegression.dynamicRecordDisplayPreserved === true &&
      freeze.noRegression.consultantPartialResultLanguagePreserved === true &&
      freeze.noRegression.operatorReadableSmokePacketPreserved === true &&
      freeze.noRegression.noDrawerCreatedRecords === true &&
      freeze.noRegression.noDrawerTransactionWrites === true &&
      freeze.noRegression.noDirectSuiteScriptOutsideApprovedW144AdapterPath === true &&
      freeze.noRegression.runnerOwnsGeneratedRecords === true &&
      freeze.noRegression.imageLookupDisabledByDefault === true &&
      freeze.noRegression.nllmAdvisoryOnly === true,
    JSON.stringify(freeze.noRegression));

  const trace = {
    schema: 'idb.w218-operator-smoke-packet-live-wording-freeze-trace.v1',
    frozenCases: freeze.frozenCases.map((item) => ({
      caseType: item.caseType,
      resolvedOperatingMode: item.resolvedOperatingMode,
      reviewHeadline: item.reviewHeadline,
      runActions: item.runActions,
      visibleRecordLabels: item.visibleRecordLabels,
      adminDebugVisible: item.adminDebugVisible
    }))
  };
  const passCount = results.filter((item) => item.pass).length;
  const summary = {
    schema: 'idb.w218-operator-smoke-packet-live-wording-freeze-harness.v1',
    status: passCount === results.length ? 'pass' : 'fail',
    passCount,
    total: results.length,
    results,
    freeze
  };

  writeJson(dataPath, summary);
  writeJson(tracePath, trace);
  const report = [
    '# W218 Operator Smoke Packet Live Wording Freeze',
    '',
    `Status: ${summary.status.toUpperCase()} (${passCount}/${results.length})`,
    '',
    '## Frozen Wording Matrix',
    ...freeze.frozenCases.map((item) => [
      `- ${item.label}`,
      `  - Mode: ${item.resolvedOperatingMode}`,
      `  - Review headline: ${item.reviewHeadline}`,
      `  - Run actions: ${item.runActions.join(' / ')}`,
      `  - Labels: ${item.visibleRecordLabels.join(', ')}`,
      `  - Admin/debug visible: ${item.adminDebugVisible ? 'yes' : 'no'}`
    ].join('\n')),
    '',
    '## Validation',
    ...results.map((item) => `- ${item.pass ? 'PASS' : 'FAIL'} ${item.id}: ${item.evidence}`),
    '',
    '## Trace Samples',
    '- trace_samples/w218_operator_smoke_packet_live_wording_freeze_trace.json',
    '- data/w218_operator_smoke_packet_live_wording_freeze.json',
    '',
    '## Upload Packet',
    '- Upload/update `idb-drawer.user.js` only if deploying W218 freeze helpers.',
    '- No W144 adapter, runner, or SuiteScript upload is required for W218.',
    '',
    '## Visual Testing Decision',
    'No broad visual testing was run for W218. Exact Review/Run wording and labels are frozen by harness contract.',
    '',
    '## Best Next Codex Prompt',
    'Move through W219: Mode-Aware Import Failure Recovery Copy. Use W218 frozen wording to add equally plain consultant/admin copy for rejected imports, invalid role/name combinations, handoff JSON, and non-openable returned records. Preserve W151, real Open links, no drawer writes, and no broad visual testing.',
    ''
  ].join('\n');
  writeText(reportPath, report);

  if (passCount !== results.length) {
    console.error(`W218 operator smoke packet live wording freeze: fail; ${passCount}/${results.length} checks`);
    process.exit(1);
  }
  console.log(`W218 operator smoke packet live wording freeze: pass; ${passCount}/${results.length} checks`);
}

main();
