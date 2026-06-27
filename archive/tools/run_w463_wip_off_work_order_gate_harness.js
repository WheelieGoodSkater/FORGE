#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const {
  assertCase,
  printResults
} = require('./lib/forge_harness_fixtures');

const root = path.resolve(__dirname, '..', '..');
const runnerPath = path.join(root, 'netsuite', 'runner', 'scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js');
const sourceRunnerPath = path.join(root, 'src', 'FileCabinet', 'SuiteScripts', 'Intelligent Demo Builder', 'scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js');
const packagePath = path.join(root, 'package.json');

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function contains(source, text) {
  return source.indexOf(text) !== -1;
}

function main() {
  const runner = read(runnerPath);
  const sourceRunner = read(sourceRunnerPath);
  const pkg = JSON.parse(read(packagePath));
  const results = [];

  assertCase(results, 'w463-runner-copies-in-sync',
    runner === sourceRunner,
    'netsuite/runner and src/FileCabinet runner copies must carry the same WIP-off gate.');

  assertCase(results, 'w463-effective-wip-gates-work-order-create',
    contains(runner, 'if (effectiveEnableWip) {\n        try {\n          woId = createWorkOrder({') &&
      contains(runner, 'log.audit({ title: `Work Order skipped because WIP is disabled W463'),
    'Work Order create must only run when effectiveEnableWip is true.');

  assertCase(results, 'w463-disabled-telemetry-zero-wo-links',
    contains(runner, 'function buildWipDisabledWorkOrderTelemetryW463') &&
      contains(runner, "status: 'not_requested_wip_disabled'") &&
      contains(runner, 'workOrderId: null') &&
      contains(runner, 'woId: null') &&
      contains(runner, 'linkCount: 0') &&
      contains(runner, 'workOrderLinks: []') &&
      contains(runner, 'openableWorkOrderLinks: []') &&
      contains(runner, "source: 'wip_disabled_work_order_gate_w463'"),
    'WIP-off manufacturing should return explicit skip telemetry with zero Work Order links.');

  const createGuardIndex = runner.indexOf('if (enableWip !== true) {');
  const createWoIndex = runner.indexOf("record.create({ type: 'workorder'");
  const reuseGuardIndex = runner.indexOf('if (enableWip === true) {\n      const reusableWorkOrder = findReusableWorkOrderByAssemblyW455');
  const reuseSearchIndex = runner.indexOf('findReusableWorkOrderByAssemblyW455({ assemblyId, memo, routingId })');
  assertCase(results, 'w463-create-helper-blocks-wip-off-before-record-create',
    createGuardIndex >= 0 && createWoIndex > createGuardIndex,
    'createWorkOrder must return not_requested_wip_disabled before record.create can run when WIP is off.');
  assertCase(results, 'w463-existing-wo-search-gated-by-wip-on',
    reuseGuardIndex >= 0 && reuseSearchIndex > reuseGuardIndex,
    'existing_workorder_search_by_assembly and known reusable WO fallback must sit behind enableWip === true.');

  assertCase(results, 'w463-sidecar-does-not-surface-wo-or-routing-when-wip-off',
    contains(runner, 'if (args.enableWip && args.woId)') &&
      contains(runner, 'args.enableWip && args.workOrderTelemetry') &&
      contains(runner, 'const routingOperations = args.enableWip ? operationPlanRowsW453') &&
      contains(runner, 'routingResult: args.enableWip ? (args.routingResult || null) : null'),
    'Sidecar should return assembly/BOM/components for manufacturing-only runs without WO/routing/WIP rows.');

  assertCase(results, 'w463-summary-uses-effective-wip',
    contains(runner, "routingDecision: routingResult ? routingResult.decision : (effectiveEnableWip ? 'requested-no-result' : 'wip-disabled')") &&
      contains(runner, "attachResult: routingResult ? routingResult.attachResult : (effectiveEnableWip ? 'not-returned' : 'not-attempted')"),
    'Runner summary should describe routing using effectiveEnableWip.');

  assertCase(results, 'w463-package-script',
    pkg.scripts && pkg.scripts['harness:wip-off-work-order-gate-w463'] === 'node archive/tools/run_w463_wip_off_work_order_gate_harness.js',
    'package.json should expose the W463 WIP-off Work Order gate harness.');

  printResults('W463 WIP-off Work Order gate harness', results);
}

main();
