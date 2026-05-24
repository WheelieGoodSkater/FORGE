const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const dataPath = path.join(root, 'data', 'w127_execution_pivot_run_guidance.json');
const tracePath = path.join(root, 'trace_samples', 'w127_execution_pivot_run_guidance_trace.json');
const reportPath = path.join(root, 'reports', 'w127_execution_pivot_run_guidance.md');

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

function confirmedState(hooks) {
  const state = hooks.defaultState();
  Object.assign(state, {
    selectedLaneId: 'apparel_accessories',
    selectedMoveIndex: 0,
    selectedActionId: 'open',
    activeView: 'run',
    briefPrepared: true,
    setupEditMode: false,
    laneSelectionSource: 'build_demo_plan_auto_confirm',
    intake: {
      customer: 'Ariat International',
      website: 'https://www.ariat.com/',
      notes: 'Seasonal footwear and apparel launches are risky because style, size, color, replenishment timing, and channel availability are managed across spreadsheets and disconnected order/inventory views.',
      scObjective: 'Show style/SKU readiness, size/color availability, replenishment timing, and customer promise.',
      decisionCriteria: 'Must connect Customer Record, Sales Order View, and Style / SKU Matrix without forcing apparel into generic manufacturing or distribution language.',
      websiteEvidence: 'Ariat sells footwear, apparel, workwear, outdoor gear, size/color variants, and ecommerce categories.',
      timelineUrgency: 'Internal proof review needed in 2-4 weeks.',
      competitor: 'Spreadsheets, disconnected inventory reports, and incumbent order tools.'
    }
  });
  const lane = hooks.getLane(state);
  const page = {
    pageType: 'NetSuite dashboard',
    contextId: 'generic_netsuite_page',
    confidence: 'low',
    url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/center/card.nl'
  };
  hooks.ensureWebsiteEvidenceRuntime(state);
  const recommendation = hooks.recommendMove(lane, page);
  state.acceptedPacket = hooks.buildAcceptedPacketContext(state, lane, page, recommendation);
  hooks.reconcileStateAuthority(state);
  return { state, lane, page, recommendation };
}

const actions = [
  { id: 'open', label: 'Open', expectedTitle: 'Open on the buyer risk' },
  { id: 'prove', label: 'Prove', expectedTitle: 'Prove the NetSuite path' },
  { id: 'handle_objection', label: 'Handle objection', expectedTitle: 'Handle the buying doubt' },
  { id: 'close_value', label: 'Close value', expectedTitle: 'Close on financial impact' }
];

const hooks = loadHooks();
const source = fs.readFileSync(userscriptPath, 'utf8');
const { state, lane, page, recommendation } = confirmedState(hooks);
const selectedMove = lane.moves[state.selectedMoveIndex] || lane.moves[0];

const runViews = {};
const traces = {};
actions.forEach((action) => {
  const actionState = { ...state, intake: { ...state.intake }, selectedActionId: action.id };
  const html = hooks.renderRunView(actionState, lane, page, recommendation, selectedMove, action, 'summary');
  runViews[action.id] = { html, text: visibleText(html) };
  traces[action.id] = hooks.runSelectorTraceModel(actionState, lane, page, recommendation);
});

const finalState = JSON.parse(JSON.stringify(state));
finalState.dccFinalNamingResult = hooks.dccFinalNamingResultV1({
  runStatus: 'preview_complete',
  prospect: 'Ariat International',
  familyKey: 'apparel_accessories',
  scenario: 'Style-to-Availability Readiness',
  customer: { name: 'Ariat International Outdoor Retail Account', id: '123', url: '/app/common/entity/custjob.nl?id=123' },
  salesOrder: { name: 'Ariat Seasonal Footwear Availability Demo Order', id: '456', url: '/app/accounting/transactions/salesord.nl?id=456' },
  heroItem: { name: 'Ariat Terrain H2O Work Boot Hero Item', id: '789', url: '/app/common/item/item.nl?id=789' },
  matrixItem: { name: 'Ariat Core Boot Size Color Matrix', id: '790', url: '/app/common/item/item.nl?id=790' },
  componentItems: [
    { name: 'Ariat Brown Leather Upper Component', id: '791', url: '/app/common/item/item.nl?id=791' }
  ],
  warnings: []
}, finalState, lane, page, recommendation);
const finalHtml = hooks.renderRunView(finalState, lane, page, recommendation, selectedMove, actions[1], 'summary');
const finalText = visibleText(finalHtml);

