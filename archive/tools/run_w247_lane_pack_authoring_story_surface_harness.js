#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..', '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const reportPath = path.join(root, 'archive', 'reports', 'w247_lane_pack_authoring_story_surface.md');
const tracePath = path.join(root, 'archive', 'trace_samples', 'w247_lane_pack_authoring_story_surface_trace.json');
const fixturePath = path.join(root, 'archive', 'fixtures', 'w247_nllm_proposed_lane_pack_fixture.json');
const lanePacks = require(path.join(root, 'src', 'contracts', 'lanePacks.js'));

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
    fetch: () => Promise.reject(new Error('live fetch disabled in W247 harness')),
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

function stateFor(customer, website, notes, laneId) {
  return {
    selectedLaneId: laneId || 'industrial_distribution',
    laneSelectionSource: 'consultant_confirmed',
    selectedActionId: 'prove',
    briefPrepared: true,
    setupEditMode: false,
    intake: { customer, website, notes: notes || '' },
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

function record(role, type, name, id, path) {
  return {
    role,
    recordType: type,
    type,
    name,
    internalId: id,
    url: `https://YOUR_ACCOUNT_ID.app.netsuite.com${path}?id=${id}`
  };
}

function completedResult() {
  return {
    schema: 'forge.completed-runner-result.v2',
    status: 'completed',
    runStatus: 'completed',
    generatedRecordOwner: 'governed_runner_internal_build_engine',
    resolvedOperatingMode: 'distribution_replenishment',
    records: [
      record('customer', 'customer', 'Grainger Customer Account', '2001', '/app/common/entity/custjob.nl'),
      record('sales_order', 'salesorder', 'SO247', '3002', '/app/accounting/transactions/salesord.nl'),
      record('branch_or_product_sku', 'inventoryitem', 'Branch Fulfillment SKU', '4003', '/app/common/item/item.nl'),
      record('replenishment_or_availability_flow', 'inventoryitem', 'Branch Availability Flow', '4004', '/app/common/item/item.nl')
    ]
  };
}

function contextFor(hooks, state) {
  hooks.ensureWebsiteEvidenceRuntime(state);
  hooks.reconcileStateAuthority(state);
  const lane = hooks.getLane(state);
  const page = state.pageContext;
  const recommendation = hooks.recommendMove(lane, page);
  return { state, lane, page, recommendation };
}

function unsafeProposalFrom(fixture) {
  const clone = JSON.parse(JSON.stringify(fixture));
  clone.autoInstall = true;
  clone.candidatePack.liveDemo.roiSoWhat = 'This will increase margin with guaranteed measured ROI.';
  clone.candidatePack.nllmAdvisory.writeAuthority = 'write';
  clone.candidatePack.nllmAdvisory.creationAllowed = true;
  return clone;
}

function main() {
  const hooks = loadHooks();
  const fixture = JSON.parse(read(fixturePath));
  const report = read(reportPath);
  const trace = JSON.parse(read(tracePath));
  const results = [];

  const sourceReview = lanePacks.reviewProposedLanePackChange(fixture);
  const drawerReview = hooks.reviewProposedLanePackChangeW247(fixture);
  assertCase(results, 'source-authoring-fixture-review-ready', sourceReview.status === 'review_ready' && sourceReview.installAllowed === false && sourceReview.humanReviewRequired === true, JSON.stringify(sourceReview));
  assertCase(results, 'drawer-authoring-fixture-review-ready', drawerReview.status === 'review_ready' && drawerReview.installAllowed === false && drawerReview.nllmAdvisoryOnly === true, JSON.stringify(drawerReview));

  const unsafe = hooks.reviewProposedLanePackChangeW247(unsafeProposalFrom(fixture));
  assertCase(results, 'unsafe-nllm-proposal-rejected', unsafe.status === 'rejected' && unsafe.errors.some((error) => /autoInstall|write authority|creation|ROI/i.test(error)), JSON.stringify(unsafe.errors));

  const importState = stateFor('Grainger', 'https://grainger.com', 'Prove supplier risk, branch promise, and ROI.', 'industrial_distribution');
  const importContext = contextFor(hooks, importState);
  const normalized = hooks.canonicalImportResultNormalizationW245(completedResult(), importContext.state, importContext.lane, importContext.page, importContext.recommendation);
  const story = hooks.consultantStorySurfaceFromLanePackW247(importState, normalized.versionedLanePackW246.lanePack, normalized);
  assertCase(results, 'consultant-story-surface-uses-w245-records-and-w246-pack', story.status === 'story_ready' && /Branch Fulfillment SKU/.test(story.openTarget) && story.packId === 'industrial-distributor' && story.openUrl.includes('/app/common/item/item.nl?id=4003'), JSON.stringify(story));
  assertCase(results, 'consultant-story-surface-has-compact-required-fields', !!(story.openTarget && story.proofMove && story.safeClaim && story.doNotClaim && story.buyerFacingSoWhat && story.nllmAdvisory && story.nllmAdvisory.uncertainty), JSON.stringify(story));
  assertCase(results, 'w245-normalization-carries-w247-story-surface', normalized.consultantStorySurfaceW247 && normalized.consultantStorySurfaceW247.status === 'story_ready' && normalized.consultantStorySurfaceW247.nllmAdvisory.writeAuthority === 'none', JSON.stringify(normalized.consultantStorySurfaceW247));

  const weakState = stateFor('Unknown', 'https://unknown-example.com', 'Maybe food, maybe apparel, maybe distributor.', 'products_cpg');
  const weakStory = hooks.consultantStorySurfaceFromLanePackW247(weakState, null, { displayReadyRecords: [] });
  assertCase(results, 'uncertainty-visible-when-evidence-weak', weakStory.status === 'needs_lane_confirmation' && /insufficient|confirmation/i.test(weakStory.nllmAdvisory.uncertainty), JSON.stringify(weakStory));

  const sourceStory = lanePacks.consultantStorySurfaceFromLanePack(
    { website: 'https://grainger.com', categoryText: 'industrial supply branch availability supplier lead time replenishment' },
    lanePacks.resolveLanePackFromEvidence({ website: 'https://grainger.com' }).lanePack,
    {
      displayReadyRecords: [
        {
          canonicalRole: 'branch_or_product_sku',
          consultantLabel: 'Product SKU',
          name: 'Branch Fulfillment SKU',
          supportedOpenUrl: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=4003',
          linkAuthorityStatus: 'verified_openable',
          normalConsultantVisible: true
        }
      ]
    }
  );
  assertCase(results, 'source-story-helper-ready', sourceStory.status === 'story_ready' && sourceStory.nllmAdvisory.writeAuthority === 'none', JSON.stringify(sourceStory));

  assertCase(results, 'report-fixture-trace-archived', /W247/.test(report) && fixture.schema === 'forge.lane-pack-authoring-proposal.v1' && trace.schema === 'forge.w247.lane-pack-authoring-story-surface.trace.v1', trace.schema);

  const failed = results.filter((result) => !result.pass);
  results.forEach((result) => {
    console.log(`${result.pass ? 'PASS' : 'FAIL'} ${result.id} ${result.evidence}`);
  });
  if (failed.length) {
    console.error(`\nW247 harness failed ${failed.length}/${results.length} cases.`);
    process.exit(1);
  }
  console.log(`\nW247 harness passed ${results.length}/${results.length} cases.`);
}

main();
