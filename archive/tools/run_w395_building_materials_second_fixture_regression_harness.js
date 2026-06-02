#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const {
  assertCase,
  loadHooks,
  openRecordFixture,
  printResults,
  storyFixtureState,
  storyScenarioFromState
} = require('./lib/forge_harness_fixtures');

const {
  LANE_PACKS,
  validateLanePack,
  resolveLanePackFromEvidence,
  consultantStorySurfaceFromLanePack
} = require('../../src/contracts/lanePacks');

const root = path.resolve(__dirname, '..', '..');
const reportPath = path.join(root, 'archive', 'reports', 'w395_building_materials_second_fixture_regression.md');
const w394ReportPath = path.join(root, 'archive', 'reports', 'w394_building_materials_source_pack_toggle_guard.md');
const w393ReportPath = path.join(root, 'archive', 'reports', 'w393_wip_routing_best_effort_diagnostics.md');
const w391ReportPath = path.join(root, 'archive', 'reports', 'w391_building_materials_fixture_story_proof.md');
const packageDir = path.join(root, 'archive', 'package_ready', 'w386_forge_source_pack_ready_artifact');
const packageZip = path.join(root, 'archive', 'package_ready', 'w386_forge_source_pack_ready_artifact.zip');

function exists(filePath) {
  return fs.existsSync(filePath);
}

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function rootPath(relPath) {
  return path.join(root, relPath);
}

function packageJson() {
  return JSON.parse(read(rootPath('package.json')));
}

function packById(id) {
  return LANE_PACKS.find((pack) => pack.packId === id);
}

function textOf(scenario) {
  return [scenario.valueText, scenario.runText, scenario.traceText].join(' ');
}

function clickablePathCount(html) {
  return (String(html || '').match(/idb-w371-path-clickable/g) || []).length;
}

