# W80R Real HTTPS Endpoint Rerun Remote Smoke

Decision: PASS / REAL HTTPS ENDPOINT NOT CONFIGURED / HOSTED PILOT STILL DISABLED / NO WRITE AUTHORITY

## Objective

Provision or identify the real HTTPS staging `websiteResolverServiceV1` endpoint and rerun W80 remote smoke without storing secrets.

## Current Position

No real HTTPS endpoint/token/origin set is available in this shell. Local hosted smoke remains useful, but it is not production or consultant-pilot proof.

## Exact No-Go Remediation

- Deploy W79A package to a real HTTPS staging host.
- Set IDB_REMOTE_RESOLVER_SMOKE=1 in protected shell.
- Set IDB_REMOTE_RESOLVER_BASE_URL to the real public HTTPS endpoint.
- Set IDB_REMOTE_RESOLVER_TOKEN from secret manager or protected shell only.
- Set IDB_REMOTE_RESOLVER_ALLOWED_ORIGIN to the exact NetSuite staging origin.
- Set IDB_REMOTE_RESOLVER_BLOCKED_ORIGIN to an HTTPS origin that is not allowed by CORS.
- Rerun npm run harness:hosted-resolver-remote-smoke-w80.
- Then rerun npm run preflight.

## Harness Gates

| Status | Rule | Detail |
| --- | --- | --- |
| PASS | w80r_inherits_w80_local_hosted_smoke | {"executed":true,"mode":"http_server","bindError":null,"baseUrlRedacted":"http://127.0.0.1:<dynamic-port>","healthStatus":200,"approvedPreflightStatus":204,"blockedPreflightStatus":403,"missingTokenStatus":401,"cookieRejectedStatus":400,"writeRejectedStatus":400,"firstResolveStatus":200,"secondResolveStatus":200,"secondCacheHit":true,"failureStatesNoGuess":true,"noSecretTrace":true} |
| PASS | w80r_prior_remote_not_unlocked | {"remote":false,"pilot":"no_go_remote_config_missing"} |
| PASS | w80r_env_observed_without_secrets | {"remoteSmokeOptIn":false,"baseUrl":{"configured":false,"https":false,"publicHost":false,"redacted":""},"tokenConfigured":false,"allowedOriginConfigured":false,"blockedOriginConfigured":false,"missing":["IDB_REMOTE_RESOLVER_SMOKE=1","IDB_REMOTE_RESOLVER_BASE_URL","IDB_REMOTE_RESOLVER_TOKEN","IDB_REMOTE_RESOLVER_ALLOWED_ORIGIN","IDB_REMOTE_RESOLVER_BLOCKED_ORIGIN"],"remoteExecutable":false,"rawSecretsIncluded":false} |
| PASS | w80r_remote_env_missing_keeps_no_go | {"remoteSmokeOptIn":false,"baseUrl":{"configured":false,"https":false,"publicHost":false,"redacted":""},"tokenConfigured":false,"allowedOriginConfigured":false,"blockedOriginConfigured":false,"missing":["IDB_REMOTE_RESOLVER_SMOKE=1","IDB_REMOTE_RESOLVER_BASE_URL","IDB_REMOTE_RESOLVER_TOKEN","IDB_REMOTE_RESOLVER_ALLOWED_ORIGIN","IDB_REMOTE_RESOLVER_BLOCKED_ORIGIN"],"remoteExecutable":false,"rawSecretsIncluded":false} |

## No Regression

- No writes.
- No SuiteScript invocation.
- N/LLM advisory-only.
- Notes story-only.
- Blocked, thin, unavailable, and timeout remain insufficient evidence with no confident guesses.
- Transaction writes remain blocked.
- Hosted consultant pilot remains disabled until `remoteSmokeExecuted=true`.

## Failures

- None

## Best Next Codex Prompt

```text
Move through W80S: Hosted Endpoint Platform Selection And Deploy. Choose the staging host for websiteResolverServiceV1, deploy the W79A package to a real public HTTPS endpoint, configure IDB_RESOLVER_TOKEN and IDB_RESOLVER_ALLOWED_ORIGINS in the platform secret/env settings, then provide only the non-secret endpoint URL and approved/blocked origins plus a protected-token handoff path for W80R. Do not store secrets in repo files, traces, reports, screenshots, or chat. Keep hosted consultant pilot disabled until remoteSmokeExecuted=true. Output platform selection, deploy steps, secret-safe handoff, W80S report, validator gates, and best next Codex prompt.
```
