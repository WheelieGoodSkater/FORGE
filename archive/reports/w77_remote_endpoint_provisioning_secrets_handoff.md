# W77 Remote Endpoint Provisioning And Secrets Handoff

Decision: PASS / PROVISIONING HANDOFF READY / HOSTED PILOT STILL NO-GO / NO WRITE AUTHORITY

## Objective

Provision or identify the real hosted staging `websiteResolverServiceV1` endpoint and establish the secret handoff needed for W76R.

## Current Position

W76R remains no-go because the operator-provided endpoint URL, resolver token, approved origin, blocked origin, and remote smoke opt-in are not available. This handoff does not store secrets and does not enable hosted resolver pilot traffic.

## Provisioning Checklist

| Role | Required Output | Item | Acceptance |
| --- | --- | --- | --- |
| Resolver Service Architect | IDB_REMOTE_RESOLVER_BASE_URL | Provision or identify hosted staging resolver endpoint. | HTTPS public endpoint exposes /health and /idb/website-resolver/v1/resolve; not localhost, loopback, private network, or metadata IP. |
| Security Guard | IDB_REMOTE_RESOLVER_TOKEN | Create resolver token for staging. | Stored in a secret manager or protected shell only; never committed or written into traces, reports, screenshots, or docs. |
| Security Guard | IDB_REMOTE_RESOLVER_ALLOWED_ORIGIN | Confirm approved NetSuite staging origin. | Exact HTTPS NetSuite account origin; wildcard CORS remains forbidden. |
| Security Guard | IDB_REMOTE_RESOLVER_BLOCKED_ORIGIN | Choose blocked negative-test origin. | HTTPS origin not present in CORS allowlist; preflight must fail without echoing origin. |
| Regression Guard Agent | IDB_REMOTE_RESOLVER_SMOKE=1 | Set explicit remote smoke opt-in. | Remote smoke cannot execute unless this value is explicitly set. |
| Website Intelligence Agent | Approved live smoke command can run through hosted resolver. | Approve live smoke target set for hosted endpoint. | Zero false-confident-wrong, zero unsupported claims, and failure states do not guess. |

## Secret Handoff Instructions

- Do not paste the resolver token into chat, repo files, reports, traces, screenshots, or README content.
- Set the token as a protected environment variable in the shell that will run W76R, or use a secret manager in the remote deployment target.
- Share only redacted confirmation that tokenConfigured is true.
- If a human must hand off the token, use the approved secret channel outside Codex and outside git.
- Rotate the token before consultant pilot if it was shared through any temporary channel.
- Keep endpoint URL and origins non-secret but still validate them before running hosted smoke.

## Rerun Commands

```bash
export IDB_REMOTE_RESOLVER_SMOKE=1
export IDB_REMOTE_RESOLVER_BASE_URL='https://<remote-staging-resolver>'
export IDB_REMOTE_RESOLVER_TOKEN='<set-from-secret-manager-or-protected-shell>'
export IDB_REMOTE_RESOLVER_ALLOWED_ORIGIN='https://<approved-netsuite-account>.app.netsuite.com'
export IDB_REMOTE_RESOLVER_BLOCKED_ORIGIN='https://unapproved.example.com'
npm run harness:apply-hosted-resolver-env-rerun
npm run harness:hosted-resolver-configured-remote-execution
npm run preflight
```

## Harness Gates

