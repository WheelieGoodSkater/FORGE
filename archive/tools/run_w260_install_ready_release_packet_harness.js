#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..', '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const fixturePath = path.join(root, 'archive', 'fixtures', 'w249_lane_pack_expansion_qa_fixtures.json');
const reportPath = path.join(root, 'archive', 'reports', 'w260_install_ready_release_packet.md');
const tracePath = path.join(root, 'archive', 'trace_samples', 'w260_install_ready_release_packet_trace.json');

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
    fetch: () => Promise.reject(new Error('live fetch disabled in W260 harness')),
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
  const result = completedResult(fixture);
  const normalized = hooks.canonicalImportResultNormalizationW245(
    result,
    state,
    lane,
    page,
    recommendation
  );
  state.dccFinalNamingResult = result;
  state.selectedView = 'review';
  const story = normalized.consultantStorySurfaceW247;
  return {
    state,
    story,
    storyHtml: hooks.renderConsultantStorySurfaceW248(story),
    drawerHtml: hooks.renderDrawer(state),
    qa: hooks.receiptDrivenLaneExpansionQaW255(normalized.versionedLanePackW246.lanePack, story)
  };
}

function importedContextForWording(hooks) {
  const state = {
    selectedLaneId: 'industrial_distribution',
    selectedActionId: 'prove',
    laneSelectionSource: 'consultant_confirmed',
    briefPrepared: true,
    setupEditMode: false,
    intake: {
      customer: 'Grainger',
      website: 'https://grainger.com',
      notes: 'Prove supplier risk, branch promise, and ROI.'
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
  hooks.ensureWebsiteEvidenceRuntime(state);
  hooks.reconcileStateAuthority(state);
  const lane = hooks.getLane(state);
  const page = state.pageContext;
  const recommendation = hooks.recommendMove(lane, page);
  const finalNaming = hooks.dccFinalNamingResultV1({
    schema: 'forge.completed-runner-result.v2',
    status: 'completed',
    runStatus: 'completed',
    generatedRecordOwner: 'governed_runner_internal_build_engine',
    resolvedOperatingMode: 'distribution_replenishment',
    records: [
      record({ role: 'customer', recordType: 'customer', name: 'Grainger Customer Account', internalId: '2001', path: '/app/common/entity/custjob.nl' }),
      record({ role: 'sales_order', recordType: 'salesorder', name: 'SO260', internalId: '3002', path: '/app/accounting/transactions/salesord.nl' }),
      record({ role: 'branch_or_product_sku', recordType: 'inventoryitem', name: 'Branch Fulfillment SKU', internalId: '4003', path: '/app/common/item/item.nl' }),
      record({ role: 'replenishment_or_availability_flow', recordType: 'inventoryitem', name: 'Branch Availability Flow', internalId: '4004', path: '/app/common/item/item.nl' })
    ]
  }, state, lane, page, recommendation);
  state.dccFinalNamingResult = finalNaming;
  return { state, lane, page, recommendation };
}

function main() {
  const hooks = loadHooks();
  const fixtures = JSON.parse(read(fixturePath)).fixtures;
  const userscript = read(userscriptPath);
  const report = read(reportPath);
  const trace = JSON.parse(read(tracePath));
  const sample = renderedFor(hooks, fixtures[0]);
  const packet = hooks.installReadyReleasePacketW260();
  const smoke = hooks.consultantAdminSmokeScriptW260();
  const wordingContext = importedContextForWording(hooks);
  const wordingReviewHtml = hooks.renderReviewView(wordingContext.state, wordingContext.lane, wordingContext.page, wordingContext.recommendation);
  const wordingRunHtml = hooks.renderRunView(wordingContext.state, wordingContext.lane, wordingContext.page, wordingContext.recommendation, wordingContext.recommendation.move, { id: 'prove' }, 'W260 wording smoke');
  const feedbackContract = hooks.feedbackPlaceholderContractW259();
  const feedbackAction = hooks.feedbackPlaceholderActionW259();
  const results = [];

  assertCase(results, 'release-packet-installs-only-drawer-script',
    packet.schema === 'forge.w260.install-ready-release-packet.v1' &&
      packet.installTarget === 'idb-drawer.user.js' &&
      packet.updateOnly.length === 1 &&
      packet.updateOnly[0] === 'idb-drawer.user.js' &&
      /Update\/install `idb-drawer\.user\.js` only\./.test(report),
    JSON.stringify({ installTarget: packet.installTarget, updateOnly: packet.updateOnly }));

  assertCase(results, 'release-packet-do-not-update-boundaries',
    ['W144 adapter', 'runner', 'SuiteScript deployment', 'image lookup settings', 'lane-pack contract source'].every((item) =>
      packet.doNotUpdate.includes(item) && report.includes(item) && trace.doNotUpdate.includes(item)
    ) &&
      packet.noLiveRunnerInvocationRequired === true &&
      packet.drawerCreatedRecordsEnabled === false &&
      packet.drawerTransactionWritesEnabled === false,
    JSON.stringify(packet.doNotUpdate));

  assertCase(results, 'smoke-script-covers-required-checks',
    smoke.schema === 'forge.w260.consultant-admin-smoke-script.v1' &&
      ['launcher_opens_drawer', 'compact_header_visible', 'feedback_placeholder_noop', 'pre_import_fake_links_blocked', 'valid_import_story_ready', 'live_proof_cta_visible', 'coaching_receipt_expandable', 'weak_evidence_confirmation', 'rollback_ready'].every((id) =>
        smoke.steps.some((step) => step.id === id) && trace.smokeChecks.includes(id)
      ) &&
      /Launcher opens drawer/.test(report) &&
      /Weak evidence confirmation/.test(report),
    JSON.stringify(smoke.steps.map((step) => step.id)));

  assertCase(results, 'w259-feedback-placeholder-remains-noop',
    feedbackContract.futureUrlConfigured === false &&
      feedbackContract.externalUrl === '' &&
      feedbackContract.networkAllowed === false &&
      feedbackContract.trackingAllowed === false &&
      feedbackContract.localStorageWriteAllowed === false &&
      feedbackContract.installActionAllowed === false &&
      feedbackAction.status === 'no_op' &&
      feedbackAction.externalUrlOpened === false &&
      feedbackAction.networkCalled === false &&
      feedbackAction.localStorageWritten === false &&
      !/data-idb-feedback-placeholder[\s\S]{0,500}(href=|window\.open|fetch\(|localStorage\.setItem|data-idb-install|Install lane pack)/i.test(sample.drawerHtml) &&
      !/function feedbackPlaceholderActionW259\(\)[\s\S]{0,800}(window\.open|fetch\(|localStorage\.setItem|trace\(|data-idb-install|Install lane pack)/i.test(userscript),
    'feedback placeholder remains no-op with no URL/network/storage/install path');

  assertCase(results, 'w258-first-glance-visible-after-valid-import',
    /Live proof CTA/.test(sample.storyHtml) &&
      /Open [^<]+/.test(sample.storyHtml) &&
      /Proof action/.test(sample.storyHtml) &&
      /Safe claim/.test(sample.storyHtml) &&
      /Stop/.test(sample.storyHtml) &&
      /Evidence confidence:/.test(sample.storyHtml),
    sample.storyHtml.slice(0, 1800));

  assertCase(results, 'w218-w220-wording-preserved',
    /Build results are ready\./.test(wordingReviewHtml) &&
      /Build results are ready\./.test(wordingRunHtml) &&
      /latest completed runner result/i.test(hooks.importRecoveryUiSurfaceW220V1({ dccFinalNamingResult: null }, sample.state.selectedLaneId, null).consultant.nextAction),
    'W218 success wording and W220 recovery wording are still present');

  assertCase(results, 'normal-ui-hides-diagnostics-and-admin-review',
    !/raw JSON|stack trace|runnerTaskId|schema:|hardLimits|writeAuthority|idb-w252-lane-pack-review|data-idb-install|Install lane pack/i.test(sample.storyHtml) &&
      !/raw JSON|stack trace|runnerTaskId|schema:|hardLimits|writeAuthority|idb-w252-lane-pack-review|data-idb-install|Install lane pack/i.test(sample.drawerHtml),
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
    /W260/.test(report) &&
      /Rollback Note/.test(report) &&
      trace.schema === 'forge.w260.install-ready-release-packet.trace.v1' &&
      trace.updateOnly.length === 1 &&
      trace.updateOnly[0] === 'idb-drawer.user.js',
    trace.schema);

  const failed = results.filter((result) => !result.pass);
  results.forEach((result) => {
    console.log(`${result.pass ? 'PASS' : 'FAIL'} ${result.id} ${result.evidence}`);
  });
  if (failed.length) {
    console.error(`\nW260 harness failed ${failed.length}/${results.length} cases.`);
    process.exit(1);
  }
  console.log(`\nW260 harness passed ${results.length}/${results.length} cases.`);
}

main();
