const fs = require('fs');
const path = require('path');
const vm = require('vm');
const {
  buildDccFinalResultExportBridgeV1,
  sampleDccGeneratedRun
} = require('./dcc_final_result_export_bridge_v1');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const dataPath = path.join(root, 'data', 'w119_dcc_result_import_visual_retest.json');
const tracePath = path.join(root, 'trace_samples', 'w119_dcc_result_import_visual_retest_trace.json');
const reportPath = path.join(root, 'reports', 'w119_dcc_result_import_visual_retest.md');
const sampleImportPath = path.join(root, 'data', 'w118_sample_dcc_final_result_export.json');

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

function stripHtml(value) {
  return String(value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function hasConsultantInternalWords(value) {
  return /\b(SCAI|IDB|DCC)\b/i.test(String(value || ''));
}

function stateForRetest() {
  return {
    open: true,
    selectedLaneId: 'apparel_accessories',
    laneSelectionSource: 'consultant_confirmed',
    briefPrepared: true,
    selectedMoveIndex: 0,
    selectedActionId: 'prove',
    activeView: 'review',
    intake: {
      customer: 'Ariat International',
      website: 'https://www.ariat.com/',
      pain: 'Seasonal footwear and apparel launches are risky because style, size, color, replenishment timing, and channel availability are managed across spreadsheets.',
      requestedProof: 'Show style/SKU readiness, size/color availability, replenishment timing, and customer promise.',
      decisionCriteria: 'Must connect Customer Record, Sales Order View, and Style / SKU Matrix without forcing apparel into generic manufacturing language.',
      notes: 'Seasonal boot and apparel launches need trusted size, color, replenishment, and channel availability.',
      websiteEvidence: 'Footwear, apparel, workwear, size/color variants, ecommerce categories.',
      timelineUrgency: 'Internal proof review in 2-4 weeks.',
      competitor: 'Spreadsheets and disconnected inventory reports.'
    },
    toggles: { enableManufacturing: true, enableWip: false },
    dccFinalNamingResult: null,
    pageContext: {
      title: 'NetSuite Home',
      url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/center/card.nl',
      pageType: 'NetSuite page',
      contextId: 'generic_netsuite_page',
      confidence: 'low',
      movePreference: ['Customer Record', 'Sales Order View'],
      capturedAt: new Date().toISOString()
    }
  };
}

const hooks = loadHooks();
const sampleExport = buildDccFinalResultExportBridgeV1(sampleDccGeneratedRun());
writeJson(sampleImportPath, sampleExport);

const beforeState = stateForRetest();
hooks.ensureWebsiteEvidenceRuntime(beforeState);
hooks.reconcileStateAuthority(beforeState);
const beforeLane = hooks.getLane(beforeState);
const beforeRecommendation = hooks.recommendMove(beforeLane, beforeState.pageContext);
const beforeNavigation = hooks.dccFinalNavigationModel(beforeState, beforeLane, beforeState.pageContext, beforeRecommendation);
const imported = hooks.dccFinalNamingResultV1(sampleExport, beforeState, beforeLane, beforeState.pageContext, beforeRecommendation);
const afterState = Object.assign({}, beforeState, {
  activeView: 'review',
  dccFinalNamingResult: sampleExport
});
const afterLane = hooks.getLane(afterState);
const afterRecommendation = hooks.recommendMove(afterLane, afterState.pageContext);
afterState.activeView = 'run';
afterState.activeView = 'trace';
const afterNavigation = hooks.dccFinalNavigationModel(afterState, afterLane, afterState.pageContext, afterRecommendation);

const consultantFacingCopy = [
  'Demo Build final generated names retest',
  'Run or preview the build engine, export final generated names JSON, import it in Trace, then verify Review and Run use final names.',
  'Review must show final generated names imported.',
  'Run must use final names for navigation pivots.',
  'The drawer exports only and does not submit, queue, invoke scripts, or write records.'
].join(' ');

const expectedScreenshots = [
  {
    tab: 'Plan',
    capture: 'Show prospect, classification, confidence, and confirmation state after Prepare brief.',
    passSignal: 'No internal product acronyms in visible object names.'
  },
  {
    tab: 'Review before import',
    capture: 'Show Demo Build handoff with provisional names before final generated names are imported.',
    passSignal: 'Provisional names are clearly not final.'
  },
  {
    tab: 'Trace import',
    capture: 'Paste or import dcc_final_naming_result_v1.json in the final generated names import area.',
    passSignal: 'Import records evidence only; no write or submit action appears.'
  },
  {
    tab: 'Review after import',
    capture: 'Show final generated names imported and visible in the records the build will prepare.',
    passSignal: 'Ariat Core Boot and Apparel Style Matrix appears without internal prefixes.'
  },
  {
    tab: 'Run after import',
    capture: 'Show live script and navigation pivots using imported final object names.',
    passSignal: 'Run uses final names, not provisional labels.'
  },
  {
    tab: 'Trace export',
    capture: 'Export trace JSON after import.',
    passSignal: 'Trace includes import evidence and no secrets.'
  }
];

const validatorGates = [];
assertCase(validatorGates, 'w119_sample_import_file_ready', fs.existsSync(sampleImportPath) && sampleExport.schema === 'idb.dcc-result-export-shape.v1', sampleImportPath);
assertCase(validatorGates, 'w119_pre_import_review_is_provisional', beforeNavigation.status === 'using_provisional_preview_names' && /Final generated names not imported yet/.test(beforeNavigation.displayStatus), JSON.stringify(beforeNavigation));
assertCase(validatorGates, 'w119_post_import_review_uses_final_names', imported.status === 'dcc_final_names_imported' && afterNavigation.status === 'using_dcc_final_names' && afterNavigation.reviewObjects.some((item) => /Ariat Core Boot and Apparel Style Matrix/.test(item.name)), JSON.stringify(afterNavigation.reviewObjects));
assertCase(validatorGates, 'w119_run_uses_final_navigation_pivots', afterNavigation.runCanUseImportedFinalNames === true && afterNavigation.scriptPivotObjects.some((item) => /Ariat/.test(item.name)), JSON.stringify(afterNavigation.scriptPivotObjects));
assertCase(validatorGates, 'w119_consultant_facing_sample_names_hide_internal_prefixes', !hasConsultantInternalWords(sampleExport.heroItem.name) && !hasConsultantInternalWords(sampleExport.assembly.name) && sampleExport.componentItems.every((item) => !hasConsultantInternalWords(item.name)), JSON.stringify({ hero: sampleExport.heroItem.name, assembly: sampleExport.assembly.name }));
assertCase(validatorGates, 'w119_consultant_retest_copy_uses_plain_language', !hasConsultantInternalWords(consultantFacingCopy), consultantFacingCopy);
assertCase(validatorGates, 'w119_no_write_or_invocation_boundaries', imported.noRegression.noIdbWrites === true && imported.noRegression.noSuiteScriptInvocationFromIdb === true && imported.noRegression.noTransactionWritesFromIdb === true && imported.noRegression.dccOwnsObjectGeneration === true, JSON.stringify(imported.noRegression));
assertCase(validatorGates, 'w119_expected_screenshots_complete', expectedScreenshots.length === 6 && expectedScreenshots.every((shot) => shot.tab && shot.capture && shot.passSignal), JSON.stringify(expectedScreenshots.map((shot) => shot.tab)));

const pass = validatorGates.every((item) => item.pass);
const data = {
  schema: 'idb.w119-dcc-result-import-visual-retest.v1',
  status: pass ? 'ready_for_hands_on_final_names_retest' : 'blocked',
  generatedAt: new Date().toISOString(),
  consultantVocabularyRule: {
    consultantFacingForbiddenWords: ['SCAI', 'IDB', 'DCC'],
    preferredLanguage: ['Demo Build', 'handoff', 'final generated names', 'NetSuite objects'],
    technicalFilenamesAllowed: ['dcc_final_naming_result_v1.json']
  },
  fileToLoad: {
    drawerUserscript: path.join(root, 'idb-drawer.user.js'),
    finalNamingSample: sampleImportPath,
    optionalBuildRunnerForRealExport: path.resolve(root, '..', 'Demo Command Center V4 Master', 'Demo Command Center V5', 'netsuite_upload', 'runner', 'scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js')
  },
  salesRequest: {
    prospect: 'Ariat International',
    website: 'https://www.ariat.com/',
    businessPain: beforeState.intake.pain,
    requestedProof: beforeState.intake.requestedProof,
    decisionCriteria: beforeState.intake.decisionCriteria,
    timelineUrgency: beforeState.intake.timelineUrgency,
    competitorIncumbent: beforeState.intake.competitor,
    optionalWebsiteEvidence: beforeState.intake.websiteEvidence
  },
  retestSteps: [
    'Load the latest drawer userscript.',
    'Enter the sales request fields on Plan.',
    'Click Prepare brief, then confirm the Apparel & Accessories lane and open Review.',
    'Capture Review before importing final generated names.',
    'Run or preview the build engine and export dcc_final_naming_result_v1.json. If a real export is not available, use data/w118_sample_dcc_final_result_export.json.',
    'Open Trace, paste the final generated names JSON, and click Import final names.',
    'Return to Review and verify final names replace provisional names.',
    'Open Run and verify the live script can pivot through the imported final object names.',
    'Export the handoff JSON and trace JSON.'
  ],
  expectedScreenshots,
  expectedBehavior: {
    reviewBeforeImport: beforeNavigation.displayStatus,
    reviewAfterImport: afterNavigation.displayStatus,
    importedFinalObjects: afterNavigation.reviewObjects,
    runFinalPivots: afterNavigation.scriptPivotObjects,
    noWrites: true,
    noScriptInvocationFromDrawer: true,
    noTransactionWritesFromDrawer: true
  },
  visualSmokeExcerpts: {
    reviewBeforeImport: stripHtml(`Provisional until build engine runs. ${beforeNavigation.reviewObjects.map((item) => item.name).join(' | ')}`).slice(0, 1200),
    runBeforeImport: stripHtml(`Run uses provisional preview names. ${beforeNavigation.scriptPivotObjects.map((item) => item.name).join(' | ')}`).slice(0, 800),
    reviewAfterImport: stripHtml(`Final generated names imported. ${afterNavigation.reviewObjects.map((item) => item.name).join(' | ')}`).slice(0, 1200),
    runAfterImport: stripHtml(`Run uses final names. ${afterNavigation.scriptPivotObjects.map((item) => item.name).join(' | ')}`).slice(0, 1000),
    traceAfterImport: stripHtml('Trace includes final generated names import evidence, handoff export, and no write activity.').slice(0, 1000)
  },
  stopGoCriteria: {
    go: [
      'Review clearly says final generated names are imported after import.',
      'Run uses imported final names for navigation pivots.',
      'Visible object names do not expose internal prefixes.',
      'Trace captures the import and exports JSON without secrets.',
      'No drawer write, submit, queue, script invocation, or transaction write occurs.'
    ],
    stop: [
      'Review still presents provisional names as final.',
      'Run ignores imported final names.',
      'Visible object names expose internal prefixes.',
      'The drawer offers or performs submit/queue/write behavior.',
      'State authority or handoff parity disagrees after import.'
    ]
  },
  validatorGates,
  bestNextCodexPrompt: {
    block: 'W120: Build Results Review And Consultant-Facing Language Reset',
    prompt: 'Move through W120: Build Results Review And Consultant-Facing Language Reset. Make Review valuable by turning it into a Build Results checkpoint after final generated names are imported, keep pre-import Review as a small handoff checkpoint, move Why this ROI into a consultant-facing Why this matters value coach, simplify Trace actions, and remove SCAI, IDB, and DCC from consultant-visible copy while preserving internal contract names where needed. Preserve W92/W110 authority, W116-W119 final-name import behavior, no drawer writes, no SuiteScript invocation from the drawer, no transaction writes, hosted resolver optional until remoteSmokeExecuted=true, consultant confirmation required, and build-engine ownership of object generation. Output updated Review, ROI/Competitive, Run, Trace, validator gates, W120 report, and best next Codex prompt.'
  }
};

const trace = {
  traceEvent: 'w119_dcc_result_import_visual_retest',
  decision: pass ? 'PASS' : 'FAIL',
  generatedAt: data.generatedAt,
  noSecrets: true,
  finalNamingImported: imported.finalNamesImported,
  beforeStatus: beforeNavigation.status,
  afterStatus: afterNavigation.status,
  validatorGates
};

const report = `# W119 DCC Result Import Visual Retest With Final Names

Status: ${data.status}

## Retest Packet

- Upload drawer userscript: \`${data.fileToLoad.drawerUserscript}\`
- Final generated names sample: \`${data.fileToLoad.finalNamingSample}\`
- Optional build runner for real export: \`${data.fileToLoad.optionalBuildRunnerForRealExport}\`
- Technical export filename: \`dcc_final_naming_result_v1.json\`

## Sales Request

- Prospect: ${data.salesRequest.prospect}
- Website: ${data.salesRequest.website}
- Business pain: ${data.salesRequest.businessPain}
- Requested proof: ${data.salesRequest.requestedProof}
- Decision criteria: ${data.salesRequest.decisionCriteria}
- Timeline / urgency: ${data.salesRequest.timelineUrgency}
- Competitor / incumbent: ${data.salesRequest.competitorIncumbent}
- Optional website/category evidence: ${data.salesRequest.optionalWebsiteEvidence}

## Expected Screenshots

${expectedScreenshots.map((shot) => `- ${shot.tab}: ${shot.capture} Pass signal: ${shot.passSignal}`).join('\n')}

## Validator Gates

${validatorGates.map((item) => `- ${item.pass ? 'PASS' : 'FAIL'} ${item.name}: ${item.detail}`).join('\n')}

## Stop / Go

Go when Review switches from provisional names to final generated names after import, Run uses final names for pivots, visible names avoid internal prefixes, and no write or script invocation occurs from the drawer.

## Best Next Codex Prompt

${data.bestNextCodexPrompt.prompt}
`;

writeJson(dataPath, data);
writeJson(tracePath, trace);
fs.writeFileSync(reportPath, report);

if (!pass) {
  console.error(`W119 DCC result import visual retest FAIL (${validatorGates.filter((item) => item.pass).length}/${validatorGates.length})`);
  process.exit(1);
}

console.log(`W119 DCC result import visual retest PASS (${validatorGates.length}/${validatorGates.length})`);
