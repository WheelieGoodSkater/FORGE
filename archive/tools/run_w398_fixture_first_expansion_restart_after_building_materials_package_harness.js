#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const {
  assertCase,
  printResults
} = require('./lib/forge_harness_fixtures');

const root = path.resolve(__dirname, '..', '..');
const reportPath = path.join(root, 'archive', 'reports', 'w398_fixture_first_expansion_restart_after_building_materials_package.md');
const w397ReportPath = path.join(root, 'archive', 'reports', 'w397_building_materials_readiness_delta_package.md');
const w396ReportPath = path.join(root, 'archive', 'reports', 'w396_building_materials_pack_readiness.md');
const w386PackageDir = path.join(root, 'archive', 'package_ready', 'w386_forge_source_pack_ready_artifact');
const w386PackageZip = path.join(root, 'archive', 'package_ready', 'w386_forge_source_pack_ready_artifact.zip');
const w397PackageDir = path.join(root, 'archive', 'package_ready', 'w397_building_materials_readiness_delta');
const w397PackageZip = path.join(root, 'archive', 'package_ready', 'w397_building_materials_readiness_delta.zip');

const janitorialStoryTerms = [
  'contract customer demand',
  'recurring order readiness',
  'facility/location supply availability',
  'preferred item or contracted item context',
  'substitute product readiness',
  'backorder exposure',
  'route/delivery readiness',
  'replenishment cadence',
  'margin leakage',
  'customer promise confidence'
];

const proofRoles = [
  'customer / contract account',
  'recurring_order',
  'facility_item_availability',
  'preferred_or_substitute_item',
  'backorder_or_replenishment_status',
  'route_or_delivery_readiness'
];

