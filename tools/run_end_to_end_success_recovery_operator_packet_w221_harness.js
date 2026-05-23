const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const dataPath = path.join(root, 'data', 'w221_end_to_end_success_recovery_operator_packet.json');
const tracePath = path.join(root, 'trace_samples', 'w221_end_to_end_success_recovery_operator_packet_trace.json');
const reportPath = path.join(root, 'reports', 'w221_end_to_end_success_recovery_operator_packet.md');

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
    fetch: () => Promise.reject(new Error('live NetSuite fetch disabled in W221 harness')),
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
  const idBase = opts.idBase || 8200 + fix.index * 100;
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
      nsRecord('customer', 'customer', `${fix.customer} Customer Account`, 8000 + fix.index, '/app/common/entity/custjob.nl', opts.customerUrl),
      nsRecord('sales_order', 'salesorder', `${fix.customer} SO221`, 95000 + fix.index, '/app/accounting/transactions/salesord.nl', opts.salesOrderUrl),
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

function exact(value, expected) {
  return JSON.stringify(value) === JSON.stringify(expected);
}

function main() {
  const hooks = loadHooks();
  const northstar = fixture(1, 'Northstar Trail Outfitters', 'https://www.rei.com', 'dealer_hardgoods', false, false, 'Retail availability and dealer replenishment proof.');
  const evergreen = fixture(4, 'Evergreen Equipment Works', 'https://www.ariens.com', 'industrial_equipment', true, false, 'Outdoor equipment manufacturing readiness.');
  const metroline = fixture(3, 'Metroline Parts Supply', 'https://www.grainger.com', 'industrial_distribution', false, false, 'Branch parts replenishment, not assembly execution.');
  const mccormick = fixture(6, 'McCormick', 'https://www.mccormick.com', 'food_beverage', true, true, 'Spice and seasoning food batch proof with ingredient, formula, lot, and WIP readiness.');
  const northstarBase = stateFor(hooks, northstar, false);
  const handoffJson = hooks.dccRunnerHandoffPacketV1(northstarBase.state, northstarBase.lane, northstarBase.page, northstarBase.recommendation);
  const cases = [
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
      ], {
        partialResultState: 'partial_result_missing_wip_detail',
        warning: 'WIP detail not returned for food batch result.'
      }), false)
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
        { role: 'dealer_availability_or_replenishment_flow', name: 'Northstar Trail Outfitters Dealer Replenishment Flow', url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/site/hosting/scriptlet.nl?id=8301' }
      ]), true)
    }
  ];
  const packet = hooks.endToEndSuccessRecoveryOperatorPacketW221V1(cases);
  const byType = Object.fromEntries(packet.cases.map((item) => [item.caseType, item]));
  const results = [];

  assertCase(results, 'packet_includes_all_success_partial_and_recovery_cases',
    packet.status === 'end_to_end_operator_packet_ready' && packet.cases.length === 7,
    packet.cases.map((item) => item.caseType).join(', '));
  assertCase(results, 'success_cases_preserve_w218_frozen_wording',
    byType.complete_non_manufacturing.consultantReviewHeadline === 'Build results are ready.' &&
      byType.complete_manufacturing.consultantReviewHeadline === 'Build results are ready.' &&
      exact(byType.complete_non_manufacturing.visibleRecordLabels, ['Customer', 'Sales Order', 'Product SKU', 'Availability Flow', 'Channel Context']) &&
      exact(byType.complete_manufacturing.visibleRecordLabels, ['Customer', 'Sales Order', 'Finished/Assembly Item', 'BOM or Assembly Structure', 'Component Item']),
    `${byType.complete_non_manufacturing.consultantReviewHeadline}; ${byType.complete_manufacturing.visibleRecordLabels.join(', ')}`);
  assertCase(results, 'partial_food_wip_preserves_w216_w218_wording',
    byType.partial_food_batch_wip.consultantReviewHeadline === 'Food batch records are ready. WIP detail was not returned.' &&
      byType.partial_food_batch_wip.consultantRunOrRecoveryAction === 'Open Customer / Open Sales Order / Open Item / Use available records / WIP detail not returned' &&
      exact(byType.partial_food_batch_wip.visibleRecordLabels, ['Customer', 'Sales Order', 'Finished Food/Batch Item', 'Formula or Batch Structure', 'Ingredient Item', 'Lot Context']),
    byType.partial_food_batch_wip.consultantRunOrRecoveryAction);
  assertCase(results, 'recovery_cases_preserve_w219_w220_wording',
    byType.blank_import_recovery.consultantReviewHeadline === 'Paste the completed build result.' &&
      byType.handoff_json_recovery.consultantReviewHeadline === 'Paste the completed build result.' &&
      byType.invalid_role_name_recovery.consultantReviewHeadline === 'This result does not match the selected operating mode.' &&
      byType.missing_id_or_unsupported_url_recovery.consultantReviewHeadline === 'Ask the runner to return real NetSuite links.' &&
      byType.missing_id_or_unsupported_url_recovery.consultantRunOrRecoveryAction === 'Use available records only after import succeeds.',
    packet.cases.filter((item) => item.surface === 'recovery').map((item) => `${item.caseType}: ${item.consultantReviewHeadline}`).join(' | '));
  assertCase(results, 'no_fake_open_links_before_valid_import',
    packet.cases.filter((item) => item.surface === 'recovery').every((item) => item.openLinkReadiness.noFakeOpenLinksBeforeValidImport === true && item.visibleRecordLabels.length === 0),
    'recovery cases have no visible record labels or Open links');
  assertCase(results, 'valid_imports_show_only_real_open_links',
    packet.cases.filter((item) => item.surface === 'success_or_partial_import').every((item) => item.openLinkReadiness.realOpenLinksReady === true && item.visibleRecords.every((record) => record.openable === true && /^https:\/\/SANDBOX_ACCOUNT_ID\.app\.netsuite\.com\//.test(record.url))),
    packet.cases.filter((item) => item.surface === 'success_or_partial_import').map((item) => `${item.caseType}:${item.visibleRecords.length}`).join(', '));
  assertCase(results, 'normal_packet_copy_hides_forbidden_terms',
    packet.cases.every((item) => item.forbiddenNormalUiTermsCheck === true),
    packet.cases.map((item) => `${item.caseType}: ${item.normalPacketCopy}`).join(' | '));
  assertCase(results, 'admin_debug_diagnostics_availability_marked_only_where_expected',
    packet.cases.filter((item) => item.caseType !== 'missing_id_or_unsupported_url_recovery').every((item) => item.adminDebugDiagnosticsAvailability === false) &&
      byType.missing_id_or_unsupported_url_recovery.adminDebugDiagnosticsAvailability === true,
    packet.cases.map((item) => `${item.caseType}:${item.adminDebugDiagnosticsAvailability}`).join(', '));
  assertCase(results, 'w214_to_w220_boundaries_preserved',
    packet.noRegression.w151ImportGuardPreserved === true &&
      packet.noRegression.semanticRoleMappingPreserved === true &&
      packet.noRegression.modeAwareNamingGuardrailsPreserved === true &&
      packet.noRegression.dynamicRecordDisplayPreserved === true &&
      packet.noRegression.consultantPartialResultLanguagePreserved === true &&
      packet.noRegression.operatorReadableSmokePacketPreserved === true &&
      packet.noRegression.frozenReviewRunWordingPreserved === true &&
      packet.noRegression.importFailureRecoveryCopyPreserved === true &&
      packet.noRegression.recoveryUiSurfaceWiringPreserved === true &&
      packet.noRegression.noDrawerCreatedRecords === true &&
      packet.noRegression.noDrawerTransactionWrites === true &&
      packet.noRegression.noDirectSuiteScriptOutsideApprovedW144AdapterPath === true &&
      packet.noRegression.runnerOwnsGeneratedRecords === true &&
      packet.noRegression.imageLookupDisabledByDefault === true &&
      packet.noRegression.nllmAdvisoryOnly === true,
    JSON.stringify(packet.noRegression));

  const trace = {
    schema: 'idb.w221-end-to-end-success-recovery-operator-packet-trace.v1',
    cases: packet.cases.map((item) => ({
      scenarioLabel: item.scenarioLabel,
      caseType: item.caseType,
      resolvedOperatingMode: item.resolvedOperatingMode,
      selectedToggles: item.selectedToggles,
      consultantReviewHeadline: item.consultantReviewHeadline,
      consultantRunOrRecoveryAction: item.consultantRunOrRecoveryAction,
      visibleRecordLabels: item.visibleRecordLabels,
      openLinkReadiness: item.openLinkReadiness,
      adminDebugDiagnosticsAvailability: item.adminDebugDiagnosticsAvailability,
      forbiddenNormalUiTermsCheck: item.forbiddenNormalUiTermsCheck
    }))
  };
  const passCount = results.filter((item) => item.pass).length;
  const summary = {
    schema: 'idb.w221-end-to-end-success-recovery-operator-packet-harness.v1',
    status: passCount === results.length ? 'pass' : 'fail',
    passCount,
    total: results.length,
    results,
    packet
  };
  writeJson(dataPath, summary);
  writeJson(tracePath, trace);
  const report = [
    '# W221 End-to-End Success And Recovery Operator Packet',
    '',
    `Status: ${summary.status.toUpperCase()} (${passCount}/${results.length})`,
    '',
    '## Compact Success / Partial / Recovery Matrix',
    ...packet.cases.map((item) => [
      `- ${item.scenarioLabel}`,
      `  - Type: ${item.caseType}`,
      `  - Mode: ${item.resolvedOperatingMode}`,
      `  - Consultant: ${item.consultantReviewHeadline} ${item.consultantRunOrRecoveryAction}`,
      `  - Labels: ${item.visibleRecordLabels.join(', ') || 'none'}`,
      `  - Open links: ${item.openLinkReadiness.realOpenLinksReady ? 'ready' : item.openLinkReadiness.noFakeOpenLinksBeforeValidImport ? 'not shown' : 'blocked'}`,
      `  - Admin/debug diagnostics: ${item.adminDebugDiagnosticsAvailability ? 'available' : 'hidden'}`
    ].join('\n')),
    '',
    '## Validation',
    ...results.map((item) => `- ${item.pass ? 'PASS' : 'FAIL'} ${item.id}: ${item.evidence}`),
    '',
    '## Trace Samples',
    '- trace_samples/w221_end_to_end_success_recovery_operator_packet_trace.json',
    '- data/w221_end_to_end_success_recovery_operator_packet.json',
    '',
    '## Upload Packet',
    '- Upload/update `idb-drawer.user.js` only if deploying W221 operator packet helpers.',
    '- No W144 adapter, runner, or SuiteScript upload is required for W221.',
    '',
    '## Visual Testing Decision',
    'No broad visual testing was run for W221. The end-to-end operator packet is covered by harness assertions across success, partial, and recovery paths.',
    '',
    '## Best Next Codex Prompt',
    'Move through W222: Live Operator Packet Export And Copy Freeze. Use W221 packet output to add a compact exportable operator summary for success, partial, and recovery import paths while preserving W218 frozen wording, W220 recovery surfaces, W151, real Open links, no drawer writes, and no broad visual testing.',
    ''
  ].join('\n');
  writeText(reportPath, report);

  if (passCount !== results.length) {
    console.error(`W221 end-to-end success recovery operator packet: fail; ${passCount}/${results.length} checks`);
    process.exit(1);
  }
  console.log(`W221 end-to-end success recovery operator packet: pass; ${passCount}/${results.length} checks`);
}

main();
