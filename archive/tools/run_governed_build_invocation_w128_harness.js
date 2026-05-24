const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const dataPath = path.join(root, 'data', 'w128_governed_build_invocation_contract.json');
const tracePath = path.join(root, 'trace_samples', 'w128_governed_build_invocation_trace.json');
const reportPath = path.join(root, 'reports', 'w128_governed_build_invocation_contract.md');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function assertCase(results, name, pass, detail) {
  results.push({ name, pass: !!pass, detail: detail || '' });
}

const data = readJson(dataPath);
const userscript = fs.readFileSync(userscriptPath, 'utf8');
const results = [];

assertCase(results, 'w128_invocation_contract_ready', data.schema === 'idb.w128-governed-build-invocation-contract.v1' && data.status === 'governed_build_invocation_contract_ready', data.schema);
assertCase(results, 'w128_required_readiness_gates_present', ['sales_request_complete', 'demo_path_confirmed', 'handoff_exported', 'operator_review_ready', 'no_state_mismatch'].every((id) => data.requiredGates.some((gate) => gate.id === id && gate.required === true)), JSON.stringify(data.requiredGates.map((gate) => gate.id)));
assertCase(results, 'w128_sandbox_preview_run_params_shape_ready', data.sandboxPreviewRunParameters.schema === 'idb.internal-build-engine.preview-run-params.v1' && data.sandboxPreviewRunParameters.mode === 'sandbox_preview_no_submit' && data.sandboxPreviewRunParameters.executionControls.submitAllowed === false && data.sandboxPreviewRunParameters.executionControls.recordWritesAllowed === false, JSON.stringify(data.sandboxPreviewRunParameters.executionControls));
assertCase(results, 'w128_no_submit_rollback_defined', ['previewCancel', 'operatorReject', 'stateMismatch', 'partialEngineFailure', 'drawerRollback'].every((key) => data.noSubmitRollbackBehavior[key]), JSON.stringify(data.noSubmitRollbackBehavior));
assertCase(results, 'w128_result_json_shape_ready', data.expectedResultJsonShape.schema === 'idb.internal-build-engine.result.v1' && ['schema', 'status', 'runId', 'generated', 'displayObjects', 'ownership', 'rollback', 'importHandoff'].every((field) => data.expectedResultJsonShape.requiredTopLevelFields.includes(field)), JSON.stringify(data.expectedResultJsonShape.requiredTopLevelFields));
assertCase(results, 'w128_final_generated_names_import_handoff_ready', data.finalGeneratedNamesImportHandoff.importOnly === true && data.finalGeneratedNamesImportHandoff.targetDrawerStateKey === 'dccFinalNamingResult' && data.finalGeneratedNamesImportHandoff.drawerCanSubmitFollowupWrites === false, JSON.stringify(data.finalGeneratedNamesImportHandoff));
assertCase(results, 'w128_no_drawer_writes', data.noRegression.noDrawerWrites === true && !/nlapiSubmitRecord|record\.submitFields|record\.create|https\.post|N\/https/.test(userscript), 'drawer source has no direct write or post invocation');
assertCase(results, 'w128_no_suitescript_invocation_from_drawer', data.noRegression.noSuiteScriptInvocationFromDrawerYet === true && data.invocationReadinessContract.drawerMayInvokeSuiteScript === false, JSON.stringify(data.invocationReadinessContract));
assertCase(results, 'w128_no_transaction_writes_from_drawer', data.noRegression.noTransactionWritesFromDrawer === true && data.sandboxPreviewRunParameters.executionControls.transactionWritesAllowed === false, JSON.stringify(data.sandboxPreviewRunParameters.executionControls));
assertCase(results, 'w128_consultant_confirmation_required', data.invocationReadinessContract.consultantConfirmationRequired === true && data.requiredGates.some((gate) => gate.id === 'demo_path_confirmed'), JSON.stringify(data.invocationReadinessContract));
assertCase(results, 'w128_state_authority_and_handoff_parity_preserved', data.sandboxPreviewRunParameters.stateAuthority.recommendedLaneId === data.sandboxPreviewRunParameters.stateAuthority.exportedLaneId && data.sandboxPreviewRunParameters.stateAuthority.hasRecommendedMismatch === false && data.sandboxPreviewRunParameters.stateAuthority.hasConfirmedMismatch === false, JSON.stringify(data.sandboxPreviewRunParameters.stateAuthority));
assertCase(results, 'w128_internal_build_engine_owns_generated_records', data.invocationReadinessContract.generatedRecordOwner === 'internal_build_engine' && data.samplePreviewResult.ownership.generatedRecordsOwnedBy === 'internal_build_engine' && data.samplePreviewResult.ownership.drawerCreatedRecords === false, JSON.stringify(data.samplePreviewResult.ownership));
assertCase(results, 'w128_operator_runbook_ready', data.operatorRunbook.length >= 10 && data.operatorRunbook.some((step) => /Import final generated names/.test(step)), JSON.stringify(data.operatorRunbook));
assertCase(results, 'w128_visual_testing_not_required', data.visualNetSuiteTestingRequiredNow === false, String(data.visualNetSuiteTestingRequiredNow));

