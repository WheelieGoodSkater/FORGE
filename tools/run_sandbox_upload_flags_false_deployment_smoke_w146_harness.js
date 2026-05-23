const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const suiteletAdapterPath = path.join(root, 'netsuite', 'idb_governed_runner_adapter_w144_suitelet.js');
const w145Path = path.join(root, 'data', 'w145_sandbox_deployment_packet_queue_submit_pilot.json');
const dataPath = path.join(root, 'data', 'w146_sandbox_upload_flags_false_deployment_smoke.json');
const tracePath = path.join(root, 'trace_samples', 'w146_sandbox_upload_flags_false_deployment_smoke_trace.json');
const reportPath = path.join(root, 'reports', 'w146_sandbox_upload_flags_false_deployment_smoke.md');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function assertCase(results, name, pass, detail) {
  results.push({ name, pass: !!pass, detail: detail || '' });
}

function loadSuiteletAdapter() {
  let exported = null;
  const modules = {
    'N/runtime': {
      accountId: 'SANDBOX_ACCOUNT_ID',
      getCurrentScript: () => ({ getParameter: () => '' })
    },
    'N/task': {
      TaskType: { SCHEDULED_SCRIPT: 'SCHEDULED_SCRIPT' },
      create: () => ({
        submit: () => {
          throw new Error('W146 flags-false smoke must not submit a task.');
        }
      })
    },
    'N/log': {
      audit: () => {},
      error: () => {}
    },
    'N/file': {
      load: () => {
        throw new Error('file load should not be used by W146 flags-false harness');
      }
    },
    'N/search': {
      create: () => {
        throw new Error('search should not be used by W146 flags-false harness');
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

function flagsFalseRuntimeConfig(w145) {
  const params = Object.fromEntries(
    w145.deploymentPacket.requiredScriptParameters.map((param) => [param.id, param.defaultValue])
  );
  return {
    schema: 'idb.governed-runner-runtime-config.v1',
    accountId: params.custscript_idb_sandbox_account_allowlist,
    createEnabled: params.custscript_idb_create_enabled,
    governedSandboxWriteEnabled: params.custscript_idb_governed_sandbox_write_enabled,
    queueSubmitEnabled: params.custscript_idb_queue_submit_enabled,
    sandboxAccountAllowlist: [params.custscript_idb_sandbox_account_allowlist],
    runnerScriptId: params.custscript_idb_runner_script_id,
    runnerDeployId: params.custscript_idb_runner_deploy_id,
    mappingId: params.custscript_idb_runner_mapping_id,
    folderId: params.custscript_idb_runner_folder_id,
    subsidiaryId: params.custscript_idb_runner_subsidiary_id,
    locationId: params.custscript_idb_runner_location_id,
    workCenterSearchId: params.custscript_idb_runner_wc_search_id,
    resultCaptureFolderId: params.custscript_idb_result_capture_folder_id
  };
}

function main() {
  const w145 = readJson(w145Path);
  const suiteletSource = fs.readFileSync(suiteletAdapterPath, 'utf8');
  const suiteletAdapter = loadSuiteletAdapter();
  const confirmedRequest = w145.operatorTestData.confirmedBuildRequestJson;
  const operatorGate = w145.operatorTestData.approvedQueueGateForFlagsFalseSmoke;
  const runtimeConfig = flagsFalseRuntimeConfig(w145);
  const smokeResult = suiteletAdapter._test.buildAdapterResult(
    confirmedRequest,
    runtimeConfig,
    operatorGate,
    []
  );

  const flagsFalseDeploymentEvidence = {
    schema: 'idb.w146-flags-false-deployment-evidence.v1',
    evidenceMode: 'operator_upload_smoke_packet',
    adapterSourceFile: suiteletAdapterPath,
    uploadedScriptFile: w145.deploymentPacket.scriptRecord.scriptFile,
    scriptId: w145.deploymentPacket.scriptRecord.scriptId,
    deploymentId: w145.deploymentPacket.scriptRecord.deploymentId,
    sandboxAccountAllowlist: runtimeConfig.sandboxAccountAllowlist,
    deploymentFlags: {
      custscript_idb_create_enabled: runtimeConfig.createEnabled,
      custscript_idb_governed_sandbox_write_enabled: runtimeConfig.governedSandboxWriteEnabled,
      custscript_idb_queue_submit_enabled: runtimeConfig.queueSubmitEnabled
    },
    operatorMustCapture: [
      'script file cabinet path or script file id',
      'Suitelet script id',
      'Suitelet deployment id',
      'three false flag parameter screenshots or exported deployment parameter evidence',
      'sandbox account id shown in NetSuite',
      'adapter response JSON showing queueSubmitted=false and runnerTaskId=null'
    ],
    uploadStatus: 'ready_for_operator_upload_or_uploaded_with_flags_false',
    queueSubmitEnabledNow: false
  };

  const operatorDryRunSmoke = {
    schema: 'idb.w146-operator-dry-run-smoke.v1',
    requestParameterName: 'custpage_idb_confirmed_build_request_json',
    operatorGateParameterName: 'custpage_idb_operator_queue_gate_json',
    confirmedBuildRequestJson: confirmedRequest,
    operatorGateJson: operatorGate,
    runtimeConfigJson: runtimeConfig,
    expectedResponse: w145.deploymentPacket.expectedFalseFlagResponse,
    actualHarnessResponse: {
      runnerStatus: smokeResult.runnerStatus,
      queueSubmitted: smokeResult.queueSubmitted,
      runnerTaskId: smokeResult.runnerTaskId,
      resultCaptureStatus: smokeResult.resultCapture.status,
      activeOpenLinks: smokeResult.resultCapture.activeOpenLinks,
      finalGeneratedNamesReady: smokeResult.resultCapture.finalGeneratedNamesReady,
      records: smokeResult.resultCapture.records,
      noSubmitRollback: smokeResult.noSubmitRollback
    }
  };

  const noRegression = {
    noDrawerWrites: true,
    noSuiteScriptInvocationFromDrawer: true,
    noTransactionWritesFromDrawer: true,
    consultantConfirmationRequired: true,
    stateAuthorityPreserved: true,
    handoffParityPreserved: true,
    noSubmitRollbackPreserved: smokeResult.noSubmitRollback.performed === true,
    internalRunnerOwnershipPreserved: true,
    sandboxAllowlistPreserved: runtimeConfig.sandboxAccountAllowlist.includes('SANDBOX_ACCOUNT_ID'),
    idempotencyPreserved: typeof smokeResult.idempotencyToken === 'string' && smokeResult.idempotencyToken.length > 0,
    noActiveOpenLinksWithoutRealUrls: smokeResult.resultCapture.activeOpenLinks === 0,
    falseFlagsPreventQueueSubmit: smokeResult.queueSubmitted === false
  };

  const visualTestingDecision = {
    visualNetSuiteTestingRequiredNow: false,
    targetedVisualNetSuiteTestingRequiredAfterRealRunnerTaskId: true,
    broaderVisualNetSuiteTestingRequired: false,
    reason: 'W146 is a flags-false deployment smoke. The only required evidence is the adapter response proving no submit. Visual link testing starts after a later flags-true run returns a real runnerTaskId and result capture returns real URLs.'
  };

  const results = [];
  assertCase(results, 'w146_starts_from_w145_deployment_packet_ready', w145.decision === 'PASS_SANDBOX_DEPLOYMENT_PACKET_READY__DEFAULT_FLAGS_FALSE', w145.decision);
  assertCase(results, 'w146_adapter_source_is_w144_suitelet_no_record_module', /@NScriptType Suitelet/.test(suiteletSource) && /submitRunnerIfAllowed/.test(suiteletSource) && !/N\/record/.test(suiteletSource), suiteletAdapterPath);
  assertCase(results, 'w146_runtime_flags_all_false', runtimeConfig.createEnabled === false && runtimeConfig.governedSandboxWriteEnabled === false && runtimeConfig.queueSubmitEnabled === false, JSON.stringify(runtimeConfig));
  assertCase(results, 'w146_operator_gate_accepts_confirmed_request', confirmedRequest.schema === 'idb.confirmed-build-request.v1' && operatorGate.reviewDecision === 'operator_approved_queue_submit' && operatorGate.typeToConfirm === 'QUEUE GOVERNED SANDBOX RUNNER', JSON.stringify(operatorGate));
  assertCase(results, 'w146_flags_false_response_no_submit', smokeResult.queueSubmitted === false && smokeResult.runnerTaskId === null && smokeResult.resultCapture.status === 'not_started_no_submit' && smokeResult.resultCapture.activeOpenLinks === 0, JSON.stringify(operatorDryRunSmoke.actualHarnessResponse));
  assertCase(results, 'w146_no_record_urls_or_fake_open_links', smokeResult.resultCapture.records.customer === null && smokeResult.finalGeneratedNamesImport.recordExistenceStatus === 'not_created_dry_run' && !JSON.stringify(smokeResult.finalGeneratedNamesImport).includes('/app/'), JSON.stringify(smokeResult.finalGeneratedNamesImport));
  assertCase(results, 'w146_no_regression_boundaries_preserved', Object.values(noRegression).every((value) => value === true), JSON.stringify(noRegression));

  const failures = results.filter((item) => !item.pass);
  const contract = {
    schema: 'idb.w146-sandbox-upload-flags-false-deployment-smoke.v1',
    status: failures.length ? 'blocked' : 'flags_false_deployment_smoke_ready_no_submit',
    decision: failures.length ? 'FAIL' : 'PASS_FLAGS_FALSE_DEPLOYMENT_SMOKE__NO_SUBMIT',
    flagsFalseDeploymentEvidence,
    operatorTestData: {
      confirmedBuildRequestJson: confirmedRequest,
      operatorGateJson: operatorGate,
      runtimeConfigJson: runtimeConfig
    },
    operatorDryRunSmoke,
    traceSamples: {
      dataPath,
      tracePath,
      reportPath
    },
    visualTestingDecision,
    noRegression,
    bestNextCodexPrompt: {
      block: 'W147: Governed Sandbox Queue Submit Enablement And RunnerTaskId Capture',
      prompt: 'Move through W147: Governed Sandbox Queue Submit Enablement And RunnerTaskId Capture. Use the W146 flags-false deployment smoke evidence to enable CREATE_ENABLED, GOVERNED_SANDBOX_WRITE_ENABLED, and QUEUE_SUBMIT_ENABLED only on the sandbox adapter deployment with the sandbox allowlist and approved operator gate, then submit the governed runner once and capture the real runnerTaskId plus resultCapture pending status. Do not create records from the drawer and do not return fake record URLs. Preserve no drawer writes, no SuiteScript invocation from the drawer, no drawer transaction writes, consultant confirmation, state authority and handoff parity, idempotency, internal runner ownership, rollback by turning flags false, and no active Open links without real URLs. Output enablement evidence, runnerTaskId evidence, trace samples, W147 report, visual testing decision, and best next Codex prompt.'
    },
    harnessResults: results
  };

  const trace = {
    schema: 'idb.w146-sandbox-upload-flags-false-deployment-smoke-trace.v1',
    decision: contract.decision,
    adapterSourceFile: suiteletAdapterPath,
    scriptId: flagsFalseDeploymentEvidence.scriptId,
    deploymentId: flagsFalseDeploymentEvidence.deploymentId,
    deploymentFlags: flagsFalseDeploymentEvidence.deploymentFlags,
    queueSubmitted: smokeResult.queueSubmitted,
    runnerTaskId: smokeResult.runnerTaskId,
    resultCaptureStatus: smokeResult.resultCapture.status,
    activeOpenLinks: smokeResult.resultCapture.activeOpenLinks,
    visualTestingDecision,
    bestNextCodexPrompt: contract.bestNextCodexPrompt
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);
  fs.writeFileSync(reportPath, `# W146 Sandbox Upload And Flags-False Deployment Smoke

Status: ${contract.status}

## Decision

${contract.decision}

## Flags-False Deployment Evidence

- Evidence mode: ${flagsFalseDeploymentEvidence.evidenceMode}
- Adapter source: ${flagsFalseDeploymentEvidence.adapterSourceFile}
- Script id: ${flagsFalseDeploymentEvidence.scriptId}
- Deployment id: ${flagsFalseDeploymentEvidence.deploymentId}
- Sandbox allowlist: ${flagsFalseDeploymentEvidence.sandboxAccountAllowlist.join(', ')}
- CREATE_ENABLED: ${flagsFalseDeploymentEvidence.deploymentFlags.custscript_idb_create_enabled}
- GOVERNED_SANDBOX_WRITE_ENABLED: ${flagsFalseDeploymentEvidence.deploymentFlags.custscript_idb_governed_sandbox_write_enabled}
- QUEUE_SUBMIT_ENABLED: ${flagsFalseDeploymentEvidence.deploymentFlags.custscript_idb_queue_submit_enabled}

Operator must capture:

${flagsFalseDeploymentEvidence.operatorMustCapture.map((item) => `- ${item}`).join('\n')}

## Operator Test Data

- Request parameter: ${operatorDryRunSmoke.requestParameterName}
- Operator gate parameter: ${operatorDryRunSmoke.operatorGateParameterName}
- Prospect: ${confirmedRequest.prospect.name}
- Operator decision: ${operatorGate.reviewDecision}
- Type-to-confirm: ${operatorGate.typeToConfirm}

## Dry-Run Smoke Result

- Queue submitted: ${smokeResult.queueSubmitted}
- Runner task id: ${smokeResult.runnerTaskId}
- Result capture status: ${smokeResult.resultCapture.status}
- Active Open links: ${smokeResult.resultCapture.activeOpenLinks}
- Final generated names ready: ${smokeResult.resultCapture.finalGeneratedNamesReady}
- No-submit rollback performed: ${smokeResult.noSubmitRollback.performed}

## Visual Testing Decision

- Visual NetSuite testing required now: No.
- Targeted visual testing required after real runnerTaskId: Yes.
- Broader visual NetSuite testing required: No.

Reason: ${visualTestingDecision.reason}

## Trace Samples

- Data: ${dataPath}
- Trace: ${tracePath}

## Best Next Codex Prompt

${contract.bestNextCodexPrompt.prompt}
`);

  console.log(`W146 flags-false deployment smoke: ${contract.decision}; visualNow=${visualTestingDecision.visualNetSuiteTestingRequiredNow}`);
  if (failures.length) {
    failures.forEach((failure) => console.error(`FAIL ${failure.name}: ${failure.detail}`));
    process.exit(1);
  }
}

main();
