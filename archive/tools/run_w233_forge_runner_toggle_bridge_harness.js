#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const adapterPath = path.join(root, 'netsuite', 'idb_governed_runner_adapter_w144_suitelet.js');
const reportPath = path.join(root, 'reports', 'w233_forge_runner_toggle_bridge.md');
const tracePath = path.join(root, 'trace_samples', 'w233_forge_runner_toggle_bridge_trace.json');

function mkdirFor(file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
}

function writeJson(file, value) {
  mkdirFor(file);
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(file, value) {
  mkdirFor(file);
  fs.writeFileSync(file, value);
}

function assertCase(results, id, pass, evidence) {
  results.push({ id, pass: Boolean(pass), evidence: evidence || '' });
}

function loadAdapter() {
  let submittedTask = null;
  const scriptParams = {
    custscript_idb_create_enabled: 'T',
    custscript_idb_governed_sandbox_write_enabled: 'T',
    custscript_idb_queue_submit_enabled: 'T',
    custscript_idb_sandbox_account_allowlist: 'TD3021666',
    custscript_idb_runner_script_id: 'customscript_scai_so_csv_runner',
    custscript_idb_runner_deploy_id: 'customdeploy_scai_so_csv_runner',
    custscript_idb_runner_mapping_id: '550',
    custscript_idb_runner_folder_id: '8329',
    custscript_idb_runner_subsidiary_id: '1',
    custscript_idb_runner_location_id: '7',
    custscript_idb_runner_wc_search_id: '5005',
    custscript_idb_result_capture_folder_id: '8329'
  };
  const sandbox = {
    console,
    JSON,
    String,
    Number,
    RegExp,
    Array,
    Object,
    define: (deps, factory) => {
      sandbox.adapter = factory(
        {
          accountId: 'TD3021666',
          getCurrentScript: () => ({
            getParameter: ({ name }) => scriptParams[name] || ''
          })
        },
        {
          TaskType: { SCHEDULED_SCRIPT: 'scheduledscript' },
          create: ({ scriptId, deploymentId, params }) => ({
            scriptId,
            deploymentId,
            params,
            submit: () => {
              submittedTask = { scriptId, deploymentId, params };
              return 'TASK_W233';
            }
          })
        },
        { audit: () => {}, error: () => {} },
        { load: () => ({ name: '', getContents: () => '{}' }) },
        { create: () => ({ run: () => ({ getRange: () => [] }) }) }
      );
    }
  };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(adapterPath, 'utf8'), sandbox, { filename: adapterPath });
  return {
    submit(request) {
      let written = '';
      sandbox.adapter.onRequest({
        request: {
          parameters: {
            custpage_idb_confirmed_build_request_json: JSON.stringify(request),
            custpage_idb_operator_queue_gate_json: JSON.stringify({
              schema: 'idb.operator-queue-gate.v1',
              operatorOnly: true,
              operator: { name: 'W233 Harness' },
              reviewDecision: 'operator_approved_queue_submit',
              typeToConfirm: 'QUEUE GOVERNED SANDBOX RUNNER',
              confirmedSandboxAccount: true,
              confirmedNoSubmit: false,
              confirmedDrawerNoWrite: true,
              drawerInvocationTokenAccepted: false
            })
          }
        },
        response: { write: (body) => { written = body; } }
      });
      return { result: JSON.parse(written), submittedTask };
    }
  };
}

function confirmedRequest(toggleOverrides) {
  const toggles = Object.assign({
    createNewHeroItem: true,
    enableManufacturing: true,
    enableWip: false
  }, toggleOverrides || {});
  return {
    schema: 'idb.confirmed-build-request.v1',
    requestId: 'idb-build-liquid-death-food-beverage-foodmanufacturing',
    requestStatus: 'confirmed_ready_for_governed_runner',
    consultantConfirmation: {
      required: true,
      confirmed: true,
      source: 'acceptedPacket'
    },
    stateAuthority: {
      selectedLaneId: 'food_beverage',
      confirmedLaneId: 'food_beverage',
      exportedLaneId: 'food_beverage',
      handoffParityStatus: 'matched',
      noStateMismatch: true
    },
    prospect: {
      name: 'Liquid Death',
      website: 'https://liquiddeath.com'
    },
    demoPath: {
      laneId: 'food_beverage',
      laneName: 'Food / Beverage CPG Manufacturing',
      proofAnchor: 'Finished Good',
      familyKey: 'foodManufacturing',
      scenario: 'Promotion-Driven Food Manufacturing',
      confirmed: true
    },
    storyInputs: {
      buyerNeed: 'Buyer needs a beverage proof path with finished canned beverage availability and production planning.',
      scObjective: 'Prove beverage availability and production-planning confidence.',
      conversationNotes: 'Use beverage language and preserve toggle authority.'
    },
    resolvedOperatingMode: toggles.enableWip ? 'food_batch_manufacturing' : 'discrete_manufacturing',
    modeConfidence: 'high',
    selectedToggles: toggles,
    namingAuthority: {
      websiteControlsProductNouns: true,
      togglesControlOperatingVocabulary: true
    },
    requiredRecordRoles: ['customer', 'sales_order', 'finished_food_or_batch_item', 'ingredient_or_component_item'],
    optionalRecordRoles: ['formula_or_batch_structure', 'lot_or_availability_context', 'work_order_or_wip_object'],
    invalidRecordRoles: ['apparel_style_matrix_without_apparel_evidence'],
    resultValidationExpectations: {
      requiresRealIds: true,
      requiresSupportedNetSuiteUrls: true
    },
    requiredRecords: ['customer', 'demoTransaction', 'heroItem', 'matrixProofItem', 'componentItem']
  };
}

