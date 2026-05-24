#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const dataPath = path.join(root, 'data', 'w239_canonical_runtime_contracts_compatibility.json');
const reportPath = path.join(root, 'reports', 'w239_canonical_runtime_contracts_compatibility.md');
const tracePath = path.join(root, 'trace_samples', 'w239_canonical_runtime_contracts_compatibility_trace.json');
const adapterPath = path.join(root, 'netsuite', 'idb_governed_runner_adapter_w144_suitelet.js');
const drawerPath = path.join(root, 'idb-drawer.user.js');

const operatingModes = require('../src/contracts/operatingModes');
const recordRoles = require('../src/contracts/recordRoles');
const importStates = require('../src/contracts/importStates');
const netSuiteLinks = require('../src/contracts/netSuiteLinks');
const compatibility = require('../src/contracts/runnerResultCompatibility');

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function readJson(file) {
  return JSON.parse(read(file));
}

function assertCase(results, id, pass, evidence) {
  results.push({ id, pass: Boolean(pass), evidence: evidence || '' });
}

function loadAdapterTestHooks() {
  let exported = null;
  const sandbox = {
    console,
    JSON,
    String,
    Number,
    Boolean,
    Array,
    Object,
    RegExp,
    URL,
    define: (deps, factory) => {
      exported = factory(
        { accountId: 'YOUR_ACCOUNT_ID', getCurrentScript: () => ({ getParameter: () => '' }) },
        { create: () => ({ submit: () => 'task-1' }), TaskType: { SCHEDULED_SCRIPT: 'scheduledscript' } },
        { audit: () => {}, error: () => {} },
        {},
        {}
      );
    }
  };
  vm.createContext(sandbox);
  vm.runInContext(read(adapterPath), sandbox, { filename: adapterPath });
  if (!exported || !exported._test) throw new Error('W144 adapter test hooks were not exported.');
  return exported._test;
}

function legacyCompletedResult() {
  return {
    schema: 'idb.completed-runner-result-json.v1',
    status: 'completed',
    runStatus: 'completed',
    generatedRecordOwner: 'governed_runner_internal_build_engine',
    resolvedOperatingMode: 'food_batch_manufacturing',
    records: {
      customer: {
        type: 'customer',
        name: 'Liquid Death Customer Account',
        internalId: '2123',
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/entity/custjob.nl?id=2123'
      },
      demoTransaction: {
        type: 'salesorder',
        name: 'SO2688',
        internalId: '81630',
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/accounting/transactions/salesord.nl?id=81630'
      },
      heroItem: {
        type: 'inventoryitem',
        name: 'Liquid Death Finished Good',
        internalId: '1865',
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=1865'
      },
      matrixProofItem: {
        type: 'inventoryitem',
        name: 'Liquid Death Production Line',
        internalId: '2947',
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=2947'
      },
      componentItem: {
        type: 'inventoryitem',
        name: 'Liquid Death Ingredient Blend',
        internalId: '2948',
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=2948'
      }
    }
  };
}

function canonicalCompletedResult() {
  return {
    schema: 'forge.completed-runner-result.v2',
    status: 'completed',
    runStatus: 'completed',
    generatedRecordOwner: 'governed_runner_internal_build_engine',
    resolvedOperatingMode: 'food_batch_manufacturing',
    records: [
      {
        role: 'customer',
        recordType: 'customer',
        name: 'Liquid Death Customer Account',
        internalId: '2123',
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/entity/custjob.nl?id=2123'
      },
      {
        role: 'sales_order',
        recordType: 'salesorder',
        name: 'SO2688',
        internalId: '81630',
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/accounting/transactions/salesord.nl?id=81630'
      },
      {
        role: 'finished_food_or_batch_item',
        recordType: 'inventoryitem',
        name: 'Liquid Death Finished Good',
        internalId: '1865',
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=1865'
      },
      {
        role: 'formula_or_batch_structure',
        recordType: 'inventoryitem',
        name: 'Liquid Death Production Line',
        internalId: '2947',
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=2947'
      },
      {
        role: 'ingredient_or_component_item',
        recordType: 'inventoryitem',
        name: 'Liquid Death Ingredient Blend',
        internalId: '2948',
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=2948'
      }
    ]
  };
}

function canonicalRequest() {
  return {
    schema: 'idb.confirmed-build-request.v1',
    requestStatus: 'confirmed_ready_for_governed_runner',
    consultantConfirmation: { confirmed: true },
    stateAuthority: { handoffParityStatus: 'matched', noStateMismatch: true },
    prospect: { name: 'Liquid Death', website: 'https://liquiddeath.com' },
    demoPath: { laneId: 'food_beverage', scenario: 'Promotion-Driven Food Manufacturing' },
    requiredRecordRoles: ['customer', 'sales_order', 'finished_food_or_batch_item', 'ingredient_or_component_item'],
    selectedToggles: { createNewHeroItem: true, enableManufacturing: true, enableWip: false }
  };
}

