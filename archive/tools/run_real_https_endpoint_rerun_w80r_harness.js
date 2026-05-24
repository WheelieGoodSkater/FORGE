const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const w80Path = path.join(root, 'data', 'w80_execute_hosted_resolver_remote_smoke.json');
const w80TracePath = path.join(root, 'trace_samples', 'w80_execute_hosted_resolver_remote_smoke_trace.json');
const dataPath = path.join(root, 'data', 'w80r_real_https_endpoint_rerun_remote_smoke.json');
const tracePath = path.join(root, 'trace_samples', 'w80r_real_https_endpoint_rerun_remote_smoke_trace.json');
const reportPath = path.join(root, 'reports', 'w80r_real_https_endpoint_rerun_remote_smoke.md');

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

function safeRemoteEnv(env = process.env) {
  const base = String(env.IDB_REMOTE_RESOLVER_BASE_URL || '').trim();
  let baseUrl = { configured: false, https: false, publicHost: false, redacted: '' };
  if (base) {
    try {
      const parsed = new URL(base);
      baseUrl = {
        configured: true,
        https: parsed.protocol === 'https:',
        publicHost: !/^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(parsed.hostname),
        redacted: parsed.origin
      };
    } catch (error) {
      baseUrl = { configured: true, https: false, publicHost: false, redacted: 'invalid_url', error: error.message };
    }
  }
  const missing = [];
  if (env.IDB_REMOTE_RESOLVER_SMOKE !== '1') missing.push('IDB_REMOTE_RESOLVER_SMOKE=1');
  if (!baseUrl.configured) missing.push('IDB_REMOTE_RESOLVER_BASE_URL');
  if (!String(env.IDB_REMOTE_RESOLVER_TOKEN || '').trim()) missing.push('IDB_REMOTE_RESOLVER_TOKEN');
  if (!String(env.IDB_REMOTE_RESOLVER_ALLOWED_ORIGIN || '').trim()) missing.push('IDB_REMOTE_RESOLVER_ALLOWED_ORIGIN');
  if (!String(env.IDB_REMOTE_RESOLVER_BLOCKED_ORIGIN || '').trim()) missing.push('IDB_REMOTE_RESOLVER_BLOCKED_ORIGIN');
  return {
    remoteSmokeOptIn: env.IDB_REMOTE_RESOLVER_SMOKE === '1',
    baseUrl,
    tokenConfigured: Boolean(String(env.IDB_REMOTE_RESOLVER_TOKEN || '').trim()),
    allowedOriginConfigured: Boolean(String(env.IDB_REMOTE_RESOLVER_ALLOWED_ORIGIN || '').trim()),
    blockedOriginConfigured: Boolean(String(env.IDB_REMOTE_RESOLVER_BLOCKED_ORIGIN || '').trim()),
    missing,
    remoteExecutable: missing.length === 0 && baseUrl.https && baseUrl.publicHost,
    rawSecretsIncluded: false
  };
}

function runW80() {
  const result = spawnSync('npm', ['run', 'harness:hosted-resolver-remote-smoke-w80'], {
    cwd: root,
    env: process.env,
    encoding: 'utf8',
    timeout: 30000
  });
  return {
    status: result.status,
    signal: result.signal,
    stdoutSummary: String(result.stdout || '').split('\n').filter(Boolean).slice(-5),
    stderrSummary: String(result.stderr || '').split('\n').filter(Boolean).slice(-5),
    timedOut: result.error && result.error.code === 'ETIMEDOUT'
  };
}

