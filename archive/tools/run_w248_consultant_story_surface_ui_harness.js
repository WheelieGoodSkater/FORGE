#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..', '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const reportPath = path.join(root, 'archive', 'reports', 'w248_consultant_story_surface_ui.md');
const tracePath = path.join(root, 'archive', 'trace_samples', 'w248_consultant_story_surface_ui_trace.json');

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
    fetch: () => Promise.reject(new Error('live fetch disabled in W248 harness')),
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

function stateFor(customer, website, notes, laneId, setupEditMode) {
  return {
    selectedLaneId: laneId || 'industrial_distribution',
    selectedActionId: 'prove',
    laneSelectionSource: 'consultant_confirmed',
    briefPrepared: true,
    setupEditMode: !!setupEditMode,
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

function completedResult(mode) {
  return {
    schema: 'forge.completed-runner-result.v2',
    status: 'completed',
    runStatus: 'completed',
    generatedRecordOwner: 'governed_runner_internal_build_engine',
    resolvedOperatingMode: mode || 'distribution_replenishment',
    records: [
      record('customer', 'customer', 'Grainger Customer Account', '2001', '/app/common/entity/custjob.nl'),
      record('sales_order', 'salesorder', 'SO248', '3002', '/app/accounting/transactions/salesord.nl'),
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

function importedContext(hooks, customer, website, notes, laneId) {
  const state = stateFor(customer, website, notes, laneId, false);
  const context = contextFor(hooks, state);
  const finalNaming = hooks.dccFinalNamingResultV1(completedResult(), context.state, context.lane, context.page, context.recommendation);
  context.state.dccFinalNamingResult = finalNaming;
  return contextFor(hooks, context.state);
}

function storyCard(html) {
  const value = String(html || '');
  const start = value.indexOf('idb-w248-story-surface');
  if (start === -1) return '';
  const end = value.indexOf('N/LLM: advisory only', start);
  return end === -1 ? value.slice(start, start + 1600) : value.slice(start, end + 400);
}

function hasCompactStoryFields(card) {
  return /Live demo talk track/.test(card) &&
    /Open Branch Fulfillment SKU/.test(card) &&
    /Prove/.test(card) &&
    /Safe to say/.test(card) &&
    /Do not claim/.test(card) &&
    /Evidence confidence: High/.test(card) &&
    /N\/LLM: advisory only/.test(card) &&
    /Low uncertainty/.test(card);
}

function main() {
  const hooks = loadHooks();
  const report = read(reportPath);
  const trace = JSON.parse(read(tracePath));
  const results = [];
  const imported = importedContext(hooks, 'Grainger', 'https://grainger.com', 'Prove supplier risk, branch promise, and ROI.', 'industrial_distribution');
  const reviewHtml = hooks.renderReviewView(imported.state, imported.lane, imported.page, imported.recommendation);
  const runHtml = hooks.renderRunView(imported.state, imported.lane, imported.page, imported.recommendation, imported.recommendation.move, { id: 'prove' }, 'W248 story surface smoke');
  const reviewStory = storyCard(reviewHtml);
  const runStory = storyCard(runHtml);

  assertCase(results, 'review-renders-compact-story-after-valid-import', hasCompactStoryFields(reviewStory), reviewStory);
  assertCase(results, 'run-renders-compact-story-after-valid-import', hasCompactStoryFields(runStory), runStory);

  const preImport = contextFor(hooks, stateFor('Grainger', 'https://grainger.com', 'Prove supplier risk.', 'industrial_distribution', false));
  const preReviewHtml = hooks.renderReviewView(preImport.state, preImport.lane, preImport.page, preImport.recommendation);
  const preRunHtml = hooks.renderRunView(preImport.state, preImport.lane, preImport.page, preImport.recommendation, preImport.recommendation.move, { id: 'prove' }, 'pre import');
  assertCase(results, 'no-story-surface-before-valid-import', !/idb-w248-story-surface/.test(preReviewHtml) && !/idb-w248-story-surface/.test(preRunHtml), 'pre-import story surface absent');
  assertCase(results, 'fake-open-links-remain-blocked-before-import', /Build records before running|Record links are not back yet/.test(preRunHtml) && /Open links only after real NetSuite records/.test(preReviewHtml), 'pre-import blocking copy present');

  const weak = importedContext(hooks, 'Unknown', 'https://unknown-example.com', 'Unclear request with no website category evidence.', 'products_cpg');
  const weakHtml = hooks.renderReviewView(weak.state, weak.lane, weak.page, weak.recommendation);
  const weakStory = storyCard(weakHtml);
  assertCase(results, 'weak-evidence-shows-confirmation-guidance', /Confirm lane before opening proof records/.test(weakStory) && /Evidence confidence: Low/.test(weakStory) && /ask for confirmation/i.test(weakStory), weakStory);

  const forbiddenNormalUi = /forge\.|idb\.w|runnerTaskId|raw JSON|semantic guard|mode contract|mapped roles|stack trace|writeAuthority|hardLimits|creationAllowed/i;
  assertCase(results, 'normal-story-ui-hides-internal-diagnostics', !forbiddenNormalUi.test(reviewStory) && !forbiddenNormalUi.test(runStory) && !forbiddenNormalUi.test(weakStory), [reviewStory, runStory, weakStory].join('\n---\n'));

  assertCase(results, 'w218-success-wording-preserved', /Build results are ready\./.test(reviewHtml) && /Build results are ready\./.test(runHtml), 'Build results are ready.');
  const recovery = hooks.importRecoveryUiSurfaceW220V1(preImport.state, preImport.lane, preImport.page, preImport.recommendation);
  assertCase(results, 'w220-recovery-wording-preserved', recovery && /latest completed runner result/i.test(recovery.consultant && recovery.consultant.nextAction || ''), JSON.stringify(recovery.consultant));

  assertCase(results, 'report-and-trace-archived', /W248/.test(report) && trace.schema === 'forge.w248.consultant-story-surface-ui.trace.v1', trace.schema);

  const failed = results.filter((result) => !result.pass);
  results.forEach((result) => {
    console.log(`${result.pass ? 'PASS' : 'FAIL'} ${result.id} ${result.evidence}`);
  });
  if (failed.length) {
    console.error(`\nW248 harness failed ${failed.length}/${results.length} cases.`);
    process.exit(1);
  }
  console.log(`\nW248 harness passed ${results.length}/${results.length} cases.`);
}

main();
