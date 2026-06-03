#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const {
  assertCase,
  printResults
} = require('./lib/forge_harness_fixtures');

const root = path.resolve(__dirname, '..', '..');
const reportPath = path.join(root, 'archive', 'reports', 'w406_hvac_mechanical_second_fixture_decision.md');
const w405ReportPath = path.join(root, 'archive', 'reports', 'w405_hvac_mechanical_fixture_story_proof.md');
const w404ReportPath = path.join(root, 'archive', 'reports', 'w404_hvac_mechanical_fixture_first_selection.md');
const w403ReportPath = path.join(root, 'archive', 'reports', 'w403_wholesale_janitorial_readiness_delta_package.md');
const w402ReportPath = path.join(root, 'archive', 'reports', 'w402_wholesale_janitorial_source_pack_cleanup.md');
const w397PackageDir = path.join(root, 'archive', 'package_ready', 'w397_building_materials_readiness_delta');
const w397PackageZip = path.join(root, 'archive', 'package_ready', 'w397_building_materials_readiness_delta.zip');
const w403PackageDir = path.join(root, 'archive', 'package_ready', 'w403_wholesale_janitorial_readiness_delta');
const w403PackageZip = path.join(root, 'archive', 'package_ready', 'w403_wholesale_janitorial_readiness_delta.zip');

const storyTerms = [
  'contractor account demand',
  'job or service order readiness',
  'HVAC equipment availability',
  'replacement/service part availability',
  'branch/location stock',
  'reserved inventory risk',
  'substitute option',
  'warranty/replacement context',
  'backorder/replenishment status',
  'pickup or jobsite delivery readiness',
  'install/service promise confidence',
  'margin leakage',
  'refrigerant caution'
];

const proofRoles = [
  'customer / contractor account',
  'job_or_service_order',
  'hvac_equipment_availability',
  'replacement_or_service_part',
  'branch_location_stock',
  'reserved_or_substitute_option',
  'warranty_or_replacement_context',
  'backorder_or_replenishment_status',
  'pickup_or_jobsite_delivery'
];

const fixtureProofNames = [
  'Horizon Contractor Account',
  'Horizon Job or Service Order',
  'Horizon HVAC Equipment Availability',
  'Horizon Replacement Part Availability',
  'Horizon Branch Stock',
  'Horizon Reserved Substitute Option',
  'Horizon Warranty Replacement Context',
  'Horizon Backorder Replenishment Status',
  'Horizon Pickup Delivery Readiness'
];

const comparisonLanes = [
  'Building Materials',
  'Parts/Service',
  'Industrial Distribution',
  'Wholesale Janitorial',
  'Dealer Hardgoods',
  'Apparel/Retail',
  'Medical/Dental',
  'Life Sciences',
  'Food/Beverage',
  'Industrial Equipment'
];

