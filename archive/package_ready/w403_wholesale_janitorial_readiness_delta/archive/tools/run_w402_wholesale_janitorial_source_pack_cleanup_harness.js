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
const reportPath = path.join(root, 'archive', 'reports', 'w402_wholesale_janitorial_source_pack_cleanup.md');
const w401ReportPath = path.join(root, 'archive', 'reports', 'w401_wholesale_janitorial_second_fixture_decision.md');
const w400ReportPath = path.join(root, 'archive', 'reports', 'w400_wholesale_janitorial_source_pack_readiness_decision.md');
const w399ReportPath = path.join(root, 'archive', 'reports', 'w399_wholesale_janitorial_fixture_story_proof.md');
const w398ReportPath = path.join(root, 'archive', 'reports', 'w398_fixture_first_expansion_restart_after_building_materials_package.md');
const w397PackageDir = path.join(root, 'archive', 'package_ready', 'w397_building_materials_readiness_delta');
const w397PackageZip = path.join(root, 'archive', 'package_ready', 'w397_building_materials_readiness_delta.zip');
const w386PackageDir = path.join(root, 'archive', 'package_ready', 'w386_forge_source_pack_ready_artifact');
const w386PackageZip = path.join(root, 'archive', 'package_ready', 'w386_forge_source_pack_ready_artifact.zip');

const websiteSignals = [
  'janitorial supply',
  'facility supply',
  'facility maintenance',
  'restroom paper',
  'soaps',
  'cleaning chemicals',
  'floor care',
  'liners',
  'dispensers',
  'gloves',
  'safety supplies',
  'property management',
  'schools',
  'healthcare offices',
  'contract replenishment',
  'recurring order',
  'route delivery',
  'substitute product',
  'backorder',
  'replenishment cadence',
  'contracted pricing',
  'preferred items'
];

const evidenceSignals = [
  'contract customer demand',
  'recurring order readiness',
  'facility/location supply availability',
  'preferred item or contracted item context',
  'substitute product readiness',
  'backorder exposure',
  'replenishment cadence',
  'route/delivery readiness',
  'margin leakage',
  'customer promise confidence',
  'contracted pricing context'
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
  'dealer_availability_or_channel_fulfillment_without_dealer_evidence',
  'style_matrix_or_store_ecommerce_without_retail_evidence',
  'work_order_or_dispatch_without_parts_service_evidence',
  'clinic_supply_substitute_without_medical_dental_evidence',
  'lot_release_or_qa_validation_without_life_sciences_evidence',
  'food_formula_or_batch_without_food_evidence',
  'configured_equipment_assembly_without_industrial_evidence',
  'manufacturing_routing_or_wip_without_explicit_manufacturing_evidence'
];

