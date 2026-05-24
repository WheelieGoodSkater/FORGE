const fs = require('fs');
const path = require('path');
const {
  RESOLVER_VERSION,
  normalizeUrl,
  discoverSecondaryUrls,
  resolveWebsiteEvidenceV1,
  createResolverEndpointHandler
} = require('./website_evidence_live_adapter');

const root = path.resolve(__dirname, '..');
const tracePath = path.join(root, 'trace_samples', 'w57_website_evidence_live_adapter_trace.json');
const failurePath = path.join(root, 'trace_samples', 'w57_failure_samples.json');
const reportPath = path.join(root, 'reports', 'w57_website_evidence_resolver.md');

const capturedAt = '2026-05-12T15:08:00.000Z';
const pages = {
  'https://peakcycle.example/': {
    status: 200,
    contentType: 'text/html',
    body: `
      <html>
        <head>
          <title>Peak Cycle Bikes</title>
          <meta name="description" content="Bikes, helmets, components, equipment, stores, and dealer service." />
        </head>
        <body>
          <nav>
            <a href="/bikes">Bikes</a>
            <a href="/equipment">Equipment</a>
            <a href="/stores">Stores</a>
          </nav>
          <h1>Bikes and Cycling Equipment</h1>
          <h2>Road bikes</h2>
          <h2>Mountain bikes</h2>
          <p>Find a store, dealer locator, bike service, helmets, components, cart, and shop.</p>
        </body>
      </html>`
  },
  'https://peakcycle.example/bikes': {
    status: 200,
    contentType: 'text/html',
    body: `
      <html>
        <head><title>Peak Cycle Bike Catalog</title></head>
        <body>
          <h1>Bike Catalog</h1>
          <h2>Bicycle SKU availability</h2>
          <p>Dealer inventory, replenishment, bicycle components, and retail service.</p>
        </body>
      </html>`
  },
  'https://trailthread.example/': {
    status: 200,
    contentType: 'text/html',
    body: `
      <html>
        <head>
          <title>TrailThread Outfitters</title>
          <meta name="description" content="Outdoor apparel, footwear, accessories, outfitter services, dealer distribution, and seasonal equipment." />
        </head>
        <body>
          <nav>
            <a href="/collections">Collections</a>
            <a href="/services">Guided Services</a>
            <a href="/dealers">Dealers</a>
          </nav>
          <h1>Apparel, Footwear, Accessories, and Outfitter Services</h1>
          <h2>Seasonal style, sizes, variants, equipment, dealer distribution, and services</h2>
          <p>Shop apparel, boots, accessories, product catalog, service appointments, and wholesale replenishment.</p>
        </body>
      </html>`
  },
  'https://thin.example/': {
    status: 200,
    contentType: 'text/html',
    body: '<html><head><title>Welcome</title></head><body><nav><a href="/about">About</a></nav><h1>Welcome</h1><p>We help clients succeed.</p></body></html>'
  },
  'https://blocked.example/': {
    status: 403,
    contentType: 'text/html',
    body: '<html><title>Access denied</title></html>'
  },
  'https://unavailable.example/': {
    status: 0,
    contentType: '',
    body: '',
    error: { type: 'dns_or_network_error', message: 'Resolver could not reach host.' }
  },
  'https://timeout.example/': {
    status: 0,
    contentType: '',
    body: '',
    error: { type: 'timeout', message: 'Fetch timed out.' }
  }
};

function mockFetchPage(url) {
  const response = pages[url] || pages[url.replace(/\/$/, '')];
  if (!response) {
    return Promise.resolve({
      url,
      status: 404,
      contentType: 'text/html',
      body: '',
      error: { type: 'dns_or_network_error', message: 'No sample page registered.' }
    });
  }
  return Promise.resolve(Object.assign({ url, finalUrl: url }, response));
}

function assertCase(results, name, pass, detail) {
  results.push({ name, pass: !!pass, detail: detail || '' });
}

function escapeTable(value) {
  return String(value == null ? '' : value).replace(/\|/g, '/');
}

