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
const reportPath = path.join(root, 'archive', 'reports', 'w407_hvac_mechanical_source_pack_cleanup.md');
const w406ReportPath = path.join(root, 'archive', 'reports', 'w406_hvac_mechanical_second_fixture_decision.md');
const w405ReportPath = path.join(root, 'archive', 'reports', 'w405_hvac_mechanical_fixture_story_proof.md');
const w404ReportPath = path.join(root, 'archive', 'reports', 'w404_hvac_mechanical_fixture_first_selection.md');
const w403PackageDir = path.join(root, 'archive', 'package_ready', 'w403_wholesale_janitorial_readiness_delta');
const w403PackageZip = path.join(root, 'archive', 'package_ready', 'w403_wholesale_janitorial_readiness_delta.zip');
const w397PackageDir = path.join(root, 'archive', 'package_ready', 'w397_building_materials_readiness_delta');
const w397PackageZip = path.join(root, 'archive', 'package_ready', 'w397_building_materials_readiness_delta.zip');
const w386PackageDir = path.join(root, 'archive', 'package_ready', 'w386_forge_source_pack_ready_artifact');
const w386PackageZip = path.join(root, 'archive', 'package_ready', 'w386_forge_source_pack_ready_artifact.zip');

const websiteSignals = [
  'HVAC supply',
  'mechanical supply',
  'HVAC equipment',
  'condensers',
  'air handlers',
  'motors',
  'belts',
  'filters',
  'thermostats',
  'duct parts',
  'refrigerant',
  'install supplies',
  'contractor supply',
  'service techs',
  'counter sales',
  'branch stock',
  'vendor portals',
  'replacement parts',
  'warranty replacement',
  'backorders',
  'replenishment',
  'pickup',
  'jobsite delivery'
];

const evidenceSignals = [
  'contractor account demand',
  'job quote readiness',
  'job or service order readiness',
  'HVAC equipment availability',
  'replacement/service part availability',
  'branch/location stock',
  'reserved inventory risk',
  'substitute option',
  'warranty/replacement context',
  'backorder/replenishment status',
  'pickup/jobsite delivery readiness',
  'install/service promise confidence',
  'margin leakage',
  'refrigerant caution'
];

const requiredRoles = [
  'customer',
  'contractor_account',
  'job_or_service_order',
  'hvac_equipment_availability',
  'replacement_or_service_part',
  'branch_location_stock'
];

const optionalRoles = [
  'reserved_or_substitute_option',
  'warranty_or_replacement_context',
  'backorder_or_replenishment_status',
  'pickup_or_jobsite_delivery',
  'install_service_promise_context',
  'margin_context',
  'refrigerant_or_regulated_item_caution'
];

const antiLeakRoles = [
  'building_materials_job_order_without_hvac_evidence',
  'wholesale_janitorial_contract_replenishment_without_janitorial_evidence',
  'dealer_allocation_or_channel_fulfillment_without_dealer_evidence',
  'style_matrix_or_store_ecommerce_without_retail_evidence',
  'dispatch_work_order_or_truck_stock_without_parts_service_evidence',
  'clinic_supply_substitute_without_medical_dental_evidence',
  'lot_release_or_qa_validation_without_life_sciences_evidence',
  'food_formula_or_batch_without_food_evidence',
  'configured_equipment_assembly_without_industrial_evidence',
  'manufacturing_routing_or_wip_without_explicit_manufacturing_evidence'
];