function main() {
  const results = [];
  const adapter = loadAdapter();
  const mfgSubmit = adapter.submit(confirmedRequest());
  const mfgParams = mfgSubmit.result.runnerParams || {};
  const mfgContext = JSON.parse(mfgParams.custscript_v3_runner_idb_request_json || '{}');

  assertCase(results, 'w233_runner_submit_still_occurs', mfgSubmit.result.queueSubmitted === true && mfgSubmit.result.runnerTaskId === 'TASK_W233', JSON.stringify({ status: mfgSubmit.result.status, runnerTaskId: mfgSubmit.result.runnerTaskId, errorName: mfgSubmit.result.errorName, errorMessage: mfgSubmit.result.errorMessage, validation: mfgSubmit.result.validation, queueGate: mfgSubmit.result.queueGate }));
  assertCase(results, 'w233_create_new_item_toggle_reaches_runner', mfgParams.custscript_v3_runner_create_new_hero === 'T', JSON.stringify(mfgParams));
  assertCase(results, 'w233_manufacturing_toggle_reaches_runner', mfgParams.custscript_v3_runner_enable_mfg === 'T', JSON.stringify(mfgParams));
  assertCase(results, 'w233_wip_toggle_false_reaches_runner', mfgParams.custscript_v3_runner_enable_wip === 'F', JSON.stringify(mfgParams));
  assertCase(results, 'w233_confirmed_request_context_preserves_w214_contract', mfgContext.selectedToggles && mfgContext.selectedToggles.enableManufacturing === true && mfgContext.resolvedOperatingMode === 'discrete_manufacturing' && Array.isArray(mfgContext.requiredRecordRoles), JSON.stringify(mfgContext));

  const wipSubmit = adapter.submit(confirmedRequest({ enableWip: true }));
  const wipParams = wipSubmit.result.runnerParams || {};
  const wipContext = JSON.parse(wipParams.custscript_v3_runner_idb_request_json || '{}');
  assertCase(results, 'w233_wip_toggle_true_reaches_runner', wipParams.custscript_v3_runner_enable_wip === 'T', JSON.stringify(wipParams));
  assertCase(results, 'w233_wip_mode_context_preserved', wipContext.selectedToggles && wipContext.selectedToggles.enableWip === true && wipContext.resolvedOperatingMode === 'food_batch_manufacturing', JSON.stringify(wipContext));

  const offSubmit = adapter.submit(confirmedRequest({ createNewHeroItem: false, enableManufacturing: false, enableWip: false }));
  const offParams = offSubmit.result.runnerParams || {};
  assertCase(results, 'w233_toggle_off_values_remain_false', offParams.custscript_v3_runner_create_new_hero === 'F' && offParams.custscript_v3_runner_enable_mfg === 'F' && offParams.custscript_v3_runner_enable_wip === 'F', JSON.stringify(offParams));

  const trace = {
    schema: 'idb.w233-forge-runner-toggle-bridge.trace.v1',
    generatedAt: new Date().toISOString(),
    resultCount: results.length,
    passCount: results.filter((item) => item.pass).length,
    submittedRunnerParams: mfgParams,
    submittedWipRunnerParams: wipParams,
    results
  };
  const report = [
    '# W233 FORGE Runner Toggle Bridge',
    '',
    `Generated: ${trace.generatedAt}`,
    '',
    '## Scope',
    '- Proves W144 no longer hardcodes New item, Manufacturing, or WIP runner params to F.',
    '- Proves the confirmed request context handed to the DCC runner preserves W214 mode, toggles, roles, and validation expectations.',
    '- Preserves the boundary that the DCC runner owns generated records.',
    '',
    '## Results',
    ...results.map((item) => `- ${item.pass ? 'PASS' : 'FAIL'} ${item.id}`),
    '',
    '## Visual Testing Decision',
    'No broad visual testing. This is a connector/regression harness for the FORGE to W144 to DCC runner parameter bridge.',
    ''
  ].join('\n');
  writeJson(tracePath, trace);
  writeText(reportPath, report);

  const failed = results.filter((item) => !item.pass);
  console.log(`W233 FORGE runner toggle bridge harness: ${failed.length ? 'FAIL' : 'PASS'} (${results.length - failed.length}/${results.length})`);
  if (failed.length) {
    failed.forEach((item) => console.error(`${item.id}: ${item.evidence}`));
    process.exit(1);
  }
}

main();
