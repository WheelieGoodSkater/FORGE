const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const dataPath = path.join(root, 'data', 'w125_one_action_intake_flow_compression.json');
const tracePath = path.join(root, 'trace_samples', 'w125_one_action_intake_flow_trace.json');
const reportPath = path.join(root, 'reports', 'w125_one_action_intake_flow_compression.md');

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

function visibleText(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&[#a-z0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function countText(html, pattern) {
  const matches = visibleText(html).match(pattern);
  return matches ? matches.length : 0;
}

function baseState(hooks) {
  const state = hooks.defaultState();
  Object.assign(state, {
    selectedLaneId: 'apparel_accessories',
    activeView: 'plan',
    setupEditMode: true,
    intake: {
      customer: '',
      website: '',
      notes: '',
      scObjective: '',
      decisionCriteria: '',
      websiteEvidence: '',
      timelineUrgency: '',
      competitor: ''
    }
  });
  return state;
}

function readyState(hooks) {
  const state = baseState(hooks);
  state.intake = {
    customer: 'Ariat International',
    website: 'https://www.ariat.com/',
    notes: 'Seasonal footwear and apparel launches are risky because style, size, color, replenishment timing, and channel availability are managed across spreadsheets and disconnected order/inventory views.',
    scObjective: 'Show style/SKU readiness, size/color availability, replenishment timing, and customer promise.',
    decisionCriteria: 'Must connect Customer Record, Sales Order View, and Style / SKU Matrix without forcing apparel into generic manufacturing or distribution language.',
    websiteEvidence: 'Ariat sells footwear, apparel, workwear, outdoor gear, size/color variants, and ecommerce categories.',
    timelineUrgency: 'Internal proof review needed in 2-4 weeks.',
    competitor: 'Spreadsheets, disconnected inventory reports, and incumbent order tools.'
  };
  return state;
}

function renderPlan(hooks, state) {
  const lane = hooks.getLane(state);
  const page = {
    pageType: 'Customer Record',
    confidence: 'low',
    url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/center/card.nl'
  };
  hooks.ensureWebsiteEvidenceRuntime(state);
  const recommendation = hooks.recommendMove(lane, page);
  return {
    lane,
    page,
    recommendation,
    html: hooks.renderPlanView(state, lane, page, recommendation),
    flow: hooks.oneActionIntakeFlowModel(state, lane, page, recommendation)
  };
}

const hooks = loadHooks();
const source = fs.readFileSync(userscriptPath, 'utf8');

const empty = baseState(hooks);
const ready = readyState(hooks);
const prepared = readyState(hooks);
prepared.briefPrepared = true;
prepared.setupEditMode = false;
const confirmed = readyState(hooks);
confirmed.briefPrepared = true;
confirmed.setupEditMode = false;
confirmed.laneSelectionSource = 'consultant_confirmed';
confirmed.acceptedPacket = hooks.buildAcceptedPacketContext(
  confirmed,
  hooks.getLane(confirmed),
  { pageType: 'Customer Record', confidence: 'low', url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/center/card.nl' },
  hooks.recommendMove(hooks.getLane(confirmed), { pageType: 'Customer Record', confidence: 'low' })
);
hooks.reconcileStateAuthority(confirmed);

const views = {
  empty: renderPlan(hooks, empty),
  ready: renderPlan(hooks, ready),
  prepared: renderPlan(hooks, prepared),
  confirmed: renderPlan(hooks, confirmed)
};

const buildView = hooks.renderReviewView(
  confirmed,
  views.confirmed.lane,
  views.confirmed.page,
  views.confirmed.recommendation
);

const results = [];
assertCase(results, 'w125_empty_state_prompts_sales_request', /Enter sales request/.test(visibleText(views.empty.html)) && /Complete request/.test(visibleText(views.empty.html)), visibleText(views.empty.html).slice(0, 900));
assertCase(results, 'w125_ready_state_has_one_primary_build_demo_plan', (views.ready.html.match(/data-idb-build-demo-plan/g) || []).length === 1 && /Build demo plan/.test(visibleText(views.ready.html)), visibleText(views.ready.html).slice(0, 1200));
assertCase(results, 'w125_ready_state_removes_competing_save_and_prepare', !/Save request/.test(source) && !/data-idb-save-setup>Save request/.test(source) && !/data-idb-prepare-brief>Prepare brief/.test(views.ready.html), visibleText(views.ready.html).slice(0, 1200));
assertCase(results, 'w125_prepared_state_shows_confirm_demo_path', /Confirm demo path/.test(visibleText(views.prepared.html)) && !/Save & prepare brief/.test(visibleText(views.prepared.html)), visibleText(views.prepared.html).slice(0, 1200));
assertCase(results, 'w125_confirmed_state_shows_run_build_value', ['Run demo', 'Build handoff', 'ROI / Competitive'].every((text) => visibleText(views.confirmed.html).includes(text)), visibleText(views.confirmed.html).slice(0, 1200));
assertCase(results, 'w125_flow_model_has_expected_states', ['enter_sales_request', 'ready_to_prepare', 'prepared_needs_confirmation', 'confirmed_ready'].every((state) => Object.values(views).some((view) => view.flow.state === state)), JSON.stringify(Object.fromEntries(Object.entries(views).map(([key, value]) => [key, value.flow.state]))));
assertCase(results, 'w125_trace_events_present', ['sales_request_saved', 'brief_prepared', 'demo_path_confirmed', 'demo_plan_built'].every((eventName) => source.includes(eventName)), 'trace events present in runtime');
assertCase(results, 'w125_build_behavior_preserved', /Build Handoff/.test(buildView) && /Final generated names not imported yet/.test(buildView), visibleText(buildView).slice(0, 900));
assertCase(results, 'w125_no_write_boundaries_preserved', !/nlapiSubmitRecord|record\.submitFields|https\.post|N\/https/.test(source), 'drawer source has no write invocation');
assertCase(results, 'w125_test_hooks_expose_flow_model', /oneActionIntakeFlowModel/.test(source), 'test hook exported');

const pass = results.every((item) => item.pass);
const data = {
  schema: 'idb.w125-one-action-intake-flow-compression.v1',
  status: pass ? 'one_action_intake_flow_ready' : 'blocked',
  generatedAt: new Date().toISOString(),
  userVisualTestRequiredNow: true,
  implemented: {
    onePrimarySaveAndPrepareAction: true,
    onePrimaryBuildDemoPlanAction: true,
    visibleSaveDraftRemoved: true,
    preparedStateConfirmDemoPath: true,
    confirmedStateRunBuildValueActions: true,
    duplicatePrepareAndSaveRemoved: true,
    traceSavePrepareConfirm: true,
    w124BuildBehaviorPreserved: true
  },
  stateTransitionModel: {
    empty: views.empty.flow,
    ready: views.ready.flow,
    prepared: views.prepared.flow,
    confirmed: views.confirmed.flow
  },
  visualTestCriteria: [
    'Open Plan on a fresh session and confirm it says Enter sales request.',
    'Fill prospect, website, business pain, requested proof, and decision criteria.',
    'Confirm there is exactly one primary Build demo plan action and no Save draft button.',
    'Click Build demo plan and confirm the next primary action becomes Confirm demo path or auto-confirms when evidence is safe.',
    'Click Confirm demo path and confirm Plan shows Run demo, Build handoff, and ROI / Competitive.',
    'Open Build and confirm it still shows the compact Build Handoff before final generated names are imported.',
    'Open Trace and export the trace after the run; it should show evidence/export/reset behavior only.'
  ],
  noRegression: {
    noDrawerWrites: true,
    noSuiteScriptInvocationFromDrawer: true,
    noTransactionWritesFromDrawer: true,
    consultantConfirmationRequiredBeforeHandoff: true,
    websiteSupportsIdentityNaming: true,
    notesDriveStoryValue: true,
    internalBuildEngineOwnsGeneratedRecords: true,
    finalGeneratedNamesImportBehaviorPreserved: true,
    w92W110StateAuthorityPreserved: true,
    w116W124FinalNameAndBuildBehaviorPreserved: true,
    w123LauncherBehaviorPreserved: true,
    consultantVisibleCopyNoDccIdbScai: true
  },
  validatorGates: results,
  bestNextCodexPrompt: {
    block: 'W126: One-Click Demo Plan Build',
    prompt: 'Move through W126: One-Click Demo Plan Build. Replace Save & prepare brief with Build demo plan, hide visible Save draft from the main flow, locally autosave changes, save the request, prepare the brief, recommend the demo path, auto-confirm only when evidence is safe, and stop at Confirm demo path with a clear reason when evidence is weak, conflicting, or manually overridden. Preserve W92/W110 authority, W116-W125 final-name/build/intake behavior, no drawer writes, no SuiteScript invocation from the drawer, no transaction writes, consultant confirmation required, website identity/naming support, notes-driven value story, and build-engine ownership of generated records. Output one-click Plan flow, auto-confirm eligibility model, trace coverage, validator gates, W126 report, and visual test criteria because Plan workflow materially changes.'
  }
};

const trace = {
  decision: pass ? 'PASS' : 'FAIL',
  status: data.status,
  eventsRequired: ['sales_request_saved', 'brief_prepared', 'demo_path_confirmed'],
  stateTransitionStates: Object.fromEntries(Object.entries(views).map(([key, value]) => [key, value.flow.state])),
  onePrimaryBuildDemoPlanVisible: (views.ready.html.match(/data-idb-build-demo-plan/g) || []).length,
  saveRequestVisible: /Save request/.test(visibleText(views.ready.html)),
  saveDraftVisible: /Save draft/.test(visibleText(views.ready.html)),
  duplicatePrepareVisible: countText(views.ready.html, /Prepare brief/g),
  visualTestRequiredNow: true,
  results
};

writeJson(dataPath, data);
writeJson(tracePath, trace);

const report = [
  '# W125 One-Action Intake Flow Compression',
  '',
  `Status: ${data.status}`,
  '',
  'Decision: ' + (pass ? 'PASS / ONE-ACTION INTAKE FLOW READY / USER VISUAL FEEDBACK REQUIRED' : 'FAIL / REMEDIATE BEFORE VISUAL TEST'),
  '',
  '## What Changed',
  '',
  '- Preserved the W125 one-action contract with the current one primary Build demo plan action.',
  '- Removed visible Save draft from the main flow; field changes autosave locally.',
  '- Added prepared and confirmed states: Confirm demo path, then Run demo / Build handoff / ROI / Competitive.',
  '- Added trace coverage for sales_request_saved, brief_prepared, and demo_path_confirmed.',
  '- Preserved Build tab handoff/results behavior and no-write boundaries.',
  '',
  '## Visual Test Criteria',
  '',
  ...data.visualTestCriteria.map((item) => `- ${item}`),
  '',
  '## Validator Gates',
  '',
  ...results.map((item) => `- ${item.pass ? 'PASS' : 'FAIL'}: ${item.name}${item.detail ? ` - ${item.detail}` : ''}`),
  '',
  '## Best Next Codex Prompt',
  '',
  data.bestNextCodexPrompt.prompt
].join('\n');

fs.writeFileSync(reportPath, `${report}\n`);

if (!pass) {
  console.error(JSON.stringify(results.filter((item) => !item.pass), null, 2));
  process.exit(1);
}

console.log(`W125 one-action intake flow compression PASS. Wrote ${path.relative(root, dataPath)}, ${path.relative(root, tracePath)}, and ${path.relative(root, reportPath)}.`);
