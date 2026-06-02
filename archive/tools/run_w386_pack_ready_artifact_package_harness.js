#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

const {
  assertCase,
  printResults
} = require('./lib/forge_harness_fixtures');

const root = path.resolve(__dirname, '..', '..');
const packageRoot = path.join(root, 'archive', 'package_ready', 'w386_forge_source_pack_ready_artifact');
const zipPath = path.join(root, 'archive', 'package_ready', 'w386_forge_source_pack_ready_artifact.zip');

const expectedPackageFiles = [
  'PACK_READY_PACKAGE_MANIFEST_W386.md',
  'PACKAGE_FILE_LIST_W386.txt',
  'PACKAGE_VERIFICATION_REPORT_W386.md',
  'package.json',
  'src/contracts/lanePacks.js',
  'archive/PACK_READY_ARTIFACT_MANIFEST_W385.md',
  'archive/tools/run_w378_life_sciences_pre_pack_readiness_harness.js',
  'archive/tools/run_w379_source_lane_pack_readiness_harness.js',
  'archive/tools/run_w380_life_sciences_source_pack_cleanup_harness.js',
  'archive/tools/run_w381_parts_service_source_pack_cleanup_harness.js',
  'archive/tools/run_w382_medical_dental_source_pack_cleanup_harness.js',
  'archive/tools/run_w383_apparel_retail_source_pack_extension_harness.js',
  'archive/tools/run_w384_pack_readiness_packaging_harness.js',
  'archive/tools/run_w385_pack_ready_artifact_manifest_harness.js',
  'archive/reports/w378_life_sciences_pre_pack_readiness.md',
  'archive/reports/w379_source_lane_pack_readiness_review.md',
  'archive/reports/w380_life_sciences_source_pack_cleanup.md',
  'archive/reports/w381_parts_service_source_pack_cleanup.md',
  'archive/reports/w382_medical_dental_source_pack_cleanup.md',
  'archive/reports/w383_apparel_retail_source_pack_extension.md',
  'archive/reports/w384_pack_readiness_packaging.md',
  'archive/reports/w385_pack_ready_artifact_manifest.md'
].sort();

const disallowedPatterns = [
  /(^|\/)\.env($|\.)/,
  /(^|\/)Downloads\//,
  /(^|\/)netsuite\//,
  /(^|\/)src\/FileCabinet\//,
  /(^|\/)upload/i,
  /trace.*\.json$/i,
  /\.(png|jpe?g|gif|webp|mov|mp4)$/i,
  /\.zip$/i
];

const expectedPackageDirectories = [
  'archive',
  'archive/reports',
  'archive/tools',
  'src',
  'src/contracts'
];

function exists(filePath) {
  return fs.existsSync(filePath);
}

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function walkFiles(dir, prefix = '') {
  if (!exists(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    return entry.isDirectory() ? walkFiles(entryPath, rel) : [rel];
  });
}

function normalizeZipEntry(entry) {
  return entry
    .replace(/^\.\//, '')
    .replace(/\/$/, '');
}

function zipEntries() {
  if (!exists(zipPath)) return [];
  return childProcess
    .execFileSync('unzip', ['-Z1', zipPath], { encoding: 'utf8' })
    .split(/\r?\n/)
    .map(normalizeZipEntry)
    .filter(Boolean)
    .filter((entry) => !entry.endsWith('/'))
    .filter((entry) => !expectedPackageDirectories.includes(entry))
    .sort();
}

function arraysEqual(a, b) {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function main() {
  const results = [];
  const actualFiles = walkFiles(packageRoot).sort();
  const fileListPath = path.join(packageRoot, 'PACKAGE_FILE_LIST_W386.txt');
  const listedFiles = exists(fileListPath)
    ? read(fileListPath).split(/\r?\n/).map((line) => line.trim()).filter(Boolean).sort()
    : [];
  const manifestPath = path.join(packageRoot, 'PACK_READY_PACKAGE_MANIFEST_W386.md');
  const reportPath = path.join(packageRoot, 'PACKAGE_VERIFICATION_REPORT_W386.md');
  const manifest = exists(manifestPath) ? read(manifestPath) : '';
  const report = exists(reportPath) ? read(reportPath) : '';
  const rootManifest = exists(path.join(packageRoot, 'archive', 'PACK_READY_ARTIFACT_MANIFEST_W385.md'))
    ? read(path.join(packageRoot, 'archive', 'PACK_READY_ARTIFACT_MANIFEST_W385.md'))
    : '';

  assertCase(results, 'w386-required-files-present',
    expectedPackageFiles.every((file) => exists(path.join(packageRoot, file))),
    JSON.stringify(expectedPackageFiles.filter((file) => !exists(path.join(packageRoot, file))), null, 2));

  assertCase(results, 'w386-package-contents-expected-only',
    arraysEqual(actualFiles, expectedPackageFiles),
    JSON.stringify({ missing: expectedPackageFiles.filter((file) => !actualFiles.includes(file)), extra: actualFiles.filter((file) => !expectedPackageFiles.includes(file)) }, null, 2));

  assertCase(results, 'w386-package-file-list-matches-directory',
    arraysEqual(actualFiles, listedFiles),
    JSON.stringify({ actualFiles, listedFiles }, null, 2));

  assertCase(results, 'w386-no-disallowed-package-files',
    actualFiles.every((file) => !disallowedPatterns.some((pattern) => pattern.test(file))),
    JSON.stringify(actualFiles.filter((file) => disallowedPatterns.some((pattern) => pattern.test(file))), null, 2));

  assertCase(results, 'w386-manifest-source-alignment',
    rootManifest.includes('src/contracts/lanePacks.js') &&
      rootManifest.includes('archive/tools/run_w384_pack_readiness_packaging_harness.js') &&
      rootManifest.includes('Go for pack-ready artifact preparation') &&
      /source-pack readiness artifact package/i.test(manifest) &&
      manifest.includes('No upload or deployment') &&
      manifest.includes('No live smoke'),
    JSON.stringify({ rootManifest: rootManifest.slice(0, 500), manifest: manifest.slice(0, 500) }, null, 2));

  assertCase(results, 'w386-zip-list-matches-package-file-list',
    exists(zipPath) && arraysEqual(zipEntries(), listedFiles),
    JSON.stringify({ zipExists: exists(zipPath), zipEntries: zipEntries(), listedFiles }, null, 2));

  const packagedLanePacks = require(path.join(packageRoot, 'src', 'contracts', 'lanePacks.js'));
  const requiredPackIds = [
    'dealer-hardgoods',
    'apparel-style-matrix',
    'parts-service-field-operations',
    'medical-dental-supply-equipment',
    'food-beverage-manufacturer',
    'industrial-manufacturing',
    'life-sciences-regulated-supply-release'
  ];
  assertCase(results, 'w386-packaged-source-pack-validation-preserved',
    requiredPackIds.every((packId) => {
      const pack = packagedLanePacks.LANE_PACKS.find((candidate) => candidate.packId === packId);
      return pack && packagedLanePacks.validateLanePack(pack).valid === true;
    }),
    JSON.stringify(requiredPackIds, null, 2));

  assertCase(results, 'w386-boundary-report-preserved',
    report.includes('No live smoke was run') &&
      report.includes('No upload or deployment was performed') &&
      report.includes('Open links remain governed by verified imported records') &&
      report.includes('N/LLM remains advisory-only') &&
      report.includes('Go: lock W386 package artifact'),
    report.slice(0, 1500));

  printResults('W386 pack-ready artifact package harness', results);
}

main();
