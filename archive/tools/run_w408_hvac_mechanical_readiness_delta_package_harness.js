#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

const {
  assertCase,
  printResults
} = require('./lib/forge_harness_fixtures');

const root = path.resolve(__dirname, '..', '..');
const packageRoot = path.join(root, 'archive', 'package_ready', 'w408_hvac_mechanical_readiness_delta');
const zipPath = path.join(root, 'archive', 'package_ready', 'w408_hvac_mechanical_readiness_delta.zip');
const reportPath = path.join(root, 'archive', 'reports', 'w408_hvac_mechanical_readiness_delta_package.md');
const w386PackageRoot = path.join(root, 'archive', 'package_ready', 'w386_forge_source_pack_ready_artifact');
const w386ZipPath = path.join(root, 'archive', 'package_ready', 'w386_forge_source_pack_ready_artifact.zip');
const w397PackageRoot = path.join(root, 'archive', 'package_ready', 'w397_building_materials_readiness_delta');
const w397ZipPath = path.join(root, 'archive', 'package_ready', 'w397_building_materials_readiness_delta.zip');
const w403PackageRoot = path.join(root, 'archive', 'package_ready', 'w403_wholesale_janitorial_readiness_delta');
const w403ZipPath = path.join(root, 'archive', 'package_ready', 'w403_wholesale_janitorial_readiness_delta.zip');

