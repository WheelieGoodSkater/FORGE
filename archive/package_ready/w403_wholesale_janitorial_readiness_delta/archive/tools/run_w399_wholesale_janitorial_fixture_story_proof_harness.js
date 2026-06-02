#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const {
  assertCase,
  printResults
} = require('./lib/forge_harness_fixtures');

const root = path.resolve(__dirname, '..', '..');
const reportPath = path.join(root, 'archive', 'reports', 'w399_wholesale_janitorial_fixture_story_proof.md');
const w398ReportPath = path.join(root, 'archive', 'reports', 'w398_fixture_first_expansion_restart_after_building_materials_package.md');
const w397ReportPath = path.join(root, 'archive', 'reports', 'w397_building_materials_readiness_delta_package.md');
const w396ReportPath = path.join(root, 'archive', 'reports', 'w396_building_materials_pack_readiness.md');
const w386PackageDir = path.join(root, 'archive', 'package_ready', 'w386_forge_source_pack_ready_artifact');
const w386PackageZip = path.join(root, 'archive', 'package_ready', 'w386_forge_source_pack_ready_artifact.zip');
const w397PackageDir = path.join(root, 'archive', 'package_ready', 'w397_building_materials_readiness_delta');
const w397PackageZip = path.join(root, 'archive', 'package_ready', 'w397_building_materials_readiness_delta.zip');

