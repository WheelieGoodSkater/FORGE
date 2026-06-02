#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const {
  assertCase,
  printResults
} = require('./lib/forge_harness_fixtures');

const root = path.resolve(__dirname, '..', '..');
const reportPath = path.join(root, 'archive', 'reports', 'w401_wholesale_janitorial_second_fixture_decision.md');
const w400ReportPath = path.join(root, 'archive', 'reports', 'w400_wholesale_janitorial_source_pack_readiness_decision.md');
const w399ReportPath = path.join(root, 'archive', 'reports', 'w399_wholesale_janitorial_fixture_story_proof.md');
const w398ReportPath = path.join(root, 'archive', 'reports', 'w398_fixture_first_expansion_restart_after_building_materials_package.md');
const w397ReportPath = path.join(root, 'archive', 'reports', 'w397_building_materials_readiness_delta_package.md');
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
  'MetroCare Contract Account',
  'MetroCare Recurring Order',
  'MetroCare Facility Item Availability',
  'MetroCare Preferred Substitute Item',
  'MetroCare Backorder Replenishment Status',
  'MetroCare Route Delivery Readiness'
];

const antiLeakTerms = [
  'contractor job order',
  'will-call pickup',
  'jobsite delivery',
  'special order materials',
  'dealer allocation',
  'channel fulfillment',
  'style/color/size',
  'technician truck stock',
  'first-time fix',
  'clinic supply substitutes',
  'QA release',
  'lot/release readiness',
  'food batch',
  'configured equipment assembly',
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
  const w400Report = exists(w400ReportPath) ? read(w400ReportPath) : '';
  const w399Report = exists(w399ReportPath) ? read(w399ReportPath) : '';
  const w398Report = exists(w398ReportPath) ? read(w398ReportPath) : '';
  const w397Report = exists(w397ReportPath) ? read(w397ReportPath) : '';
  const scripts = packageJson().scripts || {};

  assertCase(results, 'w401-w400-decision-baseline-preserved',
    w400Report.includes('W400 Wholesale Janitorial source-pack readiness decision harness: 16/16 passed') &&
      w400Report.includes('Readiness decision: `needs_second_fixture_first`') &&
      report.includes('Use W400 Wholesale Janitorial Source-Pack Readiness Review and Second-Fixture Decision Gate as the locked readiness baseline'),
    JSON.stringify({ w400: w400Report.slice(0, 2200), report: report.slice(0, 1600) }, null, 2));

  assertCase(results, 'w401-w399-brightline-baseline-preserved',
    w399Report.includes('W399 Wholesale Janitorial fixture story proof harness: 16/16 passed') &&
      w399Report.includes('Brightline Facility Supply') &&
      report.includes('Brightline Facility Supply remains the first fixture baseline'),
    w399Report.slice(0, 2200));

  assertCase(results, 'w401-w398-expansion-baseline-preserved',
    w398Report.includes('W398 fixture-first expansion restart after Building Materials package harness: 15/15 passed') &&
      w398Report.includes('Wholesale Janitorial & Facility Supply / Contract Replenishment') &&
      report.includes('W398 expansion restart remains locked'),
    w398Report.slice(0, 2200));

  assertCase(results, 'w401-w397-and-w386-packages-preserved',
    exists(w397PackageDir) &&
      exists(w397PackageZip) &&
      exists(w386PackageDir) &&
      exists(w386PackageZip) &&
      w397Report.includes('W397 Building Materials readiness delta package harness: 13/13 passed') &&
      report.includes('Do not mutate W397 or W386 packages'),
    JSON.stringify({ w397PackageDir, w397PackageZip, w386PackageDir, w386PackageZip }, null, 2));

  assertCase(results, 'w401-no-live-smoke-no-upload-no-package-boundary',
    report.includes('No live smoke in W401') &&
      report.includes('No upload or deployment') &&
      report.includes('No runtime upload package creation') &&
      report.includes('Do not create a new package in W401'),
    report.slice(0, 3200));

  assertCase(results, 'w401-second-fixture-story-distinctness',
    report.includes('MetroCare Janitorial Supply') &&
      report.includes('office parks, healthcare offices, schools, and property managers') &&
      storyTerms.every((term) => report.includes(term)),
    JSON.stringify(storyTerms, null, 2));

  assertCase(results, 'w401-proof-role-coverage',
    proofRoles.every((role) => report.includes(role)) &&
      fixtureProofNames.every((name) => report.includes(name)),
    JSON.stringify({ proofRoles, fixtureProofNames }, null, 2));

  assertCase(results, 'w401-two-fixture-pattern-confirmed',
    report.includes('Brightline and MetroCare both preserve the contract replenishment shape') &&
      report.includes('contract customer, recurring order, facility/location availability, preferred/substitute item, backorder/replenishment, and route/delivery readiness') &&
      report.includes('does not collapse into generic customer, item availability, and replenishment'),
    report.slice(0, 7000));

  assertCase(results, 'w401-readiness-decision-updated',
    report.includes('Readiness decision: `ready_for_scoped_source_pack_cleanup`') &&
      report.includes('Recommended next block: scoped Wholesale Janitorial source-pack cleanup') &&
      report.includes('Do not create the source pack in W401'),
    report.slice(0, 7600));

  assertCase(results, 'w401-roi-run-claim-confidence-preserved',
    report.includes('ROI/Competitive remains flow-based') &&
      report.includes('Run/Open-link authority remains verified-import-only') &&
      report.includes('Measured savings require a customer baseline') &&
      report.includes('Competitive pressure remains advisory-only unless confirmed') &&
      report.includes('public website/category evidence, messy notes, advisory inference, build/import proof, and Open-link authority remain separated') &&
      report.includes('N/LLM remains advisory-only'),
    report.slice(0, 9600));

  assertCase(results, 'w401-manufacturing-wip-default-off-posture',
    report.includes('Manufacturing/WIP default: off') &&
      report.includes('Wholesale Janitorial should not invite Manufacturing/WIP by default') &&
      report.includes('Do not weaken W393 WIP best-effort diagnostics'),
    report.slice(0, 10200));

  assertCase(results, 'w401-cross-lane-anti-leak-wording',
    antiLeakTerms.every((term) => report.includes(term)) &&
      report.includes('Do not collapse Wholesale Janitorial into generic Industrial Distribution') &&
      report.includes('Do not leak Building Materials, Dealer Hardgoods, Apparel/Retail, Parts/Service, Medical/Dental, Life Sciences, Food/Beverage, or Industrial Equipment wording without evidence'),
    JSON.stringify(antiLeakTerms, null, 2));

  assertCase(results, 'w401-no-source-pack-mutation',
    report.includes('No source-pack mutation was made in W401') &&
      report.includes('Do not add Wholesale Janitorial to runtime source packs in W401') &&
      report.includes('No runner, adapter, record creation, import validation, or Open-link authority changes'),
    report.slice(-6000));

  assertCase(results, 'w401-preservation-scripts-registered',
    typeof scripts['harness:wholesale-janitorial-second-fixture-decision-w401'] === 'string' &&
      typeof scripts['harness:wholesale-janitorial-source-pack-readiness-decision-w400'] === 'string' &&
      typeof scripts['harness:wholesale-janitorial-fixture-story-proof-w399'] === 'string' &&
      typeof scripts['harness:fixture-first-expansion-restart-after-building-materials-package-w398'] === 'string' &&
      typeof scripts['harness:building-materials-readiness-delta-package-w397'] === 'string' &&
      typeof scripts['harness:pack-ready-artifact-package-w386'] === 'string',
    JSON.stringify({
      w401: scripts['harness:wholesale-janitorial-second-fixture-decision-w401'],
      w400: scripts['harness:wholesale-janitorial-source-pack-readiness-decision-w400'],
      w399: scripts['harness:wholesale-janitorial-fixture-story-proof-w399'],
      w398: scripts['harness:fixture-first-expansion-restart-after-building-materials-package-w398'],
      w397: scripts['harness:building-materials-readiness-delta-package-w397'],
      w386: scripts['harness:pack-ready-artifact-package-w386']
    }, null, 2));

  assertCase(results, 'w401-no-regression-gates',
    report.includes('W401 no-regression gates passed') &&
      report.includes('No live smoke') &&
      report.includes('No upload or deployment') &&
      report.includes('No package mutation') &&
      report.includes('No source-pack mutation'),
    report.slice(-5200));

  printResults('W401 Wholesale Janitorial second fixture decision harness', results);
}

main();
