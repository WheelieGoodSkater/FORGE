#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..', '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const fixturePath = path.join(root, 'archive', 'fixtures', 'w249_lane_pack_expansion_qa_fixtures.json');
const reportPath = path.join(root, 'archive', 'reports', 'w259_header_feedback_placeholder_visual_acceptance.md');
const tracePath = path.join(root, 'archive', 'trace_samples', 'w259_header_feedback_placeholder_visual_acceptance_trace.json');

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function assertCase(results, id, pass, evidence) {
  results.push({ id, pass: Boolean(pass), evidence: evidence || '' });
}

function loadHooks() {
  const store = new Map();
  const storage = {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key)
  };
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
    URLSearchParams,
    Promise,
    Blob: function Blob() {},
    fetch: () => Promise.reject(new Error('live fetch disabled in W259 harness')),
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
      setInterval: () => 1,
      clearInterval: () => {},
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
  vm.runInContext(read(userscriptPath), sandbox, { filename: userscriptPath });
  if (!sandbox.__IDB_TEST_HOOKS__) throw new Error('Missing IDB test hooks.');
  return sandbox.__IDB_TEST_HOOKS__;
}

function stateFor(fixture) {
  return {
    selectedLaneId: fixture.laneId,
    laneSelectionSource: 'consultant_confirmed',
    selectedActionId: 'prove',
    briefPrepared: true,
    setupEditMode: false,
    intake: {
      customer: fixture.customer,
      website: fixture.website,
      notes: fixture.notes
    },
    toggles: {},
    pageContext: {
      title: 'NetSuite Home',
      url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/center/card.nl',
      pageType: 'NetSuite page',
      contextId: 'generic_netsuite_page',
      confidence: 'low'
    }
  };
}

function record(raw) {
  return {
    role: raw.role,
    recordType: raw.recordType,
    type: raw.recordType,
    name: raw.name,
    internalId: raw.internalId,
    url: `https://YOUR_ACCOUNT_ID.app.netsuite.com${raw.path}?id=${raw.internalId}`
  };
}

function completedResult(fixture) {
  return {
    schema: 'forge.completed-runner-result.v2',
    status: 'completed',
    runStatus: 'completed',
    generatedRecordOwner: 'governed_runner_internal_build_engine',
    resolvedOperatingMode: fixture.resolvedOperatingMode,
    records: fixture.records.map(record)
  };
}

function renderedFor(hooks, fixture) {
  const state = stateFor(fixture);
  hooks.ensureWebsiteEvidenceRuntime(state);
  hooks.reconcileStateAuthority(state);
  const lane = hooks.getLane(state);
  const page = state.pageContext;
  const recommendation = hooks.recommendMove(lane, page);
  const normalized = hooks.canonicalImportResultNormalizationW245(
    completedResult(fixture),
    state,
    lane,
    page,
    recommendation
  );
  state.dccFinalNamingResult = completedResult(fixture);
  const story = normalized.consultantStorySurfaceW247;
  return {
    state,
    story,
    storyHtml: hooks.renderConsultantStorySurfaceW248(story),
    drawerHtml: hooks.renderDrawer(state),
    qa: hooks.receiptDrivenLaneExpansionQaW255(normalized.versionedLanePackW246.lanePack, story)
  };
}

