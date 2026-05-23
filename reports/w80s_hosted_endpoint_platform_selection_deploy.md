# W80S Hosted Endpoint Platform Selection And Deploy

Decision: PASS / PLATFORM SELECTED, REAL HTTPS ENV NOT CONFIGURED / HOSTED PILOT STILL DISABLED / NO WRITE AUTHORITY

## Blunt Status

W80S selected the deployment shape and created the protected-shell handoff path. It did not fabricate a public HTTPS endpoint or token. This shell still does not have the real hosted endpoint/token/origin values, so the consultant hosted resolver pilot remains no-go.

## Platform Selection

Selected: `container_https_staging_host`

W79A already packages websiteResolverServiceV1 as a portable Node container; the staging host must provide managed HTTPS, secret-backed environment variables, exact CORS origins, logs, and rollback.

## Secret-Safe Handoff

- Endpoint URL: `not_configured`
- Approved origin: `not_configured`
- Blocked origin: `not_configured`
- Token handoff: platform secret manager and protected shell only; never repo files, traces, reports, screenshots, or chat
- Protected shell template: `deploy/hosted-resolver/protected-shell.template.sh`

## Missing Protected Shell Values

- IDB_REMOTE_RESOLVER_SMOKE=1
- IDB_REMOTE_RESOLVER_BASE_URL
- IDB_REMOTE_RESOLVER_TOKEN or IDB_RESOLVER_TOKEN
- IDB_REMOTE_RESOLVER_ALLOWED_ORIGIN
- IDB_REMOTE_RESOLVER_BLOCKED_ORIGIN

## Deploy Steps

| Role | Step | Required Output |
| --- | --- | --- |
| Resolver Service Architect | Build and deploy deploy/hosted-resolver/Dockerfile from the W79A package. | Public HTTPS service exposing GET /health and POST /idb/website-resolver/v1/resolve. |
| Security Guard | Set IDB_RESOLVER_TOKEN in the platform secret manager. | Token exists only in secret manager/protected shell; no repo, trace, report, screenshot, or chat copy. |
| Security Guard | Set IDB_RESOLVER_ALLOWED_ORIGINS to the exact NetSuite staging origin list. | Approved origin is non-secret and exact; wildcard CORS remains forbidden. |
| DevOps Readiness Agent | Configure rate limits, request timeout, cache TTL, and redacted logs. | Resolver can observe status without raw tokens, cookies, auth headers, or request secrets. |
| Validation And Evidence Agent | Place endpoint URL and origins in protected shell, then run W80R. | remoteSmokeExecuted=true is required before consultant hosted pilot can unlock. |

## Validator Gates

- Deployment package exists and uses website_resolver_hosted_service.js.
- Protected-shell template contains placeholders only and no real token.
- Observed environment records tokenConfigured as a boolean only.
- Endpoint URL and origins are treated as non-secret; token value is never stored.
- Hosted consultant pilot remains disabled until W80R returns remoteSmokeExecuted=true.
- No writes, no SuiteScript invocation, N/LLM advisory-only, notes story-only.
- Blocked, thin, unavailable, and timeout remain insufficient evidence with no confident guesses.

## Harness Results

