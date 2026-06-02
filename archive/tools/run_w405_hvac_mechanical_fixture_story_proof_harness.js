#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const {
  assertCase,
  printResults
} = require('./lib/forge_harness_fixtures');

const root = path.resolve(__dirname, '..', '..');
const reportPath = path.join(root, 'archive', 'reports', 'w405_hvac_mechanical_fixture_story_proof.md');
const w404ReportPath = path.join(root, 'archive', 'reports', 'w404_hvac_mechanical_fixture_first_selection.md');
const w403ReportPath = path.join(root, 'archive', 'reports', 'w403_wholesale_janitorial_readiness_delta_package.md');
const w402ReportPath = path.join(root, 'archive', 'reports', 'w402_wholesale_janitorial_source_pack_cleanup.md');
const w397PackageDir = path.join(root, 'archive', 'package_ready', 'w397_building_materials_readiness_delta');
const w397PackageZip = path.join(root, 'archive', 'package_ready', 'w397_building_materials_readiness_delta.zip');
const w403PackageDir = path.join(root, 'archive', 'package_ready', 'w403_wholesale_janitorial_readiness_delta');
const w403PackageZip = path.join(root, 'archive', 'package_ready', 'w403_wholesale_janitorial_readiness_delta.zip');

const storyTerms = [
  'contractor account demand',
  'job quote/order readiness',
  'HVAC equipment availability',
  'service/replacement part availability',
  'branch/location stock',
  'backorder/replenishment status',
  'warranty or replacement context',
  'branch pickup',
  'jobsite delivery',
  'install/emergency repair promise confidence',
  'margin leakage',
  'refrigerant caution'
];

const proofRoles = [
  'customer / contractor account',
  'job_quote_or_order',
  'hvac_equipment_availability',
  'service_or_replacement_part',
  'branch_location_stock',
  'backorder_or_replenishment_status',
  'warranty_or_replacement_context',
  'branch_pickup_or_jobsite_delivery'
];

const fixtureProofNames = [
  'Summit Mechanical Contractor Account',
  'Summit Mechanical Job Quote',
  'Summit HVAC Equipment Availability',
  'Summit Replacement Part Availability',
  'Summit Branch Stock',
  'Summit Backorder Replenishment Status',
  'Summit Warranty Replacement Context',
  'Summit Pickup Delivery Readiness'
];

const comparisonLanes = [
  'Building Materials',
  'Parts/Service',
  'Industrial Distribution',
  'Wholesale Janitorial',
  'Dealer Hardgoods',
  'Apparel/Retail',
  'Medical/Dental',
  'Food/Beverage',
  'Industrial Equipment',
  'Life Sciences'
];

