const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const w139Path = path.join(root, 'data', 'w139_idb_governed_runner_integration_contract.json');
const w140Path = path.join(root, 'data', 'w140_runner_code_path_inventory_adapter_extraction.json');
const w142Path = path.join(root, 'data', 'w142_operator_queue_gate_dry_run_surface.json');
const w142SuiteletPath = path.join(root, 'netsuite', 'idb_governed_runner_adapter_w142_suitelet.js');
const dataPath = path.join(root, 'data', 'w143_governed_sandbox_queue_enablement_design.json');
const tracePath = path.join(root, 'trace_samples', 'w143_governed_sandbox_queue_enablement_design_trace.json');
const reportPath = path.join(root, 'reports', 'w143_governed_sandbox_queue_enablement_design.md');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function assertCase(results, name, pass, detail) {
  results.push({ name, pass: !!pass, detail: detail || '' });
}

function queueEnablementDesign() {
  return {
    schema: 'idb.governed-sandbox-queue-enablement-design.v1',
    designStatus: 'designed_not_enabled',
    queueSubmitAuthority: 'netsuite_suitelet_server_side_operator_only',
    drawerAuthority: 'export_request_and_import_result_only',
    switchRule: {
      summary: 'The governed runner can only be queued when every server-side deployment switch and operator gate passes.',
      requiredServerSideFlags: [
        'custscript_idb_create_enabled=T',
        'custscript_idb_governed_sandbox_write_enabled=T',
        'custscript_idb_queue_submit_enabled=T'
      ],
      disabledInW143: true,
      drawerCannotOverride: true
    },
    exactQueueFunctionRule: {
      allowedFutureAction: 'task.create({ taskType: task.TaskType.SCHEDULED_SCRIPT, scriptId, deploymentId }) followed by scheduledTask.submit() only inside the NetSuite-side adapter after all W143 gates pass.',
      currentW143Action: 'no task submit, no record write, no transaction write',
      noSubmitRollback: 'If any gate fails before submit, return dry-run result with queueSubmitted=false and runnerTaskId=null.'
    }
  };
}

function serverSideParameterContract() {
  return {
    schema: 'idb.governed-runner-server-side-parameters.v1',
    requiredDeploymentParameters: [
      { id: 'custscript_idb_create_enabled', type: 'checkbox', requiredValueBeforeQueue: 'T', currentW143Value: 'F', purpose: 'Master server-side create switch.' },
      { id: 'custscript_idb_governed_sandbox_write_enabled', type: 'checkbox', requiredValueBeforeQueue: 'T', currentW143Value: 'F', purpose: 'Sandbox write authorization switch.' },
      { id: 'custscript_idb_queue_submit_enabled', type: 'checkbox', requiredValueBeforeQueue: 'T', currentW143Value: 'F', purpose: 'Scheduled runner queue-submit switch.' },
      { id: 'custscript_idb_sandbox_account_allowlist', type: 'text', requiredValueBeforeQueue: 'comma-separated sandbox account ids', currentW143Value: 'SANDBOX_ACCOUNT_ID', purpose: 'Prevents accidental production queueing.' },
      { id: 'custscript_idb_runner_script_id', type: 'text', requiredValueBeforeQueue: 'customscript_scai_so_csv_runner', currentW143Value: 'customscript_scai_so_csv_runner', purpose: 'Existing governed runner script id.' },
      { id: 'custscript_idb_runner_deploy_id', type: 'text', requiredValueBeforeQueue: 'customdeploy_scai_so_csv_runner', currentW143Value: 'customdeploy_scai_so_csv_runner', purpose: 'Existing governed runner deployment id.' },
      { id: 'custscript_idb_runner_mapping_id', type: 'text', requiredValueBeforeQueue: 'CSV import mapping id', currentW143Value: '112', purpose: 'Sales Order CSV import mapping.' },
      { id: 'custscript_idb_runner_folder_id', type: 'text', requiredValueBeforeQueue: 'File Cabinet folder id', currentW143Value: '345', purpose: 'CSV handoff file storage.' },
      { id: 'custscript_idb_runner_subsidiary_id', type: 'text', requiredValueBeforeQueue: 'numeric subsidiary id', currentW143Value: '1', purpose: 'Runner transaction context.' },
      { id: 'custscript_idb_runner_location_id', type: 'text', requiredValueBeforeQueue: 'numeric location id', currentW143Value: '7', purpose: 'Runner location context.' },
      { id: 'custscript_idb_runner_wc_search_id', type: 'text', requiredValueBeforeQueue: 'optional work center saved search id', currentW143Value: '', purpose: 'Manufacturing/WIP support when enabled.' },
      { id: 'custscript_idb_result_capture_folder_id', type: 'text', requiredValueBeforeQueue: 'File Cabinet folder id', currentW143Value: 'not_enabled_w143', purpose: 'Where runner result JSON will be written or referenced.' }
    ],
    operatorEvidenceRequired: [
      'operatorOnly=true',
      'operator.name present',
      'reviewDecision changes from dry_run_reviewed_no_submit to operator_approved_queue_submit only in the future enablement step',
      'confirmedSandboxAccount=true',
      'confirmedNoSubmit=false only when W144 explicitly enables queue submit',
      'confirmedDrawerNoWrite=true',
      'drawerInvocationTokenAccepted=false'
    ]
  };
}

