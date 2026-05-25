#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..', '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const fixturePath = path.join(root, 'archive', 'fixtures', 'w251_lane_pack_diff_review_fixture.json');
const reportPath = path.join(root, 'archive', 'reports', 'w253_post_install_visual_acceptance.md');
const tracePath = path.join(root, 'archive', 'trace_samples', 'w253_post_install_visual_acceptance_trace.json');

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
    fetch: () => Promise.reject(new Error('live fetch disabled in W253 harness')),
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
  const packet = hooks.postInstallAcceptancePacketW253();
  const density = hooks.suiteletHeaderDensityQaW253();
  const oversized = hooks.suiteletHeaderDensityQaW253({ logoMaxWidthPx: 520, logoMaxHeightPx: 180 });
  const reviewHtml = hooks.renderLanePackDiffReviewW252(hooks.reviewProposedLanePackChangeW247(fixture));
  const adminDrawerHtml = hooks.renderDrawer(baseState(fixture, true));
  const consultantDrawerHtml = hooks.renderDrawer(baseState(fixture, false));
  const importState = baseState(fixture, false);
  hooks.ensureWebsiteEvidenceRuntime(importState);
  hooks.reconcileStateAuthority(importState);
  const importLane = hooks.getLane(importState);
  const importPage = importState.pageContext;
  const importRecommendation = hooks.recommendMove(importLane, importPage);
  const normalized = hooks.canonicalImportResultNormalizationW245({
    schema: 'forge.completed-runner-result.v2',
    status: 'completed',
    runStatus: 'completed',
    generatedRecordOwner: 'governed_runner_internal_build_engine',
    resolvedOperatingMode: 'distribution_replenishment',
    records: [
      { role: 'customer', name: 'Grainger Customer Account', recordType: 'customer', internalId: 4001, url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/entity/custjob.nl?id=4001' },
      { role: 'sales_order', name: 'SO4002', recordType: 'salesorder', internalId: 4002, url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/accounting/transactions/salesord.nl?id=4002' },
      { role: 'branch_or_product_sku', name: 'Grainger Branch Fulfillment SKU', recordType: 'inventoryitem', internalId: 4003, url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=4003' }
    ]
  }, importState, importLane, importPage, importRecommendation);
  const story = normalized.consultantStorySurfaceW247;
  const weakStory = hooks.consultantStorySurfaceFromLanePackW247({
    selectedLaneId: 'products_cpg',
    laneSelectionSource: 'consultant_confirmed',
    intake: { customer: 'Unknown', website: 'https://unknown-example.com', notes: 'Conflicting evidence.' }
  }, null, { displayReadyRecords: [] });
  const bannedOverclaims = /guarantee|guaranteed|measured ROI|will increase|created successfully|write transaction/i;

  assertCase(results, 'post-install-packet-covers-required-fields',
    packet.schema === 'forge.w253.post-install-acceptance-packet.v1' &&
      packet.captureMode === 'pass_fail_note' &&
      ['launcher_readability_standard_zoom', 'launcher_click_target_placement', 'suitelet_header_logo_balance', 'close_tabs_first_card_reachability', 'story_card_valid_import_gate', 'returned_names_lane_labels', 'weak_evidence_confirmation'].every((id) => packet.fields.some((field) => field.id === id)),
    JSON.stringify(packet));
  assertCase(results, 'header-density-helper-passes-compact-state',
    density.status === 'pass' && density.checks.every((check) => check.pass) && /width:\s*min\(300px, calc\(100% - 76px\)\);/.test(userscript) && /max-height:\s*108px;/.test(userscript),
    JSON.stringify(density));
  assertCase(results, 'header-density-helper-flags-oversized-state',
    oversized.status === 'needs_attention' && oversized.checks.some((check) => check.id === 'logo_width_compact' && !check.pass) && oversized.checks.some((check) => check.id === 'logo_height_compact' && !check.pass),
    JSON.stringify(oversized));
  assertCase(results, 'compact-header-keeps-close-tabs-first-card-reachable',
    /data-idb-close/.test(adminDrawerHtml) && /data-idb-view="plan"/.test(adminDrawerHtml) && /Trace actions only/.test(adminDrawerHtml),
    'close button, tabs, and first card present');
  assertCase(results, 'story-copy-is-concrete-and-non-overclaiming',
    story && /returned|supported Open link|Anchor the proof/i.test(story.proofMove) &&
      /created records|write actions|measured ROI/i.test(story.doNotClaim) &&
      /uncertainty/i.test(story.nllmAdvisory.uncertainty) &&
      !bannedOverclaims.test(`${story.proofMove} ${story.safeClaim} ${story.buyerFacingSoWhat}`),
    JSON.stringify(story));
  assertCase(results, 'w252-review-remains-admin-only-and-non-installable',
    /idb-w252-lane-pack-review/.test(adminDrawerHtml) &&
      !/idb-w252-lane-pack-review/.test(consultantDrawerHtml) &&
      /No install action/.test(reviewHtml) &&
      !/data-idb-install|Install lane pack/i.test(`${reviewHtml} ${adminDrawerHtml}`),
    reviewHtml.slice(0, 1200));
  assertCase(results, 'normal-ui-hides-raw-diagnostics-and-install-actions',
    !/raw JSON|stack trace|internal arrays|data-idb-install|Install lane pack|idb-w252-lane-pack-review/i.test(consultantDrawerHtml),
    consultantDrawerHtml.slice(0, 1200));
  assertCase(results, 'weak-conflicting-evidence-remains-confirmation-gated',
    weakStory.status === 'needs_lane_confirmation' &&
      /Confirm lane before opening proof records/.test(weakStory.openTarget) &&
      /ask for confirmation/i.test(weakStory.nllmAdvisory.uncertainty),
    JSON.stringify(weakStory));
  assertCase(results, 'report-and-trace-archived',
    /W253/.test(report) && trace.schema === 'forge.w253.post-install-visual-acceptance.trace.v1',
    trace.schema);

  const failed = results.filter((result) => !result.pass);
  results.forEach((result) => {
    console.log(`${result.pass ? 'PASS' : 'FAIL'} ${result.id} ${result.evidence}`);
  });
  if (failed.length) {
    console.error(`\nW253 harness failed ${failed.length}/${results.length} cases.`);
    process.exit(1);
  }
  console.log(`\nW253 harness passed ${results.length}/${results.length} cases.`);
}

main();
