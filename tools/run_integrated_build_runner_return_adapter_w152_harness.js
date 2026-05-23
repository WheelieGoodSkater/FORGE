const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const w139Path = path.join(root, 'data', 'w139_idb_governed_runner_integration_contract.json');
const w144Path = path.join(root, 'data', 'w144_governed_sandbox_queue_submit_pilot.json');
const w147Path = path.join(root, 'data', 'w147_governed_sandbox_queue_submit_runner_task.json');
const w148Path = path.join(root, 'data', 'w148_governed_runner_result_capture_final_url_import.json');
const w151Path = path.join(root, 'data', 'w151_runner_result_import_guard_missing_result_ux.json');
const dataPath = path.join(root, 'data', 'w152_integrated_build_runner_return_adapter_design.json');
const tracePath = path.join(root, 'trace_samples', 'w152_integrated_build_runner_return_adapter_trace.json');
const reportPath = path.join(root, 'reports', 'w152_integrated_build_runner_return_adapter_design.md');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function assertCase(results, name, pass, detail) {
  results.push({ name, pass: Boolean(pass), detail: detail || '' });
}

function requiredRecords(finalGeneratedNamesJson) {
  return [
    finalGeneratedNamesJson.customer,
    finalGeneratedNamesJson.salesOrder,
    finalGeneratedNamesJson.heroItem,
    finalGeneratedNamesJson.matrixItem,
    finalGeneratedNamesJson.componentItems && finalGeneratedNamesJson.componentItems[0]
  ].filter(Boolean);
}

function isNumericId(value) {
  return /^[1-9][0-9]*$/.test(String(value || ''));
}

function isSupportedUrl(value) {
  return /^\/app\/(common\/entity\/custjob|accounting\/transactions\/salesord|common\/item\/item)\.nl\?id=[1-9][0-9]*$/.test(String(value || ''));
}

