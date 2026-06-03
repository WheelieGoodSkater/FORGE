#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const {
  assertCase,
  printResults
} = require('./lib/forge_harness_fixtures');

const root = path.resolve(__dirname, '..', '..');
const reportPath = path.join(root, 'archive', 'reports', 'w410_larger_smoke_series_design_gate.md');
const w409ReportPath = path.join(root, 'archive', 'reports', 'w409_comfortable_lane_hardening_matrix.md');
const packageDirs = [
  'archive/package_ready/w386_forge_source_pack_ready_artifact',
  'archive/package_ready/w397_building_materials_readiness_delta',
  'archive/package_ready/w403_wholesale_janitorial_readiness_delta',
  'archive/package_ready/w408_hvac_mechanical_readiness_delta'
];
const packageZips = [
  'archive/package_ready/w386_forge_source_pack_ready_artifact.zip',
  'archive/package_ready/w397_building_materials_readiness_delta.zip',
  'archive/package_ready/w403_wholesale_janitorial_readiness_delta.zip',
  'archive/package_ready/w408_hvac_mechanical_readiness_delta.zip'
];

const comfortableLanes = [
  'Dealer Hardgoods / Dealer Channel Availability',
  'Apparel & Accessories / Specialty Retail',
  'Parts & Service / Field Service Operations',
  'Medical/Dental Supply & Equipment',
  'Food/Beverage / Batch and Promotion Readiness',
  'Industrial Equipment / Configured Equipment Readiness',
  'Life Sciences / Regulated Supply & Release',
  'Building Materials / Contractor Supply & Project Fulfillment',
  'Wholesale Janitorial / Contract Replenishment',
  'HVAC / Mechanical Contractor Supply & Service Readiness'
];

const minimumSmokeLanes = [
  'Dealer Hardgoods / Dealer Channel Availability',
  'HVAC / Mechanical Contractor Supply & Service Readiness',
  'Parts & Service / Field Service Operations',
  'Life Sciences / Regulated Supply & Release',
  'Food/Beverage / Batch and Promotion Readiness'
];

const candidateFields = [
  'prospect name',
  'website',
  'poorly created sales rep notes',
  'intended lane',
  'why the candidate belongs in the lane',
  'near-neighbor lane confusion risk',
  'Manufacturing/WIP toggle posture',
  'expected proof roles',
  'expected Open-link authority behavior',
  'expected ROI baseline caution',
  'expected competitive/advisory caution',
  'stop conditions'
];

const evidenceFields = [
  'drawer version and block marker',
  'prospect name, website, and notes',
  'selected lane and source-pack confidence',
  'website/category evidence state',
  'advisory inference state',
  'Build/Run result state',
  'returned records and Open-link count',
  'Run path and clickable Open-link behavior',
  'ROI/Competitive flow state',
  'proof guardrails and confidence separation',
  'trace export path',
  'pass/fail against intended lane',
  'any runner/import/Open-link errors'
];

const stopRules = [
  'completed-result import validation regresses',
  'fake Open links appear',
  'real Open links are lost for verified imported records',
  'wrong lane selection causes unsafe live build behavior',
  'Manufacturing/WIP is enabled unexpectedly',
  'runner or adapter behavior changes unexpectedly',
  'a source-pack gap makes remaining smoke misleading',
  'upload/deployment is accidentally introduced'
];

function exists(relPath) {
  return fs.existsSync(path.join(root, relPath));
}

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function packageJson() {
  return JSON.parse(read(path.join(root, 'package.json')));
}