const storyTerms = [
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

const fixtureProofNames = [
  'Brightline Contract Account',
  'Brightline Recurring Order',
  'Brightline Facility Item Availability',
  'Brightline Preferred Substitute Item',
  'Brightline Backorder Replenishment Status',
  'Brightline Route Delivery Readiness'
];

const antiLeakTerms = [
  'contractor job order',
  'will-call pickup',
  'jobsite delivery',
  'special order materials',
  'lumber',
  'doors',
  'windows',
  'branch job promise',
  'project fulfillment',
  'dealer allocation',
  'supplier portals',
  'channel fulfillment',
  'dealer/channel promise',
  'style/color/size variants',
  'seasonal assortment',
  'store/ecommerce promise',
  'transfer risk',
  'technician truck stock',
  'work order dispatch',
  'first-time fix',
  'installed equipment',
  'warranty exposure',
  'emergency response',
  'clinic supply substitutes',
  'dental equipment',
  'compliance-sensitive items',
  'QA release',
  'lot/release readiness',
  'expiration',
  'validation documentation',
  'traceability',
  'regulated shipment',
  'food batch',
  'ingredient readiness',
  'packaging readiness',
  'QA/lot readiness',
  'finished-good readiness',
  'promotion ship confidence',
  'configured assembly',
  'component lead time',
  'build/test/inspection readiness',
  'engineering BOM',
  'manufacturing routing',
  'WIP',
  'work center',
  'assembly readiness'
];

const comparisonLanes = [
  'Building Materials',
  'Dealer Hardgoods',
  'Apparel/Retail',
  'Parts/Service',
  'Medical/Dental',
  'Food/Beverage',
  'Industrial Equipment',
  'Life Sciences',
  'generic Industrial Distribution'
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
  const w398Report = exists(w398ReportPath) ? read(w398ReportPath) : '';
  const w397Report = exists(w397ReportPath) ? read(w397ReportPath) : '';
  const w396Report = exists(w396ReportPath) ? read(w396ReportPath) : '';
  const scripts = packageJson().scripts || {};

  assertCase(results, 'w399-w398-expansion-baseline-preserved',
    w398Report.includes('W398 fixture-first expansion restart after Building Materials package harness: 15/15 passed') &&
      w398Report.includes('Recommendation: proceed with Wholesale Janitorial & Facility Supply / Contract Replenishment as the next fixture-first lane') &&
      report.includes('Use W398 Fixture-First Expansion Restart After Building Materials Packaging as the locked expansion baseline'),
    JSON.stringify({ w398: w398Report.slice(0, 2200), report: report.slice(0, 1400) }, null, 2));

  assertCase(results, 'w399-w397-package-baseline-preserved',
    exists(w397PackageDir) &&
      exists(w397PackageZip) &&
      w397Report.includes('W397 Building Materials readiness delta package harness: 13/13 passed') &&
      report.includes('Do not mutate W397 or W386 packages'),
    JSON.stringify({ w397PackageDir, w397PackageZip }, null, 2));

  assertCase(results, 'w399-w396-building-materials-readiness-preserved',
    w396Report.includes('Building Materials readiness status: `ready_now`') &&
      w396Report.includes('W396 Building Materials pack-readiness harness: 16/16 passed') &&
      report.includes('Building Materials remains the locked ready lane baseline'),
    w396Report.slice(0, 2200));

  assertCase(results, 'w399-w386-package-preserved',
    exists(w386PackageDir) &&
      exists(w386PackageZip) &&
      report.includes('W386 source-pack readiness package remains untouched'),
    JSON.stringify({ w386PackageDir, w386PackageZip }, null, 2));

  assertCase(results, 'w399-no-live-smoke-no-upload-no-package-boundary',
    report.includes('No live smoke in W399') &&
      report.includes('No upload or deployment') &&
      report.includes('No runtime upload package creation') &&
      report.includes('Do not create a new package in W399'),
    report.slice(0, 3000));

  assertCase(results, 'w399-wholesale-janitorial-story-distinctness',
    storyTerms.every((term) => report.includes(term)) &&
      report.includes('janitorial supplies') &&
      report.includes('paper products') &&
      report.includes('cleaning chemicals') &&
      report.includes('dispensers') &&
      report.includes('trash liners') &&
      report.includes('offices, schools, property managers, and small facility groups'),
    JSON.stringify(storyTerms, null, 2));

  assertCase(results, 'w399-expected-proof-role-coverage',
    proofRoles.every((role) => report.includes(role)) &&
      fixtureProofNames.every((name) => report.includes(name)),
    JSON.stringify({ proofRoles, fixtureProofNames }, null, 2));

  assertCase(results, 'w399-roi-competitive-flow-preserved',
    report.includes('Talk track') &&
      report.includes('Discovery') &&
      report.includes('Proof move') &&
      report.includes('Largest value to prove') &&
      report.includes('Competitive watch-out') &&
      report.includes('Claim caution') &&
      report.includes('measured savings require a customer baseline'),
    report.slice(0, 7000));

  assertCase(results, 'w399-run-open-link-collapse-preserved',
    report.includes('Run path remains numbered and clickable only when verified Open-link authority exists') &&
      report.includes('Imported proof records remain collapsed by default') &&
      report.includes('Support and receipt surfaces remain lane-consistent and collapsed') &&
      report.includes('fixture Open links remain fixture proof, not live smoke') &&
      report.includes('No fake Open links'),
    report.slice(0, 7600));

  assertCase(results, 'w399-manufacturing-wip-default-off-posture',
    report.includes('Manufacturing/WIP remains off unless explicit fabrication/manufacturing evidence exists') &&
      report.includes('Wholesale Janitorial should not invite Manufacturing/WIP by default'),
    report.slice(0, 8200));

  assertCase(results, 'w399-cross-lane-anti-leak-wording',
    antiLeakTerms.every((term) => report.includes(term)) &&
      comparisonLanes.every((lane) => report.includes(lane)) &&
      report.includes('Do not collapse into generic industrial distribution unless evidence explicitly supports that path'),
    JSON.stringify({ antiLeakTerms, comparisonLanes }, null, 2));

  assertCase(results, 'w399-claim-safety-confidence-separation',
    report.includes('Competitive pressure remains advisory-only unless confirmed') &&
      report.includes('No measured ROI without a customer-confirmed baseline') &&
      report.includes('N/LLM remains advisory-only') &&
      report.includes('public website/category evidence, messy notes, advisory inference, build/import proof, and Open-link authority remain separated'),
    report.slice(0, 9000));

  assertCase(results, 'w399-no-source-pack-mutation',
    report.includes('No source-pack mutation was made in W399') &&
      report.includes('Do not add Wholesale Janitorial to runtime source packs in W399') &&
      report.includes('fixture/story proof only'),
    report.slice(0, 9500));

  assertCase(results, 'w399-no-regression-boundaries',
    report.includes('No runner, adapter, record creation, import validation, or Open-link authority changes') &&
      report.includes('Do not weaken W393 WIP best-effort diagnostics') &&
      report.includes('No broad abstractions') &&
      report.includes('Do not treat W386 or W397 as runtime code'),
    report.slice(-5000));

  assertCase(results, 'w399-preservation-scripts-registered',
    typeof scripts['harness:wholesale-janitorial-fixture-story-proof-w399'] === 'string' &&
      typeof scripts['harness:fixture-first-expansion-restart-after-building-materials-package-w398'] === 'string' &&
      typeof scripts['harness:building-materials-readiness-delta-package-w397'] === 'string' &&
      typeof scripts['harness:building-materials-pack-readiness-w396'] === 'string' &&
      typeof scripts['harness:pack-ready-artifact-package-w386'] === 'string',
    JSON.stringify({
      w399: scripts['harness:wholesale-janitorial-fixture-story-proof-w399'],
      w398: scripts['harness:fixture-first-expansion-restart-after-building-materials-package-w398'],
      w397: scripts['harness:building-materials-readiness-delta-package-w397'],
      w396: scripts['harness:building-materials-pack-readiness-w396'],
      w386: scripts['harness:pack-ready-artifact-package-w386']
    }, null, 2));

  assertCase(results, 'w399-no-regression-gates',
    report.includes('W399 no-regression gates passed') &&
      report.includes('No live smoke') &&
      report.includes('No upload or deployment') &&
      report.includes('No package mutation') &&
      report.includes('No source-pack mutation'),
    report.slice(-5200));

  printResults('W399 Wholesale Janitorial fixture story proof harness', results);
}

main();
