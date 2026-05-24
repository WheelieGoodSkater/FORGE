const crypto = require('crypto');
const http = require('http');

const {
  EXTRACTION_POLICY_VERSION,
  RESOLVER_VERSION,
  normalizeUrl,
  resolveWebsiteEvidenceServiceV1
} = require('./website_resolver_service_v1');

const DEFAULT_RESOLVE_PATH = '/idb/website-resolver/v1/resolve';
const DEFAULT_HEALTH_PATH = '/health';
const DEFAULT_TOKEN_HEADER = 'x-idb-resolver-token';
const DEFAULT_ALLOWED_METHODS = 'POST, OPTIONS';
const DEFAULT_ALLOWED_HEADERS = 'Content-Type, X-IDB-Resolver-Token';
const DEFAULT_RATE_LIMITS = {
  perTokenPerMinute: 12,
  perDomainPerMinute: 6
};
const WRITE_SHAPED_FIELDS = [
  'recordType',
  'recordId',
  'suiteletUrl',
  'scriptId',
  'deployId',
  'writeToken',
  'createEnabled',
  'customerId',
  'proofItemId',
  'transactionId',
  'nlAuth',
  'cookie',
  'authorization'
];

function sha256(value) {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex');
}

function nowMs(options) {
  if (typeof options.nowMs === 'function') return options.nowMs();
  return Date.now();
}

function normalizeHeaders(headers) {
  return Object.entries(headers || {}).reduce((normalized, [key, value]) => {
    normalized[String(key).toLowerCase()] = value;
    return normalized;
  }, {});
}

function hasNetSuiteCookieOrAuth(headers) {
  const cookie = String(headers.cookie || '');
  const authorization = String(headers.authorization || '');
  return Boolean(cookie || authorization);
}

function allowedOrigin(origin, allowedOrigins) {
  return Boolean(origin && allowedOrigins.includes(origin));
}

function corsHeaders(origin, options) {
  const headers = {
    'Vary': 'Origin',
    'Access-Control-Allow-Methods': DEFAULT_ALLOWED_METHODS,
    'Access-Control-Allow-Headers': options.allowedHeaders || DEFAULT_ALLOWED_HEADERS
  };
  if (allowedOrigin(origin, options.allowedOrigins || [])) {
    headers['Access-Control-Allow-Origin'] = origin;
  }
  return headers;
}

function compactHeaders(headers) {
  return Object.entries(headers || {}).reduce((clean, [key, value]) => {
    if (value !== undefined && value !== null) clean[key] = value;
    return clean;
  }, {});
}

function jsonResponse(status, body, origin, options, extraHeaders = {}) {
  return {
    status,
    headers: compactHeaders(Object.assign(
      { 'Content-Type': 'application/json' },
      corsHeaders(origin, options),
      extraHeaders
    )),
    body: Object.assign({
      writeAuthority: 'none',
      suiteScriptInvocation: false,
      nllmAdvisoryOnly: true
    }, body)
  };
}

function getToken(headers, tokenHeader) {
  return String(headers[String(tokenHeader || DEFAULT_TOKEN_HEADER).toLowerCase()] || '').trim();
}

function safeManualEvidence(manualEvidence) {
  if (!manualEvidence) return null;
  const raw = typeof manualEvidence === 'string'
    ? manualEvidence
    : [manualEvidence.text, manualEvidence.excerpt, manualEvidence.categoryText].filter(Boolean).join(' ');
  const normalized = String(raw || '').replace(/\s+/g, ' ').trim();
  if (!normalized) return null;
  return {
    source: 'consultant_supplied',
    excerptPreview: normalized.slice(0, 160),
    excerptHash: sha256(normalized),
    storedAs: 'excerpt_hash_only'
  };
}

function cacheKeyForRequest(body) {
  const normalized = normalizeUrl(body && body.url);
  if (!normalized.ok) return '';
  return sha256(`${normalized.normalizedUrl}|${RESOLVER_VERSION}|${EXTRACTION_POLICY_VERSION}`);
}

function createMemoryCache() {
  const store = new Map();
  return {
    get(key) {
      return store.get(key);
    },
    set(key, value) {
      store.set(key, value);
    },
    clear() {
      store.clear();
    },
    size() {
      return store.size;
    }
  };
}

