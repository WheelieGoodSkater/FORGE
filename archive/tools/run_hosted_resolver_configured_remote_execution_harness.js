const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const contractPath = path.join(root, 'data', 'w76_hosted_resolver_configured_remote_execution.json');
const w75TracePath = path.join(root, 'trace_samples', 'w75_hosted_resolver_configuration_remediation_pack_trace.json');
const w73rTracePath = path.join(root, 'trace_samples', 'w73r_execute_remote_hosted_resolver_smoke_with_config_trace.json');
const tracePath = path.join(root, 'trace_samples', 'w76_hosted_resolver_configured_remote_execution_trace.json');
const reportPath = path.join(root, 'reports', 'w76_hosted_resolver_configured_remote_execution.md');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function assertCase(results, name, pass, detail) {
  results.push({ name, pass: !!pass, detail: detail || '' });
}

function escapeTable(value) {
  return String(value == null ? '' : value).replace(/\|/g, '/');
}

function envState() {
  return {
    remoteSmokeOptIn: String(process.env.IDB_REMOTE_RESOLVER_SMOKE || '').trim() === '1',
    baseUrlConfigured: Boolean(String(process.env.IDB_REMOTE_RESOLVER_BASE_URL || '').trim()),
    tokenConfigured: Boolean(String(process.env.IDB_REMOTE_RESOLVER_TOKEN || '').trim()),
    allowedOriginConfigured: Boolean(String(process.env.IDB_REMOTE_RESOLVER_ALLOWED_ORIGIN || '').trim()),
    blockedOriginConfigured: Boolean(String(process.env.IDB_REMOTE_RESOLVER_BLOCKED_ORIGIN || '').trim()),
    rawSecretsIncluded: false
  };
}

function runW73R() {
  const result = spawnSync('npm', ['run', 'harness:execute-remote-hosted-resolver-smoke'], {
    cwd: root,
    env: process.env,
    encoding: 'utf8'
  });
  return {
    status: result.status,
    signal: result.signal,
    stdoutSummary: result.stdout.split('\n').filter(Boolean).slice(-4),
    stderrSummary: result.stderr.split('\n').filter(Boolean).slice(-4)
  };
}

