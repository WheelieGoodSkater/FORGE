const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const contractPath = path.join(root, 'data', 'w62_resolver_service_contract_threat_model.json');
const tracePath = path.join(root, 'trace_samples', 'w62_resolver_service_contract_trace.json');
const reportPath = path.join(root, 'reports', 'w62_resolver_service_contract_threat_model.md');

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
  const results = [];
  const service = contract.service || {};
  const request = contract.request || {};
  const response = contract.response || {};
  const normalization = contract.urlNormalization || {};
  const security = contract.securityPolicy || {};
  const failureStates = contract.failureStateMatrix || [];
  const noRegression = contract.noRegression || {};
  const traceRequirements = contract.traceRequirements || {};

  assertCase(results, 'w62_schema_present', contract.schema === 'idb.w62-resolver-service-contract-threat-model.v1', contract.schema);
  assertCase(results, 'w62_service_is_no_write', service.name === 'websiteResolverServiceV1' && service.schemaReturned === 'idb.website-evidence.v1' && service.writeAuthority === 'none' && service.suiteScriptInvocation === false, JSON.stringify(service));
  assertCase(results, 'w62_request_shape_present', request.method === 'POST' && request.path === '/idb/website-resolver/v1/resolve' && request.body && request.body.url === 'string required', JSON.stringify(request));
  assertCase(results, 'w62_request_forbids_write_and_auth_fields', includesAll(request.forbiddenRequestFields || [], ['recordType', 'recordId', 'suiteletUrl', 'scriptId', 'deployId', 'writeToken', 'cookie', 'authorization']), (request.forbiddenRequestFields || []).join(', '));
  assertCase(results, 'w62_response_returns_website_evidence_v1', response.body && response.body.schema === 'idb.website-evidence.v1' && /writeAuthority/.test(JSON.stringify(response.body)) && /cache/.test(JSON.stringify(response.body)), JSON.stringify(response.body || {}));
  assertCase(results, 'w62_url_normalization_policy_present', includesAll(normalization.rules || [], ['trim whitespace', 'default missing scheme to https', 'lowercase hostname', 'remove hash fragments', 'remove tracking query parameters', 'preserve meaningful path', 'punycode hostname before safety checks', 'reject unsupported schemes']), JSON.stringify(normalization));
  assertCase(results, 'w62_schemes_are_locked_down', includesAll(normalization.allowedSchemes || [], ['https']) && includesAll(normalization.blockedSchemes || [], ['file:', 'data:', 'javascript:', 'mailto:', 'tel:', 'ftp:', 'gopher:']) && /redirected to https/.test(normalization.httpPolicy || ''), JSON.stringify(normalization));
  assertCase(results, 'w62_ssrf_controls_present', security.ssrfControls && includesAll(security.ssrfControls, ['block localhost and loopback', 'block private RFC1918 ranges', 'block link-local and metadata service IPs', 'block internal host suffixes', 'resolve DNS before fetch and after redirects', 'reject redirect targets that violate scheme or network policy']), JSON.stringify(security.ssrfControls || []));
  assertCase(results, 'w62_redirect_timeout_limits_present', security.redirectPolicy && security.redirectPolicy.maximumRedirects === 5 && security.timeouts && security.timeouts.overallMs === 12000 && security.limits && security.limits.maxPages === 5 && security.limits.maxPageBytes === 350000 && security.limits.maxTotalBytes === 1200000, JSON.stringify(security));
  assertCase(results, 'w62_content_types_and_rate_limit_present', includesAll((security.limits || {}).allowedContentTypes || [], ['text/html', 'application/xhtml+xml']) && security.robotsAndRespectfulFetch && security.robotsAndRespectfulFetch.rateLimitPerDomainPerMinute === 6 && security.robotsAndRespectfulFetch.cacheTtlSeconds === 86400, JSON.stringify(security.robotsAndRespectfulFetch || {}));
  assertCase(results, 'w62_failure_state_matrix_complete', ['blocked', 'thin', 'unavailable', 'ambiguous', 'timeout'].every((state) => failureStates.some((item) => item.state === state)), JSON.stringify(failureStates));
  assertCase(results, 'w62_failure_states_do_not_guess', failureStates.filter((item) => ['blocked', 'thin', 'unavailable', 'timeout'].includes(item.state)).every((item) => item.classificationState === 'insufficient_evidence' && item.laneCandidatesAllowed === false), JSON.stringify(failureStates));
  assertCase(results, 'w62_ambiguous_requires_confirmation', failureStates.some((item) => item.state === 'ambiguous' && item.classificationState === 'needs_confirmation' && item.laneCandidatesAllowed === true && /competing candidates/i.test(item.consultantAction)), '');
  assertCase(results, 'w62_cache_ready_response_present', contract.cacheReadyResponse && /sha256/.test(contract.cacheReadyResponse.cacheKey || '') && contract.cacheReadyResponse.ttlSeconds === 86400 && includesAll(contract.cacheReadyResponse.redaction || [], ['do not cache cookies', 'do not cache auth headers', 'do not cache tenant secrets']), JSON.stringify(contract.cacheReadyResponse || {}));
  assertCase(results, 'w62_trace_requirements_present', includesAll(traceRequirements.mustInclude || [], ['requestId', 'normalizedUrl', 'domain', 'fetchStatus', 'failureState', 'sourceUrls', 'pagesSampled', 'extractedEvidence', 'signals', 'confidence', 'cache', 'writeAuthority', 'nllmAdvisoryOnly']) && includesAll(traceRequirements.mustNotInclude || [], ['recordWriteToken', 'SuiteScript invocation result', 'NetSuite cookie', 'authorization header', 'hidden create permission']), JSON.stringify(traceRequirements));
  assertCase(results, 'w62_no_regression_boundaries_present', noRegression.writeAuthority === 'none' && noRegression.suiteScriptInvocation === false && noRegression.nllmAdvisoryOnly === true && noRegression.notesCannotOwnIdentification === true && noRegression.blockedThinUnavailableTimeoutDoNotGuess === true && noRegression.transactionWriteEnabled === false, JSON.stringify(noRegression));
  assertCase(results, 'w62_best_next_codex_prompt_present', contract.bestNextCodexPrompt && contract.bestNextCodexPrompt.block === 'W63: Local Resolver Service Prototype' && /Move through W63/.test(contract.bestNextCodexPrompt.prompt || '') && /No writes/.test(contract.bestNextCodexPrompt.prompt || ''), JSON.stringify(contract.bestNextCodexPrompt || {}));

  const failures = results.filter((result) => !result.pass);
  const decision = failures.length ? 'FAIL' : 'PASS';
  const trace = {
    schema: 'idb.w62-resolver-service-contract-trace.v1',
    generated: new Date().toISOString(),
    decision,
    contractSchema: contract.schema,
    service: contract.service,
    urlNormalization: contract.urlNormalization,
    securityPolicy: contract.securityPolicy,
    failureStateMatrix: contract.failureStateMatrix,
    noRegression: contract.noRegression,
    bestNextCodexPrompt: contract.bestNextCodexPrompt,
    results
  };
  fs.writeFileSync(tracePath, `${JSON.stringify(trace, null, 2)}\n`);

  const rows = results.map((result) => `| ${result.pass ? 'PASS' : 'FAIL'} | ${result.name} | ${escapeTable(result.detail)} |`).join('\n');
  const failureRows = failures.map((result) => `- ${result.name}: ${result.detail}`).join('\n') || '- None';
  const report = `# W62 Resolver Service Contract And Threat Model

Decision: ${decision} / CONTRACT READY BEFORE BUILD / NO WRITE AUTHORITY

## Objective

Define the production website resolver before building it.

## Completed

- Added the no-write \`websiteResolverServiceV1\` request/response contract.
- Added URL normalization, allowed/blocked schemes, redirect policy, timeout policy, page/page-size limits, and cache-ready response shape.
- Added SSRF, redirect, content-type, rate-limit, and redaction threat controls.
- Added blocked, thin, unavailable, ambiguous, and timeout failure-state matrix.
- Added trace requirements and no-regression gates.
- Added the best next Codex prompt for W63.

## Harness Results

| Status | Rule | Detail |
| --- | --- | --- |
${rows}

## No Regression

- No writes.
- No SuiteScript invocation.
- N/LLM advisory-only.
- Notes cannot own identity.
- Blocked, thin, unavailable, and timeout states never produce confident guesses.
- Transaction writes remain blocked.

## Failures

${failureRows}

## Best Next Codex Prompt

\`\`\`text
${contract.bestNextCodexPrompt.prompt}
\`\`\`
`;
  fs.writeFileSync(reportPath, report);
  console.log(`Resolver service contract harness: ${decision} (${results.length - failures.length}/${results.length})`);
  if (failures.length) {
    console.error(failures);
    process.exit(1);
  }
}

main();
