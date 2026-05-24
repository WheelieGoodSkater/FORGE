const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const dataPath = path.join(root, 'data', 'w110_dcc_handoff_packet_parity_lock.json');
const tracePath = path.join(root, 'trace_samples', 'w110_dcc_handoff_packet_parity_lock_trace.json');
const reportPath = path.join(root, 'reports', 'w110_dcc_handoff_packet_parity_lock.md');

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function makeStorage() {
  const store = new Map();
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key)
  };
}

function loadHooks() {
  const storage = makeStorage();
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
    Blob: function Blob() {},
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
      setInterval: () => 0,
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
        click: () => {},
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

function assertCase(results, name, pass, detail) {
  results.push({ name, pass: !!pass, detail: detail || '' });
}

function escapeTable(value) {
  return String(value == null ? '' : value).replace(/\|/g, '/');
}

const CASES = [
  {
    id: 'apparel',
    laneId: 'apparel_accessories',
    prospect: 'Ariat International',
    website: 'https://www.ariat.com/',
    pain: 'Seasonal footwear and apparel launch needs style, size, color, replenishment timing, and channel availability connected.',
    proof: 'Prove style/SKU matrix and customer promise readiness.',
    criteria: 'Show size/color availability, style matrix fit, replenishment timing, and customer-to-order impact.'
  },
  {
    id: 'cpg',
    laneId: 'products_cpg',
    prospect: 'Summit Snack Co.',
    website: 'https://example-cpg.test/',
    pain: 'Promotion launch readiness is weak because finished goods, packaging, case packs, and retail replenishment are disconnected.',
    proof: 'Prove promotion-to-shelf readiness.',
    criteria: 'Show customer order, finished good, packaging/case pack, and promotion replenishment in one path.'
  },
  {
    id: 'dealer_hardgoods',
    laneId: 'dealer_hardgoods',
    prospect: 'Trailside Outdoor Supply',
    website: 'https://example-dealer.test/',
    pain: 'Dealer channel demand is hard to promise because product, branch availability, and replenishment are split.',
    proof: 'Prove dealer-ready fulfillment.',
    criteria: 'Show product/SKU availability, dealer channel replenishment, inventory, and fulfillment setup.'
  },
  {
    id: 'manufacturing_heavy',
    laneId: 'industrial_equipment',
    prospect: 'Northline Equipment',
    website: 'https://example-industrial.test/',
    pain: 'Engineer-to-order assemblies need component structure, production lineage, and WIP visibility before quote commitment.',
    proof: 'Prove order-to-assembly readiness.',
    criteria: 'Show assembly, BOM/component structure, routing/WIP readiness, and sales order context.'
  },
  {
    id: 'ambiguous_confirmed',
    laneId: 'industrial_distribution',
    prospect: 'Harbor Supply Group',
    website: 'https://example-ambiguous.test/',
    pain: 'The site is broad, but the consultant confirmed the request is branch inventory availability and replenishment control.',
    proof: 'Prove branch availability control.',
    criteria: 'Show inventory position, branch fulfillment, supplier replenishment, and Sales Order view.'
  }
];

function baseState(hooks, testCase) {
  const state = hooks.defaultState();
  Object.assign(state, {
    open: true,
    selectedLaneId: testCase.laneId,
    laneSelectionSource: 'consultant_confirmed',
    selectedMoveIndex: 0,
    selectedActionId: 'prove',
    activeView: 'review',
    setupEditMode: false,
    briefPrepared: true,
    acceptedPacket: null,
    pageContext: {
      title: 'NetSuite Home',
      url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/center/card.nl',
      pageType: 'NetSuite page',
      contextId: 'generic_netsuite_page',
      confidence: 'low',
      movePreference: ['Customer Record', 'Sales Order View'],
      capturedAt: new Date().toISOString()
    }
  });
  state.intake = Object.assign({}, state.intake || {}, {
    customer: testCase.prospect,
    website: testCase.website,
    notes: testCase.pain,
    websiteEvidence: testCase.pain,
    scObjective: testCase.proof,
    competitor: 'Spreadsheet workarounds and incumbent disconnected operational reports.',
    decisionCriteria: testCase.criteria,
    timelineUrgency: 'Pilot demo needed before the next buying committee review.'
  });
  state.websiteEvidenceV1 = {
    schema: 'idb.website-evidence.v1',
    resolverVersion: 'w110-harness-approved-snapshot',
    domain: new URL(testCase.website).hostname.replace(/^www\./, ''),
    fetchStatus: 'resolved',
    sourceUrls: [testCase.website],
    extractedEvidence: {
      title: `${testCase.prospect} ${testCase.proof}`,
      metaDescription: testCase.pain,
      h1h2Text: [testCase.proof, testCase.criteria],
      productCategoryTerms: [testCase.pain, testCase.proof, testCase.criteria]
    },
    signals: {
      laneCandidates: [
        {
          laneId: testCase.laneId,
          score: 0.88,
          evidence: [testCase.proof, testCase.criteria]
        }
      ],
      productSeed: testCase.proof,
      productFamily: testCase.laneId,
      demandMoment: testCase.criteria
    },
    confidence: {
      state: 'recommended',
      score: 0.88
    },
    resolverAdapter: {
      mode: 'approved_snapshot',
      requestKey: ''
    }
  };
  const lane = hooks.getLane(state);
  const recommendation = hooks.recommendMove(lane, state.pageContext);
  state.acceptedPacket = hooks.buildAcceptedPacketContext(state, lane, state.pageContext, recommendation);
  return state;
}

function sampleFor(hooks, testCase) {
  const state = baseState(hooks, testCase);
  const lane = hooks.getLane(state);
  const recommendation = hooks.recommendMove(lane, state.pageContext);
  const handoff = hooks.dccRunnerHandoffPacketV1(state, lane, state.pageContext, recommendation);
  const buildPacket = hooks.idbBuildPacketV1(state, lane, state.pageContext, recommendation);
  return { state, lane, recommendation, handoff, buildPacket };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function main() {
  const hooks = loadHooks();
  const userscript = read(userscriptPath);
  const results = [];

  const confirmedSamples = CASES.map((testCase) => {
    const sample = sampleFor(hooks, testCase);
    return {
      id: testCase.id,
      laneId: testCase.laneId,
      selectedPack: sample.handoff.selectedPack,
      selectedScenario: sample.handoff.selectedScenario,
      status: sample.handoff.status,
      parityStatus: sample.handoff.parityLock.status,
      parityBlockers: sample.handoff.parityLock.blockers,
      suiteletEntryPayload: sample.handoff.suiteletEntryPayload,
      scheduledRunnerPreview: sample.handoff.scheduledRunnerPreview
    };
  });

  const allConfirmedLocked = confirmedSamples.every((sample) => (
    sample.status === 'ready_for_dcc_suitelet_submission_review'
    && sample.parityStatus === 'parity_locked'
    && sample.parityBlockers.length === 0
  ));

  const apparelSample = sampleFor(hooks, CASES[0]);
  const mutationChecks = [];
  function runMutation(name, mutate) {
    const buildPacket = clone(apparelSample.buildPacket);
    const suiteletEntryPayload = clone(apparelSample.handoff.suiteletEntryPayload);
    const scheduledRunnerPreview = clone(apparelSample.handoff.scheduledRunnerPreview);
    const options = {
      selectedPack: apparelSample.handoff.selectedPack,
      selectedScenario: apparelSample.handoff.selectedScenario,
      executionMode: apparelSample.handoff.executionMode
    };
    mutate(buildPacket, suiteletEntryPayload, scheduledRunnerPreview, options);
    const lock = hooks.dccHandoffParityLockV1(buildPacket, suiteletEntryPayload, scheduledRunnerPreview, options);
    mutationChecks.push({ name, status: lock.status, exportEligible: lock.exportEligible, blockers: lock.blockers });
  }

  runMutation('confirmed_lane_disagrees', (buildPacket) => {
    buildPacket.stateAuthority.confirmedLaneId = 'products_cpg';
  });
  runMutation('exported_lane_disagrees', (buildPacket) => {
    buildPacket.stateAuthority.exportedLaneId = 'products_cpg';
  });
  runMutation('selected_pack_disagrees', (buildPacket, suitelet, runner, options) => {
    options.selectedPack = 'cpgProductsManufacturing';
  });
  runMutation('scenario_disagrees', (buildPacket, suitelet, runner, options) => {
    options.selectedScenario = 'Promotion-to-Shelf Readiness';
  });
  runMutation('family_key_disagrees', (buildPacket) => {
    buildPacket.dccRunnerInputs.familyKey = 'cpgProductsManufacturing';
  });
  runMutation('manufacturing_flag_disagrees', (buildPacket, suitelet, runner) => {
    suitelet.custpage_enablemfg = 'T';
    runner.custscript_v3_runner_enable_mfg = 'T';
  });
  runMutation('wip_flag_disagrees', (buildPacket, suitelet, runner) => {
    suitelet.custpage_enablewip = 'T';
    runner.custscript_v3_runner_enable_wip = 'T';
  });
  runMutation('location_planning_intent_disagrees', (buildPacket) => {
    buildPacket.dccRunnerInputs.locationPlanningIntent = 'Assembly, BOM, routing, and WIP are required.';
  });
  runMutation('review_only_mode_disagrees', (buildPacket, suitelet, runner, options) => {
    suitelet.custpage_evalmode = 'submit';
    options.executionMode = 'submit_to_suitelet';
  });

  const unconfirmedState = baseState(hooks, CASES[4]);
  unconfirmedState.acceptedPacket = null;
  unconfirmedState.laneSelectionSource = 'manual';
  const unconfirmedLane = hooks.getLane(unconfirmedState);
  const unconfirmedRecommendation = hooks.recommendMove(unconfirmedLane, unconfirmedState.pageContext);
  const blockedSample = hooks.dccRunnerHandoffPacketV1(unconfirmedState, unconfirmedLane, unconfirmedState.pageContext, unconfirmedRecommendation);

  assertCase(results, 'w110_runtime_parity_lock_present', typeof hooks.dccHandoffParityLockV1 === 'function' && /function dccHandoffParityLockV1/.test(userscript), 'dccHandoffParityLockV1 runtime and hook');
  assertCase(results, 'w110_confirmed_cases_lock_across_required_mix', allConfirmedLocked && confirmedSamples.length === 5, JSON.stringify(confirmedSamples.map((sample) => ({ id: sample.id, status: sample.status, parity: sample.parityStatus }))));
  assertCase(results, 'w110_suitelet_payloads_map_required_form_params', confirmedSamples.every((sample) => ['custpage_prospect', 'custpage_website', 'custpage_notes', 'custpage_newhero', 'custpage_enablemfg', 'custpage_enablewip', 'custpage_evalmode', 'custpage_actionmode'].every((key) => Object.prototype.hasOwnProperty.call(sample.suiteletEntryPayload, key))), 'all confirmed samples include exact Suitelet form params');
  assertCase(results, 'w110_runner_previews_map_required_runner_params', confirmedSamples.every((sample) => ['custscript_v3_runner_prospect', 'custscript_v3_runner_website', 'custscript_v3_runner_notes', 'custscript_v3_runner_mapping', 'custscript_v3_runner_folder', 'custscript_v3_runner_subsidiary', 'custscript_v3_runner_enable_mfg', 'custscript_v3_runner_create_new_hero'].every((key) => Object.prototype.hasOwnProperty.call(sample.scheduledRunnerPreview, key))), 'all confirmed samples include scheduled runner preview params');
  assertCase(results, 'w110_every_mutated_disagreement_blocks_export_eligibility', mutationChecks.length === 9 && mutationChecks.every((check) => check.status === 'blocked_parity_mismatch' && check.exportEligible === false && check.blockers.length > 0), JSON.stringify(mutationChecks));
  assertCase(results, 'w110_unconfirmed_ambiguous_case_blocks_handoff', blockedSample.status === 'blocked_until_confirmed_handoff' && blockedSample.blockedExample.missing.includes('consultant confirmation'), JSON.stringify(blockedSample.blockedExample));
  assertCase(results, 'w110_trace_and_export_include_parity_lock', /dccHandoffParityLockV1: dccRunnerHandoffPacketV1/.test(userscript) && /parityLock: payload\.parityLock/.test(userscript), 'trace export and handoff export trace include parity lock');
  assertCase(results, 'w110_no_regression_boundaries_preserved', /suiteScriptInvocationFromIdb: false/.test(userscript) && /noIdbTransactionWrite: true/.test(userscript) && /noDccRunnerRewrite: true/.test(userscript) && /hostedResolverOptionalUntilRemoteSmokeExecuted: true/.test(userscript), 'no write/no invoke/DCC ownership boundaries');

  const failures = results.filter((result) => !result.pass);
  const decision = failures.length ? 'FAIL' : 'PASS';
  const bestNextCodexPrompt = {
    block: 'W111: DCC Preview URL Builder And Operator Copy',
    prompt: 'Move through W111: DCC Preview URL Builder And Operator Copy. Add a review-only operator helper that formats the DCC Suitelet preview URL/query parameters from dccRunnerHandoffPacketV1 without navigating, invoking SuiteScript, submitting, queueing, or writing. Include copy-safe parameter text, operator comparison instructions, blocked/confirmed examples, and trace coverage. Preserve W110 parity lock, W92 state authority, W105-W107 preview-only approval behavior, no IDB writes, no SuiteScript invocation from IDB, no transaction writes, hosted resolver optional until remoteSmokeExecuted=true, notes story-only, consultant confirmation required, and DCC ownership of object generation. Output preview URL helper contract, Review UI copy, validator gates, W111 report, and best next Codex prompt.'
  };

  const parityMatrix = confirmedSamples.map((sample) => ({
    caseId: sample.id,
    laneId: sample.laneId,
    selectedPack: sample.selectedPack,
    selectedScenario: sample.selectedScenario,
    suiteletParams: Object.keys(sample.suiteletEntryPayload),
    runnerPreviewParams: Object.keys(sample.scheduledRunnerPreview),
    status: sample.status,
    parityStatus: sample.parityStatus
  }));

  const contract = {
    schema: 'idb.w110-dcc-handoff-packet-parity-lock.v1',
    status: decision === 'PASS' ? 'dcc_handoff_parity_locked' : 'dcc_handoff_parity_lock_failed',
    objective: 'Prove DCC handoff export eligibility only when confirmed lane, selected pack, exported lane, scenario, family key, manufacturing/WIP flags, location/planning intent, and review-only mode agree.',
    parityMatrix,
    blockedSamples: {
      unconfirmedAmbiguous: {
        status: blockedSample.status,
        selectedPack: blockedSample.selectedPack,
        selectedScenario: blockedSample.selectedScenario,
        missing: blockedSample.blockedExample.missing,
        parityLock: blockedSample.parityLock
      },
      mutationChecks
    },
    confirmedSamples,
    noRegression: {
      noIdbWrites: true,
      noSuiteScriptInvocationFromIdb: true,
      noTransactionWrites: true,
      hostedResolverOptionalUntilRemoteSmokeExecuted: true,
      notesStoryOnly: true,
      consultantConfirmationRequired: true,
      w92StateAuthorityPreserved: true,
      w105W107PreviewOnlyApprovalPreserved: true,
      dccOwnsObjectGeneration: true,
      noDccRunnerRewrite: true
    },
    bestNextCodexPrompt
  };
  writeJson(dataPath, contract);

  const trace = {
    schema: 'idb.w110-dcc-handoff-packet-parity-lock-trace.v1',
    generatedAt: new Date().toISOString(),
    decision,
    confirmedCaseCount: confirmedSamples.length,
    mutationBlockCount: mutationChecks.filter((check) => check.status === 'blocked_parity_mismatch').length,
    blockedAmbiguousStatus: blockedSample.status,
    parityMatrix,
    validatorResults: results,
    noRegression: contract.noRegression,
    bestNextCodexPrompt
  };
  writeJson(tracePath, trace);

  const matrixRows = parityMatrix.map((row) => `| ${escapeTable(row.caseId)} | ${escapeTable(row.laneId)} | ${escapeTable(row.selectedPack)} | ${escapeTable(row.selectedScenario)} | ${escapeTable(row.status)} | ${escapeTable(row.parityStatus)} |`).join('\n');
  const mutationRows = mutationChecks.map((row) => `| ${escapeTable(row.name)} | ${escapeTable(row.status)} | ${escapeTable(row.blockers.join(', '))} |`).join('\n');
  const resultRows = results.map((result) => `| ${result.pass ? 'PASS' : 'FAIL'} | ${escapeTable(result.name)} | ${escapeTable(result.detail)} |`).join('\n');
  const report = `# W110 DCC Handoff Packet Parity Lock

Generated: ${new Date().toISOString()}

Decision: ${decision} / DCC HANDOFF PARITY ${decision === 'PASS' ? 'LOCKED' : 'FAILED'} / REVIEW ONLY

## Objective

Prove every IDB \`dccRunnerHandoffPacketV1\` field maps cleanly to Demo Command Center Suitelet form params, DCC-owned config params, and scheduled runner preview params before any operator review.

## Parity Matrix

| Case | Lane | DCC Pack | Scenario | Handoff Status | Parity |
| --- | --- | --- | --- | --- | --- |
${matrixRows}

## Blocked Mutation Samples

Every deliberate disagreement must block export eligibility.

| Mutation | Status | Blockers |
| --- | --- | --- |
${mutationRows}

## Ambiguous / Unconfirmed Sample

\`${blockedSample.status}\`: ${blockedSample.blockedExample.missing.join(', ')}

## Validator Gates

| Status | Gate | Detail |
| --- | --- | --- |
${resultRows}

## No Regression

- IDB does not write.
- IDB does not invoke SuiteScript.
- IDB does not write transactions.
- DCC runner mechanics are not rewritten.
- Hosted resolver stays optional until \`remoteSmokeExecuted=true\`.
- Notes remain story-only.
- Consultant confirmation remains required.
- DCC owns item names, assemblies, BOMs, locations, planning, routing/WIP, CSV, and Sales Order mechanics.

## Best Next Codex Prompt

\`\`\`text
${bestNextCodexPrompt.prompt}
\`\`\`
`;
  fs.writeFileSync(reportPath, report);

  console.log(JSON.stringify({
    decision,
    results: results.length,
    report: path.relative(root, reportPath)
  }, null, 2));
  if (failures.length) {
    console.error(failures);
    process.exit(1);
  }
}

main();
