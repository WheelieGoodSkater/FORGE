#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const {
  assertCase,
  printResults
} = require('./lib/forge_harness_fixtures');

const {
  LANE_PACKS,
  validateLanePack,
  resolveLanePackFromEvidence
} = require('../../src/contracts/lanePacks');

const root = path.resolve(__dirname, '..', '..');
const tracePath = '/Users/aaronsunshine/Downloads/intelligent-demo-builder-trace-1780402790781.json';
const reportPath = path.join(root, 'archive', 'reports', 'w392_keystone_smoke_wip_routing_safety_gate.md');
const runnerPath = path.join(root, 'netsuite', 'runner', 'scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js');
const packageDir = path.join(root, 'archive', 'package_ready', 'w386_forge_source_pack_ready_artifact');
const packageZip = path.join(root, 'archive', 'package_ready', 'w386_forge_source_pack_ready_artifact.zip');

const expectedSignals = [
  'building materials',
  'lumber',
  'doors',
  'windows',
  'fasteners',
  'tools',
  'contractor supply',
  'special order materials',
  'branch availability',
  'jobsite delivery',
  'will-call pickup',
  'substitutions',
  'project fulfillment',
  'margin leakage'
];

const expectedRoles = [
  'customer',
  'contractor_account',
  'job_order',
  'branch_item_availability',
  'special_order_or_substitution',
  'will_call_or_jobsite_delivery'
];

const invalidRoleTerms = [
  'dealer_availability_or_replenishment_flow',
  'style_matrix_or_availability_flow',
  'work_order_or_dispatch_without_service_evidence',
  'technician_truck_stock_without_parts_service_evidence',
  'clinic_supply_substitute_without_medical_dental_evidence',
  'lot_release_or_qa_validation_without_life_sciences_evidence',
  'food_formula_or_batch_without_food_evidence',
  'configured_equipment_assembly_without_industrial_evidence'
];

function exists(filePath) {
  return fs.existsSync(filePath);
}

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function rootPath(relPath) {
  return path.join(root, relPath);
}

function readJson(filePath) {
  return JSON.parse(read(filePath));
}

function packageJson() {
  return JSON.parse(read(rootPath('package.json')));
}

function runnerRequest(trace) {
  const raw = trace &&
    trace.state &&
    trace.state.integratedBuildRunnerResult &&
    trace.state.integratedBuildRunnerResult.runnerParams &&
    trace.state.integratedBuildRunnerResult.runnerParams.custscript_v3_runner_idb_request_json;
  return raw ? JSON.parse(raw) : {};
}

function walkFiles(dir, prefix = '') {
  if (!exists(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    const fullPath = path.join(dir, entry.name);
    return entry.isDirectory() ? walkFiles(fullPath, rel) : [rel];
  });
}

