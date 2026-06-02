#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

const {
  assertCase,
  printResults
} = require('./lib/forge_harness_fixtures');

const root = path.resolve(__dirname, '..', '..');
const packageRoot = path.join(root, 'archive', 'package_ready', 'w403_wholesale_janitorial_readiness_delta');
const zipPath = path.join(root, 'archive', 'package_ready', 'w403_wholesale_janitorial_readiness_delta.zip');
const reportPath = path.join(root, 'archive', 'reports', 'w403_wholesale_janitorial_readiness_delta_package.md');
const w386PackageRoot = path.join(root, 'archive', 'package_ready', 'w386_forge_source_pack_ready_artifact');
const w386ZipPath = path.join(root, 'archive', 'package_ready', 'w386_forge_source_pack_ready_artifact.zip');
const w397PackageRoot = path.join(root, 'archive', 'package_ready', 'w397_building_materials_readiness_delta');
const w397ZipPath = path.join(root, 'archive', 'package_ready', 'w397_building_materials_readiness_delta.zip');

const expectedPackageFiles = [
  'PACKAGE_FILE_LIST_W403.txt',
  'PACKAGE_MANIFEST_W403.md',
  'PACKAGE_VERIFICATION_REPORT_W403.md',
  'archive/reports/w398_fixture_first_expansion_restart_after_building_materials_package.md',
  'archive/reports/w399_wholesale_janitorial_fixture_story_proof.md',
  'archive/reports/w400_wholesale_janitorial_source_pack_readiness_decision.md',
  'archive/reports/w401_wholesale_janitorial_second_fixture_decision.md',
  'archive/reports/w402_wholesale_janitorial_source_pack_cleanup.md',
  'archive/tools/run_w398_fixture_first_expansion_restart_after_building_materials_package_harness.js',
  'archive/tools/run_w399_wholesale_janitorial_fixture_story_proof_harness.js',
  'archive/tools/run_w400_wholesale_janitorial_source_pack_readiness_decision_harness.js',
  'archive/tools/run_w401_wholesale_janitorial_second_fixture_decision_harness.js',
  'archive/tools/run_w402_wholesale_janitorial_source_pack_cleanup_harness.js',
  'package.json',
  'src/contracts/lanePacks.js'
].sort();

const expectedZipDirectories = [
  'archive',
  'archive/reports',
  'archive/tools',
  'src',
  'src/contracts'
];

const disallowedPatterns = [
  /(^|\/)\.env($|\.)/,
  /(^|\/)Downloads\//,
  /(^|\/)netsuite\//,
  /(^|\/)src\/FileCabinet\//,
  /(^|\/)upload/i,
  /trace.*\.json$/i,
  /\.(png|jpe?g|gif|webp|mov|mp4)$/i,
  /\.zip$/i,
  /w386_forge_source_pack_ready_artifact/,
  /w397_building_materials_readiness_delta/
];

function exists(filePath) {
  return fs.existsSync(filePath);
}

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function packageJson() {
  return JSON.parse(read(path.join(root, 'package.json')));
}

function walkFiles(dir, prefix = '') {
  if (!exists(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    const fullPath = path.join(dir, entry.name);
    return entry.isDirectory() ? walkFiles(fullPath, rel) : [rel];
  });
}

