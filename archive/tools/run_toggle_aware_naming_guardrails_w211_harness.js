const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const playgroundRoot = path.resolve(root, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const runnerPath = path.join(playgroundRoot, 'scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js');
const dataPath = path.join(root, 'data', 'w211_toggle_aware_naming_guardrails.json');
const tracePath = path.join(root, 'trace_samples', 'w211_toggle_aware_naming_guardrails_trace.json');
const reportPath = path.join(root, 'reports', 'w211_toggle_aware_naming_guardrails.md');

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
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
    fetch: () => Promise.reject(new Error('live NetSuite fetch disabled in W211 harness')),
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
  vm.runInContext(fs.readFileSync(userscriptPath, 'utf8'), sandbox, { filename: userscriptPath });
  if (!sandbox.__IDB_TEST_HOOKS__) throw new Error('Missing IDB test hooks.');
  return sandbox.__IDB_TEST_HOOKS__;
}

function summitState() {
  return {
    selectedLaneId: 'dealer_hardgoods',
    laneSelectionSource: 'consultant_confirmed',
    selectedActionId: 'prove',
    briefPrepared: true,
    setupEditMode: false,
    intake: {
      customer: 'Summit Outdoor Supply',
      website: 'https://www.summitoutdoorsupply.com',
      notes: 'Regional outdoor gear distributor is struggling to keep seasonal inventory aligned across retail, ecommerce, and wholesale channels. Buyers need better visibility into item availability, replenishment timing, and channel demand before committing to large seasonal orders.',
      scObjective: 'Show how NetSuite connects customer demand, item availability, sales order planning, and replenishment decisions in one operating path.'
    },
    toggles: {
      dealer_hardgoods: {
        createNewHeroItem: true,
        enableManufacturing: false,
        enableWip: false
      }
    },
    pageContext: {
      title: 'NetSuite Home',
      url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/center/card.nl',
      pageType: 'NetSuite page',
      contextId: 'generic_netsuite_page',
      confidence: 'low',
      capturedAt: '2026-05-18T12:00:00.000Z'
    }
  };
}

function completedResultWithNames(names) {
  return {
    schema: 'idb.completed-runner-result-json.v1',
    status: 'completed',
    runStatus: 'completed',
    generatedRecordOwner: 'governed_runner_internal_build_engine',
    familyKey: 'dealer_hardgoods',
    toggles: {
      createNewHeroItem: true,
      enableManufacturing: false,
      enableWip: false
    },
    records: {
      customer: {
        type: 'customer',
        name: 'Summit Outdoor Supply Customer Account',
        internalId: '1722',
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/entity/custjob.nl?id=1722'
      },
      demoTransaction: {
        type: 'salesorder',
        name: 'SO2679',
        internalId: '80828',
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/accounting/transactions/salesord.nl?id=80828'
      },
      heroItem: {
        type: 'inventoryitem',
        name: names.hero,
        internalId: '1865',
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=1865'
      },
      matrixProofItem: {
        type: 'inventoryitem',
        name: names.matrix,
        internalId: '2545',
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=2545'
      },
      componentItem: {
        type: 'inventoryitem',
        name: names.component,
        internalId: '2546',
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=2546'
      }
    }
  };
}

function contextFromState(hooks, state) {
  hooks.ensureWebsiteEvidenceRuntime(state);
  hooks.reconcileStateAuthority(state);
  const lane = hooks.getLane(state);
  const page = state.pageContext;
  const recommendation = hooks.recommendMove(lane, page);
  state.acceptedPacket = hooks.buildAcceptedPacketContext(state, lane, page, recommendation);
  hooks.reconcileStateAuthority(state);
  return { state, lane, page, recommendation };
}

