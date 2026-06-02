#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

const {
  assertCase,
  printResults
} = require('./lib/forge_harness_fixtures');

const root = path.resolve(__dirname, '..', '..');
const packageRoot = path.join(root, 'archive', 'package_ready', 'w397_building_materials_readiness_delta');
const zipPath = path.join(root, 'archive', 'package_ready', 'w397_building_materials_readiness_delta.zip');
const reportPath = path.join(root, 'archive', 'reports', 'w397_building_materials_readiness_delta_package.md');
const w386PackageRoot = path.join(root, 'archive', 'package_ready', 'w386_forge_source_pack_ready_artifact');
const w386ZipPath = path.join(root, 'archive', 'package_ready', 'w386_forge_source_pack_ready_artifact.zip');

const expectedPackageFiles = [
  'BUILDING_MATERIALS_PACKAGE_MANIFEST_W397.md',
  'PACKAGE_FILE_LIST_W397.txt',
  'PACKAGE_VERIFICATION_REPORT_W397.md',
  'archive/reports/w391_building_materials_fixture_story_proof.md',
  'archive/reports/w393_wip_routing_best_effort_diagnostics.md',
  'archive/reports/w394_building_materials_source_pack_toggle_guard.md',
  'archive/reports/w395_building_materials_second_fixture_regression.md',
  'archive/reports/w396_building_materials_pack_readiness.md',
  'archive/tools/run_w391_building_materials_fixture_story_proof_harness.js',
  'archive/tools/run_w393_wip_routing_best_effort_diagnostics_harness.js',
  'archive/tools/run_w394_building_materials_source_pack_toggle_guard_harness.js',
  'archive/tools/run_w395_building_materials_second_fixture_regression_harness.js',
  'archive/tools/run_w396_building_materials_pack_readiness_harness.js',
  'idb-drawer.user.js',
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
  /\.zip$/i
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
  const packageFileListPath = path.join(packageRoot, 'PACKAGE_FILE_LIST_W397.txt');
  const listedFiles = exists(packageFileListPath)
    ? read(packageFileListPath).split(/\r?\n/).map((line) => line.trim()).filter(Boolean).sort()
    : [];
  const manifest = exists(path.join(packageRoot, 'BUILDING_MATERIALS_PACKAGE_MANIFEST_W397.md'))
    ? read(path.join(packageRoot, 'BUILDING_MATERIALS_PACKAGE_MANIFEST_W397.md'))
    : '';
  const packageVerification = exists(path.join(packageRoot, 'PACKAGE_VERIFICATION_REPORT_W397.md'))
    ? read(path.join(packageRoot, 'PACKAGE_VERIFICATION_REPORT_W397.md'))
    : '';
  const report = exists(reportPath) ? read(reportPath) : '';
  const scripts = packageJson().scripts || {};
  const packagedLanePacks = exists(path.join(packageRoot, 'src', 'contracts', 'lanePacks.js'))
    ? require(path.join(packageRoot, 'src', 'contracts', 'lanePacks.js'))
    : null;
  const buildingPack = packagedLanePacks && packagedLanePacks.LANE_PACKS.find((pack) => pack.packId === 'building-materials-contractor-supply-project-fulfillment');

  assertCase(results, 'w397-package-directory-and-zip-exist',
    exists(packageRoot) && exists(zipPath),
    JSON.stringify({ packageRoot, zipPath }, null, 2));

  assertCase(results, 'w397-required-files-present',
    expectedPackageFiles.every((file) => exists(path.join(packageRoot, file))),
    JSON.stringify(expectedPackageFiles.filter((file) => !exists(path.join(packageRoot, file))), null, 2));

  assertCase(results, 'w397-package-contents-expected-only',
    arraysEqual(packageFiles, expectedPackageFiles),
    JSON.stringify({ missing: expectedPackageFiles.filter((file) => !packageFiles.includes(file)), extra: packageFiles.filter((file) => !expectedPackageFiles.includes(file)) }, null, 2));

  assertCase(results, 'w397-package-file-list-matches-directory',
    arraysEqual(packageFiles, listedFiles),
    JSON.stringify({ packageFiles, listedFiles }, null, 2));

  assertCase(results, 'w397-no-disallowed-package-files',
    packageFiles.every((file) => !disallowedPatterns.some((pattern) => pattern.test(file))),
    JSON.stringify(packageFiles.filter((file) => disallowedPatterns.some((pattern) => pattern.test(file))), null, 2));

  assertCase(results, 'w397-zip-list-matches-package-file-list',
    exists(zipPath) && arraysEqual(zipEntries(), listedFiles),
    JSON.stringify({ zipEntries: zipEntries(), listedFiles }, null, 2));

  assertCase(results, 'w397-manifest-and-verification-scope',
    manifest.includes('Building Materials readiness evidence delta after W386') &&
      manifest.includes('not an upload package') &&
      packageVerification.includes('Building Materials readiness evidence package only') &&
      packageVerification.includes('No upload or deployment') &&
      packageVerification.includes('No live smoke'),
    JSON.stringify({ manifest: manifest.slice(0, 1200), packageVerification: packageVerification.slice(0, 1200) }, null, 2));

  assertCase(results, 'w397-packaged-building-materials-source-valid',
    !!buildingPack &&
      buildingPack.laneId === 'building_materials' &&
      packagedLanePacks.validateLanePack(buildingPack).valid === true &&
      packagedLanePacks.resolveLanePackFromEvidence({
        website: 'https://www.keystonebuildingsupply.com',
        categoryText: 'building materials lumber doors windows fasteners tools contractor supply special order materials branch availability jobsite delivery will-call pickup substitutions project fulfillment margin leakage',
        evidenceText: 'contractor account demand job order readiness branch item availability special order status will-call pickup jobsite delivery readiness substitutions margin leakage project fulfillment confidence'
      }).packId === 'building-materials-contractor-supply-project-fulfillment',
    JSON.stringify({ buildingPack, validation: buildingPack && packagedLanePacks.validateLanePack(buildingPack) }, null, 2));

  assertCase(results, 'w397-baseline-reports-preserved',
    read(path.join(packageRoot, 'archive', 'reports', 'w396_building_materials_pack_readiness.md')).includes('W396 Building Materials pack-readiness harness: 16/16 passed') &&
      read(path.join(packageRoot, 'archive', 'reports', 'w395_building_materials_second_fixture_regression.md')).includes('W395 Building Materials second fixture regression harness: 17/17 passed') &&
      read(path.join(packageRoot, 'archive', 'reports', 'w394_building_materials_source_pack_toggle_guard.md')).includes('W394 Building Materials source-pack toggle guard harness: 18/18 passed') &&
      read(path.join(packageRoot, 'archive', 'reports', 'w393_wip_routing_best_effort_diagnostics.md')).includes('W393 WIP routing best-effort diagnostics harness: 15/15 passed') &&
      read(path.join(packageRoot, 'archive', 'reports', 'w391_building_materials_fixture_story_proof.md')).includes('W391 Building Materials fixture-first story proof harness: 15/15 passed'),
    'Packaged baseline reports did not preserve expected pass counts.');

  assertCase(results, 'w397-w386-package-untouched',
    exists(w386PackageRoot) &&
      exists(w386ZipPath) &&
      report.includes('W386 source-pack readiness package was not mutated') &&
      !packageFiles.some((file) => file.includes('w386_forge_source_pack_ready_artifact')),
    JSON.stringify({ w386PackageRoot, w386ZipPath }, null, 2));

  assertCase(results, 'w397-readiness-evidence-only-boundary',
    report.includes('No live smoke in W397') &&
      report.includes('No upload or deployment') &&
      report.includes('No runtime upload package creation') &&
      report.includes('readiness evidence only') &&
      report.includes('not runtime code'),
    report.slice(0, 5000));

  assertCase(results, 'w397-preservation-scripts-registered',
    typeof scripts['harness:building-materials-readiness-delta-package-w397'] === 'string' &&
      typeof scripts['harness:building-materials-pack-readiness-w396'] === 'string' &&
      typeof scripts['harness:building-materials-second-fixture-regression-w395'] === 'string' &&
      typeof scripts['harness:building-materials-source-pack-toggle-guard-w394'] === 'string' &&
      typeof scripts['harness:wip-routing-best-effort-diagnostics-w393'] === 'string' &&
      typeof scripts['harness:building-materials-fixture-story-proof-w391'] === 'string' &&
      typeof scripts['harness:pack-ready-artifact-package-w386'] === 'string',
    JSON.stringify({
      w397: scripts['harness:building-materials-readiness-delta-package-w397'],
      w396: scripts['harness:building-materials-pack-readiness-w396'],
      w395: scripts['harness:building-materials-second-fixture-regression-w395'],
      w394: scripts['harness:building-materials-source-pack-toggle-guard-w394'],
      w393: scripts['harness:wip-routing-best-effort-diagnostics-w393'],
      w391: scripts['harness:building-materials-fixture-story-proof-w391'],
      w386: scripts['harness:pack-ready-artifact-package-w386']
    }, null, 2));

  assertCase(results, 'w397-no-regression-gates',
    report.includes('No source-pack mutation in W397') &&
      report.includes('No runner, adapter, record creation, import validation, or Open-link authority changes') &&
      report.includes('No fake Open links') &&
      report.includes('completed-result import validation was not changed') &&
      report.includes('W397 no-regression gates passed'),
    report.slice(-5000));

  printResults('W397 Building Materials readiness delta package harness', results);
}

main();
