#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const {
  assertCase,
  printResults,
  readArchiveJson,
  readArchiveText
} = require('./lib/forge_harness_fixtures');

const { runVerification } = require('../../tools/verify_deployment_sync_w347');

const root = path.resolve(__dirname, '..', '..');

function readPackageJson() {
  return JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
}

function main() {
  const results = [];
  const matrix = readArchiveJson('trace_samples', 'w348_broader_smoke_matrix_with_deployment_preflight_trace.json');
  const report = readArchiveText('reports', 'w348_broader_smoke_matrix_with_deployment_preflight.md');
  const w345 = readArchiveJson('trace_samples', 'w345_parkway_w344_successful_live_smoke_evidence_trace.json');
  const w330 = readArchiveJson('trace_samples', 'w330_crescent_live_smoke_evidence_review_trace.json');
  const w338 = readArchiveJson('trace_samples', 'w338_marker_verified_electrical_story_live_smoke_review_trace.json');
  const w329 = readArchiveJson('trace_samples', 'w329_review_uploaded_beacon_ridge_or_rerun_trace.json');
  const deployment = runVerification();
  const pkg = readPackageJson();

  const control = matrix.matrix.find((scenario) => scenario.id === 'w348-control-parkway');
  const crescent = matrix.matrix.find((scenario) => scenario.id === 'w348-historical-crescent');
  const summit = matrix.matrix.find((scenario) => scenario.id === 'w348-historical-summit');
  const beacon = matrix.matrix.find((scenario) => scenario.id === 'w348-blocked-beacon-ridge');

  assertCase(results, 'w348-deployment-preflight-is-green',
    deployment.status === 'PASS' &&
      matrix.preflight.suiteCloudMirror === 'passed' &&
      matrix.preflight.deploymentSyncGuard === 'passed' &&
      deployment.targets.every((target) => target.root.sha256 === target.mirror.sha256),
    JSON.stringify({ deploymentStatus: deployment.status, preflight: matrix.preflight }));

  assertCase(results, 'w348-parkway-control-baseline-is-current-pass',
    control &&
      control.grade === 'pass' &&
      control.useForW348 === 'control_baseline' &&
      w345.state &&
      w345.state.integratedBuildRunnerResult &&
      w345.state.integratedBuildRunnerResult.status === 'completed_result_imported' &&
      w345.state.dccFinalNamingResult &&
      w345.state.dccFinalNamingResult.finalNamesImported === true,
    JSON.stringify(control));

  assertCase(results, 'w348-crescent-is-historical-import-evidence-not-current-proof',
    crescent &&
      crescent.grade === 'path_pass_story_historical_attention' &&
      crescent.useForW348 === 'historical_import_path_evidence_not_current_w346_live_proof' &&
      w330.status === 'live_writeback_keep_story_needs_attention',
    JSON.stringify({ crescent, status: w330.status }));

  assertCase(results, 'w348-summit-is-historical-install-drift-evidence-not-current-proof',
    summit &&
      summit.grade === 'path_pass_install_drift_historical_attention' &&
      summit.useForW348 === 'historical_import_path_evidence_not_current_w346_live_proof' &&
      w338.status === 'reviewed_needs_attention_installed_version_proof',
    JSON.stringify({ summit, status: w338.status }));

  assertCase(results, 'w348-beacon-ridge-remains-blocked-with-missing-evidence',
    beacon &&
      beacon.grade === 'blocked_missing_evidence' &&
      beacon.useForW348 === 'blocked_until_operator_uploads_trace_and_screenshots' &&
      w329.status === 'beacon_ridge_evidence_missing',
    JSON.stringify({ beacon, status: w329.status }));

  assertCase(results, 'w348-report-captures-pass-fail-gates-and-no-fake-proof',
    /Pass Gates For The Next Live Smoke/.test(report) &&
      /Fail Gates/.test(report) &&
      /Historical traces are treated as current W346\/W347 live proof/.test(report) &&
      /Any Open link appears before real numeric ids/.test(report) &&
      /No new drawer write paths/.test(report),
    report.slice(0, 2000));

  assertCase(results, 'w348-regression-review-covers-required-boundaries',
    /W151: preserved/.test(report) &&
      /W214: preserved/.test(report) &&
      /W245: preserved/.test(report) &&
      /W341: preserved/.test(report) &&
      /W342: preserved/.test(report) &&
      /W344: preserved/.test(report) &&
      /W345: preserved/.test(report) &&
      /W346: preserved/.test(report) &&
      /W347: preserved/.test(report),
    'W348 report covers W151 W214 W245 W341 W342 W344 W345 W346 W347');

  assertCase(results, 'w348-package-script-registration-present',
    pkg.scripts['harness:broader-smoke-matrix-with-deployment-preflight-w348'] === 'node archive/tools/run_w348_broader_smoke_matrix_with_deployment_preflight_harness.js' &&
      /run_w348_broader_smoke_matrix_with_deployment_preflight_harness/.test(pkg.scripts.check),
    JSON.stringify(pkg.scripts['harness:broader-smoke-matrix-with-deployment-preflight-w348']));

  printResults('W348 broader smoke matrix with deployment preflight harness', results);
}

main();