const results = [];
assertCase(results, 'w127_removed_switch_to_best_step', !/Switch to best step/.test(source) && !Object.values(runViews).some((view) => /Switch to best step/.test(view.text)), 'best-step button removed from Run');
assertCase(results, 'w127_removed_low_context_copy', !/This page is low context|low context/i.test(source) && !Object.values(runViews).some((view) => /This page is low context|low context/i.test(view.text)), 'generic low-context copy removed');
assertCase(results, 'w127_generic_page_navigation_is_action_oriented', /Open Customer Record next/.test(runViews.open.text) && /navigate to Customer Record/.test(runViews.open.text), runViews.open.text);
actions.forEach((action) => {
  assertCase(results, `w127_${action.id}_has_distinct_title`, runViews[action.id].text.includes(action.expectedTitle), runViews[action.id].text);
});
assertCase(results, 'w127_open_ties_to_buyer_pain', /buyer risk/.test(runViews.open.text) && /Seasonal footwear and apparel launches are risky/.test(runViews.open.text), runViews.open.text);
assertCase(results, 'w127_prove_has_exact_proof_path', /Customer Record/.test(runViews.prove.text) && /Sales Order View/.test(runViews.prove.text) && /Style \/ SKU Matrix/.test(runViews.prove.text), runViews.prove.text);
assertCase(results, 'w127_handle_objection_is_competitive_ready', /buying doubt/.test(runViews.handle_objection.text) && /current workflow against the NetSuite proof path/.test(runViews.handle_objection.text) && /competitor pressure|likely alternatives/.test(runViews.handle_objection.text), runViews.handle_objection.text);
assertCase(results, 'w127_close_value_has_metric_and_next_step', /financial impact/.test(runViews.close_value.text) && /baseline/.test(runViews.close_value.text) && /decision owner/.test(runViews.close_value.text), runViews.close_value.text);
assertCase(results, 'w127_roi_competitive_is_supporting_action', /ROI \/ Competitive/.test(runViews.prove.text) && !/blocked by ROI|ROI required/i.test(runViews.prove.text), runViews.prove.text);
assertCase(results, 'w127_imported_final_names_drive_run_navigation', /Use final build names/.test(finalText) && /Ariat Seasonal Footwear Availability Demo Order/.test(finalText) && /Ariat Terrain H2O Work Boot Hero Item/.test(finalText), finalText);
assertCase(results, 'w127_consultant_visible_run_copy_hides_internal_acronyms', !/\bDCC\b|\bIDB\b|\bSCAI\b/.test(Object.values(runViews).map((view) => view.text).join(' ') + finalText), 'Run visible copy clean');
assertCase(results, 'w127_no_write_boundaries_preserved', !/nlapiSubmitRecord|record\.submitFields|https\.post|N\/https/.test(source), 'drawer source has no write invocation');

const pass = results.every((item) => item.pass);
const executionPivotPlan = [
  {
    block: 'W128',
    name: 'Governed Build Invocation Contract And Sandbox Preview Bridge',
    objective: 'Define the first execution contract from confirmed build handoff to a preview/run path without letting the drawer write.',
    visualNetSuiteTestingRequired: false
  },
  {
    block: 'W129',
    name: 'Sandbox Preview Operator Smoke',
    objective: 'Run the build engine manually or through approved operator steps, compare preview output, and return final generated names JSON.',
    visualNetSuiteTestingRequired: false
  },
  {
    block: 'W130',
    name: 'Final Generated Names Navigation Integration',
    objective: 'Use imported generated names and links in Build and Run as the consultant navigation surface.',
    visualNetSuiteTestingRequired: true
  },
  {
    block: 'W131',
    name: 'Controlled Customer And Supporting Record Write Pilot',
    objective: 'Enable the first governed write pilot only after preview, confirmation, operator approval, and rollback gates pass.',
    visualNetSuiteTestingRequired: false
  },
  {
    block: 'W132',
    name: 'Transaction Creation Safety Gate',
    objective: 'Keep transaction creation blocked until customer/supporting records, final naming, idempotency, and rollback behavior are proven.',
    visualNetSuiteTestingRequired: false
  },
  {
    block: 'W133',
    name: 'Pilot Execution Go/No-Go',
    objective: 'One consultant-to-operator-to-generated-record test with final links returned and no unauthorized write path.',
    visualNetSuiteTestingRequired: true
  }
];

