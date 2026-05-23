const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const dataPath = path.join(root, 'data', 'w219_mode_aware_import_failure_recovery_copy.json');
const tracePath = path.join(root, 'trace_samples', 'w219_mode_aware_import_failure_recovery_copy_trace.json');
const reportPath = path.join(root, 'reports', 'w219_mode_aware_import_failure_recovery_copy.md');

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
    fetch: () => Promise.reject(new Error('live NetSuite fetch disabled in W219 harness')),
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

function nsRecord(role, type, name, id, pathName, urlOverride) {
  return {
    role,
    type,
    name,
    internalId: String(id),
    id: String(id),
    url: urlOverride || `https://YOUR_ACCOUNT_ID.app.netsuite.com${pathName || '/app/common/item/item.nl'}?id=${id}`
  };
}

function completedPayload(fix, records, options) {
  const opts = options || {};
  const idBase = opts.idBase || 6200 + fix.index * 100;
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
      nsRecord('customer', 'customer', `${fix.customer} Customer Account`, 6000 + fix.index, '/app/common/entity/custjob.nl', opts.customerUrl),
      nsRecord('sales_order', 'salesorder', `${fix.customer} SO219`, 93000 + fix.index, '/app/accounting/transactions/salesord.nl', opts.salesOrderUrl),
      ...records.map((record, recordIndex) => nsRecord(record.role, record.type || 'inventoryitem', record.name, record.id || idBase + recordIndex, record.pathName, record.url))
    ]
  };
}

function modelFor(hooks, fix, payload, adminDebug) {
  const ctx = stateFor(hooks, fix, adminDebug);
  return hooks.modeAwareImportFailureRecoveryCopyW219V1(payload, ctx.state, ctx.lane, ctx.page, ctx.recommendation);
}

function cleanCopy(model) {
  return model.normalCopyHidesInternalTerms === true &&
    !/(W144|runnerTaskId|raw JSON|W151|semantic guard|mode contract|internal role arrays|stack trace)/i.test(`${model.consultantCopy.headline} ${model.consultantCopy.nextAction}`) &&
    model.consultantCopy.recoveryActions.length <= 2 &&
    model.consultantCopy.recoveryActions.every((item) => String(item).length <= 70);
}

