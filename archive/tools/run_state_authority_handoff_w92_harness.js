const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const dataPath = path.join(root, 'data', 'w92_state_authority_handoff_consistency.json');
const tracePath = path.join(root, 'trace_samples', 'w92_state_authority_ariat_trace.json');
const reportPath = path.join(root, 'reports', 'w92_state_authority_handoff_consistency.md');

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

function ariatState() {
  const state = {
    open: true,
    selectedLaneId: 'products_cpg',
    laneSelectionSource: 'default',
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
    briefPrepared: true,
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
      capturedAt: new Date().toISOString()
    }
  };
  return state;
}

function main() {
  const hooks = loadHooks();
  const userscript = fs.readFileSync(userscriptPath, 'utf8');
  const results = [];
  const page = ariatState().pageContext;

  const defaultState = ariatState();
  hooks.ensureWebsiteEvidenceRuntime(defaultState);
  const beforeAuthority = hooks.stateAuthorityModel(defaultState);
  hooks.reconcileStateAuthority(defaultState);
  const afterAuthority = hooks.stateAuthorityModel(defaultState);
  const afterLane = hooks.getLane(defaultState);
  const recommendation = hooks.recommendMove(afterLane, page);
  const blockedHandoff = hooks.dccRunnerHandoffPacketV1(defaultState, afterLane, page, recommendation);

  const confirmedState = JSON.parse(JSON.stringify(defaultState));
  confirmedState.acceptedPacket = hooks.buildAcceptedPacketContext(confirmedState, afterLane, page, recommendation);
  confirmedState.laneSelectionSource = 'consultant_confirmed';
  const confirmedAuthority = hooks.stateAuthorityModel(confirmedState);
  const confirmedHandoff = hooks.dccRunnerHandoffPacketV1(confirmedState, afterLane, page, recommendation);

  const manualMismatchState = ariatState();
  hooks.ensureWebsiteEvidenceRuntime(manualMismatchState);
  manualMismatchState.selectedLaneId = 'products_cpg';
  manualMismatchState.laneSelectionSource = 'manual';
  const mismatchLane = hooks.getLane(manualMismatchState);
  const mismatchAuthority = hooks.stateAuthorityModel(manualMismatchState);
  const mismatchHandoff = hooks.dccRunnerHandoffPacketV1(manualMismatchState, mismatchLane, page, hooks.recommendMove(mismatchLane, page));

  assertCase(results, 'w92_hooks_exposed', ['stateAuthorityModel', 'reconcileStateAuthority', 'dccRunnerHandoffPacketV1', 'buildAcceptedPacketContext'].every((name) => typeof hooks[name] === 'function'), 'required test hooks');
  assertCase(results, 'w92_state_reconciles_ariat_to_apparel', beforeAuthority.recommendedLaneId === 'apparel_accessories' && afterAuthority.selectedLaneId === 'apparel_accessories', JSON.stringify({ before: beforeAuthority, after: afterAuthority }));
  assertCase(results, 'w92_ariat_blocked_packet_uses_apparel_not_cpg', blockedHandoff.selectedPack === 'apparelAccessories' && blockedHandoff.selectedScenario === 'Style-to-Availability Readiness' && blockedHandoff.stateAuthority.exportedLaneId === 'apparel_accessories', JSON.stringify({ pack: blockedHandoff.selectedPack, scenario: blockedHandoff.selectedScenario, authority: blockedHandoff.stateAuthority }));
  assertCase(results, 'w92_unconfirmed_handoff_blocks_without_mismatch', blockedHandoff.status === 'blocked_until_confirmed_handoff' && blockedHandoff.blockedExample.missing.includes('consultant confirmation') && blockedHandoff.stateAuthority.hasRecommendedMismatch === false, JSON.stringify(blockedHandoff.blockedExample));
  assertCase(results, 'w92_confirmed_handoff_ready_and_consistent', confirmedAuthority.handoffEligible === true && confirmedHandoff.status === 'ready_for_dcc_suitelet_submission_review' && confirmedHandoff.selectedPack === 'apparelAccessories', JSON.stringify({ authority: confirmedAuthority, handoff: confirmedHandoff.status }));
  assertCase(results, 'w92_manual_mismatch_blocks_export_eligibility', mismatchAuthority.hasRecommendedMismatch === true && mismatchHandoff.status === 'blocked_until_confirmed_handoff' && mismatchHandoff.blockedExample.missing.includes('lane recommendation mismatch'), JSON.stringify({ authority: mismatchAuthority, missing: mismatchHandoff.blockedExample.missing }));
  assertCase(results, 'w92_no_regression_guards_present', /noSuiteScriptInvocationFromIdb/.test(userscript) && /noIdbTransactionWrite/.test(userscript) && /dccOwnsObjectGeneration/.test(userscript) && /notesRole: 'story_only'/.test(userscript), 'no write / notes story-only / DCC ownership');

  const failures = results.filter((result) => !result.pass);
  const decision = failures.length ? 'FAIL' : 'PASS';
  const bestNextCodexPrompt = {
    block: 'W93: Consultant UX Compression And Evidence-First Review',
    prompt: 'Move through W93: Consultant UX Compression And Evidence-First Review. Compress the Plan, Review, Run, and Trace tabs so consultants see answer-first guidance in under 30 seconds: Plan shows prospect, website classification, confidence, DCC pack, and one primary action; Review shows DCC handoff status, selected pack/scenario, objects DCC will prepare, blockers, and export; Run shows live script first; Trace shows export/checklist/reset only. Preserve W92 state authority so visible lane, confirmed lane, exported lane, and DCC pack cannot disagree. Preserve no IDB writes, no SuiteScript invocation, no transaction writes, hosted resolver optional until remoteSmokeExecuted=true, notes story-only, consultant confirmation required, and DCC ownership of object generation. Output compressed UI changes, visual regression checklist, validator gates, W93 report, and best next Codex prompt.'
  };

  const trace = {
    schema: 'idb.w92-state-authority-handoff-consistency-trace.v1',
    generatedAt: new Date().toISOString(),
    decision,
    beforeAuthority,
    afterAuthority,
    blockedHandoff: {
      status: blockedHandoff.status,
      selectedPack: blockedHandoff.selectedPack,
      selectedScenario: blockedHandoff.selectedScenario,
      stateAuthority: blockedHandoff.stateAuthority,
      missing: blockedHandoff.blockedExample.missing
    },
    confirmedAuthority,
    confirmedHandoff: {
      status: confirmedHandoff.status,
      selectedPack: confirmedHandoff.selectedPack,
      selectedScenario: confirmedHandoff.selectedScenario,
      stateAuthority: confirmedHandoff.stateAuthority
    },
    mismatchAuthority,
    mismatchHandoff: {
      status: mismatchHandoff.status,
      selectedPack: mismatchHandoff.selectedPack,
      selectedScenario: mismatchHandoff.selectedScenario,
      stateAuthority: mismatchHandoff.stateAuthority,
      missing: mismatchHandoff.blockedExample.missing
    },
    validatorResults: results,
    bestNextCodexPrompt
  };

  const contract = {
    schema: 'idb.w92-state-authority-handoff-consistency.v1',
    status: decision === 'PASS' ? 'state_authority_ready' : 'state_authority_failed',
    objective: 'Keep website recommendation, working lane, confirmed lane, visible Review packet, DCC handoff export, and trace aligned.',
    stateAuthorityModel: {
      recommendedLaneId: 'website evidence recommendation',
      selectedLaneId: 'working lane used by Plan, Story Bar, Review, and packet preview',
      confirmedLaneId: 'consultant-confirmed lane from accepted packet',
      exportedLaneId: 'lane used by DCC handoff export',
      blockerPolicy: 'DCC handoff is blocked until selected/exported lane matches confirmed lane and high-confidence website evidence is not contradicted.'
    },
    ariatRegression: trace,
    noRegression: {
      noIdbWrites: true,
      noSuiteScriptInvocationFromIdb: true,
      noTransactionWritesFromIdb: true,
      hostedResolverOptionalUntilRemoteSmokeExecuted: true,
      notesStoryOnly: true,
      dccOwnsObjectGeneration: true
    },
    bestNextCodexPrompt
  };

  writeJson(tracePath, trace);
  writeJson(dataPath, contract);

  const report = [
    '# W92 State Authority And Handoff Consistency',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    `Decision: ${decision} / STATE AUTHORITY ${decision === 'PASS' ? 'READY' : 'FAILED'}`,
    '',
    '## What Changed',
    '',
    '- Added `stateAuthorityModel` for recommended, selected, confirmed, and exported lane state.',
    '- Added `reconcileStateAuthority` so high-confidence website evidence can move the working lane away from stale defaults before Review/export.',
    '- Added handoff blockers for unconfirmed or mismatched lane authority.',
    '- DCC handoff packet now carries state authority and blocks mismatch eligibility.',
    '- Trace export now includes state authority.',
    '',
    '## Ariat Regression',
    '',
    `- Recommended lane: ${afterAuthority.recommendedLaneName}`,
    `- Selected/exported lane after reconcile: ${afterAuthority.exportedLaneName}`,
    `- Blocked handoff pack before confirmation: ${blockedHandoff.selectedPack} / ${blockedHandoff.selectedScenario}`,
    `- Confirmed handoff status: ${confirmedHandoff.status}`,
    `- Manual mismatch status: ${mismatchHandoff.status}`,
    '',
    '## Validator Gates',
    '',
    '| Status | Rule | Detail |',
    '| --- | --- | --- |',
    ...results.map((result) => `| ${result.pass ? 'PASS' : 'FAIL'} | ${escapeTable(result.name)} | ${escapeTable(result.detail)} |`),
    '',
    '## Best Next Codex Prompt',
    '',
    bestNextCodexPrompt.prompt,
    ''
  ].join('\n');
  fs.writeFileSync(reportPath, report);

  if (failures.length) {
    console.error(`W92 state authority harness FAIL: ${failures.length} failure(s)`);
    failures.forEach((failure) => console.error(`- ${failure.name}: ${failure.detail}`));
    process.exit(1);
  }
  console.log(`W92 state authority harness PASS: ${results.length}/${results.length}`);
}

main();
