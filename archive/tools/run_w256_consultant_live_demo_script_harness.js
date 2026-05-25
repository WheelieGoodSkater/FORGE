#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..', '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const fixturePath = path.join(root, 'archive', 'fixtures', 'w249_lane_pack_expansion_qa_fixtures.json');
const reportPath = path.join(root, 'archive', 'reports', 'w256_consultant_live_demo_script.md');
const tracePath = path.join(root, 'archive', 'trace_samples', 'w256_consultant_live_demo_script_trace.json');

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
    fetch: () => Promise.reject(new Error('live fetch disabled in W256 harness')),
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
    script: hooks.consultantLiveDemoScriptW256(story),
    qa: hooks.receiptDrivenLaneExpansionQaW255(normalized.versionedLanePackW246.lanePack, story),
    html: hooks.renderConsultantStorySurfaceW248(story)
  };
}

function wordCount(text) {
  return String(text || '').trim().split(/\s+/).filter(Boolean).length;
}

function main() {
  const hooks = loadHooks();
  const fixtures = JSON.parse(read(fixturePath)).fixtures;
  const report = read(reportPath);
  const trace = JSON.parse(read(tracePath));
  const rendered = fixtures.map((fixture) => renderedFor(hooks, fixture));
  const results = [];
  const requiredLineKeys = ['openingLine', 'whatToOpen', 'whatToProve', 'safeBuyerClaim', 'valueSoWhat', 'stopGuardrail', 'uncertaintyLine'];
const bannedPositiveClaim = /\b(guarantee|guaranteed|will increase|records created|write transaction|unsupported lane fit)\b/i;

  assertCase(results, 'live-demo-script-includes-required-sections',
    rendered.every((item) => item.script.schema === 'forge.w256.consultant-live-demo-script.v1' && requiredLineKeys.every((key) => item.script.lines[key])),
    rendered.map((item) => `${item.fixture.id}:${Object.keys(item.script.lines).join(',')}`).join(' | '));

  assertCase(results, 'script-uses-returned-record-names-and-lane-aware-labels',
    rendered.every((item) => {
      const scriptText = Object.values(item.script.lines).join(' ');
      return scriptText.includes(item.fixture.proofRecordName) && /\((Product SKU|Finished\/Assembly Item|Finished Food\/Batch Item|Availability\/Replenishment Flow|Work Order|Ingredient Item|Formula or Batch Structure|Component Item)\)/.test(scriptText);
    }),
    rendered.map((item) => `${item.fixture.id}:${item.script.lines.whatToOpen}`).join(' | '));

  assertCase(results, 'script-is-short-and-consultant-facing',
    rendered.every((item) => wordCount(Object.values(item.script.lines).join(' ')) <= 145 && !/schema|hardLimits|writeAuthority|runnerTaskId|raw JSON|stack trace/i.test(Object.values(item.script.lines).join(' '))),
    rendered.map((item) => `${item.fixture.id}:${wordCount(Object.values(item.script.lines).join(' '))}`).join(' | '));

assertCase(results, 'script-avoids-banned-overclaims-and-write-creation-claims',
  rendered.every((item) => {
    const { stopGuardrail, ...claimLines } = item.script.lines;
    return !bannedPositiveClaim.test(Object.values(claimLines).join(' ')) &&
      /do not claim/i.test(stopGuardrail) &&
      /created records/i.test(stopGuardrail) &&
      /write actions/i.test(stopGuardrail) &&
      /measured ROI/i.test(stopGuardrail);
  }),
  rendered.map((item) => `${item.fixture.id}:${Object.values(item.script.lines).join(' ')}`).join(' | '));

  const weakState = stateFor(fixtures[0]);
  weakState.intake.website = 'https://unknown-example.com';
  weakState.intake.notes = 'Maybe food, maybe apparel, maybe distributor. Evidence is conflicting.';
  const weakStory = hooks.consultantStorySurfaceFromLanePackW247(weakState, null, {
    displayReadyRecords: rendered[0].normalized.visibleRecords
  });
  const weakScript = hooks.consultantLiveDemoScriptW256(weakStory);
  assertCase(results, 'weak-conflicting-evidence-produces-confirmation-script',
    weakStory.status === 'needs_lane_confirmation' &&
      weakScript.status === 'needs_confirmation_script' &&
      /confirming the lane|needs confirmation/i.test(`${weakScript.lines.openingLine} ${weakScript.lines.uncertaintyLine}`),
    JSON.stringify(weakScript));

  assertCase(results, 'w254-receipt-remains-expandable-under-script',
    rendered.every((item) => /idb-w256-live-demo-script/.test(item.html) && /idb-w254-evidence-receipt/.test(item.html) && item.html.indexOf('idb-w256-live-demo-script') < item.html.indexOf('idb-w254-evidence-receipt')),
    rendered[0].html.slice(0, 1800));

  assertCase(results, 'w255-receipt-driven-qa-remains-available',
    rendered.every((item) => item.qa.status === 'pass'),
    rendered.map((item) => `${item.fixture.id}:${item.qa.status}`).join(' | '));

  assertCase(results, 'weak-conflicting-evidence-remains-confirmation-gated',
    /Confirm lane before opening proof records/.test(weakStory.openTarget) &&
      /Confirm the lane before opening proof records/.test(hooks.consultantStoryFirstGlanceW255(weakStory).nextAction),
    JSON.stringify(weakStory));

  assertCase(results, 'report-and-trace-archived',
    /W256/.test(report) && trace.schema === 'forge.w256.consultant-live-demo-script.trace.v1',
    trace.schema);

  const failed = results.filter((result) => !result.pass);
  results.forEach((result) => {
    console.log(`${result.pass ? 'PASS' : 'FAIL'} ${result.id} ${result.evidence}`);
  });
  if (failed.length) {
    console.error(`\nW256 harness failed ${failed.length}/${results.length} cases.`);
    process.exit(1);
  }
  console.log(`\nW256 harness passed ${results.length}/${results.length} cases.`);
}

main();
