const crypto = require('crypto');
const dns = require('dns').promises;
const http = require('http');
const https = require('https');
const net = require('net');
const { domainToASCII } = require('url');

const RESOLVER_VERSION = 'websiteResolverServiceV1.local-prototype.w66';
const EXTRACTION_POLICY_VERSION = 'w66.extraction-policy.v1';
const USER_AGENT = 'IntelligentDemoBuilderWebsiteResolver/1.0 no-write evidence capture';
const CACHE_TTL_SECONDS = 86400;
const DEFAULT_LIMITS = {
  maxRedirects: 5,
  connectMs: 6000,
  overallMs: 12000,
  maximumOverallMs: 15000,
  defaultPages: 4,
  maxPages: 5,
  maxPageBytes: 350000,
  maxTotalBytes: 1200000,
  allowedContentTypes: ['text/html', 'application/xhtml+xml']
};
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
const BLOCKED_SCHEMES = new Set(['file:', 'data:', 'javascript:', 'mailto:', 'tel:', 'ftp:', 'gopher:']);
const BLOCKED_STATUS_CODES = new Set([401, 403, 407, 429, 451]);
const DISCOVERY_LABELS = ['products', 'shop', 'catalog', 'industries', 'solutions', 'services', 'collections', 'categories', 'apparel', 'workwear', 'footwear', 'boots', 'bike', 'bikes', 'cycling', 'equipment', 'helmet', 'helmets', 'store', 'stores'];
const PRODUCT_TERMS = [
  'accessories',
  'allocation',
  'apparel',
  'bike',
  'bikes',
  'bicycle',
  'boots',
  'catalog',
  'channel',
  'collections',
  'cycling',
  'electric bikes',
  'equipment',
  'footwear',
  'gear',
  'gravel',
  'helmets',
  'inventory',
  'mountain bikes',
  'parts',
  'products',
  'replenishment',
  'road bikes',
  'shoes',
  'size',
  'sku',
  'style',
  'variants',
  'workwear'
];
const INDUSTRY_TERMS = ['dealer', 'distribution', 'distributor', 'ecommerce', 'industrial', 'manufacturing', 'retail', 'service', 'wholesale'];
const LOCATION_SERVICE_TERMS = ['dealer locator', 'find a store', 'locations', 'repair', 'service', 'services', 'store locator', 'stores'];
const ECOMMERCE_TERMS = ['add to cart', 'buy', 'cart', 'checkout', 'order online', 'shop'];
const MANUFACTURING_TERMS = ['assembly', 'factory', 'made to order', 'manufacturing', 'production', 'work order'];
const DISTRIBUTION_TERMS = ['dealer', 'distribution', 'fulfillment', 'replenishment', 'warehouse', 'wholesale'];

function sha256(value) {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex');
}

function unique(values) {
  return Array.from(new Set((values || []).filter(Boolean)));
}

function nowIso(options) {
  return options && options.now ? options.now : new Date().toISOString();
}

function clampNumber(value, fallback, max) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return fallback;
  return Math.min(number, max);
}

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
    sourceUrls: []
  };
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
  return decodeHtml(String(value || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' '));
}

function normalizeUrl(inputUrl) {
  const trimmed = String(inputUrl || '').trim();
  if (!trimmed) {
    return { ok: false, failureState: 'unavailable', error: { type: 'missing_url', message: 'URL is required.' } };
  }
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let parsed;
  try {
    parsed = new URL(withScheme);
  } catch (error) {
    return { ok: false, failureState: 'unavailable', error: { type: 'invalid_url', message: error.message } };
  }
  if (BLOCKED_SCHEMES.has(parsed.protocol) || !['http:', 'https:'].includes(parsed.protocol)) {
    return { ok: false, failureState: 'blocked', error: { type: 'unsupported_scheme', message: `${parsed.protocol} URLs are not allowed.` } };
  }
  if (parsed.protocol === 'http:') {
    parsed.protocol = 'https:';
  }
  parsed.hostname = domainToASCII(parsed.hostname.toLowerCase());
  parsed.hash = '';
  Array.from(parsed.searchParams.keys()).forEach((key) => {
    if (TRACKING_PARAMS.has(key.toLowerCase())) parsed.searchParams.delete(key);
  });
  if (!parsed.pathname) parsed.pathname = '/';
  return {
    ok: true,
    inputUrl: trimmed,
    normalizedUrl: parsed.toString(),
    domain: parsed.hostname.replace(/^www\./, '')
  };
}

