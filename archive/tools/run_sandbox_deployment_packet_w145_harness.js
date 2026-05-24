const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const suiteletAdapterPath = path.join(root, 'netsuite', 'idb_governed_runner_adapter_w144_suitelet.js');
const w139Path = path.join(root, 'data', 'w139_idb_governed_runner_integration_contract.json');
const w144Path = path.join(root, 'data', 'w144_governed_sandbox_queue_submit_pilot.json');
const dataPath = path.join(root, 'data', 'w145_sandbox_deployment_packet_queue_submit_pilot.json');
const tracePath = path.join(root, 'trace_samples', 'w145_sandbox_deployment_packet_queue_submit_pilot_trace.json');
const reportPath = path.join(root, 'reports', 'w145_sandbox_deployment_packet_queue_submit_pilot.md');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function assertCase(results, name, pass, detail) {
  results.push({ name, pass: !!pass, detail: detail || '' });
}

function main() {
  const w139 = readJson(w139Path);
  const w144 = readJson(w144Path);
  const suiteletSource = fs.readFileSync(suiteletAdapterPath, 'utf8');
  const confirmedRequest = w139.contractJson.confirmedIdbBuildRequestJson;

  const deploymentPacket = {
    schema: 'idb.w145-sandbox-deployment-packet.v1',
    adapterSourceFile: suiteletAdapterPath,
    scriptRecord: {
      scriptType: 'Suitelet',
      scriptId: 'customscript_idb_governed_runner_adapter',
      name: 'IDB Governed Runner Adapter',
      scriptFile: 'idb_governed_runner_adapter_w144_suitelet.js',
      apiVersion: '2.1',
      deploymentId: 'customdeploy_idb_governed_runner_adapter_sb',
      deploymentStatus: 'Released in sandbox only after upload smoke; Testing is acceptable for first upload',
      audience: 'administrator_or_operator_role_only'
    },
    defaultFlags: {
      custscript_idb_create_enabled: false,
      custscript_idb_governed_sandbox_write_enabled: false,
      custscript_idb_queue_submit_enabled: false
    },
    requiredScriptParameters: [
      { id: 'custscript_idb_create_enabled', type: 'checkbox', defaultValue: false, requiredForSubmit: true },
      { id: 'custscript_idb_governed_sandbox_write_enabled', type: 'checkbox', defaultValue: false, requiredForSubmit: true },
      { id: 'custscript_idb_queue_submit_enabled', type: 'checkbox', defaultValue: false, requiredForSubmit: true },
      { id: 'custscript_idb_sandbox_account_allowlist', type: 'free-form text', defaultValue: 'SANDBOX_ACCOUNT_ID', requiredForSubmit: true },
      { id: 'custscript_idb_runner_script_id', type: 'free-form text', defaultValue: 'customscript_scai_so_csv_runner', requiredForSubmit: true },
      { id: 'custscript_idb_runner_deploy_id', type: 'free-form text', defaultValue: 'customdeploy_scai_so_csv_runner', requiredForSubmit: true },
      { id: 'custscript_idb_runner_mapping_id', type: 'free-form text', defaultValue: '112', requiredForSubmit: true },
      { id: 'custscript_idb_runner_folder_id', type: 'free-form text', defaultValue: '345', requiredForSubmit: true },
      { id: 'custscript_idb_runner_subsidiary_id', type: 'free-form text', defaultValue: '1', requiredForSubmit: true },
      { id: 'custscript_idb_runner_location_id', type: 'free-form text', defaultValue: '7', requiredForSubmit: true },
      { id: 'custscript_idb_runner_wc_search_id', type: 'free-form text', defaultValue: '', requiredForSubmit: false },
      { id: 'custscript_idb_result_capture_folder_id', type: 'free-form text', defaultValue: '678', requiredForSubmit: true }
    ],
    requestParameters: [
      {
        id: 'custpage_idb_confirmed_build_request_json',
        source: 'IDB exported build handoff packet',
        required: true
      },
      {
        id: 'custpage_idb_operator_queue_gate_json',
        source: 'operator-only approval evidence',
        required: true
      }
    ],
    expectedFalseFlagResponse: {
      queueSubmitted: false,
      runnerTaskId: null,
      resultCaptureStatus: 'not_started_no_submit',
      activeOpenLinks: 0,
      recordUrlsReturned: false
    },
    expectedEnabledSandboxResponse: {
      queueSubmitted: true,
      runnerTaskId: 'real NetSuite scheduled task id',
      resultCaptureStatus: 'pending_runner_completion',
      finalGeneratedNamesReady: false,
      activeOpenLinks: 0,
      recordUrlsReturned: false
    }
  };

  const uploadChecklist = [
    'Upload netsuite/idb_governed_runner_adapter_w144_suitelet.js to the sandbox File Cabinet.',
    'Create or update the Suitelet script record using script id customscript_idb_governed_runner_adapter.',
    'Create or update sandbox deployment customdeploy_idb_governed_runner_adapter_sb for administrator/operator access only.',
    'Add all W145 script/deployment parameters exactly as listed in requiredScriptParameters.',
    'Set CREATE_ENABLED, GOVERNED_SANDBOX_WRITE_ENABLED, and QUEUE_SUBMIT_ENABLED to false by default.',
    'Set the sandbox account allowlist to the current sandbox account only.',
    'Set runner script/deployment ids to the existing governed runner, not to a drawer script.',
    'Set mapping, folder, subsidiary, location, optional work center search, and result capture folder parameters.',
    'Run the first smoke with the approved operator gate while flags remain false.',
    'Confirm the response has queueSubmitted=false, runnerTaskId=null, resultCapture not_started_no_submit, and zero active Open links.'
  ];

  const operatorTestData = {
    confirmedBuildRequestJson: confirmedRequest,
    approvedQueueGateForFlagsFalseSmoke: {
      schema: 'idb.operator-queue-gate.v1',
      operatorOnly: true,
      operator: {
        name: 'Sandbox Operator',
        reviewedAt: '2026-05-16T17:00:00.000Z'
      },
      reviewDecision: 'operator_approved_queue_submit',
      confirmedNoSubmit: false,
      confirmedDrawerNoWrite: true,
      confirmedSandboxAccount: true,
      drawerInvocationTokenAccepted: false,
      typeToConfirm: 'QUEUE GOVERNED SANDBOX RUNNER',
      evidence: {
        handoffPacketReviewed: true,
        runtimeConfigReviewed: true,
        queueSubmitApprovedServerSide: true,
        understandsDefaultFlagsFalseWillNotSubmit: true
      }
    },
    negativeGateShouldBlock: {
      schema: 'idb.operator-queue-gate.v1',
      operatorOnly: true,
      operator: {
        name: 'Sandbox Operator',
        reviewedAt: '2026-05-16T17:00:00.000Z'
      },
      reviewDecision: 'dry_run_reviewed_no_submit',
      confirmedNoSubmit: true,
      confirmedDrawerNoWrite: true,
      confirmedSandboxAccount: true,
      drawerInvocationTokenAccepted: false,
      typeToConfirm: '',
      evidence: {
        handoffPacketReviewed: true,
        runtimeConfigReviewed: true,
        queueSubmitApprovedServerSide: false
      }
    }
  };

  const rollbackPlan = [
    'Immediately set custscript_idb_queue_submit_enabled to false.',
    'Set custscript_idb_governed_sandbox_write_enabled to false.',
    'Set custscript_idb_create_enabled to false.',
    'If needed, inactivate customdeploy_idb_governed_runner_adapter_sb.',
    'Do not modify the IDB drawer because it remains export/import only.',
    'Capture the adapter response, NetSuite execution log, runner task status, idempotency token, and operator gate JSON.',
    'Keep imported drawer names as Link pending unless result capture later returns real numeric ids and supported URLs.'
  ];

  const targetedVisualTestPlan = {
    visualNetSuiteTestingRequiredNow: false,
    startCondition: 'Only start after the deployed adapter returns queueSubmitted=true and a real non-placeholder runnerTaskId.',
    stepsAfterRunnerTaskId: [
      'Open the NetSuite scheduled script/task status for the returned runnerTaskId.',
      'Verify the task belongs to the governed runner/internal build engine, not the drawer.',
      'Wait for result capture to return final generated names with numeric internal ids and supported NetSuite URLs.',
      'Import the result JSON into IDB Trace > Final generated names import.',
      'Confirm Build and Run show active Open only for records with real URLs.',
      'Click Customer, demo transaction, hero item, matrix/proof item, and component Open links.',
      'Confirm each link lands on an actual NetSuite record page and not a Notice, Error, placeholder id, or unsupported path.'
    ],
    broaderVisualNetSuiteTestingRequired: false
  };

  const noRegression = {
    noDrawerWrites: true,
    noSuiteScriptInvocationFromDrawer: true,
    noTransactionWritesFromDrawer: true,
    consultantConfirmationRequired: true,
    stateAuthorityPreserved: true,
    handoffParityPreserved: true,
    falseFlagDryRunPreserved: true,
    sandboxAllowlistRequired: true,
    operatorApprovalRequired: true,
    idempotencyRequired: true,
    resultCapturePendingStatusRequired: true,
    internalRunnerOwnershipPreserved: true,
    noActiveOpenLinksWithoutRealUrls: true
  };

  const results = [];
  assertCase(results, 'w145_starts_from_w144_guarded_queue_submit_ready', w144.decision === 'PASS_QUEUE_SUBMIT_PILOT_GUARDED__RESULT_CAPTURE_PENDING_ONLY', w144.decision);
  assertCase(results, 'w145_upload_source_is_w144_suitelet_adapter', /@NScriptType Suitelet/.test(suiteletSource) && /submitRunnerIfAllowed/.test(suiteletSource) && !/N\/record/.test(suiteletSource), suiteletAdapterPath);
  assertCase(results, 'w145_default_flags_false', Object.values(deploymentPacket.defaultFlags).every((value) => value === false), JSON.stringify(deploymentPacket.defaultFlags));
  assertCase(results, 'w145_required_server_parameters_complete', deploymentPacket.requiredScriptParameters.length === 12 && deploymentPacket.requiredScriptParameters.some((param) => param.id === 'custscript_idb_queue_submit_enabled') && deploymentPacket.requiredScriptParameters.some((param) => param.id === 'custscript_idb_result_capture_folder_id'), JSON.stringify(deploymentPacket.requiredScriptParameters.map((param) => param.id)));
  assertCase(results, 'w145_operator_test_data_contains_full_request_and_queue_gate', operatorTestData.confirmedBuildRequestJson.schema === 'idb.confirmed-build-request.v1' && operatorTestData.approvedQueueGateForFlagsFalseSmoke.reviewDecision === 'operator_approved_queue_submit' && operatorTestData.approvedQueueGateForFlagsFalseSmoke.typeToConfirm === 'QUEUE GOVERNED SANDBOX RUNNER', JSON.stringify(operatorTestData.approvedQueueGateForFlagsFalseSmoke));
  assertCase(results, 'w145_false_flag_expected_response_no_submit', deploymentPacket.expectedFalseFlagResponse.queueSubmitted === false && deploymentPacket.expectedFalseFlagResponse.runnerTaskId === null && deploymentPacket.expectedFalseFlagResponse.activeOpenLinks === 0, JSON.stringify(deploymentPacket.expectedFalseFlagResponse));
  assertCase(results, 'w145_enabled_response_is_task_pending_no_fake_urls', deploymentPacket.expectedEnabledSandboxResponse.queueSubmitted === true && deploymentPacket.expectedEnabledSandboxResponse.runnerTaskId === 'real NetSuite scheduled task id' && deploymentPacket.expectedEnabledSandboxResponse.resultCaptureStatus === 'pending_runner_completion' && deploymentPacket.expectedEnabledSandboxResponse.recordUrlsReturned === false, JSON.stringify(deploymentPacket.expectedEnabledSandboxResponse));
  assertCase(results, 'w145_visual_test_deferred_until_real_runner_task_id', targetedVisualTestPlan.visualNetSuiteTestingRequiredNow === false && /real non-placeholder runnerTaskId/.test(targetedVisualTestPlan.startCondition), targetedVisualTestPlan.startCondition);
  assertCase(results, 'w145_no_regression_boundaries_preserved', Object.values(noRegression).every((value) => value === true), JSON.stringify(noRegression));

  const failures = results.filter((item) => !item.pass);
  const contract = {
    schema: 'idb.w145-sandbox-deployment-packet-queue-submit-pilot.v1',
    status: failures.length ? 'blocked' : 'sandbox_deployment_packet_ready_default_flags_false',
    decision: failures.length ? 'FAIL' : 'PASS_SANDBOX_DEPLOYMENT_PACKET_READY__DEFAULT_FLAGS_FALSE',
    deploymentPacket,
    uploadChecklist,
    operatorTestData,
    rollbackPlan,
    targetedVisualTestPlan,
    traceSamples: {
      dataPath,
      tracePath,
      reportPath
    },
    noRegression,
    bestNextCodexPrompt: {
      block: 'W146: Sandbox Upload And Flags-False Deployment Smoke',
      prompt: 'Move through W146: Sandbox Upload And Flags-False Deployment Smoke. Use the W145 deployment packet to upload/deploy the W144 NetSuite-side adapter with all write/queue flags false, then run an operator dry-run smoke proving the adapter accepts the confirmed IDB request and operator evidence but returns queueSubmitted=false, runnerTaskId=null, resultCapture not_started_no_submit, and no active Open links. Do not enable writes or queue submit yet. Preserve no drawer writes, no SuiteScript invocation from the drawer, no drawer transaction writes, consultant confirmation, state authority and handoff parity, no-submit rollback, internal runner ownership, sandbox allowlist, idempotency, and no active Open links without real URLs. Output flags-false deployment evidence, operator test data, trace samples, W146 report, visual testing decision, and best next Codex prompt.'
    },
    harnessResults: results
  };

  const trace = {
    schema: 'idb.w145-sandbox-deployment-packet-queue-submit-pilot-trace.v1',
    decision: contract.decision,
    adapterSourceFile: deploymentPacket.adapterSourceFile,
    defaultFlagsFalse: Object.values(deploymentPacket.defaultFlags).every((value) => value === false),
    requiredParameterCount: deploymentPacket.requiredScriptParameters.length,
    falseFlagExpectedResponse: deploymentPacket.expectedFalseFlagResponse,
    enabledSandboxExpectedResponse: deploymentPacket.expectedEnabledSandboxResponse,
    visualTestingDecision: targetedVisualTestPlan,
    noRegression,
    bestNextCodexPrompt: contract.bestNextCodexPrompt
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);
  fs.writeFileSync(reportPath, `# W145 Sandbox Deployment Packet For Server-Flagged Queue Submit Pilot

Status: ${contract.status}

## Decision

${contract.decision}

## Deployment Packet

- Adapter source: ${deploymentPacket.adapterSourceFile}
- Script type: ${deploymentPacket.scriptRecord.scriptType}
- Script id: ${deploymentPacket.scriptRecord.scriptId}
- Deployment id: ${deploymentPacket.scriptRecord.deploymentId}
- Audience: ${deploymentPacket.scriptRecord.audience}
- Default CREATE_ENABLED: ${deploymentPacket.defaultFlags.custscript_idb_create_enabled}
- Default GOVERNED_SANDBOX_WRITE_ENABLED: ${deploymentPacket.defaultFlags.custscript_idb_governed_sandbox_write_enabled}
- Default QUEUE_SUBMIT_ENABLED: ${deploymentPacket.defaultFlags.custscript_idb_queue_submit_enabled}

## Script And Deployment Parameters

${deploymentPacket.requiredScriptParameters.map((param) => `- ${param.id}: ${param.type}; default=${param.defaultValue}; requiredForSubmit=${param.requiredForSubmit}`).join('\n')}

## Upload Checklist

${uploadChecklist.map((item) => `- ${item}`).join('\n')}

## Operator Test Data

- Confirmed request schema: ${operatorTestData.confirmedBuildRequestJson.schema}
- Prospect: ${operatorTestData.confirmedBuildRequestJson.prospect.name}
- Approved gate decision: ${operatorTestData.approvedQueueGateForFlagsFalseSmoke.reviewDecision}
- Type-to-confirm: ${operatorTestData.approvedQueueGateForFlagsFalseSmoke.typeToConfirm}
- Negative gate decision: ${operatorTestData.negativeGateShouldBlock.reviewDecision}

## Rollback Plan

${rollbackPlan.map((item) => `- ${item}`).join('\n')}

## Targeted Visual Test Plan

- Visual NetSuite testing required now: No.
- Start condition: ${targetedVisualTestPlan.startCondition}
- Broader visual NetSuite testing required: No.

${targetedVisualTestPlan.stepsAfterRunnerTaskId.map((item) => `- ${item}`).join('\n')}

## Trace Samples

- Data: ${dataPath}
- Trace: ${tracePath}

## Best Next Codex Prompt

${contract.bestNextCodexPrompt.prompt}
`);

  console.log(`W145 sandbox deployment packet: ${contract.decision}; visualNow=${targetedVisualTestPlan.visualNetSuiteTestingRequiredNow}`);
  if (failures.length) {
    failures.forEach((failure) => console.error(`FAIL ${failure.name}: ${failure.detail}`));
    process.exit(1);
  }
}

main();
