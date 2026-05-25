#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..', '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const fixturePath = path.join(root, 'archive', 'fixtures', 'w249_lane_pack_expansion_qa_fixtures.json');
const reportPath = path.join(root, 'archive', 'reports', 'w258_story_surface_density_header_polish.md');
const tracePath = path.join(root, 'archive', 'trace_samples', 'w258_story_surface_density_header_polish_trace.json');

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
    fetch: () => Promise.reject(new Error('live fetch disabled in W258 harness')),
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
  const state = stateFor(fixture);
  const context = contextFor(hooks, state);
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
    state,
    normalized,
    story,
    qa: hooks.receiptDrivenLaneExpansionQaW255(normalized.versionedLanePackW246.lanePack, story),
    storyHtml: hooks.renderConsultantStorySurfaceW248(story),
    drawerHtml: hooks.renderDrawer(state)
  };
}

function countMatches(text, pattern) {
  const matches = String(text || '').match(pattern);
  return matches ? matches.length : 0;
}

function main() {
  const hooks = loadHooks();
  const fixtures = JSON.parse(read(fixturePath)).fixtures;
  const report = read(reportPath);
  const trace = JSON.parse(read(tracePath));
  const rendered = fixtures.map((fixture) => renderedFor(hooks, fixture));
  const css = read(userscriptPath);
  const sample = rendered[0];
  const results = [];

  assertCase(results, 'first-glance-story-surface-contains-live-proof-cta-fields',
    rendered.every((item) => /idb-w258-first-glance-cta/.test(item.storyHtml) &&
      /Live proof CTA/.test(item.storyHtml) &&
      /Proof action/.test(item.storyHtml) &&
      /Safe claim/.test(item.storyHtml) &&
      /Stop/.test(item.storyHtml) &&
      /Evidence confidence:/.test(item.storyHtml)),
    sample.storyHtml.slice(0, 1800));

  assertCase(results, 'normal-consultant-ui-avoids-duplicate-coaching-clutter',
    rendered.every((item) => countMatches(item.storyHtml, /idb-status-strip/g) === 1 &&
      countMatches(item.storyHtml, /idb-w256-live-demo-script/g) === 1 &&
      countMatches(item.storyHtml, /idb-w257-guided-demo-sequence/g) === 1 &&
      /<details class="idb-technical-details idb-w256-live-demo-script">/.test(item.storyHtml) &&
      /<details class="idb-technical-details idb-w257-guided-demo-sequence">/.test(item.storyHtml)),
    sample.storyHtml.slice(0, 2400));

  assertCase(results, 'w256-script-and-w257-sequence-remain-compact-expandable',
    rendered.every((item) => item.storyHtml.indexOf('idb-w256-live-demo-script') < item.storyHtml.indexOf('idb-w257-guided-demo-sequence') &&
      /<summary>Say this live<\/summary>/.test(item.storyHtml) &&
      /<summary>Guided demo sequence<\/summary>/.test(item.storyHtml)),
    sample.storyHtml.slice(0, 2600));

  assertCase(results, 'w254-receipt-remains-expandable-and-below-coaching',
    rendered.every((item) => /idb-w254-evidence-receipt/.test(item.storyHtml) &&
      item.storyHtml.indexOf('idb-w257-guided-demo-sequence') < item.storyHtml.indexOf('idb-w254-evidence-receipt')),
    sample.storyHtml.slice(0, 3200));

  assertCase(results, 'returned-record-names-and-lane-aware-labels-visible',
    rendered.every((item) => item.storyHtml.includes(item.fixture.proofRecordName) &&
      /\((Product SKU|Finished\/Assembly Item|Finished Food\/Batch Item|Availability\/Replenishment Flow|Work Order|Ingredient Item|Formula or Batch Structure|Component Item)\)/.test(item.storyHtml)),
    rendered.map((item) => `${item.fixture.id}:${item.storyHtml.match(/Open [^<]+/)}`).join(' | '));

  assertCase(results, 'normal-ui-hides-raw-diagnostics-and-admin-review',
    rendered.every((item) => !/raw JSON|stack trace|runnerTaskId|schema:|hardLimits|writeAuthority|idb-w252-lane-pack-review|install action/i.test(item.storyHtml)),
    sample.storyHtml.slice(0, 2000));

  assertCase(results, 'forge-header-uses-compact-scout-style-layout',
    /idb-header/.test(sample.drawerHtml) &&
      /idb-header-meta/.test(sample.drawerHtml) &&
      /idb-version-pill/.test(sample.drawerHtml) &&
      /idb-bug-button/.test(sample.drawerHtml) &&
      /background: #5a95a6/.test(css) &&
      /background: #efc85f/.test(css),
    sample.drawerHtml.slice(0, 1200));

  assertCase(results, 'forge-logo-smaller-and-does-not-dominate-first-viewport',
    /width: 188px/.test(css) &&
      /max-height: 58px/.test(css) &&
      /height: calc\(100vh - 73px\)/.test(css),
    'logo 188px / 58px, body offset 73px');

  assertCase(results, 'version-and-bug-enhancement-button-present-without-external-dependency',
    /V1\.0\.0/.test(sample.drawerHtml) &&
      !/w144-error-trace|v0\.1\.2/i.test(sample.drawerHtml) &&
      /Bug \/ Enhancement/.test(sample.drawerHtml) &&
      !/href=|window\.open|https?:\/\/.*Bug/i.test(sample.drawerHtml),
    sample.drawerHtml.slice(0, 1000));

  assertCase(results, 'close-tabs-first-card-remain-reachable-after-header-polish',
    /data-idb-close/.test(sample.drawerHtml) &&
      /idb-state-tabs/.test(sample.drawerHtml) &&
      /idb-card/.test(sample.drawerHtml),
    sample.drawerHtml.slice(0, 1800));

  assertCase(results, 'w255-receipt-driven-qa-remains-available',
    rendered.every((item) => item.qa.status === 'pass'),
    rendered.map((item) => `${item.fixture.id}:${item.qa.status}`).join(' | '));

  const weakState = stateFor(fixtures[0]);
  weakState.intake.website = 'https://unknown-example.com';
  weakState.intake.notes = 'Maybe food, maybe apparel, maybe distributor. Evidence is conflicting.';
  const weakStory = hooks.consultantStorySurfaceFromLanePackW247(weakState, null, {
    displayReadyRecords: rendered[0].normalized.visibleRecords
  });
  const weakHtml = hooks.renderConsultantStorySurfaceW248(weakStory);
  assertCase(results, 'weak-conflicting-evidence-remains-confirmation-gated',
    /Confirm lane before opening proof records/.test(weakStory.openTarget) &&
      /Frame this as a lane-confirmation moment/.test(weakHtml) &&
      /Evidence confidence: Low/.test(weakHtml),
    weakHtml.slice(0, 2200));

  assertCase(results, 'report-and-trace-archived',
    /W258/.test(report) && trace.schema === 'forge.w258.story-surface-density-header-polish.trace.v1',
    trace.schema);

  const failed = results.filter((result) => !result.pass);
  results.forEach((result) => {
    console.log(`${result.pass ? 'PASS' : 'FAIL'} ${result.id} ${result.evidence}`);
  });
  if (failed.length) {
    console.error(`\nW258 harness failed ${failed.length}/${results.length} cases.`);
    process.exit(1);
  }
  console.log(`\nW258 harness passed ${results.length}/${results.length} cases.`);
}

main();