function ipToLong(ip) {
  return ip.split('.').reduce((sum, octet) => (sum * 256) + Number(octet), 0);
}

function cidrContains(ip, cidr) {
  const [range, bitsText] = cidr.split('/');
  const bits = Number(bitsText);
  const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
  return (ipToLong(ip) & mask) === (ipToLong(range) & mask);
}

function isBlockedIp(address) {
  if (!address) return false;
  if (net.isIP(address) === 4) {
    return [
      '0.0.0.0/8',
      '10.0.0.0/8',
      '127.0.0.0/8',
      '169.254.0.0/16',
      '172.16.0.0/12',
      '192.168.0.0/16',
      '100.64.0.0/10'
    ].some((cidr) => cidrContains(address, cidr));
  }
  if (net.isIP(address) === 6) {
    const lower = address.toLowerCase();
    return lower === '::1' || lower.startsWith('fc') || lower.startsWith('fd') || lower.startsWith('fe80:');
  }
  return false;
}

function isBlockedHostname(hostname) {
  const host = String(hostname || '').toLowerCase();
  return host === 'localhost'
    || host.endsWith('.localhost')
    || host.endsWith('.local')
    || host.endsWith('.internal')
    || host.endsWith('.intranet')
    || host === 'metadata.google.internal'
    || host === '169.254.169.254'
    || isBlockedIp(host);
}

async function assertSafeNetworkTarget(url, options = {}) {
  const parsed = new URL(url);
  if (parsed.protocol !== 'https:') {
    return { ok: false, error: { type: 'scheme_blocked', message: 'Only public HTTPS targets are allowed.' } };
  }
  if (isBlockedHostname(parsed.hostname)) {
    return { ok: false, error: { type: 'ssrf_blocked', message: `Blocked unsafe host: ${parsed.hostname}` } };
  }
  const resolver = options.dnsResolver || dns.lookup;
  try {
    const addresses = await resolver(parsed.hostname, { all: true });
    const normalized = Array.isArray(addresses) ? addresses : [addresses];
    const blocked = normalized.some((item) => isBlockedIp(item && item.address));
    if (blocked) {
      return { ok: false, error: { type: 'ssrf_blocked', message: `DNS resolved ${parsed.hostname} to a blocked network.` } };
    }
  } catch (error) {
    if (options.allowDnsFailureForHarness) return { ok: true };
    return { ok: false, error: { type: 'dns_or_network_error', message: error.message } };
  }
  return { ok: true };
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

function extractTagText(html, tagName) {
  const pattern = new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'gi');
  const values = [];
  let match = pattern.exec(String(html || ''));
  while (match) {
    values.push(stripTags(match[1]));
    match = pattern.exec(String(html || ''));
  }
  return unique(values).slice(0, 16);
}

function extractNavigationLabels(html) {
  const labels = [];
  const navMatch = String(html || '').match(/<nav\b[^>]*>([\s\S]*?)<\/nav>/i);
  const source = navMatch ? navMatch[1] : html;
  const anchorPattern = /<a\b[^>]*>([\s\S]*?)<\/a>/gi;
  let anchor = anchorPattern.exec(String(source || ''));
  while (anchor) {
    const label = stripTags(anchor[1]);
    if (label && label.length <= 64) labels.push(label);
    anchor = anchorPattern.exec(String(source || ''));
  }
  return unique(labels).slice(0, 24);
}

function termsFound(text, terms) {
  const lower = ` ${String(text || '').toLowerCase()} `;
  return unique(terms.filter((term) => lower.includes(term)));
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
    sourceUrls: [page.url]
  };
}

