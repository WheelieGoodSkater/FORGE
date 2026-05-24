const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const contractPath = path.join(root, 'data', 'w64_drawer_resolver_service_adapter.json');
const tracePath = path.join(root, 'trace_samples', 'w64_drawer_resolver_service_adapter_trace.json');
const failureUxPath = path.join(root, 'trace_samples', 'w64_failure_ux_samples.json');
const reportPath = path.join(root, 'reports', 'w64_drawer_resolver_service_adapter.md');

function makeStorage(seed = {}) {
  const store = new Map(Object.entries(seed));
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key)
  };
}

function loadHooks(mockResolver, storageSeed) {
  const storage = makeStorage(storageSeed);
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
    fetch: () => Promise.reject(new Error('network disabled in harness')),
    GM_xmlhttpRequest: undefined,
    globalThis: null,
    window: {
      location: {
        href: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/center/card.nl',
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
  if (mockResolver) sandbox.__IDB_MOCK_WEBSITE_RESOLVER__ = mockResolver;
  sandbox.globalThis = sandbox;
  sandbox.window.window = sandbox.window;
  sandbox.window.document = sandbox.document;
  sandbox.window.globalThis = sandbox;
  if (mockResolver) sandbox.window.__IDB_MOCK_WEBSITE_RESOLVER__ = mockResolver;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(userscriptPath, 'utf8'), sandbox, { filename: userscriptPath });
  if (!sandbox.__IDB_TEST_HOOKS__) throw new Error('Missing IDB test hooks.');
  return sandbox.__IDB_TEST_HOOKS__;
}

function baseState(website, notes) {
  return {
    open: true,
    selectedLaneId: 'products_cpg',
    selectedMoveIndex: 0,
    selectedActionId: 'prove',
    intake: {
      customer: 'Ariat International',
      website,
      notes: notes || 'Current spreadsheets and inventory tools are causing replenishment and channel availability issues.',
      websiteEvidence: '',
      scObjective: 'Prepare a concise proof from website and notes.',
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
      url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/center/card.nl',
      pageType: 'NetSuite page',
      contextId: 'generic_netsuite_page',
      confidence: 'low',
      movePreference: ['Customer Record', 'Sales Order View'],
      capturedAt: '2026-05-12T16:00:00.000Z'
    }
  };
}

function evidence(overrides) {
  const failureState = overrides.failureState || null;
  const laneCandidates = overrides.laneCandidates || [];
  return Object.assign({
    schema: 'idb.website-evidence.v1',
    resolverVersion: 'websiteResolverServiceV1.local-prototype.w63',
    requestId: overrides.requestId || 'w64-harness',
    inputUrl: overrides.inputUrl || 'https://ariat.example/',
    normalizedUrl: overrides.normalizedUrl || 'https://ariat.example/',
    domain: overrides.domain || 'ariat.example',
    fetchStatus: failureState || 'fetched',
    fetchErrors: overrides.fetchErrors || [],
    pagesSampled: [{ role: 'homepage', url: overrides.normalizedUrl || 'https://ariat.example/', status: failureState ? 0 : 200, contentHash: 'hash', pageBytes: 1200 }],
    extractedEvidence: {
      pageTitle: 'Ariat boots apparel footwear workwear',
      metaDescription: 'Boots, apparel, footwear, style, size, SKU, and channel availability.',
      h1Text: ['Performance boots and apparel'],
      h2Text: ['Style size SKU variants'],
      navigationLabels: ['Footwear', 'Apparel', 'Workwear', 'Find a store'],
      productCategoryTerms: ['apparel', 'boots', 'footwear', 'style', 'size', 'sku', 'workwear'],
      industryLanguage: ['retail', 'ecommerce'],
      locationServiceClues: ['find a store'],
      ecommerceSignals: ['shop'],
      manufacturingSignals: [],
      distributionSignals: []
    },
    signals: {
      laneCandidates,
      productSeed: laneCandidates.length ? 'Core Boot and Apparel Style Matrix' : '',
      productFamily: laneCandidates.length ? 'Apparel and Footwear Style' : '',
      demandMoment: laneCandidates.length ? 'style, size, and channel availability' : ''
    },
    confidence: {
      state: failureState ? 'insufficient_evidence' : 'recommended',
      score: laneCandidates.length ? 0.95 : 0,
      requiresConfirmation: Boolean(failureState)
    },
    failureState,
    sourceUrls: [overrides.normalizedUrl || 'https://ariat.example/'],
    capturedAt: '2026-05-12T16:00:00.000Z',
    cache: { key: 'cache-key', ttlSeconds: 86400, contentHashes: [] },
    writeAuthority: 'none',
    nllmAdvisoryOnly: true,
    noRegression: {
      noSuiteScriptInvocation: true,
      noWriteAuthority: true,
      noHiddenLaneOverride: true,
      notesCannotOwnIdentification: true,
      transactionWriteEnabled: false
    }
  }, overrides);
}

function assertCase(results, name, pass, detail) {
  results.push({ name, pass: !!pass, detail: detail || '' });
}

function escapeTable(value) {
  return String(value == null ? '' : value).replace(/\|/g, '/');
}

async function main() {
  const contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
  const results = [];
  let lastRequest = null;
  const hooks = loadHooks((body) => {
    lastRequest = body;
    return evidence({
      requestId: body.requestId,
      inputUrl: body.url,
      normalizedUrl: 'https://ariat.example/',
      domain: 'ariat.example',
      laneCandidates: [{ laneId: 'apparel_accessories', score: 0.95, evidence: ['apparel', 'boots', 'footwear', 'style', 'size', 'sku'] }]
    });
  });

  const state = baseState('https://ariat.example/', 'Buyer says this is generic manufacturing and sales order workflow.');
  const serviceResult = await hooks.resolveWebsiteEvidenceViaServiceAdapter(state);
  const suggested = hooks.suggestedLaneFromIntake(state);
  if (suggested && suggested.lane) state.selectedLaneId = suggested.lane.id;
  const lane = hooks.getLane(state);
  const product = hooks.productIntelligence(state, lane);
  const ux = hooks.websiteEvidenceUxModel(state, lane);
  assertCase(results, 'w64_service_adapter_resolves_website_identity', serviceResult.status === 'resolved' && state.websiteResolverRuntime.mode === 'service' && state.websiteEvidenceV1.resolverAdapter.mode === 'service', JSON.stringify(state.websiteResolverRuntime));
  assertCase(results, 'w64_notes_do_not_override_service_identity', lane.id === 'apparel_accessories' && product.source === 'website_evidence_v1' && product.product === 'Core Boot and Apparel Style Matrix', JSON.stringify({ lane: lane.id, product }));
  assertCase(results, 'w64_request_excludes_write_and_suitescript_fields', lastRequest && !Object.prototype.hasOwnProperty.call(lastRequest, 'recordType') && !Object.prototype.hasOwnProperty.call(lastRequest, 'writeToken') && !Object.prototype.hasOwnProperty.call(lastRequest, 'suiteScriptInvocation') && !Object.prototype.hasOwnProperty.call(lastRequest, 'authorization'), JSON.stringify(lastRequest));
  assertCase(results, 'w64_plan_review_ux_exposes_resolver_mode', ux.whatIdbSaw.some((item) => /Resolver: service \/ resolved/.test(item)) && ux.confidence.resolverMode === 'service', JSON.stringify(ux.confidence));

  const fallbackHooks = loadHooks(null);
  const fallbackState = baseState('https://ariat.com/', 'Notes conflict and call it industrial manufacturing.');
  fallbackHooks.ensureWebsiteEvidenceRuntime(fallbackState);
  const fallbackProfile = fallbackHooks.websiteSignalProfile(fallbackState);
  assertCase(results, 'w64_local_fallback_is_explicit_when_service_absent', fallbackState.websiteResolverRuntime.mode === 'local_fallback_only' && fallbackState.websiteEvidenceV1.resolverAdapter.mode === 'local_fallback' && fallbackProfile.authority === 'website_evidence_v1', JSON.stringify(fallbackState.websiteResolverRuntime));

  const fallbackDisabledHooks = loadHooks(null, { 'idb.websiteResolver.localFallback.v1': 'false' });
  const fallbackDisabledState = baseState('https://ariat.com/', 'Notes conflict and call it industrial manufacturing.');
  fallbackDisabledHooks.ensureWebsiteEvidenceRuntime(fallbackDisabledState);
  assertCase(results, 'w64_local_fallback_feature_flag_can_disable_fallback', !fallbackDisabledState.websiteEvidenceV1 && fallbackDisabledState.websiteResolverRuntime.localFallbackEnabled === false && fallbackDisabledState.websiteResolverRuntime.status === 'insufficient_evidence', JSON.stringify(fallbackDisabledState.websiteResolverRuntime));

  const failureSamples = [];
  for (const failureState of ['blocked', 'thin', 'unavailable', 'timeout']) {
    const failureHooks = loadHooks(() => evidence({
      requestId: `w64-${failureState}`,
      inputUrl: `https://${failureState}.example/`,
      normalizedUrl: `https://${failureState}.example/`,
      domain: `${failureState}.example`,
      failureState,
      fetchStatus: failureState,
      fetchErrors: [{ type: failureState, message: `${failureState} sample` }],
      laneCandidates: []
    }));
    const failureStateModel = baseState(`https://${failureState}.example/`, 'Notes ask for apparel, but website resolver failed.');
    await failureHooks.resolveWebsiteEvidenceViaServiceAdapter(failureStateModel);
    const failureUx = failureHooks.websiteEvidenceUxModel(failureStateModel, failureHooks.getLane(failureStateModel));
    const candidates = (failureStateModel.websiteEvidenceV1.signals && failureStateModel.websiteEvidenceV1.signals.laneCandidates) || [];
    failureSamples.push({
      failureState,
      confidence: failureStateModel.websiteEvidenceV1.confidence,
      laneCandidates: candidates,
      whatIdbSaw: failureUx.whatIdbSaw,
      confirmationPrompt: failureUx.confirmationPrompt,
      writeAuthority: failureStateModel.websiteEvidenceV1.writeAuthority,
      nllmAdvisoryOnly: failureStateModel.websiteEvidenceV1.nllmAdvisoryOnly
    });
  }
  assertCase(results, 'w64_failure_states_never_guess', failureSamples.every((sample) => sample.confidence.state === 'insufficient_evidence' && sample.laneCandidates.length === 0), JSON.stringify(failureSamples));
  assertCase(results, 'w64_failure_states_visible_in_ux', failureSamples.every((sample) => sample.whatIdbSaw.some((item) => item === `Failure state: ${sample.failureState}`) && sample.confirmationPrompt), JSON.stringify(failureSamples));

  const invalidHooks = loadHooks(() => evidence({
    failureState: 'timeout',
    fetchStatus: 'timeout',
    laneCandidates: [{ laneId: 'apparel_accessories', score: 0.95, evidence: ['bad guess'] }],
    confidence: { state: 'recommended', score: 0.95, requiresConfirmation: false }
  }));
  const invalidState = baseState('https://bad-timeout.example/', 'Notes say apparel.');
  const invalidResult = await invalidHooks.resolveWebsiteEvidenceViaServiceAdapter(invalidState);
  assertCase(results, 'w64_rejects_false_confident_failure_response', invalidResult.status === 'rejected' && invalidState.websiteResolverRuntime.status === 'rejected', JSON.stringify(invalidState.websiteResolverRuntime));
  assertCase(results, 'w64_contract_has_next_prompt', contract.schema === 'idb.w64-drawer-resolver-service-adapter.v1' && /Move through W65/.test(contract.bestNextCodexPrompt.prompt), contract.schema);

  const failures = results.filter((result) => !result.pass);
  const decision = failures.length ? 'FAIL' : 'PASS';
  const trace = {
    schema: 'idb.w64-drawer-resolver-service-adapter-trace.v1',
    generated: new Date().toISOString(),
    decision,
    serviceResolvedSample: {
      resolverRuntime: state.websiteResolverRuntime,
      laneId: lane.id,
      product: product.product,
      productSource: product.source,
      websiteEvidenceV1: state.websiteEvidenceV1,
      websiteEvidenceUx: ux
    },
    fallbackSample: {
      resolverRuntime: fallbackState.websiteResolverRuntime,
      websiteEvidenceV1: fallbackState.websiteEvidenceV1
    },
    fallbackDisabledSample: {
      resolverRuntime: fallbackDisabledState.websiteResolverRuntime,
      websiteEvidenceV1: fallbackDisabledState.websiteEvidenceV1 || null
    },
    failureSamples,
    noRegression: contract.noRegression,
    results
  };
  fs.writeFileSync(tracePath, `${JSON.stringify(trace, null, 2)}\n`);
  fs.writeFileSync(failureUxPath, `${JSON.stringify({ schema: 'idb.w64-failure-ux-samples.v1', samples: failureSamples }, null, 2)}\n`);

  const rows = results.map((result) => `| ${result.pass ? 'PASS' : 'FAIL'} | ${result.name} | ${escapeTable(result.detail)} |`).join('\n');
  const failureRows = failures.map((result) => `- ${result.name}: ${result.detail}`).join('\n') || '- None';
  const report = `# W64 Drawer To Resolver Service Adapter

Decision: ${decision} / DRAWER ADAPTER READY / NO WRITE AUTHORITY

## Objective

Wire the drawer runtime to call the no-write \`websiteResolverServiceV1\` adapter/service instead of relying on local domain hints alone, with feature-flagged local fallback.

## Completed

- Added resolver service adapter configuration for endpoint, harness mock, and local fallback flag.
- Added async drawer service request path that never blocks rendering and never sends write/auth/SuiteScript fields.
- Added response validation so service evidence must be \`websiteEvidenceV1\`, no-write, N/LLM advisory-only, same-domain, and honest on failure states.
- Preserved explicit local fallback when no endpoint is configured.
- Exposed resolver mode/status/failure state in Plan and Review evidence UX.
- Added trace coverage for \`websiteResolverRuntime\`, \`resolverAdapter\`, and failure-state UX samples.

## Harness Results

| Status | Rule | Detail |
| --- | --- | --- |
${rows}

## No Regression

- No writes.
- No SuiteScript invocation.
- N/LLM advisory-only.
- Notes cannot own identity.
- Blocked, thin, unavailable, and timeout never produce confident guesses.
- Transaction writes remain blocked.

## Failures

${failureRows}

## Best Next Codex Prompt

\`\`\`text
${contract.bestNextCodexPrompt.prompt}
\`\`\`
`;
  fs.writeFileSync(reportPath, report);
  console.log(`Drawer resolver service adapter harness: ${decision} (${results.length - failures.length}/${results.length})`);
  if (failures.length) {
    console.error(failures);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
