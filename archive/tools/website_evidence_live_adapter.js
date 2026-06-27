const http = require('http');
const https = require('https');

const RESOLVER_VERSION = 'w57.website-evidence-live-adapter.v1';
const DEFAULT_TIMEOUT_MS = 12000;
const TRACKING_PARAMS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'gclid',
  'fbclid',
  'msclkid'
]);
const UNSUPPORTED_SCHEMES = new Set(['javascript:', 'data:', 'file:', 'mailto:', 'tel:']);
const DISCOVERY_LABELS = ['products', 'shop', 'catalog', 'industries', 'solutions', 'services', 'collections', 'bikes', 'equipment', 'forklifts', 'lift trucks', 'pallet trucks', 'warehouse', 'dealers', 'stores'];
const BLOCKED_STATUS_CODES = new Set([401, 403, 407, 429, 451]);
const PRODUCT_TERMS = [
  'apparel',
  'accessories',
  'bikes',
  'bicycle',
  'boots',
  'catalog',
  'components',
  'equipment',
  'footwear',
  'helmets',
  'inventory',
  'parts',
  'products',
  'replenishment',
  'shoes',
  'sizes',
  'sku',
  'style',
  'variants'
];
const INDUSTRIAL_EQUIPMENT_PRODUCT_TERMS = [
  'forklift',
  'forklift truck',
  'forklift trucks',
  'lift truck',
  'lift trucks',
  'pallet truck',
  'pallet trucks',
  'reach truck',
  'reach trucks',
  'order picker',
  'order pickers',
  'tow tractor',
  'tow tractors',
  'electric truck',
  'electric trucks',
  'internal combustion truck',
  'internal combustion trucks',
  'counterbalance truck',
  'counterbalance trucks',
  'turret truck',
  'turret trucks',
  'very narrow aisle truck',
  'warehouse equipment'
];
const INDUSTRY_TERMS = [
  'dealer',
  'distribution',
  'distributor',
  'ecommerce',
  'industrial',
  'manufacturing',
  'retail',
  'service',
  'wholesale'
];
const LOCATION_SERVICE_TERMS = [
  'appointment',
  'dealer locator',
  'find a store',
  'locations',
  'repair',
  'service',
  'services',
  'store locator',
  'stores'
];
const ECOMMERCE_TERMS = ['cart', 'checkout', 'shop', 'buy', 'order online', 'add to cart'];
const MANUFACTURING_TERMS = ['manufacturing', 'made to order', 'production', 'assembly', 'factory', 'work order'];
const DISTRIBUTION_TERMS = ['distribution', 'dealer', 'wholesale', 'fulfillment', 'warehouse', 'replenishment'];

function emptyEvidence() {
  return {
    pageTitle: '',
    metaDescription: '',
    h1Text: [],
    h2Text: [],
    navigationLabels: [],
    productCategoryTerms: [],
    industryLanguage: [],
    locationServiceClues: [],
    ecommerceSignals: [],
    manufacturingSignals: [],
    distributionSignals: [],
    productNames: [],
    productCardNames: [],
    anchorText: [],
    sourceUrls: []
  };
}

