const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const contractPath = path.join(root, 'data', 'w73_remote_hosted_resolver_smoke_execution.json');
const w72TracePath = path.join(root, 'trace_samples', 'w72_remote_resolver_deployment_readiness_gate_trace.json');
const tracePath = path.join(root, 'trace_samples', 'w73_remote_hosted_resolver_smoke_execution_trace.json');
const reportPath = path.join(root, 'reports', 'w73_remote_hosted_resolver_smoke_execution.md');

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

function main() {
  const contract = readJson(contractPath);
  const w72 = readJson(w72TracePath);
  const env = envState();
  const remoteConfigReady = env.remoteSmokeOptIn
    && env.baseUrlConfigured
    && env.tokenConfigured
    && env.allowedOriginConfigured
    && env.blockedOriginConfigured;
  const results = [];

  assertCase(results, 'w73_contract_schema_present', contract.schema === 'idb.w73-remote-hosted-resolver-smoke-execution.v1', contract.schema);
  assertCase(results, 'w73_inherits_w72_readiness_gate', w72.decision === 'PASS' && w72.remoteSmokeMode === 'readiness_pack_only_remote_not_configured', JSON.stringify({ decision: w72.decision, mode: w72.remoteSmokeMode }));
  assertCase(results, 'w73_remote_config_status_honest', contract.executionDecision === 'not_executed_missing_remote_endpoint_config' && !remoteConfigReady, JSON.stringify(env));
  assertCase(results, 'w73_required_environment_list_present', contract.requiredEnvironment.includes('IDB_REMOTE_RESOLVER_SMOKE=1') && contract.requiredEnvironment.some((item) => /IDB_REMOTE_RESOLVER_BASE_URL/.test(item)) && contract.requiredEnvironment.some((item) => /IDB_REMOTE_RESOLVER_TOKEN/.test(item)), JSON.stringify(contract.requiredEnvironment));
  assertCase(results, 'w73_command_pack_present', /run_remote_resolver_deployment_readiness_gate_harness\.js/.test(contract.commandPack.remoteSmoke) && /run_approved_live_resolver_smoke_harness\.js/.test(contract.commandPack.approvedLiveSmoke), JSON.stringify(contract.commandPack));
  assertCase(results, 'w73_remote_required_results_present', contract.remoteSmokeRequiredResults.some((item) => /Remote \/health/.test(item)) && contract.remoteSmokeRequiredResults.some((item) => /cacheHit true/.test(item)) && contract.remoteSmokeRequiredResults.some((item) => /zero false-confident-wrong/.test(item)), JSON.stringify(contract.remoteSmokeRequiredResults));
  assertCase(results, 'w73_pilot_no_go_until_execution', contract.pilotGoNoGo.currentDecision === 'no_go_until_remote_smoke_executes' && contract.pilotGoNoGo.noGoIf.includes('Remote endpoint is not configured.'), JSON.stringify(contract.pilotGoNoGo));
  assertCase(results, 'w73_no_regression_boundaries_present', contract.noRegression.writeAuthority === 'none' && contract.noRegression.suiteScriptInvocation === false && contract.noRegression.nllmAdvisoryOnly === true && contract.noRegression.notesCannotOwnIdentification === true && contract.noRegression.transactionWriteEnabled === false, JSON.stringify(contract.noRegression));
  assertCase(results, 'w73_best_next_prompt_present', contract.bestNextCodexPrompt.block === 'W73R: Execute Remote Hosted Resolver Smoke With Config' && /Move through W73R/.test(contract.bestNextCodexPrompt.prompt), contract.bestNextCodexPrompt.prompt);

  const failures = results.filter((result) => !result.pass);
  const decision = failures.length ? 'FAIL' : 'PASS';
  const trace = {
    schema: 'idb.w73-remote-hosted-resolver-smoke-execution-trace.v1',
    generated: new Date().toISOString(),
    decision,
    executionDecision: contract.executionDecision,
    remoteSmokeExecuted: false,
    blockedReason: 'missing_remote_endpoint_config',
    inheritedW72Decision: w72.decision,
    environmentObserved: env,
    commandPack: contract.commandPack,
    remoteSmokeRequiredResults: contract.remoteSmokeRequiredResults,
    pilotGoNoGo: contract.pilotGoNoGo,
    noRegression: contract.noRegression,
    bestNextCodexPrompt: contract.bestNextCodexPrompt,
    results
  };
  fs.writeFileSync(tracePath, `${JSON.stringify(trace, null, 2)}\n`);

  const rows = results.map((result) => `| ${result.pass ? 'PASS' : 'FAIL'} | ${result.name} | ${escapeTable(result.detail)} |`).join('\n');
  const failureRows = failures.map((result) => `- ${result.name}: ${result.detail}`).join('\n') || '- None';
  const report = `# W73 Remote Hosted Resolver Smoke Execution

Decision: ${decision} / REMOTE SMOKE NOT EXECUTED / MISSING REMOTE CONFIG / NO WRITE AUTHORITY

## Objective

Run the W72 remote smoke command pack against the real hosted \`websiteResolverServiceV1\` URL.

## Honest Result

Remote smoke was not executed because the remote staging endpoint and secret environment variables are not configured in this workspace. I did not substitute local, synthetic, or cached results for remote smoke.

## Required Environment

${contract.requiredEnvironment.map((item) => `- \`${item}\``).join('\n')}

## Command Pack

\`\`\`bash
${contract.commandPack.remoteSmoke}
${contract.commandPack.approvedLiveSmoke}
\`\`\`

## Harness Gates

| Status | Rule | Detail |
| --- | --- | --- |
${rows}

## Pilot Go / No-Go

Current decision: \`${contract.pilotGoNoGo.currentDecision}\`

## No Regression

- No writes.
- No SuiteScript invocation.
- N/LLM advisory-only.
- Notes cannot own identity.
- Blocked, thin, unavailable, and timeout remain insufficient evidence with no confident guesses.
- Transaction writes remain blocked.

## Failures

${failureRows}

## Best Next Codex Prompt

\`\`\`text
${contract.bestNextCodexPrompt.prompt}
\`\`\`
`;
  fs.writeFileSync(reportPath, report);
  console.log(`Remote hosted resolver smoke execution harness: ${decision} remote_smoke_executed=false reason=missing_remote_endpoint_config`);
  if (failures.length) {
    console.error(failures);
    process.exit(1);
  }
}

main();
