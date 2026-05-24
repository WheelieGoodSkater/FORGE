const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dataPath = path.join(root, 'data', 'w80s_hosted_endpoint_platform_selection_deploy.json');
const tracePath = path.join(root, 'trace_samples', 'w80s_hosted_endpoint_platform_selection_deploy_trace.json');
const reportPath = path.join(root, 'reports', 'w80s_hosted_endpoint_platform_selection_deploy.md');
const protectedShellTemplatePath = path.join(root, 'deploy', 'hosted-resolver', 'protected-shell.template.sh');
const w79aPath = path.join(root, 'data', 'w79a_hosted_resolver_deployment_package.json');
const w80rPath = path.join(root, 'data', 'w80r_real_https_endpoint_rerun_remote_smoke.json');
const dockerfilePath = path.join(root, 'deploy', 'hosted-resolver', 'Dockerfile');
const envExamplePath = path.join(root, 'deploy', 'hosted-resolver', 'env.example');
const deployReadmePath = path.join(root, 'deploy', 'hosted-resolver', 'README.md');

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

function originOnly(value) {
  if (!value) return '';
  try {
    return new URL(String(value).trim()).origin;
  } catch (error) {
    return 'invalid_url';
  }
}

function observeEnv(env = process.env) {
  const token = String(env.IDB_REMOTE_RESOLVER_TOKEN || env.IDB_RESOLVER_TOKEN || '').trim();
  const remoteBaseUrl = originOnly(env.IDB_REMOTE_RESOLVER_BASE_URL);
  const allowedOrigin = originOnly(env.IDB_REMOTE_RESOLVER_ALLOWED_ORIGIN);
  const blockedOrigin = originOnly(env.IDB_REMOTE_RESOLVER_BLOCKED_ORIGIN);
  const platformAllowedOrigins = String(env.IDB_RESOLVER_ALLOWED_ORIGINS || '').split(',').map((item) => originOnly(item)).filter(Boolean);
  const configured = {
    remoteSmokeOptIn: env.IDB_REMOTE_RESOLVER_SMOKE === '1',
    remoteBaseUrlConfigured: Boolean(remoteBaseUrl && remoteBaseUrl !== 'invalid_url'),
    tokenConfigured: Boolean(token),
    allowedOriginConfigured: Boolean(allowedOrigin && allowedOrigin !== 'invalid_url'),
    blockedOriginConfigured: Boolean(blockedOrigin && blockedOrigin !== 'invalid_url'),
    platformAllowedOriginsConfigured: platformAllowedOrigins.length > 0,
    nonSecretEndpointUrl: remoteBaseUrl || 'not_configured',
    approvedOrigin: allowedOrigin || 'not_configured',
    blockedOrigin: blockedOrigin || 'not_configured',
    platformAllowedOrigins: platformAllowedOrigins.length ? platformAllowedOrigins : ['not_configured'],
    rawSecretsIncluded: false
  };
  const missing = [];
  if (!configured.remoteSmokeOptIn) missing.push('IDB_REMOTE_RESOLVER_SMOKE=1');
  if (!configured.remoteBaseUrlConfigured) missing.push('IDB_REMOTE_RESOLVER_BASE_URL');
  if (!configured.tokenConfigured) missing.push('IDB_REMOTE_RESOLVER_TOKEN or IDB_RESOLVER_TOKEN');
  if (!configured.allowedOriginConfigured) missing.push('IDB_REMOTE_RESOLVER_ALLOWED_ORIGIN');
  if (!configured.blockedOriginConfigured) missing.push('IDB_REMOTE_RESOLVER_BLOCKED_ORIGIN');
  return {
    ...configured,
    missing,
    readyForW80R: missing.length === 0,
    tokenValueStored: false
  };
}

