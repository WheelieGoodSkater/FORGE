const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const contractPath = path.join(root, 'data', 'w76r_apply_hosted_resolver_env_and_rerun_remote_execution.json');
const w76TracePath = path.join(root, 'trace_samples', 'w76_hosted_resolver_configured_remote_execution_trace.json');
const tracePath = path.join(root, 'trace_samples', 'w76r_apply_hosted_resolver_env_and_rerun_remote_execution_trace.json');
const reportPath = path.join(root, 'reports', 'w76r_apply_hosted_resolver_env_and_rerun_remote_execution.md');

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

function runW76() {
  const result = spawnSync('npm', ['run', 'harness:hosted-resolver-configured-remote-execution'], {
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
  const observedEnv = envState();
  const remoteEnvReady = observedEnv.remoteSmokeOptIn
    && observedEnv.baseUrlConfigured
    && observedEnv.tokenConfigured
    && observedEnv.allowedOriginConfigured
    && observedEnv.blockedOriginConfigured;
  const w76Run = runW76();
  const w76 = readJson(w76TracePath);
  const results = [];

  assertCase(results, 'w76r_contract_schema_present', contract.schema === 'idb.w76r-apply-hosted-resolver-env-and-rerun-remote-execution.v1', contract.schema);
  assertCase(results, 'w76r_operator_values_not_fabricated', contract.operatorInputDecision.decision === 'cannot_apply_remote_env_without_operator_values' && observedEnv.rawSecretsIncluded === false, JSON.stringify({ contract: contract.operatorInputDecision, observedEnv }));
  assertCase(results, 'w76r_required_environment_complete', contract.requiredEnvironment.length === 5 && contract.requiredEnvironment.some((item) => /IDB_REMOTE_RESOLVER_BASE_URL/.test(item)) && contract.requiredEnvironment.some((item) => /IDB_REMOTE_RESOLVER_TOKEN/.test(item)), JSON.stringify(contract.requiredEnvironment));
  assertCase(results, 'w76r_w76_rerun_as_gate', w76Run.status === 0 && w76.decision === 'PASS', JSON.stringify({ w76Run, w76Decision: w76.decision }));
  assertCase(results, 'w76r_remote_env_missing_keeps_no_go', !remoteEnvReady && w76.remoteSmokeExecuted === false && w76.pilotDecision === 'no_go_remote_config_missing', JSON.stringify({ observedEnv, w76RemoteSmokeExecuted: w76.remoteSmokeExecuted, w76PilotDecision: w76.pilotDecision }));
  assertCase(results, 'w76r_executed_remote_results_honest', contract.executedRemoteResults.health === 'not_executed_missing_operator_env' && contract.executedRemoteResults.approvedLiveSiteSmoke === 'not_executed_missing_operator_env' && contract.executedRemoteResults.noSecretTraceChecks === 'passed_for_missing_env_state', JSON.stringify(contract.executedRemoteResults));
  assertCase(results, 'w76r_operator_action_required_complete', contract.operatorActionRequired.length === 5 && contract.operatorActionRequired.some((item) => item.env === 'IDB_REMOTE_RESOLVER_BASE_URL') && contract.operatorActionRequired.some((item) => item.env === 'IDB_REMOTE_RESOLVER_TOKEN') && contract.operatorActionRequired.some((item) => item.env === 'IDB_REMOTE_RESOLVER_ALLOWED_ORIGIN'), JSON.stringify(contract.operatorActionRequired));
  assertCase(results, 'w76r_safe_shell_template_present', contract.safeShellTemplate.some((item) => /export IDB_REMOTE_RESOLVER_SMOKE=1/.test(item)) && contract.safeShellTemplate.some((item) => /npm run harness:hosted-resolver-configured-remote-execution/.test(item)) && contract.safeShellTemplate.some((item) => /npm run preflight/.test(item)), JSON.stringify(contract.safeShellTemplate));
  assertCase(results, 'w76r_unlock_and_no_secret_rules_present', contract.pilotUnlockCriteria.some((item) => /remoteSmokeExecuted true/.test(item)) && contract.pilotUnlockCriteria.some((item) => /zero unsupported claims/.test(item)) && contract.noSecretTraceRules.some((item) => /Never write raw resolver token/.test(item)) && contract.noSecretTraceRules.some((item) => /rawSecretsIncluded false/.test(item)), JSON.stringify({ unlock: contract.pilotUnlockCriteria, secretRules: contract.noSecretTraceRules }));
  assertCase(results, 'w76r_no_regression_boundaries_present', contract.noRegression.writeAuthority === 'none' && contract.noRegression.suiteScriptInvocation === false && contract.noRegression.nllmAdvisoryOnly === true && contract.noRegression.notesCannotOwnIdentification === true && contract.noRegression.hostedResolverPilotEnabled === false, JSON.stringify(contract.noRegression));
  assertCase(results, 'w76r_best_next_prompt_present', contract.bestNextCodexPrompt.block === 'W77: Remote Endpoint Provisioning And Secrets Handoff' && /Move through W77/.test(contract.bestNextCodexPrompt.prompt), contract.bestNextCodexPrompt.prompt);

  const failures = results.filter((result) => !result.pass);
  const decision = failures.length ? 'FAIL' : 'PASS';
  const pilotDecision = remoteEnvReady && w76.remoteSmokeExecuted ? 'pilot_unlock_candidate_remote_execution_passed' : 'no_go_operator_env_missing';
  const trace = {
    schema: 'idb.w76r-apply-hosted-resolver-env-and-rerun-remote-execution-trace.v1',
    generated: new Date().toISOString(),
    decision,
    pilotDecision,
    remoteEnvReady,
    remoteSmokeExecuted: w76.remoteSmokeExecuted === true,
    hostedResolverPilotEnabled: false,
    consultantSmokeEligible: false,
    blockedReason: remoteEnvReady ? null : 'operator_env_values_missing',
    observedEnvironment: observedEnv,
    w76Run,
    w76Observed: {
      decision: w76.decision,
      pilotDecision: w76.pilotDecision,
      remoteSmokeExecuted: w76.remoteSmokeExecuted,
      hostedResolverPilotEnabled: w76.hostedResolverPilotEnabled,
      blockedReason: w76.blockedReason
    },
    executedRemoteResults: contract.executedRemoteResults,
    operatorActionRequired: contract.operatorActionRequired,
    safeShellTemplate: contract.safeShellTemplate,
    pilotUnlockCriteria: contract.pilotUnlockCriteria,
    noSecretTraceRules: contract.noSecretTraceRules,
    noRegression: contract.noRegression,
    bestNextCodexPrompt: contract.bestNextCodexPrompt,
    results
  };
  fs.writeFileSync(tracePath, `${JSON.stringify(trace, null, 2)}\n`);

  const rows = results.map((result) => `| ${result.pass ? 'PASS' : 'FAIL'} | ${result.name} | ${escapeTable(result.detail)} |`).join('\n');
  const actionRows = contract.operatorActionRequired.map((item) => `| ${escapeTable(item.role)} | ${escapeTable(item.env)} | ${escapeTable(item.action)} | ${escapeTable(item.mustSatisfy)} |`).join('\n');
  const failureRows = failures.map((result) => `- ${result.name}: ${result.detail}`).join('\n') || '- None';
  const report = `# W76R Apply Hosted Resolver Env And Rerun Remote Execution

Decision: ${decision} / ${pilotDecision} / HOSTED PILOT NOT ENABLED / NO WRITE AUTHORITY

## Objective

Configure the real remote staging \`websiteResolverServiceV1\` environment required by W75, then rerun W76 so W73R executes with \`remoteSmokeExecuted=true\`.

## Execution Result

The required operator environment values are still missing. I did not invent an endpoint URL, token, or origins. W76 was rerun and remains no-go because W73R still reports \`remoteSmokeExecuted=false\`.

## Observed Environment

- Remote smoke opt-in: \`${observedEnv.remoteSmokeOptIn}\`
- Base URL configured: \`${observedEnv.baseUrlConfigured}\`
- Token configured: \`${observedEnv.tokenConfigured}\`
- Allowed origin configured: \`${observedEnv.allowedOriginConfigured}\`
- Blocked origin configured: \`${observedEnv.blockedOriginConfigured}\`
- Raw secrets included: \`false\`

## Operator Action Required

| Role | Env | Action | Must Satisfy |
| --- | --- | --- | --- |
${actionRows}

## Rerun Template

\`\`\`bash
${contract.safeShellTemplate.join('\n')}
\`\`\`

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
  console.log(`W76R apply hosted resolver env and rerun harness: ${decision} pilot_decision=${pilotDecision} remote_smoke_executed=${w76.remoteSmokeExecuted === true}`);
  if (failures.length) {
    console.error(failures);
    process.exit(1);
  }
}

main();
