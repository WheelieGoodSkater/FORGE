const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const contractPath = path.join(root, 'data', 'w68_staging_resolver_endpoint_smoke_pack.json');
const w67TracePath = path.join(root, 'trace_samples', 'w67_resolver_production_readiness_trace.json');
const tracePath = path.join(root, 'trace_samples', 'w68_staging_resolver_endpoint_smoke_trace.json');
const reportPath = path.join(root, 'reports', 'w68_staging_resolver_endpoint_smoke_pack.md');

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

function buildSmokeSamples(contract) {
  const healthSample = {
    request: {
      method: contract.endpointPaths.health.method,
      path: contract.endpointPaths.health.path
    },
    expectedStatus: 200,
    response: {
      serviceName: 'websiteResolverServiceV1',
      resolverVersion: 'websiteResolverServiceV1.local-prototype.w66',
      extractionPolicyVersion: 'w66.extraction-policy.v1',
      writeAuthority: 'none',
      suiteScriptInvocation: false,
      nllmAdvisoryOnly: true,
      cacheStatus: 'ready'
    }
  };

  const authCorsSamples = contract.authCorsTestCases.map((testCase) => ({
    id: testCase.id,
    expectedStatus: testCase.expectedStatus,
    simulated: true,
    result: 'expected_staging_behavior_defined',
    noWebsiteFetchOnRejectedRequest: ['missing_token', 'bad_token', 'netsuite_cookie_rejected', 'write_payload_rejected'].includes(testCase.id)
  }));

  const cacheSamples = contract.cacheValidation.map((item) => ({
    id: item.id,
    expected: item.expected,
    simulated: true,
    traceRequirement: item.id === 'manual_evidence_not_cached_full_text' ? 'store_excerpt_hash_only' : 'cache_metadata_required'
  }));

  const failureSamples = contract.failureStateSamples.map((sample) => ({
    id: sample.id,
    inputUrl: sample.inputUrl,
    failureState: sample.expectedFailureState,
    confidence: {
      state: sample.expectedConfidenceState,
      score: 0
    },
    laneCandidates: sample.expectedLaneCandidates,
    writeAuthority: sample.writeAuthority,
    suiteScriptInvocation: false,
    nllmAdvisoryOnly: true
  }));

  const manualEvidenceSamples = contract.manualEvidenceFallbackSamples.map((sample) => ({
    id: sample.id,
    fetchState: sample.fetchState,
    manualEvidenceSource: sample.manualEvidenceSource,
    visibleSource: true,
    storedAs: 'excerpt_hash_only',
    confidenceFloor: 'insufficient_evidence',
    confidenceCeilingWithoutConfirmation: 'needs_confirmation',
    writeAuthority: 'none',
    suiteScriptInvocation: false
  }));

  return {
    healthSample,
    authCorsSamples,
    cacheSamples,
    failureSamples,
    manualEvidenceSamples
  };
}

