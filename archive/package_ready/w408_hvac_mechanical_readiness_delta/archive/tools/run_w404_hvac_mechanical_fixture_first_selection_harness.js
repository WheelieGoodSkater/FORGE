#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const {
  assertCase,
  printResults
} = require('./lib/forge_harness_fixtures');

const root = path.resolve(__dirname, '..', '..');
const reportPath = path.join(root, 'archive', 'reports', 'w404_hvac_mechanical_fixture_first_selection.md');
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
  'margin leakage'
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
  const w403Report = exists(w403ReportPath) ? read(w403ReportPath) : '';
  const w402Report = exists(w402ReportPath) ? read(w402ReportPath) : '';
  const scripts = packageJson().scripts || {};

  assertCase(results, 'w404-w403-package-baseline-preserved',
    exists(w403PackageDir) &&
      exists(w403PackageZip) &&
      w403Report.includes('W403 Wholesale Janitorial readiness delta package harness: 13/13 passed') &&
      report.includes('Use W403 Wholesale Janitorial Readiness Delta Package as the locked packaging baseline') &&
      report.includes('Do not mutate the W403 Wholesale Janitorial readiness delta package'),
    JSON.stringify({ w403PackageDir, w403PackageZip, w403: w403Report.slice(0, 2200), report: report.slice(0, 1600) }, null, 2));

  assertCase(results, 'w404-w402-wholesale-janitorial-readiness-preserved',
    w402Report.includes('Wholesale Janitorial readiness status: `ready_now`') &&
      w402Report.includes('W402 Wholesale Janitorial source-pack cleanup harness: 16/16 passed') &&
      report.includes('Wholesale Janitorial remains source-pack-ready and package-ready as readiness evidence'),
    w402Report.slice(0, 2600));

  assertCase(results, 'w404-w397-package-preserved',
    exists(w397PackageDir) &&
      exists(w397PackageZip) &&
      report.includes('Do not mutate the W397 Building Materials readiness delta package'),
    JSON.stringify({ w397PackageDir, w397PackageZip }, null, 2));

  assertCase(results, 'w404-no-live-smoke-no-upload-no-package-boundary',
    report.includes('No live smoke in W404') &&
      report.includes('No upload or deployment') &&
      report.includes('No runtime upload package creation') &&
      report.includes('Do not create a new package in W404'),
    report.slice(0, 3200));

  assertCase(results, 'w404-next-lane-selection-rationale',
    report.includes('Recommendation: proceed with HVAC / Mechanical Contractor Supply & Service Readiness as the next fixture-first lane') &&
      report.includes('Summit Mechanical Supply') &&
      report.includes('adjacent to Building Materials, Parts/Service, Industrial Distribution, and contractor supply') &&
      report.includes('distinct around job quote/order readiness, HVAC equipment availability, service or replacement parts, warranty or replacement context, branch pickup, jobsite delivery, and install/emergency repair promise confidence'),
    report.slice(0, 5600));

  assertCase(results, 'w404-hvac-industry-distinctness',
    storyTerms.every((term) => report.includes(term)) &&
      report.includes('HVAC units') &&
      report.includes('filters') &&
      report.includes('thermostats') &&
      report.includes('duct') &&
      report.includes('refrigerant caution') &&
      report.includes('install materials'),
    JSON.stringify(storyTerms, null, 2));

  assertCase(results, 'w404-expected-proof-role-coverage',
    proofRoles.every((role) => report.includes(role)) &&
      fixtureProofNames.every((name) => report.includes(name)),
    JSON.stringify({ proofRoles, fixtureProofNames }, null, 2));

  assertCase(results, 'w404-cross-lane-anti-leak-wording',
    antiLeakTerms.every((term) => report.includes(term)) &&
      report.includes('Do not collapse HVAC into Building Materials, Parts/Service, Industrial Distribution, or Wholesale Janitorial unless evidence explicitly supports that path'),
    JSON.stringify(antiLeakTerms, null, 2));

  assertCase(results, 'w404-roi-competitive-flow-preserved',
    report.includes('Largest value to prove') &&
      report.includes('Discovery') &&
      report.includes('Proof move') &&
      report.includes('Competitive watch-out') &&
      report.includes('Claim caution') &&
      report.includes('measured savings require a customer baseline'),
    report.slice(0, 7600));

  assertCase(results, 'w404-run-open-link-authority-preserved',
    report.includes('Run path remains numbered and clickable only when verified Open-link authority exists') &&
      report.includes('Imported proof records remain collapsed by default') &&
      report.includes('Open-link authority remains verified-import-only') &&
      report.includes('No fake Open links'),
    report.slice(0, 8200));

  assertCase(results, 'w404-manufacturing-wip-default-off-posture',
    report.includes('Manufacturing/WIP should remain off unless explicit fabrication/manufacturing evidence exists') &&
      report.includes('HVAC contractor supply should not invite Manufacturing/WIP by default') &&
      report.includes('Do not weaken W393 WIP best-effort diagnostics'),
    report.slice(0, 8800));

  assertCase(results, 'w404-claim-safety-confidence-separation',
    report.includes('Competitive pressure remains advisory-only unless confirmed') &&
      report.includes('N/LLM remains advisory-only') &&
      report.includes('public website/category evidence, messy notes, advisory inference, build/import proof, and Open-link authority remain separated'),
    report.slice(0, 9800));

  assertCase(results, 'w404-no-source-pack-mutation',
    report.includes('No source-pack mutation was made in W404') &&
      report.includes('Do not add HVAC to runtime source packs in W404') &&
      report.includes('fixture/story scaffold only'),
    report.slice(0, 10500));

  assertCase(results, 'w404-preservation-scripts-registered',
    typeof scripts['harness:hvac-mechanical-fixture-first-selection-w404'] === 'string' &&
      typeof scripts['harness:wholesale-janitorial-readiness-delta-package-w403'] === 'string' &&
      typeof scripts['harness:wholesale-janitorial-source-pack-cleanup-w402'] === 'string' &&
      typeof scripts['harness:building-materials-readiness-delta-package-w397'] === 'string',
    JSON.stringify({
      w404: scripts['harness:hvac-mechanical-fixture-first-selection-w404'],
      w403: scripts['harness:wholesale-janitorial-readiness-delta-package-w403'],
      w402: scripts['harness:wholesale-janitorial-source-pack-cleanup-w402'],
      w397: scripts['harness:building-materials-readiness-delta-package-w397']
    }, null, 2));

  assertCase(results, 'w404-no-regression-gates',
    report.includes('W404 no-regression gates passed') &&
      report.includes('No live smoke') &&
      report.includes('No upload or deployment') &&
      report.includes('No package mutation') &&
      report.includes('No source-pack mutation'),
    report.slice(-5600));

  printResults('W404 HVAC/Mechanical fixture-first selection harness', results);
}

main();