function main() {
  const results = [];
  const data = readJson(dataPath);
  const report = read(reportPath);
  const trace = readJson(tracePath);
  const adapter = read(adapterPath);
  const drawer = read(drawerPath);
  const adapterHooks = loadAdapterTestHooks();

  assertCase(results, 'w239_data_contract_present', data.schema === 'forge.w239-canonical-runtime-contracts.v1', data.schema);
  assertCase(results, 'w239_operating_modes_exported', ['retail_availability', 'apparel_style_matrix', 'dealer_hardgoods_replenishment', 'distribution_replenishment', 'discrete_manufacturing', 'wip_manufacturing', 'food_batch_manufacturing'].every((mode) => operatingModes.OPERATING_MODES[mode]), Object.keys(operatingModes.OPERATING_MODES).join(', '));
  assertCase(results, 'w239_record_roles_exported', recordRoles.canonicalRole('demoTransaction') === 'sales_order' && recordRoles.labelForRole('finished_food_or_batch_item') === 'Finished Food/Batch Item', 'role aliases and labels exported');
  assertCase(results, 'w239_import_states_exported', importStates.IMPORT_STATES.imported.consultantCopy === 'Build results are ready.' && importStates.FROZEN_RECOVERY_COPY.realLinks === 'Ask the runner to return real NetSuite links.', 'frozen import copy exported');
  assertCase(results, 'w239_netsuite_link_guard_exported', netSuiteLinks.numericInternalId('123') && netSuiteLinks.supportedNetSuiteUrl('https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=1865') && !netSuiteLinks.supportedNetSuiteUrl('https://example.com/app/common/item/item.nl?id=1865'), 'numeric id and URL guard exported');

  const legacyCanonical = compatibility.normalizeRunnerResultToCanonical(legacyCompletedResult());
  assertCase(results, 'w239_legacy_five_record_normalizes_to_canonical', legacyCanonical.allRecordsOpenable && legacyCanonical.records.some((record) => record.role === 'finished_food_or_batch_item') && legacyCanonical.records.some((record) => record.role === 'ingredient_or_component_item'), legacyCanonical.records.map((record) => record.role).join(', '));

  const canonicalCanonical = compatibility.normalizeRunnerResultToCanonical(canonicalCompletedResult());
  assertCase(results, 'w239_canonical_records_array_accepted', canonicalCanonical.allRecordsOpenable && canonicalCanonical.records.length === 5, `${canonicalCanonical.records.length} records`);

  const badCanonical = compatibility.normalizeRunnerResultToCanonical(Object.assign({}, canonicalCompletedResult(), {
    records: canonicalCompletedResult().records.map((record, index) => index === 0 ? Object.assign({}, record, { internalId: 'abc', url: 'https://example.com/not-netsuite' }) : record)
  }));
  assertCase(results, 'w239_fake_open_links_blocked', badCanonical.allRecordsOpenable === false && badCanonical.linkFailures.length === 1, JSON.stringify(badCanonical.linkFailures[0]));

  const requestValidation = adapterHooks.validateConfirmedRequest(canonicalRequest());
  assertCase(results, 'w239_w144_accepts_canonical_required_roles', requestValidation.valid === true, JSON.stringify(requestValidation.errors));

  const adapterLegacy = adapterHooks.normalizeCompletedRunnerResult(legacyCompletedResult());
  assertCase(results, 'w239_w144_legacy_result_preserves_legacy_fields_and_adds_canonical', adapterLegacy.valid === true && Array.isArray(adapterLegacy.completed.canonicalRecords) && adapterLegacy.completed.records.customer && adapterLegacy.completed.heroItem, adapterLegacy.completed.canonicalRecords.map((record) => record.role).join(', '));

  const adapterCanonical = adapterHooks.normalizeCompletedRunnerResult(canonicalCompletedResult());
  assertCase(results, 'w239_w144_canonical_result_preserves_legacy_fields', adapterCanonical.valid === true && adapterCanonical.completed.records.demoTransaction.name === 'SO2688' && adapterCanonical.completed.componentItems[0].name === 'Liquid Death Ingredient Blend', JSON.stringify(adapterCanonical.errors));

  assertCase(results, 'w239_adapter_contract_markers_present', /canonicalRuntimeContract/.test(adapter) && /canonicalRecords/.test(adapter) && /recordsArrayAccepted/.test(adapter), 'W144 canonical compatibility markers present');
  assertCase(results, 'w239_drawer_dynamic_contract_still_present', /function resolveBuildOperatingModeW214/.test(drawer) && /food_batch_manufacturing/.test(drawer) && /validateDccFinalNamingImportPayload/.test(drawer), 'drawer embedded W214-W237 contracts preserved');
  assertCase(results, 'w239_report_and_trace_present', /W239: Canonical Runtime Contracts/.test(report) && trace.schema === 'forge.w239-canonical-runtime-contracts-trace.v1', trace.schema);
  assertCase(results, 'w239_no_regression_boundaries_present', data.noRegressionBoundaries.noDrawerCreatedRecords === true && data.noRegressionBoundaries.noDirectSuiteScriptOutsideApprovedW144AdapterPath === true && data.noRegressionBoundaries.w237FoodBatchCompletedImportGuardPreserved === true, JSON.stringify(data.noRegressionBoundaries));

  const passed = results.filter((item) => item.pass).length;
  const failed = results.filter((item) => !item.pass);
  console.log(`W239 canonical runtime contract harness: ${passed}/${results.length} passed`);
  results.forEach((item) => {
    console.log(`${item.pass ? 'PASS' : 'FAIL'} ${item.id}: ${typeof item.evidence === 'string' ? item.evidence : JSON.stringify(item.evidence)}`);
  });
  if (failed.length) process.exitCode = 1;
}

main();
