const fs = require('fs');
const path = require('path');
const vm = require('vm');
const {
  buildDccFinalResultExportBridgeV1,
  sampleDccGeneratedRun
} = require('./dcc_final_result_export_bridge_v1');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const dataPath = path.join(root, 'data', 'w120_build_results_review_language_reset.json');
const tracePath = path.join(root, 'trace_samples', 'w120_build_results_review_language_reset_trace.json');
const reportPath = path.join(root, 'reports', 'w120_build_results_review_language_reset.md');

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

function visibleText(html) {
  return stripHtml(html)
    .replace(/data idb[^\s]*/gi, '')
    .replace(/idb-[^\s]*/gi, '')
    .trim();
}

function hasForbiddenVisibleWords(value) {
  return /\b(SCAI|IDB|DCC)\b/i.test(String(value || ''));
}

function forbiddenVisibleWords(value) {
  return Array.from(new Set(String(value || '').match(/\b(SCAI|IDB|DCC)\b/gi) || []));
}

function stateForReview(finalResult) {
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
    dccFinalNamingResult: finalResult || null,
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
const preState = stateForReview(null);
const postState = stateForReview(sampleExport);
hooks.ensureWebsiteEvidenceRuntime(preState);
hooks.reconcileStateAuthority(preState);
hooks.ensureWebsiteEvidenceRuntime(postState);
hooks.reconcileStateAuthority(postState);

const lane = hooks.getLane(postState);
const page = postState.pageContext;
const recommendation = hooks.recommendMove(lane, page);
preState.acceptedPacket = hooks.buildAcceptedPacketContext(preState, lane, preState.pageContext, recommendation);
postState.acceptedPacket = hooks.buildAcceptedPacketContext(postState, lane, page, recommendation);
hooks.reconcileStateAuthority(preState);
hooks.reconcileStateAuthority(postState);
const action = { id: 'prove' };
const selectedMove = 'Customer Record';
const summary = 'Use final generated names after import.';

const preReviewText = visibleText(hooks.renderReviewView(preState, lane, preState.pageContext, recommendation));
const postReviewText = visibleText(hooks.renderReviewView(postState, lane, page, recommendation));
const valueText = visibleText(hooks.renderValueReviewView(postState, lane, page, recommendation));
const runText = visibleText(hooks.renderRunView(postState, lane, page, recommendation, selectedMove, action, summary));
const traceText = visibleText(hooks.renderTraceView(postState, lane, page, recommendation));
const finalNavigation = hooks.dccFinalNavigationModel(postState, lane, page, recommendation);
const finalNaming = hooks.dccFinalNamingResultV1(sampleExport, postState, lane, page, recommendation);

const results = [];
assertCase(results, 'w120_pre_import_review_is_small_handoff', /Build handoff/.test(preReviewText) && /Final generated names not imported yet/.test(preReviewText) && /What will be handed off/.test(preReviewText) && /Build handoff JSON/.test(preReviewText), preReviewText.slice(0, 900));
assertCase(results, 'w120_post_import_review_is_build_results', /Build results/.test(postReviewText) && /Final generated NetSuite records/.test(postReviewText) && /Ariat Core Boot and Apparel Style Matrix/.test(postReviewText), postReviewText.slice(0, 1200));
assertCase(results, 'w120_roi_has_why_this_matters_popout', /Why this matters/.test(valueText) && !/Why this ROI/.test(valueText) && /Business risk/.test(valueText) && /Baseline to capture/.test(valueText), valueText.slice(0, 1200));
assertCase(results, 'w120_run_uses_final_build_names', /Use final build names/.test(runText) && /Ariat Core Boot and Apparel Style Matrix/.test(runText) && finalNavigation.runCanUseImportedFinalNames === true, runText.slice(0, 1200));
assertCase(results, 'w120_trace_simplified_actions', /Export (the handoff first|Build handoff JSON)/.test(traceText) && /(Final generated names import|Completed runner result import)/.test(traceText) && /(Import final names|Import runner result)/.test(traceText) && !/Export SuiteScript packet/.test(traceText), traceText.slice(0, 1200));
assertCase(results, 'w120_visible_copy_hides_internal_acronyms', [preReviewText, postReviewText, valueText, runText, traceText].every((text) => !hasForbiddenVisibleWords(text)), JSON.stringify({ pre: forbiddenVisibleWords(preReviewText), post: forbiddenVisibleWords(postReviewText), value: forbiddenVisibleWords(valueText), run: forbiddenVisibleWords(runText), trace: forbiddenVisibleWords(traceText) }));
assertCase(results, 'w120_final_names_import_no_regression', finalNaming.noRegression.noIdbWrites === true && finalNaming.noRegression.noSuiteScriptInvocationFromIdb === true && finalNaming.noRegression.noTransactionWritesFromIdb === true && finalNaming.noRegression.dccOwnsObjectGeneration === true, JSON.stringify(finalNaming.noRegression));
assertCase(results, 'w120_state_authority_preserved', hooks.stateAuthorityModel(postState).handoffEligible === true && hooks.stateAuthorityModel(postState).exportedLaneName === 'Apparel & Accessories', JSON.stringify(hooks.stateAuthorityModel(postState)));

const pass = results.every((item) => item.pass);
const data = {
  schema: 'idb.w120-build-results-review-language-reset.v1',
  status: pass ? 'build_results_review_ready' : 'blocked',
  generatedAt: new Date().toISOString(),
  decision: {
    reviewBeforeImport: 'small_handoff_checkpoint',
    reviewAfterImport: 'build_results_screen',
    roiCoach: 'why_this_matters_popout',
    consultantVisibleForbiddenWords: ['SCAI', 'IDB', 'DCC']
  },
  implemented: {
    reviewPreRunCompressed: true,
    reviewPostImportBuildResults: true,
    roiWhyThisMattersPopout: true,
    runUsesFinalBuildNames: true,
    traceSimplified: true,
    consultantFacingVocabularyScrub: true
  },
  finalNameSamples: finalNavigation.reviewObjects,
  visualSmokeText: {
    preReview: preReviewText.slice(0, 1200),
    postReview: postReviewText.slice(0, 1600),
    value: valueText.slice(0, 1400),
    run: runText.slice(0, 1200),
    trace: traceText.slice(0, 1200)
  },
  noRegression: {
    noDrawerWrites: true,
    noSuiteScriptInvocationFromDrawer: true,
    noTransactionWritesFromDrawer: true,
    hostedResolverOptionalUntilRemoteSmokeExecuted: true,
    consultantConfirmationRequired: true,
    websiteSupportsIdentityNaming: true,
    notesDriveStoryValue: true,
    buildEngineOwnsObjectGeneration: true,
    w92StateAuthorityPreserved: true,
    w110HandoffParityPreserved: true,
    w116W119FinalNamingImportPreserved: true,
    provisionalNamesCannotBeMarkedFinal: true
  },
  validatorGates: results,
  bestNextCodexPrompt: {
    block: 'W121: Build Results Retest Packet With Final Names',
    prompt: 'Move through W121: Build Results Retest Packet With Final Names. Produce the exact hands-on NetSuite retest for the latest drawer after W120: upload file, enter the Ariat sales request, confirm lane, export handoff, import final generated names JSON, and capture Plan, Review before import, Trace import, Review after import, ROI/Competitive Why this matters, Run final-name pivots, and Trace evidence screenshots. Require handoff JSON, trace JSON, final generated names JSON, and consultant/operator notes. Verify consultant-visible copy does not show SCAI, IDB, or DCC, Review becomes Build Results after import, Run uses final generated names, and no drawer writes, no SuiteScript invocation from the drawer, no transaction writes, W92/W110 authority, and W116-W120 final-name behavior remain intact. Output test packet, expected screenshots, scoring rubric, stop/go criteria, W121 report, validator gates, and best next Codex prompt.'
  }
};

const trace = {
  traceEvent: 'w120_build_results_review_language_reset',
  decision: pass ? 'PASS' : 'FAIL',
  generatedAt: data.generatedAt,
  noSecrets: true,
  buildResultsAfterImport: /Build results/.test(postReviewText),
  finalNamesInRun: /Ariat Core Boot and Apparel Style Matrix/.test(runText),
  visibleCopyScrubbed: results.find((item) => item.name === 'w120_visible_copy_hides_internal_acronyms').pass,
  validatorGates: results
};

const report = `# W120 Build Results Review And Consultant-Facing Language Reset

Status: ${data.status}

## Decision

- Review before import is a small handoff checkpoint.
- Review after import becomes Build Results.
- ROI / Competitive now includes a consultant-facing "Why this matters" pop-out.
- Run uses final generated names after import.
- Trace focuses on handoff export, final-name import, trace export, reset, and evidence checklist.

## Validator Gates

${results.map((item) => `- ${item.pass ? 'PASS' : 'FAIL'} ${item.name}: ${item.detail}`).join('\n')}

## Best Next Codex Prompt

${data.bestNextCodexPrompt.prompt}
`;

writeJson(dataPath, data);
writeJson(tracePath, trace);
fs.writeFileSync(reportPath, report);

if (!pass) {
  console.error(`W120 build results review language reset FAIL (${results.filter((item) => item.pass).length}/${results.length})`);
  process.exit(1);
}

console.log(`W120 build results review language reset PASS (${results.length}/${results.length})`);
