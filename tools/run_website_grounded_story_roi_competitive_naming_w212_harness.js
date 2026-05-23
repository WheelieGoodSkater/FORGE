const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const playgroundRoot = path.resolve(root, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const runnerPath = path.join(playgroundRoot, 'scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js');
const dataPath = path.join(root, 'data', 'w212_website_grounded_story_roi_competitive_naming.json');
const tracePath = path.join(root, 'trace_samples', 'w212_website_grounded_story_roi_competitive_naming_trace.json');
const reportPath = path.join(root, 'reports', 'w212_website_grounded_story_roi_competitive_naming.md');

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
    fetch: () => Promise.reject(new Error('live NetSuite fetch disabled in W212 harness')),
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

function baseState(customer, website, notes, laneId) {
  return {
    selectedLaneId: laneId,
    laneSelectionSource: 'consultant_confirmed',
    selectedActionId: 'prove',
    briefPrepared: true,
    setupEditMode: false,
    intake: {
      customer,
      website,
      notes
    },
    toggles: {
      [laneId]: {
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

function completedResult(customer, names, laneId) {
  return {
    schema: 'idb.completed-runner-result-json.v1',
    status: 'completed',
    runStatus: 'completed',
    generatedRecordOwner: 'governed_runner_internal_build_engine',
    familyKey: laneId,
    toggles: {
      createNewHeroItem: true,
      enableManufacturing: false,
      enableWip: false
    },
    records: {
      customer: {
        type: 'customer',
        name: `${customer} Customer Account`,
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

function forbiddenText(value) {
  return /\b(finished\s+good|ingredient(?:\s+blend)?|production\s+line|bom|assembly|work\s+order|routing|wip|manufacturing\s+line)\b/i.test(String(value || ''));
}

function main() {
  const hooks = loadHooks();
  const runnerSource = fs.readFileSync(runnerPath, 'utf8');
  const summit = contextFromState(hooks, baseState(
    'Summit Outdoor Supply',
    'https://www.summitoutdoorsupply.com',
    'Regional outdoor gear distributor is struggling to keep seasonal inventory aligned across retail, ecommerce, and wholesale channels. Buyers need visibility into item availability, replenishment timing, and channel demand before committing to large seasonal orders.',
    'dealer_hardgoods'
  ));
  const ariat = contextFromState(hooks, baseState(
    'Ariat International',
    'https://www.ariat.com',
    'Buyer needs style, size, color, replenishment timing, and channel availability connected for seasonal footwear and apparel launches.',
    'apparel_accessories'
  ));

  const summitGood = completedResult('Summit Outdoor Supply', {
    hero: 'Summit Outdoor Supply Channel Availability SKU',
    matrix: 'Summit Outdoor Supply Dealer Replenishment Flow',
    component: 'Summit Outdoor Supply Allocation Support SKU'
  }, 'dealer_hardgoods');
  const summitBad = completedResult('Summit Outdoor Supply', {
    hero: 'Summit Outdoor Supply Finished Good',
    matrix: 'Summit Outdoor Supply Production Line',
    component: 'Summit Outdoor Supply Ingredient Blend'
  }, 'dealer_hardgoods');
  const ariatGood = completedResult('Ariat International', {
    hero: 'Ariat International Style SKU',
    matrix: 'Ariat International Omnichannel Availability Flow',
    component: 'Ariat International Size / Color Variant'
  }, 'apparel_accessories');

  const summitModel = hooks.websiteGroundedStoryRoiCompetitiveNamingOrchestrationW212V1(
    summit.state,
    summit.lane,
    summit.page,
    summit.recommendation,
    { completedResultJson: summitGood }
  );
  const summitBadGuard = hooks.validateDccFinalNamingImportPayload(summitBad, summit.state, summit.lane, summit.page, summit.recommendation);
  const ariatModel = hooks.websiteGroundedStoryRoiCompetitiveNamingOrchestrationW212V1(
    ariat.state,
    ariat.lane,
    ariat.page,
    ariat.recommendation,
    { completedResultJson: ariatGood }
  );

  const summitNames = summitModel.layers.recordNamingIntent.names;
  const ariatNames = ariatModel.layers.recordNamingIntent.names;
  const results = [];
  assertCase(results, 'four_orchestration_layers_present', Object.keys(summitModel.layers).length === 4, Object.keys(summitModel.layers).join(', '));
  assertCase(results, 'website_controls_naming_nouns', summitModel.layers.websiteCategoryEvidence.authority === 'website_category_controls_industry_product_and_naming_nouns' && summitModel.layers.recordNamingIntent.notesRole === 'not_allowed_to_override_record_nouns', summitModel.layers.recordNamingIntent.authority);
  assertCase(results, 'toggles_control_operating_vocabulary', summitModel.layers.toggleAwareOperatingModel.modeKey === 'dealer_hardgoods' && summitModel.layers.toggleAwareOperatingModel.enableManufacturing === false, JSON.stringify(summitModel.layers.toggleAwareOperatingModel));
  assertCase(results, 'notes_control_story_roi_competitive_only', summitModel.layers.storyRoiCompetitiveCoaching.notesUsedFor.includes('ROI framing') && summitModel.layers.storyRoiCompetitiveCoaching.notesNotUsedFor.includes('toggle override'), JSON.stringify(summitModel.layers.storyRoiCompetitiveCoaching.notesUsedFor));
  assertCase(results, 'summit_non_mfg_names_are_dealer_distribution_safe', !forbiddenText(Object.values(summitNames).join(' ')) && /Channel Availability SKU|Dealer Replenishment Flow|Allocation Support SKU/.test(Object.values(summitNames).join(' ')), JSON.stringify(summitNames));
  assertCase(results, 'ariat_names_are_apparel_style_matrix_safe', !forbiddenText(Object.values(ariatNames).join(' ')) && /Style SKU|Omnichannel Availability Flow|Size \/ Color Variant/.test(Object.values(ariatNames).join(' ')), JSON.stringify(ariatNames));
  assertCase(results, 'w151_rejects_forbidden_completed_result', summitBadGuard.valid === false && summitBadGuard.status === 'toggle_vocabulary_guardrail_failed', summitBadGuard.message);
  assertCase(results, 'w151_accepts_mode_valid_completed_results', summitModel.completedGuard.valid === true && ariatModel.completedGuard.valid === true, `${summitModel.completedGuard.status}; ${ariatModel.completedGuard.status}`);
  assertCase(results, 'nllm_is_advisory_only', summitModel.contracts.namingIntelligenceContract.nllmAdvisoryOnly === true && summitModel.contracts.namingIntelligenceContract.noToggleOverride === true, JSON.stringify(summitModel.contracts.namingIntelligenceContract));
  assertCase(results, 'runner_hardgoods_fallback_prefers_dealer_terms', /Channel Availability SKU/.test(runnerSource) && /Dealer Replenishment Flow/.test(runnerSource) && /Allocation Support SKU/.test(runnerSource), 'runner hardgoods naming terms present');

  const passCount = results.filter((item) => item.pass).length;
  const summary = {
    schema: 'idb.w212-website-grounded-story-roi-competitive-naming-harness.v1',
    status: passCount === results.length ? 'pass' : 'fail',
    passCount,
    total: results.length,
    results,
    summitModel,
    ariatModel,
    summitBadGuard
  };
  writeJson(dataPath, summary);
  writeJson(tracePath, {
    schema: 'idb.w212-trace-samples.v1',
    samples: [
      {
        event: 'w212.website_controls_naming',
        customer: 'Summit Outdoor Supply',
        modeKey: summitModel.layers.toggleAwareOperatingModel.modeKey,
        names: summitNames
      },
      {
        event: 'w212.notes_control_story_roi_competitive',
        customer: 'Ariat International',
        proofMove: ariatModel.layers.storyRoiCompetitiveCoaching.proofMove,
        roiHypothesis: ariatModel.layers.storyRoiCompetitiveCoaching.roiHypothesis
      },
      {
        event: 'w212.w151_rejected_forbidden_names',
        status: summitBadGuard.status,
        message: summitBadGuard.message
      }
    ]
  });
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, [
    '# W212 Website-Grounded Story, ROI, Competitive, And Naming Orchestration Report',
    '',
    `Status: ${summary.status.toUpperCase()} (${passCount}/${results.length})`,
    '',
    '## Orchestration Contract',
    '- Website/category evidence controls industry, category, product nouns, and naming seeds.',
    '- Consultant toggles control operating-model vocabulary.',
    '- Record naming intent is derived from website evidence plus toggle mode.',
    '- Conversation notes control story, ROI, competitive framing, and objections only.',
    '',
    '## Harness Results',
    ...results.map((item) => `- ${item.pass ? 'PASS' : 'FAIL'} ${item.id}: ${item.evidence}`),
    '',
    '## Visual Testing Decision',
    'No broad visual testing required for W212. Use harness regression first; next live run can be a normal consultant smoke only after upload.'
  ].join('\n'));

  console.log(`W212 website-grounded orchestration: ${summary.status.toUpperCase()} (${passCount}/${results.length})`);
  results.forEach((item) => console.log(`${item.pass ? 'PASS' : 'FAIL'} ${item.id} :: ${item.evidence}`));
  if (summary.status !== 'pass') process.exitCode = 1;
}

main();
