#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const {
  assertCase,
  printResults
} = require('./lib/forge_harness_fixtures');

const root = path.resolve(__dirname, '..', '..');
const reportPath = path.join(root, 'archive', 'reports', 'w389_runtime_release_decision_gate.md');
const packageRoot = path.join(root, 'archive', 'package_ready');
const evidencePackageDir = path.join(packageRoot, 'w386_forge_source_pack_ready_artifact');
const evidencePackageZip = path.join(packageRoot, 'w386_forge_source_pack_ready_artifact.zip');

const preservationScripts = [
  'harness:final-source-pack-readiness-handoff-w388',
  'harness:release-prep-package-handoff-w387',
  'harness:pack-ready-artifact-package-w386',
  'harness:pack-ready-artifact-manifest-w385'
];

const decisionPathLabels = [
  'Prepare runtime upload/release artifact review',
  'Resume fixture-first industry expansion',
  'Harden release-path readiness before artifact creation'
];

const liveSmokeTriggers = [
  'runner behavior',
  'adapter behavior',
  'record creation behavior',
  'completed-result import validation',
  'Open-link authority checks',
  'generated proof-role behavior',
  'deployment/upload path behavior'
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

function walkFiles(dir, prefix = '') {
  if (!exists(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    const fullPath = path.join(dir, entry.name);
    return entry.isDirectory() ? walkFiles(fullPath, rel) : [rel];
  });
}

function packageJson() {
  return JSON.parse(read(rootPath('package.json')));
}

function main() {
  const results = [];
  const report = exists(reportPath) ? read(reportPath) : '';
  const w388 = exists(rootPath('archive/reports/w388_final_source_pack_readiness_handoff.md'))
    ? read(rootPath('archive/reports/w388_final_source_pack_readiness_handoff.md'))
    : '';
  const w387 = exists(rootPath('archive/reports/w387_release_prep_package_handoff.md'))
    ? read(rootPath('archive/reports/w387_release_prep_package_handoff.md'))
    : '';
  const scripts = packageJson().scripts || {};
  const packageReadyFiles = walkFiles(packageRoot);
  const runtimeUploadArtifacts = packageReadyFiles.filter((file) =>
    /runtime|upload|deployment|filecabinet/i.test(file) &&
    !/^w386_forge_source_pack_ready_artifact\//.test(file)
  );

  assertCase(results, 'w389-w388-archive-baseline-preserved',
    w388.includes('FORGE source-pack readiness is locked through W388') &&
      w388.includes('archive/package_ready/w386_forge_source_pack_ready_artifact.zip') &&
      report.includes('Use W388 Final Source-Pack Readiness Handoff and Archive Lock as the locked archive baseline'),
    JSON.stringify({ w388: w388.slice(0, 1200), report: report.slice(0, 1200) }, null, 2));

  assertCase(results, 'w389-w386-evidence-package-preserved',
    exists(evidencePackageDir) &&
      exists(evidencePackageZip) &&
      exists(path.join(evidencePackageDir, 'PACKAGE_FILE_LIST_W386.txt')) &&
      report.includes('Do not mutate the W386 evidence package'),
    JSON.stringify({ evidencePackageDir, evidencePackageZip }, null, 2));

  assertCase(results, 'w389-w387-release-prep-posture-preserved',
    w387.includes('not runtime code') &&
      w387.includes('not an upload package') &&
      /W387 confirms? the W386 package is clean for handoff\/archive\/review and is not runtime code/i.test(report),
    JSON.stringify({ w387: w387.slice(0, 1200), report: report.slice(0, 1600) }, null, 2));

  assertCase(results, 'w389-runtime-upload-package-not-created',
    runtimeUploadArtifacts.length === 0 &&
      report.includes('No runtime upload package was created'),
    JSON.stringify(runtimeUploadArtifacts, null, 2));

  assertCase(results, 'w389-decision-paths-documented',
    decisionPathLabels.every((label) => report.includes(label)) &&
      /Criteria for Choosing Each Path/i.test(report),
    JSON.stringify(decisionPathLabels, null, 2));

  assertCase(results, 'w389-recommended-next-path-documented',
    report.includes('Recommended path') &&
      report.includes('Resume fixture-first industry expansion') &&
      report.includes('because no explicit runtime upload destination or upload posture is currently specified'),
    report.slice(0, 4000));

  assertCase(results, 'w389-no-upload-deployment-boundary',
    /No upload or deployment/i.test(report) &&
      /Do not upload or deploy/i.test(report) &&
      /Do not create deployment\/FileCabinet artifacts/i.test(report),
    report.slice(0, 3000));

  assertCase(results, 'w389-no-live-smoke-boundary',
    /No live smoke in W389/i.test(report) &&
      /Live smoke remains off/i.test(report),
    report.slice(0, 3000));

  assertCase(results, 'w389-authority-separation-preserved',
    /N\/LLM remains advisory-only/i.test(report) &&
      /Open-link authority remains verified-import-only/i.test(report) &&
      /Source packs remain no-write/i.test(report) &&
      /W386 is readiness evidence, not runtime code/i.test(report),
    report.slice(0, 3500));

  assertCase(results, 'w389-live-smoke-triggers-documented',
    liveSmokeTriggers.every((trigger) => report.includes(trigger)),
    JSON.stringify(liveSmokeTriggers, null, 2));

  assertCase(results, 'w389-preservation-scripts-registered',
    preservationScripts.every((script) => typeof scripts[script] === 'string') &&
      typeof scripts['harness:runtime-release-decision-gate-w389'] === 'string',
    JSON.stringify(preservationScripts.map((script) => ({ script, command: scripts[script] || '' })), null, 2));

  assertCase(results, 'w389-no-regression-gates-documented',
    report.includes('No package mutation') &&
      report.includes('No source-pack mutation') &&
      report.includes('No lane addition') &&
      report.includes('No runner, adapter, record creation, import validation, or Open-link authority changes'),
    report.slice(-2500));

  printResults('W389 runtime release decision gate harness', results);
}

main();