function main() {
  const contract = readJson(contractPath);
  const w67Trace = readJson(w67TracePath);
  const samples = buildSmokeSamples(contract);
  const results = [];

  const envNames = contract.environmentVariables.map((item) => item.name);
  const authCaseIds = contract.authCorsTestCases.map((item) => item.id);
  const cacheCaseIds = contract.cacheValidation.map((item) => item.id);
  const failureStates = contract.failureStateSamples.map((item) => item.expectedFailureState);
  const healthFields = contract.endpointPaths.health.expectedFields;

  assertCase(results, 'w68_contract_schema_present', contract.schema === 'idb.w68-staging-resolver-endpoint-smoke-pack.v1' && contract.status === 'complete_staging_smoke_pack_ready', contract.schema);
  assertCase(results, 'w68_readiness_position_is_staging_only', contract.readinessDecision === 'staging_smoke_ready_not_hosted_endpoint_go' && w67Trace.readinessDecision === 'plan_ready_not_production_go', contract.readinessDecision);
  assertCase(results, 'w68_environment_variables_present', includesAll(envNames, ['IDB_RESOLVER_STAGING_URL', 'IDB_RESOLVER_STAGING_TOKEN', 'IDB_RESOLVER_ALLOWED_ORIGIN', 'IDB_RESOLVER_BLOCKED_ORIGIN', 'IDB_APPROVED_LIVE_RESOLVER_SMOKE']) && contract.environmentVariables.filter((item) => item.required).length >= 5, envNames.join(', '));
  assertCase(results, 'w68_health_check_no_write_shape_present', contract.endpointPaths.health.method === 'GET' && contract.endpointPaths.health.path === '/health' && includesAll(healthFields, ['writeAuthority', 'suiteScriptInvocation', 'nllmAdvisoryOnly', 'cacheStatus']) && samples.healthSample.response.writeAuthority === 'none' && samples.healthSample.response.suiteScriptInvocation === false, JSON.stringify(samples.healthSample));
  assertCase(results, 'w68_resolve_endpoint_shape_present', contract.endpointPaths.resolve.method === 'POST' && contract.endpointPaths.resolve.path === '/idb/website-resolver/v1/resolve' && contract.endpointPaths.resolve.expectedResponseSchema === 'idb.website-evidence.v1', JSON.stringify(contract.endpointPaths.resolve));
  assertCase(results, 'w68_auth_cors_cases_complete', includesAll(authCaseIds, ['authorized_preflight', 'blocked_origin_preflight', 'missing_token', 'bad_token', 'netsuite_cookie_rejected', 'write_payload_rejected']) && contract.authCorsTestCases.some((item) => item.expected.some((line) => /No wildcard production CORS/.test(line))) && contract.authCorsTestCases.some((item) => item.expected.some((line) => /No SuiteScript invocation/.test(line))), authCaseIds.join(', '));
  assertCase(results, 'w68_rejected_auth_cases_do_not_fetch', samples.authCorsSamples.filter((item) => item.noWebsiteFetchOnRejectedRequest).length === 4, JSON.stringify(samples.authCorsSamples));
  assertCase(results, 'w68_cache_validation_complete', includesAll(cacheCaseIds, ['same_url_second_request_cache_hit', 'versioned_cache_key', 'manual_evidence_not_cached_full_text']) && contract.cacheValidation.some((item) => item.expected.some((line) => /Manual evidence full text is not cached/.test(line))), cacheCaseIds.join(', '));
  assertCase(results, 'w68_approved_live_smoke_command_present', /IDB_APPROVED_LIVE_RESOLVER_SMOKE=1/.test(contract.approvedLiveSiteSmokeCommand.command) && /run_approved_live_resolver_smoke_harness\.js/.test(contract.approvedLiveSiteSmokeCommand.command) && contract.approvedLiveSiteSmokeCommand.approvedSites.length >= 4 && contract.approvedLiveSiteSmokeCommand.requiredOutcomes.some((item) => /Zero false-confident-wrong/.test(item)), contract.approvedLiveSiteSmokeCommand.command);
  assertCase(results, 'w68_failure_samples_do_not_guess', includesAll(failureStates, ['blocked', 'thin', 'unavailable', 'timeout']) && samples.failureSamples.every((sample) => sample.confidence.state === 'insufficient_evidence' && sample.laneCandidates.length === 0 && sample.writeAuthority === 'none' && sample.suiteScriptInvocation === false), JSON.stringify(samples.failureSamples));
  assertCase(results, 'w68_manual_evidence_fallback_safe', samples.manualEvidenceSamples.length >= 2 && samples.manualEvidenceSamples.every((sample) => sample.visibleSource === true && sample.storedAs === 'excerpt_hash_only' && sample.writeAuthority === 'none' && sample.suiteScriptInvocation === false) && contract.manualEvidenceFallbackSamples.every((sample) => sample.expected.some((line) => /No write authority|No confident write preparation/.test(line))), JSON.stringify(samples.manualEvidenceSamples));
  assertCase(results, 'w68_observability_checklist_present', contract.observabilityChecklist.length >= 5 && contract.observabilityChecklist.some((item) => /false-confident-wrong/.test(item)) && contract.observabilityChecklist.some((item) => /redact credentials and cookies/.test(item)), contract.observabilityChecklist.join(' | '));
  assertCase(results, 'w68_pilot_toggle_instructions_present', contract.pilotToggleInstructions.some((item) => /IDB_WEBSITE_RESOLVER_ENDPOINT/.test(item)) && contract.pilotToggleInstructions.some((item) => /Clear the endpoint toggle/.test(item)) && contract.pilotToggleInstructions.some((item) => /Do not enable any create\/write flags/.test(item)), contract.pilotToggleInstructions.join(' | '));
  assertCase(results, 'w68_no_regression_boundaries_present', contract.noRegression.writeAuthority === 'none' && contract.noRegression.suiteScriptInvocation === false && contract.noRegression.nllmAdvisoryOnly === true && contract.noRegression.notesCannotOwnIdentification === true && contract.noRegression.blockedThinUnavailableTimeoutDoNotGuess === true && contract.noRegression.transactionWriteEnabled === false, JSON.stringify(contract.noRegression));
  assertCase(results, 'w68_best_next_prompt_present', contract.bestNextCodexPrompt.block === 'W69: Hosted Resolver Staging Endpoint Implementation' && /Move through W69/.test(contract.bestNextCodexPrompt.prompt) && /no-write websiteResolverServiceV1 endpoint wrapper/.test(contract.bestNextCodexPrompt.prompt), contract.bestNextCodexPrompt.prompt);

  const failures = results.filter((result) => !result.pass);
  const decision = failures.length ? 'FAIL' : 'PASS';
  const trace = {
    schema: 'idb.w68-staging-resolver-endpoint-smoke-trace.v1',
    generated: new Date().toISOString(),
    decision,
    readinessDecision: contract.readinessDecision,
    inheritedReadinessEvidence: {
      w67Decision: w67Trace.decision,
      w67ReadinessDecision: w67Trace.readinessDecision,
      trekAfterW66: w67Trace.evidenceFromW65W66.trekAfterW66,
      remainingHonestFailures: w67Trace.evidenceFromW65W66.remainingHonestFailures.length
    },
    environmentVariables: contract.environmentVariables,
    endpointPaths: contract.endpointPaths,
    authCorsTestCases: contract.authCorsTestCases,
    cacheValidation: contract.cacheValidation,
    approvedLiveSiteSmokeCommand: contract.approvedLiveSiteSmokeCommand,
    smokeSamples: samples,
    observabilityChecklist: contract.observabilityChecklist,
    pilotToggleInstructions: contract.pilotToggleInstructions,
    noRegression: contract.noRegression,
    bestNextCodexPrompt: contract.bestNextCodexPrompt,
    results
  };
  fs.writeFileSync(tracePath, `${JSON.stringify(trace, null, 2)}\n`);

  const rows = results.map((result) => `| ${result.pass ? 'PASS' : 'FAIL'} | ${result.name} | ${escapeTable(result.detail)} |`).join('\n');
  const failureRows = failures.map((result) => `- ${result.name}: ${result.detail}`).join('\n') || '- None';
  const report = `# W68 Staging Resolver Endpoint Smoke Pack

Decision: ${decision} / STAGING SMOKE PACK READY / HOSTED ENDPOINT NOT YET IMPLEMENTED / NO WRITE AUTHORITY

## Objective

Build the staging smoke package for the hosted no-write \`websiteResolverServiceV1\` endpoint.

## Readiness Position

This is a smoke package, not a hosted endpoint go. It defines the exact staging environment, health check, auth/CORS cases, cache checks, approved live-site command, failure samples, manual-evidence fallback, observability checklist, pilot toggles, and rollback behavior needed before a five-consultant pilot can depend on a hosted resolver.

## Staging Smoke Shape

- Health check: \`GET /health\` must prove resolver version, extraction policy, cache readiness, no write authority, no SuiteScript invocation, and advisory-only N/LLM.
- Resolve endpoint: \`POST /idb/website-resolver/v1/resolve\` returns only \`idb.website-evidence.v1\`.
- Auth/CORS: approved NetSuite origin only, resolver token required, blocked origins denied, NetSuite cookies rejected, write-shaped payloads rejected.
- Cache: repeated URL, versioned key, and manual evidence redaction must be tested.
- Failure states: blocked, thin, unavailable, and timeout stay insufficient evidence with no lane candidates.
- Manual evidence: allowed only as visible consultant-supplied evidence, excerpt/hash stored, no write authority.

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
  console.log(`Staging resolver endpoint smoke harness: ${decision} (${results.length - failures.length}/${results.length})`);
  if (failures.length) {
    console.error(failures);
    process.exit(1);
  }
}

main();
