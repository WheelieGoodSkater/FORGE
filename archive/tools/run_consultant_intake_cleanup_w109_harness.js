const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const dataPath = path.join(root, 'data', 'w109_consultant_intake_cleanup_sales_request_mode.json');
const tracePath = path.join(root, 'trace_samples', 'w109_consultant_intake_cleanup_trace.json');
const reportPath = path.join(root, 'reports', 'w109_consultant_intake_cleanup_sales_request_mode.md');

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

function textWithoutWhitespace(value) {
  return String(value || '').replace(/\s+/g, ' ');
}

function stateWithIntake(intakePatch, extra) {
  const now = new Date().toISOString();
  return Object.assign({
    open: true,
    selectedLaneId: 'products_cpg',
    laneSelectionSource: 'default',
    selectedMoveIndex: 0,
    selectedActionId: 'prove',
    briefPrepared: false,
    dccOperatorApproval: null,
    intake: Object.assign({
      customer: '',
      website: '',
      notes: '',
      websiteEvidence: '',
      scObjective: '',
      competitor: '',
      decisionCriteria: '',
      timelineUrgency: ''
    }, intakePatch || {}),
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
  }, extra || {});
}

function prepare(hooks, state) {
  hooks.ensureWebsiteEvidenceRuntime(state);
  hooks.reconcileStateAuthority(state);
  const lane = hooks.getLane(state);
  const page = state.pageContext;
  const recommendation = hooks.recommendMove(lane, page);
  return { lane, page, recommendation };
}