function main() {
  const hooks = loadHooks();
  const northstar = fixture(1, 'Northstar Trail Outfitters', 'https://www.rei.com', 'dealer_hardgoods', false, false, 'Retail availability and dealer replenishment proof.');
  const metroline = fixture(3, 'Metroline Parts Supply', 'https://www.grainger.com', 'industrial_distribution', false, false, 'Branch parts replenishment, not assembly execution.');
  const canyon = fixture(5, 'Canyon Ridge Components', 'https://www.trekbikes.com', 'dealer_hardgoods', true, true, 'Bike component WIP needs work order, routing, and work center visibility.');
  const mccormick = fixture(6, 'McCormick', 'https://www.mccormick.com', 'food_beverage', true, true, 'Spice and seasoning food batch proof with ingredient, formula, lot, and WIP readiness.');

  const northstarContext = stateFor(hooks, northstar, false);
  const handoffJson = hooks.dccRunnerHandoffPacketV1(northstarContext.state, northstarContext.lane, northstarContext.page, northstarContext.recommendation);
  const handoff = modelFor(hooks, northstar, handoffJson, false);
  const invalidMetroline = modelFor(hooks, metroline, completedPayload(metroline, [
    { role: 'branch_or_product_sku', name: 'Metroline Parts Supply Finished Good' },
    { role: 'replenishment_or_availability_flow', name: 'Metroline Parts Supply Controlled Assembly Execution' }
  ]), false);
  const northstarMfgTerms = modelFor(hooks, northstar, completedPayload(northstar, [
    { role: 'hero_sku', name: 'Northstar Trail Outfitters Finished Good' },
    { role: 'dealer_availability_or_replenishment_flow', name: 'Northstar Trail Outfitters Assembly Execution' },
    { role: 'component_item', name: 'Northstar Trail Outfitters Component A' }
  ]), false);
  const mccormickFallback = modelFor(hooks, mccormick, completedPayload(mccormick, [
    { role: 'finished_food_or_batch_item', name: 'McCormick Style SKU' },
    { role: 'formula_or_batch_structure', name: 'McCormick Omnichannel Availability Flow' },
    { role: 'ingredient_or_component_item', name: 'McCormick Industrial Component Item' }
  ]), false);
  const missingIds = modelFor(hooks, northstar, completedPayload(northstar, [
    { role: 'hero_sku', name: 'Northstar Trail Outfitters Product Availability SKU', id: 'ITEM-PENDING' },
    { role: 'dealer_availability_or_replenishment_flow', name: 'Northstar Trail Outfitters Dealer Replenishment Flow' }
  ]), false);
  const unsupportedUrls = modelFor(hooks, northstar, completedPayload(northstar, [
    { role: 'hero_sku', name: 'Northstar Trail Outfitters Product Availability SKU', url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/site/hosting/scriptlet.nl?id=6300' },
    { role: 'dealer_availability_or_replenishment_flow', name: 'Northstar Trail Outfitters Dealer Replenishment Flow' }
  ]), false);
  const partialWipAdmin = modelFor(hooks, canyon, completedPayload(canyon, [
    { role: 'finished_or_assembly_item', name: 'Canyon Ridge Components Finished Good' },
    { role: 'bom_or_assembly_structure', name: 'Canyon Ridge Components Assembly Structure' },
    { role: 'component_item', name: 'Canyon Ridge Components Component Item' }
  ], {
    partialResultState: 'partial_result_missing_wip_detail',
    warning: 'WIP detail not returned.'
  }), true);
  const invalidAdmin = modelFor(hooks, metroline, completedPayload(metroline, [
    { role: 'branch_or_product_sku', name: 'Metroline Parts Supply Finished Good' },
    { role: 'replenishment_or_availability_flow', name: 'Metroline Parts Supply Frame Welding' }
  ]), true);

  const models = { handoff, invalidMetroline, northstarMfgTerms, mccormickFallback, missingIds, unsupportedUrls, partialWipAdmin, invalidAdmin };
  const results = [];

  assertCase(results, 'handoff_json_recovery_copy_is_plain',
    handoff.status === 'import_recovery_copy_ready' &&
      handoff.failureTypes.handoffJsonRejected === true &&
      handoff.consultantCopy.headline === 'Paste the completed build result.' &&
      handoff.consultantCopy.nextAction === 'Use the latest completed runner result.' &&
      cleanCopy(handoff),
    `${handoff.consultantCopy.headline} ${handoff.consultantCopy.nextAction}`);
  assertCase(results, 'invalid_distribution_manufacturing_fallback_names_rejected_plainly',
    invalidMetroline.status === 'import_recovery_copy_ready' &&
      invalidMetroline.failureTypes.invalidRoleOrNameCombination === true &&
      invalidMetroline.consultantCopy.headline === 'This result does not match the selected operating mode.' &&
      cleanCopy(invalidMetroline),
    invalidMetroline.consultantCopy.headline);
  assertCase(results, 'northstar_manufacturing_terms_rejected_when_manufacturing_false',
    northstarMfgTerms.failureTypes.manufacturingReturnedWhenManufacturingFalse === true &&
      northstarMfgTerms.consultantCopy.headline === 'This result does not match the selected operating mode.' &&
      cleanCopy(northstarMfgTerms),
    JSON.stringify(northstarMfgTerms.failureTypes));
  assertCase(results, 'mccormick_apparel_industrial_fallback_rejected',
    mccormickFallback.failureTypes.invalidRoleOrNameCombination === true &&
      mccormickFallback.consultantCopy.headline === 'This result does not match the selected operating mode.' &&
      cleanCopy(mccormickFallback),
    mccormickFallback.consultantCopy.headline);
  assertCase(results, 'missing_numeric_ids_request_real_links',
    missingIds.failureTypes.missingNumericIds === true &&
      missingIds.failureTypes.nonOpenableReturnedRecords === true &&
      missingIds.consultantCopy.headline === 'Ask the runner to return real NetSuite links.' &&
      missingIds.consultantCopy.visibleRecords.length === 0,
    missingIds.consultantCopy.headline);
  assertCase(results, 'unsupported_urls_request_real_links',
    unsupportedUrls.failureTypes.unsupportedUrls === true &&
      unsupportedUrls.failureTypes.nonOpenableReturnedRecords === true &&
      unsupportedUrls.consultantCopy.headline === 'Ask the runner to return real NetSuite links.' &&
      unsupportedUrls.consultantCopy.visibleRecords.length === 0,
    unsupportedUrls.consultantCopy.headline);
  assertCase(results, 'partial_wip_admin_detail_visible_only_when_enabled',
    partialWipAdmin.failureTypes.wipMissingWhenWipTrue === true &&
      partialWipAdmin.adminDebug.visible === true &&
      partialWipAdmin.adminDebug.diagnostics.validationStatus &&
      cleanCopy(partialWipAdmin),
    JSON.stringify(partialWipAdmin.adminDebug.diagnostics));
  assertCase(results, 'admin_debug_details_include_rejected_roles_names_and_mode',
    invalidAdmin.adminDebug.visible === true &&
      invalidAdmin.adminDebug.diagnostics.validationStatus &&
      invalidAdmin.adminDebug.diagnostics.resolvedOperatingMode &&
      invalidAdmin.adminDebug.diagnostics.selectedToggles &&
      (invalidAdmin.adminDebug.diagnostics.rejectedNames.length > 0 || invalidAdmin.adminDebug.diagnostics.rejectedRoles.length > 0),
    JSON.stringify(invalidAdmin.adminDebug.diagnostics));
  assertCase(results, 'normal_consultant_copy_hides_internal_terms_for_all_failures',
    Object.values(models).every(cleanCopy),
    Object.values(models).map((model) => `${model.consultantCopy.headline} ${model.consultantCopy.nextAction}`).join(' | '));
  assertCase(results, 'no_fake_open_links_before_valid_import',
    [handoff, invalidMetroline, northstarMfgTerms, mccormickFallback, missingIds, unsupportedUrls].every((model) => model.noFakeOpenLinksBeforeValidImport === true && model.consultantCopy.visibleRecords.length === 0),
    'no visible Open records for rejected imports');
  assertCase(results, 'w214_to_w218_boundaries_preserved',
    Object.values(models).every((model) =>
      model.noRegression.w151ImportGuardPreserved === true &&
      model.noRegression.semanticRoleMappingPreserved === true &&
      model.noRegression.modeAwareNamingGuardrailsPreserved === true &&
      model.noRegression.dynamicRecordDisplayPreserved === true &&
      model.noRegression.consultantPartialResultLanguagePreserved === true &&
      model.noRegression.operatorReadableSmokePacketPreserved === true &&
      model.noRegression.frozenReviewRunWordingPreserved === true &&
      model.noRegression.noDrawerCreatedRecords === true &&
      model.noRegression.noDrawerTransactionWrites === true &&
      model.noRegression.noDirectSuiteScriptOutsideApprovedW144AdapterPath === true &&
      model.noRegression.runnerOwnsGeneratedRecords === true &&
      model.noRegression.imageLookupDisabledByDefault === true &&
      model.noRegression.nllmAdvisoryOnly === true
    ),
    'all no-regression flags preserved');

  const trace = {
    schema: 'idb.w219-mode-aware-import-failure-recovery-trace.v1',
    cases: Object.entries(models).map(([key, model]) => ({
      key,
      status: model.status,
      resolvedOperatingMode: model.resolvedOperatingMode,
      selectedToggles: model.selectedToggles,
      consultantCopy: model.consultantCopy,
      failureTypes: model.failureTypes,
      adminDebugVisible: model.adminDebug.visible,
      adminDebugDiagnostics: model.adminDebug.visible ? model.adminDebug.diagnostics : {}
    }))
  };
  const passCount = results.filter((item) => item.pass).length;
  const summary = {
    schema: 'idb.w219-mode-aware-import-failure-recovery-copy-harness.v1',
    status: passCount === results.length ? 'pass' : 'fail',
    passCount,
    total: results.length,
    results,
    recoveryCopyMatrix: trace.cases,
    models
  };

  writeJson(dataPath, summary);
  writeJson(tracePath, trace);
  const report = [
    '# W219 Mode-Aware Import Failure Recovery Copy',
    '',
    `Status: ${summary.status.toUpperCase()} (${passCount}/${results.length})`,
    '',
    '## Consultant/Admin Recovery Copy Matrix',
    ...trace.cases.map((item) => [
      `- ${item.key}`,
      `  - Mode: ${item.resolvedOperatingMode}`,
      `  - Consultant: ${item.consultantCopy.headline} ${item.consultantCopy.nextAction}`,
      `  - Admin/debug visible: ${item.adminDebugVisible ? 'yes' : 'no'}`,
      `  - Failure types: ${Object.entries(item.failureTypes).filter(([, value]) => value === true).map(([key]) => key).join(', ') || 'none'}`
    ].join('\n')),
    '',
    '## Validation',
    ...results.map((item) => `- ${item.pass ? 'PASS' : 'FAIL'} ${item.id}: ${item.evidence}`),
    '',
    '## Trace Samples',
    '- trace_samples/w219_mode_aware_import_failure_recovery_copy_trace.json',
    '- data/w219_mode_aware_import_failure_recovery_copy.json',
    '',
    '## Upload Packet',
    '- Upload/update `idb-drawer.user.js` only if deploying W219 recovery helpers.',
    '- No W144 adapter, runner, or SuiteScript upload is required for W219.',
    '',
    '## Visual Testing Decision',
    'No broad visual testing was run for W219. Recovery copy and admin/debug separation are covered by harness assertions.',
    '',
    '## Best Next Codex Prompt',
    'Move through W220: Import Recovery UI Surface Wiring. Use W219 recovery copy to wire the normal Review/Build import failure surfaces to the plain recovery actions while preserving admin/debug-only diagnostics, W218 frozen success wording, W151, real Open links, no drawer writes, and no broad visual testing.',
    ''
  ].join('\n');
  writeText(reportPath, report);

  if (passCount !== results.length) {
    console.error(`W219 mode-aware import failure recovery copy: fail; ${passCount}/${results.length} checks`);
    process.exit(1);
  }
  console.log(`W219 mode-aware import failure recovery copy: pass; ${passCount}/${results.length} checks`);
}

main();