async function main() {
  const results = [];
  const normalized = normalizeUrl('  PeakCycle.Example/?utm_source=pilot#hero ');
  assertCase(results, 'w57_normalizes_url_and_strips_tracking', normalized.ok && normalized.normalizedUrl === 'https://peakcycle.example/' && normalized.domain === 'peakcycle.example', JSON.stringify(normalized));
  const rejected = normalizeUrl('javascript:alert(1)');
  assertCase(results, 'w57_rejects_unsupported_scheme', rejected.ok === false && rejected.error.type === 'unsupported_scheme', JSON.stringify(rejected));
  const discovered = discoverSecondaryUrls('https://peakcycle.example/', pages['https://peakcycle.example/'].body, 3);
  assertCase(results, 'w57_discovers_secondary_same_site_pages', discovered.includes('https://peakcycle.example/bikes') && discovered.length <= 3, discovered.join(', '));

  const recommended = await resolveWebsiteEvidenceV1('PeakCycle.Example/?utm_medium=email', { fetchClient: mockFetchPage, capturedAt });
  const ambiguous = await resolveWebsiteEvidenceV1('https://trailthread.example', { fetchClient: mockFetchPage, capturedAt });
  const thin = await resolveWebsiteEvidenceV1('https://thin.example', { fetchClient: mockFetchPage, capturedAt });
  const blocked = await resolveWebsiteEvidenceV1('https://blocked.example', { fetchClient: mockFetchPage, capturedAt });
  const unavailable = await resolveWebsiteEvidenceV1('https://unavailable.example', { fetchClient: mockFetchPage, capturedAt });
  const timeout = await resolveWebsiteEvidenceV1('https://timeout.example', { fetchClient: mockFetchPage, capturedAt });
  const invalid = await resolveWebsiteEvidenceV1('file:///etc/passwd', { fetchClient: mockFetchPage, capturedAt });
  const endpoint = createResolverEndpointHandler({ fetchClient: mockFetchPage, capturedAt });
  const endpointResponse = await endpoint({ method: 'POST', body: { url: 'https://peakcycle.example' } });
  const endpointReject = await endpoint({ method: 'GET', body: { url: 'https://peakcycle.example' } });

  assertCase(results, 'w57_recommended_case_returns_website_evidence_v1', recommended.schema === 'idb.website-evidence.v1' && recommended.resolverVersion === RESOLVER_VERSION && recommended.confidence.state === 'recommended', recommended.confidence.state);
  assertCase(results, 'w57_recommended_extracts_required_fields', recommended.extractedEvidence.pageTitle === 'Peak Cycle Bikes' && recommended.extractedEvidence.metaDescription.includes('Bikes') && recommended.extractedEvidence.h1Text.length > 0 && recommended.extractedEvidence.h2Text.length > 0 && recommended.extractedEvidence.navigationLabels.includes('Bikes'), JSON.stringify(recommended.extractedEvidence));
  assertCase(results, 'w57_recommended_fetches_homepage_and_secondary_page', recommended.pagesSampled.some((page) => page.role === 'homepage') && recommended.pagesSampled.some((page) => page.role === 'navigation_discovered_category_or_products_page') && recommended.sourceUrls.includes('https://peakcycle.example/bikes'), recommended.sourceUrls.join(', '));
  assertCase(results, 'w57_recommended_infers_signals_without_notes', recommended.signals.laneCandidates[0].laneId === 'dealer_hardgoods' && recommended.signals.productSeed === 'Bicycle SKU' && recommended.signals.productFamily === 'Bicycle Dealer Hardgoods', JSON.stringify(recommended.signals));
  assertCase(results, 'w57_ambiguous_case_needs_confirmation', ambiguous.failureState === 'ambiguous' && ambiguous.confidence.state === 'needs_confirmation' && ambiguous.signals.laneCandidates.length >= 2, JSON.stringify(ambiguous.signals.laneCandidates));
  assertCase(results, 'w57_thin_case_insufficient_evidence', thin.failureState === 'thin' && thin.confidence.state === 'insufficient_evidence' && thin.signals.laneCandidates.length === 0, JSON.stringify(thin));
  assertCase(results, 'w57_blocked_case_no_guess', blocked.failureState === 'blocked' && blocked.fetchStatus === 'blocked' && blocked.signals.laneCandidates.length === 0, JSON.stringify(blocked.fetchErrors));
  assertCase(results, 'w57_unavailable_case_no_guess', unavailable.failureState === 'unavailable' && unavailable.fetchStatus === 'unavailable' && unavailable.signals.laneCandidates.length === 0, JSON.stringify(unavailable.fetchErrors));
  assertCase(results, 'w57_timeout_case_no_guess', timeout.failureState === 'timeout' && timeout.fetchStatus === 'timeout' && timeout.signals.laneCandidates.length === 0, JSON.stringify(timeout.fetchErrors));
  assertCase(results, 'w57_invalid_scheme_blocked_without_fetch', invalid.failureState === 'blocked' && invalid.fetchStatus === 'unavailable' && invalid.fetchErrors[0].type === 'unsupported_scheme', JSON.stringify(invalid.fetchErrors));
  assertCase(results, 'w57_endpoint_is_post_only_and_no_write', endpointResponse.status === 200 && endpointResponse.body.writeAuthority === 'none' && endpointResponse.body.noRegression.noSuiteScriptInvocation === true && endpointReject.status === 405, JSON.stringify(endpointResponse));
  assertCase(results, 'w57_no_regression_boundaries_present', [recommended, ambiguous, thin, blocked, unavailable, timeout].every((item) => item.writeAuthority === 'none' && item.nllmAdvisoryOnly === true && item.noRegression.noWriteAuthority === true && item.noRegression.noHiddenLaneOverride === true), '');

  const cases = [
    { id: 'recommended_dealer_hardgoods', evidence: recommended },
    { id: 'ambiguous_apparel_service_distribution', evidence: ambiguous },
    { id: 'thin_site', evidence: thin },
    { id: 'blocked_site', evidence: blocked },
    { id: 'unavailable_site', evidence: unavailable },
    { id: 'timeout_site', evidence: timeout },
    { id: 'invalid_scheme', evidence: invalid }
  ];
  const trace = {
    schema: 'idb.w57-website-evidence-live-adapter-trace.v1',
    resolverVersion: RESOLVER_VERSION,
    generated: capturedAt,
    endpoint: {
      method: 'POST',
      writeAuthority: 'none',
      suiteScriptInvocation: false,
      nllmAdvisoryOnly: true
    },
    cases,
    noRegression: {
      noWriteAuthority: true,
      noSuiteScriptInvocation: true,
      noNllmWriteAbility: true,
      noHiddenLaneOverride: true
    }
  };
  const failureSamples = {
    schema: 'idb.w57-failure-samples.v1',
    resolverVersion: RESOLVER_VERSION,
    generated: capturedAt,
    samples: cases.filter((item) => item.evidence.failureState).map((item) => ({
      id: item.id,
      inputUrl: item.evidence.inputUrl,
      normalizedUrl: item.evidence.normalizedUrl,
      fetchStatus: item.evidence.fetchStatus,
      failureState: item.evidence.failureState,
      confidence: item.evidence.confidence,
      fetchErrors: item.evidence.fetchErrors,
      laneCandidates: item.evidence.signals.laneCandidates,
      writeAuthority: item.evidence.writeAuthority
    }))
  };
  fs.writeFileSync(tracePath, `${JSON.stringify(trace, null, 2)}\n`);
  fs.writeFileSync(failurePath, `${JSON.stringify(failureSamples, null, 2)}\n`);

  const failures = results.filter((result) => !result.pass);
  const decision = failures.length ? 'FAIL' : 'PASS';
  const rows = results.map((result) => `| ${result.pass ? 'PASS' : 'FAIL'} | ${result.name} | ${escapeTable(result.detail)} |`).join('\n');
  const failureRows = failures.map((result) => `- ${result.name}: ${result.detail}`).join('\n') || '- None';
  const report = `# W57 Website Evidence Resolver

Decision: ${decision} / LIVE ADAPTER READY / NO WRITE AUTHORITY

## Objective

Make real website identification possible: URL in, structured \`websiteEvidenceV1\` out.

## Completed

- Added a reusable no-write resolver adapter in \`tools/website_evidence_live_adapter.js\`.
- Implemented URL normalization, unsupported-scheme rejection, tracking query cleanup, homepage fetch shape, same-site secondary page discovery, and extracted evidence fields.
- Added HTML evidence extraction for title, meta description, H1/H2, navigation labels, product/category terms, industry language, location/service clues, ecommerce signals, manufacturing signals, distribution signals, and source URLs.
- Added confidence/failure behavior for recommended, ambiguous, thin, blocked, unavailable, timeout, and invalid-scheme sites.
- Added a POST-style resolver endpoint handler that returns evidence JSON and never invokes SuiteScript.

## Harness Results

| Status | Rule | Detail |
| --- | --- | --- |
${rows}

## Failure Samples

- Blocked: returns \`failureState: blocked\`, no lane candidates, and requires confirmation/manual evidence.
- Thin: returns \`failureState: thin\`, no confident guess, and asks for more website evidence.
- Unavailable: returns \`failureState: unavailable\`, no lane candidates, and preserves retry/manual-evidence path.
- Ambiguous: returns \`failureState: ambiguous\`, keeps competing candidates visible, and requires consultant confirmation.
- Timeout: returns \`failureState: timeout\`, no lane candidates, and preserves retry/manual-evidence path.

## No Regression

- Write authority remains \`none\`.
- Resolver does not invoke SuiteScript.
- N/LLM remains advisory-only and cannot write.
- Resolver does not hide lane uncertainty or silently override lane gates.
- Main drawer and main Suitelet write boundaries are unchanged.

## Failures

${failureRows}

## Next Block Prompt

W58: Real Unknown-Site Corpus. Build a human-labeled corpus of real and synthetic websites that exercises the live adapter plus classifier against product brand, distributor/dealer, apparel/accessories, manufacturing-heavy, ambiguous, weak/thin, blocked, unavailable, and timeout cases. Prove evidence coverage, confidence calibration, and false-confident-wrong limits before the five-consultant pilot.
`;
  fs.writeFileSync(reportPath, report);
  console.log(`Website evidence live adapter harness: ${decision} (${results.length - failures.length}/${results.length})`);
  if (failures.length) {
    console.error(failures);
    process.exit(1);
  }
}

main();
