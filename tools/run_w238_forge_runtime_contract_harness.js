#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const contractPath = path.join(root, 'data', 'w238_forge_runtime_contract_consolidation.json');
const reportPath = path.join(root, 'reports', 'w238_forge_runtime_contract_consolidation.md');
const tracePath = path.join(root, 'trace_samples', 'w238_forge_runtime_contract_consolidation_trace.json');
const drawerPath = path.join(root, 'idb-drawer.user.js');
const adapterPath = path.join(root, 'netsuite', 'idb_governed_runner_adapter_w144_suitelet.js');
const runnerPath = path.join(root, 'netsuite', 'runner', 'scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js');

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function readJson(file) {
  return JSON.parse(read(file));
}

function assertCase(results, id, pass, evidence) {
  results.push({ id, pass: Boolean(pass), evidence: evidence || '' });
}

function main() {
  const results = [];
  const contract = readJson(contractPath);
  const report = read(reportPath);
  const trace = readJson(tracePath);
  const drawer = read(drawerPath);
  const adapter = read(adapterPath);
  const runner = read(runnerPath);

  assertCase(
    results,
    'w238_contract_schema_present',
    contract.schema === 'forge.w238-runtime-contract-consolidation.v1' &&
      contract.status === 'planning_contract_ready',
    contract.schema
  );

  const expectedModes = [
    'operatingModes.js',
    'recordRoles.js',
    'importStates.js',
    'netSuiteLinks.js'
  ];
  assertCase(
    results,
    'w238_canonical_contract_targets_present',
    expectedModes.every((name) => JSON.stringify(contract.canonicalContractFilesToIntroduce).includes(name)),
    contract.canonicalContractFilesToIntroduce.map((item) => item.path).join(', ')
  );

  const lifecycleStates = contract.buildLifecycleStateMachine.map((item) => item.state);
  assertCase(
    results,
    'w238_build_lifecycle_complete',
    ['ready_to_build', 'submitted', 'waiting_for_runner', 'completed_result_found', 'imported', 'partial', 'failed_recoverable']
      .every((state) => lifecycleStates.includes(state)),
    lifecycleStates.join(', ')
  );

  const inventory = contract.legacyFiveRecordAssumptionInventory || [];
  assertCase(
    results,
    'w238_legacy_inventory_covers_core_risks',
    ['w144-request-validation-fixed-five', 'w144-result-normalization-fixed-five', 'drawer-run-pivots-sliced', 'drawer-monolith', 'runner-deterministic-fallback-language']
      .every((id) => inventory.some((item) => item.id === id)),
    inventory.map((item) => item.id).join(', ')
  );

  assertCase(
    results,
    'w238_adapter_fixed_five_assumption_still_detected',
    /requiredRecords[\s\S]*customer[\s\S]*demoTransaction[\s\S]*heroItem[\s\S]*matrixProofItem[\s\S]*componentItem/.test(adapter) &&
      /function normalizeCompletedRunnerResult/.test(adapter) &&
      /componentItems\[0\]/.test(adapter),
    'W144 fixed five validation and first component normalization detected.'
  );

  assertCase(
    results,
    'w238_drawer_dynamic_mode_contract_detected',
    /function resolveBuildOperatingModeW214/.test(drawer) &&
      /food_batch_manufacturing/.test(drawer) &&
      /requiredRecordRoles/.test(drawer) &&
      /optionalRecordRoles/.test(drawer) &&
      /invalidRecordRoles/.test(drawer),
    'Drawer dynamic operating mode contract detected.'
  );

  assertCase(
    results,
    'w238_drawer_run_slice_risk_detected',
    /scriptPivotObjects:\s*activeObjects\.slice\(0,\s*4\)/.test(drawer),
    'Run pivot slice risk detected.'
  );

  assertCase(
    results,
    'w238_runner_fallback_language_detected',
    /deterministic fallback|fallback naming|generic/.test(runner),
    'Runner fallback language detected for future role-validation control.'
  );

  assertCase(
    results,
    'w238_no_regression_boundaries_present',
    contract.noRegressionBoundaries &&
      contract.noRegressionBoundaries.noDrawerCreatedRecords === true &&
      contract.noRegressionBoundaries.noDrawerTransactionWrites === true &&
      contract.noRegressionBoundaries.noDirectSuiteScriptOutsideApprovedW144AdapterPath === true &&
      contract.noRegressionBoundaries.runnerOwnsGeneratedRecords === true,
    JSON.stringify(contract.noRegressionBoundaries)
  );

  assertCase(
    results,
    'w238_report_and_trace_present',
    /W238: FORGE Runtime Contract Consolidation/.test(report) &&
      trace.schema === 'forge.w238-runtime-contract-consolidation-trace.v1' &&
      Array.isArray(trace.events) &&
      trace.events.length >= 4,
    trace.schema
  );

  const passed = results.filter((item) => item.pass).length;
  const failed = results.filter((item) => !item.pass);
  console.log(`W238 FORGE runtime contract harness: ${passed}/${results.length} passed`);
  results.forEach((item) => {
    console.log(`${item.pass ? 'PASS' : 'FAIL'} ${item.id}: ${typeof item.evidence === 'string' ? item.evidence : JSON.stringify(item.evidence)}`);
  });
  if (failed.length) {
    process.exitCode = 1;
  }
}

main();
