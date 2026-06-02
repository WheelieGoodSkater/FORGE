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
const reportPath = path.join(root, 'archive', 'reports', 'w394_building_materials_source_pack_toggle_guard.md');
const drawerPath = path.join(root, 'src', 'FileCabinet', 'SuiteScripts', 'Intelligent Demo Builder', 'idb-drawer.user.js');
const w393ReportPath = path.join(root, 'archive', 'reports', 'w393_wip_routing_best_effort_diagnostics.md');
const w392ReportPath = path.join(root, 'archive', 'reports', 'w392_keystone_smoke_wip_routing_safety_gate.md');
const w391ReportPath = path.join(root, 'archive', 'reports', 'w391_building_materials_fixture_story_proof.md');
const packageDir = path.join(root, 'archive', 'package_ready', 'w386_forge_source_pack_ready_artifact');
const packageZip = path.join(root, 'archive', 'package_ready', 'w386_forge_source_pack_ready_artifact.zip');

function exists(filePath) {
  return fs.existsSync(filePath);
}

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function packageJson() {
  return JSON.parse(read(path.join(root, 'package.json')));
}

function packById(id) {
  return LANE_PACKS.find((pack) => pack.packId === id);
}

function packText(pack) {
  return JSON.stringify({
    websiteSignals: pack && pack.websiteSignals,
    recordRoles: pack && pack.recordRoles,
    vocabulary: pack && pack.vocabulary,
    liveDemo: pack && pack.liveDemo,
    nllmAdvisory: pack && pack.nllmAdvisory
  }).toLowerCase();
}

function includesAll(text, terms) {
  return terms.every((term) => text.includes(String(term).toLowerCase()));
}

function textOf(scenario) {
  return [scenario.valueText, scenario.runText, scenario.traceText].join(' ');
}

function clickablePathCount(html) {
  return (String(html || '').match(/idb-w371-path-clickable/g) || []).length;
}

