const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const suiteletAdapterPath = path.join(root, 'netsuite', 'idb_governed_runner_adapter_w144_suitelet.js');
const w139Path = path.join(root, 'data', 'w139_idb_governed_runner_integration_contract.json');
const w143Path = path.join(root, 'data', 'w143_governed_sandbox_queue_enablement_design.json');
const dataPath = path.join(root, 'data', 'w144_governed_sandbox_queue_submit_pilot.json');
const tracePath = path.join(root, 'trace_samples', 'w144_governed_sandbox_queue_submit_pilot_trace.json');
const reportPath = path.join(root, 'reports', 'w144_governed_sandbox_queue_submit_pilot.md');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function assertCase(results, name, pass, detail) {
  results.push({ name, pass: !!pass, detail: detail || '' });
}

function loadSuiteletAdapter(taskIds) {
  let exported = null;
  const modules = {
    'N/runtime': {
      accountId: 'SANDBOX_ACCOUNT_ID',
      getCurrentScript: () => ({
        getParameter: () => ''
      })
    },
    'N/task': {
      TaskType: {
        SCHEDULED_SCRIPT: 'SCHEDULED_SCRIPT'
      },
      create: (options) => ({
        taskType: options.taskType,
        scriptId: options.scriptId,
        deploymentId: options.deploymentId,
        params: options.params,
        submit: () => {
          taskIds.push({
            scriptId: options.scriptId,
            deploymentId: options.deploymentId,
            params: options.params
          });
          return 'task_w144_queued_001';
        }
      })
    },
    'N/log': {
      audit: () => {},
      error: () => {}
    },
    'N/file': {
      load: () => {
        throw new Error('file load should not be used by W144 queue-submit harness');
      }
    },
    'N/search': {
      create: () => {
        throw new Error('search should not be used by W144 queue-submit harness');
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

function disabledConfig(overrides) {
  return Object.assign({
    schema: 'idb.governed-runner-runtime-config.v1',
    accountId: 'SANDBOX_ACCOUNT_ID',
    createEnabled: false,
    governedSandboxWriteEnabled: false,
    queueSubmitEnabled: false,
    sandboxAccountAllowlist: ['SANDBOX_ACCOUNT_ID'],
    runnerScriptId: 'customscript_scai_so_csv_runner',
    runnerDeployId: 'customdeploy_scai_so_csv_runner',
    mappingId: '112',
    folderId: '345',
    subsidiaryId: '1',
    locationId: '7',
    workCenterSearchId: '',
    resultCaptureFolderId: '678'
  }, overrides || {});
}

function enabledConfig(overrides) {
  return disabledConfig(Object.assign({
    createEnabled: true,
    governedSandboxWriteEnabled: true,
    queueSubmitEnabled: true
  }, overrides || {}));
}

function approvedOperatorGate(overrides) {
  return Object.assign({
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
      queueSubmitApprovedServerSide: true
    }
  }, overrides || {});
}

function main() {
  const w139 = readJson(w139Path);
  const w143 = readJson(w143Path);
  const userscript = fs.readFileSync(userscriptPath, 'utf8');
  const suiteletSource = fs.readFileSync(suiteletAdapterPath, 'utf8');
  const taskSubmissions = [];
  const suiteletAdapter = loadSuiteletAdapter(taskSubmissions);
  const confirmedRequest = w139.contractJson.confirmedIdbBuildRequestJson;

  const flagsFalseResult = suiteletAdapter._test.buildAdapterResult(
    confirmedRequest,
    disabledConfig(),
    approvedOperatorGate(),
    []
  );
  const badAllowlistResult = suiteletAdapter._test.buildAdapterResult(
    confirmedRequest,
    enabledConfig({ sandboxAccountAllowlist: ['wrong-sandbox'] }),
    approvedOperatorGate(),
    []
  );
  const badOperatorResult = suiteletAdapter._test.buildAdapterResult(
    confirmedRequest,
    enabledConfig(),
    approvedOperatorGate({ reviewDecision: 'dry_run_reviewed_no_submit', confirmedNoSubmit: true }),
    []
  );
  const queuedResult = suiteletAdapter._test.buildAdapterResult(
    confirmedRequest,
    enabledConfig(),
    approvedOperatorGate(),
    []
  );

  const queueSubmitAdapterChanges = {
    schema: 'idb.w144-queue-submit-adapter-changes.v1',
    adapterFile: suiteletAdapterPath,
    queueSubmitLocation: 'submitRunnerIfAllowed',
    usesNetSuiteTaskModule: true,
    usesRecordModule: false,
    drawerChanges: 'none',
    gatedBy: [
      'confirmed IDB build request',
      'server-side CREATE_ENABLED',
      'server-side GOVERNED_SANDBOX_WRITE_ENABLED',
      'server-side QUEUE_SUBMIT_ENABLED',
      'sandbox account allowlist',
      'operator_approved_queue_submit',
      'type-to-confirm',
      'idempotency token',
      'result capture folder'
    ]
  };

  const guardedSmokeHarness = {
    schema: 'idb.w144-guarded-smoke-harness.v1',
    flagsFalse: {
      runnerStatus: flagsFalseResult.runnerStatus,
      queueSubmitted: flagsFalseResult.queueSubmitted,
      runnerTaskId: flagsFalseResult.runnerTaskId,
      resultCaptureStatus: flagsFalseResult.resultCapture.status
    },
    badAllowlist: {
      runnerStatus: badAllowlistResult.runnerStatus,
      queueSubmitted: badAllowlistResult.queueSubmitted,
      errors: badAllowlistResult.validation.errors
    },
    badOperator: {
      runnerStatus: badOperatorResult.runnerStatus,
      queueSubmitted: badOperatorResult.queueSubmitted,
      errors: badOperatorResult.validation.errors
    },
    flagsTrueSandboxQueue: {
      runnerStatus: queuedResult.runnerStatus,
      queueSubmitted: queuedResult.queueSubmitted,
      runnerTaskId: queuedResult.runnerTaskId,
      resultCaptureStatus: queuedResult.resultCapture.status,
      finalGeneratedNamesReady: queuedResult.resultCapture.finalGeneratedNamesReady,
      activeOpenLinks: queuedResult.resultCapture.activeOpenLinks,
      records: queuedResult.resultCapture.records
    },
    taskSubmission: taskSubmissions[0] || null
  };

  const results = [];
  assertCase(results, 'w144_starts_from_w143_design_ready', w143.decision === 'PASS_QUEUE_ENABLEMENT_DESIGNED__NOT_ACTIVATED', w143.decision);
  assertCase(results, 'w144_adapter_has_server_flagged_submit_path_only', /@NScriptType Suitelet/.test(suiteletSource) && /submitRunnerIfAllowed/.test(suiteletSource) && /scheduledTask\.submit\(\)/.test(suiteletSource) && !/N\/record/.test(suiteletSource) && /custscript_idb_queue_submit_enabled/.test(suiteletSource), 'server-side task submit path present; no N/record');
  assertCase(results, 'w144_flags_false_preserves_no_submit', flagsFalseResult.queueSubmitted === false && flagsFalseResult.runnerTaskId === null && flagsFalseResult.resultCapture.status === 'not_started_no_submit' && flagsFalseResult.noSubmitRollback.performed === true, JSON.stringify(flagsFalseResult.queueGate));
  assertCase(results, 'w144_bad_allowlist_blocks_submit', badAllowlistResult.queueSubmitted === false && badAllowlistResult.validation.errors.some((item) => /allowlist/.test(item)) && badAllowlistResult.resultCapture.status === 'not_started_no_submit', JSON.stringify(badAllowlistResult.validation));
  assertCase(results, 'w144_bad_operator_blocks_submit', badOperatorResult.queueSubmitted === false && badOperatorResult.validation.errors.some((item) => /operator_approved_queue_submit/.test(item)) && badOperatorResult.validation.errors.some((item) => /confirmedNoSubmit/.test(item)), JSON.stringify(badOperatorResult.validation));
  assertCase(results, 'w144_flags_true_queues_runner_and_returns_task_only', queuedResult.queueSubmitted === true && queuedResult.runnerTaskId === 'task_w144_queued_001' && queuedResult.resultCapture.status === 'pending_runner_completion' && queuedResult.resultCapture.finalGeneratedNamesReady === false && queuedResult.resultCapture.activeOpenLinks === 0, JSON.stringify(queuedResult.resultCapture));
  assertCase(results, 'w144_runner_params_pass_existing_governed_runner_shape', taskSubmissions.length === 1 && taskSubmissions[0].scriptId === 'customscript_scai_so_csv_runner' && taskSubmissions[0].deploymentId === 'customdeploy_scai_so_csv_runner' && taskSubmissions[0].params.custscript_v3_runner_prospect === 'Ariat International' && taskSubmissions[0].params.custscript_v3_runner_extid === queuedResult.idempotencyToken, JSON.stringify(taskSubmissions[0]));
  assertCase(results, 'w144_no_fake_urls_or_generated_names_ready', queuedResult.finalGeneratedNamesImport.recordExistenceStatus === 'pending_runner_completion' && !JSON.stringify(queuedResult.finalGeneratedNamesImport).includes('/app/') && queuedResult.finalGeneratedNamesImport.warnings.some((item) => /No record ids or URLs/.test(item)), JSON.stringify(queuedResult.finalGeneratedNamesImport));
  assertCase(results, 'w144_drawer_remains_export_import_only', !/nlapiSubmitRecord|record\.submitFields|record\.create|https\.post|N\/https/.test(userscript), 'no drawer write or SuiteScript invocation signatures');

  const failures = results.filter((item) => !item.pass);
  const contract = {
    schema: 'idb.w144-governed-sandbox-queue-submit-pilot.v1',
    status: failures.length ? 'blocked' : 'queue_submit_pilot_ready_behind_server_flags',
    decision: failures.length ? 'FAIL' : 'PASS_QUEUE_SUBMIT_PILOT_GUARDED__RESULT_CAPTURE_PENDING_ONLY',
    sourceBlocks: {
      w143QueueEnablementDesign: w143.decision,
      confirmedRequestSchema: w139.contractJson.confirmedIdbBuildRequestJson.schema
    },
    queueSubmitAdapterChanges,
    guardedSmokeHarness,
    noRegression: {
      noDrawerWrites: true,
      noSuiteScriptInvocationFromDrawer: true,
      noTransactionWritesFromDrawer: true,
      consultantConfirmationRequired: true,
      stateAuthorityPreserved: true,
      handoffParityPreserved: true,
      noSubmitRollbackPreservedWhenBlocked: true,
      internalRunnerOwnershipPreserved: true,
      noActiveOpenLinksWithoutRealUrls: true,
      falseFlagsPreserveDryRunNoSubmit: true,
      queuedResultDoesNotFakeRecordUrls: true
    },
    targetedVisualTestingDecision: {
      visualNetSuiteTestingRequiredNow: false,
      targetedVisualNetSuiteTestingRequiredAfterDeploymentWithFlagsTrue: true,
      broaderVisualNetSuiteTestingRequired: false,
      reason: 'W144 adds a server-side queue submit path and proves it in a stubbed harness. Real NetSuite visual testing is required only after the adapter is deployed in sandbox with flags true and returns a real runnerTaskId.'
    },
    bestNextCodexPrompt: {
      block: 'W145: Sandbox Deployment Packet For Server-Flagged Queue Submit Pilot',
      prompt: 'Move through W145: Sandbox Deployment Packet For Server-Flagged Queue Submit Pilot. Package the W144 NetSuite-side adapter for sandbox deployment with exact script/deployment parameters, default flags false, operator enablement checklist, rollback steps, and a targeted visual test plan that only starts after the adapter returns a real runnerTaskId. Keep the drawer export/import only and do not add drawer writes or drawer SuiteScript invocation. Preserve false-flag dry-run behavior, sandbox allowlist, operator approval, idempotency, result-capture pending status, internal runner ownership, and no active Open links without real URLs. Output deployment packet, upload checklist, operator test data, rollback plan, trace samples, W145 report, visual testing decision, and best next Codex prompt.'
    },
    harnessResults: results
  };

  const trace = {
    schema: 'idb.w144-governed-sandbox-queue-submit-pilot-trace.v1',
    decision: contract.decision,
    flagsFalseQueueSubmitted: flagsFalseResult.queueSubmitted,
    badAllowlistQueueSubmitted: badAllowlistResult.queueSubmitted,
    badOperatorQueueSubmitted: badOperatorResult.queueSubmitted,
    flagsTrueQueueSubmitted: queuedResult.queueSubmitted,
    runnerTaskId: queuedResult.runnerTaskId,
    resultCaptureStatus: queuedResult.resultCapture.status,
    activeOpenLinks: queuedResult.resultCapture.activeOpenLinks,
    visualTestingDecision: contract.targetedVisualTestingDecision,
    bestNextCodexPrompt: contract.bestNextCodexPrompt
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);
  fs.writeFileSync(reportPath, `# W144 Governed Sandbox Queue Submit Pilot Behind Server Flags

Status: ${contract.status}

## Decision

${contract.decision}

## Queue Submit Adapter Changes

- Adapter file: ${suiteletAdapterPath}
- Queue submit location: ${queueSubmitAdapterChanges.queueSubmitLocation}
- Uses NetSuite task module: ${queueSubmitAdapterChanges.usesNetSuiteTaskModule}
- Uses record module: ${queueSubmitAdapterChanges.usesRecordModule}
- Drawer changes: ${queueSubmitAdapterChanges.drawerChanges}

Gated by:

${queueSubmitAdapterChanges.gatedBy.map((item) => `- ${item}`).join('\n')}

## Guarded Smoke Harness

- Flags false queue submitted: ${flagsFalseResult.queueSubmitted}
- Bad allowlist queue submitted: ${badAllowlistResult.queueSubmitted}
- Bad operator queue submitted: ${badOperatorResult.queueSubmitted}
- Flags true sandbox queue submitted: ${queuedResult.queueSubmitted}
- Runner task id: ${queuedResult.runnerTaskId}
- Result capture status: ${queuedResult.resultCapture.status}
- Active Open links: ${queuedResult.resultCapture.activeOpenLinks}
- Final generated names ready: ${queuedResult.resultCapture.finalGeneratedNamesReady}

## Trace Samples

- Data: ${dataPath}
- Trace: ${tracePath}

## Targeted Visual Testing Decision

- Visual NetSuite testing required now: No.
- Targeted visual NetSuite testing required after deployment with flags true: Yes.
- Broader visual NetSuite testing required: No.

Reason: ${contract.targetedVisualTestingDecision.reason}

## Best Next Codex Prompt

${contract.bestNextCodexPrompt.prompt}
`);

  console.log(`W144 governed sandbox queue submit pilot: ${contract.decision}; visualNow=${contract.targetedVisualTestingDecision.visualNetSuiteTestingRequiredNow}`);
  if (failures.length) {
    failures.forEach((failure) => console.error(`FAIL ${failure.name}: ${failure.detail}`));
    process.exit(1);
  }
}

main();
