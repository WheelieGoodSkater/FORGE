#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const {
  assertCase,
  printResults
} = require('./lib/forge_harness_fixtures');

const root = path.resolve(__dirname, '..', '..');
const reportPath = path.join(root, 'archive', 'reports', 'w400_wholesale_janitorial_source_pack_readiness_decision.md');
const w399ReportPath = path.join(root, 'archive', 'reports', 'w399_wholesale_janitorial_fixture_story_proof.md');
const w398ReportPath = path.join(root, 'archive', 'reports', 'w398_fixture_first_expansion_restart_after_building_materials_package.md');
const w397ReportPath = path.join(root, 'archive', 'reports', 'w397_building_materials_readiness_delta_package.md');
const w396ReportPath = path.join(root, 'archive', 'reports', 'w396_building_materials_pack_readiness.md');
const w386PackageDir = path.join(root, 'archive', 'package_ready', 'w386_forge_source_pack_ready_artifact');
const w386PackageZip = path.join(root, 'archive', 'package_ready', 'w386_forge_source_pack_ready_artifact.zip');
const w397PackageDir = path.join(root, 'archive', 'package_ready', 'w397_building_materials_readiness_delta');
const w397PackageZip = path.join(root, 'archive', 'package_ready', 'w397_building_materials_readiness_delta.zip');

const sourceSignals = [
  'wholesale janitorial',
  'facility supply',
  'janitorial supplies',
  'paper products',
  'cleaning chemicals',
  'dispensers',
  'trash liners',
  'safety supplies',
  'contract customer',
  'recurring orders',
  'facility locations',
  'route delivery',
  'backorders',
  'substitute products',
  'replenishment cadence'
];

