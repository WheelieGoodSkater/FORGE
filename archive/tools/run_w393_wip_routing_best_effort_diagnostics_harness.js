#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const {
  assertCase,
  printResults
} = require('./lib/forge_harness_fixtures');

const root = path.resolve(__dirname, '..', '..');
const runnerPath = path.join(root, 'netsuite', 'runner', 'scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js');
const fileCabinetRunnerPath = path.join(root, 'src', 'FileCabinet', 'SuiteScripts', 'Intelligent Demo Builder', 'scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js');
const reportPath = path.join(root, 'archive', 'reports', 'w393_wip_routing_best_effort_diagnostics.md');
const w392ReportPath = path.join(root, 'archive', 'reports', 'w392_keystone_smoke_wip_routing_safety_gate.md');
const w391ReportPath = path.join(root, 'archive', 'reports', 'w391_building_materials_fixture_story_proof.md');
const packageDir = path.join(root, 'archive', 'package_ready', 'w386_forge_source_pack_ready_artifact');
const packageZip = path.join(root, 'archive', 'package_ready', 'w386_forge_source_pack_ready_artifact.zip');

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

function main() {
  const results = [];
  const runner = exists(runnerPath) ? read(runnerPath) : '';
  const fileCabinetRunner = exists(fileCabinetRunnerPath) ? read(fileCabinetRunnerPath) : '';
  const report = exists(reportPath) ? read(reportPath) : '';
  const w392Report = exists(w392ReportPath) ? read(w392ReportPath) : '';
  const w391Report = exists(w391ReportPath) ? read(w391ReportPath) : '';
  const scripts = packageJson().scripts || {};
  const packageReadyFiles = walkFiles(path.join(root, 'archive', 'package_ready'));
  const runtimeUploadArtifacts = packageReadyFiles.filter((file) =>
    /runtime|upload|deployment|filecabinet/i.test(file) &&
    !/^w386_forge_source_pack_ready_artifact\//.test(file)
  );

  assertCase(results, 'w393-w392-safety-baseline-preserved',
    w392Report.includes('W392 Keystone smoke WIP routing safety gate harness: 14/14 passed') &&
      w392Report.includes('Recommendation: patch a targeted WIP routing safety issue next') &&
      report.includes('Use W392 Keystone Smoke Review'),
    w392Report.slice(0, 3000));

  assertCase(results, 'w393-routing-helper-failure-containment',
    runner.includes('function buildWipRoutingBestEffortFailure') &&
      runner.includes('try {') &&
      runner.includes('return buildWipRoutingBestEffortFailure({') &&
      runner.includes("status: 'failed_best_effort'") &&
      runner.includes("decision: 'failed_best_effort'") &&
      runner.includes("attachResult: 'not-attached-routing-failed'"),
    runner.slice(runner.indexOf('function createAndAttachRoutingIfPossible'), runner.indexOf('function buildWipRoutingBestEffortFailure') + 1800));

  assertCase(results, 'w393-bom-invalid-field-failure-handled',
    runner.includes("routingStage = 'set_billofmaterials'") &&
      runner.includes("routing.setValue({ fieldId: 'billofmaterials', value: Number(bomId) })") &&
      runner.includes("failureStage: routingStage") &&
      report.includes('INVALID_FLD_VALUE') &&
      report.includes('set_billofmaterials'),
    runner.slice(runner.indexOf("routingStage = 'set_billofmaterials'") - 500, runner.indexOf("routingStage = 'set_billofmaterials'") + 900));

  const requiredDiagnosticTerms = [
    'failureStage',
    'errorName',
    'errorMessage',
    'assemblyId',
    'bomId',
    'subsidiaryId',
    'locationId',
    'routingId',
    'existingRoutingId',
    'routingName',
    'wipRequested',
    'coreRecordsCreatedSafely',
    'recommendedOperatorNextStep'
  ];

  assertCase(results, 'w393-routing-diagnostics-captured',
    requiredDiagnosticTerms.every((term) => runner.includes(term)) &&
      requiredDiagnosticTerms.every((term) => report.includes(term)),
    JSON.stringify(requiredDiagnosticTerms, null, 2));

  assertCase(results, 'w393-manufacturing-signoff-surfaces-routing-failure',
    runner.includes('const routingFailure = routingResult && routingResult.routingFailure ? routingResult.routingFailure : null') &&
      runner.includes('routingDiagnostics') &&
      runner.includes('failed-best-effort at') &&
      runner.includes('signoffReady: !!enableManufacturing') &&
      report.includes('signoff should not imply routing is ready'),
    runner.slice(runner.indexOf('function buildManufacturingSignoffSummary'), runner.indexOf('function buildManufacturingSignoffSummary') + 3200));

  assertCase(results, 'w393-completed-result-import-validation-preserved',
    report.includes('Do not weaken completed-result import validation') &&
      report.includes('completed-result import validation was not changed') &&
      !runner.includes('completed-result import validation disabled') &&
      !runner.includes('ignoreCompletedResultValidation'),
    report.slice(0, 5000));

  assertCase(results, 'w393-open-link-authority-preserved',
    report.includes('Open-link authority remains verified-import-only') &&
      report.includes('No fake Open links') &&
      !runner.includes('fake Open link') &&
      !runner.includes('linkAuthorityStatus = \"verified_openable\"'),
    report.slice(0, 6000));

  assertCase(results, 'w393-core-record-behavior-unchanged',
    runner.includes('createWorkOrder({') &&
      runner.includes('createAndAttachRoutingIfPossible({') &&
      runner.indexOf('createWorkOrder({') < runner.indexOf('createAndAttachRoutingIfPossible({') &&
      report.includes('No core item, BOM, work-order, runner adapter, or import behavior was changed'),
    runner.slice(runner.indexOf('// 8) Optional WIP routing create + attach') - 1600, runner.indexOf('// 8) Optional WIP routing create + attach') + 1600));

  assertCase(results, 'w393-filecabinet-runner-copy-aligned',
    runner === fileCabinetRunner,
    JSON.stringify({ runnerPath, fileCabinetRunnerPath }, null, 2));

  assertCase(results, 'w393-w391-building-materials-preserved',
    w391Report.includes('W391 Building Materials fixture-first story proof harness: 15/15 passed') &&
      report.includes('No Building Materials source-pack mutation was made'),
    w391Report.slice(0, 2500));

  assertCase(results, 'w393-w386-package-preserved',
    exists(packageDir) &&
      exists(packageZip) &&
      runtimeUploadArtifacts.length === 0 &&
      report.includes('W386 source-pack readiness evidence package was not mutated'),
    JSON.stringify({ packageDir, packageZip, runtimeUploadArtifacts }, null, 2));

  assertCase(results, 'w393-no-source-pack-mutation',
    report.includes('No Building Materials source-pack mutation was made') &&
      report.includes('No source-pack mutation was made in W393') &&
      !report.includes('building-materials-contractor-supply-project-fulfillment added'),
    report.slice(0, 6000));

  assertCase(results, 'w393-no-live-smoke-no-upload-boundary',
    report.includes('No live smoke in W393') &&
      report.includes('No upload or deployment') &&
      runtimeUploadArtifacts.length === 0,
    report.slice(0, 6000));

  assertCase(results, 'w393-preservation-scripts-registered',
    typeof scripts['harness:wip-routing-best-effort-diagnostics-w393'] === 'string' &&
      typeof scripts['harness:keystone-smoke-wip-routing-safety-gate-w392'] === 'string' &&
      typeof scripts['harness:building-materials-fixture-story-proof-w391'] === 'string' &&
      typeof scripts['harness:pack-ready-artifact-package-w386'] === 'string',
    JSON.stringify({
      w393: scripts['harness:wip-routing-best-effort-diagnostics-w393'],
      w392: scripts['harness:keystone-smoke-wip-routing-safety-gate-w392'],
      w391: scripts['harness:building-materials-fixture-story-proof-w391'],
      w386: scripts['harness:pack-ready-artifact-package-w386']
    }, null, 2));

  assertCase(results, 'w393-no-regression-gates',
    report.includes('No new drawer transaction write paths') &&
      report.includes('N/LLM remains advisory-only') &&
      report.includes('Do not treat W386 as runtime code') &&
      report.includes('no-regression gates passed'),
    report.slice(-5000));

  printResults('W393 WIP routing best-effort diagnostics harness', results);
}

main();