function main() {
  const contract = readJson(contractPath);
  const w75 = readJson(w75TracePath);
  const w73rRun = runW73R();
  const w73r = readJson(w73rTracePath);
  const observedEnv = envState();
  const remoteConfigPresent = observedEnv.remoteSmokeOptIn
    && observedEnv.baseUrlConfigured
    && observedEnv.tokenConfigured
    && observedEnv.allowedOriginConfigured
    && observedEnv.blockedOriginConfigured;
  const remoteExecutionPassed = w73r.remoteSmokeExecuted === true
    && w73r.pilotDecision === 'go_if_all_remote_trace_gates_remain_green';
  const results = [];

  assertCase(results, 'w76_contract_schema_present', contract.schema === 'idb.w76-hosted-resolver-configured-remote-execution.v1', contract.schema);
  assertCase(results, 'w76_inherits_w75_no_go_until_remote', w75.decision === 'PASS' && w75.pilotDecision === 'no_go_until_w75_remediation_applied_and_w76_remote_execution_passes' && w75.hostedResolverPilotEnabled === false, JSON.stringify({ decision: w75.decision, pilotDecision: w75.pilotDecision, enabled: w75.hostedResolverPilotEnabled }));
  assertCase(results, 'w76_w73r_executed_as_gate', w73rRun.status === 0 && w73r.decision === 'PASS', JSON.stringify({ run: w73rRun, w73rDecision: w73r.decision }));
  assertCase(results, 'w76_remote_env_absence_blocks_unlock', !remoteConfigPresent && w73r.remoteSmokeExecuted === false && w73r.pilotDecision === 'no_go_remote_config_missing', JSON.stringify({ observedEnv, w73rRemoteSmokeExecuted: w73r.remoteSmokeExecuted, w73rPilotDecision: w73r.pilotDecision }));
  assertCase(results, 'w76_executed_remote_results_honest', contract.executedRemoteResults.health === 'not_executed_missing_config' && contract.executedRemoteResults.approvedLiveSiteSmoke === 'not_executed_missing_config' && contract.executedRemoteResults.noSecretTraceChecks === 'passed_for_blocked_state', JSON.stringify(contract.executedRemoteResults));
  assertCase(results, 'w76_unlock_criteria_evaluated', contract.pilotUnlockCriteriaEvaluation.some((item) => item.criterion === 'W73R trace shows remoteSmokeExecuted true.' && item.status === 'fail') && contract.pilotUnlockCriteriaEvaluation.some((item) => /zero false-confident-wrong/.test(item.criterion) && item.status === 'not_run') && contract.pilotUnlockCriteriaEvaluation.some((item) => /Full preflight passes/.test(item.criterion) && item.status === 'not_applicable'), JSON.stringify(contract.pilotUnlockCriteriaEvaluation));
  assertCase(results, 'w76_pilot_decision_no_go', contract.pilotDecision.decision === 'no_go_remote_config_missing' && contract.pilotDecision.hostedResolverPilotEnabled === false && contract.pilotDecision.consultantSmokeEligible === false, JSON.stringify(contract.pilotDecision));
  assertCase(results, 'w76_no_secret_trace_checks_present', contract.noSecretTraceChecks.some((item) => /No raw token/.test(item)) && contract.noSecretTraceChecks.some((item) => /rawSecretsIncluded remains false/.test(item)) && observedEnv.rawSecretsIncluded === false, JSON.stringify({ rules: contract.noSecretTraceChecks, observedEnv }));
  assertCase(results, 'w76_no_regression_boundaries_present', contract.noRegression.writeAuthority === 'none' && contract.noRegression.suiteScriptInvocation === false && contract.noRegression.nllmAdvisoryOnly === true && contract.noRegression.notesCannotOwnIdentification === true && contract.noRegression.transactionWriteEnabled === false && contract.noRegression.hostedResolverPilotEnabled === false, JSON.stringify(contract.noRegression));
  assertCase(results, 'w76_best_next_prompt_present', contract.bestNextCodexPrompt.block === 'W76R: Apply Hosted Resolver Env And Rerun Remote Execution' && /Move through W76R/.test(contract.bestNextCodexPrompt.prompt), contract.bestNextCodexPrompt.prompt);

  const failures = results.filter((result) => !result.pass);
  const decision = failures.length ? 'FAIL' : 'PASS';
  const pilotDecision = remoteExecutionPassed ? 'pilot_unlock_candidate_remote_execution_passed' : 'no_go_remote_config_missing';
  const trace = {
    schema: 'idb.w76-hosted-resolver-configured-remote-execution-trace.v1',
    generated: new Date().toISOString(),
    decision,
    pilotDecision,
    remoteConfigPresent,
    remoteSmokeExecuted: w73r.remoteSmokeExecuted === true,
    hostedResolverPilotEnabled: false,
    consultantSmokeEligible: false,
    blockedReason: remoteExecutionPassed ? null : 'w75_remote_env_not_applied_or_w73r_not_remote_executed',
    inheritedW75: {
      decision: w75.decision,
      pilotDecision: w75.pilotDecision,
      hostedResolverPilotEnabled: w75.hostedResolverPilotEnabled
    },
    observedEnvironment: observedEnv,
    w73rRun,
    w73rObserved: {
      decision: w73r.decision,
      remoteSmokeExecuted: w73r.remoteSmokeExecuted,
      pilotDecision: w73r.pilotDecision,
      blockedReason: w73r.blockedReason,
      rawSecretsIncluded: w73r.environmentObserved && w73r.environmentObserved.rawSecretsIncluded
    },
    executedRemoteResults: contract.executedRemoteResults,
    pilotUnlockCriteriaEvaluation: contract.pilotUnlockCriteriaEvaluation,
    noSecretTraceChecks: contract.noSecretTraceChecks,
    noRegression: contract.noRegression,
    bestNextCodexPrompt: contract.bestNextCodexPrompt,
    results
  };
  fs.writeFileSync(tracePath, `${JSON.stringify(trace, null, 2)}\n`);

  const rows = results.map((result) => `| ${result.pass ? 'PASS' : 'FAIL'} | ${result.name} | ${escapeTable(result.detail)} |`).join('\n');
  const criteriaRows = contract.pilotUnlockCriteriaEvaluation.map((item) => `| ${escapeTable(item.status)} | ${escapeTable(item.criterion)} | ${escapeTable(item.evidence)} |`).join('\n');
  const failureRows = failures.map((result) => `- ${result.name}: ${result.detail}`).join('\n') || '- None';
  const report = `# W76 Hosted Resolver Configured Remote Execution

Decision: ${decision} / ${pilotDecision} / HOSTED PILOT NOT ENABLED / NO WRITE AUTHORITY

## Objective

Run W73R with the real remote staging \`websiteResolverServiceV1\` endpoint configuration present and decide pilot unlock or no-go.

## Execution Result

${remoteExecutionPassed ? 'W73R executed against the configured remote endpoint and produced a pilot unlock candidate.' : 'W76 could not execute hosted remote smoke because the remote resolver environment is still missing in this shell. This remains a hard no-go for hosted resolver pilot traffic.'}

## Observed Environment

- Remote smoke opt-in: \`${observedEnv.remoteSmokeOptIn}\`
- Base URL configured: \`${observedEnv.baseUrlConfigured}\`
- Token configured: \`${observedEnv.tokenConfigured}\`
- Allowed origin configured: \`${observedEnv.allowedOriginConfigured}\`
- Blocked origin configured: \`${observedEnv.blockedOriginConfigured}\`
- Raw secrets included: \`false\`

## Pilot Unlock Criteria

| Status | Criterion | Evidence |
| --- | --- | --- |
${criteriaRows}

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
  console.log(`W76 hosted resolver configured remote execution harness: ${decision} pilot_decision=${pilotDecision} remote_smoke_executed=${w73r.remoteSmokeExecuted === true}`);
  if (failures.length) {
    console.error(failures);
    process.exit(1);
  }
}

main();
