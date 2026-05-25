#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..', '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const fixturePath = path.join(root, 'archive', 'fixtures', 'w249_lane_pack_expansion_qa_fixtures.json');
const reportPath = path.join(root, 'archive', 'reports', 'w249_lane_pack_expansion_qa.md');
const tracePath = path.join(root, 'archive', 'trace_samples', 'w249_lane_pack_expansion_qa_trace.json');
const iconPath = path.join(root, 'assets', 'forge-icon.png');
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
    fetch: () => Promise.reject(new Error('live fetch disabled in W249 harness')),
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

function storyHtmlFor(hooks, fixture) {
  const state = stateFor(fixture);
  const context = contextFor(hooks, state);
  const normalized = hooks.canonicalImportResultNormalizationW245(
    completedResult(fixture),
    context.state,
    context.lane,
    context.page,
    context.recommendation
  );
  return {
    normalized,
    story: normalized.consultantStorySurfaceW247,
    html: hooks.renderConsultantStorySurfaceW248(normalized.consultantStorySurfaceW247)
  };
}

function storyCopyIsGrounded(packItem) {
  const copy = [
    packItem.liveDemo.proofMove,
    packItem.liveDemo.storyAnchor,
    packItem.liveDemo.roiSoWhat,
    packItem.liveDemo.competitiveContrast
  ].join(' ');
  return !/\b(guarantee|guaranteed|always|never|measured ROI|will increase|will reduce|eliminate|prove ROI)\b/i.test(copy);
}

