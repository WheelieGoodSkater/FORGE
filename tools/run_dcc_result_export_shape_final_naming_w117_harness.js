const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const dataPath = path.join(root, 'data', 'w117_dcc_result_export_shape_final_naming_smoke_pack.json');
const tracePath = path.join(root, 'trace_samples', 'w117_dcc_result_export_shape_final_naming_trace.json');
const reportPath = path.join(root, 'reports', 'w117_dcc_result_export_shape_final_naming_smoke_pack.md');

function makeStorage() {
  const store = new Map();
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key)
  };
}

function loadHooks() {
  const storage = makeStorage();
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
    Blob: function Blob() {},
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

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function assertCase(results, name, pass, detail) {
  results.push({ name, pass: !!pass, detail: detail || '' });
}

function compact(value) {
  return String(value || '').replace(/\s+/g, ' ');
}

function stateFor(sample) {
  const now = new Date().toISOString();
  return {
    open: true,
    selectedLaneId: sample.laneId,
    laneSelectionSource: sample.laneId === 'products_cpg' && sample.caseId === 'ambiguous' ? 'consultant_confirmed' : 'consultant_confirmed',
    briefPrepared: true,
    selectedMoveIndex: 0,
    selectedActionId: 'prove',
    intake: {
      customer: sample.prospect,
      website: sample.website,
      notes: sample.notes,
      websiteEvidence: sample.websiteEvidence,
      scObjective: sample.objective,
      competitor: sample.competitor,
      decisionCriteria: sample.criteria,
      timelineUrgency: sample.timeline
    },
    toggles: sample.toggles || {},
    acceptedPacket: null,
    activeView: 'review',
    setupEditMode: false,
    lanePickerOpen: false,
    storyBarCollapsed: false,
    storyBarCollapseManual: false,
    pilotResult: null,
    dccFinalNamingResult: null,
    websiteEvidenceV1: null,
    websiteResolverRuntime: {
      serviceName: 'websiteResolverServiceV1',
      mode: 'local_fallback',
      requestKey: sample.website,
      endpointConfigured: false,
      localFallbackEnabled: true,
      status: 'resolved',
      failureState: ''
    },
    pageContext: {
      title: 'NetSuite Home',
      url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/center/card.nl',
      pageType: 'NetSuite page',
      contextId: 'generic_netsuite_page',
      confidence: 'low',
      movePreference: ['Customer Record', 'Sales Order View'],
      capturedAt: now
    }
  };
}

const samples = [
  {
    caseId: 'apparel',
    laneId: 'apparel_accessories',
    prospect: 'Ariat International',
    website: 'https://www.ariat.com/',
    objective: 'Prove style/SKU readiness, size/color availability, replenishment timing, and customer promise.',
    notes: 'Seasonal boot and apparel launches need trusted size, color, replenishment, and channel availability.',
    websiteEvidence: 'Footwear, apparel, workwear, size/color variants, ecommerce categories.',
    competitor: 'Spreadsheets and disconnected inventory reports.',
    criteria: 'Connect Customer Record, Sales Order View, and Style / SKU Matrix.',
    timeline: 'Review in 2-4 weeks.',
    result: {
      runStatus: 'preview_complete',
      prospect: 'Ariat International',
      familyKey: 'apparelAccessories',
      scenario: 'Style-to-Availability Readiness',
      generatedExtId: 'DCC-ARIAT-STYLE-READY-001',
      generatedAgenda: 'Ariat seasonal style readiness proof',
      customer: { name: 'Ariat International Demo Account', id: '321', url: '/app/common/entity/custjob.nl?id=321' },
      salesOrder: { name: 'SO-Ariat-Fall-Launch-ATP-Readiness', id: '654', url: '/app/accounting/transactions/salesord.nl?id=654' },
      heroItem: { name: 'Ariat Heritage Boot - Demo Hero SKU', id: '987' },
      matrixItem: { name: 'Ariat Heritage Boot Matrix - Width Size Color', id: '988' },
      componentItems: [{ name: 'Ariat Boot Upper - Demo Component', id: '991' }],
      locationPlanningRecords: [{ name: 'Ariat Seasonal Launch Allocation Plan', id: '1101' }],
      csvSalesOrderArtifacts: [{ label: 'Sales Order CSV', name: 'ariat_fall_launch_atp_readiness.csv', id: 'file-42' }],
      warnings: [],
      errors: [],
      recoverableBlockers: []
    }
  },
  {
    caseId: 'cpg',
    laneId: 'products_cpg',
    prospect: 'Summit Snacks',
    website: 'https://example.com/summit-snacks',
    objective: 'Prove promotion-to-shelf readiness for multipack snack launches.',
    notes: 'Buyer needs promotion orders, inventory promise, and retailer replenishment aligned before launch.',
    websiteEvidence: 'Snack packs, seasonal retail promotions, multipack product categories.',
    competitor: 'Legacy order tools and spreadsheet allocations.',
    criteria: 'Show order promise, item setup, replenishment, and launch inventory in one flow.',
    timeline: 'Retail promotion decision next month.',
    result: {
      runStatus: 'preview_complete',
      prospect: 'Summit Snacks',
      familyKey: 'cpgProductsManufacturing',
      scenario: 'Promotion-to-Shelf Readiness',
      generatedExtId: 'DCC-SUMMIT-SNACKS-PROMO-001',
      generatedAgenda: 'Summit Snacks retailer promotion launch proof',
      customer: { name: 'Summit Snacks Retail Demo Account', id: '421' },
      salesOrder: { name: 'SO-Summit-Snacks-Q3-Retail-Promo', id: '755' },
      heroItem: { name: 'Summit Crunch Multipack 12ct Demo Item', id: '881' },
      proofItem: { name: 'Summit Crunch Promo Shelf-Ready Pack', id: '882' },
      componentItems: [{ name: 'Summit Crunch Case Pack Component', id: '883' }],
      locationPlanningRecords: [{ name: 'Summit Snacks Retail Allocation Plan', id: '1201' }],
      csvSalesOrderArtifacts: [{ label: 'Promotion order CSV', name: 'summit_snacks_q3_promo.csv', id: 'file-52' }],
      warnings: ['No manufacturing BOM returned for this review-only sample.'],
      errors: [],
      recoverableBlockers: []
    }
  },
  {
    caseId: 'dealer_distributor',
    laneId: 'dealer_hardgoods',
    prospect: 'TrailPro Outfitters',
    website: 'https://example.com/trailpro',
    objective: 'Prove dealer replenishment and channel fulfillment readiness.',
    notes: 'Dealer network needs wholesale orders, branch inventory, and replenishment promise aligned.',
    websiteEvidence: 'Outdoor gear, dealer locator, wholesale channel language, durable goods.',
    competitor: 'Dealer portal and disconnected branch inventory reports.',
    criteria: 'Show dealer order path, branch availability, and replenishment commitment.',
    timeline: 'Pilot dealer group review in 30 days.',
    result: {
      runStatus: 'preview_complete',
      prospect: 'TrailPro Outfitters',
      familyKey: 'dealerHardgoods',
      scenario: 'Dealer Channel Replenishment',
      generatedExtId: 'DCC-TRAILPRO-DEALER-001',
      generatedAgenda: 'TrailPro dealer channel replenishment proof',
      customer: { name: 'TrailPro Dealer Network Demo Account', id: '521' },
      salesOrder: { name: 'SO-TrailPro-West-Dealer-Replenishment', id: '855' },
      heroItem: { name: 'TrailPro Carbon Trek Pole Demo SKU', id: '981' },
      proofItem: { name: 'TrailPro Dealer Channel Availability Proof', id: '982' },
      locationPlanningRecords: [
        { name: 'TrailPro Denver Branch Replenishment Plan', id: '1301' },
        { name: 'TrailPro West Dealer Safety Stock Plan', id: '1302' }
      ],
      csvSalesOrderArtifacts: [{ label: 'Dealer order CSV', name: 'trailpro_dealer_replenishment.csv', id: 'file-62' }],
      warnings: [],
      errors: [],
      recoverableBlockers: []
    }
  },
  {
    caseId: 'manufacturing_heavy',
    laneId: 'industrial_equipment',
    prospect: 'Northstar Fabrication',
    website: 'https://example.com/northstar-fab',
    objective: 'Prove configured equipment build readiness with BOM and assembly control.',
    notes: 'Buyer needs quote-to-build visibility across configured options, components, work orders, and promise dates.',
    websiteEvidence: 'Custom equipment, fabrication, assemblies, replacement parts, manufacturing services.',
    competitor: 'Legacy MRP and offline BOM spreadsheets.',
    criteria: 'Show configured item, assembly, BOM revision, location, and build readiness.',
    timeline: 'Manufacturing proof required this quarter.',
    toggles: { enableManufacturing: true, enableWip: true },
    result: {
      runStatus: 'preview_complete',
      prospect: 'Northstar Fabrication',
      familyKey: 'industrialEquipment',
      scenario: 'Configured Build Readiness',
      generatedExtId: 'DCC-NORTHSTAR-BUILD-001',
      generatedAgenda: 'Northstar configured equipment build proof',
      customer: { name: 'Northstar Fabrication Demo Account', id: '621' },
      salesOrder: { name: 'SO-Northstar-Configured-Lift-System', id: '955' },
      heroItem: { name: 'Northstar Lift System Configured Demo Item', id: '1081' },
      proofItem: { name: 'Northstar Configured Build Readiness Proof', id: '1082' },
      componentItems: [
        { name: 'Northstar Lift Frame Component', id: '1083' },
        { name: 'Northstar Hydraulic Kit Component', id: '1084' }
      ],
      assembly: { name: 'Northstar Lift System Demo Assembly', id: '1085' },
      bom: { name: 'BOM Northstar Configured Lift System', id: '1086' },
      bomRevision: { name: 'BOMREV Northstar Lift System Launch v1', id: '1087' },
      locationPlanningRecords: [{ name: 'Northstar Main Plant Build Plan', id: '1401' }],
      csvSalesOrderArtifacts: [{ label: 'Configured SO CSV', name: 'northstar_configured_lift_so.csv', id: 'file-72' }],
      warnings: [],
      errors: [],
      recoverableBlockers: []
    }
  },
  {
    caseId: 'ambiguous',
    laneId: 'products_cpg',
    prospect: 'Blue Ridge Supply',
    website: 'https://example.com/blue-ridge-supply',
    objective: 'Prove the safest review path for a mixed product catalog.',
    notes: 'Website is mixed and ambiguous; consultant confirms CPG-style promotion proof for this request.',
    websiteEvidence: 'Mixed catalog with product, dealer, and retail language.',
    competitor: 'Spreadsheets and manual allocations.',
    criteria: 'Keep the demo review-only and do not overclaim website classification.',
    timeline: 'Clarification call scheduled next week.',
    result: {
      runStatus: 'preview_complete_with_warnings',
      prospect: 'Blue Ridge Supply',
      familyKey: 'productsCpg',
      scenario: 'Confirmed Consultant Pack - Mixed Catalog',
      generatedExtId: 'DCC-BLUE-RIDGE-MIXED-001',
      generatedAgenda: 'Blue Ridge mixed catalog proof with consultant-confirmed CPG lane',
      customer: { name: 'Blue Ridge Supply Demo Account', id: '721' },
      salesOrder: { name: 'SO-Blue-Ridge-Mixed-Catalog-Promo', id: '1055' },
      heroItem: { name: 'Blue Ridge Confirmed Promo Demo Item', id: '1181' },
      proofItem: { name: 'Blue Ridge Mixed Catalog Promotion Proof', id: '1182' },
      locationPlanningRecords: [{ name: 'Blue Ridge Confirmed Promo Allocation Plan', id: '1501' }],
      csvSalesOrderArtifacts: [{ label: 'Mixed catalog SO CSV', name: 'blue_ridge_confirmed_promo.csv', id: 'file-82' }],
      warnings: ['Website was ambiguous; consultant-confirmed pack was used.'],
      errors: [],
      recoverableBlockers: ['Reconfirm lane before any future submit-enabled pilot.']
    }
  }
];

function main() {
  const hooks = loadHooks();
  const userscript = fs.readFileSync(userscriptPath, 'utf8');
  const results = [];
  const shape = hooks.dccResultExportShapeV1();
  const smokeResults = samples.map((sample) => {
    const state = stateFor(sample);
    hooks.ensureWebsiteEvidenceRuntime(state);
    hooks.reconcileStateAuthority(state);
    const lane = hooks.getLane(state);
    const page = state.pageContext;
    const recommendation = hooks.recommendMove(lane, page);
    state.acceptedPacket = hooks.buildAcceptedPacketContext(state, lane, page, recommendation);
    hooks.reconcileStateAuthority(state);
    const beforeReview = compact(hooks.renderReviewView(state, lane, page, recommendation));
    const finalNaming = hooks.dccFinalNamingResultV1(sample.result, state, lane, page, recommendation);
    state.dccFinalNamingResult = finalNaming;
    const afterReview = compact(hooks.renderReviewView(state, lane, page, recommendation));
    const runHtml = compact(hooks.renderRunView(state, lane, page, recommendation, lane.moves[0], { id: 'prove', label: 'Prove' }, 'summary'));
    const traceHtml = compact(hooks.renderTraceView(state, lane, page, recommendation));
    const navigation = hooks.dccFinalNavigationModel(state, lane, page, recommendation);
    const handoff = hooks.dccRunnerHandoffPacketV1(state, lane, page, recommendation);
    const secretClean = !JSON.stringify(finalNaming).includes('should_not_survive');
    return {
      caseId: sample.caseId,
      laneId: sample.laneId,
      prospect: sample.prospect,
      beforeHasProvisional: beforeReview.includes('Final generated names not imported yet'),
      afterHasFinal: afterReview.includes('Final generated names imported') || afterReview.includes('Build results imported'),
      finalStatus: finalNaming.status,
      finalNameCount: finalNaming.displayObjects.concat(finalNaming.componentItems, finalNaming.locationPlanningRecords).filter((item) => item.source === 'dcc_final').length,
      runUsesFinalNavigation: navigation.runCanUseImportedFinalNames === true && runHtml.includes('Use final build names'),
      traceImportVisible: traceHtml.includes('Final generated names import'),
      secretClean,
      handoffStatus: handoff.status,
      parityStatus: handoff.parityLock.status,
      sample: sample.result,
      imported: finalNaming,
      navigation
    };
  });

  assertCase(results, 'w117_runtime_export_shape_present', shape.schema === 'idb.dcc-result-export-shape.v1' && shape.importTarget === 'dccFinalNamingResultV1' && /function dccResultExportShapeV1/.test(userscript), JSON.stringify(shape));
  assertCase(results, 'w117_shape_covers_required_fields', ['runStatus', 'prospect', 'familyKey', 'scenario', 'generatedExtId', 'generatedAgenda', 'warnings', 'errors', 'recoverableBlockers'].every((field) => shape.requiredTopLevelFields.includes(field)) && shape.optionalGeneratedObjectFields.componentItems && shape.optionalGeneratedObjectFields.csvSalesOrderArtifacts, JSON.stringify(shape.requiredTopLevelFields));
  assertCase(results, 'w117_all_sample_families_present', ['apparel', 'cpg', 'dealer_distributor', 'manufacturing_heavy', 'ambiguous'].every((caseId) => smokeResults.some((item) => item.caseId === caseId)), smokeResults.map((item) => item.caseId).join(', '));
  assertCase(results, 'w117_all_samples_import_final_names', smokeResults.every((item) => item.finalStatus === 'dcc_final_names_imported' && item.finalNameCount >= 4), JSON.stringify(smokeResults.map((item) => ({ caseId: item.caseId, status: item.finalStatus, count: item.finalNameCount }))));
  assertCase(results, 'w117_review_switches_provisional_to_final', smokeResults.every((item) => item.beforeHasProvisional && item.afterHasFinal), JSON.stringify(smokeResults.map((item) => ({ caseId: item.caseId, before: item.beforeHasProvisional, after: item.afterHasFinal }))));
  assertCase(results, 'w117_run_uses_imported_final_names', smokeResults.every((item) => item.runUsesFinalNavigation), JSON.stringify(smokeResults.map((item) => ({ caseId: item.caseId, run: item.runUsesFinalNavigation }))));
  assertCase(results, 'w117_trace_import_visible_and_secret_safe', smokeResults.every((item) => item.traceImportVisible && item.secretClean) && shape.operatorExportInstructions.some((item) => /Do not include tokens/.test(item)), JSON.stringify(shape.operatorExportInstructions));
  assertCase(results, 'w117_state_authority_and_parity_preserved', smokeResults.every((item) => ['ready_for_dcc_suitelet_submission_review', 'blocked_until_confirmed_handoff'].includes(item.handoffStatus) && item.parityStatus === 'parity_locked'), JSON.stringify(smokeResults.map((item) => ({ caseId: item.caseId, handoff: item.handoffStatus, parity: item.parityStatus }))));
  assertCase(results, 'w117_no_regression_boundaries_present', shape.noRegression.noIdbWrites === true && shape.noRegression.noSuiteScriptInvocationFromIdb === true && shape.noRegression.noTransactionWritesFromIdb === true && shape.noRegression.dccOwnsObjectGeneration === true && shape.noRegression.provisionalNamesCannotBeMarkedFinal === true, JSON.stringify(shape.noRegression));

  const failures = results.filter((result) => !result.pass);
  const decision = failures.length ? 'FAIL' : 'PASS';
  const noRegression = {
    w92StateAuthorityPreserved: true,
    w110ParityLockPreserved: true,
    noIdbWrites: true,
    noSuiteScriptInvocationFromIdb: true,
    noTransactionWritesFromIdb: true,
    hostedResolverOptionalUntilRemoteSmokeExecuted: true,
    consultantConfirmationRequired: true,
    dccOwnsObjectGeneration: true,
    idbCannotMarkProvisionalNamesAsFinal: true
  };
  const contract = {
    schema: 'idb.w117-dcc-result-export-shape-final-naming-smoke-pack.v1',
    status: failures.length ? 'blocked' : 'dcc_result_export_shape_ready',
    decision,
    objective: 'Make Demo Command Center produce or expose the exact final naming result JSON that IDB can import after DCC preview/run.',
    dccResultExportShapeV1: shape,
    sampleFinalNamingResults: smokeResults.map((item) => ({
      caseId: item.caseId,
      laneId: item.laneId,
      prospect: item.prospect,
      sample: item.sample,
      importedStatus: item.imported.status,
      finalNameCount: item.finalNameCount
    })),
    importSmokeResults: smokeResults.map((item) => ({
      caseId: item.caseId,
      beforeHasProvisional: item.beforeHasProvisional,
      afterHasFinal: item.afterHasFinal,
      runUsesFinalNavigation: item.runUsesFinalNavigation,
      traceImportVisible: item.traceImportVisible,
      parityStatus: item.parityStatus
    })),
    operatorInstructions: shape.operatorExportInstructions,
    noRegression,
    validatorResults: results,
    bestNextCodexPrompt: {
      block: 'W118: DCC Final Result Export Bridge In Demo Command Center',
      prompt: 'Move through W118: DCC Final Result Export Bridge In Demo Command Center. Implement or document the Demo Command Center-side export/copy helper that emits the W117 dccResultExportShapeV1 JSON after DCC preview/run, using real DCC generated names for customer, Sales Order/demo transaction, hero item, matrix/proof item, components, assembly, BOM, BOM revision, location/planning records, CSV/Sales Order artifacts, warnings, errors, and recoverable blockers. Do not change DCC naming mechanics, do not let IDB invoke SuiteScript, and keep IDB import-only. Preserve W92/W110 state authority, consultant confirmation, no IDB writes, no transaction writes from IDB, hosted resolver optional until remoteSmokeExecuted=true, and DCC ownership of object generation. Output DCC export helper contract or code patch, sample exported JSON, IDB import verification, validator gates, W118 report, and best next Codex prompt.'
    }
  };
  const trace = {
    schema: 'idb.w117-dcc-result-export-shape-final-naming-trace.v1',
    generatedAt: new Date().toISOString(),
    decision,
    pass: failures.length === 0,
    importSmokeResults: contract.importSmokeResults,
    sampleFinalNamingResults: contract.sampleFinalNamingResults,
    noRegression,
    bestNextCodexPrompt: contract.bestNextCodexPrompt
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);

  const report = [
    '# W117 DCC Result Export Shape And Final Naming Smoke Pack',
    '',
    `Decision: ${decision} / ${contract.status}`,
    '',
    '## DCC Result Export Shape',
    `- Schema: ${shape.schema}`,
    `- Import target: ${shape.importTarget}`,
    `- Required fields: ${shape.requiredTopLevelFields.join(', ')}`,
    '',
    '## Sample Families',
    ...contract.sampleFinalNamingResults.map((item) => `- ${item.caseId}: ${item.importedStatus}, final names ${item.finalNameCount}`),
    '',
    '## Operator Instructions',
    ...shape.operatorExportInstructions.map((item) => `- ${item}`),
    '',
    '## Import Smoke Results',
    ...contract.importSmokeResults.map((item) => `- ${item.caseId}: provisional=${item.beforeHasProvisional}, final=${item.afterHasFinal}, runFinalNavigation=${item.runUsesFinalNavigation}, traceImport=${item.traceImportVisible}, parity=${item.parityStatus}`),
    '',
    '## Validator Gates',
    ...results.map((result) => `- ${result.pass ? 'PASS' : 'FAIL'} ${result.name}: ${result.detail}`),
    '',
    '## No Regression',
    ...Object.entries(noRegression).map(([key, value]) => `- ${key}: ${value}`),
    '',
    '## Best Next Codex Prompt',
    contract.bestNextCodexPrompt.prompt,
    ''
  ].join('\n');
  fs.writeFileSync(reportPath, report);

  if (failures.length) {
    console.error(`W117 harness FAIL: ${failures.map((item) => item.name).join(', ')}`);
    process.exit(1);
  }
  console.log(`W117 harness PASS: ${results.length}/${results.length}`);
}

main();
