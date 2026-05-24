const fs = require('fs');
const http = require('http');
const path = require('path');
const vm = require('vm');

const {
  createMemoryCache,
  createRateTracker,
  createStagingResolverHttpServer
} = require('./website_resolver_staging_endpoint');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const contractPath = path.join(root, 'data', 'w71_local_end_to_end_hosted_resolver_pilot_smoke.json');
const w70TracePath = path.join(root, 'trace_samples', 'w70_drawer_hosted_resolver_endpoint_toggle_smoke_trace.json');
const tracePath = path.join(root, 'trace_samples', 'w71_local_e2e_hosted_resolver_pilot_smoke_trace.json');
const reportPath = path.join(root, 'reports', 'w71_local_end_to_end_hosted_resolver_pilot_smoke.md');

const TOKEN = 'local-staging-token';
const ORIGIN = 'https://YOUR_ACCOUNT_ID.app.netsuite.com';
const FIXED_NOW = '2026-05-12T23:45:00.000Z';

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

function startServer() {
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
  const server = createStagingResolverHttpServer({
    token: TOKEN,
    allowedOrigins: [ORIGIN],
    cache: createMemoryCache(),
    rateTracker: createRateTracker({ perTokenPerMinute: 100, perDomainPerMinute: 100 }),
    now: FIXED_NOW,
    nowMs: () => 1778629500000,
    resolverOptions: {
      now: FIXED_NOW,
      dnsResolver: allowPublicDns,
      fetchClient
    }
  });
  server.fetchCalls = fetchClient.calls;
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      resolve({ server, port: address.port, fetchCalls: fetchClient.calls });
    });
  });
}

function closeServer(server) {
  return new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}

function httpJsonRequest(options, body) {
  return new Promise((resolve, reject) => {
    const request = http.request(options, (response) => {
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf8');
        let parsed = null;
        try {
          parsed = text ? JSON.parse(text) : null;
        } catch (error) {
          reject(error);
          return;
        }
        resolve({ status: response.statusCode, headers: response.headers, body: parsed });
      });
    });
    request.on('error', reject);
    if (body) request.write(JSON.stringify(body));
    request.end();
  });
}

function makeStorage(seed = {}) {
  const store = new Map(Object.entries(seed));
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
    dump: () => Object.fromEntries(store.entries())
  };
}

function loadHooks(endpointUrl, storageSeed = {}) {
  const storage = makeStorage(storageSeed);
  const gmCalls = [];
  const sandbox = {
    console,
    Date,
    JSON,
    Math,
    RegExp,
    String,
    Number,
    Boolean,
    Array,
    Object,
    Set,
    Map,
    URL,
    Promise,
    encodeURIComponent,
    decodeURIComponent,
    setTimeout: (fn) => {
      if (typeof fn === 'function') fn();
      return 0;
    },
    clearTimeout: () => {},
    fetch: () => Promise.reject(new Error('fetch path disabled; W71 uses GM_xmlhttpRequest over HTTP')),
    GM_xmlhttpRequest: (request) => {
      gmCalls.push(request);
      const url = new URL(request.url);
      httpJsonRequest({
        method: request.method,
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        headers: request.headers || {}
      }, JSON.parse(request.data || '{}')).then((result) => {
        request.onload({ status: result.status, responseText: JSON.stringify(result.body), responseHeaders: JSON.stringify(result.headers) });
      }).catch((error) => request.onerror(error));
    },
    globalThis: null,
    window: {
      location: {
        href: `${ORIGIN}/app/center/card.nl`,
        origin: ORIGIN,
        pathname: '/app/center/card.nl',
        search: ''
      },
      localStorage: storage,
      addEventListener: () => {},
      removeEventListener: () => {},
      innerWidth: 1440
    },
    document: {
      title: 'NetSuite Home',
      readyState: 'loading',
      body: {
        innerText: '',
        contains: () => false,
        classList: { remove: () => {}, add: () => {} }
      },
      documentElement: { style: { setProperty: () => {} } },
      head: { appendChild: () => {} },
      createElement: () => ({
        setAttribute: () => {},
        appendChild: () => {},
        addEventListener: () => {},
        classList: { toggle: () => {}, add: () => {}, remove: () => {} },
        style: {}
      }),
      getElementById: () => null,
      addEventListener: () => {}
    },
    __IDB_ENABLE_TEST_HOOKS__: true
  };
  sandbox.globalThis = sandbox;
  sandbox.window.window = sandbox.window;
  sandbox.window.document = sandbox.document;
  sandbox.window.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(userscriptPath, 'utf8'), sandbox, { filename: userscriptPath });
  if (!sandbox.__IDB_TEST_HOOKS__) throw new Error('Missing IDB test hooks.');
  storage.setItem('idb.websiteResolver.endpoint.v1', endpointUrl);
  storage.setItem('idb.websiteResolver.token.v1', TOKEN);
  storage.setItem('idb.websiteResolver.localFallback.v1', '0');
  return { hooks: sandbox.__IDB_TEST_HOOKS__, gmCalls, storage };
}

