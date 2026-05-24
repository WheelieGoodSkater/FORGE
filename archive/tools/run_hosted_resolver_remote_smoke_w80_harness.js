const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');

const { createHostedResolverServerFromEnv } = require('./website_resolver_hosted_service');

const root = path.resolve(__dirname, '..');
const w79bPath = path.join(root, 'data', 'w79b_hosted_resolver_staging_provisioning.json');
const dataPath = path.join(root, 'data', 'w80_execute_hosted_resolver_remote_smoke.json');
const tracePath = path.join(root, 'trace_samples', 'w80_execute_hosted_resolver_remote_smoke_trace.json');
const reportPath = path.join(root, 'reports', 'w80_execute_hosted_resolver_remote_smoke.md');

const LOCAL_TOKEN = 'w80-local-endpoint-token';
const LOCAL_ALLOWED_ORIGIN = 'https://YOUR_ACCOUNT_ID.app.netsuite.com';
const LOCAL_BLOCKED_ORIGIN = 'https://unapproved.example.com';

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

function html(title, body, meta = '') {
  return `<!doctype html><html><head><title>${title}</title><meta name="description" content="${meta}"></head><body>${body}</body></html>`;
}

function createMockFetch(responses) {
  const calls = [];
  const fetchClient = async (url) => {
    calls.push(url);
    const response = responses[url] || responses[new URL(url).origin] || responses.default;
    if (response.error) {
      return Object.assign({ url, status: 0, headers: {}, contentType: '', body: '', pageBytes: 0 }, response);
    }
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

async function publicDns(hostname) {
  if (/private-target/.test(hostname)) return [{ address: '10.0.0.5', family: 4 }];
  return [{ address: '93.184.216.34', family: 4 }];
}

function startServer(server) {
  return new Promise((resolve, reject) => {
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      resolve(`http://127.0.0.1:${address.port}`);
    });
  });
}

function closeServer(server) {
  return new Promise((resolve) => server.close(() => resolve()));
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
      timeout: options.timeoutMs || 12000
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
      request.destroy(new Error('request timed out'));
    });
    request.on('error', reject);
    if (body) request.write(JSON.stringify(body));
    request.end();
  });
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
  return {
    remoteSmokeOptIn: String(env.IDB_REMOTE_RESOLVER_SMOKE || '').trim() === '1',
    baseUrl,
    tokenConfigured: Boolean(String(env.IDB_REMOTE_RESOLVER_TOKEN || '').trim()),
    allowedOriginConfigured: Boolean(String(env.IDB_REMOTE_RESOLVER_ALLOWED_ORIGIN || '').trim()),
    blockedOriginConfigured: Boolean(String(env.IDB_REMOTE_RESOLVER_BLOCKED_ORIGIN || '').trim()),
    rawSecretsIncluded: false
  };
}

function remoteReady(observed) {
  return observed.remoteSmokeOptIn
    && observed.baseUrl.configured
    && observed.baseUrl.https
    && observed.baseUrl.publicHost
    && observed.tokenConfigured
    && observed.allowedOriginConfigured
    && observed.blockedOriginConfigured;
}

async function runSmoke(baseUrl, token, allowedOrigin, blockedOrigin) {
  const resolveUrl = `${baseUrl}/idb/website-resolver/v1/resolve`;
  const healthUrl = `${baseUrl}/health`;
  const authedHeaders = {
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
  }, { url: 'https://trek.example/' });
  const cookieRejected = await httpJsonRequest(resolveUrl, {
    method: 'POST',
    headers: Object.assign({}, authedHeaders, { Cookie: 'NS_VER=secret' })
  }, { url: 'https://trek.example/' });
  const writeRejected = await httpJsonRequest(resolveUrl, {
    method: 'POST',
    headers: authedHeaders
  }, { url: 'https://trek.example/', recordId: '123', createEnabled: true });
  const first = await httpJsonRequest(resolveUrl, {
    method: 'POST',
    headers: authedHeaders
  }, { url: 'https://trek.example/', requestId: 'w80-cache-1', maxPages: 3 });
  const second = await httpJsonRequest(resolveUrl, {
    method: 'POST',
    headers: authedHeaders
  }, { url: 'https://trek.example/', requestId: 'w80-cache-2', maxPages: 3 });
  const blocked = await httpJsonRequest(resolveUrl, {
    method: 'POST',
    headers: authedHeaders
  }, { url: 'https://127.0.0.1/admin', requestId: 'w80-blocked' });
  const unavailable = await httpJsonRequest(resolveUrl, {
    method: 'POST',
    headers: authedHeaders
  }, { url: 'https://down.example/', requestId: 'w80-unavailable' });
  return { health, approvedPreflight, blockedPreflight, missingToken, cookieRejected, writeRejected, first, second, blocked, unavailable };
}

