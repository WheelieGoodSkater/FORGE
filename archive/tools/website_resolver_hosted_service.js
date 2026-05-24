const {
  DEFAULT_HEALTH_PATH,
  DEFAULT_RESOLVE_PATH,
  DEFAULT_TOKEN_HEADER,
  createMemoryCache,
  createRateTracker,
  createStagingResolverHttpServer
} = require('./website_resolver_staging_endpoint');

const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = 8787;
const ENV_CONTRACT = [
  {
    name: 'IDB_RESOLVER_TOKEN',
    required: true,
    secret: true,
    purpose: 'Shared resolver token supplied by secret manager or protected shell.'
  },
  {
    name: 'IDB_RESOLVER_ALLOWED_ORIGINS',
    required: true,
    secret: false,
    purpose: 'Comma-separated exact NetSuite staging origins allowed by CORS.'
  },
  {
    name: 'IDB_RESOLVER_PORT',
    required: false,
    secret: false,
    purpose: 'HTTP port for local production-mode or container runtime.'
  },
  {
    name: 'IDB_RESOLVER_HOST',
    required: false,
    secret: false,
    purpose: 'Bind host. Defaults to 127.0.0.1 for local production-mode.'
  },
  {
    name: 'IDB_RESOLVER_RATE_TOKEN_PER_MINUTE',
    required: false,
    secret: false,
    purpose: 'Per-token resolver request limit per minute.'
  },
  {
    name: 'IDB_RESOLVER_RATE_DOMAIN_PER_MINUTE',
    required: false,
    secret: false,
    purpose: 'Per-domain resolver request limit per minute.'
  },
  {
    name: 'IDB_RESOLVER_REQUEST_MAX_BYTES',
    required: false,
    secret: false,
    purpose: 'Maximum JSON request body size accepted by the hosted wrapper.'
  }
];

function splitOrigins(value) {
  return String(value || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function positiveInteger(value, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return fallback;
  return Math.floor(number);
}

function parseHostedResolverEnv(env = process.env) {
  const token = String(env.IDB_RESOLVER_TOKEN || '').trim();
  const allowedOrigins = splitOrigins(env.IDB_RESOLVER_ALLOWED_ORIGINS);
  const missing = [];
  if (!token) missing.push('IDB_RESOLVER_TOKEN');
  if (!allowedOrigins.length) missing.push('IDB_RESOLVER_ALLOWED_ORIGINS');

  const config = {
    host: String(env.IDB_RESOLVER_HOST || DEFAULT_HOST),
    port: positiveInteger(env.IDB_RESOLVER_PORT, DEFAULT_PORT),
    tokenConfigured: Boolean(token),
    token,
    tokenHeader: DEFAULT_TOKEN_HEADER,
    allowedOrigins,
    resolvePath: DEFAULT_RESOLVE_PATH,
    healthPath: DEFAULT_HEALTH_PATH,
    requestMaxBytes: positiveInteger(env.IDB_RESOLVER_REQUEST_MAX_BYTES, 100000),
    rateLimits: {
      perTokenPerMinute: positiveInteger(env.IDB_RESOLVER_RATE_TOKEN_PER_MINUTE, 12),
      perDomainPerMinute: positiveInteger(env.IDB_RESOLVER_RATE_DOMAIN_PER_MINUTE, 6)
    },
    cacheAdapter: 'memory',
    observability: {
      redacted: true,
      logSecrets: false,
      logCookies: false,
      logAuthorization: false,
      logManualEvidenceFullText: false
    },
    noRegression: {
      writeAuthority: 'none',
      suiteScriptInvocation: false,
      nllmAdvisoryOnly: true,
      notesCannotOwnIdentification: true,
      blockedThinUnavailableTimeoutDoNotGuess: true,
      transactionWriteEnabled: false,
      hostedResolverPilotEnabled: false
    }
  };

  return {
    ok: missing.length === 0,
    missing,
    config
  };
}

function redactedHostedConfig(config) {
  return {
    host: config.host,
    port: config.port,
    tokenConfigured: config.tokenConfigured,
    tokenHeader: config.tokenHeader,
    allowedOrigins: config.allowedOrigins,
    resolvePath: config.resolvePath,
    healthPath: config.healthPath,
    requestMaxBytes: config.requestMaxBytes,
    rateLimits: config.rateLimits,
    cacheAdapter: config.cacheAdapter,
    observability: config.observability,
    noRegression: config.noRegression
  };
}

function createHostedResolverServerFromEnv(env = process.env, overrides = {}) {
  const parsed = parseHostedResolverEnv(env);
  if (!parsed.ok) {
    const error = new Error(`Missing hosted resolver env: ${parsed.missing.join(', ')}`);
    error.code = 'IDB_HOSTED_RESOLVER_ENV_MISSING';
    error.missing = parsed.missing;
    error.redactedConfig = redactedHostedConfig(parsed.config);
    throw error;
  }

  const cache = overrides.cache || createMemoryCache();
  const rateTracker = overrides.rateTracker || createRateTracker(parsed.config.rateLimits);
  const server = createStagingResolverHttpServer({
    token: parsed.config.token,
    tokenHeader: parsed.config.tokenHeader,
    allowedOrigins: parsed.config.allowedOrigins,
    cache,
    rateTracker,
    rateLimits: parsed.config.rateLimits,
    resolverOptions: overrides.resolverOptions || {}
  });
  server.hostedConfig = redactedHostedConfig(parsed.config);
  return server;
}

function startHostedResolverServer(env = process.env) {
  const parsed = parseHostedResolverEnv(env);
  const server = createHostedResolverServerFromEnv(env);
  server.listen(parsed.config.port, parsed.config.host, () => {
    const config = redactedHostedConfig(parsed.config);
    console.log(JSON.stringify({
      event: 'idb_hosted_resolver_started',
      serviceName: 'websiteResolverServiceV1',
      host: config.host,
      port: config.port,
      healthPath: config.healthPath,
      resolvePath: config.resolvePath,
      tokenConfigured: config.tokenConfigured,
      allowedOriginCount: config.allowedOrigins.length,
      writeAuthority: 'none',
      suiteScriptInvocation: false,
      nllmAdvisoryOnly: true
    }));
  });
  return server;
}

if (require.main === module) {
  try {
    startHostedResolverServer(process.env);
  } catch (error) {
    console.error(JSON.stringify({
      event: 'idb_hosted_resolver_start_failed',
      code: error.code || 'IDB_HOSTED_RESOLVER_START_FAILED',
      missing: error.missing || [],
      tokenLogged: false,
      writeAuthority: 'none',
      suiteScriptInvocation: false,
      nllmAdvisoryOnly: true
    }));
    process.exit(1);
  }
}

module.exports = {
  ENV_CONTRACT,
  parseHostedResolverEnv,
  redactedHostedConfig,
  createHostedResolverServerFromEnv,
  startHostedResolverServer
};
