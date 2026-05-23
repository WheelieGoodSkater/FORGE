const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');

const root = path.resolve(__dirname, '..');
const contractPath = path.join(root, 'data', 'w72_hosted_resolver_remote_deployment_readiness_gate.json');
const w71TracePath = path.join(root, 'trace_samples', 'w71_local_e2e_hosted_resolver_pilot_smoke_trace.json');
const tracePath = path.join(root, 'trace_samples', 'w72_remote_resolver_deployment_readiness_gate_trace.json');
const reportPath = path.join(root, 'reports', 'w72_hosted_resolver_remote_deployment_readiness_gate.md');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function assertCase(results, name, pass, detail) {
  results.push({ name, pass: !!pass, detail: detail || '' });
}

function escapeTable(value) {
  return String(value == null ? '' : value).replace(/\|/g, '/');
}

function isRemoteSmokeEnabled() {
  return String(process.env.IDB_REMOTE_RESOLVER_SMOKE || '').trim() === '1';
}

function normalizeBaseUrl(value) {
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
  return { ok: true, baseUrl: parsed.toString().replace(/\/+$/, '') };
}

function httpJsonRequest(url, options = {}, body) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const client = parsed.protocol === 'https:' ? https : http;
    const request = client.request({
      method: options.method || 'GET',
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      path: `${parsed.pathname}${parsed.search}`,
      headers: options.headers || {},
      timeout: options.timeoutMs || 15000
    }, (response) => {
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf8');
        let parsedBody = null;
        try {
          parsedBody = text ? JSON.parse(text) : null;
        } catch (error) {
          reject(error);
          return;
        }
        resolve({ status: response.statusCode, headers: response.headers, body: parsedBody });
      });
    });
    request.on('timeout', () => {
      request.destroy(new Error('remote request timed out'));
    });
    request.on('error', reject);
    if (body) request.write(JSON.stringify(body));
    request.end();
  });
}

async function runRemoteSmoke(baseUrl, token, allowedOrigin, blockedOrigin) {
  const resolveUrl = `${baseUrl}/idb/website-resolver/v1/resolve`;
  const healthUrl = `${baseUrl}/health`;
  const approvedHeaders = {
    Origin: allowedOrigin,
    'Content-Type': 'application/json',
    'X-IDB-Resolver-Token': token
  };
  const health = await httpJsonRequest(healthUrl, { method: 'GET', headers: { Origin: allowedOrigin } });
  const approvedPreflight = await httpJsonRequest(resolveUrl, {
    method: 'OPTIONS',
    headers: {
      Origin: allowedOrigin,
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'Content-Type, X-IDB-Resolver-Token'
    }
  });
  const blockedPreflight = await httpJsonRequest(resolveUrl, {
    method: 'OPTIONS',
    headers: {
      Origin: blockedOrigin,
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'Content-Type, X-IDB-Resolver-Token'
    }
  });
  const missingToken = await httpJsonRequest(resolveUrl, {
    method: 'POST',
    headers: { Origin: allowedOrigin, 'Content-Type': 'application/json' }
  }, { url: 'https://trekbikes.com/' });
  const writePayload = await httpJsonRequest(resolveUrl, {
    method: 'POST',
    headers: approvedHeaders
  }, { url: 'https://trekbikes.com/', recordId: '123', suiteletUrl: 'https://netsuite.example/script', createEnabled: true });
  const first = await httpJsonRequest(resolveUrl, {
    method: 'POST',
    headers: approvedHeaders
  }, { url: 'https://www.trekbikes.com/us/en_US/', requestId: 'w72-remote-cache-1', maxPages: 4, timeoutMs: 12000 });
  const second = await httpJsonRequest(resolveUrl, {
    method: 'POST',
    headers: approvedHeaders
  }, { url: 'https://www.trekbikes.com/us/en_US/', requestId: 'w72-remote-cache-2', maxPages: 4, timeoutMs: 12000 });
  return { health, approvedPreflight, blockedPreflight, missingToken, writePayload, first, second };
}