async function runLocalHostedEndpointSmoke() {
  const fetchClient = createMockFetch({
    'https://trek.example/': {
      body: html(
        'Trek Bikes, Bicycle Dealer Hardgoods',
        '<nav><a href="/bikes">Bikes</a><a href="/equipment">Equipment</a><a href="/stores">Store locator</a></nav><h1>Road bikes, mountain bikes and electric bikes</h1><h2>Helmets, parts, dealer inventory and replenishment</h2><p>Shop bikes, cycling equipment, apparel, helmets and parts.</p>',
        'Bicycle dealer hardgoods, road bikes, mountain bikes, electric bikes, helmets, parts, dealer inventory.'
      )
    },
    'https://trek.example/bikes': {
      body: html('Bikes', '<h1>Road bikes mountain bikes electric bikes</h1><p>Bicycle SKU catalog and dealer stock.</p>')
    },
    'https://trek.example/equipment': {
      body: html('Equipment', '<h1>Helmets equipment parts</h1><p>Cycling gear and parts.</p>')
    },
    'https://trek.example/stores': {
      body: html('Store locator', '<h1>Find a store</h1><p>Dealer locator and retail service.</p>')
    },
    'https://down.example/': {
      status: 503,
      body: 'down'
    },
    default: {
      status: 503,
      body: 'down'
    }
  });
  const env = {
    IDB_RESOLVER_TOKEN: LOCAL_TOKEN,
    IDB_RESOLVER_ALLOWED_ORIGINS: LOCAL_ALLOWED_ORIGIN,
    IDB_RESOLVER_RATE_TOKEN_PER_MINUTE: '100',
    IDB_RESOLVER_RATE_DOMAIN_PER_MINUTE: '100'
  };
  const server = createHostedResolverServerFromEnv(env, {
    resolverOptions: {
      fetchClient,
      dnsResolver: publicDns,
      now: '2026-05-13T12:00:00.000Z'
    }
  });
  let didStartServer = false;
  try {
    const baseUrl = await startServer(server);
    didStartServer = true;
    const smoke = await runSmoke(baseUrl, LOCAL_TOKEN, LOCAL_ALLOWED_ORIGIN, LOCAL_BLOCKED_ORIGIN);
    return {
      mode: 'http_server',
      baseUrlRedacted: 'http://127.0.0.1:<dynamic-port>',
      smoke,
      endpointTrace: server.endpoint.traces,
      fetchCallCount: fetchClient.calls.length
    };
  } finally {
    if (didStartServer) await closeServer(server);
  }
}

