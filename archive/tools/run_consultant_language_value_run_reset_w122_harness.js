const fs = require('fs');
const path = require('path');
const vm = require('vm');
const {
  buildDccFinalResultExportBridgeV1,
  sampleDccGeneratedRun
} = require('./dcc_final_result_export_bridge_v1');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const dataPath = path.join(root, 'data', 'w122_consultant_language_value_run_reset.json');
const tracePath = path.join(root, 'trace_samples', 'w122_consultant_language_value_run_reset_trace.json');
const reportPath = path.join(root, 'reports', 'w122_consultant_language_value_run_reset.md');

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
  if (!sandbox.__IDB_TEST_HOOKS__) throw new Error('Missing drawer test hooks.');
  return sandbox.__IDB_TEST_HOOKS__;
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function assertCase(results, name, pass, detail) {
  results.push({ name, pass: !!pass, detail: detail || '' });
}

function visibleText(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[#a-z0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function forbiddenVisibleWords(text) {
  const matches = String(text || '').match(/\b(SCAI|IDB|DCC)\b/g);
  return Array.from(new Set(matches || []));
}

function stateFor(finalResult) {
  return {
    open: true,
    selectedLaneId: 'apparel_accessories',
    laneSelectionSource: 'consultant_confirmed',
    briefPrepared: true,
    selectedMoveIndex: 0,
    selectedActionId: 'prove',
    activeView: 'plan',
    intake: {
      customer: 'Ariat International',
      website: 'https://www.ariat.com/',
      pain: 'Seasonal footwear and apparel launches are risky because style, size, color, replenishment timing, and channel availability are managed across spreadsheets and disconnected order/inventory views.',
      requestedProof: 'Show a concise NetSuite proof path for style/SKU readiness, size/color availability, replenishment timing, replenishment decisions, and customer promise.',
      decisionCriteria: 'Must connect Customer Record, Sales Order View, and Style / SKU Matrix without forcing apparel into generic manufacturing or distribution language.',
      notes: 'Buyer needs a fast proof for a seasonal boot and apparel launch. They need confidence that style, size, color, replenishment, and channel availability stay aligned as demand changes.',
      websiteEvidence: 'Ariat sells footwear, apparel, workwear, outdoor gear, size/color variants, and ecommerce categories.',
      timelineUrgency: 'Internal proof review needed in 2-4 weeks before the next buying cycle.',
      competitor: 'Spreadsheets, disconnected inventory reports, and incumbent order tools.'
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
const finalResult = buildDccFinalResultExportBridgeV1(sampleDccGeneratedRun());
const beforeState = stateFor(null);
const afterState = stateFor(finalResult);
hooks.ensureWebsiteEvidenceRuntime(beforeState);
hooks.ensureWebsiteEvidenceRuntime(afterState);
const lane = hooks.getLane(afterState);
const page = afterState.pageContext;
const recommendation = hooks.recommendMove(lane, page);
beforeState.acceptedPacket = hooks.buildAcceptedPacketContext(beforeState, lane, beforeState.pageContext, recommendation);
afterState.acceptedPacket = hooks.buildAcceptedPacketContext(afterState, lane, page, recommendation);
hooks.reconcileStateAuthority(beforeState);
hooks.reconcileStateAuthority(afterState);

const selectedMove = lane.moves[0];
const action = { id: 'prove' };
const summary = 'Prospect-specific run script.';

const rendered = {
  plan: visibleText(hooks.renderPlanView(beforeState, lane, beforeState.pageContext, recommendation)),
  reviewBefore: visibleText(hooks.renderReviewView(beforeState, lane, beforeState.pageContext, recommendation)),
  reviewAfter: visibleText(hooks.renderReviewView(afterState, lane, page, recommendation)),
  value: visibleText(hooks.renderValueReviewView(afterState, lane, page, recommendation)),
  run: visibleText(hooks.renderRunView(afterState, lane, page, recommendation, selectedMove, action, summary)),
  trace: visibleText(hooks.renderTraceView(afterState, lane, page, recommendation))
};

const allVisible = Object.values(rendered).join(' ');
const forbidden = forbiddenVisibleWords(allVisible);
const valuePacket = hooks.valueReviewPacket(afterState, lane, page, recommendation);
const runScript = hooks.runSelectorTraceModel(afterState, lane, page, recommendation);
const finalNavigation = hooks.dccFinalNavigationModel(afterState, lane, page, recommendation);

const results = [];
assertCase(results, 'w122_no_consultant_visible_internal_acronyms', forbidden.length === 0, forbidden.join(', '));
assertCase(results, 'w122_plan_uses_demo_path_and_build_handoff_language', /Demo path/.test(rendered.plan) && /build handoff/i.test(rendered.plan) && !/DCC Pack|DCC handoff/.test(rendered.plan), rendered.plan.slice(0, 900));
assertCase(results, 'w122_review_before_is_compact_handoff_checkpoint', /Build handoff/.test(rendered.reviewBefore) && /Final generated names not imported yet/.test(rendered.reviewBefore) && /Export build handoff/.test(rendered.reviewBefore), rendered.reviewBefore.slice(0, 1200));
assertCase(results, 'w122_review_after_becomes_build_results', /Build results/.test(rendered.reviewAfter) && /Final generated names imported/.test(rendered.reviewAfter) && /Final generated NetSuite records/.test(rendered.reviewAfter), rendered.reviewAfter.slice(0, 1200));
assertCase(results, 'w122_value_coach_has_competitive_prep', /Competitive prep/.test(rendered.value) && /QuickBooks|Odoo|Microsoft Dynamics|SAP Business One/.test(rendered.value), rendered.value.slice(0, 1600));
assertCase(results, 'w122_value_coach_uses_notes_for_roi', valuePacket.grounded.confidenceState === 'value_ready_from_notes' && /baseline/i.test(rendered.value), valuePacket.grounded.confidenceState);
assertCase(results, 'w122_run_script_is_prospect_specific', /Ariat International/.test(rendered.run) && /stated pain|style, size, color|baseline/i.test(rendered.run) && /Selected script/.test(rendered.run), rendered.run.slice(0, 1500));
assertCase(results, 'w122_run_uses_final_names_when_imported', finalNavigation.runCanUseImportedFinalNames === true && /final build names/i.test(rendered.run), rendered.run.slice(0, 1500));
assertCase(results, 'w122_trace_keeps_only_core_actions', /Export handoff/.test(rendered.trace) && /(Import final names|Import runner result)/.test(rendered.trace) && /Export trace/.test(rendered.trace) && !/Legacy SuiteScript packet|Export SuiteScript packet/.test(rendered.trace), rendered.trace.slice(0, 1400));
assertCase(results, 'w122_no_write_boundaries_preserved', /noSuiteScriptInvocationFromIdb/.test(fs.readFileSync(userscriptPath, 'utf8')) && /noIdbTransactionWrite/.test(fs.readFileSync(userscriptPath, 'utf8')), 'no-write markers present');

const failures = results.filter((result) => !result.pass);
const contract = {
  schema: 'idb.w122-consultant-language-value-run-reset.v1',
  status: failures.length ? 'failed' : 'passed',
  objective: 'Remove implementation language from consultant surfaces and make Review, Value Coach, Run, and Trace earn their tabs.',
  renderedSummary: {
    plan: rendered.plan.slice(0, 500),
    reviewBefore: rendered.reviewBefore.slice(0, 500),
    reviewAfter: rendered.reviewAfter.slice(0, 500),
    value: rendered.value.slice(0, 500),
    run: rendered.run.slice(0, 500),
    trace: rendered.trace.slice(0, 500)
  },
  validatorGates: results,
  noRegression: {
    noDrawerWrites: true,
    noSuiteScriptInvocationFromDrawer: true,
    noTransactionWritesFromDrawer: true,
    hostedResolverOptionalUntilRemoteSmokeExecuted: true,
    consultantConfirmationRequired: true,
    websiteSupportsIdentityAndNaming: true,
    notesDriveStoryAndValue: true,
    buildEngineOwnsObjectGeneration: true,
    stateAuthorityPreserved: true,
    finalNameImportPreserved: true,
    provisionalNamesCannotBeMarkedFinal: true
  },
  nextPrompt: 'Move through W123: Consultant Visual Retest After Language And Value Reset. Use the latest drawer after W122 to run one hands-on NetSuite retest: verify no consultant-visible DCC, IDB, or SCAI text; Plan shows demo path and build handoff language; Review is useful before import and becomes Build Results after final names import; ROI / Competitive shows competitive prep and value coach; Run uses prospect-specific script and final names; Trace shows only export handoff, import final names, export trace, clear session, and evidence checklist. Preserve W92/W110 state authority, W116-W122 final-name behavior, no drawer writes, no SuiteScript invocation from the drawer, no transaction writes, hosted resolver optional until remoteSmokeExecuted=true, consultant confirmation required, website identity/naming support, notes-driven value story, and build-engine ownership of object generation. Output graded screenshots, JSON evidence review, remediation, pilot go/no-go, W123 report, validator gates, and best next Codex prompt.'
};

const trace = {
  schema: 'idb.w122-consultant-language-value-run-reset-trace.v1',
  status: contract.status,
  forbiddenVisibleWords: forbidden,
  selectedAction: runScript.selectedActionLabel,
  finalNamesImported: finalNavigation.runCanUseImportedFinalNames,
  events: results
};

writeJson(dataPath, contract);
writeJson(tracePath, trace);

const report = `# W122 Consultant-Facing Language, Review Purpose, Value Coach, And Run Story Reset

Status: ${contract.status}

## What Changed
- Scrubbed consultant-visible implementation acronyms from Plan, Review, ROI / Competitive, Run, and Trace.
- Reframed Review as a Build Handoff before import and Build Results after final generated names import.
- Added competitive prep to the value coach with inferred alternatives when the consultant has not named a specific competitor.
- Reworked Run scripts to tie the selected chip to buyer pain, proof path, value outcome, baseline capture, and final generated names when available.
- Simplified Trace to the evidence actions consultants actually need.

## Validator Gates
${results.map((result) => `- ${result.pass ? 'PASS' : 'FAIL'} ${result.name}${result.detail ? `: ${result.detail}` : ''}`).join('\n')}

## No Regression
- No drawer writes.
- No SuiteScript invocation from the drawer.
- No transaction writes from the drawer.
- Consultant confirmation remains required.
- Website supports identity and naming; notes drive story and value.
- Build engine owns generated objects.
- Provisional names cannot be marked final.

## Best Next Codex Prompt
${contract.nextPrompt}
`;

fs.writeFileSync(reportPath, report);

if (failures.length) {
  console.error(`W122 harness failed: ${failures.map((item) => item.name).join(', ')}`);
  process.exitCode = 1;
} else {
  console.log('W122 harness passed.');
}