function createRateTracker(limits = DEFAULT_RATE_LIMITS) {
  const buckets = new Map();
  return {
    check(scope, key, timestampMs) {
      const bucketKey = `${scope}:${key}`;
      const windowStart = Math.floor(timestampMs / 60000) * 60000;
      const max = scope === 'domain' ? limits.perDomainPerMinute : limits.perTokenPerMinute;
      const bucket = buckets.get(bucketKey);
      if (!bucket || bucket.windowStart !== windowStart) {
        buckets.set(bucketKey, { windowStart, count: 1 });
        return { ok: true, remaining: Math.max(0, max - 1), limit: max };
      }
      bucket.count += 1;
      return { ok: bucket.count <= max, remaining: Math.max(0, max - bucket.count), limit: max };
    },
    clear() {
      buckets.clear();
    }
  };
}

function makeTrace(requestId, outcome, request, additions = {}) {
  return Object.assign({
    requestId,
    outcome,
    path: request.path || DEFAULT_RESOLVE_PATH,
    method: request.method || 'POST',
    origin: request.headers && request.headers.origin ? request.headers.origin : '',
    hasCookie: Boolean(request.headers && request.headers.cookie),
    hasAuthorization: Boolean(request.headers && request.headers.authorization),
    writeAuthority: 'none',
    suiteScriptInvocation: false,
    nllmAdvisoryOnly: true,
    redaction: {
      cookiesLogged: false,
      authorizationLogged: false,
      manualEvidenceFullTextLogged: false
    }
  }, additions);
}

