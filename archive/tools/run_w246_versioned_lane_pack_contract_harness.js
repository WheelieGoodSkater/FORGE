#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..', '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const reportPath = path.join(root, 'archive', 'reports', 'w246_versioned_lane_pack_contract.md');
const tracePath = path.join(root, 'archive', 'trace_samples', 'w246_versioned_lane_pack_contract_trace.json');
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
    fetch: () => Promise.reject(new Error('live fetch disabled in W246 harness')),
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
      record('sales_order', 'salesorder', 'SO246', '3002', '/app/accounting/transactions/salesord.nl'),
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

function main() {
  const hooks = loadHooks();
  const report = read(reportPath);
  const trace = JSON.parse(read(tracePath));
  const results = [];
  const sourcePacks = lanePacks.LANE_PACKS;
  const drawerPacks = hooks.versionedLanePacksW246();
  const requiredPackIds = [
    'industrial-manufacturing',
    'equipment-manufacturing',
    'industrial-distributor',
    'cpg-distributor',
    'cpg-manufacturer',
    'food-beverage-manufacturer',
    'dealer-hardgoods',
    'apparel-style-matrix',
    'retail-availability'
  ];

  assertCase(results, 'schema-source-packs-valid', sourcePacks.length === 9 && sourcePacks.every((packItem) => lanePacks.validateLanePack(packItem).valid), sourcePacks.map((packItem) => packItem.packId).join(', '));
  assertCase(results, 'drawer-packs-valid-and-exported', drawerPacks.length === 9 && drawerPacks.every((packItem) => hooks.validateLanePackW246(packItem).valid), drawerPacks.map((packItem) => packItem.packId).join(', '));
  assertCase(results, 'required-pack-ids-present', requiredPackIds.every((packId) => drawerPacks.some((packItem) => packItem.packId === packId)), requiredPackIds.join(', '));

  const examples = [
    ['https://grainger.com', 'industrial-distributor', 'industrial_distribution', 'branch availability supplier lead time replenishment'],
    ['https://cat.com', 'equipment-manufacturing', 'industrial_equipment', 'configured equipment assembly work order routing'],
    ['https://ariens.com', 'industrial-manufacturing', 'industrial_equipment', 'industrial manufacturing component readiness assembly confidence'],
    ['https://unfi.com', 'cpg-distributor', 'products_cpg', 'cpg distributor grocery retail replenishment warehouse allocation'],
    ['https://milkbone.com', 'cpg-manufacturer', 'products_cpg', 'consumer packaged goods case pack packaging readiness'],
    ['https://mccormick.com', 'food-beverage-manufacturer', 'food_beverage', 'food ingredient flavor packaging batch'],
    ['https://trekbikes.com', 'dealer-hardgoods', 'dealer_hardgoods', 'bicycle dealer durable SKU allocation'],
    ['https://ariat.com', 'apparel-style-matrix', 'apparel_accessories', 'apparel footwear style size color'],
    ['https://rei.com', 'retail-availability', 'products_cpg', 'retail store availability ecommerce channel availability']
  ];
  const resolved = examples.map(([website, expectedPackId, laneId, categoryText]) => {
    const state = stateFor(expectedPackId, website, 'Conversation notes can shape pain and ROI only.', laneId);
    return hooks.resolveLanePackFromEvidenceW246(state, { categoryText });
  });
  assertCase(results, 'known-evidence-resolves-pack', resolved.every((item, index) => item.packId === examples[index][1] && item.status === 'resolved'), resolved.map((item) => `${item.packId}:${item.status}`).join(', '));

  const conflictState = stateFor('Trek', 'https://trekbikes.com', 'Food manufacturing ingredient batch and flavor notes.', 'dealer_hardgoods');
  const conflict = hooks.resolveLanePackFromEvidenceW246(conflictState, { categoryText: 'food manufacturing ingredient batch' });
  assertCase(results, 'notes-do-not-override-website-identity', conflict.packId === 'dealer-hardgoods' && conflict.notesOverrideIdentityAllowed === false, JSON.stringify({ packId: conflict.packId, notesOverrideIdentityAllowed: conflict.notesOverrideIdentityAllowed }));

  const advisory = hooks.nllmAdvisoryPayloadForLanePackW246(conflictState, conflict.lanePack, null);
  assertCase(results, 'nllm-advisory-guardrails', advisory.writeAuthority === 'none' && advisory.creationAllowed === false && advisory.hardLimits.includes('cannotOverrideWebsiteEvidence') && advisory.hardLimits.includes('cannotHideUncertainty'), advisory.hardLimits.join(', '));

  const dealerPack = drawerPacks.find((packItem) => packItem.packId === 'dealer-hardgoods');
  assertCase(results, 'forbidden-vocabulary-mode-specific', dealerPack.vocabulary.forbidden.some((term) => /ingredient|batch/i.test(term)) && dealerPack.recordRoles.invalid.some((role) => /ingredient|batch/i.test(role)), JSON.stringify(dealerPack.vocabulary.forbidden));

  const importState = stateFor('Grainger', 'https://grainger.com', 'Prove supplier risk, branch promise, and ROI.', 'industrial_distribution');
  const importContext = contextFor(hooks, importState);
  const normalized = hooks.canonicalImportResultNormalizationW245(completedResult(), importContext.state, importContext.lane, importContext.page, importContext.recommendation);
  const coaching = hooks.liveDemoCoachingFromLanePackW246(importState, normalized.versionedLanePackW246.lanePack, normalized);
  assertCase(results, 'live-demo-coaching-answers-five-questions', !!(coaching.whatShouldIOpen && coaching.whatShouldIProve && coaching.safeToSay && coaching.shouldNotClaim && coaching.buyerFacingSoWhat), JSON.stringify(coaching));
  assertCase(results, 'w245-normalization-carries-w246-pack', normalized.versionedLanePackW246.packId === 'industrial-distributor' && normalized.lanePackNllmAdvisoryPayloadW246.writeAuthority === 'none', JSON.stringify({ packId: normalized.versionedLanePackW246.packId, status: normalized.status }));

  assertCase(results, 'report-and-trace-archived', /W246/.test(report) && trace && trace.schema === 'forge.w246.versioned-lane-pack-contract.trace.v1', trace.schema);

  const failed = results.filter((result) => !result.pass);
  results.forEach((result) => {
    console.log(`${result.pass ? 'PASS' : 'FAIL'} ${result.id} ${result.evidence}`);
  });
  if (failed.length) {
    console.error(`\nW246 harness failed ${failed.length}/${results.length} cases.`);
    process.exit(1);
  }
  console.log(`\nW246 harness passed ${results.length}/${results.length} cases.`);
}

main();