function unique(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function decodeHtml(value) {
  return String(value || '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripTags(value) {
  return decodeHtml(String(value || '').replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' '));
}

function normalizeUrl(inputUrl) {
  const trimmed = String(inputUrl || '').trim();
  if (!trimmed) {
    return { ok: false, error: { type: 'missing_url', message: 'URL is required.' } };
  }
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let parsed;
  try {
    parsed = new URL(withScheme);
  } catch (error) {
    return { ok: false, error: { type: 'invalid_url', message: error.message } };
  }
  if (UNSUPPORTED_SCHEMES.has(parsed.protocol) || !['http:', 'https:'].includes(parsed.protocol)) {
    return { ok: false, error: { type: 'unsupported_scheme', message: `${parsed.protocol} URLs are not allowed.` } };
  }
  parsed.hostname = parsed.hostname.toLowerCase();
  parsed.hash = '';
  Array.from(parsed.searchParams.keys()).forEach((key) => {
    if (TRACKING_PARAMS.has(key.toLowerCase())) {
      parsed.searchParams.delete(key);
    }
  });
  if (!parsed.pathname) {
    parsed.pathname = '/';
  }
  return {
    ok: true,
    inputUrl: trimmed,
    normalizedUrl: parsed.toString(),
    domain: parsed.hostname.replace(/^www\./, '')
  };
}

function termsFound(text, terms) {
  const lower = ` ${String(text || '').toLowerCase()} `;
  return unique(terms.filter((term) => lower.includes(term)));
}

function extractTagText(html, tagName) {
  const pattern = new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'gi');
  const values = [];
  let match = pattern.exec(html);
  while (match) {
    values.push(stripTags(match[1]));
    match = pattern.exec(html);
  }
  return unique(values).slice(0, 12);
}

function extractTitle(html) {
  const match = String(html || '').match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  return match ? stripTags(match[1]) : '';
}

