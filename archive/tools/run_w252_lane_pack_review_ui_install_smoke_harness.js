#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..', '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const fixturePath = path.join(root, 'archive', 'fixtures', 'w251_lane_pack_diff_review_fixture.json');
const reportPath = path.join(root, 'archive', 'reports', 'w252_lane_pack_review_ui_install_smoke_acceptance.md');
const tracePath = path.join(root, 'archive', 'trace_samples', 'w252_lane_pack_review_ui_install_smoke_trace.json');

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
    fetch: () => Promise.reject(new Error('live fetch disabled in W252 harness')),
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

function unsafeProposalFrom(proposal) {
  const clone = JSON.parse(JSON.stringify(proposal));
  clone.autoInstall = true;
  clone.candidatePack.nllmAdvisory.writeAuthority = 'write';
  clone.candidatePack.nllmAdvisory.creationAllowed = true;
  clone.candidatePack.nllmAdvisory.uncertaintyPolicy = 'hide_uncertainty';
  clone.candidatePack.liveDemo.roiSoWhat = 'This will increase margin with guaranteed measured ROI.';
  return clone;
}

function baseState(proposal, setupEditMode) {
  return {
    selectedLaneId: 'industrial_distribution',
    laneSelectionSource: 'consultant_confirmed',
    selectedActionId: 'prove',
    activeView: 'trace',
    briefPrepared: true,
    setupEditMode: !!setupEditMode,
    lanePackProposalW251: proposal,
    intake: {
      customer: 'Grainger',
      website: 'https://grainger.com',
      notes: 'Review proposed industrial distributor lane-pack refinement.'
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

function main() {
  const hooks = loadHooks();
  const fixture = JSON.parse(read(fixturePath));
  const report = read(reportPath);
  const trace = JSON.parse(read(tracePath));
  const userscript = read(userscriptPath);
  const results = [];
  const review = hooks.reviewProposedLanePackChangeW247(fixture);
  const reviewHtml = hooks.renderLanePackDiffReviewW252(review);
  const unsafeReviewHtml = hooks.renderLanePackDiffReviewW252(hooks.reviewProposedLanePackChangeW247(unsafeProposalFrom(fixture)));
  const adminDrawerHtml = hooks.renderDrawer(baseState(fixture, true));
  const consultantDrawerHtml = hooks.renderDrawer(baseState(fixture, false));
  const checklist = hooks.installSmokeAcceptanceChecklistW252();
  const weakStory = hooks.consultantStorySurfaceFromLanePackW247({
    selectedLaneId: 'products_cpg',
    laneSelectionSource: 'consultant_confirmed',
    intake: { customer: 'Unknown', website: 'https://unknown-example.com', notes: 'Conflicting evidence.' }
  }, null, { displayReadyRecords: [] });

  assertCase(results, 'review-renderer-shows-required-diff-sections', /Evidence changes/.test(reviewHtml) && /Record-role changes/.test(reviewHtml) && /Vocabulary changes/.test(reviewHtml) && /Story, ROI, and competitive copy/.test(reviewHtml) && /N\/LLM authority and uncertainty/.test(reviewHtml), reviewHtml);
  assertCase(results, 'unsafe-review-does-not-render-installable', /Lane-pack proposal rejected/.test(unsafeReviewHtml) && /No install action/.test(unsafeReviewHtml) && !/Install lane pack|data-idb-install/i.test(unsafeReviewHtml), unsafeReviewHtml);
  assertCase(results, 'admin-trace-renders-review-only-surface', /idb-w252-lane-pack-review/.test(adminDrawerHtml) && /No install action/.test(adminDrawerHtml) && !/data-idb-install|Install lane pack/i.test(adminDrawerHtml), adminDrawerHtml.slice(0, 1200));
  assertCase(results, 'normal-consultant-ui-hides-review-diagnostics', !/idb-w252-lane-pack-review|raw JSON|stack trace|data-idb-install|Install lane pack/i.test(consultantDrawerHtml), consultantDrawerHtml.slice(0, 1200));
  assertCase(results, 'install-smoke-checklist-covers-required-acceptance', checklist.items.length >= 6 && ['launcher_icon_visible', 'launcher_click_target_unchanged', 'story_card_gated', 'returned_names_labels_visible', 'weak_evidence_confirmation', 'suitelet_header_compact'].every((id) => checklist.items.some((item) => item.id === id)), JSON.stringify(checklist));
  assertCase(results, 'suitelet-header-logo-proportionate', /width:\s*min\(300px, calc\(100% - 76px\)\);/.test(userscript) && /max-height:\s*108px;/.test(userscript) && /idb-title-row/.test(userscript), 'logo width <= 300px and max-height 108px');
  assertCase(results, 'close-tabs-first-card-remain-balanced', /data-idb-close/.test(adminDrawerHtml) && /data-idb-view="plan"/.test(adminDrawerHtml) && /30-SECOND PLAN|Trace actions only/.test(adminDrawerHtml), 'close button, tab row, and first panel are present');
  assertCase(results, 'weak-evidence-remains-confirmation-gated', weakStory.status === 'needs_lane_confirmation' && /Confirm lane before opening proof records/.test(weakStory.openTarget), JSON.stringify(weakStory));
  assertCase(results, 'report-and-trace-archived', /W252/.test(report) && trace.schema === 'forge.w252.lane-pack-review-ui-install-smoke.trace.v1', trace.schema);

  const failed = results.filter((result) => !result.pass);
  results.forEach((result) => {
    console.log(`${result.pass ? 'PASS' : 'FAIL'} ${result.id} ${result.evidence}`);
  });
  if (failed.length) {
    console.error(`\nW252 harness failed ${failed.length}/${results.length} cases.`);
    process.exit(1);
  }
  console.log(`\nW252 harness passed ${results.length}/${results.length} cases.`);
}

main();
