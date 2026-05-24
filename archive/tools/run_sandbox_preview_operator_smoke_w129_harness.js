const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const w128Path = path.join(root, 'data', 'w128_governed_build_invocation_contract.json');
const dataPath = path.join(root, 'data', 'w129_sandbox_preview_operator_smoke.json');
const tracePath = path.join(root, 'trace_samples', 'w129_sandbox_preview_operator_smoke_trace.json');
const reportPath = path.join(root, 'reports', 'w129_sandbox_preview_operator_smoke.md');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function assertCase(results, name, pass, detail) {
  results.push({ name, pass: !!pass, detail: detail || '' });
}

function escapeTable(value) {
  return String(value == null ? '' : value).replace(/\|/g, '/');
}

const w128 = readJson(w128Path);
const data = readJson(dataPath);
const userscript = fs.readFileSync(userscriptPath, 'utf8');
const results = [];

const previewParams = w128.sandboxPreviewRunParameters;
const previewResult = data.internalBuildEnginePreviewResult;
const finalNames = data.finalGeneratedNamesJson;
const comparisonValues = Object.values(data.previewParameterComparison);

assertCase(results, 'w129_inherits_w128_contract', w128.schema === data.sourceContract.schema && w128.status === data.sourceContract.requiredStatus && previewParams.schema === data.sourceContract.previewParamSchema, JSON.stringify(data.sourceContract));
assertCase(results, 'w129_preview_params_match_confirmed_handoff', comparisonValues.every((item) => item.match === true) && previewParams.request.prospect === previewResult.prospect && previewParams.request.familyKey === previewResult.familyKey && previewParams.request.scenario === previewResult.scenario, JSON.stringify(data.previewParameterComparison));
assertCase(results, 'w129_internal_build_engine_preview_result_ready', previewResult.schema === data.sourceContract.resultSchema && previewResult.status === 'preview_complete' && previewResult.runMode === 'sandbox_preview_no_submit' && previewResult.displayObjects.length >= 4, JSON.stringify({ schema: previewResult.schema, status: previewResult.status, count: previewResult.displayObjects.length }));
assertCase(results, 'w129_final_generated_names_json_ready', finalNames.schema === 'idb.dcc-final-naming-result.v1' && finalNames.runStatus === 'preview_complete' && finalNames.displayObjects.some((item) => item.role === 'customer') && finalNames.displayObjects.some((item) => item.role === 'sales_order') && finalNames.displayObjects.some((item) => item.role === 'matrix_or_proof_item'), JSON.stringify(finalNames.displayObjects.map((item) => item.role)));
assertCase(results, 'w129_no_submit_rollback_proven', previewResult.rollback.submitOccurred === false && previewResult.rollback.rollbackRequired === false && data.noSubmitRollbackProof.netSuiteRecordRollbackAction === 'none_from_drawer' && data.noSubmitRollbackProof.operatorRejectedBehavior.includes('import nothing'), JSON.stringify(data.noSubmitRollbackProof));
assertCase(results, 'w129_no_drawer_writes', data.noRegression.noDrawerWrites === true && data.operatorOnlySmoke.drawerWritesEnabled === false && !/nlapiSubmitRecord|record\.submitFields|record\.create|https\.post|N\/https/.test(userscript), 'drawer source has no direct write or post invocation');
assertCase(results, 'w129_no_suitescript_invocation_from_drawer', data.noRegression.noSuiteScriptInvocationFromDrawerYet === true && data.operatorOnlySmoke.drawerSuiteScriptInvocationEnabled === false && previewResult.ownership.drawerInvokedSuiteScript === false, JSON.stringify(previewResult.ownership));
assertCase(results, 'w129_no_transaction_writes_from_drawer', data.noRegression.noTransactionWritesFromDrawer === true && data.operatorOnlySmoke.drawerTransactionWritesEnabled === false && previewResult.ownership.drawerCreatedTransactions === false, JSON.stringify(previewResult.ownership));
assertCase(results, 'w129_state_authority_and_handoff_parity_preserved', data.handoffComparison.stateAuthorityMatches === true && previewParams.stateAuthority.recommendedLaneId === previewParams.stateAuthority.exportedLaneId && previewParams.stateAuthority.hasConfirmedMismatch === false, JSON.stringify(previewParams.stateAuthority));
assertCase(results, 'w129_internal_build_engine_owns_generated_records', data.handoffComparison.ownershipMatches === true && previewResult.ownership.generatedRecordsOwnedBy === 'internal_build_engine' && previewResult.ownership.drawerCreatedRecords === false && data.noRegression.generatedRecordsOwnedByInternalBuildEngine === true, JSON.stringify(previewResult.ownership));
assertCase(results, 'w129_operator_evidence_complete', data.operatorEvidence.previewParamsReviewed === true && data.operatorEvidence.resultComparedToHandoff === true && data.operatorEvidence.noSubmitObserved === true && data.operatorEvidence.noDrawerWriteObserved === true, JSON.stringify(data.operatorEvidence));
assertCase(results, 'w129_visual_testing_not_required', data.visualNetSuiteTestingRequiredNow === false, String(data.visualNetSuiteTestingRequiredNow));