function mergeEvidence(pages) {
  return pages.reduce((merged, page) => {
    const extracted = extractEvidenceFromPage(page);
    return {
      pageTitle: merged.pageTitle || extracted.pageTitle,
      metaDescription: merged.metaDescription || extracted.metaDescription,
      h1Text: unique(merged.h1Text.concat(extracted.h1Text)).slice(0, 16),
      h2Text: unique(merged.h2Text.concat(extracted.h2Text)).slice(0, 20),
      navigationLabels: unique(merged.navigationLabels.concat(extracted.navigationLabels)).slice(0, 32),
      productCategoryTerms: unique(merged.productCategoryTerms.concat(extracted.productCategoryTerms)),
      industryLanguage: unique(merged.industryLanguage.concat(extracted.industryLanguage)),
      locationServiceClues: unique(merged.locationServiceClues.concat(extracted.locationServiceClues)),
      ecommerceSignals: unique(merged.ecommerceSignals.concat(extracted.ecommerceSignals)),
      manufacturingSignals: unique(merged.manufacturingSignals.concat(extracted.manufacturingSignals)),
      distributionSignals: unique(merged.distributionSignals.concat(extracted.distributionSignals)),
      sourceUrls: unique(merged.sourceUrls.concat(extracted.sourceUrls))
    };
  }, emptyEvidence());
}

function discoverSecondaryUrls(baseUrl, html, maxPages) {
  const discovered = [];
  const anchorPattern = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let anchor = anchorPattern.exec(String(html || ''));
  while (anchor && discovered.length < maxPages) {
    const href = anchor[1];
    const label = stripTags(anchor[2]).toLowerCase();
    const hrefLower = String(href || '').toLowerCase();
    const shouldFollow = DISCOVERY_LABELS.some((term) => label.includes(term) || hrefLower.includes(term));
    if (shouldFollow) {
      try {
        const resolved = new URL(href, baseUrl);
        const base = new URL(baseUrl);
        if (resolved.hostname === base.hostname && resolved.protocol === 'https:') {
          resolved.hash = '';
          discovered.push(resolved.toString());
        }
      } catch (error) {
        // Malformed page hrefs do not block resolver execution.
      }
    }
    anchor = anchorPattern.exec(String(html || ''));
  }
  return unique(discovered).slice(0, maxPages);
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
    evidence.locationServiceClues.join(' '),
    evidence.ecommerceSignals.join(' '),
    evidence.manufacturingSignals.join(' '),
    evidence.distributionSignals.join(' ')
  ].join(' ').toLowerCase();
  return [
    {
      laneId: 'apparel_accessories',
      score: ['apparel', 'footwear', 'boots', 'shoes', 'style', 'size', 'sku', 'variants', 'workwear'].filter((term) => text.includes(term)).length,
      evidence: evidence.productCategoryTerms.concat(evidence.navigationLabels).filter((value) => /apparel|footwear|boots|shoes|style|size|sku|variant|workwear/i.test(value))
    },
    {
      laneId: 'dealer_hardgoods',
      score: ['bike', 'bikes', 'bicycle', 'cycling', 'mountain bikes', 'road bikes', 'electric bikes', 'equipment', 'helmets', 'parts', 'dealer', 'retailer', 'store locator', 'catalog'].filter((term) => text.includes(term)).length,
      evidence: evidence.productCategoryTerms.concat(evidence.locationServiceClues, evidence.navigationLabels).filter((value) => /bike|bicycle|cycling|equipment|helmet|parts|dealer|retailer|store|catalog/i.test(value))
    },
    {
      laneId: 'industrial_distribution',
      score: ['distribution', 'distributor', 'wholesale', 'warehouse', 'fulfillment', 'replenishment'].filter((term) => text.includes(term)).length,
      evidence: evidence.industryLanguage.concat(evidence.distributionSignals).filter((value) => /distribution|distributor|wholesale|warehouse|fulfillment|replenishment/i.test(value))
    },
    {
      laneId: 'industrial_equipment',
      score: ['manufacturing', 'production', 'assembly', 'factory', 'made to order', 'work order'].filter((term) => text.includes(term)).length,
      evidence: evidence.industryLanguage.concat(evidence.manufacturingSignals).filter((value) => /manufacturing|production|assembly|factory|made to order|work order/i.test(value))
    }
  ]
    .filter((candidate) => candidate.score > 0)
    .map((candidate) => ({
      laneId: candidate.laneId,
      score: Number(Math.min(0.95, 0.35 + candidate.score * 0.1).toFixed(2)),
      evidence: unique(candidate.evidence).slice(0, 6)
    }))
    .sort((a, b) => b.score - a.score);
}