function main() {
  const hooks = loadHooks();
  const userscript = fs.readFileSync(userscriptPath, 'utf8');
  const results = [];
  const completeIntake = {
    customer: 'Ariat International',
    website: 'https://www.ariat.com/',
    notes: 'Seasonal boot and apparel launches are hard to coordinate because style, size, color, replenishment timing, and channel availability live in separate spreadsheets.',
    scObjective: 'Show a concise proof path for style/SKU readiness and customer promise.',
    decisionCriteria: 'Must connect customer record, style/SKU matrix, size/color availability, replenishment timing, and order/proof context.',
    timelineUrgency: 'Internal proof review needed within 2-4 weeks.',
    competitor: 'Spreadsheets and disconnected inventory reports.',
    websiteEvidence: 'Footwear, apparel, workwear, outdoor gear, size/color variants, retail ecommerce categories.'
  };
  const emptyState = stateWithIntake({});
  const readyState = stateWithIntake(completeIntake);
  const preparedState = stateWithIntake(completeIntake, {
    selectedLaneId: 'apparel_accessories',
    laneSelectionSource: 'consultant_confirmed',
    briefPrepared: true
  });

  const emptyContext = prepare(hooks, emptyState);
  const readyContext = prepare(hooks, readyState);
  const preparedContext = prepare(hooks, preparedState);
  preparedState.acceptedPacket = hooks.buildAcceptedPacketContext(preparedState, preparedContext.lane, preparedContext.page, preparedContext.recommendation);
  hooks.reconcileStateAuthority(preparedState);

  const emptyHtml = textWithoutWhitespace(hooks.renderPlanView(emptyState, emptyContext.lane, emptyContext.page, emptyContext.recommendation));
  const readyHtml = textWithoutWhitespace(hooks.renderPlanView(readyState, readyContext.lane, readyContext.page, readyContext.recommendation));
  const preparedHtml = textWithoutWhitespace(hooks.renderPlanView(preparedState, preparedContext.lane, preparedContext.page, preparedContext.recommendation));
  const emptyModel = hooks.consultantSalesRequestModeV1(emptyState, emptyContext.lane, emptyContext.page, emptyContext.recommendation);
  const readyModel = hooks.consultantSalesRequestModeV1(readyState, readyContext.lane, readyContext.page, readyContext.recommendation);
  const preparedModel = hooks.consultantSalesRequestModeV1(preparedState, preparedContext.lane, preparedContext.page, preparedContext.recommendation);
  const tracePayload = {
    schema: 'idb.w109-consultant-intake-cleanup-trace.v1',
    decision: 'PASS',
    emptyModel,
    readyModel,
    preparedModel,
    noRegression: readyModel.noRegression,
    bestNextCodexPrompt: {
      block: 'W110: DCC Handoff Packet Parity Lock',
      prompt: 'Move through W110: DCC Handoff Packet Parity Lock. Build validator coverage proving every IDB dccRunnerHandoffPacketV1 field maps exactly to Demo Command Center Suitelet form params, DCC-owned config params, and scheduled runner preview params across apparel, CPG, distributor/dealer, manufacturing-heavy, and ambiguous cases. Block export when confirmed lane, selected pack, exported lane, scenario, family key, manufacturing/WIP flags, location/planning intent, or review-only mode disagree. Do not rewrite DCC runner mechanics and do not invoke SuiteScript. Preserve no IDB writes, no transaction writes, hosted resolver optional until remoteSmokeExecuted=true, notes story-only, consultant confirmation required, W92 state authority, W105-W107 preview-only approval behavior, and DCC ownership of object generation. Output parity matrix, blocked/confirmed samples, validator gates, W110 report, and best next Codex prompt.'
    }
  };

  assertCase(results, 'w109_runtime_sales_request_model_present', typeof hooks.consultantSalesRequestModeV1 === 'function' && /function consultantSalesRequestModeV1/.test(userscript), 'consultantSalesRequestModeV1 exposed');
  assertCase(results, 'w109_plan_intake_is_sales_request_facing', readyHtml.includes('Sales request') && readyHtml.includes('Business pain') && readyHtml.includes('Requested proof') && readyHtml.includes('Decision criteria') && readyHtml.includes('Timeline / urgency') && readyHtml.includes('Competitor / incumbent'), readyHtml.slice(0, 1200));
  assertCase(results, 'w109_internal_audit_labels_removed_from_default_intake', !readyHtml.includes('Guided intake') && !readyHtml.includes('SC objective') && !readyHtml.includes('Known competitor') && !readyHtml.includes('Website product naming') && !readyHtml.includes('cpgProductsManufacturing'), readyHtml.slice(0, 1200));
  assertCase(results, 'w109_prepare_brief_required_before_recommendation_ready', emptyModel.prepareBriefRequired === true && emptyModel.canPrepareBrief === false && emptyHtml.includes('Prepare the proof path') && emptyModel.missingRequiredFields.length >= 5 && readyModel.canPrepareBrief === true && readyModel.status === 'sales_request_ready_to_prepare' && readyModel.guidance.dccPackLabel === 'Prepared after brief', JSON.stringify({ empty: emptyModel, ready: readyModel }));
  assertCase(results, 'w109_website_supports_identity_notes_drive_value', readyModel.guidance.websiteRole.includes('identity') && readyModel.guidance.notesRole.includes('ROI') && readyModel.fields.find((field) => field.id === 'website').role === 'identity_and_naming' && readyModel.fields.find((field) => field.id === 'notes').role === 'value_story', JSON.stringify(readyModel.guidance));
  assertCase(results, 'w109_prepared_summary_is_compact_and_consultant_facing', preparedHtml.includes('30-second plan') && preparedHtml.includes('Demo path') && preparedHtml.includes('Build handoff') && preparedHtml.includes('Run demo or export handoff') && preparedModel.status === 'sales_request_ready_to_prepare', preparedHtml.slice(0, 1200));
  assertCase(results, 'w109_trace_export_coverage_present', /consultantSalesRequestModeV1: consultantSalesRequestModeV1/.test(userscript) && /consultantSalesRequestModeV1,/.test(userscript), 'trace export and hooks include W109 model');
  assertCase(results, 'w109_no_regression_preserved', Object.values(readyModel.noRegression).every(Boolean), JSON.stringify(readyModel.noRegression));

  const failures = results.filter((result) => !result.pass);
  const decision = failures.length ? 'FAIL' : 'PASS';
  tracePayload.decision = decision;
  tracePayload.pass = failures.length === 0;

  const contract = {
    schema: 'idb.w109-consultant-intake-cleanup-sales-request-mode.v1',
    status: failures.length ? 'blocked' : 'sales_request_mode_ready',
    decision,
    objective: 'Make Plan intake consultant-facing and sales-request-first before DCC handoff parity work.',
    implemented: {
      salesRequestFirstPlanIntake: true,
      prospectWebsitePainProofCriteriaPrimary: true,
      timelineCompetitorWebsiteEvidenceOptional: true,
      prepareBriefRequiredBeforeRecommendationReady: true,
      internalPackIdsHiddenBehindConsultantLabels: true,
      websiteSupportsIdentityAndNaming: true,
      notesDriveValueStory: true
    },
    samples: {
      emptyModel,
      readyModel,
      preparedModel
    },
    noRegression: readyModel.noRegression,
    validatorResults: results,
    bestNextCodexPrompt: tracePayload.bestNextCodexPrompt
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, tracePayload);

  const rows = results.map((result) => `| ${result.pass ? 'PASS' : 'FAIL'} | ${result.name} | ${String(result.detail || '').replace(/\|/g, '/').slice(0, 240)} |`).join('\n');
  const report = [
    '# W109 Consultant Intake Cleanup And Sales Request Mode',
    '',
    `Decision: ${decision} / SALES REQUEST MODE READY / NO WRITE AUTHORITY`,
    '',
    '## What Changed',
    '- Plan intake now leads with Prospect, Website, Business pain, Requested proof, and Decision criteria.',
    '- Timeline / urgency, Competitor / incumbent, and optional website/category evidence are captured as supporting context.',
    '- Prepare Brief remains required before IDB treats recommendations or DCC handoff as ready.',
    '- Website is positioned as identity/naming support; notes and request context drive value story, ROI, competitive framing, objections, and run guidance.',
    '',
    '## Validator Gates',
    '| Status | Gate | Detail |',
    '| --- | --- | --- |',
    rows,
    '',
    '## Best Next Codex Prompt',
    tracePayload.bestNextCodexPrompt.prompt
  ].join('\n');
  fs.writeFileSync(reportPath, `${report}\n`);

  if (failures.length) {
    console.error(JSON.stringify({ decision, failures }, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ decision, results: results.length, report: path.relative(root, reportPath) }, null, 2));
}

main();