function normalizeZipEntry(entry) {
  return entry.replace(/^\.\//, '').replace(/\/$/, '');
}

function zipEntries() {
  if (!exists(zipPath)) return [];
  return childProcess
    .execFileSync('unzip', ['-Z1', zipPath], { encoding: 'utf8' })
    .split(/\r?\n/)
    .map(normalizeZipEntry)
    .filter(Boolean)
    .filter((entry) => !expectedZipDirectories.includes(entry))
    .sort();
}

function arraysEqual(a, b) {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function main() {
  const results = [];
  const packageFiles = walkFiles(packageRoot).sort();
  const packageFileListPath = path.join(packageRoot, 'PACKAGE_FILE_LIST_W403.txt');
  const listedFiles = exists(packageFileListPath)
    ? read(packageFileListPath).split(/\r?\n/).map((line) => line.trim()).filter(Boolean).sort()
    : [];
  const manifest = exists(path.join(packageRoot, 'PACKAGE_MANIFEST_W403.md'))
    ? read(path.join(packageRoot, 'PACKAGE_MANIFEST_W403.md'))
    : '';
  const packageVerification = exists(path.join(packageRoot, 'PACKAGE_VERIFICATION_REPORT_W403.md'))
    ? read(path.join(packageRoot, 'PACKAGE_VERIFICATION_REPORT_W403.md'))
    : '';
  const report = exists(reportPath) ? read(reportPath) : '';
  const scripts = packageJson().scripts || {};
  const packagedLanePacks = exists(path.join(packageRoot, 'src', 'contracts', 'lanePacks.js'))
    ? require(path.join(packageRoot, 'src', 'contracts', 'lanePacks.js'))
    : null;
  const janitorialPack = packagedLanePacks && packagedLanePacks.LANE_PACKS.find((pack) => pack.packId === 'wholesale-janitorial-contract-replenishment');

  assertCase(results, 'w403-package-directory-and-zip-exist',
    exists(packageRoot) && exists(zipPath),
    JSON.stringify({ packageRoot, zipPath }, null, 2));

  assertCase(results, 'w403-required-files-present',
    expectedPackageFiles.every((file) => exists(path.join(packageRoot, file))),
    JSON.stringify(expectedPackageFiles.filter((file) => !exists(path.join(packageRoot, file))), null, 2));

  assertCase(results, 'w403-package-contents-expected-only',
    arraysEqual(packageFiles, expectedPackageFiles),
    JSON.stringify({ missing: expectedPackageFiles.filter((file) => !packageFiles.includes(file)), extra: packageFiles.filter((file) => !expectedPackageFiles.includes(file)) }, null, 2));

  assertCase(results, 'w403-package-file-list-matches-directory',
    arraysEqual(packageFiles, listedFiles),
    JSON.stringify({ packageFiles, listedFiles }, null, 2));

  assertCase(results, 'w403-no-disallowed-package-files',
    packageFiles.every((file) => !disallowedPatterns.some((pattern) => pattern.test(file))),
    JSON.stringify(packageFiles.filter((file) => disallowedPatterns.some((pattern) => pattern.test(file))), null, 2));

  assertCase(results, 'w403-zip-list-matches-package-file-list',
    exists(zipPath) && arraysEqual(zipEntries(), listedFiles),
    JSON.stringify({ zipEntries: zipEntries(), listedFiles }, null, 2));

  assertCase(results, 'w403-manifest-and-verification-scope',
    manifest.includes('Wholesale Janitorial readiness evidence after W402') &&
      manifest.includes('not an upload package') &&
      packageVerification.includes('Wholesale Janitorial readiness evidence package only') &&
      packageVerification.includes('No upload or deployment') &&
      packageVerification.includes('No live smoke') &&
      packageVerification.includes('No nested package contents'),
    JSON.stringify({ manifest: manifest.slice(0, 1200), packageVerification: packageVerification.slice(0, 1200) }, null, 2));

  assertCase(results, 'w403-packaged-wholesale-janitorial-source-valid',
    !!janitorialPack &&
      janitorialPack.laneId === 'wholesale_janitorial' &&
      packagedLanePacks.validateLanePack(janitorialPack).valid === true &&
      packagedLanePacks.resolveLanePackFromEvidence({
        website: 'https://www.metrocarejanitorialsupply.com',
        categoryText: 'facility supply janitorial supplies contract replenishment recurring order route delivery substitute product backorder replenishment cadence contracted pricing preferred items',
        evidenceText: 'contract customer demand recurring order readiness facility/location supply availability preferred item or contracted item context substitute product readiness backorder exposure route/delivery readiness margin leakage customer promise confidence'
      }).packId === 'wholesale-janitorial-contract-replenishment',
    JSON.stringify({ janitorialPack, validation: janitorialPack && packagedLanePacks.validateLanePack(janitorialPack) }, null, 2));

  assertCase(results, 'w403-baseline-reports-preserved',
    read(path.join(packageRoot, 'archive', 'reports', 'w402_wholesale_janitorial_source_pack_cleanup.md')).includes('W402 Wholesale Janitorial source-pack cleanup harness: 16/16 passed') &&
      read(path.join(packageRoot, 'archive', 'reports', 'w401_wholesale_janitorial_second_fixture_decision.md')).includes('W401 Wholesale Janitorial second fixture decision harness: 15/15 passed') &&
      read(path.join(packageRoot, 'archive', 'reports', 'w400_wholesale_janitorial_source_pack_readiness_decision.md')).includes('W400 Wholesale Janitorial source-pack readiness decision harness: 16/16 passed') &&
      read(path.join(packageRoot, 'archive', 'reports', 'w399_wholesale_janitorial_fixture_story_proof.md')).includes('W399 Wholesale Janitorial fixture story proof harness: 16/16 passed') &&
      read(path.join(packageRoot, 'archive', 'reports', 'w398_fixture_first_expansion_restart_after_building_materials_package.md')).includes('W398 fixture-first expansion restart after Building Materials package harness: 15/15 passed'),
    'Packaged baseline reports did not preserve expected pass counts.');

  assertCase(results, 'w403-w397-and-w386-packages-untouched',
    exists(w397PackageRoot) &&
      exists(w397ZipPath) &&
      exists(w386PackageRoot) &&
      exists(w386ZipPath) &&
      report.includes('W386 and W397 packages were not mutated') &&
      !packageFiles.some((file) => file.includes('w386_forge_source_pack_ready_artifact') || file.includes('w397_building_materials_readiness_delta')),
    JSON.stringify({ w397PackageRoot, w397ZipPath, w386PackageRoot, w386ZipPath }, null, 2));

  assertCase(results, 'w403-readiness-evidence-only-boundary',
    report.includes('No live smoke in W403') &&
      report.includes('No upload or deployment') &&
      report.includes('No runtime upload package creation') &&
      report.includes('readiness evidence only') &&
      report.includes('not runtime code'),
    report.slice(0, 5000));

  assertCase(results, 'w403-preservation-scripts-registered',
    typeof scripts['harness:wholesale-janitorial-readiness-delta-package-w403'] === 'string' &&
      typeof scripts['harness:wholesale-janitorial-source-pack-cleanup-w402'] === 'string' &&
      typeof scripts['harness:wholesale-janitorial-second-fixture-decision-w401'] === 'string' &&
      typeof scripts['harness:wholesale-janitorial-source-pack-readiness-decision-w400'] === 'string' &&
      typeof scripts['harness:wholesale-janitorial-fixture-story-proof-w399'] === 'string' &&
      typeof scripts['harness:fixture-first-expansion-restart-after-building-materials-package-w398'] === 'string' &&
      typeof scripts['harness:building-materials-readiness-delta-package-w397'] === 'string' &&
      typeof scripts['harness:pack-ready-artifact-package-w386'] === 'string',
    JSON.stringify({
      w403: scripts['harness:wholesale-janitorial-readiness-delta-package-w403'],
      w402: scripts['harness:wholesale-janitorial-source-pack-cleanup-w402'],
      w401: scripts['harness:wholesale-janitorial-second-fixture-decision-w401'],
      w400: scripts['harness:wholesale-janitorial-source-pack-readiness-decision-w400'],
      w399: scripts['harness:wholesale-janitorial-fixture-story-proof-w399'],
      w398: scripts['harness:fixture-first-expansion-restart-after-building-materials-package-w398'],
      w397: scripts['harness:building-materials-readiness-delta-package-w397'],
      w386: scripts['harness:pack-ready-artifact-package-w386']
    }, null, 2));

  assertCase(results, 'w403-no-regression-gates',
    report.includes('No source-pack mutation in W403') &&
      report.includes('No runner, adapter, record creation, import validation, or Open-link authority changes') &&
      report.includes('No fake Open links') &&
      report.includes('completed-result import validation was not changed') &&
      report.includes('W403 no-regression gates passed'),
    report.slice(-5000));

  printResults('W403 Wholesale Janitorial readiness delta package harness', results);
}

main();