function main() {
  const results = [];
  const report = fs.existsSync(reportPath) ? read(reportPath) : '';
  const w409Report = fs.existsSync(w409ReportPath) ? read(w409ReportPath) : '';
  const scripts = packageJson().scripts || {};

  assertCase(results, 'w410-w409-hardening-baseline-preserved',
    w409Report.includes('W409 comfortable lane hardening matrix harness: 17/17 passed') &&
      w409Report.includes('Lock the comfortable lane hardening matrix and prepare smoke-series design') &&
      report.includes('Use W409 Comfortable Lane Hardening Matrix and Smoke-Readiness Gate as the locked lane-hardening baseline'),
    JSON.stringify({ w409: w409Report.slice(0, 1800), w410: report.slice(0, 1800) }, null, 2));

  assertCase(results, 'w410-comfortable-lane-set-preserved',
    comfortableLanes.every((lane) => report.includes(lane)) &&
      report.includes('W409 verified the comfortable lane matrix') &&
      report.includes('Apparel/Retail is ready but watch store/ecommerce and transfer-risk wording') &&
      report.includes('Industrial Equipment is ready but watch Manufacturing/WIP guardrails'),
    JSON.stringify(comfortableLanes, null, 2));

  assertCase(results, 'w410-minimum-smoke-set-selected',
    minimumSmokeLanes.every((lane) => report.includes(lane)) &&
      report.includes('Recommended minimum smoke set') &&
      report.includes('| 1 | Dealer Hardgoods / Dealer Channel Availability |') &&
      report.includes('| 2 | HVAC / Mechanical Contractor Supply & Service Readiness |') &&
      report.includes('| 3 | Parts & Service / Field Service Operations |') &&
      report.includes('| 4 | Life Sciences / Regulated Supply & Release |') &&
      report.includes('| 5 | Food/Beverage / Batch and Promotion Readiness |'),
    report.slice(0, 5000));

  assertCase(results, 'w410-candidate-requirements-documented',
    candidateFields.every((field) => report.includes(field)) &&
      report.includes('Each W411 candidate packet must include'),
    JSON.stringify(candidateFields, null, 2));

  assertCase(results, 'w410-candidate-quality-rules-documented',
    report.includes('Poorly created notes should be messy but useful') &&
      report.includes('Notes must not secretly spoon-feed exact source-pack vocabulary') &&
      report.includes('Website/category evidence owns lane identity') &&
      report.includes('Messy notes shape pain, ROI, objections, and demo flow only') &&
      report.includes('N/LLM remains advisory-only'),
    report.slice(0, 8000));

  assertCase(results, 'w410-execution-preconditions-documented',
    report.includes('Explicit user approval to run the smoke series') &&
      report.includes('Installed drawer/runtime version is confirmed') &&
      report.includes('W409 matrix still passes') &&
      report.includes('W408, W403, W397, and W386 package baselines still pass') &&
      report.includes('Manufacturing/WIP toggle policy is confirmed per candidate'),
    report.slice(0, 10000));

  assertCase(results, 'w410-evidence-capture-checklist-documented',
    evidenceFields.every((field) => report.includes(field)),
    JSON.stringify(evidenceFields, null, 2));

  assertCase(results, 'w410-stop-rules-documented',
    stopRules.every((rule) => report.includes(rule)) &&
      report.includes('Continue only if failures are story-only, safely scoped, and fixture-patchable without integration risk'),
    JSON.stringify(stopRules, null, 2));

  assertCase(results, 'w410-manufacturing-wip-policy-documented',
    report.includes('Manufacturing/WIP off') &&
      report.includes('Manufacturing on only if candidate requires it; WIP off unless explicitly scoped') &&
      report.includes('Industrial Equipment: run only if Manufacturing/WIP routing safety is explicitly in scope') &&
      report.includes('Manufacturing/WIP is not defaulted into non-manufacturing lanes') &&
      report.includes('W393 WIP routing best-effort diagnostics were not weakened'),
    report.slice(0, 14000));

  assertCase(results, 'w410-open-link-authority-preservation',
    report.includes('Open-link authority remains verified-import-only') &&
      report.includes('returned records and Open-link count') &&
      report.includes('Run path and clickable Open-link behavior') &&
      report.includes('fake Open links appear'),
    report.slice(0, 14000));

  assertCase(results, 'w410-completed-result-import-validation-preservation',
    report.includes('completed-result import validation remains unchanged') &&
      report.includes('completed-result import validation regresses') &&
      report.includes('No runner, adapter, record creation, completed-result import validation, or Open-link authority changes'),
    report.slice(0, 16000));

  assertCase(results, 'w410-no-live-smoke-no-upload-boundary',
    report.includes('No live smoke in W410') &&
      report.includes('No upload or deployment') &&
      report.includes('No runtime upload package was created') &&
      report.includes('does not run live smoke'),
    report.slice(0, 2600));

  assertCase(results, 'w410-no-runtime-package-creation',
    !exists('archive/package_ready/w410_larger_smoke_series_design_gate') &&
      !exists('archive/package_ready/w410_larger_smoke_series_design_gate.zip') &&
      report.includes('No runtime upload package creation'),
    'W410 must stay design-only.');

  assertCase(results, 'w410-no-source-pack-mutation',
    report.includes('No source-pack mutation in W410') &&
      report.includes('No source packs were mutated') &&
      report.includes('Do not run smoke yet'),
    report.slice(0, 6000));

  assertCase(results, 'w410-package-baseline-preservation',
    packageDirs.every(exists) &&
      packageZips.every(exists) &&
      report.includes('W386, W397, W403, and W408 packages were not mutated') &&
      report.includes('Evidence packages are not treated as runtime code'),
    JSON.stringify({ packageDirs, packageZips }, null, 2));

  assertCase(results, 'w410-preservation-scripts-registered',
    typeof scripts['harness:larger-smoke-series-design-gate-w410'] === 'string' &&
      typeof scripts['harness:comfortable-lane-hardening-matrix-w409'] === 'string' &&
      typeof scripts['harness:hvac-mechanical-readiness-delta-package-w408'] === 'string' &&
      typeof scripts['harness:wholesale-janitorial-readiness-delta-package-w403'] === 'string' &&
      typeof scripts['harness:building-materials-readiness-delta-package-w397'] === 'string' &&
      typeof scripts['harness:pack-ready-artifact-package-w386'] === 'string',
    JSON.stringify({
      w410: scripts['harness:larger-smoke-series-design-gate-w410'],
      w409: scripts['harness:comfortable-lane-hardening-matrix-w409'],
      w408: scripts['harness:hvac-mechanical-readiness-delta-package-w408'],
      w403: scripts['harness:wholesale-janitorial-readiness-delta-package-w403'],
      w397: scripts['harness:building-materials-readiness-delta-package-w397'],
      w386: scripts['harness:pack-ready-artifact-package-w386']
    }, null, 2));

  assertCase(results, 'w410-no-regression-gates',
    report.includes('The smoke series should validate runner/import/Open-link integration behavior') &&
      report.includes('It should not be used to discover basic copy, source-pack, or proof-role issues') &&
      report.includes('Prepare W411 candidate packet') &&
      report.includes('No fake Open links'),
    report.slice(-7000));

  printResults('W410 larger smoke-series design gate harness', results);
}

main();
