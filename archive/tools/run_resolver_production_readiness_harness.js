const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const contractPath = path.join(root, 'data', 'w67_resolver_production_readiness_hosted_endpoint_plan.json');
const w65TracePath = path.join(root, 'trace_samples', 'w65_approved_live_resolver_smoke_trace.json');
const w66TracePath = path.join(root, 'trace_samples', 'w66_live_extraction_gap_closure_trace.json');
const tracePath = path.join(root, 'trace_samples', 'w67_resolver_production_readiness_trace.json');
const reportPath = path.join(root, 'reports', 'w67_resolver_production_readiness_hosted_endpoint_plan.md');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function assertCase(results, name, pass, detail) {
  results.push({ name, pass: !!pass, detail: detail || '' });
}

function includesAll(actual, expected) {
  return expected.every((item) => actual.includes(item));
}

function escapeTable(value) {
  return String(value == null ? '' : value).replace(/\|/g, '/');
}

function main() {
  const contract = readJson(contractPath);
  const w65 = readJson(w65TracePath);
  const w66 = readJson(w66TracePath);
  const results = [];

  assertCase(results, 'w67_contract_schema_present', contract.schema === 'idb.w67-resolver-production-readiness-hosted-endpoint-plan.v1' && contract.status === 'complete_production_plan_ready', contract.schema);
  assertCase(results, 'w67_decision_is_plan_ready_not_prod_go', contract.readinessDecision === 'plan_ready_not_production_go' && contract.whyNotProductionGoYet.length >= 4, contract.readinessDecision);
  assertCase(results, 'w67_hosting_shape_present', contract.hostedEndpointPlan.path === '/idb/website-resolver/v1/resolve' && contract.hostedEndpointPlan.method === 'POST' && contract.hostedEndpointPlan.deploymentShape.some((item) => /outside Tampermonkey/.test(item)) && contract.hostedEndpointPlan.deploymentShape.some((item) => /No NetSuite credentials/.test(item)), JSON.stringify(contract.hostedEndpointPlan));
  assertCase(results, 'w67_auth_and_cors_locked_down', contract.endpointAuthAndCors.auth.some((item) => /short-lived/.test(item)) && contract.endpointAuthAndCors.cors.some((item) => /approved NetSuite account origins/.test(item)) && !contract.endpointAuthAndCors.cors.some((item) => /wildcard production CORS/.test(item) && /Allow/.test(item)), JSON.stringify(contract.endpointAuthAndCors));
  assertCase(results, 'w67_cache_strategy_present', /sha256/.test(contract.cacheStrategy.cacheKey) && contract.cacheStrategy.ttlSeconds === 86400 && contract.cacheStrategy.doNotCache.includes('cookies') && contract.cacheStrategy.cacheInvalidation.includes('resolverVersion change'), JSON.stringify(contract.cacheStrategy));
  assertCase(results, 'w67_rate_timeout_retry_policy_present', contract.rateLimitsAndTimeouts.perDomainPerMinute === 6 && contract.rateLimitsAndTimeouts.maxPages === 5 && contract.rateLimitsAndTimeouts.overallTimeoutMs === 12000 && contract.rateLimitsAndTimeouts.retryPolicy.some((item) => /No automatic retry for blocked/.test(item)), JSON.stringify(contract.rateLimitsAndTimeouts));
  assertCase(results, 'w67_domain_policy_preserves_ssrf_controls', includesAll(contract.domainPolicy.allowedSchemes, ['https']) && includesAll(contract.domainPolicy.blockedSchemes, ['file:', 'data:', 'javascript:', 'ftp:', 'gopher:']) && contract.domainPolicy.blockedTargets.includes('metadata IPs') && contract.domainPolicy.redirectPolicy.some((item) => /Re-check scheme and DNS/.test(item)), JSON.stringify(contract.domainPolicy));
  assertCase(results, 'w67_observability_trace_metrics_alerts_present', contract.observability.requiredTraceFields.includes('failureState') && contract.observability.requiredTraceFields.includes('writeAuthority') && contract.observability.metrics.includes('false-confident-wrong count from labeled smoke') && contract.observability.alerts.some((item) => /false-confident-wrong/.test(item)), JSON.stringify(contract.observability));
  assertCase(results, 'w67_manual_evidence_fallback_safe', includesAll(contract.manualEvidenceFallback.whenUsed, ['blocked', 'thin', 'unavailable', 'timeout']) && contract.manualEvidenceFallback.rules.some((item) => /cannot authorize writes/.test(item)) && contract.manualEvidenceFallback.rules.some((item) => /cannot hide blocked/.test(item)), JSON.stringify(contract.manualEvidenceFallback));
  assertCase(results, 'w67_rollout_toggles_and_kill_switches_present', /IDB_WEBSITE_RESOLVER_ENDPOINT/.test(contract.pilotRolloutToggles.drawerEndpointToggle) && contract.pilotRolloutToggles.killSwitches.some((item) => /disable resolver endpoint/.test(item)) && contract.pilotRolloutToggles.killSwitches.some((item) => /pause pilot endpoint on false-confident-wrong/.test(item)), JSON.stringify(contract.pilotRolloutToggles));
  assertCase(results, 'w67_deployment_and_rollback_checklists_present', contract.deploymentChecklist.length >= 10 && contract.rollbackPlan.length >= 5 && contract.rollbackPlan.some((item) => /Clear drawer resolver endpoint toggle/.test(item)), JSON.stringify({ deploy: contract.deploymentChecklist, rollback: contract.rollbackPlan }));
  assertCase(results, 'w67_go_no_go_criteria_present', contract.goNoGoForPilot.goIf.some((item) => /zero false-confident-wrong/.test(item)) && contract.goNoGoForPilot.noGoIf.some((item) => /Any false-confident-wrong/.test(item)) && contract.goNoGoForPilot.noGoIf.some((item) => /CORS allows unapproved origins/.test(item)), JSON.stringify(contract.goNoGoForPilot));
  assertCase(results, 'w67_uses_w65_w66_readiness_evidence', w65.liveFetchExecuted === true && w65.metrics.falseConfidentWrongCount === 0 && w66.beforeAfterFindings.trek.after.actualLaneId === 'dealer_hardgoods' && w66.beforeAfterFindings.unchangedHonestFailures.length >= 3, JSON.stringify({ w65: w65.metrics, trek: w66.beforeAfterFindings.trek.after }));
  assertCase(results, 'w67_no_regression_boundaries_present', contract.noRegression.writeAuthority === 'none' && contract.noRegression.suiteScriptInvocation === false && contract.noRegression.nllmAdvisoryOnly === true && contract.noRegression.notesCannotOwnIdentification === true && contract.noRegression.blockedThinUnavailableTimeoutDoNotGuess === true && contract.noRegression.transactionWriteEnabled === false, JSON.stringify(contract.noRegression));
  assertCase(results, 'w67_best_next_prompt_present', /Move through W68/.test(contract.bestNextCodexPrompt.prompt), contract.bestNextCodexPrompt.block);

  const failures = results.filter((result) => !result.pass);
  const decision = failures.length ? 'FAIL' : 'PASS';
  const trace = {
    schema: 'idb.w67-resolver-production-readiness-trace.v1',
    generated: new Date().toISOString(),
    decision,
    readinessDecision: contract.readinessDecision,
    hostedEndpointPlan: contract.hostedEndpointPlan,
    endpointAuthAndCors: contract.endpointAuthAndCors,
    cacheStrategy: contract.cacheStrategy,
    rateLimitsAndTimeouts: contract.rateLimitsAndTimeouts,
    observability: contract.observability,
    manualEvidenceFallback: contract.manualEvidenceFallback,
    pilotRolloutToggles: contract.pilotRolloutToggles,
    deploymentChecklist: contract.deploymentChecklist,
    rollbackPlan: contract.rollbackPlan,
    goNoGoForPilot: contract.goNoGoForPilot,
    evidenceFromW65W66: {
      w65Metrics: w65.metrics,
      trekAfterW66: w66.beforeAfterFindings.trek.after,
      remainingHonestFailures: w66.beforeAfterFindings.unchangedHonestFailures
    },
    noRegression: contract.noRegression,
    bestNextCodexPrompt: contract.bestNextCodexPrompt,
    results
  };
  fs.writeFileSync(tracePath, `${JSON.stringify(trace, null, 2)}\n`);

  const rows = results.map((result) => `| ${result.pass ? 'PASS' : 'FAIL'} | ${result.name} | ${escapeTable(result.detail)} |`).join('\n');
  const failureRows = failures.map((result) => `- ${result.name}: ${result.detail}`).join('\n') || '- None';
  const report = `# W67 Resolver Production Readiness And Hosted Endpoint Plan

Decision: ${decision} / PLAN READY / NOT PRODUCTION GO / NO WRITE AUTHORITY

## Objective

Turn the local \`websiteResolverServiceV1\` prototype and W64 drawer adapter into a production deployment plan.

## Readiness Position

This is not a production go. It is a production endpoint plan. W66 proved Trek can resolve correctly from live evidence, but Patagonia and Grainger remain thin and Lincoln Electric remains blocked. The hosted endpoint is required before five-consultant pilot because it gives us controlled egress, cache, auth/CORS, observability, rate limits, and rollback.

## Production Shape

- Hosted no-write \`POST /idb/website-resolver/v1/resolve\` endpoint.
- Drawer uses W64 endpoint toggle for pilot users.
- Resolver returns only \`idb.website-evidence.v1\`.
- Strict auth/CORS for approved NetSuite account origins.
- Cache key includes normalized URL, resolver version, and extraction policy version.
- Observability tracks cache, latency, failure states, confidence states, and false-confident-wrong.
- Manual evidence fallback is allowed, traceable, and never write-authoritative.

## Harness Gates

| Status | Rule | Detail |
| --- | --- | --- |
${rows}

## No Regression

- No writes.
- No SuiteScript invocation.
- N/LLM advisory-only.
- Notes cannot own identity.
- Blocked, thin, unavailable, and timeout remain insufficient evidence with no confident guesses.
- Transaction writes remain blocked.

## Failures

${failureRows}

## Best Next Codex Prompt

\`\`\`text
${contract.bestNextCodexPrompt.prompt}
\`\`\`
`;
  fs.writeFileSync(reportPath, report);
  console.log(`Resolver production readiness harness: ${decision} (${results.length - failures.length}/${results.length})`);
  if (failures.length) {
    console.error(failures);
    process.exit(1);
  }
}

main();