function createStagingResolverEndpoint(options = {}) {
  const endpointOptions = Object.assign({
    resolvePath: DEFAULT_RESOLVE_PATH,
    healthPath: DEFAULT_HEALTH_PATH,
    tokenHeader: DEFAULT_TOKEN_HEADER,
    token: options.token || process.env.IDB_RESOLVER_STAGING_TOKEN || 'local-staging-token',
    allowedOrigins: options.allowedOrigins || [process.env.IDB_RESOLVER_ALLOWED_ORIGIN || 'https://YOUR_ACCOUNT_ID.app.netsuite.com'],
    cache: options.cache || createMemoryCache(),
    rateTracker: options.rateTracker || createRateTracker(options.rateLimits || DEFAULT_RATE_LIMITS),
    rateLimits: Object.assign({}, DEFAULT_RATE_LIMITS, options.rateLimits || {}),
    resolverOptions: options.resolverOptions || {},
    nowMs: options.nowMs,
    now: options.now
  }, options);
  const traces = [];

  async function handle(request = {}) {
    const method = request.method || 'POST';
    const path = request.path || endpointOptions.resolvePath;
    const headers = normalizeHeaders(request.headers || {});
    const origin = headers.origin || '';
    const requestId = request.requestId || (request.body && request.body.requestId) || `w69-${sha256(`${method}|${path}|${nowMs(endpointOptions)}`).slice(0, 12)}`;

    if (method === 'GET' && path === endpointOptions.healthPath) {
      const trace = makeTrace(requestId, 'health_ok', { method, path, headers }, {
        cacheStatus: 'ready',
        resolverVersion: RESOLVER_VERSION,
        extractionPolicyVersion: EXTRACTION_POLICY_VERSION
      });
      traces.push(trace);
      return jsonResponse(200, {
        serviceName: 'websiteResolverServiceV1',
        resolverVersion: RESOLVER_VERSION,
        extractionPolicyVersion: EXTRACTION_POLICY_VERSION,
        writeAuthority: 'none',
        suiteScriptInvocation: false,
        nllmAdvisoryOnly: true,
        cacheStatus: 'ready'
      }, origin, endpointOptions);
    }

    if (path !== endpointOptions.resolvePath) {
      const trace = makeTrace(requestId, 'not_found', { method, path, headers });
      traces.push(trace);
      return jsonResponse(404, { error: 'not_found' }, origin, endpointOptions);
    }

    if (method === 'OPTIONS') {
      if (!allowedOrigin(origin, endpointOptions.allowedOrigins)) {
        const trace = makeTrace(requestId, 'cors_origin_denied', { method, path, headers });
        traces.push(trace);
        return jsonResponse(403, { error: 'origin_not_allowed' }, origin, endpointOptions, { 'Access-Control-Allow-Origin': undefined });
      }
      const trace = makeTrace(requestId, 'cors_preflight_ok', { method, path, headers });
      traces.push(trace);
      return { status: 204, headers: corsHeaders(origin, endpointOptions), body: null };
    }

    if (method !== 'POST') {
      const trace = makeTrace(requestId, 'method_not_allowed', { method, path, headers });
      traces.push(trace);
      return jsonResponse(405, { error: 'method_not_allowed' }, origin, endpointOptions);
    }

    if (!allowedOrigin(origin, endpointOptions.allowedOrigins)) {
      const trace = makeTrace(requestId, 'cors_origin_denied', { method, path, headers });
      traces.push(trace);
      return jsonResponse(403, { error: 'origin_not_allowed' }, origin, endpointOptions, { 'Access-Control-Allow-Origin': undefined });
    }

    if (hasNetSuiteCookieOrAuth(headers)) {
      const trace = makeTrace(requestId, 'netsuite_cookie_or_auth_rejected', { method, path, headers });
      traces.push(trace);
      return jsonResponse(400, { error: 'netsuite_cookie_or_auth_rejected' }, origin, endpointOptions);
    }

    const token = getToken(headers, endpointOptions.tokenHeader);
    if (!token || token !== endpointOptions.token) {
      const trace = makeTrace(requestId, 'resolver_token_rejected', { method, path, headers });
      traces.push(trace);
      return jsonResponse(401, { error: 'resolver_token_required' }, origin, endpointOptions);
    }

    const body = request.body || {};
    const forbidden = WRITE_SHAPED_FIELDS.filter((field) => Object.prototype.hasOwnProperty.call(body, field));
    if (forbidden.length) {
      const trace = makeTrace(requestId, 'no_write_boundary_violation', { method, path, headers }, { forbiddenFields: forbidden });
      traces.push(trace);
      return jsonResponse(400, { error: 'no_write_boundary_violation', fields: forbidden }, origin, endpointOptions);
    }

    const normalized = normalizeUrl(body.url);
    if (normalized.ok) {
      const timestampMs = nowMs(endpointOptions);
      const tokenRate = endpointOptions.rateTracker.check('token', sha256(token).slice(0, 12), timestampMs);
      const domainRate = endpointOptions.rateTracker.check('domain', normalized.domain, timestampMs);
      if (!tokenRate.ok || !domainRate.ok) {
        const trace = makeTrace(requestId, 'rate_limited', { method, path, headers }, { domain: normalized.domain, tokenRate, domainRate });
        traces.push(trace);
        return jsonResponse(429, { error: 'rate_limited', domain: normalized.domain }, origin, endpointOptions);
      }
    }

    const manualEvidence = safeManualEvidence(body.manualEvidence);
    const key = cacheKeyForRequest(body);
    const cached = key ? endpointOptions.cache.get(key) : null;
    if (cached && !manualEvidence) {
      const trace = makeTrace(requestId, 'resolved_from_cache', { method, path, headers }, {
        cacheHit: true,
        normalizedUrl: cached.evidence.normalizedUrl,
        domain: cached.evidence.domain,
        failureState: cached.evidence.failureState,
        confidenceState: cached.evidence.confidence.state
      });
      traces.push(trace);
      return jsonResponse(200, {
        status: cached.status,
        evidence: Object.assign({}, cached.evidence, {
          requestId,
          cache: Object.assign({}, cached.evidence.cache, { hit: true })
        }),
        cacheHit: true
      }, origin, endpointOptions);
    }

    const started = nowMs(endpointOptions);
    const evidence = await resolveWebsiteEvidenceServiceV1(Object.assign({}, body, { requestId }), Object.assign({}, endpointOptions.resolverOptions, { now: endpointOptions.now || endpointOptions.resolverOptions.now }));
    const status = evidence.failureState === 'unavailable' ? 'insufficient_evidence' : evidence.confidence.state === 'recommended' ? 'resolved' : evidence.confidence.state;
    const latencyMs = Math.max(0, nowMs(endpointOptions) - started);
    const envelope = {
      status,
      evidence: Object.assign({}, evidence, {
        cache: Object.assign({}, evidence.cache, { hit: false }),
        manualEvidence: manualEvidence || undefined
      }),
      cacheHit: false,
      latencyMs
    };

    if (key && !manualEvidence && !['blocked', 'timeout', 'unavailable'].includes(evidence.failureState)) {
      endpointOptions.cache.set(key, envelope);
    }

    const trace = makeTrace(requestId, 'resolved_from_fetch', { method, path, headers }, {
      cacheHit: false,
      normalizedUrl: evidence.normalizedUrl,
      domain: evidence.domain,
      failureState: evidence.failureState,
      confidenceState: evidence.confidence.state,
      sourceUrlCount: evidence.sourceUrls.length,
      manualEvidence: manualEvidence ? { excerptHash: manualEvidence.excerptHash, storedAs: manualEvidence.storedAs } : null,
      latencyMs
    });
    traces.push(trace);
    return jsonResponse(200, envelope, origin, endpointOptions);
  }

  return {
    handle,
    traces,
    cache: endpointOptions.cache,
    rateTracker: endpointOptions.rateTracker,
    config: {
      resolvePath: endpointOptions.resolvePath,
      healthPath: endpointOptions.healthPath,
      tokenHeader: endpointOptions.tokenHeader,
      allowedOrigins: endpointOptions.allowedOrigins,
      rateLimits: endpointOptions.rateLimits,
      writeAuthority: 'none',
      suiteScriptInvocation: false,
      nllmAdvisoryOnly: true
    }
  };
}

