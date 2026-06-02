#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const {
  assertCase,
  printResults
} = require('./lib/forge_harness_fixtures');

const root = path.resolve(__dirname, '..', '..');
const reportPath = path.join(root, 'archive', 'reports', 'w390_fixture_first_expansion_restart.md');
const w386PackageDir = path.join(root, 'archive', 'package_ready', 'w386_forge_source_pack_ready_artifact');
const w386PackageZip = path.join(root, 'archive', 'package_ready', 'w386_forge_source_pack_ready_artifact.zip');

const preservationScripts = [
  'harness:runtime-release-decision-gate-w389',
  'harness:final-source-pack-readiness-handoff-w388',
  'harness:pack-ready-artifact-package-w386'
];

const buildingMaterialsTerms = [
  'contractor account demand',
  'job order readiness',
  'item availability by branch',
  'special order status',
  'will-call pickup',
  'jobsite delivery',
  'substitutions',
  'margin leakage',
  'project fulfillment confidence'
];

const antiLeakTerms = [
  'dealer allocation',
  'style/color/size variants',
  'technician truck stock',
  'clinic supply substitutes',
  'QA release',
  'lot/release readiness',
  'food batch',
  'configured assembly',
  'generic industrial distribution'
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

function packageJson() {
  return JSON.parse(read(rootPath('package.json')));
}

function walkFiles(dir, prefix = '') {
  if (!exists(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    const fullPath = path.join(dir, entry.name);
    return entry.isDirectory() ? walkFiles(fullPath, rel) : [rel];
  });
}

function main() {
  const results = [];
  const report = exists(reportPath) ? read(reportPath) : '';
  const w389 = exists(rootPath('archive/reports/w389_runtime_release_decision_gate.md'))
    ? read(rootPath('archive/reports/w389_runtime_release_decision_gate.md'))
    : '';
  const w388 = exists(rootPath('archive/reports/w388_final_source_pack_readiness_handoff.md'))
    ? read(rootPath('archive/reports/w388_final_source_pack_readiness_handoff.md'))
    : '';
  const scripts = packageJson().scripts || {};
  const packageReadyFiles = walkFiles(rootPath('archive/package_ready'));
  const runtimeUploadArtifacts = packageReadyFiles.filter((file) =>
    /runtime|upload|deployment|filecabinet/i.test(file) &&
    !/^w386_forge_source_pack_ready_artifact\//.test(file)
  );

  assertCase(results, 'w390-w389-routing-baseline-preserved',
    w389.includes('Recommended path: Resume fixture-first industry expansion') &&
      report.includes('Use W389 Runtime Release Decision Gate and Next-Work Routing as the locked routing baseline') &&
      report.includes('No upload destination has been specified'),
    JSON.stringify({ w389: w389.slice(0, 1400), report: report.slice(0, 1400) }, null, 2));

  assertCase(results, 'w390-w388-archive-baseline-preserved',
    w388.includes('FORGE source-pack readiness is locked through W388') &&
      report.includes('W388 Final Source-Pack Readiness Handoff and Archive Lock') &&
      report.includes('archive/package_ready/w386_forge_source_pack_ready_artifact.zip'),
    JSON.stringify({ w388: w388.slice(0, 1200), report: report.slice(0, 1800) }, null, 2));

  assertCase(results, 'w390-w386-evidence-package-preserved',
    exists(w386PackageDir) &&
      exists(w386PackageZip) &&
      exists(path.join(w386PackageDir, 'PACKAGE_FILE_LIST_W386.txt')) &&
      report.includes('W386 package remains readiness evidence only'),
    JSON.stringify({ w386PackageDir, w386PackageZip }, null, 2));

  assertCase(results, 'w390-no-runtime-upload-package',
    runtimeUploadArtifacts.length === 0 &&
      report.includes('No runtime upload package was created'),
    JSON.stringify(runtimeUploadArtifacts, null, 2));

  assertCase(results, 'w390-no-live-smoke-no-upload-boundary',
    /No live smoke in W390/i.test(report) &&
      /No upload or deployment/i.test(report) &&
      /Do not upload or deploy/i.test(report),
    report.slice(0, 2500));

  assertCase(results, 'w390-next-lane-selection-rationale',
    report.includes('Building Materials / Contractor Supply & Project Fulfillment') &&
      report.includes('Keystone Building Supply') &&
      report.includes('adjacent to Dealer Hardgoods, Industrial Equipment, and Distribution') &&
      report.includes('Recommendation: proceed with Building Materials / Contractor Supply as the next fixture-first lane'),
    report.slice(0, 5000));

  assertCase(results, 'w390-building-materials-industry-distinctness',
    buildingMaterialsTerms.every((term) => report.includes(term)) &&
      report.includes('contractor account') &&
      report.includes('project fulfillment'),
    JSON.stringify(buildingMaterialsTerms, null, 2));

  assertCase(results, 'w390-cross-lane-anti-leak-wording',
    antiLeakTerms.every((term) => report.includes(term)) &&
      report.includes('Do not let Building Materials copy collapse into generic industrial distribution'),
    JSON.stringify(antiLeakTerms, null, 2));

  assertCase(results, 'w390-fixture-first-validation-posture',
    report.includes('Fixture-first only') &&
      report.includes('story scaffold') &&
      report.includes('No source-pack mutation was made in W390'),
    report.slice(0, 5000));

  assertCase(results, 'w390-roi-run-ux-boundaries-preserved',
    report.includes('ROI/Competitive remains flow-based') &&
      report.includes('Run path remains numbered and clickable only when verified Open-link authority exists') &&
      report.includes('Imported proof records remain collapsed by default'),
    report.slice(0, 6000));

  assertCase(results, 'w390-open-link-authority-and-claim-safety',
    report.includes('No fake Open links') &&
      report.includes('Open-link authority remains verified-import-only') &&
      report.includes('Measured ROI requires a customer baseline') &&
      report.includes('N/LLM remains advisory-only'),
    report.slice(0, 7000));

  assertCase(results, 'w390-preservation-scripts-registered',
    preservationScripts.every((script) => typeof scripts[script] === 'string') &&
      typeof scripts['harness:fixture-first-expansion-restart-w390'] === 'string',
    JSON.stringify(preservationScripts.map((script) => ({ script, command: scripts[script] || '' })), null, 2));

  assertCase(results, 'w390-no-regression-gates',
    report.includes('No package mutation') &&
      report.includes('No source-pack mutation') &&
      report.includes('No runner, adapter, record creation, import validation, or Open-link authority changes') &&
      report.includes('No new lane was added to runtime source packs in W390'),
    report.slice(-3000));

  printResults('W390 fixture-first expansion restart harness', results);
}

main();
