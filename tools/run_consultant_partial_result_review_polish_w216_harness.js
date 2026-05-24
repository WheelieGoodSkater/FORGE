const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const dataPath = path.join(root, 'data', 'w216_consultant_partial_result_review_polish.json');
const tracePath = path.join(root, 'trace_samples', 'w216_consultant_partial_result_review_polish_trace.json');
const reportPath = path.join(root, 'reports', 'w216_consultant_partial_result_review_polish.md');

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
    fetch: () => Promise.reject(new Error('live NetSuite fetch disabled in W216 harness')),
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

function baseState(fix, adminDebug) {
  return {
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
}

function contextFromFixture(hooks, fix, adminDebug) {
  const state = baseState(fix, adminDebug);
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

function payload(fix, semanticRecords, options) {
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
      nsRecord('customer', 'customer', `${fix.customer} Customer Account`, 1700 + fix.index, '/app/common/entity/custjob.nl'),
      nsRecord('sales_order', 'salesorder', `${fix.customer} SO216`, 80000 + fix.index, '/app/accounting/transactions/salesord.nl'),
      ...semanticRecords.map((record, recordIndex) => nsRecord(record.role, record.type || 'inventoryitem', record.name, 2100 + fix.index * 100 + recordIndex))
    ]
  };
}

function modelFor(hooks, fix, sourcePayload, adminDebug) {
  const context = contextFromFixture(hooks, fix, adminDebug);
  const guard = hooks.validateDccFinalNamingImportPayload(sourcePayload, context.state, context.lane, context.page, context.recommendation);
  if (guard.valid) context.state.dccFinalNamingResult = guard.finalNaming;
  const selectedMove = context.lane.moves[context.state.selectedMoveIndex] || context.lane.moves[0];
  const action = { id: 'prove', label: 'Prove', title: 'Prove in NetSuite', copy: '' };
  const summary = 'Harness summary';
  return {
    context,
    guard,
    w216: hooks.consultantPartialResultReviewRunModelW216V1(sourcePayload, context.state, context.lane, context.page, context.recommendation),
    runTrace: hooks.runSelectorTraceModel(context.state, context.lane, context.page, context.recommendation),
    reviewHtml: hooks.renderReviewView(context.state, context.lane, context.page, context.recommendation),
    runHtml: hooks.renderRunView(context.state, context.lane, context.page, context.recommendation, selectedMove, action, summary)
  };
}

function cleanUi(value) {
  return !/(W144|runnerTaskId|raw JSON|W151|semantic guard|mode contract|admin\/debug diagnostics)/i.test(String(value || ''));
}

function includesAll(value, terms) {
  const text = String(value || '').toLowerCase();
  return terms.every((term) => text.includes(String(term).toLowerCase()));
}