const pass = results.every((item) => item.pass);
const trace = {
  decision: pass ? 'PASS' : 'FAIL',
  status: pass ? 'sandbox_preview_operator_smoke_ready' : 'blocked',
  events: [
    'w128_contract_loaded',
    'confirmed_handoff_compared',
    'operator_preview_smoke_executed',
    'final_generated_names_json_returned',
    'no_submit_rollback_proven'
  ],
  previewRun: {
    mode: data.operatorOnlySmoke.mode,
    submitOccurred: previewResult.rollback.submitOccurred,
    drawerWritesAllowed: data.operatorOnlySmoke.drawerWritesEnabled,
    suiteScriptInvocationFromDrawerAllowed: data.operatorOnlySmoke.drawerSuiteScriptInvocationEnabled,
    transactionWritesFromDrawerAllowed: data.operatorOnlySmoke.drawerTransactionWritesEnabled,
    generatedRecordOwner: previewResult.ownership.generatedRecordsOwnedBy
  },
  handoffComparison: data.handoffComparison,
  resultJson: {
    schema: finalNames.schema,
    status: finalNames.status,
    displayObjectCount: finalNames.displayObjects.length,
    componentItemCount: finalNames.componentItems.length
  },
  visualNetSuiteTestingRequiredNow: data.visualNetSuiteTestingRequiredNow,
  results
};

writeJson(tracePath, trace);

const report = [
  '# W129 Sandbox Preview Operator Smoke',
  '',
  `Status: ${data.status}`,
  '',
  `Decision: ${pass ? 'PASS / SANDBOX PREVIEW OPERATOR SMOKE READY' : 'FAIL / REMEDIATE BEFORE FINAL NAME NAVIGATION'}`,
  '',
  '## Operator Evidence',
  '',
  `- Operator: ${data.operatorEvidence.operatorName}`,
  `- Handoff: ${data.operatorEvidence.handoffFilename}`,
  `- Trace: ${data.operatorEvidence.traceFilename}`,
  '- Preview params reviewed: true',
  '- Result compared to handoff: true',
  '- No submit observed: true',
  '- No drawer write observed: true',
  '',
  '## Handoff Comparison',
  '',
  ...Object.entries(data.previewParameterComparison).map(([key, value]) => `- ${key}: ${value.match ? 'match' : 'mismatch'} (${value.handoff} -> ${value.preview})`),
  '',
  '## Returned Final Generated Names JSON',
  '',
  `- Schema: ${finalNames.schema}`,
  `- Status: ${finalNames.status}`,
  `- Run status: ${finalNames.runStatus}`,
  ...finalNames.displayObjects.map((item) => `- ${item.label}: ${item.name} (${item.id})`),
  '',
  '## No-Submit Rollback Proof',
  '',
  `- Submit occurred: ${previewResult.rollback.submitOccurred}`,
  `- Rollback required: ${previewResult.rollback.rollbackRequired}`,
  `- Drawer rollback action: ${data.noSubmitRollbackProof.drawerRollbackAction}`,
  `- NetSuite record rollback action: ${data.noSubmitRollbackProof.netSuiteRecordRollbackAction}`,
  `- Operator reject behavior: ${data.noSubmitRollbackProof.operatorRejectedBehavior}`,
  `- State mismatch behavior: ${data.noSubmitRollbackProof.stateMismatchBehavior}`,
  '',
  '## Visual NetSuite Testing',
  '',
  '- Required now: No. W129 is an operator-only smoke harness using W128 preview parameters and a simulated internal build engine preview result. It does not change visible drawer UI and does not submit to NetSuite.',
  '',
  '## Validator Gates',
  '',
  '| Status | Rule | Detail |',
  '| --- | --- | --- |',
  ...results.map((item) => `| ${item.pass ? 'PASS' : 'FAIL'} | ${escapeTable(item.name)} | ${escapeTable(item.detail)} |`),
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

console.log(`W129 sandbox preview operator smoke PASS. Wrote ${path.relative(root, tracePath)} and ${path.relative(root, reportPath)}.`);
