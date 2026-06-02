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
const fileListPath = path.join(packageRoot, 'PACKAGE_FILE_LIST_W386.txt');

const directoryEntries = [
  'archive',
  'archive/reports',
  'archive/tools',
  'src',
  'src/contracts'
];

const disallowedPackagePatterns = [
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

function packageFile(relPath) {
  return path.join(packageRoot, relPath);
}

function readPackageFile(relPath) {
  return read(packageFile(relPath));
}

function listPackageFiles(dir = packageRoot, prefix = '') {
  if (!exists(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    const fullPath = path.join(dir, entry.name);
    return entry.isDirectory() ? listPackageFiles(fullPath, rel) : [rel];
  }).sort();
}

function readFileList() {
  if (!exists(fileListPath)) return [];
  return read(fileListPath).split(/\r?\n/).map((line) => line.trim()).filter(Boolean).sort();
}

function zipEntries() {
  if (!exists(zipPath)) return [];
  return childProcess
    .execFileSync('unzip', ['-Z1', zipPath], { encoding: 'utf8' })
    .split(/\r?\n/)
    .map((entry) => entry.replace(/^\.\//, '').replace(/\/$/, ''))
    .filter(Boolean)
    .filter((entry) => !directoryEntries.includes(entry))
    .sort();
}

function arraysEqual(a, b) {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function packageText(paths) {
  return paths.map((relPath) => exists(packageFile(relPath)) ? readPackageFile(relPath) : '').join('\n\n');
}

function main() {
  const results = [];
  const actualFiles = listPackageFiles();
  const listedFiles = readFileList();
  const zipFiles = zipEntries();
  const w385Manifest = exists(packageFile('archive/PACK_READY_ARTIFACT_MANIFEST_W385.md'))
    ? readPackageFile('archive/PACK_READY_ARTIFACT_MANIFEST_W385.md')
    : '';
  const w386Report = exists(path.join(root, 'archive', 'reports', 'w386_pack_ready_artifact_package.md'))
    ? read(path.join(root, 'archive', 'reports', 'w386_pack_ready_artifact_package.md'))
    : '';
  const w387Report = exists(path.join(root, 'archive', 'reports', 'w387_release_prep_package_handoff.md'))
    ? read(path.join(root, 'archive', 'reports', 'w387_release_prep_package_handoff.md'))
    : '';
  const packageBoundaryText = packageText([
    'PACK_READY_PACKAGE_MANIFEST_W386.md',
    'PACKAGE_VERIFICATION_REPORT_W386.md',
    'archive/PACK_READY_ARTIFACT_MANIFEST_W385.md'
  ]);

  assertCase(results, 'w387-w386-package-directory-exists',
    exists(packageRoot) && exists(fileListPath) && actualFiles.length > 0,
    JSON.stringify({ packageRoot, fileListPath, actualFiles }, null, 2));

  assertCase(results, 'w387-w386-zip-exists-and-listable',
    exists(zipPath) && zipFiles.length > 0,
    JSON.stringify({ zipPath, zipFiles }, null, 2));

  assertCase(results, 'w387-package-file-list-matches-zip-list',
    arraysEqual(listedFiles, zipFiles) && arraysEqual(actualFiles, listedFiles),
    JSON.stringify({ actualFiles, listedFiles, zipFiles }, null, 2));

  assertCase(results, 'w387-w385-manifest-alignment-preserved',
    w385Manifest.includes('src/contracts/lanePacks.js') &&
      w385Manifest.includes('archive/tools/run_w384_pack_readiness_packaging_harness.js') &&
      w385Manifest.includes('archive/reports/w384_pack_readiness_packaging.md') &&
      w385Manifest.includes('Go for pack-ready artifact preparation'),
    w385Manifest.slice(0, 1500));

  assertCase(results, 'w387-no-disallowed-package-files',
    actualFiles.every((file) => !disallowedPackagePatterns.some((pattern) => pattern.test(file))) &&
      zipFiles.every((file) => !disallowedPackagePatterns.some((pattern) => pattern.test(file))),
    JSON.stringify({ actualBad: actualFiles.filter((file) => disallowedPackagePatterns.some((pattern) => pattern.test(file))), zipBad: zipFiles.filter((file) => disallowedPackagePatterns.some((pattern) => pattern.test(file))) }, null, 2));

  assertCase(results, 'w387-no-upload-deployment-posture-clear',
    /No upload or deployment/i.test(packageBoundaryText) &&
      /not an upload package/i.test(w386Report) &&
      /Do not upload/i.test(w386Report) &&
      /Do not upload or deploy/i.test(w387Report),
    JSON.stringify({ packageBoundaryText: packageBoundaryText.slice(0, 1200), w386Report: w386Report.slice(0, 1200), w387Report: w387Report.slice(0, 1200) }, null, 2));

  assertCase(results, 'w387-no-live-smoke-posture-clear',
    /No live smoke/i.test(packageBoundaryText) &&
      /No live smoke was run/i.test(w386Report) &&
      /No live smoke in W387/i.test(w387Report),
    JSON.stringify({ packageBoundaryText: packageBoundaryText.slice(0, 1200), w386Report: w386Report.slice(0, 1200), w387Report: w387Report.slice(0, 1200) }, null, 2));

  assertCase(results, 'w387-source-pack-readiness-scope-clear',
    /source-pack readiness artifact package/i.test(packageBoundaryText) &&
      /source-pack readiness artifact package/i.test(w386Report) &&
      /source-pack readiness evidence package/i.test(w387Report) &&
      /not runtime code/i.test(w387Report),
    w387Report.slice(0, 1800));

  assertCase(results, 'w387-authority-separation-preserved',
    /Open links remain clickable only when verified imported records provide Open-link authority/i.test(packageBoundaryText) &&
      /N\/LLM remains advisory-only/i.test(packageBoundaryText) &&
      /Source packs do not create records/i.test(packageBoundaryText) &&
      /source packs remain no-write/i.test(w387Report),
    packageBoundaryText.slice(0, 2500));

  assertCase(results, 'w387-handoff-go-no-go-present',
    /Go: lock W387 release-prep review/i.test(w387Report) &&
      /what the package proves/i.test(w387Report) &&
      /what the package does not prove/i.test(w387Report) &&
      /what would require live smoke later/i.test(w387Report),
    w387Report.slice(0, 2500));

  printResults('W387 release-prep package handoff harness', results);
}

main();
