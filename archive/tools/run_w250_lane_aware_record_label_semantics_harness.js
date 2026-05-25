#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..', '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const fixturePath = path.join(root, 'archive', 'fixtures', 'w249_lane_pack_expansion_qa_fixtures.json');
const reportPath = path.join(root, 'archive', 'reports', 'w250_lane_aware_record_label_semantics.md');
const smokePacketPath = path.join(root, 'archive', 'reports', 'w250_install_ready_visual_smoke_packet.md');
const tracePath = path.join(root, 'archive', 'trace_samples', 'w250_lane_aware_record_label_semantics_trace.json');

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
    fetch: () => Promise.reject(new Error('live fetch disabled in W250 harness')),
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

function completedResult(fixture, overrides) {
  return {
    schema: 'forge.completed-runner-result.v2',
    status: 'completed',
    runStatus: 'completed',
    generatedRecordOwner: 'governed_runner_internal_build_engine',
    resolvedOperatingMode: fixture.resolvedOperatingMode,
    records: (overrides && overrides.records || fixture.records).map(record)
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

function normalizedFor(hooks, fixture, overrides) {
  const context = contextFor(hooks, stateFor(fixture));
  const normalized = hooks.canonicalImportResultNormalizationW245(
    completedResult(fixture, overrides),
    context.state,
    context.lane,
    context.page,
    context.recommendation
  );
  return {
    context,
    normalized,
    story: normalized.consultantStorySurfaceW247,
    html: hooks.renderConsultantStorySurfaceW248(normalized.consultantStorySurfaceW247)
  };
}

function proofLabel(normalized) {
  const proof = normalized.displayReadyRecords.find((recordItem) => recordItem.canonicalRole && !/customer|sales_order/.test(recordItem.canonicalRole));
  return proof && proof.consultantLabel || '';
}

function main() {
  const hooks = loadHooks();
  const fixtures = JSON.parse(read(fixturePath)).fixtures;
  const report = read(reportPath);
  const smokePacket = read(smokePacketPath);
  const trace = JSON.parse(read(tracePath));
  const userscript = read(userscriptPath);
  const results = [];

  const byPack = Object.fromEntries(fixtures.map((fixture) => [fixture.expectedPackId, fixture]));
  const industrialDistributor = normalizedFor(hooks, byPack['industrial-distributor']);
  const cpgDistributor = normalizedFor(hooks, byPack['cpg-distributor'], {
    records: byPack['cpg-distributor'].records.map((recordItem) => (
      recordItem.role === 'product_sku' ? Object.assign({}, recordItem, { role: 'heroItem' }) : recordItem
    ))
  });
  const industrialManufacturing = normalizedFor(hooks, byPack['industrial-manufacturing']);
  const equipmentManufacturing = normalizedFor(hooks, byPack['equipment-manufacturing']);
  const cpgManufacturing = normalizedFor(hooks, byPack['cpg-manufacturer']);
  const foodBeverage = normalizedFor(hooks, byPack['food-beverage-manufacturer']);

  assertCase(results, 'w250-helper-exported', typeof hooks.lanePackAwareRecordLabelW250 === 'function', 'lanePackAwareRecordLabelW250 exported');
  assertCase(results, 'industrial-distributor-labels-product-sku', proofLabel(industrialDistributor.normalized) === 'Product SKU' && industrialDistributor.story.openTarget.includes('(Product SKU)'), industrialDistributor.story.openTarget);
  assertCase(results, 'cpg-distributor-legacy-heroitem-labels-product-sku', proofLabel(cpgDistributor.normalized) === 'Product SKU' && cpgDistributor.story.openTarget.includes('(Product SKU)') && !/Finished\/Assembly Item/.test(cpgDistributor.story.openTarget), cpgDistributor.story.openTarget);

  const manufacturingEvidence = [
    industrialManufacturing.story.openTarget,
    equipmentManufacturing.story.openTarget,
    cpgManufacturing.story.openTarget,
    foodBeverage.story.openTarget
  ].join(' | ');
  assertCase(results, 'manufacturing-labels-remain-manufacturing-specific', /Finished\/Assembly Item/.test(manufacturingEvidence) && /Finished Food\/Batch Item/.test(manufacturingEvidence), manufacturingEvidence);

  const storyNamesAndLabels = [
    industrialDistributor,
    cpgDistributor,
    industrialManufacturing,
    equipmentManufacturing,
    cpgManufacturing,
    foodBeverage
  ].every((item) => item.html.includes(item.story.openTarget.replace(/^Open /, '').replace(/\.$/, '')) && /Live proof CTA/.test(item.html) && /Evidence confidence/.test(item.html));
  assertCase(results, 'w248-story-surface-uses-returned-names-and-lane-labels', storyNamesAndLabels, [
    industrialDistributor.story.openTarget,
    cpgDistributor.story.openTarget,
    industrialManufacturing.story.openTarget,
    equipmentManufacturing.story.openTarget,
    cpgManufacturing.story.openTarget,
    foodBeverage.story.openTarget
  ].join(' | '));

  const weakState = stateFor(Object.assign({}, byPack['cpg-distributor'], {
    customer: 'Unknown Buyer',
    website: 'https://unknown-example.com',
    notes: 'Conflicting lane evidence across food, apparel, and distribution.'
  }));
  const weakStory = hooks.consultantStorySurfaceFromLanePackW247(weakState, null, { displayReadyRecords: [] });
  assertCase(results, 'weak-conflicting-evidence-confirmation-gated', weakStory.status === 'needs_lane_confirmation' && /Confirm lane before opening proof records/.test(weakStory.openTarget) && /confirmation/i.test(weakStory.nllmAdvisory.uncertainty), JSON.stringify(weakStory));

  assertCase(results, 'install-smoke-packet-targeted-and-repo-local', /assets\/forge-icon\.png/.test(smokePacket) && /Targeted visual smoke: recommended/.test(smokePacket) && /Broad NetSuite visual regression: not required/.test(smokePacket), smokePacket);
  assertCase(results, 'icon-runtime-still-repo-derived', userscript.includes('FORGE_ICON_IMAGE_SRC') && userscript.includes('idb-forge-launcher-icon') && !userscript.includes('/Users/aaronsunshine/Downloads'), 'icon launcher wired without Downloads path');
  assertCase(results, 'report-and-trace-archived', /W250/.test(report) && trace.schema === 'forge.w250.lane-aware-record-label-semantics.trace.v1', trace.schema);
  assertCase(results, 'nllm-advisory-only-preserved', [industrialDistributor, cpgDistributor, foodBeverage].every((item) => item.story.nllmAdvisory.writeAuthority === 'none' && item.story.nllmAdvisory.creationAllowed === false), [industrialDistributor.story.nllmAdvisory, cpgDistributor.story.nllmAdvisory].map(JSON.stringify).join(' | '));

  const failed = results.filter((result) => !result.pass);
  results.forEach((result) => {
    console.log(`${result.pass ? 'PASS' : 'FAIL'} ${result.id} ${result.evidence}`);
  });
  if (failed.length) {
    console.error(`\nW250 harness failed ${failed.length}/${results.length} cases.`);
    process.exit(1);
  }
  console.log(`\nW250 harness passed ${results.length}/${results.length} cases.`);
}

main();
