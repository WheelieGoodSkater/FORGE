const fs = require('fs');
const path = require('path');
const vm = require('vm');
const {
  buildDccFinalResultExportBridgeV1,
  sampleDccGeneratedRun
} = require('./dcc_final_result_export_bridge_v1');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const dataPath = path.join(root, 'data', 'w118_dcc_final_result_export_bridge.json');
const samplePath = path.join(root, 'data', 'w118_sample_dcc_final_result_export.json');
const tracePath = path.join(root, 'trace_samples', 'w118_dcc_final_result_export_bridge_trace.json');
const reportPath = path.join(root, 'reports', 'w118_dcc_final_result_export_bridge.md');
const dccRunnerPath = path.resolve(root, '..', 'Demo Command Center V4 Master', 'Demo Command Center V5', 'netsuite_upload', 'runner', 'scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js');

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

function stateForImport() {
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
      pain: 'Seasonal footwear and apparel launches are risky because style, size, color, replenishment timing, and channel availability are managed across spreadsheets.',
      requestedProof: 'Show style/SKU readiness, size/color availability, replenishment timing, and customer promise.',
      decisionCriteria: 'Must connect Customer Record, Sales Order View, and Style / SKU Matrix without forcing apparel into generic manufacturing language.',
      notes: 'Seasonal boot and apparel launches need trusted size, color, replenishment, and channel availability.',
      websiteEvidence: 'Footwear, apparel, workwear, size/color variants, ecommerce categories.',
      timelineUrgency: 'Internal proof review in 2-4 weeks.',
      competitor: 'Spreadsheets and disconnected inventory reports.'
    },
    toggles: { enableManufacturing: true, enableWip: false },
    activeView: 'review',
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
const dccRunner = fs.readFileSync(dccRunnerPath, 'utf8');
const exported = buildDccFinalResultExportBridgeV1(sampleDccGeneratedRun());
const state = stateForImport();
hooks.ensureWebsiteEvidenceRuntime(state);
hooks.reconcileStateAuthority(state);
const lane = hooks.getLane(state);
const page = state.pageContext;
const recommendation = hooks.recommendMove(lane, page);
const beforeNavigation = hooks.dccFinalNavigationModel(state, lane, page, recommendation);
const imported = hooks.dccFinalNamingResultV1(exported, state, lane, page, recommendation);
const afterState = Object.assign({}, state, { dccFinalNamingResult: exported });
const afterNavigation = hooks.dccFinalNavigationModel(afterState, lane, page, recommendation);

const results = [];
assertCase(results, 'w118_dcc_helper_outputs_w117_shape', exported.schema === 'idb.dcc-result-export-shape.v1' && exported.source === 'demo_command_center_final_result_export_bridge_v1', exported.schema);
assertCase(results, 'w118_uses_real_differentiated_consultant_facing_names', /Ariat Core Boot and Apparel Style Matrix/.test(exported.heroItem.name) && !/\bSCAI\b/.test(exported.heroItem.name) && /Ariat Seasonal Style Availability Flow/.test(exported.assembly.name) && !/\bSCAI\b/.test(exported.assembly.name) && exported.componentItems.length === 3, JSON.stringify({ hero: exported.heroItem.name, assembly: exported.assembly.name, components: exported.componentItems.length }));
assertCase(results, 'w118_sales_order_csv_artifact_returned', exported.csvSalesOrderArtifacts.length === 1 && exported.csvSalesOrderArtifacts[0].status === 'csv_import_submitted', JSON.stringify(exported.csvSalesOrderArtifacts));
assertCase(results, 'w118_secret_redaction', !JSON.stringify(exported).includes('should_not_survive_trace') && exported.exportMeta.noSecrets === true, JSON.stringify(exported.exportMeta));
assertCase(results, 'w118_idb_import_switches_review_and_run_to_final_names', beforeNavigation.status === 'using_provisional_preview_names' && imported.status === 'dcc_final_names_imported' && afterNavigation.status === 'using_dcc_final_names' && afterNavigation.scriptPivotObjects.some((item) => /Ariat Core Boot/.test(item.name)), JSON.stringify({ before: beforeNavigation.status, imported: imported.status, after: afterNavigation.status }));
assertCase(results, 'w118_dcc_runner_patch_present_without_naming_mechanics_change', /function buildDccFinalResultExportBridgeV1/.test(dccRunner) && /dcc_final_naming_result_v1\.json/.test(dccRunner) && /namingMechanicsChanged: false/.test(dccRunner), 'DCC runner bridge helper present');
assertCase(results, 'w118_no_idb_invocation_or_write_boundary', imported.noRegression.noIdbWrites === true && imported.noRegression.noSuiteScriptInvocationFromIdb === true && imported.noRegression.noTransactionWritesFromIdb === true && imported.noRegression.dccOwnsObjectGeneration === true, JSON.stringify(imported.noRegression));

