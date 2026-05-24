const fs = require('fs');
const path = require('path');

const {
  ENV_CONTRACT,
  createHostedResolverServerFromEnv,
  parseHostedResolverEnv,
  redactedHostedConfig
} = require('./website_resolver_hosted_service');

const root = path.resolve(__dirname, '..');
const dataPath = path.join(root, 'data', 'w79a_hosted_resolver_deployment_package.json');
const tracePath = path.join(root, 'trace_samples', 'w79a_hosted_resolver_deployment_package_trace.json');
const reportPath = path.join(root, 'reports', 'w79a_hosted_resolver_deployment_package.md');
const dockerfilePath = path.join(root, 'deploy', 'hosted-resolver', 'Dockerfile');
const envExamplePath = path.join(root, 'deploy', 'hosted-resolver', 'env.example');
const readmePath = path.join(root, 'deploy', 'hosted-resolver', 'README.md');
const packagePath = path.join(root, 'package.json');

const ALLOWED_ORIGIN = 'https://YOUR_ACCOUNT_ID.app.netsuite.com';
const BLOCKED_ORIGIN = 'https://unapproved.example.com';
const TOKEN = 'test-token-not-a-secret';

function read(file) {
  return fs.readFileSync(file, 'utf8');
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

function html(title, body, meta = '') {
  return `<!doctype html><html><head><title>${title}</title><meta name="description" content="${meta}"></head><body>${body}</body></html>`;
}

function createMockFetch(responses) {
  const calls = [];
  const fetchClient = async (url) => {
    calls.push(url);
    const response = responses[url] || responses.default;
    const body = response.body || '';
    return {
      url,
      status: response.status || 200,
      headers: response.headers || {},
      contentType: response.contentType || 'text/html',
      body,
      pageBytes: Buffer.byteLength(body, 'utf8')
    };
  };
  fetchClient.calls = calls;
  return fetchClient;
}

async function publicDns() {
  return [{ address: '93.184.216.34', family: 4 }];
}

function authHeaders(origin = ALLOWED_ORIGIN, token = TOKEN) {
  return {
    origin,
    'content-type': 'application/json',
    'x-idb-resolver-token': token
  };
}

async function main() {
  const results = [];
  const packageJson = JSON.parse(read(packagePath));
  const dockerfile = read(dockerfilePath);
  const envExample = read(envExamplePath);
  const deployReadme = read(readmePath);
  const missingEnv = parseHostedResolverEnv({});
  const configuredEnv = {
    IDB_RESOLVER_TOKEN: TOKEN,
    IDB_RESOLVER_ALLOWED_ORIGINS: ALLOWED_ORIGIN,
    IDB_RESOLVER_PORT: '8787',
    IDB_RESOLVER_RATE_TOKEN_PER_MINUTE: '20',
    IDB_RESOLVER_RATE_DOMAIN_PER_MINUTE: '10'
  };
  const parsedEnv = parseHostedResolverEnv(configuredEnv);
  const redactedConfig = redactedHostedConfig(parsedEnv.config);

  assertCase(results, 'w79a_hosted_env_requires_token_and_origin', missingEnv.ok === false && missingEnv.missing.includes('IDB_RESOLVER_TOKEN') && missingEnv.missing.includes('IDB_RESOLVER_ALLOWED_ORIGINS') && parsedEnv.ok === true && redactedConfig.tokenConfigured === true && !JSON.stringify(redactedConfig).includes(TOKEN), JSON.stringify({ missing: missingEnv.missing, redactedConfig }));

  const fetchClient = createMockFetch({
    'https://trek.example/': {
      body: html(
        'Trek Bikes, Bicycle Dealer Hardgoods',
        '<nav><a href="/bikes">Bikes</a><a href="/equipment">Equipment</a></nav><h1>Road bikes, mountain bikes and electric bikes</h1><h2>Helmets, parts, dealer inventory and replenishment</h2><p>Shop bikes, cycling equipment, apparel, helmets and parts.</p>',
        'Bicycle dealer hardgoods, road bikes, mountain bikes, electric bikes, helmets, parts, dealer inventory.'
      )
    },
    'https://trek.example/bikes': {
      body: html('Bikes', '<h1>Road bikes mountain bikes electric bikes</h1><p>Bicycle SKU catalog and dealer stock.</p>')
    },
    'https://trek.example/equipment': {
      body: html('Equipment', '<h1>Helmets equipment parts</h1><p>Cycling gear and parts.</p>')
    },
    default: {
      status: 503,
      body: 'down'
    }
  });
  const server = createHostedResolverServerFromEnv(configuredEnv, {
    resolverOptions: {
      fetchClient,
      dnsResolver: publicDns,
      now: '2026-05-13T11:30:00.000Z'
    }
  });
  const endpoint = server.endpoint;

  const health = await endpoint.handle({ method: 'GET', path: '/health', headers: { origin: ALLOWED_ORIGIN }, requestId: 'w79a_health' });
  assertCase(results, 'w79a_health_no_write_contract', health.status === 200 && health.body.serviceName === 'websiteResolverServiceV1' && health.body.writeAuthority === 'none' && health.body.suiteScriptInvocation === false && health.body.nllmAdvisoryOnly === true, JSON.stringify(health.body));

  const corsOk = await endpoint.handle({ method: 'OPTIONS', path: '/idb/website-resolver/v1/resolve', headers: { origin: ALLOWED_ORIGIN }, requestId: 'w79a_cors_ok' });
  const corsBlocked = await endpoint.handle({ method: 'OPTIONS', path: '/idb/website-resolver/v1/resolve', headers: { origin: BLOCKED_ORIGIN }, requestId: 'w79a_cors_blocked' });
  assertCase(results, 'w79a_strict_cors_allowlist', corsOk.status === 204 && corsOk.headers['Access-Control-Allow-Origin'] === ALLOWED_ORIGIN && corsBlocked.status === 403 && !corsBlocked.headers['Access-Control-Allow-Origin'], JSON.stringify({ corsOk, corsBlocked }));

  const fetchesBeforeRejects = fetchClient.calls.length;
  const missingToken = await endpoint.handle({ method: 'POST', path: '/idb/website-resolver/v1/resolve', headers: { origin: ALLOWED_ORIGIN }, body: { url: 'https://trek.example/' }, requestId: 'w79a_missing_token' });
  const cookieRejected = await endpoint.handle({ method: 'POST', path: '/idb/website-resolver/v1/resolve', headers: Object.assign(authHeaders(), { cookie: 'NS_VER=secret' }), body: { url: 'https://trek.example/' }, requestId: 'w79a_cookie' });
  const authRejected = await endpoint.handle({ method: 'POST', path: '/idb/website-resolver/v1/resolve', headers: Object.assign(authHeaders(), { authorization: 'Bearer secret' }), body: { url: 'https://trek.example/' }, requestId: 'w79a_auth' });
  const writeRejected = await endpoint.handle({ method: 'POST', path: '/idb/website-resolver/v1/resolve', headers: authHeaders(), body: { url: 'https://trek.example/', recordId: '1', customerId: '2', createEnabled: true }, requestId: 'w79a_write' });
  assertCase(results, 'w79a_auth_cookie_write_rejected_before_fetch', missingToken.status === 401 && cookieRejected.status === 400 && authRejected.status === 400 && writeRejected.status === 400 && writeRejected.body.error === 'no_write_boundary_violation' && fetchClient.calls.length === fetchesBeforeRejects, JSON.stringify({ missingToken: missingToken.status, cookieRejected: cookieRejected.status, authRejected: authRejected.status, writeRejected: writeRejected.body }));

  const first = await endpoint.handle({ method: 'POST', path: '/idb/website-resolver/v1/resolve', headers: authHeaders(), body: { url: 'https://trek.example/', requestId: 'w79a_first', maxPages: 3 }, requestId: 'w79a_first' });
  const second = await endpoint.handle({ method: 'POST', path: '/idb/website-resolver/v1/resolve', headers: authHeaders(), body: { url: 'https://trek.example/', requestId: 'w79a_second', maxPages: 3 }, requestId: 'w79a_second' });
  assertCase(results, 'w79a_resolve_and_cache_adapter_ready', first.status === 200 && first.body.evidence.schema === 'idb.website-evidence.v1' && first.body.evidence.signals.laneCandidates[0].laneId === 'dealer_hardgoods' && first.body.cacheHit === false && second.status === 200 && second.body.cacheHit === true && server.hostedConfig.cacheAdapter === 'memory', JSON.stringify({ first: first.body.evidence.signals.laneCandidates[0], secondCacheHit: second.body.cacheHit, cacheAdapter: server.hostedConfig.cacheAdapter }));

  const blocked = await endpoint.handle({ method: 'POST', path: '/idb/website-resolver/v1/resolve', headers: authHeaders(), body: { url: 'https://127.0.0.1/admin', requestId: 'w79a_blocked' }, requestId: 'w79a_blocked' });
  const unavailable = await endpoint.handle({ method: 'POST', path: '/idb/website-resolver/v1/resolve', headers: authHeaders(), body: { url: 'https://down.example/', requestId: 'w79a_unavailable' }, requestId: 'w79a_unavailable' });
  assertCase(results, 'w79a_failure_states_no_confident_guess', [blocked, unavailable].every((item) => item.body.evidence.confidence.state === 'insufficient_evidence' && item.body.evidence.signals.laneCandidates.length === 0 && item.body.evidence.writeAuthority === 'none'), JSON.stringify([blocked.body.evidence, unavailable.body.evidence].map((evidence) => ({ failureState: evidence.failureState, confidence: evidence.confidence, lanes: evidence.signals.laneCandidates }))));

  assertCase(results, 'w79a_deploy_artifacts_present', /FROM node:20-alpine/.test(dockerfile) && /CMD \["node", "tools\/website_resolver_hosted_service\.js"\]/.test(dockerfile) && /IDB_RESOLVER_TOKEN=<set-in-secret-manager>/.test(envExample) && /Do not commit real secrets/.test(envExample) && /Remote Staging Checklist/.test(deployReadme) && /remoteSmokeExecuted=true/.test(deployReadme), 'deploy/hosted-resolver');
  assertCase(results, 'w79a_local_production_command_registered', packageJson.scripts['resolver:hosted'] === 'node tools/website_resolver_hosted_service.js' && packageJson.scripts['harness:hosted-resolver-deployment-package'] === 'node tools/run_hosted_resolver_deployment_package_harness.js' && /harness:hosted-resolver-deployment-package/.test(packageJson.scripts.preflight), JSON.stringify(packageJson.scripts));
  assertCase(results, 'w79a_no_secret_trace_rules_hold', !JSON.stringify(endpoint.traces).includes(TOKEN) && endpoint.traces.every((trace) => trace.redaction && trace.redaction.cookiesLogged === false && trace.redaction.authorizationLogged === false), JSON.stringify(endpoint.traces));

  const failures = results.filter((result) => !result.pass);
  const decision = failures.length ? 'FAIL' : 'PASS';
  const contract = {
    schema: 'idb.w79a-hosted-resolver-deployment-package.v1',
    status: 'deployment_package_ready_hosted_pilot_still_no_go',
    objective: 'Turn the local no-write websiteResolverServiceV1 prototype into a deployable hosted resolver package before consultant smoke.',
    roles: [
      { role: 'Resolver Service Architect', owns: 'Hosted service wrapper, health/resolve routes, env contract, and local production-mode command.' },
      { role: 'Security Guard', owns: 'Secrets, strict CORS, token validation, cookie/auth rejection, write-payload rejection, and no-secret traces.' },
      { role: 'Website Intelligence Agent', owns: 'Resolver behavior parity with websiteEvidenceV1 and failure-state honesty.' },
      { role: 'DevOps Readiness Agent', owns: 'Dockerfile, env template, deployment checklist, and rollback/runbook shape.' },
      { role: 'Regression Guard Agent', owns: 'Validator gates and no-write/no-SuiteScript/N/LLM-advisory-only boundaries.' }
    ],
    deploymentPackage: {
      serviceWrapper: 'tools/website_resolver_hosted_service.js',
      dockerfile: 'deploy/hosted-resolver/Dockerfile',
      envTemplate: 'deploy/hosted-resolver/env.example',
      runbook: 'deploy/hosted-resolver/README.md',
      healthEndpoint: '/health',
      resolveEndpoint: '/idb/website-resolver/v1/resolve',
      localProductionCommand: 'npm run resolver:hosted'
    },
    envContract: ENV_CONTRACT.map((item) => ({
      name: item.name,
      required: item.required,
      secret: item.secret,
      purpose: item.purpose
    })),
    securityControls: [
      'Hosted mode refuses to start without explicit IDB_RESOLVER_TOKEN.',
      'Hosted mode refuses to start without exact IDB_RESOLVER_ALLOWED_ORIGINS.',
      'CORS allowlist has no wildcard mode.',
      'Missing or wrong token returns 401 before fetch.',
      'NetSuite cookies and Authorization headers are rejected before fetch.',
      'Write-shaped payload fields are rejected before fetch.',
      'SSRF, unsafe scheme, private IP, and unsafe redirect controls remain in resolver service.',
      'Trace output records booleans and hashes only; raw token/cookie/auth/manual-evidence full text is not logged.'
    ],
    cacheAdapter: {
      current: 'memory',
      productionExtensionPoint: 'replace createMemoryCache with managed cache adapter without changing response shape',
      cacheReadyFields: ['cache.key', 'cache.ttlSeconds', 'cache.contentHashes', 'cache.hit']
    },
    remoteDeploymentChecklist: [
      'Provision HTTPS staging endpoint.',
      'Set IDB_RESOLVER_TOKEN in secret manager only.',
      'Set exact NetSuite staging origin in IDB_RESOLVER_ALLOWED_ORIGINS.',
      'Run /health smoke and verify writeAuthority none.',
      'Run auth/CORS/write-payload rejection smoke.',
      'Run approved live-site smoke through hosted endpoint.',
      'Confirm no raw secrets in logs, traces, reports, or screenshots.',
      'Keep hosted consultant pilot disabled until W76R/W80 remote smoke has remoteSmokeExecuted=true.'
    ],
    localProductionSmoke: [
      "export IDB_RESOLVER_TOKEN='<secret-manager-value>'",
      "export IDB_RESOLVER_ALLOWED_ORIGINS='https://<approved-netsuite-account>.app.netsuite.com'",
      'npm run resolver:hosted',
      'curl -sS http://127.0.0.1:8787/health'
    ],
    pilotDecision: {
      hostedResolverPilotEnabled: false,
      consultantSmokeEligible: false,
      reason: 'Deployment package is ready, but no real remote hosted endpoint has executed smoke with remoteSmokeExecuted=true.'
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
      block: 'W79B: Provision Hosted Resolver Staging Endpoint',
      prompt: 'Move through W79B: Provision Hosted Resolver Staging Endpoint. Use the W79A deployment package to provision or identify the real HTTPS staging websiteResolverServiceV1 endpoint, configure secret-managed IDB_RESOLVER_TOKEN, exact NetSuite staging CORS origin, blocked-origin negative test value, rate limits, cache setting, and observability redaction. Do not store secrets in repo files, traces, reports, screenshots, or chat. Keep hosted consultant pilot disabled until remote smoke returns remoteSmokeExecuted=true. Output provisioning evidence, secret-safe env handoff, remote endpoint readiness checklist, W79B report, validator gates, and best next Codex prompt.'
    }
  };
  writeJson(dataPath, contract);

  const trace = {
    schema: 'idb.w79a-hosted-resolver-deployment-package-trace.v1',
    generated: new Date().toISOString(),
    decision,
    parsedEnv: {
      missingEnvOk: missingEnv.ok,
      missing: missingEnv.missing,
      configuredOk: parsedEnv.ok,
      redactedConfig
    },
    healthSample: { status: health.status, body: health.body },
    corsSamples: {
      allowed: { status: corsOk.status, headers: corsOk.headers },
      blocked: { status: corsBlocked.status, headers: corsBlocked.headers }
    },
    rejectionSamples: {
      missingToken: { status: missingToken.status, body: missingToken.body },
      cookieRejected: { status: cookieRejected.status, body: cookieRejected.body },
      authRejected: { status: authRejected.status, body: authRejected.body },
      writeRejected: { status: writeRejected.status, body: writeRejected.body }
    },
    cacheSample: {
      first: { status: first.status, cacheHit: first.body.cacheHit, confidence: first.body.evidence.confidence, laneCandidates: first.body.evidence.signals.laneCandidates },
      second: { status: second.status, cacheHit: second.body.cacheHit, evidenceCacheHit: second.body.evidence.cache.hit }
    },
    failureSamples: [blocked, unavailable].map((item) => ({
      failureState: item.body.evidence.failureState,
      confidence: item.body.evidence.confidence,
      laneCandidates: item.body.evidence.signals.laneCandidates,
      writeAuthority: item.body.evidence.writeAuthority
    })),
    noSecretTrace: {
      tokenConfigured: redactedConfig.tokenConfigured,
      rawTokenPresent: JSON.stringify(endpoint.traces).includes(TOKEN),
      traceCount: endpoint.traces.length
    },
    deploymentPackage: contract.deploymentPackage,
    remoteDeploymentChecklist: contract.remoteDeploymentChecklist,
    pilotDecision: contract.pilotDecision,
    noRegression: contract.noRegression,
    bestNextCodexPrompt: contract.bestNextCodexPrompt,
    results
  };
  writeJson(tracePath, trace);

  const rows = results.map((result) => `| ${result.pass ? 'PASS' : 'FAIL'} | ${result.name} | ${escapeTable(result.detail)} |`).join('\n');
  const failureRows = failures.map((result) => `- ${result.name}: ${result.detail}`).join('\n') || '- None';
  const report = `# W79A Hosted Resolver Deployment Package

Decision: ${decision} / DEPLOYMENT PACKAGE READY / HOSTED PILOT STILL NO-GO / NO WRITE AUTHORITY

## Objective

Turn the local no-write \`websiteResolverServiceV1\` prototype into a deployable hosted resolver package before consultant smoke.

## Completed

- Added \`tools/website_resolver_hosted_service.js\` as the production-mode service wrapper.
- Added \`deploy/hosted-resolver/Dockerfile\`.
- Added \`deploy/hosted-resolver/env.example\` with placeholders only.
- Added \`deploy/hosted-resolver/README.md\` with local production-mode smoke, container run, remote checklist, and rollback.
- Registered \`npm run resolver:hosted\`.
- Registered \`npm run harness:hosted-resolver-deployment-package\`.
- Kept hosted consultant pilot disabled until a real remote smoke returns \`remoteSmokeExecuted=true\`.

## Local Production-Mode Smoke

\`\`\`bash
${contract.localProductionSmoke.join('\n')}
\`\`\`

## Remote Deployment Checklist

${contract.remoteDeploymentChecklist.map((item) => `- ${item}`).join('\n')}

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
  console.log(`W79A hosted resolver deployment package harness: ${decision} pilot_decision=deployment_package_ready_hosted_pilot_still_no_go`);
  if (failures.length) {
    console.error(failures);
    process.exit(1);
  }
}

main();