function inferSignals(evidence) {
  const laneCandidates = scoreLaneCandidates(evidence);
  const best = laneCandidates[0];
  if (!best) return { laneCandidates: [], productSeed: '', productFamily: '', demandMoment: '' };
  const productMap = {
    apparel_accessories: ['Core Boot and Apparel Style Matrix', 'Apparel and Footwear Style', 'style, size, and channel availability'],
    dealer_hardgoods: ['Bicycle SKU', 'Bicycle Dealer Hardgoods', 'dealer inventory and replenishment readiness'],
    industrial_distribution: ['Distributor SKU', 'Industrial Distribution SKU', 'stock, replenishment, and fulfillment readiness'],
    industrial_equipment: ['Assembly', 'Industrial Equipment Manufacturing', 'component readiness and assembly promise control']
  };
  const mapped = productMap[best.laneId] || ['', '', ''];
  return { laneCandidates, productSeed: mapped[0], productFamily: mapped[1], demandMoment: mapped[2] };
}

function classifyEvidenceState(evidence, signals, fetchStatus, fetchErrors) {
  if (fetchStatus === 'blocked') return { confidence: { state: 'insufficient_evidence', score: 0, requiresConfirmation: true }, failureState: 'blocked' };
  if (fetchStatus === 'timeout') return { confidence: { state: 'insufficient_evidence', score: 0, requiresConfirmation: true }, failureState: 'timeout' };
  if (fetchStatus === 'unavailable') return { confidence: { state: 'insufficient_evidence', score: 0, requiresConfirmation: true }, failureState: 'unavailable' };
  if ((fetchErrors || []).some((error) => error.type === 'timeout')) return { confidence: { state: 'insufficient_evidence', score: 0, requiresConfirmation: true }, failureState: 'timeout' };
  const evidenceCount = evidence.productCategoryTerms.length + evidence.industryLanguage.length + evidence.locationServiceClues.length + evidence.ecommerceSignals.length + evidence.manufacturingSignals.length + evidence.distributionSignals.length;
  if (evidenceCount < 3 || signals.laneCandidates.length === 0) {
    return { confidence: { state: 'insufficient_evidence', score: 0.12, requiresConfirmation: true }, failureState: 'thin' };
  }
  const best = signals.laneCandidates[0];
  const second = signals.laneCandidates[1];
  if (second && best.score - second.score < 0.2) {
    return { confidence: { state: 'needs_confirmation', score: best.score, requiresConfirmation: true }, failureState: 'ambiguous' };
  }
  if (best.score < 0.7) {
    return { confidence: { state: 'needs_confirmation', score: best.score, requiresConfirmation: true }, failureState: null };
  }
  return { confidence: { state: 'recommended', score: best.score, requiresConfirmation: false }, failureState: null };
}

function nodeFetch(url, options = {}) {
  const client = url.startsWith('https:') ? https : http;
  const timeoutMs = options.timeoutMs || DEFAULT_LIMITS.overallMs;
  const maxPageBytes = options.maxPageBytes || DEFAULT_LIMITS.maxPageBytes;
  return new Promise((resolve) => {
    const request = client.get(url, {
      timeout: timeoutMs,
      headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,application/xhtml+xml' }
    }, (response) => {
      const chunks = [];
      let bytes = 0;
      response.on('data', (chunk) => {
        bytes += chunk.length;
        if (bytes <= maxPageBytes) chunks.push(chunk);
      });
      response.on('end', () => {
        resolve({
          url,
          status: response.statusCode,
          headers: response.headers,
          contentType: response.headers['content-type'] || '',
          body: Buffer.concat(chunks).toString('utf8'),
          pageBytes: bytes,
          truncated: bytes > maxPageBytes
        });
      });
    });
    request.on('timeout', () => {
      request.destroy();
      resolve({ url, status: 0, headers: {}, contentType: '', body: '', pageBytes: 0, error: { type: 'timeout', message: 'Fetch timed out.' } });
    });
    request.on('error', (error) => {
      resolve({ url, status: 0, headers: {}, contentType: '', body: '', pageBytes: 0, error: { type: 'dns_or_network_error', message: error.message } });
    });
  });
}