const forbiddenVocabulary = [
  'contractor job order',
  'will-call pickup',
  'jobsite delivery',
  'dealer allocation',
  'channel fulfillment',
  'style/color/size',
  'store/ecommerce promise',
  'technician truck stock',
  'first-time fix',
  'clinic supply substitutes',
  'QA release',
  'lot/release readiness',
  'validation documentation',
  'traceability',
  'food batch',
  'ingredient readiness',
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
  const w401Report = exists(w401ReportPath) ? read(w401ReportPath) : '';
  const w400Report = exists(w400ReportPath) ? read(w400ReportPath) : '';
  const w399Report = exists(w399ReportPath) ? read(w399ReportPath) : '';
  const w398Report = exists(w398ReportPath) ? read(w398ReportPath) : '';
  const scripts = packageJson().scripts || {};
  const janitorialPack = packById('wholesale-janitorial-contract-replenishment');
  const janitorialText = packText(janitorialPack);
  const brightlineResolution = resolveLanePackFromEvidence({
    website: 'https://www.brightlinefacilitysupply.com',
    categoryText: 'wholesale janitorial facility supply janitorial supplies paper products cleaning chemicals dispensers trash liners safety supplies contract replenishment recurring order route delivery substitute product backorder replenishment cadence preferred items',
    evidenceText: 'contract customer demand recurring order readiness facility/location supply availability preferred item or contracted item context substitute product readiness backorder exposure replenishment cadence route/delivery readiness margin leakage customer promise confidence'
  });
  const metrocareResolution = resolveLanePackFromEvidence({
    website: 'https://www.metrocarejanitorialsupply.com',
    categoryText: 'facility supply facility maintenance restroom paper soaps cleaning chemicals floor care liners dispensers gloves safety supplies property management schools healthcare offices contract replenishment recurring order route delivery contracted pricing preferred items',
    evidenceText: 'contract customer demand recurring order readiness facility/location supply availability preferred item or contracted item context substitute product readiness backorder exposure replenishment cadence route/delivery readiness margin leakage customer promise confidence contracted pricing context'
  });
  const weakResolution = resolveLanePackFromEvidence({
    website: 'https://example.invalid',
    categoryText: 'maybe supplies',
    evidenceText: 'customer needs things',
    signals: []
  });
  const storySurface = consultantStorySurfaceFromLanePack({
    website: 'https://www.metrocarejanitorialsupply.com',
    categoryText: 'facility supply janitorial supplies contract replenishment recurring order route delivery substitute product backorder replenishment cadence contracted pricing preferred items',
    evidenceText: 'contract customer demand recurring order readiness facility/location supply availability preferred item or contracted item context substitute product readiness backorder exposure route/delivery readiness margin leakage customer promise confidence'
  }, janitorialPack, { displayReadyRecords: [] });
  const allPacksValid = LANE_PACKS.every((pack) => validateLanePack(pack).valid);

  assertCase(results, 'w402-w401-two-fixture-baseline-preserved',
    w401Report.includes('W401 Wholesale Janitorial second fixture decision harness: 15/15 passed') &&
      w401Report.includes('Readiness decision: `ready_for_scoped_source_pack_cleanup`') &&
      w401Report.includes('MetroCare Janitorial Supply') &&
      report.includes('Use W401 Wholesale Janitorial Second Fixture Proof and Source-Pack Cleanup Decision as the locked two-fixture readiness baseline'),
    JSON.stringify({ w401: w401Report.slice(0, 2400), report: report.slice(0, 1800) }, null, 2));

  assertCase(results, 'w402-w399-brightline-baseline-preserved',
    w399Report.includes('W399 Wholesale Janitorial fixture story proof harness: 16/16 passed') &&
      w399Report.includes('Brightline Facility Supply') &&
      report.includes('Brightline Facility Supply remains the first fixture baseline'),
    w399Report.slice(0, 2600));

  assertCase(results, 'w402-w400-readiness-decision-preserved',
    w400Report.includes('Readiness decision: `needs_second_fixture_first`') &&
      w400Report.includes('Recommended next block: run one more fixture-first Wholesale Janitorial proof before source-pack mutation') &&
      report.includes('W400 remains preserved as the historical second-fixture decision gate'),
    w400Report.slice(0, 2600));

  assertCase(results, 'w402-source-pack-present-and-valid',
    !!janitorialPack &&
      janitorialPack.laneId === 'wholesale_janitorial' &&
      janitorialPack.packId === 'wholesale-janitorial-contract-replenishment' &&
      janitorialPack.label === 'Wholesale Janitorial Contract Replenishment' &&
      janitorialPack.operatingMode === 'distribution_replenishment' &&
      validateLanePack(janitorialPack).valid === true &&
      allPacksValid &&
      report.includes('Wholesale Janitorial readiness status: `ready_now`'),
    JSON.stringify({ janitorialPack, validation: janitorialPack && validateLanePack(janitorialPack), packCount: LANE_PACKS.length }, null, 2));

  assertCase(results, 'w402-website-and-evidence-signal-coverage',
    includesAll(janitorialText, websiteSignals) &&
      includesAll(janitorialText, evidenceSignals) &&
      websiteSignals.every((term) => report.includes(term)) &&
      evidenceSignals.every((term) => report.includes(term)),
    JSON.stringify({ websiteSignals, evidenceSignals, janitorialText }, null, 2));

  assertCase(results, 'w402-required-and-optional-proof-role-coverage',
    requiredRoles.every((role) => janitorialPack.recordRoles.required.includes(role)) &&
      optionalRoles.every((role) => janitorialPack.recordRoles.optional.includes(role)) &&
      requiredRoles.every((role) => report.includes(role)) &&
      optionalRoles.every((role) => report.includes(role)),
    JSON.stringify({ required: janitorialPack.recordRoles.required, optional: janitorialPack.recordRoles.optional }, null, 2));

  assertCase(results, 'w402-anti-leak-role-and-vocabulary-coverage',
    antiLeakRoles.every((role) => janitorialPack.recordRoles.invalid.includes(role)) &&
      includesAll(janitorialText, forbiddenVocabulary) &&
      antiLeakRoles.every((role) => report.includes(role)) &&
      forbiddenVocabulary.every((term) => report.includes(term)),
    JSON.stringify({ invalid: janitorialPack.recordRoles.invalid, forbidden: janitorialPack.vocabulary.forbidden }, null, 2));

  assertCase(results, 'w402-lane-pack-resolution-safety',
    brightlineResolution.status === 'resolved' &&
      metrocareResolution.status === 'resolved' &&
      brightlineResolution.packId === 'wholesale-janitorial-contract-replenishment' &&
      metrocareResolution.packId === 'wholesale-janitorial-contract-replenishment' &&
      weakResolution.status !== 'resolved' &&
      report.includes('Weak or generic supply evidence does not resolve as Wholesale Janitorial'),
    JSON.stringify({ brightlineResolution, metrocareResolution, weakResolution }, null, 2));

  assertCase(results, 'w402-existing-lane-fit-safety',
    metrocareResolution.packId !== 'industrial-distributor' &&
      metrocareResolution.packId !== 'building-materials-contractor-supply-project-fulfillment' &&
      metrocareResolution.packId !== 'dealer-hardgoods' &&
      report.includes('Generic Industrial Distribution remains adjacent but is not selected for Brightline or MetroCare evidence') &&
      report.includes('Building Materials is not used for Wholesale Janitorial evidence'),
    JSON.stringify({ metrocareResolution, brightlineResolution }, null, 2));

  assertCase(results, 'w402-consultant-story-surface-safety',
    storySurface.status === 'story_ready_without_open_target' &&
      /contract account|recurring order|facility|substitute|backorder|route|delivery|margin/i.test(JSON.stringify(storySurface)) &&
      !/guarantee|guaranteed|measured roi|will increase/i.test([
        storySurface.proofMove,
        storySurface.safeClaim,
        storySurface.buyerFacingSoWhat,
        storySurface.competitiveContrast
      ].join(' ')) &&
      /Do not claim .*measured ROI without evidence/i.test(storySurface.doNotClaim || ''),
    JSON.stringify(storySurface, null, 2));

  assertCase(results, 'w402-manufacturing-wip-default-off-posture',
    report.includes('Manufacturing/WIP default: off') &&
      report.includes('Wholesale Janitorial should not invite Manufacturing/WIP by default') &&
      report.includes('Do not weaken W393 WIP best-effort diagnostics') &&
      janitorialPack.operatingMode === 'distribution_replenishment',
    report.slice(0, 10000));

  assertCase(results, 'w402-roi-run-claim-confidence-preserved',
    report.includes('ROI/Competitive remains flow-based') &&
      report.includes('Run/Open-link authority remains verified-import-only') &&
      report.includes('Measured savings require a customer baseline') &&
      report.includes('Competitive pressure remains advisory-only unless confirmed') &&
      report.includes('public website/category evidence resolves pack confidence') &&
      report.includes('messy notes shape pain, ROI, objections, and run coaching') &&
      report.includes('N/LLM remains advisory-only') &&
      report.includes('Open links remain verified-import-only'),
    report.slice(0, 12000));

  assertCase(results, 'w402-w397-and-w386-packages-preserved',
    exists(w397PackageDir) &&
      exists(w397PackageZip) &&
      exists(w386PackageDir) &&
      exists(w386PackageZip) &&
      report.includes('Do not mutate W397 or W386 packages') &&
      report.includes('W397 and W386 packages were not mutated'),
    JSON.stringify({ w397PackageDir, w397PackageZip, w386PackageDir, w386PackageZip }, null, 2));

  assertCase(results, 'w402-no-live-smoke-no-upload-boundary',
    report.includes('No live smoke in W402') &&
      report.includes('No upload or deployment') &&
      report.includes('No runtime upload package creation') &&
      report.includes('No fake Open links'),
    report.slice(0, 5000));

  assertCase(results, 'w402-preservation-scripts-registered',
    typeof scripts['harness:wholesale-janitorial-source-pack-cleanup-w402'] === 'string' &&
      typeof scripts['harness:wholesale-janitorial-second-fixture-decision-w401'] === 'string' &&
      typeof scripts['harness:wholesale-janitorial-source-pack-readiness-decision-w400'] === 'string' &&
      typeof scripts['harness:wholesale-janitorial-fixture-story-proof-w399'] === 'string' &&
      typeof scripts['harness:fixture-first-expansion-restart-after-building-materials-package-w398'] === 'string' &&
      typeof scripts['harness:building-materials-readiness-delta-package-w397'] === 'string' &&
      typeof scripts['harness:pack-ready-artifact-package-w386'] === 'string',
    JSON.stringify({
      w402: scripts['harness:wholesale-janitorial-source-pack-cleanup-w402'],
      w401: scripts['harness:wholesale-janitorial-second-fixture-decision-w401'],
      w400: scripts['harness:wholesale-janitorial-source-pack-readiness-decision-w400'],
      w399: scripts['harness:wholesale-janitorial-fixture-story-proof-w399'],
      w398: scripts['harness:fixture-first-expansion-restart-after-building-materials-package-w398'],
      w397: scripts['harness:building-materials-readiness-delta-package-w397'],
      w386: scripts['harness:pack-ready-artifact-package-w386']
    }, null, 2));

  assertCase(results, 'w402-no-regression-gates',
    report.includes('No runner, adapter, record creation, import validation, or Open-link authority changes') &&
      report.includes('No broad source-pack abstractions') &&
      report.includes('completed-result import validation was not changed') &&
      report.includes('W402 no-regression gates passed'),
    report.slice(-6000));

  printResults('W402 Wholesale Janitorial source-pack cleanup harness', results);
}

main();