const pass = results.every((item) => item.pass);
const trace = {
  decision: pass ? 'PASS' : 'FAIL',
  status: pass ? 'governed_build_invocation_contract_ready' : 'blocked',
  events: [
    'confirmed_build_handoff_ready',
    'operator_review_ready',
    'sandbox_preview_params_prepared',
    'no_submit_rollback_defined',
    'final_generated_names_import_handoff_ready'
  ],
  readinessGates: Object.fromEntries(data.requiredGates.map((gate) => [gate.id, true])),
  previewRun: {
    mode: data.sandboxPreviewRunParameters.mode,
    submitAllowed: data.sandboxPreviewRunParameters.executionControls.submitAllowed,
    drawerWritesAllowed: data.sandboxPreviewRunParameters.executionControls.recordWritesAllowed,
    suiteScriptInvocationFromDrawerAllowed: data.sandboxPreviewRunParameters.executionControls.suiteScriptInvocationFromDrawerAllowed,
    transactionWritesFromDrawerAllowed: data.sandboxPreviewRunParameters.executionControls.transactionWritesAllowed,
    generatedRecordOwner: data.invocationReadinessContract.generatedRecordOwner
  },
  resultJsonStatus: data.samplePreviewResult.status,
  finalGeneratedNamesImport: {
    target: data.finalGeneratedNamesImportHandoff.target,
    importOnly: data.finalGeneratedNamesImportHandoff.importOnly,
    recordsCreatedByDrawer: data.finalGeneratedNamesImportHandoff.drawerCanMarkRecordsCreated
  },
  visualNetSuiteTestingRequiredNow: data.visualNetSuiteTestingRequiredNow,
  results
};

writeJson(tracePath, trace);

const report = [
  '# W128 Governed Build Invocation Contract And Sandbox Preview Bridge',
  '',
  `Status: ${data.status}`,
  '',
  `Decision: ${pass ? 'PASS / GOVERNED BUILD INVOCATION CONTRACT READY' : 'FAIL / REMEDIATE BEFORE PREVIEW RUN'}`,
  '',
  '## Invocation Contract',
  '',
  `- Source: ${data.invocationReadinessContract.sourceSurface}`,
  `- Executor: ${data.invocationReadinessContract.executorSurface}`,
  `- Default mode: ${data.invocationReadinessContract.defaultMode}`,
  `- Generated record owner: ${data.invocationReadinessContract.generatedRecordOwner}`,
  '- Drawer writes: disabled',
  '- Drawer SuiteScript invocation: disabled',
  '- Drawer transaction writes: disabled',
  '',
  '## Required Gates',
  '',
  ...data.requiredGates.map((gate) => `- ${gate.id}: ${gate.passWhen}`),
  '',
  '## Sandbox Preview / Run Parameters',
  '',
  `- Schema: ${data.sandboxPreviewRunParameters.schema}`,
  `- Mode: ${data.sandboxPreviewRunParameters.mode}`,
  `- Prospect: ${data.sandboxPreviewRunParameters.request.prospect}`,
  `- Family/scenario: ${data.sandboxPreviewRunParameters.request.familyKey} / ${data.sandboxPreviewRunParameters.request.scenario}`,
  '- Submit allowed: false',
  '- Record writes allowed: false',
  '- Transaction writes allowed: false',
  '',
  '## No-Submit Rollback',
  '',
  ...Object.entries(data.noSubmitRollbackBehavior).map(([key, value]) => `- ${key}: ${value}`),
  '',
  '## Result JSON Expected Shape',
  '',
  `- Schema: ${data.expectedResultJsonShape.schema}`,
  `- Allowed statuses: ${data.expectedResultJsonShape.allowedStatuses.join(', ')}`,
  `- Required top-level fields: ${data.expectedResultJsonShape.requiredTopLevelFields.join(', ')}`,
  '',
  '## Final Generated Names Import Handoff',
  '',
  `- Source: ${data.finalGeneratedNamesImportHandoff.source}`,
  `- Target drawer state: ${data.finalGeneratedNamesImportHandoff.targetDrawerStateKey}`,
  '- Import mode: result JSON only',
  '- Drawer follow-up writes: disabled',
  '',
  '## Visual NetSuite Testing',
  '',
  '- Required now: No. W128 defines and validates the invocation contract, parameter shape, rollback rules, and import handoff only. There is no visible NetSuite UI change and no live sandbox submission.',
  '',
  '## Validator Gates',
  '',
  ...results.map((item) => `- ${item.pass ? 'PASS' : 'FAIL'}: ${item.name}${item.detail ? ` - ${item.detail}` : ''}`),
  '',
  '## Best Next Codex Prompt',
  '',
  data.bestNextCodexPrompt.prompt
].join('\n');

fs.writeFileSync(reportPath, `${report}\n`);

if (!pass) {
  console.error(JSON.stringify(results.filter((item) => !item.pass), null, 2));
  process.exit(1);
}

console.log(`W128 governed build invocation PASS. Wrote ${path.relative(root, tracePath)} and ${path.relative(root, reportPath)}.`);