function buildCedarState(hooks, overrides = {}) {
  const records = [
    openRecordFixture('customer', 'Customer', 'Cedar Valley Contractor Supply Customer Account', '7601', 'https://td3021666.app.netsuite.com/app/common/entity/custjob.nl?id=7601'),
    openRecordFixture('contractor_account', 'Contractor Account', 'Cedar Valley Contractor Account', '7602', 'https://td3021666.app.netsuite.com/app/common/custom/custrecordentry.nl?id=7602'),
    openRecordFixture('job_order', 'Job Order', 'Cedar Valley Job Order', '7603', 'https://td3021666.app.netsuite.com/app/accounting/transactions/salesord.nl?id=7603'),
    openRecordFixture('branch_item_availability', 'Branch Item Availability', 'Cedar Valley Branch Item Availability', '7604', 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=7604'),
    openRecordFixture('special_order_or_substitution', 'Special Order / Substitution', 'Cedar Valley Special Order Substitution', '7605', 'https://td3021666.app.netsuite.com/app/common/custom/custrecordentry.nl?id=7605'),
    openRecordFixture('will_call_or_jobsite_delivery', 'Will-Call / Jobsite Delivery', 'Cedar Valley Jobsite Delivery Readiness', '7606', 'https://td3021666.app.netsuite.com/app/common/custom/custrecordentry.nl?id=7606')
  ];
  const state = storyFixtureState(hooks, Object.assign({
    label: 'Cedar Valley Building Materials',
    laneId: 'building_materials',
    customer: 'Cedar Valley Contractor Supply',
    website: 'https://www.cedarvalleycontractorsupply.com',
    notes: 'Talked to inside sales lead maybe Morgan. They sell lumber packs, decking, drywall, doors, windows, fasteners, tools, and special order materials for remodelers and small contractors. Biggest headache is a contractor asks whether a job can be picked up Friday or delivered to the jobsite, then the counter finds out one branch is short, a substitute is needed, or the special order date moved. They use an old POS, spreadsheets, and branch phone calls. Need demo around contractor account, job order, branch item availability, special order status, substitution options, will-call pickup, jobsite delivery, and margin leakage. Competitor maybe Epicor, Spruce, old POS, QuickBooks, not sure.',
    websiteEvidence: 'Contractor supply, lumber, decking, drywall, doors, windows, fasteners, tools, special order materials, branch item availability, will-call pickup, jobsite delivery readiness, substitutions, project fulfillment confidence, and margin leakage.',
    competitor: 'Epicor, Spruce, old POS, QuickBooks, spreadsheets',
    records
  }, overrides));
  hooks.reconcileStateAuthority(state);
  return state;
}

function buildPacketFor(hooks, state) {
  const lane = hooks.getLane(state);
  const page = state.pageContext || {};
  const recommendation = hooks.recommendMove(lane, page);
  return hooks.idbBuildPacketV1(state, lane, page, recommendation);
}

function includesAll(text, terms) {
  return terms.every((term) => text.includes(String(term).toLowerCase()));
}

function main() {
  const results = [];
  const hooks = loadHooks();
  const report = exists(reportPath) ? read(reportPath) : '';
  const w394Report = exists(w394ReportPath) ? read(w394ReportPath) : '';
  const w393Report = exists(w393ReportPath) ? read(w393ReportPath) : '';
  const w391Report = exists(w391ReportPath) ? read(w391ReportPath) : '';
  const scripts = packageJson().scripts || {};
  const buildingPack = packById('building-materials-contractor-supply-project-fulfillment');
  const cedarEvidence = {
    website: 'https://www.cedarvalleycontractorsupply.com',
    categoryText: 'contractor supply lumber decking drywall doors windows fasteners tools special order materials branch item availability will-call pickup jobsite delivery substitutions project fulfillment margin leakage',
    evidenceText: 'contractor account demand job order readiness branch item availability special order status substitution options will-call pickup jobsite delivery readiness margin leakage project fulfillment confidence'
  };
  const cedarResolution = resolveLanePackFromEvidence(cedarEvidence);
  const cedarStory = consultantStorySurfaceFromLanePack(cedarEvidence, buildingPack, { displayReadyRecords: [] });
  const cedarState = buildCedarState(hooks);
  const cedarLane = hooks.getLane(cedarState);
  const cedarScenario = storyScenarioFromState(hooks, cedarState, 'Cedar Valley Building Materials');
  const suggested = hooks.suggestedLaneFromIntake(cedarState);
  const forcedToggleState = buildCedarState(hooks);
  forcedToggleState.toggles = Object.assign({}, forcedToggleState.toggles || {}, {
    building_materials: { createNewHeroItem: true, enableManufacturing: true, enableWip: true }
  });
  forcedToggleState.integratedBuildRunnerResult = {
    runnerParams: {
      custscript_v3_runner_enable_mfg: 'T',
      custscript_v3_runner_enable_wip: 'T'
    }
  };
  const forcedPacket = buildPacketFor(hooks, forcedToggleState);
  const fabricationState = buildCedarState(hooks, {
    notes: 'Contractor supply branch also runs a custom fabrication shop with assembly, production routing, work center, WIP, build/test, and inspection for configured door packages.',
    websiteEvidence: 'Contractor supply and custom fabrication shop assembly with production routing, work center, WIP, build/test, and inspection.'
  });
  fabricationState.toggles = Object.assign({}, fabricationState.toggles || {}, {
    building_materials: { createNewHeroItem: true, enableManufacturing: true, enableWip: true }
  });
  const fabricationPacket = buildPacketFor(hooks, fabricationState);
  const allPacksValid = LANE_PACKS.every((pack) => validateLanePack(pack).valid);
  const scenarioText = textOf(cedarScenario).toLowerCase();
  const antiLeakAbsent = !/dealer allocation|channel fulfillment|style\/color\/size|store\/ecommerce promise|technician truck stock|first-time fix|clinic supply substitutes|qa release|lot\/release readiness|food batch|configured equipment assembly/i.test(scenarioText);
  const storyText = JSON.stringify(cedarStory).toLowerCase();

  assertCase(results, 'w395-w394-source-pack-toggle-guard-preserved',
    w394Report.includes('W394 Building Materials source-pack toggle guard harness: 18/18 passed') &&
      w394Report.includes('Keystone-style evidence prefers Building Materials') &&
      report.includes('Use W394 Building Materials Source-Pack Readiness and Manufacturing/WIP Toggle Guard Cleanup as the locked Building Materials source-pack baseline'),
    JSON.stringify({ w394: w394Report.slice(0, 2200), report: report.slice(0, 1600) }, null, 2));

  assertCase(results, 'w395-w393-runner-safety-preserved',
    w393Report.includes('W393 WIP routing best-effort diagnostics harness: 15/15 passed') &&
      w393Report.includes('failed_best_effort') &&
      report.includes('W393 WIP routing best-effort diagnostics remain locked'),
    w393Report.slice(0, 2600));

  assertCase(results, 'w395-w391-keystone-fixture-preserved',
    w391Report.includes('W391 Building Materials fixture-first story proof harness: 15/15 passed') &&
      report.includes('Keystone remains the first Building Materials fixture baseline'),
    w391Report.slice(0, 2200));

  assertCase(results, 'w395-second-fixture-story-distinctness',
    cedarLane.id === 'building_materials' &&
      suggested && suggested.lane && suggested.lane.id === 'building_materials' &&
      includesAll(scenarioText, [
        'contractor account',
        'job order',
        'branch item availability',
        'special order',
        'will-call',
        'jobsite delivery',
        'substitution',
        'margin'
      ]),
    JSON.stringify({ cedarLane, suggested, scenarioText: scenarioText.slice(0, 2500) }, null, 2));

  assertCase(results, 'w395-second-fixture-source-pack-resolution',
    cedarResolution.status === 'resolved' &&
      cedarResolution.packId === 'building-materials-contractor-supply-project-fulfillment' &&
      cedarResolution.lanePack &&
      cedarResolution.lanePack.laneId === 'building_materials' &&
      validateLanePack(buildingPack).valid === true &&
      allPacksValid,
    JSON.stringify({ cedarResolution, validation: buildingPack && validateLanePack(buildingPack), packCount: LANE_PACKS.length }, null, 2));

  assertCase(results, 'w395-expected-proof-role-coverage',
    includesAll(storyText, [
      'contractor',
      'job order',
      'branch',
      'special order',
      'substitution',
      'will-call',
      'jobsite delivery'
    ]) &&
      /Cedar Valley Contractor Account|Cedar Valley Job Order|Cedar Valley Branch Item Availability/.test(textOf(cedarScenario)),
    JSON.stringify({ cedarStory, scenario: textOf(cedarScenario).slice(0, 3000) }, null, 2));

  assertCase(results, 'w395-roi-competitive-flow-preserved',
    /talk track|discovery|proof move|largest value to prove|objection handle|claim caution/i.test(cedarScenario.valueText) &&
      /baseline/i.test(cedarScenario.valueText) &&
      /epicor|spruce|quickbooks|old pos|spreadsheets/i.test(textOf(cedarScenario)),
    cedarScenario.valueText.slice(0, 5000));

  assertCase(results, 'w395-run-path-open-link-collapse-preserved',
    clickablePathCount(cedarScenario.runHtml) >= 4 &&
      /Use imported proof records/i.test(cedarScenario.runText) &&
      /Proof guardrails and evidence receipt/i.test(cedarScenario.runText) &&
      report.includes('fixture Open links remain fixture proof, not live smoke'),
    cedarScenario.runText.slice(0, 4000));

  assertCase(results, 'w395-manufacturing-wip-toggle-suppression-preserved',
    forcedPacket.dccRunnerInputs.enableManufacturing === false &&
      forcedPacket.dccRunnerInputs.enableWip === false &&
      JSON.stringify(forcedPacket).includes('manufacturing_wip_suppressed_for_building_materials'),
    JSON.stringify(forcedPacket.dccRunnerInputs, null, 2));

  assertCase(results, 'w395-true-manufacturing-evidence-still-allowed',
    fabricationPacket.dccRunnerInputs.enableManufacturing === true &&
      fabricationPacket.dccRunnerInputs.enableWip === true,
    JSON.stringify(fabricationPacket.dccRunnerInputs, null, 2));

  assertCase(results, 'w395-cross-lane-anti-leak-wording',
    antiLeakAbsent &&
      report.includes('Do not let Building Materials leak Dealer Hardgoods, Apparel/Retail, Parts/Service, Medical/Dental, Life Sciences, Food/Beverage, or Industrial Equipment wording without evidence'),
    scenarioText.slice(0, 5000));

  assertCase(results, 'w395-claim-safety-confidence-separation',
    /Do not claim .*measured ROI without evidence/i.test(cedarStory.doNotClaim || '') &&
      !/guarantee|guaranteed|measured roi|will increase/i.test([
        cedarStory.proofMove,
        cedarStory.safeClaim,
        cedarStory.buyerFacingSoWhat,
        cedarStory.competitiveContrast
      ].join(' ')) &&
      report.includes('N/LLM remains advisory-only') &&
      report.includes('public website/category evidence, messy notes, advisory inference, build/import proof, and Open-link authority remain separated'),
    JSON.stringify(cedarStory, null, 2));

  assertCase(results, 'w395-no-source-pack-or-runner-mutation-needed',
    report.includes('No source-pack mutation was required in W395') &&
      report.includes('No runner, adapter, record creation, source-pack, import validation, or Open-link authority changes were made'),
    report.slice(0, 6000));

  assertCase(results, 'w395-w386-package-preserved',
    exists(packageDir) &&
      exists(packageZip) &&
      report.includes('W386 source-pack readiness evidence package was not mutated'),
    JSON.stringify({ packageDir, packageZip }, null, 2));

  assertCase(results, 'w395-no-live-smoke-no-upload-boundary',
    report.includes('No live smoke in W395') &&
      report.includes('No upload or deployment') &&
      report.includes('No runtime upload package creation'),
    report.slice(0, 5000));

  assertCase(results, 'w395-preservation-scripts-registered',
    typeof scripts['harness:building-materials-second-fixture-regression-w395'] === 'string' &&
      typeof scripts['harness:building-materials-source-pack-toggle-guard-w394'] === 'string' &&
      typeof scripts['harness:wip-routing-best-effort-diagnostics-w393'] === 'string' &&
      typeof scripts['harness:building-materials-fixture-story-proof-w391'] === 'string',
    JSON.stringify({
      w395: scripts['harness:building-materials-second-fixture-regression-w395'],
      w394: scripts['harness:building-materials-source-pack-toggle-guard-w394'],
      w393: scripts['harness:wip-routing-best-effort-diagnostics-w393'],
      w391: scripts['harness:building-materials-fixture-story-proof-w391']
    }, null, 2));

  assertCase(results, 'w395-no-regression-gates',
    report.includes('W395 no-regression gates passed') &&
      report.includes('No fake Open links') &&
      report.includes('completed-result import validation was not changed') &&
      report.includes('Open-link authority remains verified-import-only'),
    report.slice(-4500));

  printResults('W395 Building Materials second fixture regression harness', results);
}

main();
