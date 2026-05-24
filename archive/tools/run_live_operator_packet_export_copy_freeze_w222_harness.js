const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const dataPath = path.join(root, 'data', 'w222_live_operator_packet_export_copy_freeze.json');
const tracePath = path.join(root, 'trace_samples', 'w222_live_operator_packet_export_copy_freeze_trace.json');
const reportPath = path.join(root, 'reports', 'w222_live_operator_packet_export_copy_freeze.md');

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
    fetch: () => Promise.reject(new Error('live NetSuite fetch disabled in W222 harness')),
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
  const idBase = opts.idBase || 9200 + fix.index * 100;
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
      nsRecord('customer', 'customer', `${fix.customer} Customer Account`, 9000 + fix.index, '/app/common/entity/custjob.nl', opts.customerUrl),
      nsRecord('sales_order', 'salesorder', `${fix.customer} SO222`, 96000 + fix.index, '/app/accounting/transactions/salesord.nl', opts.salesOrderUrl),
      ...records.map((record, recordIndex) => nsRecord(record.role, record.type || 'inventoryitem', record.name, record.id || idBase + recordIndex, record.pathName, record.url))
    ]
  };
}

function successContext(hooks, fix, payload, adminDebug) {
  const ctx = stateFor(hooks, fix, adminDebug);
  const guard = hooks.validateDccFinalNamingImportPayload(payload, ctx.state, ctx.lane, ctx.page, ctx.recommendation);
  if (!guard.valid) throw new Error(`Expected valid payload: ${guard.status} ${guard.message}`);
  ctx.state.dccFinalNamingResult = guard.finalNaming;
  return ctx;
}

