const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const dataPath = path.join(root, 'data', 'w220_import_recovery_ui_surface_wiring.json');
const tracePath = path.join(root, 'trace_samples', 'w220_import_recovery_ui_surface_wiring_trace.json');
const reportPath = path.join(root, 'reports', 'w220_import_recovery_ui_surface_wiring.md');

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
    fetch: () => Promise.reject(new Error('live NetSuite fetch disabled in W220 harness')),
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
    url: urlOverride === undefined ? `https://YOUR_ACCOUNT_ID.app.netsuite.com${pathName || '/app/common/item/item.nl'}?id=${id}` : urlOverride
  };
}

function completedPayload(fix, records, options) {
  const opts = options || {};
  const idBase = opts.idBase || 7200 + fix.index * 100;
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
      nsRecord('customer', 'customer', `${fix.customer} Customer Account`, 7000 + fix.index, '/app/common/entity/custjob.nl', opts.customerUrl),
      nsRecord('sales_order', 'salesorder', `${fix.customer} SO220`, 94000 + fix.index, '/app/accounting/transactions/salesord.nl', opts.salesOrderUrl),
      ...records.map((record, recordIndex) => nsRecord(record.role, record.type || 'inventoryitem', record.name, record.id || idBase + recordIndex, record.pathName, record.url))
    ]
  };
}

function stateWithRecovery(hooks, fix, payload, adminDebug, parseError) {
  const ctx = stateFor(hooks, fix, adminDebug);
  const recovery = hooks.modeAwareImportFailureRecoveryCopyW219V1(payload, ctx.state, ctx.lane, ctx.page, ctx.recommendation);
  ctx.state.dccFinalNamingResult = {
    schema: 'idb.dcc-final-naming-result.v1',
    status: parseError ? 'import_failed' : recovery.status,
    displayStatus: 'Completed runner result import blocked',
    importedAt: '2026-05-19T12:00:00.000Z',
    finalNamesImported: false,
    runStatus: parseError ? 'parse_error' : 'not_imported',
    prospect: fix.customer,
    scenario: ctx.lane.proofAnchor,
    familyKey: ctx.lane.id,
    generated: { extId: '', agenda: '' },
    displayObjects: [],
    componentItems: [],
    locationPlanningRecords: [],
    csvSalesOrderArtifacts: [],
    warnings: [],
    errors: [recovery.consultantCopy.headline],
    recoverableBlockers: [recovery.consultantCopy.nextAction],
    importFailureRecovery: recovery
  };
  return ctx;
}

function stateWithSuccessfulImport(hooks, fix, payload, adminDebug) {
  const ctx = stateFor(hooks, fix, adminDebug);
  const guard = hooks.validateDccFinalNamingImportPayload(payload, ctx.state, ctx.lane, ctx.page, ctx.recommendation);
  if (!guard.valid) throw new Error(`Expected valid payload: ${guard.status} ${guard.message}`);
  ctx.state.dccFinalNamingResult = guard.finalNaming;
  return ctx;
}

function renderCase(hooks, ctx) {
  return {
    reviewHtml: hooks.renderReviewView(ctx.state, ctx.lane, ctx.page, ctx.recommendation),
    buildHtml: hooks.renderIntegratedBuildRunnerReturnStatus(ctx.state, ctx.lane, ctx.page, ctx.recommendation),
    surface: hooks.importRecoveryUiSurfaceW220V1(ctx.state, ctx.lane, ctx.page, ctx.recommendation)
  };
}

function forbiddenNormalHtml(value) {
  return /(W144|runnerTaskId|raw JSON|W151|semantic guard|mode contract|internal role arrays|stack trace|Paste completed governed runner result JSON|numeric internal ids|supported NetSuite URLs|Mode contract blocked|Naming blocked)/i.test(String(value || ''));
}

function hasNoOpenLinks(value) {
  return !/<a\b/i.test(String(value || '')) && !/data-idb-open-record/i.test(String(value || ''));
}

