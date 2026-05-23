const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const contractPath = path.join(root, 'data', 'w73r_execute_remote_hosted_resolver_smoke_with_config.json');
const w73TracePath = path.join(root, 'trace_samples', 'w73_remote_hosted_resolver_smoke_execution_trace.json');
const w72TracePath = path.join(root, 'trace_samples', 'w72_remote_resolver_deployment_readiness_gate_trace.json');
const approvedLiveTracePath = path.join(root, 'trace_samples', 'w65_approved_live_resolver_smoke_trace.json');
const tracePath = path.join(root, 'trace_samples', 'w73r_execute_remote_hosted_resolver_smoke_with_config_trace.json');
const reportPath = path.join(root, 'reports', 'w73r_execute_remote_hosted_resolver_smoke_with_config.md');

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

function validateRemoteBaseUrl(value) {
  const raw = String(value || '').trim().replace(/\/+$/, '');
  if (!raw) return { ok: false, reason: 'missing_remote_base_url' };
  let parsed;
  try {
    parsed = new URL(raw);
  } catch (error) {
    return { ok: false, reason: `invalid_remote_base_url:${error.message}` };
  }
  if (parsed.protocol !== 'https:') return { ok: false, reason: 'remote_base_url_must_use_https' };
  if (/^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(parsed.hostname)) {
    return { ok: false, reason: 'remote_base_url_must_not_be_private_or_localhost' };
  }
  return { ok: true, safeBaseUrl: parsed.toString().replace(/\/+$/, '') };
}

function runNodeHarness(script, extraEnv) {
  const result = spawnSync(process.execPath, [script], {
    cwd: root,
    env: { ...process.env, ...extraEnv },
    encoding: 'utf8'
  });
  return {
    status: result.status,
    signal: result.signal,
    stdout: result.stdout,
    stderr: result.stderr
  };
}

function newestJsonOrNull(file) {
  if (!fs.existsSync(file)) return null;
  return readJson(file);
}

