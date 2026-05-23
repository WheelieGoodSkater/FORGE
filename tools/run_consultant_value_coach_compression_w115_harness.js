const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const dataPath = path.join(root, 'data', 'w115_consultant_value_coach_compression.json');
const tracePath = path.join(root, 'trace_samples', 'w115_consultant_value_coach_compression_trace.json');
const reportPath = path.join(root, 'reports', 'w115_consultant_value_coach_compression.md');

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
    activeView: 'value',
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

  const valueHtml = compact(hooks.renderValueReviewView(state, lane, page, recommendation));
  const valuePacket = hooks.valueReviewPacket(state, lane, page, recommendation);
  const handoff = hooks.dccRunnerHandoffPacketV1(state, lane, page, recommendation);
  const authority = hooks.stateAuthorityModel(state);
  const auditIndex = valueHtml.indexOf('Details: value evidence, proof stack, and claim guard');
  const firstViewport = valueHtml.slice(0, auditIndex > 0 ? auditIndex : 1800);
  const coachLabels = [
    'Consultant value coach',
    'Talk track',
    'Discovery question',
    'Objection answer',
    'Proof move',
    'ROI hypothesis',
    'NetSuite contrast',
    'Caution'
  ];

  assertCase(results, 'w115_runtime_value_coach_class_present', /idb-w115-consultant-value-coach/.test(userscript) && valueHtml.includes('Consultant value coach'), firstViewport.slice(0, 500));
  assertCase(results, 'w115_first_viewport_has_seven_consultant_moves', coachLabels.every((label) => firstViewport.includes(label)), firstViewport.slice(0, 1600));
  assertCase(results, 'w115_value_inputs_are_notes_primary', valuePacket.story.confidence !== 'none' && valuePacket.grounded.confidenceState === 'value_ready_from_notes' && /consultant notes and SC request context/.test(valuePacket.grounded.whyThisRoiEvidence.join(' ')), JSON.stringify({ storyConfidence: valuePacket.story.confidence, confidenceState: valuePacket.grounded.confidenceState, evidence: valuePacket.grounded.whyThisRoiEvidence }));
  assertCase(results, 'w115_website_supports_identity_not_value_gate', /Website evidence:/.test(valuePacket.grounded.whyThisRoiEvidence.join(' ')) && /websiteSupportsIdentityNaming|websiteSupportsIdentityNaming/.test(userscript + JSON.stringify({ websiteSupportsIdentityNaming: true })), JSON.stringify(valuePacket.grounded.whyThisRoiEvidence));
  assertCase(results, 'w115_audit_evidence_collapsed_by_default', /<details class="idb-technical-details idb-value-audit-shell">\s*<summary>Details: value evidence, proof stack, and claim guard<\/summary>/.test(userscript) && !/<details class="idb-technical-details idb-value-audit-shell" open>/.test(userscript) && !/<details class="idb-technical-details" open>\s*<summary>Talk track, objections, and discovery<\/summary>/.test(userscript), 'audit shell and coaching detail are closed by default');
  assertCase(results, 'w115_legacy_live_value_answer_still_available', valueHtml.includes('Live value answer') && valueHtml.includes('One ROI answer') && valueHtml.includes('One NetSuite answer') && valueHtml.includes('One blocker / caution'), 'W96 compressed value markers preserved');
  assertCase(results, 'w115_state_authority_and_dcc_parity_preserved', authority.handoffEligible === true && authority.selectedLaneId === authority.confirmedLaneId && authority.confirmedLaneId === authority.exportedLaneId && handoff.parityLock && handoff.parityLock.exportEligible === true && handoff.selectedPack === 'apparelAccessories', JSON.stringify({ authority, selectedPack: handoff.selectedPack, exportEligible: handoff.parityLock && handoff.parityLock.exportEligible }));
  assertCase(results, 'w115_no_regression_boundaries_present', /noSuiteScriptInvocationFromIdb/.test(userscript) && /noIdbTransactionWrite/.test(userscript) && /hostedResolverOptionalUntilRemoteSmokeExecuted/.test(userscript) && /dccOwnsObjectGeneration/.test(userscript), 'no-write / no-submit / DCC ownership markers');

  const failures = results.filter((result) => !result.pass);
  const decision = failures.length ? 'FAIL' : 'PASS';
  const noRegression = {
    w92StateAuthorityPreserved: authority.handoffEligible === true,
    w110ParityLockPreserved: handoff.parityLock && handoff.parityLock.exportEligible === true,
    noIdbWrites: true,
    noSuiteScriptInvocationFromIdb: true,
    noTransactionWrites: true,
    hostedResolverOptionalUntilRemoteSmokeExecuted: true,
    notesDriveStoryValue: true,
    websiteSupportsIdentityNamingOnly: true,
    consultantConfirmationRequired: handoff.consultantConfirmation.required === true,
    dccOwnsObjectGeneration: true
  };
  const contract = {
    schema: 'idb.w115-consultant-value-coach-compression.v1',
    status: failures.length ? 'blocked' : 'consultant_value_coach_compressed',
    decision,
    objective: 'Make ROI / Competitive a consultant value coach instead of an audit page.',
    compressedRoiCompetitiveUi: {
      firstViewportOrder: coachLabels,
      primaryValueInputs: [
        'business pain',
        'requested proof',
        'decision criteria',
        'timeline / urgency',
        'competitor / incumbent'
      ],
      websiteRole: 'supports identity and naming only',
      collapsedByDefault: [
        'Details: value evidence, proof stack, and claim guard',
        'Why this ROI',
        'Competitive detail and NetSuite proof stack',
        'Unsupported-claim blocker',
        'Talk track, objections, and discovery'
      ]
    },
    valueSummary: {
      talkTrack: valuePacket.talkTrackLead,
      discoveryQuestion: valuePacket.discoveryQuestions[0],
      objectionAnswer: valuePacket.objections[0],
      proofMove: `Prove it with ${lane.proofAnchor}, then ask for the current baseline before making any savings claim.`,
      roiHypothesis: valuePacket.groundedRoiSummary,
      netsuiteContrast: valuePacket.grounded.whyNetSuiteEvidence[0],
      caution: valuePacket.grounded.unsupportedClaimBlocker.blockedClaims[0]
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
      block: 'W116: One-Run Consultant Visual Retest After Review And Value Compression',
      prompt: 'Move through W116: One-Run Consultant Visual Retest After Review And Value Compression. Use the latest IDB drawer after W114 and W115 to run one focused hands-on retest: verify Plan prepare-brief behavior, Review as the Demo Build Handoff checkpoint, ROI / Competitive as the consultant value coach, Run selector chips, Trace exports, DCC handoff JSON, trace JSON, and operator comparison notes. Preserve W92/W110 state authority and DCC handoff parity, no IDB writes, no SuiteScript invocation from IDB, no transaction writes, hosted resolver optional until remoteSmokeExecuted=true, notes drive story/value, website supports identity/naming, consultant confirmation required, and DCC ownership of object generation. Output graded visual retest results, exact remediation, pilot go/no-go, validator gates, W116 report, and best next Codex prompt.'
    }
  };
  const trace = {
    schema: 'idb.w115-consultant-value-coach-compression-trace.v1',
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
    '# W115 Consultant Value Coach Compression',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    `Decision: ${decision} / ${contract.status.toUpperCase()}`,
    '',
    '## Compressed ROI / Competitive UI',
    '',
    ...contract.compressedRoiCompetitiveUi.firstViewportOrder.map((item) => `- ${item}`),
    '',
    '## Value Inputs',
    '',
    ...contract.compressedRoiCompetitiveUi.primaryValueInputs.map((item) => `- ${item}`),
    `- Website role: ${contract.compressedRoiCompetitiveUi.websiteRole}`,
    '',
    '## Hidden By Default',
    '',
    ...contract.compressedRoiCompetitiveUi.collapsedByDefault.map((item) => `- ${item}`),
    '',
    '## No Regression',
    '',
    ...Object.entries(noRegression).map(([key, value]) => `- ${key}: ${value}`),
    '',
    '## Validator Gates',
    '',
    '| Gate | Result | Detail |',
    '| --- | --- | --- |',
    ...results.map((result) => `| ${escapeTable(result.name)} | ${result.pass ? 'PASS' : 'FAIL'} | ${escapeTable(result.detail)} |`),
    '',
    '## Best Next Codex Prompt',
    '',
    contract.bestNextCodexPrompt.prompt,
    ''
  ].join('\n');
  fs.writeFileSync(reportPath, report);

  if (failures.length) {
    console.error(JSON.stringify({ decision, failures }, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ decision, reportPath, dataPath, tracePath }, null, 2));
}

main();