async function fetchWithSafety(startUrl, options = {}) {
  const fetchClient = options.fetchClient || nodeFetch;
  let currentUrl = startUrl;
  const redirects = [];
  for (let redirectCount = 0; redirectCount <= options.limits.maxRedirects; redirectCount += 1) {
    const safe = await assertSafeNetworkTarget(currentUrl, options);
    if (!safe.ok) return { url: currentUrl, status: 0, body: '', contentType: '', pageBytes: 0, error: safe.error, redirects };
    const response = await fetchClient(currentUrl, {
      timeoutMs: options.timeoutMs,
      maxPageBytes: options.limits.maxPageBytes,
      role: options.role
    });
    if (response.error) return Object.assign({}, response, { redirects });
    const status = Number(response.status || 0);
    const location = response.headers && response.headers.location;
    if ([301, 302, 303, 307, 308].includes(status) && location) {
      const nextUrl = new URL(location, currentUrl).toString();
      redirects.push({ from: currentUrl, to: nextUrl, status });
      currentUrl = nextUrl;
      continue;
    }
    if (redirectCount === options.limits.maxRedirects && redirects.length >= options.limits.maxRedirects) {
      return Object.assign({}, response, { error: { type: 'redirect_loop', message: 'Maximum redirects exceeded.' }, redirects });
    }
    return Object.assign({}, response, { finalUrl: currentUrl, redirects });
  }
  return { url: currentUrl, status: 0, body: '', contentType: '', pageBytes: 0, error: { type: 'redirect_loop', message: 'Maximum redirects exceeded.' }, redirects };
}

async function fetchHtmlPage(url, options) {
  const response = await fetchWithSafety(url, options);
  if (response.error) return response;
  const status = Number(response.status || 0);
  if (BLOCKED_STATUS_CODES.has(status)) {
    return Object.assign({}, response, { error: { type: 'access_blocked', message: `HTTP ${status} prevented readable HTML.` } });
  }
  if (status >= 500 || status === 0) {
    return Object.assign({}, response, { error: { type: 'dns_or_network_error', message: `HTTP ${status || 'unavailable'} prevented website evidence capture.` } });
  }
  if (status >= 400) {
    return Object.assign({}, response, { error: { type: 'dns_or_network_error', message: `HTTP ${status} prevented website evidence capture.` } });
  }
  const contentType = response.contentType || 'text/html';
  if (!options.limits.allowedContentTypes.some((type) => contentType.toLowerCase().includes(type))) {
    return Object.assign({}, response, { error: { type: 'unsupported_content_type', message: `Unsupported content type: ${contentType || 'unknown'}` } });
  }
  if (response.pageBytes > options.limits.maxPageBytes && !response.body) {
    return Object.assign({}, response, { error: { type: 'page_size_exceeded', message: 'Page exceeded maximum bytes before readable HTML was captured.' } });
  }
  return response;
}

function buildCache(normalizedUrl, pages) {
  return {
    key: sha256(`${normalizedUrl}|${RESOLVER_VERSION}|${EXTRACTION_POLICY_VERSION}`),
    ttlSeconds: CACHE_TTL_SECONDS,
    resolverVersion: RESOLVER_VERSION,
    extractionPolicyVersion: EXTRACTION_POLICY_VERSION,
    contentHashes: (pages || []).map((page) => ({ url: page.url, contentHash: page.contentHash }))
  };
}