const antiLeakTerms = [
  'contractor job order',
  'will-call pickup',
  'jobsite delivery',
  'special order materials',
  'lumber',
  'doors',
  'windows',
  'dealer allocation',
  'channel fulfillment',
  'style/color/size variants',
  'technician truck stock',
  'first-time fix',
  'clinic supply substitutes',
  'QA release',
  'lot/release readiness',
  'food batch',
  'configured assembly',
  'manufacturing routing',
  'WIP'
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
  const w397Report = exists(w397ReportPath) ? read(w397ReportPath) : '';
  const w396Report = exists(w396ReportPath) ? read(w396ReportPath) : '';
  const scripts = packageJson().scripts || {};

  assertCase(results, 'w398-w397-package-baseline-preserved',
    exists(w397PackageDir) &&
      exists(w397PackageZip) &&
      w397Report.includes('W397 Building Materials readiness delta package harness: 13/13 passed') &&
      report.includes('Use W397 Post-W386 Building Materials Readiness Delta Package as the locked packaging baseline') &&
      report.includes('Do not mutate the W397 Building Materials readiness delta package'),
    JSON.stringify({ w397PackageDir, w397PackageZip, w397Report: w397Report.slice(0, 1800), report: report.slice(0, 1600) }, null, 2));

  assertCase(results, 'w398-w396-building-materials-readiness-preserved',
    w396Report.includes('Building Materials readiness status: `ready_now`') &&
      w396Report.includes('W396 Building Materials pack-readiness harness: 16/16 passed') &&
      report.includes('Building Materials is now source-pack-ready and package-ready as readiness evidence'),
    w396Report.slice(0, 2200));

  assertCase(results, 'w398-w386-package-preserved',
    exists(w386PackageDir) &&
      exists(w386PackageZip) &&
      report.includes('Do not mutate the W386 source-pack readiness evidence package'),
    JSON.stringify({ w386PackageDir, w386PackageZip }, null, 2));

  assertCase(results, 'w398-no-live-smoke-no-upload-no-package-boundary',
    report.includes('No live smoke in W398') &&
      report.includes('No upload or deployment') &&
      report.includes('No runtime upload package creation') &&
      report.includes('Do not create a new package in W398'),
    report.slice(0, 3200));

  assertCase(results, 'w398-next-lane-selection-rationale',
    report.includes('Recommendation: proceed with Wholesale Janitorial & Facility Supply / Contract Replenishment as the next fixture-first lane') &&
      report.includes('Brightline Facility Supply') &&
      report.includes('adjacent to distribution, building materials, dealer/channel, and retail') &&
      report.includes('distinct around contract customers, recurring supply demand, facility locations, replenishment cadence, substitutions, backorders, route/delivery readiness, and margin leakage'),
    report.slice(0, 5200));

  assertCase(results, 'w398-wholesale-janitorial-industry-distinctness',
    janitorialStoryTerms.every((term) => report.includes(term)) &&
      report.includes('janitorial supplies') &&
      report.includes('paper products') &&
      report.includes('cleaning chemicals') &&
      report.includes('dispensers') &&
      report.includes('trash liners'),
    JSON.stringify(janitorialStoryTerms, null, 2));

  assertCase(results, 'w398-expected-proof-role-coverage',
    proofRoles.every((role) => report.includes(role)) &&
      report.includes('Brightline Contract Account') &&
      report.includes('Brightline Recurring Order') &&
      report.includes('Brightline Route Delivery Readiness'),
    JSON.stringify(proofRoles, null, 2));

  assertCase(results, 'w398-cross-lane-anti-leak-wording',
    antiLeakTerms.every((term) => report.includes(term)) &&
      report.includes('Do not collapse Wholesale Janitorial into generic industrial distribution unless the evidence explicitly supports that path'),
    JSON.stringify(antiLeakTerms, null, 2));

  assertCase(results, 'w398-roi-competitive-flow-preserved',
    report.includes('Largest value to prove') &&
      report.includes('Discovery') &&
      report.includes('Proof move') &&
      report.includes('Competitive watch-out') &&
      report.includes('Claim caution') &&
      report.includes('measured savings require a customer baseline'),
    report.slice(0, 7000));

  assertCase(results, 'w398-run-open-link-authority-preserved',
    report.includes('Run path remains numbered and clickable only when verified Open-link authority exists') &&
      report.includes('Imported proof records remain collapsed by default') &&
      report.includes('Open-link authority remains verified-import-only') &&
      report.includes('No fake Open links'),
    report.slice(0, 7600));

  assertCase(results, 'w398-manufacturing-wip-default-off-posture',
    report.includes('Manufacturing/WIP should remain off unless explicit fabrication/manufacturing evidence exists') &&
      report.includes('Wholesale Janitorial should not invite Manufacturing/WIP by default'),
    report.slice(0, 8200));

  assertCase(results, 'w398-claim-safety-confidence-separation',
    report.includes('Competitive pressure remains advisory-only unless confirmed') &&
      report.includes('N/LLM remains advisory-only') &&
      report.includes('public website/category evidence, messy notes, advisory inference, build/import proof, and Open-link authority remain separated'),
    report.slice(0, 9000));

  assertCase(results, 'w398-no-source-pack-mutation-unless-justified',
    report.includes('No source-pack mutation was made in W398') &&
      report.includes('No runner, adapter, record creation, import validation, or Open-link authority changes') &&
      report.includes('No broad abstractions'),
    report.slice(-4200));

  assertCase(results, 'w398-preservation-scripts-registered',
    typeof scripts['harness:fixture-first-expansion-restart-after-building-materials-package-w398'] === 'string' &&
      typeof scripts['harness:building-materials-readiness-delta-package-w397'] === 'string' &&
      typeof scripts['harness:building-materials-pack-readiness-w396'] === 'string' &&
      typeof scripts['harness:pack-ready-artifact-package-w386'] === 'string',
    JSON.stringify({
      w398: scripts['harness:fixture-first-expansion-restart-after-building-materials-package-w398'],
      w397: scripts['harness:building-materials-readiness-delta-package-w397'],
      w396: scripts['harness:building-materials-pack-readiness-w396'],
      w386: scripts['harness:pack-ready-artifact-package-w386']
    }, null, 2));

  assertCase(results, 'w398-no-regression-gates',
    report.includes('W398 no-regression gates passed') &&
      report.includes('No live smoke') &&
      report.includes('No upload or deployment') &&
      report.includes('No package mutation') &&
      report.includes('No source-pack mutation'),
    report.slice(-5200));

  printResults('W398 fixture-first expansion restart after Building Materials package harness', results);
}

main();
