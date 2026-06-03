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
const reportPath = path.join(root, 'archive', 'reports', 'w409_comfortable_lane_hardening_matrix.md');
const packageDirs = [
  'archive/package_ready/w386_forge_source_pack_ready_artifact',
  'archive/package_ready/w397_building_materials_readiness_delta',
  'archive/package_ready/w403_wholesale_janitorial_readiness_delta',
  'archive/package_ready/w408_hvac_mechanical_readiness_delta'
];
const packageZips = [
  'archive/package_ready/w386_forge_source_pack_ready_artifact.zip',
  'archive/package_ready/w397_building_materials_readiness_delta.zip',
  'archive/package_ready/w403_wholesale_janitorial_readiness_delta.zip',
  'archive/package_ready/w408_hvac_mechanical_readiness_delta.zip'
];

const comfortableLanes = [
  {
    name: 'Dealer Hardgoods / Dealer Channel Availability',
    packId: 'dealer-hardgoods',
    laneId: 'dealer_hardgoods',
    status: 'smoke-ready now',
    evidence: {
      website: 'https://www.summitoutdoorsupply.com',
      categoryText: 'dealer hardgoods powersports ATV mower trailers dealer channel availability allocation replenishment supplier lead time',
      evidenceText: 'dealer channel availability allocation replenishment supplier lead-time risk product sku customer sales order'
    },
    mustInclude: ['dealer', 'allocation', 'replenishment'],
    forbidden: ['style/color/size', 'clinic supply', 'lot/release readiness']
  },
  {
    name: 'Apparel & Accessories / Specialty Retail',
    packId: 'apparel-style-matrix',
    laneId: 'apparel_accessories',
    status: 'ready but watch wording',
    evidence: {
      website: 'https://www.harborfinchoutfitters.com',
      categoryText: 'apparel bags outdoor lifestyle seasonal items store ecommerce sizes colors style sku transfer replenishment margin',
      evidenceText: 'style color size availability store ecommerce promise transfers replenishment margin exposure'
    },
    mustInclude: ['style', 'size', 'color', 'store'],
    forbidden: ['dealer allocation', 'first-time fix', 'lot/release readiness']
  },
  {
    name: 'Parts & Service / Field Service Operations',
    packId: 'parts-service-field-operations',
    laneId: 'parts_service',
    status: 'smoke-ready now',
    evidence: {
      website: 'https://www.bayviewkitchenservice.com',
      categoryText: 'field service repair restaurant equipment service parts work order technician truck stock warehouse parts warranty emergency repair',
      evidenceText: 'work order readiness installed equipment history truck warehouse parts availability first-time fix warranty exposure emergency response service margin'
    },
    mustInclude: ['work order', 'installed equipment', 'service part', 'warranty'],
    forbidden: ['style/color/size', 'QA release', 'food batch']
  },
  {
    name: 'Medical/Dental Supply & Equipment',
    packId: 'medical-dental-supply-equipment',
    laneId: 'medical_dental_supply',
    status: 'smoke-ready now',
    evidence: {
      website: 'https://www.northstardentalsupply.com',
      categoryText: 'dental supply dental equipment clinic supply sterilization handpieces chairs substitute products backorders multi-location stock warranty compliance',
      evidenceText: 'clinic supply availability substitute product readiness backorder risk multi-location stock warranty context compliance-sensitive item'
    },
    mustInclude: ['clinic supply', 'substitute', 'backorder', 'warranty'],
    forbidden: ['technician truck stock', 'QA release', 'food batch']
  },
  {
    name: 'Food/Beverage / Batch and Promotion Readiness',
    packId: 'food-beverage-manufacturer',
    laneId: 'food_beverage',
    status: 'smoke-ready now',
    evidence: {
      website: 'https://www.willowcreekfoods.com',
      categoryText: 'food beverage manufacturer finished goods ingredient packaging batch formula QA lot promotion ship readiness',
      evidenceText: 'finished good ingredient packaging readiness batch line timing QA lot readiness promotion ship confidence'
    },
    mustInclude: ['ingredient', 'packaging', 'batch'],
    forbidden: ['style matrix', 'dealer allocation', 'configured equipment']
  },
  {
    name: 'Industrial Equipment / Configured Equipment Readiness',
    packId: 'industrial-manufacturing',
    laneId: 'industrial_equipment',
    status: 'ready but watch wording',
    evidence: {
      website: 'https://www.atlasindustrialequipment.com',
      categoryText: 'industrial equipment configured equipment assembly component availability supplier lead time build test inspection readiness engineering BOM',
      evidenceText: 'assembly component readiness supplier timing build confidence sales order promise'
    },
    mustInclude: ['assembly', 'component', 'build'],
    forbidden: ['ingredient batch', 'style matrix', 'branch transfer']
  },
  {
    name: 'Life Sciences / Regulated Supply & Release',
    packId: 'life-sciences-regulated-supply-release',
    laneId: 'life_sciences',
    status: 'smoke-ready now',
    evidence: {
      website: 'https://www.meridianbiosystems.com',
      categoryText: 'life sciences diagnostic kits reagents regulated consumables lot status QA release validation documentation expiration traceability',
      evidenceText: 'lot release readiness approved inventory expiration risk QA validation documentation traceability shipment confidence'
    },
    mustInclude: ['lot', 'release', 'approved inventory', 'traceability'],
    forbidden: ['food batch', 'configured equipment assembly', 'technician truck stock']
  },
  {
    name: 'Building Materials / Contractor Supply & Project Fulfillment',
    packId: 'building-materials-contractor-supply-project-fulfillment',
    laneId: 'building_materials',
    status: 'smoke-ready now',
    evidence: {
      website: 'https://www.keystonebuildingsupply.com',
      categoryText: 'building materials lumber doors windows fasteners tools contractor supply special order materials branch availability jobsite delivery will-call pickup substitutions project fulfillment',
      evidenceText: 'contractor account demand job order readiness item availability by branch special order status substitutions will-call jobsite delivery margin leakage'
    },
    mustInclude: ['contractor', 'job order', 'branch', 'jobsite'],
    forbidden: ['dealer allocation', 'style/color/size', 'manufacturing routing']
  },
  {
    name: 'Wholesale Janitorial / Contract Replenishment',
    packId: 'wholesale-janitorial-contract-replenishment',
    laneId: 'wholesale_janitorial',
    status: 'smoke-ready now',
    evidence: {
      website: 'https://www.metrocarejanitorialsupply.com',
      categoryText: 'janitorial supply facility supply contract replenishment recurring orders route delivery restroom paper cleaning chemicals preferred items substitutes',
      evidenceText: 'contract customer demand recurring order readiness facility item availability substitute product backorder route delivery margin leakage'
    },
    mustInclude: ['janitorial', 'recurring', 'route', 'facility'],
    forbidden: ['lumber', 'jobsite delivery', 'WIP']
  },
  {
    name: 'HVAC / Mechanical Contractor Supply & Service Readiness',
    packId: 'hvac-mechanical-contractor-supply-service-readiness',
    laneId: 'hvac_mechanical_supply',
    status: 'smoke-ready now',
    evidence: {
      website: 'https://www.horizonairmechanicalsupply.com',
      categoryText: 'HVAC supply mechanical contractor equipment replacement parts branch counter stock warranty replacement backorder replenishment jobsite delivery will-call pickup',
      evidenceText: 'contractor account demand job or service order HVAC equipment availability replacement or service part branch location stock reserved substitute option warranty context pickup or jobsite delivery'
    },
    mustInclude: ['HVAC', 'replacement', 'branch', 'warranty'],
    forbidden: ['lumber', 'restroom paper', 'manufacturing routing']
  }
];