const evidenceSignals = [
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

const requiredRoles = [
  'customer',
  'contract_account',
  'recurring_order',
  'facility_item_availability'
];

const optionalRoles = [
  'preferred_or_substitute_item',
  'backorder_or_replenishment_status',
  'route_or_delivery_readiness',
  'margin_context',
  'customer_promise_context',
  'contract_pricing_context'
];

const antiLeakRoles = [
  'contractor_job_order_without_building_materials_evidence',
  'will_call_or_jobsite_delivery_without_building_materials_evidence',
  'dealer_allocation_or_channel_fulfillment_without_dealer_evidence',
  'style_matrix_or_size_color_variant_without_apparel_evidence',
  'technician_truck_stock_or_work_order_without_parts_service_evidence',
  'clinic_supply_or_dental_equipment_without_medical_dental_evidence',
  'lot_release_or_qa_validation_without_life_sciences_evidence',
  'food_formula_or_batch_without_food_evidence',
  'configured_equipment_assembly_or_wip_without_industrial_evidence'
];

const forbiddenVocabulary = [
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
  const w399Report = exists(w399ReportPath) ? read(w399ReportPath) : '';
  const w398Report = exists(w398ReportPath) ? read(w398ReportPath) : '';
  const w397Report = exists(w397ReportPath) ? read(w397ReportPath) : '';
  const w396Report = exists(w396ReportPath) ? read(w396ReportPath) : '';
  const scripts = packageJson().scripts || {};

  assertCase(results, 'w400-w399-fixture-baseline-preserved',
    w399Report.includes('W399 Wholesale Janitorial fixture story proof harness: 16/16 passed') &&
      w399Report.includes('Brightline Facility Supply') &&
      report.includes('Use W399 Wholesale Janitorial Fixture-First Story Proof and Cross-Lane Validation as the locked fixture-story baseline'),
    JSON.stringify({ w399: w399Report.slice(0, 2200), report: report.slice(0, 1600) }, null, 2));

  assertCase(results, 'w400-w398-expansion-baseline-preserved',
    w398Report.includes('W398 fixture-first expansion restart after Building Materials package harness: 15/15 passed') &&
      w398Report.includes('Wholesale Janitorial & Facility Supply / Contract Replenishment') &&
      report.includes('Keep W398 fixture-first expansion restart locked'),
    w398Report.slice(0, 2200));

  assertCase(results, 'w400-w397-package-baseline-preserved',
    exists(w397PackageDir) &&
      exists(w397PackageZip) &&
      w397Report.includes('W397 Building Materials readiness delta package harness: 13/13 passed') &&
      report.includes('Do not mutate W397 or W386 packages'),
    JSON.stringify({ w397PackageDir, w397PackageZip }, null, 2));

  assertCase(results, 'w400-w396-building-materials-readiness-preserved',
    w396Report.includes('Building Materials readiness status: `ready_now`') &&
      w396Report.includes('W396 Building Materials pack-readiness harness: 16/16 passed') &&
      report.includes('Building Materials remains the locked ready lane baseline'),
    w396Report.slice(0, 2200));

  assertCase(results, 'w400-w386-package-preserved',
    exists(w386PackageDir) &&
      exists(w386PackageZip) &&
      report.includes('W386 source-pack readiness package remains untouched'),
    JSON.stringify({ w386PackageDir, w386PackageZip }, null, 2));

  assertCase(results, 'w400-no-live-smoke-no-upload-no-package-boundary',
    report.includes('No live smoke in W400') &&
      report.includes('No upload or deployment') &&
      report.includes('No runtime upload package creation') &&
      report.includes('Do not create a new package in W400'),
    report.slice(0, 3200));

  assertCase(results, 'w400-source-pack-readiness-decision-documented',
    report.includes('Readiness decision: `needs_second_fixture_first`') &&
      report.includes('Recommended next block: run one more fixture-first Wholesale Janitorial proof before source-pack mutation') &&
      report.includes('Do not create the source pack in W400'),
    report.slice(0, 5200));

  assertCase(results, 'w400-existing-lane-fit-reviewed',
    report.includes('Existing-lane fit reviewed') &&
      report.includes('generic Industrial Distribution') &&
      report.includes('cannot safely host the story without losing contract customer, recurring order, route/delivery, and preferred/substitute item specificity') &&
      report.includes('distribution variant remains possible only if the second fixture collapses back to generic customer, item availability, and replenishment'),
    report.slice(0, 7600));

  assertCase(results, 'w400-source-signal-coverage-reviewed',
    sourceSignals.every((term) => report.includes(term)) &&
      evidenceSignals.every((term) => report.includes(term)),
    JSON.stringify({ sourceSignals, evidenceSignals }, null, 2));

  assertCase(results, 'w400-proof-role-coverage-reviewed',
    requiredRoles.every((role) => report.includes(role)) &&
      optionalRoles.every((role) => report.includes(role)),
    JSON.stringify({ requiredRoles, optionalRoles }, null, 2));

  assertCase(results, 'w400-anti-leak-reviewed',
    antiLeakRoles.every((role) => report.includes(role)) &&
      forbiddenVocabulary.every((term) => report.includes(term)),
    JSON.stringify({ antiLeakRoles, forbiddenVocabulary }, null, 2));

  assertCase(results, 'w400-manufacturing-wip-default-off-posture',
    report.includes('Manufacturing/WIP default: off') &&
      report.includes('Wholesale Janitorial should not invite Manufacturing/WIP by default') &&
      report.includes('Do not weaken W393 WIP best-effort diagnostics'),
    report.slice(0, 9000));

  assertCase(results, 'w400-roi-run-claim-confidence-preserved',
    report.includes('ROI/Competitive remains flow-based') &&
      report.includes('Run/Open-link authority remains verified-import-only') &&
      report.includes('Measured savings require a customer baseline') &&
      report.includes('Competitive pressure remains advisory-only unless confirmed') &&
      report.includes('public website/category evidence, messy notes, advisory inference, build/import proof, and Open-link authority remain separated') &&
      report.includes('N/LLM remains advisory-only'),
    report.slice(0, 11000));

  assertCase(results, 'w400-no-source-pack-mutation',
    report.includes('No source-pack mutation was made in W400') &&
      report.includes('Do not add Wholesale Janitorial to runtime source packs in W400') &&
      report.includes('No runner, adapter, record creation, import validation, or Open-link authority changes'),
    report.slice(-6000));

  assertCase(results, 'w400-preservation-scripts-registered',
    typeof scripts['harness:wholesale-janitorial-source-pack-readiness-decision-w400'] === 'string' &&
      typeof scripts['harness:wholesale-janitorial-fixture-story-proof-w399'] === 'string' &&
      typeof scripts['harness:fixture-first-expansion-restart-after-building-materials-package-w398'] === 'string' &&
      typeof scripts['harness:building-materials-readiness-delta-package-w397'] === 'string' &&
      typeof scripts['harness:building-materials-pack-readiness-w396'] === 'string' &&
      typeof scripts['harness:pack-ready-artifact-package-w386'] === 'string',
    JSON.stringify({
      w400: scripts['harness:wholesale-janitorial-source-pack-readiness-decision-w400'],
      w399: scripts['harness:wholesale-janitorial-fixture-story-proof-w399'],
      w398: scripts['harness:fixture-first-expansion-restart-after-building-materials-package-w398'],
      w397: scripts['harness:building-materials-readiness-delta-package-w397'],
      w396: scripts['harness:building-materials-pack-readiness-w396'],
      w386: scripts['harness:pack-ready-artifact-package-w386']
    }, null, 2));

  assertCase(results, 'w400-no-regression-gates',
    report.includes('W400 no-regression gates passed') &&
      report.includes('No live smoke') &&
      report.includes('No upload or deployment') &&
      report.includes('No package mutation') &&
      report.includes('No source-pack mutation'),
    report.slice(-5200));

  printResults('W400 Wholesale Janitorial source-pack readiness decision harness', results);
}

main();