const antiLeakTerms = [
  'lumber',
  'doors',
  'windows',
  'special order materials',
  'contract replenishment',
  'route delivery readiness',
  'restroom paper',
  'cleaning chemicals',
  'dealer allocation',
  'channel fulfillment',
  'style/color/size variants',
  'store/ecommerce promise',
  'clinic supply substitutes',
  'QA release',
  'lot/release readiness',
  'food batch',
  'configured assembly',
  'manufacturing routing',
  'WIP',
  'work center'
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

function packageJson() {
  return JSON.parse(read(rootPath('package.json')));
}

function main() {
  const results = [];
  const report = exists(reportPath) ? read(reportPath) : '';
  const w404Report = exists(w404ReportPath) ? read(w404ReportPath) : '';
  const w403Report = exists(w403ReportPath) ? read(w403ReportPath) : '';
  const w402Report = exists(w402ReportPath) ? read(w402ReportPath) : '';
  const scripts = packageJson().scripts || {};

  assertCase(results, 'w405-w404-selection-baseline-preserved',
    w404Report.includes('W404 HVAC/Mechanical fixture-first selection harness: 15/15 passed') &&
      w404Report.includes('Recommendation: proceed with HVAC / Mechanical Contractor Supply & Service Readiness as the next fixture-first lane') &&
      report.includes('Use W404 HVAC / Mechanical Contractor Supply Fixture-First Selection as the locked expansion baseline'),
    JSON.stringify({ w404: w404Report.slice(0, 2600), report: report.slice(0, 1600) }, null, 2));

  assertCase(results, 'w405-w403-package-baseline-preserved',
    exists(w403PackageDir) &&
      exists(w403PackageZip) &&
      w403Report.includes('W403 Wholesale Janitorial readiness delta package harness: 13/13 passed') &&
      report.includes('Do not mutate W403, W397, or W386 packages'),
    JSON.stringify({ w403PackageDir, w403PackageZip }, null, 2));

  assertCase(results, 'w405-w402-wholesale-janitorial-readiness-preserved',
    w402Report.includes('Wholesale Janitorial readiness status: `ready_now`') &&
      w402Report.includes('W402 Wholesale Janitorial source-pack cleanup harness: 16/16 passed') &&
      report.includes('Wholesale Janitorial remains the locked source-pack-ready adjacent lane'),
    w402Report.slice(0, 2600));

  assertCase(results, 'w405-w397-package-preserved',
    exists(w397PackageDir) &&
      exists(w397PackageZip) &&
      report.includes('Do not mutate W403, W397, or W386 packages'),
    JSON.stringify({ w397PackageDir, w397PackageZip }, null, 2));

  assertCase(results, 'w405-no-live-smoke-no-upload-no-package-boundary',
    report.includes('No live smoke in W405') &&
      report.includes('No upload or deployment') &&
      report.includes('No runtime upload package creation') &&
      report.includes('Do not create a new package in W405'),
    report.slice(0, 3600));

  assertCase(results, 'w405-hvac-story-distinctness',
    storyTerms.every((term) => report.includes(term)) &&
      report.includes('HVAC units') &&
      report.includes('filters') &&
      report.includes('thermostats') &&
      report.includes('duct') &&
      report.includes('refrigerant') &&
      report.includes('install materials') &&
      report.includes('Summit Mechanical Supply'),
    JSON.stringify(storyTerms, null, 2));

  assertCase(results, 'w405-proof-role-coverage',
    proofRoles.every((role) => report.includes(role)) &&
      fixtureProofNames.every((name) => report.includes(name)),
    JSON.stringify({ proofRoles, fixtureProofNames }, null, 2));

  assertCase(results, 'w405-roi-competitive-flow-preserved',
    report.includes('Talk track') &&
      report.includes('Discovery') &&
      report.includes('Proof move') &&
      report.includes('Largest value to prove') &&
      report.includes('Competitive watch-out') &&
      report.includes('Claim caution') &&
      report.includes('measured savings require a customer baseline'),
    report.slice(0, 8200));

  assertCase(results, 'w405-run-open-link-collapse-preserved',
    report.includes('Run path remains numbered and clickable only when verified Open-link authority exists') &&
      report.includes('Imported proof records remain collapsed by default') &&
      report.includes('Support and receipt surfaces remain lane-consistent and collapsed') &&
      report.includes('fixture Open links remain fixture proof, not live smoke') &&
      report.includes('No fake Open links'),
    report.slice(0, 9000));

  assertCase(results, 'w405-manufacturing-wip-default-off-posture',
    report.includes('Manufacturing/WIP remains off unless explicit fabrication/manufacturing evidence exists') &&
      report.includes('HVAC contractor supply should not invite Manufacturing/WIP by default') &&
      report.includes('Do not weaken W393 WIP best-effort diagnostics'),
    report.slice(0, 9800));

  assertCase(results, 'w405-cross-lane-anti-leak-wording',
    antiLeakTerms.every((term) => report.includes(term)) &&
      comparisonLanes.every((lane) => report.includes(lane)) &&
      report.includes('Do not collapse HVAC into Building Materials, Parts/Service, Industrial Distribution, or Wholesale Janitorial unless evidence explicitly supports that path'),
    JSON.stringify({ antiLeakTerms, comparisonLanes }, null, 2));

  assertCase(results, 'w405-claim-safety-confidence-separation',
    report.includes('Competitive pressure remains advisory-only unless confirmed') &&
      report.includes('No measured ROI without a customer-confirmed baseline') &&
      report.includes('N/LLM remains advisory-only') &&
      report.includes('public website/category evidence, messy notes, advisory inference, build/import proof, and Open-link authority remain separated'),
    report.slice(0, 10400));

  assertCase(results, 'w405-no-source-pack-mutation',
    report.includes('No source-pack mutation was made in W405') &&
      report.includes('Do not add HVAC to runtime source packs in W405') &&
      report.includes('fixture/story proof only'),
    report.slice(0, 10800));

  assertCase(results, 'w405-preservation-scripts-registered',
    typeof scripts['harness:hvac-mechanical-fixture-story-proof-w405'] === 'string' &&
      typeof scripts['harness:hvac-mechanical-fixture-first-selection-w404'] === 'string' &&
      typeof scripts['harness:wholesale-janitorial-readiness-delta-package-w403'] === 'string' &&
      typeof scripts['harness:wholesale-janitorial-source-pack-cleanup-w402'] === 'string' &&
      typeof scripts['harness:building-materials-readiness-delta-package-w397'] === 'string',
    JSON.stringify({
      w405: scripts['harness:hvac-mechanical-fixture-story-proof-w405'],
      w404: scripts['harness:hvac-mechanical-fixture-first-selection-w404'],
      w403: scripts['harness:wholesale-janitorial-readiness-delta-package-w403'],
      w402: scripts['harness:wholesale-janitorial-source-pack-cleanup-w402'],
      w397: scripts['harness:building-materials-readiness-delta-package-w397']
    }, null, 2));

  assertCase(results, 'w405-no-regression-gates',
    report.includes('W405 no-regression gates passed') &&
      report.includes('No live smoke') &&
      report.includes('No upload or deployment') &&
      report.includes('No package mutation') &&
      report.includes('No source-pack mutation'),
    report.slice(-6200));

  printResults('W405 HVAC/Mechanical fixture story proof harness', results);
}

main();