| Status | Rule | Detail |
| --- | --- | --- |
| PASS | w80s_inherits_w79a_deployment_package | {"schema":"idb.w79a-hosted-resolver-deployment-package.v1","pilot":{"hostedResolverPilotEnabled":false,"consultantSmokeEligible":false,"reason":"Deployment package is ready, but no real remote hosted endpoint has executed smoke with remoteSmokeExecuted=true."}} |
| PASS | w80s_inherits_w80r_no_unlock | {"remoteSmokeExecuted":false,"pilotDecision":"no_go_real_https_endpoint_not_configured","hostedResolverPilotEnabled":false,"consultantSmokeEligible":false,"exactNoGoRemediation":["Deploy W79A package to a real HTTPS staging host.","Set IDB_REMOTE_RESOLVER_SMOKE=1 in protected shell.","Set IDB_REMOTE_RESOLVER_BASE_URL to the real public HTTPS endpoint.","Set IDB_REMOTE_RESOLVER_TOKEN from secret manager or protected shell only.","Set IDB_REMOTE_RESOLVER_ALLOWED_ORIGIN to the exact NetSuite staging origin.","Set IDB_REMOTE_RESOLVER_BLOCKED_ORIGIN to an HTTPS origin that is not allowed by CORS.","Rerun npm run harness:hosted-resolver-remote-smoke-w80.","Then rerun npm run preflight."]} |
| PASS | w80s_platform_selected_container_https | {"id":"container_https_staging_host","selected":true,"reason":"W79A already packages websiteResolverServiceV1 as a portable Node container; the staging host must provide managed HTTPS, secret-backed environment variables, exact CORS origins, logs, and rollback.","requirements":["Public HTTPS endpoint for /health and /idb/website-resolver/v1/resolve.","Secret-managed IDB_RESOLVER_TOKEN and IDB_RESOLVER_ALLOWED_ORIGINS.","No wildcard CORS and no browser cookies accepted by resolver endpoint.","Configurable request timeout, rate limit, cache setting, and redacted observability.","One-command rollback or environment toggle that disables drawer hosted-only mode."],"candidateExamples":["Any container-capable staging host with managed HTTPS and secret env settings.","A serverless container service is acceptable if it preserves timeout and outbound fetch controls."]} |
| PASS | w80s_w79a_artifacts_deployable | deploy/hosted-resolver |
| PASS | w80s_protected_shell_template_no_real_secret | deploy/hosted-resolver/protected-shell.template.sh |
| PASS | w80s_secret_safe_env_observation | {"remoteSmokeOptIn":false,"remoteBaseUrlConfigured":false,"tokenConfigured":false,"allowedOriginConfigured":false,"blockedOriginConfigured":false,"platformAllowedOriginsConfigured":false,"nonSecretEndpointUrl":"not_configured","approvedOrigin":"not_configured","blockedOrigin":"not_configured","platformAllowedOrigins":["not_configured"],"rawSecretsIncluded":false,"missing":["IDB_REMOTE_RESOLVER_SMOKE=1","IDB_REMOTE_RESOLVER_BASE_URL","IDB_REMOTE_RESOLVER_TOKEN or IDB_RESOLVER_TOKEN","IDB_REMOTE_RESOLVER_ALLOWED_ORIGIN","IDB_REMOTE_RESOLVER_BLOCKED_ORIGIN"],"readyForW80R":false,"tokenValueStored":false} |
| PASS | w80s_secret_safe_handoff_complete | {"endpointUrl":"not_configured","approvedOrigin":"not_configured","blockedOrigin":"not_configured","tokenHandoffPath":"platform secret manager and protected shell only; never repo files, traces, reports, screenshots, or chat","protectedShellTemplate":"deploy/hosted-resolver/protected-shell.template.sh","tokenConfigured":false,"noSecretValuesStored":true} |
| PASS | w80s_no_pilot_unlock_before_w80r_remote_smoke | {"readyForW80R":false,"pilot":false} |

## No Regression

- No writes.
- No SuiteScript invocation.
- N/LLM advisory-only.
- Notes story-only.
- Blocked, thin, unavailable, and timeout remain insufficient evidence with no confident guesses.
- Transaction writes remain blocked.
- Hosted consultant pilot remains disabled until `remoteSmokeExecuted=true`.

## Best Next Codex Prompt

```text
Move through W80T: Operator Deploy Hosted Resolver Endpoint. Using the W80S platform selection and W79A deployment package, deploy websiteResolverServiceV1 to a real public HTTPS staging host, set IDB_RESOLVER_TOKEN and IDB_RESOLVER_ALLOWED_ORIGINS in platform secret/env settings, place only endpoint URL plus approved/blocked origins in the protected shell, and keep the resolver token out of repo files, traces, reports, screenshots, and chat. Do not enable hosted consultant pilot. Output non-secret endpoint/origin handoff, deployment evidence, W80T report, validator gates, and best next Codex prompt.
```
