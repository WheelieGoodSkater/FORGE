#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..', '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const fixturePath = path.join(root, 'archive', 'fixtures', 'w249_lane_pack_expansion_qa_fixtures.json');
const reportPath = path.join(root, 'archive', 'reports', 'w254_evidence_receipt_trail.md');
const tracePath = path.join(root, 'archive', 'trace_samples', 'w254_evidence_receipt_trail_trace.json');

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
    fetch: () => Promise.reject(new Error('live fetch disabled in W254 harness')),
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
  return {
    fixture,
    context,
    normalized,
    story,
    receipt: story && story.evidenceReceiptW254,
    html: hooks.renderConsultantStorySurfaceW248(story),
    reviewHtml: hooks.renderReviewView(context.state, context.lane, context.page, context.recommendation)
  };
}

function main() {
  const hooks = loadHooks();
  const fixtures = JSON.parse(read(fixturePath)).fixtures;
  const report = read(reportPath);
  const trace = JSON.parse(read(tracePath));
  const results = [];
  const rendered = fixtures.map((fixture) => renderedFor(hooks, fixture));
  const requiredRows = ['lane_pack_confidence', 'website_evidence', 'open_target_record', 'conversation_notes', 'nllm_limits', 'uncertainty_gate'];

  assertCase(results, 'evidence-receipt-has-required-consultant-safe-rows',
    rendered.every((item) => item.receipt && item.receipt.status === 'receipt_ready' && requiredRows.every((id) => item.receipt.rows.some((row) => row.id === id))),
    rendered.map((item) => `${item.fixture.id}:${item.receipt && item.receipt.rows.map((row) => row.id).join(',')}`).join(' | '));

  const preImportStory = hooks.consultantStorySurfaceFromLanePackW247(stateFor(fixtures[0]), hooks.versionedLanePacksW246()[0], { displayReadyRecords: [] });
  const preImportHtml = hooks.renderConsultantStorySurfaceW248(preImportStory);
  assertCase(results, 'receipt-renders-only-after-valid-import',
    /Evidence receipt/.test(rendered[0].html) && !/Evidence receipt/.test(preImportHtml) && preImportStory.evidenceReceiptW254.status === 'waiting_for_valid_import',
    preImportHtml);

  assertCase(results, 'receipt-uses-returned-record-names-and-lane-aware-labels',
    rendered.every((item) => {
      const openRow = item.receipt.rows.find((row) => row.id === 'open_target_record');
      return openRow && openRow.value.includes(item.fixture.proofRecordName) && /\((Product SKU|Finished\/Assembly Item|Finished Food\/Batch Item|Availability\/Replenishment Flow|Work Order|Ingredient Item|Formula or Batch Structure|Component Item)\)/.test(openRow.value);
    }),
    rendered.map((item) => `${item.fixture.id}:${item.receipt.rows.find((row) => row.id === 'open_target_record').value}`).join(' | '));

  const requiredPackIds = ['industrial-manufacturing', 'equipment-manufacturing', 'industrial-distributor', 'cpg-distributor', 'cpg-manufacturer', 'food-beverage-manufacturer'];
  assertCase(results, 'receipt-covers-six-priority-industry-lanes',
    requiredPackIds.every((packId) => rendered.some((item) => item.story.packId === packId && item.receipt.status === 'receipt_ready')),
    rendered.map((item) => item.story.packId).join(', '));

  assertCase(results, 'normal-ui-hides-raw-diagnostics-and-admin-proposal-review',
    rendered.every((item) => /Evidence receipt/.test(item.reviewHtml) &&
      !/idb-w252-lane-pack-review|Install lane pack|data-idb-install/i.test(item.reviewHtml) &&
      !/raw JSON|stack trace|runnerTaskId|contract schema|writeAuthority|hardLimits/i.test(item.html)),
    rendered[0].html.slice(0, 1600));

  assertCase(results, 'nllm-advisory-only-hard-limits-visible',
    rendered.every((item) => {
      const row = item.receipt.rows.find((receiptRow) => receiptRow.id === 'nllm_limits');
      return item.story.nllmAdvisory.writeAuthority === 'none' &&
        item.story.nllmAdvisory.creationAllowed === false &&
        row && /Advisory only/.test(row.value) &&
        /no writes/i.test(row.value) &&
        /no record creation/i.test(row.value) &&
        /no hidden uncertainty/i.test(row.value);
    }),
    rendered.map((item) => item.receipt.rows.find((row) => row.id === 'nllm_limits').value).join(' | '));

  const weakFixture = fixtures[0];
  const weakState = stateFor(weakFixture);
  weakState.intake.website = 'https://unknown-example.com';
  weakState.intake.notes = 'Maybe food, maybe apparel, maybe distributor. Evidence is conflicting.';
  const weakStory = hooks.consultantStorySurfaceFromLanePackW247(weakState, null, {
    displayReadyRecords: rendered[0].normalized.visibleRecords
  });
  const weakHtml = hooks.renderConsultantStorySurfaceW248(weakStory);
  const weakGate = weakStory.evidenceReceiptW254.rows.find((row) => row.id === 'uncertainty_gate');
  assertCase(results, 'weak-conflicting-evidence-remains-confirmation-gated',
    weakStory.status === 'needs_lane_confirmation' &&
      /Confirm lane before opening proof records/.test(weakStory.openTarget) &&
      weakGate && /ask for lane confirmation|weak or conflicting|needs consultant confirmation/i.test(weakGate.value) &&
      /Evidence receipt/.test(weakHtml),
    JSON.stringify(weakStory));

  assertCase(results, 'report-and-trace-archived',
    /W254/.test(report) && trace.schema === 'forge.w254.evidence-receipt-trail.trace.v1',
    trace.schema);

  const failed = results.filter((result) => !result.pass);
  results.forEach((result) => {
    console.log(`${result.pass ? 'PASS' : 'FAIL'} ${result.id} ${result.evidence}`);
  });
  if (failed.length) {
    console.error(`\nW254 harness failed ${failed.length}/${results.length} cases.`);
    process.exit(1);
  }
  console.log(`\nW254 harness passed ${results.length}/${results.length} cases.`);
}

main();