function extractMetaDescription(html) {
  const match = String(html || '').match(/<meta\b(?=[^>]*name=["']description["'])(?=[^>]*content=["']([^"']*)["'])[^>]*>/i)
    || String(html || '').match(/<meta\b(?=[^>]*content=["']([^"']*)["'])(?=[^>]*name=["']description["'])[^>]*>/i);
  return match ? decodeHtml(match[1]) : '';
}

function extractNavigationLabels(html) {
  const labels = [];
  const navMatch = String(html || '').match(/<nav\b[^>]*>([\s\S]*?)<\/nav>/i);
  const source = navMatch ? navMatch[1] : html;
  const anchorPattern = /<a\b[^>]*>([\s\S]*?)<\/a>/gi;
  let anchor = anchorPattern.exec(source);
  while (anchor) {
    const label = stripTags(anchor[1]);
    if (label && label.length <= 48) {
      labels.push(label);
    }
    anchor = anchorPattern.exec(source);
  }
  return unique(labels).slice(0, 16);
}

function extractProductNameCandidates(text) {
  const source = String(text || '').replace(/\s+/g, ' ');
  const candidates = [];
  INDUSTRIAL_EQUIPMENT_PRODUCT_TERMS.forEach((term) => {
    const pattern = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (pattern.test(source)) candidates.push(term.replace(/\b\w/g, (char) => char.toUpperCase()));
  });
  [
    /\b([A-Z][A-Za-z0-9-]{1,8}\s+Series\s+(?:Forklift|Lift Truck|Pallet Truck|Reach Truck|Order Picker|Tow Tractor|Turret Truck|Truck)s?)\b/g,
    /\b((?:Electric|Internal Combustion|Counterbalance|Rider|Walkie|Walkie Rider|Very Narrow Aisle|Reach-Fork)\s+(?:Forklift|Lift Truck|Pallet Truck|Reach Truck|Order Picker|Tow Tractor|Turret Truck|Truck)s?)\b/gi
  ].forEach((pattern) => {
    let match = pattern.exec(source);
    while (match) {
      candidates.push(decodeHtml(match[1]));
      match = pattern.exec(source);
    }
  });
  return unique(candidates).slice(0, 16);
}

function discoverSecondaryUrls(baseUrl, html, maxPages) {
  const discovered = [];
  const anchorPattern = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let anchor = anchorPattern.exec(String(html || ''));
  while (anchor && discovered.length < maxPages) {
    const href = anchor[1];
    const label = stripTags(anchor[2]).toLowerCase();
    const hrefLower = href.toLowerCase();
    const hasDiscoverySignal = DISCOVERY_LABELS.some((term) => label.includes(term) || hrefLower.includes(term));
    if (hasDiscoverySignal) {
      try {
        const resolved = new URL(href, baseUrl);
        const base = new URL(baseUrl);
        if (resolved.hostname === base.hostname) {
          resolved.hash = '';
          discovered.push(resolved.toString());
        }
      } catch (error) {
        // Ignore malformed hrefs in fetched pages.
      }
    }
    anchor = anchorPattern.exec(String(html || ''));
  }
  return unique(discovered).slice(0, maxPages);
}

function extractEvidenceFromPage(page) {
  const html = page.body || '';
  const fullText = stripTags(html);
  const pageTitle = extractTitle(html);
  const metaDescription = extractMetaDescription(html);
  const h1Text = extractTagText(html, 'h1');
  const h2Text = extractTagText(html, 'h2');
  const navigationLabels = extractNavigationLabels(html);
  const searchable = [pageTitle, metaDescription, h1Text.join(' '), h2Text.join(' '), navigationLabels.join(' '), fullText].join(' ');
  const productNames = extractProductNameCandidates(searchable);
  return {
    pageTitle,
    metaDescription,
    h1Text,
    h2Text,
    navigationLabels,
    productCategoryTerms: termsFound(searchable, PRODUCT_TERMS),
    industryLanguage: termsFound(searchable, INDUSTRY_TERMS),
    locationServiceClues: termsFound(searchable, LOCATION_SERVICE_TERMS),
    ecommerceSignals: termsFound(searchable, ECOMMERCE_TERMS),
    manufacturingSignals: termsFound(searchable, MANUFACTURING_TERMS),
    distributionSignals: termsFound(searchable, DISTRIBUTION_TERMS),
    productNames,
    productCardNames: productNames,
    anchorText: navigationLabels,
    sourceUrls: [page.url]
  };
}

function mergeEvidence(pages) {
  return pages.reduce((merged, page) => {
    const extracted = extractEvidenceFromPage(page);
    return {
      pageTitle: merged.pageTitle || extracted.pageTitle,
      metaDescription: merged.metaDescription || extracted.metaDescription,
      h1Text: unique(merged.h1Text.concat(extracted.h1Text)).slice(0, 12),
      h2Text: unique(merged.h2Text.concat(extracted.h2Text)).slice(0, 16),
      navigationLabels: unique(merged.navigationLabels.concat(extracted.navigationLabels)).slice(0, 24),
      productCategoryTerms: unique(merged.productCategoryTerms.concat(extracted.productCategoryTerms)),
      industryLanguage: unique(merged.industryLanguage.concat(extracted.industryLanguage)),
      locationServiceClues: unique(merged.locationServiceClues.concat(extracted.locationServiceClues)),
      ecommerceSignals: unique(merged.ecommerceSignals.concat(extracted.ecommerceSignals)),
      manufacturingSignals: unique(merged.manufacturingSignals.concat(extracted.manufacturingSignals)),
      distributionSignals: unique(merged.distributionSignals.concat(extracted.distributionSignals)),
      productNames: unique(merged.productNames.concat(extracted.productNames)).slice(0, 16),
      productCardNames: unique(merged.productCardNames.concat(extracted.productCardNames)).slice(0, 16),
      anchorText: unique(merged.anchorText.concat(extracted.anchorText)).slice(0, 24),
      sourceUrls: unique(merged.sourceUrls.concat(extracted.sourceUrls))
    };
  }, emptyEvidence());
}

function scoreLaneCandidates(evidence) {
  const text = [
    evidence.pageTitle,
    evidence.metaDescription,
    evidence.h1Text.join(' '),
    evidence.h2Text.join(' '),
    evidence.navigationLabels.join(' '),
    evidence.productCategoryTerms.join(' '),
    evidence.industryLanguage.join(' '),
    evidence.locationServiceClues.join(' ')
  ].join(' ').toLowerCase();
  const candidates = [
    {
      laneId: 'apparel_accessories',
      score: ['apparel', 'accessories', 'footwear', 'shoes', 'style', 'sizes', 'variants'].filter((term) => text.includes(term)).length,
      evidence: evidence.productCategoryTerms.concat(evidence.navigationLabels).filter((value) => /apparel|accessories|footwear|shoes|style|sizes|variants/i.test(value))
    },
    {
      laneId: 'dealer_hardgoods',
      score: ['bikes', 'bicycle', 'equipment', 'helmets', 'components', 'dealer', 'store locator'].filter((term) => text.includes(term)).length,
      evidence: evidence.productCategoryTerms.concat(evidence.distributionSignals, evidence.navigationLabels).filter((value) => /bike|bicycle|equipment|helmets|components|dealer|store/i.test(value))
    },
    {
      laneId: 'industrial_distribution',
      score: ['industrial', 'distribution', 'wholesale', 'warehouse', 'fulfillment', 'replenishment'].filter((term) => text.includes(term)).length,
      evidence: evidence.industryLanguage.concat(evidence.distributionSignals).filter((value) => /industrial|distribution|wholesale|warehouse|fulfillment|replenishment/i.test(value))
    },
    {
      laneId: 'industrial_equipment',
      score: ['manufacturing', 'production', 'assembly', 'factory', 'made to order', 'work order', 'components'].filter((term) => text.includes(term)).length,
      evidence: evidence.manufacturingSignals.concat(evidence.industryLanguage).filter((value) => /manufacturing|production|assembly|factory|made to order/i.test(value))
    }
  ]
    .filter((candidate) => candidate.score > 0)
    .map((candidate) => ({
      laneId: candidate.laneId,
      score: Number(Math.min(0.95, 0.35 + candidate.score * 0.12).toFixed(2)),
      evidence: unique(candidate.evidence).slice(0, 5)
    }))
    .sort((a, b) => b.score - a.score);
  return candidates;
}

function inferSignals(evidence) {
  const laneCandidates = scoreLaneCandidates(evidence);
  const best = laneCandidates[0];
  if (!best) {
    return { laneCandidates: [], productSeed: '', productFamily: '', demandMoment: '' };
  }
  const productMap = {
    apparel_accessories: ['Core Style Color-Size Matrix', 'Apparel and Footwear Style', 'style, size, and channel availability'],
    dealer_hardgoods: ['Bicycle SKU', 'Bicycle Dealer Hardgoods', 'dealer inventory and replenishment readiness'],
    industrial_distribution: ['Distributor SKU', 'Industrial Distribution SKU', 'stock, replenishment, and fulfillment readiness'],
    industrial_equipment: [
      evidence.productNames[0] || 'Assembly',
      'Industrial Equipment Manufacturing',
      'component readiness and assembly promise control'
    ]
  };
  const mapped = productMap[best.laneId] || ['', '', ''];
  return {
    laneCandidates,
    productSeed: mapped[0],
    productFamily: mapped[1],
    demandMoment: mapped[2]
  };
}

function classifyEvidenceState(evidence, signals, fetchStatus, fetchErrors) {
  if (fetchStatus === 'blocked') {
    return { confidence: { state: 'insufficient_evidence', score: 0, requiresConfirmation: true }, failureState: 'blocked' };
  }
  if (fetchStatus === 'unavailable') {
    return { confidence: { state: 'insufficient_evidence', score: 0, requiresConfirmation: true }, failureState: 'unavailable' };
  }
  if (fetchStatus === 'timeout' || fetchErrors.some((error) => error.type === 'timeout')) {
    return { confidence: { state: 'insufficient_evidence', score: 0, requiresConfirmation: true }, failureState: 'timeout' };
  }
  const evidenceCount = evidence.productCategoryTerms.length + evidence.industryLanguage.length + evidence.locationServiceClues.length + evidence.ecommerceSignals.length + evidence.manufacturingSignals.length + evidence.distributionSignals.length;
  if (evidenceCount < 3 || signals.laneCandidates.length === 0) {
    return { confidence: { state: 'insufficient_evidence', score: 0.12, requiresConfirmation: true }, failureState: 'thin' };
  }
  const best = signals.laneCandidates[0];
  const second = signals.laneCandidates[1];
  if (second && best.score - second.score < 0.25) {
    return { confidence: { state: 'needs_confirmation', score: best.score, requiresConfirmation: true }, failureState: 'ambiguous' };
  }
  if (best.score < 0.7) {
    return { confidence: { state: 'needs_confirmation', score: best.score, requiresConfirmation: true }, failureState: null };
  }
  return { confidence: { state: 'recommended', score: best.score, requiresConfirmation: false }, failureState: null };
}

function nodeFetchPage(url, options = {}) {
  const timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT_MS;
  const client = url.startsWith('https:') ? https : http;
  return new Promise((resolve) => {
    const request = client.get(url, {
      timeout: timeoutMs,
      headers: {
        'User-Agent': 'IntelligentDemoBuilderWebsiteEvidenceResolver/1.0',
        Accept: 'text/html,application/xhtml+xml'
      }
    }, (response) => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => {
        if (body.length < 350000) {
          body += chunk;
        }
      });
      response.on('end', () => {
        resolve({
          url,
          finalUrl: response.headers.location ? new URL(response.headers.location, url).toString() : url,
          status: response.statusCode,
          contentType: response.headers['content-type'] || '',
          body
        });
      });
    });
    request.on('timeout', () => {
      request.destroy();
      resolve({ url, status: 0, contentType: '', body: '', error: { type: 'timeout', message: 'Fetch timed out.' } });
    });
    request.on('error', (error) => {
      resolve({ url, status: 0, contentType: '', body: '', error: { type: 'dns_or_network_error', message: error.message } });
    });
  });
}

async function fetchPage(fetchClient, url, options) {
  const response = await fetchClient(url, options);
  if (response.error) {
    return response;
  }
  const status = Number(response.status || 0);
  if (BLOCKED_STATUS_CODES.has(status)) {
    return Object.assign({}, response, { error: { type: 'access_blocked', message: `HTTP ${status} prevented readable HTML.` } });
  }
  if (status >= 400 || status === 0) {
    return Object.assign({}, response, { error: { type: 'dns_or_network_error', message: `HTTP ${status || 'unavailable'} prevented website evidence capture.` } });
  }
  if (!/text\/html|application\/xhtml\+xml/i.test(response.contentType || 'text/html')) {
    return Object.assign({}, response, { error: { type: 'unsupported_content_type', message: `Unsupported content type: ${response.contentType || 'unknown'}` } });
  }
  return response;
}

async function resolveWebsiteEvidenceV1(inputUrl, options = {}) {
  const normalized = normalizeUrl(inputUrl);
  const capturedAt = options.capturedAt || new Date().toISOString();
  if (!normalized.ok) {
    return {
      schema: 'idb.website-evidence.v1',
      resolverVersion: RESOLVER_VERSION,
      inputUrl,
      normalizedUrl: '',
      domain: '',
      fetchStatus: 'unavailable',
      fetchErrors: [normalized.error],
      pagesSampled: [],
      extractedEvidence: emptyEvidence(),
      signals: { laneCandidates: [], productSeed: '', productFamily: '', demandMoment: '' },
      confidence: { state: 'insufficient_evidence', score: 0, requiresConfirmation: true },
      failureState: normalized.error.type === 'unsupported_scheme' ? 'blocked' : 'unavailable',
      sourceUrls: [],
      capturedAt,
      writeAuthority: 'none',
      nllmAdvisoryOnly: true,
      noRegression: { noSuiteScriptInvocation: true, noWriteAuthority: true, noHiddenLaneOverride: true }
    };
  }

  const fetchClient = options.fetchClient || nodeFetchPage;
  const fetchErrors = [];
  const pages = [];
  const pagesSampled = [];
  const homepage = await fetchPage(fetchClient, normalized.normalizedUrl, { timeoutMs: options.timeoutMs || DEFAULT_TIMEOUT_MS, role: 'homepage' });
  if (homepage.error) {
    const fetchStatus = homepage.error.type === 'access_blocked' ? 'blocked' : homepage.error.type === 'timeout' ? 'timeout' : 'unavailable';
    fetchErrors.push(homepage.error);
    const state = classifyEvidenceState(emptyEvidence(), { laneCandidates: [] }, fetchStatus, fetchErrors);
    return {
      schema: 'idb.website-evidence.v1',
      resolverVersion: RESOLVER_VERSION,
      inputUrl: normalized.inputUrl,
      normalizedUrl: normalized.normalizedUrl,
      domain: normalized.domain,
      fetchStatus,
      fetchErrors,
      pagesSampled: [],
      extractedEvidence: emptyEvidence(),
      signals: { laneCandidates: [], productSeed: '', productFamily: '', demandMoment: '' },
      confidence: state.confidence,
      failureState: state.failureState,
      sourceUrls: [],
      capturedAt,
      writeAuthority: 'none',
      nllmAdvisoryOnly: true,
      noRegression: { noSuiteScriptInvocation: true, noWriteAuthority: true, noHiddenLaneOverride: true }
    };
  }
  pages.push({ url: homepage.finalUrl || homepage.url || normalized.normalizedUrl, body: homepage.body || '' });
  pagesSampled.push({ role: 'homepage', url: homepage.finalUrl || homepage.url || normalized.normalizedUrl, status: homepage.status });

  const secondaryUrls = discoverSecondaryUrls(normalized.normalizedUrl, homepage.body || '', options.maxSecondaryPages || 3);
  for (const secondaryUrl of secondaryUrls) {
    const secondary = await fetchPage(fetchClient, secondaryUrl, { timeoutMs: options.timeoutMs || DEFAULT_TIMEOUT_MS, role: 'navigation_discovered_category_or_products_page' });
    if (secondary.error) {
      fetchErrors.push(secondary.error);
    } else {
      pages.push({ url: secondary.finalUrl || secondary.url || secondaryUrl, body: secondary.body || '' });
      pagesSampled.push({ role: 'navigation_discovered_category_or_products_page', url: secondary.finalUrl || secondary.url || secondaryUrl, status: secondary.status });
    }
  }

  const extractedEvidence = mergeEvidence(pages);
  const signals = inferSignals(extractedEvidence);
  const state = classifyEvidenceState(extractedEvidence, signals, 'fetched', fetchErrors);
  return {
    schema: 'idb.website-evidence.v1',
    resolverVersion: RESOLVER_VERSION,
    inputUrl: normalized.inputUrl,
    normalizedUrl: normalized.normalizedUrl,
    domain: normalized.domain,
    fetchStatus: 'fetched',
    fetchErrors,
    pagesSampled,
    extractedEvidence,
    signals,
    confidence: state.confidence,
    failureState: state.failureState,
    sourceUrls: extractedEvidence.sourceUrls,
    capturedAt,
    writeAuthority: 'none',
    nllmAdvisoryOnly: true,
    noRegression: { noSuiteScriptInvocation: true, noWriteAuthority: true, noHiddenLaneOverride: true }
  };
}

function createResolverEndpointHandler(options = {}) {
  return async function websiteEvidenceResolverEndpoint(request) {
    const method = request && request.method ? request.method : 'POST';
    if (method !== 'POST') {
      return { status: 405, body: { error: 'method_not_allowed', writeAuthority: 'none' } };
    }
    const body = request.body || {};
    const evidence = await resolveWebsiteEvidenceV1(body.url, options);
    return { status: evidence.failureState === 'unavailable' ? 502 : 200, body: evidence };
  };
}

module.exports = {
  RESOLVER_VERSION,
  normalizeUrl,
  extractEvidenceFromPage,
  discoverSecondaryUrls,
  resolveWebsiteEvidenceV1,
  createResolverEndpointHandler
};