function buildKeystoneState(hooks, overrides = {}) {
  const records = [
    openRecordFixture('customer', 'Customer', 'Keystone Building Supply Customer Account', '7501', 'https://td3021666.app.netsuite.com/app/common/entity/custjob.nl?id=7501'),
    openRecordFixture('contractor_account', 'Contractor Account', 'Keystone Contractor Account', '7502', 'https://td3021666.app.netsuite.com/app/common/custom/custrecordentry.nl?id=7502'),
    openRecordFixture('job_order', 'Job Order', 'Keystone Job Order', '7503', 'https://td3021666.app.netsuite.com/app/accounting/transactions/salesord.nl?id=7503'),
    openRecordFixture('branch_item_availability', 'Branch Item Availability', 'Keystone Branch Item Availability', '7504', 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=7504'),
    openRecordFixture('will_call_or_jobsite_delivery', 'Will-Call / Jobsite Delivery', 'Keystone Jobsite Delivery Readiness', '7505', 'https://td3021666.app.netsuite.com/app/common/custom/custrecordentry.nl?id=7505')
  ];
  const state = storyFixtureState(hooks, Object.assign({
    label: 'Keystone Building Materials',
    laneId: 'building_materials',
    customer: 'Keystone Building Supply',
    website: 'https://www.keystonebuildingsupply.com',
    notes: 'Talked to branch manager maybe Chris or Craig. They sell lumber, doors, windows, fasteners, tools, maybe special order materials to contractors. Biggest issue is contractors ask if stuff is available for a job and the branch promises it, then finds out some pieces are missing, substituted, delayed, or at another branch. Need demo around contractor account, job order, item availability, special order status, will-call or jobsite delivery, substitutions, and margin. Competitor maybe Epicor, Spruce, spreadsheets, not sure.',
    websiteEvidence: 'Building materials, lumber, doors, windows, fasteners, tools, contractor supply, special order materials, branch availability, jobsite delivery, will-call pickup, substitutions, project fulfillment, and margin leakage.',
    competitor: 'Epicor, Spruce, QuickBooks, old POS, spreadsheets',
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

function main() {
  const results = [];
  const hooks = loadHooks();
  const report = exists(reportPath) ? read(reportPath) : '';
  const drawer = exists(drawerPath) ? read(drawerPath) : '';
  const w393Report = exists(w393ReportPath) ? read(w393ReportPath) : '';
  const w392Report = exists(w392ReportPath) ? read(w392ReportPath) : '';
  const w391Report = exists(w391ReportPath) ? read(w391ReportPath) : '';
  const scripts = packageJson().scripts || {};
  const buildingPack = packById('building-materials-contractor-supply-project-fulfillment');
  const buildingText = packText(buildingPack);
  const keystoneEvidence = {
    website: 'https://www.keystonebuildingsupply.com',
    categoryText: 'building materials lumber doors windows fasteners tools contractor supply special order materials branch availability jobsite delivery will-call pickup substitutions project fulfillment margin leakage',
    evidenceText: 'contractor account demand job order readiness branch item availability special order status will-call pickup jobsite delivery readiness substitutions margin leakage project fulfillment confidence'
  };
  const keystoneResolution = resolveLanePackFromEvidence(keystoneEvidence);
  const keystoneStory = consultantStorySurfaceFromLanePack(keystoneEvidence, buildingPack, { displayReadyRecords: [] });
  const weakResolution = resolveLanePackFromEvidence({
    website: 'https://example.invalid',
    categoryText: 'maybe branch stuff',
    signals: []
  });
  const keystoneState = buildKeystoneState(hooks);
  const keystoneLane = hooks.getLane(keystoneState);
  const keystoneScenario = storyScenarioFromState(hooks, keystoneState, 'Keystone Building Materials');
  const forcedToggleState = buildKeystoneState(hooks);
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
  const fabricationState = buildKeystoneState(hooks, {
    notes: 'Contractor supply branch also has a custom fabrication shop with assembly, production routing, work center, WIP, build/test, and inspection for configured stair assemblies.',
    websiteEvidence: 'Building materials and custom fabrication shop assembly with production routing, work center, WIP, build/test, and inspection.'
  });
  fabricationState.toggles = Object.assign({}, fabricationState.toggles || {}, {
    building_materials: { createNewHeroItem: true, enableManufacturing: true, enableWip: true }
  });
  const fabricationPacket = buildPacketFor(hooks, fabricationState);
  const suggested = hooks.suggestedLaneFromIntake(keystoneState);
  const allPacksValid = LANE_PACKS.every((pack) => validateLanePack(pack).valid);

  assertCase(results, 'w394-w393-runner-safety-baseline-preserved',
    w393Report.includes('W393 WIP routing best-effort diagnostics harness: 15/15 passed') &&
      w393Report.includes('failed_best_effort') &&
      report.includes('Use W393 Targeted WIP Routing Best-Effort Failure Handling'),
    w393Report.slice(0, 3000));

  assertCase(results, 'w394-w392-keystone-review-preserved-as-rationale',
    w392Report.includes('No direct Building Materials source pack exists today') &&
      w392Report.includes('Conclusion: a future scoped source-pack is needed') &&
      report.includes('W392 remains preserved as historical review evidence'),
    w392Report.slice(70, 2600));

  assertCase(results, 'w394-w391-building-materials-fixture-story-preserved',
    w391Report.includes('W391 Building Materials fixture-first story proof harness: 15/15 passed') &&
      /contractor account demand|job order readiness|branch item availability|will-call pickup|jobsite delivery/i.test(textOf(keystoneScenario)) &&
      clickablePathCount(keystoneScenario.runHtml) >= 4,
    textOf(keystoneScenario).slice(0, 3000));

  assertCase(results, 'w394-building-materials-source-pack-present-and-valid',
    !!buildingPack &&
      buildingPack.laneId === 'building_materials' &&
      buildingPack.label === 'Building Materials Contractor Supply & Project Fulfillment' &&
      buildingPack.operatingMode === 'distribution_replenishment' &&
      validateLanePack(buildingPack).valid === true &&
      allPacksValid,
    JSON.stringify({ buildingPack, validation: buildingPack && validateLanePack(buildingPack), packCount: LANE_PACKS.length }, null, 2));

  assertCase(results, 'w394-building-materials-signal-role-vocabulary-coverage',
    includesAll(buildingText, [
      'building materials',
      'lumber',
      'doors',
      'windows',
      'fasteners',
      'contractor supply',
      'special order materials',
      'branch availability',
      'jobsite delivery',
      'will-call pickup',
      'substitutions',
      'project fulfillment',
      'margin leakage',
      'contractor_account',
      'job_order',
      'branch_item_availability',
      'special_order_or_substitution',
      'will_call_or_jobsite_delivery'
    ]),
    buildingText);

  assertCase(results, 'w394-building-materials-anti-leak-vocabulary-coverage',
    includesAll(buildingText, [
      'dealer allocation',
      'channel fulfillment',
      'style/color/size',
      'store/ecommerce promise',
      'technician truck stock',
      'first-time fix',
      'clinic supply substitutes',
      'QA release'.toLowerCase(),
      'lot/release readiness',
      'validation documentation',
      'food batch',
      'ingredient readiness',
      'configured equipment assembly',
      'manufacturing routing',
      'WIP'.toLowerCase(),
      'work center'
    ]),
    buildingText);

  assertCase(results, 'w394-keystone-evidence-resolution-safety',
    keystoneResolution.status === 'resolved' &&
      keystoneResolution.packId === 'building-materials-contractor-supply-project-fulfillment' &&
      keystoneResolution.lanePack &&
      keystoneResolution.lanePack.laneId === 'building_materials' &&
      weakResolution.status !== 'resolved',
    JSON.stringify({ keystoneResolution, weakResolution }, null, 2));

  assertCase(results, 'w394-existing-lane-fallback-safety',
    keystoneResolution.packId !== 'equipment-manufacturing' &&
      keystoneResolution.packId !== 'industrial-manufacturing' &&
      keystoneResolution.packId !== 'industrial-distributor' &&
      keystoneResolution.packId !== 'dealer-hardgoods' &&
      report.includes('Keystone-style evidence no longer needs a silent Industrial Equipment, Dealer Hardgoods, or generic Industrial Distribution fallback'),
    JSON.stringify(keystoneResolution, null, 2));

  assertCase(results, 'w394-drawer-embedded-pack-and-lane-present',
    drawer.includes("packId: 'building-materials-contractor-supply-project-fulfillment'") &&
      drawer.includes("id: 'building_materials'") &&
      drawer.includes("dccFamilyKey: 'buildingMaterials'") &&
      drawer.includes("dccToggles: { createNewHeroItem: true, enableManufacturing: false, enableWip: false }") &&
      keystoneLane.id === 'building_materials' &&
      /Building Materials/.test(keystoneLane.name),
    JSON.stringify({ lane: keystoneLane }, null, 2));

  assertCase(results, 'w394-manufacturing-wip-default-off-guard',
    forcedPacket.dccRunnerInputs.enableManufacturing === false &&
      forcedPacket.dccRunnerInputs.enableWip === false &&
      JSON.stringify(forcedPacket).includes('manufacturing_wip_suppressed_for_building_materials'),
    JSON.stringify(forcedPacket.dccRunnerInputs, null, 2));

  assertCase(results, 'w394-true-manufacturing-evidence-still-allowed',
    fabricationPacket.dccRunnerInputs.enableManufacturing === true &&
      fabricationPacket.dccRunnerInputs.enableWip === true,
    JSON.stringify(fabricationPacket.dccRunnerInputs, null, 2));

  assertCase(results, 'w394-consultant-story-surface-safety',
    keystoneStory.status === 'story_ready_without_open_target' &&
      /contractor account|job order|branch availability|special order|will-call|jobsite delivery|margin/i.test(JSON.stringify(keystoneStory)) &&
      !/guarantee|guaranteed|measured roi|will increase/i.test([
        keystoneStory.proofMove,
        keystoneStory.safeClaim,
        keystoneStory.buyerFacingSoWhat,
        keystoneStory.competitiveContrast
      ].join(' ')) &&
      /Do not claim .*measured ROI without evidence/i.test(keystoneStory.doNotClaim || ''),
    JSON.stringify(keystoneStory, null, 2));

  assertCase(results, 'w394-drawer-suggested-lane-prefers-building-materials',
    suggested && suggested.lane && suggested.lane.id === 'building_materials',
    JSON.stringify(suggested, null, 2));

  assertCase(results, 'w394-open-link-authority-and-import-validation-preserved',
    report.includes('Open-link authority remains verified-import-only') &&
      report.includes('completed-result import validation was not changed') &&
      drawer.includes('fake Open links blocked') &&
      !drawer.includes('ignoreCompletedResultValidation'),
    report.slice(0, 6000));

  assertCase(results, 'w394-w386-package-preserved',
    exists(packageDir) &&
      exists(packageZip) &&
      report.includes('W386 source-pack readiness evidence package was not mutated'),
    JSON.stringify({ packageDir, packageZip }, null, 2));

  assertCase(results, 'w394-no-live-smoke-no-upload-boundary',
    report.includes('No live smoke in W394') &&
      report.includes('No upload or deployment') &&
      report.includes('No runtime upload package creation'),
    report.slice(0, 5000));

  assertCase(results, 'w394-preservation-scripts-registered',
    typeof scripts['harness:building-materials-source-pack-toggle-guard-w394'] === 'string' &&
      typeof scripts['harness:wip-routing-best-effort-diagnostics-w393'] === 'string' &&
      typeof scripts['harness:building-materials-fixture-story-proof-w391'] === 'string' &&
      typeof scripts['harness:pack-ready-artifact-package-w386'] === 'string',
    JSON.stringify({
      w394: scripts['harness:building-materials-source-pack-toggle-guard-w394'],
      w393: scripts['harness:wip-routing-best-effort-diagnostics-w393'],
      w391: scripts['harness:building-materials-fixture-story-proof-w391'],
      w386: scripts['harness:pack-ready-artifact-package-w386']
    }, null, 2));

  assertCase(results, 'w394-no-regression-gates',
    report.includes('No runner, adapter, or record creation behavior was changed') &&
      report.includes('N/LLM remains advisory-only') &&
      report.includes('no-regression gates passed'),
    report.slice(-4000));

  printResults('W394 Building Materials source-pack toggle guard harness', results);
}

main();