function main() {
  const contract = readJson(contractPath);
  const w73 = newestJsonOrNull(w73TracePath);
  const observedEnv = envState();
  const baseUrlValidation = validateRemoteBaseUrl(process.env.IDB_REMOTE_RESOLVER_BASE_URL);
  const remoteConfigReady = observedEnv.remoteSmokeOptIn
    && observedEnv.baseUrlConfigured
    && observedEnv.tokenConfigured
    && observedEnv.allowedOriginConfigured
    && observedEnv.blockedOriginConfigured
    && baseUrlValidation.ok;
  const results = [];
  let remoteReadinessRun = null;
  let approvedLiveRun = null;
  let w72AfterRun = newestJsonOrNull(w72TracePath);
  let approvedLiveAfterRun = newestJsonOrNull(approvedLiveTracePath);

  assertCase(results, 'w73r_contract_schema_present', contract.schema === 'idb.w73r-execute-remote-hosted-resolver-smoke-with-config.v1', contract.schema);
  assertCase(results, 'w73r_execution_rules_prevent_fake_remote_smoke', contract.executionRules.some((item) => /Do not use local staging/.test(item)) && contract.executionRules.some((item) => /Do not include raw resolver token/.test(item)), JSON.stringify(contract.executionRules));
  assertCase(results, 'w73r_required_env_present', contract.requiredEnvironment.some((item) => /IDB_REMOTE_RESOLVER_BASE_URL/.test(item)) && contract.requiredEnvironment.some((item) => /IDB_REMOTE_RESOLVER_TOKEN/.test(item)) && contract.requiredEnvironment.some((item) => /IDB_REMOTE_RESOLVER_ALLOWED_ORIGIN/.test(item)), JSON.stringify(contract.requiredEnvironment));
  assertCase(results, 'w73r_command_pack_present', /run_remote_resolver_deployment_readiness_gate_harness\.js/.test(contract.commandPack.remoteReadinessSmoke) && /run_approved_live_resolver_smoke_harness\.js/.test(contract.commandPack.approvedLiveSmoke), JSON.stringify(contract.commandPack));
  assertCase(results, 'w73r_inherits_w73_honest_gate', w73 && w73.decision === 'PASS' && w73.remoteSmokeExecuted === false, JSON.stringify(w73 && { decision: w73.decision, remoteSmokeExecuted: w73.remoteSmokeExecuted, blockedReason: w73.blockedReason }));
  assertCase(results, 'w73r_remote_env_observed_without_secrets', observedEnv.rawSecretsIncluded === false && typeof observedEnv.tokenConfigured === 'boolean', JSON.stringify(observedEnv));

  if (remoteConfigReady) {
    remoteReadinessRun = runNodeHarness('tools/run_remote_resolver_deployment_readiness_gate_harness.js', {
      IDB_REMOTE_RESOLVER_SMOKE: '1'
    });
    w72AfterRun = newestJsonOrNull(w72TracePath);
    approvedLiveRun = runNodeHarness('tools/run_approved_live_resolver_smoke_harness.js', {
      IDB_APPROVED_LIVE_RESOLVER_SMOKE: '1',
      IDB_RESOLVER_STAGING_URL: process.env.IDB_REMOTE_RESOLVER_BASE_URL,
      IDB_RESOLVER_STAGING_TOKEN: process.env.IDB_REMOTE_RESOLVER_TOKEN,
      IDB_RESOLVER_ALLOWED_ORIGIN: process.env.IDB_REMOTE_RESOLVER_ALLOWED_ORIGIN
    });
    approvedLiveAfterRun = newestJsonOrNull(approvedLiveTracePath);
    assertCase(results, 'w73r_remote_readiness_smoke_executed', remoteReadinessRun.status === 0 && w72AfterRun && w72AfterRun.remoteSmokeMode === 'executed_against_remote_endpoint', JSON.stringify({ status: remoteReadinessRun.status, mode: w72AfterRun && w72AfterRun.remoteSmokeMode }));
    assertCase(results, 'w73r_remote_health_auth_cors_cache_passed', w72AfterRun && w72AfterRun.remoteSmoke && w72AfterRun.remoteSmoke.healthStatus === 200 && w72AfterRun.remoteSmoke.approvedPreflightStatus === 204 && w72AfterRun.remoteSmoke.blockedPreflightStatus === 403 && w72AfterRun.remoteSmoke.missingTokenStatus === 401 && w72AfterRun.remoteSmoke.writePayloadStatus === 400 && w72AfterRun.remoteSmoke.secondCacheHit === true, JSON.stringify(w72AfterRun && w72AfterRun.remoteSmoke));
    assertCase(results, 'w73r_approved_live_smoke_executed', approvedLiveRun.status === 0 && approvedLiveAfterRun && approvedLiveAfterRun.decision === 'PASS', JSON.stringify({ status: approvedLiveRun.status, decision: approvedLiveAfterRun && approvedLiveAfterRun.decision }));
  } else {
    assertCase(results, 'w73r_remote_config_missing_blocks_execution', !remoteConfigReady, JSON.stringify({ observedEnv, baseUrlValidation }));
  }

  assertCase(results, 'w73r_required_remote_results_guarded', contract.requiredRemoteResults.some((item) => /zero false-confident-wrong/.test(item)) && contract.requiredRemoteResults.some((item) => /zero unsupported claims/.test(item)) && contract.requiredRemoteResults.some((item) => /timeout states remain insufficient evidence/.test(item)), JSON.stringify(contract.requiredRemoteResults));
  assertCase(results, 'w73r_pilot_go_no_go_present', contract.pilotGoNoGo.currentDecision === 'no_go_until_real_remote_smoke_passes' && contract.pilotGoNoGo.noGoIf.includes('Remote endpoint config is missing.'), JSON.stringify(contract.pilotGoNoGo));
  assertCase(results, 'w73r_no_regression_boundaries_present', contract.noRegression.writeAuthority === 'none' && contract.noRegression.suiteScriptInvocation === false && contract.noRegression.nllmAdvisoryOnly === true && contract.noRegression.notesCannotOwnIdentification === true && contract.noRegression.transactionWriteEnabled === false, JSON.stringify(contract.noRegression));
  assertCase(results, 'w73r_best_next_prompt_present', contract.bestNextCodexPrompt.block === 'W74: Remote Resolver Pilot Toggle Decision And Consultant Smoke' && /Move through W74/.test(contract.bestNextCodexPrompt.prompt), contract.bestNextCodexPrompt.prompt);

  const failures = results.filter((result) => !result.pass);
  const remoteSmokeExecuted = remoteConfigReady && remoteReadinessRun && remoteReadinessRun.status === 0 && approvedLiveRun && approvedLiveRun.status === 0;
  const decision = failures.length ? 'FAIL' : 'PASS';
  const pilotDecision = remoteSmokeExecuted ? 'go_if_all_remote_trace_gates_remain_green' : 'no_go_remote_config_missing';
  const trace = {
    schema: 'idb.w73r-execute-remote-hosted-resolver-smoke-with-config-trace.v1',
    generated: new Date().toISOString(),
    decision,
    remoteSmokeExecuted,
    blockedReason: remoteSmokeExecuted ? null : 'missing_or_invalid_remote_endpoint_config',
    pilotDecision,
    inheritedW73Decision: w73 && w73.decision,
    environmentObserved: observedEnv,
    baseUrlValidation: {
      ok: baseUrlValidation.ok,
      reason: baseUrlValidation.reason || null,
      safeBaseUrlConfigured: Boolean(baseUrlValidation.safeBaseUrl)
    },
    remoteReadinessRun: remoteReadinessRun ? {
      status: remoteReadinessRun.status,
      signal: remoteReadinessRun.signal,
      stdoutSummary: remoteReadinessRun.stdout.split('\n').filter(Boolean).slice(-3),
      stderrSummary: remoteReadinessRun.stderr.split('\n').filter(Boolean).slice(-3)
    } : null,
    approvedLiveRun: approvedLiveRun ? {
      status: approvedLiveRun.status,
      signal: approvedLiveRun.signal,
      stdoutSummary: approvedLiveRun.stdout.split('\n').filter(Boolean).slice(-3),
      stderrSummary: approvedLiveRun.stderr.split('\n').filter(Boolean).slice(-3)
    } : null,
    w72RemoteSmoke: w72AfterRun ? w72AfterRun.remoteSmoke : null,
    approvedLiveDecision: approvedLiveAfterRun ? approvedLiveAfterRun.decision : null,
    requiredRemoteResults: contract.requiredRemoteResults,
    pilotGoNoGo: contract.pilotGoNoGo,
    noRegression: contract.noRegression,
    bestNextCodexPrompt: contract.bestNextCodexPrompt,
    results
  };
  fs.writeFileSync(tracePath, `${JSON.stringify(trace, null, 2)}\n`);

  const rows = results.map((result) => `| ${result.pass ? 'PASS' : 'FAIL'} | ${result.name} | ${escapeTable(result.detail)} |`).join('\n');
  const failureRows = failures.map((result) => `- ${result.name}: ${result.detail}`).join('\n') || '- None';
  const report = `# W73R Execute Remote Hosted Resolver Smoke With Config

Decision: ${decision} / ${remoteSmokeExecuted ? 'REMOTE SMOKE EXECUTED' : 'REMOTE SMOKE NOT EXECUTED'} / ${pilotDecision} / NO WRITE AUTHORITY

## Objective

Run the W72/W73 remote smoke command pack against the real hosted \`websiteResolverServiceV1\` URL when the required endpoint configuration is present.

## Execution Result

${remoteSmokeExecuted ? 'The remote hosted resolver smoke ran against the configured endpoint. Review the trace for health, auth/CORS, write-payload rejection, cache-hit, approved live-site smoke, and pilot go/no-go evidence.' : 'Remote smoke did not execute because the configured remote endpoint environment is missing or invalid in this workspace. This is a hard pilot no-go, not a passed remote smoke.'}

## Required Environment

${contract.requiredEnvironment.map((item) => `- \`${item}\``).join('\n')}

## Observed Environment

- Remote smoke opt-in: \`${observedEnv.remoteSmokeOptIn}\`
- Base URL configured: \`${observedEnv.baseUrlConfigured}\`
- Token configured: \`${observedEnv.tokenConfigured}\`
- Allowed origin configured: \`${observedEnv.allowedOriginConfigured}\`
- Blocked origin configured: \`${observedEnv.blockedOriginConfigured}\`
- Base URL valid: \`${baseUrlValidation.ok}\`
- Raw secrets included in report: \`false\`

## Harness Gates

| Status | Rule | Detail |
| --- | --- | --- |
${rows}

## Pilot Go / No-Go

Current decision: \`${pilotDecision}\`

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
  console.log(`W73R remote hosted resolver smoke with config harness: ${decision} remote_smoke_executed=${remoteSmokeExecuted} pilot_decision=${pilotDecision}`);
  if (failures.length) {
    console.error(failures);
    process.exit(1);
  }
}

main();