function main() {
  const hooks = loadHooks();
  const northstar = fixture(1, 'Northstar Trail Outfitters', 'https://www.rei.com', 'dealer_hardgoods', false, false, 'Retail availability and dealer replenishment proof.');
  const metroline = fixture(3, 'Metroline Parts Supply', 'https://www.grainger.com', 'industrial_distribution', false, false, 'Branch parts replenishment, not assembly execution.');
  const mccormick = fixture(6, 'McCormick', 'https://www.mccormick.com', 'food_beverage', true, true, 'Spice and seasoning food batch proof with ingredient, formula, lot, and WIP readiness.');

  const northstarBase = stateFor(hooks, northstar, false);
  const handoffJson = hooks.dccRunnerHandoffPacketV1(northstarBase.state, northstarBase.lane, northstarBase.page, northstarBase.recommendation);
  const cases = {
    blankImport: stateWithRecovery(hooks, northstar, null, false),
    parseError: stateWithRecovery(hooks, northstar, null, false, true),
    handoffJson: stateWithRecovery(hooks, northstar, handoffJson, false),
    invalidNames: stateWithRecovery(hooks, metroline, completedPayload(metroline, [
      { role: 'branch_or_product_sku', name: 'Metroline Parts Supply Finished Good' },
      { role: 'replenishment_or_availability_flow', name: 'Metroline Parts Supply Controlled Assembly Execution' }
    ]), false),
    missingIds: stateWithRecovery(hooks, northstar, completedPayload(northstar, [
      { role: 'hero_sku', name: 'Northstar Trail Outfitters Product Availability SKU', id: 'ITEM-PENDING' },
      { role: 'dealer_availability_or_replenishment_flow', name: 'Northstar Trail Outfitters Dealer Replenishment Flow' }
    ]), false),
    unsupportedUrls: stateWithRecovery(hooks, northstar, completedPayload(northstar, [
      { role: 'hero_sku', name: 'Northstar Trail Outfitters Product Availability SKU', url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/site/hosting/scriptlet.nl?id=7300' },
      { role: 'dealer_availability_or_replenishment_flow', name: 'Northstar Trail Outfitters Dealer Replenishment Flow' }
    ]), false),
    nonOpenable: stateWithRecovery(hooks, northstar, completedPayload(northstar, [
      { role: 'hero_sku', name: 'Northstar Trail Outfitters Product Availability SKU', id: 7300, url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=9999' },
      { role: 'dealer_availability_or_replenishment_flow', name: 'Northstar Trail Outfitters Dealer Replenishment Flow' }
    ]), false),
    adminInvalidNames: stateWithRecovery(hooks, metroline, completedPayload(metroline, [
      { role: 'branch_or_product_sku', name: 'Metroline Parts Supply Finished Good' },
      { role: 'replenishment_or_availability_flow', name: 'Metroline Parts Supply Frame Welding' }
    ]), true),
    successFoodPartial: stateWithSuccessfulImport(hooks, mccormick, completedPayload(mccormick, [
      { role: 'finished_food_or_batch_item', name: 'McCormick Finished Food Batch Item' },
      { role: 'formula_or_batch_structure', name: 'McCormick Formula Batch Structure' },
      { role: 'ingredient_or_component_item', name: 'McCormick Ingredient Item' },
      { role: 'lot_or_availability_context', name: 'McCormick Lot Context' }
    ], {
      partialResultState: 'partial_result_missing_wip_detail',
      warning: 'WIP detail not returned for food batch result.'
    }), false)
  };
  const rendered = Object.fromEntries(Object.entries(cases).map(([key, ctx]) => [key, renderCase(hooks, ctx)]));
  const failureKeys = ['blankImport', 'parseError', 'handoffJson', 'invalidNames', 'missingIds', 'unsupportedUrls', 'nonOpenable'];
  const normalFailureHtml = failureKeys.map((key) => `${rendered[key].reviewHtml}\n${rendered[key].buildHtml}`).join('\n');
  const results = [];

  assertCase(results, 'blank_import_surface_shows_plain_recovery',
    /Paste the completed build result\./.test(rendered.blankImport.reviewHtml) &&
      /Use the latest completed runner result\./.test(rendered.blankImport.reviewHtml) &&
      !forbiddenNormalHtml(`${rendered.blankImport.reviewHtml} ${rendered.blankImport.buildHtml}`),
    rendered.blankImport.surface.consultant.headline);
  assertCase(results, 'parse_error_surface_shows_plain_recovery',
    /Paste the completed build result\./.test(rendered.parseError.reviewHtml) &&
      /Use the latest completed runner result\./.test(rendered.parseError.reviewHtml) &&
      !/Unexpected token|SyntaxError|stack/i.test(`${rendered.parseError.reviewHtml} ${rendered.parseError.buildHtml}`),
    rendered.parseError.surface.consultant.headline);
  assertCase(results, 'handoff_json_surface_hides_raw_guard_message',
    /Paste the completed build result\./.test(rendered.handoffJson.reviewHtml) &&
      !/Build handoff JSON|does not contain completed runner result records|ids, or URLs/i.test(`${rendered.handoffJson.reviewHtml} ${rendered.handoffJson.buildHtml}`),
    rendered.handoffJson.surface.consultant.nextAction);
  assertCase(results, 'invalid_role_name_surface_is_mode_plain',
    /This result does not match the selected operating mode\./.test(rendered.invalidNames.reviewHtml) &&
      /Use the latest completed runner result\./.test(rendered.invalidNames.reviewHtml) &&
      !/Finished Good|Controlled Assembly Execution|Naming blocked|Mode contract blocked/i.test(`${rendered.invalidNames.reviewHtml} ${rendered.invalidNames.buildHtml}`),
    rendered.invalidNames.surface.consultant.headline);
  assertCase(results, 'missing_ids_unsupported_urls_non_openable_request_real_links',
    ['missingIds', 'unsupportedUrls', 'nonOpenable'].every((key) =>
      /Ask the runner to return real NetSuite links\./.test(rendered[key].reviewHtml) &&
      /Use available records only after import succeeds\./.test(rendered[key].reviewHtml)
    ),
    ['missingIds', 'unsupportedUrls', 'nonOpenable'].map((key) => rendered[key].surface.consultant.headline).join(' | '));
  assertCase(results, 'normal_failure_surfaces_hide_internal_terms_and_raw_messages',
    !forbiddenNormalHtml(normalFailureHtml),
    'normal rendered failure surfaces are clean');
  assertCase(results, 'no_fake_open_links_before_valid_import',
    failureKeys.every((key) => hasNoOpenLinks(rendered[key].reviewHtml) && rendered[key].surface.consultant.visibleRecords.length === 0),
    'no anchors or visible records on rejected imports');
  assertCase(results, 'admin_debug_surface_shows_diagnostics_only_when_enabled',
    !/Import diagnostics|Validation status|Rejected roles|Mapped roles/i.test(rendered.invalidNames.reviewHtml) &&
      /Import diagnostics|Validation status|Rejected roles|Mapped roles|Toggles:/i.test(rendered.adminInvalidNames.reviewHtml),
    'admin diagnostics hidden when off and shown when on');
  assertCase(results, 'success_path_preserves_w218_frozen_partial_wording',
    /Food batch records are ready\. WIP detail was not returned\./.test(rendered.successFoodPartial.reviewHtml) &&
      /Finished Food\/Batch Item|Formula or Batch Structure|Ingredient Item|Lot Context/.test(rendered.successFoodPartial.reviewHtml) &&
      rendered.successFoodPartial.surface.visible === false,
    'partial food success wording preserved');
  assertCase(results, 'w220_surface_model_preserves_boundaries',
    Object.values(rendered).every((item) =>
      item.surface.noRegression.w151ImportGuardPreserved === true &&
      item.surface.noRegression.semanticRoleMappingPreserved === true &&
      item.surface.noRegression.modeAwareNamingGuardrailsPreserved === true &&
      item.surface.noRegression.dynamicRecordDisplayPreserved === true &&
      item.surface.noRegression.consultantPartialResultLanguagePreserved === true &&
      item.surface.noRegression.operatorReadableSmokePacketPreserved === true &&
      item.surface.noRegression.frozenReviewRunWordingPreserved === true &&
      item.surface.noRegression.importFailureRecoveryCopyPreserved === true &&
      item.surface.noRegression.noDrawerCreatedRecords === true &&
      item.surface.noRegression.noDrawerTransactionWrites === true &&
      item.surface.noRegression.noDirectSuiteScriptOutsideApprovedW144AdapterPath === true &&
      item.surface.noRegression.runnerOwnsGeneratedRecords === true &&
      item.surface.noRegression.imageLookupDisabledByDefault === true &&
      item.surface.noRegression.nllmAdvisoryOnly === true
    ),
    'all no-regression flags preserved');

  const trace = {
    schema: 'idb.w220-import-recovery-ui-surface-trace.v1',
    cases: Object.entries(rendered).map(([key, item]) => ({
      key,
      surfaceStatus: item.surface.status,
      visible: item.surface.visible,
      consultant: item.surface.consultant,
      adminDebugVisible: item.surface.adminDebug.visible,
      reviewContainsRecovery: /idb-w220-import-recovery-ui/.test(item.reviewHtml),
      buildContainsRecovery: /idb-w220-import-recovery-ui/.test(item.buildHtml)
    }))
  };
  const passCount = results.filter((item) => item.pass).length;
  const summary = {
    schema: 'idb.w220-import-recovery-ui-surface-wiring-harness.v1',
    status: passCount === results.length ? 'pass' : 'fail',
    passCount,
    total: results.length,
    results,
    trace
  };
  writeJson(dataPath, summary);
  writeJson(tracePath, trace);
  const report = [
    '# W220 Import Recovery UI Surface Wiring',
    '',
    `Status: ${summary.status.toUpperCase()} (${passCount}/${results.length})`,
    '',
    '## Rendered Surface Coverage',
    ...trace.cases.map((item) => [
      `- ${item.key}`,
      `  - Surface: ${item.surfaceStatus}`,
      `  - Consultant: ${item.consultant.headline} ${item.consultant.nextAction}`,
      `  - Review card: ${item.reviewContainsRecovery ? 'yes' : 'no'}`,
      `  - Build card: ${item.buildContainsRecovery ? 'yes' : 'no'}`,
      `  - Admin/debug: ${item.adminDebugVisible ? 'yes' : 'no'}`
    ].join('\n')),
    '',
    '## Validation',
    ...results.map((item) => `- ${item.pass ? 'PASS' : 'FAIL'} ${item.id}: ${item.evidence}`),
    '',
    '## Trace Samples',
    '- trace_samples/w220_import_recovery_ui_surface_wiring_trace.json',
    '- data/w220_import_recovery_ui_surface_wiring.json',
    '',
    '## Upload Packet',
    '- Upload/update `idb-drawer.user.js` only if deploying W220 UI wiring.',
    '- No W144 adapter, runner, or SuiteScript upload is required for W220.',
    '',
    '## Visual Testing Decision',
    'No broad visual testing was run for W220. Rendered Review/Build recovery surfaces are covered by harness assertions.',
    '',
    '## Best Next Codex Prompt',
    'Move through W221: End-to-End Success And Recovery Operator Packet. Combine the W218 success wording and W220 recovery surfaces into one compact operator packet for live inspection across complete, partial, and rejected import paths. Preserve W151, real Open links, no drawer writes, and no broad visual testing.',
    ''
  ].join('\n');
  writeText(reportPath, report);

  if (passCount !== results.length) {
    console.error(`W220 import recovery UI surface wiring: fail; ${passCount}/${results.length} checks`);
    process.exit(1);
  }
  console.log(`W220 import recovery UI surface wiring: pass; ${passCount}/${results.length} checks`);
}

main();