function main() {
  const results = [];
  const report = exists(reportPath) ? read(reportPath) : '';
  const trace = exists(tracePath) ? readJson(tracePath) : {};
  const request = runnerRequest(trace);
  const runner = exists(runnerPath) ? read(runnerPath) : '';
  const w391 = exists(rootPath('archive/reports/w391_building_materials_fixture_story_proof.md'))
    ? read(rootPath('archive/reports/w391_building_materials_fixture_story_proof.md'))
    : '';
  const scripts = packageJson().scripts || {};
  const packageReadyFiles = walkFiles(rootPath('archive/package_ready'));
  const runtimeUploadArtifacts = packageReadyFiles.filter((file) =>
    /runtime|upload|deployment|filecabinet/i.test(file) &&
    !/^w386_forge_source_pack_ready_artifact\//.test(file)
  );
  const buildingMaterialsPacks = LANE_PACKS.filter((pack) =>
    /building|contractor|project/i.test([pack.packId, pack.laneId, pack.label, pack.subIndustryId].join(' '))
  );
  const keystoneEvidence = {
    website: 'https://www.keystonebuildingsupply.com',
    categoryText: expectedSignals.join(' '),
    evidenceText: 'contractor account demand job order readiness item availability by branch special order status will-call pickup jobsite delivery readiness substitutions margin leakage project fulfillment confidence'
  };
  const currentResolution = resolveLanePackFromEvidence(keystoneEvidence);

  assertCase(results, 'w392-keystone-trace-parsed',
    exists(tracePath) &&
      trace.state &&
      trace.state.intake &&
      trace.state.intake.customer === 'Keystone Building Supply' &&
      trace.state.integratedBuildRunnerResult &&
      trace.state.integratedBuildRunnerResult.runnerTaskId,
    JSON.stringify({ tracePath, keys: Object.keys(trace || {}).slice(0, 20) }, null, 2));

  assertCase(results, 'w392-lane-story-misclassification-identified',
    trace.state.selectedLaneId === 'industrial_equipment' &&
      trace.selectedLane &&
      trace.selectedLane.name === 'Industrial Equipment Manufacturing' &&
      w391.includes('Building Materials / Contractor Supply') &&
      report.includes('Lane/story misclassification'),
    JSON.stringify({ selectedLaneId: trace.state.selectedLaneId, selectedLane: trace.selectedLane && trace.selectedLane.name }, null, 2));

  const params = trace.state.integratedBuildRunnerResult.runnerParams || {};
  assertCase(results, 'w392-manufacturing-wip-toggle-risk-identified',
    params.custscript_v3_runner_enable_mfg === 'T' &&
      params.custscript_v3_runner_enable_wip === 'T' &&
      report.includes('Manufacturing/WIP toggle risk') &&
      report.includes('Building Materials should not use Manufacturing/WIP by default'),
    JSON.stringify({ mfg: params.custscript_v3_runner_enable_mfg, wip: params.custscript_v3_runner_enable_wip }, null, 2));

  assertCase(results, 'w392-bom-routing-failure-path-identified',
    runner.includes('function createAndAttachRoutingIfPossible') &&
      runner.includes("routing.setValue({ fieldId: 'billofmaterials', value: Number(bomId) })") &&
      report.includes('INVALID_FLD_VALUE') &&
      report.includes('billofmaterials') &&
      report.includes('createAndAttachRoutingIfPossible'),
    runner.slice(runner.indexOf('function createAndAttachRoutingIfPossible'), runner.indexOf('function createAndAttachRoutingIfPossible') + 2200));

  assertCase(results, 'w392-building-materials-fixture-story-preserved',
    w391.includes('W391 Building Materials fixture-first story proof harness: 15/15 passed') &&
      w391.includes('No source-pack mutation was made in W391') &&
      report.includes('W391 fixture story remains valid and distinct'),
    w391.slice(0, 2400));

  assertCase(results, 'w392-source-pack-readiness-review',
    buildingMaterialsPacks.length === 0 &&
      report.includes('No direct Building Materials source pack exists today') &&
      report.includes('future scoped source-pack is needed'),
    JSON.stringify(buildingMaterialsPacks, null, 2));

  assertCase(results, 'w392-existing-lane-temporary-fit-safety',
    currentResolution.packId !== 'building-materials-contractor-supply-project-fulfillment' &&
      report.includes('Do not map Keystone temporarily to Industrial Equipment') &&
      report.includes('Do not map Keystone temporarily to Dealer Hardgoods') &&
      report.includes('industrial_distribution can only be a temporary fallback with explicit confirmation'),
    JSON.stringify(currentResolution, null, 2));

  assertCase(results, 'w392-expected-signal-and-proof-role-coverage',
    expectedSignals.every((term) => report.includes(term)) &&
      expectedRoles.every((role) => report.includes(role)) &&
      invalidRoleTerms.every((role) => report.includes(role)),
    JSON.stringify({ expectedSignals, expectedRoles, invalidRoleTerms }, null, 2));

  assertCase(results, 'w392-wip-routing-safety-recommendation',
    report.includes('Recommendation: patch a targeted WIP routing safety issue next') &&
      report.includes('best-effort') &&
      report.includes('capture diagnostics') &&
      report.includes('continue returning completed build results when core records were created safely'),
    report.slice(0, 8000));

  assertCase(results, 'w392-no-additional-live-smoke-no-upload',
    report.includes('No additional live smoke in W392') &&
      report.includes('No upload or deployment') &&
      runtimeUploadArtifacts.length === 0,
    JSON.stringify(runtimeUploadArtifacts, null, 2));

  assertCase(results, 'w392-no-fake-open-links-and-authority-preserved',
    report.includes('No fake Open links') &&
      report.includes('Open-link authority remains verified-import-only') &&
      report.includes('Do not weaken Open-link authority checks'),
    report.slice(0, 9000));

  assertCase(results, 'w392-completed-result-import-validation-preserved',
    report.includes('Do not weaken completed-result import validation') &&
      report.includes('completed-result import validation remains unchanged') &&
      request.demoPath &&
      request.demoPath.laneId === 'industrial_equipment',
    JSON.stringify({ requestMode: request.resolvedOperatingMode, demoPath: request.demoPath }, null, 2));

  assertCase(results, 'w392-w386-and-preservation-scripts',
    exists(packageDir) &&
      exists(packageZip) &&
      typeof scripts['harness:keystone-smoke-wip-routing-safety-gate-w392'] === 'string' &&
      typeof scripts['harness:building-materials-fixture-story-proof-w391'] === 'string' &&
      typeof scripts['harness:pack-ready-artifact-package-w386'] === 'string',
    JSON.stringify({ packageDir, packageZip }, null, 2));

  assertCase(results, 'w392-no-regression-gates',
    report.includes('No runner code was changed in W392') &&
      report.includes('No source-pack mutation was made in W392') &&
      report.includes('No package mutation') &&
      report.includes('No new drawer transaction write paths'),
    report.slice(-4000));

  printResults('W392 Keystone smoke WIP routing safety gate harness', results);
}

main();
