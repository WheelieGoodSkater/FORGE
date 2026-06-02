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
  resolveLanePackFromEvidence,
  consultantStorySurfaceFromLanePack
} = require('../../src/contracts/lanePacks');

const root = path.resolve(__dirname, '..', '..');
const reportPath = path.join(root, 'archive', 'reports', 'w396_building_materials_pack_readiness.md');
const w395ReportPath = path.join(root, 'archive', 'reports', 'w395_building_materials_second_fixture_regression.md');
const w394ReportPath = path.join(root, 'archive', 'reports', 'w394_building_materials_source_pack_toggle_guard.md');
const w393ReportPath = path.join(root, 'archive', 'reports', 'w393_wip_routing_best_effort_diagnostics.md');
const w391ReportPath = path.join(root, 'archive', 'reports', 'w391_building_materials_fixture_story_proof.md');
const w386PackageDir = path.join(root, 'archive', 'package_ready', 'w386_forge_source_pack_ready_artifact');
const w386PackageZip = path.join(root, 'archive', 'package_ready', 'w386_forge_source_pack_ready_artifact.zip');

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

function main() {
  const results = [];
  const report = exists(reportPath) ? read(reportPath) : '';
  const w395Report = exists(w395ReportPath) ? read(w395ReportPath) : '';
  const w394Report = exists(w394ReportPath) ? read(w394ReportPath) : '';
  const w393Report = exists(w393ReportPath) ? read(w393ReportPath) : '';
  const w391Report = exists(w391ReportPath) ? read(w391ReportPath) : '';
  const scripts = packageJson().scripts || {};
  const buildingPack = packById('building-materials-contractor-supply-project-fulfillment');
  const buildingText = packText(buildingPack);
  const keystoneResolution = resolveLanePackFromEvidence({
    website: 'https://www.keystonebuildingsupply.com',
    categoryText: 'building materials lumber doors windows fasteners tools contractor supply special order materials branch availability jobsite delivery will-call pickup substitutions project fulfillment margin leakage',
    evidenceText: 'contractor account demand job order readiness branch item availability special order status will-call pickup jobsite delivery readiness substitutions margin leakage project fulfillment confidence'
  });
  const cedarResolution = resolveLanePackFromEvidence({
    website: 'https://www.cedarvalleycontractorsupply.com',
    categoryText: 'contractor supply lumber decking drywall doors windows fasteners tools special order materials branch item availability will-call pickup jobsite delivery substitutions project fulfillment margin leakage',
    evidenceText: 'contractor account demand job order readiness branch item availability special order status substitution options will-call pickup jobsite delivery readiness margin leakage project fulfillment confidence'
  });
  const storySurface = consultantStorySurfaceFromLanePack({
    website: 'https://www.cedarvalleycontractorsupply.com',
    categoryText: 'contractor supply lumber decking drywall doors windows fasteners tools special order materials branch item availability will-call pickup jobsite delivery substitutions project fulfillment margin leakage',
    evidenceText: 'contractor account demand job order readiness branch item availability special order status substitution options will-call pickup jobsite delivery readiness margin leakage project fulfillment confidence'
  }, buildingPack, { displayReadyRecords: [] });
  const allPacksValid = LANE_PACKS.every((pack) => validateLanePack(pack).valid);

  assertCase(results, 'w396-w395-second-fixture-baseline-preserved',
    w395Report.includes('W395 Building Materials second fixture regression harness: 17/17 passed') &&
      w395Report.includes('Cedar Valley Contractor Supply') &&
      w395Report.includes('Building Materials shared-story branch keeps unsupported cross-lane terms out') &&
      report.includes('Use W395 Building Materials Second Fixture Regression and Smoke-Minimizing Confidence Lock as the locked Building Materials fixture baseline'),
    JSON.stringify({ w395: w395Report.slice(0, 2600), report: report.slice(0, 1600) }, null, 2));

  assertCase(results, 'w396-w394-source-pack-toggle-guard-preserved',
    w394Report.includes('W394 Building Materials source-pack toggle guard harness: 18/18 passed') &&
      w394Report.includes('Manufacturing/WIP default: off') &&
      w394Report.includes('True manufacturing evidence is still allowed') &&
      report.includes('Keep W394 Building Materials Source-Pack Readiness and Manufacturing/WIP Toggle Guard Cleanup as the locked Building Materials source-pack baseline'),
    w394Report.slice(0, 3200));

  assertCase(results, 'w396-w393-runner-diagnostics-preserved',
    w393Report.includes('W393 WIP routing best-effort diagnostics harness: 15/15 passed') &&
      w393Report.includes('failed_best_effort') &&
      report.includes('W393 WIP routing best-effort diagnostics remain locked'),
    w393Report.slice(0, 2800));

  assertCase(results, 'w396-w391-keystone-fixture-preserved',
    w391Report.includes('W391 Building Materials fixture-first story proof harness: 15/15 passed') &&
      w391Report.includes('Keystone Building Supply') &&
      report.includes('Keystone Building Supply remains the first fixture baseline'),
    w391Report.slice(0, 2400));

  assertCase(results, 'w396-building-materials-source-pack-ready-now',
    !!buildingPack &&
      buildingPack.laneId === 'building_materials' &&
      buildingPack.packId === 'building-materials-contractor-supply-project-fulfillment' &&
      buildingPack.label === 'Building Materials Contractor Supply & Project Fulfillment' &&
      buildingPack.operatingMode === 'distribution_replenishment' &&
      validateLanePack(buildingPack).valid === true &&
      allPacksValid &&
      report.includes('Building Materials readiness status: `ready_now`'),
    JSON.stringify({ buildingPack, validation: buildingPack && validateLanePack(buildingPack), packCount: LANE_PACKS.length }, null, 2));

  assertCase(results, 'w396-proof-role-coverage',
    buildingPack.recordRoles.required.includes('customer') &&
      buildingPack.recordRoles.required.includes('contractor_account') &&
      buildingPack.recordRoles.required.includes('job_order') &&
      buildingPack.recordRoles.required.includes('branch_item_availability') &&
      buildingPack.recordRoles.optional.includes('special_order_or_substitution') &&
      buildingPack.recordRoles.optional.includes('will_call_or_jobsite_delivery') &&
      buildingPack.recordRoles.optional.includes('margin_context') &&
      buildingPack.recordRoles.optional.includes('project_fulfillment_context') &&
      buildingPack.recordRoles.optional.includes('branch_transfer_context') &&
      buildingPack.recordRoles.optional.includes('contractor_promise_context') &&
      report.includes('Required proof roles') &&
      report.includes('Optional proof roles'),
    buildingText);

  assertCase(results, 'w396-two-fixture-resolution-preserved',
    keystoneResolution.status === 'resolved' &&
      cedarResolution.status === 'resolved' &&
      keystoneResolution.packId === 'building-materials-contractor-supply-project-fulfillment' &&
      cedarResolution.packId === 'building-materials-contractor-supply-project-fulfillment' &&
      report.includes('Keystone Building Supply') &&
      report.includes('Cedar Valley Contractor Supply'),
    JSON.stringify({ keystoneResolution, cedarResolution }, null, 2));

  assertCase(results, 'w396-story-language-distinctness',
    includesAll(buildingText, [
      'contractor account demand',
      'job order readiness',
      'branch item availability',
      'special order status',
      'will-call pickup',
      'jobsite delivery readiness',
      'substitutions',
      'project fulfillment confidence',
      'margin leakage'
    ]) &&
      report.includes('contractor/project fulfillment') &&
      report.includes('Building Materials should stay distinct from Dealer Hardgoods, Apparel/Retail, Parts/Service, Medical/Dental, Food/Beverage, Industrial Equipment, and Life Sciences'),
    buildingText);

  assertCase(results, 'w396-cross-lane-anti-leak-preserved',
    includesAll(buildingText, [
      'dealer allocation',
      'channel fulfillment',
      'style/color/size',
      'store/ecommerce promise',
      'technician truck stock',
      'first-time fix',
      'clinic supply substitutes',
      'qa release',
      'lot/release readiness',
      'food batch',
      'configured equipment assembly',
      'manufacturing routing',
      'wip',
      'work center'
    ]) &&
      report.includes('Cross-lane anti-leak wording: pass'),
    buildingText);

  assertCase(results, 'w396-roi-run-claim-safety',
    /Do not claim .*measured ROI without evidence/i.test(storySurface.doNotClaim || '') &&
      !/guarantee|guaranteed|measured roi|will increase/i.test([
        storySurface.proofMove,
        storySurface.safeClaim,
        storySurface.buyerFacingSoWhat,
        storySurface.competitiveContrast
      ].join(' ')) &&
      report.includes('ROI/Competitive flow remains baseline-required') &&
      report.includes('Run/Open-link authority remains verified-import-only'),
    JSON.stringify(storySurface, null, 2));

  assertCase(results, 'w396-confidence-source-separation-preserved',
    report.includes('public website/category evidence resolves pack confidence') &&
      report.includes('messy notes shape pain, ROI, objections, and run coaching') &&
      report.includes('N/LLM remains advisory-only') &&
      report.includes('Open links remain verified-import-only'),
    report.slice(0, 7000));

  assertCase(results, 'w396-future-package-inclusion-note',
    report.includes('Future readiness bundle should include') &&
      report.includes('archive/reports/w396_building_materials_pack_readiness.md') &&
      report.includes('archive/tools/run_w396_building_materials_pack_readiness_harness.js') &&
      report.includes('W396 does not create or mutate a package zip'),
    report.slice(0, 9000));

  assertCase(results, 'w396-w386-package-preserved',
    exists(w386PackageDir) &&
      exists(w386PackageZip) &&
      report.includes('W386 source-pack readiness evidence package was not mutated') &&
      report.includes('W386 remains historical readiness evidence, not runtime code'),
    JSON.stringify({ w386PackageDir, w386PackageZip }, null, 2));

  assertCase(results, 'w396-no-live-smoke-no-upload-no-package-boundary',
    report.includes('No live smoke in W396') &&
      report.includes('No upload or deployment') &&
      report.includes('No runtime upload package creation') &&
      report.includes('No new zip/package was created in W396'),
    report.slice(0, 5000));

  assertCase(results, 'w396-preservation-scripts-registered',
    typeof scripts['harness:building-materials-pack-readiness-w396'] === 'string' &&
      typeof scripts['harness:building-materials-second-fixture-regression-w395'] === 'string' &&
      typeof scripts['harness:building-materials-source-pack-toggle-guard-w394'] === 'string' &&
      typeof scripts['harness:wip-routing-best-effort-diagnostics-w393'] === 'string' &&
      typeof scripts['harness:building-materials-fixture-story-proof-w391'] === 'string' &&
      typeof scripts['harness:pack-ready-artifact-package-w386'] === 'string',
    JSON.stringify({
      w396: scripts['harness:building-materials-pack-readiness-w396'],
      w395: scripts['harness:building-materials-second-fixture-regression-w395'],
      w394: scripts['harness:building-materials-source-pack-toggle-guard-w394'],
      w393: scripts['harness:wip-routing-best-effort-diagnostics-w393'],
      w391: scripts['harness:building-materials-fixture-story-proof-w391'],
      w386: scripts['harness:pack-ready-artifact-package-w386']
    }, null, 2));

  assertCase(results, 'w396-no-regression-gates',
    report.includes('No source-pack mutation in W396') &&
      report.includes('No runner, adapter, record creation, import validation, or Open-link authority changes') &&
      report.includes('No fake Open links') &&
      report.includes('completed-result import validation was not changed') &&
      report.includes('W396 no-regression gates passed'),
    report.slice(-5000));

  printResults('W396 Building Materials pack-readiness harness', results);
}

main();
