#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const {
  assertCase,
  printResults
} = require('./lib/forge_harness_fixtures');

const root = path.resolve(__dirname, '..', '..');
const handoffPath = path.join(root, 'archive', 'reports', 'w388_final_source_pack_readiness_handoff.md');
const packageDir = path.join(root, 'archive', 'package_ready', 'w386_forge_source_pack_ready_artifact');
const packageZip = path.join(root, 'archive', 'package_ready', 'w386_forge_source_pack_ready_artifact.zip');

const readyLanes = [
  'Dealer Hardgoods',
  'Apparel/Retail',
  'Parts/Service',
  'Medical/Dental',
  'Food/Beverage',
  'Industrial Equipment',
  'Life Sciences'
];

const requiredPaths = [
  'archive/reports/w387_release_prep_package_handoff.md',
  'archive/reports/w386_pack_ready_artifact_package.md',
  'archive/PACK_READY_ARTIFACT_MANIFEST_W385.md',
  'archive/package_ready/w386_forge_source_pack_ready_artifact/PACK_READY_PACKAGE_MANIFEST_W386.md',
  'archive/package_ready/w386_forge_source_pack_ready_artifact/PACKAGE_FILE_LIST_W386.txt'
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

function main() {
  const results = [];
  const handoff = exists(handoffPath) ? read(handoffPath) : '';
  const w387 = exists(rootPath('archive/reports/w387_release_prep_package_handoff.md'))
    ? read(rootPath('archive/reports/w387_release_prep_package_handoff.md'))
    : '';

  assertCase(results, 'w388-handoff-note-exists',
    exists(handoffPath) && handoff.includes('W388: Final Source-Pack Readiness Handoff and Archive Lock'),
    handoffPath);

  assertCase(results, 'w388-package-identity-preserved',
    exists(packageDir) &&
      exists(packageZip) &&
      handoff.includes('archive/package_ready/w386_forge_source_pack_ready_artifact/') &&
      handoff.includes('archive/package_ready/w386_forge_source_pack_ready_artifact.zip'),
    JSON.stringify({ packageDir, packageZip }, null, 2));

  assertCase(results, 'w388-source-pack-ready-lane-list-preserved',
    readyLanes.every((lane) => handoff.includes(lane)) &&
      handoff.includes('source-pack-ready'),
    JSON.stringify(readyLanes, null, 2));

  assertCase(results, 'w388-w386-w387-boundaries-preserved',
    requiredPaths.every((relPath) => exists(rootPath(relPath))) &&
      handoff.includes('W387') &&
      handoff.includes('W386') &&
      /Do not upload/i.test(handoff) &&
      /not runtime code/i.test(handoff),
    JSON.stringify(requiredPaths.filter((relPath) => !exists(rootPath(relPath))), null, 2));

  assertCase(results, 'w388-no-upload-deployment-posture',
    /No upload or deployment/i.test(handoff) &&
      /Do not upload/i.test(handoff) &&
      /separate runtime upload\/release artifact review/i.test(handoff),
    handoff.slice(0, 2000));

  assertCase(results, 'w388-no-live-smoke-posture',
    /No live smoke/i.test(handoff) &&
      /live smoke is only justified/i.test(handoff) &&
      /runner behavior/i.test(handoff) &&
      /Open-link authority checks/i.test(handoff),
    handoff.slice(0, 3000));

  assertCase(results, 'w388-authority-separation-preserved',
    /N\/LLM remains advisory-only/i.test(handoff) &&
      /Open-link authority remains verified-import-only/i.test(handoff) &&
      /Source packs remain no-write/i.test(handoff) &&
      /Measured ROI requires a customer baseline/i.test(handoff),
    handoff.slice(0, 3000));

  assertCase(results, 'w388-validation-commands-present',
    handoff.includes('npm run harness:final-source-pack-readiness-handoff-w388') &&
      handoff.includes('npm run harness:release-prep-package-handoff-w387') &&
      handoff.includes('npm run harness:pack-ready-artifact-package-w386') &&
      handoff.includes('npm run harness:pack-ready-artifact-manifest-w385'),
    handoff.slice(0, 4000));

  assertCase(results, 'w388-latest-pass-results-present',
    handoff.includes('W388 final source-pack readiness handoff harness: 10/10 passed') &&
      handoff.includes('W387 release-prep package handoff harness: 10/10 passed') &&
      handoff.includes('W386 pack-ready artifact package harness: 8/8 passed') &&
      handoff.includes('W385 pack-ready artifact manifest harness: 6/6 passed'),
    handoff.slice(0, 5000));

  assertCase(results, 'w388-release-prep-posture-inherited',
    /ready to hand off, attach, or archive/i.test(w387) &&
      /not runtime code/i.test(w387) &&
      /not an upload package/i.test(w387) &&
      /Go: lock W388/i.test(handoff),
    JSON.stringify({ w387: w387.slice(0, 1200), handoff: handoff.slice(-1200) }, null, 2));

  printResults('W388 final source-pack readiness handoff harness', results);
}

main();
