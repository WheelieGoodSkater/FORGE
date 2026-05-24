const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const contractPath = path.join(root, 'data', 'w78_secret_safe_remote_smoke_operator_runbook.json');
const w77TracePath = path.join(root, 'trace_samples', 'w77_remote_endpoint_provisioning_secrets_handoff_trace.json');
const tracePath = path.join(root, 'trace_samples', 'w78_secret_safe_remote_smoke_operator_runbook_trace.json');
const reportPath = path.join(root, 'reports', 'w78_secret_safe_remote_smoke_operator_runbook.md');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function assertCase(results, name, pass, detail) {
  results.push({ name, pass: !!pass, detail: detail || '' });
}

function escapeTable(value) {
  return String(value == null ? '' : value).replace(/\|/g, '/');
}

function main() {
  const contract = readJson(contractPath);
  const w77 = readJson(w77TracePath);
  const results = [];

  assertCase(results, 'w78_contract_schema_present', contract.schema === 'idb.w78-secret-safe-remote-smoke-operator-runbook.v1', contract.schema);
  assertCase(results, 'w78_inherits_w77_no_go', w77.decision === 'PASS' && w77.pilotDecision === contract.sourceDecision.priorDecision && w77.remoteSmokeExecuted === false && contract.sourceDecision.hostedResolverPilotEnabled === false, JSON.stringify({ w77Decision: w77.pilotDecision, remoteSmokeExecuted: w77.remoteSmokeExecuted }));
  assertCase(results, 'w78_shell_setup_complete', contract.shellSetup.length === 5 && contract.shellSetup.some((item) => item.command.includes('IDB_REMOTE_RESOLVER_TOKEN') && item.secret === true) && contract.shellSetup.some((item) => item.command.includes('IDB_REMOTE_RESOLVER_BASE_URL')), JSON.stringify(contract.shellSetup));
  assertCase(results, 'w78_smoke_command_order_complete', contract.smokeCommandOrder.length >= 4 && contract.smokeCommandOrder[0].command === 'npm run harness:apply-hosted-resolver-env-rerun' && contract.smokeCommandOrder.some((item) => item.command === 'npm run preflight'), JSON.stringify(contract.smokeCommandOrder));
  assertCase(results, 'w78_expected_outputs_present', contract.expectedPassOutputs.some((item) => /remoteSmokeExecuted true/.test(item)) && contract.expectedPassOutputs.some((item) => /zero false-confident-wrong/.test(item)) && contract.expectedFailOutputs.some((item) => /raw token/.test(item)), JSON.stringify({ pass: contract.expectedPassOutputs, fail: contract.expectedFailOutputs }));
  assertCase(results, 'w78_no_secret_rules_present', contract.noSecretHandlingRules.some((item) => /Do not paste the resolver token/.test(item)) && contract.noSecretHandlingRules.some((item) => /Only record tokenConfigured/.test(item)) && contract.noSecretHandlingRules.some((item) => /rotate the token/.test(item)), JSON.stringify(contract.noSecretHandlingRules));
  assertCase(results, 'w78_rollback_steps_present', contract.rollbackSteps.some((item) => /Unset IDB_REMOTE_RESOLVER_BASE_URL/.test(item)) && contract.rollbackSteps.some((item) => /hosted resolver pilot toggle to disabled/.test(item)) && contract.rollbackSteps.some((item) => /confirm hostedResolverPilotEnabled false/.test(item)), JSON.stringify(contract.rollbackSteps));
  assertCase(results, 'w78_decision_tree_complete', contract.pilotUnlockDecisionTree.some((item) => item.decision === 'pilot_unlock_candidate') && contract.pilotUnlockDecisionTree.some((item) => item.decision === 'stop_and_rotate_secret') && contract.pilotUnlockDecisionTree.filter((item) => item.decision === 'no_go').length >= 4, JSON.stringify(contract.pilotUnlockDecisionTree));
  assertCase(results, 'w78_no_regression_boundaries_present', contract.noRegression.writeAuthority === 'none' && contract.noRegression.suiteScriptInvocation === false && contract.noRegression.nllmAdvisoryOnly === true && contract.noRegression.notesCannotOwnIdentification === true && contract.noRegression.hostedResolverPilotEnabled === false, JSON.stringify(contract.noRegression));
  assertCase(results, 'w78_best_next_prompt_present', contract.bestNextCodexPrompt.block === 'W79: Hosted Resolver Consultant Smoke Unlock Gate' && /Move through W79/.test(contract.bestNextCodexPrompt.prompt), contract.bestNextCodexPrompt.prompt);

  const failures = results.filter((result) => !result.pass);
  const decision = failures.length ? 'FAIL' : 'PASS';
  const trace = {
    schema: 'idb.w78-secret-safe-remote-smoke-operator-runbook-trace.v1',
    generated: new Date().toISOString(),
    decision,
    pilotDecision: 'operator_runbook_ready_hosted_pilot_still_no_go',
    remoteSmokeExecuted: false,
    hostedResolverPilotEnabled: false,
    inheritedW77: {
      decision: w77.decision,
      pilotDecision: w77.pilotDecision,
      remoteSmokeExecuted: w77.remoteSmokeExecuted,
      hostedResolverPilotEnabled: w77.hostedResolverPilotEnabled
    },
    operatorAudience: contract.operatorAudience,
    shellSetup: contract.shellSetup,
    smokeCommandOrder: contract.smokeCommandOrder,
    expectedPassOutputs: contract.expectedPassOutputs,
    expectedFailOutputs: contract.expectedFailOutputs,
    noSecretHandlingRules: contract.noSecretHandlingRules,
    rollbackSteps: contract.rollbackSteps,
    pilotUnlockDecisionTree: contract.pilotUnlockDecisionTree,
    noRegression: contract.noRegression,
    bestNextCodexPrompt: contract.bestNextCodexPrompt,
    results
  };
  fs.writeFileSync(tracePath, `${JSON.stringify(trace, null, 2)}\n`);

  const rows = results.map((result) => `| ${result.pass ? 'PASS' : 'FAIL'} | ${result.name} | ${escapeTable(result.detail)} |`).join('\n');
  const commandRows = contract.smokeCommandOrder.map((item) => `| ${item.step} | ${escapeTable(item.command)} | ${escapeTable(item.purpose)} | ${escapeTable(item.expectedPass)} | ${escapeTable(item.expectedFail)} |`).join('\n');
  const decisionRows = contract.pilotUnlockDecisionTree.map((item) => `| ${escapeTable(item.condition)} | ${escapeTable(item.decision)} | ${escapeTable(item.action)} |`).join('\n');
  const failureRows = failures.map((result) => `- ${result.name}: ${result.detail}`).join('\n') || '- None';
  const report = `# W78 Secret-Safe Remote Smoke Operator Runbook

Decision: ${decision} / OPERATOR RUNBOOK READY / HOSTED PILOT STILL NO-GO / NO WRITE AUTHORITY

## Objective

Convert the W77 provisioning handoff into an operator-ready runbook for the person who has access to the hosted resolver URL and token.

## Shell Setup

\`\`\`bash
${contract.shellSetup.map((item) => item.command).join('\n')}
\`\`\`

## Smoke Command Order

| Step | Command | Purpose | Expected Pass | Expected Fail |
| --- | --- | --- | --- | --- |
${commandRows}

## Pilot Unlock Decision Tree

| Condition | Decision | Action |
| --- | --- | --- |
${decisionRows}

## No-Secret Handling Rules

${contract.noSecretHandlingRules.map((item) => `- ${item}`).join('\n')}

## Rollback Steps

${contract.rollbackSteps.map((item) => `- ${item}`).join('\n')}

## Harness Gates

| Status | Rule | Detail |
| --- | --- | --- |
${rows}

## No Regression

- No writes.
- No SuiteScript invocation.
- N/LLM advisory-only.
- Notes cannot own identity.
- Blocked, thin, unavailable, and timeout remain insufficient evidence with no confident guesses.
- Transaction writes remain blocked.
- Hosted resolver pilot traffic remains disabled.

## Failures

${failureRows}

## Best Next Codex Prompt

\`\`\`text
${contract.bestNextCodexPrompt.prompt}
\`\`\`
`;
  fs.writeFileSync(reportPath, report);
  console.log(`W78 secret-safe remote smoke operator runbook harness: ${decision} pilot_decision=operator_runbook_ready_hosted_pilot_still_no_go`);
  if (failures.length) {
    console.error(failures);
    process.exit(1);
  }
}

main();
