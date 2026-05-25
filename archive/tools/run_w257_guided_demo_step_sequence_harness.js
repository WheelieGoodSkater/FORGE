#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..', '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const fixturePath = path.join(root, 'archive', 'fixtures', 'w249_lane_pack_expansion_qa_fixtures.json');
const reportPath = path.join(root, 'archive', 'reports', 'w257_guided_demo_step_sequence.md');
const tracePath = path.join(root, 'archive', 'trace_samples', 'w257_guided_demo_step_sequence_trace.json');

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
    fetch: () => Promise.reject(new Error('live fetch disabled in W257 harness')),
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
    normalized,
    story,
    script: hooks.consultantLiveDemoScriptW256(story),
    sequence: hooks.guidedDemoStepSequenceW257(story),
    qa: hooks.receiptDrivenLaneExpansionQaW255(normalized.versionedLanePackW246.lanePack, story),
    html: hooks.renderConsultantStorySurfaceW248(story)
  };
}

function wordCount(text) {
  return String(text || '').trim().split(/\s+/).filter(Boolean).length;
}

function sequenceText(sequence) {
  return [
    ...sequence.steps.map((step) => step.line),
    sequence.stopCondition,
    sequence.likelyBuyerObjection,
    sequence.safeObjectionResponse,
    sequence.uncertaintyResponse
  ].join(' ');
}

function main() {
  const hooks = loadHooks();
  const fixtures = JSON.parse(read(fixturePath)).fixtures;
  const report = read(reportPath);
  const trace = JSON.parse(read(tracePath));
  const rendered = fixtures.map((fixture) => renderedFor(hooks, fixture));
  const results = [];
  const requiredStepIds = ['frame_buyer_problem', 'open_returned_record', 'prove_value_so_what'];
  const bannedPositiveClaim = /\b(guarantee|guaranteed|will increase|records created|write transaction|write action|created record|measured ROI|unsupported lane fit|invented fact)\b/i;

  assertCase(results, 'guided-sequence-includes-required-steps-and-objection-fields',
    rendered.every((item) => item.sequence.schema === 'forge.w257.guided-demo-step-sequence.v1' &&
      requiredStepIds.every((id) => item.sequence.steps.some((step) => step.id === id && step.line)) &&
      item.sequence.stopCondition &&
      item.sequence.likelyBuyerObjection &&
      item.sequence.safeObjectionResponse &&
      item.sequence.uncertaintyResponse),
    rendered.map((item) => `${item.fixture.id}:${item.sequence.steps.map((step) => step.id).join(',')}`).join(' | '));

  assertCase(results, 'sequence-uses-returned-record-names-and-lane-aware-labels',
    rendered.every((item) => {
      const text = sequenceText(item.sequence);
      return text.includes(item.fixture.proofRecordName) && /\((Product SKU|Finished\/Assembly Item|Finished Food\/Batch Item|Availability\/Replenishment Flow|Work Order|Ingredient Item|Formula or Batch Structure|Component Item)\)/.test(text);
    }),
    rendered.map((item) => `${item.fixture.id}:${item.sequence.steps[1].line}`).join(' | '));

  assertCase(results, 'sequence-remains-short-and-consultant-facing',
    rendered.every((item) => wordCount(sequenceText(item.sequence)) <= 120 && !/schema|hardLimits|writeAuthority|runnerTaskId|raw JSON|stack trace/i.test(sequenceText(item.sequence))),
    rendered.map((item) => `${item.fixture.id}:${wordCount(sequenceText(item.sequence))}`).join(' | '));

  assertCase(results, 'objection-response-avoids-overclaims-write-creation-and-invented-facts',
    rendered.every((item) => {
      const nonGuardrailText = [
        item.sequence.likelyBuyerObjection,
        item.sequence.safeObjectionResponse,
        item.sequence.uncertaintyResponse,
        ...item.sequence.steps.map((step) => step.line)
      ].join(' ');
      return !bannedPositiveClaim.test(nonGuardrailText) &&
        /do not claim/i.test(item.sequence.stopCondition) &&
        /created records|record creation/i.test(item.sequence.stopCondition) &&
        /write actions|writes/i.test(item.sequence.stopCondition) &&
        /measured ROI|ROI/i.test(item.sequence.stopCondition);
    }),
    rendered.map((item) => `${item.fixture.id}:${sequenceText(item.sequence)}`).join(' | '));

  const weakState = stateFor(fixtures[0]);
  weakState.intake.website = 'https://unknown-example.com';
  weakState.intake.notes = 'Maybe food, maybe apparel, maybe distributor. Evidence is conflicting.';
  const weakStory = hooks.consultantStorySurfaceFromLanePackW247(weakState, null, {
    displayReadyRecords: rendered[0].normalized.visibleRecords
  });
  const weakSequence = hooks.guidedDemoStepSequenceW257(weakStory);
  assertCase(results, 'weak-conflicting-evidence-produces-confirmation-first-sequence',
    weakStory.status === 'needs_lane_confirmation' &&
      weakSequence.status === 'confirmation_first_sequence' &&
      /confirm/i.test(`${weakSequence.steps[0].line} ${weakSequence.safeObjectionResponse} ${weakSequence.uncertaintyResponse}`),
    JSON.stringify(weakSequence));

  assertCase(results, 'w256-script-and-w254-receipt-remain-available',
    rendered.every((item) => /idb-w256-live-demo-script/.test(item.html) &&
      /idb-w257-guided-demo-sequence/.test(item.html) &&
      /idb-w254-evidence-receipt/.test(item.html) &&
      item.html.indexOf('idb-w256-live-demo-script') < item.html.indexOf('idb-w257-guided-demo-sequence') &&
      item.html.indexOf('idb-w257-guided-demo-sequence') < item.html.indexOf('idb-w254-evidence-receipt')),
    rendered[0].html.slice(0, 2200));

  assertCase(results, 'w255-receipt-driven-qa-remains-available',
    rendered.every((item) => item.qa.status === 'pass'),
    rendered.map((item) => `${item.fixture.id}:${item.qa.status}`).join(' | '));

  assertCase(results, 'weak-conflicting-evidence-remains-confirmation-gated',
    /Confirm lane before opening proof records/.test(weakStory.openTarget) &&
      /Confirm the lane before opening proof records/.test(hooks.consultantStoryFirstGlanceW255(weakStory).nextAction),
    JSON.stringify(weakStory));

  assertCase(results, 'report-and-trace-archived',
    /W257/.test(report) && trace.schema === 'forge.w257.guided-demo-step-sequence.trace.v1',
    trace.schema);

  const failed = results.filter((result) => !result.pass);
  results.forEach((result) => {
    console.log(`${result.pass ? 'PASS' : 'FAIL'} ${result.id} ${result.evidence}`);
  });
  if (failed.length) {
    console.error(`\nW257 harness failed ${failed.length}/${results.length} cases.`);
    process.exit(1);
  }
  console.log(`\nW257 harness passed ${results.length}/${results.length} cases.`);
}

main();
