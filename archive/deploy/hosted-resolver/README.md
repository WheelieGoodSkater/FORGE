# Hosted Resolver Deployment Package

This package deploys the no-write `websiteResolverServiceV1` endpoint used by the Intelligent Demo Builder drawer.

## Runtime

- Health: `GET /health`
- Resolve: `POST /idb/website-resolver/v1/resolve`
- Auth: `X-IDB-Resolver-Token`
- CORS: exact NetSuite staging origins only
- Writes: not accepted
- SuiteScript invocation: not available
- N/LLM authority: advisory-only

## Local Production-Mode Smoke

```bash
export IDB_RESOLVER_TOKEN='<secret-manager-value>'
export IDB_RESOLVER_ALLOWED_ORIGINS='https://<approved-netsuite-account>.app.netsuite.com'
npm run resolver:hosted
```

Health check:

```bash
curl -sS http://127.0.0.1:8787/health
```

## Container Build

```bash
docker build -f deploy/hosted-resolver/Dockerfile -t idb-hosted-resolver:staging .
docker run --rm -p 8787:8787 \
  -e IDB_RESOLVER_TOKEN='<secret-manager-value>' \
  -e IDB_RESOLVER_ALLOWED_ORIGINS='https://<approved-netsuite-account>.app.netsuite.com' \
  idb-hosted-resolver:staging
```

## Remote Staging Checklist

- Provision an HTTPS endpoint for this service.
- Store `IDB_RESOLVER_TOKEN` only in secret manager or protected runtime env.
- Configure exact NetSuite staging origin in `IDB_RESOLVER_ALLOWED_ORIGINS`.
- Do not use wildcard CORS.
- Confirm `/health` returns `writeAuthority: none`.
- Confirm missing token returns `401` before fetch.
- Confirm write-shaped payload returns `400` before fetch.
- Confirm blocked origin is not echoed in CORS response.
- Confirm trace/log output records only tokenConfigured booleans, never token values.
- Keep hosted consultant pilot disabled until remote smoke reports `remoteSmokeExecuted=true`.

## Rollback

- Disable the drawer hosted resolver toggle.
- Remove endpoint URL/token from drawer settings.
- Revoke or rotate the resolver token.
- Rerun remote pilot toggle decision and confirm hosted pilot remains disabled.