| Status | Rule | Detail |
| --- | --- | --- |
| PASS | w77_contract_schema_present | idb.w77-remote-endpoint-provisioning-secrets-handoff.v1 |
| PASS | w77_inherits_w76r_no_go | {"w76rDecision":"no_go_operator_env_missing","remoteSmokeExecuted":false} |
| PASS | w77_provisioning_checklist_complete | [{"ownerRole":"Resolver Service Architect","item":"Provision or identify hosted staging resolver endpoint.","requiredOutput":"IDB_REMOTE_RESOLVER_BASE_URL","acceptance":"HTTPS public endpoint exposes /health and /idb/website-resolver/v1/resolve; not localhost, loopback, private network, or metadata IP."},{"ownerRole":"Security Guard","item":"Create resolver token for staging.","requiredOutput":"IDB_REMOTE_RESOLVER_TOKEN","acceptance":"Stored in a secret manager or protected shell only; never committed or written into traces, reports, screenshots, or docs."},{"ownerRole":"Security Guard","item":"Confirm approved NetSuite staging origin.","requiredOutput":"IDB_REMOTE_RESOLVER_ALLOWED_ORIGIN","acceptance":"Exact HTTPS NetSuite account origin; wildcard CORS remains forbidden."},{"ownerRole":"Security Guard","item":"Choose blocked negative-test origin.","requiredOutput":"IDB_REMOTE_RESOLVER_BLOCKED_ORIGIN","acceptance":"HTTPS origin not present in CORS allowlist; preflight must fail without echoing origin."},{"ownerRole":"Regression Guard Agent","item":"Set explicit remote smoke opt-in.","requiredOutput":"IDB_REMOTE_RESOLVER_SMOKE=1","acceptance":"Remote smoke cannot execute unless this value is explicitly set."},{"ownerRole":"Website Intelligence Agent","item":"Approve live smoke target set for hosted endpoint.","requiredOutput":"Approved live smoke command can run through hosted resolver.","acceptance":"Zero false-confident-wrong, zero unsupported claims, and failure states do not guess."}] |
| PASS | w77_secret_handoff_safe | ["Do not paste the resolver token into chat, repo files, reports, traces, screenshots, or README content.","Set the token as a protected environment variable in the shell that will run W76R, or use a secret manager in the remote deployment target.","Share only redacted confirmation that tokenConfigured is true.","If a human must hand off the token, use the approved secret channel outside Codex and outside git.","Rotate the token before consultant pilot if it was shared through any temporary channel.","Keep endpoint URL and origins non-secret but still validate them before running hosted smoke."] |
| PASS | w77_operator_env_template_present | ["export IDB_REMOTE_RESOLVER_SMOKE=1","export IDB_REMOTE_RESOLVER_BASE_URL='https://<remote-staging-resolver>'","export IDB_REMOTE_RESOLVER_TOKEN='<set-from-secret-manager-or-protected-shell>'","export IDB_REMOTE_RESOLVER_ALLOWED_ORIGIN='https://<approved-netsuite-account>.app.netsuite.com'","export IDB_REMOTE_RESOLVER_BLOCKED_ORIGIN='https://unapproved.example.com'"] |
| PASS | w77_rerun_commands_present | ["npm run harness:apply-hosted-resolver-env-rerun","npm run harness:hosted-resolver-configured-remote-execution","npm run preflight"] |
| PASS | w77_pilot_unlock_gate_complete | ["W76R must rerun with remoteSmokeExecuted true.","W73R remote readiness smoke must pass health, auth/CORS, write-payload rejection, and cache-hit checks.","Approved live-site smoke through hosted endpoint must pass with zero false-confident-wrong and zero unsupported claims.","No raw token/header/cookie values may appear in trace or report output.","W74 must rerun and return hosted resolver consultant smoke eligible before any hosted resolver pilot toggle is enabled."] |
| PASS | w77_blocked_until_provisioned | {"hostedResolverPilotEnabled":false,"consultantSmokeEligible":false,"remoteSmokeExecutable":false,"reason":"W76R lacks operator-provided remote endpoint and secret values."} |
| PASS | w77_no_regression_boundaries_present | {"writeAuthority":"none","suiteScriptInvocation":false,"nllmAdvisoryOnly":true,"notesCannotOwnIdentification":true,"blockedThinUnavailableTimeoutDoNotGuess":true,"transactionWriteEnabled":false,"mainDrawerCreateEnabled":false,"mainSuiteletCreateEnabled":false,"hostedResolverPilotEnabled":false} |
| PASS | w77_best_next_prompt_present | Move through W78: Secret-Safe Remote Smoke Operator Runbook. Convert the W77 provisioning handoff into an operator-ready runbook for the person who has access to the hosted resolver URL and token: exact shell setup, smoke command order, expected pass/fail outputs, no-secret handling rules, rollback steps, and pilot unlock decision tree. Do not store secrets in repo files, traces, reports, or screenshots. Keep drawer and SuiteScript write-disabled, preserve N/LLM advisory-only, notes story-only, and blocked/thin/unavailable/timeout as insufficient evidence with no confident guesses. Output runbook, command checklist, W78 report, validator gates, and best next Codex prompt. |

## No Regression

- No writes.
- No SuiteScript invocation.
- N/LLM advisory-only.
- Notes cannot own identity.
- Blocked, thin, unavailable, and timeout remain insufficient evidence with no confident guesses.
- Transaction writes remain blocked.
- Hosted resolver pilot traffic remains disabled.

## Failures

- None

## Best Next Codex Prompt

```text
Move through W78: Secret-Safe Remote Smoke Operator Runbook. Convert the W77 provisioning handoff into an operator-ready runbook for the person who has access to the hosted resolver URL and token: exact shell setup, smoke command order, expected pass/fail outputs, no-secret handling rules, rollback steps, and pilot unlock decision tree. Do not store secrets in repo files, traces, reports, or screenshots. Keep drawer and SuiteScript write-disabled, preserve N/LLM advisory-only, notes story-only, and blocked/thin/unavailable/timeout as insufficient evidence with no confident guesses. Output runbook, command checklist, W78 report, validator gates, and best next Codex prompt.
```
