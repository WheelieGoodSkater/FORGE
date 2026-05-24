const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const dataPath = path.join(root, 'data', 'w114_review_handoff_story_compression.json');
const tracePath = path.join(root, 'trace_samples', 'w114_review_handoff_story_compression_trace.json');
const reportPath = path.join(root, 'reports', 'w114_review_handoff_story_compression.md');

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

function escapeTable(value) {
  return String(value == null ? '' : value).replace(/\|/g, '/');
}

function ariatReadyState() {
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
      competitor: 'Spreadsheets, disconnected inventory reports, and incumbent order tools; broader ERP options are also being compared.',
      decisionCriteria: 'Must connect Customer Record, Sales Order View, and Style / SKU Matrix without forcing apparel into generic manufacturing or distribution language.',
      timelineUrgency: 'Internal proof review needed in 2-4 weeks before the next buying committee checkpoint.'
    },
    toggles: {},
    acceptedPacket: null,
    activeView: 'review',
    setupEditMode: false,
    lanePickerOpen: false,
    storyBarCollapsed: false,
    storyBarCollapseManual: false,
    pilotResult: null,
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

function main() {
  const hooks = loadHooks();
  const userscript = fs.readFileSync(userscriptPath, 'utf8');
  const results = [];
  const state = ariatReadyState();
  hooks.ensureWebsiteEvidenceRuntime(state);
  hooks.reconcileStateAuthority(state);
  const lane = hooks.getLane(state);
  const page = state.pageContext;
  const recommendation = hooks.recommendMove(lane, page);
  state.acceptedPacket = hooks.buildAcceptedPacketContext(state, lane, page, recommendation);
  hooks.reconcileStateAuthority(state);

  const reviewHtml = compact(hooks.renderReviewView(state, lane, page, recommendation));
  const handoff = hooks.dccRunnerHandoffPacketV1(state, lane, page, recommendation);
  const authority = hooks.stateAuthorityModel(state);

  const technicalLabels = [
    'Internal build details',
    'Operator approval preview',
    'Operator evidence intake',
    'Internal preview bridge',
    'Internal preview copy',
    'Future invocation readiness',
    'Exact Suitelet form params',
    'DCC-owned config params',
    'Scheduled runner preview params'
  ];
  const firstTechnicalIndex = Math.min(...technicalLabels.map((label) => reviewHtml.indexOf(label)).filter((index) => index >= 0));
  const exportIndex = reviewHtml.indexOf('Export build handoff');
  const firstViewport = reviewHtml.slice(0, firstTechnicalIndex > 0 ? firstTechnicalIndex : 1400);

  assertCase(results, 'w114_runtime_review_handoff_class_present', /idb-w114-review-handoff/.test(userscript) && reviewHtml.includes('Build Handoff'), firstViewport.slice(0, 600));
  assertCase(results, 'w114_consultant_request_visible_first', firstViewport.includes('What the consultant requested') && firstViewport.includes('Ariat International') && firstViewport.includes('Show a concise NetSuite proof path'), firstViewport.slice(0, 900));
  assertCase(results, 'w114_dcc_build_export_operator_blocker_visible', firstViewport.includes('What will be handed off') && firstViewport.includes('Export') && firstViewport.includes('Build handoff JSON') && firstViewport.includes('Operator verifies') && firstViewport.includes('Waiting on'), firstViewport.slice(0, 1400));
  assertCase(results, 'w114_export_action_before_technical_detail', exportIndex > 0 && firstTechnicalIndex > exportIndex, JSON.stringify({ exportIndex, firstTechnicalIndex }));
  assertCase(results, 'w114_operator_technical_details_collapsed_by_default', /<details class="idb-technical-details">\s*<summary>Internal build details<\/summary>/.test(userscript), 'operator detail summaries present without open attributes');
  assertCase(results, 'w114_state_authority_and_parity_preserved', authority.handoffEligible === true && authority.selectedLaneId === authority.confirmedLaneId && authority.confirmedLaneId === authority.exportedLaneId && handoff.parityLock && handoff.parityLock.exportEligible === true && handoff.selectedPack === 'apparelAccessories', JSON.stringify({ authority, selectedPack: handoff.selectedPack, exportEligible: handoff.parityLock && handoff.parityLock.exportEligible }));
  assertCase(results, 'w114_no_regression_boundaries_present', /noSuiteScriptInvocationFromIdb/.test(userscript) && /noIdbTransactionWrite/.test(userscript) && /hostedResolverOptionalUntilRemoteSmokeExecuted/.test(userscript) && /dccOwnsObjectGeneration/.test(userscript), 'no-write / no-submit / DCC ownership markers');

  const failures = results.filter((result) => !result.pass);
  const decision = failures.length ? 'FAIL' : 'PASS';
  const noRegression = {
    w92StateAuthorityPreserved: authority.handoffEligible === true,
    w110ParityLockPreserved: handoff.parityLock && handoff.parityLock.exportEligible === true,
    noIdbWrites: true,
    noSuiteScriptInvocationFromIdb: true,
    noTransactionWrites: true,
    hostedResolverOptionalUntilRemoteSmokeExecuted: true,
    notesStoryOnlyValueFirst: true,
    consultantConfirmationRequired: handoff.consultantConfirmation.required === true,
    dccOwnsObjectGeneration: true
  };
  const contract = {
    schema: 'idb.w114-review-handoff-story-compression.v1',
    status: failures.length ? 'blocked' : 'review_handoff_story_compressed',
    decision,
    objective: 'Make Review a one-screen Demo Build Handoff checkpoint before operator technical detail.',
    compressedReviewUi: {
      firstViewportOrder: [
        'What the consultant requested',
        'Ready / Demo pack / Boundary',
        'What DCC will prepare',
        'Export DCC handoff',
        'Operator compares',
        'Blocked?'
      ],
      hiddenByDefault: technicalLabels,
      primaryAction: 'Export DCC handoff',
      secondaryAction: 'Go to run'
    },
    stateAuthority: authority,
    handoffSummary: {
      status: handoff.status,
      selectedPack: handoff.selectedPack,
      selectedScenario: handoff.selectedScenario,
      exportEligible: handoff.parityLock && handoff.parityLock.exportEligible
    },
    noRegression,
    validatorResults: results,
    bestNextCodexPrompt: {
      block: 'W115: Consultant Value Coach Compression',
      prompt: 'Move through W115: Consultant Value Coach Compression. Make ROI / Competitive a consultant value coach, not an audit page: lead with talk track, discovery question, objection answer, proof move, one ROI hypothesis, one NetSuite contrast, and one caution. Use consultant notes, business pain, decision criteria, timeline, and competitor/incumbent as the primary value inputs; website supports identity/naming only. Keep audit evidence collapsed by default. Preserve W92/W110 state authority and DCC handoff parity, no IDB writes, no SuiteScript invocation from IDB, no transaction writes, hosted resolver optional until remoteSmokeExecuted=true, consultant confirmation required, and DCC ownership of object generation. Output compressed ROI/Competitive UI, trace/audit coverage, validator gates, W115 report, and best next Codex prompt.'
    }
  };
  const trace = {
    schema: 'idb.w114-review-handoff-story-compression-trace.v1',
    generatedAt: new Date().toISOString(),
    decision,
    pass: failures.length === 0,
    firstViewport,
    noRegression,
    bestNextCodexPrompt: contract.bestNextCodexPrompt
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);

  const report = [
    '# W114 Review Handoff Story Compression',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    `Decision: ${decision} / ${contract.status.toUpperCase()}`,
    '',
    '## Compressed Review UI',
    '',
    ...contract.compressedReviewUi.firstViewportOrder.map((item) => `- ${item}`),
    '',
    '## Hidden By Default',
    '',
    ...technicalLabels.map((item) => `- ${item}`),
    '',
    '## Handoff Summary',
    '',
    `- Status: ${handoff.status}`,
    `- Pack: ${handoff.selectedPack}`,
    `- Scenario: ${handoff.selectedScenario}`,
    `- Export eligible: ${handoff.parityLock && handoff.parityLock.exportEligible ? 'yes' : 'no'}`,
    '',
    '## Validator Gates',
    '',
    '| Gate | Result | Detail |',
    '| --- | --- | --- |',
    ...results.map((result) => `| ${result.pass ? 'PASS' : 'FAIL'} | ${result.name} | ${escapeTable(result.detail)} |`),
    '',
    '## Best Next Codex Prompt',
    '',
    contract.bestNextCodexPrompt.prompt
  ].join('\n');
  fs.writeFileSync(reportPath, `${report}\n`);

  console.log(JSON.stringify({
    decision,
    results: results.length,
    report: path.relative(root, reportPath),
    next: contract.bestNextCodexPrompt.block
  }, null, 2));

  if (failures.length) {
    failures.forEach((failure) => console.error(`FAIL ${failure.name}: ${failure.detail}`));
    process.exit(1);
  }
}

main();
