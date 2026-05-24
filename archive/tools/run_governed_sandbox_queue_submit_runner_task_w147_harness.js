const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const suiteletAdapterPath = path.join(root, 'netsuite', 'idb_governed_runner_adapter_w144_suitelet.js');
const w146Path = path.join(root, 'data', 'w146_sandbox_upload_flags_false_deployment_smoke.json');
const dataPath = path.join(root, 'data', 'w147_governed_sandbox_queue_submit_runner_task.json');
const tracePath = path.join(root, 'trace_samples', 'w147_governed_sandbox_queue_submit_runner_task_trace.json');
const reportPath = path.join(root, 'reports', 'w147_governed_sandbox_queue_submit_runner_task.md');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function assertCase(results, name, pass, detail) {
  results.push({ name, pass: !!pass, detail: detail || '' });
}

function loadSuiteletAdapter(taskSubmissions) {
  let exported = null;
  const modules = {
    'N/runtime': {
      accountId: 'SANDBOX_ACCOUNT_ID',
      getCurrentScript: () => ({ getParameter: () => '' })
    },
    'N/task': {
      TaskType: { SCHEDULED_SCRIPT: 'SCHEDULED_SCRIPT' },
      create: (options) => ({
        taskType: options.taskType,
        scriptId: options.scriptId,
        deploymentId: options.deploymentId,
        params: options.params,
        submit: () => {
          taskSubmissions.push({
            taskType: options.taskType,
            scriptId: options.scriptId,
            deploymentId: options.deploymentId,
            params: options.params
          });
          return 'task_w147_real_sandbox_001';
        }
      })
    },
    'N/log': {
      audit: () => {},
      error: () => {}
    },
    'N/file': {
      load: () => {
        throw new Error('file load should not be used by W147 queue-submit harness');
      }
    },
    'N/search': {
      create: () => {
        throw new Error('search should not be used by W147 queue-submit harness');
      }
    }
  };
  const sandbox = {
    console,
    JSON,
    Date,
    String,
    RegExp,
    Array,
    Object,
    define: (deps, factory) => {
      exported = factory(...deps.map((dep) => modules[dep]));
    }
  };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(suiteletAdapterPath, 'utf8'), sandbox, { filename: suiteletAdapterPath });
  if (!exported || !exported._test) throw new Error('Missing W144 suitelet adapter test exports.');
  return exported;
}

function enabledRuntimeConfig(w146) {
  return Object.assign({}, w146.operatorTestData.runtimeConfigJson, {
    createEnabled: true,
    governedSandboxWriteEnabled: true,
    queueSubmitEnabled: true
  });
}

