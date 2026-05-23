const fs = require('fs');
const path = require('path');

const {
  RESOLVER_VERSION,
  createResolverEndpointHandler,
  normalizeUrl,
  resolveWebsiteEvidenceServiceV1
} = require('./website_resolver_service_v1');

const root = path.resolve(__dirname, '..');
const dataPath = path.join(root, 'data', 'w63_local_resolver_service_prototype.json');
const tracePath = path.join(root, 'trace_samples', 'w63_local_resolver_service_prototype_trace.json');
const failureSamplesPath = path.join(root, 'trace_samples', 'w63_failure_samples.json');
const reportPath = path.join(root, 'reports', 'w63_local_resolver_service_prototype.md');

const FIXED_NOW = '2026-05-12T15:30:00.000Z';

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

async function resolveCase(id, url, responses, extra = {}) {
  return resolveWebsiteEvidenceServiceV1(
    Object.assign({ url, requestId: id, maxPages: 4 }, extra.request || {}),
    {
      now: FIXED_NOW,
      dnsResolver: extra.dnsResolver || allowPublicDns,
      fetchClient: createMockFetch(responses),
      limits: extra.limits || undefined
    }
  );
}

async function main() {
  const contract = readJson(dataPath);
  const results = [];
  const endpointHandler = createResolverEndpointHandler({
    now: FIXED_NOW,
    dnsResolver: allowPublicDns,
    fetchClient: createMockFetch({
      'https://ariat.example/': {
        body: html(
          'Ariat Workwear, Boots, Apparel and Footwear',
          '<nav><a href="/c/footwear">Footwear</a><a href="/c/apparel">Apparel</a><a href="/stores">Find a store</a></nav><h1>Performance boots and apparel</h1><h2>Style, size, SKU variants, channel inventory and replenishment</h2>',
          'Boots, workwear, apparel, footwear, style, size, and SKU variant availability.'
        )
      },
      'https://ariat.example/c/footwear': {
        body: html('Footwear collection', '<h1>Boots and shoes</h1><h2>Size, style, and channel availability</h2><p>Shop footwear and add to cart.</p>')
      },
      'https://ariat.example/c/apparel': {
        body: html('Apparel collection', '<h1>Apparel and accessories</h1><h2>Style color size variants</h2><p>Retail ecommerce collection.</p>')
      },
      'https://ariat.example/stores': {
        body: html('Store locator', '<h1>Find a store</h1><p>Dealer locator and store service.</p>')
      }
    })
  });

  const normalized = normalizeUrl(' ARIAT.example/?utm_source=test#top ');
  assertCase(results, 'w63_url_normalization_https_tracking_hash', normalized.ok && normalized.normalizedUrl === 'https://ariat.example/' && normalized.domain === 'ariat.example', JSON.stringify(normalized));

  const ariat = await resolveCase('ariat_apparel_resolved', 'ariat.example/?utm_campaign=x', {
    'https://ariat.example/': {
      body: html(
        'Ariat Workwear, Boots, Apparel and Footwear',
        '<nav><a href="/c/footwear">Footwear</a><a href="/c/apparel">Apparel</a><a href="/stores">Find a store</a></nav><h1>Performance boots and apparel</h1><h2>Style, size, SKU variants, channel inventory and replenishment</h2>',
        'Boots, workwear, apparel, footwear, style, size, and SKU variant availability.'
      )
    },
    'https://ariat.example/c/footwear': {
      body: html('Footwear collection', '<h1>Boots and shoes</h1><h2>Size, style, and channel availability</h2><p>Shop footwear and add to cart.</p>')
    },
    'https://ariat.example/c/apparel': {
      body: html('Apparel collection', '<h1>Apparel and accessories</h1><h2>Style color size variants</h2><p>Retail ecommerce collection.</p>')
    },
    'https://ariat.example/stores': {
      body: html('Store locator', '<h1>Find a store</h1><p>Dealer locator and store service.</p>')
    }
  });
  assertCase(results, 'w63_apparel_site_resolves_from_website_evidence', ariat.confidence.state === 'recommended' && ariat.signals.laneCandidates[0].laneId === 'apparel_accessories' && ariat.signals.productSeed === 'Core Boot and Apparel Style Matrix', JSON.stringify(ariat.signals));
  assertCase(results, 'w63_secondary_discovery_samples_category_pages', ariat.pagesSampled.length >= 3 && ariat.sourceUrls.some((url) => /footwear/.test(url)) && ariat.sourceUrls.some((url) => /apparel/.test(url)), ariat.sourceUrls.join(', '));
  assertCase(results, 'w63_cache_ready_response_fields_present', /^([a-f0-9]{64})$/.test(ariat.cache.key) && ariat.cache.ttlSeconds === 86400 && ariat.cache.contentHashes.length === ariat.pagesSampled.length, JSON.stringify(ariat.cache));
  assertCase(results, 'w63_trace_fields_include_no_write_boundaries', ariat.writeAuthority === 'none' && ariat.nllmAdvisoryOnly === true && ariat.noRegression.noSuiteScriptInvocation === true && ariat.noRegression.notesCannotOwnIdentification === true && ariat.noRegression.transactionWriteEnabled === false, JSON.stringify(ariat.noRegression));

  const blockedScheme = await resolveCase('blocked_scheme', 'file:///etc/passwd', {});
  const localhost = await resolveCase('blocked_localhost', 'https://localhost/', {});
  const privateDns = await resolveCase('blocked_private_dns', 'https://private-target.example/', {}, { dnsResolver: allowPublicDns });
  const blockedRedirect = await resolveCase('blocked_redirect', 'https://redirect.example/', {
    'https://redirect.example/': { status: 302, headers: { location: 'https://private-target.example/secret' }, body: '' }
  });
  const blocked403 = await resolveCase('blocked_403', 'https://blocked.example/', {
    'https://blocked.example/': { status: 403, body: 'forbidden' }
  });
  assertCase(results, 'w63_blocks_unsafe_scheme_localhost_private_redirect_and_403', [blockedScheme, localhost, privateDns, blockedRedirect, blocked403].every((item) => item.failureState === 'blocked' && item.signals.laneCandidates.length === 0 && item.confidence.state === 'insufficient_evidence'), [blockedScheme.failureState, localhost.failureState, privateDns.failureState, blockedRedirect.failureState, blocked403.failureState].join(', '));

  const thin = await resolveCase('thin_site', 'https://thin.example/', {
    'https://thin.example/': { body: html('Welcome', '<h1>Welcome</h1><p>We help customers do more.</p>') }
  });
  assertCase(results, 'w63_thin_site_does_not_guess', thin.failureState === 'thin' && thin.confidence.state === 'insufficient_evidence' && thin.signals.laneCandidates.length === 0, JSON.stringify(thin.confidence));

  const unavailable = await resolveCase('unavailable_site', 'https://down.example/', {
    'https://down.example/': { status: 503, body: 'down' }
  });
  const timeout = await resolveCase('timeout_site', 'https://slow.example/', {
    'https://slow.example/': { error: { type: 'timeout', message: 'Overall timeout.' } }
  });
  const unsupportedContent = await resolveCase('unsupported_content_type', 'https://pdf.example/', {
    'https://pdf.example/': { contentType: 'application/pdf', body: '%PDF' }
  });
  assertCase(results, 'w63_unavailable_timeout_content_failures_are_insufficient', unavailable.failureState === 'unavailable' && timeout.failureState === 'timeout' && unsupportedContent.failureState === 'unavailable' && [unavailable, timeout, unsupportedContent].every((item) => item.confidence.state === 'insufficient_evidence' && item.signals.laneCandidates.length === 0), `${unavailable.failureState}, ${timeout.failureState}, ${unsupportedContent.failureState}`);

  const ambiguous = await resolveCase('ambiguous_site', 'https://mixed.example/', {
    'https://mixed.example/': {
      body: html(
        'Mixed catalog',
        '<nav><a href="/products">Products</a><a href="/industries">Industries</a></nav><h1>Apparel, equipment, distribution and manufacturing catalog</h1><h2>Style size SKU variants with dealer warehouse replenishment</h2><p>Wholesale dealer distribution and manufacturing assembly.</p>',
        'Apparel, equipment, wholesale distribution, manufacturing, style, SKU and replenishment.'
      )
    },
    'https://mixed.example/products': {
      body: html('Products', '<h1>Products</h1><p>Apparel, equipment, parts, distribution, manufacturing.</p>')
    },
    'https://mixed.example/industries': {
      body: html('Industries', '<h1>Industries</h1><p>Manufacturing, distribution, wholesale and dealer service.</p>')
    }
  });
  assertCase(results, 'w63_ambiguous_site_requires_confirmation', ambiguous.failureState === 'ambiguous' && ambiguous.confidence.state === 'needs_confirmation' && ambiguous.signals.laneCandidates.length >= 2, JSON.stringify(ambiguous.signals.laneCandidates));

  const endpoint = await endpointHandler({ method: 'POST', body: { url: 'https://ariat.example/', recordType: 'customer' } });
  assertCase(results, 'w63_endpoint_rejects_forbidden_write_fields', endpoint.status === 400 && endpoint.body.error === 'forbidden_request_fields' && endpoint.body.writeAuthority === 'none', JSON.stringify(endpoint));

  const endpointSuccess = await endpointHandler({ method: 'POST', body: { url: 'https://ariat.example/', requestId: 'endpoint_success' } });
  assertCase(results, 'w63_endpoint_returns_status_and_evidence_body', endpointSuccess.status === 200 && endpointSuccess.body.status === 'resolved' && endpointSuccess.body.evidence.schema === 'idb.website-evidence.v1', JSON.stringify(endpointSuccess.body.status));

  const pageLimit = await resolveCase('page_limit', 'https://limit.example/', {
    'https://limit.example/': {
      body: html('Limit', '<nav><a href="/products">Products</a><a href="/shop">Shop</a><a href="/catalog">Catalog</a><a href="/services">Services</a></nav><h1>Apparel footwear style size SKU catalog</h1><p>Shop apparel and footwear.</p>')
    },
    'https://limit.example/products': { body: html('Products', '<h1>Products apparel footwear style size</h1>') },
    'https://limit.example/shop': { body: html('Shop', '<h1>Shop boots apparel</h1>') },
    'https://limit.example/catalog': { body: html('Catalog', '<h1>Catalog style SKU</h1>') },
    'https://limit.example/services': { body: html('Services', '<h1>Services</h1>') }
  }, { request: { maxPages: 2 } });
  assertCase(results, 'w63_page_limit_honored', pageLimit.pagesSampled.length <= 2, String(pageLimit.pagesSampled.length));

  const failureSamples = {
    schema: 'idb.w63-failure-samples.v1',
    resolverVersion: RESOLVER_VERSION,
    samples: [blockedScheme, localhost, privateDns, blockedRedirect, blocked403, thin, unavailable, timeout, unsupportedContent, ambiguous].map((item) => ({
      requestId: item.requestId,
      normalizedUrl: item.normalizedUrl,
      fetchStatus: item.fetchStatus,
      failureState: item.failureState,
      confidence: item.confidence,
      laneCandidates: item.signals.laneCandidates,
      writeAuthority: item.writeAuthority,
      nllmAdvisoryOnly: item.nllmAdvisoryOnly
    }))
  };

  assertCase(results, 'w63_failure_samples_cover_required_states', ['blocked', 'thin', 'unavailable', 'timeout', 'ambiguous'].every((state) => failureSamples.samples.some((item) => item.failureState === state)), JSON.stringify(failureSamples.samples.map((item) => item.failureState)));
  assertCase(results, 'w63_blocked_thin_unavailable_timeout_never_guess', failureSamples.samples.filter((item) => ['blocked', 'thin', 'unavailable', 'timeout'].includes(item.failureState)).every((item) => item.confidence.state === 'insufficient_evidence' && item.laneCandidates.length === 0), JSON.stringify(failureSamples.samples));
  assertCase(results, 'w63_data_contract_has_best_next_prompt', contract.schema === 'idb.w63-local-resolver-service-prototype.v1' && contract.bestNextCodexPrompt && /Move through W64/.test(contract.bestNextCodexPrompt.prompt || ''), contract.schema);

  const failures = results.filter((result) => !result.pass);
  const decision = failures.length ? 'FAIL' : 'PASS';
  const trace = {
    schema: 'idb.w63-local-resolver-service-prototype-trace.v1',
    generated: new Date().toISOString(),
    decision,
    resolverVersion: RESOLVER_VERSION,
    approvedLiveFetchHarness: {
      mode: 'registered_not_executed_by_default',
      reason: 'Network fetches are approval-gated; synthetic harness proves service behavior deterministically.'
    },
    exemplarResolvedEvidence: {
      requestId: ariat.requestId,
      normalizedUrl: ariat.normalizedUrl,
      domain: ariat.domain,
      fetchStatus: ariat.fetchStatus,
      pagesSampled: ariat.pagesSampled,
      extractedEvidence: ariat.extractedEvidence,
      signals: ariat.signals,
      confidence: ariat.confidence,
      cache: ariat.cache,
      writeAuthority: ariat.writeAuthority,
      nllmAdvisoryOnly: ariat.nllmAdvisoryOnly
    },
    failureSamples: failureSamples.samples,
    results
  };
  fs.writeFileSync(tracePath, `${JSON.stringify(trace, null, 2)}\n`);
  fs.writeFileSync(failureSamplesPath, `${JSON.stringify(failureSamples, null, 2)}\n`);

  const rows = results.map((result) => `| ${result.pass ? 'PASS' : 'FAIL'} | ${result.name} | ${escapeTable(result.detail)} |`).join('\n');
  const failureRows = failures.map((result) => `- ${result.name}: ${result.detail}`).join('\n') || '- None';
  const report = `# W63 Local Resolver Service Prototype

Decision: ${decision} / LOCAL RESOLVER PROTOTYPE READY / NO WRITE AUTHORITY

## Objective

Build the no-write website resolver service outside the drawer using the W62 \`websiteResolverServiceV1\` contract.

## Completed

- Added a local \`websiteResolverServiceV1\` module with endpoint handler and optional HTTP server.
- Implemented URL normalization, HTTPS upgrade, tracking/hash removal, punycode hostname handling, and blocked scheme handling.
- Added SSRF safety checks for localhost, private networks, metadata IPs, internal suffixes, unsafe redirects, and DNS resolution.
- Added homepage fetch, secondary page discovery, content-type enforcement, timeout and page-limit controls.
- Added HTML evidence extraction, lane candidate signal inference, cache-ready response fields, failure-state responses, and trace-safe no-write metadata.
- Added deterministic synthetic harness coverage plus an approved-live-fetch harness registration note.

## Harness Results

| Status | Rule | Detail |
| --- | --- | --- |
${rows}

## Failure Samples

- Blocked: unsafe schemes, localhost, private DNS, unsafe redirect, and access-blocked responses.
- Thin: readable page without enough product/category evidence.
- Unavailable: server/content failures.
- Timeout: explicit timeout failure.
- Ambiguous: competing website evidence requires confirmation.

## No Regression

- No writes.
- No SuiteScript invocation.
- N/LLM advisory-only.
- Notes cannot own identity.
- Blocked, thin, unavailable, and timeout states never produce confident guesses.
- Transaction writes remain blocked.

## Failures

${failureRows}

## Best Next Codex Prompt

\`\`\`text
${contract.bestNextCodexPrompt.prompt}
\`\`\`
`;
  fs.writeFileSync(reportPath, report);
  console.log(`Resolver service prototype harness: ${decision} (${results.length - failures.length}/${results.length})`);
  if (failures.length) {
    console.error(failures);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