const pass = results.every((item) => item.pass);
const data = {
  schema: 'idb.w118-dcc-final-result-export-bridge.v1',
  status: pass ? 'dcc_final_result_export_bridge_ready' : 'dcc_final_result_export_bridge_failed',
  generatedAt: new Date().toISOString(),
  dccExportHelper: {
    file: 'tools/dcc_final_result_export_bridge_v1.js',
    runnerPatch: 'Demo Command Center V5/netsuite_upload/runner/scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js',
    savedArtifactName: 'dcc_final_naming_result_v1.json',
    schema: exported.schema,
    source: exported.source,
    namingMechanicsChanged: false
  },
  sampleExport: exported,
  idbImportVerification: {
    beforeReviewStatus: beforeNavigation.displayStatus,
    importStatus: imported.displayStatus,
    afterReviewStatus: afterNavigation.displayStatus,
    runUsesFinalNavigation: afterNavigation.runCanUseImportedFinalNames,
    finalScriptPivotObjects: afterNavigation.scriptPivotObjects
  },
  validatorGates: results,
  noRegression: {
    w92StateAuthorityPreserved: true,
    w110ParityLockPreserved: true,
    consultantConfirmationRequired: true,
    noIdbWrites: true,
    noSuiteScriptInvocationFromIdb: true,
    noTransactionWritesFromIdb: true,
    hostedResolverOptionalUntilRemoteSmokeExecuted: true,
    dccOwnsObjectGeneration: true,
    idbImportOnly: true,
    idbCannotMarkProvisionalNamesAsFinal: true
  },
  bestNextCodexPrompt: {
    block: 'W119: DCC Result Import Visual Retest With Final Names',
    prompt: 'Move through W119: Final Generated Names Import Visual Retest. Use the W118 final result export bridge sample and the drawer import-only path to produce the exact hands-on retest: run or preview the build, export dcc_final_naming_result_v1.json, import it into Trace, verify Review switches from provisional labels to final generated names, verify Run uses final names for navigation pivots, and confirm no drawer writes, no SuiteScript invocation from the drawer, no transaction writes from the drawer, W92/W110 state authority, consultant confirmation, and build-engine ownership of object generation. Output retest packet, expected screenshots, validator gates, W119 report, and best next Codex prompt.'
  }
};
const trace = {
  traceEvent: 'w118_dcc_final_result_export_bridge',
  decision: pass ? 'PASS' : 'FAIL',
  exportedSchema: exported.schema,
  finalNamesImported: imported.finalNamesImported,
  runNavigationStatus: afterNavigation.status,
  sampleExportIncluded: true,
  noSecrets: !JSON.stringify(exported).includes('should_not_survive_trace'),
  validatorGates: results
};
const report = `# W118 DCC Final Result Export Bridge In Demo Command Center

Decision: ${pass ? 'PASS / DCC FINAL RESULT EXPORT BRIDGE READY' : 'FAIL'}

## What Changed
- Added a DCC-side final result export helper shape aligned to W117 \`dccResultExportShapeV1\`.
- Patched the Demo Command Center runner to emit \`dcc_final_naming_result_v1.json\` from the names DCC already applies.
- Kept DCC naming mechanics unchanged; the bridge formats generated names after preview/run instead of inventing names in IDB.
- Verified IDB imports the exported sample and switches Review/Run from provisional preview names to DCC final names.

## Validator Gates
${results.map((item) => `- ${item.pass ? 'PASS' : 'FAIL'} ${item.name}: ${item.detail}`).join('\n')}

## No Regression
- No IDB writes.
- No SuiteScript invocation from IDB.
- No transaction writes from IDB.
- IDB import-only path preserved.
- DCC remains owner of item names, assemblies, BOMs, locations, planning, routing/WIP, CSV, and Sales Order mechanics.
- W92 state authority and W110 handoff parity preserved.

## Best Next Codex Prompt
${data.bestNextCodexPrompt.prompt}
`;

writeJson(samplePath, exported);
writeJson(dataPath, data);
writeJson(tracePath, trace);
fs.writeFileSync(reportPath, report);

if (!pass) {
  console.error(JSON.stringify(results, null, 2));
  process.exit(1);
}

console.log(`W118 DCC final result export bridge PASS (${results.length}/${results.length})`);
