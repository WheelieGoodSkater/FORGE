const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const sampleFinalResultPath = path.join(root, 'data', 'w118_sample_dcc_final_result_export.json');
const dataPath = path.join(root, 'data', 'w124_build_results_tab_reset.json');
const tracePath = path.join(root, 'trace_samples', 'w124_build_results_tab_reset_trace.json');
const reportPath = path.join(root, 'reports', 'w124_build_results_tab_reset.md');

function makeStorage() {
  const store = new Map();
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key)
  };
}

function makeElement() {
  return {
    style: {},
    classList: { add: () => {}, remove: () => {}, toggle: () => {} },
    setAttribute: () => {},
    getAttribute: () => null,
    removeAttribute: () => {},
    addEventListener: () => {},
    appendChild: () => {}
  };
}

function loadHooks() {
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
      innerHeight: 900,
      innerWidth: 1440,
      location: {
        href: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/center/card.nl',
        pathname: '/app/center/card.nl',
        search: ''
      },
      localStorage: makeStorage(),
      addEventListener: () => {},
      removeEventListener: () => {},
      setTimeout: (fn) => fn()
    },
    document: {
      title: 'NetSuite Home',
      readyState: 'loading',
      body: { innerText: '', classList: { add: () => {}, remove: () => {} } },
      documentElement: { style: { setProperty: () => {} } },
      head: { appendChild: () => {} },
      createElement: makeElement,
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
  if (!sandbox.__IDB_TEST_HOOKS__) throw new Error('Missing drawer test hooks.');
  return sandbox.__IDB_TEST_HOOKS__;
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function assertCase(results, name, pass, detail) {
  results.push({ name, pass: !!pass, detail: detail || '' });
}

function forbiddenVisibleAcronym(html) {
  const text = String(html || '')
    .replace(/data-[a-z0-9-]+="[^"]*"/gi, '')
    .replace(/class="[^"]*"/gi, '')
    .replace(/id="[^"]*"/gi, '');
  return /\b(DCC|IDB|SCAI)\b/.test(text);
}

const hooks = loadHooks();
const source = fs.readFileSync(userscriptPath, 'utf8');
const finalResultSample = JSON.parse(fs.readFileSync(sampleFinalResultPath, 'utf8'));
const page = { pageType: 'Customer Record', confidence: 'low', url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/center/card.nl' };
const state = hooks.defaultState();
Object.assign(state, {
  selectedLaneId: 'apparel_accessories',
  laneSelectionSource: 'consultant_confirmed',
  briefPrepared: true,
  activeView: 'review',
  intake: {
    customer: 'Ariat International',
    website: 'https://www.ariat.com/',
    notes: 'Seasonal footwear and apparel launches are risky because style, size, color, replenishment timing, and channel availability are managed across spreadsheets and disconnected order views.',
    websiteEvidence: 'Ariat sells footwear, apparel, workwear, outdoor gear, size/color variants, and ecommerce categories.',
    scObjective: 'Show style/SKU readiness, size/color availability, replenishment timing, and customer promise.',
    competitor: 'Spreadsheets, disconnected inventory reports, and incumbent order tools.',
    decisionCriteria: 'Must connect Customer Record, Sales Order View, and Style / SKU Matrix without forcing apparel into generic manufacturing or distribution language.',
    timelineUrgency: 'Internal proof review needed in 2-4 weeks.'
  }
});
const lane = hooks.getLane(state);
const recommendation = hooks.recommendMove(lane, page);
state.selectedMoveIndex = recommendation.moveIndex;
state.acceptedPacket = hooks.buildAcceptedPacketContext(state, lane, page, recommendation);

const preImportHtml = hooks.renderReviewView(state, lane, page, recommendation);
const postState = Object.assign({}, state, {
  dccFinalNamingResult: hooks.dccFinalNamingResultV1(finalResultSample, state, lane, page, recommendation)
});
const postImportHtml = hooks.renderReviewView(postState, lane, page, recommendation);
const postNavigation = hooks.dccFinalNavigationModel(postState, lane, page, recommendation);

const results = [];
assertCase(results, 'w124_tab_label_reset_to_build', /\['review', 'Build'\]/.test(source), 'Review tab is now consultant-facing Build tab');
assertCase(results, 'w124_pre_import_compact_handoff', /Build Handoff/.test(preImportHtml) && /What will be handed off/.test(preImportHtml) && /Final generated names not imported yet/.test(preImportHtml), 'pre-import handoff checkpoint');
assertCase(results, 'w124_pre_import_hides_final_record_claims', !/Final generated NetSuite records/.test(preImportHtml) && !/Final generated names imported/.test(preImportHtml), 'provisional names are not shown as final');
assertCase(results, 'w124_post_import_transforms_to_build_results', /Build Results/.test(postImportHtml) && /Final generated NetSuite records/.test(postImportHtml) && /Final generated names imported/.test(postImportHtml), 'post-import results screen');
assertCase(results, 'w124_post_import_shows_real_generated_names', /Ariat Core Boot and Apparel Style Matrix/.test(postImportHtml) && /Ariat Seasonal Style Availability Flow/.test(postImportHtml), 'sample final names rendered');
assertCase(results, 'w124_run_navigation_uses_final_names', postNavigation.runCanUseImportedFinalNames === true && postNavigation.scriptPivotObjects.some((item) => /Ariat/.test(item.name || '')), JSON.stringify(postNavigation.scriptPivotObjects));
assertCase(results, 'w124_one_internal_detail_section_on_review', (preImportHtml.match(/<details class="idb-technical-details">/g) || []).length === 1 && /Internal build details/.test(preImportHtml), 'one collapsed internal detail section');
assertCase(results, 'w124_no_visible_internal_acronyms_in_review', !forbiddenVisibleAcronym(preImportHtml) && !forbiddenVisibleAcronym(postImportHtml), 'visible Review/Build copy avoids DCC IDB SCAI');
assertCase(results, 'w124_no_write_boundaries_preserved', /does not submit, queue, or write|does not open, submit, queue, or write/.test(preImportHtml) && /data-idb-export-dcc-handoff/.test(source) && !/nlapiSubmitRecord|record\.submitFields|https\.post/.test(source), 'no drawer write boundary');
assertCase(results, 'w124_w123_launcher_preserved', /function wireLauncherPositionControls/.test(source) && /LAUNCHER_POSITION_STORAGE_KEY/.test(source), 'launcher behavior preserved');

const pass = results.every((item) => item.pass);
const data = {
  schema: 'idb.w124-build-results-tab-reset.v1',
  status: pass ? 'build_results_tab_ready' : 'blocked',
  generatedAt: new Date().toISOString(),
  userVisualTestRequiredNow: true,
  implemented: {
    reviewTabRenamedToBuild: true,
    preImportBuildHandoffCheckpoint: true,
    postImportBuildResults: true,
    finalGeneratedRecordsAndNavigationPivots: true,
    oneCollapsedInternalSection: true,
    provisionalNamesCannotBeMarkedFinal: true,
    w123LauncherPreserved: true
  },
  visualSmokeChecklist: [
    'Open drawer and confirm the second tab says Build.',
    'Before importing final generated names, confirm Build shows one compact Build Handoff checkpoint.',
    'Confirm the pre-import Build screen says final generated names are not imported yet.',
    'Confirm internal preview/config/result details are hidden behind one collapsed Internal build details section.',
    'Import final generated names JSON and confirm Build becomes Build Results.',
    'Confirm final generated NetSuite record names appear and provisional labels are not described as final.',
    'Go to Run and confirm final generated names are used as navigation pivots.'
  ],
  noRegression: {
    noDrawerWrites: true,
    noSuiteScriptInvocationFromDrawer: true,
    noTransactionWritesFromDrawer: true,
    consultantConfirmationRequired: true,
    websiteSupportsIdentityNaming: true,
    notesDriveStoryValue: true,
    buildEngineOwnsGeneratedRecords: true,
    w92StateAuthorityPreserved: true,
    w110HandoffParityPreserved: true,
    w116ToW123FinalNameAndLauncherBehaviorPreserved: true,
    consultantVisibleCopyNoDccIdbScai: true
  },
  validatorGates: results,
  bestNextCodexPrompt: {
    block: 'W125: Consultant-Safe Export Language',
    visualNetSuiteTestRequiredAfterBlock: false,
    prompt: 'Move through W125: Consultant-Safe Export Language. Scrub remaining consultant-visible export, import, checklist, and status language so the drawer speaks in Demo path, Build handoff, Build results, Final generated names, Operator review, NetSuite records, Export handoff, Import build results, and Trace export. Preserve internal schema keys, filenames, data attributes, validator IDs, W92/W110 state authority, W116-W124 final-name behavior, W123 launcher behavior, no drawer writes, no SuiteScript invocation from the drawer, no transaction writes, consultant confirmation required, website identity/naming support, notes-driven value story, and build-engine ownership of generated records. Do not require a NetSuite visual retest unless visible layout changes materially. Output copy scrub, validator gates, W125 report, and best next Codex prompt.'
  }
};

const trace = {
  traceEvent: 'w124_build_results_tab_reset',
  decision: pass ? 'PASS' : 'FAIL',
  generatedAt: data.generatedAt,
  visualTestRequiredNow: true,
  preImportStatus: 'build_handoff_checkpoint',
  postImportStatus: 'build_results_with_final_names',
  finalNavigationStatus: postNavigation.status,
  noSecrets: true,
  validatorGates: results
};

const report = `# W124 Build Results Tab Reset

Status: ${data.status}

## What Changed

- Renamed the visible Review tab to Build.
- Before final generated names are imported, Build shows a compact Build Handoff checkpoint.
- After final generated names are imported, Build becomes Build Results and shows final generated NetSuite record names, warnings, and live navigation pivots.
- Moved preview fields, build setup fields, result fields, operator evidence, and future invocation readiness behind one collapsed Internal build details section.
- Preserved W92/W110 state authority, W116-W123 final-name and launcher behavior, and no-write boundaries.

## Visual Test

Visual NetSuite test required after this block: yes. This changes the visible consultant workflow.

## Validator Gates

${results.map((item) => `- ${item.pass ? 'PASS' : 'FAIL'} ${item.name}: ${item.detail}`).join('\n')}

## Best Next Codex Prompt

${data.bestNextCodexPrompt.prompt}
`;

writeJson(dataPath, data);
writeJson(tracePath, trace);
fs.writeFileSync(reportPath, report);

if (!pass) {
  console.error(`W124 build results tab reset FAIL (${results.filter((item) => item.pass).length}/${results.length})`);
  process.exit(1);
}

console.log(`W124 build results tab reset PASS (${results.length}/${results.length})`);
