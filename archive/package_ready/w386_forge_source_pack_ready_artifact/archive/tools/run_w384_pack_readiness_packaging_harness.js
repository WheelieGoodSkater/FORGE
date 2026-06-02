#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const {
  assertCase,
  printResults,
  readArchiveText
} = require('./lib/forge_harness_fixtures');

const {
  LANE_PACKS,
  validateLanePack,
  resolveLanePackFromEvidence
} = require('../../src/contracts/lanePacks');

const root = path.resolve(__dirname, '..', '..');

function readRootText(...parts) {
  return fs.readFileSync(path.join(root, ...parts), 'utf8');
}

function packageJson() {
  return JSON.parse(readRootText('package.json'));
}

function packById(id) {
  return LANE_PACKS.find((pack) => pack.packId === id);
}

function packText(pack) {
  return JSON.stringify(pack || {}).toLowerCase();
}

function includesAll(text, terms) {
  return terms.every((term) => text.includes(String(term).toLowerCase()));
}

function reportExists(file, patterns) {
  const text = readArchiveText('reports', file);
  return patterns.every((pattern) => pattern.test(text));
}

function main() {
  const results = [];
  const pkg = packageJson();
  const scripts = pkg.scripts || {};
  const requiredScripts = [
    'harness:source-lane-pack-readiness-w379',
    'harness:life-sciences-source-pack-cleanup-w380',
    'harness:parts-service-source-pack-cleanup-w381',
    'harness:medical-dental-source-pack-cleanup-w382',
    'harness:apparel-retail-source-pack-extension-w383'
  ];
  const sourcePacks = [
    { id: 'dealer-hardgoods', lane: 'dealer_hardgoods', terms: ['dealer availability', 'allocation', 'channel replenishment'] },
    { id: 'apparel-style-matrix', lane: 'apparel_accessories', terms: ['style', 'size', 'color', 'store/ecommerce promise', 'transfer risk', 'margin exposure'] },
    { id: 'parts-service-field-operations', lane: 'parts_service', terms: ['work order readiness', 'installed equipment history', 'truck/warehouse parts availability', 'first-time fix risk'] },
    { id: 'medical-dental-supply-equipment', lane: 'medical_dental_supply', terms: ['clinic supply availability', 'substitute product readiness', 'multi-location stock', 'customer promise confidence'] },
    { id: 'food-beverage-manufacturer', lane: 'food_beverage', terms: ['ingredient readiness', 'batch', 'packaging timing', 'finished-good availability'] },
    { id: 'industrial-manufacturing', lane: 'industrial_equipment', terms: ['assembly', 'component', 'supplier timing'] },
    { id: 'life-sciences-regulated-supply-release', lane: 'life_sciences', terms: ['lot/release readiness', 'approved inventory', 'QA/validation documentation', 'shipment confidence'] }
  ];
  const reports = [
    ['w379_source_lane_pack_readiness_review.md', [/W379 source\/lane-pack readiness review harness: 6\/6 passed/]],
    ['w380_life_sciences_source_pack_cleanup.md', [/W380 Life Sciences source-pack readiness cleanup harness: 7\/7 passed/]],
    ['w381_parts_service_source_pack_cleanup.md', [/W381 Parts\/Service source-pack readiness cleanup harness: 7\/7 passed/]],
    ['w382_medical_dental_source_pack_cleanup.md', [/W382 Medical\/Dental source-pack readiness cleanup harness: 7\/7 passed/]],
    ['w383_apparel_retail_source_pack_extension.md', [/W383 Apparel\/Retail source-pack extension harness: 7\/7 passed/, /pack-readiness packaging/i]]
  ];

  assertCase(results, 'w384-required-pack-harness-scripts-registered',
    requiredScripts.every((name) => typeof scripts[name] === 'string' && scripts[name].includes('archive/tools/run_w')),
    JSON.stringify(requiredScripts.map((name) => ({ name, command: scripts[name] })), null, 2));

  assertCase(results, 'w384-source-pack-set-ready-and-valid',
    sourcePacks.every((entry) => {
      const pack = packById(entry.id);
      return pack &&
        pack.laneId === entry.lane &&
        validateLanePack(pack).valid === true &&
        pack.nllmAdvisory.writeAuthority === 'none' &&
        pack.nllmAdvisory.creationAllowed === false &&
        includesAll(packText(pack), entry.terms);
    }) &&
      LANE_PACKS.every((pack) => validateLanePack(pack).valid),
    JSON.stringify(sourcePacks.map((entry) => ({ id: entry.id, exists: !!packById(entry.id), lane: packById(entry.id) && packById(entry.id).laneId })), null, 2));

  const resolutions = [
    resolveLanePackFromEvidence({ website: 'https://www.harborfinchoutfitters.com', categoryText: 'Apparel style size color ecommerce store availability transfer risk margin exposure.', signals: ['store/ecommerce promise', 'transfer risk'] }),
    resolveLanePackFromEvidence({ website: 'https://www.northstardentalsupply.com', categoryText: 'Dental supply clinic supply substitute products backorders multi-location stock warranty.', signals: ['clinic supply availability', 'customer promise confidence'] }),
    resolveLanePackFromEvidence({ website: 'https://www.bayviewkitchenservice.com', categoryText: 'Commercial kitchen service work order installed equipment technician service parts truck stock warranty.', signals: ['work order readiness', 'first-time fix risk'] }),
    resolveLanePackFromEvidence({ website: 'https://www.meridianbiosystems.com', categoryText: 'Diagnostic kits reagents lot status QA release validation documentation traceability.', signals: ['lot/release readiness', 'shipment confidence'] })
  ];
  assertCase(results, 'w384-lane-pack-resolution-safety-current',
    resolutions.map((resolution) => resolution.packId).join('|') === [
      'apparel-style-matrix',
      'medical-dental-supply-equipment',
      'parts-service-field-operations',
      'life-sciences-regulated-supply-release'
    ].join('|') &&
      resolveLanePackFromEvidence({ website: 'https://example.invalid', categoryText: 'maybe stuff', signals: [] }).status !== 'resolved',
    JSON.stringify(resolutions, null, 2));

  assertCase(results, 'w384-readiness-reports-present-and-current',
    reports.every(([file, patterns]) => reportExists(file, patterns)),
    JSON.stringify(reports.map(([file]) => file), null, 2));

  const boundaryText = reports.map(([file]) => readArchiveText('reports', file)).join('\n');
  assertCase(results, 'w384-no-live-smoke-and-no-runtime-mutation-boundary',
    /No live smoke was run/i.test(boundaryText) &&
      /does not change drawer transaction writes, runner behavior, adapter behavior, record creation behavior, completed-result import validation, or Open-link authority/i.test(boundaryText) &&
      /Live smoke remains unnecessary unless/i.test(boundaryText),
    boundaryText.slice(0, 4000));

  assertCase(results, 'w384-packaging-entry-recommendation-present',
    /Lock Apparel\/Retail source-pack readiness and move into pack-readiness packaging/i.test(readArchiveText('reports', 'w383_apparel_retail_source_pack_extension.md')),
    readArchiveText('reports', 'w383_apparel_retail_source_pack_extension.md').slice(-1200));

  printResults('W384 pack-readiness packaging harness', results);
}

main();