function main() {
  const hooks = loadHooks();
  const runnerSource = fs.readFileSync(runnerPath, 'utf8');
  const context = contextFromState(hooks, summitState());
  const badResult = completedResultWithNames({
    hero: 'Summit Outdoor Supply Finished Good',
    matrix: 'Summit Outdoor Supply Production Line',
    component: 'Summit Outdoor Supply Ingredient Blend'
  });
  const goodResult = completedResultWithNames({
    hero: 'Summit Outdoor Supply Channel Availability SKU',
    matrix: 'Summit Outdoor Supply Dealer Replenishment Flow',
    component: 'Summit Outdoor Supply Allocation Support SKU'
  });
  const badGuard = hooks.validateDccFinalNamingImportPayload(badResult, context.state, context.lane, context.page, context.recommendation);
  const goodGuard = hooks.validateDccFinalNamingImportPayload(goodResult, context.state, context.lane, context.page, context.recommendation);
  const w211Model = hooks.toggleAwareNamingGuardrailContractW211V1(context.state, context.lane, context.page, context.recommendation, {
    completedResultJson: goodResult
  });

  const results = [];
  assertCase(results, 'summit_forbidden_terms_rejected', badGuard.valid === false && badGuard.status === 'toggle_vocabulary_guardrail_failed', badGuard.message);
  assertCase(results, 'summit_allowed_terms_accepted', goodGuard.valid === true, goodGuard.message);
  assertCase(results, 'w151_still_requires_numeric_ids_and_urls', goodGuard.finalNaming.displayObjects.length >= 4 && goodGuard.namingGuard.valid === true, goodGuard.status);
  assertCase(results, 'runner_guardrail_function_present', /function applyToggleAwareNamingGuardrails/.test(runnerSource), 'runner contains applyToggleAwareNamingGuardrails');
  assertCase(results, 'runner_no_missing_opts_manufacturing_default', /const enableManufacturing = !!\(opts && opts\.enableManufacturing === true\);/.test(runnerSource), 'missing opts no longer imply manufacturing enabled');
  assertCase(results, 'runner_logs_guardrail_rewrites', /IDB toggle-aware naming guardrail rewrites/.test(runnerSource), 'runner logs mode-aware rewrites');
  assertCase(results, 'w211_contract_exposed', w211Model.contract && w211Model.contract.vocabularyByMode && w211Model.noRegression.runnerOwnsGeneratedRecords === true, w211Model.status);

  const passCount = results.filter((item) => item.pass).length;
  const summary = {
    schema: 'idb.w211-toggle-aware-naming-guardrails-harness.v1',
    status: passCount === results.length ? 'pass' : 'fail',
    passCount,
    total: results.length,
    results,
    badGuard,
    goodGuard,
    w211Model
  };
  writeJson(dataPath, summary);
  writeJson(tracePath, {
    schema: 'idb.w211-trace-samples.v1',
    samples: [
      {
        event: 'w211.naming_guard_rejected_completed_result',
        status: badGuard.status,
        violations: badGuard.namingGuard && badGuard.namingGuard.violations || []
      },
      {
        event: 'w211.naming_guard_accepted_completed_result',
        status: goodGuard.status,
        names: goodResult.records
      }
    ]
  });
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, [
    '# W211 Toggle-Aware Naming Guardrails Report',
    '',
    `Status: ${summary.status.toUpperCase()} (${passCount}/${results.length})`,
    '',
    '## Contract',
    '- Website/category evidence owns industry and product nouns.',
    '- Build toggles own operating-model vocabulary.',
    '- Conversation notes shape story, ROI, competitive framing, and objections only.',
    '- Manufacturing and ingredient terms are blocked when Manufacturing=false and WIP=false.',
    '',
    '## Harness Results',
    ...results.map((item) => `- ${item.pass ? 'PASS' : 'FAIL'} ${item.id}: ${item.evidence}`)
  ].join('\n'));

  console.log(`W211 toggle-aware naming guardrails: ${summary.status.toUpperCase()} (${passCount}/${results.length})`);
  results.forEach((item) => console.log(`${item.pass ? 'PASS' : 'FAIL'} ${item.id} :: ${item.evidence}`));
  if (summary.status !== 'pass') process.exitCode = 1;
}

main();