function baseState(website, notes) {
  return {
    open: true,
    selectedLaneId: 'products_cpg',
    selectedMoveIndex: 0,
    selectedActionId: 'prove',
    intake: {
      customer: 'Trek Pilot Account',
      website,
      notes: notes || 'Sales notes say generic manufacturing and sales order flow; notes must not own identity.',
      websiteEvidence: '',
      scObjective: 'Prepare proof from hosted website resolver evidence.',
      competitor: '',
      decisionCriteria: ''
    },
    toggles: {},
    acceptedPacket: null,
    activeView: 'plan',
    setupEditMode: false,
    lanePickerOpen: false,
    storyBarCollapsed: false,
    storyBarCollapseManual: false,
    pilotResult: null,
    websiteEvidenceV1: null,
    pageContext: {
      title: 'NetSuite Home',
      url: `${ORIGIN}/app/center/card.nl`,
      pageType: 'NetSuite page',
      contextId: 'generic_netsuite_page',
      confidence: 'low',
      movePreference: ['Customer Record', 'Sales Order View'],
      capturedAt: FIXED_NOW
    }
  };
}

async function resolveWith(hooks, website) {
  const state = baseState(website);
  const result = await hooks.resolveWebsiteEvidenceViaServiceAdapter(state);
  const suggested = hooks.suggestedLaneFromIntake(state);
  if (suggested && suggested.lane) state.selectedLaneId = suggested.lane.id;
  const lane = hooks.getLane(state);
  const ux = hooks.websiteEvidenceUxModel(state, lane);
  return { state, result, suggested, lane, ux };
}