async function runLocalHostedEndpointFallback(error) {
  const fetchClient = createMockFetch({
    'https://trek.example/': {
      body: html(
        'Trek Bikes, Bicycle Dealer Hardgoods',
        '<nav><a href="/bikes">Bikes</a><a href="/equipment">Equipment</a><a href="/stores">Store locator</a></nav><h1>Road bikes, mountain bikes and electric bikes</h1><h2>Helmets, parts, dealer inventory and replenishment</h2><p>Shop bikes, cycling equipment, apparel, helmets and parts.</p>',
        'Bicycle dealer hardgoods, road bikes, mountain bikes, electric bikes, helmets, parts, dealer inventory.'
      )
    },
    'https://trek.example/bikes': {
      body: html('Bikes', '<h1>Road bikes mountain bikes electric bikes</h1><p>Bicycle SKU catalog and dealer stock.</p>')
    },
    'https://trek.example/equipment': {
      body: html('Equipment', '<h1>Helmets equipment parts</h1><p>Cycling gear and parts.</p>')
    },
    'https://trek.example/stores': {
      body: html('Store locator', '<h1>Find a store</h1><p>Dealer locator and retail service.</p>')
    },
    'https://down.example/': {
      status: 503,
      body: 'down'
    },
    default: {
      status: 503,
      body: 'down'
    }
  });
  const env = {
    IDB_RESOLVER_TOKEN: LOCAL_TOKEN,
    IDB_RESOLVER_ALLOWED_ORIGINS: LOCAL_ALLOWED_ORIGIN,
    IDB_RESOLVER_RATE_TOKEN_PER_MINUTE: '100',
    IDB_RESOLVER_RATE_DOMAIN_PER_MINUTE: '100'
  };
  const endpoint = createHostedResolverServerFromEnv(env, {
    resolverOptions: {
      fetchClient,
      dnsResolver: publicDns,
      now: '2026-05-13T12:00:00.000Z'
    }
  }).endpoint;
  const authHeaders = {
    origin: LOCAL_ALLOWED_ORIGIN,
    'content-type': 'application/json',
    'x-idb-resolver-token': LOCAL_TOKEN
  };
  const smoke = {
    health: await endpoint.handle({ method: 'GET', path: '/health', headers: { origin: LOCAL_ALLOWED_ORIGIN }, requestId: 'w80-local-health' }),
    approvedPreflight: await endpoint.handle({ method: 'OPTIONS', path: '/idb/website-resolver/v1/resolve', headers: { origin: LOCAL_ALLOWED_ORIGIN }, requestId: 'w80-local-cors-ok' }),
    blockedPreflight: await endpoint.handle({ method: 'OPTIONS', path: '/idb/website-resolver/v1/resolve', headers: { origin: LOCAL_BLOCKED_ORIGIN }, requestId: 'w80-local-cors-blocked' }),
    missingToken: await endpoint.handle({ method: 'POST', path: '/idb/website-resolver/v1/resolve', headers: { origin: LOCAL_ALLOWED_ORIGIN, 'content-type': 'application/json' }, body: { url: 'https://trek.example/' }, requestId: 'w80-local-missing-token' }),
    cookieRejected: await endpoint.handle({ method: 'POST', path: '/idb/website-resolver/v1/resolve', headers: Object.assign({}, authHeaders, { cookie: 'NS_VER=secret' }), body: { url: 'https://trek.example/' }, requestId: 'w80-local-cookie' }),
    writeRejected: await endpoint.handle({ method: 'POST', path: '/idb/website-resolver/v1/resolve', headers: authHeaders, body: { url: 'https://trek.example/', recordId: '123', createEnabled: true }, requestId: 'w80-local-write' }),
    first: await endpoint.handle({ method: 'POST', path: '/idb/website-resolver/v1/resolve', headers: authHeaders, body: { url: 'https://trek.example/', requestId: 'w80-local-cache-1', maxPages: 3 }, requestId: 'w80-local-cache-1' }),
    second: await endpoint.handle({ method: 'POST', path: '/idb/website-resolver/v1/resolve', headers: authHeaders, body: { url: 'https://trek.example/', requestId: 'w80-local-cache-2', maxPages: 3 }, requestId: 'w80-local-cache-2' }),
    blocked: await endpoint.handle({ method: 'POST', path: '/idb/website-resolver/v1/resolve', headers: authHeaders, body: { url: 'https://127.0.0.1/admin', requestId: 'w80-local-blocked' }, requestId: 'w80-local-blocked' }),
    unavailable: await endpoint.handle({ method: 'POST', path: '/idb/website-resolver/v1/resolve', headers: authHeaders, body: { url: 'https://down.example/', requestId: 'w80-local-unavailable' }, requestId: 'w80-local-unavailable' })
  };
  return {
    mode: 'handler_fallback_after_bind_blocked',
    bindError: error.code,
    baseUrlRedacted: 'not_bound_sandbox_blocked',
    smoke,
    endpointTrace: endpoint.traces,
    fetchCallCount: fetchClient.calls.length
  };
}

async function runLocalHostedEndpointSmokeWithFallback() {
  try {
    return await runLocalHostedEndpointSmoke();
  } catch (error) {
    if (error && error.code !== 'EPERM' && error.code !== 'EACCES') throw error;
    return runLocalHostedEndpointFallback(error);
  }
}