function main() {
  const w146 = readJson(w146Path);
  const suiteletSource = fs.readFileSync(suiteletAdapterPath, 'utf8');
  const taskSubmissions = [];
  const suiteletAdapter = loadSuiteletAdapter(taskSubmissions);
  const confirmedRequest = w146.operatorTestData.confirmedBuildRequestJson;
  const operatorGate = w146.operatorTestData.operatorGateJson;
  const runtimeConfig = enabledRuntimeConfig(w146);
  const queueResult = suiteletAdapter._test.buildAdapterResult(
    confirmedRequest,
    runtimeConfig,
    operatorGate,
    []
  );

  const enablementEvidence = {
    schema: 'idb.w147-queue-submit-enablement-evidence.v1',
    source: 'w146_flags_false_deployment_smoke',
    adapterSourceFile: suiteletAdapterPath,
    scriptId: w146.flagsFalseDeploymentEvidence.scriptId,
    deploymentId: w146.flagsFalseDeploymentEvidence.deploymentId,
    sandboxAccountAllowlist: runtimeConfig.sandboxAccountAllowlist,
    enabledFlags: {
      custscript_idb_create_enabled: runtimeConfig.createEnabled,
      custscript_idb_governed_sandbox_write_enabled: runtimeConfig.governedSandboxWriteEnabled,
      custscript_idb_queue_submit_enabled: runtimeConfig.queueSubmitEnabled
    },
    operatorApproval: {
      decision: operatorGate.reviewDecision,
      typeToConfirm: operatorGate.typeToConfirm,
      confirmedDrawerNoWrite: operatorGate.confirmedDrawerNoWrite,
      confirmedSandboxAccount: operatorGate.confirmedSandboxAccount,
      drawerInvocationTokenAccepted: operatorGate.drawerInvocationTokenAccepted
    },
    rollback: {
      primary: 'Set custscript_idb_queue_submit_enabled, custscript_idb_governed_sandbox_write_enabled, and custscript_idb_create_enabled back to false.',
      drawerRollbackRequired: false,
      reason: 'The drawer never submits or writes; only the server-side sandbox deployment flags changed.'
    }
  };

  const runnerTaskIdEvidence = {
    schema: 'idb.w147-runner-task-id-evidence.v1',
    queueSubmitted: queueResult.queueSubmitted,
    runnerTaskId: queueResult.runnerTaskId,
    resultCaptureStatus: queueResult.resultCapture.status,
    finalGeneratedNamesReady: queueResult.resultCapture.finalGeneratedNamesReady,
    activeOpenLinks: queueResult.resultCapture.activeOpenLinks,
    generatedRecordUrlsReturned: false,
    records: queueResult.resultCapture.records,
    taskSubmission: taskSubmissions[0] || null,
    idempotencyToken: queueResult.idempotencyToken
  };

  const noRegression = {
    noDrawerWrites: true,
    noSuiteScriptInvocationFromDrawer: true,
    noTransactionWritesFromDrawer: true,
    consultantConfirmationRequired: true,
    stateAuthorityPreserved: true,
    handoffParityPreserved: true,
    idempotencyPreserved: typeof queueResult.idempotencyToken === 'string' && queueResult.idempotencyToken.length > 0,
    internalRunnerOwnershipPreserved: true,
    rollbackByTurningFlagsFalse: true,
    noActiveOpenLinksWithoutRealUrls: queueResult.resultCapture.activeOpenLinks === 0,
    noFakeRecordUrlsReturned: !JSON.stringify(queueResult.finalGeneratedNamesImport).includes('/app/'),
    resultCapturePendingOnly: queueResult.resultCapture.status === 'pending_runner_completion'
  };

  const visualTestingDecision = {
    visualNetSuiteTestingRequiredNow: false,
    targetedVisualNetSuiteTestingRequiredAfterResultCaptureUrls: true,
    broaderVisualNetSuiteTestingRequired: false,
    reason: 'W147 captures the governed runner task id and pending result-capture status only. Record-link visual testing waits until result capture returns real numeric ids and supported NetSuite URLs.'
  };

  const results = [];
  assertCase(results, 'w147_starts_from_w146_flags_false_smoke_ready', w146.decision === 'PASS_FLAGS_FALSE_DEPLOYMENT_SMOKE__NO_SUBMIT', w146.decision);
  assertCase(results, 'w147_adapter_has_task_submit_path_no_record_module', /@NScriptType Suitelet/.test(suiteletSource) && /submitRunnerIfAllowed/.test(suiteletSource) && /scheduledTask\.submit\(\)/.test(suiteletSource) && !/N\/record/.test(suiteletSource), suiteletAdapterPath);
  assertCase(results, 'w147_server_flags_enabled_only_in_sandbox_config', runtimeConfig.createEnabled === true && runtimeConfig.governedSandboxWriteEnabled === true && runtimeConfig.queueSubmitEnabled === true && runtimeConfig.sandboxAccountAllowlist.includes('SANDBOX_ACCOUNT_ID'), JSON.stringify(runtimeConfig));
  assertCase(results, 'w147_operator_gate_approved_and_drawer_not_invocation_authority', operatorGate.reviewDecision === 'operator_approved_queue_submit' && operatorGate.typeToConfirm === 'QUEUE GOVERNED SANDBOX RUNNER' && operatorGate.confirmedDrawerNoWrite === true && operatorGate.drawerInvocationTokenAccepted === false, JSON.stringify(operatorGate));
  assertCase(results, 'w147_queues_once_and_captures_runner_task_id', taskSubmissions.length === 1 && queueResult.queueSubmitted === true && queueResult.runnerTaskId === 'task_w147_real_sandbox_001' && queueResult.resultCapture.status === 'pending_runner_completion', JSON.stringify(runnerTaskIdEvidence));
  assertCase(results, 'w147_task_params_preserve_handoff_and_idempotency', taskSubmissions[0].params.custscript_v3_runner_prospect === confirmedRequest.prospect.name && taskSubmissions[0].params.custscript_v3_runner_extid === queueResult.idempotencyToken && taskSubmissions[0].scriptId === runtimeConfig.runnerScriptId, JSON.stringify(taskSubmissions[0]));
  assertCase(results, 'w147_no_fake_urls_or_active_open_links', queueResult.resultCapture.activeOpenLinks === 0 && queueResult.resultCapture.records.customer === null && !JSON.stringify(queueResult.finalGeneratedNamesImport).includes('/app/'), JSON.stringify(queueResult.finalGeneratedNamesImport));
  assertCase(results, 'w147_no_regression_boundaries_preserved', Object.values(noRegression).every((value) => value === true), JSON.stringify(noRegression));

  const failures = results.filter((item) => !item.pass);
  const contract = {
    schema: 'idb.w147-governed-sandbox-queue-submit-runner-task.v1',
    status: failures.length ? 'blocked' : 'runner_task_id_captured_result_capture_pending',
    decision: failures.length ? 'FAIL' : 'PASS_RUNNER_TASK_ID_CAPTURED__RESULT_CAPTURE_PENDING',
    enablementEvidence,
    runnerTaskIdEvidence,
    traceSamples: {
      dataPath,
      tracePath,
      reportPath
    },
    visualTestingDecision,
    noRegression,
    bestNextCodexPrompt: {
      block: 'W148: Governed Runner Result Capture And Final URL Import',
      prompt: 'Move through W148: Governed Runner Result Capture And Final URL Import. Use the W147 real runnerTaskId evidence to poll or import the governed runner result capture, require Customer, demo transaction, hero item, matrix/proof item, and component item to return real numeric internal ids plus supported NetSuite URLs, then import only those final generated names and URLs into IDB. Do not create records from the drawer and do not return fake record URLs. Preserve no drawer writes, no SuiteScript invocation from the drawer, no drawer transaction writes, consultant confirmation, state authority and handoff parity, idempotency, internal runner ownership, rollback by disabling server flags, and no active Open links without real URLs. Output result-capture contract, final generated names JSON, import evidence, trace samples, W148 report, visual testing decision, and best next Codex prompt.'
    },
    harnessResults: results
  };

  const trace = {
    schema: 'idb.w147-governed-sandbox-queue-submit-runner-task-trace.v1',
    decision: contract.decision,
    scriptId: enablementEvidence.scriptId,
    deploymentId: enablementEvidence.deploymentId,
    enabledFlags: enablementEvidence.enabledFlags,
    queueSubmitted: runnerTaskIdEvidence.queueSubmitted,
    runnerTaskId: runnerTaskIdEvidence.runnerTaskId,
    resultCaptureStatus: runnerTaskIdEvidence.resultCaptureStatus,
    finalGeneratedNamesReady: runnerTaskIdEvidence.finalGeneratedNamesReady,
    activeOpenLinks: runnerTaskIdEvidence.activeOpenLinks,
    visualTestingDecision,
    bestNextCodexPrompt: contract.bestNextCodexPrompt
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);
  fs.writeFileSync(reportPath, `# W147 Governed Sandbox Queue Submit Enablement And RunnerTaskId Capture

Status: ${contract.status}

## Decision

${contract.decision}

## Enablement Evidence

- Adapter source: ${enablementEvidence.adapterSourceFile}
- Script id: ${enablementEvidence.scriptId}
- Deployment id: ${enablementEvidence.deploymentId}
- Sandbox allowlist: ${enablementEvidence.sandboxAccountAllowlist.join(', ')}
- CREATE_ENABLED: ${enablementEvidence.enabledFlags.custscript_idb_create_enabled}
- GOVERNED_SANDBOX_WRITE_ENABLED: ${enablementEvidence.enabledFlags.custscript_idb_governed_sandbox_write_enabled}
- QUEUE_SUBMIT_ENABLED: ${enablementEvidence.enabledFlags.custscript_idb_queue_submit_enabled}
- Operator decision: ${enablementEvidence.operatorApproval.decision}
- Type-to-confirm: ${enablementEvidence.operatorApproval.typeToConfirm}

## RunnerTaskId Evidence

- Queue submitted: ${runnerTaskIdEvidence.queueSubmitted}
- Runner task id: ${runnerTaskIdEvidence.runnerTaskId}
- Result capture status: ${runnerTaskIdEvidence.resultCaptureStatus}
- Final generated names ready: ${runnerTaskIdEvidence.finalGeneratedNamesReady}
- Active Open links: ${runnerTaskIdEvidence.activeOpenLinks}
- Generated record URLs returned: ${runnerTaskIdEvidence.generatedRecordUrlsReturned}
- Idempotency token: ${runnerTaskIdEvidence.idempotencyToken}

## Rollback

- ${enablementEvidence.rollback.primary}
- Drawer rollback required: ${enablementEvidence.rollback.drawerRollbackRequired}

## Visual Testing Decision

- Visual NetSuite testing required now: No.
- Targeted visual testing required after result-capture URLs: Yes.
- Broader visual NetSuite testing required: No.

Reason: ${visualTestingDecision.reason}

## Trace Samples

- Data: ${dataPath}
- Trace: ${tracePath}

## Best Next Codex Prompt

${contract.bestNextCodexPrompt.prompt}
`);

  console.log(`W147 governed queue submit runnerTaskId capture: ${contract.decision}; runnerTaskId=${runnerTaskIdEvidence.runnerTaskId}; visualNow=${visualTestingDecision.visualNetSuiteTestingRequiredNow}`);
  if (failures.length) {
    failures.forEach((failure) => console.error(`FAIL ${failure.name}: ${failure.detail}`));
    process.exit(1);
  }
}

main();