const forbiddenVocabulary = [
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
  'style/color/size',
  'store/ecommerce promise',
  'clinic supply substitutes',
  'QA release',
  'lot/release readiness',
  'validation documentation',
  'traceability',
  'food batch',
  'ingredient readiness',
  'packaging readiness',
  'configured equipment assembly',
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
  const w406Report = exists(w406ReportPath) ? read(w406ReportPath) : '';
  const w405Report = exists(w405ReportPath) ? read(w405ReportPath) : '';
  const w404Report = exists(w404ReportPath) ? read(w404ReportPath) : '';
  const scripts = packageJson().scripts || {};
  const hvacPack = packById('hvac-mechanical-contractor-supply-service-readiness');
  const hvacText = packText(hvacPack);
  const summitResolution = resolveLanePackFromEvidence({
    website: 'https://www.summitmechanicalsupply.com',
    categoryText: 'HVAC supply mechanical supply HVAC equipment filters thermostats duct parts refrigerant install supplies contractor supply service techs branch stock replacement parts warranty replacement backorders replenishment pickup jobsite delivery',
    evidenceText: 'contractor account demand job quote readiness HVAC equipment availability replacement/service part availability branch/location stock warranty/replacement context backorder/replenishment status pickup/jobsite delivery readiness install/service promise confidence margin leakage refrigerant caution'
  });
  const horizonResolution = resolveLanePackFromEvidence({
    website: 'https://www.horizonairmechanicalsupply.com',
    categoryText: 'HVAC equipment condensers air handlers motors belts filters thermostats duct parts refrigerant install supplies contractor supply service techs counter sales branch stock vendor portals replacement parts warranty replacement backorders pickup jobsite delivery',
    evidenceText: 'contractor account demand job or service order readiness HVAC equipment availability replacement/service part availability branch/location stock reserved inventory risk substitute option warranty/replacement context backorder/replenishment status pickup/jobsite delivery readiness install/service promise confidence margin leakage'
  });
  const weakResolution = resolveLanePackFromEvidence({
    website: 'https://example.invalid',
    categoryText: 'maybe equipment',
    evidenceText: 'customer needs parts',
    signals: []
  });
  const storySurface = consultantStorySurfaceFromLanePack({
    website: 'https://www.horizonairmechanicalsupply.com',
    categoryText: 'HVAC equipment condensers air handlers replacement parts warranty replacement backorders pickup jobsite delivery',
    evidenceText: 'contractor account demand job or service order readiness HVAC equipment availability replacement/service part availability branch/location stock substitute option warranty/replacement context backorder/replenishment status pickup/jobsite delivery readiness'
  }, hvacPack, { displayReadyRecords: [] });
  const allPacksValid = LANE_PACKS.every((pack) => validateLanePack(pack).valid);

  assertCase(results, 'w407-w406-two-fixture-baseline-preserved',
    w406Report.includes('W406 HVAC/Mechanical second fixture decision harness: 19/19 passed') &&
      w406Report.includes('Readiness decision: `ready_for_scoped_source_pack_cleanup`') &&
      w406Report.includes('Horizon Air & Mechanical Supply') &&
      report.includes('Use W406 HVAC / Mechanical Contractor Supply Second Fixture Decision Gate as the locked two-fixture readiness baseline'),
    JSON.stringify({ w406: w406Report.slice(0, 2600), report: report.slice(0, 1800) }, null, 2));

  assertCase(results, 'w407-w405-summit-baseline-preserved',
    w405Report.includes('W405 HVAC/Mechanical fixture story proof harness: 15/15 passed') &&
      w405Report.includes('Summit Mechanical Supply') &&
      report.includes('Summit Mechanical Supply remains the first fixture baseline'),
    w405Report.slice(0, 2600));

  assertCase(results, 'w407-w404-selection-baseline-preserved',
    w404Report.includes('W404 HVAC/Mechanical fixture-first selection harness: 15/15 passed') &&
      w404Report.includes('Recommendation: proceed with HVAC / Mechanical Contractor Supply & Service Readiness as the next fixture-first lane') &&
      report.includes('W404 remains preserved as the selection baseline'),
    w404Report.slice(0, 2600));

  assertCase(results, 'w407-source-pack-present-and-valid',
    !!hvacPack &&
      hvacPack.laneId === 'hvac_mechanical_supply' &&
      hvacPack.packId === 'hvac-mechanical-contractor-supply-service-readiness' &&
      hvacPack.label === 'HVAC Mechanical Contractor Supply & Service Readiness' &&
      hvacPack.operatingMode === 'distribution_replenishment' &&
      validateLanePack(hvacPack).valid === true &&
      allPacksValid &&
      report.includes('HVAC readiness status: `ready_now`'),
    JSON.stringify({ hvacPack, validation: hvacPack && validateLanePack(hvacPack), packCount: LANE_PACKS.length }, null, 2));

  assertCase(results, 'w407-website-and-evidence-signal-coverage',
    includesAll(hvacText, websiteSignals) &&
      includesAll(hvacText, evidenceSignals) &&
      websiteSignals.every((term) => report.includes(term)) &&
      evidenceSignals.every((term) => report.includes(term)),
    JSON.stringify({ websiteSignals, evidenceSignals, hvacText }, null, 2));

  assertCase(results, 'w407-required-and-optional-proof-role-coverage',
    requiredRoles.every((role) => hvacPack.recordRoles.required.includes(role)) &&
      optionalRoles.every((role) => hvacPack.recordRoles.optional.includes(role)) &&
      requiredRoles.every((role) => report.includes(role)) &&
      optionalRoles.every((role) => report.includes(role)),
    JSON.stringify({ required: hvacPack.recordRoles.required, optional: hvacPack.recordRoles.optional }, null, 2));

  assertCase(results, 'w407-anti-leak-role-and-vocabulary-coverage',
    antiLeakRoles.every((role) => hvacPack.recordRoles.invalid.includes(role)) &&
      includesAll(hvacText, forbiddenVocabulary) &&
      antiLeakRoles.every((role) => report.includes(role)) &&
      forbiddenVocabulary.every((term) => report.includes(term)),
    JSON.stringify({ invalid: hvacPack.recordRoles.invalid, forbidden: hvacPack.vocabulary.forbidden }, null, 2));

  assertCase(results, 'w407-lane-pack-resolution-safety',
    summitResolution.status === 'resolved' &&
      horizonResolution.status === 'resolved' &&
      summitResolution.packId === 'hvac-mechanical-contractor-supply-service-readiness' &&
      horizonResolution.packId === 'hvac-mechanical-contractor-supply-service-readiness' &&
      weakResolution.status !== 'resolved' &&
      report.includes('Weak or generic equipment evidence does not resolve as HVAC'),
    JSON.stringify({ summitResolution, horizonResolution, weakResolution }, null, 2));

  assertCase(results, 'w407-existing-lane-fit-safety',
    horizonResolution.packId !== 'building-materials-contractor-supply-project-fulfillment' &&
      horizonResolution.packId !== 'parts-service-field-operations' &&
      horizonResolution.packId !== 'industrial-distributor' &&
      horizonResolution.packId !== 'wholesale-janitorial-contract-replenishment' &&
      report.includes('Building Materials is not used for HVAC evidence') &&
      report.includes('Parts/Service is not used for HVAC evidence') &&
      report.includes('Generic Industrial Distribution remains adjacent but is not selected for Summit or Horizon evidence'),
    JSON.stringify({ summitResolution, horizonResolution }, null, 2));

  assertCase(results, 'w407-consultant-story-surface-safety',
    storySurface.status === 'story_ready_without_open_target' &&
      /contractor account|job or service order|hvac equipment|replacement|branch|warranty|backorder|pickup|jobsite|margin/i.test(JSON.stringify(storySurface)) &&
      !/guarantee|guaranteed|measured roi|will increase/i.test([
        storySurface.proofMove,
        storySurface.safeClaim,
        storySurface.buyerFacingSoWhat,
        storySurface.competitiveContrast
      ].join(' ')) &&
      /Do not claim .*measured ROI without evidence/i.test(storySurface.doNotClaim || ''),
    JSON.stringify(storySurface, null, 2));

  assertCase(results, 'w407-manufacturing-wip-default-off-posture',
    report.includes('Manufacturing/WIP default: off') &&
      report.includes('HVAC contractor supply should not invite Manufacturing/WIP by default') &&
      report.includes('Do not weaken W393 WIP best-effort diagnostics') &&
      hvacPack.operatingMode === 'distribution_replenishment',
    report.slice(0, 10000));

  assertCase(results, 'w407-roi-run-claim-confidence-preserved',
    report.includes('ROI/Competitive remains flow-based') &&
      report.includes('Run/Open-link authority remains verified-import-only') &&
      report.includes('Measured savings require a customer baseline') &&
      report.includes('Competitive pressure remains advisory-only unless confirmed') &&
      report.includes('public website/category evidence resolves pack confidence') &&
      report.includes('messy notes shape pain, ROI, objections, and run coaching') &&
      report.includes('N/LLM remains advisory-only') &&
      report.includes('Open links remain verified-import-only'),
    report.slice(0, 12000));

  assertCase(results, 'w407-w403-w397-w386-packages-preserved',
    exists(w403PackageDir) &&
      exists(w403PackageZip) &&
      exists(w397PackageDir) &&
      exists(w397PackageZip) &&
      exists(w386PackageDir) &&
      exists(w386PackageZip) &&
      report.includes('Do not mutate W403, W397, or W386 packages') &&
      report.includes('W403, W397, and W386 packages were not mutated'),
    JSON.stringify({ w403PackageDir, w403PackageZip, w397PackageDir, w397PackageZip, w386PackageDir, w386PackageZip }, null, 2));

  assertCase(results, 'w407-no-live-smoke-no-upload-boundary',
    report.includes('No live smoke in W407') &&
      report.includes('No upload or deployment') &&
      report.includes('No runtime upload package creation') &&
      report.includes('No fake Open links'),
    report.slice(0, 5000));

  assertCase(results, 'w407-preservation-scripts-registered',
    typeof scripts['harness:hvac-mechanical-source-pack-cleanup-w407'] === 'string' &&
      typeof scripts['harness:hvac-mechanical-second-fixture-decision-w406'] === 'string' &&
      typeof scripts['harness:hvac-mechanical-fixture-story-proof-w405'] === 'string' &&
      typeof scripts['harness:hvac-mechanical-fixture-first-selection-w404'] === 'string' &&
      typeof scripts['harness:wholesale-janitorial-readiness-delta-package-w403'] === 'string' &&
      typeof scripts['harness:wholesale-janitorial-source-pack-cleanup-w402'] === 'string',
    JSON.stringify({
      w407: scripts['harness:hvac-mechanical-source-pack-cleanup-w407'],
      w406: scripts['harness:hvac-mechanical-second-fixture-decision-w406'],
      w405: scripts['harness:hvac-mechanical-fixture-story-proof-w405'],
      w404: scripts['harness:hvac-mechanical-fixture-first-selection-w404'],
      w403: scripts['harness:wholesale-janitorial-readiness-delta-package-w403'],
      w402: scripts['harness:wholesale-janitorial-source-pack-cleanup-w402']
    }, null, 2));

  assertCase(results, 'w407-no-regression-gates',
    report.includes('No runner, adapter, record creation, import validation, or Open-link authority changes') &&
      report.includes('No broad source-pack abstractions') &&
      report.includes('completed-result import validation was not changed') &&
      report.includes('W407 no-regression gates passed'),
    report.slice(-6000));

  printResults('W407 HVAC/Mechanical source-pack cleanup harness', results);
}

main();
