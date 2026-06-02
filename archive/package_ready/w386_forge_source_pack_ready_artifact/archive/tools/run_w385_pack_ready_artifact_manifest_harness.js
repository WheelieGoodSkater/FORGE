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
  resolveLanePackFromEvidence
} = require('../../src/contracts/lanePacks');

const root = path.resolve(__dirname, '..', '..');

function rootPath(...parts) {
  return path.join(root, ...parts);
}

function readText(...parts) {
  return fs.readFileSync(rootPath(...parts), 'utf8');
}

function exists(...parts) {
  return fs.existsSync(rootPath(...parts));
}

function packageJson() {
  return JSON.parse(readText('package.json'));
}

function manifestText() {
  return readText('archive', 'PACK_READY_ARTIFACT_MANIFEST_W385.md');
}

function packById(id) {
  return LANE_PACKS.find((pack) => pack.packId === id);
}

function main() {
  const results = [];
  const manifest = manifestText();
  const pkg = packageJson();
  const scripts = pkg.scripts || {};
  const requiredFiles = [
    'src/contracts/lanePacks.js',
    'archive/tools/run_w378_life_sciences_pre_pack_readiness_harness.js',
    'archive/tools/run_w379_source_lane_pack_readiness_harness.js',
    'archive/tools/run_w380_life_sciences_source_pack_cleanup_harness.js',
    'archive/tools/run_w381_parts_service_source_pack_cleanup_harness.js',
    'archive/tools/run_w382_medical_dental_source_pack_cleanup_harness.js',
    'archive/tools/run_w383_apparel_retail_source_pack_extension_harness.js',
    'archive/tools/run_w384_pack_readiness_packaging_harness.js',
    'archive/reports/w378_life_sciences_pre_pack_readiness.md',
    'archive/reports/w379_source_lane_pack_readiness_review.md',
    'archive/reports/w380_life_sciences_source_pack_cleanup.md',
    'archive/reports/w381_parts_service_source_pack_cleanup.md',
    'archive/reports/w382_medical_dental_source_pack_cleanup.md',
    'archive/reports/w383_apparel_retail_source_pack_extension.md',
    'archive/reports/w384_pack_readiness_packaging.md',
    'archive/PACK_READY_ARTIFACT_MANIFEST_W385.md'
  ];
  const requiredScripts = [
    'harness:life-sciences-pre-pack-readiness-w378',
    'harness:source-lane-pack-readiness-w379',
    'harness:life-sciences-source-pack-cleanup-w380',
    'harness:parts-service-source-pack-cleanup-w381',
    'harness:medical-dental-source-pack-cleanup-w382',
    'harness:apparel-retail-source-pack-extension-w383',
    'harness:pack-readiness-packaging-w384'
  ];
  const packIds = [
    'dealer-hardgoods',
    'apparel-style-matrix',
    'parts-service-field-operations',
    'medical-dental-supply-equipment',
    'food-beverage-manufacturer',
    'industrial-manufacturing',
    'life-sciences-regulated-supply-release'
  ];

  assertCase(results, 'w385-manifest-file-inventory-exists',
    requiredFiles.every((file) => exists(file)) &&
      requiredFiles.every((file) => manifest.includes(file)),
    JSON.stringify(requiredFiles.filter((file) => !exists(file) || !manifest.includes(file)), null, 2));

  assertCase(results, 'w385-package-scripts-registered-and-listed',
    requiredScripts.every((name) => typeof scripts[name] === 'string') &&
      requiredScripts.every((name) => manifest.includes(name)),
    JSON.stringify(requiredScripts.map((name) => ({ name, command: scripts[name] || '' })), null, 2));

  assertCase(results, 'w385-source-pack-set-valid-and-listed',
    packIds.every((id) => {
      const pack = packById(id);
      return pack && validateLanePack(pack).valid === true && manifest.includes(id);
    }) &&
      LANE_PACKS.every((pack) => validateLanePack(pack).valid),
    JSON.stringify(packIds.map((id) => ({ id, exists: !!packById(id), valid: packById(id) ? validateLanePack(packById(id)).valid : false })), null, 2));

  const resolutionPairs = [
    ['https://www.harborfinchoutfitters.com', 'Apparel style size color ecommerce store availability transfer risk margin exposure.', 'apparel-style-matrix'],
    ['https://www.northstardentalsupply.com', 'Dental supply clinic supply substitute products backorders multi-location stock warranty.', 'medical-dental-supply-equipment'],
    ['https://www.bayviewkitchenservice.com', 'Commercial kitchen service work order installed equipment technician service parts truck stock warranty.', 'parts-service-field-operations'],
    ['https://www.meridianbiosystems.com', 'Diagnostic kits reagents lot status QA release validation documentation traceability.', 'life-sciences-regulated-supply-release']
  ];
  const resolutions = resolutionPairs.map(([website, categoryText]) => resolveLanePackFromEvidence({ website, categoryText }));
  assertCase(results, 'w385-resolution-safety-and-weak-evidence-gate',
    resolutions.every((resolution, index) => resolution.packId === resolutionPairs[index][2] && resolution.status === 'resolved') &&
      resolveLanePackFromEvidence({ website: 'https://example.invalid', categoryText: 'maybe things', signals: [] }).status !== 'resolved',
    JSON.stringify(resolutions, null, 2));

  assertCase(results, 'w385-manifest-authority-and-smoke-boundaries',
    /N\/LLM remains advisory-only/.test(manifest) &&
      /Source packs do not create records/.test(manifest) &&
      /Open links remain clickable only when verified imported records provide Open-link authority/.test(manifest) &&
      /No live smoke is required/.test(manifest) &&
      /Run live smoke only if a future change touches real integration risk/.test(manifest),
    manifest.slice(0, 4000));

  assertCase(results, 'w385-go-no-go-pack-ready-artifact-prep',
    /Go for pack-ready artifact preparation/.test(manifest) &&
      /Do not upload or run live smoke from this manifest alone/.test(manifest),
    manifest.slice(-1000));

  printResults('W385 pack-ready artifact manifest harness', results);
}

main();