async function main() {
  const w79b = readJson(w79bPath);
  const observedRemoteEnv = safeRemoteEnv(process.env);
  const canRunRemote = remoteReady(observedRemoteEnv);
  const results = [];
  const localHosted = await runLocalHostedEndpointSmokeWithFallback();
  let remoteSmoke = null;
  let remoteExecutionError = null;

  assertCase(results, 'w80_inherits_w79b_provisioning_gate', w79b.schema === 'idb.w79b-hosted-resolver-staging-provisioning.v1' && w79b.provisioningDecision.hostedResolverPilotEnabled === false, JSON.stringify(w79b.provisioningDecision));
  assertCase(results, 'w80_local_hosted_endpoint_smoke_created', localHosted.smoke.health.status === 200 && localHosted.smoke.health.body.writeAuthority === 'none' && localHosted.smoke.health.body.suiteScriptInvocation === false && localHosted.smoke.health.body.nllmAdvisoryOnly === true, JSON.stringify(localHosted.smoke.health.body));
  assertCase(results, 'w80_local_hosted_auth_cors_write_rejections', localHosted.smoke.approvedPreflight.status === 204 && localHosted.smoke.blockedPreflight.status === 403 && localHosted.smoke.missingToken.status === 401 && localHosted.smoke.cookieRejected.status === 400 && localHosted.smoke.writeRejected.status === 400 && localHosted.smoke.writeRejected.body.error === 'no_write_boundary_violation', JSON.stringify({ approved: localHosted.smoke.approvedPreflight.status, blocked: localHosted.smoke.blockedPreflight.status, missingToken: localHosted.smoke.missingToken.status, cookie: localHosted.smoke.cookieRejected.status, write: localHosted.smoke.writeRejected.body }));
  assertCase(results, 'w80_local_hosted_resolve_cache_and_no_guess', localHosted.smoke.first.status === 200 && localHosted.smoke.first.body.evidence.signals.laneCandidates[0].laneId === 'dealer_hardgoods' && localHosted.smoke.second.status === 200 && localHosted.smoke.second.body.cacheHit === true && [localHosted.smoke.blocked, localHosted.smoke.unavailable].every((item) => item.body.evidence.confidence.state === 'insufficient_evidence' && item.body.evidence.signals.laneCandidates.length === 0), JSON.stringify({ lane: localHosted.smoke.first.body.evidence.signals.laneCandidates[0], secondCacheHit: localHosted.smoke.second.body.cacheHit, blocked: localHosted.smoke.blocked.body.evidence.confidence, unavailable: localHosted.smoke.unavailable.body.evidence.confidence }));
  assertCase(results, 'w80_local_hosted_no_secret_trace', !JSON.stringify(localHosted.endpointTrace).includes(LOCAL_TOKEN) && localHosted.endpointTrace.every((trace) => trace.redaction && trace.redaction.cookiesLogged === false && trace.redaction.authorizationLogged === false), JSON.stringify(localHosted.endpointTrace));

  if (canRunRemote) {
    try {
      remoteSmoke = await runSmoke(
        process.env.IDB_REMOTE_RESOLVER_BASE_URL.replace(/\/+$/, ''),
        process.env.IDB_REMOTE_RESOLVER_TOKEN,
        process.env.IDB_REMOTE_RESOLVER_ALLOWED_ORIGIN,
        process.env.IDB_REMOTE_RESOLVER_BLOCKED_ORIGIN
      );
    } catch (error) {
      remoteExecutionError = error.message;
    }
    assertCase(results, 'w80_remote_smoke_executed_without_secret_logging', Boolean(remoteSmoke) && !remoteExecutionError, remoteExecutionError || 'remote smoke executed');
    if (remoteSmoke) {
      assertCase(results, 'w80_remote_health_auth_cors_write_cache_passed', remoteSmoke.health.status === 200 && remoteSmoke.health.body.writeAuthority === 'none' && remoteSmoke.approvedPreflight.status === 204 && remoteSmoke.blockedPreflight.status === 403 && remoteSmoke.missingToken.status === 401 && remoteSmoke.writeRejected.status === 400 && remoteSmoke.second.status === 200 && remoteSmoke.second.body.cacheHit === true, JSON.stringify({ health: remoteSmoke.health.status, approved: remoteSmoke.approvedPreflight.status, blocked: remoteSmoke.blockedPreflight.status, missingToken: remoteSmoke.missingToken.status, write: remoteSmoke.writeRejected.status, secondCacheHit: remoteSmoke.second.body.cacheHit }));
      assertCase(results, 'w80_remote_failure_states_no_confident_guess', [remoteSmoke.blocked, remoteSmoke.unavailable].every((item) => item.body.evidence.confidence.state === 'insufficient_evidence' && item.body.evidence.signals.laneCandidates.length === 0), JSON.stringify([remoteSmoke.blocked.body.evidence, remoteSmoke.unavailable.body.evidence].map((item) => ({ failureState: item.failureState, confidence: item.confidence, laneCandidates: item.signals.laneCandidates }))));
    }
  } else {
    assertCase(results, 'w80_remote_config_missing_blocks_real_remote_smoke', !canRunRemote && observedRemoteEnv.rawSecretsIncluded === false, JSON.stringify(observedRemoteEnv));
  }

  const remoteSmokeExecuted = Boolean(remoteSmoke && !remoteExecutionError);
  const failures = results.filter((result) => !result.pass);
  const decision = failures.length ? 'FAIL' : 'PASS';
  const pilotDecision = remoteSmokeExecuted ? 'remote_smoke_executed_review_for_pilot_unlock' : 'no_go_remote_config_missing';
  const contract = {
    schema: 'idb.w80-execute-hosted-resolver-remote-smoke.v1',
    status: remoteSmokeExecuted ? 'remote_smoke_executed' : 'blocked_remote_config_missing_local_hosted_smoke_passed',
    objective: 'Execute hosted resolver smoke, using a real remote HTTPS endpoint when configured and a local production-mode endpoint to improve confidence before remote unlock.',
    localHostedEndpointSmoke: {
      executed: true,
      mode: localHosted.mode,
      bindError: localHosted.bindError || null,
      baseUrlRedacted: localHosted.baseUrlRedacted,
      healthStatus: localHosted.smoke.health.status,
      approvedPreflightStatus: localHosted.smoke.approvedPreflight.status,
      blockedPreflightStatus: localHosted.smoke.blockedPreflight.status,
      missingTokenStatus: localHosted.smoke.missingToken.status,
      cookieRejectedStatus: localHosted.smoke.cookieRejected.status,
      writeRejectedStatus: localHosted.smoke.writeRejected.status,
      firstResolveStatus: localHosted.smoke.first.status,
      secondResolveStatus: localHosted.smoke.second.status,
      secondCacheHit: localHosted.smoke.second.body.cacheHit,
      failureStatesNoGuess: [localHosted.smoke.blocked, localHosted.smoke.unavailable].every((item) => item.body.evidence.signals.laneCandidates.length === 0),
      noSecretTrace: !JSON.stringify(localHosted.endpointTrace).includes(LOCAL_TOKEN)
    },
    remoteSmoke: {
      executable: canRunRemote,
      executed: remoteSmokeExecuted,
      observedEnvironment: observedRemoteEnv,
      error: remoteExecutionError,
      result: remoteSmoke ? {
        healthStatus: remoteSmoke.health.status,
        approvedPreflightStatus: remoteSmoke.approvedPreflight.status,
        blockedPreflightStatus: remoteSmoke.blockedPreflight.status,
        missingTokenStatus: remoteSmoke.missingToken.status,
        writeRejectedStatus: remoteSmoke.writeRejected.status,
        secondCacheHit: remoteSmoke.second.body && remoteSmoke.second.body.cacheHit
      } : null
    },
    pilotDecision: {
      decision: pilotDecision,
      hostedResolverPilotEnabled: false,
      consultantSmokeEligible: remoteSmokeExecuted,
      reason: remoteSmokeExecuted
        ? 'Remote smoke executed; run the consultant pilot unlock gate before enabling traffic.'
        : 'Local hosted endpoint smoke passed, but no real HTTPS remote endpoint smoke executed.'
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
      block: remoteSmokeExecuted ? 'W81: Hosted Resolver Consultant Pilot Unlock Smoke' : 'W80R: Provision Real HTTPS Endpoint And Rerun Remote Smoke',
      prompt: remoteSmokeExecuted
        ? 'Move through W81: Hosted Resolver Consultant Pilot Unlock Smoke. Use the W80 remoteSmokeExecuted=true result to run hosted-only drawer consultant smoke across Plan, Review, ROI/Competitive, Run, and Trace with resolver status, evidence coverage, failure-state UX, rollback toggle, and no-secret trace checks. Keep SuiteScript writes disabled, preserve N/LLM advisory-only, notes story-only, and blocked/thin/unavailable/timeout as insufficient evidence with no confident guesses. Output consultant smoke result, pilot unlock decision, W81 report, validator gates, and best next Codex prompt.'
        : 'Move through W80R: Provision Real HTTPS Endpoint And Rerun Remote Smoke. Deploy or identify the real HTTPS staging websiteResolverServiceV1 endpoint using the W79A deployment package, set IDB_REMOTE_RESOLVER_BASE_URL, IDB_REMOTE_RESOLVER_TOKEN, IDB_REMOTE_RESOLVER_ALLOWED_ORIGIN, IDB_REMOTE_RESOLVER_BLOCKED_ORIGIN, and IDB_REMOTE_RESOLVER_SMOKE=1 in a protected shell, then rerun W80. Do not store secrets in repo files, traces, reports, screenshots, or chat. Keep hosted consultant pilot disabled until remoteSmokeExecuted=true. Output remote execution result, exact no-go remediation if blocked, W80R report, validator gates, and best next Codex prompt.'
    }
  };
  writeJson(dataPath, contract);

  const trace = {
    schema: 'idb.w80-execute-hosted-resolver-remote-smoke-trace.v1',
    generated: new Date().toISOString(),
    decision,
    remoteSmokeExecuted,
    pilotDecision,
    localHostedEndpointSmoke: contract.localHostedEndpointSmoke,
    remoteSmoke: contract.remoteSmoke,
    noRegression: contract.noRegression,
    bestNextCodexPrompt: contract.bestNextCodexPrompt,
    results
  };
  writeJson(tracePath, trace);

  const rows = results.map((result) => `| ${result.pass ? 'PASS' : 'FAIL'} | ${result.name} | ${escapeTable(result.detail)} |`).join('\n');
  const failureRows = failures.map((result) => `- ${result.name}: ${result.detail}`).join('\n') || '- None';
  const report = `# W80 Execute Hosted Resolver Remote Smoke

Decision: ${decision} / ${remoteSmokeExecuted ? 'REMOTE SMOKE EXECUTED' : 'REMOTE SMOKE BLOCKED'} / LOCAL HOSTED ENDPOINT SMOKE ${contract.localHostedEndpointSmoke.executed ? 'PASSED' : 'NOT RUN'} / NO WRITE AUTHORITY

## Objective

Execute hosted resolver smoke. Use a real remote HTTPS endpoint when configured, and run a local production-mode hosted endpoint smoke to improve confidence without pretending it is remote proof.

## Current Position

${remoteSmokeExecuted ? 'Remote HTTPS smoke executed. Review W81 unlock gates before enabling consultant traffic.' : 'A local production-mode hosted endpoint smoke passed, but no real HTTPS remote endpoint is configured. Hosted consultant pilot remains no-go.'}

## Local Hosted Endpoint Smoke

- Executed: yes
- Mode: ${contract.localHostedEndpointSmoke.mode}
- Bind error: ${contract.localHostedEndpointSmoke.bindError || 'None'}
- Health: ${contract.localHostedEndpointSmoke.healthStatus}
- Approved CORS preflight: ${contract.localHostedEndpointSmoke.approvedPreflightStatus}
- Blocked CORS preflight: ${contract.localHostedEndpointSmoke.blockedPreflightStatus}
- Missing token: ${contract.localHostedEndpointSmoke.missingTokenStatus}
- Cookie rejected: ${contract.localHostedEndpointSmoke.cookieRejectedStatus}
- Write payload rejected: ${contract.localHostedEndpointSmoke.writeRejectedStatus}
- Cache hit on second resolve: ${contract.localHostedEndpointSmoke.secondCacheHit}
- Failure states no confident guess: ${contract.localHostedEndpointSmoke.failureStatesNoGuess}
- No secret trace: ${contract.localHostedEndpointSmoke.noSecretTrace}

## Remote Smoke

- Executable: ${canRunRemote}
- Executed: ${remoteSmokeExecuted}
- Error: ${remoteExecutionError || 'None'}
- Hosted resolver pilot enabled: no

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
  console.log(`W80 hosted resolver remote smoke harness: ${decision} remote_smoke_executed=${remoteSmokeExecuted} local_hosted_smoke=true pilot_decision=${pilotDecision}`);
  if (failures.length) {
    console.error(failures);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