function main() {
  const hooks = loadHooks();
  const fixtures = JSON.parse(read(fixturePath));
  const report = read(reportPath);
  const trace = JSON.parse(read(tracePath));
  const userscript = read(userscriptPath);
  const iconBase64Prefix = fs.readFileSync(iconPath).toString('base64').slice(0, 96);
  const results = [];
  const requiredPackIds = fixtures.fixtures.map((fixture) => fixture.expectedPackId);
  const sourcePacks = lanePacks.LANE_PACKS.filter((packItem) => requiredPackIds.includes(packItem.packId));
  const drawerPacks = hooks.versionedLanePacksW246().filter((packItem) => requiredPackIds.includes(packItem.packId));

  assertCase(results, 'source-story-copy-required-fields', sourcePacks.length === requiredPackIds.length && sourcePacks.every((packItem) => packItem.liveDemo && packItem.liveDemo.proofMove && packItem.liveDemo.storyAnchor && packItem.liveDemo.roiSoWhat && packItem.liveDemo.competitiveContrast), sourcePacks.map((packItem) => packItem.packId).join(', '));
  assertCase(results, 'drawer-story-copy-required-fields', drawerPacks.length === requiredPackIds.length && drawerPacks.every((packItem) => packItem.liveDemo && packItem.liveDemo.proofMove && packItem.liveDemo.storyAnchor && packItem.liveDemo.roiSoWhat && packItem.liveDemo.competitiveContrast), drawerPacks.map((packItem) => packItem.packId).join(', '));
  assertCase(results, 'lane-pack-copy-has-no-banned-overclaims', sourcePacks.concat(drawerPacks).every(storyCopyIsGrounded), sourcePacks.concat(drawerPacks).map((packItem) => `${packItem.packId}:${packItem.liveDemo.roiSoWhat}`).join(' | '));

  const sourceResolved = fixtures.fixtures.map((fixture) => lanePacks.resolveLanePackFromEvidence({
    website: fixture.website,
    categoryText: fixture.categoryText
  }));
  const drawerResolved = fixtures.fixtures.map((fixture) => hooks.resolveLanePackFromEvidenceW246(stateFor(fixture), {
    categoryText: fixture.categoryText
  }));
  assertCase(results, 'source-fixtures-resolve-expected-lane-pack', sourceResolved.every((resolution, index) => resolution.packId === fixtures.fixtures[index].expectedPackId && resolution.status === 'resolved'), sourceResolved.map((resolution) => `${resolution.packId}:${resolution.status}`).join(', '));
  assertCase(results, 'drawer-fixtures-resolve-expected-lane-pack', drawerResolved.every((resolution, index) => resolution.packId === fixtures.fixtures[index].expectedPackId && resolution.status === 'resolved'), drawerResolved.map((resolution) => `${resolution.packId}:${resolution.status}`).join(', '));

  const rendered = fixtures.fixtures.map((fixture) => Object.assign({ fixture }, storyHtmlFor(hooks, fixture)));
  assertCase(results, 'w248-story-surfaces-use-returned-record-names', rendered.every((item) => item.story && item.story.status === 'story_ready' && item.story.openTarget.includes(item.fixture.proofRecordName) && item.html.includes(item.fixture.proofRecordName)), rendered.map((item) => `${item.fixture.id}:${item.story && item.story.openTarget}`).join(' | '));
  assertCase(results, 'w248-story-surfaces-stay-consultant-facing', rendered.every((item) => /Live demo talk track/.test(item.html) && /Safe to say/.test(item.html) && /Do not claim/.test(item.html) && !/writeAuthority|hardLimits|runnerTaskId|stack trace|raw JSON/i.test(item.html)), rendered.map((item) => item.html.slice(0, 300)).join('\n---\n'));
  assertCase(results, 'nllm-remains-advisory-and-uncertainty-visible', rendered.every((item) => item.story.nllmAdvisory && item.story.nllmAdvisory.writeAuthority === 'none' && item.story.nllmAdvisory.creationAllowed === false && /uncertainty/i.test(item.story.nllmAdvisory.uncertainty)), rendered.map((item) => `${item.fixture.id}:${JSON.stringify(item.story.nllmAdvisory)}`).join(' | '));

  const weakState = {
    selectedLaneId: 'products_cpg',
    laneSelectionSource: 'consultant_confirmed',
    selectedActionId: 'prove',
    briefPrepared: true,
    setupEditMode: false,
    intake: {
      customer: 'Unknown Buyer',
      website: 'https://unknown-example.com',
      notes: 'Maybe food, maybe apparel, maybe distributor. Evidence is conflicting.'
    },
    toggles: {},
    pageContext: { title: 'NetSuite Home', url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/center/card.nl', pageType: 'NetSuite page', contextId: 'generic_netsuite_page', confidence: 'low' }
  };
  const weakStory = hooks.consultantStorySurfaceFromLanePackW247(weakState, null, { displayReadyRecords: [] });
  assertCase(results, 'weak-conflicting-evidence-remains-confirmation-gated', weakStory.status === 'needs_lane_confirmation' && /Confirm lane before opening proof records/.test(weakStory.openTarget) && /confirmation/i.test(weakStory.nllmAdvisory.uncertainty), JSON.stringify(weakStory));

  assertCase(results, 'forge-icon-asset-is-repo-local', fs.existsSync(iconPath) && fs.statSync(iconPath).size > 100000 && !userscript.includes('/Users/aaronsunshine/Downloads'), fs.existsSync(iconPath) ? `${path.relative(root, iconPath)} ${fs.statSync(iconPath).size}` : 'missing icon');
  assertCase(results, 'forge-icon-used-in-launcher-location', userscript.includes('FORGE_ICON_IMAGE_SRC') && userscript.includes('idb-forge-launcher-icon') && userscript.includes('rail.appendChild(railIcon)') && hooks.FORGE_ICON_IMAGE_SRC.startsWith('data:image/png;base64,') && hooks.FORGE_ICON_IMAGE_SRC.includes(iconBase64Prefix), 'launcher icon data URL wired from assets/forge-icon.png');

  assertCase(results, 'report-fixture-trace-archived', /W249/.test(report) && fixtures.schema === 'forge.w249.lane-pack-expansion-qa-fixtures.v1' && trace.schema === 'forge.w249.lane-pack-expansion-qa.trace.v1', trace.schema);

  const failed = results.filter((result) => !result.pass);
  results.forEach((result) => {
    console.log(`${result.pass ? 'PASS' : 'FAIL'} ${result.id} ${result.evidence}`);
  });
  if (failed.length) {
    console.error(`\nW249 harness failed ${failed.length}/${results.length} cases.`);
    process.exit(1);
  }
  console.log(`\nW249 harness passed ${results.length}/${results.length} cases.`);
}

main();