const antiLeakTerms = [
  'lumber',
  'doors',
  'windows',
  'special order materials',
  'contract replenishment',
  'recurring order',
  'route delivery readiness',
  'restroom paper',
  'cleaning chemicals',
  'dealer allocation',
  'channel fulfillment',
  'style/color/size variants',
  'store/ecommerce promise',
  'clinic supply substitutes',
  'compliance-sensitive items',
  'QA release',
  'lot/release readiness',
  'expiration',
  'validation documentation',
  'traceability',
  'food batch',
  'ingredient readiness',
  'packaging readiness',
  'configured assembly',
  'engineering BOM',
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
  const w405Report = exists(w405ReportPath) ? read(w405ReportPath) : '';
  const w404Report = exists(w404ReportPath) ? read(w404ReportPath) : '';
  const w403Report = exists(w403ReportPath) ? read(w403ReportPath) : '';
  const w402Report = exists(w402ReportPath) ? read(w402ReportPath) : '';
  const scripts = packageJson().scripts || {};

  assertCase(results, 'w406-w405-first-fixture-baseline-preserved',
    w405Report.includes('W405 HVAC/Mechanical fixture story proof harness: 15/15 passed') &&
      w405Report.includes('Summit Mechanical Supply') &&
      report.includes('Use W405 HVAC / Mechanical Contractor Supply Fixture-First Story Proof as the locked first-fixture baseline'),
    JSON.stringify({ w405: w405Report.slice(0, 2600), report: report.slice(0, 1600) }, null, 2));

  assertCase(results, 'w406-w404-selection-baseline-preserved',
    w404Report.includes('W404 HVAC/Mechanical fixture-first selection harness: 15/15 passed') &&
      w404Report.includes('Recommendation: proceed with HVAC / Mechanical Contractor Supply & Service Readiness as the next fixture-first lane') &&
      report.includes('W404 HVAC fixture-first selection remains locked'),
    w404Report.slice(0, 2600));

  assertCase(results, 'w406-w403-package-baseline-preserved',
    exists(w403PackageDir) &&
      exists(w403PackageZip) &&
      w403Report.includes('W403 Wholesale Janitorial readiness delta package harness: 13/13 passed') &&
      report.includes('Do not mutate W403, W397, or W386 packages'),
    JSON.stringify({ w403PackageDir, w403PackageZip }, null, 2));

  assertCase(results, 'w406-w402-wholesale-janitorial-readiness-preserved',
    w402Report.includes('Wholesale Janitorial readiness status: `ready_now`') &&
      w402Report.includes('W402 Wholesale Janitorial source-pack cleanup harness: 16/16 passed') &&
      report.includes('Wholesale Janitorial remains source-pack-ready'),
    w402Report.slice(0, 2600));

  assertCase(results, 'w406-w397-package-preserved',
    exists(w397PackageDir) &&
      exists(w397PackageZip) &&
      report.includes('Do not mutate W403, W397, or W386 packages'),
    JSON.stringify({ w397PackageDir, w397PackageZip }, null, 2));

  assertCase(results, 'w406-no-live-smoke-no-upload-no-package-boundary',
    report.includes('No live smoke in W406') &&
      report.includes('No upload or deployment') &&
      report.includes('No runtime upload package creation') &&
      report.includes('Do not create a new package in W406'),
    report.slice(0, 3600));

  assertCase(results, 'w406-second-fixture-story-distinctness',
    report.includes('Horizon Air & Mechanical Supply') &&
      report.includes('condensers') &&
      report.includes('air handlers') &&
      report.includes('motors') &&
      report.includes('belts') &&
      report.includes('filters') &&
      report.includes('thermostats') &&
      report.includes('refrigerant') &&
      storyTerms.every((term) => report.includes(term)),
    JSON.stringify(storyTerms, null, 2));

  assertCase(results, 'w406-proof-role-coverage',
    proofRoles.every((role) => report.includes(role)) &&
      fixtureProofNames.every((name) => report.includes(name)),
    JSON.stringify({ proofRoles, fixtureProofNames }, null, 2));

  assertCase(results, 'w406-two-fixture-pattern-confirmed',
    report.includes('Summit and Horizon both preserve the HVAC contractor supply shape') &&
      report.includes('equipment availability, replacement/service part availability, branch/location stock, warranty/replacement context, backorder/replenishment status, and pickup/jobsite delivery readiness') &&
      report.includes('does not collapse into generic item availability, branch stock, and replenishment'),
    report.slice(0, 7600));

  assertCase(results, 'w406-source-pack-cleanup-decision-documented',
    report.includes('Readiness decision: `ready_for_scoped_source_pack_cleanup`') &&
      report.includes('Recommended next block: scoped HVAC source-pack readiness cleanup') &&
      report.includes('Do not create the source pack in W406'),
    report.slice(0, 8200));

  assertCase(results, 'w406-existing-lane-temporary-fit-safety',
    report.includes('Existing-lane fit reviewed') &&
      report.includes('Building Materials cannot safely host HVAC without losing equipment, replacement part, and warranty/replacement specificity') &&
      report.includes('Parts/Service cannot safely host HVAC unless the story becomes dispatch-first service operations') &&
      report.includes('Industrial Distribution cannot safely host HVAC unless the story collapses to generic item availability and replenishment'),
    report.slice(0, 9200));

  assertCase(results, 'w406-roi-competitive-flow-preserved',
    report.includes('Largest value to prove') &&
      report.includes('Discovery') &&
      report.includes('Proof move') &&
      report.includes('Competitive watch-out') &&
      report.includes('Claim caution') &&
      report.includes('measured savings require a customer baseline'),
    report.slice(0, 10400));

  assertCase(results, 'w406-run-open-link-authority-preserved',
    report.includes('Run path remains numbered and clickable only when verified Open-link authority exists') &&
      report.includes('Imported proof records remain collapsed by default') &&
      report.includes('Open-link authority remains verified-import-only') &&
      report.includes('No fake Open links'),
    report.slice(0, 11200));

  assertCase(results, 'w406-manufacturing-wip-default-off-posture',
    report.includes('Manufacturing/WIP remains off unless explicit fabrication/manufacturing evidence exists') &&
      report.includes('HVAC contractor supply should not invite Manufacturing/WIP by default') &&
      report.includes('Do not weaken W393 WIP best-effort diagnostics'),
    report.slice(0, 11800));

  assertCase(results, 'w406-cross-lane-anti-leak-wording',
    antiLeakTerms.every((term) => report.includes(term)) &&
      comparisonLanes.every((lane) => report.includes(lane)),
    JSON.stringify({ antiLeakTerms, comparisonLanes }, null, 2));

  assertCase(results, 'w406-claim-safety-confidence-separation',
    report.includes('Competitive pressure remains advisory-only unless confirmed') &&
      report.includes('No measured ROI without a customer-confirmed baseline') &&
      report.includes('N/LLM remains advisory-only') &&
      report.includes('public website/category evidence, messy notes, advisory inference, build/import proof, and Open-link authority remain separated'),
    report.slice(0, 12400));

  assertCase(results, 'w406-no-source-pack-mutation',
    report.includes('No source-pack mutation was made in W406') &&
      report.includes('Do not add HVAC to runtime source packs in W406') &&
      report.includes('second-fixture proof and decision gate only'),
    report.slice(0, 13000));

  assertCase(results, 'w406-preservation-scripts-registered',
    typeof scripts['harness:hvac-mechanical-second-fixture-decision-w406'] === 'string' &&
      typeof scripts['harness:hvac-mechanical-fixture-story-proof-w405'] === 'string' &&
      typeof scripts['harness:hvac-mechanical-fixture-first-selection-w404'] === 'string' &&
      typeof scripts['harness:wholesale-janitorial-readiness-delta-package-w403'] === 'string' &&
      typeof scripts['harness:wholesale-janitorial-source-pack-cleanup-w402'] === 'string',
    JSON.stringify({
      w406: scripts['harness:hvac-mechanical-second-fixture-decision-w406'],
      w405: scripts['harness:hvac-mechanical-fixture-story-proof-w405'],
      w404: scripts['harness:hvac-mechanical-fixture-first-selection-w404'],
      w403: scripts['harness:wholesale-janitorial-readiness-delta-package-w403'],
      w402: scripts['harness:wholesale-janitorial-source-pack-cleanup-w402']
    }, null, 2));

  assertCase(results, 'w406-no-regression-gates',
    report.includes('W406 no-regression gates passed') &&
      report.includes('No live smoke') &&
      report.includes('No upload or deployment') &&
      report.includes('No package mutation') &&
      report.includes('No source-pack mutation'),
    report.slice(-6600));

  printResults('W406 HVAC/Mechanical second fixture decision harness', results);
}

main();
