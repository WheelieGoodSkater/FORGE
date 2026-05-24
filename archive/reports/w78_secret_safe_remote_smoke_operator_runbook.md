# W78 Secret-Safe Remote Smoke Operator Runbook

Decision: PASS / OPERATOR RUNBOOK READY / HOSTED PILOT STILL NO-GO / NO WRITE AUTHORITY

## Objective

Convert the W77 provisioning handoff into an operator-ready runbook for the person who has access to the hosted resolver URL and token.

## Shell Setup

```bash
export IDB_REMOTE_RESOLVER_SMOKE=1
export IDB_REMOTE_RESOLVER_BASE_URL='https://<remote-staging-resolver>'
export IDB_REMOTE_RESOLVER_TOKEN='<set-from-secret-manager-or-protected-shell>'
export IDB_REMOTE_RESOLVER_ALLOWED_ORIGIN='https://<approved-netsuite-account>.app.netsuite.com'
export IDB_REMOTE_RESOLVER_BLOCKED_ORIGIN='https://unapproved.example.com'
```

## Smoke Command Order

| Step | Command | Purpose | Expected Pass | Expected Fail |
| --- | --- | --- | --- | --- |
| 1 | npm run harness:apply-hosted-resolver-env-rerun | Rerun W76R with operator-provided env and confirm W76 sees remote env. | pilot_decision is not no_go_operator_env_missing and remote_smoke_executed becomes true. | pilot_decision=no_go_operator_env_missing or remote_smoke_executed=false. |
| 2 | npm run harness:hosted-resolver-configured-remote-execution | Run W76 configured remote execution gate. | W76 reports remote_smoke_executed=true and pilot unlock criteria are satisfied. | W76 reports no_go_remote_config_missing or any failed health/auth/CORS/cache/live-smoke criterion. |
| 3 | npm run harness:remote-resolver-pilot-toggle-decision | Rerun W74 after remote smoke passes to decide consultant hosted-smoke eligibility. | Hosted resolver consultant smoke becomes eligible only after W73R remoteSmokeExecuted true. | Hosted resolver pilot remains disabled. |
| 4 | npm run preflight | Verify all resolver, classifier, no-write, and no-secret gates remain green. | Full preflight passes. | Any failing gate blocks hosted resolver pilot. |

## Pilot Unlock Decision Tree

| Condition | Decision | Action |
| --- | --- | --- |
| Remote env values are missing. | no_go | Return to W77 provisioning handoff. |
| W73R remoteSmokeExecuted is false. | no_go | Fix endpoint/token/origin config and rerun W76R. |
| Health/auth/CORS/write-payload/cache checks fail. | no_go | Fix hosted resolver deployment or security policy. |
| Approved live-site smoke has false-confident-wrong or unsupported claims. | no_go | Fix extraction/classifier calibration before pilot. |
| Any raw token/header/cookie appears in trace/report. | stop_and_rotate_secret | Rotate token, delete unsafe artifact, rerun no-secret validation. |
| W73R remoteSmokeExecuted true, all remote checks pass, no secrets leak, full preflight passes, and W74 returns consultant smoke eligible. | pilot_unlock_candidate | Proceed to hosted-only consultant smoke gate; do not enable production traffic yet. |

## No-Secret Handling Rules

- Do not paste the resolver token into chat, repo files, reports, trace samples, screenshots, or README content.
- Do not commit shell exports containing secrets.
- Do not print Authorization, cookie, or X-IDB-Resolver-Token values.
- Only record tokenConfigured true/false.
- If the token appears in any artifact, stop and rotate the token before continuing.
- Endpoint URL and origins may be non-secret, but still validate them before smoke.

## Rollback Steps

- Unset IDB_REMOTE_RESOLVER_BASE_URL and IDB_REMOTE_RESOLVER_TOKEN in the operator shell.
- Clear drawer endpoint/token settings before consultant pilot.
- Set hosted resolver pilot toggle to disabled.
- Use local fallback only for development smoke, not as proof of hosted readiness.
- Rerun npm run harness:remote-resolver-pilot-toggle-decision and confirm hostedResolverPilotEnabled false.
- Export trace showing rollback decision with no raw secrets.

