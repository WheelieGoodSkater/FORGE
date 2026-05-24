const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const dataPath = path.join(root, 'data', 'w93_consultant_ux_compression_evidence_first_review.json');
const tracePath = path.join(root, 'trace_samples', 'w93_consultant_ux_compression_trace.json');
const reportPath = path.join(root, 'reports', 'w93_consultant_ux_compression_evidence_first_review.md');

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

function assertCase(results, name, pass, detail) {
  results.push({ name, pass: !!pass, detail: detail || '' });
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function escapeTable(value) {
  return String(value == null ? '' : value).replace(/\|/g, '/');
}

function textWithoutWhitespace(value) {
  return String(value || '').replace(/\s+/g, ' ');
}

function ariatConfirmedState() {
  const now = new Date().toISOString();
  return {
    open: true,
    selectedLaneId: 'apparel_accessories',
    laneSelectionSource: 'website_evidence_v1',
    briefPrepared: true,
    selectedMoveIndex: 0,
    selectedActionId: 'prove',
    intake: {
      customer: 'Ariat International',
      website: 'https://www.ariat.com/',
      notes: 'Buyer needs style, size, color, replenishment timing, and channel availability connected for seasonal footwear and apparel launches. Current process relies on spreadsheets and disconnected inventory views.',
      websiteEvidence: '',
      scObjective: 'Prepare a concise demo story showing how NetSuite supports style/SKU readiness, size/color availability, replenishment timing, and customer promise for a seasonal boot and apparel launch.',
      competitor: 'Current spreadsheets and existing inventory tools; broader ERP options under comparison.',
      decisionCriteria: 'Must show style/SKU matrix fit, size/color visibility, channel availability, replenishment timing, and customer-to-order impact.'
    },
    toggles: {},
    acceptedPacket: null,
    activeView: 'plan',
    setupEditMode: false,
    lanePickerOpen: false,
    storyBarCollapsed: false,
    storyBarCollapseManual: false,
    pilotResult: null,
    websiteEvidenceV1: null,
    websiteResolverRuntime: {
      serviceName: 'websiteResolverServiceV1',
      mode: 'not_requested',
      requestKey: '',
      endpointConfigured: false,
      localFallbackEnabled: true,
      status: 'idle',
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
  state.laneSelectionSource = 'consultant_confirmed';
  hooks.reconcileStateAuthority(state);

  const planHtml = textWithoutWhitespace(hooks.renderPlanView(state, lane, page, recommendation));
  const reviewHtml = textWithoutWhitespace(hooks.renderReviewView(state, lane, page, recommendation));
  const runHtml = textWithoutWhitespace(hooks.renderRunView(state, lane, page, recommendation, lane.moves[0], { id: 'prove' }, 'Summary'));
  const traceHtml = textWithoutWhitespace(hooks.renderTraceView(state, lane, page, recommendation));
  state.activeView = 'plan';
  const drawerHtml = textWithoutWhitespace(hooks.renderDrawer(state));
  const handoff = hooks.dccRunnerHandoffPacketV1(state, lane, page, recommendation);
  const authority = hooks.stateAuthorityModel(state);

  assertCase(results, 'w93_hooks_expose_renderers', ['renderDrawer', 'renderPlanView', 'renderReviewView', 'renderRunView', 'renderTraceView'].every((name) => typeof hooks[name] === 'function'), 'render hooks are required for visual regression gates');
  assertCase(results, 'w93_drawer_no_default_live_question_or_story_bar', !drawerHtml.includes('LIVE QUESTION') && !drawerHtml.includes('STORY BAR') && !/\$\{storyBar\}/.test(userscript), 'drawer live path does not inject duplicate global surfaces');
  assertCase(results, 'w93_plan_answer_first_contract', planHtml.includes('30-second plan') && planHtml.includes('Prospect') && planHtml.includes('Classification') && planHtml.includes('Confidence') && planHtml.includes('Demo path') && planHtml.includes('Build handoff'), planHtml.slice(0, 400));
  assertCase(results, 'w93_review_dcc_handoff_first', reviewHtml.indexOf('Build Handoff') >= 0 && reviewHtml.indexOf('Build Handoff') < reviewHtml.indexOf('Internal build details') && reviewHtml.includes('What will be handed off') && reviewHtml.includes('Export build handoff'), reviewHtml.slice(0, 500));
  assertCase(results, 'w93_run_script_first_audit_second', runHtml.indexOf('Live controls') >= 0 && runHtml.indexOf('Live controls') < runHtml.indexOf('Live script first') && runHtml.indexOf('Live script first') < runHtml.indexOf('Audit: controls, moves, guardrails, and coaching') && runHtml.includes('Say') && runHtml.includes('Show') && runHtml.includes('Close'), runHtml.slice(0, 500));
  assertCase(results, 'w93_trace_export_checklist_reset_only', traceHtml.includes('Trace actions only') && traceHtml.includes('Export handoff') && traceHtml.includes('Export trace') && traceHtml.includes('Pilot evidence checklist') && traceHtml.includes('Clear trace') && traceHtml.includes('Clear session') && !traceHtml.includes('Pilot result import'), traceHtml.slice(0, 500));
  assertCase(results, 'w93_state_authority_preserved', authority.handoffEligible === true && handoff.status === 'ready_for_dcc_suitelet_submission_review' && authority.selectedLaneId === authority.confirmedLaneId && authority.confirmedLaneId === authority.exportedLaneId && handoff.selectedPack === 'apparelAccessories', JSON.stringify({ authority, handoff: handoff.status, pack: handoff.selectedPack }));
  assertCase(results, 'w93_no_regression_guards_present', /noSuiteScriptInvocationFromIdb/.test(userscript) && /noIdbTransactionWrite/.test(userscript) && /dccOwnsObjectGeneration/.test(userscript) && /notesRole: 'story_only'/.test(userscript), 'no-write, notes story-only, DCC ownership');

  const failures = results.filter((result) => !result.pass);
  const decision = failures.length ? 'FAIL' : 'PASS';
  const bestNextCodexPrompt = {
    block: 'W94: Visual QA And Duplicate Drawer Cleanup',
    prompt: 'Move through W94: Visual QA And Duplicate Drawer Cleanup. Use the W93 compressed UI to run a visual and state smoke focused on duplicate drawer roots/buttons, drawer width and positioning, first-viewport readability, Plan/Review/Run/Trace screenshots, Tampermonkey duplicate install detection, and one active IDB root guarantee. Fix any layout or duplicate-render defects without changing W92 state authority or DCC handoff boundaries. Preserve no IDB writes, no SuiteScript invocation, no transaction writes, hosted resolver optional until remoteSmokeExecuted=true, notes story-only, consultant confirmation required, and DCC ownership of object generation. Output visual QA results, duplicate-root guard if needed, screenshots checklist, validator gates, W94 report, and best next Codex prompt.'
  };

  const contract = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  contract.status = decision === 'PASS' ? 'consultant_ux_compressed_state_authority_preserved' : 'consultant_ux_compression_failed';
  contract.validatorResults = results;

  const trace = {
    schema: 'idb.w93-consultant-ux-compression-trace.v1',
    generatedAt: new Date().toISOString(),
    decision,
    compressedTabs: {
      plan: 'prospect_classification_confidence_dcc_pack_primary_action',
      review: 'dcc_handoff_status_pack_objects_blockers_export',
      run: 'live_script_first_audit_second',
      trace: 'export_checklist_reset_only'
    },
    stateAuthority: authority,
    handoffSummary: {
      status: handoff.status,
      selectedPack: handoff.selectedPack,
      selectedScenario: handoff.selectedScenario,
      exportedLaneId: handoff.stateAuthority.exportedLaneId
    },
    noRegression: contract.noRegression,
    validatorResults: results,
    bestNextCodexPrompt
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);

  const report = [
    '# W93 Consultant UX Compression And Evidence-First Review',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    `Decision: ${decision} / CONSULTANT UX COMPRESSED`,
    '',
    '## Compressed UI Changes',
    '',
    '- Plan now leads with prospect, website classification, confidence, DCC pack, and one primary action.',
    '- Review now leads with DCC handoff export, selected pack/scenario, DCC-prepared objects, blockers, and export.',
    '- Run now leads with the Say/Show/Close script and moves controls, guardrails, and coaching into audit detail.',
    '- Trace now shows export, pilot evidence checklist, and reset only.',
    '- Live Question and Story Bar are no longer injected around the normal tab render path.',
    '',
    '## Visual Regression Checklist',
    '',
    contract.visualRegressionChecklist.map((item) => `- ${item}`).join('\n'),
    '',
    '## Validator Gates',
    '',
    '| Gate | Result | Detail |',
    '| --- | --- | --- |',
    ...results.map((result) => `| ${escapeTable(result.name)} | ${result.pass ? 'PASS' : 'FAIL'} | ${escapeTable(result.detail)} |`),
    '',
    '## Best Next Codex Prompt',
    '',
    bestNextCodexPrompt.prompt
  ].join('\n');

  fs.writeFileSync(reportPath, `${report}\n`);

  if (failures.length) {
    console.error(report);
    process.exit(1);
  }
  console.log(report);
}

main();