function buildFailureResponse(input, normalized, failureState, fetchErrors, options) {
  const normalizedUrl = normalized && normalized.normalizedUrl ? normalized.normalizedUrl : '';
  return {
    schema: 'idb.website-evidence.v1',
    resolverVersion: RESOLVER_VERSION,
    requestId: input.requestId || `w63-${sha256(`${input.url || ''}|${nowIso(options)}`).slice(0, 12)}`,
    inputUrl: input.url || '',
    normalizedUrl,
    domain: normalized && normalized.domain ? normalized.domain : '',
    fetchStatus: failureState,
    fetchErrors,
    pagesSampled: [],
    extractedEvidence: emptyEvidence(),
    signals: { laneCandidates: [], productSeed: '', productFamily: '', demandMoment: '' },
    confidence: { state: 'insufficient_evidence', score: 0, requiresConfirmation: true },
    failureState,
    sourceUrls: [],
    capturedAt: nowIso(options),
    cache: buildCache(normalizedUrl, []),
    writeAuthority: 'none',
    nllmAdvisoryOnly: true,
    noRegression: {
      noSuiteScriptInvocation: true,
      noWriteAuthority: true,
      noHiddenLaneOverride: true,
      notesCannotOwnIdentification: true,
      transactionWriteEnabled: false
    }
  };
}

async function resolveWebsiteEvidenceServiceV1(requestBody, options = {}) {
  const input = requestBody || {};
  const limits = Object.assign({}, DEFAULT_LIMITS, options.limits || {});
  limits.maxPages = clampNumber(input.maxPages, limits.defaultPages, limits.maxPages);
  const timeoutMs = clampNumber(input.timeoutMs, limits.overallMs, limits.maximumOverallMs);
  const normalized = normalizeUrl(input.url);
  if (!normalized.ok) {
    return buildFailureResponse(input, { normalizedUrl: '', domain: '' }, normalized.failureState, [normalized.error], options);
  }
  const homepageSafe = await assertSafeNetworkTarget(normalized.normalizedUrl, options);
  if (!homepageSafe.ok) {
    return buildFailureResponse(input, normalized, 'blocked', [homepageSafe.error], options);
  }

  const fetchErrors = [];
  const pages = [];
  let totalBytes = 0;
  const baseFetchOptions = { fetchClient: options.fetchClient, dnsResolver: options.dnsResolver, allowDnsFailureForHarness: options.allowDnsFailureForHarness, limits, timeoutMs };
  const homepage = await fetchHtmlPage(normalized.normalizedUrl, Object.assign({}, baseFetchOptions, { role: 'homepage' }));
  if (homepage.error) {
    const failureState = homepage.error.type === 'access_blocked' || homepage.error.type === 'ssrf_blocked' || homepage.error.type === 'scheme_blocked'
      ? 'blocked'
      : homepage.error.type === 'timeout'
        ? 'timeout'
        : 'unavailable';
    return buildFailureResponse(input, normalized, failureState, [homepage.error], options);
  }
  const homepageUrl = homepage.finalUrl || homepage.url || normalized.normalizedUrl;
  totalBytes += homepage.pageBytes || Buffer.byteLength(homepage.body || '', 'utf8');
  pages.push({
    role: 'homepage',
    url: homepageUrl,
    status: homepage.status,
    body: homepage.body || '',
    pageBytes: homepage.pageBytes || Buffer.byteLength(homepage.body || '', 'utf8'),
    contentHash: sha256(homepage.body || ''),
    redirects: homepage.redirects || []
  });

  const secondaryUrls = discoverSecondaryUrls(homepageUrl, homepage.body || '', Math.max(0, limits.maxPages - 1));
  for (const secondaryUrl of secondaryUrls) {
    if (pages.length >= limits.maxPages || totalBytes >= limits.maxTotalBytes) break;
    const secondary = await fetchHtmlPage(secondaryUrl, Object.assign({}, baseFetchOptions, { role: 'secondary' }));
    if (secondary.error) {
      fetchErrors.push(secondary.error);
    } else {
      const pageBytes = secondary.pageBytes || Buffer.byteLength(secondary.body || '', 'utf8');
      totalBytes += pageBytes;
      pages.push({
        role: 'navigation_discovered_category_or_products_page',
        url: secondary.finalUrl || secondary.url || secondaryUrl,
        status: secondary.status,
        body: secondary.body || '',
        pageBytes,
        contentHash: sha256(secondary.body || ''),
        redirects: secondary.redirects || []
      });
    }
  }

  const extractedEvidence = mergeEvidence(pages);
  const signals = inferSignals(extractedEvidence);
  const state = classifyEvidenceState(extractedEvidence, signals, 'fetched', fetchErrors);
  const fetchStatus = state.failureState || 'fetched';
  const pagesSampled = pages.map((page) => ({
    role: page.role,
    url: page.url,
    status: page.status,
    contentHash: page.contentHash,
    pageBytes: page.pageBytes,
    redirects: page.redirects
  }));
  return {
    schema: 'idb.website-evidence.v1',
    resolverVersion: RESOLVER_VERSION,
    requestId: input.requestId || `w63-${sha256(`${normalized.normalizedUrl}|${nowIso(options)}`).slice(0, 12)}`,
    inputUrl: normalized.inputUrl,
    normalizedUrl: normalized.normalizedUrl,
    domain: normalized.domain,
    fetchStatus,
    fetchErrors,
    pagesSampled,
    extractedEvidence,
    signals,
    confidence: state.confidence,
    failureState: state.failureState,
    sourceUrls: extractedEvidence.sourceUrls,
    capturedAt: nowIso(options),
    cache: buildCache(normalized.normalizedUrl, pagesSampled),
    writeAuthority: 'none',
    nllmAdvisoryOnly: true,
    noRegression: {
      noSuiteScriptInvocation: true,
      noWriteAuthority: true,
      noHiddenLaneOverride: true,
      notesCannotOwnIdentification: true,
      transactionWriteEnabled: false
    }
  };
}