const expectedPackageFiles = [
  'PACKAGE_FILE_LIST_W408.txt',
  'PACKAGE_MANIFEST_W408.md',
  'PACKAGE_VERIFICATION_REPORT_W408.md',
  'archive/reports/w404_hvac_mechanical_fixture_first_selection.md',
  'archive/reports/w405_hvac_mechanical_fixture_story_proof.md',
  'archive/reports/w406_hvac_mechanical_second_fixture_decision.md',
  'archive/reports/w407_hvac_mechanical_source_pack_cleanup.md',
  'archive/tools/run_w404_hvac_mechanical_fixture_first_selection_harness.js',
  'archive/tools/run_w405_hvac_mechanical_fixture_story_proof_harness.js',
  'archive/tools/run_w406_hvac_mechanical_second_fixture_decision_harness.js',
  'archive/tools/run_w407_hvac_mechanical_source_pack_cleanup_harness.js',
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
  /w397_building_materials_readiness_delta/,
  /w403_wholesale_janitorial_readiness_delta/
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
  const packageFileListPath = path.join(packageRoot, 'PACKAGE_FILE_LIST_W408.txt');
  const listedFiles = exists(packageFileListPath)
    ? read(packageFileListPath).split(/\r?\n/).map((line) => line.trim()).filter(Boolean).sort()
    : [];
  const manifest = exists(path.join(packageRoot, 'PACKAGE_MANIFEST_W408.md'))
    ? read(path.join(packageRoot, 'PACKAGE_MANIFEST_W408.md'))
    : '';
  const packageVerification = exists(path.join(packageRoot, 'PACKAGE_VERIFICATION_REPORT_W408.md'))
    ? read(path.join(packageRoot, 'PACKAGE_VERIFICATION_REPORT_W408.md'))
    : '';
  const report = exists(reportPath) ? read(reportPath) : '';
  const scripts = packageJson().scripts || {};
  const packagedLanePacks = exists(path.join(packageRoot, 'src', 'contracts', 'lanePacks.js'))
    ? require(path.join(packageRoot, 'src', 'contracts', 'lanePacks.js'))
    : null;
  const hvacPack = packagedLanePacks && packagedLanePacks.LANE_PACKS.find((pack) => pack.packId === 'hvac-mechanical-contractor-supply-service-readiness');

  assertCase(results, 'w408-package-directory-and-zip-exist',
    exists(packageRoot) && exists(zipPath),
    JSON.stringify({ packageRoot, zipPath }, null, 2));

  assertCase(results, 'w408-required-files-present',
    expectedPackageFiles.every((file) => exists(path.join(packageRoot, file))),
    JSON.stringify(expectedPackageFiles.filter((file) => !exists(path.join(packageRoot, file))), null, 2));

  assertCase(results, 'w408-package-contents-expected-only',
    arraysEqual(packageFiles, expectedPackageFiles),
    JSON.stringify({ missing: expectedPackageFiles.filter((file) => !packageFiles.includes(file)), extra: packageFiles.filter((file) => !expectedPackageFiles.includes(file)) }, null, 2));

  assertCase(results, 'w408-package-file-list-matches-directory',
    arraysEqual(packageFiles, listedFiles),
    JSON.stringify({ packageFiles, listedFiles }, null, 2));

  assertCase(results, 'w408-no-disallowed-package-files',
    packageFiles.every((file) => !disallowedPatterns.some((pattern) => pattern.test(file))),
    JSON.stringify(packageFiles.filter((file) => disallowedPatterns.some((pattern) => pattern.test(file))), null, 2));

  assertCase(results, 'w408-zip-list-matches-package-file-list',
    exists(zipPath) && arraysEqual(zipEntries(), listedFiles),
    JSON.stringify({ zipEntries: zipEntries(), listedFiles }, null, 2));

  assertCase(results, 'w408-manifest-and-verification-scope',
    manifest.includes('HVAC/Mechanical readiness evidence after W407') &&
      manifest.includes('not an upload package') &&
      packageVerification.includes('HVAC/Mechanical readiness evidence package only') &&
      packageVerification.includes('No upload or deployment') &&
      packageVerification.includes('No live smoke') &&
      packageVerification.includes('No nested package contents'),
    JSON.stringify({ manifest: manifest.slice(0, 1200), packageVerification: packageVerification.slice(0, 1200) }, null, 2));

  assertCase(results, 'w408-packaged-hvac-source-valid',
    !!hvacPack &&
      hvacPack.laneId === 'hvac_mechanical_supply' &&
      packagedLanePacks.validateLanePack(hvacPack).valid === true &&
      packagedLanePacks.resolveLanePackFromEvidence({
        website: 'https://www.horizonairmechanicalsupply.com',
        categoryText: 'HVAC supply mechanical contractor equipment replacement parts branch counter stock warranty replacement backorder replenishment jobsite delivery will-call pickup',
        evidenceText: 'contractor account demand job or service order HVAC equipment availability replacement or service part branch location stock reserved substitute option warranty context pickup or jobsite delivery'
      }).packId === 'hvac-mechanical-contractor-supply-service-readiness',
    JSON.stringify({ hvacPack, validation: hvacPack && packagedLanePacks.validateLanePack(hvacPack) }, null, 2));

  assertCase(results, 'w408-baseline-reports-preserved',
    read(path.join(packageRoot, 'archive', 'reports', 'w407_hvac_mechanical_source_pack_cleanup.md')).includes('W407 HVAC/Mechanical source-pack cleanup harness: 16/16 passed') &&
      read(path.join(packageRoot, 'archive', 'reports', 'w406_hvac_mechanical_second_fixture_decision.md')).includes('W406 HVAC/Mechanical second fixture decision harness: 19/19 passed') &&
      read(path.join(packageRoot, 'archive', 'reports', 'w405_hvac_mechanical_fixture_story_proof.md')).includes('W405 HVAC/Mechanical fixture story proof harness: 15/15 passed') &&
      read(path.join(packageRoot, 'archive', 'reports', 'w404_hvac_mechanical_fixture_first_selection.md')).includes('W404 HVAC/Mechanical fixture-first selection harness: 15/15 passed'),
    'Packaged baseline reports did not preserve expected pass counts.');

  assertCase(results, 'w408-w403-w397-and-w386-packages-untouched',
    exists(w403PackageRoot) &&
      exists(w403ZipPath) &&
      exists(w397PackageRoot) &&
      exists(w397ZipPath) &&
      exists(w386PackageRoot) &&
      exists(w386ZipPath) &&
      report.includes('W386, W397, and W403 packages were not mutated') &&
      !packageFiles.some((file) => file.includes('w403_wholesale_janitorial_readiness_delta') || file.includes('w397_building_materials_readiness_delta') || file.includes('w386_forge_source_pack_ready_artifact')),
    JSON.stringify({ w403PackageRoot, w403ZipPath, w397PackageRoot, w397ZipPath, w386PackageRoot, w386ZipPath }, null, 2));

  assertCase(results, 'w408-readiness-evidence-only-boundary',
    report.includes('No live smoke in W408') &&
      report.includes('No upload or deployment') &&
      report.includes('No runtime upload package creation') &&
      report.includes('readiness evidence only') &&
      report.includes('not runtime code'),
    report.slice(0, 5000));

  assertCase(results, 'w408-preservation-scripts-registered',
    typeof scripts['harness:hvac-mechanical-readiness-delta-package-w408'] === 'string' &&
      typeof scripts['harness:hvac-mechanical-source-pack-cleanup-w407'] === 'string' &&
      typeof scripts['harness:hvac-mechanical-second-fixture-decision-w406'] === 'string' &&
      typeof scripts['harness:hvac-mechanical-fixture-story-proof-w405'] === 'string' &&
      typeof scripts['harness:hvac-mechanical-fixture-first-selection-w404'] === 'string' &&
      typeof scripts['harness:wholesale-janitorial-readiness-delta-package-w403'] === 'string' &&
      typeof scripts['harness:building-materials-readiness-delta-package-w397'] === 'string' &&
      typeof scripts['harness:pack-ready-artifact-package-w386'] === 'string',
    JSON.stringify({
      w408: scripts['harness:hvac-mechanical-readiness-delta-package-w408'],
      w407: scripts['harness:hvac-mechanical-source-pack-cleanup-w407'],
      w406: scripts['harness:hvac-mechanical-second-fixture-decision-w406'],
      w405: scripts['harness:hvac-mechanical-fixture-story-proof-w405'],
      w404: scripts['harness:hvac-mechanical-fixture-first-selection-w404'],
      w403: scripts['harness:wholesale-janitorial-readiness-delta-package-w403'],
      w397: scripts['harness:building-materials-readiness-delta-package-w397'],
      w386: scripts['harness:pack-ready-artifact-package-w386']
    }, null, 2));

  assertCase(results, 'w408-no-regression-gates',
    report.includes('No source-pack mutation in W408') &&
      report.includes('No runner, adapter, record creation, import validation, or Open-link authority changes') &&
      report.includes('No fake Open links') &&
      report.includes('completed-result import validation was not changed') &&
      report.includes('W408 no-regression gates passed'),
    report.slice(-5000));

  printResults('W408 HVAC/Mechanical readiness delta package harness', results);
}

main();