async function main() {
  const contract = readJson(contractPath);
  const w70Trace = readJson(w70TracePath);
  const results = [];
  const { server, port, fetchCalls } = await startServer();
  const endpointUrl = `http://127.0.0.1:${port}/idb/website-resolver/v1/resolve`;
  const healthUrl = `http://127.0.0.1:${port}/health`;
  let trace;

  try {
    const health = await httpJsonRequest({
      method: 'GET',
      hostname: '127.0.0.1',
      port,
      path: '/health',
      headers: { Origin: ORIGIN }
    });
    assertCase(results, 'w71_local_server_started_health_ok', health.status === 200 && health.body.serviceName === 'websiteResolverServiceV1' && health.body.writeAuthority === 'none' && health.body.suiteScriptInvocation === false && health.body.nllmAdvisoryOnly === true, JSON.stringify(health.body));

    const { hooks, gmCalls, storage } = loadHooks(endpointUrl);
    const config = hooks.resolverServiceAdapterConfig();
    assertCase(results, 'w71_drawer_config_points_to_real_local_server', config.endpoint === endpointUrl && config.tokenConfigured === true && config.hostedOnlyMode === true && config.localFallbackEnabled === false, JSON.stringify(config));

    const recommended = await resolveWith(hooks, 'https://trek.example/');
    const cached = await resolveWith(hooks, 'https://trek.example/');
    const blocked = await resolveWith(hooks, 'https://127.0.0.1/admin');
    const thin = await resolveWith(hooks, 'https://thin.example/');
    const unavailable = await resolveWith(hooks, 'https://down.example/');
    const timeout = await resolveWith(hooks, 'https://slow.example/');
    const failures = [blocked, thin, unavailable, timeout];

    assertCase(results, 'w71_gm_http_requests_reach_server_with_token_origin', gmCalls.length >= 6 && gmCalls.every((call) => call.url === endpointUrl && call.headers['X-IDB-Resolver-Token'] === TOKEN && call.headers.Origin === ORIGIN) && gmCalls.every((call) => !/recordId|suiteletUrl|writeToken|authorization/i.test(call.data)), JSON.stringify(gmCalls.map((call) => ({ url: call.url, headers: Object.keys(call.headers), data: call.data }))));
    assertCase(results, 'w71_recommended_case_website_owned_identity', recommended.result.status === 'resolved' && recommended.lane.id === 'dealer_hardgoods' && recommended.state.websiteEvidenceV1.signals.productSeed === 'Bicycle SKU' && recommended.state.websiteResolverRuntime.mode === 'service' && recommended.ux.whatIdbSaw.some((line) => /Resolver: service \/ resolved/.test(line)), JSON.stringify({ lane: recommended.lane.id, runtime: recommended.state.websiteResolverRuntime, productSeed: recommended.state.websiteEvidenceV1.signals.productSeed }));
    assertCase(results, 'w71_cache_hit_case_reuses_server_cache', cached.result.status === 'resolved' && cached.state.websiteEvidenceV1.cache.hit === true && server.endpoint.traces.some((entry) => entry.outcome === 'resolved_from_cache'), JSON.stringify({ cache: cached.state.websiteEvidenceV1.cache, serverOutcomes: server.endpoint.traces.map((entry) => entry.outcome) }));
    assertCase(results, 'w71_failure_cases_insufficient_no_guess', failures.every((item) => item.state.websiteEvidenceV1.confidence.state === 'insufficient_evidence' && item.state.websiteEvidenceV1.signals.laneCandidates.length === 0 && ['blocked', 'thin', 'unavailable', 'timeout'].includes(item.state.websiteEvidenceV1.failureState) && item.ux.whatIdbSaw.some((line) => /Failure state:/.test(line))), JSON.stringify(failures.map((item) => ({ failureState: item.state.websiteEvidenceV1.failureState, confidence: item.state.websiteEvidenceV1.confidence, laneCandidates: item.state.websiteEvidenceV1.signals.laneCandidates }))));

    storage.removeItem('idb.websiteResolver.endpoint.v1');
    storage.removeItem('idb.websiteResolver.token.v1');
    storage.removeItem('idb.websiteResolver.localFallback.v1');
    const rollbackConfig = hooks.resolverServiceAdapterConfig();
    const rollbackState = baseState('https://trek.example/');
    hooks.ensureWebsiteEvidenceRuntime(rollbackState);
    assertCase(results, 'w71_rollback_returns_to_local_fallback_only', rollbackConfig.endpointConfigured === false && rollbackConfig.tokenConfigured === false && rollbackConfig.localFallbackEnabled === true && rollbackState.websiteResolverRuntime.mode === 'local_fallback_only', JSON.stringify({ rollbackConfig, runtime: rollbackState.websiteResolverRuntime }));

    const traceCoverage = {
      websiteEvidenceV1: recommended.state.websiteEvidenceV1,
      websiteResolverRuntime: recommended.state.websiteResolverRuntime,
      websiteEvidenceUx: recommended.ux,
      resolverAdapter: recommended.state.websiteEvidenceV1.resolverAdapter,
      serverTraceOutcomes: server.endpoint.traces.map((entry) => entry.outcome)
    };
    assertCase(results, 'w71_plan_review_trace_export_coverage_present', recommended.ux.traceExportCoverage.includedInTraceExport === true && recommended.ux.whatIdbSaw.some((line) => /Hosted resolver: enabled; local fallback disabled/.test(line)) && recommended.state.websiteEvidenceV1.resolverAdapter.mode === 'service' && !JSON.stringify(traceCoverage).includes(TOKEN), JSON.stringify({ ux: recommended.ux.whatIdbSaw, traceExportCoverage: recommended.ux.traceExportCoverage, resolverAdapter: recommended.state.websiteEvidenceV1.resolverAdapter }));
    assertCase(results, 'w71_no_write_suitescript_nllm_boundaries_present', [recommended, cached, blocked, thin, unavailable, timeout].every((item) => item.state.websiteEvidenceV1.writeAuthority === 'none' && item.state.websiteEvidenceV1.nllmAdvisoryOnly === true && item.state.websiteEvidenceV1.noRegression.noSuiteScriptInvocation === true && item.state.websiteEvidenceV1.noRegression.notesCannotOwnIdentification === true && item.state.websiteEvidenceV1.noRegression.transactionWriteEnabled === false), JSON.stringify(contract.noRegression));
    assertCase(results, 'w71_contract_and_w70_handoff_present', contract.schema === 'idb.w71-local-end-to-end-hosted-resolver-pilot-smoke.v1' && contract.status === 'complete_local_e2e_pilot_smoke_ready' && w70Trace.decision === 'PASS' && contract.bestNextCodexPrompt.block === 'W72: Hosted Resolver Remote Deployment Readiness Gate', contract.schema);

    const failuresList = results.filter((result) => !result.pass);
    const decision = failuresList.length ? 'FAIL' : 'PASS';
    trace = {
      schema: 'idb.w71-local-e2e-hosted-resolver-pilot-smoke-trace.v1',
      generated: new Date().toISOString(),
      decision,
      readinessDecision: contract.readinessDecision,
      inheritedW70Decision: w70Trace.decision,
      localServer: {
        port,
        healthUrl,
        endpointUrl,
        healthSample: health
      },
      gmHttpRequests: gmCalls.map((call) => ({
        method: call.method,
        url: call.url,
        headers: Object.assign({}, call.headers, { 'X-IDB-Resolver-Token': '[configured-redacted]' }),
        data: JSON.parse(call.data)
      })),
      recommendedSample: {
        status: recommended.result.status,
        laneId: recommended.lane.id,
        runtime: recommended.state.websiteResolverRuntime,
        confidence: recommended.state.websiteEvidenceV1.confidence,
        productSeed: recommended.state.websiteEvidenceV1.signals.productSeed,
        ux: recommended.ux
      },
      cacheHitSample: {
        status: cached.result.status,
        cache: cached.state.websiteEvidenceV1.cache,
        serverTraceOutcomes: server.endpoint.traces.map((entry) => entry.outcome)
      },
      failureSamples: failures.map((item) => ({
        website: item.state.intake.website,
        failureState: item.state.websiteEvidenceV1.failureState,
        confidence: item.state.websiteEvidenceV1.confidence,
        laneCandidates: item.state.websiteEvidenceV1.signals.laneCandidates,
        ux: item.ux
      })),
      rollbackSample: {
        config: rollbackConfig,
        runtime: rollbackState.websiteResolverRuntime
      },
      traceCoverage,
      fetchCallCount: fetchCalls.length,
      noRegression: contract.noRegression,
      bestNextCodexPrompt: contract.bestNextCodexPrompt,
      results
    };
    fs.writeFileSync(tracePath, `${JSON.stringify(trace, null, 2)}\n`);

    const rows = results.map((result) => `| ${result.pass ? 'PASS' : 'FAIL'} | ${result.name} | ${escapeTable(result.detail)} |`).join('\n');
    const failureRows = failuresList.map((result) => `- ${result.name}: ${result.detail}`).join('\n') || '- None';
    const report = `# W71 Local End-To-End Hosted Resolver Pilot Smoke

Decision: ${decision} / LOCAL E2E HOSTED RESOLVER SMOKE READY / REMOTE HOSTING NOT DEPLOYED / NO WRITE AUTHORITY

## Objective

Run the local staging \`websiteResolverServiceV1\` server and drawer hosted-toggle path together in an end-to-end pilot-shaped smoke.

## Completed

- Started the local staging resolver HTTP server on an ephemeral localhost port.
- Configured the drawer endpoint, token, and hosted-only fallback toggles.
- Exercised the drawer \`GM_xmlhttpRequest\` path over actual local HTTP.
- Tested recommended, blocked, thin, unavailable, timeout, cache-hit, and rollback cases.
- Verified Plan/Review/Trace evidence coverage and no-write boundaries.

## Local Server

- Health: \`${healthUrl}\`
- Resolve: \`${endpointUrl}\`

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
    console.log(`Local E2E hosted resolver pilot smoke harness: ${decision} (${results.length - failuresList.length}/${results.length})`);
    if (failuresList.length) {
      console.error(failuresList);
      process.exitCode = 1;
    }
  } finally {
    await closeServer(server);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
