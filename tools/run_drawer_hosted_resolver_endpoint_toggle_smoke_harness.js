const fs = require('fs');
const path = require('path');
const vm = require('vm');

const {
  createMemoryCache,
  createRateTracker,
  createStagingResolverEndpoint
} = require('./website_resolver_staging_endpoint');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const contractPath = path.join(root, 'data', 'w70_drawer_hosted_resolver_endpoint_toggle_smoke.json');
const w69TracePath = path.join(root, 'trace_samples', 'w69_hosted_resolver_staging_endpoint_trace.json');
const tracePath = path.join(root, 'trace_samples', 'w70_drawer_hosted_resolver_endpoint_toggle_smoke_trace.json');
const reportPath = path.join(root, 'reports', 'w70_drawer_hosted_resolver_endpoint_toggle_smoke.md');

const TOKEN = 'local-staging-token';
const ORIGIN = 'https://YOUR_ACCOUNT_ID.app.netsuite.com';
const ENDPOINT_URL = 'http://127.0.0.1:8787/idb/website-resolver/v1/resolve';
const FIXED_NOW = '2026-05-12T23:15:00.000Z';

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function assertCase(results, name, pass, detail) {
  results.push({ name, pass: !!pass, detail: detail || '' });
}

function escapeTable(value) {
  return String(value == null ? '' : value).replace(/\|/g, '/');
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

function createLocalStagingEndpoint() {
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
  const endpoint = createStagingResolverEndpoint({
    token: TOKEN,
    allowedOrigins: [ORIGIN],
    cache: createMemoryCache(),
    rateTracker: createRateTracker({ perTokenPerMinute: 100, perDomainPerMinute: 100 }),
    now: FIXED_NOW,
    nowMs: () => 1778627700000,
    resolverOptions: {
      now: FIXED_NOW,
      dnsResolver: allowPublicDns,
      fetchClient
    }
  });
  endpoint.fetchCalls = fetchClient.calls;
  return endpoint;
}

function loadHooks(endpoint, storageSeed = {}) {
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
    fetch: () => Promise.reject(new Error('fetch path disabled; W70 uses GM_xmlhttpRequest')),
    GM_xmlhttpRequest: (request) => {
      gmCalls.push(request);
      Promise.resolve(endpoint.handle({
        method: request.method,
        path: new URL(request.url).pathname,
        headers: request.headers || {},
        body: JSON.parse(request.data || '{}'),
        requestId: 'gm-request'
      })).then((result) => {
        if (result.status >= 400) {
          request.onload({ status: result.status, responseText: JSON.stringify(result.body) });
          return;
        }
        request.onload({ status: result.status, responseText: JSON.stringify(result.body) });
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
      notes: notes || 'Sales notes say generic manufacturing and sales order flow; these notes must not own identity.',
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
  const w69Trace = readJson(w69TracePath);
  const endpoint = createLocalStagingEndpoint();
  const userscript = fs.readFileSync(userscriptPath, 'utf8');
  const results = [];
  const storageSeed = {
    'idb.websiteResolver.endpoint.v1': ENDPOINT_URL,
    'idb.websiteResolver.token.v1': TOKEN,
    'idb.websiteResolver.localFallback.v1': '0'
  };
  const { hooks, gmCalls, storage } = loadHooks(endpoint, storageSeed);

  const config = hooks.resolverServiceAdapterConfig();
  assertCase(results, 'w70_endpoint_token_hosted_only_configured', config.endpoint === ENDPOINT_URL && config.endpointConfigured === true && config.tokenConfigured === true && config.authHeaderName === 'X-IDB-Resolver-Token' && config.localFallbackEnabled === false && config.hostedOnlyMode === true && config.writeAuthority === 'none' && config.suiteScriptInvocation === false, JSON.stringify(config));

  const recommended = await resolveWith(hooks, 'https://trek.example/');
  assertCase(results, 'w70_drawer_calls_local_staging_endpoint_with_token_header', gmCalls.length >= 1 && gmCalls[0].url === ENDPOINT_URL && gmCalls[0].headers['X-IDB-Resolver-Token'] === TOKEN && gmCalls[0].headers.Origin === ORIGIN && !/recordId|suiteletUrl|writeToken|authorization/i.test(gmCalls[0].data), JSON.stringify({ url: gmCalls[0].url, headers: Object.keys(gmCalls[0].headers), data: gmCalls[0].data }));
  assertCase(results, 'w70_hosted_evidence_owns_identity_notes_story_only', recommended.result.status === 'resolved' && recommended.state.websiteResolverRuntime.mode === 'service' && recommended.state.websiteResolverRuntime.hostedOnlyMode === true && recommended.lane.id === 'dealer_hardgoods' && recommended.state.websiteEvidenceV1.signals.productSeed === 'Bicycle SKU', JSON.stringify({ result: recommended.result.status, runtime: recommended.state.websiteResolverRuntime, lane: recommended.lane.id, seed: recommended.state.websiteEvidenceV1.signals.productSeed }));
  assertCase(results, 'w70_plan_review_status_display_present', recommended.ux.whatIdbSaw.some((line) => /Resolver: service \/ resolved/.test(line)) && recommended.ux.whatIdbSaw.some((line) => /Hosted resolver: enabled; local fallback disabled/.test(line)) && recommended.ux.whatIdbSaw.some((line) => /Resolver auth: token header configured/.test(line)) && recommended.ux.confidence.hostedOnlyMode === true && recommended.ux.confidence.tokenConfigured === true, JSON.stringify(recommended.ux.whatIdbSaw));

  const blocked = await resolveWith(hooks, 'https://127.0.0.1/admin');
  const thin = await resolveWith(hooks, 'https://thin.example/');
  const unavailable = await resolveWith(hooks, 'https://down.example/');
  const timeout = await resolveWith(hooks, 'https://slow.example/');
  const failures = [blocked, thin, unavailable, timeout];
  assertCase(results, 'w70_failure_state_ux_no_confident_guesses', failures.every((item) => item.state.websiteEvidenceV1.confidence.state === 'insufficient_evidence' && item.state.websiteEvidenceV1.signals.laneCandidates.length === 0 && item.ux.confidence.requiresConfirmation === true && item.ux.whatIdbSaw.some((line) => /Failure state:/.test(line))), JSON.stringify(failures.map((item) => ({ failureState: item.state.websiteEvidenceV1.failureState, confidence: item.state.websiteEvidenceV1.confidence, whatIdbSaw: item.ux.whatIdbSaw }))));

  storage.removeItem('idb.websiteResolver.endpoint.v1');
  storage.removeItem('idb.websiteResolver.token.v1');
  storage.removeItem('idb.websiteResolver.localFallback.v1');
  const rollbackConfig = hooks.resolverServiceAdapterConfig();
  const rollbackState = baseState('https://trek.example/');
  hooks.ensureWebsiteEvidenceRuntime(rollbackState);
  assertCase(results, 'w70_local_fallback_rollback_path_present', rollbackConfig.endpointConfigured === false && rollbackConfig.tokenConfigured === false && rollbackConfig.localFallbackEnabled === true && rollbackState.websiteResolverRuntime.mode === 'local_fallback_only', JSON.stringify({ rollbackConfig, runtime: rollbackState.websiteResolverRuntime }));

  const traceCoverage = {
    websiteEvidenceV1: recommended.state.websiteEvidenceV1,
    websiteResolverRuntime: recommended.state.websiteResolverRuntime,
    websiteEvidenceUx: recommended.ux,
    resolverAdapter: recommended.state.websiteEvidenceV1.resolverAdapter
  };
  assertCase(results, 'w70_trace_export_coverage_present', /websiteEvidenceUx: websiteEvidenceUxModel/.test(userscript) && /state,/.test(userscript) && traceCoverage.websiteEvidenceV1.writeAuthority === 'none' && traceCoverage.resolverAdapter.mode === 'service' && traceCoverage.websiteEvidenceUx.traceExportCoverage.includedInTraceExport === true && !JSON.stringify(traceCoverage).includes(TOKEN), JSON.stringify({ runtime: traceCoverage.websiteResolverRuntime, resolverAdapter: traceCoverage.resolverAdapter, traceExportCoverage: traceCoverage.websiteEvidenceUx.traceExportCoverage }));
  assertCase(results, 'w70_no_write_suitescript_nllm_boundaries_present', [recommended, blocked, thin, unavailable, timeout].every((item) => item.state.websiteEvidenceV1.writeAuthority === 'none' && item.state.websiteEvidenceV1.nllmAdvisoryOnly === true && item.state.websiteEvidenceV1.noRegression.noSuiteScriptInvocation === true && item.state.websiteEvidenceV1.noRegression.notesCannotOwnIdentification === true && item.state.websiteEvidenceV1.noRegression.transactionWriteEnabled === false), JSON.stringify(contract.noRegression));
  assertCase(results, 'w70_contract_and_w69_handoff_present', contract.schema === 'idb.w70-drawer-hosted-resolver-endpoint-toggle-smoke.v1' && contract.status === 'complete_drawer_hosted_toggle_smoke_ready' && w69Trace.decision === 'PASS' && contract.bestNextCodexPrompt.block === 'W71: Local End-To-End Hosted Resolver Pilot Smoke', contract.schema);

  const harnessTrace = {
    schema: 'idb.w70-drawer-hosted-resolver-endpoint-toggle-smoke-trace.v1',
    generated: new Date().toISOString(),
    decision: results.every((result) => result.pass) ? 'PASS' : 'FAIL',
    readinessDecision: contract.readinessDecision,
    inheritedW69Decision: w69Trace.decision,
    endpointConfig: config,
    gmRequestSample: gmCalls[0] ? {
      method: gmCalls[0].method,
      url: gmCalls[0].url,
      headers: Object.assign({}, gmCalls[0].headers, { 'X-IDB-Resolver-Token': '[configured-redacted]' }),
      data: JSON.parse(gmCalls[0].data)
    } : null,
    recommendedSample: {
      status: recommended.result.status,
      laneId: recommended.lane.id,
      runtime: recommended.state.websiteResolverRuntime,
      evidence: {
        confidence: recommended.state.websiteEvidenceV1.confidence,
        laneCandidates: recommended.state.websiteEvidenceV1.signals.laneCandidates,
        productSeed: recommended.state.websiteEvidenceV1.signals.productSeed,
        writeAuthority: recommended.state.websiteEvidenceV1.writeAuthority,
        nllmAdvisoryOnly: recommended.state.websiteEvidenceV1.nllmAdvisoryOnly
      },
      ux: recommended.ux
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
    noRegression: contract.noRegression,
    bestNextCodexPrompt: contract.bestNextCodexPrompt,
    results
  };
  const failuresList = results.filter((result) => !result.pass);
  fs.writeFileSync(tracePath, `${JSON.stringify(harnessTrace, null, 2)}\n`);

  const rows = results.map((result) => `| ${result.pass ? 'PASS' : 'FAIL'} | ${result.name} | ${escapeTable(result.detail)} |`).join('\n');
  const failureRows = failuresList.map((result) => `- ${result.name}: ${result.detail}`).join('\n') || '- None';
  const report = `# W70 Drawer Hosted Resolver Endpoint Toggle Smoke

Decision: ${harnessTrace.decision} / DRAWER HOSTED TOGGLE READY / LOCAL STAGING ONLY / NO WRITE AUTHORITY

## Objective

Wire and prove the drawer pilot toggle path against the local staging \`websiteResolverServiceV1\` endpoint.

## Completed

- Added drawer token/header placeholder through \`window.IDB_WEBSITE_RESOLVER_TOKEN\` and \`localStorage:idb.websiteResolver.token.v1\`.
- Added hosted-only fallback handling for \`false\`, \`0\`, \`off\`, \`disabled\`, and \`hosted_only\`.
- Proved the drawer sends the endpoint URL, resolver token header, and NetSuite origin to the local staging endpoint.
- Proved website evidence still owns identity while notes remain story-only.
- Proved Plan/Review evidence UX displays resolver status, hosted-only mode, token-configured status, and failure states.
- Proved rollback by clearing endpoint/token/fallback toggles.

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
  console.log(`Drawer hosted resolver endpoint toggle smoke harness: ${harnessTrace.decision} (${results.length - failuresList.length}/${results.length})`);
  if (failuresList.length) {
    console.error(failuresList);
    process.exit(1);
  }
}

main();