async function main() {
  const contract = readJson(contractPath);
  const w71 = readJson(w71TracePath);
  const results = [];
  const remoteEnabled = isRemoteSmokeEnabled();
  const baseUrlValidation = normalizeBaseUrl(process.env.IDB_REMOTE_RESOLVER_BASE_URL);
  const tokenConfigured = Boolean(String(process.env.IDB_REMOTE_RESOLVER_TOKEN || '').trim());
  const allowedOrigin = String(process.env.IDB_REMOTE_RESOLVER_ALLOWED_ORIGIN || '').trim();
  const blockedOrigin = String(process.env.IDB_REMOTE_RESOLVER_BLOCKED_ORIGIN || '').trim();
  let remoteSmoke = null;

  assertCase(results, 'w72_contract_schema_present', contract.schema === 'idb.w72-hosted-resolver-remote-deployment-readiness-gate.v1' && contract.status === 'complete_remote_readiness_gate_ready', contract.schema);
  assertCase(results, 'w72_inherits_w71_local_e2e_pass', w71.decision === 'PASS' && w71.recommendedSample.laneId === 'dealer_hardgoods' && w71.cacheHitSample.cache.hit === true, JSON.stringify({ decision: w71.decision, lane: w71.recommendedSample.laneId, cacheHit: w71.cacheHitSample.cache.hit }));
  assertCase(results, 'w72_environment_config_complete', contract.environmentConfig.length >= 5 && contract.environmentConfig.every((item) => item.name && Array.isArray(item.rules) && item.rules.length) && contract.environmentConfig.some((item) => item.name === 'IDB_REMOTE_RESOLVER_SMOKE'), JSON.stringify(contract.environmentConfig.map((item) => item.name)));
  assertCase(results, 'w72_secret_and_cors_policy_present', contract.secretHandling.some((item) => /secret manager|environment secret store/.test(item)) && contract.secretHandling.some((item) => /never raw token/i.test(item)) && contract.corsOriginList.blocked.includes('wildcard production CORS') && contract.corsOriginList.requiredSmoke.some((item) => /approved preflight/.test(item)), JSON.stringify({ secrets: contract.secretHandling, cors: contract.corsOriginList }));
  assertCase(results, 'w72_deployment_target_checklist_present', contract.deploymentTargetChecklist.length >= 10 && contract.deploymentTargetChecklist.some((item) => /outside Tampermonkey/.test(item)) && contract.deploymentTargetChecklist.some((item) => /Do not enable SuiteScript writes/.test(item)), JSON.stringify(contract.deploymentTargetChecklist));
  assertCase(results, 'w72_remote_command_pack_present', /IDB_REMOTE_RESOLVER_SMOKE=1/.test(contract.remoteSmokeCommandPack.remoteSmoke) && /run_remote_resolver_deployment_readiness_gate_harness\.js/.test(contract.remoteSmokeCommandPack.remoteSmoke) && /run_approved_live_resolver_smoke_harness\.js/.test(contract.remoteSmokeCommandPack.approvedLiveSmoke), JSON.stringify(contract.remoteSmokeCommandPack));
  assertCase(results, 'w72_remote_smoke_gates_present', contract.remoteSmokeGates.some((item) => /Remote \/health/.test(item)) && contract.remoteSmokeGates.some((item) => /Approved CORS preflight/.test(item)) && contract.remoteSmokeGates.some((item) => /cacheHit true/.test(item)) && contract.remoteSmokeGates.some((item) => /zero false-confident-wrong/.test(item)), JSON.stringify(contract.remoteSmokeGates));
  assertCase(results, 'w72_observability_and_rollback_present', contract.observabilityVerification.some((item) => /latencyMs/.test(item)) && contract.observabilityVerification.some((item) => /redact token/.test(item)) && contract.rollbackSwitch.some((item) => /endpoint/.test(item)) && contract.rollbackSwitch.some((item) => /token/.test(item)), JSON.stringify({ observability: contract.observabilityVerification, rollback: contract.rollbackSwitch }));
  assertCase(results, 'w72_pilot_go_no_go_present', contract.pilotGoNoGo.goIf.some((item) => /zero false-confident-wrong/.test(item)) && contract.pilotGoNoGo.noGoIf.some((item) => /Any false-confident-wrong/.test(item)) && contract.pilotGoNoGo.noGoIf.some((item) => /confident lane/.test(item)), JSON.stringify(contract.pilotGoNoGo));
  assertCase(results, 'w72_no_regression_boundaries_present', contract.noRegression.writeAuthority === 'none' && contract.noRegression.suiteScriptInvocation === false && contract.noRegression.nllmAdvisoryOnly === true && contract.noRegression.notesCannotOwnIdentification === true && contract.noRegression.transactionWriteEnabled === false, JSON.stringify(contract.noRegression));
  assertCase(results, 'w72_best_next_prompt_present', contract.bestNextCodexPrompt.block === 'W73: Remote Hosted Resolver Smoke Execution' && /Move through W73/.test(contract.bestNextCodexPrompt.prompt), contract.bestNextCodexPrompt.prompt);

  if (remoteEnabled) {
    assertCase(results, 'w72_remote_env_base_url_valid', baseUrlValidation.ok, baseUrlValidation.reason || baseUrlValidation.baseUrl);
    assertCase(results, 'w72_remote_env_secret_and_origins_present', tokenConfigured && Boolean(allowedOrigin) && Boolean(blockedOrigin), JSON.stringify({ tokenConfigured, allowedOrigin: Boolean(allowedOrigin), blockedOrigin: Boolean(blockedOrigin) }));
    if (baseUrlValidation.ok && tokenConfigured && allowedOrigin && blockedOrigin) {
      remoteSmoke = await runRemoteSmoke(baseUrlValidation.baseUrl, process.env.IDB_REMOTE_RESOLVER_TOKEN, allowedOrigin, blockedOrigin);
      assertCase(results, 'w72_remote_health_smoke_passed', remoteSmoke.health.status === 200 && remoteSmoke.health.body && remoteSmoke.health.body.writeAuthority === 'none' && remoteSmoke.health.body.suiteScriptInvocation === false && remoteSmoke.health.body.nllmAdvisoryOnly === true, JSON.stringify(remoteSmoke.health.body));
      assertCase(results, 'w72_remote_auth_cors_smoke_passed', remoteSmoke.approvedPreflight.status === 204 && remoteSmoke.approvedPreflight.headers['access-control-allow-origin'] === allowedOrigin && remoteSmoke.blockedPreflight.status === 403 && !remoteSmoke.blockedPreflight.headers['access-control-allow-origin'] && remoteSmoke.missingToken.status === 401 && remoteSmoke.writePayload.status === 400, JSON.stringify({ approvedPreflight: remoteSmoke.approvedPreflight.status, blockedPreflight: remoteSmoke.blockedPreflight.status, missingToken: remoteSmoke.missingToken.status, writePayload: remoteSmoke.writePayload.status }));
      assertCase(results, 'w72_remote_cache_smoke_passed', remoteSmoke.first.status === 200 && remoteSmoke.second.status === 200 && remoteSmoke.second.body && remoteSmoke.second.body.cacheHit === true, JSON.stringify({ first: remoteSmoke.first.status, second: remoteSmoke.second.status, secondCacheHit: remoteSmoke.second.body && remoteSmoke.second.body.cacheHit }));
    }
  } else {
    assertCase(results, 'w72_remote_smoke_opt_in_not_required_for_readiness_pack', !remoteEnabled && !process.env.IDB_REMOTE_RESOLVER_TOKEN, 'remote smoke skipped until IDB_REMOTE_RESOLVER_SMOKE=1 and secret env vars are configured');
  }

  const failures = results.filter((result) => !result.pass);
  const decision = failures.length ? 'FAIL' : 'PASS';
  const trace = {
    schema: 'idb.w72-remote-resolver-deployment-readiness-gate-trace.v1',
    generated: new Date().toISOString(),
    decision,
    readinessDecision: contract.readinessDecision,
    remoteSmokeMode: remoteEnabled ? 'executed_against_remote_endpoint' : 'readiness_pack_only_remote_not_configured',
    inheritedW71Decision: w71.decision,
    environmentConfig: contract.environmentConfig,
    remoteEnvironmentObserved: {
      baseUrlConfigured: Boolean(process.env.IDB_REMOTE_RESOLVER_BASE_URL),
      baseUrlValid: baseUrlValidation.ok,
      tokenConfigured,
      allowedOriginConfigured: Boolean(allowedOrigin),
      blockedOriginConfigured: Boolean(blockedOrigin),
      rawSecretsIncluded: false
    },
    commandPack: contract.remoteSmokeCommandPack,
    deploymentTargetChecklist: contract.deploymentTargetChecklist,
    remoteSmokeGates: contract.remoteSmokeGates,
    remoteSmoke: remoteSmoke ? {
      healthStatus: remoteSmoke.health.status,
      approvedPreflightStatus: remoteSmoke.approvedPreflight.status,
      blockedPreflightStatus: remoteSmoke.blockedPreflight.status,
      missingTokenStatus: remoteSmoke.missingToken.status,
      writePayloadStatus: remoteSmoke.writePayload.status,
      firstResolveStatus: remoteSmoke.first.status,
      secondResolveStatus: remoteSmoke.second.status,
      secondCacheHit: remoteSmoke.second.body && remoteSmoke.second.body.cacheHit
    } : null,
    observabilityVerification: contract.observabilityVerification,
    rollbackSwitch: contract.rollbackSwitch,
    pilotGoNoGo: contract.pilotGoNoGo,
    noRegression: contract.noRegression,
    bestNextCodexPrompt: contract.bestNextCodexPrompt,
    results
  };
  fs.writeFileSync(tracePath, `${JSON.stringify(trace, null, 2)}\n`);

  const rows = results.map((result) => `| ${result.pass ? 'PASS' : 'FAIL'} | ${result.name} | ${escapeTable(result.detail)} |`).join('\n');
  const failureRows = failures.map((result) => `- ${result.name}: ${result.detail}`).join('\n') || '- None';
  const report = `# W72 Hosted Resolver Remote Deployment Readiness Gate

Decision: ${decision} / REMOTE DEPLOYMENT READINESS GATE READY / REMOTE SMOKE ${remoteEnabled ? 'EXECUTED' : 'NOT CONFIGURED'} / NO WRITE AUTHORITY

## Objective

Convert the local end-to-end hosted resolver smoke into a remote staging deployment readiness gate.

## Readiness Position

This block does not deploy a remote endpoint. It creates the readiness gate and command pack required before a remote staging endpoint can be used for pilot testing. Remote smoke is opt-in through \`IDB_REMOTE_RESOLVER_SMOKE=1\` and required secret/origin environment variables.

## Command Pack

\`\`\`bash
${contract.remoteSmokeCommandPack.readinessOnly}
${contract.remoteSmokeCommandPack.remoteSmoke}
${contract.remoteSmokeCommandPack.approvedLiveSmoke}
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

## Failures

${failureRows}

## Best Next Codex Prompt

\`\`\`text
${contract.bestNextCodexPrompt.prompt}
\`\`\`
`;
  fs.writeFileSync(reportPath, report);
  console.log(`Remote resolver deployment readiness gate harness: ${decision} (${results.length - failures.length}/${results.length}) mode=${trace.remoteSmokeMode}`);
  if (failures.length) {
    console.error(failures);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