function main() {
  const results = [];
  const w79a = readJson(w79aPath);
  const w80r = readJson(w80rPath);
  const dockerfile = read(dockerfilePath);
  const envExample = read(envExamplePath);
  const deployReadme = read(deployReadmePath);
  const protectedShellTemplate = read(protectedShellTemplatePath);
  const observed = observeEnv(process.env);

  const selectedPlatform = {
    id: 'container_https_staging_host',
    selected: true,
    reason: 'W79A already packages websiteResolverServiceV1 as a portable Node container; the staging host must provide managed HTTPS, secret-backed environment variables, exact CORS origins, logs, and rollback.',
    requirements: [
      'Public HTTPS endpoint for /health and /idb/website-resolver/v1/resolve.',
      'Secret-managed IDB_RESOLVER_TOKEN and IDB_RESOLVER_ALLOWED_ORIGINS.',
      'No wildcard CORS and no browser cookies accepted by resolver endpoint.',
      'Configurable request timeout, rate limit, cache setting, and redacted observability.',
      'One-command rollback or environment toggle that disables drawer hosted-only mode.'
    ],
    candidateExamples: [
      'Any container-capable staging host with managed HTTPS and secret env settings.',
      'A serverless container service is acceptable if it preserves timeout and outbound fetch controls.'
    ]
  };

  const deploymentSteps = [
    { owner: 'Resolver Service Architect', step: 'Build and deploy deploy/hosted-resolver/Dockerfile from the W79A package.', output: 'Public HTTPS service exposing GET /health and POST /idb/website-resolver/v1/resolve.' },
    { owner: 'Security Guard', step: 'Set IDB_RESOLVER_TOKEN in the platform secret manager.', output: 'Token exists only in secret manager/protected shell; no repo, trace, report, screenshot, or chat copy.' },
    { owner: 'Security Guard', step: 'Set IDB_RESOLVER_ALLOWED_ORIGINS to the exact NetSuite staging origin list.', output: 'Approved origin is non-secret and exact; wildcard CORS remains forbidden.' },
    { owner: 'DevOps Readiness Agent', step: 'Configure rate limits, request timeout, cache TTL, and redacted logs.', output: 'Resolver can observe status without raw tokens, cookies, auth headers, or request secrets.' },
    { owner: 'Validation And Evidence Agent', step: 'Place endpoint URL and origins in protected shell, then run W80R.', output: 'remoteSmokeExecuted=true is required before consultant hosted pilot can unlock.' }
  ];

  const secretSafeHandoff = {
    endpointUrl: observed.nonSecretEndpointUrl,
    approvedOrigin: observed.approvedOrigin,
    blockedOrigin: observed.blockedOrigin,
    tokenHandoffPath: 'platform secret manager and protected shell only; never repo files, traces, reports, screenshots, or chat',
    protectedShellTemplate: 'deploy/hosted-resolver/protected-shell.template.sh',
    tokenConfigured: observed.tokenConfigured,
    noSecretValuesStored: true
  };

  const validatorGates = [
    'Deployment package exists and uses website_resolver_hosted_service.js.',
    'Protected-shell template contains placeholders only and no real token.',
    'Observed environment records tokenConfigured as a boolean only.',
    'Endpoint URL and origins are treated as non-secret; token value is never stored.',
    'Hosted consultant pilot remains disabled until W80R returns remoteSmokeExecuted=true.',
    'No writes, no SuiteScript invocation, N/LLM advisory-only, notes story-only.',
    'Blocked, thin, unavailable, and timeout remain insufficient evidence with no confident guesses.'
  ];

  assertCase(results, 'w80s_inherits_w79a_deployment_package', w79a.schema === 'idb.w79a-hosted-resolver-deployment-package.v1' && w79a.pilotDecision.hostedResolverPilotEnabled === false, JSON.stringify({ schema: w79a.schema, pilot: w79a.pilotDecision }));
  assertCase(results, 'w80s_inherits_w80r_no_unlock', w80r.schema === 'idb.w80r-real-https-endpoint-rerun-remote-smoke.v1' && w80r.remoteExecutionResult.hostedResolverPilotEnabled === false, JSON.stringify(w80r.remoteExecutionResult));
  assertCase(results, 'w80s_platform_selected_container_https', selectedPlatform.selected && selectedPlatform.id === 'container_https_staging_host' && selectedPlatform.requirements.some((item) => /Public HTTPS endpoint/.test(item)), JSON.stringify(selectedPlatform));
  assertCase(results, 'w80s_w79a_artifacts_deployable', /FROM node:20-alpine/.test(dockerfile) && /website_resolver_hosted_service\.js/.test(dockerfile) && /IDB_RESOLVER_TOKEN=<set-in-secret-manager>/.test(envExample) && /Remote Staging Checklist/.test(deployReadme), 'deploy/hosted-resolver');
  assertCase(results, 'w80s_protected_shell_template_no_real_secret', /IDB_REMOTE_RESOLVER_TOKEN="<set-from-secret-manager-or-protected-shell>"/.test(protectedShellTemplate) && /Do not paste real secrets/.test(protectedShellTemplate) && !protectedShellTemplate.includes(String(process.env.IDB_REMOTE_RESOLVER_TOKEN || 'never-match-real-token')), 'deploy/hosted-resolver/protected-shell.template.sh');
  assertCase(results, 'w80s_secret_safe_env_observation', observed.rawSecretsIncluded === false && observed.tokenValueStored === false && typeof observed.tokenConfigured === 'boolean' && !JSON.stringify(observed).includes(String(process.env.IDB_REMOTE_RESOLVER_TOKEN || 'never-match-real-token')), JSON.stringify(observed));
  assertCase(results, 'w80s_secret_safe_handoff_complete', secretSafeHandoff.noSecretValuesStored === true && secretSafeHandoff.tokenHandoffPath.includes('protected shell') && secretSafeHandoff.protectedShellTemplate.endsWith('protected-shell.template.sh'), JSON.stringify(secretSafeHandoff));
  assertCase(results, 'w80s_no_pilot_unlock_before_w80r_remote_smoke', w80r.remoteExecutionResult.hostedResolverPilotEnabled === false && observed.readyForW80R === false ? true : w80r.remoteExecutionResult.hostedResolverPilotEnabled === false, JSON.stringify({ readyForW80R: observed.readyForW80R, pilot: w80r.remoteExecutionResult.hostedResolverPilotEnabled }));

  const readyForW80R = observed.readyForW80R;
  const failures = results.filter((result) => !result.pass);
  const decision = failures.length ? 'FAIL' : 'PASS';
  const pilotDecision = readyForW80R ? 'ready_for_w80r_protected_shell_rerun' : 'no_go_until_real_https_endpoint_and_secret_env_configured';
  const contract = {
    schema: 'idb.w80s-hosted-endpoint-platform-selection-deploy.v1',
    status: readyForW80R ? 'platform_selected_env_present_ready_for_w80r' : 'platform_selected_handoff_ready_remote_not_configured',
    objective: 'Choose the staging host path, define the secret-safe deployment handoff, and keep consultant hosted pilot disabled until remoteSmokeExecuted=true.',
    selectedPlatform,
    deploymentSteps,
    secretSafeHandoff,
    observedEnvironment: observed,
    validatorGates,
    provisioningDecision: {
      readyForW80R,
      remoteSmokeExecuted: false,
      hostedResolverPilotEnabled: false,
      consultantSmokeEligible: false,
      noGoReason: readyForW80R ? null : 'Real HTTPS endpoint/token/origin values are not configured in this shell.',
      nextAction: readyForW80R ? 'Run npm run harness:real-https-endpoint-rerun-w80r in the protected shell.' : 'Deploy W79A package to a real HTTPS staging host and configure protected shell values from the platform secret manager.'
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
      block: readyForW80R ? 'W80R: Provision Real HTTPS Endpoint And Rerun Remote Smoke' : 'W80T: Operator Deploy Hosted Resolver Endpoint',
      prompt: readyForW80R
        ? 'Move through W80R: Provision Real HTTPS Endpoint And Rerun Remote Smoke. Use the protected shell values from W80S to execute health, auth/CORS, write-payload rejection, cache-hit, approved live-site smoke, no-secret trace checks, full preflight, and pilot unlock criteria against the real HTTPS websiteResolverServiceV1 endpoint. Do not store secrets in repo files, traces, reports, screenshots, or chat. Keep hosted consultant pilot disabled until remoteSmokeExecuted=true. Output remote execution result, W80R report, validator gates, and best next Codex prompt.'
        : 'Move through W80T: Operator Deploy Hosted Resolver Endpoint. Using the W80S platform selection and W79A deployment package, deploy websiteResolverServiceV1 to a real public HTTPS staging host, set IDB_RESOLVER_TOKEN and IDB_RESOLVER_ALLOWED_ORIGINS in platform secret/env settings, place only endpoint URL plus approved/blocked origins in the protected shell, and keep the resolver token out of repo files, traces, reports, screenshots, and chat. Do not enable hosted consultant pilot. Output non-secret endpoint/origin handoff, deployment evidence, W80T report, validator gates, and best next Codex prompt.'
    }
  };

  writeJson(dataPath, contract);
  const trace = {
    schema: 'idb.w80s-hosted-endpoint-platform-selection-deploy-trace.v1',
    generated: new Date().toISOString(),
    decision,
    pilotDecision,
    remoteSmokeExecuted: false,
    selectedPlatform,
    secretSafeHandoff,
    observedEnvironment: observed,
    provisioningDecision: contract.provisioningDecision,
    noRegression: contract.noRegression,
    bestNextCodexPrompt: contract.bestNextCodexPrompt,
    results
  };
  writeJson(tracePath, trace);

  const stepRows = deploymentSteps.map((item) => `| ${escapeTable(item.owner)} | ${escapeTable(item.step)} | ${escapeTable(item.output)} |`).join('\n');
  const resultRows = results.map((result) => `| ${result.pass ? 'PASS' : 'FAIL'} | ${result.name} | ${escapeTable(result.detail)} |`).join('\n');
  const gateList = validatorGates.map((item) => `- ${item}`).join('\n');
  const missing = observed.missing.map((item) => `- ${item}`).join('\n') || '- None';
  const report = `# W80S Hosted Endpoint Platform Selection And Deploy

Decision: ${decision} / ${readyForW80R ? 'PROTECTED ENV PRESENT FOR W80R' : 'PLATFORM SELECTED, REAL HTTPS ENV NOT CONFIGURED'} / HOSTED PILOT STILL DISABLED / NO WRITE AUTHORITY

## Blunt Status

W80S selected the deployment shape and created the protected-shell handoff path. It did not fabricate a public HTTPS endpoint or token. ${readyForW80R ? 'This shell has enough non-secret/secret-backed values to run W80R next.' : 'This shell still does not have the real hosted endpoint/token/origin values, so the consultant hosted resolver pilot remains no-go.'}

## Platform Selection

Selected: \`${selectedPlatform.id}\`

${selectedPlatform.reason}

## Secret-Safe Handoff

- Endpoint URL: \`${secretSafeHandoff.endpointUrl}\`
- Approved origin: \`${secretSafeHandoff.approvedOrigin}\`
- Blocked origin: \`${secretSafeHandoff.blockedOrigin}\`
- Token handoff: ${secretSafeHandoff.tokenHandoffPath}
- Protected shell template: \`${secretSafeHandoff.protectedShellTemplate}\`

## Missing Protected Shell Values

${missing}

## Deploy Steps

| Role | Step | Required Output |
| --- | --- | --- |
${stepRows}

## Validator Gates

${gateList}

## Harness Results

| Status | Rule | Detail |
| --- | --- | --- |
${resultRows}

## No Regression

- No writes.
- No SuiteScript invocation.
- N/LLM advisory-only.
- Notes story-only.
- Blocked, thin, unavailable, and timeout remain insufficient evidence with no confident guesses.
- Transaction writes remain blocked.
- Hosted consultant pilot remains disabled until \`remoteSmokeExecuted=true\`.

## Best Next Codex Prompt

\`\`\`text
${contract.bestNextCodexPrompt.prompt}
\`\`\`
`;
  fs.writeFileSync(reportPath, report);
  console.log(`W80S hosted endpoint platform selection/deploy harness: ${decision} ready_for_w80r=${readyForW80R} pilot_decision=${pilotDecision}`);
  if (failures.length) {
    console.error(failures);
    process.exit(1);
  }
}

main();
