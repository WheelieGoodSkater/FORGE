const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const w79aPath = path.join(root, 'data', 'w79a_hosted_resolver_deployment_package.json');
const dataPath = path.join(root, 'data', 'w79b_hosted_resolver_staging_provisioning.json');
const tracePath = path.join(root, 'trace_samples', 'w79b_hosted_resolver_staging_provisioning_trace.json');
const reportPath = path.join(root, 'reports', 'w79b_hosted_resolver_staging_provisioning.md');
const deployReadmePath = path.join(root, 'deploy', 'hosted-resolver', 'README.md');
const envExamplePath = path.join(root, 'deploy', 'hosted-resolver', 'env.example');

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function readJson(file) {
  return JSON.parse(read(file));
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

function hasValue(value) {
  return Boolean(String(value || '').trim());
}

function safeUrlSummary(value) {
  const raw = String(value || '').trim();
  if (!raw) return { configured: false, https: false, redacted: '' };
  try {
    const parsed = new URL(raw);
    parsed.username = '';
    parsed.password = '';
    parsed.search = '';
    parsed.hash = '';
    return {
      configured: true,
      https: parsed.protocol === 'https:',
      redacted: parsed.origin,
      pathConfigured: Boolean(parsed.pathname && parsed.pathname !== '/')
    };
  } catch (error) {
    return { configured: true, https: false, redacted: 'invalid_url', error: error.message };
  }
}

function originSummary(value) {
  const raw = String(value || '').trim();
  if (!raw) return { configured: false, https: false, exact: false, redacted: '' };
  try {
    const parsed = new URL(raw);
    return {
      configured: true,
      https: parsed.protocol === 'https:',
      exact: !raw.includes('*') && !parsed.pathname.replace(/\//g, '') && !parsed.search && !parsed.hash,
      redacted: parsed.origin
    };
  } catch (error) {
    return { configured: true, https: false, exact: false, redacted: 'invalid_origin', error: error.message };
  }
}

function inspectProvisioningEnv(env = process.env) {
  const remoteBaseUrl = safeUrlSummary(env.IDB_REMOTE_RESOLVER_BASE_URL);
  const remoteTokenConfigured = hasValue(env.IDB_REMOTE_RESOLVER_TOKEN);
  const remoteAllowedOrigin = originSummary(env.IDB_REMOTE_RESOLVER_ALLOWED_ORIGIN);
  const remoteBlockedOrigin = originSummary(env.IDB_REMOTE_RESOLVER_BLOCKED_ORIGIN);
  const remoteSmokeOptIn = env.IDB_REMOTE_RESOLVER_SMOKE === '1';
  const runtimeTokenConfigured = hasValue(env.IDB_RESOLVER_TOKEN);
  const runtimeAllowedOriginsConfigured = hasValue(env.IDB_RESOLVER_ALLOWED_ORIGINS);
  const runtimeAllowedOrigins = String(env.IDB_RESOLVER_ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
    .map(originSummary);
  const requiredMissing = [];
  if (!remoteBaseUrl.configured) requiredMissing.push('IDB_REMOTE_RESOLVER_BASE_URL');
  if (!remoteTokenConfigured) requiredMissing.push('IDB_REMOTE_RESOLVER_TOKEN');
  if (!remoteAllowedOrigin.configured) requiredMissing.push('IDB_REMOTE_RESOLVER_ALLOWED_ORIGIN');
  if (!remoteBlockedOrigin.configured) requiredMissing.push('IDB_REMOTE_RESOLVER_BLOCKED_ORIGIN');
  if (!remoteSmokeOptIn) requiredMissing.push('IDB_REMOTE_RESOLVER_SMOKE=1');

  const provisionable = requiredMissing.length === 0
    && remoteBaseUrl.https
    && remoteAllowedOrigin.https
    && remoteAllowedOrigin.exact
    && remoteBlockedOrigin.https
    && remoteBlockedOrigin.exact
    && remoteAllowedOrigin.redacted !== remoteBlockedOrigin.redacted;

  return {
    remoteBaseUrl,
    remoteTokenConfigured,
    remoteAllowedOrigin,
    remoteBlockedOrigin,
    remoteSmokeOptIn,
    runtimeTokenConfigured,
    runtimeAllowedOriginsConfigured,
    runtimeAllowedOrigins,
    requiredMissing,
    provisionable,
    rawSecretsIncluded: false
  };
}

function main() {
  const w79a = readJson(w79aPath);
  const deployReadme = read(deployReadmePath);
  const envExample = read(envExamplePath);
  const observed = inspectProvisioningEnv(process.env);
  const results = [];

  const provisioningStatus = observed.provisionable
    ? 'operator_env_present_ready_for_remote_smoke'
    : 'blocked_operator_env_missing';
  const remoteSmokeExecutable = observed.provisionable;

  const contract = {
    schema: 'idb.w79b-hosted-resolver-staging-provisioning.v1',
    status: provisioningStatus,
    objective: 'Provision or identify the real HTTPS staging websiteResolverServiceV1 endpoint and prepare secret-safe remote smoke.',
    sourceDecision: {
      priorBlock: 'W79A: Hosted Resolver Deployment Package',
      priorStatus: w79a.status,
      hostedResolverPilotEnabled: false
    },
    provisioningEvidence: {
      deploymentPackageReady: w79a.status === 'deployment_package_ready_hosted_pilot_still_no_go',
      endpointIdentified: observed.remoteBaseUrl.configured,
      endpointHttps: observed.remoteBaseUrl.https,
      tokenConfigured: observed.remoteTokenConfigured,
      approvedOriginConfigured: observed.remoteAllowedOrigin.configured,
      blockedOriginConfigured: observed.remoteBlockedOrigin.configured,
      remoteSmokeOptIn: observed.remoteSmokeOptIn,
      noSecretValuesStored: true,
      observedEnvironment: observed
    },
    runtimeEnvHandoff: [
      { env: 'IDB_RESOLVER_TOKEN', secret: true, owner: 'Security Guard', purpose: 'Runtime service token in hosted platform secret manager.', status: observed.runtimeTokenConfigured ? 'configured_in_operator_env' : 'required_in_hosted_platform' },
      { env: 'IDB_RESOLVER_ALLOWED_ORIGINS', secret: false, owner: 'Security Guard', purpose: 'Exact NetSuite staging origins for hosted service CORS.', status: observed.runtimeAllowedOriginsConfigured ? 'configured_in_operator_env' : 'required_in_hosted_platform' },
      { env: 'IDB_RESOLVER_RATE_TOKEN_PER_MINUTE', secret: false, owner: 'Resolver Service Architect', purpose: 'Per-token rate limit.', status: 'default_12_unless_overridden' },
      { env: 'IDB_RESOLVER_RATE_DOMAIN_PER_MINUTE', secret: false, owner: 'Resolver Service Architect', purpose: 'Per-domain rate limit.', status: 'default_6_unless_overridden' }
    ],
    remoteSmokeEnvHandoff: [
      { env: 'IDB_REMOTE_RESOLVER_SMOKE=1', secret: false, owner: 'Regression Guard Agent', purpose: 'Explicit opt-in for remote smoke execution.', configured: observed.remoteSmokeOptIn },
      { env: 'IDB_REMOTE_RESOLVER_BASE_URL', secret: false, owner: 'Resolver Service Architect', purpose: 'Public HTTPS staging endpoint base URL.', configured: observed.remoteBaseUrl.configured },
      { env: 'IDB_REMOTE_RESOLVER_TOKEN', secret: true, owner: 'Security Guard', purpose: 'Remote smoke token, provided from protected shell only.', configured: observed.remoteTokenConfigured },
      { env: 'IDB_REMOTE_RESOLVER_ALLOWED_ORIGIN', secret: false, owner: 'Security Guard', purpose: 'Exact approved NetSuite staging origin.', configured: observed.remoteAllowedOrigin.configured },
      { env: 'IDB_REMOTE_RESOLVER_BLOCKED_ORIGIN', secret: false, owner: 'Security Guard', purpose: 'HTTPS negative-test origin not in CORS allowlist.', configured: observed.remoteBlockedOrigin.configured }
    ],
    remoteEndpointReadinessChecklist: [
      'Deploy W79A package to an HTTPS staging host.',
      'Set IDB_RESOLVER_TOKEN in platform secret manager only.',
      'Set IDB_RESOLVER_ALLOWED_ORIGINS to exact NetSuite staging origin only.',
      'Confirm GET /health returns writeAuthority none, suiteScriptInvocation false, and nllmAdvisoryOnly true.',
      'Confirm OPTIONS preflight echoes approved origin and rejects blocked origin.',
      'Confirm POST without token returns 401 before fetch.',
      'Confirm POST with NetSuite cookie or Authorization header returns 400 before fetch.',
      'Confirm write-shaped payload returns 400 before fetch.',
      'Confirm second eligible resolve returns cacheHit true.',
      'Confirm logs/traces contain tokenConfigured booleans only and no raw token/header/cookie values.'
    ],
    provisioningDecision: {
      remoteSmokeExecutable,
      remoteSmokeExecuted: false,
      hostedResolverPilotEnabled: false,
      consultantSmokeEligible: false,
      decision: remoteSmokeExecutable ? 'ready_to_run_w80_remote_smoke' : 'no_go_operator_env_missing',
      missing: observed.requiredMissing
    },
    noRegression: {
      writeAuthority: 'none',
      suiteScriptInvocation: false,
      nllmAdvisoryOnly: true,
      notesCannotOwnIdentification: true,
      blockedThinUnavailableTimeoutDoNotGuess: true,
      transactionWriteEnabled: false,
      hostedResolverPilotEnabled: false
    },
    bestNextCodexPrompt: {
      block: 'W80: Execute Hosted Resolver Remote Smoke',
      prompt: 'Move through W80: Execute Hosted Resolver Remote Smoke. With W79B provisioning values present in a protected shell, run the real HTTPS staging websiteResolverServiceV1 remote smoke against IDB_REMOTE_RESOLVER_BASE_URL using the secret token and exact CORS origins. Execute health, auth/CORS, write-payload rejection, cache-hit, approved live-site smoke, no-secret trace checks, observability redaction checks, and rollback switch verification. Keep drawer and SuiteScript write-disabled, preserve N/LLM advisory-only, notes story-only, and blocked/thin/unavailable/timeout as insufficient evidence with no confident guesses. Output executed remote smoke results with remoteSmokeExecuted true or exact no-go reason, W80 report, validator gates, and best next Codex prompt.'
    }
  };
  writeJson(dataPath, contract);

  assertCase(results, 'w79b_inherits_w79a_deploy_package', w79a.schema === 'idb.w79a-hosted-resolver-deployment-package.v1' && w79a.status === 'deployment_package_ready_hosted_pilot_still_no_go' && w79a.pilotDecision.hostedResolverPilotEnabled === false, JSON.stringify(w79a.pilotDecision));
  assertCase(results, 'w79b_deploy_runbook_and_env_template_present', /Remote Staging Checklist/.test(deployReadme) && /IDB_RESOLVER_TOKEN=<set-in-secret-manager>/.test(envExample) && /Do not commit real secrets/.test(envExample), 'deploy/hosted-resolver');
  assertCase(results, 'w79b_secret_safe_env_observation', observed.rawSecretsIncluded === false && observed.remoteTokenConfigured === hasValue(process.env.IDB_REMOTE_RESOLVER_TOKEN) && !JSON.stringify(observed).includes(String(process.env.IDB_REMOTE_RESOLVER_TOKEN || 'never-match-real-token')), JSON.stringify(observed));
  assertCase(results, 'w79b_remote_smoke_env_contract_complete', contract.remoteSmokeEnvHandoff.length === 5 && contract.remoteSmokeEnvHandoff.some((item) => item.env === 'IDB_REMOTE_RESOLVER_TOKEN' && item.secret === true) && contract.remoteSmokeEnvHandoff.some((item) => item.env === 'IDB_REMOTE_RESOLVER_BASE_URL'), JSON.stringify(contract.remoteSmokeEnvHandoff));
  assertCase(results, 'w79b_runtime_env_handoff_complete', contract.runtimeEnvHandoff.some((item) => item.env === 'IDB_RESOLVER_TOKEN' && item.secret === true) && contract.runtimeEnvHandoff.some((item) => item.env === 'IDB_RESOLVER_ALLOWED_ORIGINS'), JSON.stringify(contract.runtimeEnvHandoff));
  assertCase(results, 'w79b_remote_endpoint_readiness_checklist_complete', contract.remoteEndpointReadinessChecklist.length >= 10 && contract.remoteEndpointReadinessChecklist.some((item) => /write-shaped payload/.test(item)) && contract.remoteEndpointReadinessChecklist.some((item) => /cacheHit true/.test(item)) && contract.remoteEndpointReadinessChecklist.some((item) => /no raw token/.test(item)), JSON.stringify(contract.remoteEndpointReadinessChecklist));
  assertCase(results, 'w79b_no_pilot_unlock_before_remote_smoke', contract.provisioningDecision.remoteSmokeExecuted === false && contract.provisioningDecision.hostedResolverPilotEnabled === false && contract.provisioningDecision.consultantSmokeEligible === false, JSON.stringify(contract.provisioningDecision));
  assertCase(results, 'w79b_no_regression_boundaries_present', contract.noRegression.writeAuthority === 'none' && contract.noRegression.suiteScriptInvocation === false && contract.noRegression.nllmAdvisoryOnly === true && contract.noRegression.notesCannotOwnIdentification === true && contract.noRegression.hostedResolverPilotEnabled === false, JSON.stringify(contract.noRegression));
  assertCase(results, 'w79b_best_next_prompt_present', contract.bestNextCodexPrompt.block === 'W80: Execute Hosted Resolver Remote Smoke' && /Move through W80/.test(contract.bestNextCodexPrompt.prompt) && /remoteSmokeExecuted true or exact no-go reason/.test(contract.bestNextCodexPrompt.prompt), contract.bestNextCodexPrompt.prompt);

  const failures = results.filter((result) => !result.pass);
  const decision = failures.length ? 'FAIL' : 'PASS';
  const trace = {
    schema: 'idb.w79b-hosted-resolver-staging-provisioning-trace.v1',
    generated: new Date().toISOString(),
    decision,
    provisioningStatus,
    remoteSmokeExecutable,
    remoteSmokeExecuted: false,
    hostedResolverPilotEnabled: false,
    provisioningEvidence: contract.provisioningEvidence,
    runtimeEnvHandoff: contract.runtimeEnvHandoff,
    remoteSmokeEnvHandoff: contract.remoteSmokeEnvHandoff,
    remoteEndpointReadinessChecklist: contract.remoteEndpointReadinessChecklist,
    provisioningDecision: contract.provisioningDecision,
    noRegression: contract.noRegression,
    bestNextCodexPrompt: contract.bestNextCodexPrompt,
    results
  };
  writeJson(tracePath, trace);

  const rows = results.map((result) => `| ${result.pass ? 'PASS' : 'FAIL'} | ${result.name} | ${escapeTable(result.detail)} |`).join('\n');
  const runtimeRows = contract.runtimeEnvHandoff.map((item) => `| ${escapeTable(item.owner)} | ${escapeTable(item.env)} | ${item.secret ? 'yes' : 'no'} | ${escapeTable(item.status)} | ${escapeTable(item.purpose)} |`).join('\n');
  const smokeRows = contract.remoteSmokeEnvHandoff.map((item) => `| ${escapeTable(item.owner)} | ${escapeTable(item.env)} | ${item.secret ? 'yes' : 'no'} | ${item.configured ? 'yes' : 'no'} | ${escapeTable(item.purpose)} |`).join('\n');
  const failureRows = failures.map((result) => `- ${result.name}: ${result.detail}`).join('\n') || '- None';
  const report = `# W79B Hosted Resolver Staging Provisioning

Decision: ${decision} / ${provisioningStatus} / HOSTED PILOT STILL NO-GO / NO WRITE AUTHORITY

## Objective

Provision or identify the real HTTPS staging \`websiteResolverServiceV1\` endpoint and prepare secret-safe remote smoke.

## Current Position

${remoteSmokeExecutable ? 'Operator remote smoke environment is present. W80 may execute real remote smoke next.' : 'No real hosted endpoint/token/origin set is available in this shell. I did not invent one, did not store secrets, and did not enable hosted consultant pilot traffic.'}

## Runtime Env Handoff

| Owner | Env | Secret | Status | Purpose |
| --- | --- | --- | --- | --- |
${runtimeRows}

## Remote Smoke Env Handoff

| Owner | Env | Secret | Configured | Purpose |
| --- | --- | --- | --- | --- |
${smokeRows}

## Remote Endpoint Readiness Checklist

${contract.remoteEndpointReadinessChecklist.map((item) => `- ${item}`).join('\n')}

## Provisioning Decision

- Remote smoke executable: ${remoteSmokeExecutable ? 'yes' : 'no'}
- Remote smoke executed: no
- Hosted resolver pilot enabled: no
- Consultant smoke eligible: no
- Missing: ${contract.provisioningDecision.missing.length ? contract.provisioningDecision.missing.join(', ') : 'None'}

## Harness Gates

| Status | Rule | Detail |
| --- | --- | --- |
${rows}

## No Regression

- No writes.
- No SuiteScript invocation.
- N/LLM advisory-only.
- Notes story-only.
- Blocked, thin, unavailable, and timeout remain insufficient evidence with no confident guesses.
- Transaction writes remain blocked.
- Hosted consultant pilot remains disabled until \`remoteSmokeExecuted=true\`.

## Failures

${failureRows}

## Best Next Codex Prompt

\`\`\`text
${contract.bestNextCodexPrompt.prompt}
\`\`\`
`;
  fs.writeFileSync(reportPath, report);
  console.log(`W79B hosted resolver staging provisioning harness: ${decision} provisioning_status=${provisioningStatus} remote_smoke_executable=${remoteSmokeExecutable}`);
  if (failures.length) {
    console.error(failures);
    process.exit(1);
  }
}

main();