function readRequestBody(req, maxBytes = 100000) {
  return new Promise((resolve) => {
    const chunks = [];
    let bytes = 0;
    req.on('data', (chunk) => {
      bytes += chunk.length;
      if (bytes <= maxBytes) chunks.push(chunk);
    });
    req.on('end', () => {
      if (bytes > maxBytes) {
        resolve({ error: 'request_too_large' });
        return;
      }
      try {
        resolve({ body: JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}') });
      } catch (error) {
        resolve({ error: 'invalid_json' });
      }
    });
  });
}

function createStagingResolverHttpServer(options = {}) {
  const endpoint = createStagingResolverEndpoint(options);
  const server = http.createServer(async (req, res) => {
    const headers = normalizeHeaders(req.headers || {});
    if (req.method === 'POST') {
      const parsed = await readRequestBody(req);
      if (parsed.error) {
        const result = jsonResponse(parsed.error === 'request_too_large' ? 413 : 400, { error: parsed.error }, headers.origin || '', endpoint.config);
        res.writeHead(result.status, result.headers);
        res.end(JSON.stringify(result.body));
        return;
      }
      const result = await endpoint.handle({ method: req.method, path: req.url, headers, body: parsed.body });
      res.writeHead(result.status, result.headers);
      res.end(JSON.stringify(result.body));
      return;
    }
    const result = await endpoint.handle({ method: req.method, path: req.url, headers });
    res.writeHead(result.status, result.headers);
    res.end(result.body ? JSON.stringify(result.body) : '');
  });
  server.endpoint = endpoint;
  return server;
}

if (require.main === module) {
  const port = Number(process.env.IDB_RESOLVER_STAGING_PORT || 8787);
  const allowedOrigins = String(process.env.IDB_RESOLVER_ALLOWED_ORIGIN || 'https://YOUR_ACCOUNT_ID.app.netsuite.com')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const server = createStagingResolverHttpServer({
    token: process.env.IDB_RESOLVER_STAGING_TOKEN || 'local-staging-token',
    allowedOrigins
  });
  server.listen(port, () => {
    console.log(`IDB staging resolver endpoint listening on http://127.0.0.1:${port}`);
  });
}

module.exports = {
  DEFAULT_HEALTH_PATH,
  DEFAULT_RESOLVE_PATH,
  DEFAULT_TOKEN_HEADER,
  WRITE_SHAPED_FIELDS,
  createMemoryCache,
  createRateTracker,
  createStagingResolverEndpoint,
  createStagingResolverHttpServer,
  safeManualEvidence
};
