#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..', '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const laneFixturePath = path.join(root, 'archive', 'fixtures', 'w249_lane_pack_expansion_qa_fixtures.json');
const proposalFixturePath = path.join(root, 'archive', 'fixtures', 'w255_proposed_lane_pack_receipt_fixture.json');
const reportPath = path.join(root, 'archive', 'reports', 'w255_receipt_driven_lane_expansion_qa.md');
const tracePath = path.join(root, 'archive', 'trace_samples', 'w255_receipt_driven_lane_expansion_qa_trace.json');

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
    fetch: () => Promise.reject(new Error('live fetch disabled in W255 harness')),
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

function contextFor(hooks, state) {
  hooks.ensureWebsiteEvidenceRuntime(state);
  hooks.reconcileStateAuthority(state);
  const lane = hooks.getLane(state);
  const page = state.pageContext;
  const recommendation = hooks.recommendMove(lane, page);
  return { state, lane, page, recommendation };
}

function renderedFor(hooks, fixture) {
  const context = contextFor(hooks, stateFor(fixture));
  const result = completedResult(fixture);
  const normalized = hooks.canonicalImportResultNormalizationW245(
    result,
    context.state,
    context.lane,
    context.page,
    context.recommendation
  );
  context.state.dccFinalNamingResult = result;
  const story = normalized.consultantStorySurfaceW247;
  const lanePack = normalized.versionedLanePackW246.lanePack;
  return {
    fixture,
    context,
    normalized,
    lanePack,
    story,
    firstGlance: hooks.consultantStoryFirstGlanceW255(story),
    qa: hooks.receiptDrivenLaneExpansionQaW255(lanePack, story),
    html: hooks.renderConsultantStorySurfaceW248(story),
    reviewHtml: hooks.renderReviewView(context.state, context.lane, context.page, context.recommendation)
  };
}

function main() {
  const hooks = loadHooks();
  const fixtures = JSON.parse(read(laneFixturePath)).fixtures;
  const proposed = JSON.parse(read(proposalFixturePath));
  const report = read(reportPath);
  const trace = JSON.parse(read(tracePath));
  const rendered = fixtures.map((fixture) => renderedFor(hooks, fixture));
  const proposalReview = hooks.reviewProposedLanePackChangeW247(proposed);
  const proposalReviewHtml = hooks.renderLanePackDiffReviewW252(proposalReview);
  const results = [];

  assertCase(results, 'receipt-driven-qa-validates-existing-lane-packs',
    rendered.every((item) => item.qa.status === 'pass' && item.qa.checks.length === 6 && item.qa.checks.every((check) => check.pass)),
    rendered.map((item) => `${item.fixture.id}:${item.qa.status}`).join(' | '));

  assertCase(results, 'proposed-lane-pack-fixture-review-only-non-installable',
    proposalReview.status === 'review_ready' &&
      proposalReview.installAllowed === false &&
      proposalReview.nllmAdvisoryOnly === true &&
      /No install action/.test(proposalReviewHtml) &&
      !/data-idb-install|Install lane pack/i.test(proposalReviewHtml),
    JSON.stringify(proposalReview.reviewCopy));

  assertCase(results, 'compressed-story-surface-keeps-first-glance-fields',
    rendered.every((item) => item.firstGlance.openTarget && item.firstGlance.proveMove && item.firstGlance.safeClaim && item.firstGlance.doNotClaimGuardrail && item.firstGlance.receiptSummary && item.firstGlance.nextAction && /idb-w255-first-glance/.test(item.html)),
    rendered.map((item) => `${item.fixture.id}:${JSON.stringify(item.firstGlance)}`).join(' | '));

  assertCase(results, 'expanded-receipt-remains-available-after-valid-import',
    rendered.every((item) => /Evidence receipt/.test(item.html) && /idb-w254-evidence-receipt/.test(item.html)),
    rendered.map((item) => `${item.fixture.id}:${/Evidence receipt/.test(item.html)}`).join(' | '));

  assertCase(results, 'normal-ui-avoids-raw-diagnostics-and-overcrowding',
    rendered.every((item) => {
      const statusCellCount = (item.html.match(/idb-status-cell/g) || []).length;
      return statusCellCount <= 3 &&
        !/raw JSON|stack trace|runnerTaskId|contract schema|writeAuthority|hardLimits|idb-w252-lane-pack-review|Install lane pack|data-idb-install/i.test(item.reviewHtml);
    }),
    rendered[0].html.slice(0, 1400));

  assertCase(results, 'nllm-advisory-limits-visible-without-write-authority',
    rendered.every((item) => {
      const nllmRow = item.story.evidenceReceiptW254.rows.find((row) => row.id === 'nllm_limits');
      return item.story.nllmAdvisory.writeAuthority === 'none' &&
        item.story.nllmAdvisory.creationAllowed === false &&
        nllmRow && /Advisory only/.test(nllmRow.value) &&
        /no writes/i.test(nllmRow.value);
    }),
    rendered.map((item) => item.story.evidenceReceiptW254.rows.find((row) => row.id === 'nllm_limits').value).join(' | '));

  const weakState = stateFor(fixtures[0]);
  weakState.intake.website = 'https://unknown-example.com';
  weakState.intake.notes = 'Maybe food, maybe apparel, maybe distributor. Evidence is conflicting.';
  const weakStory = hooks.consultantStorySurfaceFromLanePackW247(weakState, null, {
    displayReadyRecords: rendered[0].normalized.visibleRecords
  });
  const weakFirstGlance = hooks.consultantStoryFirstGlanceW255(weakStory);
  assertCase(results, 'weak-conflicting-evidence-remains-confirmation-gated',
    weakStory.status === 'needs_lane_confirmation' &&
      /Confirm lane before opening proof records/.test(weakStory.openTarget) &&
      /Confirm the lane/.test(weakFirstGlance.nextAction),
    JSON.stringify(weakStory));

  assertCase(results, 'report-fixture-trace-archived',
    /W255/.test(report) &&
      proposed.schema === 'forge.w255.proposed-lane-pack-receipt-fixture.v1' &&
      trace.schema === 'forge.w255.receipt-driven-lane-expansion-qa.trace.v1',
    trace.schema);

  const failed = results.filter((result) => !result.pass);
  results.forEach((result) => {
    console.log(`${result.pass ? 'PASS' : 'FAIL'} ${result.id} ${result.evidence}`);
  });
  if (failed.length) {
    console.error(`\nW255 harness failed ${failed.length}/${results.length} cases.`);
    process.exit(1);
  }
  console.log(`\nW255 harness passed ${results.length}/${results.length} cases.`);
}

main();