## Harness Gates

| Status | Rule | Detail |
| --- | --- | --- |
| PASS | w78_contract_schema_present | idb.w78-secret-safe-remote-smoke-operator-runbook.v1 |
| PASS | w78_inherits_w77_no_go | {"w77Decision":"no_go_until_operator_provisions_remote_endpoint_and_secret","remoteSmokeExecuted":false} |
| PASS | w78_shell_setup_complete | [{"step":1,"command":"export IDB_REMOTE_RESOLVER_SMOKE=1","secret":false,"expected":"Remote smoke opt-in is explicit."},{"step":2,"command":"export IDB_REMOTE_RESOLVER_BASE_URL='https://<remote-staging-resolver>'","secret":false,"expected":"Base URL is HTTPS public staging endpoint, not localhost/private network."},{"step":3,"command":"export IDB_REMOTE_RESOLVER_TOKEN='<set-from-secret-manager-or-protected-shell>'","secret":true,"expected":"Token is present only in protected shell/secret manager and never written to repo artifacts."},{"step":4,"command":"export IDB_REMOTE_RESOLVER_ALLOWED_ORIGIN='https://<approved-netsuite-account>.app.netsuite.com'","secret":false,"expected":"Approved CORS origin is exact NetSuite staging origin."},{"step":5,"command":"export IDB_REMOTE_RESOLVER_BLOCKED_ORIGIN='https://unapproved.example.com'","secret":false,"expected":"Blocked CORS origin is not in allowlist."}] |
| PASS | w78_smoke_command_order_complete | [{"step":1,"command":"npm run harness:apply-hosted-resolver-env-rerun","purpose":"Rerun W76R with operator-provided env and confirm W76 sees remote env.","expectedPass":"pilot_decision is not no_go_operator_env_missing and remote_smoke_executed becomes true.","expectedFail":"pilot_decision=no_go_operator_env_missing or remote_smoke_executed=false."},{"step":2,"command":"npm run harness:hosted-resolver-configured-remote-execution","purpose":"Run W76 configured remote execution gate.","expectedPass":"W76 reports remote_smoke_executed=true and pilot unlock criteria are satisfied.","expectedFail":"W76 reports no_go_remote_config_missing or any failed health/auth/CORS/cache/live-smoke criterion."},{"step":3,"command":"npm run harness:remote-resolver-pilot-toggle-decision","purpose":"Rerun W74 after remote smoke passes to decide consultant hosted-smoke eligibility.","expectedPass":"Hosted resolver consultant smoke becomes eligible only after W73R remoteSmokeExecuted true.","expectedFail":"Hosted resolver pilot remains disabled."},{"step":4,"command":"npm run preflight","purpose":"Verify all resolver, classifier, no-write, and no-secret gates remain green.","expectedPass":"Full preflight passes.","expectedFail":"Any failing gate blocks hosted resolver pilot."}] |
| PASS | w78_expected_outputs_present | {"pass":["W73R trace remoteSmokeExecuted true.","Remote /health returns writeAuthority none, suiteScriptInvocation false, nllmAdvisoryOnly true.","Approved CORS preflight returns exact approved origin.","Blocked CORS preflight fails and does not echo blocked origin.","Missing token returns 401 before fetch.","Write-shaped payload returns 400 before fetch.","Second eligible resolve returns cacheHit true.","Approved live-site smoke returns zero false-confident-wrong and zero unsupported claims.","Trace/report show tokenConfigured true but never show the token value.","Full preflight passes."],"fail":["remoteSmokeExecuted false.","no_go_operator_env_missing.","no_go_remote_config_missing.","remote_base_url_must_use_https.","remote_base_url_must_not_be_private_or_localhost.","approved CORS preflight does not return exact allowed origin.","blocked CORS preflight echoes blocked origin.","write-shaped payload is accepted.","false-confident-wrong count is greater than zero.","unsupported claim count is greater than zero.","raw token/header/cookie value appears in any trace or report."]} |
| PASS | w78_no_secret_rules_present | ["Do not paste the resolver token into chat, repo files, reports, trace samples, screenshots, or README content.","Do not commit shell exports containing secrets.","Do not print Authorization, cookie, or X-IDB-Resolver-Token values.","Only record tokenConfigured true/false.","If the token appears in any artifact, stop and rotate the token before continuing.","Endpoint URL and origins may be non-secret, but still validate them before smoke."] |
| PASS | w78_rollback_steps_present | ["Unset IDB_REMOTE_RESOLVER_BASE_URL and IDB_REMOTE_RESOLVER_TOKEN in the operator shell.","Clear drawer endpoint/token settings before consultant pilot.","Set hosted resolver pilot toggle to disabled.","Use local fallback only for development smoke, not as proof of hosted readiness.","Rerun npm run harness:remote-resolver-pilot-toggle-decision and confirm hostedResolverPilotEnabled false.","Export trace showing rollback decision with no raw secrets."] |
| PASS | w78_decision_tree_complete | [{"condition":"Remote env values are missing.","decision":"no_go","action":"Return to W77 provisioning handoff."},{"condition":"W73R remoteSmokeExecuted is false.","decision":"no_go","action":"Fix endpoint/token/origin config and rerun W76R."},{"condition":"Health/auth/CORS/write-payload/cache checks fail.","decision":"no_go","action":"Fix hosted resolver deployment or security policy."},{"condition":"Approved live-site smoke has false-confident-wrong or unsupported claims.","decision":"no_go","action":"Fix extraction/classifier calibration before pilot."},{"condition":"Any raw token/header/cookie appears in trace/report.","decision":"stop_and_rotate_secret","action":"Rotate token, delete unsafe artifact, rerun no-secret validation."},{"condition":"W73R remoteSmokeExecuted true, all remote checks pass, no secrets leak, full preflight passes, and W74 returns consultant smoke eligible.","decision":"pilot_unlock_candidate","action":"Proceed to hosted-only consultant smoke gate; do not enable production traffic yet."}] |
| PASS | w78_no_regression_boundaries_present | {"writeAuthority":"none","suiteScriptInvocation":false,"nllmAdvisoryOnly":true,"notesCannotOwnIdentification":true,"blockedThinUnavailableTimeoutDoNotGuess":true,"transactionWriteEnabled":false,"mainDrawerCreateEnabled":false,"mainSuiteletCreateEnabled":false,"hostedResolverPilotEnabled":false} |
| PASS | w78_best_next_prompt_present | Move through W79: Hosted Resolver Consultant Smoke Unlock Gate. Use the W78 runbook result to decide whether the hosted resolver can proceed to consultant-shaped smoke. If W76R has remoteSmokeExecuted true and W74 returns hosted consultant smoke eligible, run hosted-only Plan/Review/ROI/Run/Trace smoke with concise resolver status, evidence coverage, rollback guidance, no-secret trace checks, and no-write/no-SuiteScript/N/LLM-advisory-only gates. If not, keep pilot no-go and output the exact failed unlock criteria. Keep notes story-only and blocked/thin/unavailable/timeout as insufficient evidence with no confident guesses. Output consultant smoke results or no-go criteria, W79 report, validator gates, and best next Codex prompt. |

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
Move through W79: Hosted Resolver Consultant Smoke Unlock Gate. Use the W78 runbook result to decide whether the hosted resolver can proceed to consultant-shaped smoke. If W76R has remoteSmokeExecuted true and W74 returns hosted consultant smoke eligible, run hosted-only Plan/Review/ROI/Run/Trace smoke with concise resolver status, evidence coverage, rollback guidance, no-secret trace checks, and no-write/no-SuiteScript/N/LLM-advisory-only gates. If not, keep pilot no-go and output the exact failed unlock criteria. Keep notes story-only and blocked/thin/unavailable/timeout as insufficient evidence with no confident guesses. Output consultant smoke results or no-go criteria, W79 report, validator gates, and best next Codex prompt.
```