const confusionTests = [
  ['Dealer Hardgoods vs Building Materials vs Industrial Distribution', ['dealer allocation', 'contractor job', 'generic distribution']],
  ['Building Materials vs HVAC', ['lumber', 'HVAC equipment', 'replacement parts']],
  ['HVAC vs Parts/Service', ['HVAC contractor supply', 'dispatch', 'truck stock']],
  ['Wholesale Janitorial vs Building Materials', ['recurring facility replenishment', 'contractor job fulfillment']],
  ['Medical/Dental vs Life Sciences', ['clinic supply', 'lot/release', 'validation documentation']],
  ['Food/Beverage vs Life Sciences', ['ingredient', 'regulated lot', 'QA release']],
  ['Food/Beverage vs Industrial Equipment', ['batch', 'configured assembly', 'component readiness']],
  ['Apparel/Retail vs Dealer Hardgoods', ['style/color/size', 'store/ecommerce', 'dealer allocation']],
  ['Parts/Service vs Medical/Dental equipment/service context', ['work order', 'clinic supply', 'warranty']],
  ['Industrial Equipment vs Manufacturing/WIP path', ['Manufacturing/WIP remains guarded', 'WIP should only be used where explicitly relevant']]
];

function exists(relPath) {
  return fs.existsSync(path.join(root, relPath));
}

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), 'utf8');
}

function packageJson() {
  return JSON.parse(read('package.json'));
}

function packById(packId) {
  return LANE_PACKS.find((pack) => pack.packId === packId);
}

function packText(pack) {
  return JSON.stringify({
    websiteSignals: pack.websiteSignals,
    recordRoles: pack.recordRoles,
    vocabulary: pack.vocabulary,
    liveDemo: pack.liveDemo,
    nllmAdvisory: pack.nllmAdvisory
  }).toLowerCase();
}