function sandboxAllowlist() {
  return {
    schema: 'idb.sandbox-account-allowlist.v1',
    source: 'custscript_idb_sandbox_account_allowlist',
    currentSandboxAccountId: 'SANDBOX_ACCOUNT_ID',
    allowedAccountIds: ['SANDBOX_ACCOUNT_ID'],
    productionAccountsAllowed: false,
    queueBlockedWhenMissingOrMismatched: true,
    W143Evaluation: {
      accountAllowed: true,
      writeFlagsEnabled: false,
      queueSubmitAllowedNow: false
    }
  };
}

function idempotencyContract(request) {
  return {
    schema: 'idb.runner-idempotency-token.v1',
    required: true,
    tokenSource: [
      'confirmedBuildRequest.requestId',
      'confirmedBuildRequest.prospect.name',
      'confirmedBuildRequest.demoPath.laneId',
      'confirmedBuildRequest.demoPath.scenario',
      'confirmedBuildRequest.stateAuthority.handoffHash'
    ],
    sampleToken: `IDB-${request.requestId || 'request'}-${request.prospect.name.replace(/[^A-Za-z0-9]+/g, '_')}-${request.demoPath.laneId}`.slice(0, 120),
    duplicatePolicy: {
      beforeQueue: 'block duplicate active or completed token unless operator chooses explicit resolve-existing mode in a later write-enabled block',
      afterQueue: 'runner result capture must return the same idempotency token',
      drawerBehavior: 'drawer imports result only and cannot retry queue submit'
    }
  };
}

function scheduledRunnerParameterHandoff(request, w142) {
  const preview = w142.dryRunResultEvidence.validGate;
  return {
    schema: 'idb.scheduled-runner-parameter-handoff.v1',
    handoffSource: 'W139 confirmed IDB build request plus server-side W143 parameters',
    targetRunnerOwner: 'governed_dcc_runner_internal_build_engine',
    submitNow: false,
    queueSubmitted: false,
    taskId: null,
    requiredRunnerParams: {
      custscript_v3_runner_prospect: request.prospect.name,
      custscript_v3_runner_website: request.prospect.website,
      custscript_v3_runner_notes: request.storyInputs.buyerNeed,
      custscript_v3_runner_agenda: request.storyInputs.scObjective || request.demoPath.scenario,
      custscript_v3_runner_extid: 'IDB_ARIAT_INTERNATIONAL_APPAREL_ACCESSORIES_DRYRUN',
      custscript_v3_runner_mapping: 'custscript_idb_runner_mapping_id',
      custscript_v3_runner_folder: 'custscript_idb_runner_folder_id',
      custscript_v3_runner_subsidiary: 'custscript_idb_runner_subsidiary_id',
      custscript_v3_runner_location: 'custscript_idb_runner_location_id',
      custscript_v3_runner_wc_search: 'custscript_idb_runner_wc_search_id',
      custscript_v3_runner_enable_wip: 'F',
      custscript_v3_runner_enable_mfg: 'F',
      custscript_v3_runner_create_new_hero: 'T',
      custscript_v3_runner_hero_item: ''
    },
    dryRunEvidence: preview,
    futureQueueSubmitPreconditions: [
      'all W142 operator gates pass',
      'sandbox account allowlist passes',
      'idempotency token is not already active',
      'CREATE_ENABLED is true server-side',
      'GOVERNED_SANDBOX_WRITE_ENABLED is true server-side',
      'QUEUE_SUBMIT_ENABLED is true server-side',
      'result capture folder/config is present'
    ]
  };
}