function main() {
  const hooks = loadHooks();
  const fixtures = JSON.parse(read(fixturePath)).fixtures;
  const userscript = read(userscriptPath);
  const report = read(reportPath);
  const trace = JSON.parse(read(tracePath));
  const sample = renderedFor(hooks, fixtures[0]);
  const contract = hooks.feedbackPlaceholderContractW259();
  const action = hooks.feedbackPlaceholderActionW259();
  const packet = hooks.visualAcceptancePacketW259();
  const results = [];

  assertCase(results, 'feedback-placeholder-contract-reviewable',
    contract.schema === 'forge.w259.feedback-placeholder-contract.v1' &&
      contract.status === 'placeholder_ready' &&
      contract.buttonLabel === 'Bug / Enhancement' &&
      contract.futureUrlConfigured === false &&
      contract.runtimeAuthorityChanged === false,
    JSON.stringify(contract));

  assertCase(results, 'bug-enhancement-button-renders-safe-noop',
    /data-idb-feedback-placeholder="w259"/.test(sample.drawerHtml) &&
      /aria-disabled="true"/.test(sample.drawerHtml) &&
      /Bug \/ Enhancement/.test(sample.drawerHtml) &&
      action.status === 'no_op' &&
      action.externalUrlOpened === false &&
      action.runtimeAuthorityChanged === false,
    sample.drawerHtml.slice(0, 1400));

  assertCase(results, 'no-external-url-network-tracking-storage-or-install-action',
    contract.externalUrl === '' &&
      contract.networkAllowed === false &&
      contract.trackingAllowed === false &&
      contract.localStorageWriteAllowed === false &&
      contract.installActionAllowed === false &&
      !/data-idb-feedback-placeholder[\s\S]{0,500}(href=|window\.open|fetch\(|localStorage\.setItem|data-idb-install|Install lane pack)/i.test(sample.drawerHtml) &&
      !/function feedbackPlaceholderActionW259\(\)[\s\S]{0,800}(window\.open|fetch\(|localStorage\.setItem|trace\(|data-idb-install|Install lane pack)/i.test(userscript),
    'feedback placeholder has no URL/network/tracking/storage/install path');

  assertCase(results, 'compact-header-keeps-core-controls-reachable',
    /idb-forge-brand/.test(sample.drawerHtml) &&
      /idb-version-pill/.test(sample.drawerHtml) &&
      /idb-bug-button/.test(sample.drawerHtml) &&
      /data-idb-close/.test(sample.drawerHtml) &&
      /idb-state-tabs/.test(sample.drawerHtml) &&
      /idb-card/.test(sample.drawerHtml) &&
      /background: #5a95a6/.test(userscript) &&
      /background: #efc85f/.test(userscript),
    sample.drawerHtml.slice(0, 1800));

  assertCase(results, 'visual-acceptance-packet-covers-header-and-story',
    packet.schema === 'forge.w259.header-story-visual-acceptance-packet.v1' &&
      ['compact_header_logo_readability', 'version_placement', 'feedback_placeholder_noop', 'close_button_reachable', 'tabs_first_card_reachable', 'live_proof_cta_density', 'expandable_coaching_available', 'receipt_below_coaching'].every((id) => packet.checks.some((check) => check.id === id)) &&
      packet.runtimeAuthorityChanged === false &&
      packet.installActionsAllowed === false,
    JSON.stringify(packet));

  assertCase(results, 'w258-first-glance-story-remains-compact',
    /Live proof CTA/.test(sample.storyHtml) &&
      /Open [^<]+/.test(sample.storyHtml) &&
      /Proof action/.test(sample.storyHtml) &&
      /Safe claim/.test(sample.storyHtml) &&
      /Stop/.test(sample.storyHtml) &&
      /Evidence confidence:/.test(sample.storyHtml),
    sample.storyHtml.slice(0, 1800));

  assertCase(results, 'w256-w257-expandable-and-w254-below-coaching',
    /<details class="idb-technical-details idb-w256-live-demo-script">/.test(sample.storyHtml) &&
      /<details class="idb-technical-details idb-w257-guided-demo-sequence">/.test(sample.storyHtml) &&
      /idb-w254-evidence-receipt/.test(sample.storyHtml) &&
      sample.storyHtml.indexOf('idb-w257-guided-demo-sequence') < sample.storyHtml.indexOf('idb-w254-evidence-receipt'),
    sample.storyHtml.slice(0, 3200));

  assertCase(results, 'normal-ui-hides-diagnostics-and-admin-review',
    !/raw JSON|stack trace|runnerTaskId|schema:|hardLimits|writeAuthority|idb-w252-lane-pack-review|install action/i.test(sample.storyHtml) &&
      !/raw JSON|stack trace|data-idb-install|Install lane pack/i.test(sample.drawerHtml),
    sample.storyHtml.slice(0, 1800));

  assertCase(results, 'w255-receipt-driven-qa-remains-available',
    sample.qa.status === 'pass',
    JSON.stringify(sample.qa));

  const weakState = stateFor(fixtures[0]);
  weakState.intake.website = 'https://unknown-example.com';
  weakState.intake.notes = 'Conflicting evidence across manufacturing, distribution, and retail.';
  const weakStory = hooks.consultantStorySurfaceFromLanePackW247(weakState, null, { displayReadyRecords: [] });
  const weakHtml = hooks.renderConsultantStorySurfaceW248(weakStory);
  assertCase(results, 'weak-conflicting-evidence-remains-confirmation-gated',
    weakStory.status === 'needs_lane_confirmation' &&
      /Confirm lane before opening proof records/.test(weakStory.openTarget) &&
      /Evidence confidence: Low/.test(weakHtml),
    weakHtml.slice(0, 1800));

  assertCase(results, 'report-and-trace-archived',
    /W259/.test(report) && trace.schema === 'forge.w259.header-feedback-placeholder-visual-acceptance.trace.v1',
    trace.schema);

  const failed = results.filter((result) => !result.pass);
  results.forEach((result) => {
    console.log(`${result.pass ? 'PASS' : 'FAIL'} ${result.id} ${result.evidence}`);
  });
  if (failed.length) {
    console.error(`\nW259 harness failed ${failed.length}/${results.length} cases.`);
    process.exit(1);
  }
  console.log(`\nW259 harness passed ${results.length}/${results.length} cases.`);
}

main();
