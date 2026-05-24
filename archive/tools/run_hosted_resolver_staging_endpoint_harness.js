const fs = require('fs');
const path = require('path');

const {
  createMemoryCache,
  createRateTracker,
  createStagingResolverEndpoint,
  safeManualEvidence
} = require('./website_resolver_staging_endpoint');

const root = path.resolve(__dirname, '..');
const contractPath = path.join(root, 'data', 'w69_hosted_resolver_staging_endpoint_implementation.json');
const w68TracePath = path.join(root, 'trace_samples', 'w68_staging_resolver_endpoint_smoke_trace.json');
const tracePath = path.join(root, 'trace_samples', 'w69_hosted_resolver_staging_endpoint_trace.json');
const reportPath = path.join(root, 'reports', 'w69_hosted_resolver_staging_endpoint_implementation.md');

const FIXED_NOW = '2026-05-12T22:45:00.000Z';
const TOKEN = 'local-staging-token';
const ALLOWED_ORIGIN = 'https://YOUR_ACCOUNT_ID.app.netsuite.com';
const BLOCKED_ORIGIN = 'https://unapproved.example.com';

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
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
    if (!response) {
      return { url, status: 0, headers: {}, contentType: '', body: '', pageBytes: 0, error: { type: 'dns_or_network_error', message: `No mock response for ${url}` } };
    }
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

async function allowPublicDns(hostname) {
  if (/private-target/.test(hostname)) return [{ address: '10.0.0.8', family: 4 }];
  return [{ address: '93.184.216.34', family: 4 }];
}

function authHeaders(origin = ALLOWED_ORIGIN, token = TOKEN) {
  return {
    origin,
    'content-type': 'application/json',
    'x-idb-resolver-token': token
  };
}

function createEndpoint(extra = {}) {
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
    'https://thin.example/': {
      body: html('Welcome', '<h1>Welcome</h1><p>We help customers.</p>')
    },
    'https://down.example/': {
      status: 503,
      body: 'down'
    },
    'https://slow.example/': {
      error: { type: 'timeout', message: 'Overall timeout.' }
    }
  });
  const endpoint = createStagingResolverEndpoint(Object.assign({
    token: TOKEN,
    allowedOrigins: [ALLOWED_ORIGIN],
    cache: createMemoryCache(),
    rateTracker: createRateTracker({ perTokenPerMinute: 100, perDomainPerMinute: 100 }),
    now: FIXED_NOW,
    nowMs: () => 1778625900000,
    resolverOptions: {
      now: FIXED_NOW,
      dnsResolver: allowPublicDns,
      fetchClient
    }
  }, extra));
  endpoint.fetchCalls = fetchClient.calls;
  return endpoint;
}