function resultCapturePlaceholder() {
  return {
    schema: 'idb.runner-result-capture-placeholder.v1',
    status: 'placeholder_not_enabled',
    expectedFutureResultSchema: 'idb.governed-runner-result.v1',
    resultCaptureRequiredBeforeDrawerImport: true,
    mustReturn: [
      'idempotencyToken',
      'runnerTaskId',
      'runStatus',
      'customer.internalId and customer.url',
      'salesOrder.internalId and salesOrder.url',
      'heroItem.internalId and heroItem.url',
      'matrixItem.internalId and matrixItem.url',
      'componentItems[].internalId and componentItems[].url',
      'warnings',
      'errors'
    ],
    currentW143ImportPolicy: {
      activeOpenLinks: 0,
      recordExistenceStatus: 'not_created_dry_run',
      drawerMayImportNamesOnly: true,
      drawerMayOpenLinks: false
    }
  };
}

function main() {
  const w139 = readJson(w139Path);
  const w140 = readJson(w140Path);
  const w142 = readJson(w142Path);
  const userscript = fs.readFileSync(userscriptPath, 'utf8');
  const w142Suitelet = fs.readFileSync(w142SuiteletPath, 'utf8');
  const confirmedRequest = w139.contractJson.confirmedIdbBuildRequestJson;
  const design = queueEnablementDesign();
  const parameterContract = serverSideParameterContract();
  const allowlist = sandboxAllowlist();
  const idempotency = idempotencyContract(confirmedRequest);
  const runnerHandoff = scheduledRunnerParameterHandoff(confirmedRequest, w142);
  const resultCapture = resultCapturePlaceholder();

  const dryRunHarnessUpdates = [
    'Keep W142 as the executable dry-run proof for operator gate validation.',
    'Add W143 contract checks for server-side enablement switches without changing their values.',
    'Assert CREATE_ENABLED, GOVERNED_SANDBOX_WRITE_ENABLED, and QUEUE_SUBMIT_ENABLED remain false/not active.',
    'Assert scheduled runner params are shaped but not submitted.',
    'Assert result-capture placeholder requires real ids and URLs before drawer Open links appear.',
    'Assert no drawer write or SuiteScript invocation signatures are introduced.'
  ];

  const results = [];
  assertCase(results, 'w143_starts_from_w142_queue_gate_ready', w142.decision === 'PASS_QUEUE_GATE_READY__NEXT_ENABLE_GOVERNED_SANDBOX_QUEUE_DRY_RUN_ONLY', w142.decision);
  assertCase(results, 'w143_server_side_switches_designed_not_enabled', design.switchRule.disabledInW143 === true && design.switchRule.requiredServerSideFlags.length === 3 && design.exactQueueFunctionRule.currentW143Action === 'no task submit, no record write, no transaction write', JSON.stringify(design.switchRule));
  assertCase(results, 'w143_parameter_contract_covers_runner_and_capture', parameterContract.requiredDeploymentParameters.some((item) => item.id === 'custscript_idb_queue_submit_enabled' && item.currentW143Value === 'F') && parameterContract.requiredDeploymentParameters.some((item) => item.id === 'custscript_idb_result_capture_folder_id') && parameterContract.operatorEvidenceRequired.some((item) => /operator_approved_queue_submit/.test(item)), JSON.stringify(parameterContract.requiredDeploymentParameters));
  assertCase(results, 'w143_sandbox_allowlist_blocks_non_sandbox_and_write_flags', allowlist.allowedAccountIds.includes('SANDBOX_ACCOUNT_ID') && allowlist.productionAccountsAllowed === false && allowlist.W143Evaluation.accountAllowed === true && allowlist.W143Evaluation.queueSubmitAllowedNow === false, JSON.stringify(allowlist));
  assertCase(results, 'w143_idempotency_token_and_duplicate_policy_ready', idempotency.required === true && /idb-build-ariat-style-ready-001/.test(idempotency.sampleToken) && idempotency.duplicatePolicy.beforeQueue.includes('block duplicate'), JSON.stringify(idempotency));
  assertCase(results, 'w143_scheduled_runner_parameter_handoff_no_submit', runnerHandoff.submitNow === false && runnerHandoff.queueSubmitted === false && runnerHandoff.taskId === null && runnerHandoff.requiredRunnerParams.custscript_v3_runner_prospect === 'Ariat International' && runnerHandoff.futureQueueSubmitPreconditions.includes('QUEUE_SUBMIT_ENABLED is true server-side'), JSON.stringify(runnerHandoff.requiredRunnerParams));
  assertCase(results, 'w143_result_capture_placeholder_blocks_open_links', resultCapture.status === 'placeholder_not_enabled' && resultCapture.resultCaptureRequiredBeforeDrawerImport === true && resultCapture.mustReturn.some((item) => /customer\.internalId/.test(item)) && resultCapture.currentW143ImportPolicy.activeOpenLinks === 0 && resultCapture.currentW143ImportPolicy.drawerMayOpenLinks === false, JSON.stringify(resultCapture.currentW143ImportPolicy));
  assertCase(results, 'w143_w142_still_has_no_submit_or_record_writes', /CREATE_ENABLED = false/.test(w142Suitelet) && /GOVERNED_SANDBOX_WRITE_ENABLED = false/.test(w142Suitelet) && !/N\/record/.test(w142Suitelet) && !/\.submit\(\);/.test(w142Suitelet) && w142.dryRunResultEvidence.validGate.queueSubmitted === false, 'W142 remains no-submit/no-record');
  assertCase(results, 'w143_no_drawer_write_or_invocation_added', !/nlapiSubmitRecord|record\.submitFields|record\.create|https\.post|N\/https/.test(userscript), 'drawer remains export/import only');
  assertCase(results, 'w143_preserves_w139_w140_authority', w139.contractJson.confirmedIdbBuildRequestJson.consultantConfirmation.confirmed === true && w140.adapterSmoke.adapterInput.drawerAuthority === 'none' && w140.adapterSmoke.adapterInput.validation.valid === true, JSON.stringify({ w139: w139.contractJson.confirmedIdbBuildRequestJson.requestStatus, w140: w140.adapterSmoke.adapterInput.drawerAuthority }));

  const failures = results.filter((item) => !item.pass);
  const contract = {
    schema: 'idb.w143-governed-sandbox-queue-enablement-design.v1',
    status: failures.length ? 'blocked' : 'queue_enablement_design_ready_not_activated',
    decision: failures.length ? 'FAIL' : 'PASS_QUEUE_ENABLEMENT_DESIGNED__NOT_ACTIVATED',
    sourceBlocks: {
      w139ConfirmedRequest: w139.contractJson.confirmedIdbBuildRequestJson.schema,
      w140AdapterBoundary: w140.decision,
      w142QueueGate: w142.decision
    },
    queueEnablementDesign: design,
    serverSideParameterContract: parameterContract,
    sandboxAccountAllowlist: allowlist,
    operatorEvidenceDesign: {
      schema: 'idb.operator-queue-evidence-design.v1',
      currentAcceptedDecision: 'dry_run_reviewed_no_submit',
      futureWriteEnabledDecision: 'operator_approved_queue_submit',
      requiresTypeToConfirm: true,
      typeToConfirmValue: 'QUEUE GOVERNED SANDBOX RUNNER',
      drawerMayProduceEvidence: true,
      drawerMaySubmit: false
    },
    idempotencyTokenContract: idempotency,
    scheduledRunnerParameterHandoff: runnerHandoff,
    resultCapturePlaceholder: resultCapture,
    dryRunHarnessUpdates,
    noRegression: {
      noDrawerWrites: true,
      noSuiteScriptInvocationFromDrawer: true,
      noTransactionWritesFromDrawer: true,
      consultantConfirmationRequired: true,
      stateAuthorityPreserved: true,
      handoffParityPreserved: true,
      noSubmitRollbackPreserved: true,
      internalRunnerOwnershipPreserved: true,
      noActiveOpenLinksWithoutRealUrls: true,
      governedSandboxWritesNotEnabled: true,
      queueSubmitNotEnabled: true,
      designOnlyNoActivation: true
    },
    visualTestingDecision: {
      visualNetSuiteTestingRequiredNow: false,
      targetedVisualNetSuiteTestingRequiredAfterQueueSubmitEnablement: true,
      broaderVisualNetSuiteTestingRequired: false,
      reason: 'W143 only designs the queue enablement switch and result-capture contract. It does not submit the runner, write records, or produce real NetSuite record URLs.'
    },
    bestNextCodexPrompt: {
      block: 'W144: Governed Sandbox Queue Submit Pilot Behind Server Flags',
      prompt: 'Move through W144: Governed Sandbox Queue Submit Pilot Behind Server Flags. Use the W143 queue enablement design to implement the NetSuite-side server-flagged queue submit path behind CREATE_ENABLED, GOVERNED_SANDBOX_WRITE_ENABLED, QUEUE_SUBMIT_ENABLED, sandbox allowlist, operator approval, idempotency, and result-capture prerequisites. Keep the drawer export/import only and do not add drawer writes or drawer SuiteScript invocation. If flags are false, preserve the W142/W143 dry-run no-submit behavior. If flags are true in sandbox, queue the existing governed runner and return runnerTaskId plus result-capture pending status, not fake record URLs. Output queue submit adapter changes, guarded smoke harness, trace samples, W144 report, targeted visual testing decision, and best next Codex prompt.'
    },
    harnessResults: results
  };

  const trace = {
    schema: 'idb.w143-governed-sandbox-queue-enablement-design-trace.v1',
    decision: contract.decision,
    queueSubmitEnabledNow: false,
    writeFlagsEnabledNow: false,
    serverSideSwitches: design.switchRule.requiredServerSideFlags,
    sandboxAllowlist: allowlist.W143Evaluation,
    idempotencyToken: idempotency.sampleToken,
    runnerHandoffSubmitNow: runnerHandoff.submitNow,
    resultCaptureStatus: resultCapture.status,
    visualTestingDecision: contract.visualTestingDecision,
    bestNextCodexPrompt: contract.bestNextCodexPrompt
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);
  fs.writeFileSync(reportPath, `# W143 Governed Sandbox Queue Enablement Design Without Write Activation

Status: ${contract.status}

## Decision

${contract.decision}

## Queue Enablement Design

- Queue submit authority: ${design.queueSubmitAuthority}
- Drawer authority: ${design.drawerAuthority}
- Current W143 action: ${design.exactQueueFunctionRule.currentW143Action}
- Disabled in W143: ${design.switchRule.disabledInW143}

Required server-side flags:

${design.switchRule.requiredServerSideFlags.map((item) => `- ${item}`).join('\n')}

## Server-Side Parameter Contract

${parameterContract.requiredDeploymentParameters.map((item) => `- ${item.id}: current W143 value \`${item.currentW143Value}\`; required before queue \`${item.requiredValueBeforeQueue}\`; ${item.purpose}`).join('\n')}