function recoveryContext(hooks, fix, payload, adminDebug) {
  const ctx = stateFor(hooks, fix, adminDebug);
  const recovery = hooks.modeAwareImportFailureRecoveryCopyW219V1(payload, ctx.state, ctx.lane, ctx.page, ctx.recommendation);
  ctx.state.dccFinalNamingResult = {
    schema: 'idb.dcc-final-naming-result.v1',
    status: recovery.status,
    displayStatus: 'Completed runner result import blocked',
    importedAt: '2026-05-19T12:00:00.000Z',
    finalNamesImported: false,
    runStatus: 'not_imported',
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

function makeW221Packet(hooks) {
  const northstar = fixture(1, 'Northstar Trail Outfitters', 'https://www.rei.com', 'dealer_hardgoods', false, false, 'Retail availability and dealer replenishment proof.');
  const evergreen = fixture(4, 'Evergreen Equipment Works', 'https://www.ariens.com', 'industrial_equipment', true, false, 'Outdoor equipment manufacturing readiness.');
  const metroline = fixture(3, 'Metroline Parts Supply', 'https://www.grainger.com', 'industrial_distribution', false, false, 'Branch parts replenishment, not assembly execution.');
  const mccormick = fixture(6, 'McCormick', 'https://www.mccormick.com', 'food_beverage', true, true, 'Spice and seasoning food batch proof with ingredient, formula, lot, and WIP readiness.');
  const northstarBase = stateFor(hooks, northstar, false);
  const handoffJson = hooks.dccRunnerHandoffPacketV1(northstarBase.state, northstarBase.lane, northstarBase.page, northstarBase.recommendation);
  return hooks.endToEndSuccessRecoveryOperatorPacketW221V1([
    {
      scenarioLabel: 'Complete Non-Manufacturing Import',
      caseType: 'complete_non_manufacturing',
      ...successContext(hooks, northstar, completedPayload(northstar, [
        { role: 'hero_sku', name: 'Northstar Trail Outfitters Product Availability SKU' },
        { role: 'dealer_availability_or_replenishment_flow', name: 'Northstar Trail Outfitters Dealer Replenishment Flow' },
        { role: 'location_or_channel_context', name: 'Northstar Trail Outfitters Channel Context' }
      ]), false)
    },
    {
      scenarioLabel: 'Complete Manufacturing Import',
      caseType: 'complete_manufacturing',
      ...successContext(hooks, evergreen, completedPayload(evergreen, [
        { role: 'finished_or_assembly_item', name: 'Evergreen Equipment Works Finished Good' },
        { role: 'bom_or_assembly_structure', name: 'Evergreen Equipment Works Assembly Structure' },
        { role: 'component_item', name: 'Evergreen Equipment Works Component Item' }
      ]), false)
    },
    {
      scenarioLabel: 'Partial Food Batch WIP Import',
      caseType: 'partial_food_batch_wip',
      ...successContext(hooks, mccormick, completedPayload(mccormick, [
        { role: 'finished_food_or_batch_item', name: 'McCormick Finished Food Batch Item' },
        { role: 'formula_or_batch_structure', name: 'McCormick Formula Batch Structure' },
        { role: 'ingredient_or_component_item', name: 'McCormick Ingredient Item' },
        { role: 'lot_or_availability_context', name: 'McCormick Lot Context' }
      ], { partialResultState: 'partial_result_missing_wip_detail', warning: 'WIP detail not returned for food batch result.' }), false)
    },
    {
      scenarioLabel: 'Blank Import Recovery',
      caseType: 'blank_import_recovery',
      ...recoveryContext(hooks, northstar, null, false)
    },
    {
      scenarioLabel: 'Handoff JSON Recovery',
      caseType: 'handoff_json_recovery',
      ...recoveryContext(hooks, northstar, handoffJson, false)
    },
    {
      scenarioLabel: 'Invalid Role/Name Recovery',
      caseType: 'invalid_role_name_recovery',
      ...recoveryContext(hooks, metroline, completedPayload(metroline, [
        { role: 'branch_or_product_sku', name: 'Metroline Parts Supply Finished Good' },
        { role: 'replenishment_or_availability_flow', name: 'Metroline Parts Supply Controlled Assembly Execution' }
      ]), false)
    },
    {
      scenarioLabel: 'Missing ID / Unsupported URL Recovery',
      caseType: 'missing_id_or_unsupported_url_recovery',
      ...recoveryContext(hooks, northstar, completedPayload(northstar, [
        { role: 'hero_sku', name: 'Northstar Trail Outfitters Product Availability SKU', id: 'ITEM-PENDING' },
        { role: 'dealer_availability_or_replenishment_flow', name: 'Northstar Trail Outfitters Dealer Replenishment Flow', url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/site/hosting/scriptlet.nl?id=9301' }
      ]), true)
    }
  ]);
}

function main() {
  const hooks = loadHooks();
  const packet = makeW221Packet(hooks);
  const summary = hooks.exportableOperatorSummaryW222V1(packet, { adminDebug: false });
  const adminSummary = hooks.exportableOperatorSummaryW222V1(packet, { adminDebug: true });
  const byLabel = Object.fromEntries(summary.compactCaseRows.map((row) => [row.scenarioLabel, row]));
  const results = [];

  assertCase(results, 'export_summary_includes_all_w221_cases',
    summary.status === 'exportable_operator_summary_ready' &&
      summary.caseCount === packet.cases.length &&
      summary.compactCaseRows.length === 7,
    `${summary.caseCount} rows`);
  assertCase(results, 'case_counts_are_correct',
    summary.successCaseCount === 2 &&
      summary.partialCaseCount === 1 &&
      summary.recoveryCaseCount === 4,
    `ready=${summary.successCaseCount}, partial=${summary.partialCaseCount}, recovery=${summary.recoveryCaseCount}`);
  assertCase(results, 'row_statuses_are_frozen',
    byLabel['Complete Non-Manufacturing Import'].status === 'Ready' &&
      byLabel['Complete Manufacturing Import'].status === 'Ready' &&
      byLabel['Partial Food Batch WIP Import'].status === 'Partial' &&
      byLabel['Blank Import Recovery'].status === 'Recovery' &&
      byLabel['Handoff JSON Recovery'].status === 'Recovery' &&
      byLabel['Invalid Role/Name Recovery'].status === 'Recovery' &&
      byLabel['Missing ID / Unsupported URL Recovery'].status === 'Recovery',
    summary.compactCaseRows.map((row) => `${row.scenarioLabel}:${row.status}`).join(', '));
  assertCase(results, 'frozen_success_and_recovery_copy_remains_exact',
    byLabel['Complete Non-Manufacturing Import'].consultantHeadline === 'Build results are ready.' &&
      byLabel['Complete Manufacturing Import'].consultantHeadline === 'Build results are ready.' &&
      byLabel['Partial Food Batch WIP Import'].consultantHeadline === 'Food batch records are ready. WIP detail was not returned.' &&
      byLabel['Blank Import Recovery'].consultantHeadline === 'Paste the completed build result.' &&
      byLabel['Invalid Role/Name Recovery'].consultantHeadline === 'This result does not match the selected operating mode.' &&
      byLabel['Missing ID / Unsupported URL Recovery'].consultantHeadline === 'Ask the runner to return real NetSuite links.' &&
      byLabel['Missing ID / Unsupported URL Recovery'].nextAction === 'Use available records only after import succeeds.',
    byLabel['Missing ID / Unsupported URL Recovery'].normalCopy);
  assertCase(results, 'normal_export_hides_forbidden_terms',
    summary.normalExportHidesForbiddenTerms === true &&
      !/(W144|runnerTaskId|raw JSON|W151|semantic guard|mode contract|internal role arrays|stack trace|raw guard messages)/i.test(summary.normalExportText),
    summary.normalExportText);
  assertCase(results, 'admin_debug_appendix_is_gated',
    summary.diagnosticsAppendixIncluded === false &&
      adminSummary.diagnosticsAppendixIncluded === true &&
      adminSummary.diagnosticsAppendix.length === 1 &&
      adminSummary.diagnosticsAppendix[0].scenarioLabel === 'Missing ID / Unsupported URL Recovery',
    `normal=${summary.diagnosticsAppendix.length}, admin=${adminSummary.diagnosticsAppendix.length}`);
  assertCase(results, 'no_fake_open_links_exported_for_recovery_cases',
    summary.compactCaseRows.filter((row) => row.status === 'Recovery').every((row) => row.visibleLabels === 'No Open links yet' && row.openLinkReadiness === 'No Open links yet'),
    summary.compactCaseRows.filter((row) => row.status === 'Recovery').map((row) => `${row.scenarioLabel}:${row.visibleLabels}`).join(', '));
  assertCase(results, 'valid_import_rows_include_real_open_link_readiness',
    summary.compactCaseRows.filter((row) => row.status === 'Ready' || row.status === 'Partial').every((row) => row.openLinkReadiness === 'Ready' && row.visibleLabels !== 'No Open links yet'),
    summary.compactCaseRows.filter((row) => row.status !== 'Recovery').map((row) => `${row.scenarioLabel}:${row.openLinkReadiness}`).join(', '));
  assertCase(results, 'w214_to_w221_boundaries_preserved',
    summary.noRegressionBoundarySummary.w151ImportGuardPreserved === true &&
      summary.noRegressionBoundarySummary.semanticRoleMappingPreserved === true &&
      summary.noRegressionBoundarySummary.modeAwareNamingGuardrailsPreserved === true &&
      summary.noRegressionBoundarySummary.dynamicRecordDisplayPreserved === true &&
      summary.noRegressionBoundarySummary.consultantPartialResultLanguagePreserved === true &&
      summary.noRegressionBoundarySummary.operatorReadableSmokePacketPreserved === true &&
      summary.noRegressionBoundarySummary.frozenReviewRunWordingPreserved === true &&
      summary.noRegressionBoundarySummary.importFailureRecoveryCopyPreserved === true &&
      summary.noRegressionBoundarySummary.recoveryUiSurfaceWiringPreserved === true &&
      summary.noRegressionBoundarySummary.endToEndOperatorPacketPreserved === true &&
      summary.noRegressionBoundarySummary.noDrawerCreatedRecords === true &&
      summary.noRegressionBoundarySummary.noDrawerTransactionWrites === true &&
      summary.noRegressionBoundarySummary.noDirectSuiteScriptOutsideApprovedW144AdapterPath === true &&
      summary.noRegressionBoundarySummary.runnerOwnsGeneratedRecords === true &&
      summary.noRegressionBoundarySummary.imageLookupDisabledByDefault === true &&
      summary.noRegressionBoundarySummary.nllmAdvisoryOnly === true,
    JSON.stringify(summary.noRegressionBoundarySummary));

  const passCount = results.filter((item) => item.pass).length;
  const harnessSummary = {
    schema: 'idb.w222-live-operator-packet-export-copy-freeze-harness.v1',
    status: passCount === results.length ? 'pass' : 'fail',
    passCount,
    total: results.length,
    results,
    exportSummary: summary,
    adminExportSummary: adminSummary
  };
  const trace = {
    schema: 'idb.w222-live-operator-packet-export-copy-freeze-trace.v1',
    summaryTitle: summary.summaryTitle,
    caseCount: summary.caseCount,
    counts: {
      success: summary.successCaseCount,
      partial: summary.partialCaseCount,
      recovery: summary.recoveryCaseCount
    },
    rows: summary.compactCaseRows,
    diagnosticsAppendixIncluded: summary.diagnosticsAppendixIncluded,
    adminDiagnosticsAppendixIncluded: adminSummary.diagnosticsAppendixIncluded
  };
  writeJson(dataPath, harnessSummary);
  writeJson(tracePath, trace);
  const report = [
    '# W222 Live Operator Packet Export And Copy Freeze',
    '',
    `Status: ${harnessSummary.status.toUpperCase()} (${passCount}/${results.length})`,
    '',
    '## Frozen Export Copy Matrix',
    ...summary.compactCaseRows.map((row) => [
      `- ${row.scenarioLabel}`,
      `  - Status: ${row.status}`,
      `  - Mode: ${row.mode}`,
      `  - Headline: ${row.consultantHeadline}`,
      `  - Next: ${row.nextAction}`,
      `  - Labels: ${row.visibleLabels}`,
      `  - Admin/debug: ${row.adminDebugAvailability}`
    ].join('\n')),
    '',
    '## Counts',
    `- Cases: ${summary.caseCount}`,
    `- Ready: ${summary.successCaseCount}`,
    `- Partial: ${summary.partialCaseCount}`,
    `- Recovery: ${summary.recoveryCaseCount}`,
    '',
    '## Validation',
    ...results.map((item) => `- ${item.pass ? 'PASS' : 'FAIL'} ${item.id}: ${item.evidence}`),
    '',
    '## Trace Samples',
    '- trace_samples/w222_live_operator_packet_export_copy_freeze_trace.json',
    '- data/w222_live_operator_packet_export_copy_freeze.json',
    '',
    '## Upload Packet',
    '- Upload/update `idb-drawer.user.js` only if deploying W222 export helpers.',
    '- No W144 adapter, runner, or SuiteScript upload is required for W222.',
    '',
    '## Visual Testing Decision',
    'No broad visual testing was run for W222. Export copy is frozen by harness assertions.',
    '',
    '## Best Next Codex Prompt',
    'Move through W223: Consultant Export Button And Clipboard Packet Wiring. Use W222 export summary to wire a compact copy/export action in the drawer for the operator packet while preserving W218 frozen wording, W220 recovery surfaces, W151, real Open links, no drawer writes, and no broad visual testing.',
    ''
  ].join('\n');
  writeText(reportPath, report);

  if (passCount !== results.length) {
    console.error(`W222 live operator packet export copy freeze: fail; ${passCount}/${results.length} checks`);
    process.exit(1);
  }
  console.log(`W222 live operator packet export copy freeze: pass; ${passCount}/${results.length} checks`);
}

main();