async function main() {
  const contract = readJson(contractPath);
  const w68Trace = readJson(w68TracePath);
  const results = [];
  const endpoint = createEndpoint();

  const health = await endpoint.handle({ method: 'GET', path: '/health', headers: { origin: ALLOWED_ORIGIN }, requestId: 'health' });
  assertCase(results, 'w69_health_endpoint_no_write', health.status === 200 && health.body.serviceName === 'websiteResolverServiceV1' && health.body.writeAuthority === 'none' && health.body.suiteScriptInvocation === false && health.body.nllmAdvisoryOnly === true && health.body.cacheStatus === 'ready', JSON.stringify(health.body));

  const preflight = await endpoint.handle({ method: 'OPTIONS', path: '/idb/website-resolver/v1/resolve', headers: { origin: ALLOWED_ORIGIN }, requestId: 'preflight' });
  const blockedPreflight = await endpoint.handle({ method: 'OPTIONS', path: '/idb/website-resolver/v1/resolve', headers: { origin: BLOCKED_ORIGIN }, requestId: 'blocked_preflight' });
  assertCase(results, 'w69_cors_allowlist_enforced', preflight.status === 204 && preflight.headers['Access-Control-Allow-Origin'] === ALLOWED_ORIGIN && blockedPreflight.status === 403 && !blockedPreflight.headers['Access-Control-Allow-Origin'], JSON.stringify({ preflight, blockedPreflight }));

  const beforeRejectedFetches = endpoint.fetchCalls.length;
  const missingToken = await endpoint.handle({ method: 'POST', path: '/idb/website-resolver/v1/resolve', headers: { origin: ALLOWED_ORIGIN }, body: { url: 'https://trek.example/' }, requestId: 'missing_token' });
  const badToken = await endpoint.handle({ method: 'POST', path: '/idb/website-resolver/v1/resolve', headers: authHeaders(ALLOWED_ORIGIN, 'bad-token'), body: { url: 'https://trek.example/' }, requestId: 'bad_token' });
  const cookieRejected = await endpoint.handle({ method: 'POST', path: '/idb/website-resolver/v1/resolve', headers: Object.assign(authHeaders(), { cookie: 'NS_VER=secret' }), body: { url: 'https://trek.example/' }, requestId: 'cookie_rejected' });
  const authRejected = await endpoint.handle({ method: 'POST', path: '/idb/website-resolver/v1/resolve', headers: Object.assign(authHeaders(), { authorization: 'Bearer secret' }), body: { url: 'https://trek.example/' }, requestId: 'auth_rejected' });
  const writeRejected = await endpoint.handle({ method: 'POST', path: '/idb/website-resolver/v1/resolve', headers: authHeaders(), body: { url: 'https://trek.example/', recordId: '123', suiteletUrl: 'https://netsuite.example/script', createEnabled: true }, requestId: 'write_rejected' });
  assertCase(results, 'w69_auth_cookie_and_write_rejections_before_fetch', missingToken.status === 401 && badToken.status === 401 && cookieRejected.status === 400 && authRejected.status === 400 && writeRejected.status === 400 && endpoint.fetchCalls.length === beforeRejectedFetches && writeRejected.body.error === 'no_write_boundary_violation', JSON.stringify({ missingToken: missingToken.status, badToken: badToken.status, cookieRejected: cookieRejected.status, authRejected: authRejected.status, writeRejected: writeRejected.body }));

  const first = await endpoint.handle({ method: 'POST', path: '/idb/website-resolver/v1/resolve', headers: authHeaders(), body: { url: 'https://trek.example/', requestId: 'trek_first', maxPages: 4 }, requestId: 'trek_first' });
  const second = await endpoint.handle({ method: 'POST', path: '/idb/website-resolver/v1/resolve', headers: authHeaders(), body: { url: 'https://trek.example/', requestId: 'trek_second', maxPages: 4 }, requestId: 'trek_second' });
  assertCase(results, 'w69_resolve_endpoint_returns_evidence_and_cache_hit', first.status === 200 && first.body.evidence.schema === 'idb.website-evidence.v1' && first.body.evidence.writeAuthority === 'none' && first.body.evidence.signals.laneCandidates[0].laneId === 'dealer_hardgoods' && first.body.cacheHit === false && second.status === 200 && second.body.cacheHit === true && second.body.evidence.cache.hit === true, JSON.stringify({ first: first.body.status, lane: first.body.evidence.signals.laneCandidates[0], secondCacheHit: second.body.cacheHit }));

  const blocked = await endpoint.handle({ method: 'POST', path: '/idb/website-resolver/v1/resolve', headers: authHeaders(), body: { url: 'https://127.0.0.1/admin', requestId: 'blocked' }, requestId: 'blocked' });
  const thin = await endpoint.handle({ method: 'POST', path: '/idb/website-resolver/v1/resolve', headers: authHeaders(), body: { url: 'https://thin.example/', requestId: 'thin' }, requestId: 'thin' });
  const unavailable = await endpoint.handle({ method: 'POST', path: '/idb/website-resolver/v1/resolve', headers: authHeaders(), body: { url: 'https://down.example/', requestId: 'unavailable' }, requestId: 'unavailable' });
  const timeout = await endpoint.handle({ method: 'POST', path: '/idb/website-resolver/v1/resolve', headers: authHeaders(), body: { url: 'https://slow.example/', requestId: 'timeout' }, requestId: 'timeout' });
  const failureResponses = [blocked, thin, unavailable, timeout].map((item) => item.body.evidence);
  assertCase(results, 'w69_failure_states_remain_insufficient_no_guess', failureResponses.every((evidence) => ['blocked', 'thin', 'unavailable', 'timeout'].includes(evidence.failureState) && evidence.confidence.state === 'insufficient_evidence' && evidence.signals.laneCandidates.length === 0 && evidence.writeAuthority === 'none'), JSON.stringify(failureResponses.map((item) => ({ failureState: item.failureState, confidence: item.confidence, laneCandidates: item.signals.laneCandidates }))));

  const manual = await endpoint.handle({
    method: 'POST',
    path: '/idb/website-resolver/v1/resolve',
    headers: authHeaders(),
    body: {
      url: 'https://127.0.0.1/admin',
      requestId: 'manual_blocked',
      manualEvidence: 'Manufacturer of workwear, boots, safety apparel, and seasonal footwear collections.'
    },
    requestId: 'manual_blocked'
  });
  const redacted = safeManualEvidence('Manufacturer of workwear, boots, safety apparel, and seasonal footwear collections.');
  assertCase(results, 'w69_manual_evidence_redacted_and_no_write', manual.status === 200 && manual.body.evidence.failureState === 'blocked' && manual.body.evidence.manualEvidence.storedAs === 'excerpt_hash_only' && manual.body.evidence.manualEvidence.excerptHash === redacted.excerptHash && !JSON.stringify(endpoint.traces).includes('Manufacturer of workwear, boots, safety apparel') && manual.body.evidence.writeAuthority === 'none', JSON.stringify(manual.body.evidence.manualEvidence));

  const lowRateEndpoint = createEndpoint({
    cache: createMemoryCache(),
    rateTracker: createRateTracker({ perTokenPerMinute: 2, perDomainPerMinute: 2 }),
    rateLimits: { perTokenPerMinute: 2, perDomainPerMinute: 2 }
  });
  await lowRateEndpoint.handle({ method: 'POST', path: '/idb/website-resolver/v1/resolve', headers: authHeaders(), body: { url: 'https://thin.example/', requestId: 'rate_1' }, requestId: 'rate_1' });
  await lowRateEndpoint.handle({ method: 'POST', path: '/idb/website-resolver/v1/resolve', headers: authHeaders(), body: { url: 'https://thin.example/', requestId: 'rate_2' }, requestId: 'rate_2' });
  const rateLimited = await lowRateEndpoint.handle({ method: 'POST', path: '/idb/website-resolver/v1/resolve', headers: authHeaders(), body: { url: 'https://thin.example/', requestId: 'rate_3' }, requestId: 'rate_3' });
  assertCase(results, 'w69_rate_limit_guard_present', rateLimited.status === 429 && rateLimited.body.error === 'rate_limited', JSON.stringify(rateLimited.body));

  const requiredOutcomes = contract.observability.requiredOutcomes;
  const traceOutcomes = endpoint.traces.map((item) => item.outcome).concat(lowRateEndpoint.traces.map((item) => item.outcome));
  assertCase(results, 'w69_observability_outcomes_and_redaction_present', ['health_ok', 'cors_preflight_ok', 'cors_origin_denied', 'resolver_token_rejected', 'netsuite_cookie_or_auth_rejected', 'no_write_boundary_violation', 'resolved_from_fetch', 'resolved_from_cache'].every((outcome) => traceOutcomes.includes(outcome)) && endpoint.traces.every((trace) => trace.redaction && trace.redaction.cookiesLogged === false && trace.redaction.authorizationLogged === false && trace.redaction.manualEvidenceFullTextLogged === false), JSON.stringify(traceOutcomes));

  assertCase(results, 'w69_contract_and_w68_handoff_present', contract.schema === 'idb.w69-hosted-resolver-staging-endpoint-implementation.v1' && contract.status === 'complete_local_staging_endpoint_ready' && w68Trace.decision === 'PASS' && /node tools\/website_resolver_staging_endpoint\.js/.test(contract.implementation.localServerMode.command), contract.schema);
  assertCase(results, 'w69_no_regression_boundaries_present', contract.noRegression.writeAuthority === 'none' && contract.noRegression.suiteScriptInvocation === false && contract.noRegression.nllmAdvisoryOnly === true && contract.noRegression.notesCannotOwnIdentification === true && contract.noRegression.blockedThinUnavailableTimeoutDoNotGuess === true && contract.noRegression.transactionWriteEnabled === false && [first, blocked, thin, unavailable, timeout, manual].every((item) => item.body.writeAuthority === 'none' && item.body.suiteScriptInvocation === false && item.body.nllmAdvisoryOnly === true), JSON.stringify(contract.noRegression));
  assertCase(results, 'w69_best_next_prompt_present', contract.bestNextCodexPrompt.block === 'W70: Drawer Hosted Resolver Endpoint Toggle Smoke' && /Move through W70/.test(contract.bestNextCodexPrompt.prompt), contract.bestNextCodexPrompt.prompt);

  const failures = results.filter((result) => !result.pass);
  const decision = failures.length ? 'FAIL' : 'PASS';
  const trace = {
    schema: 'idb.w69-hosted-resolver-staging-endpoint-trace.v1',
    generated: new Date().toISOString(),
    decision,
    readinessDecision: contract.readinessDecision,
    inheritedW68Decision: w68Trace.decision,
    localServerMode: contract.implementation.localServerMode,
    healthSample: {
      status: health.status,
      body: health.body
    },
    authCorsSamples: {
      preflight: { status: preflight.status, headers: preflight.headers },
      blockedPreflight: { status: blockedPreflight.status, headers: blockedPreflight.headers },
      missingToken: { status: missingToken.status, body: missingToken.body },
      badToken: { status: badToken.status, body: badToken.body },
      cookieRejected: { status: cookieRejected.status, body: cookieRejected.body },
      writeRejected: { status: writeRejected.status, body: writeRejected.body }
    },
    cacheSample: {
      first: { status: first.status, cacheHit: first.body.cacheHit, confidence: first.body.evidence.confidence, laneCandidates: first.body.evidence.signals.laneCandidates },
      second: { status: second.status, cacheHit: second.body.cacheHit, evidenceCacheHit: second.body.evidence.cache.hit }
    },
    failureSamples: failureResponses.map((evidence) => ({
      requestId: evidence.requestId,
      failureState: evidence.failureState,
      confidence: evidence.confidence,
      laneCandidates: evidence.signals.laneCandidates,
      writeAuthority: evidence.writeAuthority
    })),
    manualEvidenceSample: {
      status: manual.status,
      failureState: manual.body.evidence.failureState,
      manualEvidence: manual.body.evidence.manualEvidence,
      writeAuthority: manual.body.evidence.writeAuthority
    },
    rateLimitSample: {
      status: rateLimited.status,
      body: rateLimited.body
    },
    observabilityTraceSample: endpoint.traces,
    noRegression: contract.noRegression,
    bestNextCodexPrompt: contract.bestNextCodexPrompt,
    results
  };
  fs.writeFileSync(tracePath, `${JSON.stringify(trace, null, 2)}\n`);

  const rows = results.map((result) => `| ${result.pass ? 'PASS' : 'FAIL'} | ${result.name} | ${escapeTable(result.detail)} |`).join('\n');
  const failureRows = failures.map((result) => `- ${result.name}: ${result.detail}`).join('\n') || '- None';
  const report = `# W69 Hosted Resolver Staging Endpoint Implementation

Decision: ${decision} / LOCAL STAGING ENDPOINT READY / EXTERNAL HOSTING NOT DEPLOYED / NO WRITE AUTHORITY

## Objective

Build the staging no-write \`websiteResolverServiceV1\` endpoint wrapper around the local resolver service.

## Completed

- Added \`tools/website_resolver_staging_endpoint.js\` with health, resolve, auth/CORS, cache, rate limits, redacted trace, and local server mode.
- Health endpoint proves resolver version, extraction policy, cache readiness, no write authority, no SuiteScript invocation, and advisory-only N/LLM.
- Resolve endpoint wraps \`idb.website-evidence.v1\` without accepting NetSuite cookies, authorization headers, SuiteScript fields, record IDs, or write toggles.
- Staging cache returns cache hits for eligible repeated evidence requests and avoids manual evidence full text.
- Failure states remain insufficient evidence with no lane candidates.
- Manual evidence fallback is visible, hash/excerpt-only, and never write-authoritative.

## Local Staging Run

\`\`\`bash
${contract.implementation.localServerMode.command}
\`\`\`

Health: \`${contract.implementation.localServerMode.healthUrl}\`

Resolve: \`${contract.implementation.localServerMode.resolveUrl}\`

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
  console.log(`Hosted resolver staging endpoint harness: ${decision} (${results.length - failures.length}/${results.length})`);
  if (failures.length) {
    console.error(failures);
    process.exit(1);
  }
}

main();