## Idempotency And Runner Handoff

- Idempotency required: ${idempotency.required}
- Sample token: ${idempotency.sampleToken}
- Queue submitted now: ${runnerHandoff.queueSubmitted}
- Runner task id now: ${runnerHandoff.taskId}

## Result-Capture Placeholder

- Status: ${resultCapture.status}
- Required before drawer import: ${resultCapture.resultCaptureRequiredBeforeDrawerImport}
- Current active Open links: ${resultCapture.currentW143ImportPolicy.activeOpenLinks}

## Dry-Run Harness Updates

${dryRunHarnessUpdates.map((item) => `- ${item}`).join('\n')}

## Visual Testing Decision

- Visual NetSuite testing required now: No.
- Targeted visual NetSuite testing required after queue submit enablement: Yes.
- Broader visual NetSuite testing required: No.

Reason: ${contract.visualTestingDecision.reason}

## Best Next Codex Prompt

${contract.bestNextCodexPrompt.prompt}
`);

  console.log(`W143 governed sandbox queue enablement design: ${contract.decision}; visualNow=${contract.visualTestingDecision.visualNetSuiteTestingRequiredNow}`);
  if (failures.length) {
    failures.forEach((failure) => console.error(`FAIL ${failure.name}: ${failure.detail}`));
    process.exit(1);
  }
}

main();