function main() {
  const hooks = loadHooks();
  const fixtures = {
    northstar: fixture(1, 'Northstar Trail Outfitters', 'https://www.rei.com', 'dealer_hardgoods', false, false, 'Retail availability and channel replenishment proof.'),
    harbor: fixture(2, 'Harbor & Ridge Apparel', 'https://www.patagonia.com', 'apparel_accessories', false, false, 'Style, size, color, channel availability, and seasonal apparel launch readiness.'),
    metroline: fixture(3, 'Metroline Parts Supply', 'https://www.grainger.com', 'industrial_distribution', false, false, 'Branch parts replenishment, not assembly execution.'),
    evergreen: fixture(4, 'Evergreen Equipment Works', 'https://www.ariens.com', 'industrial_equipment', true, false, 'Outdoor equipment manufacturing readiness.'),
    canyon: fixture(5, 'Canyon Ridge Components', 'https://www.trekbikes.com', 'dealer_hardgoods', true, true, 'Bike component WIP needs work order, routing, and work center visibility.'),
    mccormick: fixture(6, 'McCormick', 'https://www.mccormick.com', 'food_beverage', true, true, 'Spice and seasoning food batch proof with ingredient, formula, lot, and WIP readiness.')
  };
  const payloads = {
    retail: payload(fixtures.northstar, [
      { role: 'hero_sku', name: 'Northstar Trail Outfitters Product Availability SKU' },
      { role: 'availability_or_replenishment_flow', name: 'Northstar Trail Outfitters Retail Replenishment Flow' },
      { role: 'location_or_channel_context', name: 'Northstar Trail Outfitters Store Channel Context' }
    ]),
    apparel: payload(fixtures.harbor, [
      { role: 'style_sku', name: 'Harbor & Ridge Apparel Style SKU' },
      { role: 'style_matrix_or_availability_flow', name: 'Harbor & Ridge Apparel Omnichannel Availability Flow' },
      { role: 'component_item', name: 'Harbor & Ridge Apparel Size-Color SKU' }
    ]),
    discreteComplete: payload(fixtures.evergreen, [
      { role: 'finished_or_assembly_item', name: 'Evergreen Equipment Works Finished Good' },
      { role: 'bom_or_assembly_structure', name: 'Evergreen Equipment Works Assembly Structure' },
      { role: 'component_item', name: 'Evergreen Equipment Works Component Item' }
    ]),
    discretePartial: payload(fixtures.evergreen, [
      { role: 'finished_or_assembly_item', name: 'Evergreen Equipment Works Finished Good' },
      { role: 'component_item', name: 'Evergreen Equipment Works Component Item' }
    ], {
      partialResultState: 'partial_result_missing_manufacturing_records',
      warning: 'Manufacturing records missing: BOM or assembly structure not returned.'
    }),
    wipComplete: payload(fixtures.canyon, [
      { role: 'finished_or_assembly_item', name: 'Canyon Ridge Components Finished Good' },
      { role: 'bom_or_assembly_structure', name: 'Canyon Ridge Components Assembly Structure' },
      { role: 'component_item', name: 'Canyon Ridge Components Component Item' },
      { role: 'work_order_or_wip_object', name: 'Canyon Ridge Components Work Order' },
      { role: 'routing', name: 'Canyon Ridge Components Routing' },
      { role: 'work_center', name: 'Canyon Ridge Components Work Center' }
    ]),
    wipPartial: payload(fixtures.canyon, [
      { role: 'finished_or_assembly_item', name: 'Canyon Ridge Components Finished Good' },
      { role: 'bom_or_assembly_structure', name: 'Canyon Ridge Components Assembly Structure' },
      { role: 'component_item', name: 'Canyon Ridge Components Component Item' }
    ], {
      partialResultState: 'partial_result_missing_wip_detail',
      warning: 'WIP detail not returned.'
    }),
    foodPartial: payload(fixtures.mccormick, [
      { role: 'finished_food_or_batch_item', name: 'McCormick Finished Food Batch Item' },
      { role: 'formula_or_batch_structure', name: 'McCormick Formula Batch Structure' },
      { role: 'ingredient_or_component_item', name: 'McCormick Ingredient Item' },
      { role: 'lot_or_availability_context', name: 'McCormick Lot Context' }
    ], {
      partialResultState: 'partial_result_missing_wip_detail',
      warning: 'WIP detail not returned for food batch result.'
    }),
    invalidDistribution: payload(fixtures.metroline, [
      { role: 'branch_or_product_sku', name: 'Metroline Parts Supply Finished Good' },
      { role: 'replenishment_or_availability_flow', name: 'Metroline Parts Supply Controlled Assembly Execution' },
      { role: 'component_item', name: 'Metroline Parts Supply Frame Welding' }
    ]),
    invalidFoodFallback: payload(fixtures.mccormick, [
      { role: 'finished_food_or_batch_item', name: 'McCormick Style SKU' },
      { role: 'style_matrix_or_availability_flow', name: 'McCormick Omnichannel Availability Flow' },
      { role: 'ingredient_or_component_item', name: 'McCormick Core Style' }
    ])
  };

  const models = {
    retail: modelFor(hooks, fixtures.northstar, payloads.retail, false),
    apparel: modelFor(hooks, fixtures.harbor, payloads.apparel, false),
    discreteComplete: modelFor(hooks, fixtures.evergreen, payloads.discreteComplete, false),
    discretePartialNormal: modelFor(hooks, fixtures.evergreen, payloads.discretePartial, false),
    discretePartialAdmin: modelFor(hooks, fixtures.evergreen, payloads.discretePartial, true),
    wipComplete: modelFor(hooks, fixtures.canyon, payloads.wipComplete, false),
    wipPartialAdmin: modelFor(hooks, fixtures.canyon, payloads.wipPartial, true),
    foodPartialAdmin: modelFor(hooks, fixtures.mccormick, payloads.foodPartial, true),
    invalidDistribution: modelFor(hooks, fixtures.metroline, payloads.invalidDistribution, false),
    invalidFoodFallback: modelFor(hooks, fixtures.mccormick, payloads.invalidFoodFallback, false)
  };
  const handoffContext = contextFromFixture(hooks, fixtures.northstar, false);
  const handoffPayload = hooks.dccRunnerHandoffPacketV1(handoffContext.state, handoffContext.lane, handoffContext.page, handoffContext.recommendation);
  const handoffGuard = hooks.validateDccFinalNamingImportPayload(handoffPayload, handoffContext.state, handoffContext.lane, handoffContext.page, handoffContext.recommendation);

  const results = [];
  assertCase(results, 'complete_retail_review_ready_clean',
    models.retail.w216.consultantReview.headline === 'Build results are ready.' &&
      includesAll(models.retail.reviewHtml, ['Product SKU', 'Availability/Replenishment Flow', 'Channel/Location Context']) &&
      cleanUi(models.retail.reviewHtml),
    models.retail.w216.consultantReview.headline);
  assertCase(results, 'complete_apparel_labels_clean',
    models.apparel.guard.valid === true &&
      includesAll(models.apparel.reviewHtml, ['Style SKU', 'Style Matrix']) &&
      cleanUi(models.apparel.reviewHtml),
    models.apparel.w216.consultantReview.visibleRecords.map((record) => record.consultantLabel).join(', '));
  assertCase(results, 'complete_discrete_manufacturing_can_name_bom_when_present',
    models.discreteComplete.guard.valid === true &&
      models.discreteComplete.w216.consultantRun.canMentionBomOrAssembly === true &&
      includesAll(models.discreteComplete.reviewHtml, ['Finished/Assembly Item', 'BOM or Assembly Structure']),
    models.discreteComplete.w216.consultantRun.show);
  assertCase(results, 'partial_discrete_consultant_copy_honest_and_clean',
    models.discretePartialNormal.w216.consultantReview.headline === 'Core build records are ready. Manufacturing setup detail was not returned.' &&
      models.discretePartialNormal.w216.consultantRun.canMentionBomOrAssembly === false &&
      cleanUi(models.discretePartialNormal.reviewHtml) &&
      !/Missing BOM\/assembly structure|mapped roles|resolvedOperatingMode/i.test(models.discretePartialNormal.reviewHtml),
    models.discretePartialNormal.w216.consultantReview.headline);
  assertCase(results, 'partial_discrete_admin_debug_shows_diagnostics',
    models.discretePartialAdmin.w216.adminDebug.visible === true &&
      models.discretePartialAdmin.w216.adminDebug.diagnostics.missingBomOrAssemblyStructure === true &&
      /Missing BOM\/assembly structure|Mapped roles|Mode: discrete_manufacturing/i.test(models.discretePartialAdmin.reviewHtml),
    JSON.stringify(models.discretePartialAdmin.w216.adminDebug.diagnostics));
  assertCase(results, 'complete_wip_run_can_use_wip_records',
    models.wipComplete.guard.valid === true &&
      models.wipComplete.w216.consultantRun.canMentionWip === true &&
      models.wipComplete.w216.consultantRun.canMentionRouting === true &&
      models.wipComplete.w216.consultantRun.canMentionWorkCenter === true &&
      includesAll(models.wipComplete.runHtml, ['Work Order', 'Routing', 'Work Center']),
    models.wipComplete.w216.consultantRun.show);
  assertCase(results, 'partial_wip_admin_debug_and_run_do_not_prove_missing_wip',
    models.wipPartialAdmin.w216.consultantReview.headline === 'Core build records are ready. WIP detail was not returned.' &&
      models.wipPartialAdmin.w216.consultantRun.canMentionWip === false &&
      models.wipPartialAdmin.w216.adminDebug.diagnostics.missingWorkOrderOrWipObject === true &&
      !/Show WIP|show routing|show work center/i.test(models.wipPartialAdmin.runTrace.scriptPreview.show),
    `${models.wipPartialAdmin.w216.consultantReview.headline}; ${models.wipPartialAdmin.runTrace.scriptPreview.show}`);
  assertCase(results, 'partial_food_batch_uses_food_language_only',
    models.foodPartialAdmin.w216.resolvedOperatingMode === 'food_batch_manufacturing' &&
      models.foodPartialAdmin.w216.consultantReview.headline === 'Food batch records are ready. WIP detail was not returned.' &&
      includesAll(models.foodPartialAdmin.reviewHtml, ['Finished Food/Batch Item', 'Ingredient Item', 'Formula or Batch Structure', 'Lot Context']),
    models.foodPartialAdmin.w216.consultantReview.headline);
  assertCase(results, 'invalid_fallback_names_remain_rejected',
    models.invalidDistribution.guard.valid === false &&
      models.invalidFoodFallback.guard.valid === false &&
      /Finished Good|Controlled Assembly Execution|Style SKU|Omnichannel Availability Flow/i.test(`${models.invalidDistribution.guard.message} ${models.invalidFoodFallback.guard.message}`),
    `${models.invalidDistribution.guard.status}; ${models.invalidFoodFallback.guard.status}`);
  assertCase(results, 'handoff_json_still_rejected',
    handoffGuard.valid === false && handoffGuard.status === 'handoff_packet_rejected',
    handoffGuard.message);
  assertCase(results, 'normal_run_copy_uses_returned_records_only_after_valid_import',
    models.retail.guard.valid === true &&
      /Northstar Trail Outfitters Product Availability SKU/.test(models.retail.runTrace.scriptPreview.show) &&
      !/Name not returned|Needs real URL|not_returned/i.test(models.retail.runTrace.scriptPreview.show),
    models.retail.runTrace.scriptPreview.show);
  assertCase(results, 'admin_debug_only_terms_are_hidden_when_off',
    cleanUi(models.discretePartialNormal.reviewHtml) &&
      cleanUi(models.discretePartialNormal.runHtml) &&
      models.discretePartialNormal.w216.adminDebug.visible === false,
    'normal Review/Run copy is clean');
  assertCase(results, 'boundaries_preserved',
    models.retail.w216.noRegression.noDrawerWrites === true &&
      models.retail.w216.noRegression.noDrawerTransactionWrites === true &&
      models.retail.w216.noRegression.noDirectSuiteScriptOutsideApprovedW144AdapterPath === true &&
      models.retail.w216.noRegression.runnerOwnsGeneratedRecords === true &&
      models.retail.w216.noRegression.nllmAdvisoryOnly === true &&
      models.retail.w216.noRegression.imageLookupDisabledByDefault === true,
    JSON.stringify(models.retail.w216.noRegression));

  const passCount = results.filter((item) => item.pass).length;
  const summary = {
    schema: 'idb.w216-consultant-partial-result-review-polish-harness.v1',
    status: passCount === results.length ? 'pass' : 'fail',
    passCount,
    total: results.length,
    results,
    fixtures: {
      retail: models.retail.w216.consultantReview,
      apparelLabels: models.apparel.w216.consultantReview.visibleRecords.map((record) => record.consultantLabel),
      discretePartial: models.discretePartialAdmin.w216.adminDebug,
      wipPartial: models.wipPartialAdmin.w216.adminDebug,
      foodPartial: models.foodPartialAdmin.w216.consultantReview,
      handoffGuard: handoffGuard.status
    }
  };

  writeJson(dataPath, summary);
  writeJson(tracePath, {
    schema: 'idb.w216-trace-samples.v1',
    samples: [
      {
        event: 'w216.partial_manufacturing_consultant_copy',
        headline: models.discretePartialNormal.w216.consultantReview.headline,
        runNextSteps: models.discretePartialNormal.w216.consultantRun.nextSteps
      },
      {
        event: 'w216.partial_wip_admin_debug',
        headline: models.wipPartialAdmin.w216.consultantReview.headline,
        adminDebug: models.wipPartialAdmin.w216.adminDebug
      },
      {
        event: 'w216.food_batch_partial_copy',
        headline: models.foodPartialAdmin.w216.consultantReview.headline,
        labels: models.foodPartialAdmin.w216.consultantReview.visibleRecords.map((record) => record.consultantLabel)
      },
      {
        event: 'w216.handoff_json_rejected',
        status: handoffGuard.status
      }
    ]
  });
  writeText(reportPath, [
    '# W216 Consultant-Facing Partial Result Review Polish',
    '',
    `Status: ${summary.status.toUpperCase()} (${passCount}/${results.length})`,
    '',
    '## Consultant-Facing Partial Result Model',
    '- Complete imports say `Build results are ready.` and show only returned records with verified Open links.',
    '- Partial manufacturing imports say `Core build records are ready. Manufacturing setup detail was not returned.`',
    '- Partial WIP imports say `Core build records are ready. WIP detail was not returned.`',
    '- Partial food batch/WIP imports say `Food batch records are ready. WIP detail was not returned.`',
    '',
    '## Admin/Debug Separation',
    '- Normal Review/Run copy hides W144 endpoint, runnerTaskId, raw JSON, W151, semantic guard, mode contract, mapped roles, and diagnostics.',
    '- Admin/debug may show missing BOM/assembly structure, missing work order/WIP object, missing routing, missing work center, mapped roles, resolved mode, and confidence.',
    '',
    '## Validation',
    ...results.map((item) => `- ${item.pass ? 'PASS' : 'FAIL'} ${item.id}: ${item.evidence}`),
    '',
    '## Trace Samples',
    `- ${path.relative(root, tracePath)}`,
    `- ${path.relative(root, dataPath)}`,
    '',
    '## Upload Packet',
    '- Upload/update `idb-drawer.user.js` only.',
    '- No W144 adapter, runner, or SuiteScript upload is required for W216.',
    '',
    '## Visual Testing Decision',
    'No broad visual testing was run or requested for W216. This is consultant/admin copy separation and display-model polish; harness regression is the correct gate.',
    '',
    '## Best Next Codex Prompt',
    'Move through W217: Mode-Aware Live Review Smoke Packet. Use W216 consultant-facing partial result copy to produce a targeted operator smoke packet for one complete non-manufacturing run, one complete manufacturing run, and one partial WIP/food batch run. Preserve W151, real Open links, no drawer writes, and no broad visual testing.'
  ].join('\n') + '\n');

  if (summary.status !== 'pass') {
    console.error(`W216 consultant partial result review polish: fail; ${passCount}/${results.length} checks`);
    process.exit(1);
  }
  console.log(`W216 consultant partial result review polish: pass; ${passCount}/${results.length} checks`);
}

main();