function main() {
  const priorW80 = readJson(w80Path);
  const priorW80Trace = readJson(w80TracePath);
  const observed = safeRemoteEnv(process.env);
  const results = [];

  assertCase(results, 'w80r_inherits_w80_local_hosted_smoke', priorW80.schema === 'idb.w80-execute-hosted-resolver-remote-smoke.v1' && priorW80.localHostedEndpointSmoke.executed === true && priorW80.localHostedEndpointSmoke.healthStatus === 200, JSON.stringify(priorW80.localHostedEndpointSmoke));
  assertCase(results, 'w80r_prior_remote_not_unlocked', priorW80Trace.remoteSmokeExecuted === false && priorW80Trace.pilotDecision === 'no_go_remote_config_missing' && priorW80Trace.noRegression.hostedResolverPilotEnabled === false, JSON.stringify({ remote: priorW80Trace.remoteSmokeExecuted, pilot: priorW80Trace.pilotDecision }));
  assertCase(results, 'w80r_env_observed_without_secrets', observed.rawSecretsIncluded === false && typeof observed.tokenConfigured === 'boolean' && !JSON.stringify(observed).includes(String(process.env.IDB_REMOTE_RESOLVER_TOKEN || 'never-match-real-token')), JSON.stringify(observed));

  let rerun = null;
  let afterW80 = priorW80;
  let afterW80Trace = priorW80Trace;
  if (observed.remoteExecutable) {
    rerun = runW80();
    afterW80 = readJson(w80Path);
    afterW80Trace = readJson(w80TracePath);
    assertCase(results, 'w80r_w80_rerun_executed', rerun.status === 0 && !rerun.timedOut, JSON.stringify(rerun));
    assertCase(results, 'w80r_remote_smoke_executed_true', afterW80Trace.remoteSmokeExecuted === true, JSON.stringify({ remoteSmokeExecuted: afterW80Trace.remoteSmokeExecuted, pilotDecision: afterW80Trace.pilotDecision }));
  } else {
    assertCase(results, 'w80r_remote_env_missing_keeps_no_go', observed.remoteExecutable === false && observed.missing.length > 0, JSON.stringify(observed));
  }

  const remoteSmokeExecuted = afterW80Trace.remoteSmokeExecuted === true;
  const failures = results.filter((result) => !result.pass);
  const decision = failures.length ? 'FAIL' : 'PASS';
  const pilotDecision = remoteSmokeExecuted ? 'remote_smoke_executed_ready_for_w81_unlock_gate' : 'no_go_real_https_endpoint_not_configured';
  const contract = {
    schema: 'idb.w80r-real-https-endpoint-rerun-remote-smoke.v1',
    status: remoteSmokeExecuted ? 'remote_smoke_executed' : 'blocked_real_https_endpoint_not_configured',
    objective: 'Provision or identify a real HTTPS staging endpoint and rerun W80 remote smoke without storing secrets.',
    observedEnvironment: observed,
    rerun,
    remoteExecutionResult: {
      remoteSmokeExecuted,
      pilotDecision,
      hostedResolverPilotEnabled: false,
      consultantSmokeEligible: remoteSmokeExecuted,
      exactNoGoRemediation: remoteSmokeExecuted ? [] : [
        'Deploy W79A package to a real HTTPS staging host.',
        'Set IDB_REMOTE_RESOLVER_SMOKE=1 in protected shell.',
        'Set IDB_REMOTE_RESOLVER_BASE_URL to the real public HTTPS endpoint.',
        'Set IDB_REMOTE_RESOLVER_TOKEN from secret manager or protected shell only.',
        'Set IDB_REMOTE_RESOLVER_ALLOWED_ORIGIN to the exact NetSuite staging origin.',
        'Set IDB_REMOTE_RESOLVER_BLOCKED_ORIGIN to an HTTPS origin that is not allowed by CORS.',
        'Rerun npm run harness:hosted-resolver-remote-smoke-w80.',
        'Then rerun npm run preflight.'
      ]
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
      block: remoteSmokeExecuted ? 'W81: Hosted Resolver Consultant Pilot Unlock Smoke' : 'W80S: Hosted Endpoint Platform Selection And Deploy',
      prompt: remoteSmokeExecuted
        ? 'Move through W81: Hosted Resolver Consultant Pilot Unlock Smoke. Use the W80R remoteSmokeExecuted=true result to run hosted-only drawer consultant smoke across Plan, Review, ROI/Competitive, Run, and Trace with resolver status, evidence coverage, failure-state UX, rollback toggle, and no-secret trace checks. Keep SuiteScript writes disabled, preserve N/LLM advisory-only, notes story-only, and blocked/thin/unavailable/timeout as insufficient evidence with no confident guesses. Output consultant smoke result, pilot unlock decision, W81 report, validator gates, and best next Codex prompt.'
        : 'Move through W80S: Hosted Endpoint Platform Selection And Deploy. Choose the staging host for websiteResolverServiceV1, deploy the W79A package to a real public HTTPS endpoint, configure IDB_RESOLVER_TOKEN and IDB_RESOLVER_ALLOWED_ORIGINS in the platform secret/env settings, then provide only the non-secret endpoint URL and approved/blocked origins plus a protected-token handoff path for W80R. Do not store secrets in repo files, traces, reports, screenshots, or chat. Keep hosted consultant pilot disabled until remoteSmokeExecuted=true. Output platform selection, deploy steps, secret-safe handoff, W80S report, validator gates, and best next Codex prompt.'
    }
  };
  writeJson(dataPath, contract);

  const trace = {
    schema: 'idb.w80r-real-https-endpoint-rerun-remote-smoke-trace.v1',
    generated: new Date().toISOString(),
    decision,
    remoteSmokeExecuted,
    pilotDecision,
    observedEnvironment: observed,
    rerun,
    remoteExecutionResult: contract.remoteExecutionResult,
    noRegression: contract.noRegression,
    bestNextCodexPrompt: contract.bestNextCodexPrompt,
    results
  };
  writeJson(tracePath, trace);

  const rows = results.map((result) => `| ${result.pass ? 'PASS' : 'FAIL'} | ${result.name} | ${escapeTable(result.detail)} |`).join('\n');
  const remediation = contract.remoteExecutionResult.exactNoGoRemediation.map((item) => `- ${item}`).join('\n') || '- None';
  const failureRows = failures.map((result) => `- ${result.name}: ${result.detail}`).join('\n') || '- None';
  const report = `# W80R Real HTTPS Endpoint Rerun Remote Smoke

Decision: ${decision} / ${remoteSmokeExecuted ? 'REMOTE SMOKE EXECUTED' : 'REAL HTTPS ENDPOINT NOT CONFIGURED'} / HOSTED PILOT STILL DISABLED / NO WRITE AUTHORITY

## Objective

Provision or identify the real HTTPS staging \`websiteResolverServiceV1\` endpoint and rerun W80 remote smoke without storing secrets.

## Current Position

${remoteSmokeExecuted ? 'Remote smoke executed. Proceed only to the W81 consultant unlock gate before enabling hosted traffic.' : 'No real HTTPS endpoint/token/origin set is available in this shell. Local hosted smoke remains useful, but it is not production or consultant-pilot proof.'}

## Exact No-Go Remediation

${remediation}

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
  console.log(`W80R real HTTPS endpoint rerun harness: ${decision} remote_smoke_executed=${remoteSmokeExecuted} pilot_decision=${pilotDecision}`);
  if (failures.length) {
    console.error(failures);
    process.exit(1);
  }
}

main();
