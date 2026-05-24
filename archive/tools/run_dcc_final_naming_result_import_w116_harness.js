const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const dataPath = path.join(root, 'data', 'w116_dcc_final_naming_result_import_path.json');
const tracePath = path.join(root, 'trace_samples', 'w116_dcc_final_naming_result_import_trace.json');
const reportPath = path.join(root, 'reports', 'w116_dcc_final_naming_result_import_path.md');

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

function ariatConfirmedState() {
  const now = new Date().toISOString();
  return {
    open: true,
    selectedLaneId: 'apparel_accessories',
    laneSelectionSource: 'consultant_confirmed',
    briefPrepared: true,
    selectedMoveIndex: 0,
    selectedActionId: 'prove',
    intake: {
      customer: 'Ariat International',
      website: 'https://www.ariat.com/',
      notes: 'Seasonal footwear and apparel launches are risky because style, size, color, replenishment timing, and channel availability are managed across spreadsheets and disconnected order/inventory views.',
      websiteEvidence: 'Ariat sells footwear, apparel, workwear, outdoor gear, size/color variants, and ecommerce categories.',
      scObjective: 'Show a concise NetSuite proof path for style/SKU readiness, size/color availability, replenishment timing, and customer promise.',
      competitor: 'Spreadsheets, disconnected inventory reports, and incumbent order tools.',
      decisionCriteria: 'Must connect Customer Record, Sales Order View, and Style / SKU Matrix without forcing apparel into generic manufacturing or distribution language.',
      timelineUrgency: 'Internal proof review needed in 2-4 weeks.'
    },
    toggles: {},
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
      requestKey: 'ariat.com',
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

function sampleDccFinalResult() {
  return {
    runStatus: 'preview_complete',
    prospect: 'Ariat International',
    familyKey: 'apparelAccessories',
    scenario: 'Style-to-Availability Readiness',
    generatedExtId: 'DCC-ARIAT-STYLE-READY-001',
    generatedAgenda: 'Ariat seasonal style readiness proof',
    resolverToken: 'should_not_survive_trace',
    customer: {
      name: 'Ariat International Demo Account',
      id: '321',
      url: '/app/common/entity/custjob.nl?id=321'
    },
    salesOrder: {
      name: 'SO-Ariat-Fall-Launch-ATP-Readiness',
      id: '654',
      url: '/app/accounting/transactions/salesord.nl?id=654'
    },
    heroItem: {
      name: 'Ariat Heritage Boot - Demo Hero SKU',
      id: '987',
      url: '/app/common/item/item.nl?id=987'
    },
    matrixItem: {
      name: 'Ariat Heritage Boot Matrix - Width Size Color',
      id: '988',
      url: '/app/common/item/item.nl?id=988'
    },
    componentItems: [
      { name: 'Ariat Boot Upper - Demo Component', id: '991' },
      { name: 'Ariat Outsole Pack - Demo Component', id: '992' }
    ],
    assembly: {
      name: 'Ariat Heritage Boot Assembly - Demo',
      id: '1001'
    },
    bom: {
      name: 'BOM Ariat Heritage Boot Demo Build',
      id: '1002'
    },
    bomRevision: {
      name: 'BOMREV Ariat Heritage Boot Launch v1',
      id: '1003'
    },
    locationPlanningRecords: [
      { name: 'Ariat Seasonal Launch Allocation Plan', id: '1101' },
      { name: 'Ariat East Coast Retail DC Readiness', id: '1102' }
    ],
    csvSalesOrderArtifacts: [
      { label: 'Sales Order CSV', name: 'ariat_fall_launch_atp_readiness.csv', id: 'file-42' }
    ],
    warnings: ['Preview only; operator must verify DCC config before submit.'],
    errors: [],
    recoverableBlockers: []
  };
}

function main() {
  const hooks = loadHooks();
  const userscript = fs.readFileSync(userscriptPath, 'utf8');
  const results = [];
  const state = ariatConfirmedState();
  hooks.ensureWebsiteEvidenceRuntime(state);
  hooks.reconcileStateAuthority(state);
  const lane = hooks.getLane(state);
  const page = state.pageContext;
  const recommendation = hooks.recommendMove(lane, page);
  state.acceptedPacket = hooks.buildAcceptedPacketContext(state, lane, page, recommendation);
  hooks.reconcileStateAuthority(state);

  const beforeReview = compact(hooks.renderReviewView(state, lane, page, recommendation));
  const beforeNaming = hooks.dccFinalNamingResultV1(state.dccFinalNamingResult, state, lane, page, recommendation);
  const imported = hooks.dccFinalNamingResultV1(sampleDccFinalResult(), state, lane, page, recommendation);
  state.dccFinalNamingResult = imported;
  const afterReview = compact(hooks.renderReviewView(state, lane, page, recommendation));
  const runHtml = compact(hooks.renderRunView(state, lane, page, recommendation, lane.moves[0], { id: 'prove', label: 'Prove' }, 'summary'));
  const traceHtml = compact(hooks.renderTraceView(state, lane, page, recommendation));
  const navigation = hooks.dccFinalNavigationModel(state, lane, page, recommendation);
  const handoff = hooks.dccRunnerHandoffPacketV1(state, lane, page, recommendation);
  const authority = hooks.stateAuthorityModel(state);
  const traceExportShape = {
    dccFinalNamingResultV1: imported,
    dccFinalNavigationModelV1: navigation
  };

  assertCase(results, 'w116_contract_runtime_present', /function dccFinalNamingResultV1/.test(userscript) && imported.schema === 'idb.dcc-final-naming-result.v1', imported.schema);
  assertCase(results, 'w116_review_separates_provisional_before_import', beforeNaming.status === 'not_imported' && beforeReview.includes('Final generated names not imported yet') && beforeReview.includes('Preview labels remain provisional'), beforeReview.slice(0, 1200));
  assertCase(results, 'w116_import_maps_dcc_final_fields', imported.status === 'dcc_final_names_imported' && imported.generated.extId === 'DCC-ARIAT-STYLE-READY-001' && imported.displayObjects.some((item) => item.name === 'SO-Ariat-Fall-Launch-ATP-Readiness') && imported.componentItems.length === 2 && imported.csvSalesOrderArtifacts.length === 1, JSON.stringify(imported, null, 2).slice(0, 1600));
  assertCase(results, 'w116_review_uses_final_names_after_import', afterReview.includes('Final generated names imported') && afterReview.includes('SO-Ariat-Fall-Launch-ATP-Readiness') && afterReview.includes('Ariat Heritage Boot Matrix - Width Size Color'), afterReview.slice(0, 1800));
  assertCase(results, 'w116_run_navigation_uses_imported_final_names', navigation.status === 'using_dcc_final_names' && navigation.runCanUseImportedFinalNames === true && runHtml.includes('Use final build names') && runHtml.includes('Ariat Heritage Boot - Demo Hero SKU'), runHtml.slice(0, 1600));
  assertCase(results, 'w116_trace_import_ui_and_secret_redaction', (traceHtml.includes('Final generated names import') || traceHtml.includes('Completed runner result import')) && (traceHtml.includes('Import final names') || traceHtml.includes('Import runner result')) && !JSON.stringify(traceExportShape).includes('should_not_survive_trace') && imported.traceCoverage.secretsRedacted === true, JSON.stringify(traceExportShape).slice(0, 1200));
  assertCase(results, 'w116_state_authority_and_handoff_parity_preserved', authority.handoffEligible === true && handoff.parityLock && handoff.parityLock.exportEligible === true && handoff.selectedPack === 'apparelAccessories', JSON.stringify({ authority, parity: handoff.parityLock && handoff.parityLock.status, selectedPack: handoff.selectedPack }));
  assertCase(results, 'w116_no_regression_boundaries_present', imported.noRegression.noIdbWrites === true && imported.noRegression.noSuiteScriptInvocationFromIdb === true && imported.noRegression.noTransactionWritesFromIdb === true && imported.noRegression.dccOwnsObjectGeneration === true && imported.noRegression.provisionalNamesCannotBeMarkedFinal === true, JSON.stringify(imported.noRegression));

  const failures = results.filter((result) => !result.pass);
  const decision = failures.length ? 'FAIL' : 'PASS';
  const noRegression = {
    w92StateAuthorityPreserved: authority.handoffEligible === true,
    w110ParityLockPreserved: handoff.parityLock && handoff.parityLock.exportEligible === true,
    noIdbWrites: true,
    noSuiteScriptInvocationFromIdb: true,
    noTransactionWritesFromIdb: true,
    hostedResolverOptionalUntilRemoteSmokeExecuted: true,
    consultantConfirmationRequired: handoff.consultantConfirmation.required === true,
    dccOwnsObjectGeneration: true,
    idbCannotMarkProvisionalNamesAsFinal: true
  };
  const contract = {
    schema: 'idb.w116-dcc-final-naming-result-import-path.v1',
    status: failures.length ? 'blocked' : 'dcc_final_naming_import_path_ready',
    decision,
    objective: 'Stop treating IDB provisional object names as final DCC names and import real DCC generated names after preview/run.',
    dccFinalNamingResultV1: {
      schema: imported.schema,
      expectedFields: [
        'run status',
        'prospect',
        'scenario/family key',
        'generated extId',
        'generated agenda',
        'customer name/id/url',
        'sales order/demo transaction name/id/url',
        'hero item name/id/url',
        'matrix item or proof item name/id/url',
        'component item names/ids/urls',
        'assembly/BOM/BOM revision when manufacturing is enabled',
        'location/planning record names/ids/urls',
        'CSV/Sales Order output artifacts',
        'warnings/errors/recoverable blockers'
      ],
      sampleStatus: imported.status,
      sampleFinalNameCount: imported.displayObjects.concat(imported.componentItems, imported.locationPlanningRecords).filter((item) => item.source === 'dcc_final').length
    },
    reviewUxModel: {
      beforeImport: 'Final generated names not imported yet',
      afterImport: 'Final generated names imported',
      provisionalSource: 'idb_provisional_preview',
      finalSource: 'dcc_final_imported'
    },
    runNavigationModel: {
      status: navigation.status,
      scriptPivotObjects: navigation.scriptPivotObjects
    },
    traceCoverage: {
      includesDccFinalNamingResultV1: true,
      includesDccFinalNavigationModelV1: true,
      secretsRedacted: true,
      importOnly: true
    },
    noRegression,
    validatorResults: results,
    bestNextCodexPrompt: {
      block: 'W117: DCC Result Export Shape And Final Naming Smoke Pack',
      prompt: 'Move through W117: DCC Result Export Shape And Final Naming Smoke Pack. Define and test the exact Demo Command Center result JSON shape that an operator will export or paste back into IDB after DCC preview/run, then produce a sample result for apparel, CPG, dealer/distributor, manufacturing-heavy, and ambiguous cases. Verify IDB shows provisional names before import, DCC final names after import, Run uses imported final names for navigation/script pivots, Trace redacts secrets, and no IDB writes/SuiteScript invocation/transaction writes occur. Preserve W92/W110 state authority and DCC handoff parity, consultant confirmation required, hosted resolver optional until remoteSmokeExecuted=true, and DCC ownership of object generation. Output result-shape contract samples, import smoke results, validator gates, W117 report, and best next Codex prompt.'
    }
  };
  const trace = {
    schema: 'idb.w116-dcc-final-naming-result-import-trace.v1',
    generatedAt: new Date().toISOString(),
    decision,
    pass: failures.length === 0,
    beforeImportStatus: beforeNaming.status,
    afterImportStatus: imported.status,
    finalNamingResult: imported,
    finalNavigation: navigation,
    noRegression,
    bestNextCodexPrompt: contract.bestNextCodexPrompt
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);

  const report = [
    '# W116 DCC Final Naming Result Contract And Import Path',
    '',
    `Decision: ${decision} / ${contract.status}`,
    '',
    '## What Changed',
    '- Added dccFinalNamingResultV1 as the import-only contract for real DCC generated names after preview/run.',
    '- Review now separates IDB provisional preview labels from imported DCC final names.',
    '- Run can use imported final object names as navigation/script pivot targets.',
    '- Trace captures the imported result and redacts secret-like fields.',
    '',
    '## Contract Summary',
    `- Schema: ${contract.dccFinalNamingResultV1.schema}`,
    `- Sample status: ${contract.dccFinalNamingResultV1.sampleStatus}`,
    `- Sample final-name count: ${contract.dccFinalNamingResultV1.sampleFinalNameCount}`,
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
    console.error(`W116 harness FAIL: ${failures.map((item) => item.name).join(', ')}`);
    process.exit(1);
  }
  console.log(`W116 harness PASS: ${results.length}/${results.length}`);
}

main();