function statusForEvidence(evidence) {
  if (evidence.failureState === 'blocked') return 'blocked';
  if (evidence.confidence.state === 'needs_confirmation') return 'needs_confirmation';
  if (evidence.confidence.state === 'insufficient_evidence') return 'insufficient_evidence';
  return 'resolved';
}

function createResolverEndpointHandler(options = {}) {
  return async function resolverEndpoint(request) {
    const method = request && request.method ? request.method : 'POST';
    if (method !== 'POST') {
      return { status: 405, body: { error: 'method_not_allowed', writeAuthority: 'none', suiteScriptInvocation: false } };
    }
    const body = request.body || {};
    const forbidden = ['recordType', 'recordId', 'suiteletUrl', 'scriptId', 'deployId', 'writeToken', 'nlAuth', 'cookie', 'authorization'].filter((key) => Object.prototype.hasOwnProperty.call(body, key));
    if (forbidden.length) {
      return { status: 400, body: { error: 'forbidden_request_fields', fields: forbidden, writeAuthority: 'none', suiteScriptInvocation: false } };
    }
    const evidence = await resolveWebsiteEvidenceServiceV1(body, options);
    return { status: evidence.failureState === 'unavailable' ? 502 : 200, body: { status: statusForEvidence(evidence), evidence } };
  };
}

function createResolverHttpServer(options = {}) {
  const handler = createResolverEndpointHandler(options);
  return http.createServer(async (req, res) => {
    if (req.method !== 'POST' || req.url !== '/idb/website-resolver/v1/resolve') {
      res.writeHead(req.method === 'POST' ? 404 : 405, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: req.method === 'POST' ? 'not_found' : 'method_not_allowed', writeAuthority: 'none' }));
      return;
    }
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', async () => {
      let body = {};
      try {
        body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'invalid_json', writeAuthority: 'none' }));
        return;
      }
      const result = await handler({ method: req.method, body });
      res.writeHead(result.status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result.body));
    });
  });
}

module.exports = {
  RESOLVER_VERSION,
  EXTRACTION_POLICY_VERSION,
  normalizeUrl,
  isBlockedHostname,
  isBlockedIp,
  assertSafeNetworkTarget,
  extractEvidenceFromPage,
  discoverSecondaryUrls,
  resolveWebsiteEvidenceServiceV1,
  createResolverEndpointHandler,
  createResolverHttpServer
};