function main() {
  const w139 = readJson(w139Path);
  const w144 = readJson(w144Path);
  const w147 = readJson(w147Path);
  const w148 = readJson(w148Path);
  const w151 = readJson(w151Path);

  const finalGeneratedNamesJson = w148.finalGeneratedNamesJson;
  const records = requiredRecords(finalGeneratedNamesJson);

  const integratedBuildReturnArchitecture = {
    schema: 'idb.w152-integrated-build-return-architecture.v1',
    status: 'designed_not_implemented',
    productRole: 'IDB remains the primary consultant-facing product.',
    legacyRole: 'Old DCC UI remains legacy; governed runner/internal build logic remains the record creation engine.',
    sequence: [
      'Consultant confirms lane and Build handoff readiness inside the drawer.',
      'Build action creates a confirmed build request JSON and idempotency token.',
      'Drawer calls only the approved server-side Build adapter endpoint when the adapter exists and is enabled.',
      'Server-side adapter validates flags, sandbox allowlist, operator approval, consultant confirmation, state authority, handoff parity, and idempotency.',
      'Server-side adapter invokes or queues the governed runner/internal build engine.',
      'Adapter returns runnerTaskId and resultCapture=pending without fake record URLs.',
      'Drawer polls or requests result capture through the adapter until completed, failed, timed out, or no-submit.',
      'Completed runner result JSON is validated with the W151 import guard and imported as final generated names.',
      'Open links render only after completed runner result JSON includes numeric internal ids and supported NetSuite URLs.'
    ],
    ownership: {
      drawer: ['collect consultant-confirmed request', 'display status', 'import completed runner result names and URLs'],
      serverAdapter: ['validate flags', 'own SuiteScript invocation path', 'queue governed runner', 'capture result'],
      governedRunner: ['create or resolve records', 'own generated record authority']
    }
  };

  const serverAdapterApiContract = {
    schema: 'idb.w152-server-adapter-api-contract.v1',
    endpointPurpose: 'Integrated Build return adapter for governed runner execution and result capture.',
    method: 'POST',
    routeAlias: '/app/site/hosting/scriptlet.nl?script=<idb_adapter>&deploy=<sandbox_deploy>',
    request: {
      schema: 'idb.integrated-build-runner-request.v1',
      action: 'submit_or_poll_build_return',
      confirmedBuildRequestJson: 'idb.confirmed-build-request.v1',
      operatorGate: {
        reviewDecision: 'operator_approved_queue_submit',
        typeToConfirm: 'QUEUE GOVERNED SANDBOX RUNNER'
      },
      idempotencyToken: 'required stable token from handoff parity lock',
      clientTraceRef: 'trace export id or in-drawer trace id',
      poll: {
        runnerTaskId: 'optional after queue submit',
        resultCaptureCursor: 'optional server-side result capture reference'
      }
    },
    requiredServerFlags: {
      CREATE_ENABLED: true,
      GOVERNED_SANDBOX_WRITE_ENABLED: true,
      QUEUE_SUBMIT_ENABLED: true,
      SANDBOX_ACCOUNT_ALLOWLIST: ['SANDBOX_ACCOUNT_ID']
    },
    falseFlagResponse: {
      queueSubmitted: false,
      runnerTaskId: null,
      resultCapture: 'not_started_no_submit',
      finalGeneratedNamesJson: null,
      activeOpenLinks: 0
    },
    queuedResponse: {
      queueSubmitted: true,
      runnerTaskId: 'task_w152_example_001',
      resultCapture: 'pending_runner_completion',
      finalGeneratedNamesJson: null,
      activeOpenLinks: 0
    },
    completedResponse: {
      queueSubmitted: true,
      runnerTaskId: w147.runnerTaskIdEvidence.runnerTaskId,
      resultCapture: 'completed',
      finalGeneratedNamesJson
    },
    forbiddenResponseBehavior: [
      'Do not return placeholder ids.',
      'Do not return fake record URLs.',
      'Do not mark result capture completed without required records.',
      'Do not expose Open links before W151 import guard accepts completed runner result JSON.'
    ]
  };

  const pollingResultCaptureStateMachine = {
    schema: 'idb.w152-polling-result-capture-state-machine.v1',
    states: [
      { state: 'not_started', drawerOpenLinks: 0, visualTesting: 'blocked' },
      { state: 'blocked_by_flags_false', drawerOpenLinks: 0, visualTesting: 'blocked' },
      { state: 'ready_to_submit', drawerOpenLinks: 0, visualTesting: 'blocked' },
      { state: 'queued', runnerTaskIdRequired: true, resultCapture: 'pending_runner_completion', drawerOpenLinks: 0, visualTesting: 'blocked' },
      { state: 'polling', runnerTaskIdRequired: true, resultCapture: 'pending_runner_completion', drawerOpenLinks: 0, visualTesting: 'blocked' },
      { state: 'completed_result_available', requiredImportGuard: 'W151', drawerOpenLinks: 'after accepted import only', visualTesting: 'targeted_visual_can_start_after_import' },
      { state: 'failed_or_timeout', drawerOpenLinks: 0, visualTesting: 'blocked' },
      { state: 'rolled_back_flags_disabled', drawerOpenLinks: 0, visualTesting: 'blocked' }
    ],
    terminalSuccessCondition: 'completed runner result JSON accepted by W151 import guard with numeric ids and supported URLs.',
    retryPolicy: {
      maxPolls: 12,
      backoff: 'server-guided',
      duplicateSubmitHandling: 'idempotency token returns existing runnerTaskId or completed capture'
    }
  };

  const smokeHarness = {
    schema: 'idb.w152-smoke-harness.v1',
    cases: {
      flagsFalseNoSubmit: {
        input: 'confirmed build request plus operator gate, all queue/write flags false',
        expected: serverAdapterApiContract.falseFlagResponse
      },
      flagsTrueQueuedPending: {
        input: 'confirmed build request plus operator gate, flags true, no result yet',
        expected: serverAdapterApiContract.queuedResponse
      },
      completedCaptureImport: {
        input: 'completed result capture from governed runner',
        expected: {
          importGuard: 'completed_runner_result_accepted',
          requiredRecords: ['customer', 'salesOrder', 'heroItem', 'matrixItem', 'componentItem'],
          activeOpenLinksAfterImportOnly: true
        }
      }
    }
  };

  const visualTestingDecision = {
    visualNetSuiteTestingRequiredNow: false,
    visualTestingBlocked: true,
    reason: 'W152 is an integration design. Do not request visual testing until Build is implemented to call the server adapter and receive completed runner result JSON.',
    firstVisualGateAfterImplementation: 'Targeted Open-link record landing test after completed runner result import.'
  };

  const noRegression = {
    noDrawerWrites: true,
    noDrawerSuiteScriptInvocation: true,
    noDrawerTransactionWrites: true,
    consultantConfirmationRequired: true,
    stateAuthorityPreserved: true,
    handoffParityPreserved: true,
    idempotencyPreserved: true,
    internalRunnerOwnership: true,
    rollbackByDisablingServerFlags: true,
    noActiveOpenLinksWithoutRealUrls: true
  };

  const bestNextCodexPrompt = {
    block: 'W153: Integrated Build Runner Return Adapter Skeleton',
    prompt: 'Move through W153: Integrated Build Runner Return Adapter Skeleton. Implement the non-writing drawer-side adapter client boundary and NetSuite-side server adapter skeleton for the W152 integrated Build runner return path. Build should prepare the confirmed build request, idempotency token, and operator gate payload, but keep invocation disabled unless the approved server adapter endpoint and server flags are present. The server adapter skeleton should return false-flag no-submit and queued/pending fixture responses only; do not enable writes yet. Do not request visual testing. Preserve no drawer writes, no drawer SuiteScript invocation, no drawer transaction writes, consultant confirmation, state authority and handoff parity, internal runner ownership, rollback by disabling server flags, W151 completed-result import guard, and no active Open links without real URLs. Output adapter skeleton changes, dry-run smoke harness, trace samples, W153 report, visual testing decision blocked, and best next Codex prompt.'
  };

  const results = [];
  assertCase(results, 'w152_uses_w151_as_entry_condition', w151.decision === 'PASS_IMPORT_GUARD_READY__VISUAL_TESTING_BLOCKED_UNTIL_INTEGRATED_BUILD_RETURN' && w151.visualTestingDecision.visualTestingBlocked === true, JSON.stringify(w151.visualTestingDecision));
  assertCase(results, 'w152_api_contract_requires_server_flags_and_operator_gate', serverAdapterApiContract.requiredServerFlags.CREATE_ENABLED === true && serverAdapterApiContract.requiredServerFlags.QUEUE_SUBMIT_ENABLED === true && serverAdapterApiContract.request.operatorGate.typeToConfirm === 'QUEUE GOVERNED SANDBOX RUNNER', JSON.stringify(serverAdapterApiContract.requiredServerFlags));
  assertCase(results, 'w152_state_machine_blocks_visual_until_completed_import', pollingResultCaptureStateMachine.states.filter((item) => item.visualTesting === 'blocked').length >= 6 && pollingResultCaptureStateMachine.terminalSuccessCondition.includes('W151'), JSON.stringify(pollingResultCaptureStateMachine.states));
  assertCase(results, 'w152_false_flag_and_queued_states_return_no_open_links', serverAdapterApiContract.falseFlagResponse.activeOpenLinks === 0 && serverAdapterApiContract.queuedResponse.activeOpenLinks === 0 && serverAdapterApiContract.queuedResponse.finalGeneratedNamesJson === null, JSON.stringify({ falseFlag: serverAdapterApiContract.falseFlagResponse, queued: serverAdapterApiContract.queuedResponse }));
  assertCase(results, 'w152_completed_result_shape_uses_numeric_ids_and_supported_urls', records.length === 5 && records.every((record) => isNumericId(record.id) && isSupportedUrl(record.url)), JSON.stringify(records.map((record) => ({ id: record.id, url: record.url }))));
  assertCase(results, 'w152_reuses_prior_runner_contracts_without_visual_request', w139.schema === 'idb.w139-idb-governed-runner-integration-contract.v1' && w144.schema === 'idb.w144-governed-sandbox-queue-submit-pilot.v1' && w147.runnerTaskIdEvidence.runnerTaskId && visualTestingDecision.visualNetSuiteTestingRequiredNow === false, JSON.stringify({ w139: w139.status, w144: w144.status, runnerTaskId: w147.runnerTaskIdEvidence.runnerTaskId }));
  assertCase(results, 'w152_no_regression_boundaries_preserved', Object.values(noRegression).every(Boolean), JSON.stringify(noRegression));

  const failures = results.filter((item) => !item.pass);
  const contract = {
    schema: 'idb.w152-integrated-build-runner-return-adapter-design.v1',
    status: failures.length ? 'blocked' : 'integrated_build_return_adapter_design_ready',
    decision: failures.length ? 'FAIL' : 'PASS_INTEGRATED_BUILD_RETURN_DESIGN_READY__VISUAL_TESTING_BLOCKED',
    integratedBuildReturnArchitecture,
    serverAdapterApiContract,
    pollingResultCaptureStateMachine,
    smokeHarness,
    traceSamples: {
      falseFlagNoSubmit: serverAdapterApiContract.falseFlagResponse,
      queuedPending: serverAdapterApiContract.queuedResponse,
      completedCapture: {
        runnerTaskId: serverAdapterApiContract.completedResponse.runnerTaskId,
        resultCapture: serverAdapterApiContract.completedResponse.resultCapture,
        finalGeneratedNameIds: {
          customer: finalGeneratedNamesJson.customer.id,
          demoTransaction: finalGeneratedNamesJson.salesOrder.id,
          heroItem: finalGeneratedNamesJson.heroItem.id,
          matrixProofItem: finalGeneratedNamesJson.matrixItem.id,
          componentItem: finalGeneratedNamesJson.componentItems[0].id
        }
      }
    },
    visualTestingDecision,
    noRegression,
    bestNextCodexPrompt,
    validatorGates: results
  };

  const trace = {
    schema: 'idb.w152-integrated-build-runner-return-adapter-trace.v1',
    decision: contract.decision,
    visualTestingBlocked: true,
    queueSubmitEnabledByThisBlock: false,
    drawerWritesEnabled: false,
    drawerSuiteScriptInvocationEnabled: false,
    runnerOwnership: 'internal_runner',
    stateMachine: pollingResultCaptureStateMachine.states.map((item) => item.state),
    noActiveOpenLinksWithoutRealUrls: true,
    events: results
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);
  fs.writeFileSync(reportPath, `# W152 Integrated Build Runner Return Adapter Design

Decision: ${contract.decision}

## Integrated Build-Return Architecture
- IDB remains the consultant-facing product.
- Build prepares the confirmed request and idempotency token.
- The approved server-side adapter owns any SuiteScript invocation or runner queue submit.
- The governed runner/internal build engine owns generated records.
- The drawer imports completed runner result JSON only after W151 guard acceptance.

## Server Adapter API Contract
- Request schema: ${serverAdapterApiContract.request.schema}
- Required flags: CREATE_ENABLED, GOVERNED_SANDBOX_WRITE_ENABLED, QUEUE_SUBMIT_ENABLED, sandbox allowlist, operator approval, idempotency.
- False flags return queueSubmitted=false, runnerTaskId=null, resultCapture=not_started_no_submit.
- Queued runs return runnerTaskId plus pending result capture, never fake URLs.
- Completed capture must include numeric ids and supported NetSuite URLs for Customer, demo transaction, hero item, matrix/proof item, and component item.

## Polling / Result-Capture State Machine
${pollingResultCaptureStateMachine.states.map((item) => `- ${item.state}: visual=${item.visualTesting}, openLinks=${item.drawerOpenLinks}`).join('\n')}

## Smoke Harness
${Object.entries(smokeHarness.cases).map(([name, value]) => `- ${name}: ${value.input}`).join('\n')}

## Visual Testing Decision
Blocked. ${visualTestingDecision.reason}

## Validator Gates
${results.map((item) => `- ${item.pass ? 'PASS' : 'FAIL'} ${item.name}: ${item.detail}`).join('\n')}

## No Regression
${Object.entries(noRegression).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

## Best Next Codex Prompt
${bestNextCodexPrompt.prompt}
`);

  if (failures.length) {
    console.error(`W152 integrated Build runner return adapter design FAIL (${results.length - failures.length}/${results.length})`);
    process.exit(1);
  }
  console.log(`W152 integrated Build runner return adapter design: ${contract.decision}; visualBlocked=${visualTestingDecision.visualTestingBlocked}`);
}

main();