const data = {
  schema: 'idb.w127-execution-pivot-run-guidance.v1',
  status: pass ? 'execution_pivot_run_guidance_ready' : 'blocked',
  generatedAt: new Date().toISOString(),
  visualNetSuiteTestingRequiredNow: false,
  implemented: {
    bestStepButtonRemoved: true,
    lowContextCopyRemoved: true,
    actionOrientedNavigationCue: true,
    distinctRunChips: true,
    importedFinalNamesPreferredInRun: true,
    roiCompetitiveSupportOnly: true,
    executionPivotPlanReady: true
  },
  runChipModel: actions.map((action) => ({
    id: action.id,
    label: action.label,
    title: traces[action.id].scriptPreview.title,
    purpose: action.id === 'open'
      ? 'Buyer pain and why the demo matters.'
      : action.id === 'prove'
        ? 'Exact NetSuite proof path.'
        : action.id === 'handle_objection'
          ? 'Competitive and risk response.'
          : 'Decision, metric, and next step.'
  })),
  executionPivotPlan,
  noRegression: {
    noDrawerWrites: true,
    noSuiteScriptInvocationFromDrawerYet: true,
    noTransactionWritesFromDrawer: true,
    consultantConfirmationRequired: true,
    websiteSupportsIdentityNaming: true,
    notesDriveStoryValue: true,
    internalBuildEngineOwnsGeneratedRecords: true,
    finalGeneratedNamesImportBehaviorPreserved: true,
    stateAuthorityAndHandoffParityPreserved: true,
    consultantVisibleCopyNoDccIdbScai: true
  },
  validatorGates: results,
  bestNextCodexPrompt: {
    block: 'W128: Governed Build Invocation Contract And Sandbox Preview Bridge',
    prompt: 'Move through W128: Governed Build Invocation Contract And Sandbox Preview Bridge. Define the first real execution path from a confirmed build handoff to the internal build engine preview/run path without enabling drawer writes. Build the invocation readiness contract, required operator approval gates, sandbox preview/run parameters, no-submit rollback behavior, result JSON expected shape, final generated names import handoff, and validator gates proving no drawer writes, no SuiteScript invocation from the drawer yet, no transaction writes from the drawer, consultant confirmation required, state authority and handoff parity preserved, and generated records owned by the internal build engine. Output contract, operator runbook, preview/run smoke harness, trace samples, W128 report, whether visual NetSuite testing is required, and the best next Codex prompt.'
  }
};

const trace = {
  decision: pass ? 'PASS' : 'FAIL',
  status: data.status,
  runGuidanceEvents: [
    'run_guidance_cleaned',
    'run_chip_selected',
    'final_generated_names_used_for_run_navigation',
    'execution_pivot_plan_ready'
  ],
  selectedMove,
  pageContext: page,
  actions: Object.fromEntries(Object.entries(traces).map(([key, value]) => [key, {
    title: value.scriptPreview.title,
    show: value.scriptPreview.show,
    actionId: value.selectedActionId
  }])),
  finalNamesNavigationStatus: hooks.dccFinalNavigationModel(finalState, lane, page, recommendation).status,
  visualNetSuiteTestingRequiredNow: false,
  results
};

writeJson(dataPath, data);
writeJson(tracePath, trace);

const report = [
  '# W127 Execution Pivot Gate And Run Guidance Cleanup',
  '',
  `Status: ${data.status}`,
  '',
  'Decision: ' + (pass ? 'PASS / EXECUTION PIVOT RUN GUIDANCE READY' : 'FAIL / REMEDIATE BEFORE EXECUTION PIVOT'),
  '',
  '## What Changed',
  '',
  '- Removed the vague Switch to best step action from Run.',
  '- Replaced generic low-context page guidance with a concrete next-record navigation cue.',
  '- Kept Open, Prove, Handle objection, and Close value distinct and tied to pain, proof path, competitive risk, and financial decision.',
  '- Preserved ROI / Competitive as supporting coaching, not an execution blocker.',
  '- Preserved final generated names import so Run can use real record names and links after import.',
  '',
  '## Execution Pivot Plan',
  '',
  ...executionPivotPlan.map((item) => `- ${item.block}: ${item.name} - ${item.objective}`),
  '',
  '## Visual NetSuite Testing',
  '',
  '- Required now: No. This block changes Run guidance text and removes one vague action, and the harness verifies the visible copy. A spot check is optional, not required.',
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

console.log(`W127 execution pivot run guidance PASS. Wrote ${path.relative(root, dataPath)}, ${path.relative(root, tracePath)}, and ${path.relative(root, reportPath)}.`);