function statusIsSmokeReady(status) {
  return status === 'smoke-ready now' || status === 'ready but watch wording';
}

function main() {
  const results = [];
  const report = fs.existsSync(reportPath) ? fs.readFileSync(reportPath, 'utf8') : '';
  const scripts = packageJson().scripts || {};
  const lanePacks = comfortableLanes.map((lane) => ({ lane, pack: packById(lane.packId) }));
  const storySurfaces = lanePacks.map(({ lane, pack }) => ({
    lane,
    surface: pack && consultantStorySurfaceFromLanePack(lane.evidence, pack, { displayReadyRecords: [] })
  }));
  const resolutions = comfortableLanes.map((lane) => ({ lane, resolution: resolveLanePackFromEvidence(lane.evidence) }));
  const nonManufacturingPacks = lanePacks
    .filter(({ lane }) => !['food-beverage-manufacturer', 'industrial-manufacturing'].includes(lane.packId))
    .map(({ pack }) => pack);

  assertCase(results, 'w409-comfortable-lane-set-complete',
    comfortableLanes.length === 10 &&
      comfortableLanes.every((lane) => report.includes(lane.name)) &&
      new Set(comfortableLanes.map((lane) => lane.packId)).size === 10,
    JSON.stringify(comfortableLanes.map((lane) => lane.name), null, 2));

  assertCase(results, 'w409-source-pack-story-baseline-known-per-lane',
    lanePacks.every(({ lane, pack }) => !!pack && pack.laneId === lane.laneId && validateLanePack(pack).valid) &&
      comfortableLanes.every((lane) => report.includes(lane.packId)) &&
      report.includes('W397 readiness delta package') &&
      report.includes('W403 readiness delta package') &&
      report.includes('W408 readiness delta package'),
    JSON.stringify(lanePacks.map(({ lane, pack }) => ({ lane: lane.name, packId: pack && pack.packId, validation: pack && validateLanePack(pack) })), null, 2));

  assertCase(results, 'w409-proof-role-completeness',
    lanePacks.every(({ pack }) => pack.recordRoles.required.length >= 4 && pack.recordRoles.optional.length >= 2 && pack.recordRoles.invalid.length >= 2) &&
      storySurfaces.every(({ surface }) => surface && surface.status === 'story_ready_without_open_target' && !surface.openUrl),
    JSON.stringify(lanePacks.map(({ lane, pack }) => ({ lane: lane.name, required: pack.recordRoles.required, optional: pack.recordRoles.optional, invalid: pack.recordRoles.invalid })), null, 2));

  assertCase(results, 'w409-roi-baseline-safety',
    storySurfaces.every(({ surface }) => /measured roi without evidence|measured ROI without evidence/i.test(surface.doNotClaim || '')) &&
      report.includes('ROI language avoids measured savings without a customer baseline') &&
      report.includes('customer baseline'),
    JSON.stringify(storySurfaces.map(({ lane, surface }) => ({ lane: lane.name, doNotClaim: surface.doNotClaim, buyerFacingSoWhat: surface.buyerFacingSoWhat })), null, 2));

  assertCase(results, 'w409-competitive-advisory-safety',
    storySurfaces.every(({ surface }) => surface.nllmAdvisory.writeAuthority === 'none' && surface.nllmAdvisory.creationAllowed === false) &&
      report.includes('competitive language is advisory-only unless confirmed') &&
      report.includes('N/LLM remains advisory-only'),
    JSON.stringify(storySurfaces.map(({ lane, surface }) => ({ lane: lane.name, advisory: surface.nllmAdvisory, contrast: surface.competitiveContrast })), null, 2));

  assertCase(results, 'w409-run-open-link-authority-preservation',
    storySurfaces.every(({ surface }) => surface.status === 'story_ready_without_open_target' && surface.openUrl === '') &&
      report.includes('Run/Open-link behavior is authority-safe') &&
      report.includes('Open-link authority remains verified-import-only'),
    JSON.stringify(storySurfaces.map(({ lane, surface }) => ({ lane: lane.name, status: surface.status, openUrl: surface.openUrl })), null, 2));

  assertCase(results, 'w409-collapsed-support-consistency',
    report.includes('support details are collapsed and lane-consistent') &&
      report.includes('support details are collapsed') &&
      report.includes('lane-consistent'),
    report.slice(0, 5000));

  assertCase(results, 'w409-cross-lane-anti-leak-wording',
    lanePacks.every(({ lane, pack }) => {
      const text = packText(pack);
      return lane.mustInclude.every((term) => text.includes(term.toLowerCase())) &&
        lane.forbidden.every((term) => text.includes(term.toLowerCase()) || report.toLowerCase().includes(term.toLowerCase()));
    }) &&
      confusionTests.every(([label, terms]) => report.includes(label) && terms.every((term) => report.includes(term))),
    JSON.stringify(lanePacks.map(({ lane, pack }) => ({ lane: lane.name, text: packText(pack).slice(0, 1800) })), null, 2));

  assertCase(results, 'w409-manufacturing-wip-guard-preservation',
    nonManufacturingPacks.every((pack) => !/wip_manufacturing/.test(pack.operatingMode)) &&
      packById('industrial-manufacturing').operatingMode === 'discrete_manufacturing' &&
      packById('equipment-manufacturing').operatingMode === 'wip_manufacturing' &&
      report.includes('Manufacturing/WIP remains guarded') &&
      report.includes('Manufacturing/WIP is not defaulted into non-manufacturing lanes') &&
      report.includes('W393 WIP routing best-effort diagnostics were not weakened'),
    JSON.stringify(lanePacks.map(({ lane, pack }) => ({ lane: lane.name, operatingMode: pack.operatingMode })), null, 2));

  assertCase(results, 'w409-smoke-readiness-statuses',
    comfortableLanes.every((lane) => statusIsSmokeReady(lane.status) && report.includes(`| ${lane.name} |`)) &&
      report.includes('Apparel/Retail is ready but watch store/ecommerce and transfer-risk wording') &&
      report.includes('Industrial Equipment is ready but watch Manufacturing/WIP guardrails'),
    JSON.stringify(comfortableLanes.map((lane) => ({ lane: lane.name, status: lane.status })), null, 2));

  assertCase(results, 'w409-resolution-safety',
    resolutions.every(({ lane, resolution }) => resolution.packId === lane.packId && ['resolved', 'needs_confirmation'].includes(resolution.status)) &&
      resolutions.filter(({ resolution }) => resolution.status === 'needs_confirmation').every(({ resolution }) => resolution.confidence === 'medium') &&
      report.includes('uncertainty remains visible'),
    JSON.stringify(resolutions.map(({ lane, resolution }) => ({ lane: lane.name, packId: resolution.packId, status: resolution.status, confidence: resolution.confidence })), null, 2));

  assertCase(results, 'w409-package-baseline-preservation',
    packageDirs.every(exists) &&
      packageZips.every(exists) &&
      report.includes('W386, W397, W403, and W408 packages were not mutated'),
    JSON.stringify({ packageDirs, packageZips }, null, 2));

  assertCase(results, 'w409-no-live-smoke-no-upload-boundary',
    report.includes('No live smoke in W409') &&
      report.includes('No upload or deployment') &&
      report.includes('No runtime upload package was created'),
    report.slice(0, 2400));

  assertCase(results, 'w409-no-runtime-package-creation',
    !exists('archive/package_ready/w409_comfortable_lane_hardening_matrix') &&
      !exists('archive/package_ready/w409_comfortable_lane_hardening_matrix.zip') &&
      report.includes('W409 pauses industry expansion'),
    'W409 should be a matrix gate, not a package block.');

  assertCase(results, 'w409-no-source-pack-mutation',
    report.includes('No source packs were mutated') &&
      report.includes('No source-pack mutation in W409'),
    report.slice(0, 3000));

  assertCase(results, 'w409-preservation-scripts-registered',
    typeof scripts['harness:comfortable-lane-hardening-matrix-w409'] === 'string' &&
      typeof scripts['harness:hvac-mechanical-readiness-delta-package-w408'] === 'string' &&
      typeof scripts['harness:wholesale-janitorial-readiness-delta-package-w403'] === 'string' &&
      typeof scripts['harness:building-materials-readiness-delta-package-w397'] === 'string' &&
      typeof scripts['harness:pack-ready-artifact-package-w386'] === 'string',
    JSON.stringify({
      w409: scripts['harness:comfortable-lane-hardening-matrix-w409'],
      w408: scripts['harness:hvac-mechanical-readiness-delta-package-w408'],
      w403: scripts['harness:wholesale-janitorial-readiness-delta-package-w403'],
      w397: scripts['harness:building-materials-readiness-delta-package-w397'],
      w386: scripts['harness:pack-ready-artifact-package-w386']
    }, null, 2));

  assertCase(results, 'w409-no-regression-gates',
    report.includes('No runner, adapter, record creation, completed-result import validation, or Open-link authority changes') &&
      report.includes('No fake Open links') &&
      report.includes('larger smoke series') &&
      report.includes('Prepare smoke-series design next, but do not run smoke yet'),
    report.slice(-5000));

  printResults('W409 comfortable lane hardening matrix harness', results);
}

main();
